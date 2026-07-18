"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  FileText,
  Target,
  Sparkles,
  Trophy,
  ChartBar,
  GraduationCap,
  FolderGit2,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileText,
    title: "Smart Resume Parsing",
    description:
      "AI extracts your skills, projects, experience, and achievements into a structured profile instantly.",
    color: "card-mint",
    iconColor: "text-emerald-600",
  },
  {
    icon: Trophy,
    title: "Career Readiness Score",
    description:
      "Get a comprehensive 6-dimension score — Resume, Technical, Projects, Communication, and more.",
    color: "card-lavender",
    iconColor: "text-violet-600",
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description:
      "Instantly identify what skills you're missing for your dream role and why each one matters.",
    color: "card-sky",
    iconColor: "text-blue-600",
  },
  {
    icon: ChartBar,
    title: "AI Learning Roadmap",
    description:
      "Receive a personalized 6-week week-by-week roadmap with topics, deliverables, and resources.",
    color: "card-yellow",
    iconColor: "text-amber-600",
  },
  {
    icon: FolderGit2,
    title: "Project Recommendations",
    description:
      "Get 6 curated portfolio project ideas tailored to your skills and target role.",
    color: "card-peach",
    iconColor: "text-orange-600",
  },
  {
    icon: Brain,
    title: "Interview Preparation",
    description:
      "AI-generated Technical and HR interview questions with answers, STAR guidance, and key concepts.",
    color: "card-mint",
    iconColor: "text-teal-600",
  },
];

const steps = [
  { step: "01", title: "Sign in", desc: "Quick Google login — no setup needed." },
  { step: "02", title: "Upload Resume", desc: "Upload your PDF or DOCX resume." },
  { step: "03", title: "AI Analysis", desc: "AI extracts and structures your profile in seconds." },
  { step: "04", title: "Get Insights", desc: "Access your score, roadmap, ATS review, and more." },
];

const stats = [
  { label: "AI Modules", value: "7+" },
  { label: "Analysis Time", value: "<10s" },
  { label: "Career Dimensions", value: "6" },
  { label: "Roadmap Weeks", value: "6" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">CareerPilot AI</span>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs border-0">
              Beta
            </Badge>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm">
                Sign in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="rounded-full bg-primary text-white hover:bg-primary/90 gap-1.5">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden px-6 pb-24 pt-20 text-center">
        {/* Background orbs */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-24 h-72 w-72 translate-x-1/2 rounded-full bg-blue-400/8 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mx-auto max-w-4xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
            <Zap className="h-3.5 w-3.5" />
            Powered by Google Gemini AI
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Your AI Career{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Co-Pilot
            </span>{" "}
            for Placement Success
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Upload your resume. Get your career readiness score, skill gaps, personalized roadmap,
            ATS review, project ideas, and interview questions — all powered by AI.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="rounded-full bg-primary px-8 text-white hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2"
              >
                Start for Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="rounded-full px-8 gap-2">
                See How it Works
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {["No credit card required", "Free to use", "AI-powered insights"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl px-4 py-5 shadow-sm"
            >
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-0 hover:bg-primary/10">
              Everything you need
            </Badge>
            <h2 className="text-4xl font-bold text-foreground md:text-5xl">
              7 AI-powered career tools
              <br />
              in one platform
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Every feature is built on AI — not templates or generic advice.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`group relative overflow-hidden rounded-3xl p-6 ${feature.color} shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-background shadow-sm dark:bg-black/20">
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-0 hover:bg-primary/10">
              Simple 4-step process
            </Badge>
            <h2 className="text-4xl font-bold text-foreground md:text-5xl">
              From resume to career insights
              <br />
              in under a minute
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative rounded-3xl bg-card p-6 shadow-sm border border-border"
              >
                <span className="mb-4 inline-block text-5xl font-black text-primary/15">
                  {s.step}
                </span>
                <h3 className="mb-2 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-primary/40 lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-400 p-12 text-center shadow-2xl shadow-primary/25"
        >
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h2 className="mb-4 text-4xl font-bold text-white">
            Ready to accelerate your career?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-lg text-white/80">
            Join students who are using AI to land their dream placements faster.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="rounded-full bg-white px-10 text-primary hover:bg-white/90 shadow-lg font-semibold gap-2"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-white/60">
            <Shield className="inline h-3.5 w-3.5 mr-1" />
            No credit card · Free forever
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">CareerPilot AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 CareerPilot AI. Built with ❤️ for students everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
