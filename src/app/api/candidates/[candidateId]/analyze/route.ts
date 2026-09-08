import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { runAnalysisPipeline } from "@/services/analysis.service";

interface RouteParams {
  params: Promise<{ candidateId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { candidateId } = await params;
    const result = await runAnalysisPipeline(candidateId);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Failed to run analysis:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run analysis" },
      { status: 500 }
    );
  }
}
