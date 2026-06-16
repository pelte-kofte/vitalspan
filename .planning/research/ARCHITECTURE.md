# Architecture Research — v5.0

**Researched:** 2026-06-16
**Confidence:** HIGH (all integration points derived from direct source-code inspection of existing files)

---

## System Overview

Current layered architecture (unchanged in v5.0):

```
┌─────────────────────────────────────────────────────────────┐
│                     Screens Layer                            │
│  DashboardScreen  ProtocolScreen  ExerciseScreen  ...       │
│  BiomarkerDetailScreen  AIAdvisorScreen                     │
├─────────────────────────────────────────────────────────────┤
│                   Components Layer                           │
│  SwipeableLogRow  QuickLogModal  SupplementRow  RangeBar    │
│  TrendChart (new)  ProtocolItemRow (new)                    │
├─────────────────────────────────────────────────────────────┤
│                     Hooks / Context                          │
│  usePremiumContext  useBreathing  useRoutine (new)          │
│  useOverloadTrend (new)  PremiumContext                     │
├─────────────────────────────────────────────────────────────┤
│                       Lib Layer                              │
│  advisorContext.ts  phenoAge.ts  healthkit.ts               │
│  notificationService.ts (new)  streakService.ts (new)      │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
│  exercises.ts  biomarkers.ts  medications.ts                │
│  supplementTimings.ts                                        │
├─────────────────────────────────────────────────────────────┤
│                    Storage Layer                              │
│  AsyncStorage keys:                                          │
│  @vitalspan_protocol  @vitalspan_biomarkers                 │
│  @vitalspan_exercise_log  @vitalspan_routine (new)          │
│  @vitalspan_protocol_today  @vitalspan_streak (new)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature Integration Map

### Feature 1: Exercise Rutinim (personal routine + tab switch)

**What changes:**

`src/screens/ExerciseScreen.tsx` is the only file that needs structural changes. Its current layout has a single scrollable view mixing log history and the exercise library. v5.0 splits the screen into two logical views controlled by an in-screen tab switch:

- **Rutinim tab** — shows the ordered personal routine (list of `RoutineItem`s) and the exercise history log sections (Today / This Week / History). Tapping a routine item triggers `QuickLogModal` directly.
- **Kesfet tab** — shows the muscle-map filter + category scroll + exercise library list (the existing browse UI, moved here as-is).

The tab switch is a two-button pill segment control rendered inside `ExerciseScreen` above the content — not a new navigation route. `useState<'routine' | 'browse'>('routine')` controls which section renders. This avoids any changes to `AppNavigator.tsx` or `MainTabParamList`.

**New AsyncStorage key:** `@vitalspan_routine`

```typescript
// Shape of @vitalspan_routine
type RoutineItem = {
  exerciseId: string;   // matches Exercise.id in exercises.ts
  order: number;        // 0-indexed display order
  addedAt: string;      // ISO timestamp
};
// Stored as RoutineItem[]
```

**New files:**
- None required. Routine state can be managed inline in `ExerciseScreen` using `AsyncStorage.getItem('@vitalspan_routine')` following the same pattern already used for `@vitalspan_exercise_log`.

**Modified files:**
- `src/screens/ExerciseScreen.tsx` — add `routineTab` state, load `@vitalspan_routine`, render two-tab switch, render routine list in Rutinim tab, move library UI into Kesfet tab.
- `src/screens/SettingsScreen.tsx` — add `'@vitalspan_routine'` to `ALL_STORAGE_KEYS` array (line 18-27) so it is cleared on "Reset Data".

**No navigation changes.** `ExerciseDetail` stack screen stays as-is. The "add to routine" action is a button inside `ExerciseDetailScreen` that reads and writes `@vitalspan_routine`.

---

### Feature 2: Progressive Overload (weight/reps per set)

**Current schema in `src/data/exercises.ts`:**

```typescript
export interface ExerciseLogEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  date: string;          // 'YYYY-MM-DD' — already present
  sets?: number;
  reps?: number;
  durationMin?: number;
  intensity?: ExerciseIntensity;
  caloriesEstimated?: number;
  notes?: string;
  loggedAt: string;      // full ISO — already present
}
```

**Required schema extension (additive, backward-compatible):**

```typescript
export interface SetEntry {
  setNumber: number;   // 1-indexed
  weightKg?: number;   // undefined for bodyweight exercises
  reps?: number;
}

