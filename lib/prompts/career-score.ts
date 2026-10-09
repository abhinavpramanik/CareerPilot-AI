import { ResumeProfile } from "@/types";

export const careerScorePrompt = (profile: ResumeProfile): string => `
You are evaluating a student's career readiness for tech placement.

Analyze the following candidate profile and generate a career readiness score.

SCORING CRITERIA:
- resumeScore: Quality of resume presentation, structure, clarity (0-100)
- technicalScore: Depth and breadth of technical skills (0-100)
- projectScore: Quality and relevance of projects (0-100)
- experienceScore: Relevance and depth of professional/internship experience (0-100)
- interviewScore: Estimated interview readiness based on experience and projects (0-100)

RULES:
- Base every score on evidence from the profile.
- Do not inflate scores; be realistic.
- Identify 3-5 genuine strengths and 3-5 genuine weaknesses.

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

REQUIRED JSON SCHEMA:
{
  "resumeScore": 0,
  "technicalScore": 0,
  "projectScore": 0,
  "experienceScore": 0,
  "interviewScore": 0,
  "strengths": [],
  "weaknesses": [],
  "summary": ""
}

Return ONLY the JSON object.
`;
