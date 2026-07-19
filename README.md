# Vitalspan

Vitalspan is a React Native / Expo longevity and health platform built around governed scientific domains, auditable health evaluation, personalized health insights, and premium product experiences.

Scientific decisions belong exclusively to the Scientific Platform. Application services integrate authoritative outputs, presentation displays them, and Advisor or AI capabilities may explain them without calculating or redefining science.

## Project Status

- **Clinical Biological Age / Clinical PhenoAge:** production active through the existing legacy product path.
- **Cardiorespiratory Fitness / VO₂max:** governed scientific domain; inactive under the standardized production contract.
- **Functional Capacity:** governed scientific domain; inactive under the standardized production contract.
- **Cardiometabolic Health:** governed scientific domain; inactive under the standardized production contract.
- **Scientific Baseline v1.0:** prepared and awaiting completion of its release-baseline prerequisites.
- **Production Platform:** Phase 8 work is in progress. The Phase 8.0A contract architecture is prepared, but its domain adapters and feature flags are not wired.

Code presence does not imply production activation.

## Architecture

Vitalspan separates scientific authority from integration and presentation:

1. **Scientific Platform** — validates evidence and produces deterministic, versioned scientific decisions, reasons, limitations, provenance, and audit metadata.
2. **Scientific Production Contract** — defines the domain-neutral request and authoritative result boundary.
3. **Production Integration** — will transport, validate, cache, and persist scientific outputs without changing them.
4. **Presentation** — formats authorized output for the product without calculating or reinterpreting science.
5. **Advisor / AI explanation layer** — may explain, summarize, translate, or simplify governed read models; it may not make scientific decisions.

Only scientific domains make scientific decisions. Unknown or unsupported states fail closed instead of falling back to inferred conclusions.

## Governance

- [Vitalspan Engineering Standard](docs/VITALSPAN_ENGINEERING_STANDARD.md)
- [Scientific Baseline v1.0](docs/SCIENTIFIC_BASELINE_V1_0.md)
- [Phase 8.0A Production Contract & Activation Architecture](docs/PHASE_8_0A_PRODUCTION_CONTRACT_ACTIVATION_ARCHITECTURE.md)
- [Clinical PhenoAge production cutover](docs/CLINICAL_PHENOAGE_PRODUCTION_CUTOVER.md)

Contributors and coding agents must read [AGENTS.md](AGENTS.md) and the engineering standard before material work.

## Scientific Domains

| Domain | Scientific status | Standardized production-contract status |
|---|---|---|
| Clinical Biological Age / Clinical PhenoAge | Validated; legacy product path active | Inactive and not wired |
| Cardiorespiratory Fitness / VO₂max | Governed scientific domain | Inactive and not wired |
| Functional Capacity | Governed scientific domain | Inactive and not wired |
| Cardiometabolic Health | Governed scientific domain | Inactive and not wired |

Clinical PhenoAge v1.0.0 requires chronological age and its complete governed measurement set. Missing, stale, invalid, mixed-context, or unit-incompatible evidence produces a typed unavailable state. Values are not imputed, and presentation rounding is kept outside the scientific engine.

The other domains remain independently governed. Vitalspan does not create a parent scientific score or merge them into an unvalidated composite.

## Development Principles

- Deterministic, reproducible science
- Fail-closed validation
- Explicit scientific, registry, policy, and contract versioning
- Complete provenance and audit preservation
- Independent scientific-domain isolation
- Backward compatibility by default
- AI explains but does not decide
- Inactive-by-default production activation
- User trust over feature count or release speed

## Technology

- React Native 0.81 with Expo SDK 54
- TypeScript in strict mode
- React Navigation
- AsyncStorage for local application state
- Supabase for configured authentication, content, and cloud data flows
- Apple HealthKit integration
- Adapty premium entitlement integration
- Jest with ts-jest

## Product Areas

The repository includes onboarding and identity flows, health and biomarker experiences, the Clinical PhenoAge product path, protocol and medication tools, exercise experiences, editorial content, premium entitlement surfaces, HealthKit connectivity, and an Advisor experience.

Product UI is not scientific authority. Biomarker display ranges, colors, advice, and copy must not be treated as diagnostic thresholds, treatment targets, or universal “optimal longevity” ranges unless an authorized scientific policy explicitly supplies that meaning.

## Setup

```bash
# Install dependencies
npm install

# Start the Expo development server
npm start

# Run an iOS native build
npm run ios

# Run an Android native build
npm run android
```

Environment-dependent services use the repository's `.env.example` as the public configuration reference. Never commit real secrets, service-role keys, tokens, or private health data.

## Validation

```bash
# Full repository test suite
npm test -- --runInBand

# TypeScript
npx tsc --noEmit
```

Material changes may require additional focused tests, scientific regressions, build validation, migration checks, and VES gate evidence.

## Project Structure

```text
src/
  components/                 Product and shared presentation components
  screens/                    Application screens
  navigation/                 Navigation contracts and routes
  context/                    Application and entitlement contexts
  lib/                        Integration and presentation services
  services/                   External and application services
  domain/
    scientificModels/         Clinical Biological Age and scientific-model governance
    scientificDomains/        Independently governed scientific domains
    scientificProduction/     Standardized production contracts and inactive activation metadata
  __tests__/                  Focused, regression, governance, and product tests
docs/                         Phase specifications, scientific evidence, and governance
fixtures/scientific/          Scientific reference and validation fixtures
supabase/                     Database migrations and edge-function sources
```

## Repository Safety

Before a material change:

1. Read [AGENTS.md](AGENTS.md).
2. Read the [Vitalspan Engineering Standard](docs/VITALSPAN_ENGINEERING_STANDARD.md).
3. Read the Scientific Baseline and relevant phase documents when science or production integration is involved.
4. Inspect and preserve unrelated working-tree changes.
5. Complete focused validation, full regression, TypeScript, repository audits, and the applicable VES review.

Do not commit, push, tag, migrate, release, or activate production behavior without explicit authorization.

## Scientific Reference

Clinical PhenoAge is based on Levine ME et al., “An epigenetic biomarker of aging for lifespan and healthspan.” *Aging*. 2018;10(4):573–591. DOI: 10.18632/aging.101414. The repository's governed implementation and validation documentation controls product behavior.