export interface ExerciseLogEntry {
  // ...all existing fields unchanged...
  sets?: number;          // keep for backward compat (total set count)
  reps?: number;          // keep for backward compat (target reps)
  setsDetail?: SetEntry[]; // NEW — per-set weight/reps; undefined for old entries
}
```

`setsDetail` is optional and undefined on all existing log entries — the UI falls back to the existing `sets × reps` display when `setsDetail` is absent. No migration script is needed.

**Modified files:**
- `src/data/exercises.ts` — add `SetEntry` type and `setsDetail?: SetEntry[]` to `ExerciseLogEntry`.
- `src/components/QuickLogModal.tsx` — add a per-set weight input UI when exercise is not cardio. The modal currently has `sets` and `reps` number inputs. v5.0 replaces these with a dynamic list of `N` set rows (each row: weight kg + reps inputs), where N is controlled by a `+` / `-` set count control. The modal saves `setsDetail` on the `ExerciseLogEntry`.

**New file (optional but recommended):**
- `src/hooks/useOverloadTrend.ts` — pure hook that receives `exerciseId: string` and `logs: ExerciseLogEntry[]`, returns last-N-weeks average weight/reps per set for trend display. Used by `ExerciseDetailScreen` to render the sparkline.

---

### Feature 3: Exercise History Edit/Delete

**Current state:** `ExerciseScreen` renders `SwipeableLogRow` with swipe-to-delete working. The `date` field is already `YYYY-MM-DD` and `loggedAt` is full ISO. Delete is wired via `deleteLog(id: string)` in `ExerciseScreen`.

**What is missing:**
- Edit: no edit action on log entries exists.
- Full ISO date display: `loggedAt` exists but the UI in `SwipeableLogRow` doesn't display it.

**Integration approach:**

Add an "edit" action to `SwipeableLogRow`. The existing component uses RNGH v2 `Gesture.Pan` with a left-swipe-to-delete pattern. v5.0 options:

- **Option A (simpler):** Long-press or tap row → inline edit modal (re-use `QuickLogModal` in edit mode). No new gesture direction needed.
- **Option B (consistent):** Right-swipe reveals edit zone; left-swipe reveals delete zone. Requires extending the `Gesture.Pan` logic in `SwipeableLogRow`.

**Recommendation: Option A.** The `SwipeableLogRow` component is already at the complexity boundary for Gesture.Pan; adding bidirectional swipe risks gesture conflicts. Tap-to-edit via a modal is consistent with how `BiomarkerDetailScreen` handles entry editing (inline `TextInput` state + save).

**Modified files:**
- `src/components/SwipeableLogRow.tsx` — add `onEdit?: (id: string) => void` prop; add tap handler that calls `onEdit`.
- `src/components/QuickLogModal.tsx` — accept optional `existingEntry?: ExerciseLogEntry` prop for edit mode; when present, pre-fill all fields and save by replacing the entry (not prepending).
- `src/screens/ExerciseScreen.tsx` — pass `onEdit` to `SwipeableLogRow`; manage `editModal` state.
- `src/components/SwipeableLogRow.tsx` — display formatted `loggedAt` date (e.g., `"Jun 16 · 2:34 PM"`).

---

### Feature 4: Protocol Personal Dose

**Current schema in `src/screens/ProtocolScreen.tsx` (also redeclared in `src/lib/advisorContext.ts`):**

```typescript
interface ProtocolState {
  medTimes: Record<string, TimeSlot>;
  addedSupplements: string[];      // names only — no dose
  customSupplements: CustomSupplement[];  // has .dose already
  taken: string[];
  takenDate: string;
}
```

**Migration strategy — in-place upgrade, backward-compatible:**

Change `addedSupplements: string[]` to `addedSupplements: ProtocolSupplement[]`:

```typescript
export interface ProtocolSupplement {
  name: string;          // supplement name (key for DB lookup)
  personalDose?: string; // user-overridden dose; undefined = use DB default
  timing?: TimeSlot;     // user-set time slot; undefined = use DB bestTime
}
```

**AsyncStorage migration (in-place, no separate migration step):**

In `ProtocolScreen.loadData()`, after reading `@vitalspan_protocol`, apply a one-time normalizer before setting state:

```typescript
function normalizeProtocol(saved: unknown): ProtocolState {
  const raw = saved as Record<string, unknown>;
  const addedSupplements = (raw.addedSupplements as (string | ProtocolSupplement)[])
    ?.map(item =>
      typeof item === 'string'
        ? { name: item }           // upgrade string → ProtocolSupplement
        : item
    ) ?? [];
  return {
    ...EMPTY_PROTOCOL,
    ...raw,
    addedSupplements,
    medTimes: (raw.medTimes as Record<string, TimeSlot>) ?? {},
    customSupplements: (raw.customSupplements as CustomSupplement[]) ?? [],
    taken: (raw.taken as string[]) ?? [],
    takenDate: (raw.takenDate as string) ?? '',
  };
}
```

This runs on every load — strings become `{ name }` objects, existing objects pass through unchanged. No one-time migration flag is needed because the normalizer is idempotent.

**Modified files:**
- `src/screens/ProtocolScreen.tsx` — add `ProtocolSupplement` type, replace `addedSupplements: string[]` with `addedSupplements: ProtocolSupplement[]`, add `normalizeProtocol()`, update all usages of `protocol.addedSupplements` (toggle, group, advisor extraction, interaction check).
- `src/lib/advisorContext.ts` — update the `ProtocolState` interface copy (lines 70-76) to use `addedSupplements: Array<{ name: string; personalDose?: string }>`. Update the supplements extraction (line 193) to read `.name` from each item.

---

### Feature 5: Protocol Edit/Delete Items

**Current state:** Custom supplements have a remove button (`✕`) rendered at line 726 for `addedSupplements` and line 796 for `customSupplements`. The remove action for `addedSupplements` calls `toggleSupplement(supp.name)` which filters by name. The remove action for `customSupplements` calls `removeCustomSupplement(cs.id)` which shows an Alert.

**What is missing:** Edit action on protocol items — currently no way to change personal dose or timing after initial add.

**Integration approach:**

No new swipe gesture for protocol items. The Protocol screen items are not in a `GestureDetector` wrapper and `ProtocolScreen` does not import RNGH. Adding swipe-to-delete here is more invasive than it's worth.

**Recommended pattern:** Add an edit button (pencil icon or "Edit" text) to the item card, which opens a small modal (similar to `AddCustomSupplementModal`) pre-filled with the current name/dose/timing. This is consistent with what already exists for custom supplements.

**Modified files:**
- `src/screens/ProtocolScreen.tsx`:
  - Add `EditItemModal` component (inline, same file) with `name`, `personalDose`, `timing` fields.
  - Add `editingItem` state: `{ type: 'added' | 'custom'; id: string } | null`.
  - For `addedSupplements` items: show edit icon in `badgeGroup`; on press open `EditItemModal` pre-filled.
  - For `customSupplements` items: wire the existing `✕` remove button to show an Alert (already done); add edit icon next to it.

---

### Feature 6: Protocol Category Routing (remove Custom section)

**Current state:** `customSupplements` is a separate array in `ProtocolState`. The "Custom" section renders at the bottom of the stack section with its own `catLabel`. The `AddCustomSupplementModal` creates `CustomSupplement` objects that always land in `customSupplements`, regardless of whether the supplement matches the DB.

**Target state:** No "Custom" category visible in the list. All supplements (DB-matched or freeform) unify into `addedSupplements: ProtocolSupplement[]`.

**Migration strategy:**

1. Extend `ProtocolSupplement` with optional `isCustom` and `dose` fields:

```typescript
export interface ProtocolSupplement {
  name: string;
  personalDose?: string;   // user-set dose (replaces CustomSupplement.dose)
  timing?: TimeSlot;
  notes?: string;          // for freeform supplements
  isCustom?: boolean;      // true for freeform (not in SUPPLEMENT_DATABASE)
  addedAt?: string;        // for new additions (not on upgraded strings)
}
```

2. In `normalizeProtocol()`, merge existing `customSupplements` into `addedSupplements`:

```typescript
// During normalization, also migrate customSupplements → addedSupplements
const migratedCustom: ProtocolSupplement[] = (raw.customSupplements as CustomSupplement[] ?? [])
  .map(cs => ({
    name: cs.name,
    personalDose: cs.dose !== '—' ? cs.dose : undefined,
    timing: cs.timing,
    notes: cs.notes,
    isCustom: true,
    addedAt: cs.addedAt,
  }));

