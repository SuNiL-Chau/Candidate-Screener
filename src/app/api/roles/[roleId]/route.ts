import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getRoleById, deleteRole, updateRoleStatus } from "@/services/role.service";

interface RouteParams {
  params: Promise<{ roleId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await params;
    const role = await getRoleById(roleId);

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Failed to fetch role:", error);
    return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await params;
    const body = await request.json();

    if (!body.status || !["OPEN", "CLOSED"].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'OPEN' or 'CLOSED'." },
        { status: 400 }
      );
    }

    const role = await updateRoleStatus(roleId, body.status);
    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Failed to update role status:", error);
    return NextResponse.json({ error: "Failed to update role status" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await params;
    await deleteRole(roleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete role:", error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
