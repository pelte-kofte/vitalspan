# PHASE 8.0D IMPLEMENTATION SPECIFICATION

# Real Supabase Staging Validation

**Version:** 1.0.0
**Status:** Approved — Sprint 0 Authorized
**Phase:** 8.0D
**Objective:** Validate the approved, inactive Phase 8.0C scientific-persistence implementation against one explicitly approved, isolated Supabase staging environment using real Supabase Auth, authenticated JWT transport, PostgREST RPC, PostgreSQL Row Level Security, lineage constraints, database-generated identity and time, exact serialization round trips, and an executable RPC kill switch.
**Production activation:** Not authorized
**Application integration:** Not authorized
**Scientific behavior impact:** None
**Public-contract impact:** None

---

## 1. Purpose

Phase 8.0D is a staging-validation phase only.

It shall determine whether the existing Phase 8.0C migration and inactive Supabase persistence adapter behave as approved when exercised through a real Supabase staging project rather than an embedded PostgreSQL substitute.

Phase 8.0D shall validate:

- real Supabase Auth sessions;
- authenticated JWT transport;
- PostgREST discovery and invocation of the existing RPC;
- executable database ownership isolation;
- same-owner and cross-owner lineage behavior;
- database-authoritative persistence identity and time;
- exact request/result serialization preservation;
- direct update and delete denial;
- revocation and restoration of RPC execution permission; and
- repeatable, sanitized evidence capture.

Phase 8.0D does not create a production consumer, change persistence behavior, correct the migration, or authorize activation.

The existing Phase 8.0C runtime composition remains inactive before, during, and after this phase.

---

## 2. Governing Authority

The following artifacts govern Phase 8.0D:

1. `docs/VITALSPAN_ENGINEERING_STANDARD.md`
2. `docs/SCIENTIFIC_BASELINE_V1_0.md`
3. `docs/PHASE_8_0A_PRODUCTION_CONTRACT_ACTIVATION_ARCHITECTURE.md`
4. `docs/specifications/PHASE_8_0B_IMPLEMENTATION_SPECIFICATION_v2.0.0.md`
5. `docs/architecture/PHASE_8_0C_ARCHITECTURE_BLUEPRINT.md`
6. `docs/specifications/PHASE_8_0C_IMPLEMENTATION_SPECIFICATION_v1.0.0.md`
7. `docs/PHASE_8_0C_VERIFICATION_EVIDENCE_SET_AND_CLOSURE.md`
8. The approved Phase 8.0D Architecture Discovery Report
9. The committed Phase 8.0C implementation at the implementation-start commit

The stricter applicable requirement controls.

This specification does not supersede Phase 8.0A scientific authority, Phase 8.0B persistence contracts, Phase 8.0C implementation boundaries, security/privacy review, or explicit environment-change approval.

---

## 3. Change Classification and Phase Boundaries

**Primary VES classification:** Non-behavioral implementation.

**Rationale:** Phase 8.0D adds staging-only validation artifacts and executes the already-approved Phase 8.0C migration in an isolated non-production environment. It changes no scientific result, public contract, application path, production schema, or production activation state.

The external staging schema change is material and requires explicit target and migration-execution approval even though production behavior remains unchanged.

### 3.1 Affected surfaces

- Isolated Supabase staging environment
- Supabase migration history in that staging environment
- Synthetic staging Auth users and sessions
- Staging-only synthetic persistence records
- Staging validation tests and SQL assertions
- Staging validation and kill-switch runbooks
- Phase 8.0D evidence and closure documentation

### 3.2 Frozen and unaffected surfaces

- All Phase 8.0A scientific behavior
- All Phase 8.0A public contracts and serializers
- All Phase 8.0B public persistence contracts
- The eleven Phase 8.0B public exports
- All Phase 8.0C production implementation files
- `supabase/migrations/20260719000000_scientific_persistence_records.sql`
- `src/infrastructure/scientificPersistence/runtimeComposition.ts`
- `src/domain/scientificProduction/activationRegistry.ts`
- Scientific Baseline v1.0
- Scientific-domain code, versions, policies, registries, and fixtures
- Existing application services and screens
- Existing production schemas and environments
- UI, Advisor, AI, HealthKit, and presentation behavior

### 3.3 Phase start and end

Phase 8.0D implementation begins only after:

- this specification is approved;
- the exact implementation-start commit and clean repository state are recorded;
- the staging target is independently identified and approved; and
- the authorized files and external actions for Sprint 0 are confirmed.

Phase 8.0D ends after the evidence set records either:

- technical closure with all required staging cases passing and reviewer approval still explicitly required; or
- an evidence-backed failure or blocker, with the staging RPC disabled and cleanup completed as far as safely possible.

Technical closure does not authorize production migration, application integration, release, or activation.

---

## 4. Scope

### 4.1 In scope

Phase 8.0D includes only:

1. isolated Supabase staging environment preparation;
2. explicit staging project-reference verification;
3. staging migration-history verification;
4. exact application of the existing Phase 8.0C migration in staging;
5. creation of synthetic staging Auth users with no health or production data;
6. real Supabase Auth sign-in and session validation;
7. authenticated JWT transport through the Supabase client and PostgREST;
8. PostgREST discovery and invocation of `public.insert_scientific_persistence_record`;
9. executable RLS ownership validation;
10. same-owner and cross-owner lineage validation;
11. database-generated persistence UUID and timestamp validation;
12. exact request/result serialization round-trip validation;
13. blocked-output, audit, provenance, null, and empty-array preservation validation;
14. direct application-role update and delete denial;
15. an RPC execute-revocation and restoration drill;
16. final staging disablement and synthetic-data cleanup;
17. repeatability through exactly one mode defined in Section 7.12; and
18. sanitized evidence capture and technical closure.

### 4.2 Explicitly out of scope

Phase 8.0D shall not implement or authorize:

- application integration;
- a scientific evaluation coordinator;
- a persistence sidecar;
- any application consumer of `SCIENTIFIC_PERSISTENCE_SERVICE`;
- production activation;
- a production feature flag;
- staging or production feature-flag wiring;
- idempotency hardening;
- a duplicate-prevention migration;
- retry behavior;
- offline or background queues;
- reconciliation or synchronization;
- telemetry implementation;
- monitoring implementation;
- alerting implementation;
- retention implementation;
- deletion-product implementation;
- export implementation;
- privacy-lifecycle implementation;
- application-level encryption;
- production migration;
- production smoke testing;
- production Supabase project access;
- scientific adapter implementation or registration;
- `activationRegistry` changes;
- Phase 8.0A contract or serializer changes;
- Phase 8.0B public-contract changes;
- Phase 8.0C migration edits;
- Phase 8.0C runtime implementation edits;
- schema hardening unrelated to proving the committed migration;
- migration repair;
- migration squashing;
- a read model;
- a history API;
- a user-facing persistence state; or
- a production-readiness claim.

Idempotency, application integration, operational monitoring, retention, deletion, export, privacy lifecycle, and production readiness belong to later, separately governed phases.

### 4.3 Assumptions

Phase 8.0D assumes:

- Phase 8.0C remains committed and pushed;
- the implementation-start working tree is clean or unrelated work is explicitly documented and preserved;
- one isolated Supabase staging project or disposable preview branch is available;
- that environment contains no production data and is not connected to production traffic;
- the staging environment can be safely reset, destroyed, or cleaned after validation;
- authorized operators can create and delete synthetic staging Auth users;
- an authorized staging database connection is available for migration and SQL-level evidence;
- the project public client credential and test-user credentials are provided through protected environment variables;
- privileged credentials are available only to the authorized runner and are never committed or logged;
- PostgREST exposes the `public` schema in staging;
- the test data is synthetic and contains no personal health information;
- the Phase 8.0A request and result serializers remain the serialization authority; and
- no test requires an active application or scientific-domain adapter.

An assumption that cannot be verified becomes a stop condition; it must not be silently converted into a fallback.

### 4.4 Dependencies

Required dependencies are:

