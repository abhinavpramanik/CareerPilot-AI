export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { CareerReport } from "@/models/CareerReport";
import { SkillGap } from "@/models/SkillGap";
import { Roadmap } from "@/models/Roadmap";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { callGemini } from "@/lib/gemini";
import { roadmapPrompt } from "@/lib/prompts/roadmap";
import { RoadmapResult, ResumeProfile } from "@/types";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";

import { retrieveKnowledgeChunks, formatRetrievedContext } from "@/lib/knowledge/retrieval";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetRole } = await req.json().catch(() => ({}));
    if (!targetRole) {
      return NextResponse.json({ error: "Target role is required" }, { status: 400 });
    }

    await connectDB();

    const skillGapRecord = await SkillGap.findOne({ userId: session.user.id, targetRole }).sort({
      generatedAt: -1,
    });

    const resume = await ResumeAnalysis.findOne({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    const missingSkills = skillGapRecord ? skillGapRecord.missingSkills : [];
    
    let profile: ResumeProfile | null = null;
    if (resume) {
      profile = {
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects,
        experience: resume.experience,
        achievements: resume.achievements,
        technologies: resume.technologies,
        certifications: resume.certifications,
      };
    }

    // Retrieve curated prerequisite knowledge and resources
    const retrievedChunks = await retrieveKnowledgeChunks({
      targetRole,
      skills: profile?.skills || [],
      contentTypes: ["skill_prerequisite", "role_competency", "learning_resource"],
      limit: 4,
    });
    const retrievedEvidence = formatRetrievedContext(retrievedChunks);

    const prompt = roadmapPrompt(targetRole, missingSkills, profile, retrievedEvidence);

    const schema = z.object({
      weeks: z.array(z.object({
        week: z.number(),
        targetSkill: z.string().optional(),
        topics: z.array(z.string()),
        deliverables: z.array(z.string()),
        prerequisites: z.array(z.string()).optional(),
        resources: z.array(z.string()).optional(),
        estimatedHours: z.number(),
      })),
    });

    const result = await streamObject({
      model: google("gemini-flash-lite-latest"),
      schema,
      prompt,
      onFinish: async ({ object }) => {
        if (object?.weeks) {
          try {
            await Roadmap.create({
              userId: session.user.id,
              targetRole,
              weeks: object.weeks,
            });
          } catch (e) {
            console.error("Error saving streamed roadmap:", e);
          }
        }
      },
    });

    return result.toTextStreamResponse();
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await connectDB();
    await Roadmap.findOneAndDelete({ _id: id, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    return NextResponse.json({ error: "Failed to delete roadmap data" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, weekNumber, completed } = await req.json();
    if (!id || weekNumber === undefined) {
      return NextResponse.json(
        { error: "id and weekNumber are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const roadmap = await Roadmap.findOne({ _id: id, userId: session.user.id });
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    const weekItem = roadmap.weeks.find((w: any) => w.week === weekNumber);
    if (weekItem) {
      weekItem.completed = Boolean(completed);
      await roadmap.save();
    }

    return NextResponse.json({ success: true, data: roadmap });
  } catch (error) {
    console.error("Error updating roadmap step:", error);
    return NextResponse.json(
      { error: "Failed to update roadmap step" },
      { status: 500 }
    );
  }
}
