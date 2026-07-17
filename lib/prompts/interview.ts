import { ResumeProfile } from "@/types";

export const technicalInterviewPrompt = (
  profile: ResumeProfile,
  role: string,
  difficulty: string
): string => `
You are a senior technical interviewer at a top tech company.

Generate 8 technical interview questions for:
- TARGET ROLE: ${role}
- DIFFICULTY: ${difficulty}

Use the candidate's resume to personalize questions where relevant.

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

RULES:
- Questions should be role-specific and difficulty-appropriate.
- Include a mix of conceptual and practical questions.
- At least 2 questions should reference the candidate's own projects.
- expectedAnswer should be comprehensive but concise.
- keyConcepts should list 2-4 key ideas the answer should cover.
- followUps should be 1-2 deeper follow-up questions.

REQUIRED JSON SCHEMA:
{
  "questions": [
    {
      "question": "",
      "expectedAnswer": "",
      "keyConcepts": [],
      "followUps": []
    }
  ]
}

Return ONLY the JSON object.
`;

export const hrInterviewPrompt = (
  profile: ResumeProfile,
  role: string,
  difficulty: string
): string => `
You are an experienced HR interviewer.

Generate 8 behavioral and HR interview questions for:
- TARGET ROLE: ${role}
- DIFFICULTY: ${difficulty}

Use the candidate's resume to personalize questions.

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

RULES:
- Use the STAR method (Situation, Task, Action, Result) as the basis.
- Include a mix of behavioral, motivational, and situational questions.
- personalizationTip should reference something specific from their resume.
- sampleAnswer should be a 3-4 sentence STAR-based example.
- starGuidance should describe specifically how to answer using STAR for that question.

REQUIRED JSON SCHEMA:
{
  "questions": [
    {
      "question": "",
      "sampleAnswer": "",
      "starGuidance": "",
      "personalizationTip": ""
    }
  ]
}

Return ONLY the JSON object.
`;