- approved Phase 8.0C commit and migration;
- approved staging target and named target owner;
- named migration executor;
- named security reviewer;
- named evidence reviewer;
- Supabase CLI or an equivalently reviewed migration executor;
- PostgreSQL client support for SQL-level validation;
- the existing `@supabase/supabase-js` dependency;
- protected staging-only credentials;
- network access to the approved staging project;
- an execution environment isolated from tracked repository link metadata; and
- explicit authorization for every external mutation described by the applicable sprint.

No dependency grants production authority.

---

## 5. Environment Safety Requirements

### 5.1 Isolated staging only

The target shall be exactly one of:

- a disposable Supabase preview branch created for Phase 8.0D; or
- a dedicated, long-lived Supabase staging project formally identified as non-production.

The target must not:

- receive production traffic;
- contain production data;
- share a project reference with production;
- use a production database URL;
- use production Auth users;
- use production service credentials;
- be a production read replica;
- be linked through an unverified local CLI state; or
- be inferred from a default environment variable.

### 5.2 Explicit project-reference verification

Before any migration command, the implementation operator shall record and compare:

1. the project reference obtained from the approved staging control record;
2. the project reference reported by the Supabase project/API configuration;
3. the project reference derived from the staging URL or database endpoint;
4. the project reference supplied to the execution command; and
5. the approved fingerprints for every known production-project reference.

All staging identities must agree. The staging identity must not match any production identity.

The evidence repository shall contain only the minimum safe identity evidence: an approved environment alias, project-reference fingerprint, verification method, verifier, and timestamp. Secrets, passwords, access tokens, and JWTs shall not be recorded.

Project-reference fingerprints shall be generated and compared exactly as follows:

1. trim leading and trailing ASCII whitespace from the project reference;
2. convert the project reference to lowercase;
3. reject the value unless it is a non-empty ASCII string containing only lowercase letters and digits;
4. encode the canonical value as UTF-8 with no trailing newline;
5. calculate SHA-256 over those exact bytes;
6. represent the fingerprint as exactly 64 lowercase hexadecimal characters;
7. require the calculated staging fingerprint to equal `PHASE_8_0D_STAGING_PROJECT_FINGERPRINT`;
8. require `PHASE_8_0D_PRODUCTION_PROJECT_FINGERPRINTS` to contain a non-empty comma-separated allowlisted set of valid 64-character lowercase hexadecimal fingerprints for every known production project;
9. require the calculated staging fingerprint to differ from every production fingerprint; and
10. stop before network mutation if canonical project references, calculated fingerprints, configured fingerprints, URL-derived identity, or command-target identity disagree.

The project reference extracted from `PHASE_8_0D_SUPABASE_URL` shall be the leftmost hostname label before `.supabase.co`. The project reference extracted from the database endpoint shall be the project-reference label in the approved Supabase database hostname. Both extracted values shall equal the canonical `PHASE_8_0D_STAGING_PROJECT_REF`.

### 5.3 Production-project prohibition

If any target identifier matches, may match, or cannot be proven different from production, all Phase 8.0D external work shall stop before a migration command.

No command may be run with:

- a production project reference;
- a production database URL;
- a production access token;
- a production service-role credential;
- a production user session; or
- a generic credential whose environment ownership is unknown.

### 5.4 Migration-history verification

Before application, the staging migration history shall prove:

- all prerequisite repository migrations are in the expected order;
- no unexpected remote-only migration exists;
- no migration-history divergence exists;
- the complete pending-migration allowlist contains exactly `20260719000000_scientific_persistence_records.sql` and no other migration;
- `20260719000000_scientific_persistence_records.sql` is not yet recorded as applied;
- `public.scientific_persistence_records` does not already exist;
- `public.insert_scientific_persistence_record` does not already exist; and
- the `scientific_persistence_writer` role does not already exist.

If any additional pending migration exists, implementation shall stop before migration execution.

Schema changes through the Supabase Dashboard, SQL Editor, Table Editor, or ad-hoc SQL are prohibited. The only authorized direct SQL operations are the already-approved validation assertions, the exact kill-switch `REVOKE` and `GRANT` operations, and the narrowly scoped synthetic-data cleanup in Section 7.11; none may create, alter, replace, or drop a schema object.

After application, the history shall prove:

- the exact Phase 8.0C migration is recorded once;
- its timestamp and filename match the repository;
- no additional migration was applied;
- no migration file was generated or rewritten; and
- no history-repair operation occurred.

### 5.5 Clean-target requirement

The staging target is clean for Phase 8.0D only when:

- it is independently classified as staging;
- it contains no production or copied production data;
- its pre-Phase-8.0C schema matches the expected prerequisite migration state;
- no conflicting scientific-persistence table, function, policy, grant, or role exists;
- no prior Phase 8.0D synthetic users or records remain unless explicitly part of a repeatability test; and
- cleanup authority and method are approved before test data is created.

### 5.6 Tracked Supabase CLI link metadata

The repository currently tracks Supabase CLI-generated files under `supabase/.temp/`, including project-link metadata. Phase 8.0D shall treat every such file as untrusted for environment selection.

Phase 8.0D shall not modify or delete those files because they are outside the authorized file plan.

External execution shall occur in a temporary, isolated execution workspace that:

- contains a verified copy of the exact committed migration tree;
- does not contain repository `supabase/.temp/` link metadata;
- receives the approved staging target explicitly;
- records migration-file hashes before execution;
- cannot fall back to an implicit linked project; and
- is destroyed after evidence and cleanup complete.

The operator shall not run a link-dependent migration command from the repository checkout.

Resolution of tracked CLI metadata in the repository belongs to a separate repository-hygiene change.

### 5.7 Credential safety

- Credentials shall enter only through protected runner secrets or interactive secure input.
- Public client credentials may be used only for the approved staging project.
- Privileged database or admin credentials shall be least-lived and least-privileged where feasible.
- Test-user passwords shall be unique, synthetic, and ephemeral.
- Command transcripts shall redact credentials and tokens before evidence is saved.
- JWT content may be inspected only in memory; evidence may retain sanitized claim names and hashed subject identity, never the encoded token.
- Request and result payloads shall not be printed even though fixtures are synthetic.
- No `.env` file shall be created or modified by Phase 8.0D.

### 5.8 Mandatory stop conditions

Implementation shall stop before migration if:

- specification approval is absent;
- staging-target approval is absent;
- migration-execution approval is absent;
- the target cannot be proven non-production;
- project-reference checks disagree;
- implicit CLI link state would select the target;
- migration history diverges from the repository;
- the Phase 8.0C migration appears already applied;
- a conflicting table, function, role, policy, or grant exists;
- the target contains production data;
- cleanup authority is unavailable;
- required secrets can only be exposed in logs or repository files; or
- the exact committed migration hash cannot be proven.

Implementation shall stop after migration and disable the RPC if:

- Auth or JWT behavior is ambiguous;
- PostgREST exposes an unexpected overload or operation;
- owner identity can be supplied or spoofed;
- user isolation fails;
- same-owner or cross-owner lineage differs from the migration contract;
- update or delete is permitted to an application role;
- returned identity or time is client-controlled;
- serialization round-trip equality fails;
- the RPC cannot be revoked;
- a test produces an unknown database mutation; or
- evidence would require disclosure of a credential or health payload.

No failing case may be bypassed by changing the Phase 8.0C migration during this phase.

---

## 6. Required Identities and Test Data

### 6.1 Environment identities

The evidence set shall assign opaque labels:

- `STAGING_PROJECT`
- `PRODUCTION_PROJECT_DENYLIST_ENTRIES`
- `AUTH_USER_A`
- `AUTH_USER_B`
- `UNAUTHENTICATED_CLIENT`
- `AUTHORIZED_DATABASE_OPERATOR`
- `SECURITY_REVIEWER`
- `EVIDENCE_REVIEWER`

Raw credentials and full JWTs shall never replace these labels in repository evidence.

### 6.2 Auth identities

Two distinct, non-anonymous Supabase Auth users shall be created in staging:

- User A, used for a root record and same-owner child;
- User B, used for an independent root and cross-owner parent attempt.

