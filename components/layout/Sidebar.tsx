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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/resume", icon: FileText, label: "Resume" },
  { href: "/career-analysis", icon: Brain, label: "Career Analysis" },
  { href: "/skill-gap", icon: Target, label: "Skill Gap" },
  { href: "/roadmap", icon: Map, label: "Roadmap" },
  { href: "/projects", icon: FolderGit2, label: "Projects" },
  { href: "/ats-review", icon: CheckSquare, label: "ATS Review" },
  { href: "/interview", icon: Mic, label: "Interview Prep" },
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

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-foreground">CareerPilot AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <div className="mb-2">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.label}
                  {isActive && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Account
          </p>
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.name ?? "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground" />
            <button
              title="Sign out"
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
