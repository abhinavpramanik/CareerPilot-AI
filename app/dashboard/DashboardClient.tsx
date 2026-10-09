"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  CheckSquare,
  Map,
  FileText,
  Brain,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  report: {
    careerScore: number;
    atsScore: number;
    resumeScore: number;
    technicalScore: number;
    projectScore: number;
    strengths: string[];
    weaknesses: string[];
    summary: string;
    targetRole?: string;
  } | null;
  hasResume: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function DashboardClient({ user, report, hasResume }: DashboardClientProps) {
  const firstName = user.name?.split(" ")[0] ?? "there";

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10";
    if (score >= 60) return "text-amber-500 bg-amber-500/10";
    return "text-red-500 bg-red-500/10";
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const stats = report
    ? [
        {
          label: "Career Readiness",
          value: report.careerScore,
          icon: Trophy,
          href: "/career-analysis",
        },
        {
          label: "ATS Match",
          value: report.atsScore,
          icon: CheckSquare,
          href: "/ats-review",
        },
        {
          label: "Resume Impact",
          value: report.resumeScore,
          icon: FileText,
          href: "/resume",
        },
        {
          label: "Technical Depth",
          value: report.technicalScore,
          icon: Brain,
          href: "/career-analysis",
        },
      ]
    : [];

  const quickLinks = [
    { href: "/resume", icon: FileText, label: "Update Resume", desc: "Upload a new version" },
    { href: "/career-analysis", icon: Brain, label: "Career Score", desc: "Detailed breakdown" },
    { href: "/skill-gap", icon: Target, label: "Skill Gaps", desc: "Find missing skills" },
    { href: "/roadmap", icon: Map, label: "Roadmap", desc: "Your weekly plan" },
    { href: "/ats-review", icon: CheckSquare, label: "ATS Review", desc: "Formatting issues" },
    { href: "/interview", icon: Sparkles, label: "Interview Prep", desc: "Practice questions" },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-1">
          <Clock className="h-4 w-4" />
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
          <span className="text-primary">{firstName}</span>.
        </h1>
        {report?.targetRole && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-muted-foreground">Targeting:</span>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {report.targetRole}
            </Badge>
          </div>
        )}
      </motion.div>

      {/* No Resume CTA */}
      {!hasResume && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-card border border-primary/20 shadow-lg shadow-primary/5 p-8"
        >
          <div className="relative z-10 max-w-xl">
            <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-2.5">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-foreground">
              Unlock your career intelligence
            </h2>
            <p className="mb-8 text-muted-foreground leading-relaxed">
              Upload your resume to get instant feedback on your ATS compatibility, skill gaps, and a personalized roadmap to your target role.
            </p>
            <Link href="/resume">
              <Button size="lg" className="bg-primary text-primary-foreground font-medium px-6 hover:bg-primary/90">
                Upload Resume
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      {report && stats.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Core Metrics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href={stat.href}>
                  <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getScoreColor(stat.value)}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</span>
                        <span className="text-sm font-medium text-muted-foreground ml-1">/100</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">{stat.label}</p>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${getScoreProgressColor(stat.value)}`} style={{ width: `${stat.value}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary and Action Items */}
      {report?.summary && (
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">AI Career Overview</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
            
            {(report.strengths?.length > 0 || report.weaknesses?.length > 0) && (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 pt-2">
                {report.strengths?.length > 0 && (
                  <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 p-4 border border-emerald-100 dark:border-emerald-900/30">
                    <p className="mb-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Key Strengths</p>
                    <ul className="space-y-2">
                      {report.strengths.slice(0, 3).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span className="leading-snug">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.weaknesses?.length > 0 && (
                  <div className="rounded-lg bg-amber-50/50 dark:bg-amber-950/10 p-4 border border-amber-100 dark:border-amber-900/30">
                    <p className="mb-3 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Growth Areas</p>
                    <ul className="space-y-2">
                      {report.weaknesses.slice(0, 3).map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <span className="leading-snug">{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-xl border border-border bg-card shadow-sm flex flex-col"
          >
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Tools & Actions
              </h3>
            </div>
            <div className="p-3 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-1">
                {quickLinks.map((link, i) => (
                  <Link key={link.href} href={link.href}>
                    <div className="group flex items-center justify-between rounded-lg p-2.5 hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background border border-border">
                          <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{link.label}</p>
                          <p className="text-xs text-muted-foreground">{link.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