Accounts shall use synthetic staging-only identifiers and no real user email, profile, biomarker, or health data.

For this specification, an `anon session` means a client initialized with the staging public project credential but with no Supabase Auth user session and no user access JWT. It exercises the PostgreSQL `anon` role.

Supabase anonymous Auth users, which possess authenticated JWTs, are not a substitute for this case. Whether they may persist scientific records is an unresolved later-phase policy decision and is not decided by Phase 8.0D.

### 6.3 Scientific contract fixture

The integration test shall use one deterministic synthetic Phase 8.0A request/result fixture that includes:

- a stable request ID;
- one supported domain ID and version;
- an explicit requested timestamp;
- representative provenance;
- at least one blocked output;
- scientific audit metadata;
- confidence and limitations;
- explicit null values;
- explicit empty arrays; and
- no personal health information.

The fixture shall pass the existing Phase 8.0A serializers and the existing Phase 8.0B persistence boundary without changing either implementation.

Every insert-oriented case shall use a unique request/result fixture identity unless the case explicitly validates lineage. Phase 8.0D shall not retry an uncertain call because the existing implementation has no idempotency guarantee.

---

## 7. Exact Staging Validation Flow

The implementation shall follow this order. A later step may not begin until the prior step's completion criteria and stop conditions are satisfied.

### 7.1 Environment verification

1. Record branch, commit SHA, clean-tree state, and Phase 8.0C file hashes.
2. Record that this specification is approved and no Sprint 0 work occurred during authoring.
3. Obtain the approved staging environment identity through the authorized channel.
4. Compare target project reference, URL-derived identity, command target, and production denylist.
5. Confirm the target contains no production data or traffic.
6. Confirm cleanup authority and final-disable strategy.
7. Create a temporary external execution workspace without tracked CLI link metadata.
8. Copy the committed migration tree into that workspace and verify hashes.
9. Verify staging migration history and conflicting-object absence.
10. Save sanitized pre-migration evidence.

Failure at any step stops before migration.

### 7.2 Migration application

1. Obtain explicit migration-execution approval for the verified staging target and exact commit.
2. Prove that the complete pending-migration set contains exactly `20260719000000_scientific_persistence_records.sql`.
3. Stop if any additional pending migration exists.
4. Execute only the allowlisted `20260719000000_scientific_persistence_records.sql` migration using the explicit staging target in the isolated workspace.
5. Apply that existing Phase 8.0C migration without editing, wrapping, reformatting, or repairing it.
6. Record the exact command with secret values redacted.
7. Record start time, completion time, exit status, and migration-tool version.
8. Re-read migration history.
9. Verify the table, function, role, policies, grants, constraints, and defaults created by the exact migration.
10. Verify no unexpected schema object or migration was introduced.

If application is partial, ambiguous, or failed, stop; do not rerun, repair, or manually complete it without a new approved recovery plan.

### 7.3 Auth user creation

1. Create synthetic User A and User B through an approved staging-only Auth administration path.
2. Confirm their Auth subject identifiers are distinct.
3. Confirm neither user is linked to a real person or production account.
4. Store credentials only in protected runner memory or secrets.
5. Record only hashed or redacted subject evidence.
6. Confirm the unauthenticated client has no persisted session before its cases run.

### 7.4 JWT acquisition and validation

1. Sign in User A through Supabase Auth using the staging public client configuration.
2. Obtain a real staging access JWT through the client session.
3. Validate issuer/project association, subject presence, expiry, and authenticated role in memory.
4. Repeat independently for User B.
5. Prove the user subjects and JWTs differ.
6. Do not print, persist, or attach either JWT.
7. Confirm the Supabase client supplies the JWT to PostgREST automatically for authenticated RPC calls.

### 7.5 RPC discovery and invocation

1. Confirm PostgREST discovers exactly the committed RPC signature.
2. Confirm no owner, persistence ID, or persistence timestamp input exists.
3. Invoke the RPC without a JWT and record the sanitized refusal.
4. Invoke through an anon-session client and record the sanitized refusal.
5. Invoke a valid root insert as User A through the real Supabase client.
6. Validate the returned response shape before using its values.
7. Verify exactly one row was created for the successful operation.
8. Verify the stored owner equals User A's server-derived Auth subject.

### 7.6 RLS ownership validation

1. Use the approved SQL test to exercise the deployed PostgreSQL roles and `auth.uid()` context.
2. Confirm User A can receive only the permitted identity/time result for User A's insert.
3. Confirm User B cannot observe User A's row through any application-role path.
4. Confirm authenticated direct table reads remain denied except for the narrow function-owner behavior defined by the migration.
5. Confirm client-supplied owner spoofing is impossible through RPC signature and database behavior.
6. Confirm direct update and direct delete fail for application roles.
7. Record SQLSTATE values and row counts without recording payloads or raw identifiers.

### 7.7 Lineage validation

1. Retain User A's returned root persistence ID in protected test memory.
2. Submit one child insert as User A with that root as `parentPersistenceId`.
3. Confirm the child succeeds, has a distinct database-generated identity, and references User A's root.
4. Submit one child attempt as User B using User A's root as parent.
5. Confirm the cross-owner operation fails and inserts no row.
6. Confirm the client receives no payload, owner, or cross-owner row detail beyond the sanitized failure category.
7. Verify User A and User B row counts after both cases.

### 7.8 Serialization round-trip validation

1. Serialize the fixture request with `serializeScientificEvaluationRequest`.
2. Serialize the fixture result with `serializeScientificEvaluationResult`.
3. Persist those exact serializer outputs through the existing Phase 8.0C mapper and port path.
4. Retrieve the synthetic stored payloads only through the privileged validation connection.
5. Compare stored strings with the exact serializer outputs.
6. Deserialize stored strings with the existing Phase 8.0A deserializers.
7. Assert deep equality with the original request and result.
8. Separately assert preservation of blocked outputs, audit metadata, provenance, versions, nulls, empty arrays, limitations, confidence, safety-candidate state, and trend state.
9. Record equality booleans and safe hashes; do not record payload contents.

### 7.9 Database-generated identity and time validation

1. Confirm the RPC signature accepts no persistence ID or persisted-at input.
2. Confirm owner identity is absent from the RPC input.
3. Confirm returned `persistence_id` parses as a UUID.
4. Confirm returned `persisted_at` parses as an absolute timestamp.
5. Confirm both values equal the values stored in the created row.
6. Confirm the timestamp falls within the database-observed validation interval.
7. Confirm child and root persistence IDs differ.
8. Confirm a caller attempt to add owner, identity, or time parameters is rejected by PostgREST function resolution.

### 7.10 Kill-switch drill

1. Confirm an authenticated staging RPC call succeeds immediately before revocation.
2. Record the exact current execute grant for the RPC signature.
3. Revoke `EXECUTE` on the exact RPC signature from `authenticated` using the approved staging operator.
4. Confirm User A and User B RPC calls fail after revocation.
5. Confirm no row is inserted by the denied calls.
6. Confirm no alternate RPC overload or direct-table path bypasses revocation.
7. Restore the exact approved `GRANT EXECUTE` to `authenticated`.
8. Confirm a new authenticated root call succeeds after restoration.
9. Revoke `EXECUTE` on the exact RPC signature from `authenticated` again as the mandatory final staging-disabled state; no alternative containment state is permitted.
10. Record grants before, during, after restoration, and at final containment.

The drill shall not alter production and shall not modify the migration file.

### 7.11 Cleanup

Preferred cleanup is destruction of the disposable Supabase preview branch after evidence capture.

If a long-lived staging project is approved instead:

1. leave the persistence RPC disabled;
2. identify the exact synthetic Phase 8.0D rows through protected test correlation data;
3. delete only those synthetic rows through the authorized staging operator;
4. verify application-role update/delete denial remains unchanged;
5. delete the synthetic Auth users only after dependent rows are removed;
6. remove temporary runner secrets and credentials;
7. destroy the temporary execution workspace;
8. verify no test session remains active;
9. record final row counts and Auth cleanup status; and
10. confirm no production environment was accessed.

