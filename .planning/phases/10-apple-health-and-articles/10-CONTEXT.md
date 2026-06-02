# Phase 10: Apple Health + Articles - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Two connected workstreams:

1. **HealthKit integration** — Replace the mock in `src/lib/healthkit.ts` with a real `expo-health` implementation. The LongevityScore orbitals display live HRV, sleep, VO₂max, resting heart rate, respiratory rate, steps, mindful minutes, and glucose values instead of demo data. Permission is requested on the user's first visit to LongevityScore. When denied, orbitals show a "Connect Health" prompt with a Settings deep-link CTA. No new screens — the existing `LongevityScoreScreen.tsx` integration seams (`connectAndSync`, `loadHealthData`) are upgraded in-place.

2. **PubMed article feed** — A new `ArticlesScreen` accessible from a card/CTA on the Dashboard (stack navigator, no new tab). Articles are fetched from NCBI eSearch using per-biomarker keyword queries, cached in a Supabase `articles` table by PMID, and refreshed on app open if the cache is older than 24 hours. Each card shows title + journal + date + abstract snippet. Tapping opens the PubMed URL in Safari (via `WebBrowser.openBrowserAsync`). Articles are ranked client-side by the user's out-of-range biomarkers surfacing first.

No new tab bar items. No new packages beyond `expo-health` (and expo's existing `expo-web-browser` for Safari). No changes to AsyncStorage keys or Supabase auth logic.

</domain>

<decisions>
## Implementation Decisions

### HealthKit Package
- **D-01:** Use `expo-health` (the package already referenced in the mock file's comments). Stays in Expo managed workflow — no ejecting. Verify Expo SDK 54 compatibility before install (`npx expo install expo-health`).
- **D-02:** Read the same 8 data types the mock already returns: HRV (RMSSD), resting heart rate, VO₂max, sleep analysis (total/deep/REM), respiratory rate, steps, mindful minutes, blood glucose. No `HealthData` interface changes required — the mock's return shape is already correct.
- **D-03:** No `expo-dev-client`. HealthKit changes are tested via EAS preview builds only (same pattern as Phase 9's EAS verification step).
- **D-04:** Add HealthKit entitlement to `app.json` (`com.apple.developer.healthkit` and `com.apple.developer.healthkit.background-delivery` if needed for the 4hr staleness check). Add usage description string for NSHealthShareUsageDescription.

### Permission Flow
- **D-05:** Request HealthKit permissions on the user's **first visit to LongevityScoreScreen** — not at app launch. The existing `requestHealthKitPermissions()` function in `healthkit.ts` is called from `LongevityScoreScreen` on mount, gated by a "hasRequestedHealthKit" flag in AsyncStorage to fire only once.
- **D-06:** Before permissions have been requested (first visit, not yet asked): show **empty orbitals with a "Connect Apple Health" prompt card** — not demo data. The `isDemoMode` path is removed from the pre-permission state.
- **D-07:** When the user permanently denies permissions (iOS system prompt "Don't Allow"): show a "Connect Health" prompt with a **Settings deep-link CTA** using `Linking.openURL('app-settings:')`. This matches the ROADMAP success criterion exactly.
- **D-08:** After successful permission grant: `connectAndSync()` runs immediately, populating orbitals with real data within the same session. The `isDemoMode: true` flag is absent from real data — the "demo" badge disappears automatically.

### Article Feed — Placement & UX
- **D-09:** Articles live in a **new `ArticlesScreen`** accessible via the stack navigator from Dashboard. The Dashboard gets a "Research" card or CTA section that navigates to `ArticlesScreen`. No new tab. No 6th tab icon required.
- **D-10:** Each article card shows: **title + journal name + publication date + abstract snippet** (first 2–3 sentences of the abstract). This matches the ROADMAP success criterion.
- **D-11:** Tapping an article card opens the PubMed URL in **SafariViewController** via `expo-web-browser`'s `WebBrowser.openBrowserAsync()`. No new ArticleDetail screen.

### Article Personalization & Caching
- **D-12:** Fetch articles using **per-biomarker keyword queries** via NCBI eSearch API. Each biomarker ID maps to a search query string (e.g., `"ApoB longevity lifespan"`, `"CRP inflammation aging"`, `"HbA1c biological age"`). Researcher should produce the biomarker→query map for all biomarkers in `BIOMARKERS` data.
- **D-13:** Supabase `articles` table caches by PMID. Schema minimum: `pmid (text PK)`, `title`, `journal`, `pub_date`, `abstract`, `biomarker_tags (text[])`, `fetched_at`. Shared across all users (no per-user state). RLS: public read, service-role write.
- **D-14:** Client-side ranking: articles tagged to biomarkers that are **outside the user's longevity-optimized range** are sorted to the top. The existing `BIOMARKERS` data with `min`/`max`/`optimal` range fields is the source of truth for range status. A user with out-of-range ApoB sees ApoB-tagged articles first.
- **D-15:** Cache refresh strategy: **on app open if >24 hours since last fetch**. Check `fetched_at` of the most recent article in Supabase (or a `@vitalspan_articles_last_fetched` AsyncStorage timestamp). Refresh runs in the background without blocking the articles list render (show cached data immediately, swap in new data when fetch resolves).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### HealthKit Integration
- `src/lib/healthkit.ts` — The mock implementation to upgrade. Contains `HealthData` interface, `PermissionStatus` interface, `connectAndSync()`, `loadHealthData()`, `requestHealthKitPermissions()`, `syncHealthData()`, `isHealthDataStale()` (4hr threshold), `generateMockData()` (to be replaced with real reads). Real implementation comments are already present — use them.
- `src/screens/LongevityScoreScreen.tsx` — Primary consumer of `HealthData`. Already imports `connectAndSync`, `loadHealthData`, `formatSyncTime`, `isHealthKitAvailable`. Lines ~267–383 show current state management pattern. The `isDemoMode` badge logic is at line ~529.

### Article Feed
- `src/navigation/AppNavigator.tsx` — Add `ArticlesScreen` to the stack navigator here.
- `src/screens/DashboardScreen.tsx` — Add the "Research" CTA card here that navigates to `ArticlesScreen`.
- `src/data/biomarkers.ts` — `BIOMARKERS` array with `min`, `max`, `optimal` range fields — used for out-of-range ranking logic (D-14).

### Supabase
- `src/lib/supabase.ts` — Supabase client singleton. All Supabase calls must import from here.
- `.planning/phases/04-supabase-foundation/04-CONTEXT.md` — Supabase setup decisions (anon auth, env vars, singleton pattern).
- `.planning/phases/08-biomarker-sync-write-path/08-CONTEXT.md` — D-10 service pattern: pure functions in `src/lib/`, screens never call Supabase directly. Follow this pattern for `articleService.ts`.

### Planning
- `.planning/ROADMAP.md` §Phase 10 — Requirements HK-01–HK-04, ART-01–ART-04 and success criteria (authoritative scope reference).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/healthkit.ts:HealthData` — Interface already covers all 8 data types needed. No changes to the interface shape required, only the implementation of the read functions.
- `src/lib/healthkit.ts:isHealthDataStale()` — 4hr staleness check already implemented. Can be adapted for the article cache staleness check (24hr threshold).
- `src/lib/healthkit.ts:loadPermissionStatus()` / `savePermissionStatus()` — Permission state persistence pattern to reuse for the "hasRequestedHealthKit" first-visit gate (D-05).
- `src/lib/healthkit.ts:formatSyncTime()` — Already used in LongevityScoreScreen for the sync timestamp display.
- `expo-web-browser` — Already a dependency in Expo managed projects. No new install needed for `WebBrowser.openBrowserAsync()`.

### Established Patterns
- Service pattern: all Supabase/data logic lives in `src/lib/` pure functions, imported by screens. Create `src/lib/articleService.ts` following this pattern (see Phase 8 context D-10).
- StyleSheet always named `s`; all colors from `Colors.*`; no hardcoded hex values.
- AsyncStorage key convention: `@vitalspan_*` prefix. New keys: `@vitalspan_health_permissions` (already exists), `@vitalspan_health_data` (already exists). New if needed: `@vitalspan_articles_last_fetched`.
- `console.error(e)` in catch blocks — keep; no `console.log` debug calls.

### Integration Points
- `LongevityScoreScreen.tsx` — The `connectAndSync()` call is already wired at line ~312 (currently behind a tap gesture). Move to mount-time with the first-visit gate (D-05). The `healthData.isDemoMode` badge at lines ~529 and ~573 disappears automatically when real data has `isDemoMode: undefined`.
- `DashboardScreen.tsx` — Add a "Research" CTA card at the bottom of the existing Dashboard scroll view. Use the existing `BreathingCard` or a simple card component for visual consistency.
- `AppNavigator.tsx` — Add `ArticlesScreen` to the root stack. The screen doesn't need to be in the tab navigator.

</code_context>

<specifics>
## Specific Ideas

- The `generateMockData()` function in `healthkit.ts` should be removed (or kept for simulator testing only) once the real `expo-health` reads are wired. The mock was designed as a clean swap — the commented-out real implementation blocks are already present in the file.
- NCBI eSearch base URL: `https://eapis.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi` and eFetch: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi`. No API key required for low-volume use (≤3 requests/second without key). The researcher should confirm current rate limits.
- The ROADMAP success criterion for articles: "a user with elevated CRP sees inflammation-focused articles surface higher than metabolic articles" — this is the exact out-of-range ranking behavior captured in D-14.
- The `expo-health` entitlement in `app.json` must include the `NSHealthShareUsageDescription` string (required by App Store Review). Suggested copy: "Vitalspan reads your health data to display longevity metrics on your dashboard."

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-Apple Health + Articles*
*Context gathered: 2026-06-02*
