import React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { marked } from "marked";
import { ArrowLeft, ExternalLink } from "lucide-react";

// Default fallback content in case of edge bundling
const FALLBACK_MARKDOWN = `# Crystal Group Candidate Screener - Written Submission Note

**Candidate:** Full-Stack Technical Lead Applicant  
**Assignment:** Crystal Group - Full-Stack Technical Lead Take-Home Assignment v4  
**Time Spent:** ~7.5 hours  
**Primary Lane:** **Lane B - AI / Product Intelligence**

---

## 1. Strongest Lane & Where I Intentionally Spent the Least Effort

**Strongest Lane - AI / Product Intelligence**

My strongest area is the AI integrity layer that sits **before candidate scoring**. Rather than treating the resume as trusted input, I designed the screening flow around a clear trust boundary: resume content is untrusted data and must never be allowed to override the evaluator's instructions.

The implementation combines deterministic checks with Gemini-based semantic analysis to identify prompt injection/manipulation, potential timeline inconsistencies, and repeated or templated achievement claims. Findings are returned with quoted evidence, a plain-language explanation, confidence, and a recruiter-oriented follow-up action.

I also kept integrity and fit evaluation decoupled. An integrity flag does **not** automatically reduce a candidate's fit score or silently remove them from consideration.

**Where I intentionally spent the least effort**

I deliberately kept the authentication and authorization model lightweight and focused on the assignment's core workflow rather than building enterprise-scale RBAC, SSO, or multi-tenant permissions. This allowed more time to go into the integrity pipeline, adversarial testing, and recruiter-facing evidence.

---

## 2. Integrity-Check Pipeline & What Could Still Get Past It

The candidate screening flow runs in two stages:

### Stage 1 - Pre-Scoring Integrity Audit

1. **Untrusted-input boundary**  
   Resume text is explicitly treated as data. Instructions contained inside the resume are never treated as application instructions.

2. **Hybrid detection**  
   Deterministic heuristics identify high-confidence manipulation patterns, while Gemini provides semantic reasoning for less explicit cases such as timeline contradictions and templated achievement inflation.

3. **Evidence-first findings**  
   Findings are normalized into structured records containing the finding type, severity, supporting excerpt, explanation, confidence, and recommended recruiter action.

### Stage 2 - Independent Role-Fit Scoring

The candidate is then evaluated against the role description and must-have requirements.

The integrity report and fit score remain separate:

> **Integrity findings indicate what should be reviewed; they do not automatically determine candidate suitability.**

For example, a candidate may receive a 58% role-fit score while also having prompt-injection content flagged for recruiter review.

### What could still get past it?

The biggest remaining limitation is **sophisticated semantic manipulation** that does not contain obvious instruction patterns. An attacker could disguise an instruction as normal resume content, use indirect or multi-step language, or construct highly plausible claims that are difficult to verify from the resume alone.

Similarly, timeline inconsistencies may remain ambiguous when overlapping work represents legitimate consulting, advisory, part-time, or contractual engagements.

The system is therefore designed to surface **potential issues for human verification**, not to claim that it can determine whether a candidate is dishonest.

---

## 3. Most Likely Way the Checks Could Be Wrong

The most likely false-positive scenario is a legitimate employment overlap.

A senior professional may simultaneously hold a full-time position and work as an advisor, consultant, founder, contractor, or part-time contributor. A purely chronological detector could incorrectly interpret this as suspicious.

### Mitigation

The system uses contextual signals to avoid treating every overlap as evidence of wrongdoing, and recruiter-facing findings use neutral language such as:

> **Potential timeline overlap**

rather than accusing the candidate of dishonesty.

The appropriate action is to verify the context with the candidate during the interview process.

For a production version, I would further improve this through recruiter feedback, a benchmark set containing non-traditional career histories, and continuous evaluation of false-positive rates.

---

## 4. Specialist Collaboration

If this product were built by three specialists, my preferred ownership would be **AI / Product Intelligence**.

### I would own

- Prompt-isolation and AI trust-boundary design
- Manipulation/injection detection
- Semantic integrity analysis
- Evaluation and adversarial test cases
- False-positive calibration
- Recruiter-facing reasoning and evidence quality

### I would need from the Product Engineering specialist

- The recruiter workflow and interaction design
- Candidate and role management
- Reliable presentation of evidence and analysis states
- Integration points for triggering and displaying analysis

### I would need from the Infrastructure & Security specialist

- Secure secret and API-key management
- Production database and deployment configuration
- Secure handling of uploaded resume files
- Monitoring, rate limiting, and production hardening

This separation lets each specialist own a clear surface while keeping the AI layer focused on the core product intelligence problem.

---

## 5. Time Investment

**~7.5 hours total**

- **~2.5 hrs - AI integrity pipeline:** trust boundary, deterministic detection, Gemini analysis, structured findings, and adversarial testing
- **~2.0 hrs - Full-stack implementation:** Next.js application, Prisma/PostgreSQL data layer, authentication, roles, candidates, and analysis flow
- **~2.0 hrs - Recruiter experience:** candidate ranking, integrity evidence views, responsive UI, and shadcn-based product styling
- **~1.0 hr - Deployment/testing/documentation:** production deployment, end-to-end validation, adversarial test cases, and submission documentation

The main trade-off was to prioritize **integrity detection, evidence quality, and a coherent end-to-end workflow** over broader enterprise features that were outside the core assignment scope.
`;

function getMarkdownContent(): string {
  try {
    const filePath = path.join(process.cwd(), "SUBMISSION_NOTE.md");
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
  } catch {
    // fallback if filesystem access fails in serverless sandbox
  }
  return FALLBACK_MARKDOWN;
}

export default async function SubmissionNotePage() {
  const rawMarkdown = getMarkdownContent();
  const htmlContent = await marked.parse(rawMarkdown);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Minimal Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider hidden sm:inline-block">
              Public Note • No Auth Required
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              <span>Live App</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <article
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Minimal Footer */}
        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            Crystal Group Candidate Screener &bull; Take-Home Assignment v4
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-primary hover:underline font-medium"
            >
              Dashboard
            </Link>
            <span>&bull;</span>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              Login Demo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