This privileged staging cleanup is not a product deletion workflow and does not satisfy the deferred production privacy-lifecycle requirement.

### 7.12 Repeatability

Repeatability shall mean exactly one of these two approved modes:

1. create a fresh disposable staging target, obtain new staging-target and migration-execution approvals for that target, apply the allowlisted migration once, and repeat the required validation with fresh synthetic identities; or
2. after cleanup on the existing staging target, rerun only the non-migration validation cases using fresh synthetic Auth users, fresh request IDs, and fresh lineage identities while proving that migration history remains unchanged.

The Phase 8.0C migration shall never be rerun against the same database. Repeatability shall not use migration repair, schema reset, manual schema completion, or automatic retry.

Repeatability evidence shall record the selected mode, target fingerprint, renewed approvals where applicable, fresh synthetic identity proof, migration history before and after, validation results, cleanup result, and mandatory final RPC execute revocation.

If neither repeatability mode can be executed without rerunning the migration against the same database, using ambiguous target state, or weakening cleanup and containment, the repeatability step shall stop and technical closure shall remain unavailable.

---

## 8. Required Executable Test Cases

Every case is mandatory. `Not run` is not a passing result.

| ID | Test case | Required assertion |
| --- | --- | --- |
| D-STG-001 | Missing JWT | Raw or client RPC without a user access JWT is refused; row count unchanged. |
| D-STG-002 | Anon session | Public-key client with no Auth session is refused; row count unchanged. |
| D-STG-003 | Valid authenticated root insert | User A JWT reaches PostgREST; one root row is created and one valid result is returned. |
| D-STG-004 | Database-generated UUID | Returned ID is a database-created UUID, equals stored ID, and was absent from inputs. |
| D-STG-005 | Database-generated timestamp | Returned timestamp is database-created, equals stored time, and was absent from inputs. |
| D-STG-006 | Owner spoofing impossible | RPC exposes no owner parameter; extra owner input is rejected; stored owner equals `auth.uid()`. |
| D-STG-007 | Second-user isolation | User B cannot read, return, mutate, or otherwise observe User A's row through application-role paths. |
| D-STG-008 | Same-owner lineage success | User A can create a child whose parent is User A's root; both identities are distinct. |
| D-STG-009 | Cross-owner lineage failure | User B cannot create a child of User A's root; no row is inserted. |
| D-STG-010 | Direct update denied | Authenticated and anon application paths cannot update a persistence record; expected denial and unchanged row. |
| D-STG-011 | Direct delete denied | Authenticated and anon application paths cannot delete a persistence record; expected denial and unchanged row. |
| D-STG-012 | Response shape | Successful RPC returns exactly one record with non-empty `persistence_id` and `persisted_at`; unsafe shapes fail the integration assertion. |
| D-STG-013 | Request round trip | Stored request string equals approved serializer output; deserialized request deep-equals original. |
| D-STG-014 | Result round trip | Stored result string equals approved serializer output; deserialized result deep-equals original. |
| D-STG-015 | Scientific-state preservation | Blocks, audit, provenance, versions, nulls, empty arrays, confidence, limitations, safety, and trend survive unchanged. |
| D-STG-016 | RPC revoke | Removing authenticated execute permission causes authenticated RPC refusal and zero inserted rows. |
| D-STG-017 | RPC re-enable | Restoring the exact execute grant permits a new authenticated call without any schema or code change. |
| D-STG-018 | Final containment | `EXECUTE` on the exact RPC signature is revoked from `authenticated` at closure. |

### 8.1 Expected failure evidence

Failure cases shall capture:

- transport status where applicable;
- sanitized Supabase/PostgREST error category;
- SQLSTATE where available;
- operation name;
- actor label;
- before/after row count;
- expected-versus-actual outcome; and
- confirmation that no raw error body containing identifiers, schema secrets, payloads, or credentials was retained.

The test shall not overfit to a vendor message string when an HTTP status, SQLSTATE, privilege result, or row-count invariant provides the durable assertion.

### 8.2 Unknown-outcome rule

If a transport timeout or connection loss occurs after an insert may have reached PostgreSQL:

- do not retry the same operation;
- stop the affected sequence;
- inspect the staging row count through the authorized evidence connection;
- record the result as an idempotency limitation; and
- allocate any corrective design to a later phase.

Phase 8.0D shall not add duplicate handling to make the test pass.

---

## 9. Evidence Requirements

The closure record shall distinguish verified facts, failures, limitations, external approvals, and deferred work.

### 9.1 Repository evidence

- branch and implementation-start commit SHA;
- working-tree status before and after each sprint;
- exact authorized files created or modified;
- SHA-256 of the Phase 8.0C migration before and after staging validation;
- hashes of frozen Phase 8.0A, Phase 8.0B, activation-registry, and Scientific Baseline artifacts;
- proof that the Phase 8.0C migration remained byte-for-byte unchanged;
- proof that the runtime composition remained unreferenced by application code; and
- final diff, whitespace, final-newline, and untracked-file audits.

### 9.2 Commands executed

Record every external command with:

- exact tool and version;
- command text with secrets and raw target credentials redacted;
- execution time;
- authorized operator;
- approved target alias and fingerprint;
- exit code;
- purpose; and
- resulting evidence reference.

Commands that were prepared but not executed shall be labelled as not executed.

### 9.3 Project identity evidence

Record:

- staging environment alias;
- staging project-reference fingerprint;
- production denylist comparison result;
- independent identity sources compared;
- verifier name or role;
- verification timestamp;
- absence of production traffic/data; and
- target-approval record.

### 9.4 Migration history evidence

Capture sanitized migration history immediately before and after application, proving:

- expected prerequisite state;
- Phase 8.0C absent before;
- Phase 8.0C present once after;
- no unexpected migration;
- no repair action; and
- no migration-file change.

### 9.5 Sanitized Auth evidence

Capture only:

- provider/type used;
- successful user creation and sign-in booleans;
- distinct hashed subject identities;
- JWT issuer/project match boolean;
- authenticated role claim boolean;
- token-validity interval check boolean; and
- cleanup status.

Never capture access tokens, refresh tokens, passwords, raw emails, or full Auth user objects.

### 9.6 RPC and SQLSTATE evidence

For every RPC and denial case, record:

- test-case ID;
- actor label;
- HTTP or client outcome;
- SQLSTATE when available;
- sanitized error category;
- response-shape result;
- before/after row counts; and
- pass/fail decision.

### 9.7 Row-count evidence

Row-count evidence shall use synthetic-test correlation and report only counts necessary to prove:

- successful root insert adds one row;
- successful same-owner child adds one row;
- missing-JWT, anon, cross-owner, update, delete, and revoked-RPC cases add or remove no rows;
- cleanup removes only authorized synthetic rows; and
- no unrelated staging rows are affected.

### 9.8 Serialization evidence

Record:

- approved serializer functions used;
- request string equality boolean;
- result string equality boolean;
- request deep-equality boolean;
- result deep-equality boolean;
- safe hashes of original and stored synthetic serialized values;
- preservation assertions for every governed nested state; and
- confirmation that payload contents were not logged.

### 9.9 Kill-switch evidence

Record:

- exact function signature;
- execute privileges before revocation;
- revocation command with target redacted as required;
- denial result and unchanged row count;
- restore command;
- successful post-restore invocation;
- final containment privilege state; and
- confirmation that production privileges were never inspected or changed.

### 9.10 Cleanup evidence

Record:

- disposable-project destruction or exact synthetic-row cleanup result;
- Auth-user cleanup result;
- final RPC privilege state;
- temporary workspace destruction;
- credential/session disposal;
- final staging row counts relevant to the test; and
- confirmation that no production project was touched.

### 9.11 Limitations

The evidence set shall explicitly retain at least these limitations:

- staging evidence is not production evidence;
- Phase 8.0D does not prove idempotency;
- Phase 8.0D does not prove application integration;
- Phase 8.0D does not prove monitoring or incident response;
- Phase 8.0D does not prove retention, deletion, export, or privacy lifecycle;
- Phase 8.0D does not prove production migration safety;
- Phase 8.0D does not authorize a scientific adapter;
- Phase 8.0D does not authorize production activation; and
- successful validation does not constitute VES PASS without the required review.

