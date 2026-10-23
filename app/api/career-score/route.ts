export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { CareerReport } from "@/models/CareerReport";
import { callGemini } from "@/lib/gemini";
import { careerScorePrompt } from "@/lib/prompts/career-score";
import { ResumeProfile } from "@/types";
import { calculateCareerScore, CAREER_RUBRIC_VERSION, generateFingerprint } from "@/lib/scoring";
import { CareerScoreGeminiResponseSchema, validateAIOutput } from "@/lib/validation";

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

    const resume = await ResumeAnalysis.findOne({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    if (!resume) {
      return NextResponse.json(
        { error: "Please upload your resume first" },
        { status: 400 }
      );
    }

    const profile: ResumeProfile = {
      education: resume.education,
      skills: resume.skills,
      projects: resume.projects,
      experience: resume.experience,
      achievements: resume.achievements,
      technologies: resume.technologies,
      certifications: resume.certifications,
    };

    const fingerprintString = JSON.stringify(profile);
    const inputFingerprint = generateFingerprint(fingerprintString);

    const existingReport = await CareerReport.findOne({
      userId: session.user.id,
      inputFingerprint,
      rubricVersion: CAREER_RUBRIC_VERSION,
    }).sort({ createdAt: -1 });

    if (existingReport) {
      return NextResponse.json({ success: true, data: existingReport });
    }

    // Concurrency guard: reuse in-progress generation for same inputs
    const concurrencyKey = `career:${session.user.id}:${inputFingerprint}:${CAREER_RUBRIC_VERSION}`;
    if (inFlightRequests.has(concurrencyKey)) {
      try {
        await inFlightRequests.get(concurrencyKey);
        // Re-check DB after the in-flight request completes
        const completedReport = await CareerReport.findOne({
          userId: session.user.id,
          inputFingerprint,
          rubricVersion: CAREER_RUBRIC_VERSION,
        }).sort({ createdAt: -1 });
        if (completedReport) {
          return NextResponse.json({ success: true, data: completedReport });
        }
      } catch {
        // The in-flight request failed — we'll proceed with a new attempt
      }
    }

    // Run the generation, guarded for concurrency
    const generationPromise = (async () => {
      const prompt = careerScorePrompt(profile);
      const geminiResult = await callGemini(prompt);

      // Validate AI output before scoring
      const validation = validateAIOutput(CareerScoreGeminiResponseSchema, geminiResult);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const result = validation.data;
      const overallScore = calculateCareerScore(result);

      const report = await CareerReport.findOneAndUpdate(
        { userId: session.user.id },
        {
          userId: session.user.id,
          careerScore: overallScore,
          resumeScore: result.resumeScore,
          technicalScore: result.technicalScore,
          projectScore: result.projectScore,
          experienceScore: result.experienceScore,
          interviewScore: result.interviewScore,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          summary: result.summary,
          inputFingerprint,
          rubricVersion: CAREER_RUBRIC_VERSION,
          reportGeneratedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return report;
    })();

    inFlightRequests.set(concurrencyKey, generationPromise);

    try {
      const report = await generationPromise;
      return NextResponse.json({ success: true, data: report });
    } finally {
      inFlightRequests.delete(concurrencyKey);
    }
  } catch (error: any) {
    console.error("Career score error:", error);

    const message = error?.message?.startsWith("AI output validation failed")
      ? "AI returned an unexpected response format. Please try again."
      : "Failed to generate career score. Please try again.";

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
    const report = await CareerReport.findOne({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ data: report });
  } catch (error) {
    console.error("Error fetching career report:", error);
    return NextResponse.json({ error: "Failed to fetch career report" }, { status: 500 });
  }
}
