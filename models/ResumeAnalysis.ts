import mongoose, { Schema, Document } from "mongoose";

export interface IResumeAnalysis extends Document {
  userId: string;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  achievements: string[];
  technologies: string[];
  certifications: string[];
  rawText: string;
  analyzedAt: Date;
}

const ResumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    userId: { type: String, required: true, index: true },
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        year: String,
        gpa: String,
      },
    ],
    skills: [String],
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        link: String,
      },
    ],
    experience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],
    achievements: [String],
    technologies: [String],
    certifications: [String],
    rawText: { type: String, required: true },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ResumeAnalysis =
  mongoose.models.ResumeAnalysis ||
  mongoose.model<IResumeAnalysis>("ResumeAnalysis", ResumeAnalysisSchema);
