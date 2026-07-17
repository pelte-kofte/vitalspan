# Clinical PhenoAge v1.0.0 production cutover

## Status

Clinical PhenoAge v1.0.0 is the single production implementation of Clinical
Phenotypic Age. The former product calculator, its verification script, and its
legacy-specific tests have been removed. No compatibility layer or fallback remains.

This migration changes product wiring only. It does not change scientific
coefficients, formulas, normalization contracts, eligibility policy, UI design,
Living Sphere behavior, recommendations, or AI behavior.

## Mandatory execution flow

```text
User measurements
        ↓
Product evidence normalization
        ↓
Scientific Eligibility Engine
        ↓
ScientificExecutionAuthorization
        ↓
Clinical PhenoAge v1.0.0 engine
        ↓
Typed, unrounded scientific result
        ↓
UI presentation adapter
        ↓
Product UI
```

The presentation module is the product-facing entry point. The product evaluation
module is the only production caller of the calculation function. It constructs a
typed eligibility request, verifies executable authorization, binds the exact
authorized measurement identifiers, and then invokes the locked engine.

## Evidence and unit policy

The adapter accepts only explicit, allowlisted source units and normalizes them to
the engine's canonical input contract before eligibility evaluation. It never
guesses units, assays, sources, collection context, or missing values. All nine
blood measurements must be current, valid, identifiable, and from one collection
date and source. Chronological age must satisfy the registered model range.

The scientific engine returns full-precision values. One-decimal display formatting
is isolated to the presentation adapter and does not alter the scientific result.

## Safe unavailable states

Scientific failures are mapped to typed, product-safe states for:

- missing profile age or biomarkers;
- stale evidence;
- unsupported units;
- invalid measurements;
- invalid or mixed laboratory context;
- unsupported or research-only versions;
- authorization denial; and
- calculation unavailability.

The product never substitutes an estimate, falls back to another calculator, or
exposes a scientific exception or stack trace.

## Migrated consumers

- Dashboard biological-age presentation and persisted display value
- Health overview and health system screens
- Longevity detail screen
- Health overview card
- Today and health experience builders
- Advisor context payload construction

All consumers receive the presentation adapter's typed result. None imports the
scientific calculation function directly.

## Intentional remaining references

References to Clinical PhenoAge remain in the scientific registry, eligibility
policy, versioned engine, independent validation fixtures, scientific validation
tests, UI labels, and product documentation. Independent fixture and reference
implementations exist only under validation/test paths; they are not production
calculators and cannot be called by the application.

## Regression protection

The cutover suite verifies the complete eligibility-authorized path against the
frozen scientific output, adapter-only rounding, unit normalization, typed failure
mapping, absence of the retired file, and the one-caller production boundary.
Scientific golden fixtures, coefficient fingerprints, source hashes, and
authorization-integrity tests remain unchanged.

Any future scientific behavior change requires a new model or normalization version,
updated evidence, new independent fixtures, and explicit scientific review. It must
not be introduced through the UI adapter.
