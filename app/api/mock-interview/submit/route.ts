export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { MockInterview } from "@/models/MockInterview";
import { callGemini } from "@/lib/gemini";
import {
  mockInterviewEvaluatePrompt,
  EvaluationQuestion,
} from "@/lib/prompts/mock-interview";
import { calculateInterviewScore, clampAndNormalize } from "@/lib/scoring";

/**
 * POST /api/mock-interview/submit
 * Body: { sessionId, answers: string[] }
 * Evaluates all answers via Gemini, computes scores, persists completed session.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      sessionId,
      answers,
      terminatedEarly,
      terminationReason,
      tabSwitchCount,
    } = await req.json();

    if (!sessionId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "sessionId and answers[] are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const record = await MockInterview.findOne({
      _id: sessionId,
      userId: session.user.id,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (record.status === "completed") {
      return NextResponse.json(
        { error: "This session has already been submitted" },
        { status: 409 }
      );
    }

    // Build evaluation payload
    const evalQuestions: EvaluationQuestion[] = record.questions.map(
      (q: any, i: number) => ({
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        keyConcepts: q.keyConcepts || [],
        userAnswer: (answers[i] || "").trim(),
      })
    );

    const prompt = mockInterviewEvaluatePrompt(
      record.role,
      record.interviewType,
      record.difficulty,
      evalQuestions
    );

    const raw = await callGemini(prompt);
    const evaluated = raw as {
      questionEvaluations: Array<{
        score: number;
        correctnessScore: number;
        reasoningScore: number;
        clarityScore: number;
        coverageScore: number;
        feedback: string;
        strengths: string[];
        improvements: string[];
      }>;
      overallReport: {
        overallScore: number;
        dimensionScores: {
          correctness: number;
          reasoning: number;
          clarity: number;
          coverage: number;
        };
        overallSummary: string;
        strengths: string[];
        weaknesses: string[];
        pointsToImprove: string[];
      };
    };

    if (
      !evaluated?.questionEvaluations ||
      !evaluated?.overallReport
    ) {
      return NextResponse.json(
        { error: "Evaluation failed. Please try again." },
        { status: 500 }
      );
    }

    // Merge user answers + evaluations into question subdocuments
    const updatedQuestions = record.questions.map((q: any, i: number) => {
      const ev = evaluated.questionEvaluations[i] || {};
      // Use deterministic scorer as the canonical score
      const deterministicScore = calculateInterviewScore({
        correctnessScore: clampAndNormalize(ev.correctnessScore),
        reasoningScore: clampAndNormalize(ev.reasoningScore),
        clarityScore: clampAndNormalize(ev.clarityScore),
        coverageScore: clampAndNormalize(ev.coverageScore),
      });
      return {
        ...q.toObject(),
        userAnswer: (answers[i] || "").trim(),
        score: deterministicScore,
        correctnessScore: clampAndNormalize(ev.correctnessScore),
        reasoningScore: clampAndNormalize(ev.reasoningScore),
        clarityScore: clampAndNormalize(ev.clarityScore),
        coverageScore: clampAndNormalize(ev.coverageScore),
        feedback: ev.feedback || "",
        strengths: ev.strengths || [],
        improvements: ev.improvements || [],
      };
    });

    // Compute overall dimension averages deterministically
    const n = updatedQuestions.length;
    const avgDimension = (key: keyof typeof updatedQuestions[0]) =>
      Math.round(
        updatedQuestions.reduce((sum: number, q: any) => sum + (q[key] || 0), 0) / n
      );

    const dimensionScores = {
      correctness: avgDimension("correctnessScore"),
      reasoning: avgDimension("reasoningScore"),
      clarity: avgDimension("clarityScore"),
      coverage: avgDimension("coverageScore"),
    };

    const overallScore = calculateInterviewScore({
      correctnessScore: dimensionScores.correctness,
      reasoningScore: dimensionScores.reasoning,
      clarityScore: dimensionScores.clarity,
      coverageScore: dimensionScores.coverage,
    });

    const report = evaluated.overallReport;

    await MockInterview.findByIdAndUpdate(sessionId, {
      status: "completed",
      questions: updatedQuestions,
      overallScore,
      dimensionScores,
      overallSummary: report.overallSummary || "",
      strengths: report.strengths || [],
      weaknesses: report.weaknesses || [],
      pointsToImprove: report.pointsToImprove || [],
      terminatedEarly: !!terminatedEarly,
      terminationReason: terminationReason || undefined,
      tabSwitchCount: Number(tabSwitchCount) || 0,
      completedAt: new Date(),
    });

    const finalRecord = await MockInterview.findById(sessionId);

    return NextResponse.json({ data: finalRecord });
  } catch (error: any) {
    console.error("POST /api/mock-interview/submit error:", error);
    return NextResponse.json(
      { error: error?.message || "Submission failed. Please try again." },
      { status: 500 }
    );
  }
}
