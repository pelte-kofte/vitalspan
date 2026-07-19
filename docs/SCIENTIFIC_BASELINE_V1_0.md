# Vitalspan Scientific Baseline v1.0

## 1. Executive Summary

Scientific Baseline v1.0 freezes the approved scientific state of Clinical Biological Age, Cardiorespiratory Fitness, Functional Capacity, and Cardiometabolic Health before Phase 7.0E production integration. The baseline identifies the source commit, exact component versions, fingerprints where available, production activation truth, regression suites, and change-control policy.

The machine-readable authority is `src/domain/scientificDomains/scientificBaseline.ts`. This baseline adds no calculation, eligibility, interpretation, registry, threshold, reference, reason-code, confidence, safety, UI, ingestion, persistence, API, AI, or production behavior.

## 2. Purpose

The baseline makes later changes auditable. It provides a fixed comparison point for proving that scientific behavior did not change silently, domain versions remain independently traceable, new domains do not mutate prior domains, production integration consumes rather than redefines scientific decisions, and every frozen domain remains regression-testable.

## 3. Baseline Identifier

| Field | Frozen value |
| --- | --- |
| Baseline ID | `scientific-baseline-v1.0.0` |
| Semantic version | `1.0.0` |
| Creation date | `2026-07-19` |
| Activation status | `prepared_not_activated` |
| Recommended annotated tag | `scientific-baseline-v1.0.0` |

Preparation is not activation. Activation requires the baseline commit to be reviewed, pushed, reverified from a clean tree, and annotated with the approved tag.

## 4. Repository State

| Field | Frozen value |
| --- | --- |
| Source scientific commit | `7b7b4bea1008a1b31b6d209d55debdfd608719e9` |
| Source commit subject | `feat(science): add governed cardiometabolic scientific domain` |
| Branch | `main` |
| Working tree at preparation start | Clean |
| Remote state at preparation start | `main` was one commit ahead of `origin/main` |
| Test suites at source commit | 33 passed |
| Tests at source commit | 611 passed |
| TypeScript at source commit | Passed |
| Scientific governance audits | Passed |

The source commit is the scientific state being frozen. The future baseline-governance commit and tag will identify the release artifact containing this manifest; a Git commit cannot contain its own final SHA.

## 5. Frozen Scientific Domains

| Domain ID | Display name | Scientific status | Production activation |
| --- | --- | --- | --- |
| `clinical_biological_age` | Clinical Biological Age / Clinical PhenoAge | Validated | Active |
| `cardiorespiratory_fitness` | Cardiorespiratory Fitness / VO₂max | Validated scientific domain | Inactive |
| `functional_capacity` | Functional Capacity | Validated scientific domain | Inactive |
| `cardiometabolic_health` | Cardiometabolic Health | Validated scientific domain | Inactive |

No parent scientific score, cross-domain composite, cross-domain ranking, or global longevity score is part of the baseline.

## 6. Clinical Biological Age Baseline

Clinical PhenoAge v1.0.0 is the only frozen domain already connected to production. Its production cutover remains unchanged.

| Component | Frozen identity |
| --- | --- |
| Domain/model specification | `clinical-phenoage/1.0.0` |
| Measurement and normalization contract | `clinical-phenoage-canonical-units/1.0.0` |
| Eligibility version | `clinical-phenoage/1.0.0` |
| Input policy | `clinical_phenoage_complete_visit` |
| Coefficient version | `clinical-phenoage-coefficients/1.0.0` |
| Implementation version | `vitalspan-clinical-phenoage/1.0.0` |
| Coefficient fingerprint | `26d3842b55885598405ae13ae1d058c6403f11a049063d1c565c031f3e5ac4dc` |
| Reference fixture fingerprint | `41e3247c2bf6ad0e6403a431ac54f4aa4cb90dfe09068a38fcca7084220bfa05` |
| Production activation | Active under the documented v1.0.0 cutover |
| Frozen tests | 88 across three Clinical PhenoAge suites |
| Governance | Passed |

Clinical PhenoAge does not expose separate source, confidence, reference, interpretation, or reason registry versions at this commit. Their absence is recorded rather than filled with invented version identifiers. The coefficient, formula, normalization, authorization, implementation, and validation artifacts remain protected by fingerprints and regression fixtures.

## 7. VO₂max Baseline

| Component | Frozen version |
| --- | --- |
| Domain specification | `vo2max-domain/1.0.0` |
| Source registry | `vo2max-source-registry/1.0.0` |
| Confidence registry | `vo2max-confidence-registry/1.0.0` |
| Validation and eligibility policy | `vo2max-eligibility-policy/1.0.0` |
| Reason registry governance | Shares `vo2max-eligibility-policy/1.0.0` |
| Reference registry | `vo2max-reference-registry/1.0.0` |
| Interpretation policy | `vo2max-percentile-policy/1.0.0` |
| Production activation | Inactive; Phase 5.0D prohibits production integration |
| Frozen tests | 63 |
| Governance | Passed |

