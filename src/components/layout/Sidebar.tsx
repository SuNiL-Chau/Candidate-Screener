"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Briefcase,
  Users,
  LogOut,
  Sparkles,
  ChevronRight,
  Sliders,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const navLinks = [
    {
      label: "Roles & Dashboard",
      href: "/dashboard",
      icon: <Briefcase className="h-4 w-4" />,
      active: pathname === "/dashboard",
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xs">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm group-hover:opacity-90 transition-opacity">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold font-heading tracking-tight text-sidebar-foreground">
                Crystal<span className="text-primary">Screen</span>
              </span>
              <span className="rounded bg-sidebar-accent px-1.5 py-0.2 text-[10px] font-semibold text-sidebar-accent-foreground uppercase font-mono">
                v4
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Candidate Screener</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div>
          <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono mb-2">
            Hiring Management
          </div>
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  link.active
                    ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-xs"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={link.active ? "text-primary" : "text-muted-foreground"}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </div>
                {link.active && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
              </Link>
            ))}
          </nav>
        </div>

        {/* Engine Pipeline Status Card */}
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
              AI Integrity Engine
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs font-semibold text-sidebar-foreground">
            Active • Gemini 1.5 Flash
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
            Pre-score prompt injection defense & timeline validation enabled.
          </p>
        </div>
      </div>

      {/* Recruiter Profile & Sign Out (Bottom) */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between rounded-xl p-2 bg-sidebar-accent/50 border border-sidebar-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground shadow-xs">
              CG
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-sidebar-foreground truncate">Crystal Recruiter</div>
              <div className="text-[11px] text-muted-foreground font-mono truncate">
                recruiter@crystalgroup.com
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground hover:shadow-xs transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
