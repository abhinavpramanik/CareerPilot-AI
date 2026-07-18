export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { callGemini } from "@/lib/gemini";
import { resumePrompt } from "@/lib/prompts/resume";
import { ResumeProfile } from "@/types";
// Polyfills for pdfjs-dist in Node.js environments (like Vercel serverless functions)
if (typeof global.DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix {};
}
if (typeof global.Path2D === "undefined") {
  (global as any).Path2D = class Path2D {};
}
if (typeof global.ImageData === "undefined") {
  (global as any).ImageData = class ImageData {};
}

const pdfParse = require("pdf-parse");

/**
 * Extract plain text from a PDF buffer using pdf-parse.
 * This is robust for Node.js environments (like Vercel) and avoids
 * DOMMatrix or canvas dependency errors that newer pdfjs-dist versions throw.
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("Failed to parse PDF:", error);
    throw new Error("Could not extract text from PDF.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    // Extract text
    let rawText = "";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type === "application/pdf") {
      rawText = await extractTextFromPDF(buffer);
    } else {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    }

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from the file. Please ensure the PDF has selectable text (not a scanned image).",
        },
        { status: 400 }
      );
    }

    // Call Gemini to parse
    const prompt = resumePrompt(rawText.trim());
    const parsed = (await callGemini(prompt)) as ResumeProfile;

    // Save to DB
    await connectDB();
    const analysis = await ResumeAnalysis.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        ...parsed,
        rawText: rawText.trim(),
        analyzedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error("Resume analysis error:", error);
    const message = error.message || "Failed to analyze resume. Please try again.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const analysis = await ResumeAnalysis.findOne({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ data: analysis });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}
