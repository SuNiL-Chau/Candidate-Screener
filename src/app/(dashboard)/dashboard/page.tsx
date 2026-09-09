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
  Archive,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { RoleData } from "@/types";
import { CreateRoleModal } from "@/components/roles/CreateRoleModal";
import { DeleteRoleModal } from "@/components/roles/DeleteRoleModal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleData | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");

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

  const handleToggleRoleStatus = async (roleId: string, currentStatus?: "OPEN" | "CLOSED") => {
    const newStatus = currentStatus === "CLOSED" ? "OPEN" : "CLOSED";
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, status: newStatus } : r))
    );
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        fetchRoles();
      }
    } catch {
      fetchRoles();
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const totalCandidates = roles.reduce((sum, r) => sum + (r.candidateCount || 0), 0);
  const totalReviewNeeded = roles.reduce((sum, r) => sum + (r.reviewNeededCount || 0), 0);
  const totalClear = Math.max(0, totalCandidates - totalReviewNeeded);

  const activePositionsCount = roles.filter((r) => r.status !== "CLOSED").length;
  const closedPositionsCount = roles.filter((r) => r.status === "CLOSED").length;

  const filteredRoles = roles.filter((r) => {
    if (statusFilter === "OPEN") return r.status !== "CLOSED";
    if (statusFilter === "CLOSED") return r.status === "CLOSED";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-widest py-0.5">
              Recruiter Workspace
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">Overview & Positions</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-foreground">
            Candidate Screener Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Manage active roles, monitor candidate intake, and review pre-scoring resume integrity audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="lg"
            className="gap-2 font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Open New Position
          </Button>
        </div>
      </div>

      {/* Executive Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Active Positions */}
        <Card className="shadow-xs hover:shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
              Active Positions
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-heading text-foreground tracking-tight">{roles.length}</span>
              <Badge variant="secondary" className="text-xs font-mono">Positions</Badge>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Live candidate screening pipelines</p>
          </CardContent>
        </Card>

        {/* Stat 2: Total Screened */}
        <Card className="shadow-xs hover:shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
              Total Screened
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-heading text-foreground tracking-tight">{totalCandidates}</span>
              <Badge variant="secondary" className="text-xs font-mono">Profiles</Badge>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Audited via two-stage AI pipeline</p>
          </CardContent>
        </Card>

        {/* Stat 3: Flags Requiring Review */}
        <Card className="bg-amber-50/40 shadow-xs hover:shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-amber-800 uppercase tracking-widest font-mono">
              Flags to Review
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-heading text-amber-900 tracking-tight">{totalReviewNeeded}</span>
              <Badge variant="outline" className="border-amber-300 text-amber-800 text-xs font-mono">Review</Badge>
            </div>
            <p className="mt-1 text-[11px] text-amber-700/80">Anomalies with quoted evidence</p>
          </CardContent>
        </Card>

        {/* Stat 4: Verified Clean */}
        <Card className="bg-emerald-50/40 shadow-xs hover:shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest font-mono">
              Verified Clean
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-heading text-emerald-900 tracking-tight">{totalClear}</span>
              <Badge variant="outline" className="border-emerald-300 text-emerald-800 text-xs font-mono">Clear</Badge>
            </div>
            <p className="mt-1 text-[11px] text-emerald-700/80">Zero integrity signals detected</p>
          </CardContent>
        </Card>
      </div>

      {/* Positions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-heading text-foreground tracking-tight">Active Recruitment Positions</h2>
            <p className="text-xs text-muted-foreground">Manage active roles, close filled pipelines, or screen candidates</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status Filter Pills */}
            <div className="flex rounded-lg border border-border bg-card p-0.5 text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({roles.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("OPEN")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === "OPEN"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Active ({activePositionsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("CLOSED")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === "CLOSED"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Closed ({closedPositionsCount})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <Card className="flex h-60 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Retrieving active positions...
            </div>
          </Card>
        ) : filteredRoles.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold font-heading text-foreground">
              {roles.length === 0 ? "No Positions Created Yet" : "No Positions in this Category"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {roles.length === 0
                ? "Get started by opening your first position with role criteria and must-have requirements."
                : "Try switching filters to view all active or closed positions."}
            </p>
            {roles.length === 0 && (
              <div className="mt-6">
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Open Position
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => {
              const candidateCount = role.candidateCount || 0;
              const reviewCount = role.reviewNeededCount || 0;
              const cleanCount = Math.max(0, candidateCount - reviewCount);
              const cleanPercent = candidateCount > 0 ? Math.round((cleanCount / candidateCount) * 100) : 100;
              const isClosed = role.status === "CLOSED";

              return (
                <Card
                  key={role.id}
                  className={`flex flex-col justify-between group hover:shadow-sm transition-all ${
                    isClosed ? "opacity-75 bg-card/70" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {isClosed ? (
                            <Badge variant="outline" className="border-border text-muted-foreground bg-muted font-mono text-[9px] uppercase tracking-wider">
                              Closed
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-[9px] font-mono uppercase tracking-wider">
                              Active
                            </Badge>
                          )}
                          {reviewCount > 0 ? (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 text-[9px] font-mono shrink-0">
                              {reviewCount} review
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] font-mono shrink-0">
                              Clean
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base font-bold font-heading text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {role.title}
                        </CardTitle>
                      </div>
                    </div>

                    <CardDescription className="line-clamp-2 text-xs text-muted-foreground mt-2 leading-relaxed">
                      {role.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    {/* Pipeline Health Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1.5">
                        <span>Pipeline Integrity Health</span>
                        <span className="font-bold text-foreground">{cleanPercent}% Clear</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${cleanPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Requirements Chips */}
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                        Evaluated Requirements:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {role.requirements.slice(0, 4).map((req, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[11px] font-mono font-medium"
                          >
                            {req}
                          </Badge>
                        ))}
                        {role.requirements.length > 4 && (
                          <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                            +{role.requirements.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  {/* Footer with Close / Reopen, Delete, and Screen actions */}
                  <CardFooter className="flex items-center justify-between pt-4 bg-muted/20">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{candidateCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Close / Reopen Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRoleStatus(role.id, role.status)}
                        title={isClosed ? "Reopen position" : "Close position"}
                        className="h-8 px-2 text-xs font-medium cursor-pointer"
                      >
                        {isClosed ? (
                          <>
                            <PlayCircle className="h-3.5 w-3.5 text-primary" />
                            <span className="hidden sm:inline">Reopen</span>
                          </>
                        ) : (
                          <>
                            <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="hidden sm:inline">Close</span>
                          </>
                        )}
                      </Button>

                      {/* Delete Position Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRoleToDelete(role)}
                        title="Delete position permanently"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>

                      {/* Screen Candidates Primary Button */}
                      <Link href={`/roles/${role.id}`}>
                        <Button
                          size="sm"
                          className="gap-1.5 cursor-pointer font-semibold shadow-xs"
                        >
                          <span>Screen</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
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

      {/* Permanent Delete Confirmation Dialog */}
      <DeleteRoleModal
        isOpen={!!roleToDelete}
        role={
          roleToDelete
            ? {
                id: roleToDelete.id,
                title: roleToDelete.title,
                candidateCount: roleToDelete.candidateCount,
              }
            : null
        }
        onClose={() => setRoleToDelete(null)}
        onDeleted={fetchRoles}
      />
    </div>
  );
}
