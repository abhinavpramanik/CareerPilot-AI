"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, Loader2, ChevronDown, ChevronUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

type InterviewType = "technical" | "hr";
type Difficulty = "easy" | "medium" | "hard";

interface TechnicalQ {
  question: string;
  expectedAnswer: string;
  keyConcepts: string[];
  followUps: string[];
}

interface HRQ {
  question: string;
  sampleAnswer: string;
  starGuidance: string;
  personalizationTip: string;
}

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-emerald-500/10 text-emerald-500",
  medium: "bg-amber-500/10 text-amber-500",
  hard: "bg-red-500/10 text-red-500",
};

function QuestionCard({ q, index, type }: { q: TechnicalQ | HRQ; index: number; type: InterviewType }) {
  const [open, setOpen] = useState(false);
  const isTech = type === "technical";
  const tech = q as TechnicalQ;
  const hr = q as HRQ;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between p-5 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1 pr-4">
          <span className="mt-0.5 text-xs font-bold text-primary shrink-0 bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center">
            {index + 1}
          </span>
          <p className="text-sm font-medium text-foreground leading-relaxed">{q.question}</p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
              {isTech ? (
                <>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      Expected Answer
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tech.expectedAnswer}</p>
                  </div>
                  {tech.keyConcepts?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Key Concepts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tech.keyConcepts.map((c) => (
                          <Badge key={c} className="bg-blue-500/10 text-blue-500 border-0 text-[11px]">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {tech.followUps?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Follow-up Questions
                      </p>
                      <ul className="space-y-1">
                        {tech.followUps.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      Sample Answer
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{hr.sampleAnswer}</p>
                  </div>
                  <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-500 mb-1.5">
                      STAR Method Guidance
                    </p>
                    <p className="text-xs text-muted-foreground">{hr.starGuidance}</p>
                  </div>
                  {hr.personalizationTip && (
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Star className="h-3 w-3 text-amber-500" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">
                          Personalization Tip
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{hr.personalizationTip}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function InterviewPage() {
  const [role, setRole] = useState("");
  const [type, setType] = useState<InterviewType>("technical");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<(TechnicalQ | HRQ)[]>([]);

  useEffect(() => {
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
      const res = await fetch("/api/interview-preparation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, interviewType: type, difficulty }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setQuestions(json.data.questions);
      toast.success(`${json.data.questions.length} questions generated!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Interview Preparation</h1>
        <p className="mt-1 text-muted-foreground">
          AI-generated interview questions tailored to your role and resume.
        </p>
      </div>

      {/* Settings */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Target Role</label>
          <Input
            placeholder="e.g. Full Stack Developer, Data Scientist"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl"
          />
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

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Interview Type</label>
            <div className="flex gap-2">
              {(["technical", "hr"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                    type === t
                      ? "border-primary bg-primary text-white"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {t === "technical" ? "🖥 Technical" : "👥 HR"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Difficulty</label>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize transition-all ${
                    difficulty === d
                      ? "border-primary bg-primary text-white"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={generate}
          disabled={loading}
          className="w-full rounded-xl bg-primary text-white gap-2 py-5"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generating questions...</>
          ) : (
            <><Sparkles className="h-4 w-4" />Generate Interview Questions</>
          )}
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mic className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="font-medium text-foreground">AI is preparing your questions...</p>
          </div>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && !loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">{questions.length} Questions</h3>
            <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
            <Badge className="bg-blue-500/10 text-blue-500 border-0">{type}</Badge>
          </div>
          {questions.map((q, i) => (
            <QuestionCard key={i} q={q} index={i} type={type} />
          ))}
        </div>
      )}
    </div>
  );
}
