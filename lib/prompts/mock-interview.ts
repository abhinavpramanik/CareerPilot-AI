/**
 * Prompts for the Mock Interview feature.
 * Question generation produces 5 questions with hidden expected answers.
 * Evaluation scores all student answers at once and returns a full session report.
 */

// ─── Question Generation ──────────────────────────────────────────────────────

export const mockInterviewGeneratePrompt = (
  role: string,
  interviewType: "technical" | "hr",
  difficulty: "easy" | "medium" | "hard"
): string => `
You are a senior interviewer conducting a ${interviewType === "technical" ? "technical" : "behavioral / HR"} interview.

Generate exactly 5 interview questions for:
- TARGET ROLE: ${role}
- DIFFICULTY: ${difficulty}
- TYPE: ${interviewType}

RULES:
- Questions must be role-specific and difficulty-appropriate.
- Each question must have a comprehensive expectedAnswer that a strong candidate would give.
- keyConcepts: 2–4 key ideas an ideal answer must cover.
${
  interviewType === "technical"
    ? "- Include a mix of conceptual, problem-solving, and system-design questions."
    : "- Use the STAR method (Situation, Task, Action, Result). Include behavioral and motivational questions."
}
- Do NOT reveal expectedAnswer to the candidate — it is used only for evaluation.

REQUIRED JSON SCHEMA (return ONLY this JSON object):
{
  "questions": [
    {
      "question": "<the interview question>",
      "expectedAnswer": "<comprehensive model answer>",
      "keyConcepts": ["<concept1>", "<concept2>"]
    }
  ]
}
`;

// ─── Batch Evaluation ────────────────────────────────────────────────────────

export interface EvaluationQuestion {
  question: string;
  expectedAnswer: string;
  keyConcepts: string[];
  userAnswer: string;
}

export const mockInterviewEvaluatePrompt = (
  role: string,
  interviewType: "technical" | "hr",
  difficulty: "easy" | "medium" | "hard",
  questions: EvaluationQuestion[]
): string => `
You are a professional ${interviewType === "technical" ? "technical" : "HR"} interviewer evaluating a mock interview for a ${role} position (difficulty: ${difficulty}).

Evaluate EACH of the following ${questions.length} question-answer pairs using a 4-dimension rubric:
1. Correctness (40%) – factual accuracy / correct claim
2. Reasoning Depth (25%) – explanation quality, tradeoffs, "why"
3. Clarity (20%) – clear, structured, easy to follow
4. Coverage (15%) – how many key concepts were addressed

QUESTIONS AND ANSWERS:
${questions
  .map(
    (q, i) => `
--- Question ${i + 1} ---
Question: ${q.question}
Expected Answer: ${q.expectedAnswer}
Key Concepts: ${q.keyConcepts.join(", ")}
Candidate's Answer: ${q.userAnswer || "(No answer provided)"}
`
  )
  .join("\n")}

After scoring each question, generate an OVERALL session report that synthesises all answers.

REQUIRED JSON SCHEMA (return ONLY this JSON object, no markdown):
{
  "questionEvaluations": [
    {
      "score": <0-100 weighted composite>,
      "correctnessScore": <0-100>,
      "reasoningScore": <0-100>,
      "clarityScore": <0-100>,
      "coverageScore": <0-100>,
      "feedback": "<2-3 sentence summary of this answer>",
      "strengths": ["<strength1>", "<strength2>"],
      "improvements": ["<improvement1>", "<improvement2>"]
    }
  ],
  "overallReport": {
    "overallScore": <0-100 weighted average across all questions>,
    "dimensionScores": {
      "correctness": <0-100 average>,
      "reasoning": <0-100 average>,
      "clarity": <0-100 average>,
      "coverage": <0-100 average>
    },
    "overallSummary": "<3-4 sentence executive summary of overall performance>",
    "strengths": ["<cross-cutting strength1>", "<strength2>", "<strength3>"],
    "weaknesses": ["<cross-cutting weakness1>", "<weakness2>"],
    "pointsToImprove": ["<actionable improvement1>", "<improvement2>", "<improvement3>"]
  }
}
`;
