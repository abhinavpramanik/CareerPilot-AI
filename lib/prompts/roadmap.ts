import { MissingSkill, ResumeProfile } from "@/types";

export const roadmapPrompt = (
  targetRole: string,
  missingSkills: MissingSkill[],
  profile: ResumeProfile | null
): string => `
You are a career mentor creating a personalized 6-week learning roadmap.

TARGET ROLE: ${targetRole}

${profile ? `USER'S CURRENT RESUME/PROFILE:\n${JSON.stringify(profile, null, 2)}\n` : ""}
SKILLS TO LEARN (Missing Skills):
${JSON.stringify(missingSkills, null, 2)}

Create a 6-week progressive learning plan. Each week should build on the previous.

RULES:
- CRITICAL: DO NOT include topics or foundational skills the user already knows (based on their CURRENT RESUME/PROFILE). 
- If they already know basic skills (e.g., HTML/CSS/JS), skip them entirely and start the roadmap from advanced topics or their missing skills.
- Start with the most important missing foundational skills in Week 1, advance progressively.
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
