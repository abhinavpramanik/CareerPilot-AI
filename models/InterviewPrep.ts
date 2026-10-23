import mongoose, { Schema, Document } from "mongoose";

export interface IInterviewPrep extends Document {
  userId: string;
  role: string;
  interviewType: "technical" | "hr";
  difficulty: "easy" | "medium" | "hard";
  questions: Array<{
    question: string;
    expectedAnswer?: string;
    keyConcepts?: string[];
    followUps?: string[];
    sampleAnswer?: string;
    starGuidance?: string;
    personalizationTip?: string;
    topic?: string;
    userAnswer?: string;
    evaluation?: {
      score: number;
      correctnessScore: number;
      reasoningScore: number;
      clarityScore: number;
      coverageScore: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
      rubricVersion: string;
      evaluatedAt: Date;
    };
    adaptiveRecommendation?: {
      nextDifficulty: "easy" | "medium" | "hard";
      action: "advance" | "maintain" | "reinforce";
      reason: string;
    };
  }>;
  createdAt: Date;
}

const InterviewPrepSchema = new Schema<IInterviewPrep>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    interviewType: { type: String, enum: ["technical", "hr"], required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    questions: [
      {
        question: String,
        expectedAnswer: String,
        keyConcepts: [String],
        followUps: [String],
        sampleAnswer: String,
        starGuidance: String,
        personalizationTip: String,
        topic: String,
        userAnswer: String,
        evaluation: {
          score: Number,
          correctnessScore: Number,
          reasoningScore: Number,
          clarityScore: Number,
          coverageScore: Number,
          feedback: String,
          strengths: [String],
          improvements: [String],
          rubricVersion: String,
          evaluatedAt: { type: Date, default: Date.now },
        },
        adaptiveRecommendation: {
          nextDifficulty: { type: String, enum: ["easy", "medium", "hard"] },
          action: { type: String, enum: ["advance", "maintain", "reinforce"] },
          reason: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export const InterviewPrep =
  mongoose.models.InterviewPrep ||
  mongoose.model<IInterviewPrep>("InterviewPrep", InterviewPrepSchema);
