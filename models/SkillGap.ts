import mongoose, { Schema, Document } from "mongoose";

export interface ISkillGap extends Document {
  userId: string;
  targetRole: string;
  missingSkills: Array<{
    name: string;
    priority: "High" | "Medium" | "Low";
    reason: string;
    resources: string[];
    candidateEvidence?: string;
    knowledgeBaseEvidence?: string;
    confidence?: "Demonstrated" | "Mentioned Without Evidence" | "Not Found In Profile" | "Unassessed";
    suggestedPractice?: string;
    prerequisites?: string[];
    citationChunkId?: string;
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
        candidateEvidence: { type: String },
        knowledgeBaseEvidence: { type: String },
        confidence: {
          type: String,
          enum: [
            "Demonstrated",
            "Mentioned Without Evidence",
            "Not Found In Profile",
            "Unassessed",
          ],
          default: "Not Found In Profile",
        },
        suggestedPractice: { type: String },
        prerequisites: { type: [String], default: [] },
        citationChunkId: { type: String },
      },
    ],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SkillGap =
  mongoose.models.SkillGap || mongoose.model<ISkillGap>("SkillGap", SkillGapSchema);
