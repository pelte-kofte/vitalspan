# Phase 23: Notifications & Production Build - Research

**Researched:** 2026-06-19
**Domain:** expo-notifications (local scheduling), @react-native-community/datetimepicker, EAS production build, iOS entitlements
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01: Notification Settings UI — Inline in ProtocolScreen**
- 4-slot reminder rows (Morning / Afternoon / Evening / Night) live inline in ProtocolScreen, below the streak stat row (Phase 22), above the supplement list.
- Always expanded (no accordion). All 4 rows visible on Protocol load.
- Each row: toggle switch + time display (taps open a time picker).

**D-02: Notification Preferences Storage — New AsyncStorage Key**
- Key: `@vitalspan_notification_prefs`
- Shape:
  ```typescript
  interface NotificationPrefs {
    morning:   { enabled: boolean; time: string }; // time = "HH:MM" (24h)
    afternoon: { enabled: boolean; time: string };
    evening:   { enabled: boolean; time: string };
    night:     { enabled: boolean; time: string };
  }
  ```
- Defaults: 08:00 / 13:00 / 18:00 / 21:00.
- Separate from ProtocolState — App.tsx reads this key independently.

**D-03: Permission Request — On First Toggle-On**
- Call `requestPermissionsAsync()` on first toggle.
- Granted → activate slot and schedule.
- Denied → leave toggle off; show inline message below the slot row: `"Notifications are disabled — go to Settings › Notifications to enable."` No Alert, no modal.

**D-04: Post-Update Reschedule — On Every App Launch**
- `useEffect` in App.tsx: read `@vitalspan_notification_prefs`, cancel all (`cancelAllScheduledNotificationsAsync`), reschedule enabled slots.
- Unconditional on every launch. No AppState listener needed.

**D-05: Notification Content**
- Title: `"Vitalspan Reminder"`
- Body: `"Time to take your [slot] supplements."` (slot name lower-cased)
- Trigger: `DailyTriggerInput` (repeat daily at configured hour/minute)
- Generic — no ProtocolState read at fire time.

**D-06: EAS Production Build — Manual Two-Step**
- Phase 23 configures app.json + eas.json. Two commands documented:
  ```
  eas build --platform ios --profile production
  eas submit --platform ios
  ```
- No `autoSubmit` in eas.json.

**D-07: app.json Changes Required**
- Add `expo-notifications` to `plugins` array with `{ "sounds": [] }`.
- Add `aps-environment: production` to `ios.entitlements`.
- Preserve all existing plugins and entitlements.

### Claude's Discretion
- Time picker component: `@react-native-community/datetimepicker` (planner must confirm SDK 54 compat — researched below).
- Slot-row typography and toggle style: follow existing ProtocolScreen warm-beige conventions.
- Notification identifier scheme for per-slot cancel.

### Deferred Ideas (OUT OF SCOPE)
- Remote push notifications via Supabase push tokens (v5.1+).
- Per-item notification tied to a specific supplement name.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NTFY-01 | User can independently enable/disable push notification reminders for each timing slot (Morning, Afternoon, Evening, Night) | Switch component per slot; enabled state persisted in `@vitalspan_notification_prefs`; `scheduleNotificationAsync` / `cancelScheduledNotificationAsync` per-slot |
| NTFY-02 | User can set the time for each enabled notification slot | `@react-native-community/datetimepicker` 8.4.4 in `mode="time"` display="spinner"; time stored as "HH:MM" 24h string |
| NTFY-03 | App requests notification permission on first reminder toggle; permission denial handled gracefully | `requestPermissionsAsync()` on first enable; check `status !== 'granted'`; inline denial message pattern |
| NTFY-04 | Scheduled notifications repeat daily and are rescheduled automatically after app updates | `DailyTriggerInput` with `type: SchedulableTriggerInputTypes.DAILY`; App.tsx `useEffect` calls `cancelAllScheduledNotificationsAsync` + reschedule on every launch |
| PROD-01 | app.json includes expo-notifications config plugin and `aps-environment: production` entitlement | Plugin entry format verified; entitlement path `ios.entitlements["aps-environment"]`; EAS auto-syncs to Apple Developer Portal |
| PROD-02 | EAS production build profile configured; no secrets in source; build succeeds cleanly | Existing `production` profile with `autoIncrement: true` is sufficient; `distribution: store` not required explicitly |
</phase_requirements>

