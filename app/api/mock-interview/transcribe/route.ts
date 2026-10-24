export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const TRANSCRIPTION_PROMPT = `You are an expert audio transcription system for professional interviews.

TASK:
1. Accurately transcribe the spoken answer from the audio into clear, grammatically sound text.
2. REMOVE ALL VERBAL FILLER WORDS, empty repetitions, and nervous verbal tics:
   - Remove "um", "uh", "er", "ah", "like", "you know", "basically", "so yeah", "actually", "I mean", "sort of", "kind of" (when used as filler).
   - Clean up stuttered repetitions (e.g. "we we we can use" -> "we can use").
   - Eliminate throat clearing and background noise artifacts.
3. PRESERVE TECHNICAL FIDELITY & EXACT KNOWLEDGE:
   - Keep all technical terms, algorithms, frameworks, tools, architectural patterns, and candidate reasoning completely intact.
   - Do NOT rewrite, invent, summarize, or enhance the candidate's actual answer content.
   - Punctuate properly into standard sentences and paragraphs.
4. OUTPUT FORMAT:
   - Output ONLY the clean transcribed response text.
   - Do NOT output preamble, markdown formatting code blocks, or conversational commentary.
   - If the audio contains no recognizable speech, respond with an empty string.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");

    // Clean up mimeType (strip codecs parameter if present for Gemini API compatibility)
    const rawMimeType = audioFile.type || "audio/webm";
    const mimeType = rawMimeType.split(";")[0].trim() || "audio/webm";

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
    });

    let attempt = 0;
    const maxAttempts = 2;
    let transcribedText = "";

    while (attempt < maxAttempts) {
      try {
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType,
              data: base64Audio,
            },
          },
          { text: TRANSCRIPTION_PROMPT },
        ]);

        transcribedText = result.response.text().trim();
        break;
      } catch (err: any) {
        attempt++;
        const isRateLimit =
          err?.status === 429 ||
          err?.message?.includes("429") ||
          err?.message?.includes("Too Many Requests");

        if (attempt >= maxAttempts) {
          throw err;
        }

        const delay = isRateLimit ? 3000 : 1200;
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    // If Gemini responded with empty string or "[SILENT]", return empty text
    if (transcribedText.toLowerCase().includes("[silent]") || transcribedText.toLowerCase() === "silent") {
      transcribedText = "";
    }

    return NextResponse.json({
      success: true,
      text: transcribedText,
    });
  } catch (error: any) {
    console.error("POST /api/mock-interview/transcribe error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to transcribe audio. Please try again." },
      { status: 500 }
    );
  }
}
