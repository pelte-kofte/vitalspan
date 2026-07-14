# Content Guide — “The Vitalspan Brief”

The Vitalspan Brief is a weekly, pharmacist-approved science publication. PubMed discovery and first-draft editorial work are automated; publication is always a deliberate human action. The mobile `ArticlesScreen` continues to read the existing `articles` and `issues` tables.

## Editorial standard

Each issue contains one cover story and three or four briefs. It should read like a restrained science desk—not a generic AI feed.

- Prefer systematic reviews, meta-analyses, randomized trials, and large prospective cohorts.
- Explain what the paper found and why it is relevant without diagnosis, prescribing, or treatment instructions.
- Keep study design, sample size, journal, publication date, PMID, DOI, and source metadata exactly aligned with PubMed.
- State limitations and uncertainty plainly. Never turn association into causation.
- A pharmacist must review the source abstract and every editorial field before approval.
- The issue is identical for every user. `topics` and `biomarker_tags` are for future ranking of already-approved content, not personalized medical claims.

## Weekly workflow

### 1. Automated ingestion

Every Tuesday, `brief-ingest` searches the official NCBI E-utilities API using the topic configuration in `supabase/functions/_shared/briefTopics.ts`. It batches PubMed retrieval, deduplicates by PMID and DOI, derives study metadata deterministically, scores the candidates, and writes only to `article_candidates`.

The job cannot write an issue and cannot publish content. Its result is visible in `publication_jobs`.

### 2. Automated draft creation

After ingestion, `brief-draft` ranks the active pool deterministically, removes weak or incomplete evidence, caps the pre-editorial shortlist at 12, and selects a topic-diverse cover plus four briefs before making one bounded AI request. Anthropic receives only those five selected records. Abstracts are deterministically capped at 2,400 characters while retaining structured objective, methods, results, limitations, and conclusion sections where present; `raw_metadata` is never sent.

The Anthropic call has an 80-second per-attempt deadline and a 110-second total request budget, leaving time inside the scheduler's 120-second deadline to persist job status. There is at most one retry, after a 750 ms delay, and only timeouts, network errors, HTTP 429, and HTTP 5xx responses are retried. Permanent 4xx and response/schema validation failures are not retried. `publication_jobs.stats` records counts, payload bytes, estimated input tokens, elapsed milliseconds, HTTP status/error category, and attempt number; it must never contain prompts, API keys, titles, or abstracts. These budgets remain below the hosted Edge Function 150-second request-idle limit and free-plan wall-clock limit.

The function generates reviewable editorial fields only from the bounded PubMed source packet and creates an `editorial_drafts` row with status `ready_for_review`.

The pharmacist note is intentionally a placeholder. AI output is draft copy, not approved medical content.

### 3. Human review

Use the authenticated admin CLI. Never use the service-role key for editorial review.

```bash
npm run brief:admin -- drafts --status ready_for_review
npm run brief:admin -- show <draft-id>
npm run brief:admin -- candidates --status shortlisted
```

For every candidate, open `source_url` and verify:

- PMID, DOI, title, journal, and publication date
- study type and any explicit sample size
- headline and 2–3 sentence summary
- “Why it matters” language
- limitations and conservative evidence label
- absence of diagnosis, treatment instructions, or unsupported clinical recommendations

Edit candidate copy when needed:

```bash
npm run brief:admin -- edit-candidate <candidate-id> \
  --headline "Plain-English headline" \
  --summary "Two or three factual sentences grounded in the abstract." \
  --takeaway "Why this evidence matters without telling the reader what to do." \
  --limitations "The important design and abstract-level limitations." \
  --evidence "Moderate"
```

Reject unsuitable research or explicitly retain it:

```bash
npm run brief:admin -- review-candidate <candidate-id> --status rejected
npm run brief:admin -- review-candidate <candidate-id> --status approved
```

Choose the cover, arrange all four or five candidate IDs in reading order, and write the pharmacist note:

```bash
npm run brief:admin -- edit-draft <draft-id> \
  --cover <cover-candidate-id> \
  --order <cover-id>,<brief-id>,<brief-id>,<brief-id>,<brief-id> \
  --title "The Vitalspan Brief — Week of 2026-07-13" \
  --note "Pharmacist-authored note"
```

### 4. Approval and publication

Approval records the authenticated admin user and timestamp. It does not publish:

```bash
npm run brief:admin -- review-draft <draft-id> --status approved
```

The placeholder pharmacist note cannot be approved. Editing the candidate copy, selection, order, title, or note after approval automatically returns the draft to `ready_for_review` and clears the approval.

Inspect the approved draft once more, then publish with the explicit confirmation flag:

```bash
npm run brief:admin -- show <draft-id>
npm run brief:admin -- publish <draft-id> --confirm publish
```

The publish RPC performs one database transaction: it locks issue-number allocation, upserts the selected candidates into `articles`, creates the next `issues` record, assigns cover/brief roles, and marks the candidates and draft published. Any failure rolls back the entire issue.

No SQL is required in the normal weekly workflow.

## Access setup

The CLI accepts either a short-lived admin access token or admin email/password from the local shell. The user must have protected Supabase Auth `app_metadata` containing either `{"brief_admin": true}` or `{"role": "admin"}`. Users cannot set their own `app_metadata`.

```bash
export EXPO_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="<publishable-or-anon-key>"
export BRIEF_ADMIN_EMAIL="editor@example.com"
export BRIEF_ADMIN_PASSWORD="<local-shell-only>"
```

Alternatively, set `BRIEF_ADMIN_ACCESS_TOKEN` to a short-lived JWT. Do not commit credentials, expose them through an `EXPO_PUBLIC_` name, or use a service-role key in the CLI.

## Corrections and incidents

The phase-one publisher deliberately does not mutate a published draft. If published medical copy needs correction, stop promotion of the issue and handle the correction as an audited admin operation. Do not delete an issue: `articles.issue_number` and `issues.cover_article_id` preserve referential integrity.

For a failed automated run:

```bash
npm run brief:admin -- jobs
```

Fix the configuration or upstream error and invoke the affected Edge Function again through the Supabase Dashboard. Ingestion is idempotent, and draft creation creates at most one non-rejected draft per UTC week.

## Legacy archive

Issue 0 remains the synthetic archive for pre-Brief articles. It has no cover or pharmacist note. New publication always receives the next positive issue number inside the transactional publisher.

## Operational reference

Deployment, Vault, cron, rollback, security, and future admin-UI notes live in `.planning/brief-editorial-pipeline.md`. The mobile Articles UI is intentionally unchanged.