// Merge, deduplicating by name
const allNames = new Set(addedSupplements.map(s => s.name.toLowerCase()));
for (const cs of migratedCustom) {
  if (!allNames.has(cs.name.toLowerCase())) {
    addedSupplements.push(cs);
  }
}

// Drop customSupplements from state after migration
return { ...rest, addedSupplements, customSupplements: [] };
```

3. After normalization, `customSupplements` is always empty. The `AddCustomSupplementModal` saves to `addedSupplements` instead of `customSupplements`. Category grouping uses the DB category when `isCustom` is false, and 'other' when `isCustom` is true — but renders under the supplement's DB category label, not "Custom".

**This migration is safe and one-shot:** once the normalizer runs and the user's data is written back, `customSupplements` is empty forever. The `customSupplements` field can be kept in the type (as `customSupplements?: never[]`) for a transitional period then removed later.

**Modified files:**
- `src/screens/ProtocolScreen.tsx` — full `ProtocolSupplement` type update, `normalizeProtocol()` migration, remove "Custom" section render, update `AddCustomSupplementModal` to save to `addedSupplements`.

---

### Feature 7: Adherence Streak

**New AsyncStorage key:** `@vitalspan_streak`

```typescript
// Shape of @vitalspan_streak
interface StreakState {
  currentStreak: number;    // days in current streak
  longestStreak: number;    // all-time best
  lastCompletedDate: string; // 'YYYY-MM-DD' of last day with takenCount === totalItems
}
```

**Update logic:** The streak is updated in `ProtocolScreen.persist()` — the function already writes to both `@vitalspan_protocol` and `@vitalspan_protocol_today`. Add a third write: after comparing `taken.length` to `totalItems`, if all items are taken today, read `@vitalspan_streak`, check if `lastCompletedDate` is yesterday (to extend streak) or today (no change), update, and write back.

The streak should NOT be derived on the fly from `@vitalspan_protocol_today` history (that key only stores a single day's state, not a date-keyed history). The `StreakState` object is the authoritative counter.

**New file:**
- `src/lib/streakService.ts` — `updateStreak(takenCount: number, totalItems: number): Promise<void>` — reads `@vitalspan_streak`, applies logic, writes back. Called from `ProtocolScreen.persist()`.

**Modified files:**
- `src/screens/ProtocolScreen.tsx` — call `streakService.updateStreak(takenCount, totalItems)` inside `persist()`.
- `src/screens/DashboardScreen.tsx` — load `@vitalspan_streak` and display the current streak as a badge or card element.
- `src/screens/SettingsScreen.tsx` — add `'@vitalspan_streak'` to `ALL_STORAGE_KEYS`.

---

### Feature 8: Local Push Notifications (expo-notifications)

**Install required (not currently in package.json):**

```bash
npx expo install expo-notifications
```

`expo-notifications` is an Expo SDK-compatible package. It requires a config plugin entry in `app.json` and an EAS build (Expo Go will not receive push tokens on iOS). It does NOT require custom native code beyond the config plugin.

**app.json addition:**

```json
{
  "expo": {
    "plugins": [
      "expo-font",
      "expo-notifications",
      [...existing plugins...]
    ]
  }
}
```

The `expo-notifications` plugin handles the `UNUserNotificationCenter` entitlement and `NSUserNotificationUsageDescription` automatically.

**Architecture: notification service as a standalone lib module**

Create `src/lib/notificationService.ts`. This module is the single point of notification scheduling — no screen imports `expo-notifications` directly.

```typescript
// src/lib/notificationService.ts

