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
