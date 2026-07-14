# The Vitalspan Brief — Editorial Pipeline

## Status and scope

This phase replaces weekly SQL authoring with an automated ingestion/draft system and a human-controlled publisher. It does not deploy resources, redesign the mobile Articles experience, personalize medical claims, or auto-publish.

## Architecture

```text
Supabase Cron + Vault
  ├─ Tuesday 05:05 UTC → brief-ingest
  │    └─ NCBI ESearch + batched EFetch → article_candidates
  └─ Tuesday 05:20 UTC → brief-draft
       ├─ deterministic rank/dedupe/diversity selection
       ├─ one constrained Anthropic editorial call
       └─ editorial_drafts (ready_for_review)

Authenticated pharmacist admin
  └─ scripts/brief-admin.mjs → admin-only review RPCs
       └─ explicit approve → explicit publish confirmation
            └─ transactional publish RPC → existing articles + issues
                 └─ unchanged ArticlesScreen / ArticleDetailScreen
```

The source-of-truth PubMed packet remains in `article_candidates.raw_metadata`. AI-editable fields are stored separately. The public read model retains PMID and adds DOI/source/evidence metadata without removing any legacy column.

## Deterministic quality layer

`supabase/functions/_shared/briefPipeline.ts` owns study classification, explicit sample-size extraction, safety flags, evidence/relevance/novelty scores, PMID/DOI dedupe, near-duplicate title penalties, ranking, and topic-diverse issue selection. AI runs only after this layer chooses a small shortlist.

The selector favors evidence strength and tracked Vitalspan topics, filters missing abstracts/retractions/editorials, and penalizes repeated lead topics. Animal, in-vitro, case-report, tiny-sample, and missing-abstract records receive deterministic penalties.

## Security model

- Public/ordinary authenticated clients can read only the existing published `articles`/`issues` model.
- Legacy anonymous insert/update policies are removed.
- `article_candidates`, `editorial_drafts`, and `publication_jobs` use RLS and expose admin-only reads.
- There are no ordinary client write policies on editorial tables.
- Automation requires both the Supabase server key in `apikey` and a separate `x-brief-pipeline-secret`; both are held in Vault/Edge Function secrets.
- Admin RPCs derive authorization from protected JWT `app_metadata`, never a caller-supplied user ID.
- RPCs are `SECURITY DEFINER`, revoke PUBLIC execution, validate transitions, and use an empty search path.
- Publishing requires a draft already approved by an authenticated admin. Automation has no call path that publishes.
- An advisory transaction lock serializes next-issue allocation. Postgres rolls back every article/issue/status write on failure.
- The CLI uses an authenticated admin session, never a service-role credential.

### Threat notes

| Risk | Control |
|---|---|
| Forged ingestion request | Supabase secret key plus independent pipeline secret |
| User promotes themselves | Role is read from protected `app_metadata` |
| AI changes a PMID/DOI | IDs are supplied as immutable keys and output IDs are validated; publication uses stored source metadata |
| AI invents study metadata | Study design/sample size/journal/date/identifiers are deterministic or source-derived and never accepted from AI |
| Partial issue | One transactional RPC with row/advisory locks |
| Duplicate PMID/DOI | unique constraints plus pre-insert checks and normalized DOI dedupe |
| Duplicate issue number | serialized allocation plus primary key |
| Unsafe auto-publication | separate approval state and admin-only publish RPC |
| Secret leakage | server secrets/Vault only; no mobile/public environment variables |

## One-time operator setup (not performed by this change)

1. Apply migrations with the normal Supabase migration process.
2. Create a long random `BRIEF_PIPELINE_SECRET` and set it, `NCBI_EMAIL`, optional `NCBI_API_KEY`, `ANTHROPIC_API_KEY`, and optional `BRIEF_AI_MODEL` as Edge Function secrets.
3. Register the configured `NCBI_TOOL`/`NCBI_EMAIL` with NCBI and keep requests within E-utilities policy.
4. Deploy `brief-ingest` and `brief-draft` through the normal reviewed release process.
5. Store `project_url`, `service_role_key`, and the matching `brief_pipeline_secret` in Supabase Vault.
6. Run `supabase/cron/brief_pipeline.sql` once to install the two weekly jobs.
7. Assign `brief_admin` in protected Auth app metadata to the pharmacist/editor account.
8. Invoke ingestion and drafting manually once in staging; inspect `publication_jobs`, candidates, RLS behavior, and a full approve/publish cycle before production scheduling.

The cron runs ingestion at 05:05 UTC Tuesday and drafting at 05:20 UTC Tuesday. This small job lands in NCBI's recommended overnight Eastern window. EFetch is batched; calls wait 350 ms without an API key and 110 ms with one. Retries use bounded exponential backoff and request timeouts.

## Operations and recovery

- `publication_jobs` records running/completed/failed status, timestamps, bounded error text, and counts.
- Ingestion checks both candidate and published identities, so a retry does not create duplicate research.
- Draft generation returns the existing non-rejected draft when retried in the same UTC week.
- Failed AI drafting may leave selected candidates shortlisted but creates no issue; a retry can reuse them.
- A failed publish transaction changes nothing. Investigate the Postgres error, correct the still-approved draft or candidate through the admin workflow, and retry explicitly.
- Cron execution metadata is also available in `cron.job_run_details`; `pg_net` HTTP responses are available through its response tables subject to retention settings.

## Cost envelope

- NCBI E-utilities: no API charge.
- Supabase: two scheduled Edge invocations per week (plus rare retries), well inside current included quotas; storage growth is primarily abstracts/raw PubMed metadata.
- Anthropic: one Sonnet call for four or five abstracts per weekly draft, capped at 2,200 output tokens. At current public Sonnet rates, a typical issue is expected around $0.03–$0.10, or roughly $1.50–$5/year. Monitor actual `usage` in function logs before tightening the estimate.

## Why CLI first

The CLI gives the pharmacist the complete phase-one workflow without opening an additional hosted admin attack surface. The RPC contract is UI-neutral, so a future protected review page can use the same list/edit/review/publish operations. A future UI should add source/abstract side-by-side review, drag ordering, structured audit history, correction/unpublish policy, and a two-person approval option; none is required to eliminate weekly SQL now.

## Future work deliberately excluded

- Hosted internal admin interface
- Personalized medical claims or per-user issue generation
- Mobile Articles redesign
- Automated pharmacist-note generation
- Auto-publication
- Journal-site scraping or full-text ingestion
- Published-issue correction UI and formal audit-event table
