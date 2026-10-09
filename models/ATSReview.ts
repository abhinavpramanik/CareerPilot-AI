import mongoose, { Schema, Document } from "mongoose";

export interface IATSReview extends Document {
  userId: string;
  atsScore: number;
  keywordCoverageScore: number;
  sectionsCompletenessScore: number;
  structureParsingScore: number;
  skillsRelevanceScore: number;
  achievementImpactScore: number;
  keywordIssues: string[];
  formattingIssues: string[];
  bulletSuggestions: Array<{ original: string; improved: string }>;
  overallSuggestions: string[];
  inputFingerprint: string;
  rubricVersion: string;
  generatedAt: Date;
}

const ATSReviewSchema = new Schema<IATSReview>(
  {
    userId: { type: String, required: true, index: true },
    atsScore: { type: Number, required: true },
    keywordCoverageScore: { type: Number, default: 0 },
    sectionsCompletenessScore: { type: Number, default: 0 },
    structureParsingScore: { type: Number, default: 0 },
    skillsRelevanceScore: { type: Number, default: 0 },
    achievementImpactScore: { type: Number, default: 0 },
    keywordIssues: { type: [String], default: [] },
    formattingIssues: { type: [String], default: [] },
    bulletSuggestions: {
      type: [
        {
          original: String,
          improved: String,
        },
      ],
      default: [],
    },
    overallSuggestions: { type: [String], default: [] },
    inputFingerprint: { type: String },
    rubricVersion: { type: String },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ATSReview =
  mongoose.models.ATSReview || mongoose.model<IATSReview>("ATSReview", ATSReviewSchema);
