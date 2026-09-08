import { IntegrityFindingData } from "@/types";

interface InjectionPattern {
  name: string;
  regex: RegExp;
  title: string;
  explanation: string;
  recommendedAction: string;
  severity: "HIGH" | "MEDIUM";
  confidence: number;
}

const INJECTION_PATTERNS: InjectionPattern[] = [
  {
    name: "ignore_previous",
    regex: /(?:ignore|disregard|forget|bypass|override)\s+(?:all\s+|any\s+|the\s+)?(?:previous|prior|above|system|initial)\s+instructions/i,
    title: "Instruction override directive detected",
    explanation: "Text explicitly commands the evaluator to ignore previous or system instructions.",
    recommendedAction: "Review flagged section. The evaluation engine isolated this text as untrusted data and did not follow it.",
    severity: "HIGH",
    confidence: 0.98,
  },
  {
    name: "score_manipulation",
    regex: /(?:give\s+(?:me|this\s+candidate)|assign|grant|set\s+score\s+to)\s+(?:a\s+)?(?:score\s+of\s*)?(?:100%?|maximum|top|perfect|highest)/i,
    title: "Direct score manipulation instruction",
    explanation: "Text instructs the automated evaluator to assign a perfect or specific score.",
    recommendedAction: "Inspect candidate experience manually; candidate score was computed independently of this text.",
    severity: "HIGH",
    confidence: 0.97,
  },
  {
    name: "role_impersonation",
    regex: /(?:(?:system|assistant|evaluator|admin)\s*:\s*|\[INST\]|<<SYS>>|<\|im_start\|>system|<\|system\|>)/i,
    title: "AI role delimiter / prompt injection formatting",
    explanation: "Text uses prompt engineering role delimiters (e.g. system:, [INST], <<SYS>>) intended to hijack LLM behavior.",
    recommendedAction: "Check original resume source; instruction was neutralized and evaluated as plain untrusted string.",
    severity: "HIGH",
    confidence: 0.96,
  },
  {
    name: "suppress_findings",
    regex: /(?:do\s+not|never|suppress|hide)\s+(?:flag|report|show|detect|mention)\s+(?:any\s+)?(?:issues|inconsistencies|errors|flags|findings)/i,
    title: "Finding suppression directive",
    explanation: "Text attempts to instruct the screening system to conceal integrity findings or inconsistencies.",
    recommendedAction: "Ensure all candidate claims are vetted during the technical interview.",
    severity: "HIGH",
    confidence: 0.95,
  },
  {
    name: "recommend_hire_directive",
    regex: /(?:must\s+be\s+hired|recommend\s+(?:immediate\s+)?hire|fast-track\s+candidate|bypass\s+all\s+screens)/i,
    title: "Mandatory hiring directive detected",
    explanation: "Text contains directives demanding automated hiring recommendation or screen bypass.",
    recommendedAction: "Review resume content for hidden formatting or white-on-white text attempts.",
    severity: "HIGH",
    confidence: 0.92,
  },
];

export function detectPromptInjection(resumeText: string): IntegrityFindingData[] {
  const findings: IntegrityFindingData[] = [];
  const lines = resumeText.split(/\r?\n/);

  for (const pattern of INJECTION_PATTERNS) {
    // Check against whole text or line-by-line to get precise evidence snippet
    const match = resumeText.match(pattern.regex);
    if (match) {
      // Find the surrounding line/context for evidence
      let evidenceSnippet = match[0];
      for (const line of lines) {
        if (pattern.regex.test(line)) {
          evidenceSnippet = line.trim();
          break;
        }
      }

      // Keep evidence concise (max 180 chars)
      if (evidenceSnippet.length > 200) {
        const start = Math.max(0, match.index! - 30);
        evidenceSnippet = "..." + resumeText.substring(start, start + 180).trim() + "...";
      }

      findings.push({
        type: "PROMPT_INJECTION",
        severity: pattern.severity,
        title: pattern.title,
        evidence: `"${evidenceSnippet}"`,
        explanation: pattern.explanation,
        recommendedAction: pattern.recommendedAction,
        confidence: pattern.confidence,
        metadata: {
          patternName: pattern.name,
          matchedText: match[0],
        },
      });
    }
  }

  return findings;
}
