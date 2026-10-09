export const atsPrompt = (resumeText: string): string => `
You are an ATS (Applicant Tracking System) expert evaluating a resume.

Analyze the resume and evaluate it from an ATS perspective.

RULES:
- keywordCoverageScore: Score from 0-100 based on keyword match for target roles.
- sectionsCompletenessScore: Score from 0-100 based on having necessary sections.
- structureParsingScore: Score from 0-100 based on formatting/parsing quality for an ATS.
- skillsRelevanceScore: Score from 0-100 based on relevance of skills.
- achievementImpactScore: Score from 0-100 based on quantifiable achievements.
- keywordIssues: Provide exactly 3-5 important keywords missing from the resume. You MUST provide them.
- formattingIssues: Provide any formatting problems found (e.g., tables, columns, special characters, bad headers). If none, state "No major formatting issues detected, but keep it simple."
- bulletSuggestions: Provide exactly 3-5 pairs of original weak bullets from the resume and improved versions with action verbs and metrics. You MUST provide at least 3.
- overallSuggestions: Provide exactly 3-5 actionable suggestions to improve the resume for ATS parsing and human readability.

RESUME TEXT:
${resumeText}

REQUIRED JSON SCHEMA:
{
  "keywordCoverageScore": 0,
  "sectionsCompletenessScore": 0,
  "structureParsingScore": 0,
  "skillsRelevanceScore": 0,
  "achievementImpactScore": 0,
  "keywordIssues": [],
  "formattingIssues": [],
  "bulletSuggestions": [
    { "original": "", "improved": "" }
  ],
  "overallSuggestions": []
}

Return ONLY the JSON object.
`;
