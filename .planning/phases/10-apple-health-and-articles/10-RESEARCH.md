# Phase 10: Apple Health + Articles - Research

**Researched:** 2026-06-02
**Domain:** HealthKit integration (React Native), NCBI PubMed E-utilities API, Supabase shared cache table, expo-web-browser
**Confidence:** HIGH (HealthKit library selection, API patterns), MEDIUM (NCBI response shapes from docs + examples)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**HealthKit Package**
- D-01: Use `expo-health` as referenced in the mock file's comments. Stays in Expo managed workflow — no ejecting. Verify Expo SDK 54 compatibility before install.
- D-02: Read the same 8 data types the mock already returns: HRV (RMSSD), resting heart rate, VO2max, sleep analysis (total/deep/REM), respiratory rate, steps, mindful minutes, blood glucose. No `HealthData` interface changes required.
- D-03: No expo-dev-client. HealthKit changes tested via EAS preview builds only.
- D-04: Add HealthKit entitlement to `app.json` (`com.apple.developer.healthkit`). Add `NSHealthShareUsageDescription`.

**Permission Flow**
- D-05: Request HealthKit permissions on user's first visit to LongevityScoreScreen — not at app launch. Gated by "hasRequestedHealthKit" flag in AsyncStorage.
- D-06: Before permissions requested (first visit): show empty orbitals with "Connect Apple Health" prompt card — not demo data. isDemoMode path removed from pre-permission state.
- D-07: When permanently denied: show "Connect Health" prompt with Settings deep-link CTA using `Linking.openURL('app-settings:')`.
- D-08: After successful grant: `connectAndSync()` runs immediately, populating orbitals with real data. isDemoMode: true absent from real data — demo badge disappears automatically.

**Article Feed**
- D-09: Articles live in a new `ArticlesScreen` accessible via stack navigator from Dashboard. Dashboard gets a "Research" CTA card. No new tab.
- D-10: Each article card shows: title + journal name + publication date + abstract snippet (first 2-3 sentences).
- D-11: Tapping opens PubMed URL in SafariViewController via `expo-web-browser`'s `WebBrowser.openBrowserAsync()`.

**Article Personalization & Caching**
- D-12: Fetch articles using per-biomarker keyword queries via NCBI eSearch API. Each biomarker ID maps to a search query string.
- D-13: Supabase `articles` table: `pmid (text PK)`, `title`, `journal`, `pub_date`, `abstract`, `biomarker_tags (text[])`, `fetched_at`. Shared across all users. RLS: public read, service-role write.
- D-14: Client-side ranking: articles tagged to biomarkers outside user's longevity-optimized range sorted to top. Source of truth: `BIOMARKERS` data with `optMin`/`optMax` range fields.
- D-15: Cache refresh on app open if >24 hours since last fetch. Check `@vitalspan_articles_last_fetched` AsyncStorage timestamp. Refresh in background without blocking render.

### Claude's Discretion

None specified — all decisions locked.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HK-01 | On first launch after install, app requests HealthKit read permissions for HRV, sleep, step count, resting heart rate, active energy burned; non-blocking | react-native-health `initHealthKit` + `Constants.Permissions` pattern; AsyncStorage first-visit gate (D-05) |
| HK-02 | When permissions granted, LongevityScore orbital values sourced from live HealthKit data instead of demo/mock | `react-native-health` API methods per data type; `generateMockData()` removal; `isDemoMode` badge logic |
| HK-03 | When HealthKit permissions denied or unavailable, LongevityScore orbitals show "Connect Health" prompt with CTA | `Linking.openURL('app-settings:')` pattern; permission state in AsyncStorage |
| HK-04 | User can connect or disconnect Apple Health from Profile/Settings; disconnecting reverts orbitals | Clear `@vitalspan_health_permissions` + `@vitalspan_health_data` keys; disconnect UI in ProfileScreen |
| ART-01 | App fetches longevity articles from PubMed NCBI API; results cached in Supabase `articles` table | NCBI eSearch + eSummary two-step pattern; Supabase upsert on `pmid` conflict |
| ART-02 | Articles screen shows title, journal, publication date, and abstract summary | ArticlesScreen component; NCBI eSummary JSON fields: `title`, `fulljournalname`, `pubdate` |
| ART-03 | Article recommendations personalized based on user's current biomarker values | Client-side ranking using `BIOMARKERS[].optMin`/`optMax` vs stored entries; biomarker→query map |
| ART-04 | Articles cache refreshes in background on app open (max once per 24h); stale cached shown during refresh | `@vitalspan_articles_last_fetched` AsyncStorage timestamp; stale-while-revalidate pattern |
</phase_requirements>

---

## Summary

Phase 10 has two workstreams that are independent but share the Supabase client. The HealthKit workstream is primarily a mock-to-real swap in `src/lib/healthkit.ts` with UI changes in `LongevityScoreScreen.tsx`. The articles workstream is a new `articleService.ts` + `ArticlesScreen.tsx` + Dashboard CTA.

**Critical discovery: `expo-health` package does not exist.** The package name referenced in `healthkit.ts` comments (`expo-health`) resolves on npm to a placeholder stub (version 0.0.0, 50 bytes, proprietary, zero functionality, published over a year ago by an unrelated party). The real HealthKit packages for Expo managed workflow are `react-native-health` (Agency Enterprise, v1.19.0) and `@kingstinct/react-native-healthkit` (Kingstinct, v14.0.1). Both require an EAS build — they cannot run in Expo Go. Decision D-01 names `expo-health` but the intent is clear (use the real HealthKit package); the planner must use `react-native-health` or `@kingstinct/react-native-healthkit` instead.

