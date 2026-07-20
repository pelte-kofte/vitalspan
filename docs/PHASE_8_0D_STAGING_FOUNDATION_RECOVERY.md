# Phase 8.0D Staging Foundation Recovery Decision

## Changelog

- **2026-07-20 — Governance consistency repair:** Removed the contradictory post-foundation Gate 3 sequence. Recorded the canonical order as Gate 1, Gate 2, Staging Foundation Recovery approval, Gate 3, separate Sprint 1 authorization, six-migration execution, Phase 8.0D validation, and closure. Preserved the exact migration chain, hashes, containment, evidence, stop-on-first-error, immutability, and production-prohibition requirements. This documentation repair requires renewed recovery approval and authorizes no execution.

## 1. Decision and Scope

- **Decision:** STAGING FOUNDATION RECOVERY RE-APPROVAL REQUIRED
- **Decision date:** 2026-07-20
- **Approved target alias:** `vitalspan-staging`
- **Approved target project reference:** `kviqeyikngigcmwlgazh`
- **Approved target fingerprint:** `093e366a5999fd2981b37164daef0eb3819e3b0099ab7fa820f6d35b6ae65dca`
- **Production denylist project reference:** `pnkmssxudzssjwllkptb`
- **Production denylist fingerprint:** `3cb786c198df3bcf84bdfd94f5d33ce4bb2b776ff4713532fd04a0dfdbb997d3`
- **Review method:** Static, local, read-only inspection of the six committed migration files
- **External-system access:** None for this recovery decision
- **Migration execution:** Unauthorized
- **Execution window:** Closed
- **Sprint 1:** Unauthorized
- **Production:** Access, migration, deployment, release, and activation prohibited

The static review supports the six-file chain as a valid future foundation sequence for a genuinely empty, standard Supabase staging project, but this corrected document requires renewed recovery approval. Recovery approval authorizes neither Gate 3, Sprint 1, nor execution. Gate 3 must later identify the exact target, commit, file hashes, executor, execution window, stop/containment plan, recovery authority, and evidence requirements. After Gate 3, Sprint 1 still requires separate explicit authorization before any migration command may run.

The canonical governance and execution order is exactly:

1. Gate 1 specification approval;
2. Gate 2 staging-target approval;
3. Staging Foundation Recovery approval for this exact six-migration chain;
4. Gate 3 migration-execution approval;
5. separate Sprint 1 authorization;
6. Staging Foundation Migration Execution of the six approved migrations, unchanged and in order;
7. Phase 8.0D validation; and
8. Phase 8.0D closure.

No completed step authorizes the next step automatically. The execution window remains closed and Sprint 1 remains unauthorized.

## 2. Evidence Basis

| Order | Migration | SHA-256 |
| --- | --- | --- |
| 1 | `20260614002200_ai_usage.sql` | `1014f492f7b77be2a259c717ee9226a6afbbabd0b74799fda45ea69f98f93e2e` |
| 2 | `20260709000000_ai_usage_search_count.sql` | `5435cf6e017e9eaedf63396727d5e066a3cf55c6f5356d336f0041a6b1ea0a61` |
| 3 | `20260714000000_brief_editorial_pipeline.sql` | `954bfc186fa6c5f5d2054bf68298d037d647a8c7072eb676828b547442d9bc12` |
| 4 | `20260715000000_brief_cover_pipeline.sql` | `f95fee86e5e2e6ad40710ab70cb8df3e904772cf8c82466902a8edb4c39065d7` |
| 5 | `20260715120000_backfill_issue_one_editorial_intelligence_rpc.sql` | `cf33bd683e488812efbdc25991fcb84bb096908ec94d8f757f88afb6c2e88205` |
| 6 | `20260719000000_scientific_persistence_records.sql` | `4dbf80f61c7cbc2adf6e5c9933bbc173944e31c83def36dc140ecf5e0113a354` |

The files were inspected without modification. No token-like credential was found. No migration was run locally or remotely.

## 3. Required Empty-Staging Assumptions

Approval is valid only for a standard hosted Supabase project that provides:

- `public`, `auth`, and `storage` schemas;
- `auth.users`, `auth.uid()`, `auth.jwt()`, and `auth.role()`;
- the standard `anon`, `authenticated`, and `service_role` roles;
- `storage.buckets`, `storage.objects`, and `storage.foldername()`;
- permission for the migration executor to install `uuid-ossp`, create ordinary public-schema objects, and create the Phase 8.0C `NOLOGIN` writer role; and
- PostgreSQL support for `gen_random_uuid()`, PL/pgSQL, RLS, partial indexes, JSONB, arrays, triggers, and advisory transaction locks.

