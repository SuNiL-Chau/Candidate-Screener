import mammoth from "mammoth";

export interface ParsedResumeResult {
  name: string;
  email: string;
  resumeText: string;
  wordCount: number;
  source: "file" | "url" | "text";
  fileName?: string;
  fileType?: string;
}

/**
 * Parses raw buffer of an uploaded resume (PDF, DOCX, TXT, MD)
 */
export async function parseResumeBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  // 1. PDF File
  if (ext === "pdf" || mimeType === "application/pdf") {
    try {
      const { extractText } = await import("unpdf");
      const { text } = await extractText(new Uint8Array(buffer));
      let raw = Array.isArray(text) ? text.join("\n\n") : text || "";
      // Clean up common page markers like "-- 1 of 2 --"
      raw = raw.replace(/\n\s*--\s*\d+\s+of\s+\d+\s*--\s*\n/gi, "\n\n");
      return raw.trim();
    } catch (err) {
      console.error("Failed to parse PDF with unpdf:", err);
      throw new Error("Unable to extract text from PDF. Please ensure the document is not password protected or corrupted.");
    }
  }

  // 2. Word Document (.docx)
  if (
    ext === "docx" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    } catch (err) {
      console.error("Failed to parse DOCX with mammoth:", err);
      throw new Error("Unable to extract text from Word document (.docx).");
    }
  }

  // 3. Plain Text or Markdown
  if (
    ext === "txt" ||
    ext === "md" ||
    ext === "rtf" ||
    mimeType?.startsWith("text/")
  ) {
    return buffer.toString("utf-8").trim();
  }

  throw new Error(
    `Unsupported file format (.${ext}). Supported formats are PDF (.pdf), Word (.docx), and Text (.txt, .md).`
  );
}

/**
 * Scrapes and extracts readable resume text from a target web URL
 */
export async function scrapeResumeFromUrl(targetUrl: string): Promise<string> {
  let urlObj: URL;
  try {
    urlObj = new URL(targetUrl);
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      throw new Error("Invalid URL protocol");
    }
  } catch {
    throw new Error("Please enter a valid HTTP or HTTPS web URL.");
  }

  const response = await fetch(urlObj.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch resume from URL (HTTP ${response.status} ${response.statusText}).`
    );
  }

  const html = await response.text();

  // Strip script, style, navigation, header, footer, SVG elements
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "");

  // Convert line breaks and paragraph closings to newlines
  cleaned = cleaned
    .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6]|\/tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&middot;/gi, "•");

  // Collapse multiple horizontal spaces while preserving linebreaks
  const lines = cleaned
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line) => line.length > 0);

  const text = lines.join("\n");
  if (text.length < 30) {
    throw new Error(
      "The scraped web page did not contain sufficient textual content. Please verify the URL or paste the resume text directly."
    );
  }

  return text;
}

/**
 * Deterministically extracts candidate full name, email, and cleaned text
 */
export function extractCandidateMetadata(rawText: string): {
  name: string;
  email: string;
  cleanText: string;
} {
  // 1. Extract Email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].trim().toLowerCase() : "";

  // 2. Extract Name Heuristics
  // Look at the first 10 non-empty lines for a line that resembles a person's name
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let detectedName = "";
  const ignoredHeadings = [
    "resume",
    "curriculum vitae",
    "cv",
    "summary",
    "experience",
    "education",
    "skills",
    "profile",
    "contact",
    "about me",
    "portfolio",
    "work experience",
    "professional experience",
    "http",
    "https",
    "www",
  ];

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Skip if line contains an email, url, or common resume heading
    if (line.includes("@") || line.includes("http://") || line.includes("https://")) continue;
    if (ignoredHeadings.some((heading) => lower === heading || lower.startsWith(heading + ":"))) continue;

    // Check if line looks like a name: 2-4 words, starts with capital letters, no digits
    const words = line.split(/[ ,|•·-]+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 4 && !/\d/.test(line)) {
      // Check that words are capitalized
      const isCapitalized = words.every((w) => /^[A-Z][a-zA-Z.'-]*$/.test(w));
      if (isCapitalized && line.length <= 40) {
        detectedName = line;
        break;
      }
    }
  }

  // 3. Normalize Clean Text
  // Compress excessive empty lines to at most 2 newlines
  const cleanText = rawText.replace(/\n{3,}/g, "\n\n").trim();

  return {
    name: detectedName,
    email,
    cleanText,
  };
}
