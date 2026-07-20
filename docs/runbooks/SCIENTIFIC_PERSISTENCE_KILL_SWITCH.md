# Scientific Persistence RPC Kill-Switch Runbook

## 1. Status and Purpose

- Phase: 8.0D — Real Supabase Staging Validation
- Document role: Staging RPC containment, controlled restoration, and final-disable procedure
- Current authorization: Sprint 0 documentation only
- Kill-switch execution: Not authorized by Sprint 0
- Staging mutation: Not authorized by Sprint 0
- Production privilege inspection or mutation: Prohibited
- Production activation: Not authorized

This runbook governs only the Phase 8.0C staging insertion RPC. It does not authorize connection, privilege changes, RPC calls, migration execution, cleanup, deployment, or production access. Those actions require the exact later-sprint authority and approvals in the Phase 8.0D specification.

No executable SQL is authored in Sprint 0. The later authorized database operator must have each exact privilege statement independently reviewed against the immutable function identity in Section 3 before execution.

## 2. Preconditions

Do not inspect or alter privileges unless all of the following are true:

- Gate 1 remains valid;
- Gate 2 identifies the exact staging target and fingerprint;
- Gate 3 identifies the same target, commit, migration hash, executor, containment plan, and recovery authority;
- the current execution window is approved;
- the staging-validation runbook identity and production-denylist checks pass again immediately before connection;
- the migration is recorded exactly once and no additional migration was applied;
- the deployed RPC identity and ownership match the unchanged migration;
- `AUTHORIZED_DATABASE_OPERATOR`, `SECURITY_REVIEWER`, and `EVIDENCE_REVIEWER` are named;
- User A and User B are synthetic staging-only identities;
- exact before/after row-count evidence can be obtained without payload disclosure; and
- cleanup authority is still available.

A stale prior verification is insufficient. Recalculate the target fingerprint and rerun the denylist comparison in the protected session before every privilege mutation.

## 3. Immutable RPC Identity

The only kill-switch target is:

- schema: `public`
- function: `insert_scientific_persistence_record`
- argument-type identity: one `uuid`, followed by seventeen `text` arguments, followed by one `jsonb` argument
- owner expected from the committed migration: `scientific_persistence_writer`
- role whose execute privilege is governed: `authenticated`

The complete argument-type identity must be resolved as one exact PostgreSQL function signature. A name-only target, wildcard, schema-wide privilege, alternate overload, `PUBLIC`, `anon`, writer-role, table, policy, role membership, or production object is outside scope.

The migration SHA-256 anchoring this identity is:

`4dbf80f61c7cbc2adf6e5c9933bbc173944e31c83def36dc140ecf5e0113a354`

If the deployed function is absent, duplicated, overloaded unexpectedly, differently owned, or has a different argument-type identity, stop. Do not guess which object to alter.

## 4. Allowed Privilege Transitions

Only these exact staging transitions are governed:

1. **Disable:** remove `EXECUTE` on the exact RPC signature from `authenticated`.
2. **Verify disabled:** prove authenticated User A and User B calls are denied and insert zero rows.
3. **Controlled restore:** add `EXECUTE` on the same exact RPC signature to `authenticated`, changing no other privilege.
4. **Verify restored:** prove one fresh authenticated synthetic root call succeeds once.
5. **Final containment:** remove `EXECUTE` on the same exact RPC signature from `authenticated` again.
6. **Verify final state:** prove `authenticated` lacks execute privilege, both users are denied, row counts are unchanged, and no bypass exists.

Do not use `GRANT ALL`, `REVOKE ALL`, a schema-wide command, role-membership change, object ownership change, function replacement, migration repair, dashboard toggle, policy change, or table privilege change. Restoration must recreate only the exact pre-drill authenticated execute grant approved by the migration.

## 5. Safe Execution Template

The future operator must use a database client configured to stop on the first error, connected through the protected `PHASE_8_0D_DATABASE_URL`, with the approved staging fingerprint set as the reviewed session marker.

The non-executable operation template is:

```text
<approved database client and version>
  target: <protected PHASE_8_0D_DATABASE_URL>
  session marker: <PHASE_8_0D_STAGING_PROJECT_FINGERPRINT>
  operation: <one independently reviewed exact-signature privilege statement>
  error mode: stop on first error
```

The command transcript must replace the database URL, credentials, raw project reference, and statement parameters with safe labels. It may retain the public function name, exact argument-type identity, target role, action category, exit code, timestamp, operator, and approved fingerprint.

The operator must not paste a privileged statement into the Supabase Dashboard or SQL Editor. The operation must use the approved direct staging database path and must not depend on repository `supabase/.temp/` metadata.

## 6. Pre-Revocation Evidence

Immediately before the drill:

1. Verify the approved target alias and fingerprint from independent sources.
2. Pass the complete production-denylist comparison.
3. Verify the exact function identity, owner, and absence of unexpected overloads.
4. Record the exact current execute privilege for `authenticated` on that signature.
5. Confirm `PUBLIC` and `anon` do not have execute privilege.
6. Confirm application roles have no direct table read, update, or delete path.
7. Invoke one fresh authenticated synthetic call as authorized by Sprint 5 and prove exactly one row is added.
8. Record the before/after correlated synthetic row counts without identifiers or payloads.
9. Confirm the migration file and current repository hash remain unchanged.

If the pre-drill call fails, the grant differs from the committed migration, or an unexpected privilege/overload exists, do not begin the drill. Treat the RPC as untrusted, stop validation, and obtain a containment decision from the named recovery authority.

## 7. Disable Procedure

