99"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Brain,
  FileText,
  Target,
  Sparkles,
  Trophy,
  FolderGit2,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Zap,
  Shield,
  ShieldAlert,
  ChevronRight,
  Upload,
  Search,
  Map,
  FileCheck2,
  Mic,
  Video,
  Maximize2,
  Clock,
  BookOpen,
  Layers,
  Volume2,
  Award,
  AlertTriangle,
  BarChart3,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// ─── Latest Updates / Highlights ───────────────────────────────────────────────

const latestModifications = [
  {
    id: "voice-interview",
    icon: Mic,
    badge: "Interactive Voice Simulation",
    title: "Live Speech-to-Text & AI Filler-Word Removal",
    description:
      "Speak your answers naturally using browser audio recording with a real-time waveform visualizer. Gemini AI automatically filters hesitations ('um', 'uh', 'like') while assessing your communication clarity.",
    accent: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-500",
  },
  {
    id: "proctoring",
    icon: ShieldAlert,
    badge: "Exam Integrity",
    title: "Anti-Cheat Fullscreen Proctoring Mode",
    description:
      "Experience real company technical assessment pressure. Fullscreen mode enforces focus, tracking tab switches and window blur events with strike warnings and integrity audits.",
    accent: "from-blue-500/10 to-blue-500/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    id: "scoring-rubric",
    icon: Award,
    badge: "Deterministic AI Rubric",
    title: "4-Pillar Multi-Dimensional Evaluation",
    description:
      "Every response is graded with strict rubric weights: Correctness (40%), Logical Reasoning (25%), Clarity (20%), and Concept Coverage (15%), alongside strengths, weaknesses, and ideal answers.",
    accent: "from-purple-500/10 to-purple-500/5",
    border: "border-purple-500/20",
    iconColor: "text-purple-500",
  },
  {
    id: "rag-engine",
    icon: BookOpen,
    badge: "Phase 2 Grounding",
    title: "RAG Knowledge Base & Verified Citations",
    description:
      "Say goodbye to AI hallucinations. Recommendations, skill prerequisites, and interview questions are grounded in verified competency frameworks with citation metadata.",
    accent: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
    iconColor: "text-amber-500",
  },
  {
    id: "timers-history",
    icon: Clock,
    badge: "Session Control",
    title: "Flexible Timers & Session History Archives",
    description:
      "Toggle per-question countdowns, overall interview limits, or practice untimed. Review past mock interview reports anytime and manage your history with safe deletion confirmations.",
    accent: "from-cyan-500/10 to-cyan-500/5",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-500",
  },
  {
    id: "ats-optimizer",
    icon: FileCheck2,
    badge: "ATS Precision",
    title: "ATS Deep Parsing & Quantified Bullet Rewrites",
    description:
      "Run your resume through simulated Applicant Tracking System parsers. Get keyword match percentages and instant, impact-driven bullet-point rewrites with quantifiable metrics.",
    accent: "from-rose-500/10 to-rose-500/5",
    border: "border-rose-500/20",
    iconColor: "text-rose-500",
  },
];

// ─── Platform Features ────────────────────────────────────────────────────────

