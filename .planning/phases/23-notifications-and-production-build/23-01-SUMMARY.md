---
phase: "23"
plan: "01"
subsystem: notifications
tags: [expo-notifications, app-config, eas, push-notifications, async-storage]
dependency_graph:
  requires: []
  provides: [src/lib/notifications.ts, expo-notifications-package, aps-environment-entitlement]
  affects: [App.tsx, src/screens/ProtocolScreen.tsx, app.json]
tech_stack:
  added:
    - expo-notifications ~0.32.17
    - "@react-native-community/datetimepicker 8.4.4"
  patterns:
    - module-scope storage key constant + exported interfaces + exported async functions (healthkit.ts pattern)
    - SchedulableTriggerInputTypes.DAILY for repeating daily notifications
    - ensurePermission checks getPermissionsAsync before requestPermissionsAsync
key_files:
  created:
    - src/lib/notifications.ts
  modified:
    - package.json
    - package-lock.json
    - app.json
decisions:
  - "NOTIFICATION_PREFS_KEY = '@vitalspan_notification_prefs' (new AsyncStorage key, separate from ProtocolState)"
  - "aps-environment set to 'production' (not 'development') — required for TestFlight push"
  - "expo-notifications plugin uses array-tuple format ['expo-notifications', { 'sounds': [] }] — plain string silently ignores options"
  - "scheduleSlot uses deterministic identifier 'vitalspan-{slot}' to prevent duplicate scheduling on repeated calls"
  - "setNotificationHandler NOT called in this file — belongs at module scope in App.tsx (Plan 02)"
metrics:
  duration: "~15 minutes"
  completed: "2026-06-19"
  tasks_completed: 3
  tasks_total: 3
  files_created: 1
  files_modified: 3
---

# Phase 23 Plan 01: Notification Infrastructure Summary

**One-liner:** expo-notifications ~0.32.17 installed, app.json configured with aps-environment production entitlement and expo-notifications plugin, and `src/lib/notifications.ts` created with 9 typed exports for slot scheduling, permission, and AsyncStorage persistence.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install expo-notifications and verify datetimepicker | f35b123 | package.json, package-lock.json |
| 2 | Update app.json — expo-notifications plugin + aps-environment entitlement | 4c37ccd | app.json |
| 3 | Create src/lib/notifications.ts | 19984fd | src/lib/notifications.ts |

## What Was Built

### Task 1: Package Installation

- `expo-notifications ~0.32.17` installed via `npx expo install` (SDK 54 canonical version)
- `@react-native-community/datetimepicker 8.4.4` installed via `npx expo install` (SDK 54 compatible; 9.x is incompatible)
- Both packages installed with `npx expo install` only — never `npm install`

### Task 2: app.json Configuration

Two additions to app.json:

1. `["expo-notifications", { "sounds": [] }]` appended to plugins array (array-tuple format — plain string silently ignores options)
2. `"aps-environment": "production"` added to `ios.entitlements` alongside existing HealthKit entitlements

All existing plugins and entitlements preserved:
- `expo-font`, `@kingstinct/react-native-healthkit`, `react-native-adapty`, `@react-native-community/datetimepicker` — unchanged
- `com.apple.developer.healthkit: true` and `com.apple.developer.healthkit.access: []` — unchanged

### Task 3: src/lib/notifications.ts

Created following the `healthkit.ts` module pattern (module-scope constants, exported interfaces, exported async functions with try/catch, no default export).

Exports in order:
1. `NOTIFICATION_PREFS_KEY = '@vitalspan_notification_prefs'`
2. `NotificationPrefs` interface (4 slots, each `{ enabled: boolean; time: string }`)
3. `DEFAULT_PREFS` (all disabled, times: 08:00 / 13:00 / 18:00 / 21:00)
4. `loadNotificationPrefs()` — reads AsyncStorage, returns DEFAULT_PREFS on error
5. `saveNotificationPrefs(prefs)` — writes to AsyncStorage, swallows errors
6. `ensurePermission()` — checks existing before prompting; returns boolean
7. `scheduleSlot(slot, time)` — uses `SchedulableTriggerInputTypes.DAILY`, identifier `vitalspan-${slot}`
8. `cancelSlot(slot)` — cancels by deterministic ID
9. `rescheduleAll(prefs)` — cancel-all then reschedule enabled slots

## Verification Results

- `grep "expo-notifications" package.json` — `"expo-notifications": "~0.32.17"` confirmed
- `node -e "... console.log(j.expo.ios.entitlements['aps-environment'])"` — outputs `production`
- All 9 exports confirmed via grep
- `setNotificationHandler` — absent from this file (confirmed via grep count = 0)
- `export default` — absent (confirmed via grep count = 0)
- `npx tsc --noEmit` — exits 0, no TypeScript errors

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan creates infrastructure only (no UI components, no data rendering stubs).

## Threat Flags

No new security surface beyond what is documented in the plan's threat model. The `aps-environment: production` entitlement is the correct value; using `development` would cause silent push failures on TestFlight (T-23-04 awareness, mitigated by explicit "production" string).

## Self-Check: PASSED

- [x] `src/lib/notifications.ts` — FOUND
- [x] `app.json` aps-environment: production — FOUND
- [x] `package.json` expo-notifications ~0.32.17 — FOUND
- [x] `package.json` @react-native-community/datetimepicker 8.4.4 — FOUND
- [x] Commit f35b123 — FOUND
- [x] Commit 4c37ccd — FOUND
- [x] Commit 19984fd — FOUND
- [x] tsc --noEmit exits 0 — CONFIRMED
