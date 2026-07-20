# Scientific Persistence Staging Validation Runbook

## 1. Status and Authority

- Phase: 8.0D — Real Supabase Staging Validation
- Document role: Governance and staging-safety procedure
- Specification: `docs/specifications/PHASE_8_0D_IMPLEMENTATION_SPECIFICATION_v1.0.0.md`
- Current authorization: Version 1.1.1 requires renewed Gate 1; Gate 2 evidence remains recorded; Staging Foundation Recovery requires renewed approval; Gate 3 remains NOT READY; Sprint 1 unauthorized
- Production migration: Not authorized
- Production access: Not authorized
- Staging mutation: Not authorized by Sprint 0
- Migration execution: Not authorized; neither this repair nor any earlier approval opens an execution window, approves Gate 3, or authorizes Sprint 1
- Application integration and runtime activation: Not authorized

This runbook prepares the future staging-validation path. It is not an execution approval. A later sprint may use only the portions expressly authorized for that sprint, after every prerequisite gate and stop-condition review passes.

### Changelog

- **2026-07-20 — Governance consistency repair:** Removed the superseded migration route and replaced every pending-set, Gate 3, stop-condition, and ordered-flow reference with the exact six-migration Staging Foundation Recovery path. Made separate Sprint 1 authorization mandatory after Gate 3 and before execution. Preserved immutable migrations, production prohibition, isolated targeting, stop-on-first-error, containment, cleanup, and per-migration evidence capture. No external action is authorized.

## 2. Governing Boundaries

The stricter applicable requirement in the Phase 8.0D specification, Vitalspan Engineering Standard, Scientific Baseline v1.0, Phase 8.0A, Phase 8.0B, and Phase 8.0C governs.

The validation target is exactly one independently approved isolated Supabase environment:

- a disposable preview branch created for Phase 8.0D; or
- a dedicated staging project formally identified as non-production.

The target must contain no production or copied production data, receive no production traffic, use no production users or credentials, and share no project identity with production. An inability to prove any of these facts is a stop condition.

The existing Phase 8.0C migration, public contracts, scientific artifacts, runtime composition, and activation registry are frozen. Validation must not repair, rewrite, reformat, wrap, or replace them.

## 3. Roles and Required Records

Before external access, assign the following opaque labels and record the real names only in the approved access-control record:

| Label | Required responsibility |
| --- | --- |
| `STAGING_PROJECT` | The single Gate 2-approved non-production target |
| `PRODUCTION_PROJECT_DENYLIST_ENTRIES` | Complete approved fingerprints for every known production project |
| `AUTHORIZED_DATABASE_OPERATOR` | Named operator allowed to perform the later approved database actions |
| `SECURITY_REVIEWER` | Named reviewer for Auth, RLS, ownership, privileges, and evidence handling |
| `EVIDENCE_REVIEWER` | Named reviewer for the sanitized evidence set |
| `CLEANUP_AUTHORITY` | Named authority for exact synthetic cleanup or approved staging-project destruction |
| `AUTH_USER_A` | Future synthetic, non-anonymous staging user owned by no real person |
| `AUTH_USER_B` | Future distinct synthetic, non-anonymous staging user owned by no real person |
| `UNAUTHENTICATED_CLIENT` | Public-key client with no Auth session or user access JWT |

Required operator records are:

- Gate 1 approval for specification version 1.1.1;
- Gate 2 staging-target approval;
- Staging Foundation Recovery approval for the exact six-migration chain;
- Gate 3 migration-execution approval, including the bounded execution window;
- separate Sprint 1 authorization after Gate 3;
- cleanup authority and method;
- containment owner and recovery authority;
- exact migration executor and version; and
- evidence and security reviewers.

Repository evidence must use opaque aliases and fingerprints. It must never contain passwords, access or refresh tokens, JWTs, service-role keys, database URLs, raw emails, full Auth objects, health payloads, or unredacted vendor errors.

## 4. Frozen Repository Baseline

Before each future external session, record locally:

