# Phase 2 — Health Operating System

The Health tab is now a physiology map rather than a biomarker catalogue.

## Information architecture

1. **Health Overview** — Blood Phenotypic Age, laboratory freshness, completeness, model limitations, and an overall trend signal.
2. **Input state** — explicit knowledge, uncertainty, and best next action for no labs, partial/old labs, wearable-only, HealthKit-only, manual-only, and complete data.
3. **Body systems** — Cardiovascular, Brain & Cognition, Metabolic, Immune & Inflammation, Liver, Kidney, Muscle & Performance, Hormones, Nutrition, and Longevity Research. Rows expose state, driver, change, confidence, trend, and open actions without dumping biomarkers.
4. **System detail** — Summary → key biomarkers → historical trends → laboratory reference → longevity evidence → limitations → protocol actions → research links. Sections disclose progressively.
5. **Biomarker detail** — value and trend first; source, collection date, freshness, unit, laboratory reference, clinical significance, longevity evidence, history, context, and reviewed sources are separated.

## Screenshots

- [Health overview — iPhone 17 Pro](../output/phase2-health/health-overview-iphone-17-pro.png)
- [Body systems — iPhone 17 Pro](../output/phase2-health/body-systems-iphone-17-pro.png)
- [Cardiovascular detail — iPhone 17 Pro](../output/phase2-health/cardiovascular-detail-iphone-17-pro.png)
- [Health overview — iPhone SE](../output/phase2-health/health-overview-iphone-se.png)
- [Dynamic Type XXL — iPhone SE](../output/phase2-health/health-accessibility-xxl-iphone-se.png)

## Validation

- `npx tsc --noEmit` ✅
- `npm test -- --runInBand` ✅ (204 tests)
- `git diff --check` ✅
- iOS simulator build reached native compilation but was blocked by local Xcode disk exhaustion (`ENOSPC`). Existing SE/Pro captures remain checked in under `output/phase2-health/`; rerun `npx expo run:ios --device` after a clean build volume for a fresh binary check.

