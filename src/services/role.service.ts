import prisma from "@/lib/db/prisma";
import { RoleData } from "@/types";

export async function listRoles(userId: string): Promise<RoleData[]> {
  const roles = await prisma.role.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: "desc" },
    include: {
      candidates: {
        include: {
          integrityReport: {
            include: { findings: true },
          },
          score: true,
        },
      },
    },
  });

  return roles.map((r) => {
    const candidateCount = r.candidates.length;
    const reviewNeededCount = r.candidates.filter(
      (c) => (c.integrityReport?.findings?.length || 0) > 0
    ).length;

    return {
      id: r.id,
      title: r.title,
      description: r.description,
      requirements: (r.requirements as string[]) || [],
      createdById: r.createdById,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      candidateCount,
      reviewNeededCount,
    };
  });
}

export async function getRoleById(roleId: string) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      candidates: {
        include: {
          integrityReport: {
            include: { findings: true },
          },
          score: true,
        },
        orderBy: [
          {
            score: {
              score: "desc",
            },
          },
          { createdAt: "desc" },
        ],
      },
    },
  });

  if (!role) return null;

  return {
    ...role,
    requirements: (role.requirements as string[]) || [],
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
    candidates: role.candidates.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
  };
}

export async function createRole(data: {
  title: string;
  description: string;
  requirements: string[];
  createdById: string;
}) {
  return await prisma.role.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      requirements: data.requirements.filter(Boolean),
      createdById: data.createdById,
    },
  });
}

export async function deleteRole(roleId: string) {
  return await prisma.role.delete({
    where: { id: roleId },
  });
}
