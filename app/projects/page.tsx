"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderGit2, Sparkles, Loader2, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Project {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  techStack: string[];
  learningOutcome: string;
  estimatedWeeks: number;
}

const difficultyConfig = {
  Beginner: { class: "bg-emerald-100 text-emerald-700 border-0", dot: "bg-emerald-500", card: "card-mint" },
  Intermediate: { class: "bg-amber-100 text-amber-700 border-0", dot: "bg-amber-500", card: "card-yellow" },
  Advanced: { class: "bg-red-100 text-red-700 border-0", dot: "bg-red-500", card: "card-peach" },
};

export default function ProjectsPage() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await fetch("/api/project-recommendation");
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.projects) setProjects(json.data.projects);
        }
      } catch (err) {
        console.error("Failed to fetch existing project recommendations", err);
      }
    };
    fetchExisting();
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/project-recommendation", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setProjects(json.data.projects);
      toast.success("Project recommendations ready!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Recommendations</h1>
          <p className="mt-1 text-muted-foreground">
            AI-curated portfolio projects tailored to your skills and goals.
          </p>
        </div>
        <Button
          onClick={generate}
          disabled={loading}
          className="rounded-full bg-primary text-white gap-2"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
          ) : projects.length > 0 ? (
            <><RefreshCw className="h-4 w-4" />Regenerate</>
          ) : (
            <><Sparkles className="h-4 w-4" />Get Recommendations</>
          )}
        </Button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FolderGit2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="font-medium text-foreground">Crafting personalized project ideas...</p>
          </div>
        </div>
      )}

      {!projects.length && !loading && (
        <div className="rounded-3xl border-2 border-dashed border-border p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FolderGit2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No recommendations yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload your resume first, then get personalized project ideas.
          </p>
        </div>
      )}

      {projects.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`group relative flex flex-col overflow-hidden rounded-3xl ${difficultyConfig[p.difficulty]?.card || "bg-white"} p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <FolderGit2 className="h-5 w-5 text-foreground" />
                </div>
                <Badge className={difficultyConfig[p.difficulty]?.class || ""}>
                  {p.difficulty}
                </Badge>
              </div>

              <h3 className="mb-2 font-bold text-foreground">{p.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground flex-1">{p.learningOutcome}</p>

              <div className="space-y-3">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.techStack.map((t) => (
                      <Badge key={t} className="bg-white/60 text-foreground text-[11px] border border-white/80">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  ~{p.estimatedWeeks} week{p.estimatedWeeks !== 1 ? "s" : ""}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
