---
phase: 10-apple-health-and-articles
plan: "03"
subsystem: healthkit-ui
tags: [healthkit, permissions, longevity-score, profile, ux]
dependency_graph:
  requires: [10-01]
  provides: [permission-state-machine-ui, disconnect-health-capability]
  affects:
    - src/screens/LongevityScoreScreen.tsx
    - src/screens/ProfileScreen.tsx
tech_stack:
  added: []
  patterns:
    - three-state permission machine (pre-request / granted / denied)
    - HRV empty-read heuristic for iOS denial detection
    - promptOpacity shared value fade-in (withTiming 400ms)
    - AsyncStorage.multiRemove for atomic health data clear
key_files:
  created: []
  modified:
    - src/screens/LongevityScoreScreen.tsx
    - src/screens/ProfileScreen.tsx
decisions:
  - "permissionState derived from loadPermissionStatus() hasRequestedHealthKit flag on every focus — ensures ProfileScreen disconnect is reflected immediately on next LongevityScore open"
  - "handleDismissPrompt sets permissionState to 'granted' (not a separate dismissed state) — empty orbitals with no prompt is equivalent to granted with no data, per plan spec"
  - "handleRequestPermission reads HRV after connectAndSync() to determine grant vs denial — iOS privacy design prevents direct denial status reporting"
  - "isConnected kept as derived const (permissionState === 'granted') for backward compat with bioConfidence calculation"
  - "isDemoMode badge references removed from orb and metric grid — real healthkit.ts never sets isDemoMode: true"
metrics:
  duration: ~12 min
  completed: "2026-06-03"
  tasks_completed: 2
  files_changed: 2
---

# Phase 10 Plan 03: HealthKit UI Permission Flow Summary

**One-liner:** Three-state HealthKit permission machine (pre-request/granted/denied) on LongevityScoreScreen with animated prompt cards and Open Settings deep-link, plus Disconnect Apple Health destructive row on ProfileScreen.

## What Was Built

### Task 1: LongevityScoreScreen — Three-State Permission Flow

Replaced the single `isConnected` boolean with a full `permissionState: 'pre-request' | 'granted' | 'denied' | 'loading'` state machine. The `loadAll()` function now reads `loadPermissionStatus()` and derives state:

- **State A (pre-request):** `hasRequestedHealthKit` absent or false — renders a prompt card with watch icon, "Connect Apple Health" headline, body copy, and a full-width green CTA button. Card fades in via `promptOpacity` shared value with `withTiming(1.0, { duration: 400 })`.
- **State B (granted):** Existing `healthKitCardConnected` card preserved unchanged for resync. `loadHealthData()` called to populate orbitals immediately without re-requesting permissions.
- **State C (denied):** Empty HRV reads after `initHealthKit` → renders denied card with warning glyph, "Apple Health access needed" headline, "Open Settings" CTA (calls `Linking.openURL('app-settings:')`), and "Continue without Health data" secondary dismiss link.

`handleRequestPermission()` calls `requestHealthKitPermissions()` (Plan 01 real implementation), then `connectAndSync()`, then checks `data.hrv`. Non-null HRV = granted; null HRV = denied (iOS empty-read heuristic). Persists result to `@vitalspan_health_permissions` AsyncStorage key.

`isDemoMode` badge references removed from both the orbital data orb and metric grid — the real healthkit.ts from Plan 01 never sets `isDemoMode: true`, so the fields were dead code.

All copy matches the copywriting contract in 10-UI-SPEC.md exactly.

### Task 2: ProfileScreen — Disconnect Apple Health Row

Added `healthConnected` state variable loaded from `loadPermissionStatus()` on every focus event. When `healthConnected === true`, a `disconnectCard` row renders between the About card and the bottom spacer with label "Disconnect Apple Health" in `Colors.danger`.

Tap sequence: Haptic Medium → `Alert.alert` with "Keep Connected" (cancel) and "Disconnect Health" (destructive). Confirming calls `handleDisconnect()` which runs `AsyncStorage.multiRemove(['@vitalspan_health_permissions', '@vitalspan_health_data'])` and sets `healthConnected(false)` — row disappears immediately.

T-10-07 threat (HealthData in AsyncStorage after disconnect) mitigated: both keys cleared atomically via `multiRemove`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Upgrade LongevityScoreScreen with three-state permission flow | 4fa000f | src/screens/LongevityScoreScreen.tsx |
| 2 | Add Disconnect Apple Health row to ProfileScreen | ebcbbad | src/screens/ProfileScreen.tsx |

## Deviations from Plan

None — plan executed exactly as written.

Minor implementation note: `handleRequestPermission` calls `connectAndSync()` (which also calls `requestHealthKitPermissions` internally) rather than first calling `requestHealthKitPermissions` then `loadHealthData` separately. This is equivalent behavior — `connectAndSync` performs the full permission + sync flow and returns data in one call. The HRV probe pattern is identical.

## Verification Results

All 4 plan verification checks passed:
1. `npx tsc --noEmit` — exits 0
2. `grep -c "permissionState" LongevityScoreScreen.tsx` — output: 6
3. `grep -c "app-settings:" LongevityScoreScreen.tsx` — output: 1
4. `grep -c "Disconnect Apple Health" ProfileScreen.tsx` — output: 2

All acceptance criteria passed:
- LongevityScoreScreen contains `permissionState` typed as four-variant union
- File contains "Connect Apple Health" as string literal (State A)
- File contains "Apple Health access needed" (State C)
- File contains "app-settings:" deep-link
- File contains "Continue without Health data" dismiss link
- File contains `Linking.openURL` usage
- File does NOT contain `isDemoMode: true`
- ProfileScreen contains `healthConnected` state variable
- ProfileScreen contains "Disconnect Apple Health" string literal
- ProfileScreen contains Alert with "Disconnect Health" destructive button
- ProfileScreen contains `multiRemove(['@vitalspan_health_permissions', '@vitalspan_health_data'])`
- ProfileScreen contains `Colors.danger` on disconnect row text
- `tsc --noEmit` exits 0

## Known Stubs

None. All three permission states render real UI driven by real AsyncStorage state. No hardcoded values or placeholder text.

## Threat Flags

No new threat surface introduced beyond what was modeled in the plan's `<threat_model>`:
- T-10-07 (HealthData in AsyncStorage after disconnect): mitigated — `handleDisconnect` uses `AsyncStorage.multiRemove` to clear both keys atomically
- T-10-08 (iOS denial spoofing via empty reads): accepted per plan — empty HRV heuristic is Apple's recommended pattern

## Self-Check: PASSED

- [x] `src/screens/LongevityScoreScreen.tsx` modified with three-state flow
- [x] `src/screens/ProfileScreen.tsx` modified with disconnect row
- [x] Commit `4fa000f` exists in git log (Task 1)
- [x] Commit `ebcbbad` exists in git log (Task 2)
