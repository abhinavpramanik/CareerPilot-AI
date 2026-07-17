import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are CareerPilot AI, an expert career mentor for students and fresh graduates.
Your role is to:
- Analyze resumes objectively.
- Recommend realistic improvements.
- Never invent skills or experience.
- Explain recommendations clearly.
- Return ONLY valid JSON matching the requested schema with no markdown code fences, no extra text.`;

export async function callGemini(userPrompt: string): Promise<unknown> {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-lite-latest",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  let attempt = 0;
  const maxAttempts = 2;

  while (attempt < maxAttempts) {
    try {
      const result = await model.generateContent(userPrompt);
      const text = result.response.text().trim();

      // Strip markdown code fences if present
      const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (error: any) {
      attempt++;
      
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many Requests');

      if (attempt >= maxAttempts) {
        console.error("Gemini call failed after retries:", error);
        if (isRateLimit) {
          throw new Error("Google Gemini AI rate limit exceeded (Too Many Requests). Please wait a minute and try again.");
        }
        throw new Error("AI response failed. Please try again.");
      }
      
      // Wait longer before retry if rate limited
      const delay = isRateLimit ? 5000 : 1500;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
