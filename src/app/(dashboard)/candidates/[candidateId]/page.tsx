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
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Retrieving candidate intelligence dossier...
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="minimal-card p-12 text-center text-sm text-slate-500">
        Candidate dossier not found.
      </div>
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
        <Link
          href={`/roles/${candidate.roleId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to {candidate.role?.title || "Candidate Pipeline"}</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${analyzing ? "animate-spin text-blue-600" : ""}`} />
            <span>{analyzing ? "Auditing Pipeline..." : "Re-run Automated Audit"}</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-all shadow-2xs cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="minimal-card p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-sm">
              {getInitials(candidate.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {candidate.name}
                </h1>
                <IntegrityBadge
                  status={candidate.integrityReport?.status}
                  findingCount={findings.length}
                  hasPromptInjection={hasPromptInjection}
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                <span>Position: <strong className="text-slate-800">{candidate.role?.title}</strong></span>
                {candidate.email && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600">{candidate.email}</span>
                  </>
                )}
                <span>•</span>
                <span>Screened via Gemini AI Integrity Pipeline</span>
              </div>
            </div>
          </div>

          {/* Quick Fit Summary Metric */}
          <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 px-6">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">
                Calculated Fit Match
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">{score?.score ?? "--"}%</span>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">
                Requirements Matched
              </span>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {matched.length} of {requirements.length} Satisfied
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Integrity & Fit Evaluation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: Pre-Scoring Integrity Audit Report */}
          <div className="minimal-card p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                {hasPromptInjection ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                ) : findings.length > 0 ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Stage 1: Pre-Scoring Integrity Audit
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Mandatory verification stage executed prior to candidate scoring
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold font-mono ${
                  findings.length === 0
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : hasPromptInjection
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {findings.length === 0 ? "Verified Clean" : `${findings.length} Signals Flagged`}
              </span>
            </div>

            {/* Audit Summary Banner */}
            <div
              className={`rounded-xl border p-4 text-xs ${
                hasPromptInjection
                  ? "border-rose-200 bg-rose-50/70 text-rose-900"
                  : findings.length > 0
                  ? "border-amber-200 bg-amber-50/70 text-amber-900"
                  : "border-emerald-200 bg-emerald-50/70 text-emerald-900"
              }`}
            >
              <div className="font-bold flex items-center gap-2 mb-1 text-sm">
                <Sparkles className="h-4 w-4" />
                {hasPromptInjection
                  ? "Adversarial Directives Isolated & Neutralized"
                  : findings.length > 0
                  ? "Integrity Signals Flagged for Recruiter Verification"
                  : "Zero Integrity Signals Detected"}
              </div>
              <p className="leading-relaxed text-slate-700">
                {candidate.integrityReport?.summary ||
                  (findings.length === 0
                    ? "Resume content verified clean across manipulation directives, timeline contradictions, and templated claim patterns."
                    : "Signals identified below. Injected directives were treated as untrusted data and not obeyed. Candidates are never silently dropped.")}
              </p>
            </div>

            {/* Findings Evidence Cards */}
            <div className="space-y-4">
              {findings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
                  <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />
                  <h3 className="mt-3 text-sm font-bold text-slate-900">
                    Verified Clean Profile
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
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
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600">
              <Lock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Security Trust Boundary:</strong> Resume text is isolated as untrusted data. The evaluator isolates and neutralizes prompt injections without obeying them, while computing fit score strictly on authentic qualifications.
              </div>
            </div>
          </div>

          {/* SECTION 2: Role Fit Analysis */}
          <div className="minimal-card p-7 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Stage 2: Objective Candidate Fit Evaluation
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Computed strictly against role requirements • Decoupled from integrity flags
                </p>
              </div>
              <Target className="h-5 w-5 text-blue-600" />
            </div>

            {/* Radial SVG Score Gauge */}
            <div>
              <FitScoreBadge score={score?.score} size="lg" />
            </div>

            {/* Evaluator Commentary */}
            {score?.explanation && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Evaluator Match Commentary:
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {score.explanation}
                </p>
              </div>
            )}

            {/* Requirements Breakdown */}
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Demonstrated Competencies ({matched.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matched.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No direct competency matches evidenced</span>
                  ) : (
                    matched.map((req, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 font-mono"
                      >
                        ✓ {req}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {missing.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-slate-400" />
                    <span>Unverified or Missing Competencies ({missing.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {missing.map((req, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-mono text-slate-600"
                      >
                        ✕ {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Untrusted Resume Viewer (5 cols) */}
        <div className="lg:col-span-5 minimal-card p-6 sticky top-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Untrusted Document Inspector</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyResume}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                title="Copy Full Resume Text"
              >
                {copiedResume ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
                <span>{copiedResume ? "Copied" : "Copy"}</span>
              </button>
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-mono font-bold text-amber-800 uppercase">
                Untrusted Payload
              </span>
            </div>
          </div>

          <div className="mt-4 max-h-[750px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed selection:bg-blue-600 selection:text-white">
            {candidate.resumeText}
          </div>
        </div>
      </div>
    </div>
  );
}
