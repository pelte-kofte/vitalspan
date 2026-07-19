# Vitalspan Engineering Standard

**Version:** VES 1.0.0

**Status:** Active for all new phases and material changes.

**Applies from:** 2026-07-19

## 1. Purpose

The Vitalspan Engineering Standard (VES) is the repository's enforceable engineering constitution. It defines the minimum evidence, review, safety, and release requirements for changing a health platform whose scientific outputs can affect user understanding and decisions.

VES exists to keep scientific authority, engineering integration, product presentation, and AI explanation separate and auditable. Delivery speed, convenience, or feature pressure does not override a failed gate.

## 2. Scope

VES applies to contributors, coding agents, reviewers, and release owners working on:

- application and domain architecture;
- scientific specifications, implementations, registries, fixtures, and tests;
- ingestion, storage, migrations, provenance, and historical data;
- production contracts, services, APIs, feature flags, and activation;
- UI, accessibility, localization, entitlement, and product experience;
- Advisor and AI data flows, prompts, explanations, and safeguards;
- security, privacy, telemetry, monitoring, builds, and releases; and
- documentation that governs behavior or release decisions.

Every material change must be classified under Section 5 and assessed against all VES gates. A gate may be marked not applicable only with a written reason in the gate report. Editorial changes may use a proportionate review, but they remain subject to accuracy, link, diff, and repository-state checks.

VES does not replace a phase's scientific specification, the Scientific Baseline, clinical review, privacy obligations, security requirements, or store policies. The stricter applicable rule controls.

## 3. Core Principles

1. Science is the single source of truth for scientific decisions.
2. Engineering may integrate science but may not redefine it.
3. AI may explain scientific output but may not calculate, override, reinterpret, upgrade, downgrade, or invent it.
4. Every scientific decision must be deterministic, reproducible, versioned, and auditable.
5. Unknown is preferable to an unsupported conclusion.
6. Fail closed rather than guess.
7. Every behavioral scientific change requires an explicit version increment and regression evidence.
8. Production features must preserve provenance and audit metadata.
9. Backward compatibility is the default.
10. User trust is more important than feature count or release speed.

These principles are acceptance criteria. A change that violates one cannot receive PASS or PASS WITH RECOMMENDATIONS.

## 4. Definitions

**Scientific Platform:** Independently governed scientific domains, policies, registries, calculations, validations, references, reason codes, confidence logic, safety candidates, trend rules, and audit outputs.

**Scientific decision:** Any calculation, eligibility result, status, classification, interpretation, confidence assignment, block, warning, safety candidate, trend-comparability decision, reference match, diagnosis, prognosis, or treatment-relevant conclusion.

**Scientific Baseline:** The versioned manifest and evidence that freeze approved scientific state for regression and change control.

**Production Platform:** The engineering layer that requests, transports, validates, serializes, stores, and exposes authoritative scientific outputs without redefining them.

**Presentation:** UI formatting and display of already-authorized outputs. Presentation has no scientific authority.

**Advisor / AI:** A language layer that may explain authorized read models but has no authority to calculate or decide science.

**Material change:** A change capable of affecting behavior, architecture, scientific meaning, stored data, privacy, security, production activation, user comprehension, release risk, or operational support.

**Behavioral scientific change:** Any change that can alter a scientific input decision, output value, availability, status, interpretation, confidence, reason, warning, block, safety result, trend result, or audit record.

**Fail closed:** Return an explicit unavailable, unsupported, invalid, or blocked outcome when required evidence or authority is absent; never infer, impute, guess, or silently fall back.

**Provenance:** Source identity, ingestion method, verification status, original and canonical values and units, timestamps, method or device metadata, versions, and correction history required to reproduce an output.

**Activation:** Explicit authorization that makes a production path available. Code presence, a default flag, or a successful test is not activation.

**Gate report:** The evidence-backed VES decision recorded after implementation and validation and before progression to commit or the next phase.

## 5. Change Classification

Every change proposal must declare exactly one primary classification and all affected domains and layers.

