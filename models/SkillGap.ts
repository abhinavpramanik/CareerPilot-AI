import mongoose, { Schema, Document } from "mongoose";

export interface ISkillGap extends Document {
  userId: string;
  targetRole: string;
  missingSkills: Array<{
    name: string;
    priority: "High" | "Medium" | "Low";
    reason: string;
    resources: string[];
  }>;
  generatedAt: Date;
}

const SkillGapSchema = new Schema<ISkillGap>(
  {
    userId: { type: String, required: true, index: true },
    targetRole: { type: String, required: true },
    missingSkills: [
      {
        name: { type: String, required: true },
        priority: { type: String, enum: ["High", "Medium", "Low"], required: true },
        reason: { type: String, required: true },
        resources: { type: [String], default: [] },
      },
    ],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SkillGap =
  mongoose.models.SkillGap || mongoose.model<ISkillGap>("SkillGap", SkillGapSchema);
