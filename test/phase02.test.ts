import test from 'node:test';
import assert from 'node:assert';
import { CURATED_KNOWLEDGE_BASE } from '../lib/knowledge/data';
import { computeContentHash } from '../lib/knowledge/ingest';
import { retrieveKnowledgeChunks, formatRetrievedContext } from '../lib/knowledge/retrieval';
import { verifyCitations } from '../lib/knowledge/citations';
import {
  calculateInterviewScore,
  getAdaptiveDifficulty,
  INTERVIEW_RUBRIC_VERSION,
  INTERVIEW_WEIGHTS,
} from '../lib/scoring';
import {
  InterviewEvaluationGeminiResponseSchema,
  SkillGapGeminiResponseSchema,
  validateAIOutput,
} from '../lib/validation';

// ---------------------------------------------------------------------------
// 1. Retrieval & Knowledge Base Tests
// ---------------------------------------------------------------------------

test('RAG Knowledge: Curated knowledge base contains required competency frameworks', () => {
  assert.ok(CURATED_KNOWLEDGE_BASE.length >= 10, 'Knowledge base should contain at least 10 curated items');
  
  const roleCompetencies = CURATED_KNOWLEDGE_BASE.filter(c => c.contentType === 'role_competency');
  assert.ok(roleCompetencies.length >= 3, 'Should have competency frameworks for multiple roles');

  const prereqDocs = CURATED_KNOWLEDGE_BASE.filter(c => c.contentType === 'skill_prerequisite');
  assert.ok(prereqDocs.length >= 3, 'Should have skill prerequisite chains');

  const learningResources = CURATED_KNOWLEDGE_BASE.filter(c => c.contentType === 'learning_resource');
  assert.ok(learningResources.length >= 3, 'Should have verified learning resources');
});

test('RAG Retrieval: Known queries retrieve expected relevant sources', async () => {
  const reactResults = await retrieveKnowledgeChunks({
    targetRole: 'Frontend Developer',
    skills: ['JavaScript', 'React'],
    queryText: 'React component state hooks',
    limit: 3,
  });

  assert.ok(reactResults.length > 0, 'Should return retrieved chunks');
  const topResult = reactResults[0];
  const hasFrontendContext = topResult.roleTags.some(t => t.includes('Frontend') || t.includes('Full Stack')) ||
                            topResult.skillTags.includes('React');
  assert.ok(hasFrontendContext, 'Top retrieved chunk should match Frontend / React context');
});

test('RAG Retrieval: Metadata filters restrict content types properly', async () => {
  const rubricResults = await retrieveKnowledgeChunks({
    targetRole: 'Full Stack Developer',
    contentTypes: ['interview_rubric'],
    limit: 5,
  });

  assert.ok(rubricResults.length > 0, 'Should return rubric chunks');
  for (const item of rubricResults) {
    assert.strictEqual(item.contentType, 'interview_rubric', 'All retrieved items must match filtered contentType');
  }
});

test('RAG Ingestion: Content hashing is idempotent and detects changes', () => {
  const hash1 = computeContentHash("Knowledge content about React", "React Guide", "https://react.dev");
  const hash2 = computeContentHash("Knowledge content about React", "React Guide", "https://react.dev");
  assert.strictEqual(hash1, hash2, 'Identical content must produce identical SHA-256 hash');

  const hash3 = computeContentHash("Updated knowledge content about React 19", "React Guide", "https://react.dev");
  assert.notStrictEqual(hash1, hash3, 'Modified content must produce a different hash');
});

test('RAG Retrieval: formatRetrievedContext formats sources with provenance headers', async () => {
  const chunks = await retrieveKnowledgeChunks({
    targetRole: 'Backend Developer',
    limit: 2,
  });

  const formatted = formatRetrievedContext(chunks);
  assert.ok(formatted.includes('[SOURCE 1:'), 'Formatted context must include source numbering');
  assert.ok(formatted.includes('URL:'), 'Formatted context must include provenance URL');
  assert.ok(formatted.includes('Content:'), 'Formatted context must include content');
});

// ---------------------------------------------------------------------------
// 2. Citation Verification Tests
// ---------------------------------------------------------------------------

test('Citations: Valid citations matching retrieved chunks are accepted', async () => {
  const chunks = await retrieveKnowledgeChunks({
    targetRole: 'Frontend Developer',
    limit: 3,
  });

  const validChunkId = chunks[0].chunkId;
  const result = verifyCitations([validChunkId], chunks);

  assert.strictEqual(result.valid, true, 'Citation matching retrieved chunk must be valid');
  assert.strictEqual(result.validCitations.length, 1);
  assert.strictEqual(result.hallucinatedCitations.length, 0);
  assert.strictEqual(result.resolvedSources[0].chunkId, validChunkId);
});

test('Citations: Hallucinated citations not in retrieved chunks are flagged and rejected', async () => {
  const chunks = await retrieveKnowledgeChunks({
    targetRole: 'Frontend Developer',
    limit: 2,
  });

  const fakeId = 'fabricated-chunk-id-999';
  const result = verifyCitations([fakeId], chunks);

  assert.strictEqual(result.valid, false, 'Fabricated citation must be flagged invalid');
  assert.strictEqual(result.hallucinatedCitations.includes(fakeId), true);
  assert.strictEqual(result.validCitations.length, 0);
});

