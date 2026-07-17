export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { InterviewPrep } from "@/models/InterviewPrep";
import { callGemini } from "@/lib/gemini";
import { technicalInterviewPrompt, hrInterviewPrompt } from "@/lib/prompts/interview";
import { InterviewResult, ResumeProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, interviewType, difficulty } = await req.json();

    if (!role || !interviewType || !difficulty) {
      return NextResponse.json(
        { error: "role, interviewType, and difficulty are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const resume = await ResumeAnalysis.findOne({ userId: session.user.id }).sort({
      createdAt: -1,
    });

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

    const prompt =
      interviewType === "technical"
        ? technicalInterviewPrompt(profile, role, difficulty)
        : hrInterviewPrompt(profile, role, difficulty);

    const result = (await callGemini(prompt)) as InterviewResult;

    const saved = await InterviewPrep.create({
      userId: session.user.id,
      role,
      interviewType,
      difficulty,
      questions: result.questions,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Interview prep error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions. Please try again." },
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
    const sessions = await InterviewPrep.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error("Error fetching interview sessions:", error);
    return NextResponse.json({ error: "Failed to fetch interview sessions" }, { status: 500 });
  }
}
