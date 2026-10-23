export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { InterviewPrep } from "@/models/InterviewPrep";
import { callGemini } from "@/lib/gemini";
import { interviewEvaluationPrompt } from "@/lib/prompts/interview-evaluation";
import {
  calculateInterviewScore,
  getAdaptiveDifficulty,
  INTERVIEW_RUBRIC_VERSION,
} from "@/lib/scoring";
import {
  InterviewEvaluationGeminiResponseSchema,
  validateAIOutput,
} from "@/lib/validation";
import { retrieveKnowledgeChunks, formatRetrievedContext } from "@/lib/knowledge/retrieval";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      sessionId,
      questionIndex,
      question,
      userAnswer,
      role = "Software Developer",
      interviewType = "technical",
      expectedCriteria,
      difficulty = "medium",
    } = body;

    if (!question || !userAnswer || questionIndex === undefined) {
      return NextResponse.json(
        { error: "question, userAnswer, and questionIndex are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Retrieve knowledge base rubric context
    const retrievedChunks = await retrieveKnowledgeChunks({
      targetRole: role,
      queryText: `${question} ${interviewType} evaluation rubric`,
      contentTypes: ["interview_rubric", "role_competency"],
      limit: 2,
    });
    const retrievedRubric = formatRetrievedContext(retrievedChunks);

    const prompt = interviewEvaluationPrompt({
      question,
      userAnswer,
      role,
      interviewType,
      expectedCriteria,
      retrievedRubric,
    });

    const rawResult = await callGemini(prompt);

    // Validate structured AI evaluation output
    const validation = validateAIOutput(
      InterviewEvaluationGeminiResponseSchema,
      rawResult
    );
    if (!validation.success) {
      return NextResponse.json(
        { error: "AI evaluation output validation failed. Please try again." },
        { status: 500 }
      );
    }

    const validated = validation.data;

    // Calculate deterministic numerical score from rubric components
    const finalScore = calculateInterviewScore({
      correctnessScore: validated.correctnessScore,
      reasoningScore: validated.reasoningScore,
      clarityScore: validated.clarityScore,
      coverageScore: validated.coverageScore,
    });

    // Compute explicit adaptive progression
    const adaptiveRecommendation = getAdaptiveDifficulty(difficulty, finalScore);

    const evaluationResult = {
      score: finalScore,
      correctnessScore: validated.correctnessScore,
      reasoningScore: validated.reasoningScore,
      clarityScore: validated.clarityScore,
      coverageScore: validated.coverageScore,
      feedback: validated.feedback,
      strengths: validated.strengths,
      improvements: validated.improvements,
      sampleBetterAnswer: validated.sampleBetterAnswer,
      rubricVersion: INTERVIEW_RUBRIC_VERSION,
      evaluatedAt: new Date(),
    };

    // If valid sessionId provided, persist directly to InterviewPrep question record
    if (sessionId) {
      const interviewSession = await InterviewPrep.findOne({
        _id: sessionId,
        userId: session.user.id,
      });

      if (interviewSession && interviewSession.questions[questionIndex]) {
        interviewSession.questions[questionIndex].userAnswer = userAnswer;
        interviewSession.questions[questionIndex].evaluation = evaluationResult;
        interviewSession.questions[questionIndex].adaptiveRecommendation = adaptiveRecommendation;
        await interviewSession.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        evaluation: evaluationResult,
        adaptiveRecommendation,
      },
    });
  } catch (error) {
    console.error("Interview evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer. Please try again." },
      { status: 500 }
    );
  }
}
