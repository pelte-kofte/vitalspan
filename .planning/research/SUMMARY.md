# Research Summary: Vitalspan v2

**Project:** Vitalspan
**Domain:** Longevity tracking iOS app — brownfield Expo 54 + Supabase integration
**Researched:** 2026-05-30
**Confidence:** HIGH (architecture from direct codebase inspection; stack and pitfalls from documented Supabase/Expo patterns)

---

## Stack Additions

One install command covers the entire v2 dependency surface:

```
npm install @supabase/supabase-js react-native-url-polyfill
```

Everything else — `react-native-svg` (icons), `expo-constants`, `react-native-reanimated`, `@react-native-async-storage/async-storage` — is already installed. The `.env` file already exists with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in the correct Expo SDK 49+ format. No `metro.config.js`, `babel.config.js`, or `app.json` changes needed.

The `react-native-url-polyfill` import must appear as the very first line of `src/lib/supabase.ts`, before any Supabase import. The client singleton requires `storage: AsyncStorage`, `autoRefreshToken: true`, `persistSession: true`, and `detectSessionInUrl: false`.

Design tokens and the PhenoAge fix are pure TypeScript changes — zero new packages.

---

## Feature Table Stakes

### Supabase Auth
- Silent anonymous sign-in on first launch — user sees nothing but every biomarker row gets a stable `user_id` UUID
- Persistent session via AsyncStorage adapter — without this, sessions vanish on every app restart
- "Continue without account" path from Landing — existing v1 users must not be blocked
- One-time migration on first authenticated sign-in: bulk-read all `@vitalspan_*` keys → insert to Supabase → set `@vitalspan_migrated_v2: 'true'` flag (idempotent)
- AppState listener for JWT refresh: `startAutoRefresh()` on `active`, `stopAutoRefresh()` otherwise

### Reference Data Tables
- `biomarker_definitions`: public read RLS (`TO anon`), seeded from `src/data/biomarkers.ts`; static array remains as offline fallback
- `exercises`: public read RLS, seeded from exercise data; static array remains as offline fallback
- `biomarker_entries`: RLS `USING (auth.uid() = user_id)`, AsyncStorage-first write + fire-and-forget Supabase upsert
- All tables need RLS policies set in Supabase dashboard before first client query is written — empty arrays are the silent failure mode

### SVG Icons
- 5 tab bar icons: `HomeIcon`, `BiomarkersIcon`, `ProtocolIcon`, `ExerciseIcon`, `ProfileIcon`
- All: `viewBox="0 0 24 24"`, stroke-based, `strokeWidth={1.5}`, `size` prop wired to `width` + `height` on `<Svg>`
- React Navigation passes `color` and `size` automatically — no manual focused-state logic

### Exercise Screen
- Today's session section first, then This Week, then History (last 14 days)
- Intensity pills: Easy (green), Moderate (amber), Hard (coral) — haptic on selection
- Motivating empty state: outcome-focused headline + longevity stat + single CTA
- Exercise library keeps existing category filter + expand-for-instructions pattern

### Selective Theme
- Warm screens (Exercise, Biomarkers, Protocol, Profile, Settings, About): `Colors.bg`, `Colors.bgCard`
- Dark screens (LongevityScore, Dashboard neural, Landing): `Colors.dark.*` — untouched
- `Beige` export block appended to `src/theme/index.ts` — no existing constant renamed or removed
- Per-screen `expo-status-bar` style: `"dark"` for warm, `"light"` for dark, via `useFocusEffect`

---

## Architecture Integration Points

### New Files
| File | Role |
|------|------|
| `src/lib/supabase.ts` | Client singleton |
| `src/services/biomarkerSync.ts` | Push/pull functions for biomarker entries |
| `src/services/exerciseSync.ts` | `fetchExerciseLibrary()` replacing static array |
| `src/services/biomarkerRefData.ts` | `fetchBiomarkerRanges()` enriching static data |
| `src/hooks/useSupabaseAuth.ts` | Session management, consumed by `App.tsx` |
| `src/hooks/useBiomarkerSync.ts` | Loading/error wrapper around biomarkerSync |
| `src/components/icons/` | 5 tab icon components + `index.ts` |

