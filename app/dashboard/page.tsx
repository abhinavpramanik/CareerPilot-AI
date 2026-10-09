import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { CareerReport } from "@/models/CareerReport";
import { ResumeAnalysis } from "@/models/ResumeAnalysis";
import { User } from "@/models/User";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await connectDB();

  const [report, resume, user] = await Promise.all([
    CareerReport.findOne({ userId: session.user.id }).sort({ createdAt: -1 }).lean(),
    ResumeAnalysis.findOne({ userId: session.user.id }).sort({ createdAt: -1 }).lean(),
    User.findById(session.user.id).select("targetRole").lean(),
  ]);

  const reportData = report ? JSON.parse(JSON.stringify(report)) : null;
  if (reportData && user?.targetRole) {
    reportData.targetRole = user.targetRole;
  }

  return (
    <DashboardClient
      user={session.user}
      report={reportData}
      hasResume={!!resume}
    />
  );
}
