"use client";

import Link from "next/link";
import Image from "next/image";
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
  ChevronRight,
  Upload,
  Search,
  Map,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const features = [
  {
    id: "ats",
    icon: FileCheck2,
    title: "ATS Resume Analysis",
    description: "Determine how Applicant Tracking Systems parse your resume and get actionable fixes for formatting and keyword issues.",
  },
  {
    id: "readiness",
    icon: Trophy,
    title: "Career-Readiness Assessment",
    description: "Receive a comprehensive 0-100 score evaluating your technical skills, projects, experience, and overall resume quality.",
  },
  {
    id: "gap",
    icon: Target,
    title: "Skill-Gap Analysis",
    description: "Identify exactly which skills you lack for your target role, along with prioritized learning resources.",
  },
  {
    id: "roadmap",
    icon: Map,
    title: "Personalized Career Roadmap",
    description: "Follow a step-by-step weekly plan generated specifically for your profile and career goals.",
  },
  {
    id: "projects",
    icon: FolderGit2,
    title: "Project Recommendations",
    description: "Build a stronger portfolio with curated project ideas that demonstrate the skills employers are looking for.",
  },
  {
    id: "interview",
    icon: Brain,
    title: "Interview Preparation",
    description: "Practice with targeted technical and behavioral questions based on your resume, complete with feedback frameworks.",
  },
];