### Key Modified Files
| File | Change |
|------|--------|
| `App.tsx` | `useSupabaseAuth` init + AppState JWT refresh listener |
| `src/navigation/AppNavigator.tsx` | Swap emoji `TabIcon` for SVG icon components |
| `src/theme/index.ts` | Append `Beige` export block |
| `src/screens/ExerciseScreen.tsx` | Remote library + Today/Week/History sections + Beige tokens |
| `src/screens/BiomarkerEntryScreen.tsx` | Fire-and-forget sync after AsyncStorage save |
| `src/screens/DashboardScreen.tsx` | `pullIfStale()` on mount |

### Suggested Build Order
1. Supabase client + anonymous auth — dependency gate for everything
2. SVG icons + Beige token block — pure UI, no Supabase dependency
3. Reference data from Supabase — validates table schemas + RLS before write path
4. Biomarker sync write path — requires phases 1 + 3
5. Exercise screen redesign — requires phases 2 + 3
6. Warm UI overhaul on remaining screens — Beige tokens only prerequisite
7. PhenoAge formula fix + TypeScript strict cleanup — isolated, last

---

## Watch Out For

**1. Supabase session not persisting — CRITICAL, Phase 1**
Default storage is `localStorage` (doesn't exist in RN). Silently falls back to in-memory — sessions vanish on restart. RLS queries return `[]`, looks like a data bug.
*Fix:* `storage: AsyncStorage` + `detectSessionInUrl: false` in `createClient`. Verify before writing any sync code.

**2. JWT expiry breaks sync after backgrounding — HIGH, Phase 1**
`autoRefreshToken: true` alone is insufficient — JS pauses in background. 401s returned silently after 1 hour.
*Fix:* AppState listener in the Supabase module calling `startAutoRefresh()`/`stopAutoRefresh()`.

**3. Pre-auth AsyncStorage data orphaned on first sign-in — HIGH, Phase 4**
Existing users have biomarker history with no `user_id`. After auth added, `WHERE user_id = auth.uid()` returns empty.
*Fix:* One-time migration function on first authenticated session, guarded by `@vitalspan_migrated_v2` flag. Must be idempotent.

**4. RLS silent empty arrays on reference tables — HIGH, Phase 3**
RLS enabled by default. Without `anon` read policy, every query returns `[]` with no error.
*Fix:* Create anon read policy in Supabase dashboard before writing any client fetch code.

**5. Theme regression on dark screens — MEDIUM, Phase 6**
Renaming existing `Colors.*` keys breaks LongevityScore and Dashboard silently (undefined → transparent).
*Fix:* `Beige` block is additive only — existing constants never renamed. Run `tsc --noEmit` + visual check after every theme commit.

---

## Open Questions

1. **Auth scope**: Anonymous session (invisible, v2) + email upgrade via `linkIdentity()` deferred to v3 — needs explicit confirmation
2. **Table schemas**: Confirm `biomarker_definitions.id` matches actual IDs in `src/data/biomarkers.ts` (e.g., `'apob'`, `'hscrp'`); confirm exercise ID format; confirm `exercise_logs` UUID vs timestamp-string strategy
3. **Staleness threshold**: 15 min recommended for `pullIfStale()` — 24hr or pull-to-refresh may be more appropriate for single-device v2
4. **Email verification**: Disable enforcement in Supabase Auth settings for v2 (not just in code) to avoid verification gate on anonymous→email upgrade
5. **Exercise library size**: 59 exercises = client-side filtering fine; if growing to 250+, switch to server-side `ilike` before finalizing exercise service architecture