**NCBI PubMed API** works without an API key (rate limit: 3 req/sec per IP). The recommended two-step pattern is eSearch (get PMIDs as JSON) then eSummary (get metadata per PMID as JSON). eFetch XML is available for full abstracts but adds parsing complexity. eSummary does not return full abstracts — only a brief `title`, `fulljournalname`, `pubdate`, and authors. For abstract snippets (D-10), eFetch with `retmode=xml&rettype=abstract` is required, or abstract text must be parsed from the XML response. This is a meaningful implementation decision the planner needs to handle.

**Primary recommendation:** Use `react-native-health` v1.19.0 (Agency Enterprise) for HealthKit — it has an older, more stable API surface, mature Expo config plugin support, and all 8 required data type methods are documented. Use NCBI eSearch→eSummary for article metadata plus eFetch for abstract text. Cache all data in Supabase. Build via EAS.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| HealthKit permission request | Frontend (iOS native) | AsyncStorage (state persistence) | HealthKit permissions are an iOS system API; state persistence is client-only per D-05 |
| HealthKit data reads | Frontend (iOS native) | AsyncStorage (local cache) | HealthKit is iOS-local; no server involved; data stored in `@vitalspan_health_data` |
| HealthKit permission denied → Settings | Frontend (UI) | — | `Linking.openURL('app-settings:')` is iOS-only client-side |
| PubMed article fetch | Client (fetch API) | Supabase (articles cache) | Client calls NCBI API directly; Supabase stores results; no backend needed |
| Article cache staleness check | Client (AsyncStorage) | Supabase (fetched_at column) | Timestamp in AsyncStorage for fast check; Supabase is authoritative cache store |
| Article personalization ranking | Client (in-memory) | — | Pure JavaScript sort using BIOMARKERS data; no server computation needed |
| PubMed URL open | Client (SafariViewController) | — | expo-web-browser opens SFSafariViewController inline per D-11 |
| Supabase articles upsert | Client (service-role key pattern) | — | See NOTE below on RLS strategy |

**NOTE on D-13 RLS (public read, service-role write):** In a React Native client app there is no server-side service-role key. The Supabase `service_role` key must never be embedded in the client (it bypasses all RLS). The correct interpretation of D-13 is: (1) enable RLS, (2) add a policy `FOR SELECT USING (true)` so all users can read articles, (3) add a policy `FOR INSERT WITH CHECK (true)` and `FOR UPDATE USING (true)` for the anon role — OR simply insert from the client using the anon key. Because articles are a shared cache with no PII, a permissive write policy for the anon role is appropriate and safe. The planner should create an anon-writable insert/update policy, not attempt to use service-role from the client. [ASSUMED — the specific RLS SQL is subject to verification during implementation]

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-native-health` | 1.19.0 | HealthKit reads (HRV, sleep, HR, steps, glucose, etc.) | Mature (4+ yrs), Expo config plugin, all 8 required data types documented [CITED: github.com/agencyenterprise/react-native-health] |
| `react-native-nitro-modules` | 0.35.9 | Required peer for `@kingstinct/react-native-healthkit` | N/A for primary choice |
| `expo-web-browser` | 56.0.5 (latest) | Open PubMed URLs in SFSafariViewController | Expo official package, MIT, already works in managed workflow [VERIFIED: npm registry] |

**Alternative HealthKit library:** `@kingstinct/react-native-healthkit` v14.0.1 — newer, Nitro Modules-based, TypeScript-native, but requires `react-native-nitro-modules` (a third dependency) and v14 is 2 weeks old. Risk: untested edge at this version age. Use `react-native-health` unless type safety is blocking. [ASSUMED — tradeoff based on relative maturity]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `expo-web-browser` | 56.0.5 | SafariViewController for article URLs | Already in Expo SDK; install if not present |
| NCBI E-utilities (HTTP, no install) | — | PubMed article search and metadata | Called via `fetch()` in articleService.ts — no package install |
| Supabase JS client | 2.106.2 (already installed) | articles table upsert + select | Already in project; no new install |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-native-health` | `@kingstinct/react-native-healthkit` | Kingstinct is TypeScript-native with hooks API; tradeoff is extra Nitro peer dep and very fresh v14 |
| NCBI eSummary (no abstract) | NCBI eFetch XML (full abstract) | eSummary is JSON-native, faster; eFetch gives full abstract but requires XML parsing |
| Supabase for article cache | AsyncStorage only | Supabase is shared cache (no per-user duplication); AsyncStorage only is simpler but per-device |

**Installation (net new packages only):**
```bash
npx expo install react-native-health expo-web-browser
```

**Version verification (confirmed at research time):**
- `react-native-health`: 1.19.0 — published 2024-10-15 [VERIFIED: npm registry]
- `@kingstinct/react-native-healthkit`: 14.0.1 — published 2026-05-14 [VERIFIED: npm registry]
- `expo-web-browser`: 56.0.5 — latest [VERIFIED: npm registry]
- `expo-health`: 0.0.0 — PLACEHOLDER STUB — do not use [VERIFIED: npm registry — confirmed non-functional]

---

## Package Legitimacy Audit

> slopcheck was unavailable at research time (pip install failed). All packages marked [ASSUMED] except those confirmed via official sources. The planner must gate each new install behind a `checkpoint:human-verify` before running `npx expo install`.

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| `react-native-health` | npm | ~4 yrs (Oct 2024) | github.com/agencyenterprise/react-native-health | [NOT RUN] | Approved — official GitHub, MIT, well-known maintainer (agencyenterprise) [ASSUMED] |
| `@kingstinct/react-native-healthkit` | npm | ~3 yrs (May 2026 latest) | github.com/kingstinct/react-native-healthkit | [NOT RUN] | Approved — active repo, MIT, author is known RN community contributor [ASSUMED] |
| `react-native-nitro-modules` | npm | Current (May 2026) | github.com/mrousavy/nitro | [NOT RUN] | Approved — Marc Rousavy is well-known RN author (VisionCamera, MMKV) [ASSUMED] |
| `expo-web-browser` | npm | 8+ yrs | github.com/expo/expo | [NOT RUN] | Approved — official Expo SDK package [CITED: docs.expo.dev/versions/latest/sdk/webbrowser/] |
| `expo-health` | npm | Placeholder stub | none (50-byte tarball) | N/A | **REMOVED — do not install. Non-functional placeholder.** |