The target must have no conflicting application objects, policies, functions, roles, or `brief-covers` bucket configuration. The only allowed system state is the standard Supabase platform foundation. If the target contains application data or same-named objects despite empty migration history, this approval fails closed pending a new object-level review.

No migration requires an environment variable, application secret, Edge Function deployment, Auth-setting change, pre-created Auth user, or pre-uploaded storage object to apply. Some resulting runtime paths later depend on Edge Functions, service-role calls, admin app metadata, Auth users, or stored content; those runtime dependencies are not invoked by migration execution and are not activated by this decision.

## 4. Ordered Dependency Chain

```text
standard Supabase auth schema and roles
    -> 20260614002200_ai_usage.sql
        -> 20260709000000_ai_usage_search_count.sql

standard Supabase auth schema and roles
    -> 20260714000000_brief_editorial_pipeline.sql
        -> public editorial tables, admin predicate, RPCs, and update trigger
        -> 20260715000000_brief_cover_pipeline.sql
            -> standard Supabase storage schema
            -> cover tables, bucket policy, cover RPCs, and replacement publish RPC
            -> 20260715120000_backfill_issue_one_editorial_intelligence_rpc.sql

standard Supabase auth schema and roles
    -> 20260719000000_scientific_persistence_records.sql
```

The Phase 8.0C migration has no direct application-schema dependency on the first five files. It must nevertheless remain sixth because repository migration history is ordered, Gate 3 requires complete history agreement, and Phase 8.0D may not create a divergent history by applying it alone.

## 5. Per-Migration Safety Review

### 5.1 `20260614002200_ai_usage.sql`

**Purpose**

Creates per-user, per-UTC-day AI Advisor usage counters.

**Dependencies and assumptions**

- standard `auth.users` table;
- `auth.uid()` for the owner-read policy;
- standard `authenticated` and `service_role` semantics; and
- permission to install `uuid-ossp` if absent.

**Objects and behavior**

- installs `uuid-ossp` with `IF NOT EXISTS`;
- creates `public.ai_usage` with primary key `(user_id, date)` and `auth.users` cascade FK;
- enables RLS;
- creates authenticated owner-only SELECT policy `ai_usage_select_own`; and
- creates `ai_usage_user_date_idx`.

**Data mutation or backfill**

None at migration time.

**RPCs, triggers, roles, and privileges**

- no RPC or trigger;
- no custom role;
- no direct client write policy;
- later service-role Edge Function writes are described but not deployed or invoked.

**Reversibility and containment**

No down migration exists. On a failed empty-staging application, stop without repair; do not drop or recreate objects manually. Destruction of the disposable target or an approved forward recovery is safer than an ad-hoc rollback.

**Empty-staging decision**

Safe. It assumes only standard Supabase Auth infrastructure and no pre-existing `ai_usage` policy conflict.

### 5.2 `20260709000000_ai_usage_search_count.sql`

**Purpose**

Adds the search-enabled chat counter to the AI usage table.

**Dependencies and assumptions**

- requires `public.ai_usage` from migration 1.

**Objects and behavior**

- adds non-null integer `search_count` with default zero; and
- documents the column.

**Data mutation or backfill**

On an empty table, none. On a populated table, PostgreSQL would establish zero for existing rows; this recovery is approved only for empty staging.

**RPCs, RLS, indexes, triggers, roles, and privileges**

None added or changed.

**Reversibility and containment**

No down migration. Failure stops the chain; no manual column addition or history repair is permitted.

**Empty-staging decision**

Safe after migration 1. It cannot run first because `public.ai_usage` must exist.

### 5.3 `20260714000000_brief_editorial_pipeline.sql`

**Purpose**

Creates the Vitalspan Brief ingestion, review, and publishing foundation while preserving the public articles/issues read model.

**Dependencies and assumptions**

- standard `auth.users`, `auth.uid()`, and `auth.jwt()`;
- `authenticated`, `anon`, and service-role behavior;
- `gen_random_uuid()` support;
- permission to install `uuid-ossp`; and
- no conflicting same-named application objects on empty staging.

**Tables and columns**

- creates `articles` and `issues` when absent;
- adds editorial/publication columns to `articles`;
- creates `article_candidates`, `editorial_drafts`, and `publication_jobs`;
- adds check and FK constraints; and
- preserves circular articles/issues references through ordered table creation followed by the article-to-issue FK.

**Indexes and trigger**

- article DOI and issue indexes;
- candidate DOI and queue indexes;
- draft status and active-week indexes;
- publication-job start index;
- `set_brief_updated_at()` trigger function; and
- `editorial_drafts_updated_at` trigger.

