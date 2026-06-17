# Phase 22: Engagement & Visualization — Research

**Researched:** 2026-06-17
**Domain:** React Native / Expo — streak persistence, react-native-chart-kit LineChart with SVG range band overlay, premium-gated data filtering, AI context enrichment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01: Streak Storage — Running Counters in ProtocolState**
Add three fields to `ProtocolState` in `src/types/protocol.ts`:
```typescript
currentStreak: number;   // consecutive days all items taken
bestStreak: number;      // all-time high
lastCompleteDate: string; // ISO date of the last fully-completed day
```
Persisted in `@vitalspan_protocol` alongside existing fields — no new AsyncStorage key.
EMPTY_PROTOCOL defaults: `currentStreak: 0`, `bestStreak: 0`, `lastCompleteDate: ''`.

**D-02: Streak Evaluation — Daily Reset in ProtocolScreen.loadData()**
Evaluated at the existing daily reset point when `takenDate !== today`. Before resetting `taken: []`, compute whether yesterday was complete:
- All visible items taken → `currentStreak++`; update `bestStreak`; set `lastCompleteDate = takenDate`
- NOT all taken → `currentStreak = 0`
- Visible items === 0 → streak pauses (currentStreak unchanged)
After evaluation, reset `taken: []` and `takenDate: today` as before.

**D-03: Streak UI — Compact Stat Row Below Progress Pill**
Two inline stats side-by-side immediately below the `X / Y taken` progress pill:
- Left: "🔥 12-day streak" (currentStreak)
- Right: "Best: 14 days" (bestStreak)
- When streak = 0 and no history: "0-day streak" + "Start your streak today!"
- When streak = 0 but bestStreak > 0: "0-day streak" + "Best: N days"

**D-04: Biomarker Chart — react-native-chart-kit LineChart + SVG Range Band**
- `react-native-chart-kit` LineChart (already installed)
- Range band: translucent green `<Rect>` SVG element between optMin/optMax y-positions, behind LineChart, using `react-native-svg` (already installed)
- Empty/insufficient data: centered text placeholder "Add at least 2 entries to see your trend." — no broken chart renders

**D-05: 30/90/365-Day Toggle — Segmented Pill**
Three-segment pill above the chart: `30D | 90D | 365D`. Same segmented control style as Rutinim/Keşfet toggle from Phase 21. Default selection: planner's discretion (Claude's Discretion item).

**D-06: Free-Tier Data Limit — Conditional Filter in BiomarkerDetailScreen**
- Non-premium: filter `history` to last 30 days before rendering history rows and chart
- `isPremium` from `PremiumContext` via `usePremiumContext()` hook (not AsyncStorage)
- `hiddenCount` = total entries minus 30-day visible set
- Upgrade banner: only when `!isPremium && hiddenCount > 0`; position between chart and history list
- Copy: "N entries hidden — upgrade to see your full history."
- Tap: `nav.navigate('Paywall')`

**D-07: Dose Bucketing in advisorContext.ts (PROT-05)**
- No `personalDose` set → bucket as `"standard"`
- `personalDose` set: parseFloat from both personalDose and SUPPLEMENT_DATABASE defaultDose
- Either parse fails → omit dose bucket from context
- Ratio: ≥ 1.25 → `"high"`, ≤ 0.75 → `"low"`, otherwise → `"standard"`
- Add to existing supplement block in advisorContext alongside name and timing

### Claude's Discretion
- Default selected tab (30D vs. 90D) for time window toggle
- Exact color/opacity for SVG range band rect (theme green ~15% opacity)
- Streak row typography/color (follow `s.progressTxt` style)

### Deferred Ideas (OUT OF SCOPE)
- Streak calendar heatmap
- Streak notification ("You're on a 7-day streak!")
- Biomarker trend comparison across users
- Chart export (PDF/CSV)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STRK-01 | User sees current consecutive-day adherence streak on Protocol screen | D-01/D-02/D-03: streak fields in ProtocolState, evaluation in loadData(), UI row below progress pill |
| STRK-02 | User sees all-time best streak on Protocol screen | D-01/D-03: bestStreak field + UI in same stat row |
| STRK-03 | Streak increments only on all-items-taken; missed days reset to zero | D-02: evaluation logic at daily reset point; visible items gate |
| TRND-01 | BiomarkerDetailScreen shows sparkline chart with 30/90/365-day toggle | D-04/D-05: LineChart + segmented pill — Phase 21 pattern confirmed |
| TRND-02 | Chart renders correctly with ≥2 data points; placeholder when fewer | D-04: nonZeroCount >= 2 guard — identical pattern already used in ExerciseDetailScreen |
| TRND-03 | Chart displays biomarker's optimal range band as visual overlay | D-04: SVG `<Rect>` behind LineChart; coordinate math for y-pixel mapping |
| DLIM-01 | Non-premium users can view only last 30 days of biomarker history | D-06: filter history array; PremiumContext.usePremiumContext() |
| DLIM-02 | Non-premium users see upgrade banner showing hidden entry count | D-06: hiddenCount computation + inline banner with nav.navigate('Paywall') |
| PROT-05 | AI Advisor context includes personal dose bucketed as high/standard/low | D-07: advisorContext.ts supplement loop update; SUPPLEMENT_DATABASE lookup |
</phase_requirements>

