---
phase: 09-phenoage-fix-and-release-quality
plan: P1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/phenoAge.ts
  - src/lib/phenoAge.verify.ts
autonomous: true
requirements:
  - PHENO-01

must_haves:
  truths:
    - "computePhenoAge with all 9 biomarker values + age returns a numeric biologicalAge"
    - "computePhenoAge with any missing, zero, or negative biomarker returns biologicalAge: null and confidence: 'insufficient'"
    - "The mortality probability formula matches the Levine 2018 Gompertz form exactly"
    - "No LAMBDA constant exists anywhere in phenoAge.ts"
    - "No MEDIANS block or ?? MEDIANS fallback exists anywhere in phenoAge.ts"
    - "phenoAge.verify.ts runs via ts-node and prints pass/fail for all 3 reference cases"
  artifacts:
    - path: "src/lib/phenoAge.ts"
      provides: "Corrected Levine PhenoAge formula — no LAMBDA, no MEDIANS, strict null on any missing input"
      contains: "GAMMA = 0.0076927"
    - path: "src/lib/phenoAge.verify.ts"
      provides: "Standalone verification script with 3 reference test cases"
      contains: "npx ts-node"
  key_links:
    - from: "src/lib/phenoAge.ts"
      to: "computePhenoAge return value"
      via: "mortality formula with GAMMA"
      pattern: "exp\\(120 \\* 0\\.0076927\\)"
---

<objective>
Fix the Levine PhenoAge formula in src/lib/phenoAge.ts to match the published 2018 paper exactly, and write a standalone verification script that proves correctness against 3 reference cases.

Purpose: The current formula uses a LAMBDA constant and a MEDIANS substitution block — both incorrect. The corrected formula eliminates LAMBDA entirely, uses the proper Gompertz time-horizon expression, and returns null immediately when any required biomarker is missing. This is the scientific foundation for all biological age displays in the app.

Output: Corrected phenoAge.ts + new phenoAge.verify.ts that passes all 3 reference cases.
</objective>

<execution_context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/PROJECT.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/ROADMAP.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/09-phenoage-fix-and-release-quality/09-CONTEXT.md

<interfaces>
<!-- Key types from src/lib/phenoAge.ts that must remain unchanged after the fix -->

export interface PhenoAgeInputs {
  albumin?: number;           // g/dL
  creatinine?: number;        // mg/dL
  glucose?: number;           // mg/dL (fasting)
  crp?: number;               // mg/L  (hsCRP or CRP)
  lymphocytePct?: number;     // %
  mcv?: number;               // fL
  rdw?: number;               // %
  alkalinePhosphatase?: number; // U/L
  wbc?: number;               // 10^3/μL
  age: number;                // chronological age in years
  [key: string]: number | undefined;
}

export interface PhenoAgeResult {
  biologicalAge: number | null;
  confidence: 'high' | 'medium' | 'low' | 'insufficient';
  missingCount: number;
  totalRequired: number;
  missingBiomarkers: string[];
  yearsYounger: number | null;
}

// Current (buggy) mortality line — REPLACE THIS:
const LAMBDA = 0.0000001025;  // DELETE entirely
const mortProb = 1 - Math.exp(-LAMBDA * Math.exp(xb) / GAMMA);  // WRONG

// Correct Gompertz mortality formula (D-01):
// M = 1 - exp(-exp(xb) × (exp(120 × GAMMA) - 1) / GAMMA)
// = 1 - Math.exp(-Math.exp(xb) * (Math.exp(120 * 0.0076927) - 1) / 0.0076927)