import * as Notifications from 'expo-notifications';
import { ProtocolState, ProtocolSupplement } from '../screens/ProtocolScreen';

export async function requestPermission(): Promise<boolean> { ... }

export async function rescheduleProtocolNotifications(
  protocol: ProtocolState
): Promise<void> {
  // 1. Cancel all existing scheduled notifications with identifier prefix 'protocol-'
  // 2. Group items by TimeSlot (morning/afternoon/evening/night)
  // 3. Schedule one notification per time slot that has items
  //    - Trigger: daily at fixed hour per slot (morning=8am, afternoon=1pm, evening=6pm, night=9pm)
  //    - Body: "Time for your [slot] protocol: [item1], [item2]"
  //    - Identifier: 'protocol-morning', 'protocol-afternoon', etc.
}
```

**Scheduling trigger:** `Notifications.scheduleNotificationAsync` with `DailyTriggerInput`:

```typescript
await Notifications.scheduleNotificationAsync({
  identifier: `protocol-${slot}`,
  content: { title: 'Vitalspan', body: slotBody, sound: true },
  trigger: { hour: SLOT_HOURS[slot], minute: 0, repeats: true, type: Notifications.SchedulableTriggerInputTypes.DAILY },
});
```

**When to call `rescheduleProtocolNotifications`:** Every time `ProtocolScreen.persist()` runs (which covers all adds, removes, timing changes, and taken toggles). This re-schedules all 4 possible slots, cancelling any that now have zero items.

**Permission request location:** In `ProtocolScreen`, on first-ever protocol item addition, call `requestPermission()`. Do not request at app launch — asking before the user has added anything hurts conversion.

**New files:**
- `src/lib/notificationService.ts`

**Modified files:**
- `app.json` — add `"expo-notifications"` plugin.
- `src/screens/ProtocolScreen.tsx` — call `notificationService.rescheduleProtocolNotifications(next)` inside `persist()`, after AsyncStorage writes. Call `notificationService.requestPermission()` on first item add.
- `src/screens/SettingsScreen.tsx` — wire the existing `notificationsEnabled` switch to call `notificationService.cancelAllProtocolNotifications()` when toggled off, and `notificationService.rescheduleProtocolNotifications(protocol)` when toggled back on.

---

### Feature 9: Personal Dose in AI Advisor Context

**Current state in `src/lib/advisorContext.ts` (lines 193-195):**

```typescript
const addedSups = protocolState?.addedSupplements ?? [];
const customSups = (protocolState?.customSupplements ?? []).map((s) => s.name);
const supplements = Array.from(new Set([...addedSups, ...customSups]));
```

`addedSups` is currently treated as `string[]`. After Feature 4's schema migration, it is `ProtocolSupplement[]`.

**Required change:**

Update the `ProtocolState` interface copy inside `advisorContext.ts` (lines 70-76):

```typescript
// Before:
interface ProtocolState {
  addedSupplements: string[];
  ...
}

