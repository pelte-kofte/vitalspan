---
phase: 09-phenoage-fix-and-release-quality
plan: P3
type: execute
wave: 2
depends_on:
  - 09-P1
  - 09-P2
files_modified:
  - src/screens/LongevityScoreScreen.tsx
  - src/screens/DashboardScreen.tsx
  - src/components/FutureSelf.tsx
  - src/screens/ProfileScreen.tsx
autonomous: false
requirements:
  - QUAL-02

must_haves:
  truths:
    - "When biologicalAge is null, LongevityScoreScreen shows a named list of missing biomarkers with a CTA to log them"
    - "When biologicalAge is null, DashboardScreen bio card shows the missing biomarker names (not just a count)"
    - "FutureSelf shows all 9 biomarker checklist items when biologicalAge is null (full list, not truncated to 5)"
    - "ProfileScreen shows a missing-biomarker prompt when biological age cannot be computed"
    - "Full flow — onboarding → biomarker entry (all 9 PhenoAge biomarkers) → protocol → exercise log → LongevityScore — completes without crash on iOS simulator"
    - "EAS preview build succeeds"
  artifacts:
    - path: "src/screens/LongevityScoreScreen.tsx"
      provides: "Missing-biomarker prompt using PHENO_BIOMARKER_LIST when bioAge is null"
    - path: "src/screens/DashboardScreen.tsx"
      provides: "Updated bio card null state showing missingBiomarkers names"
    - path: "src/components/FutureSelf.tsx"
      provides: "Full 9-item checklist when biologicalAge is null"
    - path: "src/screens/ProfileScreen.tsx"
      provides: "Missing-biomarker hint when biological age cannot be shown"
  key_links:
    - from: "src/screens/LongevityScoreScreen.tsx"
      to: "phenoResult.missingBiomarkers"
      via: "computePhenoAge result"
      pattern: "missingBiomarkers"
    - from: "src/components/FutureSelf.tsx"
      to: "PHENO_BIOMARKER_LIST"
      via: "import from ../lib/phenoAge"
      pattern: "PHENO_BIOMARKER_LIST"
---

<objective>
Update the four UI consumers of biologicalAge to correctly handle the null state returned by the corrected computePhenoAge formula, then verify the full key flow is crash-free on iOS simulator and produce a passing EAS preview build.

Purpose: After P1 fixes the formula, null will be returned far more often (any missing biomarker). Without this plan, screens either show stale "confidence" UI or crash on null. This plan completes the user-facing slice: user sees exactly which biomarkers to enter next.

Output: Four updated UI files, UAT checklist, passing EAS preview build.
</objective>

<execution_context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/PROJECT.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/ROADMAP.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/09-phenoage-fix-and-release-quality/09-CONTEXT.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/09-phenoage-fix-and-release-quality/09-P1-SUMMARY.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/09-phenoage-fix-and-release-quality/09-P2-SUMMARY.md

<interfaces>
<!-- After P1: computePhenoAge return shape -->
PhenoAgeResult {
  biologicalAge: number | null;          // null when any biomarker missing/invalid
  confidence: 'high' | 'insufficient';  // only two runtime states after P1 fix
  missingCount: number;
  totalRequired: number;                 // 9
  missingBiomarkers: string[];           // human-readable labels e.g. ['Albumin', 'Creatinine']
  yearsYounger: number | null;
}

<!-- PHENO_BIOMARKER_LIST — already imported in LongevityScoreScreen and FutureSelf -->
export const PHENO_BIOMARKER_LIST: { id: string; label: string; unit: string }[] = [
  { id: 'albumin',        label: 'Albumin',              unit: 'g/dL' },
  { id: 'creatinine',     label: 'Creatinine',           unit: 'mg/dL' },
  { id: 'fastingglucose', label: 'Fasting Glucose',      unit: 'mg/dL' },
  { id: 'hscrp',          label: 'hsCRP',                unit: 'mg/L' },
  { id: 'lymphocytepct',  label: 'Lymphocyte %',         unit: '%' },
  { id: 'mcv',            label: 'MCV',                  unit: 'fL' },
  { id: 'rdw',            label: 'RDW',                  unit: '%' },
  { id: 'alp',            label: 'Alkaline Phosphatase', unit: 'U/L' },
  { id: 'wbc',            label: 'WBC',                  unit: '×10³/μL' },
]

