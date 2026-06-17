# Phase 22: Engagement & Visualization - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver three user-facing engagement features and one backend enhancement: (1) consecutive-day adherence streak counters on the Protocol screen header; (2) sparkline chart with shaded range band overlay and 30/90/365-day toggle on BiomarkerDetailScreen; (3) a 30-day free-tier biomarker history cap with a conditional upgrade banner; and (4) personal dose bucketing added to the AI Advisor context in advisorContext.ts. All changes live within ProtocolScreen.tsx, BiomarkerDetailScreen.tsx, src/lib/advisorContext.ts, and src/types/protocol.ts — no new screens.

</domain>

<decisions>
## Implementation Decisions

### D-01: Streak Storage — Running Counters in ProtocolState
- Add three fields to `ProtocolState` in `src/types/protocol.ts`:
  ```typescript
  currentStreak: number;   // consecutive days all items taken
  bestStreak: number;      // all-time high
  lastCompleteDate: string; // ISO date of the last fully-completed day
  ```
- Persisted in `@vitalspan_protocol` alongside existing fields — no new AsyncStorage key.
- EMPTY_PROTOCOL defaults: `currentStreak: 0`, `bestStreak: 0`, `lastCompleteDate: ''`.

### D-02: Streak Evaluation — Daily Reset in ProtocolScreen.loadData()
- Streak is evaluated **at the existing daily reset point**: when `takenDate !== today` on ProtocolScreen load.
- Before resetting `taken: []`, compute whether yesterday was complete:
  - **All visible items taken**: visible items = `supplements[]` + medications from user profile that are NOT in `hiddenMeds[]`.
  - If all visible items have their IDs in `taken[]` → `currentStreak++`; update `bestStreak = Math.max(bestStreak, currentStreak)`; set `lastCompleteDate = takenDate`.
  - If NOT all taken → `currentStreak = 0`.
  - If visible items count === 0 → streak **pauses** (currentStreak unchanged, neither increment nor reset).
- After evaluation, reset `taken: []` and `takenDate: today` as before.
- New items added during the day must also be taken; the eligible set is always the current visible items at reset time.

### D-03: Streak UI — Compact Stat Row Below Progress Pill
- Placement: immediately below the existing `X / Y taken` progress pill in the Protocol screen header area.
- Layout: two inline stats side-by-side.
  - Left: "🔥 12-day streak" (currentStreak)
  - Right: "Best: 14 days" (bestStreak)
- When streak = 0 and no history yet (bestStreak = 0 and lastCompleteDate = ''):
  - Show "0-day streak" + subtext "Start your streak today!"
- When currentStreak = 0 but bestStreak > 0 (streak was broken):
  - Show "0-day streak" + "Best: N days" (no motivational subtext).

### D-04: Biomarker Chart — react-native-chart-kit LineChart + SVG Range Band
- Chart library: `react-native-chart-kit` LineChart (same as Phase 21 sparkline — already installed).
- Range band (TRND-03): render a translucent green `<Rect>` SVG element between `bm.optMin` and `bm.optMax` y-positions, behind the LineChart, using `react-native-svg` (already installed). Requires converting optMin/optMax values to pixel y-coordinates relative to the chart's data range.
- Empty/insufficient data (TRND-02): when fewer than 2 data points exist for the selected time window, render a centered text placeholder — "Add at least 2 entries to see your trend." — instead of the chart. No broken chart renders.

### D-05: 30/90/365-Day Toggle — Segmented Pill
- Three-segment pill above the chart: `30D | 90D | 365D`.
- Same segmented control style as the Rutinim/Keşfet toggle established in Phase 21.
- Default selection: 90D (or 30D if fewer than 30 data points? — planner to pick the sensible default).
- Filters `history` array to entries within the selected window before rendering the chart.

### D-06: Free-Tier Data Limit — Conditional Filter in BiomarkerDetailScreen
- For non-premium users: filter `history` for a given biomarker to entries within the last 30 days before rendering history rows. Chart uses the same filtered set.
- `isPremium` read from `SubscriptionContext` — not from AsyncStorage.
- `hiddenCount` = total entries for the biomarker minus the 30-day visible set.
- Upgrade banner: shown **only when** `!isPremium && hiddenCount > 0`.
  - Position: between the chart section and the history entry list.
  - Copy: "N entries hidden — upgrade to see your full history."
  - Tap: navigate to the existing Adapty paywall screen (Phase 16 infrastructure).

### D-07: Dose Bucketing in advisorContext.ts (PROT-05)
- For each `ProtocolItem` in `protocol.supplements[]`:
  - If `personalDose` is not set → bucket as `"standard"` (default dose is by definition standard).
  - If `personalDose` is set: parse numeric prefix (parseFloat) from both `personalDose` and the matching `SUPPLEMENT_DATABASE` entry's `defaultDose`.
  - If either parse fails (non-numeric units like "as directed") → omit dose bucket from context rather than guessing.
  - Ratio threshold: `personalNumeric / defaultNumeric`:
    - ≥ 1.25 → `"high"`
    - ≤ 0.75 → `"low"`
    - otherwise → `"standard"`
- Add bucketed dose to the existing advisorContext supplement block alongside name and timing.

### Claude's Discretion
- Default selected tab (30D vs. 90D) for the time window toggle — planner picks sensible default based on typical biomarker tracking frequency.
- Exact color/opacity for the SVG range band rect — use theme green at ~15% opacity so it doesn't obscure the data line.
- Streak row typography/color — follow existing `s.progressTxt` style from ProtocolScreen.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Protocol Schema (Phase 20 — must be stable before modifying)
- `src/types/protocol.ts` — canonical home for `ProtocolItem`, `ProtocolState`, `TimeSlot`; Phase 22 adds streak fields here
- `src/screens/ProtocolScreen.tsx` — existing `loadData()`, `persist()`, daily reset logic, progress pill rendering; streak evaluation slots into the existing reset block
- `src/data/supplementTimings.ts` — `SUPPLEMENT_DATABASE` (`SupplementInfo` with `defaultDose: string`) — used for dose bucketing in PROT-05