**Functions/RPCs**

- `is_brief_admin()`;
- `review_article_candidate(uuid,text)`;
- `update_article_candidate_editorial(uuid,text,text,text,text,text)`;
- `update_editorial_draft(uuid,uuid,uuid[],text,text)`;
- `review_editorial_draft(uuid,text)`; and
- `publish_editorial_draft(uuid)`.

All mutating RPCs are `SECURITY DEFINER` but fail unless `is_brief_admin()` accepts protected Auth app metadata. No RPC is invoked during migration.

**RLS and privileges**

- enables RLS on all five tables;
- removes named legacy policies if present;
- creates public read policies for published articles/issues;
- creates admin-only read policies for candidates, drafts, and jobs;
- revokes direct table privileges before granting policy-limited SELECT; and
- grants authenticated execution on admin-gated RPCs.

No unrestricted authenticated write grant is present. The service role remains the intended automation writer.

**Top-level data mutation**

- inserts sentinel Issue 0 with `ON CONFLICT DO NOTHING`; and
- updates existing articles with null `issue_number` to Issue 0.

On genuinely empty staging, the update touches zero rows and the only created application row is the deterministic sentinel Issue 0. This is an intentional foundation row, not a production-data dependency.

**Destructive behavior**

No table, column, function, role, or data deletion. Named legacy policies and the draft update trigger are dropped only with `IF EXISTS` before governed replacements. This is safe for the empty target; it would require separate compatibility review on a populated target.

**Reversibility and containment**

The file has no explicit `BEGIN`/`COMMIT` and no down migration. Partial failure therefore requires an immediate stop and separately approved recovery; automatic rerun, manual completion, or history insertion is prohibited.

**Empty-staging decision**

Safe with the stated standard-Supabase assumptions. It assumes no production articles, issues, drafts, or candidates.

### 5.4 `20260715000000_brief_cover_pipeline.sql`

**Purpose**

Adds private, review-first cover concept/generation provenance and requires approved cover evidence for future publication.

**Dependencies and assumptions**

- all editorial tables, columns, `is_brief_admin()`, `set_brief_updated_at()`, and `publish_editorial_draft()` from migration 3;
- standard `auth.users`, `auth.uid()`, and `auth.role()`;
- standard `storage.buckets`, `storage.objects`, and `storage.foldername()`;
- standard `authenticated`, `anon`, and `service_role` roles; and
- no conflicting cover tables, policies, indexes, triggers, or `brief-covers` bucket configuration.

**Tables, columns, and constraints**

- adds five editorial-intelligence columns and two checks to `editorial_drafts`;
- creates `editorial_cover_generations` and `editorial_cover_generation_sources`;
- adds four cover fields and two path/hash checks to `issues`; and
- uses FKs to drafts, candidates, issues, and Auth users.

**Indexes and triggers**

- unique active-status indexes for generating, reviewable, and approved covers;
- draft/version lookup index;
- immutable/status-transition guard trigger; and
- cover-generation updated-at trigger.

**Functions/RPCs**

- `guard_cover_generation_mutation()`;
- `create_cover_concept(uuid,jsonb)`;
- `regenerate_cover(uuid)`;
- `approve_cover(uuid)`;
- `reject_cover(uuid,text)`;
- `begin_cover_generation(uuid,text,text,numeric)`;
- `complete_cover_generation(...)`;
- `fail_cover_generation(uuid,text,text)`; and
- governed replacement of `publish_editorial_draft(uuid)`.

Admin RPCs check `is_brief_admin()`. Generation lifecycle RPCs check `auth.role() = 'service_role'`. No RPC is invoked during migration.

**Storage and top-level mutation**

- inserts the private `brief-covers` bucket or tightens its public flag, size limit, and MIME allowlist on conflict; and
- replaces the named admin storage-object read policy.

On empty staging, this creates one private bucket configuration and no storage object. It requires the standard Supabase Storage schema but no bucket, file, secret, or Edge Function in advance.

**RLS and privileges**

- enables RLS on both cover tables;
- grants authenticated SELECT subject to admin policies;
- grants authenticated execution only on admin-gated concept/review RPCs;
- grants service-role execution only on service-role-checked generation RPCs; and
- revokes public execution from governed functions.

No excessive grant was found under the Auth checks and RLS policies.

**Destructive behavior**

No table/data deletion. The existing `brief admins review private covers` policy is dropped with `IF EXISTS` and recreated. `publish_editorial_draft` is deliberately replaced to require an approved cover. These changes are safe for the empty target and would require separate compatibility review on a populated target.

**Reversibility and containment**