---

## Summary

Phase 22 touches four areas within three existing files (ProtocolScreen.tsx, BiomarkerDetailScreen.tsx, src/lib/advisorContext.ts) plus one type file (src/types/protocol.ts). No new screens, no new packages.

The streak feature is a pure logic-and-display addition: three new optional fields on ProtocolState, evaluation logic slotted into the already-structured daily-reset block in ProtocolScreen.loadData(), and a two-column stat row below the existing progress pill. The fields are optional in the type so old AsyncStorage data deserialises without migration.

The biomarker chart is a composition of two already-proven patterns: the LineChart config from ExerciseDetailScreen (Phase 21) and the absoluteFill SVG overlay from LongevityScoreScreen. The SVG `<Rect>` range band requires converting optMin/optMax to pixel coordinates using linear interpolation against the chart's data range. The 30/90/365-day segmented pill reuses the identical style object from ExerciseScreen. The data limit gate reads `isPremium` from the existing `PremiumContext` (file: `src/context/PremiumContext.tsx`, hook: `usePremiumContext()`), and upgrade banner navigates to the `'Paywall'` route confirmed in AppNavigator.tsx. The dose bucketing in advisorContext.ts is a small loop-body enhancement to the existing supplement block.

**Primary recommendation:** Work in four independent sub-tasks (streak fields + eval, streak UI, biomarker chart + toggle + banner, dose bucketing) — each isolated to one file. No new packages; all libraries already in project.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Streak computation | Client (ProtocolScreen) | AsyncStorage (ProtocolState) | Streak state is local-only, computed at reset time in existing loadData() |
| Streak UI display | Client (ProtocolScreen) | — | Pure render from state already loaded by loadData() |
| Biomarker chart + range band | Client (BiomarkerDetailScreen) | AsyncStorage (biomarkers key) | Data already loaded via entryMap; chart is a local computation from StoredEntry[] |
| Time window filter | Client (BiomarkerDetailScreen) | — | Array slice on already-loaded history — no async needed |
| Data limit gate | Client (BiomarkerDetailScreen) | PremiumContext | isPremium is in React context; no extra async |
| Upgrade banner + paywall nav | Client (BiomarkerDetailScreen) | AppNavigator | nav.navigate('Paywall') — route already registered |
| Dose bucketing | Client (advisorContext.ts) | SUPPLEMENT_DATABASE | Pure synchronous ratio calculation on already-loaded ProtocolState |

---

## Standard Stack

### Core (already installed — no new installs needed)

| Library | Version in project | Purpose | Why Standard |
|---------|--------------------|---------|--------------|
| `react-native-chart-kit` | `^6.12.0` (latest: 6.12.3) | LineChart sparkline for biomarker trends | Already installed; used in ExerciseDetailScreen Phase 21 |
| `react-native-svg` | `15.12.1` (latest: 15.15.5) | SVG `<Rect>` range band overlay behind chart | Already installed; used in LongevityScoreScreen and FutureSelf component |
| `@react-native-async-storage/async-storage` | existing | Persist streak fields in ProtocolState | Project standard; `@vitalspan_protocol` key unchanged |
| `expo-haptics` | existing | Haptic feedback on segmented pill tap | Project standard for interactive elements |

**No new packages required for this phase.** [VERIFIED: confirmed in /Users/bekircemkusdemir/Downloads/vitalspan/package.json]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-native-svg` `Rect` | 15.12.1 | Shaded range band behind LineChart | Only in BiomarkerDetailScreen detail branch |
| `Dimensions` (React Native core) | built-in | Dynamic chart width calculation | `Dimensions.get('window').width - padding` — same as ExerciseDetailScreen |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-native-chart-kit` LineChart | `victory-native` | Excluded — requires Skia native dep conflicting with Expo SDK 54 (REQUIREMENTS.md Out of Scope) |
| `react-native-chart-kit` LineChart | `react-native-gifted-charts` | Not needed — chart-kit is installed, sufficient, consistent with Phase 21 |
| SVG `<Rect>` overlay | Custom View positioned absolutely | View positioning requires extra layout measurement; SVG coordinate system is cleaner for chart overlays |

