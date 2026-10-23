import crypto from 'crypto';

export const ATS_RUBRIC_VERSION = "1.0.2";
export const CAREER_RUBRIC_VERSION = "1.0.0";

// Define weights and validations
export const ATS_WEIGHTS = {
  keywordCoverage: 0.35,
  sectionsCompleteness: 0.20,
  structureParsing: 0.15,
  skillsRelevance: 0.15,
  achievementImpact: 0.15,
};

export const CAREER_WEIGHTS = {
  technical: 0.30,
  project: 0.25,
  experience: 0.15,
  resume: 0.15,
  interview: 0.15,
};

export function clampAndNormalize(score: number | undefined | null): number {
  if (score === undefined || score === null || isNaN(score)) {
    return 0; // Default to 0 if missing or invalid
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateATSScore(components: {
  keywordCoverageScore?: number;
  sectionsCompletenessScore?: number;
  structureParsingScore?: number;
  skillsRelevanceScore?: number;
  achievementImpactScore?: number;
}): number {
  const sumWeights = Object.values(ATS_WEIGHTS).reduce((a, b) => a + b, 0);
  if (Math.abs(sumWeights - 1) > 0.001) {
    throw new Error("ATS weights do not sum to 1");
  }

  const s1 = clampAndNormalize(components.keywordCoverageScore);
  const s2 = clampAndNormalize(components.sectionsCompletenessScore);
  const s3 = clampAndNormalize(components.structureParsingScore);
  const s4 = clampAndNormalize(components.skillsRelevanceScore);
  const s5 = clampAndNormalize(components.achievementImpactScore);

  const weightedSum =
    s1 * ATS_WEIGHTS.keywordCoverage +
    s2 * ATS_WEIGHTS.sectionsCompleteness +
    s3 * ATS_WEIGHTS.structureParsing +
    s4 * ATS_WEIGHTS.skillsRelevance +
    s5 * ATS_WEIGHTS.achievementImpact;

  return Math.round(weightedSum);
}

export function calculateCareerScore(components: {
  technicalScore?: number;
  projectScore?: number;
  experienceScore?: number;
  resumeScore?: number;
  interviewScore?: number;
}): number {
  const sumWeights = Object.values(CAREER_WEIGHTS).reduce((a, b) => a + b, 0);
  if (Math.abs(sumWeights - 1) > 0.001) {
    throw new Error("Career weights do not sum to 1");
  }

  const s1 = clampAndNormalize(components.technicalScore);
  const s2 = clampAndNormalize(components.projectScore);
  const s3 = clampAndNormalize(components.experienceScore);
  const s4 = clampAndNormalize(components.resumeScore);
  const s5 = clampAndNormalize(components.interviewScore);

  const weightedSum =
    s1 * CAREER_WEIGHTS.technical +
    s2 * CAREER_WEIGHTS.project +
    s3 * CAREER_WEIGHTS.experience +
    s4 * CAREER_WEIGHTS.resume +
    s5 * CAREER_WEIGHTS.interview;

  return Math.round(weightedSum);
}

export function generateFingerprint(inputString: string): string {
  return crypto.createHash('sha256').update(inputString).digest('hex');
}

export const INTERVIEW_RUBRIC_VERSION = "1.0.0";

export const INTERVIEW_WEIGHTS = {
  correctness: 0.40,
  reasoning: 0.25,
  clarity: 0.20,
  coverage: 0.15,
};

export function calculateInterviewScore(components: {
  correctnessScore?: number;
  reasoningScore?: number;
  clarityScore?: number;
  coverageScore?: number;
}): number {
  const sumWeights = Object.values(INTERVIEW_WEIGHTS).reduce((a, b) => a + b, 0);
  if (Math.abs(sumWeights - 1) > 0.001) {
    throw new Error("Interview weights do not sum to 1");
  }

  const s1 = clampAndNormalize(components.correctnessScore);
  const s2 = clampAndNormalize(components.reasoningScore);
  const s3 = clampAndNormalize(components.clarityScore);
  const s4 = clampAndNormalize(components.coverageScore);

  const weightedSum =
    s1 * INTERVIEW_WEIGHTS.correctness +
    s2 * INTERVIEW_WEIGHTS.reasoning +
    s3 * INTERVIEW_WEIGHTS.clarity +
    s4 * INTERVIEW_WEIGHTS.coverage;

  return Math.round(weightedSum);
}

/**
 * Explicit adaptation rules for progressive interview difficulty.
 */
export function getAdaptiveDifficulty(
  currentDifficulty: "easy" | "medium" | "hard",
  score: number
): {
  nextDifficulty: "easy" | "medium" | "hard";
  action: "advance" | "maintain" | "reinforce";
  reason: string;
} {
  if (score >= 80) {
    if (currentDifficulty === "easy") {
      return {
        nextDifficulty: "medium",
        action: "advance",
        reason: "Strong mastery demonstrated (score >= 80). Advancing to medium difficulty questions.",
      };
    }
    if (currentDifficulty === "medium") {
      return {
        nextDifficulty: "hard",
        action: "advance",
        reason: "Consistently strong performance (score >= 80). Stepping up to hard scenario questions.",
      };
    }
    return {
      nextDifficulty: "hard",
      action: "maintain",
      reason: "Outstanding mastery on advanced technical questions (score >= 80).",
    };
  }

  if (score < 55) {
    if (currentDifficulty === "hard") {
      return {
        nextDifficulty: "medium",
        action: "reinforce",
        reason: "Identified knowledge gaps (score < 55). Reinforcing medium-tier concepts first.",
      };
    }
    if (currentDifficulty === "medium") {
      return {
        nextDifficulty: "easy",
        action: "reinforce",
        reason: "Fundamental concept reinforcement needed (score < 55). Stepping down to clarify basics.",
      };
    }
    return {
      nextDifficulty: "easy",
      action: "reinforce",
      reason: "Foundational practice recommended before moving to higher difficulty.",
    };
  }

  return {
    nextDifficulty: currentDifficulty,
    action: "maintain",
    reason: `Solid progress (${score}/100). Continuing with ${currentDifficulty} questions to build consistency.`,
  };
}
