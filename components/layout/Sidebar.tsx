"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Brain,
  Target,
  Map,
  FolderGit2,
  CheckSquare,
  Mic,
  UserRound,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/resume", icon: FileText, label: "Resume" },
  { href: "/career-analysis", icon: Brain, label: "Career Score" },
  { href: "/skill-gap", icon: Target, label: "Skill Gaps" },
  { href: "/roadmap", icon: Map, label: "Roadmap" },
  { href: "/projects", icon: FolderGit2, label: "Projects" },
  { href: "/ats-review", icon: CheckSquare, label: "ATS Match" },
  { href: "/interview", icon: Mic, label: "Interviews" },
];

const bottomItems = [
  { href: "/profile", icon: UserRound, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">CareerPilot AI</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-2">
        <div className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Intelligence
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {item.label}
                    </div>
                    {isActive && (
                      <motion.div layoutId="activeNavIndicator" className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Account
          </p>
          <div className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between gap-3 rounded-xl p-2 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0 border border-border">
              <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.name ?? "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle className="h-8 w-8 text-muted-foreground hover:bg-muted" />
            <button
              title="Sign out"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex h-full w-72 flex-col border-r border-border bg-card">
        <SidebarContent />
      </aside>
    </>
  );
}

export function MobileNav({ user }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
          <Sparkles className="h-3 w-3 text-primary-foreground" />
        </div>
        <span className="text-base font-bold text-foreground tracking-tight">CareerPilot</span>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle className="h-8 w-8" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-border">
            <Sidebar user={user} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