### Biomarker Chart (Phase 22 — new)
- `src/screens/BiomarkerDetailScreen.tsx` — `history: StoredEntry[]`, `entryMap`, `bm.optMin`/`bm.optMax`, `getStatus()`; chart and range band added to the detail view branch (`selectedId` is set)
- `src/screens/BiomarkerEntryScreen.tsx` — `StoredEntry` type and `getStatus()` exported from here; import as-is
- `src/lib/biomarkerService.ts` — `getBiomarkers()` fetches `Biomarker[]` with optMin/optMax for range band coordinates

### Charts & SVG
- `react-native-chart-kit` (^6.12.0) — `LineChart` component; already used in Phase 21 ExerciseDetailScreen sparkline
- `react-native-svg` (15.12.1) — `Rect`, `Svg` for the shaded range band overlay

### Paywall (Phase 16 — for upgrade banner tap target)
- `src/navigation/AppNavigator.tsx` — paywall route name (check Phase 16 implementation for the exact route key used to open the Adapty paywall modal)
- `src/context/SubscriptionContext.tsx` — `isPremium` boolean; import and use here for gating

### AI Advisor Context (Phase 17 — update for PROT-05)
- `src/lib/advisorContext.ts` — existing `buildAdvisorContext()` function; dose bucketing added here alongside the existing protocol supplement block

### Theme & Design System
- `src/theme/index.ts` — all colors, spacing, typography tokens; use `Colors.status.optimalBg` or `Colors.Beige.*` for range band color

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ProtocolScreen.tsx` daily reset block (lines ~589–616): existing `takenDate !== today` guard with `taken` reset — streak evaluation inserts here before the reset.
- `ProtocolScreen.tsx` `persist()` function — writes to `@vitalspan_protocol` + `@vitalspan_protocol_today`; update type signature to include streak fields.
- `ExerciseDetailScreen.tsx` sparkline — the Phase 21 LineChart implementation is the closest analog for the biomarker chart; planner should read it for the chart config pattern.
- `BiomarkerDetailScreen.tsx` `entryMap` (lines ~92–103): `Map<biomarkerId, StoredEntry[]>` sorted by date desc — use `historyFor(selectedId)` and filter by time window before charting.
- `SubscriptionContext.tsx` — already wired in Phase 16; `isPremium` is available via `useSubscription()` hook.

### Established Patterns
- `useFocusEffect` + `loadData` for screen refresh — ProtocolScreen and BiomarkerDetailScreen both use this; streak recomputes on each focus.
- `StyleSheet` named `s` at bottom of file — follow throughout.
- Bottom-sheet modal pattern (Modal + KeyboardAvoidingView + TouchableOpacity overlay) — not needed for Phase 22, but noting it exists.
- Segmented pill pattern — Phase 21 Rutinim/Keşfet toggle is the reference; apply same style for 30D/90D/365D.
- SVG overlay pattern — Phase 21 ExerciseDetailScreen uses `react-native-svg` for the sparkline; same library for the range band rect.

### Integration Points
- `ProtocolState` type in `src/types/protocol.ts` needs three new optional fields (currentStreak, bestStreak, lastCompleteDate) — optional so old stored data deserializes cleanly without migration.
- `EMPTY_PROTOCOL` constant must be updated with streak defaults.
- `BiomarkerDetailScreen` detail branch: chart + toggle + range band + upgrade banner all render inside the `if (selectedId)` block, between the status insight card and the history entry list.
- `advisorContext.ts` supplement loop: after reading `item.name` and `item.timing`, look up `SUPPLEMENT_DATABASE` for defaultDose and compare with `item.personalDose`.

</code_context>

<specifics>
## Specific Ideas

- **Streak row style**: "🔥 12-day streak" on the left, "Best: 14 days" on the right — fire emoji included; follow existing `s.progressTxt` font size. Planner may use `Colors.status.optimalText` (green) for an active streak and muted color when streak = 0.
- **Range band rect color**: `Colors.status.optimalBg` at ~15% opacity — visible but doesn't obscure the data line. The SVG `<Rect>` is rendered behind the LineChart line.
- **Coordinate math for range band**: chart's pixel y-range is the chart height minus top/bottom padding. Map `(value - dataMin) / (dataMax - dataMin)` to pixel position. `dataMin` and `dataMax` derived from the filtered data set (not the global optMin/optMax, to handle out-of-range values gracefully).
- **Upgrade banner style**: inline row with a lock icon + text on the left and an "Upgrade" CTA chip on the right. Warm beige background (BiomarkerDetailScreen is a warm screen) with a subtle border.

</specifics>

<deferred>
## Deferred Ideas

- **Streak calendar heatmap** — visualizing daily completion as a calendar grid. Would require the daily adherence log storage model (deferred in D-01). Future phase.
- **Streak notification** ("You're on a 7-day streak! Keep it up") — belongs in Phase 23 with the push notification infrastructure.
- **Biomarker trend comparison across users** — anonymized benchmark overlay on the chart. Requires Supabase aggregate data pipeline. Future milestone.
- **Chart export (PDF/CSV)** — exporting biomarker trends. Out of scope for v5.0.

</deferred>

---

*Phase: 22-Engagement & Visualization*
*Context gathered: 2026-06-17*