**Installation:** No new installs. All required packages are already in the project.

---

## Package Legitimacy Audit

> No new packages are introduced in this phase. All libraries are already installed and in use.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `react-native-chart-kit` | npm | ~6 yrs | — | github.com/indiespirit/react-native-chart-kit | N/A (already installed) | Already approved |
| `react-native-svg` | npm | ~9 yrs | — | github.com/software-mansion/react-native-svg | N/A (already installed) | Already approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
*slopcheck was unavailable at research time but no new packages are introduced — audit moot.*

---

## Architecture Patterns

### System Architecture Diagram

```
ProtocolScreen.loadData()
  │
  ├── [takenDate !== today] ──→ streak evaluation
  │     ├── count visible items (visibleMeds + supplements)
  │     ├── count taken IDs matching visible items
  │     ├── all taken? → currentStreak++ / bestStreak = max(…) / lastCompleteDate = takenDate
  │     └── not all? → currentStreak = 0
  └── reset taken:[], takenDate:today → persist(@vitalspan_protocol)

ProtocolScreen render
  └── header
        ├── "X / Y taken" progress pill  [existing]
        └── streak stat row  [new]
              ├── "🔥 N-day streak"
              └── "Best: N days"

BiomarkerDetailScreen (selectedId set)
  └── ScrollView
        ├── hero / status badge / insight card  [existing]
        ├── [NEW] time window segmented pill (30D | 90D | 365D)
        ├── [NEW] chart container (View with position:relative)
        │     ├── SVG absoluteFill → <Rect> range band (optMin→optMax y-pixels)
        │     └── LineChart (on top of SVG layer)
        │           └── placeholder text when < 2 data points
        ├── [NEW] upgrade banner (only if !isPremium && hiddenCount > 0)
        │     "N entries hidden — upgrade to see your full history" → nav('Paywall')
        └── history list  [existing, filtered if !isPremium]

advisorContext.assembleAdvisorContext()
  └── supplement loop
        ├── item.name, item.timing  [existing]
        └── [NEW] dose bucket: lookup SUPPLEMENT_DATABASE[item.name].defaultDose
              → ratio(personalDose / defaultDose) → "high" | "standard" | "low"
```

### Recommended Project Structure

No new files or folders. All changes are within:
```
src/
  types/
    protocol.ts          # Add currentStreak, bestStreak, lastCompleteDate (optional fields)
  screens/
    ProtocolScreen.tsx   # Streak evaluation in loadData(); streak UI below progress pill
    BiomarkerDetailScreen.tsx  # Chart + toggle + range band + upgrade banner
  lib/
    advisorContext.ts    # Dose bucketing in supplement loop
```

### Pattern 1: Streak Evaluation in Daily Reset Block

**What:** Inspect `taken[]` vs visible item IDs before the daily reset wipes `taken[]`.
**When to use:** At the `takenDate !== today` branch in ProtocolScreen.loadData().

```typescript
// Source: derived from existing ProtocolScreen.tsx loadData() lines ~589-596
// Slot this logic BEFORE the finalState construction:

const today = new Date().toISOString().slice(0, 10);
if (migrated.takenDate !== '' && migrated.takenDate !== today) {
  // Compute visible item IDs for the day that just ended (takenDate)
  const visibleItemIds: string[] = [
    ...visibleMeds,              // medication names
    ...migrated.supplements.flatMap(s => {
      const count = parseDoseCount(s.personalDose ?? s.dose);
      return count === 1 ? [s.id] : Array.from({ length: count }, (_, i) => doseId(s.name, i));
    }),
  ];
  const takenSet = new Set(migrated.taken);
  const allTaken = visibleItemIds.length > 0 && visibleItemIds.every(id => takenSet.has(id));

  if (visibleItemIds.length === 0) {
    // No items — pause streak (no change)
  } else if (allTaken) {
    migrated.currentStreak = (migrated.currentStreak ?? 0) + 1;
    migrated.bestStreak = Math.max(migrated.bestStreak ?? 0, migrated.currentStreak);
    migrated.lastCompleteDate = migrated.takenDate;
  } else {
    migrated.currentStreak = 0;
  }
}
```

