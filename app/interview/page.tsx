"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";

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

interface InterviewHistory {
  _id: string;
  role: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  createdAt: string;
  questions: (TechnicalQ | HRQ)[];
}

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-emerald-500/10 text-emerald-500",
  medium: "bg-amber-500/10 text-amber-500",
  hard: "bg-red-500/10 text-red-500",
};

interface QuestionCardProps {
  q: any;
  index: number;
  type: InterviewType;
  sessionId?: string;
  role?: string;
  difficulty?: Difficulty;
}

function QuestionCard({
  q,
  index,
  type,
  sessionId,
  role = "Software Developer",
  difficulty = "medium",
}: QuestionCardProps) {
  const [open, setOpen] = useState(false);
  const [answerText, setAnswerText] = useState(q?.userAnswer || "");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(q?.evaluation || null);
  const [adaptive, setAdaptive] = useState<any>(q?.adaptiveRecommendation || null);
  const [showAnswerKey, setShowAnswerKey] = useState(Boolean(q?.evaluation));

  const isTech = type === "technical";
  const tech = (q || {}) as TechnicalQ;
  const hr = (q || {}) as HRQ;

  const handleEvaluate = async () => {
    if (!answerText.trim()) {
      toast.error("Please type your response before submitting.");
      return;
    }

    setEvaluating(true);
    try {
      const res = await fetch("/api/interview-preparation/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionIndex: index,
          question: q.question,
          userAnswer: answerText,
          role,
          interviewType: type,
          expectedCriteria: isTech ? tech.expectedAnswer : hr.sampleAnswer,
          difficulty,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setEvaluation(json.data.evaluation);
      setAdaptive(json.data.adaptiveRecommendation);
      setShowAnswerKey(true);
      toast.success("Answer evaluated against rubric!");
    } catch (err: any) {
      toast.error(err?.message || "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const scoreBadge = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (score >= 55) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

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
          <div>
            <p className="text-sm font-medium text-foreground leading-relaxed">{q?.question || "Generating question..."}</p>
            {evaluation && (
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Assessed: {evaluation.score}/100
              </span>
            )}
          </div>
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
            <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">
              {/* Practice Answer Box */}
              {!evaluation && (
                <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Practice Your Answer</p>
                    <span className="text-[10px] text-muted-foreground">Rubric v1.0.0</span>
                  </div>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your explanation or response here. Mention your approach, key principles, tradeoffs, or STAR scenario..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <Button
                      size="sm"
                      disabled={evaluating || !answerText.trim()}
                      onClick={handleEvaluate}
                      className="rounded-xl bg-primary text-white text-xs gap-1.5 shadow-sm"
                    >
                      {evaluating ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />Evaluating Rubric...</>
                      ) : (
                        <><Sparkles className="h-3.5 w-3.5" />Submit for AI Assessment</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAnswerKey(!showAnswerKey)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showAnswerKey ? "Hide Answer Key" : "Peek at Answer Key"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Assessment Results */}
              {evaluation && (
                <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground text-sm">Assessment Feedback</span>
                    </div>
                    <Badge className={`text-xs px-2.5 py-0.5 border ${scoreBadge(evaluation.score)}`}>
                      Rubric Score: {evaluation.score}/100
                    </Badge>
                  </div>

                  {/* 4 Rubric Dimensions */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { name: "Correctness", weight: "40%", score: evaluation.correctnessScore },
                      { name: "Reasoning Depth", weight: "25%", score: evaluation.reasoningScore },
                      { name: "Clarity", weight: "20%", score: evaluation.clarityScore },
                      { name: "Coverage", weight: "15%", score: evaluation.coverageScore },
                    ].map((dim) => (
                      <div key={dim.name} className="rounded-lg bg-muted/30 border border-border/50 p-2.5">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span>{dim.name}</span>
                          <span className="opacity-75">{dim.weight}</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">{dim.score}<span className="text-xs text-muted-foreground font-normal">/100</span></p>
                        <Progress value={dim.score} className="h-1 mt-1.5" />
                      </div>
                    ))}
                  </div>

                  {/* Summary Feedback */}
                  <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg">
                    {evaluation.feedback}
                  </p>

                  {/* Strengths & Improvements */}
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    {evaluation.strengths?.length > 0 && (
                      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                        <p className="font-semibold text-emerald-600 mb-1.5">Demonstrated Strengths</p>
                        <ul className="space-y-1 text-muted-foreground">
                          {evaluation.strengths.map((s: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="h-1 w-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evaluation.improvements?.length > 0 && (
                      <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                        <p className="font-semibold text-amber-600 mb-1.5">Areas to Polish</p>
                        <ul className="space-y-1 text-muted-foreground">
                          {evaluation.improvements.map((im: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="h-1 w-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <span>{im}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Adaptive Recommendation */}
                  {adaptive && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                      <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">
                          Adaptive Progression: Next Difficulty &rarr; <span className="uppercase text-primary font-bold">{adaptive.nextDifficulty}</span> ({adaptive.action})
                        </p>
                        <p className="text-muted-foreground mt-0.5">{adaptive.reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Sample Better Answer */}
                  {evaluation.sampleBetterAnswer && (
                    <div className="rounded-lg border border-border bg-muted/10 p-3 text-xs">
                      <p className="font-semibold text-foreground mb-1">Exemplary Answer</p>
                      <p className="text-muted-foreground leading-relaxed">{evaluation.sampleBetterAnswer}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Expected answer key & guidance */}
              {showAnswerKey && (
                <div className="space-y-4 pt-2 border-t border-border/50">
                  {isTech ? (
                    <>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                          Expected Answer Criteria
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
                        <p className="text-sm text-muted-foreground leading-relaxed">{hr.sampleAnswer || "Generating answer..."}</p>
                      </div>
                      <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-500 mb-1.5">
                          STAR Method Guidance
                        </p>
                        <p className="text-xs text-muted-foreground">{hr.starGuidance || "Generating guidance..."}</p>
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
  const [history, setHistory] = useState<InterviewHistory[]>([]);
  const [expandedId, setExpandedId] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showStream, setShowStream] = useState(false);
  
  const fetchHistory = async (autoExpandNewest = false) => {
    try {
      const res = await fetch("/api/interview-preparation");
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
      console.error("Failed to fetch history:", error);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const res = await fetch("/api/interview-preparation", {
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

  const { submit, isLoading: loading, object, stop } = useObject({
    api: "/api/interview-preparation",
    schema: z.object({
      questions: z.array(z.any()),
    }),
    onFinish: () => { 
      toast.success("Questions generated!"); 
      setTimeout(() => {
        fetchHistory(true).then(() => setShowStream(false));
      }, 1500);
    },
    onError: (error) => { toast.error(error.message || "Generation failed"); },
  });

  const questions = object?.questions || [];

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

  const generate = () => {
    if (!role.trim()) { toast.error("Please enter a target role"); return; }
    setShowStream(true);
    submit({ role, interviewType: type, difficulty });
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
        {loading && (
          <Button variant="outline" onClick={stop} className="w-full rounded-xl gap-2 mt-2">
            Stop Generation
          </Button>
        )}
      </div>

      {/* Loading Screen */}
      {loading && questions.length === 0 && (
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
      {showStream && questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">{questions.length} Questions</h3>
            <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
            <Badge className="bg-blue-500/10 text-blue-500 border-0">{type}</Badge>
          </div>
          {questions.map((q, i) => (
            <QuestionCard key={i} q={q} index={i} type={type} role={role} difficulty={difficulty} />
          ))}
        </div>
      )}

      {/* Results History */}
      {history.length > 0 && !showStream && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Previous Interviews</h2>
          
          <Accordion value={expandedId} onValueChange={setExpandedId} className="w-full space-y-4">
            {history.map((record) => (
              <AccordionItem key={record._id} value={record._id} className="rounded-2xl border border-border bg-card px-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <AccordionTrigger className="hover:no-underline flex-1 text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left w-full">
                      <span className="font-semibold text-lg">{record.role}</span>
                      <div className="flex items-center gap-2">
                         <Badge className={difficultyColors[record.difficulty]}>{record.difficulty}</Badge>
                         <Badge className="bg-blue-500/10 text-blue-500 border-0">{record.interviewType}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-normal">
                        {new Date(record.createdAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0"
                    onClick={() => setDeleteId(record._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <AccordionContent className="pt-4 pb-6">
                  <div className="space-y-4">
                    {record.questions.map((q, i) => (
                      <QuestionCard
                        key={`${record._id}-${i}`}
                        q={q as any}
                        index={i}
                        type={record.interviewType}
                        sessionId={record._id}
                        role={record.role}
                        difficulty={record.difficulty}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this interview from your history.
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
