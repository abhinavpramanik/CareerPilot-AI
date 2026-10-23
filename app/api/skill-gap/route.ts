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
import { SkillGapGeminiResponseSchema, validateAIOutput } from "@/lib/validation";
import { retrieveKnowledgeChunks, formatRetrievedContext } from "@/lib/knowledge/retrieval";
import { verifyCitations } from "@/lib/knowledge/citations";

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

    // Retrieve curated knowledge chunks grounded in targetRole and user skills
    const retrievedChunks = await retrieveKnowledgeChunks({
      targetRole,
      skills: profile.skills,
      contentTypes: ["role_competency", "skill_prerequisite", "learning_resource"],
      limit: 4,
    });
    const retrievedEvidence = formatRetrievedContext(retrievedChunks);

    const prompt = skillGapPrompt(profile, targetRole, retrievedEvidence);
    const rawResult = await callGemini(prompt);

    // Validate AI output before persisting
    const validation = validateAIOutput(SkillGapGeminiResponseSchema, rawResult);
    if (!validation.success) {
      return NextResponse.json(
        { error: "AI returned an unexpected response format. Please try again." },
        { status: 500 }
      );
    }

    const result = validation.data;

    // Verify citations against actually retrieved knowledge chunks
    const candidateCitations = result.missingSkills
      .map((s) => s.citationChunkId)
      .filter((c): c is string => Boolean(c));
    const verified = verifyCitations(candidateCitations, retrievedChunks);

    // Strip any hallucinated citation IDs
    const sanitizedMissingSkills = result.missingSkills.map((s) => ({
      ...s,
      citationChunkId:
        s.citationChunkId && verified.validCitations.includes(s.citationChunkId)
          ? s.citationChunkId
          : undefined,
    }));

    // Update career report targetRole for consistency in other features
    await CareerReport.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { targetRole } },
      { upsert: true }
    );

    // Save as a new SkillGap record for history — only after validation
    const skillGapRecord = await SkillGap.create({
      userId: session.user.id,
      targetRole,
      missingSkills: sanitizedMissingSkills,
    });

    return NextResponse.json({
      success: true,
      data: {
        missingSkills: sanitizedMissingSkills,
        retrievedSources: verified.resolvedSources,
      },
    });
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
    await SkillGap.findOneAndDelete({ _id: id, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting skill gap:", error);
    return NextResponse.json({ error: "Failed to delete skill gap data" }, { status: 500 });
  }
}