| Classification | Definition | Required tests | Versioning | Required approval | Baseline impact | Release notes |
|---|---|---|---|---|---|---|
| Editorial | Wording or documentation only; no contract, data, runtime, or scientific behavior change | Link/structure checks, diff/whitespace checks; focused tests if governed identifiers or executable examples are touched | No runtime or scientific increment; document version when governance meaning changes | Document or code owner; scientific owner if scientific meaning could change | None unless baseline documentation itself changes | Required when user-facing, governance-significant, or release-relevant |
| Non-behavioral implementation | Refactor, test, type, build, or infrastructure change proven not to alter behavior | Focused tests, affected regressions, full suite, TypeScript, applicable lint/build/audits | Implementation or contract version only when the governed artifact requires it; no scientific version increment | Engineering reviewer; scientific reviewer when the scientific execution path is touched | Baseline must remain byte-for-byte or semantically verified unchanged | Required for operationally relevant changes |
| Backward-compatible behavioral | Adds behavior while preserving supported contracts, historical meaning, and existing consumers | New focused coverage, compatibility tests, affected scientific regressions, full suite, TypeScript, build and applicable integration tests | Increment the affected product/contract/policy version; increment scientific components when scientific behavior changes | Engineering owner and affected domain/product owners; scientific owner for scientific behavior | New approved baseline or addendum required for any scientific behavior change | Required |
| Breaking behavioral | Removes or changes supported behavior, schema, contract, scientific meaning, or compatibility | Migration and rollback tests, old/new compatibility evidence, all affected regressions, full suite, TypeScript, release build and end-to-end validation | Breaking version increment for every affected contract; scientific and registry increments where applicable | Explicit engineering, product, release, and affected scientific/security/privacy approval | New Scientific Baseline required when science is affected | Required with migration and rollback detail |
| Emergency correction | Time-critical correction for material scientific, safety, security, privacy, legal, data-integrity, or release harm | Smallest safe focused proof before release; full required regression as soon as operationally possible | Emergency implementation/policy/scientific increment appropriate to impact; never reuse the compromised identity | Incident authority plus affected owner; retrospective approval required | Audit note and replacement baseline required when frozen science changes | Required immediately, including incident and follow-up |

If the classification is uncertain, use the higher-risk classification until review resolves it. A change described as editorial or non-behavioral must include evidence that behavior is unchanged.

## 6. Phase Completion Workflow

The mandatory workflow is:

```text
Implementation
→ Focused Validation
→ Full Regression
→ VES Review
→ Rework if required
→ Commit
→ Tag when applicable
→ Next Phase
```

The VES review must assess the final diff and final test evidence, not an earlier intermediate state. REWORK REQUIRED returns the phase to implementation. BLOCKED stops progression until the blocking condition is resolved through authorized work.

No agent or contributor may commit, tag, push, activate, migrate production data, or begin the next phase merely because implementation is complete.

## 7. VES Gate Outcomes

Every gate and the overall review must use exactly one of four outcomes:

**PASS:** No material issue. Phase may proceed.

**PASS WITH RECOMMENDATIONS:** No blocking defect. Recommendations must be documented and assigned or explicitly deferred with owner, rationale, and review point.

**REWORK REQUIRED:** Correctable issues exist. The next phase must not begin until rework and re-review are completed.

**BLOCKED:** A scientific, architectural, safety, legal, privacy, or release-critical issue prevents progression.

An overall outcome cannot be better than the most severe applicable gate outcome. Missing required evidence produces REWORK REQUIRED; an unavailable external approval or unresolved critical constraint produces BLOCKED.

## 8. VES-01 Architecture Integrity

**Objective:** Preserve clear ownership, dependency direction, isolation, and replaceability.

The review must verify:

- domain boundaries and ownership are explicit;
- dependencies point from consumers to public contracts, not internal implementations;
- no circular dependencies are introduced;
- public APIs are minimal, stable, and distinguished from internal APIs;
- abstractions and generic layers are necessary for current requirements;
- coupling and duplication are proportionate and documented;
- UI and science remain separated;
- production integration and science remain separated;
- repository naming, placement, and import conventions are followed;
- rollback impact and compatibility boundaries are understood;
- future-domain compatibility is preserved;
- unrelated domains can remain unchanged;
- adapters isolate domain-specific mapping from domain-neutral orchestration; and
- hard-coded cross-domain assumptions, parent scores, and silent fallbacks are absent unless separately governed.