<!-- Current null-state UI in DashboardScreen (lines 250-264) — already shows missingForPhenoAge -->
const missingForPhenoAge = phenoResult?.missingBiomarkers ?? [];
// Shows: "Need: Albumin, Creatinine +7 more" — this is CORRECT; remove 'medium' confidence branch

<!-- LongevityScoreScreen sphere text null branch (lines 472-481) — currently shows count, needs full list -->
bioAge == null:
  <Text style={s.bioAgePending}>—</Text>
  <Text style={s.bioAgeLabel}>{phenoResult != null ? `${phenoResult.missingCount} MORE BMs` : 'LOG BIOMARKERS'}</Text>
→ Replace with named list using phenoResult.missingBiomarkers

<!-- FutureSelf locked state — currently shows PHENO_BIOMARKER_LIST.slice(0, 5) — change to full 9 -->
isLocked:
  PHENO_BIOMARKER_LIST.slice(0, 5) — shows only 5 items
→ Remove .slice(0, 5): show all 9 (per D-06: show missingBiomarkers list)

<!-- ProfileScreen — biologicalAge is read from profile.biologicalAge (AsyncStorage field) -->
<!-- profile.biologicalAge is set from onboarding, NOT computed live — line 138 -->
const yearsDiff = profile.age - (profile.biologicalAge ?? profile.age);
// biologicalAge?: number in UserProfile — may be undefined
// Line 278: {profile.biologicalAge != null && <Text>{profile.biologicalAge}</Text>}
→ Add a hint below the bio age row: when profile.biologicalAge is undefined, show
  "Log the 9 PhenoAge biomarkers to compute your biological age"
  with a TouchableOpacity CTA that navigates to BiomarkerEntry
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Update 4 UI consumers for null biologicalAge (per D-06)</name>
  <files>
    src/screens/LongevityScoreScreen.tsx,
    src/screens/DashboardScreen.tsx,
    src/components/FutureSelf.tsx,
    src/screens/ProfileScreen.tsx
  </files>
  <read_first>
    - src/screens/LongevityScoreScreen.tsx — read lines 238-260 (bioAge derivation, projectedLifespan) and lines 465-485 (sphere text null branch) and lines 370-395 (transparency modal improvement section)
    - src/screens/DashboardScreen.tsx — read lines 175-185 (missingForPhenoAge derivation) and lines 230-270 (bio card null branch) and lines 240-250 (medium confidence branch)
    - src/components/FutureSelf.tsx — read lines 149-180 (locked state checklist rendering)
    - src/screens/ProfileScreen.tsx — read lines 270-290 (bio age row rendering)
  </read_first>
  <behavior>
    - DashboardScreen: null branch shows missingForPhenoAge names correctly — the existing code already derives missingForPhenoAge from phenoResult.missingBiomarkers; the 'medium' confidence branch (`phenoResult?.confidence === 'medium'`) is now dead code and must be removed
    - LongevityScoreScreen sphere: null branch shows "Missing: [name1], [name2]..." truncated to 2 names + "+N more" instead of just a count
    - FutureSelf locked state: checklist shows all 9 PHENO_BIOMARKER_LIST items (remove the .slice(0, 5) limit); the "N more needed" footer note is also updated to reflect full 9-item list
    - ProfileScreen: when profile.biologicalAge is undefined/null, a hint row appears below the biological age section saying "Log 9 biomarkers to compute" with a CTA navigating to BiomarkerEntry
    - No new imports required — PHENO_BIOMARKER_LIST already imported in LongevityScoreScreen and FutureSelf; ProfileScreen needs PHENO_BIOMARKER_LIST added to imports from ../lib/phenoAge (or use a static string — prefer static string to avoid an extra import in ProfileScreen if the feature is minor)
    - All Colors.* and Spacing.* — no hardcoded hex values introduced
    - tsc --noEmit still passes after all 4 files are edited
  </behavior>
  <action>
    Apply targeted edits to 4 files. Read each relevant section before editing.

    FILE 1 — src/screens/DashboardScreen.tsx:
    Remove the dead 'medium' confidence branch (the `phenoResult?.confidence === 'medium'` block inside the bioAge != null branch, lines ~243-248). This was the "Estimated · Log N more biomarkers for precision" text — it used a confidence tier that no longer exists after P1. The null branch (bioAge == null) already correctly shows the missingForPhenoAge list — keep it unchanged.

    FILE 2 — src/screens/LongevityScoreScreen.tsx:
    In the sphere text null branch (lines ~473-480), replace the count-based label:
      `${phenoResult.missingCount} MORE BMs`
    With a human-readable missing list. Use phenoResult.missingBiomarkers from computePhenoAge result. Show up to 2 names + "+N more" pattern, e.g.:
      `${phenoResult.missingBiomarkers.slice(0,2).join(', ')}${phenoResult.missingBiomarkers.length > 2 ? ` +${phenoResult.missingBiomarkers.length - 2}` : ''}`
    Keep the outer conditional structure (`phenoResult != null ? ... : 'LOG BIOMARKERS'`) intact.

    Also in LongevityScoreScreen, update projectedLifespan derivation (lines ~268-272):
    The existing string `Log ${phenoResult.missingCount} more biomarkers to unlock` is acceptable — keep it or replace with the first missing biomarker name for specificity. Either form is acceptable as long as it references missingBiomarkers rather than a hardcoded string.

    FILE 3 — src/components/FutureSelf.tsx:
    In the locked state checklist (line ~155), change `PHENO_BIOMARKER_LIST.slice(0, 5)` to `PHENO_BIOMARKER_LIST` (remove the .slice). This shows all 9 items.
    Update the footer note at line ~174: the `5 -` and `< 5` in the condition need to change to `9` and `< 9`. Specifically:
      `5 - Math.min(...)` → `PHENO_BIOMARKER_LIST.length - Math.min(...)`
      `< 5` comparison → `< PHENO_BIOMARKER_LIST.length`
    Also update the locked header message: `'Log these 5 biomarkers to unlock projection'` → `'Log these 9 biomarkers to unlock projection'` (or use `PHENO_BIOMARKER_LIST.length` dynamically).

    FILE 4 — src/screens/ProfileScreen.tsx:
    In the bio age section (around lines 278-282), after the existing `{profile.biologicalAge != null && ...}` block, add an else branch:
    When profile.biologicalAge is null or undefined, show a hint row with static text "Log the 9 PhenoAge biomarkers to compute your biological age" and a TouchableOpacity that navigates to BiomarkerEntry. Style using existing s.rowLabel / s.rowValue styles for consistency. Import PHENO_BIOMARKER_LIST is NOT required — use the static count "9". Import computePhenoAge is NOT required — ProfileScreen reads biologicalAge from AsyncStorage profile, not by computing it live.
    Add a navigation import for BiomarkerEntry if not already present — check existing nav usage in the file. ProfileScreen already uses `nav.navigate('Onboarding')` so navigation is available.
  </action>
  <verify>
    <automated>
      cd /Users/bekircemkusdemir/Downloads/vitalspan && npx tsc --noEmit 2>&1 | wc -l | tr -d ' '
      grep -n "confidence === 'medium'" src/screens/DashboardScreen.tsx && echo "DEAD_CODE_FOUND=FAIL" || echo "DEAD_CODE_GONE=pass"
      grep -n "slice(0, 5)" src/components/FutureSelf.tsx && echo "SLICE_STILL_PRESENT=FAIL" || echo "FULL_LIST=pass"
      grep -n "missingBiomarkers" src/screens/LongevityScoreScreen.tsx && echo "MISSING_LIST_PRESENT=pass" || echo "MISSING_LIST_ABSENT=FAIL"
    </automated>
  </verify>
  <done>
    - tsc --noEmit exits 0 (zero output)
    - DashboardScreen: no 'medium' confidence branch in the rendered output
    - LongevityScoreScreen: sphere null branch uses phenoResult.missingBiomarkers (not just missingCount)
    - FutureSelf: PHENO_BIOMARKER_LIST rendered without .slice(0, 5) limit
    - ProfileScreen: null biologicalAge shows "Log 9 PhenoAge biomarkers" hint with BiomarkerEntry CTA
    - No hardcoded hex colors introduced in any of the 4 files
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Full key flow verification + UAT checklist + EAS preview build</name>
  <what-built>
    Task 1 updated 4 UI screens to correctly show missing biomarker lists when biological age is null. The PhenoAge formula fix (P1) and TypeScript/console.log cleanup (P2) are complete. This checkpoint verifies the complete Phase 9 delivery before EAS build.
  </what-built>
  <how-to-verify>
    PART A — Simulator flow verification (D-11):
    1. Start the app: `npx expo start --ios`
    2. Fresh install or clear AsyncStorage (Settings → Clear all data if available).
    3. Complete onboarding (name, age, sex, goal).
    4. Navigate to Biomarkers tab → tap "Add biomarker".
    5. Log all 9 PhenoAge biomarkers one by one:
       - Albumin (e.g. 4.3 g/dL)
       - Creatinine (e.g. 0.9 mg/dL)
       - Fasting Glucose (e.g. 92 mg/dL)
       - hsCRP (e.g. 0.8 mg/L)
       - Lymphocyte % (e.g. 28 %)
       - MCV (e.g. 90 fL)
       - RDW (e.g. 12.8 %)
       - Alkaline Phosphatase (e.g. 67 U/L)
       - WBC (e.g. 6.0 ×10³/μL)
    6. Return to Dashboard — verify biological age number appears (not "—").
    7. Navigate to Protocol tab — verify no crash.
    8. Navigate to Exercise tab — add an exercise log entry — verify no crash.
    9. Tap the bio age card on Dashboard to open LongevityScore — verify bio age shows in sphere center.
    10. On LongevityScore, tap "?" → verify Explainer modal opens without crash.
    11. Clear 1 biomarker entry (or test with only 8 logged) and return to Dashboard — verify "—" appears with missing biomarker names listed.

    PART B — UAT checklist verification:
    Confirm each item:
    [ ] Onboarding → Dashboard navigation completes without crash
    [ ] Dashboard bio card shows numeric biological age when all 9 biomarkers are logged
    [ ] Dashboard bio card shows missing biomarker names (not just "—") when any biomarker is absent
    [ ] LongevityScore sphere shows bio age number when all 9 present
    [ ] LongevityScore sphere shows missing biomarker names in null state
    [ ] FutureSelf card shows 9-item checklist in locked state
    [ ] ProfileScreen shows "Log 9 PhenoAge biomarkers" hint when biologicalAge is not set
    [ ] Protocol tab loads without crash
    [ ] Exercise tab loads and log entry works without crash
    [ ] No console.log output visible in Metro bundler log during any of the above flows

    PART C — EAS preview build (D-13):
    Run: `eas build --platform ios --profile preview`
    This command submits to EAS Build — wait for the build to complete (typically 10-20 min).
    Phase 9 is NOT complete until this build succeeds (exits 0 / EAS dashboard shows "Build successful").
  </how-to-verify>
  <resume-signal>
    Type "approved" if all UAT items pass and EAS build succeeds.
    Describe any failures (e.g. "crash on LongevityScore", "EAS build failed with error X") if issues found.
  </resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| UI → computePhenoAge | Screens consume null return value; UI must not crash on null |