1. branch, exact commit SHA, and complete working-tree status;
2. every modified and untracked path, including unrelated user work;
3. the SHA-256 of every migration in the exact six-file Staging Foundation Recovery chain;
4. SHA-256 values for the frozen Phase 8.0A production contracts and serializers;
5. SHA-256 values for the frozen Phase 8.0B public persistence files;
6. SHA-256 values for `src/domain/scientificProduction/activationRegistry.ts` and `src/domain/scientificDomains/scientificBaseline.ts`;
7. SHA-256 values for the Phase 8.0C metadata, mapper, port, and inactive runtime composition;
8. an import audit proving no application module imports `runtimeComposition.ts` or `SCIENTIFIC_PERSISTENCE_SERVICE`; and
9. the inventory of tracked `supabase/.temp/` files, recorded only as proof that they exist and are untrusted for target selection.

Any frozen hash change, unexplained path, public-export change, scientific-domain change, activation-registry change, or runtime import is a stop condition. Do not normalize the state by reverting user work.

## 5. Project Fingerprint Procedure

This procedure runs locally in a protected operator session. Record only the environment alias, the resulting fingerprints, verification method, verifier, and timestamp.

For each project reference:

1. Accept a single string from an independently approved control record, never from a default environment or tracked CLI link state.
2. Remove leading and trailing ASCII whitespace only.
3. Convert ASCII letters to lowercase.
4. Reject the result unless it is non-empty ASCII and every character is a lowercase letter or digit.
5. Encode that canonical value as UTF-8 with no byte-order mark and no trailing newline.
6. Calculate SHA-256 over exactly those bytes.
7. Render exactly 64 lowercase hexadecimal characters.
8. Independently repeat or review the calculation before approval.

For staging, the calculated fingerprint must exactly equal `PHASE_8_0D_STAGING_PROJECT_FINGERPRINT` and the canonical reference must exactly equal `PHASE_8_0D_STAGING_PROJECT_REF`.

For production, each approved canonical production reference is fingerprinted by the same procedure. Raw production references must not be copied into repository evidence.

Reject and stop for an empty value, Unicode character, punctuation, internal whitespace, uppercase output, non-64-character fingerprint, trailing newline in the hashed bytes, or disagreement between independent calculations.

## 6. Staging Target Verification Procedure

Gate 2 is required before any staging network or database mutation. Sprint 0 does not authorize a connection.

When read-only discovery is separately allowed, compare all of the following independent identities:

1. the canonical project reference in the approved staging control record;
2. the project reference reported by the project/API configuration;
3. the leftmost hostname label before `.supabase.co` in `PHASE_8_0D_SUPABASE_URL`;
4. the project-reference label in the approved direct database hostname from `PHASE_8_0D_DATABASE_URL`;
5. the explicit project reference or database endpoint supplied to the proposed execution command; and
6. the expected staging fingerprint calculated under Section 5.

All six identities must agree exactly. Do not resolve a mismatch by choosing one source as authoritative after the fact.

The target owner must separately attest that the target:

- is a disposable preview branch or dedicated staging project;
- receives no production traffic;
- contains no production or copied production data;
- is not a production replica;
- uses no production Auth users or credentials;
- has an approved cleanup or destruction path; and
- can be contained by revoking execution on the exact Phase 8.0C RPC.

The verifier must record only:

- approved target alias;
- staging fingerprint;
- identity sources compared and an all-equal boolean;
- non-production/data/traffic attestations;
- target owner;
- verifier;
- timestamp;
- approved execution window; and
- cleanup authority and method.

If the database hostname does not expose an unambiguous project-reference label under the approved Supabase hostname form, stop. Do not infer the identity from a password, pooler default, local link file, or generic connection label.

## 7. Production Denylist Verification Procedure

`PHASE_8_0D_PRODUCTION_PROJECT_FINGERPRINTS` must be a non-empty comma-separated allowlisted set supplied through the protected execution environment.

Before external mutation:

