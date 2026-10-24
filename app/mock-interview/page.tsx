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
  Mic,
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
import { VoiceRecorder } from "@/components/mock-interview/VoiceRecorder";

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

const POPULAR_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
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
  onRequestDelete: (id: string) => void;
  timerEnabled: boolean;
  setTimerEnabled: (v: boolean) => void;
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
  onRequestDelete,
  timerEnabled,
  setTimerEnabled,
}: SetupStageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-xs shrink-0">
          <Video className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Mock Interview</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real interview simulation with voice answers, fullscreen proctoring, and comprehensive AI evaluation.
          </p>
        </div>
      </div>

      {/* Config Card - Minimalist */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs space-y-5">
        <div className="border-b border-border/50 pb-3.5">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Session Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure your target job role, interview focus, and difficulty level.
          </p>
        </div>

        {/* Target Role with compact suggestions */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Role</label>
          <Input
            placeholder="e.g. Frontend Developer, Full Stack, Data Scientist..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 rounded-xl bg-background text-sm"
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <span className="text-[11px] text-muted-foreground font-medium">Popular:</span>
            {POPULAR_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-lg px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                  role === r
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Type & Difficulty Segmented Selectors */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interview Type</label>
            <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border/50 w-full">
              {(["technical", "hr"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    type === t
                      ? "bg-background text-foreground shadow-xs border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "technical" ? "Technical Focus" : "HR & Behavioral"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty Level</label>
            <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border/50 w-full">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 text-xs font-semibold capitalize rounded-lg transition-all ${
                    difficulty === d
                      ? "bg-background text-foreground shadow-xs border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assessment Timer Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">15-Minute Session Timer</span>
              <Badge variant="outline" className="text-[10px] font-normal border-border/50">Optional</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {timerEnabled ? "Countdown timer will guide your pacing during the interview" : "No time limit — answer each question at your own pace"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={timerEnabled}
            onClick={() => setTimerEnabled(!timerEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              timerEnabled ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                timerEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Minimalist Guidelines Accordion */}
        <Accordion className="border-t border-border/40 pt-1">
          <AccordionItem value="rules" className="border-0">
            <AccordionTrigger className="py-2 text-xs text-muted-foreground hover:text-foreground hover:no-underline">
              <span className="flex items-center gap-2 font-medium">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Rules & Proctoring Guidelines (Fullscreen, 3 warnings)
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-2 text-xs text-muted-foreground">
              <div className="grid sm:grid-cols-2 gap-2 rounded-xl bg-muted/30 p-3.5 border border-border/40 text-[11px]">
                <p>• <strong>Fullscreen Portal:</strong> Launches in focused fullscreen examination mode.</p>
                <p>• <strong>3 Warnings Rule:</strong> Tab switching or unfocusing is monitored — 3 warnings before auto-termination.</p>
                <p>• <strong>Voice or Text:</strong> Answer via microphone (with AI filler-word removal) or by typing.</p>
                <p>• <strong>Grading:</strong> Graded on Correctness (40%), Reasoning (25%), Clarity (20%), Coverage (15%).</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button
          onClick={onStart}
          disabled={starting}
          className="h-11 w-full rounded-xl bg-primary text-white gap-2 font-semibold text-sm shadow-sm hover:shadow-md transition-all"
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
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Past Mock Interviews
            </h2>
            <span className="text-xs text-muted-foreground">{history.length} session{history.length === 1 ? "" : "s"}</span>
          </div>
          <div className="space-y-2.5">
            {history.map((record) => (
              <div
                key={record._id}
                className={`rounded-xl border bg-card p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-primary/30 ${difficultyBorder[record.difficulty]}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">{record.role}</span>
                    <Badge className={difficultyColors[record.difficulty]}>{record.difficulty}</Badge>
                    <Badge className="bg-blue-500/10 text-blue-500 border-0 capitalize text-[10px]">{record.interviewType}</Badge>
                    {record.terminatedEarly && (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/30 text-[10px] gap-1">
                        <ShieldAlert className="h-3 w-3" /> Terminated
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`font-bold ${scoreColor(record.overallScore)}`}>
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
                    className="rounded-lg gap-1.5 text-xs h-8"
                    onClick={() => onViewReport(record)}
                  >
                    <BarChart3 className="h-3.5 w-3.5" /> View Report
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                    title="Delete interview record"
                    onClick={() => onRequestDelete(record._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
  timerEnabled: boolean;
  timeRemaining: number;
  onToggleTimer: () => void;
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
  timerEnabled,
  timeRemaining,
  onToggleTimer,
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
      {/* Top Proctoring & Status Bar */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
            <Video className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[150px] sm:max-w-none">{role}</span>
              <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
              <Badge className="bg-blue-500/10 text-blue-500 border-0 capitalize text-[10px] hidden sm:inline-flex">{type}</Badge>
            </div>
          </div>
        </div>

        {/* Proctoring Indicators & Timer */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Timer Toggle Button */}
          <button
            type="button"
            onClick={onToggleTimer}
            title={timerEnabled ? "Timer active (click to toggle)" : "Click to enable 15-minute timer"}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
              !timerEnabled
                ? "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                : timeRemaining < 120
                ? "border-red-500/40 bg-red-500/10 text-red-500 animate-pulse font-bold"
                : timeRemaining < 300
                ? "border-amber-500/40 bg-amber-500/10 text-amber-500 font-semibold"
                : "border-primary/30 bg-primary/10 text-primary font-semibold"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {timerEnabled ? (
              <span>
                {Math.floor(timeRemaining / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {(timeRemaining % 60)
                  .toString()
                  .padStart(2, "0")}
              </span>
            ) : (
              <span className="font-sans text-[11px]">Timer: Off</span>
            )}
          </button>

          {/* Proctoring status badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden md:inline">Proctored</span>
          </div>

          {/* Warning count badge */}
          <div
            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
              warnings === 0
                ? "border-border/60 bg-muted/30 text-muted-foreground"
                : warnings === 1
                ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                : warnings === 2
                ? "border-orange-500/30 bg-orange-500/10 text-orange-500"
                : "border-red-500/40 bg-red-500/15 text-red-500 animate-pulse"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{warnings}/3</span>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullscreen}
            className="h-8 px-2 rounded-lg text-xs gap-1 text-muted-foreground hover:text-foreground"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5 text-amber-500" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Examination View - Minimalist & Focused */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-4">
        {/* Unified Assessment Card */}
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden"
        >
          {/* Subtle Progress Bar on Top Edge */}
          <Progress value={progress} className="h-1 rounded-none bg-muted/40" />

          {/* Card Header: Navigation & Question Counter */}
          <div className="px-5 sm:px-7 py-3.5 flex items-center justify-between border-b border-border/50 bg-muted/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-foreground">
                Question {current + 1} of {total}
              </span>
              <div className="flex items-center gap-1.5">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrent(i)}
                    title={`Question ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === current
                        ? "w-6 bg-primary"
                        : answers[i]?.trim()
                        ? "w-2 bg-emerald-500"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {answeredCount}/{total} answered
            </span>
          </div>

          {/* Question Prompt */}
          <div className="p-5 sm:p-7 space-y-2 border-b border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Interview Question</span>
            <h2 className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
              {q?.question}
            </h2>
          </div>

          {/* Answer Area */}
          <div className="p-5 sm:p-7 space-y-4">
            {/* Prominent Voice Answer Action Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/[0.04] border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Mic className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-foreground">Record Answer with Voice</p>
                    <Badge className="bg-primary/15 text-primary border-0 text-[10px] font-semibold">AI Clean</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Speak naturally — filler words (um, uh, like) are automatically cleaned.
                  </p>
                </div>
              </div>
              <VoiceRecorder
                onTranscribe={(cleanText) => {
                  const existing = answers[current]?.trim() || "";
                  const merged = existing ? `${existing} ${cleanText}` : cleanText;
                  updateAnswer(merged);
                }}
                disabled={submitting}
              />
            </div>

            {/* Response Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Written Answer
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
                    ? "Type your technical explanation here, or click Record Answer above to speak..."
                    : "Structure your response using STAR, or click Record Answer above to speak..."
                }
                className="w-full resize-none rounded-xl border border-border/70 bg-background p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all min-h-[160px]"
              />
            </div>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <Button
            variant="outline"
            className="rounded-xl gap-2 h-10 px-4 text-xs font-medium"
            disabled={current === 0}
            onClick={() => setCurrent(current - 1)}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          {current < total - 1 ? (
            <Button
              className="rounded-xl gap-2 bg-primary text-white h-10 px-5 text-xs font-medium shadow-2xs"
              onClick={() => setCurrent(current + 1)}
            >
              Next Question <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-5 text-xs font-medium shadow-2xs"
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

  // Timer state
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 mins default

  // Session countdown timer
  useEffect(() => {
    if (stage !== "active" || !timerEnabled) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.warning("Assessment timer expired! Wrap up your responses and submit when ready.", {
            duration: 6000,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, timerEnabled]);

  const handleToggleTimer = () => {
    if (!timerEnabled && timeRemaining <= 0) {
      setTimeRemaining(15 * 60);
    }
    setTimerEnabled((prev) => !prev);
  };

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
              onRequestDelete={(id) => setDeleteId(id)}
              timerEnabled={timerEnabled}
              setTimerEnabled={setTimerEnabled}
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
              timerEnabled={timerEnabled}
              timeRemaining={timeRemaining}
              onToggleTimer={handleToggleTimer}
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
            <AlertDialogTitle>Delete this interview record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this mock interview and its AI evaluation report from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) handleDeleteHistory(deleteId);
                setDeleteId(null);
              }}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