**Critical constraint:** `visibleMeds` is derived from `profile.medications.filter(m => !migrated.hiddenMeds.includes(m))` — this must be computed before calling loadData's setState, using the profile data loaded in the same Promise.all.

### Pattern 2: SVG Range Band + LineChart Overlay

**What:** A `<Rect>` drawn in absolute SVG coordinates behind the LineChart.
**When to use:** BiomarkerDetailScreen detail branch, inside the chart container View.

```typescript
// Source: derived from LongevityScoreScreen.tsx absoluteFill SVG pattern
// + ExerciseDetailScreen.tsx LineChart config pattern

import Svg, { Rect } from 'react-native-svg';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions, View } from 'react-native';

const CHART_HEIGHT = 160;
const CHART_TOP_PAD = 16;    // react-native-chart-kit default inner top padding
const CHART_BOTTOM_PAD = 32; // react-native-chart-kit default inner bottom padding (includes x-axis labels)
const chartWidth = Dimensions.get('window').width - Spacing.base * 2 - Spacing.md * 2;

// Y-coordinate math: react-native-chart-kit plots dataMin at bottom, dataMax at top
// Pixel range = CHART_HEIGHT - CHART_TOP_PAD - CHART_BOTTOM_PAD
const plotH = CHART_HEIGHT - CHART_TOP_PAD - CHART_BOTTOM_PAD;
const dataMin = Math.min(...chartValues);
const dataMax = Math.max(...chartValues);
const dataRange = dataMax - dataMin || 1;  // guard against single-value

// Clamp range values to [dataMin, dataMax] for graceful out-of-range handling
const clampedOptMin = Math.max(bm.optMin, dataMin);
const clampedOptMax = Math.min(bm.optMax, dataMax);

// Higher value = lower pixel y (chart draws min at bottom)
const yTop = CHART_TOP_PAD + plotH * (1 - (clampedOptMax - dataMin) / dataRange);
const yBot = CHART_TOP_PAD + plotH * (1 - (clampedOptMin - dataMin) / dataRange);

// Render:
<View style={{ width: chartWidth, height: CHART_HEIGHT }}>
  {/* SVG range band behind the chart */}
  <Svg width={chartWidth} height={CHART_HEIGHT} style={StyleSheet.absoluteFill}>
    <Rect
      x={0}
      y={yTop}
      width={chartWidth}
      height={Math.max(yBot - yTop, 0)}
      fill={Colors.status.optimalBg}
      fillOpacity={0.15}
    />
  </Svg>
  {/* LineChart renders on top */}
  <LineChart
    data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
    width={chartWidth}
    height={CHART_HEIGHT}
    chartConfig={CHART_CONFIG}
    bezier
    withShadow={false}
    withOuterLines={false}
    style={{ borderRadius: Radius.lg }}
  />
</View>
```

**Pitfall:** LineChart renders its own internal padding. The exact `CHART_TOP_PAD` and `CHART_BOTTOM_PAD` constants for `react-native-chart-kit` 6.12.x are approximately 16 and 32 pixels respectively. These should be tested on device and tuned if the band appears offset. [ASSUMED]

### Pattern 3: Segmented Pill (Three Tabs)

**What:** Extend the two-segment ExerciseScreen pattern to three segments.
**When to use:** BiomarkerDetailScreen, above the chart.

```typescript
// Source: ExerciseScreen.tsx lines 231-245 + styles 758-775 [VERIFIED: codebase read]
type TimeWindow = '30D' | '90D' | '365D';
const [timeWindow, setTimeWindow] = useState<TimeWindow>('90D'); // planner's default

// Render:
<View style={s.segmentedControl}>
  {(['30D', '90D', '365D'] as TimeWindow[]).map(w => (
    <TouchableOpacity
      key={w}
      style={[s.segment, timeWindow === w && s.segmentActive]}
      onPress={() => { setTimeWindow(w); Haptics.selectionAsync().catch(() => null); }}
    >
      <Text style={[s.segmentTxt, timeWindow === w && s.segmentTxtActive]}>{w}</Text>
    </TouchableOpacity>
  ))}
</View>
```

