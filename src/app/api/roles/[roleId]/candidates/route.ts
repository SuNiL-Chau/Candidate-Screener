import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createCandidate } from "@/services/candidate.service";
import { runAnalysisPipeline } from "@/services/analysis.service";
import { z } from "zod";

const createCandidateSchema = z.object({
  name: z.string().min(2, "Candidate name is required"),
  email: z.string().email().optional().or(z.literal("")),
  resumeText: z.string().min(20, "Resume text must be at least 20 characters"),
  autoAnalyze: z.boolean().optional().default(true),
});

interface RouteParams {
  params: Promise<{ roleId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await params;
    const body = await request.json();
    const validated = createCandidateSchema.parse(body);

    const candidate = await createCandidate({
      roleId,
      name: validated.name,
      email: validated.email || null,
      resumeText: validated.resumeText,
    });

    // Run integrity check + scoring pipeline if requested
    if (validated.autoAnalyze) {
      // Execute pipeline
      const analysisResult = await runAnalysisPipeline(candidate.id);
      return NextResponse.json({ candidate, analysis: analysisResult }, { status: 201 });
    }

    return NextResponse.json({ candidate }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Failed to create candidate:", error);
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }
}
