"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  GraduationCap,
  Code,
  Briefcase,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ResumeData {
  skills: string[];
  technologies: string[];
  education: Array<{ institution: string; degree: string; field: string; year: string }>;
  experience: Array<{ company: string; role: string; duration: string }>;
  projects: Array<{ name: string; description: string; technologies: string[] }>;
  achievements: string[];
  certifications: string[];
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(f.type)) {
      toast.error("Only PDF and DOCX files are supported");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    setFile(f);
    setResumeData(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setResumeData(json.data);
      toast.success("Resume analyzed successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Resume</h1>
        <p className="mt-1 text-muted-foreground">
          Upload your resume and let AI extract your profile.
        </p>
      </div>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : file
            ? "border-primary/40 bg-primary/5 cursor-default"
            : "border-border hover:border-primary/40 hover:bg-muted/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="rounded-full bg-primary text-white gap-2"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />Analyze with AI</>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setResumeData(null); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  Drop your resume here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">PDF or DOCX up to 5MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading state */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-border bg-white p-8 text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground">AI is analyzing your resume</p>
              <p className="text-sm text-muted-foreground">This takes about 10 seconds...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {resumeData && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Resume analyzed successfully</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Skills */}
            {resumeData.skills?.length > 0 && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <Code className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">Skills</h3>
                  <Badge variant="secondary" className="ml-auto">{resumeData.skills.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((s) => (
                    <Badge key={s} className="bg-emerald-50 text-emerald-700 border-0 hover:bg-emerald-100">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies */}
            {resumeData.technologies?.length > 0 && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">Technologies</h3>
                  <Badge variant="secondary" className="ml-auto">{resumeData.technologies.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.technologies.map((t) => (
                    <Badge key={t} className="bg-blue-50 text-blue-700 border-0 hover:bg-blue-100">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education?.length > 0 && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                    <GraduationCap className="h-4 w-4 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">Education</h3>
                </div>
                <div className="space-y-3">
                  {resumeData.education.map((e, i) => (
                    <div key={i} className="rounded-xl bg-muted/30 p-3">
                      <p className="font-medium text-foreground text-sm">{e.institution}</p>
                      <p className="text-xs text-muted-foreground">{e.degree} in {e.field} — {e.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {resumeData.experience?.length > 0 && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                    <Briefcase className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">Experience</h3>
                </div>
                <div className="space-y-3">
                  {resumeData.experience.map((e, i) => (
                    <div key={i} className="rounded-xl bg-muted/30 p-3">
                      <p className="font-medium text-foreground text-sm">{e.role}</p>
                      <p className="text-xs text-muted-foreground">{e.company} · {e.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Projects */}
          {resumeData.projects?.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                  <Trophy className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-foreground">Projects</h3>
                <Badge variant="secondary" className="ml-auto">{resumeData.projects.length}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {resumeData.projects.map((p, i) => (
                  <div key={i} className="rounded-xl border border-border p-4">
                    <p className="font-medium text-foreground text-sm mb-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.technologies?.slice(0, 4).map((t) => (
                        <Badge key={t} className="text-[10px] bg-muted border-0 text-muted-foreground">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next step prompt */}
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm">Next: Generate Your Career Score</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Head to Career Analysis to get your AI-powered Career Readiness Score.
                </p>
              </div>
              <a href="/career-analysis" className="ml-auto shrink-0 rounded-full bg-primary text-white text-xs px-4 py-2 font-medium hover:bg-primary/90 transition-colors">Get Score</a>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
