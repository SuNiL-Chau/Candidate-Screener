import { IntegrityFindingData, Severity } from "@/types";

const SEVERITY_WEIGHT: Record<Severity, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

/**
 * Merges findings from deterministic rules and AI semantic analysis.
 * Deduplicates overlapping findings on the same type and evidence substring.
 * Sorts highest severity first.
 */
export function mergeAndDeduplicateFindings(
  findingsList: IntegrityFindingData[][]
): IntegrityFindingData[] {
  const allFindings = findingsList.flat();
  const merged: IntegrityFindingData[] = [];

  for (const finding of allFindings) {
    // Check if an existing finding has the same type and substantial evidence overlap
    const existingIndex = merged.findIndex((m) => {
      if (m.type !== finding.type) return false;

      // Check evidence overlap
      const ev1 = m.evidence.toLowerCase().replace(/[^a-z0-9]/g, "");
      const ev2 = finding.evidence.toLowerCase().replace(/[^a-z0-9]/g, "");

      return ev1.includes(ev2) || ev2.includes(ev1);
    });

    if (existingIndex >= 0) {
      // Pick higher severity and highest confidence
      const existing = merged[existingIndex];
      const weightExisting = SEVERITY_WEIGHT[existing.severity];
      const weightNew = SEVERITY_WEIGHT[finding.severity];

      if (weightNew > weightExisting || (weightNew === weightExisting && finding.confidence > existing.confidence)) {
        merged[existingIndex] = {
          ...finding,
          confidence: Math.max(existing.confidence, finding.confidence),
        };
      }
    } else {
      merged.push(finding);
    }
  }

  // Sort: HIGH > MEDIUM > LOW, then confidence DESC
  return merged.sort((a, b) => {
    const diff = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
    if (diff !== 0) return diff;
    return b.confidence - a.confidence;
  });
}
