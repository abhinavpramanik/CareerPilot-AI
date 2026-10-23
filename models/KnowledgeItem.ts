import mongoose, { Schema, Document } from "mongoose";

export type KnowledgeContentType =
  | "role_competency"
  | "skill_prerequisite"
  | "learning_resource"
  | "interview_rubric"
  | "project_idea";

export interface IKnowledgeItem extends Document {
  chunkId: string;
  documentId: string;
  title: string;
  sourceUrl: string;
  contentType: KnowledgeContentType;
  roleTags: string[];
  skillTags: string[];
  level?: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  content: string;
  contentHash: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeItemSchema = new Schema<IKnowledgeItem>(
  {
    chunkId: { type: String, required: true, unique: true, index: true },
    documentId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    contentType: {
      type: String,
      enum: [
        "role_competency",
        "skill_prerequisite",
        "learning_resource",
        "interview_rubric",
        "project_idea",
      ],
      required: true,
      index: true,
    },
    roleTags: { type: [String], index: true, default: [] },
    skillTags: { type: [String], index: true, default: [] },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    prerequisites: { type: [String], default: [] },
    content: { type: String, required: true },
    contentHash: { type: String, required: true, index: true },
    embedding: { type: [Number], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const KnowledgeItem =
  mongoose.models.KnowledgeItem ||
  mongoose.model<IKnowledgeItem>("KnowledgeItem", KnowledgeItemSchema);
