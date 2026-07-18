import mongoose, { Schema, Document } from "mongoose";

export interface IATSReview extends Document {
  userId: string;
  atsScore: number;
  missingKeywords: string[];
  formattingIssues: string[];
  recommendations: string[];
  generatedAt: Date;
}

const ATSReviewSchema = new Schema<IATSReview>(
  {
    userId: { type: String, required: true, index: true },
    atsScore: { type: Number, required: true },
    missingKeywords: { type: [String], default: [] },
    formattingIssues: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ATSReview =
  mongoose.models.ATSReview || mongoose.model<IATSReview>("ATSReview", ATSReviewSchema);
