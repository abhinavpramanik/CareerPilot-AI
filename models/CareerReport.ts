import mongoose, { Schema, Document } from "mongoose";

export interface ICareerReport extends Document {
  userId: string;
  careerScore: number;
  resumeScore: number;
  technicalScore: number;
  projectScore: number;
  experienceScore: number;
  interviewScore: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  atsScore: number;
  skillGap: Array<{
    name: string;
    priority: "High" | "Medium" | "Low";
    reason: string;
    resources: string[];
  }>;
  targetRole?: string;
  inputFingerprint?: string;
  rubricVersion?: string;
  reportGeneratedAt: Date;
}

const CareerReportSchema = new Schema<ICareerReport>(
  {
    userId: { type: String, required: true, index: true },
    careerScore: { type: Number, default: 0 },
    resumeScore: { type: Number, default: 0 },
    technicalScore: { type: Number, default: 0 },
    projectScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    interviewScore: { type: Number, default: 0 },
    strengths: [String],
    weaknesses: [String],
    summary: { type: String, default: "" },
    atsScore: { type: Number, default: 0 },
    skillGap: [
      {
        name: String,
        priority: { type: String, enum: ["High", "Medium", "Low"] },
        reason: String,
        resources: [String],
      },
    ],
    targetRole: { type: String },
    inputFingerprint: { type: String },
    rubricVersion: { type: String },
    reportGeneratedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CareerReport =
  mongoose.models.CareerReport ||
  mongoose.model<ICareerReport>("CareerReport", CareerReportSchema);
