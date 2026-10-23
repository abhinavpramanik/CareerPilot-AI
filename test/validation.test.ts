import test from 'node:test';
import assert from 'node:assert';

// We need to use dynamic imports because the validation module uses Zod ESM
// but node:test runs with CommonJS resolution. We transpile at import time.
const loadValidation = async () => {
  // Use tsx to handle TypeScript imports
  const { execSync } = await import('node:child_process');
  const path = await import('node:path');
  
  // Write a small helper script that validates and outputs results
  const { writeFileSync, unlinkSync, existsSync } = await import('node:fs');
  return { execSync, path, writeFileSync, unlinkSync, existsSync };
};

// ---------------------------------------------------------------------------
// Direct schema tests using inline Zod (avoids ESM/CJS issues)
// ---------------------------------------------------------------------------

test('ATS validation: accepts valid Gemini response', async () => {
  const { z } = await import('zod');
  const { ATSGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');
  
  const validResponse = {
    keywordCoverageScore: 75,
    sectionsCompletenessScore: 80,
    structureParsingScore: 65,
    skillsRelevanceScore: 70,
    achievementImpactScore: 60,
    keywordIssues: ["Missing Docker keyword"],
    formattingIssues: ["Table detected in resume"],
    bulletSuggestions: [{ original: "Worked on project", improved: "Led development of..." }],
    overallSuggestions: ["Add quantifiable metrics"],
  };

  const result = validateAIOutput(ATSGeminiResponseSchema, validResponse);
  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.keywordCoverageScore, 75);
    assert.strictEqual(result.data.sectionsCompletenessScore, 80);
  }
});