// Inversion constants (verified against Levine 2018):
// 141.50225, 0.00553, 0.090165
// phenoAge = 141.50225 + Math.log(innerLog) / 0.090165
// innerLog = -0.00553 * Math.log(1 - clampedProb)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Fix phenoAge.ts — remove LAMBDA + MEDIANS, correct mortality formula, strict null logic</name>
  <files>src/lib/phenoAge.ts</files>
  <read_first>
    - src/lib/phenoAge.ts — read in full to know every line to change (current: LAMBDA constant line 48, MEDIANS block lines 103-113, fallback assignments lines 116-125, buggy mortProb line 163, confidence tier logic lines 82-98, all console.log calls lines 76/128/157-160/164/168/176/180/184)
  </read_first>
  <behavior>
    - computePhenoAge({age:50, albumin:4.3, creatinine:0.9, glucose:92, crp:0.8, lymphocytePct:28, mcv:90, rdw:12.8, alkalinePhosphatase:67, wbc:6.0}) returns { biologicalAge: number, confidence: 'high', missingBiomarkers: [] }
    - computePhenoAge({age:50}) — age only, all 9 biomarkers omitted — returns { biologicalAge: null, confidence: 'insufficient', missingBiomarkers: ['Albumin','Creatinine','Fasting Glucose','hsCRP / CRP','Lymphocyte %','MCV','RDW','Alkaline Phosphatase','WBC'] }
    - computePhenoAge({age:50, albumin:4.3}) — 8 missing — returns { biologicalAge: null, confidence: 'insufficient' }
    - computePhenoAge({age:50, albumin:0, creatinine:0.9, glucose:92, crp:0.8, lymphocytePct:28, mcv:90, rdw:12.8, alkalinePhosphatase:67, wbc:6.0}) — albumin=0 is invalid — returns null
    - computePhenoAge({age:50, albumin:-1, creatinine:0.9, glucose:92, crp:0.8, lymphocytePct:28, mcv:90, rdw:12.8, alkalinePhosphatase:67, wbc:6.0}) — albumin negative — returns null
    - CRP zero or negative guard still fires and returns null with 'hsCRP (invalid value)' in missingBiomarkers
    - PhenoAgeResult.confidence is only ever 'high' (all present) or 'insufficient' (any missing) — never 'medium' or 'low'
  </behavior>
  <action>
    Rewrite computePhenoAge in src/lib/phenoAge.ts applying all changes from D-01 through D-05 and D-09:

    1. Delete the LAMBDA constant declaration (currently: `const LAMBDA = 0.0000001025;`).

    2. Remove the entire MEDIANS block (const MEDIANS = {...}) and all `?? MEDIANS.x` fallback expressions. Replace the 9 variable assignments (alb, cr, glu, crpRaw, lymph, mcv, rdw, alp, wbc) with strict direct reads: `const alb = inputs.albumin;` etc. — no nullish coalescing.

    3. Move the existing validation loop (which collects missing[]) to run first. After the loop, if missing.length > 0 OR if any required field is zero/negative, return immediately:
       `return { biologicalAge: null, confidence: 'insufficient', missingCount: missing.length, totalRequired: REQUIRED_FIELDS.length, missingBiomarkers: missing, yearsYounger: null }`.

    4. The validation loop already checks `val == null || val <= 0` for all 9 biomarker fields — this satisfies D-03 (missing, zero, or negative → null). Keep this predicate unchanged.

    5. Remove the tiered confidence block (lines 82–98: the if/else chain that assigned 'medium'/'low'/'insufficient'). After the new strict null return, confidence is always 'high' when execution reaches the computation block.

    6. Replace the buggy mortality probability line:
       OLD: `const mortProb = 1 - Math.exp(-LAMBDA * Math.exp(xb) / GAMMA);`
       NEW (per D-01): `const mortProb = 1 - Math.exp(-Math.exp(xb) * (Math.exp(120 * GAMMA) - 1) / GAMMA);`
       GAMMA is already defined as `0.0076927` — use it here; do not hardcode the constant inline.

    7. Remove ALL console.log calls (lines 76, 128, 157, 158, 159, 160, 164, 168, 176, 180, 184). The CRP guard now returns early in the validation block — remove its stale console.log; the guard itself (crpRaw <= 0 check) is preserved per D-05. Keep the CRP unit conversion `Math.log(crpRaw / 10)`.

    8. Remove the intermediate `present` array and its filter (was used only for the removed console.log on line 72-76).

    9. Remove the intermediate `missingCount` and `totalRequired` variables that were computed before the tiered confidence block — compute them inline in the return statement: `missingCount: missing.length, totalRequired: REQUIRED_FIELDS.length`.

    10. COEFFICIENTS, INTERCEPT, GAMMA, REQUIRED_FIELDS, PHENO_AGE_BIOMARKER_MAP, PHENO_BIOMARKER_LIST — leave unchanged. The PhenoAgeResult interface's confidence field type must keep all four union members ('high' | 'medium' | 'low' | 'insufficient') because downstream consumers may type-check against it — only the runtime values change.

    11. Verify inversion constants are already correct: `141.50225`, `0.00553`, `0.090165` — check lines 174 and 179 confirm these values; no change needed if they match.
  </action>
  <verify>
    <automated>
      cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -c "LAMBDA" src/lib/phenoAge.ts | grep -q "^0$" && echo "LAMBDA_GONE=pass" || echo "LAMBDA_GONE=FAIL"
      grep -c "MEDIANS" src/lib/phenoAge.ts | grep -q "^0$" && echo "MEDIANS_GONE=pass" || echo "MEDIANS_GONE=FAIL"
      grep -v "^//" src/lib/phenoAge.ts | grep -c "console\.log" | grep -q "^0$" && echo "NO_CONSOLELOG=pass" || echo "NO_CONSOLELOG=FAIL"
      grep "exp(120 \* GAMMA)" src/lib/phenoAge.ts && echo "FORMULA=pass" || echo "FORMULA=FAIL"
      npx ts-node -e "const {computePhenoAge}=require('./src/lib/phenoAge'); const r=computePhenoAge({age:50,albumin:4.3,creatinine:0.9,glucose:92,crp:0.8,lymphocytePct:28,mcv:90,rdw:12.8,alkalinePhosphatase:67,wbc:6.0}); console.log('full_set:',r.biologicalAge,r.confidence);" 2>/dev/null
      npx ts-node -e "const {computePhenoAge}=require('./src/lib/phenoAge'); const r=computePhenoAge({age:50}); console.log('age_only:',r.biologicalAge,r.confidence,r.missingBiomarkers.length);" 2>/dev/null
    </automated>
  </verify>
  <done>
    - grep -c "LAMBDA" src/lib/phenoAge.ts returns 0
    - grep -c "MEDIANS" src/lib/phenoAge.ts returns 0
    - grep -v "^//" src/lib/phenoAge.ts | grep -c "console\.log" returns 0
    - grep finds "exp(120 \* GAMMA)" in the mortality probability line
    - computePhenoAge with all 9 biomarkers + age returns a numeric biologicalAge and confidence 'high'
    - computePhenoAge with age only returns { biologicalAge: null, confidence: 'insufficient', missingBiomarkers.length: 9 }
  </done>
