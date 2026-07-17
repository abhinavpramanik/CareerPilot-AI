export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { CareerReport } from "@/models/CareerReport";
import { callGemini } from "@/lib/gemini";
import { projectPrompt } from "@/lib/prompts/project";
import { ProjectRecommendationResult, ResumeProfile } from "@/types";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [resume, report] = await Promise.all([
      ResumeAnalysis.findOne({ userId: session.user.id }).sort({ createdAt: -1 }),
      CareerReport.findOne({ userId: session.user.id }).sort({ createdAt: -1 }),
    ]);

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

    const targetRole = report?.targetRole ?? "Software Developer";
    const prompt = projectPrompt(profile, targetRole);
    const result = (await callGemini(prompt)) as ProjectRecommendationResult;

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Project recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to generate project recommendations. Please try again." },
      { status: 500 }
    );
  }
}