1. Reconfirm the exact target fingerprint in the database session marker.
2. Have the operator and reviewer compare the proposed privilege statement with Section 3 character by character.
3. Remove execute privilege only from `authenticated` on the exact signature.
4. Stop immediately on a non-zero client status or ambiguous result; do not retry automatically.
5. Re-read the exact privilege state and require execute to be absent.
6. Attempt one fresh correlated RPC call as User A and one as User B.
7. Require both calls to fail in the durable insufficient-privilege category.
8. Require before/after row counts to be unchanged for both denied operations.
9. Confirm PostgREST exposes no alternate overload and neither user has a direct-table bypass.

Expected durable database denial is the insufficient-privilege category, normally SQLSTATE `42501` when surfaced. HTTP or client status may vary by transport. An unexpected success, unexpected SQLSTATE, payload return, or row-count change fails the drill.

## 8. Controlled Restoration Procedure

Restoration is allowed only as the bounded middle step of the approved Sprint 5 drill. It is not a recovery default and may not occur while a security or ownership blocker remains unresolved.

1. Confirm the disabled-state evidence passed and is retained safely.
2. Obtain the specific restoration authorization from the named recovery authority.
3. Reconfirm target fingerprint, exact function identity, target role, and current disabled state.
4. Have operator and reviewer compare the proposed restoration statement with Section 3 character by character.
5. Add execute privilege only to `authenticated` on the exact signature.
6. Re-read the privilege state and prove no additional grantee or privilege changed.
7. Use a new unique synthetic request identity for one authenticated root call.
8. Require one valid response and exactly one new correlated row.
9. Do not retry if the outcome becomes unknown.
10. Proceed immediately to final containment; do not leave the RPC enabled between work sessions.

If restoration changes more than the exact grant, fails ambiguously, creates an alternate path, or the verification call produces an unknown outcome, stop and move to the recovery rules in Section 11.

## 9. Mandatory Final Containment

Final containment is required after the drill, repeatability work, any post-migration blocker, or any early end to Phase 8.0D where the exact RPC exists.

1. Reconfirm the target and exact signature.
2. Remove execute privilege only from `authenticated` on that signature.
3. Re-read privilege state through a separate verification query.
4. Require `authenticated` execute privilege to be absent.
5. Require `PUBLIC` and `anon` execute privilege to remain absent.
6. Require both synthetic authenticated users to be denied.
7. Require correlated row counts to remain unchanged.
8. Confirm there is no alternate overload or direct-table application path.
9. Record the final-disable timestamp, operator, reviewer, target fingerprint, privilege boolean, denial categories, and row-count booleans.

No alternative final state is accepted. A disabled feature flag, stopped application, deleted test user, hidden endpoint, or absent client call does not replace database privilege revocation.

## 10. Evidence Record

For each before, disabled, restored, and final state record:

- approved target alias and fingerprint;
- exact function name and argument-type identity;
- function-owner match boolean;
- unexpected-overload-absent boolean;
- `authenticated` execute privilege boolean;
- `PUBLIC` and `anon` execute privilege booleans;
- action category, never an unredacted credential-bearing command;
- tool and version;
- operator and reviewer;
- start/end timestamps and exit status;
- User A/User B sanitized outcome categories;
- SQLSTATE when safely available;
- before/after correlated row counts;
- bypass-absent result;
- migration hash unchanged result; and
- evidence reference.

Never retain database URLs, passwords, tokens, JWTs, raw subjects, emails, request/result payloads, raw database errors, or production identifiers. Confirm explicitly that production privileges were neither inspected nor changed.

## 11. Stop and Recovery Rules

Stop without automatic retry when:

- target or session-marker identity is missing or disagrees;
- the production denylist is invalid or matches;
- the function identity, owner, or overload set differs;
- the proposed statement targets more than the exact signature and role;
- execution status is non-zero or ambiguous;
- privilege verification disagrees with the intended state;
- revocation does not deny both authenticated users;
- a denied call changes row count;
- a direct table or alternate RPC bypass exists;
- restoration modifies any other privilege;
- a credential, JWT, identifier, or payload appears in output; or
- production may have been contacted.

On an unknown privilege outcome:

1. make no further application-path RPC call;
2. do not repeat the same privilege statement automatically;
3. preserve only sanitized client status and timestamps;
4. ask the named recovery authority to approve a read-only privilege inspection on the exact staging target;
5. if the RPC is proven enabled, approve and perform one exact disable operation;
6. if state cannot be proven, keep the phase blocked and prevent all further use of the target through available non-database operational controls; and
7. record the unresolved state without claiming containment.

Do not change the migration, function definition, owner, role membership, RLS policy, table grants, or application code to make the drill pass.

## 12. Cleanup Boundary

After final containment:

- prefer destruction of the disposable preview project;
- otherwise remove only exact correlated synthetic records through separately approved privileged cleanup;
- remove synthetic Auth users only after dependent records are gone;
- destroy credentials, sessions, and the temporary execution workspace;
- retain application-role update/delete denial;
- verify final RPC disablement again after cleanup; and
- record no-production-contact confirmation.

Ambiguous data scope stops cleanup. The kill switch does not implement retention, user deletion, export, incident response, or a production rollback system.

## 13. Sprint 0 Confirmation

During Sprint 0 this runbook is documentation only. It authorizes none of the following:

- Supabase connection or authentication;
- project or privilege inspection;
- migration execution;
- RPC invocation;
- SQL execution;
- execute revocation or restoration;
- staging or production mutation;
- deployment or activation; or
- Sprint 1 or later work.

Production remains unauthorized before, during, and after Phase 8.0D.
