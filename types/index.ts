// Resume Analysis Types
export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ResumeProfile {
  education: Education[];
  skills: string[];
  projects: Project[];
  experience: Experience[];
  achievements: string[];
  technologies: string[];
  certifications: string[];
}

// Career Score Types
export interface CareerScore {
  overallScore: number;
  resumeScore: number;
  technicalScore: number;
  projectScore: number;
  communicationScore: number;
  interviewScore: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

// Skill Gap Types
export interface MissingSkill {
  name: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
  resources: string[];
}

export interface SkillGapResult {
  missingSkills: MissingSkill[];
}

// Roadmap Types
export interface RoadmapWeek {
  week: number;
  topics: string[];
  deliverables: string[];
  estimatedHours: number;
}

export interface RoadmapResult {
  weeks: RoadmapWeek[];
}

// ATS Review Types
export interface ATSResult {
  atsScore: number;
  keywordIssues: string[];
  formattingIssues: string[];
  bulletSuggestions: Array<{ original: string; improved: string }>;
  overallSuggestions: string[];
}

// Project Recommendation Types
export interface RecommendedProject {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  techStack: string[];
  learningOutcome: string;
  estimatedWeeks: number;
}

export interface ProjectRecommendationResult {
  projects: RecommendedProject[];
}

// Interview Prep Types
export interface TechnicalQuestion {
  question: string;
  expectedAnswer: string;
  keyConcepts: string[];
  followUps: string[];
}

export interface HRQuestion {
  question: string;
  sampleAnswer: string;
  starGuidance: string;
  personalizationTip: string;
}

export interface InterviewResult {
  questions: (TechnicalQuestion | HRQuestion)[];
}