No independent measurement, protocol, assay, safety, or trend registry is present. The active FRIEND reference remains governed inside the frozen reference registry, and no percentile table or fallback is added by this baseline.

## 8. Functional Capacity Baseline

| Component | Frozen version |
| --- | --- |
| Domain specification | `functional-capacity-domain/1.0.0` |
| Measurement/test registry | `functional-capacity-test-registry/1.0.0` |
| Protocol registry | `functional-capacity-protocol-registry/1.0.0` |
| Source registry | `functional-capacity-source-registry/1.0.0` |
| Confidence registry | `functional-capacity-confidence-registry/1.0.0` |
| Validation policy | `functional-capacity-validation-policy/1.0.0` |
| Eligibility policy | `functional-capacity-eligibility-policy/1.0.0` |
| Reference registry | `functional-capacity-reference-registry/1.0.0` |
| Reference matching | `functional-capacity-reference-matching-policy/1.0.0` |
| Interpretation policy | `functional-capacity-interpretation-policy/1.0.0` |
| Reason registry governance | Shares `functional-capacity-eligibility-policy/1.0.0` |
| Trend comparison | `functional-capacity-trend-comparison-policy/1.0.0` |
| Production activation | Inactive; Phase 6.0D prohibits production integration |
| Frozen tests | 35 |
| Governance | Passed |

No assay registry, coefficient fingerprint, safety policy, or cross-test score is applicable.

## 9. Cardiometabolic Health Baseline

| Component | Frozen version |
| --- | --- |
| Domain specification | `Vitalspan-CMH-DOMAIN-1.0.0` |
| Measurement registry | `Vitalspan-CMH-MEASUREMENT-1.0.0` |
| Protocol registry | `Vitalspan-CMH-PROTOCOL-1.0.0` |
| Assay/method registry | `Vitalspan-CMH-ASSAY-1.0.0` |
| Source registry | `Vitalspan-CMH-SOURCE-1.0.0` |
| Confidence registry | `Vitalspan-CMH-CONFIDENCE-1.0.0` |
| Validation policy | `Vitalspan-CMH-VALIDATION-1.0.0` |
| Eligibility policy | `Vitalspan-CMH-ELIGIBILITY-1.0.0` |
| Reason registry | `Vitalspan-CMH-REASON-1.0.0` |
| Reference registry | `CMH-RR-1.0.0` |
| Interpretation registry | `CMH-IPR-1.0.0` |
| Population matching | `CMH-PMP-1.0.0` |
| Safety-candidate policy | `CMH-SBP-0.1.0-inactive` |
| Trend comparability | `CMH-TCP-1.0.0` |
| Production activation | Inactive pending Phase 7.0E |
| Frozen tests | 42 |
| Governance | Passed |

The candidate safety policy remains inactive. The baseline does not activate an alert, diagnosis, treatment instruction, emergency disposition, parent score, or cross-marker composite.

## 10. Independent Version Registry

Every machine-readable component has a globally unique baseline component ID formed from its domain ID and component kind. A component version is imported from its existing domain registry where safe. Shared or absent version boundaries are explicitly disclosed; they are not silently assigned invented scientific versions.

Component versions are independent release boundaries. Equality between two component version values means the current repository intentionally shares that version boundary; it does not permit the components to be changed without reviewing every affected use.

## 11. Scientific Change Classification

Every change proposal must name all affected domains and choose exactly one primary classification:

1. **Editorial:** wording or formatting only; no executable or registry effect.
2. **Non-behavioral implementation:** refactoring or test/governance work proven not to alter scientific output.
3. **Backward-compatible scientific revision:** a scientifically meaningful addition that preserves existing valid results and contracts.
4. **Breaking scientific revision:** any change that can alter an existing scientific decision, status, eligibility, interpretation, or output contract.
5. **Emergency scientific correction:** a time-sensitive correction to unsafe, materially wrong, or invalid scientific behavior.

Classification does not replace evidence review. A proposal must explain why its classification is correct and provide regression evidence.

## 12. Version-Increment Policy

- Frozen scientific behavior may not change without an explicit scientific change proposal.
- Behavioral changes require the affected domain or policy version to increment.
- Registry membership or meaning changes require that registry's version to increment.
- Reference additions, removals, corrections, supersession, or matching changes require the reference registry or reference identity/version to increment as applicable.
- Interpretation changes require the interpretation-policy version to increment.
- Protocol, assay, source, confidence, validation, eligibility, reason, safety, and trend changes require their applicable versions to increment.
- Clinical PhenoAge coefficient or transform changes require a new coefficient version, implementation version, and coefficient fingerprint.
- Historical outputs retain the versions under which they were produced; no silent backfill or reinterpretation is permitted.