Required evidence includes a dependency or boundary explanation, affected public contracts, import/isolation audit, circular-dependency result when tooling exists, compatibility analysis, and rollback impact. Architecture review is mandatory before new shared layers, storage schemas, cross-domain orchestration, or production activation.

## 9. VES-02 Scientific Integrity

**Objective:** Prove that scientific authority and frozen behavior remain intact.

The review must verify:

- compatibility with Scientific Baseline v1.0 or its approved successor;
- deterministic and reproducible behavior;
- fail-closed handling of missing evidence, context, provenance, protocol, assay, or authority;
- scientific, policy, registry, coefficient, reference, and contract version integrity;
- threshold, reference, diagnostic, treatment-target, and population-range concepts remain distinct;
- scientific domains remain isolated and independently governed;
- the audit chain and original inputs are preserved;
- reason-code meaning and ordering remain stable where governed;
- blocked outputs survive integration, serialization, storage, and presentation;
- no silent fallback, imputation, inference, or consumer-side reinterpretation exists;
- association is not presented as causation or population evidence as personal prediction; and
- focused fixtures and complete affected scientific regressions pass.

Any changed scientific output requires a declared behavioral scientific change, appropriate version increments, regression evidence, scientific-owner approval, and baseline action. Engineering tests alone cannot approve science.

## 10. VES-03 Engineering Quality

**Objective:** Establish correctness, maintainability, and operational quality proportionate to risk.

The review must verify:

- strict TypeScript passes;
- configured linting and formatting checks pass;
- focused tests cover success, failure, boundary, and regression cases;
- relevant domain regressions and the full repository suite pass;
- input, contract, schema, and serialization validation fails clearly;
- errors are handled without silent data loss or unsafe fallback;
- naming reflects repository and domain language;
- code remains readable, maintainable, and appropriately documented;
- duplication and unnecessary abstraction are avoided;
- performance and memory risks are measured or bounded;
- logging is useful, privacy-safe, and free of secrets or health payloads;
- deterministic serialization and historical compatibility are tested where relevant;
- documentation matches implemented behavior; and
- git diff, untracked-file, whitespace, final-newline, and repository-isolation checks are clean.

If a configured check cannot run, the gate report must state why, the risk, and the substitute evidence. “Not run” is not equivalent to PASS.

## 11. VES-04 Production Safety

**Objective:** Ensure production changes are explicit, reversible, observable, compatible, and privacy-safe.

The review must verify:

- new domains and material paths are inactive by default;
- feature flags are explicit, default-off where required, and cannot auto-activate;
- rollback is documented and does not corrupt or reinterpret stored scientific data;
- backward compatibility is preserved or governed as breaking;
- migrations are reviewed, idempotent or safely repeatable where applicable, and recoverable;
- partial failures return safe states and preserve authoritative blocks;
- telemetry and monitoring are proportionate, privacy-safe, and validated;
- crash behavior and recovery paths are tested;
- privacy boundaries and least-data flows are respected;
- minimum application-version compatibility is explicit before activation;
- production approval and activation authority are recorded; and
- inactive safety policies cannot produce production actions.

No production activation may be inferred from merged code, environment availability, feature-flag existence, or a passing suite. Activation requires explicit instruction and approval evidence.

## 12. VES-05 AI Governance

**Objective:** Keep AI a language capability rather than a scientific authority.

AI is prohibited from:

- performing scientific calculations;
- creating diagnoses;
- generating treatment targets;
- changing scientific statuses;
- changing confidence;
- filling missing scientific context;
- inventing evidence or references;
- overriding, hiding, weakening, or bypassing blocked outputs; and
- generating individual event-risk or lifespan predictions unless a future governed scientific domain explicitly authorizes that exact output.

