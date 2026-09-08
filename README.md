# CrystalScreen — Candidate Screener with AI Integrity Layer

> An enterprise candidate evaluation platform designed for the **Crystal Group Full-Stack Technical Lead Take-Home Assignment v4**.

Unlike conventional ATS platforms that compute a simple match score from a resume, **CrystalScreen treats resume content as untrusted input**. It runs a mandatory, evidence-based **Pre-Scoring Integrity Analysis** (detecting prompt injection/manipulation, timeline inconsistencies, and templated inflation) before evaluating candidate fit against role requirements.

---

## Architecture & Product Highlights

1. **Pre-Scoring Integrity Analysis (Mandatory Pipeline Stage):**
   - **Manipulation & Prompt Injection:** Detects adversarial directives attempting to hijack the AI evaluator (e.g. "ignore previous instructions", "give 100%", role delimiters like `system:`, `assistant:`). Untrusted directives are isolated and never executed.
   - **Internal Inconsistencies:** Detects overlapping employment dates across distinct companies with awareness of legitimate concurrent consulting/advisory engagements.
   - **Templated Inflation:** Flags repetitive formulaic achievement metrics (e.g. repeated "improved by 40%") across disparate roles without supporting operational context.
2. **Strict Separation of Concerns:**
   - Integrity status and Candidate Fit Score are completely decoupled.
   - A candidate is never penalized in fit score or silently rejected simply because an integrity flag exists.
3. **Showcase Recruiter UI (Keka / Linear Inspired):**
   - Dashboard with role status, pipeline counts, review-needed badges, and clear status indicators.
   - Ranked Candidate table ordered by fit score with integrity badges visible at a glance.
   - Candidate Detail Showcase screen with evidence callouts, plain-language explanations, recommended recruiter interview questions, and original untrusted resume text.
4. **Pre-Loaded Adversarial Test Fixtures:**
   - 1-click test presets in the candidate intake modal:
     - `Alex Rivera` (Clean Resume)
     - `Morgan Vance` (Prompt Injection Adversarial Test)
     - `Taylor Hayes` (Conflicting Employment Overlap)
     - `Jordan Blake` (Templated Metric Inflation)
     - `Samantha Reed` (Legitimate Advisory / Consulting Overlap)

---

## Tech Stack

- **Framework:** Next.js 16+ (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS, Radix UI primitives, Lucide Icons
- **Database & ORM:** Prisma ORM with PostgreSQL (Docker locally, Supabase in production)
- **Authentication:** Supabase Auth / Session cookie authentication
- **AI Engine:** Google Gemini API (`@google/generative-ai`) with deterministic regex/heuristic scanners and offline heuristic fallbacks
- **Deployment:** Vercel (Next.js serverless) + Supabase (Database & Auth)

---

## Local Development Quickstart

### 1. Prerequisites
- Node.js (v20+)
- Docker Desktop (running)

### 2. Clone & Install Dependencies
```bash
git clone <repository-url>
cd candidate-screener
npm install
```

### 3. Environment Variables
Copy the template file to `.env`:
```bash
cp .env.example .env
```
Default local Docker database connection is pre-configured:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/candidate_screener?schema=public"
DIRECT_URL="postgresql://postgres:postgrespassword@localhost:5432/candidate_screener?schema=public"
GEMINI_API_KEY="your-optional-gemini-key"
```

### 4. Start Local PostgreSQL Database
```bash
docker compose up -d
```

### 5. Synchronize Schema & Seed Test Data
```bash
npx prisma db push
npm run seed
```
*The seed command populates the default recruiter user (`recruiter@crystalgroup.com`), a sample Senior Full Stack Engineer role, and the 5 analyzed test candidates.*

### 6. Run the Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Verification

Run the automated pipeline test against all adversarial fixtures:
```bash
npx tsx tests/verify-pipeline.ts
```

Run production build validation:
```bash
npm run build
```

---

## Production Deployment (Vercel + Supabase)

1. **Supabase Setup:**
   - Create a project at [supabase.com](https://supabase.com).
   - In Project Settings -> Database, copy the Connection Pooler URI (port 6543) into `DATABASE_URL` and the Direct Connection URI (port 5432) into `DIRECT_URL`.
   - Run `npx prisma db push` with the remote credentials.
2. **Vercel Deployment:**
   - Import the GitHub repository into Vercel.
   - Configure environment variables:
     - `DATABASE_URL`
     - `DIRECT_URL`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `GEMINI_API_KEY`
   - Deploy!
