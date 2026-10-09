export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { CareerReport } from "@/models/CareerReport";
import { callGemini } from "@/lib/gemini";
import { careerScorePrompt } from "@/lib/prompts/career-score";
import { CareerScoreGeminiResponse, ResumeProfile } from "@/types";
import { calculateCareerScore, CAREER_RUBRIC_VERSION, generateFingerprint } from "@/lib/scoring";

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

    const prompt = careerScorePrompt(profile);
    const result = (await callGemini(prompt)) as CareerScoreGeminiResponse;

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

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error("Career score error:", error);
    return NextResponse.json(
      { error: "Failed to generate career score. Please try again." },
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
    const report = await CareerReport.findOne({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ data: report });
  } catch (error) {
    console.error("Error fetching career report:", error);
    return NextResponse.json({ error: "Failed to fetch career report" }, { status: 500 });
  }
}
