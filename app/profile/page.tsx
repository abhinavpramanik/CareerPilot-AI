"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Check, Sparkles, UserRound, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEGREE_OPTIONS = [
  "B.Tech / B.E.",
  "B.Sc",
  "B.Com",
  "BCA",
  "M.Tech / M.E.",
  "M.Sc",
  "MBA",
  "Ph.D.",
  "Diploma",
];

const BRANCH_OPTIONS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Data Science",
  "Artificial Intelligence",
  "Cybersecurity",
  "Other",
];

const ROLE_OPTIONS = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Mobile Developer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "Product Manager",
];

const YEAR_OPTIONS = ["2024", "2025", "2026", "2027", "2028"];

const ENCOURAGEMENTS = [
  "Awesome! 🎉",
  "Great choice! ✨",
  "Perfect. 🙌",
  "Love it! 🚀",
  "Nice one! ⚡",
];

// ─── Step Config ───────────────────────────────────────────────────────────────

interface Step {
  key: string;
  question: string;
  subtext?: string;
  placeholder?: string;
  type: "text" | "chips" | "year";
  options?: string[];
  required: boolean;
}

const STEPS: Step[] = [
  {
    key: "college",
    question: "Which college or university do you attend?",
    subtext: "This helps us tailor recommendations to your academic context.",
    placeholder: "e.g. IIT Delhi, VIT Vellore…",
    type: "text",
    required: true,
  },
  {
    key: "degree",
    question: "What degree are you pursuing?",
    subtext: "Pick the one that matches your current program.",
    type: "chips",
    options: DEGREE_OPTIONS,
    required: true,
  },
  {
    key: "branch",
    question: "What is your branch or major?",
    subtext: "We use this to understand your technical foundation.",
    type: "chips",
    options: BRANCH_OPTIONS,
    required: true,
  },
  {
    key: "targetRole",
    question: "What role are you aiming for?",
    subtext: "Choose the career path that excites you the most.",
    type: "chips",
    options: ROLE_OPTIONS,
    required: true,
  },
  {
    key: "graduationYear",
    question: "When do you graduate?",
    subtext: "We'll adapt our roadmap to your timeline.",
    type: "year",
    options: YEAR_OPTIONS,
    required: true,
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function randomEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ChipOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`relative flex items-center justify-between gap-3 rounded-2xl border-2 px-5 py-3.5 text-left text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
        selected
          ? "border-primary bg-primary/8 text-primary shadow-md shadow-primary/10"
          : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-primary/3"
      }`}
    >
      <span>{label}</span>
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary"
        >
          <Check className="h-3 w-3 text-white" />
        </motion.span>
      )}
    </motion.button>
  );
}

// ─── Main Onboarding Content ───────────────────────────────────────────────────

