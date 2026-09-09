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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
        return "border-destructive/30 bg-destructive/10 text-destructive";
      case "MEDIUM":
        return "border-amber-500/30 bg-amber-500/10 text-amber-700";
      case "LOW":
        return "border-primary/30 bg-primary/10 text-primary";
      default:
        return "border-border bg-muted text-muted-foreground";
    }
  };

  const getTypeTheme = (type: string) => {
    switch (type) {
      case "PROMPT_INJECTION":
        return {
          icon: <ShieldAlert className="h-4 w-4 text-destructive" />,
          label: "Adversarial Prompt Injection Directive",
          quoteBorder: "border-destructive",
          quoteBg: "bg-destructive/5 text-foreground",
        };
      case "INTERNAL_INCONSISTENCY":
        return {
          icon: <CalendarClock className="h-4 w-4 text-amber-600" />,
          label: "Employment Timeline Inconsistency",
          quoteBorder: "border-amber-500",
          quoteBg: "bg-amber-500/5 text-foreground",
        };
      case "TEMPLATED_INFLATION":
        return {
          icon: <Copy className="h-4 w-4 text-primary" />,
          label: "Formulaic Templated Achievement Claim",
          quoteBorder: "border-primary",
          quoteBg: "bg-primary/5 text-foreground",
        };
      default:
        return {
          icon: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
          label: type,
          quoteBorder: "border-primary",
          quoteBg: "bg-muted/40 text-foreground",
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
    <Card
      className={`p-6 sm:p-7 transition-all duration-200 shadow-xs hover:shadow-sm border-0 ring-0 ${
        verifiedByHuman ? "opacity-75" : ""
      }`}
    >
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          {theme.icon}
          <span className="text-xs font-bold tracking-wider uppercase text-foreground font-heading">
            {theme.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] font-bold uppercase tracking-wider ${getSeverityStyle(
              finding.severity
            )}`}
          >
            {finding.severity} Severity
          </Badge>
          <Badge variant="secondary" className="text-[10px] font-mono font-medium">
            {Math.round(finding.confidence * 100)}% Conf
          </Badge>
        </div>
      </div>

      {/* Finding Title */}
      <div className="mt-3">
        <h4 className="text-sm font-bold font-heading text-foreground tracking-tight">{finding.title}</h4>
      </div>

      {/* Quoted Resume Evidence Box */}
      <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3.5">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase mb-1.5">
          <span className="flex items-center gap-1.5 text-primary">
            <MessageSquareQuote className="h-3.5 w-3.5" />
            Untrusted Resume Excerpt (Quarantined)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyEvidence}
            className="h-6 px-2 text-[10px] gap-1 font-sans"
          >
            {copiedEvidence ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
            <span>{copiedEvidence ? "Copied" : "Copy Excerpt"}</span>
          </Button>
        </div>

        <blockquote
          className={`font-mono text-xs whitespace-pre-line break-words border-l-2 ${theme.quoteBorder} pl-3 py-1 ${theme.quoteBg} rounded-r-lg font-medium`}
        >
          {finding.evidence}
        </blockquote>
      </div>

      {/* Detection Analysis Rationale */}
      <div className="mt-3.5 space-y-2.5 text-xs font-sans">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <span className="font-bold text-foreground font-heading">Analysis: </span>
          <span className="text-muted-foreground leading-relaxed font-sans">{finding.explanation}</span>
        </div>

        {/* Recruiter Strategy & Verification Question */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-foreground tracking-wide uppercase font-heading">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Recruiter Action & Recommended Verification Question
            </span>
            <Button
              size="sm"
              onClick={handleCopyQuestion}
              className="h-6.5 px-2.5 text-[10px] gap-1 font-sans shadow-xs cursor-pointer"
            >
              {copiedQuestion ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedQuestion ? "Copied" : "Copy Question"}</span>
            </Button>
          </div>
          <p className="text-xs text-foreground leading-relaxed font-sans">{finding.recommendedAction}</p>
        </div>
      </div>

      {/* Human Recruiter Verification Checkbox */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setVerifiedByHuman(!verifiedByHuman)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {verifiedByHuman ? (
            <CheckSquare className="h-4 w-4 text-primary" />
          ) : (
            <Square className="h-4 w-4 text-muted-foreground" />
          )}
          <span>
            {verifiedByHuman ? "Marked as verified by human reviewer" : "Mark as verified during candidate interview"}
          </span>
        </button>

        {verifiedByHuman && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-[10px]">
            Verified by Human
          </Badge>
        )}
      </div>
    </Card>
  );
}
