"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Clock,
  BarChart3,
  ArrowRight,
  Send,
  ShieldAlert,
  Maximize2,
  Minimize2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// ─── Types ───────────────────────────────────────────────────────────────────

type InterviewType = "technical" | "hr";
type Difficulty = "easy" | "medium" | "hard";
type Stage = "setup" | "active" | "report";

interface ClientQuestion {
  index: number;
  question: string;
}

interface QuestionResult {
  question: string;
  expectedAnswer: string;
  keyConcepts: string[];
  userAnswer: string;
  score: number;
  correctnessScore: number;
  reasoningScore: number;
  clarityScore: number;
  coverageScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface MockReport {
  _id: string;
  role: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  overallScore: number;
  dimensionScores: {
    correctness: number;
    reasoning: number;
    clarity: number;
    coverage: number;
  };
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  pointsToImprove: string[];
  terminatedEarly?: boolean;
  terminationReason?: string;
  tabSwitchCount?: number;
  questions: QuestionResult[];
  completedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-emerald-500/10 text-emerald-500",
  medium: "bg-amber-500/10 text-amber-500",
  hard: "bg-red-500/10 text-red-500",
};

const difficultyBorder: Record<Difficulty, string> = {
  easy: "border-emerald-500/30",
  medium: "border-amber-500/30",
  hard: "border-red-500/30",
};

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 55) return "text-amber-500";
  return "text-red-500";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
  if (score >= 55) return "bg-amber-500/10 border-amber-500/20 text-amber-500";
  return "bg-red-500/10 border-red-500/20 text-red-500";
}

function scoreProgressColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 55) return "bg-amber-500";
  return "bg-red-500";
}

function ScoreGrade({ score }: { score: number }) {
  if (score >= 85) return <span className="text-emerald-500 font-bold">Excellent</span>;
  if (score >= 70) return <span className="text-emerald-400 font-bold">Good</span>;
  if (score >= 55) return <span className="text-amber-500 font-bold">Fair</span>;
  return <span className="text-red-500 font-bold">Needs Work</span>;
}

// ─── Setup Stage ──────────────────────────────────────────────────────────────

interface SetupStageProps {
  role: string;
  setRole: (v: string) => void;
  type: InterviewType;
  setType: (v: InterviewType) => void;
  difficulty: Difficulty;
  setDifficulty: (v: Difficulty) => void;
  onStart: () => void;
  starting: boolean;
  history: MockReport[];
  onViewReport: (r: MockReport) => void;
  onDeleteHistory: (id: string) => void;
}