**Packages removed due to [SLOP] / placeholder verdict:** `expo-health`
**Packages flagged [ASSUMED]:** `react-native-health`, `@kingstinct/react-native-healthkit`, `react-native-nitro-modules` — planner must add checkpoint:human-verify before install

---

## Architecture Patterns

### System Architecture Diagram

```
App Open
  │
  ├── [Articles Workstream]
  │     AsyncStorage.getItem('@vitalspan_articles_last_fetched')
  │     │
  │     ├── < 24h ago → Supabase.select('articles') → show cached
  │     └── > 24h ago → show cached immediately (stale)
  │                     └── [background] articleService.refresh()
  │                           ├── NCBI eSearch (per biomarker query) → PMIDs[]
  │                           ├── NCBI eSummary (PMIDs) → metadata JSON
  │                           ├── NCBI eFetch XML (for abstracts) → abstract text
  │                           ├── Supabase.upsert('articles', { onConflict: 'pmid' })
  │                           └── AsyncStorage.setItem('@vitalspan_articles_last_fetched')
  │
  └── [HealthKit Workstream]
        LongevityScoreScreen mounts
        │
        ├── AsyncStorage.getItem('@vitalspan_health_permissions')
        │     └── { hasRequestedHealthKit: true } ?
        │           ├── YES, granted → loadHealthData() → show live orbitals
        │           ├── YES, denied → show "Connect Health" + Settings deep-link
        │           └── NO (first visit) → show "Connect Apple Health" prompt card
        │                 └── [on tap] requestHealthKitPermissions()
        │                       ├── iOS system prompt appears
        │                       ├── granted → connectAndSync() → live orbitals
        │                       └── denied → save denied state → Settings CTA
        │
        └── (Profile/Settings) disconnect
              └── clear @vitalspan_health_permissions + @vitalspan_health_data
                  → orbitals revert to empty / manual-entry state

DashboardScreen
  └── "Research" CTA card (BreathingCard)
        └── nav.push('Articles')
              └── ArticlesScreen
                    ├── Supabase.select('articles') → ranked by out-of-range biomarkers
                    └── FlatList of ArticleCard
                          └── [tap] WebBrowser.openBrowserAsync(pubmedUrl)
```

### Recommended Project Structure

```
src/
  lib/
    healthkit.ts         # MODIFY: replace mock reads with react-native-health calls
    articleService.ts    # NEW: NCBI fetch + Supabase cache + ranking logic
  screens/
    LongevityScoreScreen.tsx  # MODIFY: mount-time permission gate (D-05)
    DashboardScreen.tsx       # MODIFY: add Research CTA card
    ArticlesScreen.tsx         # NEW: article list with FlatList
  navigation/
    AppNavigator.tsx     # MODIFY: add 'Articles' to RootStackParamList + Stack.Screen
```

### Pattern 1: react-native-health — initHealthKit + Permission Request

**What:** One-time initialization + permission grant via `initHealthKit`, then data reads via individual sample methods.
**When to use:** Every session before calling any read method. Guard with AsyncStorage first-visit flag.

```typescript
// Source: github.com/agencyenterprise/react-native-health (README)
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';

const PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.Vo2Max,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.MindfulSession,
      AppleHealthKit.Constants.Permissions.BloodGlucose,
    ],
    write: [],
  },
};

// Call this once. iOS system prompt fires here.
AppleHealthKit.initHealthKit(PERMISSIONS, (error) => {
  if (error) {
    console.error('[HealthKit] Permission error', error);
    return;
  }
  // Now safe to call read methods
});
```

**Known permission caveat:** iOS HealthKit does NOT return a "denied" status to the app — this is Apple's privacy design. If a user denies, `initHealthKit` callback may still succeed but subsequent reads return empty arrays. You cannot distinguish "denied" from "no data" programmatically. Strategy: attempt to read HRV after `initHealthKit`; if the result is empty, assume denied and show Settings CTA. [CITED: github.com/agencyenterprise/react-native-health issue #262]

### Pattern 2: react-native-health — Reading Individual Metrics

