"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Loader2,
  Trophy,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";

interface CareerScore {
  careerScore: number;
  resumeScore: number;
  technicalScore: number;
  projectScore: number;
  experienceScore: number;
  interviewScore: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

const scoreLabel = (score: number) => {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-500" };
  if (score >= 70) return { label: "Good", color: "text-blue-500" };
  if (score >= 55) return { label: "Fair", color: "text-amber-500" };
  return { label: "Needs Work", color: "text-red-500" };
};

export default function CareerAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CareerScore | null>(null);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await fetch("/api/career-score");
        if (res.ok) {
          const json = await res.json();
          if (json.data && Object.keys(json.data).length > 0) setData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch existing career score", err);
      }
    };
    fetchExisting();
  }, []);

  const generateScore = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/career-score", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.data);
      toast.success("Career score generated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate score");
    } finally {
      setLoading(false);
    }
  };

  const radarData = data
    ? [
        { subject: "Resume", value: data.resumeScore },
        { subject: "Technical", value: data.technicalScore },
        { subject: "Projects", value: data.projectScore },
        { subject: "Experience", value: data.experienceScore },
        { subject: "Interview", value: data.interviewScore },
      ]
    : [];

  const metrics = data
    ? [
        { label: "Resume Quality", value: data.resumeScore, color: "bg-emerald-500" },
        { label: "Technical Skills", value: data.technicalScore, color: "bg-blue-500" },
        { label: "Projects", value: data.projectScore, color: "bg-violet-500" },
        { label: "Experience", value: data.experienceScore, color: "bg-amber-500" },
        { label: "Interview Readiness", value: data.interviewScore, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Career Analysis</h1>
          <p className="mt-1 text-muted-foreground">
            Get your AI-powered Career Readiness Score across 5 dimensions.
          </p>
        </div>
        <Button
          onClick={generateScore}
          disabled={loading}
          className="rounded-full bg-primary text-white gap-2 shadow-md shadow-primary/20"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
          ) : data ? (
            <><RefreshCw className="h-4 w-4" />Regenerate</>
          ) : (
            <><Sparkles className="h-4 w-4" />Generate Score</>
          )}
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground">AI is evaluating your profile</p>
              <p className="text-sm text-muted-foreground">Analyzing resume, skills, and projects...</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !loading && (
        <div className="rounded-3xl border-2 border-dashed border-border p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Trophy className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No career score yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Click "Generate Score" to get your AI Career Readiness Score. Make sure your resume is uploaded first.
          </p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Overall Score hero */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-400 p-8">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left md:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-medium text-white/70 uppercase tracking-widest">Overall Career Score</p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-7xl font-black text-white">{data.careerScore}</span>
                  <span className="text-2xl text-white/60">/100</span>
                </div>
                <p className={`text-lg font-semibold mt-1 text-white`}>
                  {scoreLabel(data.careerScore).label} — {data.summary.split(".")[0]}.
                </p>
              </div>
              <div className="h-56 w-56 md:h-60 md:w-60 shrink-0 mt-4 md:mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="55%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.3)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "white", fontSize: 11 }} />
                    <Radar dataKey="value" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-5 font-semibold text-foreground">Score Breakdown</h3>
            <div className="space-y-4">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{m.label}</span>
                    <span className={`text-sm font-bold ${scoreLabel(m.value).color}`}>
                      {m.value}/100
                    </span>
                  </div>
                  <Progress value={m.value} className="h-2" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid gap-6 md:grid-cols-2">
            {data.strengths?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {data.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground bg-secondary/30 p-2.5 rounded-lg border border-border">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.weaknesses?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">Areas to Improve</h3>
                </div>
                <ul className="space-y-3">
                  {data.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground bg-secondary/30 p-2.5 rounded-lg border border-border">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
