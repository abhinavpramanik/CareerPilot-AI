import { ResumeProfile } from "@/types";

export const projectPrompt = (
  profile: ResumeProfile,
  targetRole: string
): string => `
You are a mentor recommending portfolio projects to a student.

TARGET ROLE: ${targetRole}

CANDIDATE PROFILE (existing skills and projects):
${JSON.stringify(profile, null, 2)}

Recommend 6 personalized project ideas that:
- Align with the target role requirements.
- Use the candidate's existing skills OR introduce high-priority new skills.
- Vary in difficulty (2 Beginner, 2 Intermediate, 2 Advanced).
- Are achievable and portfolio-worthy.

REQUIRED JSON SCHEMA:
{
  "projects": [
    {
      "title": "",
      "difficulty": "Beginner",
      "techStack": [],
      "learningOutcome": "",
      "estimatedWeeks": 2
    }
  ]
}

Return ONLY the JSON object.
`;