1. Obtain security/release-owner confirmation that the set covers every known production Supabase project.
2. Split the configured value only at commas.
3. Reject empty entries, duplicate ambiguity, whitespace-bearing entries, or any entry not exactly 64 lowercase hexadecimal characters.
4. Compare the calculated staging fingerprint against every production fingerprint using exact equality.
5. Independently compare URL-derived, database-derived, control-record, and command-target staging identities against the denylist.
6. Record only the number of approved production entries, the comparison method, an all-different boolean, verifier, and timestamp.

Stop before network mutation if the set is empty or incomplete, an entry is invalid, staging matches an entry, a raw production reference appears in the evidence, or the verifier cannot prove the proposed credentials and endpoints are staging-owned.

## 8. Temporary Execution Workspace Isolation

No link-dependent command may run from the repository checkout. The tracked `supabase/.temp/` files are untrusted and must not be modified or deleted in Phase 8.0D.

After target approval and within the authorized sprint, the operator must create a new temporary directory outside the checkout and:

1. copy only the exact committed Supabase migration tree needed to establish repository migration history;
2. exclude all `.temp`, link, credential, environment, editor, and generated metadata;
3. record the source commit and hashes before and after copying;
4. prove the copied migration inventory is byte-for-byte identical to the committed tree;
5. provide the approved target explicitly to every command;
6. prove the tool cannot fall back to an implicit linked project; and
7. destroy the workspace after evidence and cleanup are complete.

No `.env` file may be created. Credentials enter only through protected runner secrets or interactive secure input and must not appear in shell history or transcripts.

## 9. Migration Allowlist Verification Procedure

The complete local repository order at the Sprint 0 baseline is:

1. `20260614002200_ai_usage.sql`
2. `20260709000000_ai_usage_search_count.sql`
3. `20260714000000_brief_editorial_pipeline.sql`
4. `20260715000000_brief_cover_pipeline.sql`
5. `20260715120000_backfill_issue_one_editorial_intelligence_rpc.sql`
6. `20260719000000_scientific_persistence_records.sql`

The complete and only migration allowlist for the verified empty staging target is the six-file list above, once each and in that exact order. The approved hashes are:

| Order | Migration | SHA-256 |
| --- | --- | --- |
| 1 | `20260614002200_ai_usage.sql` | `1014f492f7b77be2a259c717ee9226a6afbbabd0b74799fda45ea69f98f93e2e` |
| 2 | `20260709000000_ai_usage_search_count.sql` | `5435cf6e017e9eaedf63396727d5e066a3cf55c6f5356d336f0041a6b1ea0a61` |
| 3 | `20260714000000_brief_editorial_pipeline.sql` | `954bfc186fa6c5f5d2054bf68298d037d647a8c7072eb676828b547442d9bc12` |
| 4 | `20260715000000_brief_cover_pipeline.sql` | `f95fee86e5e2e6ad40710ab70cb8df3e904772cf8c82466902a8edb4c39065d7` |
| 5 | `20260715120000_backfill_issue_one_editorial_intelligence_rpc.sql` | `cf33bd683e488812efbdc25991fcb84bb096908ec94d8f757f88afb6c2e88205` |
| 6 | `20260719000000_scientific_persistence_records.sql` | `4dbf80f61c7cbc2adf6e5c9933bbc173944e31c83def36dc140ecf5e0113a354` |

No additional migration, seed, manual statement, backfill invocation, history entry, repair, squash, or schema completion is allowlisted.

After Gate 2 and under separately authorized read-only inspection:

1. capture the complete remote migration history without repair or mutation;
2. require remote migration history to be empty;
3. verify no unexpected remote-only migration, duplicate, version conflict, or history divergence exists;
4. calculate the complete pending set by comparing repository and remote histories;
5. require the pending set to contain exactly the six allowlisted files above, once each and in order;
6. verify every migration timestamp, filename, and SHA-256 against the committed repository artifact;
7. verify no migration in the chain is already recorded as applied;
8. verify no conflicting application table, function, RPC, policy, index, trigger, role, type, constraint, privilege, or governed `brief-covers` bucket configuration exists;
9. verify the target otherwise contains only the expected standard Supabase platform foundation; and
10. record sanitized history identities, the six-item pending set, hashes, object-absence booleans, verifier, and timestamp.