</task>

<task type="auto">
  <name>Task 2: Write phenoAge.verify.ts — 3 reference test cases from Levine 2018</name>
  <files>src/lib/phenoAge.verify.ts</files>
  <read_first>
    - src/lib/phenoAge.ts — read computePhenoAge signature and PHENO_AGE_BIOMARKER_MAP after Task 1 edits are applied, to confirm import path and function signature
  </read_first>
  <action>
    Create src/lib/phenoAge.verify.ts as a standalone ts-node script (per D-07, D-08). This file is NOT imported by any app code — it is run directly via `npx ts-node src/lib/phenoAge.verify.ts`.

    The script must:
    1. Import computePhenoAge from './phenoAge' (relative import).
    2. Define 3 test cases using values sourced from Levine 2018 / validated NHANES data:

       CASE 1 — NHANES population median, age 50:
       inputs: { age: 50, albumin: 4.3, creatinine: 0.9, glucose: 92.0, crp: 0.8, lymphocytePct: 28.0, mcv: 90.0, rdw: 12.8, alkalinePhosphatase: 67.0, wbc: 6.0 }
       expected: biologicalAge in range [47, 53] (median values should yield bio age ≈ chrono age)
       rationale: Population median inputs should map to approximately chronological age

       CASE 2 — Optimal / "healthy 50-year-old" profile:
       inputs: { age: 50, albumin: 4.7, creatinine: 0.8, glucose: 83.0, crp: 0.3, lymphocytePct: 35.0, mcv: 88.0, rdw: 12.0, alkalinePhosphatase: 50.0, wbc: 5.0 }
       expected: biologicalAge < 50 (optimal values → younger bio age)
       rationale: All values pushed toward longevity-optimal side of normal range

       CASE 3 — Suboptimal / "adverse 50-year-old" profile:
       inputs: { age: 50, albumin: 3.8, creatinine: 1.3, glucose: 115.0, crp: 3.5, lymphocytePct: 20.0, mcv: 95.0, rdw: 14.5, alkalinePhosphatase: 95.0, wbc: 8.5 }
       expected: biologicalAge > 50 (adverse values → older bio age)
       rationale: All values pushed toward adverse side of normal range

    3. For each case, call computePhenoAge, check the assertion, and print:
       PASS or FAIL with the actual biologicalAge and expected range/direction.

    4. Exit with process.exit(1) if any case fails, process.exit(0) if all pass.

    5. Do NOT add a ts-node shebang line. Do NOT use Jest or any test framework — plain TypeScript with console.log output only.

    6. Add a JSDoc comment at the top: `/** Dev-only verification script. Not imported by app code. Run: npx ts-node src/lib/phenoAge.verify.ts */`

    Do NOT add phenoAge.verify.ts to .gitignore — it is source-controlled as a dev tool per D-08, just not bundled by Expo (Expo only bundles files reachable from the entry point).
  </action>
  <verify>
    <automated>
      cd /Users/bekircemkusdemir/Downloads/vitalspan && npx ts-node src/lib/phenoAge.verify.ts
    </automated>
  </verify>
  <done>
    - npx ts-node src/lib/phenoAge.verify.ts exits 0 with all 3 cases printing PASS
    - File contains the JSDoc dev-only comment
    - File uses process.exit(0) / process.exit(1) for CI-friendly signalling
    - No import from App.tsx or any screen file exists pointing at this file
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user input → computePhenoAge | Biomarker values from UI/storage enter the pure formula function |
| formula output → biological age display | Computed number rendered in UI without further validation |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-09P1-01 | Tampering | computePhenoAge inputs | mitigate | All inputs validated: null/undefined/zero/negative → return null before computation; no bypass path exists |
| T-09P1-02 | Information Disclosure | phenoAge.verify.ts | accept | Dev-only script; not in app bundle; no PII; no credentials; safe to source-control |
| T-09P1-SC | Tampering | npm/pip/cargo installs | accept | No new packages installed in this plan; ts-node already in devDependencies |
</threat_model>

<verification>
After both tasks complete:
- grep -c "LAMBDA" src/lib/phenoAge.ts === 0
- grep -c "MEDIANS" src/lib/phenoAge.ts === 0
- grep -v "^//" src/lib/phenoAge.ts | grep -c "console\.log" === 0
- npx ts-node src/lib/phenoAge.verify.ts exits 0, prints 3x PASS
- tsc --noEmit still passes (no new type errors introduced)
</verification>

<success_criteria>
- PHENO-01: Levine PhenoAge formula corrected and verified against published coefficients
- computePhenoAge returns correct biological age for a complete biomarker set
- computePhenoAge returns null immediately for any missing/zero/negative biomarker
- Verification script passes all 3 reference cases
</success_criteria>

<output>
Create `.planning/phases/09-phenoage-fix-and-release-quality/09-P1-SUMMARY.md` when done
</output>
