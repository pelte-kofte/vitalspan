---
phase: 09-phenoage-fix-and-release-quality
plan: P2
type: execute
wave: 1
depends_on: []
files_modified:
  - src/screens/DashboardScreen.tsx
  - src/screens/LongevityScoreScreen.tsx
autonomous: true
requirements:
  - QUAL-01
  - QUAL-03

must_haves:
  truths:
    - "Zero console.log calls exist anywhere in src/"
    - "tsc --noEmit exits with zero errors"
    - "grep for Supabase URL or anon key in src/ returns zero hardcoded credential matches"
    - "All console.error in catch blocks are preserved"
  artifacts:
    - path: "src/screens/DashboardScreen.tsx"
      provides: "Dashboard with console.log removed"
    - path: "src/screens/LongevityScoreScreen.tsx"
      provides: "LongevityScore with console.log removed"
  key_links:
    - from: "src/screens/DashboardScreen.tsx"
      to: "tsc --noEmit"
      via: "TypeScript strict check"
      pattern: "noImplicitAny"
    - from: "src/screens/LongevityScoreScreen.tsx"
      to: "tsc --noEmit"
      via: "TypeScript strict check"
      pattern: "noImplicitAny"
---

<objective>
Remove all console.log debug calls from src/, fix any TypeScript errors found by tsc --noEmit, and confirm zero hardcoded Supabase credentials.

Purpose: These are the QUAL-01 (zero tsc errors) and QUAL-03 (clean security audit) release gates. This plan runs in parallel with P1 (formula fix) since the files it touches do not overlap with phenoAge.ts.

Output: src/ with zero console.log calls, clean tsc output, and a passing security audit.
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
<!-- Console.log locations confirmed by grep (exact lines to remove): -->

src/screens/DashboardScreen.tsx:145 — inside useMemo, guarded by __DEV__:
  if (__DEV__) {
    console.log('[Dashboard] phenoAge entryMap keys:', Array.from(entryMap.keys()).join(','));
  }
  DELETE the entire if (__DEV__) block (3 lines).

src/screens/LongevityScoreScreen.tsx:212 — inside useMemo, no __DEV__ guard:
  console.log('[LongevityScore] entryMap keys:', Array.from(entryMap.keys()).join(','));
  DELETE this single line.

<!-- console.error calls to PRESERVE (do not touch): -->
src/screens/DashboardScreen.tsx — console.error('[loadData] parse error', e) in catch block — KEEP
src/screens/LongevityScoreScreen.tsx — loadAll().catch(console.error) — KEEP
src/screens/ProfileScreen.tsx — .catch(console.error) — KEEP
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Strip console.log from DashboardScreen and LongevityScoreScreen</name>
  <files>src/screens/DashboardScreen.tsx, src/screens/LongevityScoreScreen.tsx</files>
  <read_first>
    - src/screens/DashboardScreen.tsx — read lines 135-155 to see the __DEV__ console.log block in context (the useMemo that computes phenoResult); confirm no other console.log calls exist in this file
    - src/screens/LongevityScoreScreen.tsx — read lines 200-220 to see the console.log on line 212 in the phenoResult useMemo; confirm no other console.log calls exist in this file
  </read_first>
  <action>
    Apply two targeted edits (per D-09):

    EDIT 1 — DashboardScreen.tsx:
    Remove the 3-line __DEV__ block at lines 144-146:
      if (__DEV__) {
        console.log('[Dashboard] phenoAge entryMap keys:', Array.from(entryMap.keys()).join(','));
      }
    The surrounding useMemo (phenoResult computation) remains intact — only these 3 lines are deleted.

    EDIT 2 — LongevityScoreScreen.tsx:
    Remove the single line at line 212:
      console.log('[LongevityScore] entryMap keys:', Array.from(entryMap.keys()).join(','));
    The surrounding useMemo (phenoResult computation) remains intact — only this 1 line is deleted.

    Do NOT touch any console.error calls. Do NOT reformat or restructure the surrounding code.

    After edits, run a verification grep to confirm zero console.log remain across all of src/:
      grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx"
    This should return zero results. If the grep was already run and confirmed only these 2 files + phenoAge.ts contain console.log calls, and phenoAge.ts console.logs are removed in P1, then after these edits the full src/ should be clean.

    Note: phenoAge.ts console.log calls are handled in P1 (Wave 1 parallel plan). This task covers only the 2 screen files. The combined result of P1+P2 is zero console.log in all of src/.
  </action>
  <verify>
    <automated>
      cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -rn "console\.log" src/screens/DashboardScreen.tsx src/screens/LongevityScoreScreen.tsx | grep -v "console\.error" && echo "FOUND_LOGS=FAIL" || echo "NO_LOGS_IN_SCREENS=pass"
    </automated>
  </verify>
  <done>
    - grep -rn "console\.log" src/screens/DashboardScreen.tsx returns zero matches
    - grep -rn "console\.log" src/screens/LongevityScoreScreen.tsx returns zero matches
    - Both files compile (no syntax errors introduced by deletions)
    - console.error calls in both files remain intact
  </done>
