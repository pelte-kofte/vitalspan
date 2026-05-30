---
phase: 04-supabase-foundation
plan: P2
type: execute
wave: 2
depends_on:
  - 04-P1
files_modified:
  - App.tsx
autonomous: false
requirements:
  - SUPA-02
  - SUPA-03
must_haves:
  truths:
    - "App.tsx calls initSupabaseSession() on every cold start, after the user profile load"
    - "initSupabaseSession() is non-blocking for UI — profile route determination completes before Supabase session resolves"
    - "A session UUID is stable across multiple restarts — the same anonymous user_id appears in Supabase Auth after restart"
    - "App foregrounded after background does not produce 401 errors — AppState JWT refresh is wired"
  artifacts:
    - path: "App.tsx"
      provides: "Entry point wired to call initSupabaseSession on mount"
      contains: "initSupabaseSession"
  key_links:
    - from: "App.tsx useEffect"
      to: "initSupabaseSession"
      via: "import { initSupabaseSession } from './src/lib/supabase'"
      pattern: "initSupabaseSession"
    - from: "App.tsx useEffect"
      to: "profile route determination"
      via: "await AsyncStorage.getItem('@vitalspan_user_profile') before initSupabaseSession()"
      pattern: "setInitialRoute"
---

<objective>
Wire initSupabaseSession() into App.tsx's startup useEffect so anonymous auth runs on every cold start without blocking the UI. Then verify the end-to-end session lifecycle: session persists across restarts and the AppState JWT refresh listener prevents 401 errors after backgrounding.

Purpose: This is the vertical slice that makes Phase 4 observable. Without this wiring, the supabase.ts singleton from Plan P1 is never called and no anonymous session is created. After this plan, Supabase reports a stable anonymous user in Auth > Users, and the session UUID is consistent across app restarts.

Output: App.tsx modified with async init pattern calling initSupabaseSession(); human verification of session stability and AppState JWT refresh.
</objective>

<execution_context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/ROADMAP.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/REQUIREMENTS.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/STATE.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/04-supabase-foundation/04-P1-SUMMARY.md

<interfaces>
<!-- Current App.tsx state (read during planning — executor must re-read before editing) -->

App.tsx current useEffect (lines 13-24):
  useEffect(() => {
    AsyncStorage.getItem('@vitalspan_user_profile')
      .then(raw => {
        if (raw) {
          const profile = JSON.parse(raw);
          setInitialRoute(profile.onboardingComplete ? 'Main' : 'Landing');
        } else {
          setInitialRoute('Landing');
        }
      })
      .catch(() => setInitialRoute('Landing'));
  }, []);

This .then()-chaining pattern must be converted to an async inner function (async init()) to allow await syntax alongside the new initSupabaseSession() call. The route-determination logic is unchanged — only the shape of the useEffect changes.

src/lib/supabase.ts exports (from Plan P1):
  export const supabase  — the initialized Supabase client
  export async function initSupabaseSession(): Promise<void>  — checks session, signs in anonymously if null
</interfaces>
</context>

## Phase Goal

**As a** Vitalspan user, **I want to** have a stable Supabase session initialized silently on first launch and maintained across restarts and backgrounding, **so that** future features can use my anonymous user_id to sync data without me ever seeing an auth prompt.

<tasks>