---

## 10. Sprint Plan

Sprint completion does not authorize the next sprint automatically. Each sprint requires its stated approval and clean stop-condition review.

### Sprint 0 — Governance and Staging Safety

**Objective**

Freeze the repository, contracts, migration hash, target-selection process, approvals, and safe execution boundary before any external mutation.

**Authorized files**

- `docs/specifications/PHASE_8_0D_IMPLEMENTATION_SPECIFICATION_v1.0.0.md` only for corrections that receive renewed Gate 1 approval before implementation continues
- `docs/runbooks/SCIENTIFIC_PERSISTENCE_STAGING_VALIDATION.md`
- `docs/runbooks/SCIENTIFIC_PERSISTENCE_KILL_SWITCH.md`
- `docs/PHASE_8_0D_VERIFICATION_EVIDENCE_SET_AND_CLOSURE.md`

**Authorized external actions**

- read-only staging identity discovery;
- read-only migration-history inspection after target approval;
- creation of a temporary execution workspace without credentials; and
- approval collection.

**Forbidden actions**

- migration execution;
- Auth user creation;
- schema, role, grant, or data mutation;
- any production access;
- any application or Phase 8.0C implementation change; and
- use of tracked CLI link metadata for target selection.

**Tests/evidence**

- branch, commit, status, and file inventory;
- migration and frozen-contract hashes;
- staging-versus-production identity comparison;
- target owner and approval records;
- temporary-workspace isolation proof; and
- runbook review.

**Completion criteria**

- specification approved;
- exact staging target approved;
- production denylist comparison passed;
- migration history is compatible;
- cleanup path approved;
- all operators/reviewers named; and
- no external mutation occurred.

**Stop conditions**

- any missing approval;
- ambiguous environment identity;
- migration-history divergence;
- target contains production data;
- cleanup is unavailable; or
- implicit linked-project state cannot be excluded.

### Sprint 1 — Staging Environment and Migration

**Objective**

Apply the exact existing Phase 8.0C migration once to the explicitly approved isolated staging target and verify deployed objects and history.

**Authorized files**

- `docs/runbooks/SCIENTIFIC_PERSISTENCE_STAGING_VALIDATION.md`
- `docs/PHASE_8_0D_VERIFICATION_EVIDENCE_SET_AND_CLOSURE.md`

**Authorized external actions**

- explicit staging migration-history reads;
- one approved migration application;
- deployed-object and privilege inspection; and
- staging containment if application fails.

**Forbidden actions**

- migration-file modification;
- migration repair or squash;
- manual schema completion;
- schema changes through the Supabase Dashboard, SQL Editor, Table Editor, or ad-hoc SQL;
- execution when any pending migration other than `20260719000000_scientific_persistence_records.sql` exists;
- reapplication after ambiguous failure;
- Auth test execution before object verification;
- production access; and
- application activation.

**Tests/evidence**

- history before and after;
- proof that the complete pending set contained only `20260719000000_scientific_persistence_records.sql`;
- exact migration hash;
- command/tool/version record;
- table, function, role, constraint, policy, grant, and default inspection;
- absence of unexpected objects; and
- external-action approval.

**Completion criteria**

- migration recorded exactly once;
- no migration other than `20260719000000_scientific_persistence_records.sql` was pending or applied;
- expected objects match the committed SQL;
- no extra migration or schema change exists;
- Phase 8.0C code remains unchanged and inactive; and
- evidence is sanitized and complete.

**Stop conditions**

- partial or ambiguous application;
- any additional pending migration;
- unexpected object or privilege;
- migration hash mismatch;
- history divergence;
- target identity changes; or
- any production indicator.

### Sprint 2 — Auth, JWT, and RPC Validation

**Objective**

Prove real Supabase Auth user sessions, authenticated JWT transport, PostgREST RPC discovery, unauthenticated refusal, and one valid root insert.

**Authorized files**

- `src/__tests__/scientificPersistenceStaging.integration.test.ts`
- `docs/runbooks/SCIENTIFIC_PERSISTENCE_STAGING_VALIDATION.md`
- `docs/PHASE_8_0D_VERIFICATION_EVIDENCE_SET_AND_CLOSURE.md`

**Authorized external actions**

- create synthetic staging Users A and B;
- authenticate through staging Supabase Auth;
- invoke the deployed RPC through PostgREST;
- inspect only the synthetic rows through the authorized evidence connection; and
- revoke RPC execution for containment if a blocker occurs.

**Forbidden actions**

- real-user credentials or data;
- token logging;
- service-role use in application-path cases;
- application code wiring;
- retries after unknown outcomes;
- production access; and
- migration change.

**Tests/evidence**

- D-STG-001 through D-STG-007 and D-STG-012;
- sanitized Auth/JWT evidence;
- RPC discovery and response shape;
- owner-source evidence;
- UUID/time evidence; and
- row-count invariants.

**Completion criteria**

- missing JWT and anon session are refused;
- both Auth users obtain distinct valid staging sessions;
- User A root insert succeeds exactly once;
- identity/time and owner are database authoritative;
- User B cannot observe User A's row; and
- no secret or payload appears in evidence.

**Stop conditions**

- ambiguous JWT issuer, project, role, or subject;
- unexpected RPC overload;
- owner spoofing possible;
- cross-user visibility;
- malformed success response;
- unknown commit state; or
- credential disclosure.

### Sprint 3 — RLS and Lineage Validation

**Objective**

Prove deployed ownership isolation, application-role update/delete denial, same-owner lineage success, and cross-owner lineage failure.

**Authorized files**

- `supabase/tests/scientific_persistence_staging_rls.sql`
- `src/__tests__/scientificPersistenceStaging.integration.test.ts`
- `docs/runbooks/SCIENTIFIC_PERSISTENCE_STAGING_VALIDATION.md`
- `docs/PHASE_8_0D_VERIFICATION_EVIDENCE_SET_AND_CLOSURE.md`

**Authorized external actions**

- execute the reviewed SQL assertions against staging;
- create the minimum synthetic lineage rows;
- attempt direct application-role update/delete operations;
- inspect relevant row counts and ownership through the evidence connection; and
- disable RPC execution on failure.

**Forbidden actions**

- altering policies, grants, constraints, roles, or function definition;
- privileged mutation except approved synthetic cleanup;
- exposing cross-owner row content;
- production access;
- migration edits; and
- application wiring.

**Tests/evidence**

- D-STG-007 through D-STG-011;
- SQLSTATE and HTTP/client outcomes;
- before/after row counts;
- RLS-role and `auth.uid()` evidence;
- same-owner parent/child evidence; and
- cross-owner failure evidence.

**Completion criteria**

- User A child succeeds;
- User B cross-owner child fails with zero inserted rows;
- direct update and delete fail;
- User B cannot observe User A's row; and
- no Phase 8.0C object was altered.

**Stop conditions**

- any cross-owner visibility or write;
- update/delete success;
- unexpected SQLSTATE suggesting a different boundary;
- lineage ambiguity;
- raw row disclosure; or
- need to change the migration.

### Sprint 4 — Serialization and Transport Validation

**Objective**

Prove the real transport and deployed storage preserve exact Phase 8.0A serializer output and every governed nested state without reinterpretation.

**Authorized files**

- `src/__tests__/scientificPersistenceStaging.integration.test.ts`
- `docs/runbooks/SCIENTIFIC_PERSISTENCE_STAGING_VALIDATION.md`
- `docs/PHASE_8_0D_VERIFICATION_EVIDENCE_SET_AND_CLOSURE.md`

**Authorized external actions**

- persist deterministic synthetic fixtures through the deployed RPC;
- read only those synthetic payloads through the authorized evidence connection; and
- capture safe equality and hash evidence.

**Forbidden actions**

- payload logging;
- alternate serializers;
- scientific projection or normalization;
- production data;
- Phase 8.0A/8.0B/8.0C code changes; and
- retry or duplicate hardening.

