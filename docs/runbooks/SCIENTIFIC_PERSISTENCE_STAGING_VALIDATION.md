# Scientific Persistence Staging Validation Runbook

## 1. Status and Authority

- Phase: 8.0D — Real Supabase Staging Validation
- Document role: Governance and staging-safety procedure
- Specification: `docs/specifications/PHASE_8_0D_IMPLEMENTATION_SPECIFICATION_v1.0.0.md`
- Current authorization: Sprint 0 only
- Production migration: Not authorized
- Production access: Not authorized
- Staging mutation: Not authorized by Sprint 0
- Migration execution: Not authorized until separate Gate 2 and Gate 3 approvals are recorded
- Application integration and runtime activation: Not authorized

This runbook prepares the future staging-validation path. It is not an execution approval. A later sprint may use only the portions expressly authorized for that sprint, after every prerequisite gate and stop-condition review passes.

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
| `AUTH_USER_A` | Future synthetic, non-anonymous staging user owned by no real person |
| `AUTH_USER_B` | Future distinct synthetic, non-anonymous staging user owned by no real person |
| `UNAUTHENTICATED_CLIENT` | Public-key client with no Auth session or user access JWT |

Required operator records are:

- Gate 1 approval for specification version 1.0.0;
- Gate 2 staging-target approval;
- Gate 3 migration-execution approval;
- approved execution window;
- cleanup authority and method;
- containment owner and recovery authority;
- exact migration executor and version; and
- evidence and security reviewers.

Repository evidence must use opaque aliases and fingerprints. It must never contain passwords, access or refresh tokens, JWTs, service-role keys, database URLs, raw emails, full Auth objects, health payloads, or unredacted vendor errors.

## 4. Frozen Repository Baseline

Before each future external session, record locally:

1. branch, exact commit SHA, and complete working-tree status;
2. every modified and untracked path, including unrelated user work;
3. the SHA-256 of `supabase/migrations/20260719000000_scientific_persistence_records.sql`;
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

The only migration allowed to be pending for Phase 8.0D is:

`20260719000000_scientific_persistence_records.sql`

Its Sprint 0 SHA-256 is:

`4dbf80f61c7cbc2adf6e5c9933bbc173944e31c83def36dc140ecf5e0113a354`

After Gate 2 and under separately authorized read-only inspection:

1. capture the complete remote migration history without repair or mutation;
2. verify the first five repository migrations above are present once and in the expected order;
3. verify no unexpected remote-only migration, missing prerequisite, duplicate, or history divergence exists;
4. verify the Phase 8.0C migration is absent from applied history;
5. calculate the complete pending set by comparing repository and remote histories;
6. require that pending set to contain exactly the single allowlisted filename above;
7. verify the migration timestamp, filename, and SHA-256 match the committed repository artifact;
8. verify `public.scientific_persistence_records`, `public.insert_scientific_persistence_record`, and `scientific_persistence_writer` do not already exist; and
9. record sanitized history identities, the one-item pending set, object-absence booleans, verifier, and timestamp.

Any additional pending migration, remote-only entry, missing prerequisite, pre-existing Phase 8.0C object, applied Phase 8.0C identity, hash mismatch, or need for history repair stops the phase before migration.

The later migration executor may use only an explicit target from the isolated workspace and only after Gate 3. The command template is:

```text
supabase db push --db-url "<protected PHASE_8_0D_DATABASE_URL>"
```

Before execution, the operator must replace the transcript argument with `<REDACTED_STAGING_DATABASE_URL>`, record the installed tool version, reconfirm that the verified pending set contains exactly the allowlisted migration, and obtain Gate 3 approval for that exact command form. `--include-all`, `--include-roles`, migration repair, reset, dashboard execution, SQL Editor execution, and any implicit-link mode are prohibited.

The command above is a future template, not Sprint 0 execution authority.

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

Gate 2 approval alone does not authorize migration execution. A target change, fingerprint change, execution-window expiry, ownership change, denylist change, or loss of cleanup authority invalidates the approval.

## 11. Gate 3 Approval Evidence

Gate 3 may be requested only after Gate 2 approval and completed read-only target/history verification. One record must contain:

- decision: approved or rejected;
- exact repository commit;
- exact migration filename and SHA-256;
- exact Gate 2 target fingerprint;
- expected pre-migration history and sanitized observed-history match;
- proof the complete pending set contains only `20260719000000_scientific_persistence_records.sql`;
- proof the migration is not already applied;
- proof the table, RPC, and writer role do not already exist;
- exact migration tool, version, and redacted command form;
- named migration executor;
- execution window;
- no-retry rule for partial, failed, or unknown outcomes;
- containment plan, including immediate RPC disablement if objects exist;
- named recovery authority;
- cleanup authority;
- approver name/role and timestamp; and
- explicit statement that production, Sprint 2+, application integration, deployment, release, and activation remain unauthorized.

Gate 3 is target-, fingerprint-, commit-, migration-hash-, command-, executor-, and time-window-specific. A change to any one of those facts invalidates approval. Target approval alone is never migration approval.

## 12. Future Ordered Validation Flow

Only a separately authorized later sprint may execute the applicable step. Each step requires the prior step to pass.

1. Freeze repository identities and hashes.
2. Verify Gate 1, then collect Gate 2 target approval.
3. Perform approved read-only staging identity and history inspection.
4. Verify the production denylist and one-item migration allowlist.
5. Create and verify the isolated execution workspace.
6. Collect Gate 3 for the exact target, commit, migration hash, command, and window.
7. Apply the unchanged migration once; never rerun after a partial, failed, or unknown outcome.
8. Verify history and deployed objects before Auth activity.
9. Create two synthetic staging-only Auth users.
10. Validate real sessions, JWT project/issuer/subject/expiry/role claims in memory, and PostgREST transport.
11. Run D-STG-001 through D-STG-015 with unique synthetic operation identities and no automatic retry.
12. Run the governed kill-switch drill in `docs/runbooks/SCIENTIFIC_PERSISTENCE_KILL_SWITCH.md`.
13. Prove one exact repeatability mode without rerunning the migration against the same database.
14. Revoke authenticated execution on the exact RPC signature as the mandatory final state.
15. Destroy the disposable project or clean only exact synthetic records and users under approved authority.
16. Destroy sessions, credentials, and the isolated workspace.
17. Record sanitized evidence and perform security and VES review without inventing approval.

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

- specification, Gate 2, or Gate 3 approval is absent, invalid, expired, or does not match the exact action;
- target identity is ambiguous, sources disagree, or non-production status cannot be proven;
- a proposed credential, user, endpoint, or project may be production-owned;
- the production denylist is empty, incomplete, invalid, or matches staging;
- tracked or implicit CLI link state could select the target;
- the exact committed migration hash cannot be proven;
- remote history diverges, Phase 8.0C appears applied, or any migration besides the allowlisted file is pending;
- the table, function, writer role, policy, or grant conflicts with the clean-target requirement;
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