<task type="auto">
  <name>Task 1: Wire initSupabaseSession into App.tsx startup useEffect</name>
  <files>App.tsx</files>

  <read_first>
    - App.tsx — read the full file before editing; the entire useEffect block (lines 13-24), the import list (lines 1-8), and the StyleSheet at bottom (lines 43-50) must be understood before making any change
    - src/lib/supabase.ts — confirm initSupabaseSession is exported from Plan P1 before adding the import to App.tsx
  </read_first>

  <action>
    Modify App.tsx with two changes only:

    Change 1 — Add one import line after the existing AsyncStorage import:
      import { initSupabaseSession } from './src/lib/supabase';
    This import must appear after the AsyncStorage import and before AppNavigator — preserve import ordering conventions in the file.

    Change 2 — Replace the useEffect block (lines 13-24) with the async inner function pattern:
      useEffect(() => {
        const init = async () => {
          const raw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
          if (raw) {
            const profile = JSON.parse(raw);
            setInitialRoute(profile.onboardingComplete ? 'Main' : 'Landing');
          } else {
            setInitialRoute('Landing');
          }
          initSupabaseSession().catch(() => null);
        };
        init();
      }, []);

    The route-determination logic (setInitialRoute) is identical to the existing code — only the wrapper changes from .then() chaining to async/await. initSupabaseSession() is called after setInitialRoute is determined and is fire-and-forget (.catch(() => null) prevents unhandled rejection). It does NOT await initSupabaseSession() — this keeps the loading screen duration unchanged.

    Do NOT modify: the useState declaration, the loading view JSX, the AppNavigator JSX, MedicalDisclaimer, StatusBar, or the StyleSheet named s at the bottom.
  </action>

  <verify>
    <automated>
      # 1. Import added
      grep -c "initSupabaseSession" /Users/bekircemkusdemir/Downloads/vitalspan/App.tsx

      # 2. Async init pattern present
      grep -c "const init = async" /Users/bekircemkusdemir/Downloads/vitalspan/App.tsx

      # 3. Route logic preserved
      grep -c "setInitialRoute" /Users/bekircemkusdemir/Downloads/vitalspan/App.tsx

      # 4. initSupabaseSession is fire-and-forget (not awaited)
      grep -c "await initSupabaseSession" /Users/bekircemkusdemir/Downloads/vitalspan/App.tsx

      # 5. TypeScript compiles clean
      cd /Users/bekircemkusdemir/Downloads/vitalspan && npx tsc --noEmit

      # 6. No hardcoded secrets introduced by this edit
      grep -rn --include="*.ts" --include="*.tsx" "<PROJECT-REF>\|sb_publishable_\|supabase\.co" /Users/bekircemkusdemir/Downloads/vitalspan/src/ /Users/bekircemkusdemir/Downloads/vitalspan/App.tsx
    </automated>
  </verify>

  <acceptance_criteria>
    - App.tsx contains import { initSupabaseSession } from './src/lib/supabase'
    - grep -c "initSupabaseSession" App.tsx returns 2 (one import, one call)
    - grep -c "await initSupabaseSession" App.tsx returns 0 (it is fire-and-forget, not awaited)
    - grep -c "const init = async" App.tsx returns 1
    - grep -c "setInitialRoute" App.tsx returns 3 (two inside init, one in the useState declaration)
    - npx tsc --noEmit exits with code 0
    - grep for hardcoded Supabase secrets in App.tsx returns zero matches
  </acceptance_criteria>

  <done>App.tsx calls initSupabaseSession() on every cold start, fire-and-forget after route determination. TypeScript compiles clean.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Verify Supabase dashboard prerequisite and end-to-end session lifecycle</name>
  <what-built>
    Task 1 wired initSupabaseSession() into App.tsx. Before this checkpoint can pass, one manual Supabase dashboard step is required: enabling anonymous sign-ins. Without this toggle, signInAnonymously() returns an error and no session is created.
  </what-built>
  <how-to-verify>
    Step 1 — Enable anonymous sign-ins in Supabase dashboard (prerequisite):
      1. Open the Supabase dashboard > Authentication > Providers
      2. Find "Anonymous Sign-ins" toggle under "User Signups"
      3. Enable it if not already enabled
      4. Save changes

    Step 2 — Verify session creation (first launch):
      1. Run: npx expo start --ios (or use Xcode simulator)
      2. If the app was previously installed with data, clear it: Settings > General > iPhone Storage > Vitalspan > Delete App, then reinstall
      3. Open the app — it should load the landing/main screen with no auth prompt
      4. Open Supabase dashboard > Authentication > Users
      5. Confirm a new anonymous user appeared with a UUID (is_anonymous: true)
      6. Note the UUID shown in the Supabase Users list

    Step 3 — Verify session persistence across restart:
      1. Force-quit the app (swipe up from app switcher on simulator)
      2. Reopen the app
      3. Check Supabase Auth > Users again — the same UUID must appear (no new user created)
      4. If you see a second new anonymous user, that means getSession() is not working and signInAnonymously() is being called twice — this is a bug (Pitfall 1 from RESEARCH.md)

    Step 4 — Verify AppState JWT refresh (background/foreground cycle):
      1. With the app running, press Home button to background it (Command+H in simulator)
      2. Wait 10 seconds
      3. Tap the app to foreground it
      4. In the Expo/Metro logs, confirm no error output resembling "JWT expired" or "401"
      5. If startAutoRefresh/stopAutoRefresh log lines appear in Metro console, that confirms the AppState listener fired correctly
  </how-to-verify>
  <resume-signal>
    Type "session verified" if Steps 2-4 all pass.
    Type "anon auth disabled" if the dashboard toggle was missing and you just enabled it (re-run Step 2 after enabling).
    Describe any specific failure — e.g. "new user on every restart" (getSession bug) or "signInAnonymously error: ..." (dashboard toggle issue).
  </resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| App.tsx useEffect → initSupabaseSession | Session init is fire-and-forget after route determination — failure here never blocks the UI |
