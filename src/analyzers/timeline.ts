import { IntegrityFindingData } from "@/types";

interface ParsedEmployment {
  company: string;
  role: string;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
  rawText: string;
  isConsultingOrPartTime: boolean;
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const CONSULTING_KEYWORDS = [
  "consultant", "consulting", "advisor", "advisory", "freelance",
  "contract", "contractor", "part-time", "part time", "intern", "internship", "volunteer"
];

const EDUCATION_KEYWORDS = [
  "university", "college", "degree", "b.s.", "b.a.", "m.s.", "ph.d", "bachelor", "master", "education", "gpa"
];

function isEducation(text: string): boolean {
  const lower = text.toLowerCase();
  return EDUCATION_KEYWORDS.some((kw) => lower.includes(kw));
}

function isLegitimateConcurrent(text: string): boolean {
  const lower = text.toLowerCase();
  return CONSULTING_KEYWORDS.some((kw) => lower.includes(kw));
}

export function detectTimelineInconsistencies(resumeText: string): IntegrityFindingData[] {
  const findings: IntegrityFindingData[] = [];
  const lines = resumeText.split(/\r?\n/);
  const currentYear = new Date().getFullYear();

  // Pattern: (Month)? Year - (Month)? (Year|Present|Current)
  // e.g., "Jan 2021 - Present", "2021 - 2023", "05/2020 - 08/2022"
  const dateRegex = /(?:([a-zA-Z]{3,9})\s+)?(20\d\d|19\d\d)\s*(?:-|–|to)\s*(?:([a-zA-Z]{3,9})\s+)?(20\d\d|19\d\d|present|current|now)/i;

  const employments: ParsedEmployment[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(dateRegex);
    if (match) {
      const startMonthStr = match[1]?.toLowerCase();
      const startYear = parseInt(match[2], 10);
      const endMonthStr = match[3]?.toLowerCase();
      const endYearStr = match[4].toLowerCase();

      const startMonth = startMonthStr && MONTH_MAP[startMonthStr] ? MONTH_MAP[startMonthStr] : 1;
      let endYear = currentYear;
      let endMonth = 12;

      if (endYearStr !== "present" && endYearStr !== "current" && endYearStr !== "now") {
        endYear = parseInt(endYearStr, 10);
        endMonth = endMonthStr && MONTH_MAP[endMonthStr] ? MONTH_MAP[endMonthStr] : 12;
      }

      // Check adjacent lines for company / role context
      const contextLines = [
        lines[i - 1] || "",
        line,
        lines[i + 1] || ""
      ].join(" ");

      if (isEducation(contextLines)) {
        continue;
      }

      // Extract putative company/role name: prefer preceding line if it has title/company
      let cleanLabel = "";
      if (lines[i - 1] && lines[i - 1].trim() && !dateRegex.test(lines[i - 1])) {
        cleanLabel = lines[i - 1].trim().split(/[—–|-]/)[0].trim();
      }
      if (!cleanLabel) {
        cleanLabel = line.replace(match[0], "").replace(/[|•\-,]/g, "").trim();
      }
      if (!cleanLabel) {
        cleanLabel = `Role (${startYear}-${endYearStr})`;
      }

      employments.push({
        company: cleanLabel.slice(0, 50),
        role: (lines[i - 1] ? lines[i - 1].trim() : line).slice(0, 60),
        startYear,
        startMonth,
        endYear,
        endMonth,
        rawText: match[0],
        isConsultingOrPartTime: isLegitimateConcurrent(contextLines),
      });
    }
  }

  // Compare each pair of employment periods
  for (let i = 0; i < employments.length; i++) {
    for (let j = i + 1; j < employments.length; j++) {
      const empA = employments[i];
      const empB = employments[j];

      // Convert to decimal years for overlap check
      const startA = empA.startYear + (empA.startMonth - 1) / 12;
      const endA = empA.endYear + (empA.endMonth - 1) / 12;
      const startB = empB.startYear + (empB.startMonth - 1) / 12;
      const endB = empB.endYear + (empB.endMonth - 1) / 12;

      // Check overlap: Start of one is before end of other, by more than 3 months (0.25 years)
      const overlapStart = Math.max(startA, startB);
      const overlapEnd = Math.min(endA, endB);
      const overlapMonths = Math.round((overlapEnd - overlapStart) * 12);

      if (overlapMonths >= 4 && empA.company !== empB.company) {
        const hasLegitimateReason = empA.isConsultingOrPartTime || empB.isConsultingOrPartTime;

        if (hasLegitimateReason) {
          findings.push({
            type: "INTERNAL_INCONSISTENCY",
            severity: "LOW",
            title: "Potential timeline overlap (Concurrent consulting/part-time possible)",
            evidence: `"${empA.company} (${empA.rawText})" overlaps with "${empB.company} (${empB.rawText})" by approx. ${overlapMonths} months.`,
            explanation: "Candidate lists overlapping dates between roles, but context contains advisory/consulting/part-time markers that frequently indicate valid concurrent engagements.",
            recommendedAction: "Confirm during initial call if this was an intentional concurrent consulting or advisory engagement.",
            confidence: 0.65,
            metadata: {
              overlapMonths,
              roleA: empA.company,
              roleB: empB.company,
              concurrentFlag: true,
            },
          });
        } else {
          findings.push({
            type: "INTERNAL_INCONSISTENCY",
            severity: "MEDIUM",
            title: "Potential employment timeline overlap",
            evidence: `"${empA.company} (${empA.rawText})" overlaps with "${empB.company} (${empB.rawText})" by approx. ${overlapMonths} months.`,
            explanation: `Employment periods appear to overlap by roughly ${overlapMonths} months across distinct full-time roles without explicit concurrent notation.`,
            recommendedAction: "Verify exact start/end dates with candidate during the screening call to clarify timeline.",
            confidence: 0.85,
            metadata: {
              overlapMonths,
              roleA: empA.company,
              roleB: empB.company,
            },
          });
        }
      }
    }
  }

  // Cap findings to prevent clutter
  return findings.slice(0, 3);
}
