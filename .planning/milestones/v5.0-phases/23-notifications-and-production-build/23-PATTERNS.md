# Phase 23: Notifications & Production Build - Pattern Map

**Mapped:** 2026-06-19
**Files analyzed:** 6 (2 new, 4 modified)
**Analogs found:** 6 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/notifications.ts` | utility/lib | request-response + event-driven | `src/lib/healthkit.ts` | exact (same lib layer: permission request, async storage, async helpers) |
| `App.tsx` | config/entry | request-response | `App.tsx` itself (existing `init()` pattern) | exact (fire-and-forget parallel useEffect) |
| `src/screens/ProtocolScreen.tsx` | screen/component | CRUD | `src/screens/SettingsScreen.tsx` (Switch rows + AsyncStorage) + existing ProtocolScreen streak row | exact (inline section with Switch + TouchableOpacity rows) |
| `app.json` | config | — | `app.json` itself (existing entitlements + plugins) | exact (additive JSON edit) |
| `eas.json` | config | — | `eas.json` itself (existing production profile) | exact (no change needed per RESEARCH D-06) |
| `src/types/protocol.ts` | type | — | `src/types/protocol.ts` itself | exact (TimeSlot already defined; NotificationPrefs is a new parallel interface) |

---

## Pattern Assignments

---

### `src/lib/notifications.ts` (utility/lib, request-response + event-driven)

**Analog:** `src/lib/healthkit.ts`

**Rationale:** healthkit.ts is the canonical pattern for a standalone lib file in this codebase: module-scope storage key constants, exported TypeScript interfaces, exported async functions with try/catch returning typed results, no default export.

**Imports pattern** (`src/lib/healthkit.ts` lines 9–18):
```typescript
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isHealthDataAvailable,
  requestAuthorization,
  // ...
} from '@kingstinct/react-native-healthkit';
```

For `notifications.ts`, replace with:
```typescript
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeSlot } from '../types/protocol';
```

**Storage key constant pattern** (`src/lib/healthkit.ts` lines 20–21):
```typescript
const STORAGE_KEY = '@vitalspan_health_data';
const PERMISSIONS_KEY = '@vitalspan_health_permissions';
```

Copy this pattern:
```typescript
export const NOTIFICATION_PREFS_KEY = '@vitalspan_notification_prefs';
```

**Interface export pattern** (`src/lib/healthkit.ts` lines 34–68):
```typescript
export interface HealthData {
  hrv?: number;
  // ...
}

export interface PermissionStatus {
  granted: boolean;
  // ...
}
```

Copy this pattern for:
```typescript
export interface NotificationPrefs {
  morning:   { enabled: boolean; time: string };
  afternoon: { enabled: boolean; time: string };
  evening:   { enabled: boolean; time: string };
  night:     { enabled: boolean; time: string };
}

export const DEFAULT_PREFS: NotificationPrefs = {
  morning:   { enabled: false, time: '08:00' },
  afternoon: { enabled: false, time: '13:00' },
  evening:   { enabled: false, time: '18:00' },
  night:     { enabled: false, time: '21:00' },
};
```

**Permission request pattern** (`src/lib/healthkit.ts` lines 88–110):
```typescript
export async function requestHealthKitPermissions(): Promise<PermissionStatus> {
  try {
    await requestAuthorization({ toRead: READ_TYPES });
    const status: PermissionStatus = { granted: true, ... };
    await savePermissionStatus(status);
    return status;
  } catch (e) {
    console.error('[healthkit requestHealthKitPermissions]', e);
    const denied: PermissionStatus = { granted: false, ... };
    await savePermissionStatus(denied);
    return denied;
  }
}
```

Copy this try/catch shape for:
```typescript
export async function ensurePermission(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}
```

**Async load pattern** (`src/lib/healthkit.ts` lines 224–231):
```typescript
export async function loadHealthData(): Promise<HealthData | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HealthData) : null;
  } catch {
    return null;
  }
}
```

Copy this pattern for:
```typescript
export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    return raw ? (JSON.parse(raw) as NotificationPrefs) : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}
```

**Core scheduling functions** (from RESEARCH.md Code Examples — no codebase analog exists yet; use research patterns directly):
```typescript
// Deterministic identifier scheme — prefix matches app storage key convention
function notifId(slot: TimeSlot): string {
  return `vitalspan-${slot}`;
}