// ---------------------------------------------------------------------------
// 3. Evidence-Backed Skill Gap Tests
// ---------------------------------------------------------------------------

test('Skill Gap: Accepts evidence-backed schema with confidence and prerequisites', () => {
  const validData = {
    missingSkills: [
      {
        name: "Docker",
        priority: "High",
        reason: "Required for containerizing full stack applications",
        resources: ["https://docs.docker.com"],
        candidateEvidence: "No containerization tools detected in resume",
        confidence: "Not Found In Profile",
        suggestedPractice: "Dockerize a Next.js app with multi-stage build",
        prerequisites: ["Linux Basics"],
        citationChunkId: "comp-devops-core",
      },
    ],
  };

  const validation = validateAIOutput(SkillGapGeminiResponseSchema, validData);
  assert.strictEqual(validation.success, true);
});

test('Skill Gap: Rejects invalid confidence enum value', () => {
  const invalidData = {
    missingSkills: [
      {
        name: "Docker",
        priority: "High",
        reason: "Containerization",
        resources: [],
        confidence: "InvalidConfidenceValue",
      },
    ],
  };

  const validation = validateAIOutput(SkillGapGeminiResponseSchema, invalidData);
  assert.strictEqual(validation.success, false);
});

// ---------------------------------------------------------------------------
// 4. Interview Assessment & Adaptive Progression Tests
// ---------------------------------------------------------------------------

test('Interview Scoring: Component weights sum to 1', () => {
  const sum = Object.values(INTERVIEW_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.strictEqual(Math.abs(sum - 1) < 0.001, true, 'Interview weights must sum to 1');
});

test('Interview Scoring: Calculates deterministic final score from dimensions', () => {
  const components = {
    correctnessScore: 90, // 0.40 * 90 = 36
    reasoningScore: 80,   // 0.25 * 80 = 20
    clarityScore: 85,     // 0.20 * 85 = 17
    coverageScore: 70,    // 0.15 * 70 = 10.5
  };                      // Sum = 83.5 -> round to 84

  const score1 = calculateInterviewScore(components);
  const score2 = calculateInterviewScore(components);

  assert.strictEqual(score1, 84);
  assert.strictEqual(score1, score2, 'Identical assessment inputs must produce identical score');
});

test('Interview Scoring: Clamps scores between 0 and 100', () => {
  assert.strictEqual(
    calculateInterviewScore({
      correctnessScore: 150,
      reasoningScore: 120,
      clarityScore: 100,
      coverageScore: 100,
    }),
    100
  );

  assert.strictEqual(
    calculateInterviewScore({
      correctnessScore: -20,
      reasoningScore: 0,
      clarityScore: 0,
      coverageScore: 0,
    }),
    0
  );
});

test('Interview Adaptation: High scores (>= 80) advance difficulty', () => {
  const easyResult = getAdaptiveDifficulty('easy', 85);
  assert.strictEqual(easyResult.nextDifficulty, 'medium');
  assert.strictEqual(easyResult.action, 'advance');

  const medResult = getAdaptiveDifficulty('medium', 90);
  assert.strictEqual(medResult.nextDifficulty, 'hard');
  assert.strictEqual(medResult.action, 'advance');

  const hardResult = getAdaptiveDifficulty('hard', 88);
  assert.strictEqual(hardResult.nextDifficulty, 'hard');
  assert.strictEqual(hardResult.action, 'maintain');
});

test('Interview Adaptation: Low scores (< 55) reinforce fundamentals', () => {
  const hardResult = getAdaptiveDifficulty('hard', 45);
  assert.strictEqual(hardResult.nextDifficulty, 'medium');
  assert.strictEqual(hardResult.action, 'reinforce');

  const medResult = getAdaptiveDifficulty('medium', 40);
  assert.strictEqual(medResult.nextDifficulty, 'easy');
  assert.strictEqual(medResult.action, 'reinforce');
});

test('Interview Validation: Validates structured assessment schema', () => {
  const validAssessment = {
    correctnessScore: 88,
    reasoningScore: 82,
    clarityScore: 85,
    coverageScore: 75,
    feedback: "Strong technical answer with clear understanding of React hooks and reconciliation.",
    strengths: ["Clear differentiation between useState and useRef", "Accurate discussion of re-renders"],
    improvements: ["Could mention dependency array pitfalls in useEffect"],
    sampleBetterAnswer: "Exemplary answer detailing virtual DOM diffing...",
  };

  const validation = validateAIOutput(
    InterviewEvaluationGeminiResponseSchema,
    validAssessment
  );
  assert.strictEqual(validation.success, true);
});

test('Interview Validation: Rejects out-of-range assessment scores', () => {
  const invalidAssessment = {
    correctnessScore: 110, // out of range
    reasoningScore: 80,
    clarityScore: 80,
    coverageScore: 80,
    feedback: "Good",
    strengths: [],
    improvements: [],
  };

  const validation = validateAIOutput(
    InterviewEvaluationGeminiResponseSchema,
    invalidAssessment
  );
  assert.strictEqual(validation.success, false);
});

test('Rubrics: Interview rubric version is defined and tracked', () => {
  assert.ok(INTERVIEW_RUBRIC_VERSION);
  assert.strictEqual(typeof INTERVIEW_RUBRIC_VERSION, 'string');
});
