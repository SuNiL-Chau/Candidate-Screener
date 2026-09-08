import React from "react";

interface FitScoreBadgeProps {
  score?: number | null;
  size?: "sm" | "md" | "lg";
}

export function FitScoreBadge({ score, size = "md" }: FitScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
        Not Scored
      </span>
    );
  }

  const getTier = (val: number) => {
    if (val >= 85) {
      return {
        label: "Exceptional Match",
        color: "#059669",
        textColor: "text-emerald-700",
        badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
      };
    }
    if (val >= 70) {
      return {
        label: "Strong Fit",
        color: "#2563eb",
        textColor: "text-blue-700",
        badgeBg: "bg-blue-50 border-blue-200 text-blue-700",
      };
    }
    if (val >= 50) {
      return {
        label: "Moderate Fit",
        color: "#d97706",
        textColor: "text-amber-700",
        badgeBg: "bg-amber-50 border-amber-200 text-amber-700",
      };
    }
    return {
      label: "Low Match",
      color: "#64748b",
      textColor: "text-slate-600",
      badgeBg: "bg-slate-100 border-slate-200 text-slate-600",
    };
  };

  const tier = getTier(score);

  // Large Radial Gauge for Showcase Screen
  if (size === "lg") {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex items-center gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="relative flex items-center justify-center">
          <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              strokeWidth="7"
              stroke="#f1f5f9"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke={tier.color}
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-2xl font-black tracking-tight ${tier.textColor}`}>
              {score}%
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${tier.badgeBg}`}
            >
              {tier.label}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Normalized 0-100</span>
          </div>
          <h4 className="mt-2 text-base font-bold text-slate-900">Objective Role Fit Score</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Evaluated strictly against stated requirements. Integrity flags are decoupled and do not artificially lower this score.
          </p>
        </div>
      </div>
    );
  }

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold font-mono ${tier.badgeBg}`}
      >
        {score}%
      </span>
    );
  }

  // Medium (Table Row Size) - Radial Mini Meter
  const miniRadius = 14;
  const miniCircumference = 2 * Math.PI * miniRadius;
  const miniOffset = miniCircumference - (score / 100) * miniCircumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg className="h-9 w-9 -rotate-90 transform" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={miniRadius}
            strokeWidth="3.5"
            stroke="#f1f5f9"
            fill="transparent"
          />
          <circle
            cx="18"
            cy="18"
            r={miniRadius}
            strokeWidth="3.5"
            strokeDasharray={miniCircumference}
            strokeDashoffset={miniOffset}
            strokeLinecap="round"
            stroke={tier.color}
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className={`absolute text-[10px] font-black font-mono ${tier.textColor}`}>
          {score}%
        </span>
      </div>

      <span
        className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tier.badgeBg}`}
      >
        {tier.label}
      </span>
    </div>
  );
}