function SetupStage({
  role,
  setRole,
  type,
  setType,
  difficulty,
  setDifficulty,
  onStart,
  starting,
  history,
  onViewReport,
  onDeleteHistory,
}: SetupStageProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-sm shrink-0">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Mock Interview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Simulate a real interview, answer questions one-by-one, and get a detailed AI evaluation report.
            </p>
          </div>
        </div>
      </div>

      {/* Config Card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Configure Your Session
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select your target specialization, interview format, and difficulty to generate tailored questions.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Target Role</label>
          <Input
            placeholder="e.g. Full Stack Developer, Data Scientist, DevOps Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-11 rounded-xl bg-background"
          />
          <div className="pt-1 flex flex-wrap gap-2">
            {ROLE_SUGGESTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  role === r
                    ? "border-primary bg-primary/15 text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-muted/20"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Interview Type</label>
            <div className="grid grid-cols-2 gap-2.5">
              {(["technical", "hr"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-xl border py-3 px-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    type === t
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/40 bg-muted/10 hover:text-foreground"
                  }`}
                >
                  {t === "technical" ? "🖥 Technical" : "👥 HR / Behavioral"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`rounded-xl border py-3 text-sm font-medium capitalize transition-all text-center ${
                    difficulty === d
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/40 bg-muted/10 hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-5 space-y-3">
          <p className="text-xs font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" /> Assessment Rules & Guidelines
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span><strong>Fullscreen Portal:</strong> Session launches in dedicated full-screen mode for focus.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span><strong>3 Warnings Rule:</strong> Tab switching or unfocusing is monitored — 3 warnings before auto-termination.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>5 questions presented one-by-one — answer in your own words.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>AI grades on Correctness (40%), Reasoning (25%), Clarity (20%), and Coverage (15%).</span>
            </div>
          </div>
        </div>

        <Button
          onClick={onStart}
          disabled={starting}
          className="h-12 w-full rounded-xl bg-primary text-white gap-2 font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          {starting ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generating questions...</>
          ) : (
            <><Video className="h-4 w-4" />Start Mock Interview</>
          )}
        </Button>
      </div>

      {/* Past Interviews */}
      {history.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Past Mock Interviews
            </h2>
            <span className="text-xs text-muted-foreground">{history.length} session{history.length === 1 ? "" : "s"}</span>
          </div>
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record._id}
                className={`rounded-2xl border bg-card p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/30 ${difficultyBorder[record.difficulty]}`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-base">{record.role}</span>
                    <Badge className={difficultyColors[record.difficulty]}>{record.difficulty}</Badge>
                    <Badge className="bg-blue-500/10 text-blue-500 border-0 capitalize">{record.interviewType}</Badge>
                    {record.terminatedEarly && (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/30 text-[10px] gap-1">
                        <ShieldAlert className="h-3 w-3" /> Terminated
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={`font-bold text-base ${scoreColor(record.overallScore)}`}>
                      {record.overallScore}/100
                    </span>
                    <span>•</span>
                    <span>{new Date(record.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-1.5 text-xs h-9"
                    onClick={() => onViewReport(record)}
                  >
                    <BarChart3 className="h-3.5 w-3.5" /> View Report
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                    onClick={() => onDeleteHistory(record._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Active Stage (Question-by-Question) ─────────────────────────────────────

interface ActiveStageProps {
  questions: ClientQuestion[];
  answers: string[];
  setAnswers: (answers: string[]) => void;
  current: number;
  setCurrent: (i: number) => void;
  role: string;
  type: InterviewType;
  difficulty: Difficulty;
  onFinish: () => void;
  submitting: boolean;
  warnings: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

function ActiveStage({
  questions,
  answers,
  setAnswers,
  current,
  setCurrent,
  role,
  type,
  difficulty,
  onFinish,
  submitting,
  warnings,
  isFullscreen,
  onToggleFullscreen,
}: ActiveStageProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const total = questions.length;
  const q = questions[current];
  const progress = Math.round(((current + 1) / total) * 100);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(160, textareaRef.current.scrollHeight)}px`;
    }
  }, [answers, current]);

  const updateAnswer = (value: string) => {
    const updated = [...answers];
    updated[current] = value;
    setAnswers(updated);
  };

  const answeredCount = answers.filter((a) => a.trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto flex flex-col">
      {/* Dedicated Top Proctoring Bar */}
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
            <Video className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Mock Interview</span>
              <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
              <Badge className="bg-blue-500/10 text-blue-500 border-0 capitalize text-[10px]">{type}</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate max-w-[180px] sm:max-w-none">{role}</p>
          </div>
        </div>

        {/* Proctoring Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Proctoring Active</span>
          </div>

          {/* Warning count badge */}
          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
              warnings === 0
                ? "border-border bg-muted/40 text-muted-foreground"
                : warnings === 1
                ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                : warnings === 2
                ? "border-orange-500/30 bg-orange-500/10 text-orange-500"
                : "border-red-500/40 bg-red-500/15 text-red-500 animate-pulse"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{warnings}/3 Warnings</span>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullscreen}
            className="h-8 px-2.5 rounded-lg text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden md:inline text-amber-500 font-medium">Fullscreen</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Examination View */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Question Counter Card */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Question {current + 1} <span className="text-muted-foreground font-normal text-base">of {total}</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Answer in your own words. Switching tabs or leaving the screen is monitored.
              </p>
            </div>
            <div className="sm:text-right shrink-0 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {answeredCount} of {total} answered
              </p>
              <div className="flex items-center gap-1.5 sm:justify-end">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrent(i)}
                    title={`Jump to question ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === current
                        ? "w-7 bg-primary"
                        : answers[i]?.trim()
                        ? "w-2.5 bg-emerald-500 hover:opacity-80"
                        : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Question Card */}
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
        >
          {/* Question Prompt */}
          <div className="p-6 sm:p-8 border-b border-border bg-muted/15">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 text-xs font-bold text-primary shrink-0 bg-primary/10 border border-primary/20 rounded-full h-8 w-8 flex items-center justify-center">
                {current + 1}
              </span>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Prompt</p>
                <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                  {q?.question}
                </p>
              </div>
            </div>
          </div>

          {/* Answer Textarea */}
          <div className="p-6 sm:p-8 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Answer
              </label>
              <span className="text-[11px] text-muted-foreground">
                {(answers[current] || "").length} characters
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={answers[current] || ""}
              onChange={(e) => updateAnswer(e.target.value)}
              placeholder={
                type === "technical"
                  ? "Explain your approach, core concepts, tradeoffs, edge cases, and architectural considerations..."
                  : "Structure using the STAR framework: Situation, Task, Action you took, and measurable Results..."
              }
              className="w-full resize-none rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all min-h-[160px]"
            />
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <Button
            variant="outline"
            className="rounded-xl gap-2 h-11 px-5"
            disabled={current === 0}
            onClick={() => setCurrent(current - 1)}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          {current < total - 1 ? (
            <Button
              className="rounded-xl gap-2 bg-primary text-white h-11 px-6 shadow-sm"
              onClick={() => setCurrent(current + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 shadow-sm"
              onClick={() => setShowFinishDialog(true)}
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Evaluating...</>
              ) : (
                <><Send className="h-4 w-4" />Finish & Get Report</>
              )}
            </Button>
          )}
        </div>
      </main>

      {/* Finish Confirmation Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit your interview?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-1 text-sm text-muted-foreground">
              <p>
                You have answered <span className="font-semibold text-foreground">{answeredCount}</span> of <span className="font-semibold text-foreground">{total}</span> questions.
              </p>
              {answeredCount < total && (
                <p className="text-amber-500 font-medium">
                  {total - answeredCount} unanswered question(s) will receive 0 points.
                </p>
              )}
              <p>Once submitted, AI will grade your responses and generate a detailed performance report.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel className="rounded-xl">Review Answers</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-primary text-white"
              onClick={() => {
                setShowFinishDialog(false);
                onFinish();
              }}
            >
              Submit & Generate Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Report Stage ─────────────────────────────────────────────────────────────

interface ReportStageProps {
  report: MockReport;
  onStartNew: () => void;
}

function ReportStage({ report, onStartNew }: ReportStageProps) {
  const [expandedQs, setExpandedQs] = useState<string[]>([]);

  const dims = [
    { label: "Correctness", weight: "40%", value: report.dimensionScores?.correctness ?? 0 },
    { label: "Reasoning Depth", weight: "25%", value: report.dimensionScores?.reasoning ?? 0 },
    { label: "Clarity", weight: "20%", value: report.dimensionScores?.clarity ?? 0 },
    { label: "Coverage", weight: "15%", value: report.dimensionScores?.coverage ?? 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Performance Report</h1>
            <Badge className={difficultyColors[report.difficulty]}>{report.difficulty}</Badge>
            <Badge className="bg-blue-500/10 text-blue-500 border-0 capitalize">{report.interviewType}</Badge>
            {report.terminatedEarly && (
              <Badge className="bg-red-500/10 text-red-500 border-red-500/30 gap-1">
                <ShieldAlert className="h-3 w-3" /> Terminated Early
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>Role: <strong className="text-foreground font-semibold">{report.role}</strong></span>
            <span>•</span>
            <span>Completed on {new Date(report.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
          </p>
        </div>
        <Button
          onClick={onStartNew}
          className="rounded-xl gap-2 bg-primary text-white shrink-0 h-10 px-5 shadow-sm"
        >
          <Video className="h-4 w-4" /> New Mock Interview
        </Button>
      </div>

      {/* Early Termination Callout Banner */}
      {report.terminatedEarly && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex items-start gap-3.5">
          <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold text-red-600 dark:text-red-400 text-base flex items-center gap-2">
              Assessment Terminated Early
              <Badge className="bg-red-500/20 text-red-500 border-0 text-[10px]">Proctoring Enforcement</Badge>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {report.terminationReason || "This session was terminated due to exceeding the maximum allowed tab-switching warnings (3/3)."}
              {report.tabSwitchCount ? ` Total violations recorded: ${report.tabSwitchCount}.` : ""} All responses submitted up to that moment were evaluated.
            </p>
          </div>
        </div>
      )}

      {/* Overall Score Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6 lg:gap-8">
          {/* Circular Score Gauge */}
          <div className="flex flex-col items-center justify-center shrink-0 self-center md:self-start pt-1">
            <div
              className={`h-32 w-32 rounded-full border-[5px] flex flex-col items-center justify-center shadow-inner ${
                report.overallScore >= 80
                  ? "border-emerald-500 bg-emerald-500/[0.04]"
                  : report.overallScore >= 55
                  ? "border-amber-500 bg-amber-500/[0.04]"
                  : "border-red-500 bg-red-500/[0.04]"
              }`}
            >
              <span className={`text-4xl font-extrabold tracking-tight ${scoreColor(report.overallScore)}`}>
                {report.overallScore}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">out of 100</span>
            </div>
            <div className="mt-2.5 text-sm font-semibold">
              <ScoreGrade score={report.overallScore} />
            </div>
          </div>

          {/* Evaluation Narrative & Rubrics */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Overall Assessment
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {report.overallSummary}
              </p>
            </div>

            {/* Rubric Dimension Cards */}
            <div className="border-t border-border/60 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Evaluation Rubrics
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {dims.map((d) => (
                  <div key={d.label} className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground truncate">{d.label}</span>
                      <span className="text-[10px] text-muted-foreground/80">{d.weight}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-bold ${scoreColor(d.value)}`}>
                        {d.value}
                      </span>
                      <span className="text-[10px] text-muted-foreground">/100</span>
                    </div>
                    <Progress value={d.value} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Strengths / Weaknesses / Improvements */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 text-base">Key Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {(report.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-red-500/25 bg-red-500/[0.04] p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2 pb-2.5 border-b border-red-500/20">
            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            <h3 className="font-semibold text-red-600 dark:text-red-400 text-base">Critical Weaknesses</h3>
          </div>
          <ul className="space-y-2.5">
            {(report.weaknesses || []).map((w, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Points to Improve */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-primary/25 bg-primary/[0.04] p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2 pb-2.5 border-b border-primary/20">
            <TrendingUp className="h-5 w-5 text-primary shrink-0" />
            <h3 className="font-semibold text-primary text-base">Points to Improve</h3>
          </div>
          <ul className="space-y-2.5">
            {(report.pointsToImprove || []).map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Question-by-Question Review */}
      <div className="space-y-4 pt-2">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Question-by-Question Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review detailed feedback, dimension scoring, and expert model answers for each response.
          </p>
        </div>

        <Accordion value={expandedQs} onValueChange={setExpandedQs} className="space-y-3">
          {(report.questions || []).map((q, i) => (
            <AccordionItem
              key={i}
              value={String(i)}
              className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline text-left py-4 px-5 sm:px-6">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 pr-3">
                  <span className="mt-0.5 text-xs font-bold text-primary shrink-0 bg-primary/10 border border-primary/20 rounded-full h-7 w-7 flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm sm:text-base font-semibold text-foreground leading-snug line-clamp-2">
                      {q.question}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] px-2 py-0 border ${scoreBg(q.score ?? 0)}`}>
                        Score: {q.score ?? 0}/100
                      </Badge>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 sm:px-6 pb-6 pt-2 space-y-5 border-t border-border/50">
                {/* Rubric mini bars */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[
                    { label: "Correctness", val: q.correctnessScore },
                    { label: "Reasoning", val: q.reasoningScore },
                    { label: "Clarity", val: q.clarityScore },
                    { label: "Coverage", val: q.coverageScore },
                  ].map((d) => (
                    <div key={d.label} className="rounded-xl bg-muted/30 border border-border/50 p-2.5 space-y-1">
                      <p className="text-[11px] text-muted-foreground">{d.label}</p>
                      <p className={`text-base font-bold ${scoreColor(d.val ?? 0)}`}>
                        {d.val ?? 0}<span className="text-[10px] text-muted-foreground font-normal">/100</span>
                      </p>
                      <Progress value={d.val ?? 0} className="h-1" />
                    </div>
                  ))}
                </div>

                {/* AI Feedback */}
                <div className="rounded-xl bg-muted/20 border border-border/60 p-4 space-y-1">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Evaluation Feedback</p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {q.feedback}
                  </p>
                </div>

                {/* Strengths / Improvements */}
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {q.strengths && q.strengths.length > 0 && (
                    <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 p-4 space-y-2">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">Demonstrated Positives</p>
                      <ul className="space-y-1.5 text-muted-foreground">
                        {q.strengths.map((s, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {q.improvements && q.improvements.length > 0 && (
                    <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/20 p-4 space-y-2">
                      <p className="font-semibold text-amber-600 dark:text-amber-400 text-xs uppercase tracking-wider">Points to Polish</p>
                      <ul className="space-y-1.5 text-muted-foreground">
                        {q.improvements.map((im, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                            <span>{im}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Candidate vs Model Answer */}
                <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm">
                  <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Your Submitted Answer</p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {q.userAnswer || <span className="italic text-muted-foreground/60">No answer provided</span>}
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-4 space-y-2">
                    <p className="font-semibold text-primary text-xs uppercase tracking-wider">Expected Model Answer</p>
                    <p className="text-muted-foreground leading-relaxed">{q.expectedAnswer}</p>
                    {q.keyConcepts?.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Key Concepts</p>
                        <div className="flex flex-wrap gap-1.5">
                          {q.keyConcepts.map((c) => (
                            <Badge key={c} className="bg-blue-500/10 text-blue-500 border-0 text-[10px] font-medium">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MockInterviewPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [role, setRole] = useState("");
  const [type, setType] = useState<InterviewType>("technical");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  // Active interview state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);

  // Proctoring & Fullscreen state
  const [warnings, setWarnings] = useState(0);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showTerminatedDialog, setShowTerminatedDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Loading states
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // History & report
  const [history, setHistory] = useState<MockReport[]>([]);
  const [report, setReport] = useState<MockReport | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fresh state refs for event listeners and async triggers
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  const warningsRef = useRef(warnings);
  warningsRef.current = warnings;
  const lastViolationTimeRef = useRef<number>(0);
  const terminatingRef = useRef<boolean>(false);

  // Pre-fill role from profile
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.targetRole) setRole(json.data.targetRole);
      })
      .catch(() => {});
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/mock-interview");
      if (res.ok) {
        const json = await res.json();
        if (json.data) setHistory(json.data);
      }
    } catch {}
  };

  // Fullscreen controls
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Browser may reject if no direct gesture or iframe sandbox
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {}
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Start interview & activate fullscreen
  const handleStart = async () => {
    if (!role.trim()) {
      toast.error("Please enter a target role");
      return;
    }
    setStarting(true);
    try {
      // Trigger fullscreen on user click
      enterFullscreen();

      const res = await fetch("/api/mock-interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, interviewType: type, difficulty }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSessionId(json.data.sessionId);
      setQuestions(json.data.questions);
      setAnswers(new Array(json.data.questions.length).fill(""));
      setCurrent(0);
      setWarnings(0);
      terminatingRef.current = false;
      setStage("active");
    } catch (err: any) {
      toast.error(err?.message || "Failed to start interview");
      exitFullscreen();
    } finally {
      setStarting(false);
    }
  };

  // Finish interview (normal finish or early termination)
  const handleFinish = async (
    terminatedEarly = false,
    terminationReason?: string
  ) => {
    const curSessionId = sessionIdRef.current;
    if (!curSessionId) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/mock-interview/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: curSessionId,
          answers: answersRef.current,
          terminatedEarly,
          terminationReason,
          tabSwitchCount: warningsRef.current,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      exitFullscreen();
      setReport(json.data);
      setStage("report");
      await fetchHistory();

      if (terminatedEarly) {
        toast.error("Assessment terminated due to tab switching.");
      } else {
        toast.success("Report generated!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Tab switching & Proctoring event listeners during Active Stage
  useEffect(() => {
    if (stage !== "active") return;

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleViolation = () => {
      if (terminatingRef.current) return;

      // Debounce events within 1500ms (prevent double trigger from visibilitychange + blur)
      const now = Date.now();
      if (now - lastViolationTimeRef.current < 1500) return;
      lastViolationTimeRef.current = now;

      setWarnings((prev) => {
        const next = prev + 1;
        if (next <= 3) {
          setShowWarningDialog(true);
          return next;
        } else {
          // Exceeded 3 warnings — auto-terminate assessment immediately!
          terminatingRef.current = true;
          setShowWarningDialog(false);
          setShowTerminatedDialog(true);
          handleFinish(
            true,
            "Exceeded maximum allowed tab-switching warnings (3/3)"
          );
          return next;
        }
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleBlur = () => {
      handleViolation();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [stage]);

  const handleStartNew = () => {
    exitFullscreen();
    setSessionId(null);
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setWarnings(0);
    setReport(null);
    setStage("setup");
  };

  const handleViewReport = (r: MockReport) => {
    setReport(r);
    setStage("report");
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await fetch("/api/mock-interview", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success("Deleted");
      await fetchHistory();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {stage === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SetupStage
              role={role}
              setRole={setRole}
              type={type}
              setType={setType}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              onStart={handleStart}
              starting={starting}
              history={history}
              onViewReport={handleViewReport}
              onDeleteHistory={handleDeleteHistory}
            />
          </motion.div>
        )}

        {stage === "active" && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ActiveStage
              questions={questions}
              answers={answers}
              setAnswers={setAnswers}
              current={current}
              setCurrent={setCurrent}
              role={role}
              type={type}
              difficulty={difficulty}
              onFinish={() => handleFinish(false)}
              submitting={submitting}
              warnings={warnings}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </motion.div>
        )}

        {stage === "report" && report && (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReportStage report={report} onStartNew={handleStartNew} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switching Warning Modal (Warning 1, 2, or 3 of 3) */}
      <AlertDialog open={showWarningDialog}>
        <AlertDialogContent
          className={`rounded-2xl border ${
            warnings >= 3
              ? "border-red-500/50 bg-card shadow-2xl shadow-red-500/10"
              : warnings === 2
              ? "border-orange-500/50 bg-card shadow-2xl shadow-orange-500/10"
              : "border-amber-500/50 bg-card shadow-2xl shadow-amber-500/10"
          }`}
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${
                  warnings >= 3
                    ? "bg-red-500/10 text-red-500"
                    : warnings === 2
                    ? "bg-orange-500/10 text-orange-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <Badge
                  className={`text-[10px] uppercase font-bold tracking-wider border mb-1 ${
                    warnings >= 3
                      ? "bg-red-500/10 text-red-500 border-red-500/30"
                      : warnings === 2
                      ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                  }`}
                >
                  {warnings >= 3 ? "Final Warning (3 of 3)" : `Warning ${warnings} of 3`}
                </Badge>
                <AlertDialogTitle className="text-lg">
                  {warnings >= 3
                    ? "Final Warning: Tab Switching Prohibited"
                    : `Tab Switching Detected (Warning ${warnings}/3)`}
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="space-y-2 pt-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                You navigated away from the mock interview tab or minimized the window.
              </p>
              {warnings < 3 ? (
                <p className="text-foreground font-medium">
                  You have <span className="text-amber-500 font-bold">{3 - warnings}</span> warning(s) remaining before your interview is automatically terminated and submitted.
                </p>
              ) : (
                <p className="text-red-500 font-bold">
                  You have 0 warnings remaining. Any further tab switch, minimizing, or window loss of focus will IMMEDIATELY end your assessment and submit your current responses.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3">
            <AlertDialogAction
              onClick={() => {
                setShowWarningDialog(false);
                enterFullscreen();
              }}
              className={`rounded-xl text-white font-semibold ${
                warnings >= 3
                  ? "bg-red-500 hover:bg-red-600"
                  : warnings === 2
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-amber-500 hover:bg-amber-600 text-black dark:text-white"
              }`}
            >
              I Understand & Resume Assessment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Auto-Terminated Dialog */}
      <AlertDialog open={showTerminatedDialog}>
        <AlertDialogContent
          className="rounded-2xl border-red-500/40 bg-card shadow-2xl shadow-red-500/15"
        >
          <AlertDialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 mb-2">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl text-red-500 font-bold">
              Assessment Terminated
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-1 text-sm text-muted-foreground leading-relaxed">
              <p>
                You have exceeded the maximum limit of <strong>3 tab-switching warnings</strong>.
              </p>
              <p>
                Your interview session was terminated under proctoring policy rules. All answers recorded up to this point have been submitted for evaluation.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogAction
              disabled={submitting}
              onClick={() => setShowTerminatedDialog(false)}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium"
            >
              {submitting ? "Evaluating responses..." : "View Performance Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) handleDeleteHistory(deleteId);
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