**Tests/evidence**

- D-STG-012 through D-STG-015;
- exact stored-string equality;
- deserialization deep equality;
- nested blocked/audit/provenance/null/empty-state preservation; and
- no-mutation assertions.

**Completion criteria**

- request and result strings equal approved serializer output;
- deserialized objects deep-equal originals;
- every governed nested state is preserved;
- no payload is logged; and
- only synthetic data is involved.

**Stop conditions**

- byte/string mismatch;
- deserialization failure;
- lost, added, or transformed field;
- logging exposure;
- unexpected duplicate; or
- any proposed serializer change.

### Sprint 5 — Kill Switch, Cleanup, and Repeatability

**Objective**

Prove immediate staging RPC disablement and controlled restoration, prove repeatability through one exact approved mode, then revoke RPC execution and remove all authorized synthetic assets.

**Authorized files**

- `docs/runbooks/SCIENTIFIC_PERSISTENCE_KILL_SWITCH.md`
- `src/__tests__/scientificPersistenceStaging.integration.test.ts`
- `docs/PHASE_8_0D_VERIFICATION_EVIDENCE_SET_AND_CLOSURE.md`

**Authorized external actions**

- inspect staging function grants;
- revoke and restore execute permission on the exact RPC signature;
- perform one post-restore synthetic invocation;
- perform one of the two repeatability modes defined in Section 7.12;
- revoke `EXECUTE` on the exact RPC signature from `authenticated` as the mandatory final state;
- destroy the disposable staging branch or clean exact synthetic rows/users; and
- destroy temporary credentials and execution workspace.

**Forbidden actions**

- production privilege inspection or mutation;
- table, function, role, or policy redesign;
- persistent feature-flag creation;
- leaving the RPC enabled at closure;
- rerunning the Phase 8.0C migration against the same database;
- using any repeatability procedure other than the two modes in Section 7.12;
- broad or unresolved deletion targets; and
- deletion of non-test data.

**Tests/evidence**

- D-STG-016 through D-STG-018;
- grants before/during/after the drill;
- denied and restored call results;
- unchanged row count during revocation;
- cleanup evidence;
- repeatability mode, fresh-identity, migration-history, and result evidence; and
- final containment evidence.

**Completion criteria**

- revoke blocks RPC execution;
- restore permits a new call;
- no bypass exists;
- one exact repeatability mode completes without rerunning the migration against the same database;
- `EXECUTE` on the exact RPC signature is revoked from `authenticated` as the final state;
- synthetic users/data are removed or the disposable project is destroyed;
- temporary secrets/workspace are destroyed; and
- no production environment was touched.

**Stop conditions**

- revoke does not block execution;
- unexpected bypass exists;
- restore changes more than the exact grant;
- repeatability would rerun the migration against the same database;
- repeatability cannot use either exact mode in Section 7.12;
- cleanup target is ambiguous;
- non-test data could be affected; or
- final containment cannot be proven.

### Sprint 6 — Verification Evidence Set and Closure

**Objective**

Assemble final evidence, run repository and regression checks, perform the VES review, and record a precise staging-only closure outcome without claiming production readiness.

**Authorized files**

- `docs/PHASE_8_0D_VERIFICATION_EVIDENCE_SET_AND_CLOSURE.md`
- `docs/specifications/PHASE_8_0D_IMPLEMENTATION_SPECIFICATION_v1.0.0.md` only for corrections that receive renewed Gate 1 approval before implementation continues

**Authorized external actions**

- read-only verification of final staging containment and cleanup;
- evidence review;
- security review; and
- approval recording.

**Forbidden actions**

- new staging writes;
- production access;
- production migration or smoke testing;
- application integration;
- activation;
- commit, push, tag, or release without separate authority; and
- invented reviewer approval or VES outcome.

**Tests/evidence**

- all D-STG cases;
- focused Phase 8.0A/8.0B/8.0C tests;
- affected scientific regressions;
- full repository test suite;
- strict TypeScript;
- configured lint/build checks where available;
- public-contract and activation audits;
- final diff/whitespace/newline/status audit;
- security review; and
- VES gate report.

**Completion criteria**

- all required real staging cases pass;
- every limitation and deferred item is explicit;
- the migration and frozen contracts are unchanged;
- Phase 8.0C remains inactive;
- staging cleanup and containment are complete;
- no production project was touched;
- reviewer approval is accurately recorded or remains pending; and
- production remains blocked.

**Stop conditions**

- missing evidence;
- unresolved security or ownership failure;
- dirty or unexplained repository state;
- incomplete cleanup/containment;
- any production contact; or
- pressure to claim VES PASS or production readiness without authority.

---

## 11. File Plan

Phase 8.0D shall minimize repository changes.

The complete authorized file set is:

| File | Action | Purpose |
| --- | --- | --- |
| `docs/specifications/PHASE_8_0D_IMPLEMENTATION_SPECIFICATION_v1.0.0.md` | Modify during authoring; after approval, any change requires renewed Gate 1 approval before implementation continues | Governing implementation specification |
| `docs/runbooks/SCIENTIFIC_PERSISTENCE_STAGING_VALIDATION.md` | Create | Environment verification, migration, Auth, RPC, RLS, serialization, and cleanup procedure |
| `docs/runbooks/SCIENTIFIC_PERSISTENCE_KILL_SWITCH.md` | Create | Exact staging RPC revoke, verification, restoration, and final containment procedure |
| `docs/PHASE_8_0D_VERIFICATION_EVIDENCE_SET_AND_CLOSURE.md` | Create | Sanitized evidence, VES assessment, limitations, and closure decision |
| `supabase/tests/scientific_persistence_staging_rls.sql` | Create | Executable real-staging SQL assertions for ownership, RLS, update/delete denial, and lineage |
| `src/__tests__/scientificPersistenceStaging.integration.test.ts` | Create | Real Auth/JWT/PostgREST/RPC/serialization integration suite |

No other repository file is authorized.

In particular, Phase 8.0D shall not modify:

- any Phase 8.0A file;
- `src/domain/scientificPersistence/**`;
- `src/infrastructure/scientificPersistence/**`;
- `src/domain/scientificProduction/activationRegistry.ts`;
- `src/lib/supabase.ts`;
- `package.json`;
- `.env.example`;
- `.gitignore`;
- any existing migration;
- any application, screen, navigation, UI, Advisor, or AI file; or
- any production configuration.

An independently proven defect that blocks real staging validation does not authorize an in-phase implementation edit. The phase shall stop, document the defect, and request a separately reviewed scope decision. Phase 8.0D shall not silently repair Phase 8.0C.

No idempotency migration file is authorized.

---

## 12. Test Harness Requirements

### 12.1 Integration test

`src/__tests__/scientificPersistenceStaging.integration.test.ts` shall:

- require an explicit opt-in environment guard;
- require an approved staging-project fingerprint;
- fail before network access if required staging variables are absent;
- refuse a configured production fingerprint;
- use the existing Supabase dependency without changing `package.json`;
- create isolated Supabase clients for unauthenticated, User A, and User B cases;
- import only public Phase 8.0A/8.0B boundaries and the existing Phase 8.0C infrastructure required for validation;
- use deterministic synthetic fixtures;
- never run as part of an ordinary unguarded unit-test command;
- never print credentials, JWTs, raw user objects, or payloads;
- use unique operation identities to avoid accidental duplicate ambiguity;
- avoid automatic retry; and
- clean up client sessions in `finally` behavior.

The exact staging configuration variables are:

