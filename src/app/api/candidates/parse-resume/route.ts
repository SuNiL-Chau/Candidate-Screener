import { NextRequest, NextResponse } from "next/server";
import {
  parseResumeBuffer,
  scrapeResumeFromUrl,
  extractCandidateMetadata,
} from "@/services/resume-parser.service";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Multipart Form Data (File Upload: PDF, DOCX, TXT, MD)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided for resume parsing." },
          { status: 400 }
        );
      }

      // Max size limit: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds 10MB limit." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const rawText = await parseResumeBuffer(buffer, file.name, file.type);
      const metadata = extractCandidateMetadata(rawText);

      return NextResponse.json({
        success: true,
        source: "file",
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || file.name.split(".").pop(),
        name: metadata.name,
        email: metadata.email,
        resumeText: metadata.cleanText,
        wordCount: metadata.cleanText.trim().split(/\s+/).length,
      });
    }

    // 2. JSON Body (Web URL Scraping)
    if (contentType.includes("application/json")) {
      const body = await req.json();

      if (body.url) {
        const rawText = await scrapeResumeFromUrl(body.url);
        const metadata = extractCandidateMetadata(rawText);

        return NextResponse.json({
          success: true,
          source: "url",
          url: body.url,
          name: metadata.name,
          email: metadata.email,
          resumeText: metadata.cleanText,
          wordCount: metadata.cleanText.trim().split(/\s+/).length,
        });
      }

      return NextResponse.json(
        { error: "Missing 'url' parameter for resume scraping." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Invalid Content-Type. Expected multipart/form-data or application/json." },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("Resume parsing error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to parse resume content.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
