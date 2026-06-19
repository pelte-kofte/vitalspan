# Phase 22: Engagement & Visualization — Pattern Map

**Mapped:** 2026-06-18
**Files analyzed:** 4 (3 screens/libs modified + 1 type file)
**Analogs found:** 4 / 4

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/types/protocol.ts` | model/type | CRUD | `src/types/protocol.ts` itself (additive) | exact — extend existing interface |
| `src/screens/ProtocolScreen.tsx` | screen | CRUD + event-driven | `src/screens/ProtocolScreen.tsx` itself + `ExerciseScreen.tsx` segmented styles | exact — slot into existing loadData()/render |
| `src/screens/BiomarkerDetailScreen.tsx` | screen | CRUD + request-response | `src/screens/ExerciseDetailScreen.tsx` (LineChart) + `ExerciseScreen.tsx` (segmented pill) + `LongevityScoreScreen.tsx` (SVG absoluteFill) | role-match — same screen pattern, new chart+filter composition |
| `src/lib/advisorContext.ts` | service/utility | transform | `src/lib/advisorContext.ts` itself (supplement loop, lines 198–204) | exact — extend existing loop body |

---

## Pattern Assignments

### `src/types/protocol.ts` (model, CRUD)

**Analog:** `src/types/protocol.ts` lines 48–85 (current `ProtocolState` + `EMPTY_PROTOCOL`)

**Existing interface to extend** (lines 48–59):
```typescript
export interface ProtocolState {
  supplements: ProtocolItem[];
  medTimes: Record<string, TimeSlot>;
  hiddenMeds: string[];
  taken: string[];
  takenDate: string;
}
```

**Fields to add — optional so old AsyncStorage data deserialises without migration** (insert after `takenDate`):
```typescript
  /** Consecutive days where all visible items were taken. Optional — absent on legacy data. */
  currentStreak?: number;
  /** All-time best consecutive-day streak. Optional — absent on legacy data. */
  bestStreak?: number;
  /** ISO date (YYYY-MM-DD) of the last day all items were taken. '' when never completed. */
  lastCompleteDate?: string;
