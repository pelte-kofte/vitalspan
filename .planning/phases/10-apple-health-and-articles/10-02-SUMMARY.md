---
phase: 10-apple-health-and-articles
plan: "02"
subsystem: articles-data-layer
tags: [supabase, ncbi, pubmed, article-service, rls, typescript]
dependency_graph:
  requires: []
  provides:
    - src/db/create_articles_table.sql
    - src/lib/articleService.ts
  affects:
    - src/screens/ArticlesScreen.tsx  # Wave 2 — imports loadCachedArticles, refreshArticlesIfStale
    - src/screens/DashboardScreen.tsx  # Wave 2 — triggers background refresh
tech_stack:
  added: []
  patterns:
    - "NCBI E-utilities eSearch → eSummary batch → eFetch XML pattern"
    - "Supabase anon upsert with onConflict for shared non-PII cache"
    - "Stale-while-revalidate via AsyncStorage TTL timestamp"
    - "Client-side ranking via BIOMARKERS[].optMin/optMax"
key_files:
  created:
    - src/db/create_articles_table.sql
    - src/lib/articleService.ts
  modified: []
decisions:
  - "D-13 anon-write RLS: service_role key cannot be embedded in React Native client; permissive anon INSERT/UPDATE WITH CHECK (true) is safe for a shared non-PII cache (all articles are public PubMed metadata)"
  - "StoredEntry defined inline in articleService.ts (not imported from BiomarkerEntryScreen) to avoid circular dependency risk"
  - "upsertAndReselect() extracted as private helper to deduplicate refreshArticlesIfStale / forceRefreshArticles logic"
  - "14-key BIOMARKER_QUERIES map: 12 longevity-relevant biomarker queries + 2 global fallbacks (general, phenoage)"
  - "350ms delay between eFetch calls (3 req/sec NCBI ceiling); eSummary batched into single request for all PMIDs"
metrics:
  duration: "~3 minutes"
  completed: "2026-06-03"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 10 Plan 02: Articles Data Layer Summary

**One-liner:** Supabase articles table with anon-write RLS + TypeScript service wrapping NCBI eSearch→eSummary→eFetch with 24h stale-while-revalidate and out-of-range biomarker ranking.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Supabase articles table SQL with RLS | 2b96863 | src/db/create_articles_table.sql |
| 2 | Create articleService.ts | 09dea13 | src/lib/articleService.ts |

## What Was Built

### Task 1: create_articles_table.sql

SQL file for manual run in the Supabase dashboard. Creates the `articles` table with 7 columns (pmid text PK, title, journal, pub_date, abstract, biomarker_tags text[], fetched_at timestamptz), enables RLS, and adds three anon-accessible policies:

- `"public read articles"` — SELECT for all (including anon)
- `"anon insert articles"` — INSERT WITH CHECK (true) for the anon role
- `"anon update articles"` — UPDATE USING (true) for the anon role

Also adds a `fetched_at DESC` index for the common ORDER BY query pattern. Idempotent (IF NOT EXISTS guards).

### Task 2: articleService.ts

Pure-function service module (166 lines; under the 200-line CLAUDE.md limit). Exports:

- `Article` interface — matches the Supabase articles table schema
- `BIOMARKER_QUERIES` — 14-key map (12 biomarker IDs + `general` + `phenoage`)
- `loadCachedArticles(entries)` — SELECT all from Supabase, ranked by out-of-range biomarkers
- `refreshArticlesIfStale(entries)` — checks `@vitalspan_articles_last_fetched`; skips if <24h old; fetches + upserts if stale
- `forceRefreshArticles(entries)` — unconditional refresh for pull-to-refresh

NCBI fetch flow: eSearch for each query (sequential, rate-limit safe) → one eSummary batch for all unique PMIDs → eFetch XML per PMID with 350ms delay. PMID→biomarker key tracking during eSearch phase populates `biomarker_tags`. `rankByOutOfRange` builds `outOfRange` set from BIOMARKERS[].optMin/optMax comparisons and sorts by number of out-of-range tag matches.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Deviation Notes

- The `StoredEntry` interface is defined locally in articleService.ts (not imported from `BiomarkerEntryScreen`) per the plan's explicit instruction to "avoid circular dependency risk". This matches what the plan action specified.
- A private `upsertAndReselect()` helper was extracted to eliminate code duplication between `refreshArticlesIfStale` and `forceRefreshArticles`. This is a structural improvement within the same file — no behavior change.

## Known Stubs

None. The service is fully wired: NCBI endpoints are real URLs, Supabase client is imported from `./supabase`, and BIOMARKER_QUERIES contains real PubMed query strings. No placeholder values flow to consumers.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| T-10-05 (mitigated) | src/lib/articleService.ts | NCBI API responses explicitly typed as NCBIESearchResponse / NCBISummaryResponse / NCBISummaryArticle — no `any`, malformed responses return null |
| T-10-06 (mitigated) | src/lib/articleService.ts | Sequential eSearch loop + 350ms eFetch delay enforces <3 req/sec NCBI ceiling |
| T-10-04 (accepted) | src/db/create_articles_table.sql | Anon-writable articles table — no PII; worst case is cache poisoning with spurious articles; accepted per plan threat model |

## Self-Check: PASSED

- FOUND: src/db/create_articles_table.sql
- FOUND: src/lib/articleService.ts
- FOUND commit: 2b96863 (Task 1)
- FOUND commit: 09dea13 (Task 2)
- No stubs found
- tsc --noEmit exits 0
- No deletions in either commit