| Variable | Required meaning |
| --- | --- |
| `PHASE_8_0D_STAGING_VALIDATION` | Explicit opt-in guard; must equal the exact literal `AUTHORIZED_STAGING_ONLY`. Any other value or absence fails before network access. |
| `PHASE_8_0D_STAGING_PROJECT_REF` | Canonical lowercase staging Supabase project reference approved by Gate 2. |
| `PHASE_8_0D_STAGING_PROJECT_FINGERPRINT` | Expected 64-character lowercase SHA-256 fingerprint of the canonical staging project reference. |
| `PHASE_8_0D_PRODUCTION_PROJECT_FINGERPRINTS` | Non-empty comma-separated set of 64-character lowercase SHA-256 fingerprints for every known production project reference. |
| `PHASE_8_0D_SUPABASE_URL` | HTTPS API URL for the approved staging project; its hostname-derived project reference must match `PHASE_8_0D_STAGING_PROJECT_REF`. |
| `PHASE_8_0D_SUPABASE_ANON_KEY` | Public client credential belonging to the approved staging project, used for anon and authenticated client transport cases. |
| `PHASE_8_0D_AUTH_ADMIN_SERVICE_ROLE_KEY` | Protected staging-only Auth administration credential used only to create and remove the two synthetic Auth users; never used for application-path RPC assertions. |
| `PHASE_8_0D_USER_A_EMAIL` | Synthetic staging-only email identifier for User A. |
| `PHASE_8_0D_USER_A_PASSWORD` | Ephemeral protected password for User A. |
| `PHASE_8_0D_USER_B_EMAIL` | Synthetic staging-only email identifier for User B. |
| `PHASE_8_0D_USER_B_PASSWORD` | Ephemeral protected password for User B. |
| `PHASE_8_0D_DATABASE_URL` | Protected direct database URL for the approved staging project, used only for migration, SQL validation, evidence inspection, kill-switch operations, and authorized synthetic cleanup. |
| `PHASE_8_0D_SQL_STAGING_MARKER` | Must equal `PHASE_8_0D_STAGING_PROJECT_FINGERPRINT` and must be set as the reviewed SQL session marker before SQL validation begins. |

Every variable is required. The project identities derived from the URL, database URL, configured project reference, staging fingerprint, production fingerprints, and command target shall pass the Section 5.2 rules before any network mutation. These variables shall be provided only through the protected execution environment; Phase 8.0D shall not create an `.env` file.

The exact invocation command shall be documented in the runbook rather than added to `package.json`.

### 12.2 SQL test

`supabase/tests/scientific_persistence_staging_rls.sql` shall:

- refuse execution unless the approved staging marker is set in the session;
- execute inside transactions where rollback does not invalidate the behavior being proven;
- set role and JWT claim context explicitly for RLS assertions;
- restore role/session state after each case;
- use only synthetic test identifiers supplied securely by the runner;
- avoid printing request/result payloads;
- assert SQLSTATE and row-count invariants;
- perform no schema changes;
- perform no grant changes except the separately reviewed kill-switch commands in the runbook; and
- terminate on the first failed ownership or permission assertion.

### 12.3 Runbook requirements

Both runbooks shall include:

- prerequisites and named approvals;
- exact target-verification steps;
- production denylist checks;
- safe command templates with secret placeholders;
- expected results and SQLSTATE categories;
- stop conditions;
- containment actions;
- evidence redaction requirements;
- cleanup actions; and
- explicit statements that production remains unauthorized.

---

## 13. Approval Gates

### Gate 1 — Specification approval

Required before Sprint 0 implementation.

Approval must identify:

- specification version;
- reviewed commit;
- approved scope and out-of-scope boundaries;
- reviewer; and
- approval date.

Draft status is not approval.

Any change to this specification after Gate 1 approval immediately invalidates the prior Gate 1 approval. Implementation shall stop, the changed specification shall be re-reviewed, and renewed Gate 1 approval shall be recorded before implementation continues. A change to governance meaning or scope also requires an appropriate specification version increment; no approved specification may be changed silently.

#### Gate 1 Governance Approval Record

- **Reviewer:** bekir cem
- **Approval date:** 2026-07-20
- **Reviewed repository commit:** `527f52dcbf22dd1132b800ad9989f4efe7cfdec8`
- **Reviewed corrected-draft SHA-256:** `610fc6b8b89a5e78ca3d26968e858e58004338ed901f58a293b688d4b11631ae`
- **Decision:** APPROVED — SPRINT 0 AUTHORIZED
- **Authorized work:** Sprint 0 — Governance and Staging Safety only
- **Unauthorized work:** Sprint 1 and every later sprint
- **Migration execution:** Not authorized; migration execution still requires separate Gate 2 staging-target approval and Gate 3 migration-execution approval after the required read-only target and migration-history verification
- **Production:** Migration, deployment, release, activation, and production-readiness claims remain unauthorized
- **VES:** No VES PASS is claimed or granted by this approval

### Gate 2 — Staging target approval

Required before any staging network or database mutation.

Approval must identify:

- target alias and project-reference fingerprint;
- target owner;
- proof it is non-production;
- cleanup authority;
- production denylist comparison; and
- approved execution window.

### Gate 3 — Migration execution approval

Required after read-only target/history verification and before migration application.

Approval must identify:

- exact commit and migration SHA-256;
- exact target fingerprint;
- expected pre-migration history;
- proof that the complete pending-migration allowlist contains only `20260719000000_scientific_persistence_records.sql`;
- migration executor;
- containment plan; and
- recovery authority.

Target approval alone does not grant migration-execution approval.

### Gate 4 — Security review

Required after RLS, lineage, permission, transport, and kill-switch evidence exists.

The reviewer shall assess:

- JWT-to-`auth.uid()` ownership flow;
- function privilege and RLS behavior;
- user isolation;
- owner-spoof prevention;
- direct update/delete denial;
- cross-owner lineage failure;
- credential and evidence sanitization;
- kill-switch effectiveness; and
- remaining security limitations.

### Gate 5 — VES review

Required before technical closure.

The review shall use only the final repository state and final external evidence. Missing evidence is not PASS. Approval shall not be invented.

At minimum, VES-01, VES-02, VES-03, VES-04, VES-07, VES-08, and VES-09 require explicit outcomes. VES-05 and VES-06 may be marked not applicable only with written reasons because no AI or UI change is authorized.

### Gate 6 — Production remains unauthorized

No Phase 8.0D result authorizes:

- production migration;
- production smoke testing;
- application integration;
- a feature flag;
- adapter registration;
- release;
- production activation; or
- production-readiness claims.

Those actions require later specifications and explicit authority.

---

## 14. Risks and Limitations

### 14.1 Real staging differs from embedded PostgreSQL

Supabase Auth, PostgREST schema discovery, JWT propagation, hosted role configuration, network behavior, and platform-managed PostgreSQL settings may differ from the embedded Phase 8.0C evidence environment. This difference is the principal reason for Phase 8.0D.

### 14.2 Auth and PostgREST transport

A valid database design can still fail through session restoration, token expiry, project mismatch, RPC discovery, signature exposure, or transport response shape. Phase 8.0D validates these boundaries only in staging.

### 14.3 Accidental project targeting

Tracked Supabase CLI link metadata creates a material risk of implicit target selection. The isolated external workspace and explicit target comparison are mandatory controls. Failure to establish the target stops the phase before migration.

### 14.4 No idempotency

The existing RPC appends one new UUID row per successful call and has no durable duplicate guard. Tests shall not automatically retry unknown outcomes. Phase 8.0D shall document this limitation but shall not harden it.

Idempotency and duplicate prevention belong to a later phase before application integration.

### 14.5 No application consumer

No standardized scientific evaluator or application path currently invokes the Phase 8.0C composition. Staging fixtures prove transport and storage behavior, not application integration.

Application integration belongs to a later phase after a separately approved scientific adapter and evaluation completion point exist.

### 14.6 No monitoring or telemetry implementation

Phase 8.0D captures manual/test evidence but does not create operational monitoring, sanitized telemetry, alerts, dashboards, or incident automation. These remain activation blockers.

### 14.7 No production privacy lifecycle

Retention, user deletion, export, backup deletion, anonymous-user policy, privacy notices, encryption decisions, and incident response are not implemented or validated. Synthetic staging cleanup is not evidence of a production privacy lifecycle.

### 14.8 No production migration evidence

Staging success does not prove production schema compatibility, load behavior, operational ownership, deployment approval, or rollback readiness. Production remains untouched and unauthorized.

### 14.9 Cleanup risk

