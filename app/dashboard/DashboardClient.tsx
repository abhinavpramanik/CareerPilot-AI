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
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function DashboardClient({ user, report, hasResume }: DashboardClientProps) {
  const firstName = user.name?.split(" ")[0] ?? "there";

  const stats = report
    ? [
        {
          label: "Career Score",
          value: report.careerScore,
          icon: Trophy,
          color: "card-mint",
          iconColor: "text-emerald-600",
          href: "/career-analysis",
        },
        {
          label: "ATS Score",
          value: report.atsScore,
          icon: CheckSquare,
          color: "card-sky",
          iconColor: "text-blue-600",
          href: "/ats-review",
        },
        {
          label: "Resume Score",
          value: report.resumeScore,
          icon: FileText,
          color: "card-lavender",
          iconColor: "text-violet-600",
          href: "/resume",
        },
        {
          label: "Technical Score",
          value: report.technicalScore,
          icon: Brain,
          color: "card-yellow",
          iconColor: "text-amber-600",
          href: "/career-analysis",
        },
      ]
    : [];

  const quickLinks = [
    { href: "/resume", icon: FileText, label: "Upload Resume", color: "text-emerald-600", bg: "bg-emerald-50" },
    { href: "/career-analysis", icon: Brain, label: "Career Score", color: "text-violet-600", bg: "bg-violet-50" },
    { href: "/skill-gap", icon: Target, label: "Skill Gap", color: "text-blue-600", bg: "bg-blue-50" },
    { href: "/roadmap", icon: Map, label: "Roadmap", color: "text-amber-600", bg: "bg-amber-50" },
    { href: "/ats-review", icon: CheckSquare, label: "ATS Review", color: "text-teal-600", bg: "bg-teal-50" },
    { href: "/interview", icon: Sparkles, label: "Interview Prep", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1"
      >
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-3xl font-bold text-foreground">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
          <span className="text-primary">{firstName}</span> 👋
        </h1>
        {report?.targetRole && (
          <p className="text-muted-foreground">
            Working towards:{" "}
            <Badge className="bg-primary/10 text-primary border-0 ml-1">
              {report.targetRole}
            </Badge>
          </p>
        )}
      </motion.div>

      {/* No Resume CTA */}
      {!hasResume && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-400 p-8"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/4 -translate-y-1/4 rounded-full bg-white/10" />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white/80">Get started</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              Upload your resume to unlock AI insights
            </h2>
            <p className="mb-6 text-white/75">
              Get your Career Score, Skill Gap Analysis, ATS Review, and personalized Roadmap in under a minute.
            </p>
            <Link href="/resume">
              <Button className="rounded-full bg-white text-primary hover:bg-white/90 font-semibold gap-2">
                Upload Resume <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      {report && stats.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Your Career Metrics
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
                  <div
                    className={`group relative overflow-hidden rounded-2xl p-5 ${stat.color} cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">/100</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                        <stat.icon className={`h-4.5 w-4.5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <Progress
                      value={stat.value}
                      className="mt-4 h-1.5"
                    />
                    <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary */}
      {report?.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl border border-border bg-white p-6 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">AI Career Summary</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
          {(report.strengths?.length > 0 || report.weaknesses?.length > 0) && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {report.strengths?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-emerald-600 uppercase tracking-wide">Strengths</p>
                  <ul className="space-y-1">
                    {report.strengths.slice(0, 3).map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.weaknesses?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-red-500 uppercase tracking-wide">Areas to Improve</p>
                  <ul className="space-y-1">
                    {report.weaknesses.slice(0, 3).map((w, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">AI Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Link href={link.href}>
                <div className="group flex items-center gap-4 rounded-2xl border border-border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md cursor-pointer">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${link.bg}`}>
                    <link.icon className={`h-5 w-5 ${link.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{link.label}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
