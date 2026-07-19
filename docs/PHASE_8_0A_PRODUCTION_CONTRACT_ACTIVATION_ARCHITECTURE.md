# Phase 8.0A — Production Contract & Activation Architecture

## 1. Executive Summary

Phase 8.0A defines the versioned, domain-neutral boundary through which the Vitalspan application may consume authoritative scientific outputs. It does not connect any scientific domain to production. It does not change scientific calculation, eligibility, interpretation, confidence, reason, reference, trend, or safety behavior.

The contract is declared for Clinical Biological Age, Cardiorespiratory Fitness, Functional Capacity, and Cardiometabolic Health. All four declarations use the same request, result, audit, serialization, and activation structure. Runtime adapters are intentionally unregistered. Every Phase 8 standardized feature flag is unwired and disabled by default.

Architecture status: **contract ready; production activation blocked**.

## 2. Governing Scientific Baseline

This specification consumes Scientific Baseline v1.0.0 (`scientific-baseline-v1.0.0`) without importing its manifest into runtime production code. The frozen source scientific commit is `7b7b4bea1008a1b31b6d209d55debdfd608719e9` on `main`.

The production contract copies only stable scientific specification version identifiers. This is necessary because the frozen domains enforce module isolation and registry imports would couple the production layer to internal implementation. Focused tests compare each copied version identifier with its authoritative source registry. No scientific constants, thresholds, coefficients, calculations, references, or policies are copied.

## 3. Engineering Boundary

| Layer | Owns | Must not do |
|---|---|---|
| Scientific Platform | Measurement validation, eligibility, calculation, scientific status, interpretation authorization, confidence, reason codes, safety-candidate status, trend comparability, evidence, audit | Delegate scientific decisions to production, presentation, or AI |
| Production Platform | Request transport, immutable result transport, serialization, future caching and persistence, explicit activation governance | Calculate, reinterpret, merge, override, infer context, or discard blocked outputs |
| Presentation | Display of authorized scientific output | Calculate science, alter status, add scientific meaning, or hide a block |
| Advisor | Explanation of supplied scientific output | Create or revise scientific conclusions |
| AI | Language only | Calculate, diagnose, score, predict, override, upgrade, downgrade, or reinterpret |

Production consumers must treat every scientific status and confidence code as opaque. They may route and display it under later authorized policies, but may not translate it into a different scientific conclusion.

## 4. Contract Versions

| Contract component | Version |
|---|---|
| Production port | `scientific-production-contract/1.0.0` |
| Evaluation request | `scientific-evaluation-request/1.0.0` |
| Evaluation result | `scientific-evaluation-result/1.0.0` |
| Production boundary governance | `scientific-production-boundary/1.0.0` |

Changing a field, required invariant, serialization rule, or consumer obligation requires contract governance. A breaking shape or semantic change requires a new major contract version. Contract changes do not authorize scientific changes.

## 5. Production Scientific Contract

`ScientificDomainProductionPort` is the common port every future domain adapter must implement. It exposes only:

- `domainId`
- `contractVersion`
- `domainVersion`
- `evaluate(request)`

The port does not reveal a calculator, registry, coefficient, threshold, policy implementation, or domain-specific internal input type. Phase 8.0A defines the port but registers no implementation.

The domain-neutral types are:

- `ScientificEvaluationRequest`
- `ScientificEvaluationResult`
- `ScientificSnapshot`
- `ScientificObservation`
- `ScientificMeasurement`
- `ScientificStatus`
- `ScientificReason`
- `ScientificWarning`
- `ScientificEvidenceReference`
- `ScientificAuditMetadata`
- `ScientificDomainVersion`
- `ScientificConfidence`
- `ScientificProvenanceSummary`
- `ScientificSafetyCandidate`
- `ScientificTrendStatus`

All properties are read-only at the TypeScript boundary. Deserialized results are recursively frozen. That prevents accidental mutation in the transport layer; it does not replace persistence-level integrity controls required in a later phase.

## 6. Evaluation Request

The request carries a caller-provided request ID and timestamp, one domain identity, an optional requested domain version, observations, explicit context, and an optional prior snapshot. It contains no runtime-generated date and performs no context inference.