The file is explicitly transactional with `BEGIN`/`COMMIT`. No down migration exists. Stop on any error and do not retry or repair automatically.

**Empty-staging decision**

Safe after migration 3 on a standard Supabase project with intact Storage infrastructure.

### 5.5 `20260715120000_backfill_issue_one_editorial_intelligence_rpc.sql`

**Purpose**

Installs a narrowly scoped admin RPC for a historical Issue 1 draft.

**Dependencies and assumptions**

- `editorial_drafts`, editorial-intelligence columns, and `is_brief_admin()` from migrations 3 and 4; and
- the standard authenticated role.

**Objects and behavior**

- creates `backfill_issue_one_editorial_intelligence(uuid)`;
- restricts the argument to one hardcoded historical draft UUID;
- refuses missing, ineligible, approved, published, or already-populated drafts;
- updates only four editorial-intelligence fields if explicitly invoked; and
- grants execution to `authenticated` after revoking it from `PUBLIC`, `anon`, and `authenticated`, with the function itself enforcing brief-admin authorization.

**Migration-time data mutation**

None. Despite the filename, the migration does not call the RPC and does not execute a backfill.

**Production-only data dependency**

The callable operation refers to a historical production-content UUID. That row is not required for migration application. On empty staging, the function installs successfully and would fail `editorial draft not found` if invoked. Its content-specific nature is explicit and does not make the migration unsafe, but Phase 8.0D does not authorize invoking it.

**RLS, indexes, triggers, roles, and external systems**

No table, policy, index, trigger, custom role, external service, secret, or configuration change.

**Reversibility and containment**

The file is explicitly transactional. No down migration exists. The RPC must remain uninvoked during foundation establishment.

**Empty-staging decision**

Safe after migrations 3 and 4. It installs inert production-content-specific logic without requiring or creating that content.

### 5.6 `20260719000000_scientific_persistence_records.sql`

**Purpose**

Creates the inactive Phase 8.0C append-only scientific persistence schema and authenticated insertion boundary.

**Dependencies and assumptions**

- standard `auth.users` and `auth.uid()`;
- standard `anon` and `authenticated` roles;
- permission to create one restricted `NOLOGIN` role;
- `gen_random_uuid()`; and
- absence of the target table, function, writer role, policies, and constraints.

Gate 3 read-only evidence found those Phase 8.0D objects absent.

**Objects and constraints**

- creates `scientific_persistence_records` with database UUID/time defaults;
- creates owner, same-owner lineage, non-empty identity, validation-status, and empty-issue constraints;
- creates restricted `scientific_persistence_writer`; and
- creates `insert_scientific_persistence_record(...)` owned by that role.

**RLS and privileges**

- revokes direct table access from `PUBLIC`, `anon`, and `authenticated`;
- forces RLS;
- permits the writer role only to insert and return identity/time for its authenticated owner;
- temporarily grants schema CREATE to establish the function and revokes it afterward;
- revokes RPC execution from `PUBLIC` and `anon`; and
- grants exact RPC execution to `authenticated`.

The function rejects missing `auth.uid()` and accepts no owner, current persistence ID, or persisted-at input. No excessive lasting privilege was found.

**Indexes and triggers**

- primary-key and unique/FK indexes arise from constraints;
- no trigger or custom type.

**Data mutation or backfill**

None at migration time. The RPC insert body is defined but not invoked.

**Destructive behavior**

None. It intentionally fails if the custom writer role already exists and is not designed for reapplication.

**Reversibility and containment**

No explicit transaction or down migration. The future runner must stop on the first error, must not rerun an ambiguous application, and must follow the approved containment/recovery decision. Presence of schema does not activate runtime composition.

**Empty-staging decision**

Safe as the sixth migration under the existing Phase 8.0C evidence and the stated standard-Supabase assumptions.

## 6. Explicit Risk Classification

| Review question | Finding |
| --- | --- |
| Depends on production-only data | No migration application depends on production data. Migration 5 installs a production-content-specific RPC but does not invoke it and safely tolerates the row being absent. |
| Assumes existing application content | No. Migration 3 intentionally supports legacy populated environments, but on empty staging creates only sentinel Issue 0. Runtime RPCs assume content only when later invoked. |
| Destructive operation | No destructive table/data/schema operation. Migrations 3 and 4 replace named policies/triggers/functions as part of their ordered definitions; approval is restricted to empty staging. |
| Unsafe backfill | None. Migration 3 performs a deterministic empty-target-safe sentinel insert and zero-row normalization update. Migration 5 defines but does not execute a backfill. |
| Excessive privileges | None found. Client reads remain RLS-constrained; admin RPCs check protected app metadata; service RPCs check service role; Phase 8.0C uses a restricted no-login writer. |
| Cannot run safely on empty staging | None, provided all standard Supabase assumptions in Section 3 hold and no conflicting application objects exist. |
| Requires environment variables or secrets | No. Runtime consumers may later require secrets, but migration application does not. |
| Requires Edge Function deployment | No. Migrations 1, 3, and 4 define database support for later jobs/functions without deploying or invoking them. |
| Requires storage bucket | Migration 4 creates or governs the `brief-covers` bucket; it requires standard Supabase Storage tables/functions, not a pre-existing bucket. |
| Requires Auth configuration | No Auth-setting mutation. Admin RPCs later require appropriate app metadata, but no admin user or metadata is needed to apply the chain. |

