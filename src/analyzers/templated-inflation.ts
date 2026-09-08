import { IntegrityFindingData } from "@/types";

export function detectTemplatedInflation(resumeText: string): IntegrityFindingData[] {
  const findings: IntegrityFindingData[] = [];
  const lines = resumeText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Regex to match quantified claims like "by 40%", "reduced latency by 50%", "saved $2M", etc.
  const quantifiedPattern = /(?:improved|reduced|increased|boosted|optimized|scaled|accelerated)\s+[\w\s]{2,25}?\s+by\s+(\d+%|\d+x)/i;
  const metricRegex = /\b(\d+%|\$\d+(?:\.\d+)?[kKmMbB]?|\d+x)\b/g;

  const quantifiedClaims: { line: string; metric: string }[] = [];
  const metricFrequency: Record<string, string[]> = {};

  for (const line of lines) {
    // Check if line looks like an achievement bullet
    const match = line.match(quantifiedPattern);
    if (match) {
      quantifiedClaims.push({ line, metric: match[1].toLowerCase() });
    }

    const allMetrics = line.match(metricRegex);
    if (allMetrics) {
      for (const m of allMetrics) {
        const key = m.toLowerCase();
        if (!metricFrequency[key]) metricFrequency[key] = [];
        // Avoid duplicate lines for same metric
        if (!metricFrequency[key].includes(line)) {
          metricFrequency[key].push(line);
        }
      }
    }
  }

  // Check 1: Identical percentage/multiplier repeated across 3 or more distinct achievement lines
  for (const [metric, matchingLines] of Object.entries(metricFrequency)) {
    // Filter out common mundane numbers like 100% test coverage or standard percentages if only twice
    if (matchingLines.length >= 3 && (metric.includes("%") || metric.includes("x") || metric.includes("$"))) {
      const evidenceList = matchingLines.slice(0, 3).map((l) => `• "${l.slice(0, 100)}"`).join("\n");

      findings.push({
        type: "TEMPLATED_INFLATION",
        severity: "MEDIUM",
        title: `Repeated quantified metric pattern (${metric})`,
        evidence: evidenceList,
        explanation: `The specific metric "${metric}" is cited in ${matchingLines.length} separate achievement statements. Repetitive round figures across disparate projects often indicate template-based or estimated figures.`,
        recommendedAction: `Ask candidate to elaborate on the baseline measurements and specific architecture optimizations behind each of the ${metric} outcomes.`,
        confidence: 0.85,
        metadata: {
          metric,
          occurrenceCount: matchingLines.length,
        },
      });
      break; // One strong metric finding is usually sufficient and clean
    }
  }

  // Check 2: Repetitive formulaic structure: "Improved/reduced [X] by [Y]%" repeated multiple times
  if (findings.length === 0 && quantifiedClaims.length >= 3) {
    const evidenceList = quantifiedClaims.slice(0, 3).map((c) => `• "${c.line.slice(0, 90)}"`).join("\n");

    findings.push({
      type: "TEMPLATED_INFLATION",
      severity: "LOW",
      title: "Formulaic quantified achievement claims",
      evidence: evidenceList,
      explanation: "Multiple achievement bullet points follow an identical grammatical formula ('verb + metric percentage') without contextual operational details.",
      recommendedAction: "Request deeper details regarding candidate's direct personal contribution versus overall team achievements.",
      confidence: 0.70,
      metadata: {
        claimCount: quantifiedClaims.length,
      },
    });
  }

  return findings;
}