```typescript
// Source: github.com/agencyenterprise/react-native-health (docs/)
// HRV RMSSD (Apple reports as SDNN; closest HealthKit quantity)
AppleHealthKit.getHeartRateVariabilitySamples(
  { startDate: sevenDaysAgo.toISOString(), limit: 1, ascending: false },
  (err, results) => {
    if (!err && results.length > 0) {
      // value is in seconds (e.g., 0.042 = 42ms RMSSD)
      const hrvMs = Math.round(results[0].value * 1000);
    }
  },
);

// Resting Heart Rate
AppleHealthKit.getRestingHeartRateSamples(
  { startDate: sevenDaysAgo.toISOString(), limit: 1, ascending: false },
  (err, results) => {
    if (!err && results.length > 0) restingHR = results[0].value; // bpm
  },
);

// VO2max (iOS 11+ only, requires Apple Watch)
AppleHealthKit.getVo2MaxSamples(
  { startDate: thirtyDaysAgo.toISOString(), limit: 1, ascending: false, unit: 'ml/(kg * min)' },
  (err, results) => {
    if (!err && results.length > 0) vo2max = results[0].value;
  },
);

// Sleep Analysis — aggregate total, deep, REM
AppleHealthKit.getSleepSamples(
  { startDate: yesterday.toISOString() },
  (err, results) => {
    // results[].value: 'ASLEEP' | 'DEEP' | 'REM' | 'CORE' | 'INBED' | 'AWAKE'
    // Compute durations by filtering value type and summing (endDate - startDate)
    const deepMs = results
      .filter(r => r.value === 'DEEP')
      .reduce((acc, r) => acc + (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()), 0);
    const remMs = results
      .filter(r => r.value === 'REM')
      .reduce((acc, r) => acc + (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()), 0);
    const totalMs = results
      .filter(r => r.value === 'ASLEEP' || r.value === 'CORE')
      .reduce((acc, r) => acc + (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()), 0);
  },
);

// Steps (7-day average)
AppleHealthKit.getDailyStepCountSamples(
  { startDate: sevenDaysAgo.toISOString() },
  (err, results) => {
    if (!err && results.length > 0) {
      const avg = results.reduce((sum, r) => sum + r.value, 0) / results.length;
    }
  },
);

// Blood Glucose
AppleHealthKit.getBloodGlucoseSamples(
  { startDate: sevenDaysAgo.toISOString(), limit: 1, ascending: false },
  (err, results) => {
    if (!err && results.length > 0) glucoseMgdl = results[0].value; // mg/dL
  },
);

// Respiratory Rate
AppleHealthKit.getRespiratoryRateSamples(
  { startDate: sevenDaysAgo.toISOString(), limit: 1, ascending: false },
  (err, results) => {
    if (!err && results.length > 0) respiratoryRate = results[0].value; // breaths/min
  },
);

// Mindful Minutes (total over 7 days)
AppleHealthKit.getMindfulSession(
  { startDate: sevenDaysAgo.toISOString() },
  (err, results) => {
    if (!err) {
      const totalMindfulMs = results.reduce(
        (sum, r) => sum + (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()),
        0
      );
      mindfulMinutes = Math.round(totalMindfulMs / 60000);
    }
  },
);
```

**HRV unit note:** `react-native-health` returns HRV values in **seconds** (e.g., 0.042). Multiply by 1000 to get milliseconds for display. `HealthData.hrv` is typed as ms (see mock: `48–76`). [CITED: github.com/agencyenterprise/react-native-health/blob/master/docs/getHeartRateVariabilitySamples.md]

### Pattern 3: NCBI E-utilities Two-Step (eSearch → eSummary)

**What:** Search PubMed by biomarker keyword → retrieve article metadata as JSON.
**Rate limit:** 3 requests/second without API key. [CITED: ncbiinsights.ncbi.nlm.nih.gov/2017/11/02/new-api-keys-for-the-e-utilities/]

```typescript
// Source: NCBI E-utilities documentation (ncbi.nlm.nih.gov/books/NBK25499/)
// Step 1: eSearch — get PMIDs for a query
const ESEARCH_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const ESUMMARY_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
const EFETCH_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';

async function searchPubMed(query: string, retmax = 5): Promise<string[]> {
  const url = `${ESEARCH_BASE}?db=pubmed&term=${encodeURIComponent(query)}&retmax=${retmax}&retmode=json`;
  const res = await fetch(url);
  const json = await res.json() as { esearchresult: { idlist: string[] } };
  return json.esearchresult.idlist; // array of PMID strings
}

// Step 2: eSummary — get metadata (title, journal, date) — NO full abstract
async function getSummaries(pmids: string[]): Promise<NCBISummaryResult[]> {
  const ids = pmids.join(',');
  const url = `${ESUMMARY_BASE}?db=pubmed&id=${ids}&retmode=json`;
  const res = await fetch(url);
  const json = await res.json() as { result: Record<string, NCBISummary> };
  return pmids.map(id => json.result[id]).filter(Boolean);
}

// eSummary response shape per article:
interface NCBISummary {
  uid: string;          // PMID
  title: string;
  fulljournalname: string;
  pubdate: string;      // e.g., "2023 Jan"
  authors: { name: string }[];
  elocationid: string;  // DOI
  // NOTE: NO abstract field in eSummary
}

// Step 3: eFetch XML — get full abstract (parse XML)
// Only needed if D-10 requires abstract snippet. Uses XML parsing.
async function fetchAbstract(pmid: string): Promise<string | null> {
  const url = `${EFETCH_BASE}?db=pubmed&id=${pmid}&rettype=abstract&retmode=xml`;
  const res = await fetch(url);
  const xml = await res.text();
  // Parse <AbstractText> from XML string
  const match = xml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/);
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : null;
}
```

**Abstract gap:** `eSummary` does NOT include abstract text. For abstract snippet display (D-10), either: (a) call `eFetch` per article for XML + regex-parse `<AbstractText>`, or (b) store abstracts from eFetch in the Supabase cache on first fetch. Recommend option (b): during the background refresh, fetch eSummary then eFetch for each PMID, store abstract in Supabase, show from cache thereafter. [CITED: ncbi.nlm.nih.gov/books/NBK25499/ — confirmed eSummary has no abstract field]

### Pattern 4: Supabase articles Table — Upsert by PMID

```typescript
// Source: supabase.com/docs/reference/javascript/upsert
// Schema per D-13:
// CREATE TABLE articles (
//   pmid text PRIMARY KEY,
//   title text NOT NULL,
//   journal text,
//   pub_date text,
//   abstract text,
//   biomarker_tags text[],
//   fetched_at timestamptz DEFAULT now()
// );

// Upsert multiple articles (insert or update on pmid conflict)
const { error } = await supabase
  .from('articles')
  .upsert(articles, { onConflict: 'pmid' });

// Select all articles (public read, sorted by fetched_at desc)
const { data, error } = await supabase
  .from('articles')
  .select('pmid, title, journal, pub_date, abstract, biomarker_tags, fetched_at')
  .order('fetched_at', { ascending: false });
```

