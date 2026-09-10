"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Briefcase,
  LogOut,
  ChevronRight,
  X,
  FileText,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  userEmail?: string;
}

export function Sidebar({ mobileOpen = false, onMobileClose, userEmail = "recruiter@crystalgroup.com" }: SidebarProps) {
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
      active: pathname === "/dashboard" || pathname.startsWith("/roles"),
    },
    {
      label: "Submission Note",
      href: "/submission-note",
      icon: <FileText className="h-4 w-4" />,
      active: pathname === "/submission-note",
    },
  ];

  const renderContent = (isMobile = false) => (
    <>
      {/* Brand Logo & Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border shrink-0">
        <Link
          href="/dashboard"
          onClick={() => {
            if (isMobile && onMobileClose) onMobileClose();
          }}
          className="flex items-center gap-3 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold font-heading tracking-tight text-sidebar-foreground">
              Crystal<span className="text-primary">Screen</span>
            </span>
            <p className="text-[11px] text-muted-foreground font-medium font-sans">
              Candidate Screener
            </p>
          </div>
        </Link>

        {isMobile && onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 font-sans">
        <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono mb-2">
          Workspace
        </div>
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => {
                if (isMobile && onMobileClose) onMobileClose();
              }}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
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

      {/* Recruiter Profile & Logout (Bottom Only) */}
      <div className="p-4 border-t border-sidebar-border font-sans shrink-0">
        <div className="flex items-center justify-between rounded-xl p-2.5 bg-sidebar-accent/40 border border-sidebar-border/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs uppercase">
              {userEmail.slice(0, 2)}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-sidebar-foreground truncate font-heading">
                Crystal Recruiter
              </div>
              <div className="text-[11px] text-muted-foreground font-mono truncate">
                {userEmail}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Permanent Fixed Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xs">
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-over Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-none transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderContent(true)}
      </aside>
    </>
  );
}
