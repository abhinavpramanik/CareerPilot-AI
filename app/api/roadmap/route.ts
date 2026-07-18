export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { CareerReport } from "@/models/CareerReport";
import { Roadmap } from "@/models/Roadmap";
import { callGemini } from "@/lib/gemini";
import { roadmapPrompt } from "@/lib/prompts/roadmap";
import { RoadmapResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    await connectDB();

    const report = await CareerReport.findOne({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    if (!report?.skillGap?.length) {
      return NextResponse.json(
        { error: "Please complete Skill Gap analysis first" },
        { status: 400 }
      );
    }

    const targetRole = body.targetRole || report.targetRole || "Software Developer";
    const prompt = roadmapPrompt(targetRole, report.skillGap);
    const result = (await callGemini(prompt)) as RoadmapResult;

    const roadmap = await Roadmap.create({
      userId: session.user.id,
      targetRole,
      weeks: result.weeks,
    });

    return NextResponse.json({ success: true, data: roadmap });
  } catch (error) {
    console.error("Roadmap error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap. Please try again." },
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
    
    // Fetch all historical roadmaps sorted by newest first
    const roadmaps = await Roadmap.find({ userId: session.user.id }).sort({
      generatedAt: -1,
    });

    return NextResponse.json({ data: roadmaps });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}
