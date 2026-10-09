import test from 'node:test';
import assert from 'node:assert';
import { calculateATSScore, calculateCareerScore, ATS_WEIGHTS, CAREER_WEIGHTS, clampAndNormalize, generateFingerprint, ATS_RUBRIC_VERSION, CAREER_RUBRIC_VERSION } from '../lib/scoring';

test('Component weights sum to 1', () => {
  const atsSum = Object.values(ATS_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.strictEqual(Math.abs(atsSum - 1) < 0.001, true, 'ATS weights should sum to 1');

  const careerSum = Object.values(CAREER_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.strictEqual(Math.abs(careerSum - 1) < 0.001, true, 'Career weights should sum to 1');
});

test('Clamp and normalize keeps scores between 0 and 100', () => {
  assert.strictEqual(clampAndNormalize(-10), 0);
  assert.strictEqual(clampAndNormalize(110), 100);
  assert.strictEqual(clampAndNormalize(50), 50);
  assert.strictEqual(clampAndNormalize(undefined), 0);
  assert.strictEqual(clampAndNormalize(null), 0);
  assert.strictEqual(clampAndNormalize(NaN), 0);
});

test('Identical normalized inputs produce identical numerical scores', () => {
  const atsComponents = {
    keywordCoverageScore: 80,
    sectionsCompletenessScore: 90,
    structureParsingScore: 70,
    skillsRelevanceScore: 85,
    achievementImpactScore: 75,
  };

  const score1 = calculateATSScore(atsComponents);
  const score2 = calculateATSScore(atsComponents);
  assert.strictEqual(score1, score2);

  const careerComponents = {
    technicalScore: 80,
    projectScore: 90,
    experienceScore: 70,
    resumeScore: 85,
    interviewScore: 75,
  };

  const careerScore1 = calculateCareerScore(careerComponents);
  const careerScore2 = calculateCareerScore(careerComponents);
  assert.strictEqual(careerScore1, careerScore2);
});

test('Rounding is consistent', () => {
  const atsComponents = {
    keywordCoverageScore: 80.4,
    sectionsCompletenessScore: 90.6,
    structureParsingScore: 70.1,
    skillsRelevanceScore: 85.9,
    achievementImpactScore: 75.5,
  };

  const s1 = Math.round(80.4) * ATS_WEIGHTS.keywordCoverage;
  const s2 = Math.round(90.6) * ATS_WEIGHTS.sectionsCompleteness;
  const s3 = Math.round(70.1) * ATS_WEIGHTS.structureParsing;
  const s4 = Math.round(85.9) * ATS_WEIGHTS.skillsRelevance;
  const s5 = Math.round(75.5) * ATS_WEIGHTS.achievementImpact;
  const expectedSum = Math.round(s1 + s2 + s3 + s4 + s5);

  const actualScore = calculateATSScore(atsComponents);
  assert.strictEqual(actualScore, expectedSum);
});

test('Missing evidence is handled according to the rubric (defaults to 0)', () => {
  const score = calculateATSScore({});
  assert.strictEqual(score, 0);

  const partialScore = calculateCareerScore({ technicalScore: 100 });
  const expected = Math.round(100 * CAREER_WEIGHTS.technical);
  assert.strictEqual(partialScore, expected);
});

test('ATS and Career Readiness use independent scoring rules', () => {
  const components = {
    keywordCoverageScore: 100, // ATS uses this (0.35)
    sectionsCompletenessScore: 0,
    structureParsingScore: 0,
    skillsRelevanceScore: 0,
    achievementImpactScore: 0,

    technicalScore: 100, // Career uses this (0.30)
    projectScore: 0,
    experienceScore: 0,
    resumeScore: 0,
    interviewScore: 0,
  };
  
  const atsScore = calculateATSScore(components);
  const careerScore = calculateCareerScore(components);
  
  assert.notStrictEqual(atsScore, careerScore);
});

test('Input fingerprinting logic works', () => {
  const fp1 = generateFingerprint("user1_resume_text");
  const fp2 = generateFingerprint("user1_resume_text");
  assert.strictEqual(fp1, fp2);
  
  const fp3 = generateFingerprint("user2_resume_text");
  assert.notStrictEqual(fp1, fp3);
});
