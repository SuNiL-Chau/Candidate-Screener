import React from "react";
import { CheckCircle2, AlertTriangle, Loader2, AlertOctagon, ShieldAlert } from "lucide-react";
import { AnalysisStatus } from "@/types";

interface IntegrityBadgeProps {
  status?: AnalysisStatus;
  findingCount?: number;
  hasPromptInjection?: boolean;
}

export function IntegrityBadge({
  status = "COMPLETED",
  findingCount = 0,
  hasPromptInjection = false,
}: IntegrityBadgeProps) {
  if (status === "PROCESSING" || status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
        <span>Pre-Screen Auditing...</span>
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
        <AlertOctagon className="h-3.5 w-3.5 text-rose-600" />
        <span>Analysis Error</span>
      </span>
    );
  }

  if (findingCount === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        <span>Verified Clean</span>
      </span>
    );
  }

  if (hasPromptInjection) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
        <span>{findingCount} Flags (Adversarial Directive)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
      <span>{findingCount} {findingCount === 1 ? "Flag to Review" : "Flags to Review"}</span>
    </span>
  );
}