// After:
interface ProtocolState {
  addedSupplements: Array<{ name: string; personalDose?: string }>;
  customSupplements: Array<{ name: string }>;
  ...
}
```

Update supplements extraction to include dose info in the context payload:

```typescript
// After Feature 4 migration, customSupplements will always be empty,
// but keep backward-compat read until fully verified
const addedSups = (protocolState?.addedSupplements ?? []).map(item =>
  typeof item === 'string'
    ? { name: item, dose: undefined }
    : { name: item.name, dose: item.personalDose }
);
const customSups = (protocolState?.customSupplements ?? []).map(s => ({
  name: s.name,
  dose: undefined,
}));
const supplements = Array.from(
  new Map([...addedSups, ...customSups].map(s => [s.name, s])).values()
);
```

Update `AdvisorContext` type to carry dose:

```typescript
export interface AdvisorContext {
  // ...existing fields...
  supplements: Array<{ name: string; dose?: string }>;  // was: string[]
}
```

Privacy note: personal dose is user-set text (e.g., "500mg"), not a clinical value. Including it does not violate the zero-PII privacy boundary.

**Modified files:**
- `src/lib/advisorContext.ts` — update `ProtocolState` copy, supplements extraction, `AdvisorContext` type.
- `src/lib/advisorContext.test.ts` — update test fixtures to use new supplement shape.

---

### Feature 10: Biomarker Trend Charts

**Current state:** `src/screens/BiomarkerDetailScreen.tsx` loads `@vitalspan_biomarkers` (a `StoredEntry[]`). Entries have `date: string` (ISO) and `value: number`. The screen currently has edit-in-place of individual entries but no chart visualization.

**Chart library:** `react-native-chart-kit` is already in `package.json` (`^6.12.0`). No new package needed. Use `LineChart` from `react-native-chart-kit` for both biomarker trends and exercise overload trends.

**chart-kit caveats:**
- Requires `react-native-svg` (already installed at `15.12.1`).
- `LineChart` needs at least 2 data points to render non-trivially.
- Dimensions must be pixel-explicit — use `Dimensions.get('window').width - Spacing.base * 2` for full-width minus margins.
- Does not support date-aware x-axis natively — labels must be formatted manually.

**New shared component:**

```typescript
// src/components/TrendChart.tsx
interface TrendChartProps {
  data: Array<{ date: string; value: number }>;
  unit: string;
  range: '30d' | '90d' | '365d';
  onRangeChange: (r: '30d' | '90d' | '365d') => void;
  optMin?: number;
  optMax?: number;
}
```

`TrendChart` renders the `LineChart` with range selector chips above it. Optimal range is rendered as a horizontal reference band using an SVG `Rect` layered behind the line (react-native-svg `Rect` drawn as absolute positioned overlay).

This component is used in both `BiomarkerDetailScreen` (biomarker history over time) and `ExerciseDetailScreen` (exercise overload trend over weeks).

**Free-tier data limit integration:** `TrendChart` receives the already-filtered `data` prop — the filtering happens in the screen, not the component. In `BiomarkerDetailScreen`, apply the 30-day cap before passing to `TrendChart`:

```typescript
const { isPremium } = usePremiumContext();
const filteredEntries = useMemo(() => {
  if (isPremium) return entries;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return entries.filter(e => new Date(e.date) >= cutoff);
}, [entries, isPremium]);
```

Show a locked/upgrade banner below the chart when `!isPremium && entries.length > filteredEntries.length`.

**New files:**
- `src/components/TrendChart.tsx`

**Modified files:**
- `src/screens/BiomarkerDetailScreen.tsx` — import `TrendChart`, add 30/90/365d range state, apply free-tier filter, render `TrendChart` above the entry list.
- `src/screens/ExerciseDetailScreen.tsx` — import `TrendChart`, compute weekly weight/reps trend from `@vitalspan_exercise_log` filtered to the current exercise, render `TrendChart`.

---

### Feature 11: Free-Tier Data Limits

**Gate:** `usePremiumContext().isPremium` (already available everywhere via `PremiumContext`).

**Biomarker history:** Applied in `BiomarkerDetailScreen` as described in Feature 10 — filter `entries` to 30 days for non-premium users before passing to `TrendChart`.

**Exercise log history:** Same pattern in `ExerciseScreen` — only show Today + This Week for free users; History section is hidden with an upgrade prompt. The existing `historyLogs` useMemo can be wrapped with `isPremium` check.

No new files. No schema changes. The cap is a runtime display filter, not a storage filter — data is always stored in full and displayed in full to premium users.

**Modified files:**
- `src/screens/BiomarkerDetailScreen.tsx` — 30-day filter + upgrade banner (done in Feature 10).
- `src/screens/ExerciseScreen.tsx` — hide `historyLogs` section for non-premium users + upgrade prompt.

---

### Feature 12: EAS Build (push notifications + production pipeline)

**Current state:** `app.json` has the EAS `projectId`. `eas.json` likely already exists from v4.0. `expo-notifications` is not yet a plugin.

**Required `app.json` additions:**

```json
{
  "expo": {
    "plugins": [
      "expo-font",
      "expo-notifications",
      ["@kingstinct/react-native-healthkit", { ... }],
      "react-native-adapty"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.vitalspan.app",
      "entitlements": {
        "com.apple.developer.healthkit": true,
        "com.apple.developer.healthkit.access": [],
        "aps-environment": "production"
      }
    }
  }
}
```

The `aps-environment: production` entitlement enables push notification delivery in production builds. For development builds it should be `"development"` — or managed via EAS environment overrides.

**`eas.json` additions** (if not already present):

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

**Modified files:**
- `app.json` — add `expo-notifications` plugin, add `aps-environment` entitlement.
- `eas.json` — verify/add build profiles.

---

## ProtocolState Migration: Canonical Strategy

The migration from the current schema to the v5.0 schema happens in a single `normalizeProtocol()` function called in `ProtocolScreen.loadData()`. This function is the only place that touches the raw AsyncStorage data before it enters React state.

**Migration sequence (all handled in `normalizeProtocol()`):**

1. `addedSupplements: string[]` → `addedSupplements: ProtocolSupplement[]` (string → `{ name }`)
2. `customSupplements: CustomSupplement[]` → merged into `addedSupplements` as `ProtocolSupplement[]` with `isCustom: true`, then `customSupplements: []`
3. All normalizations are idempotent — running multiple times on already-migrated data produces the same output.

**Backward compatibility:** The key `@vitalspan_protocol` is preserved. No new key is introduced for the protocol. Old reads (e.g., `advisorContext.ts`) are also updated to handle both string and object shapes in the `addedSupplements` array (defensive `typeof item === 'string'` check) until v5.0 is fully deployed.

---

## Notification Scheduling Architecture

```
User changes protocol (add/remove/time change)
          ↓