The request is transport only. A production caller must not normalize values, derive missing fields, select scientific references, classify provenance, or choose a scientific interpretation. A future domain adapter must translate the neutral observation envelope to the domain's frozen input contract without changing meaning and must fail closed when translation is not lossless and authorized.

## 7. Standardized Authoritative Result

Every result contains exactly these top-level fields:

1. `contractVersion`
2. `requestId`
3. `snapshotId`
4. `domainId`
5. `domainVersion`
6. `evaluatedAt`
7. `status`
8. `measurements`
9. `interpretations`
10. `blockedOutputs`
11. `warnings`
12. `evidence`
13. `auditMetadata`
14. `confidence`
15. `provenanceSummary`
16. `safetyCandidate`
17. `trendStatus`
18. `limitations`

The exact-field validator rejects unexpected top-level presentation properties. Colors, icons, localized strings, display formatting, navigation targets, calls to action, and UI state are outside the contract.

Empty arrays and explicit `null` values are required where a result has no authorized content. Missing fields are invalid. `undefined`, non-finite numbers, class instances, functions, symbols, `bigint`, and circular values are not serializable contract values.

## 8. Status, Confidence, Reasons, and Interpretation

Status and confidence identities are authored by the scientific domain and transported as opaque codes with their registry provenance. The Production Platform is not given an authorization table for upgrading, downgrading, translating, or substituting them.

Interpretations carry their scientific policy ID and version, reason codes, evidence references, and limitations. Production may not create an interpretation when the array is empty. It may not replace a blocked interpretation with generic advice.

Reasons and warnings remain separate. A warning does not erase a block, and a block cannot be reduced to a warning by a consumer.

## 9. Blocked Outputs

`blockedOutputs` is mandatory even when empty. Each entry names an output and preserves the authoritative reasons supplied by the scientific domain. Serialization tests prove blocked outputs survive an encode/decode cycle unchanged.

Production must fail closed if the field is missing, malformed, or cannot be preserved. A blocked output must not be synthesized, approximated, inferred from another domain, or replaced with a fallback.

## 10. Audit Metadata

Audit metadata includes evaluation and evaluator identities, request and result contract versions, the complete domain-version structure, observation IDs, authorized and blocked output IDs, reason codes, optional input/output fingerprints, and an opaque domain audit object.

The production layer validates transport identity consistency but does not inspect the scientific meaning of the domain audit. Audit metadata survives serialization unchanged and is recursively frozen after decoding. A future persistence phase must store it with the result, not reconstruct it later.

## 11. Provenance

Each request observation carries source identity, source-record identity, source type, verification status, provider metadata, original value and unit, and explicit context. Each result carries a provenance summary supplied by the domain.

Production may not infer source verification, fasting status, protocol quality, assay method, medication status, device validation, pregnancy, acute illness, or other missing context. Missing provenance must reach the scientific domain as missing.

## 12. Safety and Trend Boundaries

`safetyCandidate` and `trendStatus` are transport fields, not production decision engines. A safety candidate explicitly has `productionActionAuthorized: false` in Phase 8.0A. This preserves the difference between a scientific candidate and an activated urgent-message policy.

Production may not create escalation copy, diagnose disease, select a treatment action, or infer urgency from raw values. Trend status is likewise domain-authored; production may not calculate change, slope, direction, or comparability.

## 13. Activation Metadata

Each domain declaration exposes:

- `productionActive`
- `featureFlag`
- `minimumSupportedAppVersion`
- `scientificBaselineVersion`
- `activationVersion`

The registry adds `activationStatus`, `automaticActivationPermitted`, and `existingProductionStateAtBaseline` for audit clarity.

For all four Phase 8 standardized contract paths:

- `productionActive` is `false`.
- feature flags default to `false`.
- feature flags are not wired to runtime configuration.
- `minimumSupportedAppVersion` is `null` because no activation compatibility claim has been approved.
- automatic activation is prohibited.
- adapter registration status is `not_registered`.

Clinical PhenoAge is recorded as `active_outside_standard_contract` because the frozen repository already contains its legacy product cutover. This metadata does not deactivate or modify that behavior. The other three domains remain inactive. No declaration silently changes repository production truth.

## 14. Domain Declarations