---

## Summary

Phase 23 installs `expo-notifications` (SDK 54 tag: `~0.32.17`) and `@react-native-community/datetimepicker` (`8.4.4`, the version `expo install` selects for SDK 54), implements a 4-slot daily local notification system with per-slot toggle and time picker in ProtocolScreen, and configures the EAS production build for TestFlight submission.

The critical API discovery is that expo-notifications 0.32.x replaced `shouldShowAlert` with `shouldShowBanner` + `shouldShowList` in `setNotificationHandler`. Code targeting SDK 53 or earlier will silently fail to show foreground notifications if it still uses `shouldShowAlert`. The `DailyTriggerInput` trigger type (via `SchedulableTriggerInputTypes.DAILY`) is the correct repeat-daily mechanism — it does not require `repeats: true` like `CalendarTriggerInput` does.

For the production build, the existing `production` profile in eas.json (`autoIncrement: true`) is sufficient. EAS Build automatically syncs capabilities to the Apple Developer Portal when `aps-environment: production` is present in `ios.entitlements`. The expo-notifications plugin handles entitlement injection via prebuild, but explicitly setting `aps-environment: production` in `ios.entitlements` is the safe, verified approach for production builds (the plugin alone has exhibited inconsistent behavior in SDK 53+).

**Primary recommendation:** Install both packages with `npx expo install`, configure `setNotificationHandler` with `shouldShowBanner`/`shouldShowList` (not `shouldShowAlert`), use `DailyTriggerInput` for repeating daily reminders, set `aps-environment: production` explicitly in `ios.entitlements`, and run `eas build --platform ios --profile production` once credentials are provisioned.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Notification permission request | API/Native (expo-notifications) | Frontend (ProtocolScreen trigger) | iOS permission is a native OS call; UI only triggers it |
| Schedule/cancel notifications | API/Native (expo-notifications) | App.tsx (reschedule on launch) | Scheduling lives in the notification system process, not JS UI |
| Notification preference persistence | AsyncStorage (local storage) | — | Clean separation per D-02; App.tsx can read independently |
| Slot toggle + time picker UI | Frontend (ProtocolScreen) | — | Inline UI component per D-01 |
| Reschedule on update | App.tsx bootstrap effect | — | Must run before UI mounts, per D-04 |
| Production build config | app.json + eas.json (config) | EAS Build service | Entitlements declared in config; EAS syncs to Apple Portal |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-notifications | ~0.32.17 | Local notification scheduling, permission requests, daily repeating triggers | Official Expo SDK 54 package; `sdk-54` dist-tag points to 0.32.17 [VERIFIED: npm registry] |
| @react-native-community/datetimepicker | 8.4.4 | Native iOS time picker (spinner wheel) | `npx expo install` selects 8.4.4 for SDK 54; listed on docs.expo.dev/versions/v54.0.0/sdk/date-time-picker/ [VERIFIED: npm registry] |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-native-async-storage/async-storage | 2.2.0 | Persist `@vitalspan_notification_prefs` | Already in project; read/write notification preferences |
| react-native Switch | RN built-in | Per-slot toggle switch | No new import; from 'react-native' |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-native-community/datetimepicker | Custom modal with TextInput | Datetimepicker is native and accessible; TextInput is fragile for time parsing |
| DailyTriggerInput | CalendarTriggerInput (repeats: true) | DailyTriggerInput is simpler (only hour + minute); Calendar trigger is iOS-only and more complex |
| cancelAllScheduledNotificationsAsync | cancelScheduledNotificationAsync per ID | Cancel-all is safer on launch (prevents duplicates from schema drift); per-ID adds fragility |

**Installation (not yet run — for implementation phase):**
```bash
npx expo install expo-notifications @react-native-community/datetimepicker
```

**Version verification (ran during research):**
```
expo-notifications   0.32.17   (sdk-54 dist-tag, modified 2026-06-15)
@react-native-community/datetimepicker   8.4.4   (modified 2026-06-16)
```
Both packages are confirmed on npm registry at the versions `expo install` selects.

