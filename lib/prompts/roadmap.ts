import { MissingSkill } from "@/types";

export const roadmapPrompt = (
  targetRole: string,
  missingSkills: MissingSkill[]
): string => `
You are a career mentor creating a personalized 6-week learning roadmap.

TARGET ROLE: ${targetRole}

SKILLS TO LEARN:
${JSON.stringify(missingSkills, null, 2)}

Create a 6-week progressive learning plan. Each week should build on the previous.

RULES:
- Start with foundational skills in Week 1, advance progressively.
- Include specific, actionable topics (not vague like "learn JavaScript").
- Deliverables should be concrete outputs (e.g., "Build a REST API with Express").
- estimatedHours should be realistic (10-20 hours/week for a student).
- Cover all high-priority missing skills first.

REQUIRED JSON SCHEMA:
{
  "weeks": [
    {
      "week": 1,
      "topics": [],
      "deliverables": [],
      "estimatedHours": 12
    }
  ]
}

Return ONLY the JSON object.
`;