Style definitions are identical to ExerciseScreen (copy `segmentedControl`, `segment`, `segmentActive`, `segmentTxt`, `segmentTxtActive` to BiomarkerDetailScreen's `s` StyleSheet).

### Pattern 4: PremiumContext Usage

**What:** Read `isPremium` from context to gate history and show upgrade banner.
**When to use:** BiomarkerDetailScreen detail branch.

```typescript
// Source: src/context/PremiumContext.tsx [VERIFIED: codebase read]
import { usePremiumContext } from '../context/PremiumContext';

// In component:
const { isPremium } = usePremiumContext();

// Filter history for non-premium
const cutoff30 = new Date();
cutoff30.setDate(cutoff30.getDate() - 30);
const cutoffISO = cutoff30.toISOString().slice(0, 10);

const visibleHistory = isPremium
  ? history
  : history.filter(e => e.date >= cutoffISO);
const hiddenCount = history.length - visibleHistory.length;

// Apply time window on top of premiumFiltered
const windowDays = timeWindow === '30D' ? 30 : timeWindow === '90D' ? 90 : 365;
const windowCutoff = new Date();
windowCutoff.setDate(windowCutoff.getDate() - windowDays);
const windowCutoffISO = windowCutoff.toISOString().slice(0, 10);
const chartHistory = visibleHistory.filter(e => e.date >= windowCutoffISO);
```

### Pattern 5: Dose Bucketing in advisorContext.ts

**What:** Extend the supplement block to include dose bucket per ProtocolItem.
**When to use:** Inside `assembleAdvisorContext()` supplement mapping.

```typescript
// Source: advisorContext.ts lines 198-204 + supplementTimings.ts SUPPLEMENT_DATABASE
import { SUPPLEMENT_DATABASE } from '../data/supplementTimings';

// Replace the existing suppNames mapping:
const suppContext = protocolState?.supplements
  ? protocolState.supplements.map((item) => {
      const dbEntry = SUPPLEMENT_DATABASE.find(
        db => db.name.toLowerCase() === item.name.toLowerCase()
      );
      let doseBucket: 'high' | 'standard' | 'low' | undefined;
      if (item.personalDose && dbEntry?.defaultDose) {
        const personal = parseFloat(item.personalDose);
        const standard = parseFloat(dbEntry.defaultDose);
        if (!isNaN(personal) && !isNaN(standard) && standard > 0) {
          const ratio = personal / standard;
          doseBucket = ratio >= 1.25 ? 'high' : ratio <= 0.75 ? 'low' : 'standard';
        }
        // else: non-numeric units (e.g. "as directed") — omit doseBucket
      } else {
        doseBucket = 'standard'; // no personalDose = using DB default
      }
      return {
        name: item.name,
        timing: item.timing,
        ...(doseBucket !== undefined ? { doseBucket } : {}),
      };
    })
  : [];
```

The `AdvisorContext` type and `supplements: string[]` field will need to change to `supplements: Array<{ name: string; timing?: string; doseBucket?: string }>` or a parallel field. Check whether downstream Edge Function / Claude prompt consumers expect the old `string[]` shape before changing the type — a parallel `supplementDetails` field may be safer to avoid breaking AI Advisor prompt formatting. [ASSUMED — planner should audit the Supabase Edge Function prompt template]

### Anti-Patterns to Avoid

- **Querying AsyncStorage for isPremium:** The `PremiumContext` is the single source of truth; `isPremium` must never be read from AsyncStorage (project decision v4.0).
- **Showing a broken chart with 1 data point:** `react-native-chart-kit` throws or renders garbage with a single data point in a `datasets[0].data` array. The `nonZeroCount >= 2` guard from ExerciseDetailScreen is mandatory.
- **Hardcoding chart padding constants:** CHART_TOP_PAD and CHART_BOTTOM_PAD are not officially documented by react-native-chart-kit — they may need empirical tuning. Do not hardcode and assume they are always 16/32.
- **Applying time window filter before the premium filter:** Free-tier users must see the intersection of (30-day premium gate) ∩ (selected time window). Apply the premium filter first, then the window filter on top — not the reverse.
- **Making streak fields required on ProtocolState:** They must be `optional` (`currentStreak?: number`) so that existing serialised data without these fields deserialises cleanly without migration. EMPTY_PROTOCOL must still set them to `0` / `''`.
- **Evaluating streak when takenDate === '':** On first launch, `takenDate` is `''` — the streak block should only fire when `takenDate !== '' && takenDate !== today`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Line chart rendering | Custom SVG path chart | `react-native-chart-kit` LineChart | bezier curves, axis labels, proper touch events, already installed |
| SVG drawing for range band | React Native View absolutely positioned | `react-native-svg` `<Rect>` | SVG coordinate system aligns precisely with chart pixel space; View layout requires onLayout measurement |
| Premium status check | AsyncStorage reads for subscription state | `usePremiumContext()` | Adapty is source of truth; AsyncStorage has no subscription data (v4.0 decision) |
| Date arithmetic | Manual timestamp math | Built-in `Date` | `date-fns` and `dayjs` are explicitly excluded from v5.0 (REQUIREMENTS.md Out of Scope) |

**Key insight:** Every library needed for this phase is already in the project. The primary implementation challenge is coordinate math for the SVG range band, not library integration.

---

## Common Pitfalls

### Pitfall 1: Streak Fires on First-Ever Load (takenDate === '')
**What goes wrong:** When `takenDate === ''` (brand-new install, or EMPTY_PROTOCOL), `takenDate !== today` is true — the streak evaluation block fires with empty `taken[]`, computing allTaken = false and setting `currentStreak = 0`. This is harmless but noisy; worse, if `visibleItemIds` is also empty it could incorrectly pause the streak on first launch.
**Why it happens:** The guard condition `takenDate !== today` is too broad — it also matches `takenDate === ''`.
**How to avoid:** Add an explicit `takenDate !== ''` guard at the start of the streak evaluation block.
**Warning signs:** currentStreak initialises to 0 correctly but lastCompleteDate stays '' even after completing a day.

### Pitfall 2: Visible Items Mismatch Between Streak Eval and Render
**What goes wrong:** The streak is evaluated using `visibleMeds` derived from `profile` loaded in the same `Promise.all`. If `profile` is null (first launch), `visibleMeds` is `[]`, causing the streak to pause every day.
**Why it happens:** `profile` null-check missing before building `visibleMeds`.
**How to avoid:** Guard: `if (visibleItemIds.length === 0) { /* pause */ }` — already specified in D-02 — ensure the `visibleItemIds.length > 0` check is correctly in the allTaken branch gate.
**Warning signs:** Streak never increments despite completing all items.

### Pitfall 3: SVG Range Band Coordinate Inversion
**What goes wrong:** The range band appears upside-down or offset because chart y-coordinates increase downward while data values increase upward.
**Why it happens:** `react-native-chart-kit` internally inverts the y-axis (lower data values → bottom of chart = higher pixel y). The conversion formula must subtract from CHART_HEIGHT.
**How to avoid:** Use `yTop = CHART_TOP_PAD + plotH * (1 - (clampedOptMax - dataMin) / dataRange)` — higher optMax value → smaller y pixel (closer to top of chart).
**Warning signs:** Green band appears in inverted position relative to the data line.

### Pitfall 4: chart-kit LineChart Renders Transparent Background by Default
**What goes wrong:** `backgroundColor`, `backgroundGradientFrom`, and `backgroundGradientTo` must all be set to `Colors.surface` in chartConfig, or the chart renders with a white/transparent background that obscures the SVG `<Rect>` underneath.
**Why it happens:** chart-kit renders its own background rectangle using these config values; if they differ from the parent view background, the range band is hidden.
**How to avoid:** Set all three background config keys to `Colors.surface` (confirmed pattern in ExerciseDetailScreen).
**Warning signs:** Range band is invisible even though coordinate math is correct.

### Pitfall 5: Non-Numeric defaultDose Values
**What goes wrong:** Dose bucketing ratio fails silently or returns NaN for supplements with `defaultDose` values like `"as directed"` or `"see label"`.
**Why it happens:** `parseFloat("as directed")` returns `NaN`.
**How to avoid:** Guard: `if (!isNaN(personal) && !isNaN(standard) && standard > 0)` before computing ratio — specified in D-07. When either parse fails, omit `doseBucket` from the context object entirely.
**Warning signs:** AI Advisor context contains `doseBucket: NaN` or `doseBucket: undefined` as a literal.

### Pitfall 6: AdvisorContext `supplements` Type Breaking Downstream
**What goes wrong:** Changing `AdvisorContext.supplements` from `string[]` to `Array<{name, doseBucket}>` breaks the Supabase Edge Function prompt template that currently formats supplements as a flat list.
**Why it happens:** The Edge Function serialises `context.supplements` and passes it to Claude — if the shape changes, the prompt changes.
**How to avoid:** Add a parallel field (e.g., `supplementDetails`) rather than replacing `supplements: string[]`. Audit the Edge Function's prompt template before changing the exported type.
**Warning signs:** AI Advisor returns garbled or empty supplement section in its responses.

---

## Code Examples

### Progress Pill + Streak Row Layout (ProtocolScreen header)

```typescript
// Source: ProtocolScreen.tsx lines 791-800 (existing), streak row is new addition
<View style={s.header}>
  <View>
    <Text style={s.heading}>Today's Protocol</Text>
    <Text style={s.date}>{dateStr}</Text>
  </View>
  {totalItems > 0 && (
    <View style={s.progressPill}>
      <Text style={s.progressTxt}>{takenCount} / {totalItems} taken</Text>
    </View>
  )}
</View>

{/* Streak stat row — NEW, placed immediately below header View */}
<View style={s.streakRow}>
  <Text style={[s.streakTxt, protocol.currentStreak > 0 ? s.streakActive : s.streakMuted]}>
    🔥 {protocol.currentStreak ?? 0}-day streak
  </Text>
  {(protocol.bestStreak ?? 0) > 0 ? (
    <Text style={s.streakBest}>Best: {protocol.bestStreak} days</Text>
  ) : protocol.currentStreak === 0 ? (
    <Text style={s.streakHint}>Start your streak today!</Text>
  ) : null}
</View>
```

### Existing progressTxt style reference

```typescript
// Source: ProtocolScreen.tsx StyleSheet (lines ~1072-1077) [VERIFIED: codebase read]
progressPill: {
  backgroundColor: Colors.primaryBg,
  borderRadius: Radius.full,
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.xs,
  borderWidth: 0.5,
  borderColor: Colors.primaryBorder,
},
progressTxt: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.primary },
```

Streak row typography should follow `progressTxt` font size (`Typography.sizes.xs`) with `Colors.status.optimalText` (`'#1C5C3A'`) for active streaks and `Colors.onSurfaceMuted` when streak = 0.

### Segmented Control Style (copy from ExerciseScreen)

```typescript
// Source: ExerciseScreen.tsx styles 758-775 [VERIFIED: codebase read]
segmentedControl: {
  flexDirection: 'row',
  gap: Spacing.xs,
  marginHorizontal: Spacing.base,
  marginBottom: Spacing.sm,
  backgroundColor: Colors.surfaceElevated,
  borderRadius: Radius.full,
  padding: 3,  // intentional — no Spacing.* equivalent
},
segment: {
  flex: 1,
  paddingVertical: Spacing.sm,
  borderRadius: Radius.full,
  alignItems: 'center',
},
segmentActive: { backgroundColor: Colors.primary },
segmentTxt: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.onSurfaceMuted },
segmentTxtActive: { color: Colors.primaryBg },
```

### Upgrade Banner Layout

```typescript
// Source: design spec from 22-CONTEXT.md <specifics>
// Inline row: lock icon + text left, CTA chip right; warm beige background
<View style={s.upgradeBanner}>
  <View style={s.upgradeBannerLeft}>
    <Text style={s.upgradeBannerIcon}>🔒</Text>
    <Text style={s.upgradeBannerTxt}>{hiddenCount} entries hidden — upgrade to see your full history.</Text>
  </View>
  <TouchableOpacity style={s.upgradeCta} onPress={() => nav.navigate('Paywall')}>
    <Text style={s.upgradeCtaTxt}>Upgrade</Text>
  </TouchableOpacity>
</View>
```

Paywall route: `'Paywall'` — confirmed in `src/navigation/AppNavigator.tsx` line 47 + 217.
PremiumContext hook: `usePremiumContext()` from `'../context/PremiumContext'` — confirmed in `src/context/PremiumContext.tsx`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `addedSupplements: string[]` in ProtocolState | `supplements: ProtocolItem[]` | Phase 20 | Dose bucketing in PROT-05 requires ProtocolItem.personalDose field — new schema is the enabler |
| No streak tracking | `currentStreak / bestStreak / lastCompleteDate` optional fields | Phase 22 | Optional so no migration needed |
| Full biomarker history always visible | 30-day cap for non-premium via `isPremium` from PremiumContext | Phase 22 | PremiumContext (`usePremiumContext()`) is the gating mechanism — not AsyncStorage |

**Deprecated/outdated:**
- `CustomSupplement` type: still present for migration detection only — do not add new usages
- Old `addedSupplements: string[]` fallback in advisorContext.ts: still present for backward compat window; dose bucketing only applies to `protocolState.supplements` items (new schema)

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | react-native-chart-kit CHART_TOP_PAD ≈ 16px and CHART_BOTTOM_PAD ≈ 32px (internal defaults) | Code Examples / Pitfall 3 | Range band appears offset on screen; requires empirical padding calibration |
| A2 | Adding a parallel `supplementDetails` field to AdvisorContext is safer than replacing `supplements: string[]` | Pattern 5 / Pitfall 6 | If Edge Function already handles structured objects, a new field is redundant; if it only handles string[], breaking the type causes silent AI failures |

---

## Open Questions

1. **AdvisorContext supplement type change scope**
   - What we know: `supplements: string[]` is the current exported type; dose bucketing requires richer data per supplement
   - What's unclear: The Supabase Edge Function's prompt template — does it render `context.supplements` as a flat list or does it already handle objects?
   - Recommendation: Planner should read the Edge Function source before deciding whether to replace `supplements` or add a parallel `supplementDetails` field

2. **Time window toggle default (Claude's Discretion)**
   - What we know: D-05 says planner picks; most biomarkers are logged monthly (quarterly labs are common)
   - Recommendation: Default to `'90D'` — gives 3 months of visibility which covers one lab cycle for most users; falls back to showing whatever data exists without feeling artificially limited

3. **Streak row placement: inside or outside ScrollView**
   - What we know: The header is outside the ScrollView (not scrollable); the streak row should feel like part of the header stats
   - Recommendation: Place streak row inside the header `<View style={s.header}>` as a second row, or immediately below the header `<View>` but before the ScrollView — it should stay sticky at top, not scroll away

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `react-native-chart-kit` | TRND-01/02/03 | ✓ | ^6.12.0 (6.12.3 latest) | — |
| `react-native-svg` | TRND-03 | ✓ | 15.12.1 | — |
| `expo-haptics` | Segmented pill | ✓ | existing | — |
| PremiumContext (`usePremiumContext`) | DLIM-01/02 | ✓ | src/context/PremiumContext.tsx | — |
| `'Paywall'` route | DLIM-02 upgrade banner | ✓ | AppNavigator line 47, 217 | — |
| SUPPLEMENT_DATABASE | PROT-05 | ✓ | src/data/supplementTimings.ts | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

---

## Sources

### Primary (HIGH confidence)
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/types/protocol.ts` — ProtocolState shape, EMPTY_PROTOCOL, ProtocolItem.personalDose confirmed
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/screens/ProtocolScreen.tsx` — loadData() daily reset block (lines 589-601), persist(), progressPill + progressTxt styles, visibleMeds computation (lines 712-714, 771-782)
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/screens/BiomarkerDetailScreen.tsx` — entryMap, historyFor(), bm.optMin/optMax, existing detail branch structure, StoredEntry import
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/screens/ExerciseDetailScreen.tsx` — LineChart chartConfig pattern (lines 205-223), CHART_HEIGHT=120, chartWidth calculation, nonZeroCount >= 2 guard
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/screens/ExerciseScreen.tsx` — segmented control render (lines 231-245) and styles (758-775)
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/screens/LongevityScoreScreen.tsx` — SVG absoluteFill overlay pattern (line 625)
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/context/PremiumContext.tsx` — `usePremiumContext()` hook, `isPremium` boolean, `isPremiumLoading` boolean confirmed
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/navigation/AppNavigator.tsx` — `'Paywall'` route key confirmed (lines 47, 217)
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/lib/advisorContext.ts` — assembleAdvisorContext(), supplement loop (lines 198-204), existing AdvisorContext type, SUPPLEMENT_DATABASE import path
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/data/supplementTimings.ts` — SUPPLEMENT_DATABASE, SupplementInfo.defaultDose field confirmed
- `/Users/bekircemkusdemir/Downloads/vitalspan/src/theme/index.ts` — Colors.status.optimalBg ('#E8F5EE'), Colors.status.optimalText ('#1C5C3A'), Colors.primary ('#2D6A4F'), Colors.primaryBg ('#E8F5EE') confirmed
- `/Users/bekircemkusdemir/Downloads/vitalspan/.planning/config.json` — `nyquist_validation: false` confirmed; `security_enforcement` not present
- `npm view react-native-chart-kit version` → 6.12.3 [VERIFIED: npm registry]
- `npm view react-native-svg version` → 15.15.5 latest (project pins 15.12.1) [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)
- 22-CONTEXT.md decisions D-01 through D-07 — user-locked decisions; research confirms technical feasibility of each

### Tertiary (LOW confidence)
- react-native-chart-kit internal padding constants (~16px top, ~32px bottom) — not in official docs; empirically observed; [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — both packages confirmed in package.json; no new installs
- Architecture: HIGH — all patterns have direct codebase analogs (ExerciseDetailScreen, ExerciseScreen, LongevityScoreScreen, PremiumContext)
- Pitfalls: HIGH for known code patterns (chart-kit bg, streak guards); MEDIUM for SVG coordinate math (empirical constants)

**Research date:** 2026-06-17
**Valid until:** 2026-07-17 (stable stack; no fast-moving dependencies)