export async function scheduleSlot(slot: TimeSlot, time: string): Promise<void> {
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    identifier: notifId(slot),
    content: {
      title: 'Vitalspan Reminder',
      body: `Time to take your ${slot} supplements.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelSlot(slot: TimeSlot): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notifId(slot));
}

export async function rescheduleAll(prefs: NotificationPrefs): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const slots: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night'];
  for (const slot of slots) {
    if (prefs[slot].enabled) {
      await scheduleSlot(slot, prefs[slot].time);
    }
  }
}
```

**setNotificationHandler** — module-scope, placed at top of `App.tsx` before the component (NOT in notifications.ts):
```typescript
// SDK 54+: use shouldShowBanner + shouldShowList (shouldShowAlert is deprecated and silently broken)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

---

### `App.tsx` — add reschedule useEffect (entry point, fire-and-forget)

**Analog:** `App.tsx` itself — the existing `init()` fire-and-forget void IIFE pattern (lines 42–51).

**Existing fire-and-forget void IIFE pattern** (`App.tsx` lines 39–51):
```typescript
// Fire-and-forget: cache pruning + data migration (non-blocking)
pruneExpiredCache().catch(() => null);
// Migration chain: only runs after session is established
void (async () => {
  const migrated = await AsyncStorage.getItem('@vitalspan_migrated_v2').catch(() => null);
  if (!migrated) {
    const biomarkersRaw = await AsyncStorage.getItem('@vitalspan_biomarkers').catch(() => null);
    const entries: StoredEntry[] = biomarkersRaw ? JSON.parse(biomarkersRaw) : [];
    migrateHistory(entries)
      .then(() => AsyncStorage.setItem('@vitalspan_migrated_v2', 'true'))
      .catch(() => null);
  }
})();
```

**CRITICAL:** The reschedule effect must be a **separate** `useEffect` from the existing `init()` one. The existing `init()` gates `setInitialRoute` — any error inside it blocks the loading spinner. The reschedule effect must have its own isolated try/catch.

**Reschedule useEffect pattern** — add after the existing `useEffect` block, before the `if (!initialRoute)` return:
```typescript
// Phase 23: reschedule notifications on every launch (survives EAS updates)
useEffect(() => {
  void (async () => {
    try {
      const prefs = await loadNotificationPrefs();
      await rescheduleAll(prefs);
    } catch {
      // non-blocking — silently ignore
    }
  })();
}, []);
```

**Module-scope setNotificationHandler** — add after imports, before `export default function App()`:
```typescript
// Must be at module scope (not inside useEffect) — required for foreground notification display
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

**Imports to add** (`App.tsx` lines 1–15 show existing import block; add to it):
```typescript
import * as Notifications from 'expo-notifications';
import { loadNotificationPrefs, rescheduleAll } from './src/lib/notifications';
```

---

### `src/screens/ProtocolScreen.tsx` — add Reminders section (screen, CRUD)

**Primary analog:** `src/screens/SettingsScreen.tsx` — Switch toggle rows with `trackColor`/`thumbColor` following the project's exact color conventions.

**Secondary analog:** `src/screens/ProtocolScreen.tsx` itself — the Phase 22 streak row (lines 849–859) is the insertion point anchor; the streakRow styles (lines 1136–1148) show the section style convention for horizontal rows with `Spacing.base` padding.

**Imports to add** — extend the existing React Native import line (ProtocolScreen.tsx line 2–7):
```typescript
// Add to existing RN imports:
Switch, TouchableOpacity,  // Switch is new; TouchableOpacity is already imported
// Add new package import:
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
// Add lib imports:
import {
  NotificationPrefs, DEFAULT_PREFS, NOTIFICATION_PREFS_KEY,
  scheduleSlot, cancelSlot, ensurePermission,
} from '../lib/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage'; // already imported
```

**Switch color convention** (`src/screens/SettingsScreen.tsx` lines 188–193):
```typescript
<Switch
  value={notificationsEnabled}
  onValueChange={handleToggleNotif}
  trackColor={{ false: Colors.borderLight, true: Colors.primaryBorder }}
  thumbColor={notificationsEnabled ? Colors.primary : Colors.onSurfaceMuted}
/>
```

All Reminders section switches must use exactly this `trackColor`/`thumbColor` pattern.

**Section header style** (`src/screens/ProtocolScreen.tsx` lines 1150–1154, `sectionLabel`):
```typescript
sectionLabel: {
  fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.onSurfaceMuted,
  textTransform: 'uppercase', letterSpacing: 1.5,
  paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base,
},
```

Use this style for the "REMINDERS" section header label.

**Streak row style** (insertion point — `src/screens/ProtocolScreen.tsx` lines 1136–1148):
```typescript
streakRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: Spacing.base,
  paddingBottom: Spacing.sm,
},
```

Reminders slot rows follow the same `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'`, `paddingHorizontal: Spacing.base` convention.

**Insertion point in JSX** (`src/screens/ProtocolScreen.tsx` lines 849–861):
```tsx
{/* Phase 22: Streak stat row */}
<View style={s.streakRow}>
  ...
</View>

{/* ← Phase 23: Reminders section goes HERE, between streakRow and ScrollView */}

<ScrollView
  style={s.scroll}
  ...
>
```

**State additions to ProtocolScreen component:**
```typescript
// Notification prefs state
const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
const [permDenied, setPermDenied] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);
const [activePickerSlot, setActivePickerSlot] = useState<TimeSlot | null>(null);
```

**Prefs load pattern** — add to the existing `useFocusEffect` or a separate `useEffect` (follow the AsyncStorage read pattern from ProtocolScreen.tsx lines 575–586):
```typescript
useEffect(() => {
  AsyncStorage.getItem(NOTIFICATION_PREFS_KEY)
    .then(raw => { if (raw) setNotifPrefs(JSON.parse(raw) as NotificationPrefs); })
    .catch(() => null);
}, []);
```

**Slot toggle handler** — mirrors the SettingsScreen `handleToggleNotif` pattern but adds permission check:
```typescript
async function handleSlotToggle(slot: TimeSlot, value: boolean): Promise<void> {
  Haptics.selectionAsync().catch(() => null);
  if (value) {
    const granted = await ensurePermission();
    if (!granted) { setPermDenied(true); return; }
  }
  setPermDenied(false);
  const next = { ...notifPrefs, [slot]: { ...notifPrefs[slot], enabled: value } };
  setNotifPrefs(next);
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next));
  if (value) {
    await scheduleSlot(slot, next[slot].time);
  } else {
    await cancelSlot(slot);
  }
}
```

**Haptics pattern** — ProtocolScreen already uses `Haptics.selectionAsync().catch(() => null)` throughout (e.g., line 532). All Reminders interactions should fire `selectionAsync`.

**DateTimePicker render pattern** (from RESEARCH.md Pattern 5 — no codebase analog yet):
```typescript
function timeStringToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

{showTimePicker && activePickerSlot && (
  <DateTimePicker
    mode="time"
    display="spinner"
    value={timeStringToDate(notifPrefs[activePickerSlot].time)}
    onChange={(event: DateTimePickerEvent, date?: Date) => {
      if (event.type === 'set' && date) {
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const newTime = `${hh}:${mm}`;
        const next = {
          ...notifPrefs,
          [activePickerSlot]: { ...notifPrefs[activePickerSlot], time: newTime },
        };
        setNotifPrefs(next);
        AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next)).catch(() => null);
        if (next[activePickerSlot].enabled) {
          scheduleSlot(activePickerSlot, newTime).catch(() => null);
        }
      }
      setShowTimePicker(false);
    }}
  />
)}
```

**Inline permission denial message** — below the Reminders section, no Alert, no modal (per D-03). Use `Colors.onSurfaceMuted` text, `Spacing.base` horizontal padding:
```tsx
{permDenied && (
  <Text style={s.permDeniedTxt}>
    Notifications are disabled — go to Settings › Notifications to enable.
  </Text>
)}
```

**New styles to add to `s` StyleSheet** (following existing style naming and token conventions):
```typescript
// Phase 23: Reminders section styles
remindersSection: {
  paddingBottom: Spacing.sm,
},
reminderRow: {
  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
},
reminderRowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.borderLight },
reminderSlotLabel: { fontSize: Typography.sizes.base, color: Colors.onSurface, fontWeight: '400' },
reminderTimeTxt: {
  fontSize: Typography.sizes.sm, color: Colors.primary, fontWeight: '600',
  paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs,
  backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
  borderWidth: 0.5, borderColor: Colors.primaryBorder,
},
permDeniedTxt: {
  fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, fontStyle: 'italic',
  paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm,
},
```

---

### `app.json` — add expo-notifications plugin + aps-environment entitlement (config)

**Analog:** `app.json` itself.

**Discovery:** `@react-native-community/datetimepicker` is **already present** in `app.json` plugins (line 51). Do not add it again.

**Current plugins array** (`app.json` lines 41–53):
```json
"plugins": [
  "expo-font",
  [
    "@kingstinct/react-native-healthkit",
    { ... }
  ],
  "react-native-adapty",
  "@react-native-community/datetimepicker"
]
```

**Current entitlements** (`app.json` lines 17–20):
```json
"entitlements": {
  "com.apple.developer.healthkit": true,
  "com.apple.developer.healthkit.access": []
}
```

**Exact additions required:**

1. Append `["expo-notifications", { "sounds": [] }]` to the `plugins` array (array tuple format — string form silently ignores options).
2. Add `"aps-environment": "production"` to `ios.entitlements` (alongside existing HealthKit entitlements — do not remove them).

**Result after edit:**
```json
"plugins": [
  "expo-font",
  ["@kingstinct/react-native-healthkit", { ... }],
  "react-native-adapty",
  "@react-native-community/datetimepicker",
  ["expo-notifications", { "sounds": [] }]
],
"ios": {
  "entitlements": {
    "com.apple.developer.healthkit": true,
    "com.apple.developer.healthkit.access": [],
    "aps-environment": "production"
  }
}
```

**Verification command** (run after edit, before building):
```bash
npx expo config --type introspect
# Confirm ios.entitlements["aps-environment"] === "production" in output
```

---

### `eas.json` — production profile (config)

**Analog:** `eas.json` itself.

**Current production profile** (`eas.json` lines 18–24):
```json
"production": {
  "autoIncrement": true,
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "$EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "$EXPO_PUBLIC_SUPABASE_ANON_KEY"
  }
}
```

**No changes required.** Per RESEARCH.md (D-06 and EAS Production Build section): `autoIncrement: true` is correct; `distribution: "store"` is the default when absent for production profiles; env vars are already configured as EAS secrets. The `submit.production` section is `{}` — App Store Connect credentials (appleId, ascAppId, appleTeamId) will be entered interactively during `eas submit`.

---

## Shared Patterns

### AsyncStorage Read/Write
**Source:** `src/lib/healthkit.ts` lines 75–86, `src/screens/ProtocolScreen.tsx` lines 575–586
**Apply to:** `src/lib/notifications.ts`, `src/screens/ProtocolScreen.tsx` Reminders section

```typescript
// Load: always parse with try/catch, return typed default on failure
const raw = await AsyncStorage.getItem(KEY);
return raw ? (JSON.parse(raw) as Type) : DEFAULT;

// Save: .catch(() => null) to avoid crash on save failure
await AsyncStorage.setItem(KEY, JSON.stringify(value)).catch(() => null);
```

### Error Handling (fire-and-forget)
**Source:** `App.tsx` lines 39–51
**Apply to:** `App.tsx` reschedule useEffect, all notification scheduling calls in ProtocolScreen

```typescript
// Standalone useEffect with isolated try/catch — never mixed into init()
useEffect(() => {
  void (async () => {
    try {
      // async work here
    } catch {
      // silently ignore — non-blocking
    }
  })();
}, []);
```

### Switch Component Colors
**Source:** `src/screens/SettingsScreen.tsx` lines 188–193
**Apply to:** All 4 slot toggle Switches in ProtocolScreen Reminders section

```typescript
trackColor={{ false: Colors.borderLight, true: Colors.primaryBorder }}
thumbColor={enabled ? Colors.primary : Colors.onSurfaceMuted}
```

### Haptics on Toggle
**Source:** `src/screens/ProtocolScreen.tsx` line 532
**Apply to:** All Reminders section interactions (toggle, time tap)

```typescript
Haptics.selectionAsync().catch(() => null);
```

### StyleSheet Naming
**Source:** All screen files (CLAUDE.md rule)
**Apply to:** All new styles in ProtocolScreen and any new component

StyleSheet must be named `s` and placed at the bottom of the file. No inline styles except dynamic ones (e.g., `{ color: someVar }`). All colors from `Colors.*`, all spacing from `Spacing.*`.

---

## No Analog Found

All files in Phase 23 have analogs in the codebase. The notification scheduling functions (`scheduleSlot`, `cancelSlot`, `rescheduleAll`) and DateTimePicker usage have no codebase precedent but are fully specified in RESEARCH.md Code Examples and Architecture Patterns sections — planner should use those directly.

---

## Key Discovery: datetimepicker Already in app.json

`@react-native-community/datetimepicker` is **already registered** in `app.json` plugins (line 51). This means:
- The package may already be installed — planner should check `package.json` before running `npx expo install`.
- Do NOT add the plugin a second time to `app.json`.
- The only package that definitely needs installing is `expo-notifications`.

---

## Metadata

**Analog search scope:** `src/lib/`, `src/screens/`, `src/hooks/`, `src/types/`, `App.tsx`, `app.json`, `eas.json`
**Files scanned:** 8 (App.tsx, healthkit.ts, ProtocolScreen.tsx, SettingsScreen.tsx, useBreathing.ts, types/protocol.ts, app.json, eas.json)
**Pattern extraction date:** 2026-06-19