Any missing, additional, duplicated, reordered, hash-mismatched, unexpectedly applied, remote-only, or conflicting migration/object state, or any need for history repair, stops the phase before migration.

The later migration executor may use only an explicit target from the isolated workspace and only after Gate 3 approval and separate Sprint 1 authorization. The command template is:

```text
supabase db push --db-url "<protected PHASE_8_0D_DATABASE_URL>"
```

Before execution, the operator must replace the transcript argument with `<REDACTED_STAGING_DATABASE_URL>`, record the installed tool version, reconfirm that the verified pending set contains exactly the six allowlisted migrations in order, obtain Gate 3 approval for that exact command form, and then obtain separate Sprint 1 authorization. `--include-all`, `--include-roles`, migration repair, reset, dashboard execution, SQL Editor execution, and any implicit-link mode are prohibited.

The command is a future template only. This runbook does not approve Gate 3, authorize Sprint 1, open an execution window, or authorize Staging Foundation Migration Execution.

## 10. Gate 2 Approval Evidence

Gate 2 is ready for decision only when one record contains:

- decision: approved or rejected;
- target alias and exact staging project-reference fingerprint;
- target type: disposable preview branch or dedicated staging project;
- named target owner;
- independent non-production proof;
- no-production-data and no-production-traffic attestations;
- all staging identity sources compared and equal;
- complete production denylist comparison passed;
- credential ownership verified as staging-only without recording credentials;
- cleanup/destruction authority and exact method;
- final-disable strategy;
- approved execution window;
- verifier and approver names/roles;
- approval timestamp; and
- evidence references containing no raw secret or project reference.

An offline Gate 2 target-identity decision may mark dynamic API-, URL-, database-, command-target-, and credential-ownership checks as deferred only when its external execution window is explicitly closed. Such a decision authorizes no connection or mutation. Every deferred dynamic check remains mandatory before any later network or database action and before Gate 3 can be requested.

Gate 2 approval alone does not authorize migration execution. A target change, fingerprint change, execution-window expiry, ownership change, denylist change, or loss of cleanup authority invalidates the approval.

### 10.1 Gate 2 Target Identity and Safety Approval Record

- **Decision:** GATE 2 APPROVED
- **Approval date:** 2026-07-20
- **Target alias:** `vitalspan-staging`
- **Target type:** Dedicated Supabase staging project
- **Staging project-reference fingerprint:** `093e366a5999fd2981b37164daef0eb3819e3b0099ab7fa820f6d35b6ae65dca`
- **Target owner:** bekir cem
- **Non-production proof:** The phase owner explicitly designated `vitalspan-staging` as staging and separately identified `vitalspan` as the only known production project; their canonical project references are distinct and their calculated SHA-256 fingerprints do not match
- **Production denylist entry count:** 1
- **Production fingerprint denylist:** `3cb786c198df3bcf84bdfd94f5d33ce4bb2b776ff4713532fd04a0dfdbb997d3`
- **Denylist comparison:** Passed; the staging fingerprint differs from every supplied production fingerprint
- **Execution governance:** Single-person governance; no additional reviewer is required or recorded
- **`AUTHORIZED_DATABASE_OPERATOR`:** bekir cem
- **`SECURITY_REVIEWER`:** bekir cem
- **`EVIDENCE_REVIEWER`:** bekir cem
- **`CLEANUP_AUTHORITY`:** bekir cem
- **Cleanup method:** For this dedicated staging project, leave the exact RPC disabled, remove only correlated Phase 8.0D synthetic rows through the authorized staging operator, remove synthetic Auth users only after dependent rows, destroy sessions, protected credentials, and the temporary execution workspace, and verify final RPC disablement
- **Final-disable strategy:** Revoke `EXECUTE` from `authenticated` on the exact Phase 8.0C RPC signature and verify denial/unchanged row counts under the kill-switch runbook
- **Credential ownership evidence:** Not applicable to this offline approval; no credential was supplied, loaded, or used. Any future credential must be proven staging-owned before connection
- **Dynamic identity checks:** API-, URL-, database-, and command-target-derived identities were not accessed in this offline approval and must all equal the approved staging identity before any external action
- **Approved execution window:** Governance finalization on 2026-07-20 only; external execution window closed
- **Verifier:** bekir cem
- **Approver:** bekir cem
- **Approval scope:** Target identity and Gate 2 safety governance only
- **Sprint 1:** Not authorized
- **Migration execution:** Not authorized
- **Gate 3:** Not approved; subsequent live read-only verification resolved to staging but failed the migration-history allowlist
- **Production:** Access, migration, privilege inspection/mutation, deployment, release, and activation remain unauthorized