| Domain ID | Frozen scientific specification | Existing baseline state | Phase 8 contract path |
|---|---|---|---|
| `clinical_biological_age` | `clinical-phenoage/1.0.0` | Active outside standardized contract | Inactive, not wired |
| `cardiorespiratory_fitness` | `vo2max-domain/1.0.0` | Inactive | Inactive, not wired |
| `functional_capacity` | `functional-capacity-domain/1.0.0` | Inactive | Inactive, not wired |
| `cardiometabolic_health` | `Vitalspan-CMH-DOMAIN-1.0.0` | Inactive | Inactive, not wired |

These are independent declarations. The registry has no parent score, cross-domain composite, shared confidence, shared status calculation, ranking, or fallback.

## 15. Serialization and Persistence Boundary

Phase 8.0A supplies strict JSON serialization and deserialization for the result envelope. Before serialization and after deserialization, the structure must pass the exact-field, identity, type, contract-version, domain-ID, and JSON-safety checks.

This phase does not cache or persist results. A later persistence contract must preserve the original serialized payload or equivalent lossless fields, audit metadata, blocks, provenance, versions, timestamps, and fingerprints. It must not rewrite historical snapshots after a scientific or contract version changes.

## 16. Import Boundary

Production code may import the public `scientificProduction` barrel only. It must not import scientific source, confidence, reference, reason, protocol, assay, interpretation, eligibility, safety, or version registries. Domain adapters, when separately authorized, must be isolated at a named boundary and may depend only on public scientific-domain exports approved for integration.

UI modules must not import scientific internals. Presentation must receive the standardized output through a future application service; Phase 8.0A creates no such service.

## 17. Determinism and Failure Policy

The contract contains no runtime clock, environment lookup, network access, persistence access, feature-flag client, UI dependency, or localization dependency. The same valid result object produces the same JSON string. Validation rejects malformed or unexpected data rather than dropping fields or introducing defaults.

The serializer does not reorder, reinterpret, round, normalize, or calculate scientific values. Domain-specific audit metadata remains opaque.

## 18. Tests and Governance Assertions

Focused tests assert:

- exactly four unique domain declarations use the identical contract versions and result fields;
- scientific specification versions match their frozen source registries without imports;
- audit metadata is mandatory;
- blocked outputs, safety-candidate metadata, and audit metadata survive serialization;
- decoded results are recursively frozen;
- unexpected presentation fields and malformed JSON fail closed;
- all standardized feature flags and production activations remain inactive;
- no runtime adapter, parent score, or cross-domain composite is represented;
- UI modules do not import scientific internals;
- production services do not import internal scientific registries; and
- the prepared frozen baseline manifest remains byte-for-byte unchanged.

Existing scientific-domain tests remain the authority for unchanged calculation, eligibility, interpretation, reason, confidence, safety, and trend behavior.

## 19. Prohibited Consumer Behavior

The Production Platform must never:

- calculate or revise a scientific result;
- override status, confidence, reasons, warnings, safety, or trend status;
- combine domains or create a score, ranking, category, or composite;
- infer missing context or silently select a fallback;
- discard, weaken, or hide blocked outputs;
- modify or reconstruct audit metadata;
- convert population evidence into individual prognosis;
- diagnose disease or recommend treatment;
- let UI or AI redefine scientific meaning; or
- activate a domain from a default feature-flag value.

## 20. Deferred Integration Work

The following are deliberately deferred:

- domain-specific adapter implementation and verification;
- feature-flag service wiring;
- minimum app-version policy;
- caching and persistence;
- HealthKit, Supabase, or other ingestion;
- application services, APIs, Advisor, Dashboard, Living Sphere, Reports, and Health Overview;
- presentation and localization;
- AI explanation contracts; and
- production safety-message activation.

Each adapter will require explicit mapping evidence proving that no scientific value, status, reason, block, confidence, provenance, audit field, or version is lost or changed.

## 21. Production Recommendation

Approve `scientific-production-contract/1.0.0` as the inactive production integration boundary. Do not activate any Phase 8 standardized domain path yet.

The architecture is ready for a separately governed adapter-integration phase after the Scientific Baseline v1.0 artifacts are committed and the baseline tag prerequisites are satisfied. Activation must remain blocked until adapters, lossless mapping tests, persistence integrity, application-version compatibility, explicit feature-flag approval, and end-to-end regression evidence are complete.