```

**EMPTY_PROTOCOL to extend** (lines 79–85):
```typescript
export const EMPTY_PROTOCOL: ProtocolState = {
  supplements: [],
  medTimes: {},
  hiddenMeds: [],
  taken: [],
  takenDate: '',
  // Phase 22 additions:
  currentStreak: 0,
  bestStreak: 0,
  lastCompleteDate: '',
};
```

**Critical constraint:** Fields MUST be `optional` (`?`) on the interface so that `JSON.parse` of old stored data (without streak keys) returns a valid `ProtocolState`. `EMPTY_PROTOCOL` always sets them to `0` / `''` for fresh installs.

---

### `src/screens/ProtocolScreen.tsx` (screen, CRUD + event-driven)

**Analogs:**
- Streak evaluation: `src/screens/ProtocolScreen.tsx` lines 589–601 (existing daily reset block)
- Streak UI typography: `src/screens/ProtocolScreen.tsx` lines 796–800 + 1072–1077 (progress pill + `progressTxt` style)
- `visibleMeds` computation: `src/screens/ProtocolScreen.tsx` lines 712–714

#### Sub-task A: Streak evaluation — slot into `loadData()` before finalState construction

**Existing daily reset block** (lines 589–601) — streak evaluation inserts before `finalState`:
```typescript
// ── existing (lines 589–601) ──────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const finalState: ProtocolState = {
  ...migrated,
  taken: migrated.takenDate === today ? migrated.taken : [],
  takenDate: today,
};
setProtocol(finalState);
```

**Pattern: streak evaluation block — insert BEFORE finalState construction:**
```typescript
// ── Phase 22 streak evaluation ────────────────────────────────────────────────
// Guard: only fire when takenDate is a real past date (not '' and not today)
if (migrated.takenDate !== '' && migrated.takenDate !== today) {
  // visibleMeds is already computed above (line 712-714 pattern):
  //   const medications = profile?.medications ?? [];
  //   const visibleMeds = medications.filter(m => !migrated.hiddenMeds.includes(m));
  // profileRaw is loaded in the same Promise.all — use it here via local `profileData`

  const profileData = profileRaw ? JSON.parse(profileRaw) as { medications?: string[] } : null;
  const medsForStreak = (profileData?.medications ?? []).filter(
    (m: string) => !migrated.hiddenMeds.includes(m)
  );

  // Build visible item IDs (mirrors totalItems / takenCount logic at lines 771-785)
  const visibleItemIds: string[] = [
    ...medsForStreak,
    ...migrated.supplements.flatMap(s => {
      const count = parseDoseCount(s.personalDose ?? s.dose);
      return count === 1
        ? [s.id]
        : Array.from({ length: count }, (_, i) => doseId(s.name, i));
    }),
  ];

  if (visibleItemIds.length === 0) {
    // No visible items — pause streak (neither increment nor reset)
  } else {
    const takenSet = new Set(migrated.taken);
    const allTaken = visibleItemIds.every(id => takenSet.has(id));
    if (allTaken) {
      migrated.currentStreak = (migrated.currentStreak ?? 0) + 1;
      migrated.bestStreak = Math.max(migrated.bestStreak ?? 0, migrated.currentStreak);
      migrated.lastCompleteDate = migrated.takenDate;
    } else {
      migrated.currentStreak = 0;
    }
    // Persist streak update immediately (before finalState wipes taken[])
    await AsyncStorage.setItem('@vitalspan_protocol', JSON.stringify({
      ...migrated,
      taken: [],
      takenDate: today,
    })).catch(console.error);
  }
}
// ── existing finalState construction follows ──────────────────────────────────
```

**Key constraint:** `parseDoseCount` and `doseId` are already defined at lines 63–81 of ProtocolScreen — reuse them directly.

#### Sub-task B: Streak UI — stat row below progress pill

**Existing progress pill render** (lines 791–800):
```typescript
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
```

**Pattern: streak stat row — add immediately after the `</View>` closing the header, before the ScrollView:**
```typescript
{/* Phase 22: Streak stat row */}
<View style={s.streakRow}>
  <Text style={[s.streakTxt, (protocol.currentStreak ?? 0) > 0 ? s.streakActive : s.streakMuted]}>
    {'🔥'} {protocol.currentStreak ?? 0}-day streak
  </Text>
  {(protocol.bestStreak ?? 0) > 0 ? (
    <Text style={s.streakBest}>Best: {protocol.bestStreak} days</Text>
  ) : (protocol.currentStreak ?? 0) === 0 ? (
    <Text style={s.streakHint}>Start your streak today!</Text>
  ) : null}