const features = [
  {
    id: "mock-interview",
    icon: Video,
    title: "Proctored AI Mock Interviews",
    description: "Practice role-specific interviews with voice recording, live waveform visualizers, anti-cheat monitoring, and 4-dimension scoring.",
  },
  {
    id: "ats",
    icon: FileCheck2,
    title: "ATS Resume Analysis",
    description: "Determine how Applicant Tracking Systems parse your resume and get actionable fixes for formatting and keyword gaps.",
  },
  {
    id: "readiness",
    icon: Trophy,
    title: "Placement-Readiness Score",
    description: "Receive a comprehensive 0-100 score evaluating your technical skills, project depth, experience quality, and role alignment.",
  },
  {
    id: "gap",
    icon: Target,
    title: "Skill-Gap Identification",
    description: "Identify exactly which skills you lack for your target role, categorized by High, Medium, and Low priorities with prerequisite mapping.",
  },
  {
    id: "roadmap",
    icon: Map,
    title: "Dynamic Career Roadmaps",
    description: "Follow a step-by-step phased weekly learning plan tailored specifically to your profile, milestones, and target companies.",
  },
  {
    id: "projects",
    icon: FolderGit2,
    title: "Curated Project Blueprints",
    description: "Build a standout proof-of-work portfolio with curated project architectures, tech stacks, and step-by-step implementation guides.",
  },
  {
    id: "interview",
    icon: Brain,
    title: "Targeted Interview Practice",
    description: "Access curated technical and behavioral question banks generated from your resume with structured STAR-method answer frameworks.",
  },
  {
    id: "rag",
    icon: Layers,
    title: "Grounded Knowledge & Citations",
    description: "Backed by an internal RAG knowledge engine and verified industry competency frameworks to guarantee actionable, hallucination-free advice.",
  },
];

// ─── FAQs ─────────────────────────────────────────────────────────────────────