| iOS simulator → EAS build | Simulator passing does not guarantee EAS build passes; both must be verified |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-09P3-01 | Denial of Service | null biologicalAge rendering | mitigate | All 4 UI consumers handle null explicitly — no unguarded .toFixed() or arithmetic on null |
| T-09P3-02 | Information Disclosure | EAS build artifacts | accept | Preview profile builds are internal TestFlight only; no public distribution until user approves |
| T-09P3-SC | Tampering | npm/pip/cargo installs | accept | No new packages; EAS build uses existing lockfile |
</threat_model>

<verification>
After Task 1 + checkpoint approval:
- tsc --noEmit exits 0
- grep -n "confidence === 'medium'" src/screens/DashboardScreen.tsx returns zero results
- grep -n "slice(0, 5)" src/components/FutureSelf.tsx returns zero results
- grep -n "missingBiomarkers" src/screens/LongevityScoreScreen.tsx returns at least 1 result
- EAS build succeeds (D-13 gate)
- All UAT checklist items confirmed by developer
</verification>

<success_criteria>
- QUAL-02: Full key flow (onboarding → biomarker entry → protocol → exercise → LongevityScore) completes without crash on iOS simulator
- D-06 satisfied: all 4 screens show missingBiomarkers list when biologicalAge is null
- D-13 satisfied: eas build --platform ios --profile preview succeeds
- UAT checklist signed off by developer
</success_criteria>

<output>
Create `.planning/phases/09-phenoage-fix-and-release-quality/09-P3-SUMMARY.md` when done
</output>