The persistence table intentionally denies application-role deletion. Cleanup therefore requires disposal of the isolated environment or a narrowly authorized privileged deletion of exact synthetic records. Ambiguous cleanup targets stop cleanup and leave the RPC disabled pending owner direction.

### 14.10 Evidence sensitivity

Even synthetic validation can expose project identifiers, credentials, JWTs, database errors, or payload structure if evidence is captured carelessly. Evidence must be minimized and sanitized before entering the repository.

---

## 15. VES Review Requirements

### 15.1 VES-01 Architecture Integrity

Evidence shall prove:

- Phase 8.0A, Phase 8.0B, and Phase 8.0C dependency direction is unchanged;
- only authorized validation files changed;
- no application consumer exists;
- no production path imports the runtime composition;
- no new public contract exists; and
- the staging tests remain removable without affecting runtime behavior.

### 15.2 VES-02 Scientific Integrity

Evidence shall prove:

- Scientific Baseline identity is unchanged;
- no scientific-domain file changed;
- approved serializers are used unchanged;
- exact blocked, audit, provenance, version, null, and empty states survive staging storage; and
- no scientific result is calculated, interpreted, normalized, upgraded, downgraded, or invented.

### 15.3 VES-03 Engineering Quality

Evidence shall include:

- guarded focused staging tests;
- expected success and failure cases;
- stable assertions based on response shape, SQLSTATE, privileges, and row counts;
- secret and payload logging audit;
- focused regression results;
- full repository test result;
- strict TypeScript result;
- configured lint/build results or accurate limitations; and
- final repository audits.

### 15.4 VES-04 Production Safety

Evidence shall prove:

- the target was staging;
- production was never accessed;
- the migration was unchanged;
- runtime composition remained inactive;
- no production flag or configuration was added;
- RPC revocation works;
- final staging containment is explicit; and
- production activation remains blocked.

### 15.5 VES-05 AI Governance

Expected applicability: not applicable because Phase 8.0D changes no AI module, prompt, tool, read model, or data flow. The final review must state this reason rather than silently omitting the gate.

### 15.6 VES-06 Product Experience

Expected applicability: not applicable because Phase 8.0D changes no UI, copy, accessibility behavior, entitlement, navigation, or user-visible persistence state. The final review must state this reason.

### 15.7 VES-07 Release Readiness

Production release readiness is expected to remain blocked. The evidence shall not convert staging success into release approval.

### 15.8 VES-08 Scalability and Extensibility

Evidence shall confirm the staging validation remains domain neutral and introduces no domain-specific projection, parent score, composite, or storage/read abstraction.

### 15.9 VES-09 Data Governance and Provenance

Evidence shall prove exact request/result preservation, database identity/time, authenticated ownership, owner isolation, lineage behavior, append-only application access, and synthetic cleanup. It shall also record retention, deletion, export, backup, and privacy lifecycle as unresolved production blockers.

---

## 16. Closure Criteria

Phase 8.0D may receive technical closure only when all statements below are true:

- [ ] The approved staging target was explicitly and independently identified.
- [ ] The target was proven different from production.
- [ ] No production data, users, traffic, credentials, or project were used.
- [ ] Migration history was verified before and after application.
- [ ] The exact existing Phase 8.0C migration was applied once.
- [ ] The Phase 8.0C migration remained byte-for-byte unchanged.
- [ ] Real Supabase Auth sessions were validated for two synthetic users.
- [ ] Authenticated JWT transport to PostgREST was validated.
- [ ] Missing-JWT and anon-session calls were refused.
- [ ] PostgREST discovered and invoked the exact RPC.
- [ ] Owner identity was derived from authenticated database context.
- [ ] Owner spoofing through RPC input was impossible.
- [ ] Database-generated UUID and timestamp behavior passed.
- [ ] Second-user ownership isolation passed.
- [ ] Same-owner lineage succeeded.
- [ ] Cross-owner lineage failed without inserting a row.
- [ ] Direct application-role update was denied.
- [ ] Direct application-role delete was denied.
- [ ] Response-shape validation passed.
- [ ] Exact request serialization round trip passed.
- [ ] Exact result serialization round trip passed.
- [ ] Blocked outputs, audit, provenance, versions, nulls, and empty arrays were preserved.
- [ ] RPC execute revocation blocked authenticated invocation.
- [ ] Exact execute restoration was proven.
- [ ] `EXECUTE` on the exact RPC signature was revoked from `authenticated` as the final staging state.
- [ ] Repeatability was proven through one exact mode in Section 7.12 without rerunning the migration against the same database.
- [ ] Synthetic staging data/users were removed or the disposable project was destroyed.
- [ ] Temporary credentials, sessions, and execution workspace were destroyed.
- [ ] Phase 8.0A behavior and contracts remained unchanged.
- [ ] Phase 8.0B public contracts remained unchanged.
- [ ] Phase 8.0C production implementation remained unchanged.
- [ ] Phase 8.0C runtime composition remained inactive in application runtime.
- [ ] `activationRegistry` remained unchanged.
- [ ] No application integration or idempotency work was introduced.
- [ ] Required focused, regression, full-suite, and TypeScript evidence was recorded.
- [ ] Security review was recorded.
- [ ] VES review was recorded without invented approval.
- [ ] Final repository state was accurately reported.
- [ ] Reviewer approval was obtained or explicitly remains pending.
- [ ] Production migration, release, and activation remain blocked.

Failure of any required validation case prevents successful technical closure. The closure record shall identify the failed case, containment state, cleanup result, owner, and required next decision.

---

## 17. Deferred Later Phases

The following work is explicitly deferred and remains necessary before any production proposal:

- durable idempotency and duplicate prevention;
- retry and unknown-outcome handling;
- application scientific-evaluation integration;
- a controlled persistence sidecar;
- scientific adapter approval and registration;
- staging/production activation governance;
- monitoring and sanitized telemetry;
- operational alerting and incident response;
- retention policy and enforcement;
- user deletion lifecycle;
- export and portability;
- backup and derived-data deletion;
- anonymous Auth user policy;
- privacy and security approval;
- production migration planning;
- minimum application-version policy;
- production kill-switch ownership;
- release approval; and
- production activation approval.

Successful Phase 8.0D validation makes none of these items optional.

---

## 18. Required Completion Report

The Phase 8.0D completion report shall state:

- implementation-start and reviewed commit SHAs;
- branch and repository state;
- files created and modified;
- exact migration hash before and after;
- staging target verification result;
- confirmation that no production project was touched;
- migration-history results;
- Auth/JWT/PostgREST/RPC results;
- RLS and ownership results;
- same-owner and cross-owner lineage results;
- database identity/time results;
- serialization round-trip results;
- update/delete denial results;
- kill-switch and final containment results;
- cleanup results;
- focused, regression, full-suite, TypeScript, lint, and build results;
- scientific impact;
- public-contract impact;
- application/runtime activation state;
- security-review outcome;
- VES outcomes and approval status;
- unresolved risks and limitations;
- deferred later-phase work; and
- recommended next action.

The report shall not claim production readiness, release readiness, VES PASS, deployment approval, or activation approval without the exact required evidence and named authority.

---

## 19. Final Implementation Boundary

The complete Phase 8.0D implementation boundary is:

> In one explicitly approved, isolated Supabase staging environment, apply the existing Phase 8.0C migration unchanged; validate real Auth sessions, authenticated JWT transport, PostgREST RPC behavior, executable RLS ownership isolation, same-owner and cross-owner lineage, database-generated persistence identity and time, exact request/result serialization preservation, direct update/delete denial, and RPC execute revocation/restoration; capture sanitized evidence; clean up and leave staging contained; modify only the six authorized Phase 8.0D files; keep Phase 8.0C inactive; and touch no production environment.

**Specification status:** Approved — Sprint 0 Authorized.

Gate 1 authorizes Sprint 0 only. Sprint 1 and every later sprint remain unauthorized. Migration execution requires later, separate Gate 2 and Gate 3 approvals after staging target and migration history have been verified. Production remains unauthorized.
