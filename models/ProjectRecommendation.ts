import mongoose, { Schema, Document } from "mongoose";

export interface IProjectRecommendation extends Document {
  userId: string;
  targetRole: string;
  projects: Array<{
    title: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    techStack: string[];
    keyFeatures: string[];
    learningOutcomes: string[];
  }>;
  generatedAt: Date;
}

const ProjectRecommendationSchema = new Schema<IProjectRecommendation>(
  {
    userId: { type: String, required: true, index: true },
    targetRole: { type: String, required: true },
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
        techStack: { type: [String], default: [] },
        keyFeatures: { type: [String], default: [] },
        learningOutcomes: { type: [String], default: [] },
      },
    ],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ProjectRecommendation =
  mongoose.models.ProjectRecommendation ||
  mongoose.model<IProjectRecommendation>("ProjectRecommendation", ProjectRecommendationSchema);
