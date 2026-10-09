"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, Sparkles, Loader2, RefreshCw, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const ROLE_SUGGESTIONS = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Android Developer",
  "iOS Developer",
  "Cybersecurity Analyst",
];

interface RoadmapWeek {
  week: number;
  topics: string[];
  deliverables: string[];
  estimatedHours: number;
}

interface RoadmapHistory {
  _id: string;
  targetRole: string;
  weeks: RoadmapWeek[];
  generatedAt: string;
}

export default function RoadmapPage() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RoadmapHistory[]>([]);
  const [expandedId, setExpandedId] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchHistory = async (autoExpandNewest = false) => {
    try {
      const res = await fetch("/api/roadmap");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setHistory(json.data);
          if (json.data.length > 0 && (autoExpandNewest || expandedId.length === 0)) {
            setExpandedId([json.data[0]._id]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch roadmap history:", error);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const res = await fetch("/api/roadmap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Deleted successfully");
      await fetchHistory();
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  useEffect(() => {
    fetchHistory();
    fetch("/api/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.targetRole) {
          setRole(json.data.targetRole);
        }
      })
      .catch((err) => console.error("Failed to load profile target role", err));
  }, []);

  const generate = async () => {
    if (!role.trim()) { toast.error("Please enter a target role"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Roadmap generated!");
      await fetchHistory(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Learning Roadmap</h1>
        <p className="mt-1 text-muted-foreground">
          Your personalized 6-week AI-generated learning plan.
        </p>
      </div>

      {/* Role Input */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-foreground">Select your target role</h3>
        <div className="flex gap-3">
          <Input
            placeholder="e.g. Full Stack Developer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            className="rounded-xl"
          />
          <Button
            onClick={generate}
            disabled={loading}
            className="shrink-0 rounded-full bg-primary text-white gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" />Generate Roadmap</>
            )}
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {ROLE_SUGGESTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                role === r
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
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

      {!history.length && !loading && (
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

      {history.length > 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Previous Roadmaps</h2>
          <Accordion value={expandedId} onValueChange={setExpandedId} className="w-full space-y-4">
            {history.map((record) => {
              const totalHours = record.weeks.reduce((sum, w) => sum + w.estimatedHours, 0);

              return (
                <AccordionItem key={record._id} value={record._id} className="rounded-2xl border border-border bg-card px-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <AccordionTrigger className="hover:no-underline flex-1 text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left w-full">
                        <span className="font-semibold text-lg">{record.targetRole}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {new Date(record.generatedAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                      onClick={() => setDeleteId(record._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="space-y-6">
                      {/* Summary bar */}
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{totalHours} total hours</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{record.weeks.length} weeks</span>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="relative">
                        {/* vertical line */}
                        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border hidden md:block" />

                        <div className="space-y-6">
                          {record.weeks.map((week, i) => (
                            <div key={week.week} className="md:pl-16 relative">
                              {/* Circle on timeline */}
                              <div className="absolute left-3.5 top-5 hidden h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-card md:flex">
                                <span className="text-[9px] font-bold text-primary">{week.week}</span>
                              </div>

                              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
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
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </motion.div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this roadmap from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteId) deleteRecord(deleteId);
                setDeleteId(null);
              }}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
