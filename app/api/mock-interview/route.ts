export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { MockInterview } from "@/models/MockInterview";

/**
 * GET /api/mock-interview — fetch user's completed mock interview history
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const records = await MockInterview.find({
      userId: session.user.id,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .limit(20);

    return NextResponse.json({ data: records });
  } catch (error) {
    console.error("GET /api/mock-interview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mock interview history" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mock-interview — delete a completed mock interview record
 * Body: { id }
 */
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
    await MockInterview.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/mock-interview error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