**RLS SQL (create in Supabase dashboard):**
```sql
-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public read (all authenticated and anonymous users)
CREATE POLICY "public read articles"
  ON articles FOR SELECT
  USING (true);

-- Anon write (app client inserts/updates cache)
CREATE POLICY "anon write articles"
  ON articles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "anon update articles"
  ON articles FOR UPDATE
  USING (true);
```

### Pattern 5: Stale-While-Revalidate for Articles

```typescript
// In ArticlesScreen or articleService.ts
export async function loadArticles(
  userEntries: StoredEntry[],
  onUpdate: (articles: Article[]) => void,
): Promise<void> {
  // Step 1: Show cached immediately
  const { data: cached } = await supabase.from('articles').select('*');
  if (cached?.length) {
    onUpdate(rankArticles(cached, userEntries));
  }

  // Step 2: Check staleness
  const lastFetched = await AsyncStorage.getItem('@vitalspan_articles_last_fetched');
  const ageMs = lastFetched ? Date.now() - new Date(lastFetched).getTime() : Infinity;
  if (ageMs < 24 * 60 * 60 * 1000) return; // fresh enough

  // Step 3: Background refresh
  try {
    const fresh = await fetchAllBiomarkerArticles(); // calls NCBI
    await supabase.from('articles').upsert(fresh, { onConflict: 'pmid' });
    await AsyncStorage.setItem('@vitalspan_articles_last_fetched', new Date().toISOString());
    const { data: updated } = await supabase.from('articles').select('*');
    if (updated) onUpdate(rankArticles(updated, userEntries));
  } catch (e) {
    console.error('[articleService] background refresh failed', e);
    // Silently fail — cached data already shown
  }
}
```

### Pattern 6: expo-web-browser

```typescript
// Source: docs.expo.dev/versions/latest/sdk/webbrowser/
import * as WebBrowser from 'expo-web-browser';

const pmidUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
const result = await WebBrowser.openBrowserAsync(pmidUrl);
// result.type: 'cancel' (iOS user dismissed) | 'dismiss' | 'opened' (Android)
// No error handling needed — SafariViewController is always available on iOS 9+
```

### Pattern 7: Settings Deep-Link (Denied Permissions)

```typescript
// Source: reactnative.dev/docs/linking
import { Linking } from 'react-native';

// Open app's own settings page on iOS
await Linking.openURL('app-settings:');
// This is iOS-only. Since Vitalspan is iOS-only per REQUIREMENTS.md, no Android fallback needed.
```

### Anti-Patterns to Avoid

- **Calling HealthKit reads before initHealthKit resolves:** All sample methods fail silently if called before initialization. Always gate reads inside the `initHealthKit` success callback.
- **Assuming permission denied is detectable:** iOS does not report denied status to the app. Do not check `granted: false` to show the Settings CTA — instead, detect by reading an empty result set and mapping that to "likely denied" state.
- **Using expo-health package:** It is a 50-byte placeholder stub that does nothing. Installing it will silently succeed but break at runtime.
- **Calling NCBI API with >3 req/sec without an API key:** Will receive HTTP 429 after sustained rapid requests. Implement sequential fetch with delay or batch eSummary calls (up to 200 PMIDs per call per NCBI docs).
- **Embedding service-role key in client:** D-13 says "service-role write" but that key cannot be in the app bundle. Use anon-key with a permissive RLS policy instead.
- **Using eSummary and expecting abstract text:** eSummary JSON does not include abstract. Must call eFetch XML for abstract text and parse it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HealthKit permissions + data read | Custom native module or bridged Swift | `react-native-health` | Handles iOS version quirks, RMSSD unit conversions, sleep sample aggregation complexity |
| PubMed article URL open | WebView component | `expo-web-browser` | SFSafariViewController has back nav, cookies, reader mode, content blockers; WebView lacks these |
| XML abstract parsing (complex) | Full XML parser library | Regex on `<AbstractText>` tag | Abstract tag is predictably shaped; full XML parse library adds unnecessary weight |
| Supabase upsert logic | Manual SELECT + INSERT/UPDATE | `.upsert({ onConflict: 'pmid' })` | Supabase upsert handles the race condition atomically |

**Key insight:** HealthKit's API surface is quirky (callbacks not promises in `react-native-health`, unit conversions, overlapping sleep samples, SDNN vs RMSSD naming). Wrapping in a clean async utility layer in `healthkit.ts` is the right approach — the library handles the iOS native binding, you handle the aggregation.

---

## Biomarker → PubMed Query Map

Per D-12, each biomarker in `BIOMARKERS` needs a search query string. Based on `src/data/biomarkers.ts` IDs and longevity-medicine context: [ASSUMED — pharmacist should verify clinical relevance of query strings]

| Biomarker ID | Query String |
|-------------|--------------|
| `apob` | `"ApoB lipoprotein longevity cardiovascular aging"` |
| `hscrp` | `"CRP inflammation aging longevity"` |
| `hba1c` | `"HbA1c glycation biological aging longevity"` |
| `igf1` | `"IGF-1 longevity cancer mTOR aging"` |
| `vitd` | `"vitamin D longevity aging immune function"` |
| `testosterone` | `"testosterone aging muscle longevity sarcopenia"` |
| `homocysteine` | `"homocysteine cardiovascular aging methylation"` |
| `fastingglucose` | `"fasting glucose insulin sensitivity longevity"` |
| `ferritin` | `"ferritin iron oxidative stress aging"` |
| `dheas` | `"DHEA-S aging adrenal longevity"` |
| `omega3index` | `"omega-3 EPA DHA longevity cardiovascular"` |
| `uricacid` | `"uric acid aging gout metabolic longevity"` |

