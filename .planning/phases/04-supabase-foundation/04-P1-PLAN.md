---
phase: 04-supabase-foundation
plan: P1
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - src/lib/supabase.ts
  - .env.example
autonomous: false
requirements:
  - SUPA-01
  - SEC-01
must_haves:
  truths:
    - "src/lib/supabase.ts exists and exports a supabase singleton and initSupabaseSession function"
    - "Any file that imports from src/lib/supabase.ts receives a single initialized client — no second createClient call anywhere"
    - "No Supabase URL or anon key literal appears in any .ts or .tsx source file — all values read via process.env.EXPO_PUBLIC_*"
    - ".env.example exists with placeholder keys so a new developer knows what to configure"
  artifacts:
    - path: "src/lib/supabase.ts"
      provides: "Supabase singleton with AsyncStorage persistence and AppState JWT lifecycle"
      exports: ["supabase", "initSupabaseSession"]
    - path: ".env.example"
      provides: "Developer onboarding — key names without real values"
      contains: "EXPO_PUBLIC_SUPABASE_URL="
  key_links:
    - from: "src/lib/supabase.ts"
      to: "process.env.EXPO_PUBLIC_SUPABASE_URL"
      via: "const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!"
      pattern: "process\\.env\\.EXPO_PUBLIC_SUPABASE_URL"
    - from: "src/lib/supabase.ts"
      to: "AsyncStorage"
      via: "auth.storage: AsyncStorage in createClient options"
      pattern: "storage: AsyncStorage"
---

<objective>
Install the two required Supabase packages and create the supabase.ts singleton that all future phases will import. Also create .env.example to document the required environment variables.

Purpose: Every subsequent phase that touches Supabase (SUPA-02 through SUPA-07) imports from src/lib/supabase.ts. This plan makes that file exist with the correct configuration — the polyfill guard, AsyncStorage persistence, AppState JWT lifecycle management, and zero hardcoded secrets.

Output: package.json updated with @supabase/supabase-js and react-native-url-polyfill; src/lib/supabase.ts singleton created; .env.example created.
</objective>

<execution_context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/ROADMAP.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/REQUIREMENTS.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/STATE.md

<interfaces>
<!-- Key patterns from src/lib/healthkit.ts that supabase.ts must replicate -->

File header JSDoc style (healthkit.ts lines 1-14):
  Multi-line JSDoc block at top of file explaining what the module is, its status,
  and any constraints (packages required, import ordering, etc.)

Typed async export signature (healthkit.ts lines 62, 175):
  export async function functionName(): Promise<ReturnType>
  All exported lib functions have explicit return types — no implicit any.

Non-fatal error handling (healthkit.ts lines 63-68, 117-119):
  try { ... } catch { return null; }
  Or: if (error) { console.warn('[Vitalspan] tag:', error.message); }
  Lib functions NEVER throw — they absorb errors and return a safe fallback.

Platform guard (healthkit.ts lines 57-59):
  if (Platform.OS !== 'web') { /* native-only */ }

AsyncStorage import (healthkit.ts line 17):
  import AsyncStorage from '@react-native-async-storage/async-storage';
</interfaces>
</context>

<tasks>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 1: Verify package legitimacy before install</name>
  <what-built>Nothing installed yet. This checkpoint verifies the two packages to install are legitimate before running npx expo install.</what-built>
  <how-to-verify>
    1. Visit https://www.npmjs.com/package/@supabase/supabase-js — confirm it exists, is maintained by "supabase", and has recent publish activity
    2. Visit https://www.npmjs.com/package/react-native-url-polyfill — confirm it exists, is maintained by "charpeni", and has 1M+ weekly downloads
    3. Confirm neither package name is a typo of a legitimate package (squatting check)
  </how-to-verify>
  <resume-signal>Type "packages verified" to proceed to install, or describe any concern</resume-signal>
</task>

