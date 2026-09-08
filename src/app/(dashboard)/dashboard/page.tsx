"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { RoleData } from "@/types";
import { CreateRoleModal } from "@/components/roles/CreateRoleModal";

export default function DashboardPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/roles");
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error("Failed to load roles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const totalCandidates = roles.reduce((sum, r) => sum + (r.candidateCount || 0), 0);
  const totalReviewNeeded = roles.reduce((sum, r) => sum + (r.reviewNeededCount || 0), 0);
  const totalClear = Math.max(0, totalCandidates - totalReviewNeeded);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-widest font-mono">
              Recruiter Workspace
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Overview & Positions</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Candidate Screener Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Manage active roles, monitor candidate intake, and review pre-scoring resume integrity audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Open New Position
          </button>
        </div>
      </div>

      {/* Executive Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Active Positions */}
        <div className="minimal-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Active Positions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{roles.length}</span>
            <span className="text-xs text-blue-600 font-semibold font-mono">Positions</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Live candidate screening pipelines</p>
        </div>

        {/* Stat 2: Total Screened */}
        <div className="minimal-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Total Screened
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalCandidates}</span>
            <span className="text-xs text-indigo-600 font-semibold font-mono">Profiles</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Audited via two-stage AI pipeline</p>
        </div>

        {/* Stat 3: Flags Requiring Review */}
        <div className="minimal-card p-6 border-amber-200/80 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-widest font-mono">
              Flags to Review
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-900 tracking-tight">{totalReviewNeeded}</span>
            <span className="text-xs text-amber-700 font-semibold font-mono">Require Review</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-700/80">Anomalies with quoted evidence</p>
        </div>

        {/* Stat 4: Verified Clean */}
        <div className="minimal-card p-6 border-emerald-200/80 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest font-mono">
              Verified Clean
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-900 tracking-tight">{totalClear}</span>
            <span className="text-xs text-emerald-700 font-semibold font-mono">Clear</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700/80">Zero integrity signals detected</p>
        </div>
      </div>

      {/* Positions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Recruitment Positions</h2>
            <p className="text-xs text-slate-500">Select a position to inspect ranked candidate pipeline</p>
          </div>
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-mono font-medium text-slate-600 shadow-2xs">
            {roles.length} {roles.length === 1 ? "Position" : "Positions"} Live
          </span>
        </div>

        {loading ? (
          <div className="minimal-card flex h-60 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Retrieving active positions...
            </div>
          </div>
        ) : roles.length === 0 ? (
          <div className="minimal-card p-12 text-center border-dashed">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No Positions Created Yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Get started by opening your first position with role criteria and must-have requirements.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Open Position
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const candidateCount = role.candidateCount || 0;
              const reviewCount = role.reviewNeededCount || 0;
              const cleanCount = Math.max(0, candidateCount - reviewCount);
              const cleanPercent = candidateCount > 0 ? Math.round((cleanCount / candidateCount) * 100) : 100;

              return (
                <div
                  key={role.id}
                  className="minimal-card p-6 flex flex-col justify-between group"
                >
                  <div>
                    {/* Role Header */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {role.title}
                      </h3>
                      {reviewCount > 0 ? (
                        <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 font-mono">
                          {reviewCount} to review
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
                          All Clear
                        </span>
                      )}
                    </div>

                    <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Pipeline Health Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1.5">
                        <span>Pipeline Integrity Health</span>
                        <span className="font-bold text-slate-700">{cleanPercent}% Clear</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${cleanPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Requirements Chips */}
                    <div className="mt-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        Evaluated Requirements:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {role.requirements.slice(0, 4).map((req, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 font-mono"
                          >
                            {req}
                          </span>
                        ))}
                        {role.requirements.length > 4 && (
                          <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                            +{role.requirements.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{candidateCount} candidates</span>
                    </div>

                    <Link
                      href={`/roles/${role.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 transition-all shadow-2xs"
                    >
                      <span>Screen Candidates</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchRoles}
      />
    </div>
  );
}