## 13. Emergency Scientific Correction Policy

An emergency correction requires:

- a written audit note identifying the defect, discovery date, affected versions, populations, and outputs;
- a named scientific owner and reviewer;
- the `emergency_scientific_correction` classification;
- an explicit new version or documented withdrawal of the affected version;
- regression evidence reproducing the defect and proving the correction;
- impact analysis for stored and previously displayed results;
- a rollback or fail-closed containment plan; and
- post-correction review before normal release governance resumes.

Emergency status does not authorize silent edits, unversioned constants, weaker evidence, or bypassing safety boundaries.

## 14. Production Integration Boundary

Production engineering may consume a frozen scientific result but may not recalculate, upgrade, downgrade, reinterpret, combine, suppress, or redefine it. UI, ingestion, persistence, APIs, application state, Advisor, Dashboard, Health Overview, Living Sphere, HealthKit, and Supabase remain outside this baseline change.

Clinical PhenoAge retains its existing production cutover. VO₂max, Functional Capacity, and Cardiometabolic Health remain production-inactive. Phase 7.0E may integrate Cardiometabolic Health only through its frozen typed outputs and may not mutate domain decisions.

## 15. AI Scientific Boundary

Science calculates; AI explains. AI may explain an already authorized scientific result and its limitations. It may not calculate a scientific result, fill missing context, select an unsupported reference, override validation, change confidence, upgrade or downgrade eligibility, reinterpret a threshold, issue a diagnosis, recommend treatment, or create a composite. Unknown or unmatched results remain unavailable.

## 16. Regression Requirements

Every scientific or production-integration change must run:

- focused baseline governance tests;
- Clinical PhenoAge calculation, scientific-validation, and product-cutover suites;
- VO₂max scientific-domain tests;
- Functional Capacity scientific-domain tests;
- Cardiometabolic scientific-domain tests;
- the complete repository suite;
- strict TypeScript validation;
- all domain governance audits;
- production-reference isolation checks;
- `git diff --check`; and
- a targeted whitespace audit that includes new untracked files.

Large implementation snapshots are not baseline authority. Tests must explicitly assert stable IDs, versions, fingerprints, activation states, prohibited composites, and registry agreement.

## 17. Audit Requirements

An audit must record the source and baseline commit SHAs, branch, working-tree state, test and suite counts, TypeScript result, domain governance results, changed paths, component-version changes, fingerprints, production-reference findings, and reviewer approval. Any mismatch from this baseline fails closed until classified and approved.

The recommended release tag is prepared but must not be created or pushed by this phase:

```sh
git tag -a scientific-baseline-v1.0.0 -m "Vitalspan Scientific Baseline v1.0.0"
git push origin scientific-baseline-v1.0.0
```

These commands may run only after all tests and audits pass, the baseline commit is pushed, and the working tree is clean.

## 18. Baseline Limitations

- The manifest freezes the source scientific commit, not its own unknowable future commit SHA.
- `main` was one commit ahead of `origin/main` at preparation, so release-tag prerequisites were not yet satisfied.
- Clinical PhenoAge predates the newer independently versioned domain-registry convention; several governance surfaces are not separately versioned.
- VO₂max and Functional Capacity intentionally share their eligibility-policy version with reason or validation governance in places.
- Only Clinical PhenoAge has coefficient and reference-fixture fingerprints applicable to its calculation model.
- A passing baseline demonstrates repository behavior and configured invariants, not clinical effectiveness, universal population transportability, or regulatory approval.

## 19. Future Domain Policy

Every future scientific domain must declare a stable domain ID, independent scientific identities, versioned applicable registries and policies, explicit production activation state, fail-closed matching, prohibited outputs, deterministic governance audit, regression suite, and baseline-inclusion proposal. A future domain cannot modify an existing baseline domain merely by sharing biomarkers, inputs, devices, or presentation surfaces.

New domains remain production-inactive until an explicit integration phase is approved. Adding a domain to the baseline requires a new baseline version; it must not overwrite Scientific Baseline v1.0.

## 20. Baseline Approval Status

**Status: Prepared — not activated.**

The source scientific state is clean, committed, and verified locally. Baseline activation remains pending review, the recommended baseline commit, push of the source and baseline commits, clean-tree re-verification, and creation of the annotated tag. No tag was created or pushed.

Recommended commit message:

```text
chore(science): freeze scientific baseline v1.0
```
