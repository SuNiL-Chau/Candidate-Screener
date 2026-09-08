import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listRoles, createRole } from "@/services/role.service";
import { z } from "zod";

const createRoleSchema = z.object({
  title: z.string().min(2, "Role title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  requirements: z.array(z.string().min(1)).min(1, "At least one requirement is required"),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roles = await listRoles(user.id);
    return NextResponse.json({ roles });
  } catch (error) {
    console.error("Failed to list roles:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createRoleSchema.parse(body);

    const newRole = await createRole({
      ...validated,
      createdById: user.id,
    });

    return NextResponse.json({ role: newRole }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Failed to create role:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
