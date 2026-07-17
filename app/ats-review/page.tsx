"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ATSResult {
  atsScore: number;
  keywordIssues: string[];
  formattingIssues: string[];
  bulletSuggestions: Array<{ original: string; improved: string }>;
  overallSuggestions: string[];
}

const scoreLabel = (score: number) => {
  if (score >= 80) return { label: "ATS Friendly", color: "text-emerald-600", bg: "bg-emerald-50" };
  if (score >= 60) return { label: "Needs Improvement", color: "text-amber-600", bg: "bg-amber-50" };
  return { label: "ATS Risk", color: "text-red-600", bg: "bg-red-50" };
};

export default function ATSReviewPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ATSResult | null>(null);

  const runReview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ats-review", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.data);
      toast.success("ATS review complete!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Review failed");
    } finally {
      setLoading(false);
    }
  };

  const label = data ? scoreLabel(data.atsScore) : null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ATS Review</h1>
          <p className="mt-1 text-muted-foreground">
            See how your resume performs against Applicant Tracking Systems.
          </p>
        </div>
        <Button
          onClick={runReview}
          disabled={loading}
          className="rounded-full bg-primary text-white gap-2"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Running Review...</>
          ) : data ? (
            <><RefreshCw className="h-4 w-4" />Re-run Review</>
          ) : (
            <><Sparkles className="h-4 w-4" />Run ATS Review</>
          )}
        </Button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="font-medium text-foreground">Running ATS simulation...</p>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="rounded-3xl border-2 border-dashed border-border p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <CheckSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No ATS review yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload your resume first, then run an ATS review.
          </p>
        </div>
      )}

      {data && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Score hero */}
          <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left md:items-start md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ATS Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black text-foreground">{data.atsScore}</span>
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <Badge className={`mt-2 border-0 ${label?.bg} ${label?.color}`}>
                  {label?.label}
                </Badge>
              </div>
              <div className="w-full max-w-xs">
                <Progress value={data.atsScore} className="h-3" />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0</span><span>50</span><span>100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Keyword Issues */}
            {data.keywordIssues?.length > 0 && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="font-semibold text-foreground">Missing Keywords</h3>
                  <Badge variant="secondary" className="ml-auto">{data.keywordIssues.length}</Badge>
                </div>
                <ul className="space-y-2">
                  {data.keywordIssues.map((k, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formatting Issues */}
            {data.formattingIssues?.length > 0 && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h3 className="font-semibold text-foreground">Formatting Issues</h3>
                  <Badge variant="secondary" className="ml-auto">{data.formattingIssues.length}</Badge>
                </div>
                <ul className="space-y-2">
                  {data.formattingIssues.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bullet Suggestions */}
          {data.bulletSuggestions?.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground">Bullet Point Improvements</h3>
              <div className="space-y-4">
                {data.bulletSuggestions.map((b, i) => (
                  <div key={i} className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-start gap-3 p-4 bg-red-50/50">
                      <span className="text-xs font-semibold text-red-500 shrink-0 mt-0.5 uppercase">Before</span>
                      <p className="text-sm text-muted-foreground">{b.original}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-emerald-50/50">
                      <span className="text-xs font-semibold text-emerald-600 shrink-0 mt-0.5 uppercase">After</span>
                      <p className="text-sm text-foreground font-medium">{b.improved}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall Suggestions */}
          {data.overallSuggestions?.length > 0 && (
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-2">AI Recommendations</p>
                  <ul className="space-y-2">
                    {data.overallSuggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