---

## Package Legitimacy Audit

> slopcheck was not available at research time. Both packages verified against official Expo documentation and npm registry. All packages tagged [VERIFIED: npm registry] based on official Expo docs confirmation.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| expo-notifications | npm | 6+ yrs | Millions/wk | github.com/expo/expo | N/A — official Expo SDK package | Approved |
| @react-native-community/datetimepicker | npm | 6+ yrs | Millions/wk | github.com/react-native-datetimepicker/datetimepicker | N/A — official React Native community package | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** none

*slopcheck was unavailable at research time. Both packages are well-established official ecosystem packages with years of history, official documentation pages on docs.expo.dev, and millions of weekly downloads. Risk of hallucination is negligible for these packages.*

---

## Architecture Patterns

### System Architecture Diagram

```
App Launch
    │
    ▼
App.tsx useEffect (mount)
    │
    ├─► read @vitalspan_notification_prefs
    │
    ├─► cancelAllScheduledNotificationsAsync()
    │
    └─► scheduleNotificationAsync() × (enabled slots)
             │
             └─► DailyTriggerInput { hour, minute }
                 identifier: "vitalspan-morning" | "vitalspan-afternoon" | "vitalspan-evening" | "vitalspan-night"

User opens ProtocolScreen
    │
    ▼
RemindersSection (always expanded)
    │
    ├─ Morning row: [Switch] [08:00 ▼]
    ├─ Afternoon row: [Switch] [13:00 ▼]
    ├─ Evening row: [Switch] [18:00 ▼]
    └─ Night row: [Switch] [21:00 ▼]
         │
         ├─ Toggle ON (first time) ──► requestPermissionsAsync()
         │       ├─ granted ──► save pref, scheduleNotificationAsync()
         │       └─ denied  ──► inline message below row (no Alert)
         │
         ├─ Toggle OFF ──► save pref, cancelScheduledNotificationAsync(id)
         │
         └─ Time tap ──► show DateTimePicker (mode="time", display="spinner")
                  └─ onChange ──► save new time, reschedule notification

iOS Notification System
    └─► fires daily at configured hour:minute
    └─► title: "Vitalspan Reminder"
        body: "Time to take your [slot] supplements."
```

### Recommended Project Structure

New files to create:
```
src/
  hooks/
    useNotificationPrefs.ts   # read/write @vitalspan_notification_prefs + schedule/cancel logic
  lib/
    notifications.ts          # scheduleSlot(), cancelSlot(), rescheduleAll() helpers
```

Existing files to modify:
```
App.tsx                        # add reschedule useEffect after existing init
src/screens/ProtocolScreen.tsx # add RemindersSection below streakRow, above ScrollView
app.json                       # add expo-notifications plugin + aps-environment entitlement
eas.json                       # verify production profile (no change needed)
```

### Pattern 1: setNotificationHandler (SDK 54+ API)

**What:** Required setup for foreground notification display on iOS. Must be called at module level (not in useEffect).

**When to use:** Top of App.tsx (module scope, outside component), before any scheduling.

**CRITICAL SDK 54 change:** `shouldShowAlert` is deprecated. Use `shouldShowBanner` + `shouldShowList` instead. Using the old API will silently fail to show foreground notifications on iOS.

```typescript
// Source: docs.expo.dev/versions/v54.0.0/sdk/notifications/
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // ← SDK 54+: was shouldShowAlert
    shouldShowList: true,     // ← SDK 54+: new required field
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

### Pattern 2: scheduleNotificationAsync with DailyTriggerInput

**What:** Schedules a repeating daily notification at a specific hour/minute.

**When to use:** When user enables a slot, and in the App.tsx reschedule effect on launch.

```typescript
// Source: docs.expo.dev/versions/v54.0.0/sdk/notifications/#schedulablenotificationtriggerinput
import * as Notifications from 'expo-notifications';