const faqs = [
  {
    question: "How does CareerPilot evaluate my resume?",
    answer: "CareerPilot uses advanced AI to parse your resume like an ATS would. It then analyzes your experience, projects, and skills against industry standards for your target role to generate actionable insights and a readiness score.",
  },
  {
    question: "Is my data private and secure?",
    answer: "Yes. Your resume data is processed securely and is only used to generate your personalized career report. We do not share your personal information or resume with third-party recruiters without your consent.",
  },
  {
    question: "Do I need to pay to use CareerPilot?",
    answer: "CareerPilot offers a comprehensive set of features for free to help you start your career journey. You can analyze your resume and view your skill gaps without entering a credit card.",
  },
  {
    question: "How accurate is the ATS score?",
    answer: "Our ATS score is designed to mimic standard Applicant Tracking System rules—checking for readable formatting, keyword presence, and section completeness. While no single ATS is identical, following our recommendations significantly improves your chances of passing automated screens.",
  }
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
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#showcase" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Preview
            </a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden md:block w-px h-4 bg-border"></div>
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

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-16 pb-24 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Copy */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Career intelligence, built around you
              </div>
              
              <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Make your next <br className="hidden md:block" />
                career move with <span className="text-primary">clarity.</span>
              </h1>
              
              <p className="mb-10 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Stop guessing what recruiters want. CareerPilot AI deeply analyzes your resume to identify skill gaps, optimize for ATS, and generate a personalized roadmap for your target role.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                    Analyze My Resume
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                    Explore Features
                  </Button>
                </a>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Product Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="relative lg:ml-auto w-full max-w-2xl"
            >
              {/* Decorative background blur */}
              <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-3xl opacity-50 dark:opacity-30 pointer-events-none"></div>
              
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="relative z-10 w-full"
              >
                <Image 
                  src="/Hero_section_Img.png" 
                  alt="CareerPilot AI Dashboard Preview" 
                  width={1000} 
                  height={1000} 
                  className="w-full h-auto drop-shadow-2xl pointer-events-none select-none object-contain"
                  draggable={false}
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Workflow */}
      <section id="workflow" className="px-6 py-24 bg-secondary/30 border-y border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 md:text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">A structured path to placement</h2>
            <p className="text-lg text-muted-foreground md:mx-auto max-w-2xl">Stop applying blindly. Understand exactly where you stand and what to improve next.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-8 h-full">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">1. Upload your resume</h3>
                <p className="text-muted-foreground leading-relaxed">Simply drop your current resume. Our AI instantly structures your experience, skills, and projects without manual data entry.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border z-10"></div>
            </div>
            
            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-8 h-full relative z-20 shadow-sm ring-1 ring-primary/20">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">2. Discover your gaps</h3>
                <p className="text-muted-foreground leading-relaxed">See how you measure up against your target role. Uncover formatting issues, missing keywords, and weak project descriptions.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border z-10"></div>
            </div>
            
            <div>
              <div className="bg-card border border-border rounded-2xl p-8 h-full">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Map className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">3. Follow the roadmap</h3>
                <p className="text-muted-foreground leading-relaxed">Get a week-by-week action plan. Complete curated projects, learn missing skills, and practice tailored interview questions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Complete career intelligence</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">Everything you need to optimize your profile and prepare for interviews, unified in one platform.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {features.map((feature) => (
              <div key={feature.id} className="group">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section id="showcase" className="px-6 py-24 bg-secondary/30 border-y border-border overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 md:text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Inside the platform</h2>
            <p className="text-lg text-muted-foreground md:mx-auto max-w-2xl">A closer look at how CareerPilot presents your insights.</p>
          </div>

          <Tabs defaultValue="review" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1">
              <TabsTrigger value="review" className="py-2.5 h-auto text-sm md:text-base whitespace-normal text-center">Resume Review</TabsTrigger>
              <TabsTrigger value="gaps" className="py-2.5 h-auto text-sm md:text-base whitespace-normal text-center">Skill Gaps</TabsTrigger>
              <TabsTrigger value="roadmap" className="py-2.5 h-auto text-sm md:text-base whitespace-normal text-center">Career Roadmap</TabsTrigger>
            </TabsList>
            
            <div className="relative rounded-2xl border border-border bg-card shadow-sm p-2 md:p-6 min-h-[400px]">
              <TabsContent value="review" className="mt-0 outline-none">
                <div className="flex flex-col md:flex-row gap-6 p-4">
                  <div className="flex-1 space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-primary" /> ATS Score Overview</h4>
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Keyword Match</span>
                          <span className="text-sm font-bold text-emerald-600">85%</span>
                        </div>
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden mb-4"><div className="h-full bg-emerald-500 rounded-full w-[85%]"></div></div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Structure Parsing</span>
                          <span className="text-sm font-bold text-amber-600">60%</span>
                        </div>
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full w-[60%]"></div></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Bullet Improvements</h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg border border-border bg-card">
                          <p className="text-xs text-muted-foreground line-through mb-1">"Made the website faster by changing some code."</p>
                          <p className="text-sm font-medium text-foreground">"Optimized React rendering cycles, reducing page load time by 40% and improving Lighthouse performance score to 95+."</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="gaps" className="mt-0 outline-none">
                <div className="p-4">
                  <h4 className="font-semibold text-foreground mb-4">Identified Skill Gaps for Software Engineer</h4>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between p-4 rounded-xl border border-border bg-secondary/30">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-foreground">System Design</h5>
                          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 border-0">High Priority</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xl">Missing from your experience. Crucial for backend and full-stack roles at mid-to-senior levels.</p>
                      </div>
                      <Button variant="outline" size="sm" className="hidden md:flex">View Resources</Button>
                    </div>
                    <div className="flex items-start justify-between p-4 rounded-xl border border-border bg-secondary/30">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-foreground">Docker / Containerization</h5>
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 border-0">Medium Priority</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xl">Standard industry practice for deployment. Strongly recommended to learn basics.</p>
                      </div>
                      <Button variant="outline" size="sm" className="hidden md:flex">View Resources</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="roadmap" className="mt-0 outline-none">
                <div className="p-4">
                  <h4 className="font-semibold text-foreground mb-4">Your 6-Week Action Plan</h4>
                  <div className="relative border-l-2 border-border ml-3 pl-6 py-2 space-y-8">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                      <h5 className="font-semibold text-foreground mb-1">Week 1: Fundamentals & Quick Wins</h5>
                      <p className="text-sm text-muted-foreground mb-3">Fix resume formatting issues and learn basics of Docker.</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-card">Rewrite 3 bullet points</Badge>
                        <Badge variant="outline" className="bg-card">Complete Docker 101 tutorial</Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-border bg-background"></div>
                      <h5 className="font-semibold text-foreground mb-1">Week 2: Backend API Project</h5>
                      <p className="text-sm text-muted-foreground">Start the recommended Serverless API project to build cloud experience.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-border bg-background"></div>
                      <h5 className="font-semibold text-muted-foreground mb-1">Week 3: Advanced Concepts</h5>
                      <p className="text-sm text-muted-foreground">Focus on System Design basics.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* FAQ & Final CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently asked questions</h2>
          </div>
          
          <Accordion className="w-full mb-24">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="rounded-3xl bg-card border border-border p-8 md:p-12 text-center shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Start optimizing your career today.</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Get actionable intelligence on your resume in seconds. Free to use, no credit card required.</p>
            <Link href="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-12">
                Analyze My Resume
              </Button>
            </Link>
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
            <span className="font-semibold text-foreground tracking-tight">CareerPilot AI</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CareerPilot AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
