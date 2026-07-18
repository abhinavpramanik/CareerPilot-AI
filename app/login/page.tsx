"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { authenticateUser } from "./actions";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Globe, Zap, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const perks = [
  "AI resume analysis in seconds",
  "Personalized learning roadmap",
  "ATS review & improvement tips",
  "Interview preparation questions",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authenticateUser(email, password);

      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/90 to-emerald-500 p-12 lg:flex lg:w-1/2">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CareerPilot AI</span>
        </div>

        {/* Main content */}
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white/90">
            <Zap className="h-3.5 w-3.5" />
            Powered by Google Gemini
          </div>
          <h2 className="mb-4 text-4xl font-bold text-white">
            Your AI career mentor,
            <br />
            available 24/7
          </h2>
          <p className="mb-8 text-lg text-white/75">
            Upload your resume and get personalized career insights that typically cost
            thousands in career coaching — completely free.
          </p>
          <div className="space-y-3">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm text-white/90">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-white/50">
          © 2025 CareerPilot AI
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">CareerPilot AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in or create an account to access your career dashboard.
            </p>
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-4 mb-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl border border-red-200">
                {error}
              </div>
            )}
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl py-6"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl py-6"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-6 text-base font-medium bg-primary text-white hover:bg-primary/90"
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Continue with Email
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              variant="outline"
              size="lg"
              className="w-full rounded-2xl border-2 border-border py-6 text-base font-medium hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
            >
              <Globe className="mr-3 h-5 w-5 text-blue-500" />
              Continue with Google
            </Button>
          </div>

          <div className="mt-8 rounded-2xl bg-muted/50 p-4">
            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
              Your data is processed securely and never shared.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