ProtocolScreen.persist(next: ProtocolState)
          ↓
AsyncStorage.setItem('@vitalspan_protocol', ...)
AsyncStorage.setItem('@vitalspan_protocol_today', ...)
          ↓
notificationService.rescheduleProtocolNotifications(next)
          ↓
  for each TimeSlot: morning / afternoon / evening / night
    items = filter next.addedSupplements + medications by slot
    if items.length > 0:
      scheduleNotificationAsync({ identifier: 'protocol-{slot}', daily trigger })
    else:
      cancelScheduledNotificationAsync('protocol-{slot}')
```

**Notification identifiers** are deterministic strings (`'protocol-morning'`, etc.) — not UUIDs. This means re-scheduling always cancels and replaces, never accumulates duplicates.

**Medications** derive their slot from `protocol.medTimes[medName]`. Supplements derive their slot from `ProtocolSupplement.timing` or `SupplementInfo.bestTime` as fallback.

---

## Build Order and Dependency Graph

The 12 features have these data-level dependencies:

```
Feature 4 (ProtocolSupplement schema)
  ├── must precede Feature 5 (edit/delete UI reads ProtocolSupplement)
  ├── must precede Feature 6 (category routing merges into ProtocolSupplement)
  ├── must precede Feature 8 (notifications read ProtocolSupplement.timing)
  └── must precede Feature 9 (advisorContext reads ProtocolSupplement.personalDose)

