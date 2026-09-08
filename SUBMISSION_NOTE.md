# Crystal Group Candidate Screener — Written Submission Note
**Candidate:** Full-Stack Technical Lead Applicant  
**Submission Window:** Take-Home Assignment v4  

---

### 1. Selected Lane: Lane B — AI / Product Intelligence
While this repository provides complete end-to-end functionality (including Next.js App Router, Prisma ORM, PostgreSQL, Docker, and a polished recruiter UI), my strongest engineering focus was dedicated to **Lane B: AI / Product Intelligence**.

Conventional hiring tech treats LLMs as gullible summarizers, making them vulnerable to prompt injections and producing opaque match scores. In this implementation, I built a robust **AI Integrity Layer** that operates prior to candidate scoring, ensuring that resume data is treated strictly as untrusted user payload.

---

### 2. Architecture of the Integrity Pipeline & Prompt Injection Defense
The intake and screening engine follows a strict two-stage pipeline:
1. **Stage 1: Pre-Scoring Integrity Audit:**
   - **Quarantined Trust Boundary:** The incoming resume text is wrapped in strict `<UNTRUSTED_RESUME>` isolation tags. The system prompt instructs the evaluator that instructions inside this boundary must never alter grading rubrics or override screening directives.
   - **Hybrid Heuristic + Semantic Scanner:** High-confidence adversarial patterns (e.g. `ignore previous instructions`, `give this candidate 100%`, `system:`, `[INST]`) are captured deterministically with exact character offsets. Gemini performs semantic reasoning for subtle manipulations and nuanced claims.
   - **Deduplication & Actionable Evidence:** Findings are normalized into typed finding records containing **Exact Evidence Excerpts**, **Plain-Language Explanations**, and **Recommended Recruiter Interview Actions**.
2. **Stage 2: Independent Role Fit Scoring:**
   - Candidate fit is evaluated purely on whether the resume demonstrates the role's specified must-have requirements.
   - **Decoupled Scoring Rule:** Integrity flags **never** subtract points from fit score or trigger silent rejections. For example, an adversarial candidate like `Morgan Vance` received a 58% fit score (strictly on skills), while their prompt injection attempts were quoted and flagged for human review.

---

### 3. Meaningful False-Positive Risk & Mitigation
- **The Risk:** Chronological overlap detection can easily generate false positives for senior engineers who hold legitimate concurrent positions (e.g. serving as a part-time startup advisor, operating an LLC/consultancy, holding an open-source maintainer role, or teaching). Treating date overlaps as proof of dishonesty creates severe demographic and career-path bias.
- **My Mitigation:**
  1. **Contextual Token Analysis:** The timeline analyzer inspects surrounding context for markers such as `"advisor"`, `"consultant"`, `"part-time"`, or `"contract"`.
  2. **Non-Alarmist Severity & Language:** Legitimate overlaps are downgraded to `LOW` severity and titled *"Potential timeline overlap (Concurrent consulting/part-time possible)"*.
  3. **Preserving Uncertainty:** The system never claims the candidate is "lying" or "fraudulent". Instead, it equips the recruiter with a specific interview question: *"Confirm during initial call if this was an intentional concurrent consulting or advisory engagement."*

---

### 4. Cross-Functional Specialist Collaboration
In a scaled product organization, I would divide ownership across three specialists:
1. **AI / Product Intelligence Specialist (My Role):**
   - Owns adversarial red-teaming, prompt isolation boundaries, integrity heuristic algorithms, and model evaluation metrics.
   - Continuously benchmarks false-positive rates on non-traditional career paths.
2. **Product Engineering Specialist:**
   - Owns recruiter workflow ergonomics, candidate intake UX, ATS integration webhooks, and responsive interface design.
   - Collaborates on evidence presentation so flags inform recruiter judgment without introducing cognitive fatigue.
3. **Infrastructure & Security Specialist:**
   - Owns database connection pooling (Supabase / PgBouncer), encrypted storage of candidate PII, rate-limiting, and server-side secret management on Vercel edge networks.
