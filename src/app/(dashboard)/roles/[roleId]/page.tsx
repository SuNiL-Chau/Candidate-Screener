"use client";

import React, { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { FitScoreBadge } from "@/components/scoring/FitScoreBadge";
import { IntegrityBadge } from "@/components/integrity/IntegrityBadge";
import { AddCandidateModal } from "@/components/candidates/AddCandidateModal";

interface Candidate {
  id: string;
  name: string;
  email?: string | null;
  createdAt: string;
  integrityReport?: {
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    findings: { id: string; type: string }[];
  } | null;
  score?: {
    score: number;
    matchedRequirements: string[];
    missingRequirements: string[];
  } | null;
}

interface RoleDetail {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  candidates: Candidate[];
}

export default function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = use(params);

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [integrityFilter, setIntegrityFilter] = useState<"ALL" | "REVIEW" | "CLEAR">("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchRole = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/roles/${roleId}`);
      const data = await res.json();
      if (res.ok) {
        setRole(data.role);
      }
    } catch (err) {
      console.error("Failed to load role:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [roleId]);

  // Candidates sorted primarily by Fit Score (descending)
  const filteredCandidates = useMemo(() => {
    if (!role?.candidates) return [];

    return role.candidates
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

        const findingCount = c.integrityReport?.findings?.length || 0;
        const matchesIntegrity =
          integrityFilter === "ALL" ||
          (integrityFilter === "REVIEW" && findingCount > 0) ||
          (integrityFilter === "CLEAR" && findingCount === 0);

        return matchesSearch && matchesIntegrity;
      })
      .sort((a, b) => (b.score?.score || 0) - (a.score?.score || 0));
  }, [role, searchQuery, integrityFilter]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Positions</span>
        </Link>
      </div>

      {loading ? (
        <div className="minimal-card flex h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            Loading role & candidate rankings...
          </div>
        </div>
      ) : !role ? (
        <div className="minimal-card p-8 text-center text-sm text-slate-500">
          Position not found.
        </div>
      ) : (
        <>
          {/* Role Header Banner */}
          <div className="minimal-card p-7">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
                    Screening Pipeline
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {role.candidates.length} Profiles Intake
                  </span>
                </div>
                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-foreground">
                  {role.title}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                  {role.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  Intake Candidate
                </button>
              </div>
            </div>

            {/* Evaluated Must-Have Requirements */}
            <div className="mt-6 border-t border-border pt-4">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                Evaluated Must-Have Requirements:
              </div>
              <div className="flex flex-wrap gap-2">
                {role.requirements.map((req, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs font-mono text-foreground"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    {req}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Candidate Screening Table Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-heading text-foreground tracking-tight">
                  Ranked Candidates ({filteredCandidates.length})
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  Ranked by objective fit score • Pre-screened for manipulation & timeline contradictions
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search candidate name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary w-48 sm:w-56 transition-colors shadow-2xs"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex rounded-xl border border-border bg-card p-1 text-xs font-semibold shadow-2xs">
                  <button
                    onClick={() => setIntegrityFilter("ALL")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      integrityFilter === "ALL"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({role.candidates.length})
                  </button>
                  <button
                    onClick={() => setIntegrityFilter("REVIEW")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      integrityFilter === "REVIEW"
                        ? "bg-amber-100 text-amber-900"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Flags to Review
                  </button>
                  <button
                    onClick={() => setIntegrityFilter("CLEAR")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      integrityFilter === "CLEAR"
                        ? "bg-emerald-100 text-emerald-900"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Verified Clean
                  </button>
                </div>
              </div>
            </div>

            {/* Candidates Table */}
            {filteredCandidates.length === 0 ? (
              <div className="minimal-card p-12 text-center border-dashed">
                <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-3 text-base font-bold font-heading text-foreground">No Matching Candidates</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {role.candidates.length === 0
                    ? "Intake your first candidate to trigger the automated integrity & scoring pipeline."
                    : "Try adjusting your search query or filter selection."}
                </p>
                {role.candidates.length === 0 && (
                  <div className="mt-5">
                    <button
                      onClick={() => setIsAddOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
                    >
                      <UserPlus className="h-4 w-4" />
                      Intake Candidate
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="minimal-card overflow-hidden">
                <table className="min-w-full divide-y divide-border text-left">
                  <thead className="bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                    <tr>
                      <th className="px-6 py-4 w-16">Rank</th>
                      <th className="px-6 py-4">Candidate Profile</th>
                      <th className="px-6 py-4">Role Fit Score</th>
                      <th className="px-6 py-4">Pre-Score Integrity Audit</th>
                      <th className="px-6 py-4">Requirements Demonstrated</th>
                      <th className="px-6 py-4 text-right">Dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {filteredCandidates.map((c, index) => {
                      const findingCount = c.integrityReport?.findings?.length || 0;
                      const hasPromptInjection = c.integrityReport?.findings?.some(
                        (f) => f.type === "PROMPT_INJECTION"
                      );
                      const matchedCount = c.score?.matchedRequirements?.length || 0;
                      const totalReqs = role.requirements.length;
                      const matchPercent = totalReqs > 0 ? Math.round((matchedCount / totalReqs) * 100) : 0;

                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-muted/30 transition-colors group cursor-pointer"
                          onClick={() => (window.location.href = `/candidates/${c.id}`)}
                        >
                          {/* Rank */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black font-mono ${
                                index === 0
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : index === 1
                                  ? "bg-muted text-foreground border border-border"
                                  : "text-muted-foreground"
                              }`}
                            >
                              #{index + 1}
                            </span>
                          </td>

                          {/* Candidate Identity with Avatar */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold shadow-2xs">
                                {getInitials(c.name)}
                              </div>
                              <div>
                                <div className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                                  {c.name}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-mono">
                                  {c.email || "No email listed"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Radial Score Gauge */}
                          <td className="px-6 py-4">
                            <FitScoreBadge score={c.score?.score} />
                          </td>

                          {/* Pre-Score Integrity Status */}
                          <td className="px-6 py-4">
                            <IntegrityBadge
                              status={c.integrityReport?.status}
                              findingCount={findingCount}
                              hasPromptInjection={hasPromptInjection}
                            />
                          </td>

                          {/* Matched Skills Bar */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="font-bold text-foreground">{matchedCount} of {totalReqs}</span>
                              <span className="text-muted-foreground">{matchPercent}%</span>
                            </div>
                            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${matchPercent}%` }}
                              />
                            </div>
                          </td>

                          {/* Action Button */}
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/candidates/${c.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all shadow-2xs"
                            >
                              <span>Inspect Dossier</span>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Candidate Modal */}
          <AddCandidateModal
            roleId={role.id}
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onAdded={fetchRole}
          />
        </>
      )}
    </div>
  );
}
