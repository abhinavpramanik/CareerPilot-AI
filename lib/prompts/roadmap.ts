import { MissingSkill, ResumeProfile } from "@/types";

export const roadmapPrompt = (
  targetRole: string,
  missingSkills: MissingSkill[],
  profile: ResumeProfile | null,
  retrievedEvidence?: string
): string => `
You are a career mentor creating a personalized 6-week learning roadmap.

TARGET ROLE: ${targetRole}

${profile ? `USER'S CURRENT RESUME/PROFILE:\n${JSON.stringify(profile, null, 2)}\n` : ""}
SKILLS TO LEARN (Missing Skills):
${JSON.stringify(missingSkills, null, 2)}

${retrievedEvidence ? `CURATED PREREQUISITE & RESOURCE KNOWLEDGE BASE:\n${retrievedEvidence}\n` : ""}

Create a 6-week progressive learning plan respecting strict prerequisite order. Each week must logically build on preceding weeks.

RULES:
- CRITICAL: DO NOT include topics or foundational skills the user already demonstrates in their profile.
- Strictly respect prerequisite order: foundational missing concepts must precede advanced frameworks and deployment.
- Trace each week to a specific 'targetSkill'.
- Include specific, actionable topics (e.g., 'TypeScript Generics & Utility Types' rather than 'Learn TypeScript').
- Deliverables must be concrete outcomes or practice mini-projects (e.g., 'Implement JWT authentication with refresh tokens').
- Attach 1-2 curated documentation/tutorial links in 'resources' for each week.
- estimatedHours should be realistic (10-20 hours/week).

REQUIRED JSON SCHEMA:
{
  "weeks": [
    {
      "week": 1,
      "targetSkill": "",
      "topics": [],
      "deliverables": [],
      "prerequisites": [],
      "resources": [],
      "estimatedHours": 12
    }
  ]
}

Return ONLY the JSON object.
`;
