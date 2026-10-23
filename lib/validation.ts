/**
 * Zod validation schemas for Gemini AI outputs.
 *
 * Every AI response is validated before being used for scoring or persistence.
 * Malformed outputs are rejected — they never overwrite valid reports.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Score between 0 and 100 (inclusive). Non-finite / out-of-range → rejected. */
const scoreField = z.number().min(0).max(100);

/**
 * Nullable score field that explicitly marks "not assessed" as null.
 * When Gemini cannot evaluate a component it should return null rather than 0.
 */
const optionalScoreField = z
  .union([scoreField, z.null()])
  .optional();

// ---------------------------------------------------------------------------
// ATS Review — Gemini response schema
// ---------------------------------------------------------------------------

export const ATSGeminiResponseSchema = z.object({
  keywordCoverageScore: scoreField,
  sectionsCompletenessScore: scoreField,
  structureParsingScore: scoreField,
  skillsRelevanceScore: scoreField,
  achievementImpactScore: scoreField,
  keywordIssues: z.array(z.string()).min(1),
  formattingIssues: z.array(z.string()),
  bulletSuggestions: z
    .array(
      z.object({
        original: z.string(),
        improved: z.string(),
      })
    )
    .min(1),
  overallSuggestions: z.array(z.string()).min(1),
});

export type ValidatedATSResponse = z.infer<typeof ATSGeminiResponseSchema>;

// ---------------------------------------------------------------------------
// Career Score — Gemini response schema
// ---------------------------------------------------------------------------

export const CareerScoreGeminiResponseSchema = z.object({
  resumeScore: scoreField,
  technicalScore: scoreField,
  projectScore: scoreField,
  experienceScore: scoreField,
  interviewScore: scoreField,
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  summary: z.string().min(1),
});

export type ValidatedCareerScoreResponse = z.infer<
  typeof CareerScoreGeminiResponseSchema
>;

// ---------------------------------------------------------------------------
// Resume Analysis — Gemini response schema
// ---------------------------------------------------------------------------

export const ResumeGeminiResponseSchema = z.object({
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      year: z.string(),
      gpa: z.string().optional(),
    })
  ),
  skills: z.array(z.string()),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      link: z.string().optional(),
    })
  ),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      duration: z.string(),
      description: z.string(),
    })
  ),
  achievements: z.array(z.string()),
  technologies: z.array(z.string()),
  certifications: z.array(z.string()),
});

export type ValidatedResumeResponse = z.infer<
  typeof ResumeGeminiResponseSchema
>;

// ---------------------------------------------------------------------------
// Skill Gap — Gemini response schema
// ---------------------------------------------------------------------------

export const SkillGapGeminiResponseSchema = z.object({
  missingSkills: z.array(
    z.object({
      name: z.string().min(1),
      priority: z.enum(["High", "Medium", "Low"]),
      reason: z.string().min(1),
      resources: z.array(z.string()),
      candidateEvidence: z.string().optional(),
      knowledgeBaseEvidence: z.string().optional(),
      confidence: z
        .enum([
          "Demonstrated",
          "Mentioned Without Evidence",
          "Not Found In Profile",
          "Unassessed",
        ])
        .optional(),
      suggestedPractice: z.string().optional(),
      prerequisites: z.array(z.string()).optional(),
      citationChunkId: z.string().optional(),
    })
  ),
});

export type ValidatedSkillGapResponse = z.infer<
  typeof SkillGapGeminiResponseSchema
>;

// ---------------------------------------------------------------------------
// Project Recommendation — Gemini response schema
// ---------------------------------------------------------------------------

export const ProjectGeminiResponseSchema = z.object({
  projects: z.array(
    z.object({
      title: z.string().min(1),
      difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
      techStack: z.array(z.string()),
      learningOutcome: z.string().min(1),
      estimatedWeeks: z.number().min(1),
    })
  ),
});

export type ValidatedProjectResponse = z.infer<
  typeof ProjectGeminiResponseSchema
>;

// ---------------------------------------------------------------------------
// Interview Evaluation — Gemini response schema
// ---------------------------------------------------------------------------

export const InterviewEvaluationGeminiResponseSchema = z.object({
  correctnessScore: z.number().min(0).max(100),
  reasoningScore: z.number().min(0).max(100),
  clarityScore: z.number().min(0).max(100),
  coverageScore: z.number().min(0).max(100),
  feedback: z.string().min(1),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  sampleBetterAnswer: z.string().optional(),
});

export type ValidatedInterviewEvaluation = z.infer<
  typeof InterviewEvaluationGeminiResponseSchema
>;

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

export interface ValidationResult<T> {
  success: true;
  data: T;
}

export interface ValidationError {
  success: false;
  error: string;
}

/**
 * Validate raw AI output against a Zod schema.
 *
 * Returns `{ success: true, data }` on valid input, or
 * `{ success: false, error }` with a human-readable message on failure.
 */
export function validateAIOutput<T>(
  schema: z.ZodType<T>,
  rawOutput: unknown
): ValidationResult<T> | ValidationError {
  const result = z.safeParse(schema, rawOutput);
  if (result.success) {
    return { success: true, data: result.data };
  }

  // Build a concise error description using Zod v4's built-in formatter.
  // Truncate to avoid huge messages. Never leak sensitive content.
  const pretty = z.prettifyError(result.error);
  const truncated = pretty.length > 300 ? pretty.slice(0, 300) + "…" : pretty;

  return {
    success: false,
    error: `AI output validation failed: ${truncated}`,
  };
}
