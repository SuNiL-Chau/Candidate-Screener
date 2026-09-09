"use client";

import React, { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
  Archive,
  PlayCircle,
} from "lucide-react";
import { cn } from "cn";
import { FitScoreBadge } from "@/components/scoring/FitScoreBadge";
import { IntegrityBadge } from "@/components/integrity/IntegrityBadge";
import { AddCandidateModal } from "@/components/candidates/AddCandidateModal";
import { DeleteRoleModal } from "@/components/roles/DeleteRoleModal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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
  status?: "OPEN" | "CLOSED";
  candidates: Candidate[];
}

export default function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = use(params);
  const router = useRouter();

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [integrityFilter, setIntegrityFilter] = useState<"ALL" | "REVIEW" | "CLEAR">("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleToggleRoleStatus = async () => {
    if (!role) return;
    const newStatus = role.status === "CLOSED" ? "OPEN" : "CLOSED";
    try {
      setRole({ ...role, status: newStatus });
      const res = await fetch(`/api/roles/${role.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        fetchRole();
      }
    } catch {
      fetchRole();
    }
  };

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
          <Card className="shadow-xs border-0 ring-0">
            <CardHeader className="p-7 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={role.status === "CLOSED" ? "outline" : "outline"}
                      className={
                        role.status === "CLOSED"
                          ? "border-muted-foreground/30 bg-muted text-muted-foreground font-mono text-[10px] uppercase tracking-widest py-0.5"
                          : "border-primary/30 bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-widest py-0.5"
                      }
                    >
                      {role.status === "CLOSED" ? "Position Closed" : "Active Position"}
                    </Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {role.candidates.length} Profiles Intake
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-foreground">
                    {role.title}
                  </CardTitle>

                  {/* Job Description with full width and 5-line max clamp with Read More */}
                  <div className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <div
                      className={cn(
                        "whitespace-pre-line transition-all duration-200",
                        !isDescriptionExpanded && "line-clamp-5"
                      )}
                    >
                      {role.description}
                    </div>
                    {role.description && role.description.length > 200 && (
                      <button
                        type="button"
                        onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer select-none"
                      >
                        {isDescriptionExpanded ? (
                          <>
                            <span>Show less</span>
                            <ChevronUp className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Read more</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right side CTAs: 1 column in order: 1. Intake Candidate, 2. Close Position, 3. Delete Position */}
                <div className="flex flex-col w-full sm:w-48 lg:w-44 shrink-0 gap-2.5">
                  {/* 1st CTA: Intake Candidate */}
                  <Button
                    onClick={() => setIsAddOpen(true)}
                    disabled={role.status === "CLOSED"}
                    className="w-full justify-center gap-2 font-semibold shadow-xs cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Intake Candidate</span>
                  </Button>

                  {/* 2nd CTA: Close / Reopen Position */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleRoleStatus}
                    className="w-full justify-center gap-1.5 font-semibold text-xs cursor-pointer"
                  >
                    {role.status === "CLOSED" ? (
                      <>
                        <PlayCircle className="h-3.5 w-3.5 text-primary" />
                        <span>Reopen Position</span>
                      </>
                    ) : (
                      <>
                        <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Close Position</span>
                      </>
                    )}
                  </Button>

                  {/* 3rd CTA: Delete Position */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteOpen(true)}
                    className="w-full justify-center gap-1.5 font-semibold text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Position</span>
                  </Button>
                </div>
              </div>

              {role.status === "CLOSED" && (
                <div className="mt-4 rounded-xl bg-muted/60 border border-border/80 p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Archive className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>This position is currently marked as <strong>Closed</strong>. Candidate rankings are archived and new intakes are paused.</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleRoleStatus}
                    className="h-7 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Reopen Position
                  </Button>
                </div>
              )}

              {/* Evaluated Must-Have Requirements */}
              <div className="mt-6 border-t border-border pt-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Evaluated Must-Have Requirements:
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.requirements.map((req, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="gap-1.5 font-mono text-xs font-medium py-1 px-2.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
          </Card>

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
                  <Input
                    type="text"
                    placeholder="Search candidate name..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs w-48 sm:w-56 shadow-2xs"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex rounded-lg border border-border bg-card p-0.5 text-xs font-semibold shadow-2xs">
                  <button
                    onClick={() => setIntegrityFilter("ALL")}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      integrityFilter === "ALL"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({role.candidates.length})
                  </button>
                  <button
                    onClick={() => setIntegrityFilter("REVIEW")}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      integrityFilter === "REVIEW"
                        ? "bg-amber-100 text-amber-900"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Flags to Review
                  </button>
                  <button
                    onClick={() => setIntegrityFilter("CLEAR")}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
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
              <Card className="p-12 text-center border-dashed">
                <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-3 text-base font-bold font-heading text-foreground">No Matching Candidates</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {role.candidates.length === 0
                    ? "Intake your first candidate to trigger the automated integrity & scoring pipeline."
                    : "Try adjusting your search query or filter selection."}
                </p>
                {role.candidates.length === 0 && (
                  <div className="mt-5">
                    <Button
                      onClick={() => setIsAddOpen(true)}
                      className="gap-1.5"
                    >
                      <UserPlus className="h-4 w-4" />
                      Intake Candidate
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="overflow-hidden shadow-xs border-0 ring-0">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono hover:bg-transparent">
                      <TableHead className="w-16 pl-6 sm:pl-8 py-3.5">Rank</TableHead>
                      <TableHead className="px-4 py-3.5">Candidate Profile</TableHead>
                      <TableHead className="px-4 py-3.5">Role Fit Score</TableHead>
                      <TableHead className="px-4 py-3.5">Pre-Score Integrity Audit</TableHead>
                      <TableHead className="px-4 py-3.5">Requirements Met</TableHead>
                      <TableHead className="px-4 py-3.5 text-center">Match %</TableHead>
                      <TableHead className="pr-6 sm:pr-8 py-3.5 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {filteredCandidates.map((c, index) => {
                      const findingCount = c.integrityReport?.findings?.length || 0;
                      const hasPromptInjection = c.integrityReport?.findings?.some(
                        (f) => f.type === "PROMPT_INJECTION"
                      );
                      const matchedCount = c.score?.matchedRequirements?.length || 0;
                      const totalReqs = role.requirements.length;
                      const matchPercent = totalReqs > 0 ? Math.round((matchedCount / totalReqs) * 100) : 0;

                      return (
                        <TableRow
                          key={c.id}
                          className="hover:bg-muted/30 transition-colors group cursor-pointer"
                          onClick={() => (window.location.href = `/candidates/${c.id}`)}
                        >
                          {/* Rank */}
                          <TableCell className="font-mono pl-6 sm:pl-8 py-4">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                                index === 0
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : index === 1
                                  ? "bg-muted text-foreground border border-border"
                                  : "text-muted-foreground"
                              }`}
                            >
                              #{index + 1}
                            </span>
                          </TableCell>

                          {/* Candidate Identity with Avatar */}
                          <TableCell className="px-4 py-4">
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
                          </TableCell>

                          {/* Radial Score Gauge */}
                          <TableCell className="px-4 py-4">
                            <FitScoreBadge score={c.score?.score} />
                          </TableCell>

                          {/* Pre-Score Integrity Status */}
                          <TableCell className="px-4 py-4">
                            <IntegrityBadge
                              status={c.integrityReport?.status}
                              findingCount={findingCount}
                              hasPromptInjection={hasPromptInjection}
                            />
                          </TableCell>

                          {/* Requirements Met Progress Bar */}
                          <TableCell className="px-4 py-4">
                            <div className="w-32 sm:w-36 space-y-1.5">
                              <div className="text-[11px] font-mono font-bold text-foreground">
                                {matchedCount} of {totalReqs}
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all duration-500"
                                  style={{ width: `${matchPercent}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>

                          {/* Match % */}
                          <TableCell className="px-4 py-4 text-center font-mono">
                            <Badge variant="secondary" className="font-mono text-xs font-bold py-0.5 px-2">
                              {matchPercent}%
                            </Badge>
                          </TableCell>

                          {/* Action Button */}
                          <TableCell className="pr-6 sm:pr-8 py-4 text-right">
                            <Link href={`/candidates/${c.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                className="gap-1 text-xs h-7.5 px-3 cursor-pointer font-semibold shadow-xs"
                              >
                                <span>Inspect</span>
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>

          {/* Add Candidate Modal */}
          <AddCandidateModal
            roleId={role.id}
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onAdded={fetchRole}
          />

          {/* Delete Position Modal */}
          <DeleteRoleModal
            isOpen={isDeleteOpen}
            role={
              role
                ? {
                    id: role.id,
                    title: role.title,
                    candidateCount: role.candidates.length,
                  }
                : null
            }
            onClose={() => setIsDeleteOpen(false)}
            onDeleted={() => router.push("/dashboard")}
          />
        </>
      )}
    </div>
  );
}