async function scheduleSlot(slot: TimeSlot, hour: number, minute: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: `vitalspan-${slot}`,   // deterministic per-slot ID
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
```

### Pattern 3: requestPermissionsAsync on first toggle

**What:** Requests iOS notification permission. Returns status object with `granted: boolean`.

**When to use:** Only when user first enables any slot (not on every toggle).

```typescript
// Source: docs.expo.dev/versions/v54.0.0/sdk/notifications/
import * as Notifications from 'expo-notifications';

async function ensurePermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
```

### Pattern 4: App.tsx reschedule useEffect

**What:** On every app launch, cancel all and reschedule from stored prefs.

**When to use:** In App.tsx, as a fire-and-forget parallel to the existing `init()` useEffect.

```typescript
// Parallel fire-and-forget (does NOT block initial route resolution)
useEffect(() => {
  void (async () => {
    try {
      const raw = await AsyncStorage.getItem('@vitalspan_notification_prefs');
      if (!raw) return;
      const prefs: NotificationPrefs = JSON.parse(raw);
      await Notifications.cancelAllScheduledNotificationsAsync();
      const slots: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night'];
      for (const slot of slots) {
        const s = prefs[slot];
        if (s.enabled) {
          const [h, m] = s.time.split(':').map(Number);
          await scheduleSlot(slot, h, m);
        }
      }
    } catch {
      // non-blocking — silently ignore errors
    }
  })();
}, []);
```

### Pattern 5: DateTimePicker for time slot (SDK 54 compatible)

**What:** Native iOS time picker wheel.

**When to use:** When user taps the time display on an enabled slot row.

```typescript
// Source: docs.expo.dev/versions/v54.0.0/sdk/date-time-picker/
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Time stored as "HH:MM"; reconstruct a Date for the picker:
function timeStringToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// Render conditionally when picker is open:
{showPicker && (
  <DateTimePicker
    mode="time"
    display="spinner"   // native wheel — best for time-only on iOS
    value={timeStringToDate(prefs[activeSlot].time)}
    onChange={(event: DateTimePickerEvent, date?: Date) => {
      if (event.type === 'set' && date) {
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        updateSlotTime(activeSlot, `${hh}:${mm}`);
      }
      setShowPicker(false);
    }}
  />
)}
```

### Pattern 6: app.json plugin + entitlement (exact JSON)

```json
// In app.json — additions only; preserve all existing fields
{
  "expo": {
    "plugins": [
      "expo-font",
      ["@kingstinct/react-native-healthkit", { ... }],
      "react-native-adapty",
      ["expo-notifications", { "sounds": [] }]
    ],
    "ios": {
      "entitlements": {
        "com.apple.developer.healthkit": true,
        "com.apple.developer.healthkit.access": [],
        "aps-environment": "production"
      }
    }
  }
}
```

### Anti-Patterns to Avoid

- **Using `shouldShowAlert` in setNotificationHandler:** Deprecated in expo-notifications 0.31+. Silently broken on SDK 54. Use `shouldShowBanner` + `shouldShowList`.
- **Installing `@react-native-community/datetimepicker@9.x` (latest):** `expo install` selects 8.4.4 for SDK 54. v9.x is incompatible — issue #1034 documents `RNDateTimePicker` rendering as "Unimplemented component". Always use `npx expo install`, not `npm install`.
- **Calling scheduleNotificationAsync without setNotificationHandler:** Notification fires but is never shown when app is in foreground on iOS.
- **Omitting `identifier` from scheduleNotificationAsync:** Without a deterministic ID, each launch creates duplicate scheduled notifications that accumulate.
- **Fire-and-forget reschedule in the same init() function:** The existing `init()` in App.tsx gates `setInitialRoute` — any async error in it blocks the loading spinner. The reschedule effect must be a separate, isolated `useEffect` with its own try/catch.
- **Putting `aps-environment: development` in production builds:** The production EAS build must have `aps-environment: production`. The development value causes silent push failures on TestFlight.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Daily repeating notifications | Custom JS timer / setTimeout loop | `DailyTriggerInput` in expo-notifications | Native OS scheduling survives app restarts, background kills, iOS low-power mode |
| Time picker UI | TextInput for "HH:MM" with regex validation | `@react-native-community/datetimepicker` mode="time" | Native picker handles AM/PM locale, accessibility, and 24h/12h system setting automatically |
| Permission state tracking | AsyncStorage boolean flag | `getPermissionsAsync()` + `requestPermissionsAsync()` | iOS permission state can change in Settings; always query OS, never trust cached flag |
| EAS credential management | Manual `.p8` key + provision profile in repo | `eas credentials` command | EAS manages cert rotation, team IDs, and Apple portal sync automatically |

**Key insight:** Notification scheduling is OS-level infrastructure. The OS queues, fires, and delivers notifications even if the app is killed. Custom JS solutions cannot replicate this.

---

## Common Pitfalls

### Pitfall 1: shouldShowAlert deprecated in SDK 54

**What goes wrong:** Foreground notifications are scheduled and fire (you can see them in the notification center) but no banner appears while the app is open.

**Why it happens:** `shouldShowAlert` was deprecated in expo-notifications 0.31.0. On SDK 54, the property is ignored. `shouldShowBanner` + `shouldShowList` are the replacements.

**How to avoid:** Always use:
```typescript
{ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }
```

**Warning signs:** Notification center fills up but no foreground banners appear during testing.

### Pitfall 2: @react-native-community/datetimepicker version mismatch

**What goes wrong:** `RNDateTimePicker` renders as "Unimplemented component" error text on device.

**Why it happens:** The latest npm version (9.x) is incompatible with Expo SDK 54. `expo install` must be used — it selects `8.4.4` via the Expo SDK version resolution table.

**How to avoid:** Run `npx expo install @react-native-community/datetimepicker` (not `npm install`). Verify package.json shows `8.4.4`.

**Warning signs:** Picker area shows error text or blank space instead of the wheel UI.

### Pitfall 3: Duplicate scheduled notifications accumulating

**What goes wrong:** After multiple app launches, the user receives 2–4 copies of each reminder notification at the same time.

**Why it happens:** Each launch reschedules without canceling, and without a deterministic `identifier`, each call creates a new notification entry.

**How to avoid:** (a) Always call `cancelAllScheduledNotificationsAsync()` before rescheduling in App.tsx. (b) Always pass a deterministic `identifier: "vitalspan-${slot}"` to `scheduleNotificationAsync`. This is idempotent — rescheduling with the same ID replaces the existing entry.

**Warning signs:** Multiple duplicate banners fire simultaneously.

### Pitfall 4: aps-environment entitlement missing in production build

**What goes wrong:** App builds successfully but push notifications (even local ones after an EAS update) fail to fire on physical devices from TestFlight.

**Why it happens:** In expo-notifications 0.31+, the plugin no longer unconditionally injects `aps-environment`. Without it in `ios.entitlements`, Apple's codesigning rejects the entitlement at runtime.

**How to avoid:** Explicitly set `"aps-environment": "production"` in `ios.entitlements` in app.json. Verify with `npx expo config --type introspect` that it appears in the `ios.entitlements` object before building.

**Warning signs:** `eas build` log shows entitlement warnings; `codesign -d --entitlements` on the .app shows `aps-environment` absent.

### Pitfall 5: expo-notifications plugin added as string instead of array

**What goes wrong:** Custom sounds config (or any plugin options) silently ignored; prebuild may produce unexpected entitlement behavior.

**Why it happens:** `"expo-notifications"` (string) skips the config object. The plugin must be `["expo-notifications", { "sounds": [] }]` (array tuple).

**How to avoid:** Use the array format per D-07. Verify with `npx expo config --type prebuild`.

**Warning signs:** No explicit error — the plugin options are just ignored.

### Pitfall 6: Reschedule effect blocking app init

**What goes wrong:** If reschedule code throws and is in the same `init()` function as routing, the loading spinner never resolves.

**Why it happens:** The existing `init()` in App.tsx gates `setInitialRoute`. Any unhandled error blocks it.

**How to avoid:** The reschedule logic must be a **separate** `useEffect` with its own `try/catch`, fire-and-forget pattern. It MUST NOT be inserted into the existing `init()` function.

**Warning signs:** App hangs on loading spinner after enabling/disabling notifications.

---

## Code Examples

### Complete reschedule helper (for `src/lib/notifications.ts`)

```typescript
// Source: docs.expo.dev/versions/v54.0.0/sdk/notifications/
import * as Notifications from 'expo-notifications';
import { TimeSlot } from '../types/protocol';

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

export const SLOT_LABELS: Record<TimeSlot, string> = {
  morning:   'morning',
  afternoon: 'afternoon',
  evening:   'evening',
  night:     'night',
};

function notifId(slot: TimeSlot): string {
  return `vitalspan-${slot}`;
}

export async function scheduleSlot(slot: TimeSlot, time: string): Promise<void> {
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    identifier: notifId(slot),
    content: {
      title: 'Vitalspan Reminder',
      body: `Time to take your ${SLOT_LABELS[slot]} supplements.`,
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

### setNotificationHandler at App.tsx module scope

```typescript
// Source: docs.expo.dev/versions/v54.0.0/sdk/notifications/
// Place BEFORE the App component definition, at module level
import * as Notifications from 'expo-notifications';

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

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `shouldShowAlert: true` in setNotificationHandler | `shouldShowBanner: true, shouldShowList: true` | expo-notifications 0.31.0 (SDK 53) | Old code silently shows no foreground banners |
| expo-notifications plugin auto-injects `aps-environment` | Developer must explicitly set `aps-environment` in `ios.entitlements` | SDK 51+ | Without explicit set, production push entitlement may be absent |
| CalendarTriggerInput with `repeats: true` for daily | `DailyTriggerInput` with `type: SchedulableTriggerInputTypes.DAILY` | SDK 51+ | DailyTriggerInput is the canonical daily trigger; Calendar is iOS-only |

**Deprecated/outdated:**
- `shouldShowAlert`: Ignored in 0.31+; replaced by `shouldShowBanner` + `shouldShowList`.
- `removePushTokenSubscription` / `removeNotificationSubscription`: Deprecated in 0.31.0; use the return value of `addNotificationReceivedListener` directly to call `.remove()`.

---

## Critical Q&A (Answers to Specific Research Questions)

### Q1: expo-notifications version for Expo SDK ~54.0.35

**Answer:** `~0.32.17`. [VERIFIED: npm registry]

The `sdk-54` dist-tag on npm resolves to `0.32.17` (modified 2026-06-15). `npx expo install expo-notifications` will install `~0.32.17`. This is the canonical version for SDK 54.

### Q2: DailyTriggerInput availability in 0.32.x

**Answer:** Confirmed available. [VERIFIED: docs.expo.dev/versions/v54.0.0/sdk/notifications/]

```typescript
{
  type: Notifications.SchedulableTriggerInputTypes.DAILY,
  hour: number,   // 0–23
  minute: number, // 0–59
  channelId?: string, // Android only — omit for iOS
}
```

The `SchedulableTriggerInputTypes` enum exports: `TIME_INTERVAL`, `DATE`, `CALENDAR`, `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`. `DAILY` is the correct value.

### Q3: @react-native-community/datetimepicker for SDK 54

**Answer:** Use version `8.4.4`. Do NOT use `9.x`. [VERIFIED: npm registry + expo.dev docs]

`npx expo install @react-native-community/datetimepicker` selects `8.4.4`. Version 9.x is incompatible with SDK 54 (renders as "Unimplemented component" on device — confirmed in github.com/react-native-datetimepicker/datetimepicker/issues/1034). The package is listed on docs.expo.dev as "Included in Expo Go" for SDK 54.

### Q4: cancelAllScheduledNotificationsAsync

**Answer:** Confirmed correct API. [VERIFIED: docs.expo.dev/versions/v54.0.0/sdk/notifications/]

```typescript
await Notifications.cancelAllScheduledNotificationsAsync();
// Returns Promise<void>. Removes all scheduled notifications system-wide for this app.
```

This is the correct function for the App.tsx reschedule pattern (cancel-then-reschedule on every launch).

### Q5: requestPermissionsAsync API shape

**Answer:** Confirmed. [VERIFIED: docs.expo.dev/versions/v54.0.0/sdk/notifications/]

```typescript
const { status } = await Notifications.requestPermissionsAsync();
// status: 'granted' | 'denied' | 'undetermined'
// Also available: granted (boolean), canAskAgain (boolean)
// iOS-specific: ios.status (IosAuthorizationStatus enum)
```

Pattern for first-toggle permission:
```typescript
const { status: existing } = await Notifications.getPermissionsAsync();
if (existing !== 'granted') {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    // show inline denial message
    return;
  }
}
```

### Q6: aps-environment placement in app.json

**Answer:** `ios.entitlements["aps-environment"]` set to `"production"`. [VERIFIED: docs.expo.dev/build-reference/ios-capabilities/ + github.com/expo/expo/issues/37101]

Exact JSON path:
```json
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.developer.healthkit": true,
        "com.apple.developer.healthkit.access": [],
        "aps-environment": "production"
      }
    }
  }
}
```

EAS Build auto-syncs this capability to Apple Developer Portal on first build. No manual portal step required. `distribution: store` does NOT need to be added to eas.json — the existing `production` profile with `autoIncrement: true` is correct for App Store/TestFlight.

### Q7: expo-notifications plugin format in app.json

**Answer:** Array tuple format required when passing options. [VERIFIED: docs.expo.dev/versions/v54.0.0/sdk/notifications/]

```json
["expo-notifications", { "sounds": [] }]
```

Options: `icon` (Android), `color` (Android), `sounds` (custom sound files array), `enableBackgroundRemoteNotifications` (false = local only, which is correct for this phase).

### Q8: Notification identifier scheme

**Answer:** `"vitalspan-morning"`, `"vitalspan-afternoon"`, `"vitalspan-evening"`, `"vitalspan-night"` [ASSUMED — reasonable scheme following app prefix convention]

These deterministic IDs allow both `cancelAllScheduledNotificationsAsync` (launch reschedule) and `cancelScheduledNotificationAsync(id)` (per-slot toggle-off) to work correctly. The identifiers match the `TimeSlot` type values with the app prefix.

---

## Insertion Point: ProtocolScreen Streak Row

The streak row is at line 849–859 of `src/screens/ProtocolScreen.tsx`:

```tsx
{/* Phase 22: Streak stat row */}
<View style={s.streakRow}>
  ...
