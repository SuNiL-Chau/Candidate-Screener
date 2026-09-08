import { GoogleGenerativeAI } from "@google/generative-ai";
import { IntegrityFindingData, CandidateScoreData } from "@/types";
import { INTEGRITY_SYSTEM_PROMPT, buildIntegrityPrompt } from "./prompts/integrity";
import { SCORING_SYSTEM_PROMPT, buildScoringPrompt } from "./prompts/scoring";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Strips markdown code fences (```json ... ```) from model output.
 */
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Runs semantic integrity analysis via Gemini.
 * Returns structured findings.
 */
export async function runGeminiIntegrityCheck(
  resumeText: string
): Promise<IntegrityFindingData[]> {
  if (!genAI || !apiKey) {
    // Graceful offline heuristic when no Gemini API key is configured
    return fallbackSemanticIntegrity(resumeText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: INTEGRITY_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const prompt = buildIntegrityPrompt(resumeText);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(cleanJsonOutput(responseText));

    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        type: item.type || "INTERNAL_INCONSISTENCY",
        severity: item.severity || "MEDIUM",
        title: item.title || "Integrity Finding",
        evidence: item.evidence || "",
        explanation: item.explanation || "",
        recommendedAction: item.recommendedAction || "Review manually",
        confidence: typeof item.confidence === "number" ? item.confidence : 0.8,
      }));
    }

    return [];
  } catch (err) {
    console.warn("Gemini API call failed, falling back to semantic heuristics:", err);
    return fallbackSemanticIntegrity(resumeText);
  }
}

/**
 * Scores candidate against role using Gemini.
 */
export async function runGeminiCandidateScore(
  roleTitle: string,
  roleDescription: string,
  requirements: string[],
  resumeText: string
): Promise<CandidateScoreData> {
  if (!genAI || !apiKey) {
    return fallbackCandidateScore(requirements, resumeText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SCORING_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const prompt = buildScoringPrompt(roleTitle, roleDescription, requirements, resumeText);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(cleanJsonOutput(responseText));

    return {
      score: Math.min(100, Math.max(0, parseInt(parsed.score, 10) || 50)),
      matchedRequirements: Array.isArray(parsed.matchedRequirements) ? parsed.matchedRequirements : [],
      missingRequirements: Array.isArray(parsed.missingRequirements) ? parsed.missingRequirements : [],
      explanation: parsed.explanation || "Evaluation completed based on stated role requirements.",
    };
  } catch (err) {
    console.warn("Gemini scoring failed, falling back to local heuristic:", err);
    return fallbackCandidateScore(requirements, resumeText);
  }
}

/**
 * Resilient offline fallback semantic integrity analysis.
 */
function fallbackSemanticIntegrity(resumeText: string): IntegrityFindingData[] {
  const findings: IntegrityFindingData[] = [];
  const lower = resumeText.toLowerCase();

  // Check for covert instruction injection
  if (lower.includes("give this candidate 100") || lower.includes("ignore previous instructions")) {
    findings.push({
      type: "PROMPT_INJECTION",
      severity: "HIGH",
      title: "Adversarial instruction injection detected",
      evidence: "Resume contains text attempting to dictate evaluation scores directly.",
      explanation: "Direct instructions to alter grading or ignore screening rules were isolated and rejected.",
      recommendedAction: "Verify resume authenticity in an interview. Evaluator ignored injected directive.",
      confidence: 0.95,
    });
  }

  return findings;
}

/**
 * Resilient offline fallback candidate fit scoring based on keyword requirement matches.
 */
function fallbackCandidateScore(
  requirements: string[],
  resumeText: string
): CandidateScoreData {
  const lowerResume = resumeText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of requirements) {
    // Check if key words of the requirement appear in the resume
    const words = req.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const hasMatch = words.some((w) => lowerResume.includes(w));
    if (hasMatch) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }

  const baseScore = requirements.length > 0
    ? Math.round((matched.length / requirements.length) * 85) + 15
    : 75;

  const score = Math.min(98, Math.max(20, baseScore));

  return {
    score,
    matchedRequirements: matched,
    missingRequirements: missing,
    explanation: `Candidate matches ${matched.length} of ${requirements.length} specified core requirements (${matched.join(", ")}). Missing clear evidence for: ${missing.length > 0 ? missing.join(", ") : "none"}.`,
  };
}
