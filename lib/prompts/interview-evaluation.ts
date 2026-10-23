export const interviewEvaluationPrompt = (params: {
  question: string;
  userAnswer: string;
  role: string;
  interviewType: "technical" | "hr";
  expectedCriteria?: string;
  retrievedRubric?: string;
}): string => {
  const { question, userAnswer, role, interviewType, expectedCriteria, retrievedRubric } = params;

  return `
You are an expert technical interviewer and career assessment evaluator.
Evaluate the candidate's answer for the following ${interviewType} interview question for a "${role}" position.

QUESTION:
${question}

${expectedCriteria ? `EXPECTED ANSWER CRITERIA / KEY CONCEPTS:\n${expectedCriteria}\n` : ""}
${retrievedRubric ? `EVALUATION RUBRIC GUIDANCE:\n${retrievedRubric}\n` : ""}

CANDIDATE'S ANSWER:
${userAnswer}

EVALUATION RULES:
1. Score each dimension objectively from 0 to 100:
   - correctnessScore: Accuracy of technical claims, avoidance of falsehoods, addressing the core question.
   - reasoningScore: Depth of explanation, understanding of 'why', discussion of tradeoffs or mechanics.
   - clarityScore: Clear communication, professional terminology, concise structure.
   - coverageScore: Breadth of the response (e.g. edge cases, scalability, error handling, or STAR structure).
2. If the answer is completely missing, blank, or irrelevant, assign appropriately low scores (< 30).
3. If the answer is sound and accurate with good depth, award scores >= 80.
4. Provide constructive feedback, specific strengths, actionable improvements, and a high-caliber sample better answer.

REQUIRED JSON SCHEMA:
{
  "correctnessScore": 85,
  "reasoningScore": 80,
  "clarityScore": 90,
  "coverageScore": 75,
  "feedback": "Concise overview of performance and key takeaways.",
  "strengths": ["Clear explanation of...", "Accurate distinction between..."],
  "improvements": ["Could explicitly mention edge case of...", "Discuss time complexity..."],
  "sampleBetterAnswer": "An exemplary high-caliber answer illustrating the ideal response."
}

Return ONLY the JSON object.
`;
};
