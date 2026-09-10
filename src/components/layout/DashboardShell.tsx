"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardShellProps {
  user: {
    id: string;
    email: string;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted text-foreground flex flex-col lg:flex-row">
      {/* Permanent Fixed Left Sidebar on Desktop + Mobile Slide-over Drawer */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        userEmail={user.email}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen bg-muted min-w-0">
        {/* Mobile Top Navigation Header */}
        <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold font-heading tracking-tight text-foreground">
                Crystal<span className="text-primary">Screen</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-xs uppercase">
              {user.email.slice(0, 2)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-(--breakpoint-2xl) w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
