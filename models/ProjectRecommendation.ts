import mongoose, { Schema, Document } from "mongoose";

export interface IProjectRecommendation extends Document {
  userId: string;
  targetRole: string;
  projects: Array<{
    title: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    techStack: string[];
    learningOutcome: string;
    estimatedWeeks: number;
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
        difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
        techStack: { type: [String], default: [] },
        learningOutcome: { type: String, required: true },
        estimatedWeeks: { type: Number, required: true },
      },
    ],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.ProjectRecommendation;
}

export const ProjectRecommendation =
  mongoose.models.ProjectRecommendation ||
  mongoose.model<IProjectRecommendation>("ProjectRecommendation", ProjectRecommendationSchema);