function OnboardingContent() {
  const { update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const [screen, setScreen] = useState<"welcome" | "steps" | "saving" | "done">("welcome");
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [encouragement, setEncouragement] = useState("");
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chipFilter, setChipFilter] = useState("");

  const [answers, setAnswers] = useState<Record<string, string>>({
    college: "",
    degree: "",
    branch: "",
    targetRole: "",
    graduationYear: "",
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (screen === "steps" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [screen, stepIndex]);

  // If user is not coming from onboarding redirect but is an existing user,
  // render the normal profile form logic (redirect to simple edit)
  useEffect(() => {
    if (!isOnboarding) {
      // For existing users visiting /profile directly, load their data
      const fetchProfile = async () => {
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              setAnswers({
                college: json.data.college || "",
                degree: json.data.degree || "",
                branch: json.data.branch || "",
                targetRole: json.data.targetRole || "",
                graduationYear: json.data.graduationYear?.toString() || "",
              });
            }
          }
        } catch {}
      };
      fetchProfile();
    }
  }, [isOnboarding]);

  const currentStep = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const currentValue = answers[currentStep?.key ?? ""] ?? "";

  const canContinue = !currentStep?.required || currentValue.trim() !== "";

  function handleSetAnswer(val: string) {
    if (!currentStep) return;
    setAnswers((prev) => ({ ...prev, [currentStep.key]: val }));
    setChipFilter("");
  }

  async function handleContinue() {
    if (!canContinue) return;

    if (stepIndex < STEPS.length - 1) {
      // Show encouragement flash
      setEncouragement(randomEncouragement());
      setShowEncouragement(true);
      setTimeout(() => {
        setShowEncouragement(false);
        setDirection(1);
        setStepIndex((i) => i + 1);
        setChipFilter("");
      }, 600);
    } else {
      // Submit
      await handleSubmit();
    }
  }

  function handleBack() {
    if (stepIndex === 0) {
      setScreen("welcome");
      return;
    }
    setDirection(-1);
    setStepIndex((i) => i - 1);
    setChipFilter("");
  }

  async function handleSubmit() {
    setSaving(true);
    setScreen("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (!res.ok) throw new Error("Failed to save");

      await update({ isOnboarded: true });
      setScreen("done");
    } catch {
      toast.error("Failed to save profile. Please try again.");
      setScreen("steps");
    } finally {
      setSaving(false);
    }
  }

  // ─── Welcome Screen ─────────────────────────────────────────────────────────
  if (screen === "welcome") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg text-center"
        >
          {/* Logo / Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/30"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-4xl font-bold tracking-tight text-foreground"
          >
            👋 Welcome to CareerPilot AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-2 text-lg text-muted-foreground"
          >
            Let's personalize your experience so we can provide better career analysis, learning roadmaps, and interview preparation.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-10 text-sm text-muted-foreground/70"
          >
            This only takes about one minute.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen("steps")}
            className="inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── Saving Screen ──────────────────────────────────────────────────────────
  if (screen === "saving") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Setting up your profile…</h2>
          <p className="mt-2 text-muted-foreground">Personalizing your CareerPilot experience.</p>
        </motion.div>
      </div>
    );
  }

  // ─── Done Screen ────────────────────────────────────────────────────────────
  if (screen === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-full max-w-lg text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 250, delay: 0.1 }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500 shadow-xl shadow-emerald-500/30"
          >
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 text-4xl font-bold text-foreground"
          >
            🎉 You're all set!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-2 text-lg text-muted-foreground"
          >
            Your CareerPilot profile has been created successfully.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-10 text-sm text-muted-foreground/70"
          >
            We'll now personalize your dashboard and AI recommendations.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl"
          >
            Go to Dashboard <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── Steps Screen ───────────────────────────────────────────────────────────
  if (!currentStep) return null;

  const filteredOptions = (currentStep.options ?? []).filter((o) =>
    o.toLowerCase().includes(chipFilter.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-10">
        {/* Progress bar */}
        <div className="h-1 bg-border">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
          />
        </div>
        <div className="mx-auto flex max-w-xl items-center justify-between px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            {stepIndex + 1} of {STEPS.length}
          </span>
        </div>
      </div>

      {/* Encouragement flash */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            key="enc"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="rounded-3xl bg-foreground px-8 py-4 text-2xl font-bold text-background shadow-2xl">
              {encouragement}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step card */}
      <div className="w-full max-w-xl pt-24 pb-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stepIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Question */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground leading-tight">
                {currentStep.question}
              </h2>
              {currentStep.subtext && (
                <p className="mt-2 text-base text-muted-foreground">{currentStep.subtext}</p>
              )}
            </div>

            {/* Input */}
            {currentStep.type === "text" && (
              <input
                ref={inputRef}
                type="text"
                value={currentValue}
                placeholder={currentStep.placeholder}
                onChange={(e) => handleSetAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                className="w-full rounded-2xl border-2 border-border bg-white px-5 py-4 text-lg font-medium text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary focus:shadow-md focus:shadow-primary/10"
              />
            )}

            {currentStep.type === "chips" && (
              <div>
                {/* Optional filter for large chip lists */}
                {(currentStep.options?.length ?? 0) > 6 && (
                  <input
                    type="text"
                    value={chipFilter}
                    placeholder="Search…"
                    onChange={(e) => setChipFilter(e.target.value)}
                    className="mb-4 w-full rounded-2xl border-2 border-border bg-white px-5 py-3 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary"
                  />
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredOptions.map((opt) => (
                    <ChipOption
                      key={opt}
                      label={opt}
                      selected={currentValue === opt}
                      onClick={() => handleSetAnswer(currentValue === opt ? "" : opt)}
                    />
                  ))}
                  {filteredOptions.length === 0 && chipFilter && (
                    <div className="sm:col-span-2">
                      <ChipOption
                        label={`Use "${chipFilter}"`}
                        selected={currentValue === chipFilter}
                        onClick={() => handleSetAnswer(chipFilter)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep.type === "year" && (
              <div className="flex flex-wrap gap-3">
                {YEAR_OPTIONS.map((yr) => (
                  <motion.button
                    key={yr}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSetAnswer(currentValue === yr ? "" : yr)}
                    className={`rounded-2xl border-2 px-8 py-4 text-xl font-bold transition-all ${
                      currentValue === yr
                        ? "border-primary bg-primary text-white shadow-lg shadow-primary/30"
                        : "border-border bg-white text-foreground hover:border-primary/50"
                    }`}
                  >
                    {yr}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Validation hint */}
            {currentStep.required && currentValue === "" && (
              <p className="mt-3 text-sm text-muted-foreground/60">
                This field is required to continue.
              </p>
            )}

            {/* Continue button */}
            <div className="mt-10">
              <motion.button
                whileHover={{ scale: canContinue ? 1.02 : 1 }}
                whileTap={{ scale: canContinue ? 0.98 : 1 }}
                onClick={handleContinue}
                disabled={!canContinue}
                className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-semibold transition-all ${
                  canContinue
                    ? "bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {stepIndex < STEPS.length - 1 ? (
                  <>Continue <ArrowRight className="h-5 w-5" /></>
                ) : (
                  <>{saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null} Finish Setup</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Edit Mode Content ─────────────────────────────────────────────────────────

function ProfileEditMode() {
  const { update } = useSession();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    targetRole: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setForm({
              college: json.data.college || "",
              degree: json.data.degree || "",
              branch: json.data.branch || "",
              graduationYear: json.data.graduationYear?.toString() || "",
              targetRole: json.data.targetRole || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!form.college || !form.targetRole) {
      toast.error("College and Target Role are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      await update({ isOnboarded: true });
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your career profile and preferences.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <UserRound className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Education & Career Goal</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            { label: "College / University", key: "college", placeholder: "e.g. IIT Delhi" },
            { label: "Degree", key: "degree", placeholder: "e.g. B.Tech" },
            { label: "Branch / Major", key: "branch", placeholder: "e.g. Computer Science" },
            { label: "Graduation Year", key: "graduationYear", placeholder: "e.g. 2025" },
          ].map((f) => (
            <div key={f.key}>
              <label className="mb-2 block text-sm font-medium text-foreground">{f.label}</label>
              <Input
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="rounded-xl"
              />
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-foreground">Target Role</label>
            <Input
              placeholder="e.g. Full Stack Developer"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-full bg-primary text-white gap-2"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4" />Save Profile</>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function ProfileRouter() {
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  if (isOnboarding) {
    return <OnboardingContent />;
  }

  return <ProfileEditMode />;
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProfileRouter />
    </Suspense>
  );
}
