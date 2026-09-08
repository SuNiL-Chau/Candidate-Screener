import prisma from "@/lib/db/prisma";

export async function getCandidateById(candidateId: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      role: true,
      integrityReport: {
        include: {
          findings: {
            orderBy: [{ severity: "desc" }, { confidence: "desc" }],
          },
        },
      },
      score: true,
    },
  });

  if (!candidate) return null;

  return {
    ...candidate,
    role: {
      ...candidate.role,
      requirements: (candidate.role.requirements as string[]) || [],
      createdAt: candidate.role.createdAt.toISOString(),
      updatedAt: candidate.role.updatedAt.toISOString(),
    },
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
    integrityReport: candidate.integrityReport
      ? {
          ...candidate.integrityReport,
          createdAt: candidate.integrityReport.createdAt.toISOString(),
          completedAt: candidate.integrityReport.completedAt?.toISOString() || null,
          findings: candidate.integrityReport.findings.map((f) => ({
            ...f,
            createdAt: f.createdAt.toISOString(),
            metadata: (f.metadata as Record<string, unknown>) || undefined,
          })),
        }
      : null,
    score: candidate.score
      ? {
          ...candidate.score,
          matchedRequirements: (candidate.score.matchedRequirements as string[]) || [],
          missingRequirements: (candidate.score.missingRequirements as string[]) || [],
          createdAt: candidate.score.createdAt.toISOString(),
        }
      : null,
  };
}

export async function createCandidate(data: {
  roleId: string;
  name: string;
  email?: string | null;
  resumeText: string;
}) {
  return await prisma.candidate.create({
    data: {
      roleId: data.roleId,
      name: data.name.trim(),
      email: data.email?.trim() || null,
      resumeText: data.resumeText.trim(),
    },
    include: {
      role: true,
    },
  });
}

export async function deleteCandidate(candidateId: string) {
  return await prisma.candidate.delete({
    where: { id: candidateId },
  });
}