AI may only explain, summarize, translate, simplify, organize, and communicate already-authorized scientific output. AI-facing data must come from governed, versioned read models rather than internal scientific registries or raw implementation objects.

The review must verify prompt and tool boundaries, read-model provenance, block propagation, refusal/failure behavior, output traceability, privacy minimization, injection resistance where relevant, and tests proving AI cannot upgrade authority. AI output must disclose limitations without introducing a new scientific interpretation.

## 13. VES-06 Product Experience

**Objective:** Present product and scientific states clearly, accessibly, and without deceptive certainty.

The review must verify:

- target users can understand the state, source, uncertainty, and next safe action;
- accessibility semantics, contrast, text scaling, motion, focus, and touch targets are appropriate;
- empty, loading, error, partial, unavailable, and offline states are deliberate;
- localization does not change scientific meaning;
- premium entitlement states fail safely and do not misrepresent access;
- privacy wording matches actual collection, storage, and sharing;
- scientific limitations and provenance are available where required;
- color, icons, rankings, and traffic-light patterns do not invent unsupported status;
- UI does not reinterpret or calculate science; and
- blocked or unknown outputs are not hidden behind optimistic presentation.

User-facing copy with medical, scientific, privacy, subscription, or safety implications requires domain-appropriate review.

## 14. VES-07 Release Readiness

**Objective:** Prove the approved change can be released, observed, and reversed safely.

The review must verify:

- all applicable VES gates have final outcomes and evidence;
- the intended release commit has a clean working tree;
- migrations are approved and ordered;
- focused, regression, and full repository tests pass;
- TypeScript and configured linting pass;
- the release build succeeds on applicable platforms;
- crash reporting, telemetry, analytics, and privacy consent behavior are verified;
- a tested or credible rollback plan exists;
- release notes describe behavior, compatibility, migration, science, and known limitations;
- App Store and Play Store requirements are satisfied where applicable;
- scientific baseline identity and domain activation states match the release; and
- tags, manifests, and app versions point to the intended commit.

Prepared-but-uncommitted or unpushed governance artifacts cannot support a release tag. Release approval must identify the exact commit and artifacts reviewed.

## 15. VES-08 Scalability and Extensibility

**Objective:** Allow new scientific and product capabilities without destabilizing existing domains.

Recovery, Frailty, Kidney Health, Liver Health, Sleep, Nutrition, Hormonal Health, and other future domains must be addable without modifying unrelated scientific domains.

The review must verify:

- production contracts can represent the new domain without weakening existing guarantees;
- registries remain independently versioned and extensible;
- domain adapters remain isolated;
- storage can preserve new domain snapshots without cross-domain mutation;
- migrations have bounded domain ownership;
- presentation can add domain-specific views through domain-neutral orchestration;
- orchestration contains no scientific decision logic; and
- no hard-coded ordering, score, ranking, shared threshold, or cross-domain assumption is introduced.

Extensibility does not justify speculative frameworks. Add an extension point only when a concrete governed consumer requires it and its compatibility behavior can be tested.

## 16. VES-09 Data Governance and Provenance

**Objective:** Preserve the evidence required to understand and reproduce every scientific result.

The review must verify:

- scientific snapshots are immutable or append-safe;
- source identity and ingestion method are retained;
- verification status is explicit;
- original values and units are retained;
- canonical values and units are retained when scientifically authorized;
- measurement, ingestion, evaluation, revision, and storage timestamps are explicit;
- scientific, registry, contract, and policy versions are stored with the result;
- corrections append history or explicitly supersede prior records;
- provenance completeness is represented, not inferred;
- audit reproduction is possible from retained inputs, versions, and fingerprints;
- privacy, access, retention, export, and deletion boundaries are defined;
- deletion behavior covers local, cloud, cache, backup, telemetry, and derived records as applicable; and
- historical scientific results are never silently mutated or recomputed under a newer version.

Storage optimizations may not discard authoritative blocks, limitations, audit metadata, source context, or historical version identity. Firestore and Supabase access must minimize queries, payloads, and write amplification without weakening provenance.