This approval remains valid only while the target alias, project-reference fingerprint, production denylist, single-person ownership, and cleanup authority remain unchanged. It does not satisfy or waive any deferred dynamic identity, target-cleanliness, migration-history, conflicting-object, command, execution-window, containment, or recovery check required before Gate 3 or external execution.

## 11. Gate 3 Approval Evidence

Gate 3 may be requested only after Gate 1, Gate 2, and Staging Foundation Recovery approvals and completed read-only target/history verification. One record must contain:

- decision: approved or rejected;
- exact repository commit;
- exact filename and SHA-256 for every migration in the six-file chain;
- exact Gate 2 target fingerprint;
- expected pre-migration history and sanitized observed-history match;
- proof the complete pending set contains exactly the six approved migrations, once each and in order;
- proof none of the six migrations is already applied;
- proof no conflicting table, function, RPC, policy, index, trigger, role, type, constraint, privilege, or governed storage-bucket configuration exists;
- exact migration tool, version, and redacted command form;
- named migration executor;
- execution window;
- no-retry rule for partial, failed, or unknown outcomes;
- containment plan, including immediate RPC disablement if objects exist;
- named recovery authority;
- cleanup authority;
- approver name/role and timestamp; and
- explicit statement that Sprint 1 requires separate authorization after Gate 3 and that production, Sprint 2+, application integration, deployment, release, and activation remain unauthorized.

Gate 3 is target-, fingerprint-, commit-, six-migration-hash-, command-, executor-, and time-window-specific. A change to any one of those facts invalidates approval. Gate 3 follows Staging Foundation Recovery approval and precedes separate Sprint 1 authorization. Target or recovery approval alone is never migration approval, and Gate 3 alone never authorizes Sprint 1 or execution.

### 11.1 Historical Gate 3 Readiness Record — Superseded, No Approval