Feature 1 (Routine key)
  └── must precede Feature 2 (progressive overload reads loggedAt; routine reuses QuickLogModal)

Feature 10 (TrendChart component)
  ├── must precede Feature 11 free-tier filter (chart is the display surface)
  └── used independently by Feature 2 (exercise overload sparkline)

Feature 8 (notifications)
  └── depends on Feature 4 schema (reads timing from ProtocolSupplement)
```

**Recommended build sequence:**

| Phase | Features | Rationale |
|-------|----------|-----------|
| Phase A | Feature 4 (protocol schema + migration) | Foundation — unblocks 5, 6, 8, 9 |
| Phase B | Features 5 + 6 (edit/delete + category routing) | Build on A; completes protocol overhaul |
| Phase C | Feature 7 (streak) | Standalone; only touches `persist()` + new lib file |
| Phase D | Feature 1 + 2 (routine + overload schema) | Exercise features; `ExerciseLogEntry` schema change before UI |
| Phase E | Feature 3 (history edit/delete) | Builds on D; adds `QuickLogModal` edit mode |
| Phase F | Feature 10 (TrendChart component) | Standalone component; no screen dependencies |
| Phase G | Features 11 + Biomarker chart wiring | Builds on F; gates on `isPremium` already available |
| Phase H | Feature 9 (advisor context dose) | Builds on A; small change, low risk |
| Phase I | Feature 8 (notifications) | Builds on A; requires `npx expo install` + EAS build |
| Phase J | Feature 12 (EAS build config) | Last — production build after all features land |

**Why schema changes first:** AsyncStorage is the only shared state layer. `normalizeProtocol()` must exist before any UI that writes or reads the new schema. Building the migration function in Phase A means Phases B–H all operate on a known-good schema with backward compat in place.

**Why notifications late:** `expo-notifications` is a new native module requiring an EAS build to test on device. Build all features that work in the Expo dev client first; test notifications as part of the EAS validation cycle.

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `TrendChart` | Renders a time-series line chart with range selector; stateless display | `BiomarkerDetailScreen`, `ExerciseDetailScreen` |
| `QuickLogModal` | Create and edit exercise log entries; handles `setsDetail` | `ExerciseScreen`, `ExerciseDetailScreen` |
| `SwipeableLogRow` | Swipe-to-delete + tap-to-edit for a single log entry | `ExerciseScreen` |
| `notificationService` | Schedule and cancel daily protocol notifications; single import point for `expo-notifications` | `ProtocolScreen`, `SettingsScreen` |
| `streakService` | Read/write `@vitalspan_streak`; pure async functions | `ProtocolScreen`, `DashboardScreen` |
| `normalizeProtocol()` | One-shot idempotent migration of raw `@vitalspan_protocol` data | `ProtocolScreen.loadData()` only |

---

## Data Flow

### Protocol change → notifications

```
User taps time chip / adds item / removes item
  → ProtocolScreen local state update
  → persist(next: ProtocolState)
    → AsyncStorage.setItem (2 keys)
    → streakService.updateStreak(takenCount, totalItems)
    → notificationService.rescheduleProtocolNotifications(next)
```

### Exercise log → overload trend

```
User logs exercise (QuickLogModal.handleSave)
  → ExerciseLogEntry with setsDetail written to @vitalspan_exercise_log
  → ExerciseDetailScreen.loadData() on next focus
  → useOverloadTrend(exerciseId, logs) computes week-by-week avg weight
  → TrendChart renders sparkline
```

### Biomarker entry → chart (free tier gated)

```
User adds biomarker (BiomarkerEntryScreen → @vitalspan_biomarkers)
  → BiomarkerDetailScreen.loadData() on next focus
  → isPremium ? all entries : last 30 days
  → filteredEntries → TrendChart
  → if truncated and !isPremium: show upgrade banner
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Importing expo-notifications directly in screens

**What people do:** `import * as Notifications from 'expo-notifications'` in `ProtocolScreen` or `SettingsScreen`.

**Why it's wrong:** Scatters notification logic across multiple files; makes it impossible to guarantee one-and-only-one source of notification IDs; risks scheduling duplicates.

**Do this instead:** All `expo-notifications` usage goes through `src/lib/notificationService.ts`. Screens call `notificationService.*` functions only.

### Anti-Pattern 2: Storing isPremium in AsyncStorage

**What people do:** Cache `isPremium` in `@vitalspan_user_profile` or a new key to avoid the Adapty API call on cold start.

**Why it's wrong:** Creates a desync vector when subscriptions lapse, are refunded, or are granted server-side. Adapty's SDK has its own internal cache that handles offline correctly.

