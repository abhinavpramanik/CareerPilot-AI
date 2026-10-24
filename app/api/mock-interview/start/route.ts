export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { MockInterview } from "@/models/MockInterview";
import { callGemini } from "@/lib/gemini";
import { mockInterviewGeneratePrompt } from "@/lib/prompts/mock-interview";

/**
 * POST /api/mock-interview/start
 * Generates 5 questions, creates an in_progress session, returns questions
 * WITHOUT revealing expectedAnswer to the client.
 */
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

    const prompt = mockInterviewGeneratePrompt(role, interviewType, difficulty);
    const raw = await callGemini(prompt);

    const parsed = raw as { questions: Array<{ question: string; expectedAnswer: string; keyConcepts: string[] }> };

    if (!parsed?.questions?.length) {
      return NextResponse.json(
        { error: "AI failed to generate questions. Please try again." },
        { status: 500 }
      );
    }

    await connectDB();

    const record = await MockInterview.create({
      userId: session.user.id,
      role,
      interviewType,
      difficulty,
      status: "in_progress",
      questions: parsed.questions.map((q) => ({
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        keyConcepts: q.keyConcepts || [],
      })),
    });

    // Return questions WITHOUT expectedAnswer
    const clientQuestions = record.questions.map((q: any, i: number) => ({
      index: i,
      question: q.question,
    }));

    return NextResponse.json({
      data: {
        sessionId: record._id.toString(),
        role,
        interviewType,
        difficulty,
        questions: clientQuestions,
      },
    });
  } catch (error: any) {
    console.error("POST /api/mock-interview/start error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to start mock interview." },
      { status: 500 }
    );
  }
}
