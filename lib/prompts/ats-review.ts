export const atsPrompt = (resumeText: string): string => `
You are an ATS (Applicant Tracking System) expert evaluating a resume.

Analyze the resume and evaluate it from an ATS perspective.

RULES:
- atsScore: Score from 0-100 based on ATS compatibility.
- keywordIssues: List of important keywords missing from the resume.
- formattingIssues: List of formatting problems (avoid tables, columns, special characters, etc.).
- bulletSuggestions: Pairs of original weak bullets and improved versions with action verbs and metrics.
- overallSuggestions: 3-5 actionable suggestions to improve the resume.

RESUME TEXT:
${resumeText}

REQUIRED JSON SCHEMA:
{
  "atsScore": 0,
  "keywordIssues": [],
  "formattingIssues": [],
  "bulletSuggestions": [
    { "original": "", "improved": "" }
  ],
  "overallSuggestions": []
}

Return ONLY the JSON object.
`;