**Global fallback queries** for initial article seeding (fetch even before biomarker data):
- `"longevity biological aging healthspan"` → tags: `[]` (general)
- `"PhenoAge epigenetic clock biological age"` → tags: `['hba1c', 'hscrp']`

---

## Common Pitfalls

### Pitfall 1: expo-health Package Confusion
**What goes wrong:** Developer installs `expo-health` as referenced in the existing mock comments, app builds successfully (placeholder installs cleanly), but crashes at runtime when attempting any HealthKit API call.
**Why it happens:** `expo-health` on npm is a proprietary 50-byte stub (version 0.0.0) — it publishes no actual code. The comment in `healthkit.ts` was written speculatively.
**How to avoid:** Install `react-native-health` or `@kingstinct/react-native-healthkit` instead. The `npx expo install expo-health` command succeeds (package exists) but the package does nothing.
**Warning signs:** No exported constants, no `initHealthKit` function, TypeScript types missing.

### Pitfall 2: HealthKit initHealthKit Must Precede All Reads
**What goes wrong:** `getHeartRateVariabilitySamples` called before `initHealthKit` callback fires — returns empty array silently, developer assumes no HRV data is available.
**Why it happens:** All read methods are no-ops without successful initialization.
**How to avoid:** Structure all reads inside the `initHealthKit` success callback. Use a module-level `isInitialized` flag if reads are called from multiple places.
**Warning signs:** All sample methods returning empty arrays on a device that has HealthKit data.

### Pitfall 3: iOS Hides HealthKit Denial from App
**What goes wrong:** After user taps "Don't Allow" on the HealthKit system prompt, `initHealthKit` callback may still fire successfully. Subsequent reads return empty results but the app cannot distinguish "denied" from "no data recorded."
**Why it happens:** Apple's deliberate privacy design — apps cannot detect which permissions were denied.
**How to avoid:** Save the timestamp of when `initHealthKit` was called. If the immediate read attempt after init returns empty across all categories, treat as "likely denied" and show the Settings CTA. Accept some false positives (new device with no health data).
**Warning signs:** User flow appears stuck after first-visit permission prompt even on a device that has health data.

