import { ResumeProfile } from "@/types";

export const skillGapPrompt = (
  profile: ResumeProfile,
  targetRole: string
): string => `
You are a technical career advisor helping a student identify skill gaps.

The student wants to become a: ${targetRole}

Analyze their current profile and identify the skills they are MISSING for this role.

RULES:
- Only list skills that are genuinely missing from their profile.
- Focus on industry-relevant, commonly required skills for the target role.
- Explain clearly why each skill matters for the role.
- Set priority as "High", "Medium", or "Low" based on how critical the skill is.
- Suggest 2-3 free or popular learning resources per skill (course names, official docs, etc.).
- Do NOT list skills they already have.

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

REQUIRED JSON SCHEMA:
{
  "missingSkills": [
    {
      "name": "",
      "priority": "High",
      "reason": "",
      "resources": []
    }
  ]
}

Return ONLY the JSON object.
`;
