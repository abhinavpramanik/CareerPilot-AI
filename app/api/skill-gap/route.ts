export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { SkillGap } from "@/models/SkillGap";
import { CareerReport } from "@/models/CareerReport";
import { callGemini } from "@/lib/gemini";
import { skillGapPrompt } from "@/lib/prompts/skill-gap";
import { SkillGapResult, ResumeProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetRole } = await req.json();
    if (!targetRole) {
      return NextResponse.json({ error: "Target role is required" }, { status: 400 });
    }

    await connectDB();

    const resume = await ResumeAnalysis.findOne({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Please upload your resume first" },
        { status: 400 }
      );
    }

    const profile: ResumeProfile = {
      education: resume.education,
      skills: resume.skills,
      projects: resume.projects,
      experience: resume.experience,
      achievements: resume.achievements,
      technologies: resume.technologies,
      certifications: resume.certifications,
    };

    const prompt = skillGapPrompt(profile, targetRole);
    const result = (await callGemini(prompt)) as SkillGapResult;

    // Update career report targetRole for consistency in other features
    await CareerReport.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { targetRole } },
      { upsert: true }
    );

    // Save as a new SkillGap record for history
    const skillGapRecord = await SkillGap.create({
      userId: session.user.id,
      targetRole,
      missingSkills: result.missingSkills,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Skill gap error:", error);
    return NextResponse.json(
      { error: "Failed to analyze skill gaps. Please try again." },
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
    
    // Fetch all historical skill gaps sorted by newest first
    const history = await SkillGap.find({ userId: session.user.id }).sort({
      generatedAt: -1,
    });

    return NextResponse.json({ data: history });
  } catch (error) {
    console.error("Error fetching skill gap:", error);
    return NextResponse.json({ error: "Failed to fetch skill gap data" }, { status: 500 });
  }
}
