---
phase: "23"
plan: "02"
subsystem: notifications
tags: [expo-notifications, app-lifecycle, foreground-banners, async-storage, typescript]

# Dependency graph
requires:
  - phase: "23-01"
    provides: "src/lib/notifications.ts with loadNotificationPrefs() and rescheduleAll() exports"
provides:
  - "App.tsx with module-scope setNotificationHandler (SDK 54 shouldShowBanner/shouldShowList API)"
  - "Reschedule useEffect that rereads @vitalspan_notification_prefs and requeues notifications on every app launch"
affects: [23-03, 23-04, ProtocolScreen notification settings UI]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Module-scope Notifications.setNotificationHandler before export default function — iOS foreground banner pattern"
    - "Isolated fire-and-forget useEffect with own try/catch for non-blocking side effects"

key-files:
  created: []
  modified:
    - App.tsx

key-decisions:
  - "setNotificationHandler placed at module scope (not inside useEffect or component) — guarantees iOS foreground banners regardless of component lifecycle timing (T-23-05)"
  - "shouldShowBanner + shouldShowList used (not shouldShowAlert) — deprecated shouldShowAlert silently broken on SDK 54 / expo-notifications 0.31+"
  - "Reschedule useEffect is isolated from init() useEffect — errors silently swallowed with empty catch; app startup routing never affected (T-23-04)"

patterns-established:
  - "Fire-and-forget notification reschedule on every app mount — cancel-all then re-queue from AsyncStorage prefs"

requirements-completed: [NTFY-04]

# Metrics
duration: 10min
completed: 2026-06-19
---

# Phase 23 Plan 02: App.tsx Notification Wiring Summary

**Module-scope setNotificationHandler with SDK 54 shouldShowBanner/shouldShowList API wired into App.tsx, plus an isolated reschedule useEffect that rereads AsyncStorage prefs and requeues all enabled notification slots on every app launch.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-06-19T00:00:00Z
- **Completed:** 2026-06-19T00:00:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Module-scope `Notifications.setNotificationHandler` call added before `export default function App()` — ensures iOS shows foreground banners when the app is open
- SDK 54-correct fields `shouldShowBanner: true` and `shouldShowList: true` used — `shouldShowAlert` (deprecated) deliberately excluded
- Isolated reschedule `useEffect` added as a second, separate hook — reads `@vitalspan_notification_prefs` via `loadNotificationPrefs()`, then calls `rescheduleAll(prefs)` to cancel and requeue all enabled slots; errors silently swallowed so app startup is never blocked
- Existing `init()` useEffect (containing `setInitialRoute` gating logic) left completely untouched
- `tsc --noEmit` passes project-wide with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add module-scope setNotificationHandler + reschedule useEffect to App.tsx** - `3d07311` (feat)

**Plan metadata:** (to be added after docs commit)

## Files Created/Modified

- `App.tsx` — Added expo-notifications import, module-scope setNotificationHandler, and isolated reschedule useEffect

## Decisions Made

- `shouldShowBanner` and `shouldShowList` used (not `shouldShowAlert`) — `shouldShowAlert` is deprecated in expo-notifications 0.31+ and silently non-functional on SDK 54
- `setNotificationHandler` placed at module scope before the component definition — must be registered before any notification can fire, independent of component lifecycle
- Reschedule useEffect has its own isolated try/catch — notification errors never propagate to the routing-gating init() useEffect (threat T-23-04 mitigated)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- App.tsx notification infrastructure is complete: foreground banners enabled, notifications rescheduled on every launch
- Plan 03 (NotificationSettingsScreen) can now wire UI to `saveNotificationPrefs` + `ensurePermission` + `scheduleSlot`/`cancelSlot` — the App.tsx layer will automatically pick up any preference changes on next launch

## Known Stubs

None — this plan is infrastructure-only (no UI components, no data rendering stubs).

## Threat Flags

No new security surface beyond what is documented in the plan's threat model. T-23-04 (reschedule error propagation) and T-23-05 (setNotificationHandler placement) are both mitigated as designed.

## Self-Check: PASSED

- [x] `App.tsx` line 16 — `import * as Notifications from 'expo-notifications'` — FOUND
- [x] `App.tsx` line 17 — `import { loadNotificationPrefs, rescheduleAll } from './src/lib/notifications'` — FOUND
- [x] `App.tsx` lines 19-26 — `Notifications.setNotificationHandler(...)` at module scope before `export default function App()` — FOUND
- [x] `shouldShowBanner: true` and `shouldShowList: true` in handler — FOUND
- [x] `shouldShowAlert` — 0 matches in App.tsx — CONFIRMED
- [x] 2 useEffect calls inside App component (lines 31, 67) — CONFIRMED
- [x] Reschedule useEffect calls `loadNotificationPrefs()` and `rescheduleAll(prefs)` inside try/catch — CONFIRMED
- [x] Existing `setInitialRoute` logic in init() useEffect — UNTOUCHED
- [x] `tsc --noEmit` — exits 0 — CONFIRMED
- [x] Commit `3d07311` — FOUND

---
*Phase: 23-notifications-and-production-build*
*Completed: 2026-06-19*