</View>
```

**New styles to add to `s` StyleSheet** (follow `progressTxt` at line 1077):
```typescript
streakRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: Spacing.base,
  paddingBottom: Spacing.sm,
},
streakTxt: { fontSize: Typography.sizes.xs, fontWeight: '600' },
streakActive: { color: Colors.status.optimalText },   // '#1C5C3A'
streakMuted:  { color: Colors.onSurfaceMuted },
streakBest:   { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted },
streakHint:   { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, fontStyle: 'italic' },
```

**Typography reference:** `progressTxt` at line 1077 — `fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.primary`. Streak row uses same font size but splits color by state (`optimalText` when active, `onSurfaceMuted` when zero).

---

### `src/screens/BiomarkerDetailScreen.tsx` (screen, CRUD + request-response)

**Analogs:**
- LineChart + `nonZeroCount >= 2` guard: `src/screens/ExerciseDetailScreen.tsx` lines 198–231
- Segmented control render + styles: `src/screens/ExerciseScreen.tsx` lines 231–245 + 757–775
- SVG absoluteFill overlay: `src/screens/LongevityScoreScreen.tsx` lines 623–640
- Premium gating: `src/context/PremiumContext.tsx` (hook: `usePremiumContext()`)
- Insert point: `src/screens/BiomarkerDetailScreen.tsx` lines 203–209 (between `insightCard` and `"History"` label)

#### Sub-task A: Imports to add

```typescript
import { Dimensions, StyleSheet } from 'react-native';  // Dimensions already likely present — confirm
import { LineChart } from 'react-native-chart-kit';
import Svg, { Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';                 // already imported — reuse
import { usePremiumContext } from '../context/PremiumContext';
```

#### Sub-task B: State and derived values — add at top of `BiomarkerDetailScreen` component

```typescript
// Premium gate
const { isPremium } = usePremiumContext();

// Time window toggle state
type TimeWindow = '30D' | '90D' | '365D';
const [timeWindow, setTimeWindow] = useState<TimeWindow>('90D');
```

#### Sub-task C: Filtered history + hiddenCount — computed in the detail branch (after `const history = historyFor(selectedId)` at line 122)

```typescript
// Free-tier 30-day cap — apply FIRST, then window filter on top
const cutoff30 = new Date();
cutoff30.setDate(cutoff30.getDate() - 30);
const cutoff30ISO = cutoff30.toISOString().slice(0, 10);
const premiumFilteredHistory = isPremium
  ? history
  : history.filter(e => e.date >= cutoff30ISO);
const hiddenCount = history.length - premiumFilteredHistory.length;

// Time window filter on top of premium filter
const windowDays = timeWindow === '30D' ? 30 : timeWindow === '90D' ? 90 : 365;
const windowCutoff = new Date();
windowCutoff.setDate(windowCutoff.getDate() - windowDays);
const windowCutoffISO = windowCutoff.toISOString().slice(0, 10);
const chartHistory = premiumFilteredHistory.filter(e => e.date >= windowCutoffISO);

// Chart data arrays (chronological order for chart — reverse the desc-sorted history)
const chartValues = [...chartHistory].reverse().map(e => e.value);
const chartLabels = [...chartHistory].reverse().map(e => {
  const d = new Date(e.date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
});
const nonZeroCount = chartValues.length;
```

#### Sub-task D: Chart container with SVG range band — LineChart pattern

**Analog source:** `ExerciseDetailScreen.tsx` lines 198–231 (LineChart + `nonZeroCount >= 2` guard) + `LongevityScoreScreen.tsx` line 625 (SVG `StyleSheet.absoluteFill`)

```typescript
// Constants (at module level, before component)
const CHART_HEIGHT = 160;
const CHART_TOP_PAD = 16;
const CHART_BOTTOM_PAD = 32;
const PRIMARY_RGBA = (opacity: number): string => `rgba(45, 106, 79, ${opacity})`;
const SURFACE_MUTED_RGBA = (opacity: number): string => `rgba(107, 107, 100, ${opacity})`;
```

**JSX insertion point:** between the `insightCard` (line 204) and `<Text style={s.sectionLabel}>History</Text>` (line 209):

```typescript
{/* Phase 22: Time window segmented pill — same pattern as ExerciseScreen lines 231-245 */}
<View style={s.segmentedControl}>
  {(['30D', '90D', '365D'] as TimeWindow[]).map(w => (
    <TouchableOpacity
      key={w}
      style={[s.segment, timeWindow === w && s.segmentActive]}
      onPress={() => {
        setTimeWindow(w);
        Haptics.selectionAsync().catch(() => null);
      }}
    >
      <Text style={[s.segmentTxt, timeWindow === w && s.segmentTxtActive]}>{w}</Text>
    </TouchableOpacity>
  ))}
</View>

{/* Phase 22: Chart with SVG range band */}
{(() => {
  const chartWidth = Dimensions.get('window').width - Spacing.base * 2 - Spacing.md * 2;
  if (nonZeroCount < 2) {
    return (
      <View style={s.chartPlaceholder}>
        <Text style={s.chartPlaceholderTxt}>Add at least 2 entries to see your trend.</Text>
      </View>
    );
  }
  // Y-coordinate math: chart plots dataMin at bottom, dataMax at top (y-axis inverted)
  const plotH = CHART_HEIGHT - CHART_TOP_PAD - CHART_BOTTOM_PAD;
  const dataMin = Math.min(...chartValues);
  const dataMax = Math.max(...chartValues);
  const dataRange = dataMax - dataMin || 1;
  const clampedOptMin = Math.max(bm.optMin, dataMin);
  const clampedOptMax = Math.min(bm.optMax, dataMax);
  const yTop = CHART_TOP_PAD + plotH * (1 - (clampedOptMax - dataMin) / dataRange);
  const yBot = CHART_TOP_PAD + plotH * (1 - (clampedOptMin - dataMin) / dataRange);

  return (
    <View style={{ width: chartWidth, height: CHART_HEIGHT, alignSelf: 'center' }}>
      {/* SVG range band behind the chart — same absoluteFill pattern as LongevityScoreScreen line 625 */}
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
      {/* LineChart on top — chartConfig identical to ExerciseDetailScreen lines 209-222 */}
      <LineChart
        data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
        width={chartWidth}
        height={CHART_HEIGHT}
        chartConfig={{
          backgroundColor: Colors.surface,
          backgroundGradientFrom: Colors.surface,
          backgroundGradientTo: Colors.surface,
          decimalPlaces: 1,
          color: PRIMARY_RGBA,
          labelColor: SURFACE_MUTED_RGBA,
          propsForDots: { r: '3', strokeWidth: '1', stroke: Colors.primary },
          propsForBackgroundLines: { stroke: Colors.borderLight },
        }}
        bezier
        withShadow={false}
        withOuterLines={false}
        style={{ borderRadius: Radius.lg }}
      />
    </View>
  );
})()}

{/* Phase 22: Upgrade banner — between chart and history list, only when !isPremium && hiddenCount > 0 */}
{!isPremium && hiddenCount > 0 && (
  <TouchableOpacity style={s.upgradeBanner} onPress={() => nav.navigate('Paywall')} activeOpacity={0.8}>
    <View style={s.upgradeBannerLeft}>
      <Text style={s.upgradeBannerIcon}>{'🔒'}</Text>
      <Text style={s.upgradeBannerTxt}>{hiddenCount} entries hidden — upgrade to see your full history.</Text>
    </View>
    <View style={s.upgradeCta}>
      <Text style={s.upgradeCtaTxt}>Upgrade</Text>
    </View>
  </TouchableOpacity>
)}
```

#### Sub-task E: History list — use `premiumFilteredHistory` instead of `history`

Replace `history.map(...)` at line 225 with `premiumFilteredHistory.map(...)` so the list rows also respect the 30-day cap.

#### Sub-task F: New styles to add to `s` StyleSheet

```typescript
// Segmented control — copy from ExerciseScreen.tsx lines 757-775
segmentedControl: {
  flexDirection: 'row',
  gap: Spacing.xs,
  marginHorizontal: Spacing.base,
  marginBottom: Spacing.sm,
  backgroundColor: Colors.surfaceElevated,
  borderRadius: Radius.full,
  padding: 3,
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

// Chart placeholder
chartPlaceholder: {
  marginHorizontal: Spacing.base,
  paddingVertical: Spacing.xl,
  alignItems: 'center',
},
chartPlaceholderTxt: {
  fontSize: Typography.sizes.sm,
  color: Colors.onSurfaceMuted,
  fontStyle: 'italic',
  textAlign: 'center',
},

// Upgrade banner
upgradeBanner: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginHorizontal: Spacing.base,
  marginBottom: Spacing.sm,
  backgroundColor: Colors.primaryBg,
  borderRadius: Radius.lg,
  borderWidth: 0.5,
  borderColor: Colors.primaryBorder,
  padding: Spacing.md,
},
upgradeBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.xs },
upgradeBannerIcon: { fontSize: Typography.sizes.base },
upgradeBannerTxt: {
  fontSize: Typography.sizes.xs,
  color: Colors.status.optimalText,
  flex: 1,
  lineHeight: 18,
},
upgradeCta: {
  backgroundColor: Colors.primary,
  borderRadius: Radius.full,
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.xs,
  marginLeft: Spacing.sm,
},
upgradeCtaTxt: { fontSize: Typography.sizes.xs, fontWeight: '700', color: Colors.primaryBg },
```

---

### `src/lib/advisorContext.ts` (service/utility, transform)

**Analog:** `src/lib/advisorContext.ts` lines 195–204 (existing supplement name extraction block)

**Existing supplement block** (lines 195–204):
```typescript
const suppNames = protocolState?.supplements
  ? protocolState.supplements.map((s) => s.name)
  : [
      ...(protocolState?.addedSupplements ?? []),
      ...(protocolState?.customSupplements ?? []).map((s) => s.name),
    ];
const supplements = Array.from(new Set(suppNames));
```

**Pattern: replace `suppNames`/`supplements` block with dose-bucketed version:**
```typescript
// Phase 22 PROT-05: dose bucketing alongside existing name + timing
// Import to add at top: import { SUPPLEMENT_DATABASE } from '../data/supplementTimings';

type DoseBucket = 'high' | 'standard' | 'low';

interface SupplementDetail {
  name: string;
  timing?: string;
  doseBucket?: DoseBucket;
}

const supplementDetails: SupplementDetail[] = protocolState?.supplements
  ? protocolState.supplements.map((item: ProtocolItem): SupplementDetail => {
      const dbEntry = SUPPLEMENT_DATABASE.find(
        db => db.name.toLowerCase() === item.name.toLowerCase()
      );
      let doseBucket: DoseBucket | undefined;
      if (!item.personalDose) {
        // No personal override — using DB default, bucket as standard
        doseBucket = 'standard';
      } else if (dbEntry?.defaultDose) {
        const personal = parseFloat(item.personalDose);
        const standard = parseFloat(dbEntry.defaultDose);
        if (!isNaN(personal) && !isNaN(standard) && standard > 0) {
          const ratio = personal / standard;
          doseBucket = ratio >= 1.25 ? 'high' : ratio <= 0.75 ? 'low' : 'standard';
        }
        // else: non-numeric units (e.g. "as directed") — doseBucket remains undefined → omit
      }
      return {
        name: item.name,
        ...(item.timing ? { timing: item.timing } : {}),
        ...(doseBucket !== undefined ? { doseBucket } : {}),
      };
    })
  : [
      ...(protocolState?.addedSupplements ?? []).map(name => ({ name })),
      ...(protocolState?.customSupplements ?? []).map(s => ({ name: s.name })),
    ];

// Backward-compat: keep supplements: string[] for any consumer expecting the old shape
const supplements = Array.from(new Set(supplementDetails.map(s => s.name)));
```

**AdvisorContext type change — add parallel field (safer than replacing `supplements: string[]`):**
```typescript
// In AdvisorContext interface (lines 26-42) — ADD:
supplementDetails?: Array<{
  name: string;
  timing?: string;
  doseBucket?: 'high' | 'standard' | 'low';
}>;
```

**Context assembly — add `supplementDetails` to context object (after `supplements` at line 234):**
```typescript
const context: AdvisorContext = {
  // ... existing fields ...
  supplements,             // string[] — preserved for backward compat
  supplementDetails,       // new: richer data for dose-aware prompt building
  // ...
};
```

**Critical constraint:** `SUPPLEMENT_DATABASE` is already imported in `ProtocolScreen.tsx` from `'../data/supplementTimings'`. Add the same import to `advisorContext.ts`. `ProtocolItem` is already imported at line 20 of `advisorContext.ts`.

---

## Shared Patterns

### useFocusEffect + loadData screen refresh
**Source:** `src/screens/ProtocolScreen.tsx` lines 603–604 + `src/screens/BiomarkerDetailScreen.tsx` lines 60–62
**Apply to:** Both screen files — streak recomputes on each Protocol screen focus; no change needed to BiomarkerDetailScreen's focus handler (chart derives from already-loaded `entries` state).
```typescript
useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));
useFocusEffect(useCallback(() => { setStatusBarStyle('dark'); return () => {}; }, []));
```

### AsyncStorage persist pattern
**Source:** `src/screens/ProtocolScreen.tsx` lines 612–620 (`persist()` function)
**Apply to:** ProtocolScreen streak evaluation — streak fields are written to `@vitalspan_protocol` inside `loadData()` before the streak reset, using the same `AsyncStorage.setItem` call pattern.
```typescript
async function persist(next: ProtocolState) {
  setProtocol(next);
  await Promise.all([
    AsyncStorage.setItem('@vitalspan_protocol', JSON.stringify(next)),
    AsyncStorage.setItem('@vitalspan_protocol_today', JSON.stringify({
      date: next.takenDate, taken: next.taken,
    })),
  ]).catch(console.error);
}
```

### Haptics on interactive elements
**Source:** `src/screens/ProtocolScreen.tsx` line 624 + `src/screens/BiomarkerDetailScreen.tsx` line 83
**Apply to:** Segmented pill in BiomarkerDetailScreen — `Haptics.selectionAsync().catch(() => null)` on each segment tap.

### LineChart chartConfig (copy from ExerciseDetailScreen)
**Source:** `src/screens/ExerciseDetailScreen.tsx` lines 209–222
**Apply to:** BiomarkerDetailScreen chart — identical `backgroundColor`/`backgroundGradientFrom`/`backgroundGradientTo` set to `Colors.surface` so the SVG range band beneath is not obscured.
```typescript
chartConfig={{
  backgroundColor: Colors.surface,
  backgroundGradientFrom: Colors.surface,
  backgroundGradientTo: Colors.surface,
  decimalPlaces: 0,
  color: PRIMARY_RGBA,
  labelColor: SURFACE_MUTED_RGBA,
  propsForDots: { r: '3', strokeWidth: '1', stroke: Colors.primary },
  propsForBackgroundLines: { stroke: Colors.borderLight },
}}
```

### PremiumContext hook
**Source:** `src/context/PremiumContext.tsx` lines 88–90
**Apply to:** BiomarkerDetailScreen — import and call at top of component.
```typescript
import { usePremiumContext } from '../context/PremiumContext';
const { isPremium } = usePremiumContext();
```

### Paywall navigation
**Source:** `src/navigation/AppNavigator.tsx` lines 47 + 217 (`'Paywall'` route key)
**Apply to:** BiomarkerDetailScreen upgrade banner tap — `nav.navigate('Paywall')`.

---

## Key Anti-Patterns to Avoid (from RESEARCH.md)

| Anti-Pattern | Correct Pattern |
|---|---|
| `migrated.takenDate !== today` alone as streak guard | Also check `migrated.takenDate !== ''` — first launch has `takenDate: ''` which must not trigger streak |
| Making streak fields required on `ProtocolState` | Use `optional` (`?`) fields; EMPTY_PROTOCOL sets explicit defaults |
| `react-native-chart-kit` with `< 2` data points | `nonZeroCount >= 2` guard before rendering `<LineChart>` (ExerciseDetailScreen line 204 pattern) |
| Setting `backgroundGradientFrom`/`To` to transparent | Set all three background keys to `Colors.surface` or SVG range band will be invisible |
| Reading `isPremium` from AsyncStorage | `usePremiumContext()` only — Adapty is source of truth (v4.0 decision) |
| Applying time window filter before premium 30-day filter | Apply premium cap first, then window filter on top |
| Replacing `supplements: string[]` in `AdvisorContext` | Add parallel `supplementDetails` field; keep `supplements: string[]` for backward compat |

---

## No Analog Found

No files in this phase lack a codebase analog. All patterns have direct matches:

| File | Closest Real Analog |
|---|---|
| `src/types/protocol.ts` (streak fields) | Itself — additive extension of existing interface |
| `ProtocolScreen.tsx` (streak eval) | Existing `takenDate !== today` reset block at lines 589–601 |
| `ProtocolScreen.tsx` (streak UI) | `progressPill`/`progressTxt` styles at lines 1072–1077 |
| `BiomarkerDetailScreen.tsx` (LineChart) | `ExerciseDetailScreen.tsx` lines 198–231 |
| `BiomarkerDetailScreen.tsx` (segmented pill) | `ExerciseScreen.tsx` lines 231–245 + 757–775 |
| `BiomarkerDetailScreen.tsx` (SVG range band) | `LongevityScoreScreen.tsx` lines 623–640 |
| `BiomarkerDetailScreen.tsx` (premium gate + banner) | `PremiumContext.tsx` + `'Paywall'` route in AppNavigator |
| `advisorContext.ts` (dose bucketing) | Itself — supplement loop at lines 195–204 |

---

## Metadata

**Analog search scope:** `src/screens/`, `src/types/`, `src/lib/`, `src/context/`, `src/theme/`
**Files scanned:** 9 (ProtocolScreen, BiomarkerDetailScreen, ExerciseDetailScreen, ExerciseScreen, LongevityScoreScreen, protocol.ts, advisorContext.ts, PremiumContext.tsx, theme/index.ts)
**Pattern extraction date:** 2026-06-18
