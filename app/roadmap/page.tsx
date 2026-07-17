"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Map, Sparkles, Loader2, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RoadmapWeek {
  week: number;
  topics: string[];
  deliverables: string[];
  estimatedHours: number;
}

export default function RoadmapPage() {
  const [loading, setLoading] = useState(false);
  const [weeks, setWeeks] = useState<RoadmapWeek[]>([]);
  const [targetRole, setTargetRole] = useState("");

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setWeeks(json.data.weeks);
      setTargetRole(json.data.targetRole);
      toast.success("Roadmap generated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const totalHours = weeks.reduce((sum, w) => sum + w.estimatedHours, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Learning Roadmap</h1>
          <p className="mt-1 text-muted-foreground">
            Your personalized 6-week AI-generated learning plan.
          </p>
        </div>
        <Button
          onClick={generate}
          disabled={loading}
          className="rounded-full bg-primary text-white gap-2"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
          ) : weeks.length > 0 ? (
            <><RefreshCw className="h-4 w-4" />Regenerate</>
          ) : (
            <><Sparkles className="h-4 w-4" />Generate Roadmap</>
          )}
        </Button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Map className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="font-medium text-foreground">Building your personalized roadmap...</p>
          </div>
        </div>
      )}

      {!weeks.length && !loading && (
        <div className="rounded-3xl border-2 border-dashed border-border p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Map className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No roadmap yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete Skill Gap Analysis first, then generate your roadmap.
          </p>
        </div>
      )}

      {weeks.length > 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Summary bar */}
          <div className="flex flex-wrap gap-4">
            {targetRole && (
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                <span className="text-sm font-medium text-primary">{targetRole}</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{totalHours} total hours</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{weeks.length} weeks</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border hidden md:block" />

            <div className="space-y-6">
              {weeks.map((week, i) => (
                <motion.div
                  key={week.week}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="md:pl-16 relative"
                >
                  {/* Circle on timeline */}
                  <div className="absolute left-3.5 top-5 hidden h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-white md:flex">
                    <span className="text-[9px] font-bold text-primary">{week.week}</span>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary/10 text-primary border-0">Week {week.week}</Badge>
                        <span className="text-sm font-semibold text-foreground">
                          {week.topics[0] && week.topics[0]}
                          {week.topics.length > 1 && ` + ${week.topics.length - 1} more`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {week.estimatedHours}h
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Topics
                        </p>
                        <ul className="space-y-1.5">
                          {week.topics.map((topic, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Deliverables
                        </p>
                        <ul className="space-y-1.5">
                          {week.deliverables.map((d, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
