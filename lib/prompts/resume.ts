export const resumePrompt = (resumeText: string): string => `
Analyze the following resume and extract all information into a structured JSON object.

RULES:
- Do NOT hallucinate or invent information not present in the resume.
- Preserve the original information as-is.
- Normalize technology names (e.g., "reactjs" → "React").
- If a field has no data, return an empty array [].

REQUIRED JSON SCHEMA:
{
  "education": [
    { "institution": "", "degree": "", "field": "", "year": "", "gpa": "" }
  ],
  "skills": [],
  "projects": [
    { "name": "", "description": "", "technologies": [], "link": "" }
  ],
  "experience": [
    { "company": "", "role": "", "duration": "", "description": "" }
  ],
  "achievements": [],
  "technologies": [],
  "certifications": []
}

RESUME TEXT:
${resumeText}

Return ONLY the JSON object, no markdown, no explanation.
`;
