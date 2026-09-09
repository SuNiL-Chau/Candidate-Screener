# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

In-house technical recruiters, hiring managers, and talent acquisition leaders evaluating software engineering candidates across pipeline stages. They need to rapidly screen high-volume inbound resumes, assess qualification fit against specific role criteria, and verify suspicious integrity anomalies (such as adversarial prompt injections, contradictory employment dates, or formulaic claim inflation) before scheduling interviews.

## Product Purpose

CrystalScreen is an AI-powered candidate screening dashboard that combines deterministic and LLM-driven resume evaluation with an active pre-scoring integrity layer. It exists to solve the dual challenge of modern recruitment: filtering large applicant volumes accurately while defending screening infrastructure against adversarial resume tampering and fabricated credentials without silently rejecting genuine talent.

## Positioning

A Decoupled Two-Stage Intelligence Pipeline: Unlike traditional ATS tools that perform basic keyword matching or vulnerable LLMs that blindly execute resume directives, CrystalScreen isolates untrusted resume content inside a strict security trust boundary. Adversarial prompt injections are detected and neutralized in Stage 1 without being obeyed, while Stage 2 objectively evaluates authentic qualifications against stated role requirements. Candidates are never silently auto-rejected; instead, recruiters receive quoted excerpts, detection rationales, and calibrated interview verification questions.

## Operating Context

Desktop web workspace used in recruitment workflows: reviewing role dashboards, creating position requirement matrices, intaking resumes via plain text or file upload, inspecting ranked applicant pipelines, and diving into candidate dossiers during pre-interview debriefs. Fast scanability, transparent evidence presentation, and smooth recruiter review actions are critical.

## Capabilities and Constraints

- **Pre-Scoring Integrity Audit (Stage 1):** Scans untrusted resume text for adversarial prompt injections (`PROMPT_INJECTION`), concurrent timeline overlaps (`INTERNAL_INCONSISTENCY`), and repeated formulaic metrics (`TEMPLATED_INFLATION`).
- **Objective Fit Scoring (Stage 2):** Decoupled qualification scoring (0–100%) computed strictly against role requirements, independent of integrity flags.
- **Evidence & Action Cards:** Quoted resume excerpts with quarantined highlights, detection confidence scores, analysis summaries, and copyable interviewer follow-up questions.
- **Human-in-the-Loop Verification:** Recruiters can toggle findings as verified by human reviewer directly from the dossier.
- **Technical & Deployment Constraints:** Next.js App Router, TypeScript, PostgreSQL (Prisma ORM), Gemini AI evaluation pipeline, Supabase/Vercel deployment target, and Docker container for local development.
- **Theme Constraint:** Strictly clean light theme using the shadcn Nova preset (`b23Ntvaags` — Taupe base canvas, crisp white cards, Teal accents, Raleway headings, DM Sans body).

## Brand Commitments

- **Name:** CrystalScreen (by Crystal Group)
- **Voice:** Objective, trustworthy, analytical, and respectful of applicant talent. High clarity and transparency; no black-box rejections.
- **Design System:** shadcn Nova style with warm taupe background (`oklch(0.978 0.004 60)`), crisp white cards (`oklch(1 0 0)`), rich Teal primary buttons (`oklch(0.511 0.096 186.391)`), Raleway typography for headers, and DM Sans for body/data.

## Evidence on Hand

- Core implementation in Next.js 16 App Router (`src/app/`)
- Product Requirements Document (`Crystal_Group_Candidate_Screener_PRD.docx` & `scratch/prd.md`)
- Technical Design Specification (`Crystal_Group_Candidate_Screener_Technical_Design_Spec.docx` & `scratch/tech_spec.md`)
- Seeded candidate test fixtures (Clean Senior Profile, Adversarial Prompt Injection candidate Morgan Vance, Timeline Overlap candidate Taylor Hayes, Metric Inflation candidate Jordan Blake, Advisory Overlap candidate Samantha Reed)
- Active PostgreSQL database running on Docker (`candidate-screener-db`)

## Product Principles

1. **Untrusted Input Isolation:** Treat all candidate resumes as untrusted data payloads; never allow embedded instructions to alter system instructions, scoring rules, or output formatting.
2. **Decoupled Evaluation:** Integrity auditing and qualification fit scoring must remain strictly decoupled. An integrity flag surfaces evidence for human verification rather than artificially dragging down an objective competency match.
3. **No Silent Rejections:** Never drop or penalize a candidate invisibly. Every flag must present verbatim quoted evidence, detection rationale, and actionable interview questions so human recruiters retain full decision ownership.
4. **Scannable Recruiter Ergonomics:** Present dense applicant comparisons through clean visual hierarchy, clear typography, and instant copyable interview prompts.
