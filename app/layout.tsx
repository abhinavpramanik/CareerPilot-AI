import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "CareerPilot AI — AI-Powered Career Intelligence Platform",
  description:
    "CareerPilot AI helps students identify career readiness, bridge skill gaps, generate personalized roadmaps, review ATS scores, and prepare for interviews — all powered by AI.",
  keywords: [
    "career guidance",
    "AI career platform",
    "resume review",
    "skill gap analysis",
    "interview preparation",
    "ATS review",
    "placement readiness",
  ],
  openGraph: {
    title: "CareerPilot AI",
    description: "Your AI-powered career co-pilot for placement success",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
