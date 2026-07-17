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
      },
    ],
  },
  { timestamps: true }
);

export const InterviewPrep =
  mongoose.models.InterviewPrep ||
  mongoose.model<IInterviewPrep>("InterviewPrep", InterviewPrepSchema);