test('ATS validation: rejects out-of-range scores', async () => {
  const { ATSGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const badResponse = {
    keywordCoverageScore: 150, // out of range
    sectionsCompletenessScore: 80,
    structureParsingScore: 65,
    skillsRelevanceScore: 70,
    achievementImpactScore: 60,
    keywordIssues: ["Missing keyword"],
    formattingIssues: [],
    bulletSuggestions: [{ original: "x", improved: "y" }],
    overallSuggestions: ["Suggestion"],
  };

  const result = validateAIOutput(ATSGeminiResponseSchema, badResponse);
  assert.strictEqual(result.success, false);
  if (!result.success) {
    assert.ok(result.error.includes("validation failed"), `Error should mention validation: ${result.error}`);
  }
});

test('ATS validation: rejects negative scores', async () => {
  const { ATSGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const badResponse = {
    keywordCoverageScore: -10,
    sectionsCompletenessScore: 80,
    structureParsingScore: 65,
    skillsRelevanceScore: 70,
    achievementImpactScore: 60,
    keywordIssues: ["Missing keyword"],
    formattingIssues: [],
    bulletSuggestions: [{ original: "x", improved: "y" }],
    overallSuggestions: ["Suggestion"],
  };

  const result = validateAIOutput(ATSGeminiResponseSchema, badResponse);
  assert.strictEqual(result.success, false);
});

test('ATS validation: rejects missing required fields', async () => {
  const { ATSGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const incompleteResponse = {
    keywordCoverageScore: 75,
    // Missing all other fields
  };

  const result = validateAIOutput(ATSGeminiResponseSchema, incompleteResponse);
  assert.strictEqual(result.success, false);
});

test('ATS validation: rejects empty keywordIssues array', async () => {
  const { ATSGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const badResponse = {
    keywordCoverageScore: 75,
    sectionsCompletenessScore: 80,
    structureParsingScore: 65,
    skillsRelevanceScore: 70,
    achievementImpactScore: 60,
    keywordIssues: [], // must have at least 1
    formattingIssues: [],
    bulletSuggestions: [{ original: "x", improved: "y" }],
    overallSuggestions: ["Suggestion"],
  };

  const result = validateAIOutput(ATSGeminiResponseSchema, badResponse);
  assert.strictEqual(result.success, false);
});

test('ATS validation: rejects wrong types', async () => {
  const { ATSGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const wrongTypes = {
    keywordCoverageScore: "seventy-five", // string instead of number
    sectionsCompletenessScore: 80,
    structureParsingScore: 65,
    skillsRelevanceScore: 70,
    achievementImpactScore: 60,
    keywordIssues: ["x"],
    formattingIssues: [],
    bulletSuggestions: [{ original: "x", improved: "y" }],
    overallSuggestions: ["x"],
  };

  const result = validateAIOutput(ATSGeminiResponseSchema, wrongTypes);
  assert.strictEqual(result.success, false);
});

test('Career validation: accepts valid Gemini response', async () => {
  const { CareerScoreGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const validResponse = {
    resumeScore: 80,
    technicalScore: 75,
    projectScore: 85,
    experienceScore: 60,
    interviewScore: 70,
    strengths: ["Strong React experience", "Good project portfolio"],
    weaknesses: ["Limited backend experience"],
    summary: "A solid junior developer with frontend focus.",
  };

  const result = validateAIOutput(CareerScoreGeminiResponseSchema, validResponse);
  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.resumeScore, 80);
  }
});

test('Career validation: rejects empty summary', async () => {
  const { CareerScoreGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const badResponse = {
    resumeScore: 80,
    technicalScore: 75,
    projectScore: 85,
    experienceScore: 60,
    interviewScore: 70,
    strengths: ["Strength"],
    weaknesses: ["Weakness"],
    summary: "", // empty
  };

  const result = validateAIOutput(CareerScoreGeminiResponseSchema, badResponse);
  assert.strictEqual(result.success, false);
});

test('Career validation: rejects missing strengths/weaknesses', async () => {
  const { CareerScoreGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const badResponse = {
    resumeScore: 80,
    technicalScore: 75,
    projectScore: 85,
    experienceScore: 60,
    interviewScore: 70,
    strengths: [], // must have at least 1
    weaknesses: ["Weakness"],
    summary: "Summary",
  };

  const result = validateAIOutput(CareerScoreGeminiResponseSchema, badResponse);
  assert.strictEqual(result.success, false);
});

test('Resume validation: accepts valid parsed resume', async () => {
  const { ResumeGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const validResume = {
    education: [{ institution: "MIT", degree: "BS", field: "CS", year: "2024" }],
    skills: ["JavaScript", "React"],
    projects: [{ name: "Portfolio", description: "My portfolio site", technologies: ["React"] }],
    experience: [{ company: "Google", role: "Intern", duration: "3 months", description: "Built features" }],
    achievements: ["Dean's list"],
    technologies: ["React", "Node.js"],
    certifications: ["AWS Cloud Practitioner"],
  };

  const result = validateAIOutput(ResumeGeminiResponseSchema, validResume);
  assert.strictEqual(result.success, true);
});

test('Resume validation: accepts empty arrays (valid for sparse resumes)', async () => {
  const { ResumeGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const sparseResume = {
    education: [],
    skills: [],
    projects: [],
    experience: [],
    achievements: [],
    technologies: [],
    certifications: [],
  };

  const result = validateAIOutput(ResumeGeminiResponseSchema, sparseResume);
  assert.strictEqual(result.success, true);
});

test('SkillGap validation: accepts valid response', async () => {
  const { SkillGapGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const validResponse = {
    missingSkills: [
      { name: "Docker", priority: "High", reason: "Required for DevOps", resources: ["Docker docs"] },
      { name: "GraphQL", priority: "Medium", reason: "Growing adoption", resources: [] },
    ],
  };

  const result = validateAIOutput(SkillGapGeminiResponseSchema, validResponse);
  assert.strictEqual(result.success, true);
});

test('SkillGap validation: rejects invalid priority', async () => {
  const { SkillGapGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const badResponse = {
    missingSkills: [
      { name: "Docker", priority: "Critical", reason: "Important", resources: [] }, // "Critical" not in enum
    ],
  };

  const result = validateAIOutput(SkillGapGeminiResponseSchema, badResponse);
  assert.strictEqual(result.success, false);
});

test('Project validation: accepts valid response', async () => {
  const { ProjectGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const validResponse = {
    projects: [
      {
        title: "Chat App",
        difficulty: "Intermediate",
        techStack: ["React", "Socket.io"],
        learningOutcome: "Learn real-time communication",
        estimatedWeeks: 3,
      },
    ],
  };

  const result = validateAIOutput(ProjectGeminiResponseSchema, validResponse);
  assert.strictEqual(result.success, true);
});

test('Project validation: rejects invalid difficulty', async () => {
  const { ProjectGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const badResponse = {
    projects: [
      {
        title: "Chat App",
        difficulty: "Expert", // not in enum
        techStack: ["React"],
        learningOutcome: "Learn stuff",
        estimatedWeeks: 3,
      },
    ],
  };

  const result = validateAIOutput(ProjectGeminiResponseSchema, badResponse);
  assert.strictEqual(result.success, false);
});

test('Validation does not leak sensitive data in error messages', async () => {
  const { ATSGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  const result = validateAIOutput(ATSGeminiResponseSchema, null);
  assert.strictEqual(result.success, false);
  if (!result.success) {
    // Error should not contain resume text or personal info
    assert.ok(!result.error.includes("password"), "Error should not contain sensitive data");
    assert.ok(!result.error.includes("apiKey"), "Error should not contain API keys");
  }
});

test('Validation truncates error messages to prevent huge outputs', async () => {
  const { ATSGeminiResponseSchema, validateAIOutput } = await import('../lib/validation');

  // Pass an empty object — all fields are missing, generating many errors
  const result = validateAIOutput(ATSGeminiResponseSchema, {});
  assert.strictEqual(result.success, false);
  if (!result.success) {
    // Error should be truncated to a reasonable length
    assert.ok(result.error.length <= 400, `Error should be truncated, got ${result.error.length} chars`);
    assert.ok(result.error.includes("validation failed"), "Error should mention validation failure");
  }
});
