"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Sparkles, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
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

interface MissingSkill {
  name: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
  resources: string[];
}

interface SkillGapHistory {
  _id: string;
  targetRole: string;
  generatedAt: string;
  missingSkills: MissingSkill[];
}

const priorityConfig = {
  High: { class: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  Medium: { class: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Low: { class: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

export default function SkillGapPage() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SkillGapHistory[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/skill-gap");
      if (res.ok) {
        const json = await res.json();
        if (json.data) setHistory(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const res = await fetch("/api/skill-gap", {
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
  }, []);

  const analyze = async () => {
    if (!role.trim()) { toast.error("Please enter a target role"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      toast.success("Skill gap analysis complete!");
      // Fetch latest history to include the new one
      await fetchHistory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Skill Gap Analysis</h1>
        <p className="mt-1 text-muted-foreground">
          Identify the skills you need to land your target role.
        </p>
      </div>

      {/* Role Input */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-foreground">Select your target role</h3>
        <div className="flex gap-3">
          <Input
            placeholder="e.g. Full Stack Developer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            className="rounded-xl"
          />
          <Button
            onClick={analyze}
            disabled={loading}
            className="shrink-0 rounded-full bg-primary text-white gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4" />Analyze</>
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

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="font-medium text-foreground">Analyzing skill gaps for {role}...</p>
          </div>
        </div>
      )}

      {/* Results History */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Previous Searches</h2>
          
          <Accordion type="single" collapsible defaultValue={history[0]?._id} className="w-full space-y-4">
            {history.map((record) => {
              const skills = record.missingSkills || [];
              const highCount = skills.filter((s) => s.priority === "High").length;
              const medCount = skills.filter((s) => s.priority === "Medium").length;
              const lowCount = skills.filter((s) => s.priority === "Low").length;

              return (
                <AccordionItem key={record._id} value={record._id} className="rounded-2xl border border-border bg-white px-6 shadow-sm">
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
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0"
                      onClick={() => deleteRecord(record._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: "High Priority", count: highCount, class: "card-peach", textColor: "text-red-600" },
                          { label: "Medium Priority", count: medCount, class: "card-yellow", textColor: "text-amber-600" },
                          { label: "Low Priority", count: lowCount, class: "card-mint", textColor: "text-emerald-600" },
                        ].map((s) => (
                          <div key={s.label} className={`rounded-xl p-4 text-center ${s.class}`}>
                            <p className={`text-2xl font-bold ${s.textColor}`}>{s.count}</p>
                            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Skills */}
                      <div className="space-y-4">
                        {(["High", "Medium", "Low"] as const).map((priority) => {
                          const prioritySkills = skills.filter((s) => s.priority === priority);
                          if (!prioritySkills.length) return null;
                          return (
                            <div key={priority}>
                              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wide">
                                <span className={`h-2 w-2 rounded-full ${priorityConfig[priority].dot}`} />
                                {priority} Priority ({prioritySkills.length})
                              </h3>
                              <div className="grid gap-4 md:grid-cols-2">
                                {prioritySkills.map((skill, i) => (
                                  <div
                                    key={skill.name}
                                    className="rounded-xl border border-border bg-white p-4 shadow-sm"
                                  >
                                    <div className="mb-3 flex items-start justify-between">
                                      <h4 className="font-semibold text-foreground">{skill.name}</h4>
                                      <Badge className={`shrink-0 ml-2 border text-[10px] ${priorityConfig[priority].class}`}>
                                        {priority}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{skill.reason}</p>
                                    {skill.resources?.length > 0 && (
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                                          Resources
                                        </p>
                                        <ul className="space-y-1">
                                          {skill.resources.map((r, j) => (
                                            <li key={j} className="text-xs text-primary flex items-center gap-1">
                                              <span className="h-1 w-1 rounded-full bg-primary" />
                                              {r}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </motion.div>
      )}
    </div>
  );
}
