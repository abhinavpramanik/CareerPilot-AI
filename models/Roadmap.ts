import mongoose, { Schema, Document } from "mongoose";

export interface IRoadmap extends Document {
  userId: string;
  targetRole: string;
  weeks: Array<{
    week: number;
    topics: string[];
    deliverables: string[];
    estimatedHours: number;
  }>;
  generatedAt: Date;
}

const RoadmapSchema = new Schema<IRoadmap>(
  {
    userId: { type: String, required: true, index: true },
    targetRole: { type: String, required: true },
    weeks: [
      {
        week: Number,
        topics: [String],
        deliverables: [String],
        estimatedHours: Number,
      },
    ],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Roadmap =
  mongoose.models.Roadmap || mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);