**Do this instead:** `PremiumContext` already handles this. `isPremiumLoading` prevents flash of incorrect state on cold start. Trust the SDK cache.

### Anti-Pattern 3: Running normalizeProtocol on every AsyncStorage write

**What people do:** Call `normalizeProtocol(JSON.parse(await AsyncStorage.getItem(...)))` before every write to ensure the written data is in the new schema.

**Why it's wrong:** Redundant after the first read-and-write cycle; masks bugs where state diverges between in-memory and storage.

**Do this instead:** Run `normalizeProtocol` only in `loadData()` on read. After normalization, in-memory state is always in the new schema. `persist()` writes the in-memory state directly — it is already normalized.

### Anti-Pattern 4: Separate migration key/flag

**What people do:** Add `@vitalspan_protocol_v2_migrated: 'true'` to AsyncStorage; only run migration if flag is absent; set flag after.

**Why it's wrong:** Extra complexity with no benefit when the normalizer is idempotent. If the migration is safe to run multiple times, the flag adds code surface area for free.

**Do this instead:** Make the normalizer idempotent (safe to run on already-migrated data). Skip the flag entirely.

### Anti-Pattern 5: New notification identifier per user or per day

**What people do:** `identifier: \`protocol-morning-${userId}-${date}\``

**Why it's wrong:** iOS limits scheduled notifications to 64. Unique identifiers per day means the app exhausts the limit in 16 days.

**Do this instead:** Use static identifiers (`'protocol-morning'`, `'protocol-afternoon'`, etc.) with daily repeating triggers. Cancelling and re-scheduling with the same identifier replaces, not accumulates.

---

## Modified Files Summary (v5.0)

| File | Changes |
|------|---------|
| `src/screens/ProtocolScreen.tsx` | `ProtocolSupplement` type, `normalizeProtocol()`, edit modal, category routing, notifications call, streak call |
| `src/screens/ExerciseScreen.tsx` | Tab switch (Rutinim/Kesfet), routine state, `@vitalspan_routine` load, premium gate on History |
| `src/screens/ExerciseDetailScreen.tsx` | Add to routine button, `TrendChart` for overload |
| `src/screens/BiomarkerDetailScreen.tsx` | `TrendChart` integration, 30-day free-tier filter, upgrade banner |
| `src/screens/DashboardScreen.tsx` | Load and display streak |
| `src/screens/SettingsScreen.tsx` | Add new keys to `ALL_STORAGE_KEYS`; wire notifications toggle to `notificationService` |
| `src/data/exercises.ts` | Add `SetEntry` type, `setsDetail?: SetEntry[]` to `ExerciseLogEntry` |
| `src/components/QuickLogModal.tsx` | Per-set weight/reps input, optional `existingEntry` edit mode |
| `src/components/SwipeableLogRow.tsx` | Add `onEdit` prop, display `loggedAt` date, tap handler |
| `src/lib/advisorContext.ts` | Update `ProtocolState` copy, supplement extraction with dose, `AdvisorContext.supplements` type |
| `src/lib/advisorContext.test.ts` | Update test fixtures |
| `app.json` | Add `expo-notifications` plugin, `aps-environment` entitlement |
| `eas.json` | Verify/add build profiles |

## New Files Summary (v5.0)

| File | Purpose |
|------|---------|
| `src/lib/notificationService.ts` | All `expo-notifications` scheduling; single import point |
| `src/lib/streakService.ts` | Read/write `@vitalspan_streak`; update logic |
| `src/components/TrendChart.tsx` | Shared `LineChart` wrapper with range selector; used by biomarker + exercise screens |
| `src/hooks/useOverloadTrend.ts` | Derives week-by-week weight/reps trend from `ExerciseLogEntry[]` for a given `exerciseId` |

---

## Sources

- All integration points derived from direct inspection of: `src/screens/ProtocolScreen.tsx`, `src/screens/ExerciseScreen.tsx`, `src/data/exercises.ts`, `src/lib/advisorContext.ts`, `src/components/QuickLogModal.tsx`, `src/components/SwipeableLogRow.tsx`, `src/context/PremiumContext.tsx`, `src/navigation/AppNavigator.tsx`, `src/screens/SettingsScreen.tsx`, `app.json`, `package.json` — HIGH confidence (live source code)
- expo-notifications scheduling API and config plugin behavior: standard Expo SDK 54 patterns — HIGH confidence
- react-native-chart-kit `LineChart` API and SVG dependency: `package.json` confirms v6.12.0 and `react-native-svg` 15.12.1 already installed — HIGH confidence
- Notification 64-limit on iOS: Apple UNUserNotificationCenter documentation — HIGH confidence