| initSupabaseSession → Supabase Auth API | Network call over HTTPS; anonymous sign-in; server-side rate-limited at 30/hour per IP |
| Supabase Auth → AsyncStorage | JWT and refresh token stored in AsyncStorage under supabase-managed keys (not @vitalspan_* namespace) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-05 | Spoofing | initSupabaseSession — signInAnonymously() called unconditionally | mitigate | getSession() guard in initSupabaseSession (implemented in Plan P1); acceptance_criteria for Task 1 confirms fire-and-forget pattern; verified in checkpoint Task 2 Step 3 |
| T-04-06 | Denial of Service | JWT silently expires after 1h backgrounding | mitigate | AppState listener (startAutoRefresh/stopAutoRefresh) implemented in supabase.ts Plan P1; verified in checkpoint Task 2 Step 4 |
| T-04-07 | Denial of Service | Session cleared when app starts offline (offline-start bug) | accept | Known open issue in supabase-js; for MVP/TestFlight scope, consistent network is assumed; documented in supabase.ts JSDoc header; to be revisited before public App Store release with @react-native-community/netinfo guard |
| T-04-08 | Information Disclosure | Anonymous user UUID visible in Supabase dashboard | accept | No PII attached; anonymous sessions are by design in Supabase; user_id used only as a stable sync key in Phase 8 |
| T-04-SC | Tampering | npm supply chain (inherited from Plan P1) | mitigate | Packages verified in Plan P1 Task 1 checkpoint; no new package installs in this plan |
</threat_model>

<verification>
After both tasks complete:
1. App opens without auth prompt — user sees no Supabase UI
2. Supabase Auth > Users shows exactly one anonymous user per device (stable UUID)
3. Force-quit + reopen does NOT create a second anonymous user
4. Backgrounding + foregrounding does not produce JWT error logs
5. npx tsc --noEmit → exit 0
6. grep for hardcoded Supabase secrets in src/ and App.tsx → zero matches
</verification>

<success_criteria>
- App.tsx wired: initSupabaseSession() called on mount, fire-and-forget, non-blocking for UI
- Supabase Auth > Users shows a stable anonymous user UUID that persists across app restarts
- No duplicate anonymous users created on cold start (getSession() guard confirmed)
- AppState JWT refresh lifecycle verified by foreground/background cycle test
- TypeScript compiles clean with zero errors
- Phase 4 requirements SUPA-01, SUPA-02, SUPA-03, SEC-01 all satisfied
</success_criteria>

<output>
Create .planning/phases/04-supabase-foundation/04-P2-SUMMARY.md when done
</output>
