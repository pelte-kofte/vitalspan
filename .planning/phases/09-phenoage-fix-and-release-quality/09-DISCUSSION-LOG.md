# Phase 9: PhenoAge Fix & Release Quality - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 9-PhenoAge Fix & Release Quality
**Areas discussed:** Formula bug — known or diagnose?, Verification approach, Debug console.log cleanup, Crash testing method

---

## Formula Bug — Known or Diagnose?

| Option | Description | Selected |
|--------|-------------|----------|
| I know the bug — implement the fix | User can describe what's wrong. Plan goes straight to implementing the known fix. | ✓ |
| Diagnose first using Levine 2018 | Plan includes a diagnosis step: test current output against published reference input set. | |
| Suspected issue — verify + fix | Researcher confirms suspected issue before planning the fix. | |

**User's choice:** I know the bug — implement the fix

**Specific bugs identified by user:**
1. CRP conversion: `Math.log(crpRaw / 10)` is correct (mg/L ÷ 10 = mg/dL), but validate CRP > 0 before ln() — already present in code.
2. Gompertz constants: Current code has wrong `LAMBDA = 0.0000001025` and wrong formula structure. Correct formula: `M = 1 - exp(-exp(xb) × (exp(120 × 0.0076927) - 1) / 0.0076927)`. Verify γ=0.0076927, intercept=-19.9067, and all 9 coefficients match Levine 2018 exactly.
3. All 9 biomarkers + age must be present — remove all median substitution entirely, not even behind DEV flag. Return null if any value is missing or invalid.

**Follow-up — UI null state:**

| Option | Description | Selected |
|--------|-------------|----------|
| Existing null handling is fine | UI already shows an 'insufficient data' message. No UI changes needed. | |
| UI needs a prompt showing missing biomarkers | Show users exactly which biomarkers they still need to enter. | ✓ |
| You decide | Claude picks the least-effort correct option. | |

**Notes:** `PhenoAgeResult.missingBiomarkers: string[]` is already returned by the function. UI update uses this field.

---

## Verification Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Node.js test script (no new packages) | Standalone `phenoAge.verify.ts` run with `npx ts-node`. No new packages needed. | ✓ |
| jest-expo unit tests (new package) | Install jest-expo, co-locate `phenoAge.test.ts`. TESTING.md recommends this. | |
| Manual in-app check with known values | Enter reference values in the app on simulator. No code artifacts. | |

**User's choice:** Node.js test script (no new packages)

**Test cases:**

| Option | Description | Selected |
|--------|-------------|----------|
| Published NHANES median values — age 50 | Single test: median → phenotypic age ≈ chronological age. | |
| Provide a specific reference case | A specific published input set + expected output. | |
| Multiple test cases: median, healthy, unhealthy | Three vectors validating the range. | ✓ |

**Notes:** Researcher sources specific expected output values from Levine 2018 or a validated calculator.

---

## Debug Console.log Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Strip entirely | Remove all debug console.log calls. Cleaner production code. | ✓ |
| Gate behind __DEV__ | Wrap with `if (__DEV__)`. Silent in TestFlight builds. | |
| Keep them | Leave as-is. Logs visible in Metro/Xcode. | |

**User's choice:** Strip entirely

**Scope:**

| Option | Description | Selected |
|--------|-------------|----------|
| Targeted: phenoAge.ts + DashboardScreen.tsx only | Only the two files flagged in the codebase analysis. | |
| Full codebase scan — strip all debug logs | grep all src/ files; remove console.log, keep console.error. | ✓ |

**Notes:** `console.error` (error handling in catch blocks) must NOT be removed — only `console.log` debug calls.

---

## Crash Testing Method

| Option | Description | Selected |
|--------|-------------|----------|
| Manual simulator walkthrough by executor | Executor runs `expo run:ios`, walks full flow, documents each step. | |
| Documented test checklist only (human UAT) | Plan produces UAT checklist; developer runs it. | |
| Both: executor runs simulator + UAT checklist for you | Executor attempts simulator walkthrough AND produces checklist for device verification. | ✓ |

**User's choice:** Both

**EAS build:**

| Option | Description | Selected |
|--------|-------------|----------|
| Simulator only — EAS build is a post-phase step | Keep Phase 9 focused on correctness. | |
| Include EAS build verification | Add `eas build --platform ios --profile preview`. Catches release-mode-only issues. | ✓ |

**Notes:** Phase 9 is not complete until EAS preview build succeeds.

---

## Claude's Discretion

None — user made explicit decisions on every question.

## Deferred Ideas

None — discussion stayed within phase scope.
