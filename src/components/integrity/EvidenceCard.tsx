"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CalendarClock,
  Copy,
  Check,
  HelpCircle,
  MessageSquareQuote,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import { IntegrityFindingData } from "@/types";

interface EvidenceCardProps {
  finding: IntegrityFindingData;
}

export function EvidenceCard({ finding }: EvidenceCardProps) {
  const [copiedEvidence, setCopiedEvidence] = useState(false);
  const [copiedQuestion, setCopiedQuestion] = useState(false);
  const [verifiedByHuman, setVerifiedByHuman] = useState(false);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "border-rose-200 bg-rose-50 text-rose-700";
      case "MEDIUM":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "LOW":
        return "border-sky-200 bg-sky-50 text-sky-800";
      default:
        return "border-slate-200 bg-slate-100 text-slate-700";
    }
  };

  const getTypeTheme = (type: string) => {
    switch (type) {
      case "PROMPT_INJECTION":
        return {
          icon: <ShieldAlert className="h-4 w-4 text-rose-600" />,
          label: "Adversarial Prompt Injection Directive",
          quoteBorder: "border-rose-500",
          quoteBg: "bg-rose-50/50 text-slate-800",
        };
      case "INTERNAL_INCONSISTENCY":
        return {
          icon: <CalendarClock className="h-4 w-4 text-amber-600" />,
          label: "Employment Timeline Inconsistency",
          quoteBorder: "border-amber-500",
          quoteBg: "bg-amber-50/50 text-slate-800",
        };
      case "TEMPLATED_INFLATION":
        return {
          icon: <Copy className="h-4 w-4 text-sky-600" />,
          label: "Formulaic Templated Achievement Claim",
          quoteBorder: "border-sky-500",
          quoteBg: "bg-sky-50/50 text-slate-800",
        };
      default:
        return {
          icon: <HelpCircle className="h-4 w-4 text-slate-600" />,
          label: type,
          quoteBorder: "border-blue-500",
          quoteBg: "bg-slate-50 text-slate-800",
        };
    }
  };

  const theme = getTypeTheme(finding.type);

  const handleCopyEvidence = () => {
    navigator.clipboard.writeText(finding.evidence);
    setCopiedEvidence(true);
    setTimeout(() => setCopiedEvidence(false), 2000);
  };

  const handleCopyQuestion = () => {
    navigator.clipboard.writeText(finding.recommendedAction);
    setCopiedQuestion(true);
    setTimeout(() => setCopiedQuestion(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm ${
        verifiedByHuman ? "opacity-75" : ""
      }`}
    >
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          {theme.icon}
          <span className="text-xs font-bold tracking-wider uppercase text-slate-700 font-mono">
            {theme.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSeverityStyle(
              finding.severity
            )}`}
          >
            {finding.severity} Severity
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600">
            {Math.round(finding.confidence * 100)}% Conf
          </span>
        </div>
      </div>

      {/* Finding Title */}
      <div className="mt-3">
        <h4 className="text-sm font-bold text-slate-900 tracking-tight">{finding.title}</h4>
      </div>

      {/* Quoted Resume Evidence Box */}
      <div className="mt-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase mb-1.5">
          <span className="flex items-center gap-1.5 text-blue-600">
            <MessageSquareQuote className="h-3.5 w-3.5" />
            Untrusted Resume Excerpt (Quarantined)
          </span>
          <button
            onClick={handleCopyEvidence}
            className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-sans font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {copiedEvidence ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
            <span>{copiedEvidence ? "Copied" : "Copy Excerpt"}</span>
          </button>
        </div>

        <blockquote
          className={`font-mono text-xs whitespace-pre-line break-words border-l-2 ${theme.quoteBorder} pl-3 py-1 ${theme.quoteBg} rounded-r-lg font-medium`}
        >
          {finding.evidence}
        </blockquote>
      </div>

      {/* Detection Analysis Rationale */}
      <div className="mt-3.5 space-y-2.5 text-xs">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <span className="font-bold text-slate-800">Analysis: </span>
          <span className="text-slate-600 leading-relaxed">{finding.explanation}</span>
        </div>

        {/* Recruiter Strategy & Verification Question */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900 tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Recruiter Action & Recommended Verification Question
            </span>
            <button
              onClick={handleCopyQuestion}
              className="flex items-center gap-1 rounded bg-white border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-800 hover:bg-blue-100/50 transition-colors cursor-pointer"
            >
              {copiedQuestion ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-blue-600" />}
              <span>{copiedQuestion ? "Copied Question" : "Copy Question"}</span>
            </button>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">{finding.recommendedAction}</p>
        </div>
      </div>

      {/* Human Recruiter Verification Checkbox */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setVerifiedByHuman(!verifiedByHuman)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          {verifiedByHuman ? (
            <CheckSquare className="h-4 w-4 text-emerald-600" />
          ) : (
            <Square className="h-4 w-4 text-slate-400" />
          )}
          <span>
            {verifiedByHuman ? "Marked as verified by human reviewer" : "Mark as verified during candidate interview"}
          </span>
        </button>

        {verifiedByHuman && (
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            Verified by Human
          </span>
        )}
      </div>
    </div>
  );
}
