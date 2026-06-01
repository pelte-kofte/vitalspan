# Phase 9: PhenoAge Fix & Release Quality - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Four connected workstreams before v2 TestFlight submission:

1. **PhenoAge formula fix** — Correct three specific bugs in `src/lib/phenoAge.ts`: wrong Gompertz mortality probability formula, wrong formula constants, and median substitution that must be removed entirely. All 9 biomarkers + age must be present to compute; return null otherwise.

2. **UI null-state update** — When `biologicalAge` is null, display the `missingBiomarkers` list (already returned by `PhenoAgeResult`) in LongevityScore, Dashboard, FutureSelf, and ProfileScreen so users know exactly which biomarkers to enter next.

3. **Release quality** — Zero TypeScript errors (`tsc --noEmit`), all debug `console.log` calls stripped from `src/`, security grep confirms zero hardcoded Supabase credentials.

4. **Verification** — Standalone Node.js verification script with 3 reference test cases; full flow walkthrough on iOS simulator + UAT checklist + EAS preview build.

No new screens. No new packages. No changes to AsyncStorage keys or Supabase sync logic.

</domain>

<decisions>
## Implementation Decisions

### PhenoAge Formula Fix
- **D-01:** Correct the mortality probability formula to match Levine 2018 exactly:
  `M = 1 - exp(-exp(xb) × (exp(120 × 0.0076927) - 1) / 0.0076927)`
  The current code has `1 - Math.exp(-LAMBDA * Math.exp(xb) / GAMMA)` with wrong `LAMBDA = 0.0000001025` — this is incorrect. Delete `LAMBDA` constant entirely.
- **D-02:** Verify these exact constants are in the code (cross-check against Levine 2018 Table 1):
  - `γ (GAMMA) = 0.0076927`
  - `INTERCEPT = -19.9067`
  - Coefficients: albumin=-0.0336, creatinine=0.0095, glucose=0.1953, lnCRP=0.0954, lymphocytePct=-0.0120, mcv=0.0268, rdw=0.3306, alkalinePhosphatase=0.00188, wbc=0.0554, age=0.0804
  - PhenoAge inversion constants: `141.50225`, `0.00553`, `0.090165` — verify these match the paper
- **D-03:** Remove all median substitution — delete the `MEDIANS` block and all `?? MEDIANS.x` fallback logic. If any of the 9 required biomarkers is missing, zero, or negative → return `biologicalAge: null` immediately. No partial computation.
- **D-04:** Remove the tiered confidence system (`'medium' | 'low'`) that allowed partial computation. Valid output states: all 9 present → compute (confidence stays as `'high'`), any missing → return null with `confidence: 'insufficient'` and the `missingBiomarkers` list populated.
- **D-05:** CRP unit conversion is correct — keep `Math.log(crpRaw / 10)` (mg/L ÷ 10 = mg/dL). Keep the existing `crpRaw <= 0` guard.

### UI — Missing Biomarker Prompt
- **D-06:** When `biologicalAge` is null, display the `missingBiomarkers: string[]` list from `PhenoAgeResult` in the UI. Update `LongevityScoreScreen`, `DashboardScreen`, `FutureSelf.tsx`, and `ProfileScreen` — any location that currently shows "insufficient data" or similar. Guide users to enter the listed biomarkers. Use the existing `PHENO_BIOMARKER_LIST` for label lookups.

### Verification Script
- **D-07:** Write `src/lib/phenoAge.verify.ts` — a standalone Node.js/TypeScript script that tests 3 reference cases:
  1. NHANES median values for age 50 → expected phenotypic age ≈ chronological age
  2. Healthy profile (optimal biomarker values) → expected phenotypic age < chronological age
  3. Suboptimal profile (adverse biomarker values) → expected phenotypic age > chronological age
  Run with `npx ts-node src/lib/phenoAge.verify.ts`. No new packages. Reference values sourced from Levine 2018 paper (researcher task).
- **D-08:** The verification script is a development tool only — it is NOT shipped in the app bundle. Add it to `.gitignore` if needed, or simply exclude it from the Expo entry point.

### Debug Console.log Cleanup
- **D-09:** Strip all `console.log` calls from all `src/` files — full codebase scan via grep. Keep `console.error` (used for caught exceptions — error handling pattern). Scope: all `.ts` and `.tsx` files under `src/`.

### TypeScript Audit
- **D-10:** Run `tsc --noEmit` and fix all reported errors. QUAL-01 requires zero errors and no `any` types. Fix any `any` type annotations found during the audit. No ESLint needed — TypeScript strict is the only static analysis in this project.