## 17. Required Evidence

A material phase cannot pass on narrative assurance alone. Its gate report must link or identify:

- the approved request, scope, assumptions, and change classification;
- repository status before and after work;
- files added, modified, deleted, and intentionally untouched;
- relevant baseline, phase, contract, registry, and policy versions;
- architecture boundary and dependency evidence;
- focused-test commands and exact results;
- affected scientific regression commands and exact results;
- full repository test, TypeScript, lint, build, and audit results as applicable;
- serialization, migration, rollback, failure, and compatibility evidence where relevant;
- security, privacy, provenance, AI, and product-experience review evidence where applicable;
- git diff, whitespace, final-newline, link, and isolation results;
- unresolved findings, owners, due points, and explicit deferrals;
- activation state and production-reference audit; and
- reviewer identity, outcome, and approval status without invented approval.

Evidence must identify the commit or working-tree state reviewed. Results from before the final material edit must be rerun or explicitly justified.

## 18. Architecture Review Gate Procedure

1. **Declare scope.** Identify the phase, classification, affected domains and layers, public contracts, stored data, and activation impact.
2. **Read governing artifacts.** Read this VES, the Scientific Baseline for scientific work, relevant phase documents, and affected module guidance.
3. **Map boundaries.** Record ownership, dependency direction, public/internal APIs, data flow, failure states, and rollback boundary.
4. **Inspect repository state.** Record branch, commit, modified and untracked files, and unrelated user work to preserve.
5. **Implement narrowly.** Prefer the smallest isolated change that meets the approved scope.
6. **Validate.** Run focused validation, scientific regressions when relevant, full regression, TypeScript, configured lint/build, and repository audits.
7. **Review every VES gate.** Assign applicability, evidence, findings, and one of the four outcomes.
8. **Resolve or record findings.** Rework blocking defects. Assign or explicitly defer non-blocking recommendations.
9. **Issue the overall outcome.** The final outcome follows the most severe applicable gate.
10. **Authorize progression.** Commit, tag, activation, migration, or the next phase occurs only after the required human authority explicitly approves it.

The implementer may prepare the gate report but may not fabricate independent review or approval.

## 19. Exception and Waiver Policy

Exceptions are exceptional, written, narrow, time-bound, and approved before progression. A waiver must state:

- the exact rule and scope;
- why compliance is currently impossible or creates greater risk;
- affected users, domains, data, and releases;
- compensating controls and validation;
- owner, approver, expiry, and review date;
- rollback or containment plan; and
- the issue or phase that will remove the waiver.

Waivers cannot authorize fabricated evidence, silent scientific changes, unsupported diagnosis or treatment, secret exposure, privacy-law violations, hidden data loss, automatic scientific activation, or a false PASS. An expired waiver produces REWORK REQUIRED or BLOCKED until resolved.

## 20. Emergency Change Policy

Emergency changes are limited to containing or correcting active scientific, safety, security, privacy, legal, data-integrity, or release-critical harm.

The change must:

1. identify the incident, severity, scope, and decision authority;
2. choose the smallest reversible correction;
3. preserve evidence and current production state before mutation;
4. run the safest available focused validation before release;
5. keep activation disabled unless activation itself is the approved containment;
6. record versions, commit, deployment, monitoring, and rollback;
7. publish required release or incident notes; and
8. complete full regression, VES review, root-cause analysis, missing tests, and baseline replacement as soon as operationally possible.

Emergency status may shorten sequence but does not waive scientific auditability, privacy, security, or retrospective evidence. Emergency scientific corrections require a new scientific identity, an audit note, regression evidence, and an updated baseline; old results must remain traceable.

## 21. Versioning Policy

VES uses semantic versioning:

- **Patch:** Clarification with no changed requirement.
- **Minor:** New backward-compatible requirement, gate evidence, or procedure.
- **Major:** Removed, weakened, or breaking governance requirement.

Scientific and production components version independently. Behavioral scientific changes increment every affected scientific policy, registry, reference, coefficient, or interpretation identity required by its governance. Contract and schema changes increment their contract versions. Coefficient or reference-data changes require new fingerprints where applicable.