- **Verification date:** 2026-07-20
- **Decision:** GATE 3 NOT READY
- **Supabase CLI version:** `2.109.1`
- **Repository branch:** `main`
- **Repository HEAD:** `5db644b72b40e7782b8276cf027f0aaf127d222d`
- **Unauthorized implementation/test/migration diff:** None
- **Execution workspace:** Disposable isolated workspace containing only the six committed migration files; repository `.env` and tracked `supabase/.temp/` metadata were not loaded or used
- **Resolved target:** `vitalspan-staging`
- **Resolved staging fingerprint:** `093e366a5999fd2981b37164daef0eb3819e3b0099ab7fa820f6d35b6ae65dca`
- **Production denylist fingerprint:** `3cb786c198df3bcf84bdfd94f5d33ce4bb2b776ff4713532fd04a0dfdbb997d3`
- **Dynamic target result:** Passed; the isolated CLI link resolved only to the approved staging identity and no isolated link file contained the production reference
- **Local production-reference finding:** The repository `.env` and tracked `supabase/.temp/` metadata resolve to the denylisted production project and remain prohibited/untrusted for Phase 8.0D targeting
- **CLI authentication:** Present and valid through the authorized developer's local CLI context; no access token was printed or recorded
- **Database authentication:** Present and valid for the approved staging read-only CLI operations; no database password, URL, or generated login credential was printed or recorded
- **Remote migration history:** Readable and empty
- **Local migration count:** 6
- **Actual complete pending set:** `20260614002200_ai_usage.sql`, `20260709000000_ai_usage_search_count.sql`, `20260714000000_brief_editorial_pipeline.sql`, `20260715000000_brief_cover_pipeline.sql`, `20260715120000_backfill_issue_one_editorial_intelligence_rpc.sql`, and `20260719000000_scientific_persistence_records.sql`
- **Current six-file governance result:** The observed empty remote history and exact six-item pending set require Staging Foundation Recovery approval followed by a new Gate 3 decision under the current specification
- **Unexpected remote migrations:** None
- **Remote duplicates or version conflicts:** None observed
- **Phase 8.0C migration recorded remotely:** No
- **Phase 8.0C migration SHA-256:** `4dbf80f61c7cbc2adf6e5c9933bbc173944e31c83def36dc140ecf5e0113a354`
- **Target table conflict:** Absent
- **Target RPC/function conflict:** Absent
- **Writer-role conflict:** Absent
- **Policy/index/trigger conflict:** Absent because the target table is absent and no `scientific_persistence` metadata was discovered
- **Custom type conflict:** Absent
- **Inspection methods:** Read-only migration list, table statistics, role statistics, and generated public-schema type metadata
- **Schema-dump limitation:** The CLI schema-dump path required unavailable Docker Desktop; no dump was produced. Read-only table/role statistics and generated schema metadata provided the object-absence substitute evidence
- **Containment readiness:** Ready in documentation; exact kill switch, stop-on-unknown behavior, cleanup authority, evidence redaction, and production prohibition are recorded
- **External mutation:** None; no migration, schema change, SQL mutation, Auth-setting change, function deployment, data write, privilege change, or production access occurred
- **Sprint 1:** Unauthorized
- **Migration execution window:** Closed
- **Gate 3 approval:** Not granted; this historical record cannot approve the current six-file action

### 11.2 Staging-Foundation Recovery Decision

The phase owner selected the separately governed staging-foundation path. Historical static local inspection concluded that the existing six migrations form a coherent chain for a genuinely empty, standard Supabase staging project in exactly this order; the corrected recovery document now requires renewed approval:

1. `20260614002200_ai_usage.sql`
2. `20260709000000_ai_usage_search_count.sql`
3. `20260714000000_brief_editorial_pipeline.sql`
4. `20260715000000_brief_cover_pipeline.sql`
5. `20260715120000_backfill_issue_one_editorial_intelligence_rpc.sql`
6. `20260719000000_scientific_persistence_records.sql`

The complete review, file hashes, platform assumptions, privilege analysis, containment concerns, and future safeguards are recorded in `docs/PHASE_8_0D_STAGING_FOUNDATION_RECOVERY.md`.

This recovery record does not repair or normalize history and does not authorize any command. Renewed Staging Foundation Recovery approval must precede a new Gate 3 decision for the exact six-file action. Only after Gate 3 may Sprint 1 be separately authorized. The execution window remains closed; Sprint 1 and production access remain unauthorized.

## 12. Future Ordered Validation Flow

Every step requires the prior step to pass. No step authorizes the next automatically, and this runbook authorizes none of them.

1. **Gate 1:** Approve the current implementation specification.
2. **Gate 2:** Approve and verify the exact isolated staging target and production denylist.
3. **Staging Foundation Recovery approval:** Approve the exact six-file chain, order, hashes, assumptions, containment, and evidence boundaries.
4. **Gate 3:** Approve the exact target, commit, six hashes, executor, command, containment plan, recovery authority, and bounded execution window after read-only verification proves the empty clean target and exact pending set.
5. **Sprint 1 authorization:** Separately authorize Sprint 1 after Gate 3; Gate 3 alone is insufficient.
6. **Staging Foundation Migration Execution:** Apply the six approved migrations unchanged and in order from the isolated workspace; stop on the first error, never retry or repair, and capture sanitized evidence after every migration and after the chain.
7. **Phase 8.0D validation:** Verify deployed objects before Auth activity, then run real Auth/JWT/PostgREST/RPC/RLS/lineage/serialization/identity-time/kill-switch/repeatability cases, final containment, and synthetic cleanup.
8. **Phase 8.0D closure:** Assemble final evidence and perform security and VES review without inventing approval or production readiness.

