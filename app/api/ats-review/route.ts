export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { ATSReview } from "@/models/ATSReview";
import { CareerReport } from "@/models/CareerReport";
import { callGemini } from "@/lib/gemini";
import { atsPrompt } from "@/lib/prompts/ats-review";
import { calculateATSScore, ATS_RUBRIC_VERSION, generateFingerprint } from "@/lib/scoring";
import { ATSGeminiResponseSchema, validateAIOutput } from "@/lib/validation";

/**
 * In-memory concurrency guard.
 * Prevents duplicate Gemini calls for the same user + fingerprint + rubric
 * while an earlier request is still in flight.
 */
const inFlightRequests = new Map<string, Promise<unknown>>();

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const resume = await ResumeAnalysis.findOne({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    if (!resume?.rawText) {
      return NextResponse.json(
        { error: "Please upload your resume first" },
        { status: 400 }
      );
    }

    // Find user's target role to ground ATS keywords
    const userReport = await CareerReport.findOne({ userId: session.user.id })
      .select("targetRole")
      .lean();
    const targetRole = userReport?.targetRole;

    const inputFingerprint = generateFingerprint(
      targetRole ? `${resume.rawText}:${targetRole}` : resume.rawText
    );

    // Check if we can reuse an existing report
    const existingReview = await ATSReview.findOne({
      userId: session.user.id,
      inputFingerprint,
      rubricVersion: ATS_RUBRIC_VERSION,
    }).sort({ createdAt: -1 });

    if (existingReview) {
      return NextResponse.json({ success: true, data: existingReview });
    }

    // Concurrency guard: reuse in-progress generation for same inputs
    const concurrencyKey = `ats:${session.user.id}:${inputFingerprint}:${ATS_RUBRIC_VERSION}`;
    if (inFlightRequests.has(concurrencyKey)) {
      try {
        await inFlightRequests.get(concurrencyKey);
        // Re-check DB after the in-flight request completes
        const completedReview = await ATSReview.findOne({
          userId: session.user.id,
          inputFingerprint,
          rubricVersion: ATS_RUBRIC_VERSION,
        }).sort({ createdAt: -1 });
        if (completedReview) {
          return NextResponse.json({ success: true, data: completedReview });
        }
      } catch {
        // The in-flight request failed — we'll proceed with a new attempt
      }
    }

    // Run the generation, guarded for concurrency
    const generationPromise = (async () => {
      const prompt = atsPrompt(resume.rawText, targetRole);
      const geminiResult = await callGemini(prompt);

      // Validate AI output before scoring
      const validation = validateAIOutput(ATSGeminiResponseSchema, geminiResult);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const validatedData = validation.data;
      const atsScore = calculateATSScore(validatedData);

      const finalResult = {
        ...validatedData,
        atsScore,
        inputFingerprint,
        rubricVersion: ATS_RUBRIC_VERSION,
        targetRole,
      };

      // Store ATS score in CareerReport for dashboard
      await CareerReport.findOneAndUpdate(
        { userId: session.user.id },
        { $set: { atsScore: finalResult.atsScore } },
        { upsert: true }
      );

      // Save full ATS Review result — only after validation succeeds
      const savedReview = await ATSReview.findOneAndUpdate(
        { userId: session.user.id },
        {
          userId: session.user.id,
          ...finalResult,
          generatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return savedReview;
    })();

    inFlightRequests.set(concurrencyKey, generationPromise);

    try {
      const savedReview = await generationPromise;
      return NextResponse.json({ success: true, data: savedReview });
    } finally {
      inFlightRequests.delete(concurrencyKey);
    }
  } catch (error: any) {
    console.error("ATS review error:", error);

    // Distinguish validation failures from other errors
    const message = error?.message?.startsWith("AI output validation failed")
      ? "AI returned an unexpected response format. Please try again."
      : "Failed to run ATS review. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const review = await ATSReview.findOne({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ data: review });
  } catch (error) {
    console.error("Error fetching ATS review:", error);
    return NextResponse.json({ error: "Failed to fetch ATS review" }, { status: 500 });
  }
}