### Pitfall 4: eSummary Does Not Return Abstract Text
**What goes wrong:** articleService builds nicely with eSummary JSON, displays articles, but abstract snippet is `undefined` — article cards show just title and journal.
**Why it happens:** NCBI's `esummary.fcgi` endpoint returns document summaries (citation-level metadata) but not the abstract body. Abstract lives in eFetch response.
**How to avoid:** Add a third API call per article: `efetch.fcgi?db=pubmed&id={pmid}&rettype=abstract&retmode=xml`. Parse `<AbstractText>` with regex. Store in Supabase `abstract` column. Show from cache thereafter.
**Warning signs:** `abstract` field missing from eSummary JSON response (not a bug — it's by design).

### Pitfall 5: NCBI Rate Limit in Background Refresh
**What goes wrong:** Fetching 12 biomarkers × 5 PMIDs each = 60 eSearch calls + 60 eSummary/eFetch calls = 120+ requests. At >3/sec this triggers HTTP 429.
**Why it happens:** No built-in throttling in `fetch()`.
**How to avoid:** Batch eSummary calls — one eSummary request accepts up to 200 PMIDs. Pattern: 12 eSearch calls (total PMIDs ≤60) → one eSummary batch → 60 eFetch calls with 350ms delay between each. Total time ~25 seconds in background — acceptable.
**Warning signs:** Some articles appearing, others missing; console showing 429 errors.

### Pitfall 6: HRV Unit Conversion
**What goes wrong:** HRV displayed as `0.042` ms on screen instead of `42` ms.
**Why it happens:** `react-native-health` returns HRV in seconds. The `HealthData.hrv` field expects milliseconds (mock generates 48–76 ms range).
**How to avoid:** Multiply by 1000: `hrv = Math.round(result.value * 1000)`.
**Warning signs:** HRV orbital showing values like `0.05` instead of expected `50`.

### Pitfall 7: EAS Build Required (No Expo Go)
**What goes wrong:** Developer tests HealthKit in Expo Go / `expo start` — `react-native-health` throws `cannot find module` or `initHealthKit is not a function`.
**Why it happens:** HealthKit requires native code compiled into the app binary. Expo Go does not include `react-native-health` native modules.
**How to avoid:** All HealthKit testing must use `eas build --profile preview` (per D-03). Document this in task descriptions so the executor knows not to test via `expo start`.
**Warning signs:** Any runtime error mentioning "native module not found" during development.

---

## Code Examples

### app.json HealthKit Entitlement Configuration

```json
{
  "expo": {
    "plugins": [
      "expo-font",
      [
        "react-native-health",
        {
          "healthSharePermission": "Vitalspan reads your health data to display longevity metrics on your dashboard.",
          "healthUpdatePermission": "Vitalspan writes workout data to Apple Health."
        }
      ]
    ],
    "ios": {
      "entitlements": {
        "com.apple.developer.healthkit": true
      }
    }
  }
}
```

**Note:** The `NSHealthShareUsageDescription` is already set in `app.json` `ios.infoPlist`. The config plugin overwrites it — ensure the plugin's `healthSharePermission` matches the existing copy: "Vitalspan reads your health data to track biomarkers and biological age." [ASSUMED — verify if plugin takes precedence over infoPlist]

### articleService.ts Skeleton (follows Phase 8 service pattern)

```typescript
// src/lib/articleService.ts
// Pattern: pure functions, no screen imports, follows biomarkerWriteService.ts pattern (D-10 from Phase 8)
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BIOMARKERS } from '../data/biomarkers';
import { StoredEntry } from '../screens/BiomarkerEntryScreen';

const ARTICLES_KEY = '@vitalspan_articles_last_fetched';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface Article {
  pmid: string;
  title: string;
  journal: string;
  pub_date: string;
  abstract: string | null;
  biomarker_tags: string[];
  fetched_at: string;
}

/** Load articles from Supabase cache, sorted by out-of-range relevance. */
export async function loadCachedArticles(entries: StoredEntry[]): Promise<Article[]> {
  const { data, error } = await supabase.from('articles').select('*');
  if (error || !data) return [];
  return rankByOutOfRange(data as Article[], entries);
}

/** Background refresh: fetch from NCBI, upsert to Supabase, update timestamp. Never throws. */
export async function refreshArticlesIfStale(entries: StoredEntry[]): Promise<Article[] | null> {
  try {
    const ts = await AsyncStorage.getItem(ARTICLES_KEY);
    if (ts && Date.now() - new Date(ts).getTime() < CACHE_TTL_MS) return null;
    const fresh = await fetchAllBiomarkerArticles();
    if (fresh.length > 0) {
      await supabase.from('articles').upsert(fresh, { onConflict: 'pmid' });
      await AsyncStorage.setItem(ARTICLES_KEY, new Date().toISOString());
    }
    const { data } = await supabase.from('articles').select('*');
    return data ? rankByOutOfRange(data as Article[], entries) : null;
  } catch (e) {
    console.error('[articleService] refresh error', e);
    return null;
  }
}

function rankByOutOfRange(articles: Article[], entries: StoredEntry[]): Article[] {
  // Build set of out-of-range biomarker IDs
  const latestByBiomarker = new Map<string, StoredEntry>();
  for (const e of entries) {
    const prev = latestByBiomarker.get(e.biomarkerId);
    if (!prev || e.date > prev.date) latestByBiomarker.set(e.biomarkerId, e);
  }
  const outOfRange = new Set<string>();
  for (const bm of BIOMARKERS) {
    const entry = latestByBiomarker.get(bm.id);
    if (entry && (entry.value < bm.optMin || entry.value > bm.optMax)) {
      outOfRange.add(bm.id);
    }
  }
  return [...articles].sort((a, b) => {
    const aRelevant = a.biomarker_tags.some(t => outOfRange.has(t)) ? 0 : 1;
    const bRelevant = b.biomarker_tags.some(t => outOfRange.has(t)) ? 0 : 1;
    return aRelevant - bRelevant;
  });
}
```

**Note on `BIOMARKERS` field names:** `src/data/biomarkers.ts` uses `optMin` / `optMax` (not `min` / `max`). The `Biomarker` interface confirms this. The article ranking must reference `bm.optMin` and `bm.optMax`. [VERIFIED: read src/data/biomarkers.ts at research time]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `expo-health` (referenced in mock comments) | `react-native-health` or `@kingstinct/react-native-healthkit` | Never existed — was speculative | Must use real package |
| Callback API (`react-native-health`) | Promise/hooks API (`@kingstinct/react-native-healthkit`) | ~2023 | Alternative library; both valid |
| XML-only NCBI responses | JSON available for eSearch + eSummary | 2018 | Simpler parsing for metadata |
| Service role key for writes | Anon role with permissive RLS for shared tables | N/A | Service role key must never be in client bundle |

**Deprecated/outdated:**
- `expo-health` (npm package): Non-functional placeholder — never use.
- `isDemoMode: true` path in LongevityScoreScreen: Remove from pre-permission state per D-06.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `react-native-health` Constants.Permissions includes `HeartRateVariability`, `RestingHeartRate`, `RespiratoryRate`, `MindfulSession` as exact string identifiers | Standard Stack, Code Examples | Build error if identifiers differ; executor can verify with TypeScript types after install |
| A2 | RLS anon-write policy on articles table is safe (no PII in articles, shared across all users) | Architecture Patterns Pattern 4 | Security concern if articles table unexpectedly receives PII; mitigated by schema design (no user_id column) |
| A3 | `react-native-health` config plugin correctly sets `com.apple.developer.healthkit` entitlement via app.json without manual Apple Developer Portal setup | Standard Stack Code Examples | EAS build may fail without manual capability registration; executor should verify with `eas build` logs |
| A4 | `NSHealthShareUsageDescription` in `infoPlist` and in the plugin's `healthSharePermission` prop are reconciled (no duplicate/conflict) | Code Examples (app.json) | App Store review may reject if usage description is missing or contradictory |
| A5 | NCBI eSummary `pubdate` field format is `"2023 Jan"` or similar parseable string | Code Examples (articleService) | Date display may show raw unparsed string; low severity |
| A6 | Biomarker → query string map is clinically appropriate for longevity medicine context | Biomarker → PubMed Query Map | Irrelevant articles surfaced; pharmacist should review all 12 query strings before shipping |
| A7 | `react-native-health` HRV value is in seconds (multiply × 1000 for ms) | Common Pitfalls / Code Examples | HRV display shows ~0.05 instead of ~50ms; high visibility bug but easy to fix |

---

## Open Questions

1. **Which HealthKit library: `react-native-health` or `@kingstinct/react-native-healthkit`?**
   - What we know: Both are legitimate and work with EAS managed workflow. `react-native-health` is callback-based, more mature. Kingstinct is Promise/hooks-based, requires `react-native-nitro-modules` peer, v14 is very fresh (2 weeks old).
   - What's unclear: Whether the existing mock's callback structure matches `react-native-health`'s API better (yes it does — the mock uses callbacks).
   - Recommendation: Use `react-native-health` v1.19.0 for minimal friction; mock already uses callback pattern.

2. **Abstract fetch strategy: eFetch XML per article vs store-on-first-fetch?**
   - What we know: D-10 requires abstract snippet; eSummary does not provide it.
   - What's unclear: Whether 60 eFetch calls during background refresh is acceptable latency.
   - Recommendation: Fetch abstracts during the background refresh (store-on-first-fetch), show from Supabase cache on subsequent views.

3. **How many articles to fetch per biomarker?**
   - What we know: 12 biomarkers × N articles each. D-12 says "per-biomarker queries" but doesn't specify count.
   - What's unclear: Whether the UI benefits from >5 articles per biomarker.
   - Recommendation: 3–5 per biomarker = 36–60 total PMIDs. Recommend `retmax=5` in eSearch.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm installs | ✓ | v25.9.0 | — |
| npm | Package install | ✓ | 11.12.1 | — |
| EAS CLI | HK EAS build (D-03) | ✓ | 20.0.0 | — |
| iOS physical device | HealthKit testing | unknown | — | EAS Preview build distributed to TestFlight |
| Supabase project | articles table | ✓ (Phase 4) | — | — |
| NCBI E-utilities | Article fetch | ✓ (public API, no key needed) | — | — |

**Missing dependencies with no fallback:**
- iOS physical device or TestFlight slot — HealthKit does not run in simulator. EAS preview build to a real device is the only path to test live HealthKit reads.

**Missing dependencies with fallback:**
- None — all required tools available.

---

## Project Constraints (from CLAUDE.md)

| Directive | Category | Compliance Requirement |
|-----------|----------|----------------------|
| All colors from `src/theme/index.ts` — never hardcode hex | Style | ArticlesScreen and any new components must import `Colors.*` only |
| All spacing from `Spacing.*` — never hardcode margin/padding | Style | Same for new screens |
| StyleSheet at bottom of every file, named `s` | Style | ArticlesScreen.tsx must follow this |
| No inline styles except dynamic ones | Style | Only dynamic values (e.g. `{ color: someVar }`) inline |
| TypeScript strict — no `any` | Types | All HealthKit callbacks and NCBI response types must be properly typed |
| Components max 200 lines — split if longer | Structure | ArticleCard component should be extracted if ArticlesScreen grows |
| `console.error(e)` in catch blocks — keep; no `console.log` debug | Logging | articleService.ts and healthkit.ts catch blocks must use `console.error` |
| AsyncStorage key convention: `@vitalspan_*` prefix | Storage | New key: `@vitalspan_articles_last_fetched` — correct prefix confirmed |
| API keys in `.env` only — `process.env.EXPO_PUBLIC_*` exclusively | Security | No NCBI API key needed. Supabase keys already in env. |
| Expo SDK 54 compat — no new packages without checking | Dependencies | Both `react-native-health` (peer: RN >=0.67.3) and Expo SDK 54 (RN 0.81.5) — compatible [CITED: npm registry peerDependencies] |

---

## Sources

### Primary (HIGH confidence)
- [github.com/agencyenterprise/react-native-health](https://github.com/agencyenterprise/react-native-health) — API methods, permissions, initHealthKit pattern, sleep/HRV/VO2max docs
- [ncbi.nlm.nih.gov/books/NBK25499/](https://www.ncbi.nlm.nih.gov/books/NBK25499/) — E-utilities parameters (eSearch, eSummary, eFetch), retmode/rettype options
- [docs.expo.dev/versions/latest/sdk/webbrowser/](https://docs.expo.dev/versions/latest/sdk/webbrowser/) — WebBrowser.openBrowserAsync API
- [docs.expo.dev/build-reference/ios-capabilities/](https://docs.expo.dev/build-reference/ios-capabilities/) — EAS Build HealthKit capability auto-sync
- [ncbiinsights.ncbi.nlm.nih.gov/2017/11/02/new-api-keys-for-the-e-utilities/](https://ncbiinsights.ncbi.nlm.nih.gov/2017/11/02/new-api-keys-for-the-e-utilities/) — Rate limits (3/sec without key, 10/sec with key)
- npm registry: `expo-health` (0.0.0 placeholder confirmed), `react-native-health` (1.19.0), `@kingstinct/react-native-healthkit` (14.0.1), `expo-web-browser` (56.0.5)

### Secondary (MEDIUM confidence)
- [dev.to/0012303/pubmed-has-a-free-api...](https://dev.to/0012303/pubmed-has-a-free-api-search-35m-medical-papers-without-scraping-no-key-2me) — eSummary JSON response shape: `result[pmid].title`, `fulljournalname`, `pubdate`
- [supabase.com/docs/reference/javascript/upsert](https://supabase.com/docs/reference/javascript/upsert) — onConflict upsert syntax
- [kingstinct.com/react-native-healthkit/](https://kingstinct.com/react-native-healthkit/) — alternative library API overview

### Tertiary (LOW confidence)
- [github.com/agencyenterprise/react-native-health/issues/262](https://github.com/agencyenterprise/react-native-health/issues/262) — iOS permission denial not detectable (community issue, corroborated by Apple docs pattern)

---

## Metadata

**Confidence breakdown:**
- Standard stack (HealthKit library choice): HIGH — confirmed via npm registry, official GitHub, peer dep check
- expo-health non-existence: HIGH — confirmed via npm registry (0.0.0 placeholder)
- NCBI API pattern: HIGH — confirmed via official NCBI bookshelf documentation
- NCBI eSummary lacks abstract: HIGH — confirmed via official NCBI docs and multiple secondary sources
- react-native-health HRV unit (seconds): MEDIUM — confirmed via official docs page but no unit test to verify
- Biomarker query strings: LOW — ASSUMED, pharmacist review recommended
- RLS anon-write strategy: MEDIUM — standard Supabase pattern, project-specific SQL subject to verification

**Research date:** 2026-06-02
**Valid until:** 2026-08-01 (react-native-healthkit v14 is very fresh — recheck before using as alternative)