Versions are immutable once released. A corrected artifact receives a new version; it is not silently replaced. Baseline manifests identify exact component versions and commit state. Historical snapshots retain the versions under which they were produced.

## 22. Ownership and Approval

Approval is role-based and must be recorded for the specific change:

- **Engineering owner:** architecture, implementation, tests, operability, and rollback.
- **Scientific owner:** scientific meaning, evidence, policies, registries, and behavioral scientific changes.
- **Product owner:** user scope, entitlement, copy intent, and experience acceptance.
- **Security/privacy owner:** secrets, access, health data, retention, deletion, telemetry, and incident controls.
- **Release owner:** build, migration, monitoring, store, rollout, rollback, and activation readiness.

One person may hold multiple roles, but the report must say so. High-risk or breaking scientific changes should receive independent review when feasible. Repository write access does not imply scientific, production, release, or waiver authority.

This VES document records no approval of a particular phase, release, activation, or scientific change.

## 23. Required Repository Artifacts

The repository must maintain, as applicable:

- this Vitalspan Engineering Standard;
- root AGENTS.md operational instructions;
- the active Scientific Baseline manifest, document, tests, and tag record;
- phase specifications and evidence reviews;
- public scientific production contracts and activation metadata;
- independently versioned scientific registries and policies;
- focused fixtures and regression tests;
- migration, rollback, and data-retention documentation;
- environment-variable examples without secrets;
- release notes and gate reports for material releases; and
- ownership or approval records appropriate to the change.

Artifacts must use stable paths or documented successors. Generated output is not a substitute for reviewed source documentation.

## 24. Gate Report Template

Use this template without pre-filling approvals:

### VES Gate Report

- **Phase:**
- **Date:**
- **Reviewer:**
- **Commit SHA:**
- **Files reviewed:**
- **Scope:**
- **Change classification:**
- **Applicable VES gates:**
- **Evidence reviewed:**
- **Findings:**
- **Blocking issues:**
- **Recommendations:**
- **Deferred items and owners:**
- **Regression results:**
- **TypeScript result:**
- **Governance result:**
- **Production-reference result:**
- **Git diff result:**
- **Final outcome:** PASS | PASS WITH RECOMMENDATIONS | REWORK REQUIRED | BLOCKED
- **Approval:**

For each applicable gate, record its outcome, evidence, findings, and required follow-up. “Approval” must name actual authority or state pending/not obtained.

## 25. Final Compliance Checklist

Before declaring a material phase complete, confirm:

- [ ] Scope, assumptions, affected domains, and change classification are recorded.
- [ ] This VES, the relevant phase documents, and the Scientific Baseline were read where applicable.
- [ ] Architecture, dependency direction, public/internal APIs, data flow, and rollback were reviewed.
- [ ] Scientific behavior is unchanged or explicitly versioned, approved, and regression-tested.
- [ ] Unknown, missing, unsupported, and blocked states fail closed without fallback.
- [ ] Provenance, audit metadata, reason codes, blocks, versions, and historical identity are preserved.
- [ ] UI, production, storage, Advisor, and AI do not redefine scientific output.
- [ ] Security, privacy, secrets, retention, and deletion behavior were reviewed.
- [ ] Focused tests and relevant scientific regressions pass.
- [ ] Full repository tests and TypeScript pass.
- [ ] Configured lint, build, serialization, migration, telemetry, and release checks pass where applicable.
- [ ] Accessibility, error states, offline states, localization, entitlement, and scientific limitations were reviewed where applicable.
- [ ] Feature flags, app-version compatibility, production activation, and rollback states are explicit.
- [ ] Git status, diff, untracked files, whitespace, final newlines, links, and isolation were audited.
- [ ] Findings are resolved, assigned, or explicitly deferred under an allowed outcome.
- [ ] Every applicable gate and the overall review use one of the four VES outcomes.
- [ ] No approval, certification, test result, or repository state is overstated.
- [ ] Commit, push, tag, migration, release, activation, and next-phase actions have explicit authority.