</View>

<ScrollView ...>   {/* ← Reminders section goes BETWEEN streakRow and this ScrollView */}
```

The Reminders section must be placed between the closing `</View>` of `streakRow` (line 859) and the opening `<ScrollView>` (line 861). It lives outside the ScrollView so it is always visible without scrolling.

---

## EAS Production Build — Verified Configuration

### Current eas.json production profile (no changes needed):

```json
"production": {
  "autoIncrement": true,
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "$EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "$EXPO_PUBLIC_SUPABASE_ANON_KEY"
  }
}
```

`distribution: "store"` is NOT required — when absent, EAS defaults to store distribution for production profiles. `autoIncrement: true` is equivalent to `autoIncrement: "buildNumber"` — it bumps the iOS build number automatically. Both env vars are injected from EAS secrets (already configured in previous phases).

### Build commands (documented, not yet run):

```bash
# Step 1: Build (credentials provisioned via eas credentials if needed)
eas build --platform ios --profile production

# Step 2: Submit to App Store Connect
eas submit --platform ios

# Verify entitlements before building:
npx expo config --type introspect
# Check output for ios.entitlements["aps-environment"] === "production"
```

### First-build credential setup (if not already provisioned):

EAS will prompt for Apple ID + team during `eas build`. It will auto-generate or use existing:
- Distribution Certificate
- App Store provisioning profile (includes push notification entitlement when aps-environment is set)

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Notification identifier scheme `"vitalspan-${slot}"` | Critical Q&A Q8 | Low — any deterministic string works; the scheme is a style choice |
| A2 | The reschedule useEffect should be a separate useEffect from the existing init() | Architecture Patterns | Medium — if combined incorrectly, could block routing; separate is definitively safer |
| A3 | `distribution: store` defaulted for production profile when absent | EAS Production Build | Low — documented behavior; current profile has been used for previous builds without issue |

---

## Open Questions

1. **Apple Developer credentials provisioned?**
   - What we know: EAS project ID `4d42a8cb-bf83-4229-82a5-1b2273356a54` exists; previous builds ran.
   - What's unclear: Whether a distribution certificate + provisioning profile with push notification entitlement already exists in EAS, or if `eas credentials` will need to be run.
   - Recommendation: Plan should include a checkpoint — run `eas credentials` to verify/generate before `eas build --profile production`.

2. **Apple Developer team ID for submit config**
   - What we know: `submit.production` in eas.json is `{}`.
   - What's unclear: `eas submit` may prompt for `appleId`, `ascAppId`, `appleTeamId` if not in eas.json.
   - Recommendation: Document in plan that these will be entered interactively during `eas submit`, OR user can pre-populate them in eas.json submit section.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| EAS CLI | eas build + eas submit | ✓ | 20.0.0 (20.1.0 available) | — |
| Node.js | EAS CLI, expo install | ✓ | v25.9.0 | — |
| expo-notifications | Notification scheduling | Not yet in package.json | ~0.32.17 | None — install step in Wave 1 |
| @react-native-community/datetimepicker | Time picker UI | Not yet in package.json | 8.4.4 | None — install step in Wave 1 |
| Physical iOS device | Push notification testing | [ASSUMED] available | — | Simulator can't receive push |
| Apple Developer account | EAS production build | [ASSUMED] active | — | None — required for TestFlight |

**Missing dependencies with no fallback:**
- `expo-notifications` — must be installed in Wave 1 before any notification code is written.
- `@react-native-community/datetimepicker` — must be installed in Wave 1 before time picker UI.

**EAS CLI version note:** 20.0.0 is installed; 20.1.0 is available. Not a blocking issue — existing version is functional.

---

## Security Domain

> Applying to this phase.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (time string parsing) | Validate "HH:MM" format before splitting; clamp hour 0–23, minute 0–59 |
| V6 Cryptography | no | — |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed time string in NotificationPrefs | Tampering | Parse with try/catch; clamp values to valid range before scheduling |
| API key leak via EAS env | Information Disclosure | Only `EXPO_PUBLIC_*` prefix vars are bundled into app; Supabase keys already use this pattern — no new secrets added in Phase 23 |

---

## Sources

### Primary (HIGH confidence)
- [docs.expo.dev/versions/v54.0.0/sdk/notifications/](https://docs.expo.dev/versions/v54.0.0/sdk/notifications/) — DailyTriggerInput type, SchedulableTriggerInputTypes enum, requestPermissionsAsync, cancelAllScheduledNotificationsAsync, setNotificationHandler NotificationBehavior (shouldShowBanner/shouldShowList)
- [npm registry sdk-54 dist-tag](https://www.npmjs.com/package/expo-notifications) — expo-notifications 0.32.17 verified as SDK 54 canonical version
- [npm registry @react-native-community/datetimepicker](https://www.npmjs.com/package/@react-native-community/datetimepicker) — 8.4.4 verified via expo install resolution for SDK 54
- [docs.expo.dev/build-reference/ios-capabilities/](https://docs.expo.dev/build-reference/ios-capabilities/) — EAS auto-syncs aps-environment entitlement from ios.entitlements
- [docs.expo.dev/versions/v54.0.0/sdk/date-time-picker/](https://docs.expo.dev/versions/v54.0.0/sdk/date-time-picker/) — datetimepicker included in Expo Go for SDK 54

### Secondary (MEDIUM confidence)
- [github.com/expo/expo/issues/37101](https://github.com/expo/expo/issues/37101) — aps-environment must be explicitly set in ios.entitlements for expo-notifications 0.31+
- [expo-notifications CHANGELOG](https://github.com/expo/expo/blob/main/packages/expo-notifications/CHANGELOG.md) — shouldShowAlert deprecated in 0.31.0; DailyTriggerInput unchanged in 0.32.x

### Tertiary (LOW confidence)
- [github.com/react-native-datetimepicker/datetimepicker/issues/1034](https://github.com/react-native-datetimepicker/datetimepicker/issues/1034) — v9.x incompatible with SDK 54 (RNDateTimePicker unimplemented); used to confirm 8.4.4 is the correct version [corroborated by expo install resolution]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — both packages verified on npm registry via `expo install` resolution and official docs
- Architecture: HIGH — all APIs confirmed against official SDK 54 docs; insertion point located in actual source file
- Pitfalls: HIGH for API pitfalls (verified by changelog + GitHub issues); MEDIUM for EAS credential flow (env-specific, [ASSUMED])

**Research date:** 2026-06-19
**Valid until:** 2026-07-19 (stable ecosystem; expo-notifications SDK 54 locked)