## 7. Exact Future Execution Allowlist

If a later execution phase is explicitly authorized, the complete allowlist is exactly:

1. `20260614002200_ai_usage.sql`
2. `20260709000000_ai_usage_search_count.sql`
3. `20260714000000_brief_editorial_pipeline.sql`
4. `20260715000000_brief_cover_pipeline.sql`
5. `20260715120000_backfill_issue_one_editorial_intelligence_rpc.sql`
6. `20260719000000_scientific_persistence_records.sql`

The order may not change. No seventh migration, proposed migration, backfill script, manual statement, seed, dashboard action, or repair command is allowlisted. Migration 5's installed backfill RPC must not be invoked.

## 8. Mandatory Future Execution Safeguards

Before a future command, all of the following must be proven again:

1. Gate 1, Gate 2, and Staging Foundation Recovery approvals are current and mutually consistent;
2. Gate 3 approves the exact target, commit, six hashes, executor, command, containment plan, recovery authority, and bounded execution window;
3. Sprint 1 is separately authorized after Gate 3 and before execution;
4. the dynamic project reference resolves exactly to `kviqeyikngigcmwlgazh` (`vitalspan-staging`) and its approved fingerprint;
5. production reference `pnkmssxudzssjwllkptb` and its fingerprint are absent from environment variables, URLs, configuration, link files, command targets, and database connections used for execution;
6. repository HEAD is the separately approved commit and the Git working tree is clean;
7. the six migration hashes match Section 2 and the pending set equals the six-file allowlist exactly;
8. all prerequisite application objects and the `brief-covers` bucket are absent or match the exact expected clean pre-state;
9. execution occurs only from a disposable workspace with no repository `.env` or tracked `supabase/.temp/` metadata;
10. the migration tool/version, executor, target fingerprint, start/end window, containment owner, and recovery authority are explicitly approved;
11. execution stops immediately on the first error;
12. no automatic retry, repair, history manipulation, squash, reset, or manual SQL Editor execution is permitted;
13. sanitized exit status, timing, target fingerprint, file hash, and resulting migration-history/object evidence is captured after each migration;
14. remote migration history is re-read after execution and must contain the six versions exactly once in order;
15. created tables, functions, policies, roles, privileges, indexes, triggers, constraints, bucket configuration, and final Phase 8.0C objects are verified after execution;
16. the Phase 8.0C RPC remains governed by the kill-switch/final-containment requirements before any Auth or RPC validation;
17. credentials and project URLs are never printed or stored in repository evidence; and
18. production remains prohibited.

An ambiguous or partial outcome stops the sequence. Do not continue to the next migration, rerun the failed migration, mark history manually, or complete objects by hand. The approved recovery authority must decide whether to destroy the disposable target, contain it, or authorize a separately reviewed forward recovery.

## 9. Compatibility, Activation, and Scientific Impact

- No migration file changes.
- No application, test, package, Auth, Edge Function, or runtime-composition changes.
- No scientific calculation, status, confidence, reason, interpretation, safety, trend, provenance, audit, version, or baseline change.
- No production activation.
- No Phase 8.0C runtime activation.
- No production-readiness or VES PASS claim.

## 10. Approval Boundary

This corrected document records the static conclusion that the six committed migrations form a safe ordered foundation for empty staging under the recorded assumptions. Renewed Staging Foundation Recovery approval is still required at canonical step 3.

It does not:

- run or authorize a migration;
- open an execution window;
- approve Gate 3;
- authorize Sprint 1;
- authorize a manual backfill or RPC;
- authorize production access, deployment, or activation; or
- waive target, credential, object, history, containment, cleanup, or evidence checks.

Future execution requires renewed Staging Foundation Recovery approval, then Gate 3 approval for the exact six-migration action, then separate Sprint 1 authorization, in that order. Gate 3 remains NOT READY, Sprint 1 remains unauthorized, and the execution window remains closed.