### Crash Testing & EAS Build
- **D-11:** Executor runs full key flow on iOS simulator: onboarding → biomarker entry (entering all 9 PhenoAge biomarkers) → protocol → exercise log → LongevityScore. Documents each step as passing.
- **D-12:** Produce a UAT checklist for device verification by the developer covering the same flow + the new missing-biomarker prompt UI.
- **D-13:** Run `eas build --platform ios --profile preview` to verify the release artifact compiles. Phase 9 is not complete until the EAS preview build succeeds.

### Security Audit
- **D-14:** Run `grep -r "supabase.co\|anon\|eyJ" src/ --include="*.ts" --include="*.tsx"` to confirm zero hardcoded credentials. This should already be clean from Phase 4 but must be verified as part of QUAL-03.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Formula Source
- `src/lib/phenoAge.ts` — file to fix; contains current (buggy) implementation, coefficients, and full formula logic
- Levine ME et al. "An epigenetic biomarker of aging for lifespan and healthspan." Aging Cell. 2018;17(4):e12748. DOI: 10.1111/acel.12748 — the authoritative source for all coefficients, intercept, Gompertz parameters, and inversion constants. Researcher must source reference test vectors from this paper.

### Screens Consuming PhenoAge
- `src/screens/DashboardScreen.tsx` — calls `computePhenoAge()`, has debug console.logs to strip, needs null-state UI update
- `src/screens/LongevityScoreScreen.tsx` — primary biological age display, needs missing-biomarker prompt
- `src/components/FutureSelf.tsx` — biological age projection component, needs null handling
- `src/screens/ProfileScreen.tsx` — references biological age, needs null handling

### Supporting Data
- `src/lib/phenoAge.ts` — `PHENO_AGE_BIOMARKER_MAP` and `PHENO_BIOMARKER_LIST` exports — use these for ID→label mapping in the missing-biomarker UI, do NOT duplicate locally
- `src/data/biomarkers.ts` — `BIOMARKERS` data for context on biomarker definitions

### Planning Refs
- `.planning/ROADMAP.md` §Phase 9 — requirements PHENO-01, QUAL-01, QUAL-02, QUAL-03 and success criteria
- `.planning/phases/08-biomarker-sync-write-path/08-CONTEXT.md` — D-10 establishes service pattern; no change to sync or migration logic in Phase 9

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/phenoAge.ts:PhenoAgeResult` — already includes `missingBiomarkers: string[]` and `confidence` fields; the return shape is correct, just the formula and filtering logic need to change
- `src/lib/phenoAge.ts:PHENO_BIOMARKER_LIST` — ordered list of PhenoAge biomarker IDs with labels and units; use in the missing-biomarker UI (do not create a duplicate list in screen files)
- `src/lib/phenoAge.ts:PHENO_AGE_BIOMARKER_MAP` — maps `BIOMARKERS` IDs to PhenoAge input keys; already wired

### Established Patterns
- Service pattern: pure functions in `src/lib/`, screens never call Supabase directly
- Console.log prefix pattern: `[PhenoAge]` in phenoAge.ts, `[Dashboard]` in DashboardScreen — use these prefixes when grepping to confirm full removal
- StyleSheet always named `s`; all colors from `Colors.*`; no hardcoded hex in StyleSheet blocks
- Error handling: `console.error(e)` in catch blocks — keep these; only strip `console.log` debug calls

### Integration Points
- `DashboardScreen.tsx` calls `computePhenoAge()` with the latest biomarker entry map — after the fix, the null path will be triggered far more often (once any biomarker is missing)
- `LongevityScoreScreen.tsx` and `FutureSelf.tsx` receive `biologicalAge: number | null` as props or derive it — verify prop flows and null handling in each consumer
- The `PHENO_AGE_BIOMARKER_MAP` covers 9 biomarker IDs; verify that all 9 are present in `BIOMARKERS` data so users can actually enter them

</code_context>

<specifics>
## Specific Ideas

- The verification script test cases must use values from the Levine 2018 paper or a validated calculator — not made-up numbers. The researcher should source specific expected output values (e.g., "a 50-year-old with NHANES median values should yield phenotypic age ≈ 50.x").
- "Strip console.log, keep console.error" — this distinction is important. The codebase uses `console.error(e)` in catch blocks throughout as the error handling pattern. Do not touch those.
- The formula the user provided: `M = 1 - exp(-exp(xb) × (exp(120 × 0.0076927) - 1) / 0.0076927)` — the `120` is the Gompertz time horizon (10-year mortality over the range 0–120 years). Verify this interpretation against the paper.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 9-PhenoAge Fix & Release Quality*
*Context gathered: 2026-06-01*
