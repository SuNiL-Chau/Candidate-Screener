import prisma from "@/lib/db/prisma";
import { detectPromptInjection } from "@/analyzers/prompt-injection";
import { detectTimelineInconsistencies } from "@/analyzers/timeline";
import { detectTemplatedInflation } from "@/analyzers/templated-inflation";
import { runGeminiIntegrityCheck, runGeminiCandidateScore } from "@/ai/gemini.client";
import { mergeAndDeduplicateFindings } from "@/analyzers/deduplicator";
import { AnalysisPipelineResult } from "@/types";

export async function runAnalysisPipeline(candidateId: string): Promise<AnalysisPipelineResult> {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { role: true },
  });

  if (!candidate) {
    throw new Error(`Candidate ${candidateId} not found`);
  }

  // 1. Initialize or Reset Integrity Report state to PROCESSING
  const existingReport = await prisma.integrityReport.findUnique({
    where: { candidateId },
  });

  if (existingReport) {
    // Clear old findings if re-analyzing
    await prisma.integrityFinding.deleteMany({
      where: { reportId: existingReport.id },
    });
    await prisma.integrityReport.update({
      where: { id: existingReport.id },
      data: {
        status: "PROCESSING",
        completedAt: null,
      },
    });
  } else {
    await prisma.integrityReport.create({
      data: {
        candidateId,
        status: "PROCESSING",
      },
    });
  }

  try {
    const resumeText = candidate.resumeText;

    // 2. STAGE 1: Pre-Scoring Integrity Analysis
    // 2.1 Deterministic Analyzers
    const injectionFindings = detectPromptInjection(resumeText);
    const timelineFindings = detectTimelineInconsistencies(resumeText);
    const inflationFindings = detectTemplatedInflation(resumeText);

    // 2.2 Semantic Gemini Analyzer
    const semanticFindings = await runGeminiIntegrityCheck(resumeText);

    // 2.3 Merge and Deduplicate all findings
    const mergedFindings = mergeAndDeduplicateFindings([
      injectionFindings,
      timelineFindings,
      inflationFindings,
      semanticFindings,
    ]);

    // 2.4 Persist Integrity Report & Findings
    const reportSummary =
      mergedFindings.length === 0
        ? "No integrity issues detected across manipulation, timeline, or templated claim checks."
        : `Identified ${mergedFindings.length} integrity signal(s) requiring recruiter review.`;

    await prisma.integrityReport.update({
      where: { candidateId },
      data: {
        status: "COMPLETED",
        summary: reportSummary,
        completedAt: new Date(),
        findings: {
          create: mergedFindings.map((f) => ({
            type: f.type,
            severity: f.severity,
            title: f.title,
            evidence: f.evidence,
            explanation: f.explanation,
            recommendedAction: f.recommendedAction,
            confidence: f.confidence,
            metadata: (f.metadata || {}) as any,
          })),
        },
      },
    });

    const reportWithFindings = await prisma.integrityReport.findUniqueOrThrow({
      where: { candidateId },
      include: {
        findings: {
          orderBy: [{ severity: "desc" }, { confidence: "desc" }],
        },
      },
    });

    // 3. STAGE 2: Candidate Fit Scoring (Strictly against role requirements)
    const requirements = (candidate.role.requirements as string[]) || [];
    const scoreResult = await runGeminiCandidateScore(
      candidate.role.title,
      candidate.role.description,
      requirements,
      resumeText
    );

    // 3.1 Upsert Candidate Score
    const updatedScore = await prisma.candidateScore.upsert({
      where: { candidateId },
      create: {
        candidateId,
        score: scoreResult.score,
        matchedRequirements: scoreResult.matchedRequirements,
        missingRequirements: scoreResult.missingRequirements,
        explanation: scoreResult.explanation,
      },
      update: {
        score: scoreResult.score,
        matchedRequirements: scoreResult.matchedRequirements,
        missingRequirements: scoreResult.missingRequirements,
        explanation: scoreResult.explanation,
      },
    });

    return {
      candidateId,
      status: "COMPLETED",
      integrityReport: {
        id: reportWithFindings.id,
        status: "COMPLETED",
        summary: reportWithFindings.summary,
        completedAt: reportWithFindings.completedAt?.toISOString(),
        findings: reportWithFindings.findings.map((f) => ({
          id: f.id,
          type: f.type,
          severity: f.severity,
          title: f.title,
          evidence: f.evidence,
          explanation: f.explanation,
          recommendedAction: f.recommendedAction,
          confidence: f.confidence,
          metadata: (f.metadata as Record<string, unknown>) || undefined,
        })),
      },
      score: {
        id: updatedScore.id,
        score: updatedScore.score,
        matchedRequirements: updatedScore.matchedRequirements as string[],
        missingRequirements: updatedScore.missingRequirements as string[],
        explanation: updatedScore.explanation,
      },
    };
  } catch (error) {
    console.error(`Analysis pipeline failed for candidate ${candidateId}:`, error);

    // Mark report as FAILED, but keep candidate resume data intact
    await prisma.integrityReport.update({
      where: { candidateId },
      data: {
        status: "FAILED",
        summary: "Automated analysis encountered an error. Resume remains safely saved.",
      },
    });

    return {
      candidateId,
      status: "FAILED",
      integrityReport: {
        status: "FAILED",
        summary: "Analysis failed. Please retry.",
        findings: [],
      },
      error: error instanceof Error ? error.message : "Unknown error during analysis",
    };
  }
}
