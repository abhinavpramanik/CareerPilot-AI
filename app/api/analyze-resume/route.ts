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

import path from "path";

/**
 * Extract plain text from a PDF buffer using pdfjs-dist (Node.js compatible).
 * We point GlobalWorkerOptions.workerSrc to the bundled worker .mjs file so
 * pdfjs-dist can spawn it as a sub-process — no DOMMatrix / canvas needed.
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { pathToFileURL } = await import("url");
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Convert the absolute worker path to a file:// URL (required on Windows)
  const workerPath = path.resolve(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useWorkerFetch: false,
    useSystemFonts: true,
  });
  const pdfDocument = await loadingTask.promise;

  const textPages: string[] = [];
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    textPages.push(pageText);
  }

  return textPages.join("\n");
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