const faqs = [
  {
    question: "How does the Live Voice Mock Interview work?",
    answer: "You select your target role (e.g., Full Stack, Backend, Data Science), interview type (Technical or HR), and difficulty level. During the interview, you speak your answers naturally into your microphone. Our engine records and transcribes your speech in real-time, intelligently strips hesitations and filler words ('um', 'uh', 'like'), and submits your answer to Google Gemini for multi-dimensional grading.",
  },
  {
    question: "What is the anti-cheat proctoring feature during mock interviews?",
    answer: "To simulate the rigorous conditions of real company technical screens, our examination mode operates in fullscreen. The system monitors tab switching, window blur, and focus loss, registering strike warnings and tracking integrity throughout the session so you practice with authentic discipline.",
  },
  {
    question: "How are my interview answers evaluated and scored?",
    answer: "Each answer is deterministically graded across four core dimensions: Technical Correctness (40%), Logical Reasoning (25%), Clarity & Communication (20%), and Concept Coverage (15%). You receive a holistic scorecard with actionable feedback, specific strengths, weaknesses, and a model ideal answer.",
  },
  {
    question: "How does CareerPilot eliminate AI hallucinations in roadmaps & feedback?",
    answer: "CareerPilot AI integrates a curated Retrieval-Augmented Generation (RAG) knowledge base. Recommendations for skills, prerequisite dependencies, and interview rubrics are matched and validated against verified competency frameworks and include verifiable citations.",
  },
  {
    question: "How does CareerPilot evaluate my resume for ATS compliance?",
    answer: "Our parser uses Mozilla's pdfjs-dist binary text extractor to simulate how enterprise Applicant Tracking Systems inspect your resume. It analyzes keyword density against current industry job descriptions, checks layout parsability, and provides before-and-after bullet rewrites with quantifiable metrics.",
  },
  {
    question: "Is my voice recording and resume data private and secure?",
    answer: "Yes, completely. Your audio stream is converted into text solely for evaluation and is never sold or shared with third-party advertisers. All resume profiles, roadmaps, and mock interview reports are privately stored under your authenticated account.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded">
              <Image src="/CareerPilot_icon.png" alt="CareerPilot Logo" width={32} height={32} className="h-full w-full object-cover" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">CareerPilot AI</span>
          </div>

          <div className="hidden items-center gap-8 lg:flex">
            <a href="#updates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
              What's New
            </a>
            <a href="#workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#showcase" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Platform Preview
            </a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:block w-px h-4 bg-border"></div>
            <Link href="/mock-interview" className="hidden sm:flex">
              <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-foreground hover:bg-primary/10">
                <Video className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold">Mock Interview</span>
              </Button>
            </Link>
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-6 pb-14 md:pt-10 md:pb-18 lg:pt-12 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* Left Column: Editorial Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-6 xl:col-span-6"
            >
              {/* Announcement Badge */}
              <a
                href="#updates"
                className="group mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>Just Released: Voice Mock Interviews & Anti-Cheat Proctoring</span>
                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </a>

              <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
                Make your next <br className="hidden sm:block" />
                career move with <span className="text-primary">clarity.</span>
              </h1>

              <p className="mb-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Stop guessing what recruiters want. CareerPilot AI audits your resume, uncovers skill gaps, generates dynamic roadmaps, and trains you with live voice mock interviews under real proctored conditions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 mb-8">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12 px-7 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm">
                    Analyze My Resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/mock-interview">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-7 font-semibold border-primary/30 hover:bg-primary/10">
                    <Video className="mr-2 h-4 w-4 text-primary" />
                    Try Mock Interview
                  </Button>
                </Link>
                <a href="#updates" className="hidden xl:block">
                  <Button variant="ghost" size="lg" className="text-base h-12 px-5 text-muted-foreground">
                    What's New
                  </Button>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:flex items-center gap-4 text-xs sm:text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mic className="h-4 w-4 text-primary" />
                  <span>Live Voice Evaluation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" />
                  <span>4-Pillar Rubric</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No credit card</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Graphic Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-6 xl:col-span-6 relative w-full flex items-center justify-center lg:justify-end"
            >
              {/* Decorative background glow */}
              <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-3xl opacity-50 dark:opacity-30 pointer-events-none"></div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="relative z-10 w-full"
              >
                <Image
                  src="/Hero_section_Img.png"
                  alt="CareerPilot AI Platform Ecosystem"
                  width={1400}
                  height={933}
                  className="w-full h-auto drop-shadow-2xl pointer-events-none select-none object-contain"
                  draggable={false}
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── NEW: Latest Modifications & Upgrades Section ──────────────────────── */}
      <section id="updates" className="px-6 py-20 bg-secondary/30 border-y border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
              Latest Platform Modifications
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Engineered for authentic interview success
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              We've upgraded CareerPilot AI with real-time speech processing, anti-cheat proctoring, and grounded intelligence so you enter real placement rounds with unmatched confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestModifications.map((item) => (
              <div
                key={item.id}
                className={`relative rounded-2xl border ${item.border} bg-card p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent}`}>
                      <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-md bg-secondary">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs font-medium text-primary flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Production Ready
                  </span>
                  {item.id === "voice-interview" || item.id === "proctoring" ? (
                    <Link href="/mock-interview" className="text-xs font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1">
                      Try Now <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Structured Workflow: 4-Stage Path ─────────────────────────────────── */}
      <section id="workflow" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 md:text-center">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
              End-to-End Progression
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              A structured, 4-stage path to placement
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground md:mx-auto max-w-2xl">
              Stop applying blindly. Understand exactly where you stand, upgrade your portfolio, and test your skills in proctored simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="h-11 w-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Stage 01</div>
                <h3 className="text-lg font-bold text-foreground mb-2.5">Upload & Parse Resume</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Drop your PDF. Mozilla's binary parser instantly structures your work history, skills, and projects without manual data entry.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                Instant ATS parsing
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="h-11 w-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5">
                  <Search className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Stage 02</div>
                <h3 className="text-lg font-bold text-foreground mb-2.5">Audit Gaps & ATS Fit</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Uncover missing role keywords, ATS formatting errors, and priority skill gaps (High, Medium, Low) for your target position.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                Before/after bullet rewrites
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="h-11 w-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5">
                  <Map className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Stage 03</div>
                <h3 className="text-lg font-bold text-foreground mb-2.5">Follow Career Roadmap</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Execute a week-by-week action plan. Complete production-grade portfolio projects and learn missing skills with verified citations.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                Curated portfolio blueprints
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-2xl border border-primary/40 bg-card p-6 flex flex-col justify-between shadow-xs ring-1 ring-primary/20">
              <div>
                <div className="h-11 w-11 bg-primary/15 text-primary rounded-xl flex items-center justify-center mb-5">
                  <Video className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Stage 04</div>
                <h3 className="text-lg font-bold text-foreground mb-2.5">Live Mock Interview</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Test your real readiness verbally in fullscreen examination mode with live waveform feedback and 4-pillar rubric grading.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border/50 text-xs font-semibold text-primary">
                Voice recording + Proctoring
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Platform Features Grid ────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24 bg-secondary/20 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
              Comprehensive Suite
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Complete career intelligence
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Everything you need to optimize your resume, upskill strategically, and ace high-pressure interviews in a single ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/40 transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Interactive Product Showcase ──────────────────────────────────────── */}
      <section id="showcase" className="px-6 py-24 bg-secondary/30 border-y border-border overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
              Interactive Preview
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Inside the CareerPilot platform
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore how CareerPilot evaluates your responses, diagnoses resume gaps, and structures your path.
            </p>
          </div>

          <Tabs defaultValue="mock" className="w-full max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 p-1.5 bg-muted/60 dark:bg-card border border-border rounded-xl gap-1 h-auto">
              <TabsTrigger value="mock" className="py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg">
                🎙️ Mock Interview
              </TabsTrigger>
              <TabsTrigger value="review" className="py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg">
                📄 ATS Resume Review
              </TabsTrigger>
              <TabsTrigger value="gaps" className="py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg">
                🎯 Skill-Gap Analysis
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg">
                🗺️ Career Roadmap
              </TabsTrigger>
            </TabsList>

            <div className="relative rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-8 min-h-[420px]">
              {/* Tab 1: Mock Interview Showcase */}
              <TabsContent value="mock" className="mt-0 outline-none space-y-6">
                {/* Examination Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-medium">
                      Full Stack Engineer
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 font-medium">
                      Medium Difficulty
                    </Badge>
                    <span className="text-xs text-muted-foreground">Question 2 of 5</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>02:45 remaining</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Fullscreen Proctoring Active (0 Flags)</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Question Card */}
                <div className="rounded-xl border border-border/80 bg-secondary/30 p-5 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Technical Question</span>
                  <p className="text-base sm:text-lg font-semibold text-foreground leading-snug">
                    "Explain the difference between optimistic and pessimistic concurrency control in database systems, and give an example scenario where you would prefer optimistic concurrency."
                  </p>
                </div>

                {/* Simulated Voice Recorder & Waveform */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-pulse">
                      <Mic className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span>Recording Voice Answer</span>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                      </div>
                      <p className="text-xs text-muted-foreground">Live audio waveform active • Hesitations & filler words filtered</p>
                    </div>
                  </div>

                  {/* Audio Waveform visualization simulation */}
                  <div className="flex items-center gap-1 h-8 px-4 bg-background/60 rounded-lg border border-border">
                    <span className="w-1 bg-emerald-500 rounded-full h-4 animate-pulse"></span>
                    <span className="w-1 bg-emerald-500 rounded-full h-7 animate-pulse delay-75"></span>
                    <span className="w-1 bg-emerald-500 rounded-full h-3 animate-pulse delay-150"></span>
                    <span className="w-1 bg-emerald-500 rounded-full h-6 animate-pulse delay-100"></span>
                    <span className="w-1 bg-emerald-500 rounded-full h-8 animate-pulse delay-200"></span>
                    <span className="w-1 bg-emerald-500 rounded-full h-5 animate-pulse delay-75"></span>
                    <span className="w-1 bg-emerald-500 rounded-full h-2 animate-pulse"></span>
                  </div>
                </div>

                {/* 4-Pillar Scorecard Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Evaluation Scorecard</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Score: 88/100 (Excellent)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-border bg-card p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Correctness (40%)</div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">92%</div>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Reasoning (25%)</div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">88%</div>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Clarity (20%)</div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">85%</div>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Coverage (15%)</div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">86%</div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/80 bg-secondary/20 p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">AI Insight: </strong>
                    Demonstrated crisp distinction between lock mechanisms and version timestamp checks. Great application example for low-contention e-commerce checkout.
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Resume Review */}
              <TabsContent value="review" className="mt-0 outline-none">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <FileCheck2 className="h-4 w-4 text-primary" /> ATS Score & Keyword Distribution
                      </h4>
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium">Keyword Match (Software Engineer)</span>
                            <span className="text-sm font-bold text-emerald-600">88%</span>
                          </div>
                          <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-[88%]"></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium">Formatting & Section Hierarchy</span>
                            <span className="text-sm font-bold text-emerald-600">92%</span>
                          </div>
                          <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-[92%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" /> Bullet-Point Action Transformation
                      </h4>
                      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                        <div className="text-xs text-muted-foreground line-through">
                          "Helped with backend APIs and fixed some slow queries."
                        </div>
                        <div className="text-sm font-medium text-foreground bg-primary/5 p-3 rounded-lg border border-primary/20">
                          "Architected 12 RESTful API endpoints in Node.js and indexed PostgreSQL queries, slashing average response latency by 45% for 50k+ daily users."
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Skill Gaps */}
              <TabsContent value="gaps" className="mt-0 outline-none space-y-4">
                <h4 className="font-semibold text-foreground">Identified Skill Deficits for Target Role: Full Stack</h4>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-foreground">Distributed Caching (Redis)</h5>
                        <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 border-0 font-medium">
                          High Priority
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                        Required in 82% of modern backend roles. Missing in your portfolio projects and employment history.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 text-xs">View Learning Guide</Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-foreground">Docker & Containerization</h5>
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 font-medium">
                          Medium Priority
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                        Industry standard for multi-container development and CI/CD deployment workflows.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 text-xs">View Learning Guide</Button>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Roadmap */}
              <TabsContent value="roadmap" className="mt-0 outline-none space-y-4">
                <h4 className="font-semibold text-foreground">6-Week Actionable Placement Roadmap</h4>
                <div className="relative border-l-2 border-border ml-3 pl-6 py-2 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                    <h5 className="font-semibold text-foreground text-sm">Week 1: Fundamentals & ATS Bullet Optimization</h5>
                    <p className="text-xs text-muted-foreground mb-2">Rewrite bullet points with quantifiable impact metrics and audit keyword alignment.</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs bg-card">Rewrite 4 Experience Bullets</Badge>
                      <Badge variant="outline" className="text-xs bg-card">Redis Quickstart</Badge>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-border bg-background"></div>
                    <h5 className="font-semibold text-foreground text-sm">Week 2-3: Distributed Cache Portfolio Project</h5>
                    <p className="text-xs text-muted-foreground">Construct an API Gateway with rate limiting and Redis caching to establish proof-of-work.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-border bg-background"></div>
                    <h5 className="font-semibold text-foreground text-sm">Week 4-6: Live Proctored Voice Mock Interviews</h5>
                    <p className="text-xs text-muted-foreground">Run three full technical simulations to eliminate filler words and master concept coverage.</p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* ─── Frequently Asked Questions ────────────────────────────────────────── */}
      <section id="faq" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
              Got Questions?
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground">Everything you need to know about CareerPilot AI and the latest updates.</p>
          </div>

          <Accordion className="w-full mb-20">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors text-base py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Final Call to Action */}
          <div className="rounded-3xl bg-card border border-border p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 tracking-tight">
              Ready to elevate your career readiness?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-lg mx-auto">
              Get an instant ATS audit on your resume, or jump straight into a proctored AI voice mock interview right now.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 h-12 shadow-sm">
                  Analyze My Resume
                </Button>
              </Link>
              <Link href="/mock-interview">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold px-8 h-12 border-primary/30 hover:bg-primary/10">
                  <Video className="mr-2 h-4 w-4 text-primary" />
                  Start Mock Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded">
              <Image src="/CareerPilot_icon.png" alt="CareerPilot Logo" width={24} height={24} className="h-full w-full object-cover" />
            </div>
            <span className="font-bold text-foreground tracking-tight">CareerPilot AI</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#updates" className="hover:text-foreground transition-colors">What's New</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">How It Works</a>
            <Link href="/mock-interview" className="hover:text-foreground transition-colors">Mock Interview</Link>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} CareerPilot AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
