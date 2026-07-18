export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { ATSReview } from "@/models/ATSReview";
import { CareerReport } from "@/models/CareerReport";
import { callGemini } from "@/lib/gemini";
import { atsPrompt } from "@/lib/prompts/ats-review";
import { ATSResult } from "@/types";

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

    const prompt = atsPrompt(resume.rawText);
    const result = (await callGemini(prompt)) as ATSResult;

    // Store ATS score in CareerReport for dashboard
    await CareerReport.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { atsScore: result.atsScore } },
      { upsert: true }
    );

    // Save full ATS Review result
    await ATSReview.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        ...result,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("ATS review error:", error);
    return NextResponse.json(
      { error: "Failed to run ATS review. Please try again." },
      { status: 500 }
    );
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