</task>

<task type="auto">
  <name>Task 2: Run tsc --noEmit and fix all errors; run security audit</name>
  <files>src/screens/DashboardScreen.tsx, src/screens/LongevityScoreScreen.tsx</files>
  <read_first>
    - Run `npx tsc --noEmit` first and capture output — read actual errors before touching any file. Errors in P1's files (phenoAge.ts) are expected to be fixed by P1; focus on errors in any other src/ files.
    - For each file reported with errors: read the relevant lines in that file before editing.
  </read_first>
  <action>
    Per D-10:

    1. Run `npx tsc --noEmit` from the project root and capture output.

    2. If the output is empty (zero errors), record "tsc: zero errors — no fixes needed" and proceed to the security audit.

    3. If errors exist:
       - Read the file at the reported line before editing.
       - Fix each error using the minimal change required: add explicit type annotations, replace `any` with the correct type, add missing return types.
       - NEVER use `as any` or `// @ts-ignore` as a fix — these would reintroduce violations.
       - TypeScript strict is the only static analysis tool in this project (per CLAUDE.md); no ESLint to consider.
       - Errors in phenoAge.ts are expected to be absent after P1; if P1 and P2 run in parallel and phenoAge.ts still has errors, note them in the SUMMARY as "P1 dependency — will resolve after P1 completes."

    4. After fixing all errors, run `npx tsc --noEmit` again and confirm zero output.

    5. Security audit (per D-14):
       Run: `grep -r "supabase\.co\|ANON_KEY\|eyJh" src/ --include="*.ts" --include="*.tsx"`
       Expected output: zero matches (supabase.ts uses `process.env.EXPO_PUBLIC_*` not literals).
       If any match is found, redact the literal and replace with the env var reference.
       Record the grep result (zero matches) in the task output.

    Note: The initial grep run showed `src/lib/supabase.ts:21: const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!` — this is reading from env var, NOT a hardcoded credential. The security audit regex (`supabase\.co\|anon\|eyJ`) may match the variable name `supabaseAnonKey` — refine the grep to `grep -r "supabase\.co\|eyJh" src/` to avoid false positives on variable names. The QUAL-03 criterion is: no hardcoded Supabase URL (`*.supabase.co`) or JWT token (`eyJ*`) in source.
  </action>
  <verify>
    <automated>
      cd /Users/bekircemkusdemir/Downloads/vitalspan && npx tsc --noEmit 2>&1 | wc -l | tr -d ' '
      grep -rn "supabase\.co\|eyJh" src/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' '
    </automated>
  </verify>
  <done>
    - npx tsc --noEmit produces zero output (exit 0)
    - grep for hardcoded supabase.co URL or eyJh JWT prefix in src/ returns 0 matches
    - QUAL-01 satisfied: TypeScript compiles clean
    - QUAL-03 satisfied: no hardcoded credentials in source
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| source code → tsc type checker | All src/ files must pass strict TypeScript; no `any` escape hatches |
| source code → grep audit | No Supabase URL or JWT in committed files |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-09P2-01 | Information Disclosure | src/ files | mitigate | grep -r "supabase\.co\|eyJh" src/ confirms zero hardcoded credentials — executed in Task 2 |
| T-09P2-02 | Tampering | TypeScript any types | mitigate | tsc --noEmit with strict mode catches all any type violations; fix without using as any or @ts-ignore |
| T-09P2-SC | Tampering | npm/pip/cargo installs | accept | No new packages installed in this plan |
</threat_model>

<verification>
After both tasks complete:
- grep -rn "console\.log" src/screens/DashboardScreen.tsx src/screens/LongevityScoreScreen.tsx returns zero results
- npx tsc --noEmit exits 0 with zero output
- grep -rn "supabase\.co\|eyJh" src/ --include="*.ts" --include="*.tsx" returns zero results
- console.error calls across src/ remain intact (verify with grep -rn "console\.error" src/ returns expected results)
</verification>

<success_criteria>
- QUAL-01: tsc --noEmit exits with zero errors
- QUAL-03: grep confirms zero hardcoded Supabase URL or anon key in src/
- All console.log debug calls removed from both screen files
- No console.error catch-block patterns disturbed
</success_criteria>

<output>
Create `.planning/phases/09-phenoage-fix-and-release-quality/09-P2-SUMMARY.md` when done
</output>
