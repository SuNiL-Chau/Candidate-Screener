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
        <Card className="shadow-xs hover:border-border/90 transition-all">
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
        <Card className="shadow-xs hover:border-border/90 transition-all">
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
        <Card className="border-amber-200/80 bg-amber-50/20 shadow-xs">
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
        <Card className="border-emerald-200/80 bg-emerald-50/20 shadow-xs">
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-heading text-foreground tracking-tight">Active Recruitment Positions</h2>
            <p className="text-xs text-muted-foreground">Select a position to inspect ranked candidate pipeline</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs py-1 px-3">
            {roles.length} {roles.length === 1 ? "Position" : "Positions"} Live
          </Badge>
        </div>

        {loading ? (
          <Card className="flex h-60 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Retrieving active positions...
            </div>
          </Card>
        ) : roles.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold font-heading text-foreground">No Positions Created Yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Get started by opening your first position with role criteria and must-have requirements.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Open Position
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const candidateCount = role.candidateCount || 0;
              const reviewCount = role.reviewNeededCount || 0;
              const cleanCount = Math.max(0, candidateCount - reviewCount);
              const cleanPercent = candidateCount > 0 ? Math.round((cleanCount / candidateCount) * 100) : 100;

              return (
                <Card
                  key={role.id}
                  className="flex flex-col justify-between group hover:shadow-sm transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-bold font-heading text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {role.title}
                      </CardTitle>
                      {reviewCount > 0 ? (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 text-[10px] font-mono shrink-0">
                          {reviewCount} to review
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px] font-mono shrink-0">
                          All Clear
                        </Badge>
                      )}
                    </div>

                    <CardDescription className="line-clamp-2 text-xs text-muted-foreground mt-2 leading-relaxed">
                      {role.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    {/* Pipeline Health Bar */}
                    <div className="pt-2 border-t border-border">
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

                  {/* Footer */}
                  <CardFooter className="flex items-center justify-between border-t border-border pt-4 bg-muted/20">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{candidateCount} candidates</span>
                    </div>

                    <Link href={`/roles/${role.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 hover:text-primary hover:border-primary/40 cursor-pointer font-sans"
                      >
                        <span>Screen Candidates</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
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
    </div>
  );
}