<task type="auto">
  <name>Task 2: Install Supabase packages and create supabase.ts singleton</name>
  <files>package.json, src/lib/supabase.ts, .env.example</files>

  <read_first>
    - package.json — verify current dependency list; confirm @supabase/supabase-js and react-native-url-polyfill are absent before running install
    - src/lib/healthkit.ts — read the full file; replicate its JSDoc header style, const declarations at module top, typed async export signatures, non-fatal catch pattern, and Platform.OS guard
    - .env — read to confirm EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are present (do NOT copy values anywhere else)
  </read_first>

  <action>
    Step 1 — Install packages (run from project root):
      npx expo install @supabase/supabase-js react-native-url-polyfill
    This writes the Expo-compatible versions into package.json automatically. Do not manually edit package.json.

    Step 2 — Create src/lib/supabase.ts with the following structure (per D-RESEARCH pattern):
      - ABSOLUTE FIRST LINE must be: import 'react-native-url-polyfill/auto'
        No comment, no blank line, no other import may precede this line.
      - Second line: import AsyncStorage from '@react-native-async-storage/async-storage'
      - Third line: import { createClient } from '@supabase/supabase-js'
      - Fourth line: import { AppState, Platform } from 'react-native'
      - Blank line, then two const declarations using process.env.EXPO_PUBLIC_SUPABASE_URL! and process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY! — no string literals, no fallbacks
      - Export the supabase singleton via createClient(supabaseUrl, supabaseAnonKey, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } })
      - AppState listener block guarded by if (Platform.OS !== 'web') — registers once at module load time — calls supabase.auth.startAutoRefresh() when state === 'active', calls supabase.auth.stopAutoRefresh() otherwise
      - Export async function initSupabaseSession(): Promise<void> — calls supabase.auth.getSession() first; if session exists, returns immediately; only calls supabase.auth.signInAnonymously() when session is null; wraps body in try/catch using console.warn('[Supabase] ...' pattern from healthkit.ts; never throws
      - JSDoc header block at top of file (before first import) describing: what the module is, the polyfill ordering constraint, and the offline-start known limitation (session may be cleared if app opens without network on first launch)

    Step 3 — Create .env.example in the project root with two lines:
      EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
      EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
      No real values. No other keys from .env.
  </action>

  <verify>
    <automated>
      # 1. Packages installed
      grep -c '"@supabase/supabase-js"' /Users/bekircemkusdemir/Downloads/vitalspan/package.json
      grep -c '"react-native-url-polyfill"' /Users/bekircemkusdemir/Downloads/vitalspan/package.json

      # 2. Polyfill is first import (line 1 must match exactly)
      head -1 /Users/bekircemkusdemir/Downloads/vitalspan/src/lib/supabase.ts | grep -c "react-native-url-polyfill/auto"

      # 3. No hardcoded Supabase URL or key in source files (SEC-01 audit)
      grep -rn --include="*.ts" --include="*.tsx" "<PROJECT-REF>\|sb_publishable_\|supabase\.co" /Users/bekircemkusdemir/Downloads/vitalspan/src/ /Users/bekircemkusdemir/Downloads/vitalspan/App.tsx

      # 4. Required exports exist
      grep -c "export const supabase" /Users/bekircemkusdemir/Downloads/vitalspan/src/lib/supabase.ts
      grep -c "export async function initSupabaseSession" /Users/bekircemkusdemir/Downloads/vitalspan/src/lib/supabase.ts

      # 5. createClient uses process.env vars (not string literals)
      grep -c "process\.env\.EXPO_PUBLIC_SUPABASE_URL" /Users/bekircemkusdemir/Downloads/vitalspan/src/lib/supabase.ts
      grep -c "process\.env\.EXPO_PUBLIC_SUPABASE_ANON_KEY" /Users/bekircemkusdemir/Downloads/vitalspan/src/lib/supabase.ts

      # 6. .env.example has correct key names
      grep -c "EXPO_PUBLIC_SUPABASE_URL=" /Users/bekircemkusdemir/Downloads/vitalspan/.env.example
      grep -c "EXPO_PUBLIC_SUPABASE_ANON_KEY=" /Users/bekircemkusdemir/Downloads/vitalspan/.env.example

      # 7. TypeScript compiles without errors
      cd /Users/bekircemkusdemir/Downloads/vitalspan && npx tsc --noEmit
    </automated>
  </verify>

  <acceptance_criteria>
    - package.json contains "@supabase/supabase-js" and "react-native-url-polyfill" as dependencies
    - Line 1 of src/lib/supabase.ts is exactly: import 'react-native-url-polyfill/auto'
    - src/lib/supabase.ts exports both `supabase` (createClient result) and `initSupabaseSession` (async function)
    - createClient options include: storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false
    - AppState listener is inside if (Platform.OS !== 'web') block
    - initSupabaseSession() calls getSession() before signInAnonymously() — signInAnonymously is only reached when session is null
    - grep for project ref and `sb_publishable_` prefix across src/ and App.tsx returns zero matches
    - .env.example exists with EXPO_PUBLIC_SUPABASE_URL= and EXPO_PUBLIC_SUPABASE_ANON_KEY= (placeholder values only)
    - npx tsc --noEmit exits with code 0
  </acceptance_criteria>

  <done>src/lib/supabase.ts singleton is importable, compiles clean, has zero hardcoded secrets, and exports the supabase client and initSupabaseSession. .env.example documents the required keys.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| source code → bundle | EXPO_PUBLIC_* vars are inlined at bundle time — key names visible in bundle, but this is the intended Supabase anon key security model (RLS governs access, not key secrecy) |
| .env → git | .env must stay in .gitignore; .env.example is the only committed credential file |
| npm registry → local install | npx expo install pulls packages from npm; legitimacy checkpoint in Task 1 guards this boundary |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-01 | Information Disclosure | src/lib/supabase.ts — EXPO_PUBLIC_* access | mitigate | process.env.EXPO_PUBLIC_* exclusively; grep audit in Task 2 verify step confirms zero literals; ASVS V2.10 |
| T-04-02 | Information Disclosure | .env committed to git | mitigate | .env in .gitignore (existing); .env.example is the only committed file with key names (no values) |
| T-04-03 | Tampering | npm/pip install — @supabase/supabase-js, react-native-url-polyfill | mitigate | checkpoint:human-verify Task 1 is blocking; executor must receive "packages verified" before running npx expo install |
| T-04-04 | Denial of Service | react-native-url-polyfill import order violated | mitigate | acceptance_criteria requires line 1 of supabase.ts to match exactly; automated head -1 grep check enforces this |
| T-04-SC | Tampering | npm install supply chain (slopcheck unavailable — both packages [ASSUMED]) | mitigate | blocking human checkpoint in Task 1 before install; packages are 6-year-old official clients with millions of weekly downloads |
</threat_model>

<verification>
After Task 2 completes:
1. grep -rn --include="*.ts" --include="*.tsx" "<PROJECT-REF>\|sb_publishable_\|supabase\.co" src/ App.tsx → zero matches
2. head -1 src/lib/supabase.ts → import 'react-native-url-polyfill/auto'
3. npx tsc --noEmit → exit 0
4. .env.example exists with two EXPO_PUBLIC_* lines and placeholder values only
</verification>

<success_criteria>
- src/lib/supabase.ts exists, exports supabase and initSupabaseSession, compiles clean
- react-native-url-polyfill/auto is the absolute first import
- createClient configured with storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false
- AppState listener registered once at module load, guarded by Platform.OS !== 'web'
- initSupabaseSession() guards signInAnonymously() behind a getSession() check
- Zero hardcoded secrets in any source file (SEC-01)
- .env.example committed with placeholder key names
</success_criteria>

<output>
Create .planning/phases/04-supabase-foundation/04-P1-SUMMARY.md when done
</output>
