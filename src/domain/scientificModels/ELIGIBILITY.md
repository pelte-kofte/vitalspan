# Scientific Eligibility Engine

## Philosophy

Eligibility is a scientific authorization decision, not a data-availability check.
A registered model and a technically complete record can still be scientifically
inappropriate. The engine therefore fails closed and answers only whether an exact,
versioned model is permitted to execute. It performs no biological-age calculation.

The eligibility package accepts structured evidence metadata and stable measurement
identifiers, not raw biomarker values. It cannot interpolate, normalize, convert,
estimate, weight, or calculate.

## Mandatory decision flow

```text
Model id + requested scientific version
        ↓
Registry classification and use decision
        ↓
Exact version lifecycle
        ↓
Registry-approved input policy
        ↓
Required input, source, and exact-unit checks
        ↓
Validity, freshness, assay, and confidence checks
        ↓
Population, age, and scientifically required sex checks
        ↓
Laboratory, calibration, device, quality, and history checks
        ↓
Fail-closed eligibility result
```

Calculation code accepts only a result with `status: eligible`, an exact matching
`eligibleVersion`, and `calculationAllowed: true`. Conditional eligibility never
authorizes calculation. The `ScientificExecutionAuthorization` includes the exact
input policy and ordered evidence bindings (input id, measurement id, unit, source,
and timestamp), the evaluated chronological-age value, an issue and expiry time, a stable integrity hash, and a derived
authorization reference. The issuing engine also retains an in-memory identity
binding, so a structurally similar clone is not an authorization.

Authorization is valid for five minutes from the recorded eligibility assessment.
The downstream guard rejects expiry, mutation, forgery, cloning, model/version/policy
mismatch, and conditional or denied results. Reauthorization requires a new complete
eligibility evaluation; no authorization is refreshed silently.

## Statuses

- **Eligible:** every required check for an active core model is satisfied.
- **Conditionally Eligible:** no hard blocker exists, but one or more scientific
  facts remain unknown. Calculation remains prohibited.
- **Research Only:** the exact version is restricted to research.
- **Not Eligible:** an active version failed one or more scientific checks.
- **Unsupported:** no supported calculation pathway or exact requested version exists.
- **Retired:** scientific governance has withdrawn the exact version.

Only `clinical-phenoage/1.0.0` is currently active. KDM remains unsupported until a
named, reviewed calibration version exists. VO2max is a research-only modifier
candidate and cannot authorize a biological-age calculation. Context-only and
rejected models have explicit unsupported versions so every registry entry receives
a deterministic evaluation.

## Blocking logic

The engine blocks:

- absent required inputs or duplicated input identifiers;
- missing or wrong units; exact accepted units are compared without conversion;
- invalid or stale measurements;
- explicitly unsupported assays, sources, populations, or laboratory contexts;
- ages outside the version's published population range;
- missing or incompatible sex strata when a version explicitly requires one;
- absent, unknown-name, or unsupported reference calibrations;
- absent, unsupported, or explicitly unvalidated required devices;
- insufficient historical observations or duration;
- deprecated inputs;
- unknown model versions, research-only versions, unsupported models, and retired
  versions.

Unknown measurement validity, freshness, assay compatibility, population support,
laboratory compatibility, or device quality produces conditional eligibility. It is
never silently treated as supported. Sparse but sufficient history produces an
informational warning and cannot imply a longitudinal conclusion.

## Confidence

Eligibility confidence is the lowest explicitly supplied confidence among required
inputs. It is never inferred from health quality or model output. Missing inputs
produce insufficient confidence. An input below the registry policy requirement
blocks or conditions eligibility according to the explicit confidence band; the
engine does not upgrade confidence.

## Version policy

Versions use immutable, namespaced identifiers such as
`clinical-phenoage/1.0.0`. Evaluation requires an exact match—there is no “latest”
fallback. Multiple future versions may coexist with independent lifecycle,
population, calibration, device, history, evidence, and deprecation policies.

A new version must:

1. already exist in the scientific registry;
2. cite peer-reviewed evidence;
3. declare a lifecycle;
4. reference a registry-approved input policy before becoming active;
5. define population and evidence-context restrictions;
6. pass catalog integrity and isolated eligibility tests;
7. preserve older versions until governance explicitly retires them.

Retirement is explicit and permanent for that version identifier. It is never
implemented by silently routing to a newer model.

## Extension policy

Future calculation engines must depend on this output contract, while this engine
must never depend on calculation code. Living Sphere, UI, AI, recommendations,
rendering, and navigation remain outside the package.

New assays, devices, calibrations, populations, or model revisions require new
versioned metadata and evidence review. They must not be enabled through permissive
defaults or guessed compatibility.

## Open scientific risks

- Population compatibility still requires an authoritative upstream evidence review;
  the engine correctly preserves `unknown` but cannot create missing validation.
- Laboratory and assay harmonization may require model-specific external standards.
- Exact freshness and collection-window policies need published or governance-backed
  definitions rather than generic thresholds.
- KDM requires independently governed calibration versions, not a generic method id.
- Sex-specific versions need careful separation of biological measurement constraints
  from demographic assumptions.
- Future model combinations need separate prospective validation; component
  eligibility does not validate multimodal aggregation.
