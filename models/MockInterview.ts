import mongoose, { Schema, Document } from "mongoose";

export interface IMockInterviewQuestion {
  question: string;
  expectedAnswer: string;
  keyConcepts: string[];
  userAnswer?: string;
  score?: number;
  correctnessScore?: number;
  reasoningScore?: number;
  clarityScore?: number;
  coverageScore?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
}

export interface IMockInterview extends Document {
  userId: string;
  role: string;
  interviewType: "technical" | "hr";
  difficulty: "easy" | "medium" | "hard";
  status: "in_progress" | "completed";
  questions: IMockInterviewQuestion[];
  // Overall session scores (populated after submit)
  overallScore?: number;
  dimensionScores?: {
    correctness: number;
    reasoning: number;
    clarity: number;
    coverage: number;
  };
  // Report narrative (populated after submit)
  overallSummary?: string;
  strengths?: string[];
  weaknesses?: string[];
  pointsToImprove?: string[];
  
  terminatedEarly?: boolean;
  terminationReason?: string;
  tabSwitchCount?: number;
  createdAt: Date;
  completedAt?: Date;
}

const MockInterviewQuestionSchema = new Schema<IMockInterviewQuestion>(
  {
    question: { type: String, required: true },
    expectedAnswer: { type: String, required: true },
    keyConcepts: [{ type: String }],
    userAnswer: { type: String },
    score: { type: Number },
    correctnessScore: { type: Number },
    reasoningScore: { type: Number },
    clarityScore: { type: Number },
    coverageScore: { type: Number },
    feedback: { type: String },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
  },
  { _id: false }
);

const MockInterviewSchema = new Schema<IMockInterview>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    interviewType: {
      type: String,
      enum: ["technical", "hr"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    questions: [MockInterviewQuestionSchema],
    overallScore: { type: Number },
    dimensionScores: {
      correctness: { type: Number },
      reasoning: { type: Number },
      clarity: { type: Number },
      coverage: { type: Number },
    },
    overallSummary: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    pointsToImprove: [{ type: String }],
    terminatedEarly: { type: Boolean, default: false },
    terminationReason: { type: String },
    tabSwitchCount: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const MockInterview =
  mongoose.models.MockInterview ||
  mongoose.model<IMockInterview>("MockInterview", MockInterviewSchema);
