"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  AlertTriangle,
  Lock,
  Target,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { CandidateData } from "@/types";
import { EvidenceCard } from "@/components/integrity/EvidenceCard";
import { FitScoreBadge } from "@/components/scoring/FitScoreBadge";
import { IntegrityBadge } from "@/components/integrity/IntegrityBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = use(params);
  const router = useRouter();

  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/candidates/${candidateId}`);
      const data = await res.json();
      if (res.ok) {
        setCandidate(data.candidate);
      }
    } catch (err) {
      console.error("Failed to load candidate:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  const handleReanalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/analyze`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchCandidate();
      }
    } catch (err) {
      console.error("Re-analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "DELETE",
      });
      if (res.ok && candidate?.roleId) {
        router.push(`/roles/${candidate.roleId}`);
      }
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      setDeleting(false);
    }
  };

  const handleCopyResume = () => {
    if (!candidate) return;
    navigator.clipboard.writeText(candidate.resumeText);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground font-sans">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Retrieving candidate intelligence dossier...
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <Card className="p-12 text-center text-sm text-muted-foreground">
        Candidate dossier not found.
      </Card>
    );
  }

  const findings = candidate.integrityReport?.findings || [];
  const hasPromptInjection = findings.some((f) => f.type === "PROMPT_INJECTION");
  const score = candidate.score;
  const requirements = candidate.role?.requirements || [];
  const matched = score?.matchedRequirements || [];
  const missing = score?.missingRequirements || [];

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
      {/* Back Link & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link href={`/roles/${candidate.roleId}`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-sans w-fit gap-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {candidate.role?.title || "Candidate Pipeline"}</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={handleReanalyze}
            disabled={analyzing}
            className="gap-2 font-semibold shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${analyzing ? "animate-spin" : ""}`} />
            <span>{analyzing ? "Auditing Pipeline..." : "Re-run Automated Audit"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-2 font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <Card className="p-7 sm:p-8 shadow-xs border-0 ring-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary text-xl font-black text-primary-foreground shadow-xs">
              {getInitials(candidate.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-foreground">
                  {candidate.name}
                </h1>
                <IntegrityBadge
                  status={candidate.integrityReport?.status}
                  findingCount={findings.length}
                  hasPromptInjection={hasPromptInjection}
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-sans">
                <span>Position: <strong className="text-foreground font-semibold">{candidate.role?.title}</strong></span>
                {candidate.email && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-medium">{candidate.email}</span>
                  </>
                )}
                <span>•</span>
                <span>Screened via Gemini AI Integrity Pipeline</span>
              </div>
            </div>
          </div>

          {/* Quick Fit Summary Metric */}
          <div className="flex items-center gap-5 rounded-xl border border-border bg-muted/40 p-4 px-6">
            <div className="text-right">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block font-sans">
                Calculated Fit Match
              </span>
              <span className="text-2xl font-black text-foreground font-heading">{score?.score ?? "--"}%</span>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block font-sans">
                Requirements Matched
              </span>
              <span className="text-xs font-bold text-primary font-sans">
                {matched.length} of {requirements.length} Satisfied
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Two-Column Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Integrity & Fit Evaluation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: Pre-Scoring Integrity Audit Report */}
          <Card className="p-7 sm:p-8 space-y-6 shadow-xs border-0 ring-0">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                {hasPromptInjection ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                ) : findings.length > 0 ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold font-heading text-foreground tracking-tight">
                    Stage 1: Pre-Scoring Integrity Audit
                  </h2>
                  <p className="text-xs text-muted-foreground font-sans">
                    Mandatory verification stage executed prior to candidate scoring
                  </p>
                </div>
              </div>

              <Badge
                variant={findings.length === 0 ? "outline" : hasPromptInjection ? "destructive" : "secondary"}
                className={findings.length === 0 ? "border-primary/40 text-primary bg-primary/5 font-mono text-xs" : "font-mono text-xs"}
              >
                {findings.length === 0 ? "Verified Clean" : `${findings.length} Signals Flagged`}
              </Badge>
            </div>

            {/* Audit Summary Banner */}
            <div
              className={`rounded-xl border p-4 text-xs ${
                hasPromptInjection
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : findings.length > 0
                  ? "border-amber-500/30 bg-amber-500/5 text-foreground"
                  : "border-primary/30 bg-primary/5 text-foreground"
              }`}
            >
              <div className="font-bold flex items-center gap-2 mb-1 text-sm font-heading">
                <Sparkles className="h-4 w-4 text-primary" />
                {hasPromptInjection
                  ? "Adversarial Directives Isolated & Neutralized"
                  : findings.length > 0
                  ? "Integrity Signals Flagged for Recruiter Verification"
                  : "Zero Integrity Signals Detected"}
              </div>
              <p className="leading-relaxed text-muted-foreground font-sans">
                {candidate.integrityReport?.summary ||
                  (findings.length === 0
                    ? "Resume content verified clean across manipulation directives, timeline contradictions, and templated claim patterns."
                    : "Signals identified below. Injected directives were treated as untrusted data and not obeyed. Candidates are never silently dropped.")}
              </p>
            </div>

            {/* Findings Evidence Cards */}
            <div className="space-y-4">
              {findings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                  <CheckCircle2 className="mx-auto h-9 w-9 text-primary" />
                  <h3 className="mt-3 text-sm font-bold font-heading text-foreground">
                    Verified Clean Profile
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed font-sans">
                    Passed deterministic and semantic integrity checks with zero prompt injection attempts, overlapping timeline contradictions, or templated inflation patterns.
                  </p>
                </div>
              ) : (
                findings.map((finding) => (
                  <EvidenceCard key={finding.id || finding.title} finding={finding} />
                ))
              )}
            </div>

            {/* Trust Boundary Security Callout */}
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
              <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="font-sans">
                <strong className="text-foreground font-semibold">Security Trust Boundary:</strong> Resume text is isolated as untrusted data. The evaluator isolates and neutralizes prompt injections without obeying them, while computing fit score strictly on authentic qualifications.
              </div>
            </div>
          </Card>

          {/* SECTION 2: Role Fit Analysis */}
          <Card className="p-7 sm:p-8 space-y-6 shadow-xs border-0 ring-0">
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-heading text-foreground tracking-tight">
                  Stage 2: Objective Candidate Fit Evaluation
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Computed strictly against role requirements • Decoupled from integrity flags
                </p>
              </div>
              <Target className="h-5 w-5 text-primary" />
            </div>

            {/* Radial SVG Score Gauge */}
            <div>
              <FitScoreBadge score={score?.score} size="lg" />
            </div>

            {/* Evaluator Commentary */}
            {score?.explanation && (
              <div className="rounded-xl border border-border bg-muted/30 p-4.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-sans mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Evaluator Match Commentary:
                </div>
                <p className="text-xs text-foreground leading-relaxed font-sans">
                  {score.explanation}
                </p>
              </div>
            )}

            {/* Requirements Breakdown */}
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-foreground uppercase tracking-widest font-sans mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Demonstrated Competencies ({matched.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matched.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic font-sans">No direct competency matches evidenced</span>
                  ) : (
                    matched.map((req, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-primary/10 text-primary border border-primary/20 font-sans font-medium"
                      >
                        ✓ {req}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {missing.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans mb-2 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Unverified or Missing Competencies ({missing.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {missing.map((req, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-muted-foreground border-border font-sans font-normal"
                      >
                        ✕ {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Untrusted Resume Viewer (5 cols) */}
        <div className="lg:col-span-5 sticky top-8">
          <Card className="p-7 sm:p-8 shadow-xs border-0 ring-0">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold font-heading text-foreground tracking-tight">Untrusted Document Inspector</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyResume}
                  className="h-7 px-2.5 text-[10px] font-sans font-medium gap-1"
                  title="Copy Full Resume Text"
                >
                  {copiedResume ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                  <span>{copiedResume ? "Copied" : "Copy"}</span>
                </Button>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 text-[9px] uppercase font-mono">
                  Untrusted Payload
                </Badge>
              </div>
            </div>

            <div className="mt-4 max-h-[750px] overflow-y-auto rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed selection:bg-primary selection:text-primary-foreground">
              {candidate.resumeText}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
