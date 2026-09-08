import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCandidateById, deleteCandidate } from "@/services/candidate.service";

interface RouteParams {
  params: Promise<{ candidateId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { candidateId } = await params;
    const candidate = await getCandidateById(candidateId);

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({ candidate });
  } catch (error) {
    console.error("Failed to fetch candidate:", error);
    return NextResponse.json({ error: "Failed to fetch candidate" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { candidateId } = await params;
    await deleteCandidate(candidateId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete candidate:", error);
    return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 });
  }
}
