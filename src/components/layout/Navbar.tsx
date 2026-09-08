"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Briefcase, LogOut, Cpu, Sparkles } from "lucide-react";

export function Navbar() {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105">
              <ShieldCheck className="h-5 w-5" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-30 blur-xs -z-10 group-hover:opacity-60 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white">
                  Crystal<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Screen</span>
                </span>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                  v4 Enterprise
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Pre-Score AI Integrity Architecture</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                pathname === "/dashboard"
                  ? "bg-slate-800/90 text-white shadow-xs border border-slate-700/80"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 text-blue-400" />
              Positions & Dashboard
            </Link>
          </nav>
        </div>

        {/* Right: Engine Status & Recruiter Profile */}
        <div className="flex items-center gap-3.5">
          {/* Real-time System Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">
              Integrity Engine Active
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-400 font-mono">Gemini-1.5</span>
          </div>

          {/* Recruiter Avatar Badge */}
          <div className="flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/90 py-1 pl-1.5 pr-3 shadow-inner">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-[11px] font-bold text-white shadow-xs">
              CG
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-[11px] font-bold text-slate-200 leading-tight">Crystal Recruiter</span>
              <span className="block text-[10px] text-slate-400 font-mono leading-tight">recruiter@crystalgroup.com</span>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