## 13. Expected Results and Failure Evidence

Future validation must use D-STG-001 through D-STG-018 exactly as specified. Durable assertions are response shape, transport status, SQLSTATE category, privilege state, and before/after row counts; do not overfit vendor message text.

Expected denial categories include authentication failure and insufficient privilege. Record SQLSTATE when safely available, including `28000` for absent authenticated identity, `42501` for insufficient privilege, and `23503` for rejected cross-owner lineage when that is the deployed result. An unexpected category is a stop condition until reviewed; it must not be relabelled as passing.

For every failure case record only:

- test-case ID and operation name;
- opaque actor label;
- transport/client outcome;
- SQLSTATE when safely available;
- sanitized error category;
- before/after row counts;
- expected-versus-actual outcome; and
- confirmation that no raw error, identifier, payload, or credential was retained.

If an insert may have reached PostgreSQL before a timeout or connection loss, do not retry. Stop the affected sequence, inspect only the correlated synthetic row count through the authorized evidence connection, record an unknown outcome and idempotency limitation, and obtain a new approved recovery decision.

## 14. Mandatory Stop Conditions

Stop before migration when:

- Gate 1, Gate 2, Staging Foundation Recovery approval, Gate 3, or separate Sprint 1 authorization is absent, invalid, expired, out of order, or does not match the exact action;
- target identity is ambiguous, sources disagree, or non-production status cannot be proven;
- a proposed credential, user, endpoint, or project may be production-owned;
- the production denylist is empty, incomplete, invalid, or matches staging;
- tracked or implicit CLI link state could select the target;
- any exact committed migration hash cannot be proven;
- remote history is not empty, any migration in the chain appears applied, or the pending set differs from the exact six-file allowlist in membership or order;
- any table, function, RPC, role, policy, grant, index, trigger, constraint, type, privilege, or governed storage-bucket configuration conflicts with the clean-target requirement;
- target data/traffic status or cleanup authority is unavailable;
- the isolated workspace cannot exclude tracked link metadata; or
- evidence would expose a secret, raw project reference, JWT, user identity, or payload.

After migration, stop the test sequence and invoke authorized containment when:

- application outcome is partial, failed, or unknown;
- Auth, JWT, PostgREST discovery, RPC signature, or response shape is ambiguous;
- owner identity can be supplied, spoofed, or observed across users;
- RLS, same-owner/cross-owner lineage, direct update, or direct delete differs from the contract;
- database identity/time is client controlled;
- serialized content or governed nested state changes;
- an automatic retry or duplicate ambiguity occurs;
- RPC execution cannot be revoked or an alternate bypass exists; or
- evidence capture would disclose protected content.

Never bypass a stop condition by editing Phase 8.0C, changing a migration, repairing history, completing schema manually, weakening an assertion, selecting a different target silently, or substituting production evidence.

## 15. Containment and Cleanup

On a post-migration blocker, stop all application-path calls and use the approved kill-switch procedure. Do not restore execution unless the exact restoration step is separately authorized and the blocking condition has been resolved.

Preferred cleanup is destruction of the disposable preview branch. For a long-lived staging target:

- leave the exact RPC disabled;
- identify records only through protected synthetic correlation data;
- remove only those records under narrowly approved privileged authority;
- confirm application update/delete denial remains unchanged;
- remove synthetic users only after dependent records;
- remove credentials and sessions;
- destroy the temporary workspace; and
- record relevant final counts and final privilege state.

Ambiguous deletion targets stop cleanup. This cleanup is not a production deletion feature and proves no retention, deletion, export, or privacy lifecycle.

## 16. Sprint 0 Non-Authorization Check

Sprint 0 does not authorize and this runbook does not perform:

- a Supabase connection;
- migration execution;
- RPC invocation;
- staging Auth user creation;
- staging schema, role, grant, privilege, or data mutation;
- production access or mutation;
- application integration;
- runtime composition import or invocation;
- deployment, release, commit, push, tag, or activation; or
- Sprint 1 or later work.

Production remains unauthorized regardless of any future staging result.
