export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { InterviewPrep } from "@/models/InterviewPrep";
import { callGemini } from "@/lib/gemini";
import { technicalInterviewPrompt, hrInterviewPrompt } from "@/lib/prompts/interview";
import { InterviewResult, ResumeProfile } from "@/types";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

    const TechnicalQSchema = z.object({
      question: z.string(),
      expectedAnswer: z.string(),
      keyConcepts: z.array(z.string()),
      followUps: z.array(z.string()),
    });

    const HRQSchema = z.object({
      question: z.string(),
      sampleAnswer: z.string(),
      starGuidance: z.string(),
      personalizationTip: z.string(),
    });

    const schema = z.object({
      questions: z.array(interviewType === "technical" ? TechnicalQSchema : HRQSchema),
    });

    const result = await streamObject({
      model: google("gemini-flash-lite-latest"), // keeping same model as lib/gemini.ts
      schema,
      prompt,
      onFinish: async ({ object }) => {
        if (object?.questions) {
          try {
            await InterviewPrep.create({
              userId: session.user.id,
              role,
              interviewType,
              difficulty,
              questions: object.questions,
            });
          } catch (e) {
            console.error("Error saving streamed interview questions:", e);
          }
        }
      },
    });

    return result.toTextStreamResponse();
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await connectDB();
    await InterviewPrep.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/interview-preparation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
