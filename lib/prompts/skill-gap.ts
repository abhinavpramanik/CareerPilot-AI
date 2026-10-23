import { ResumeProfile } from "@/types";

export const skillGapPrompt = (
  profile: ResumeProfile,
  targetRole: string,
  retrievedEvidence?: string
): string => `
You are a technical career advisor helping a student identify skill gaps.

The student wants to become a: ${targetRole}

Analyze their current profile and identify the skills they are MISSING for this role.

RULES:
- Only list skills that are genuinely missing or insufficiently evidenced in their profile.
- Focus on industry-relevant, commonly required skills for the target role.
- Explain clearly why each skill matters for the role.
- Set priority as "High", "Medium", or "Low" based on role criticality and prerequisite order.
- Set confidence: "Not Found In Profile" (if not in resume; do not phrase as proof of inability), "Mentioned Without Evidence" (if listed in skills but not demonstrated in projects/experience), or "Unassessed".
- Suggest 2-3 free official docs or courses.
- Suggest a concrete practice project or task.
- List any known prerequisites for the skill.
${retrievedEvidence ? `- When referencing facts from the retrieved knowledge base, include the exact chunkId in "citationChunkId". Do NOT invent or hallucinate source IDs.` : ""}

${retrievedEvidence ? `CURATED KNOWLEDGE BASE EVIDENCE:\n${retrievedEvidence}\n` : ""}
CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

REQUIRED JSON SCHEMA:
{
  "missingSkills": [
    {
      "name": "",
      "priority": "High",
      "reason": "",
      "resources": [],
      "candidateEvidence": "",
      "knowledgeBaseEvidence": "",
      "confidence": "Not Found In Profile",
      "suggestedPractice": "",
      "prerequisites": [],
      "citationChunkId": ""
    }
  ]
}

Return ONLY the JSON object.
`;
