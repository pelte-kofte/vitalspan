# Phase 23: Notifications & Production Build - Context

**Gathered:** 2026-06-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Install `expo-notifications`, add the `aps-environment: production` entitlement to `app.json`, and implement a 4-slot (Morning / Afternoon / Evening / Night) local push notification system for the Protocol screen. Each slot has an independent toggle and a time picker; preferences are stored in a new AsyncStorage key. Notifications are rescheduled on every app launch so they survive EAS updates. Permission is requested on first toggle-on; denial shows an inline plain-language message. Phase ends with a successful `eas build --platform ios --profile production` that installs on a physical device via TestFlight.

</domain>

<decisions>
## Implementation Decisions

### D-01: Notification Settings UI — Inline in ProtocolScreen
- The 4-slot reminder UI lives **inline in ProtocolScreen**, not in a new screen or ProfileScreen.
- Placement: **below the streak stat row** (Phase 22, D-03), **above the supplement list**.
- Layout: 4 always-visible rows — Morning / Afternoon / Evening / Night — each with a toggle switch and, when enabled, a time display that opens a time picker on tap.
- Section is **always expanded** (no collapse/accordion). All 4 rows visible on Protocol load.

### D-02: Notification Preferences Storage — New AsyncStorage Key
- Store slot prefs in a new key: `@vitalspan_notification_prefs`
- Shape:
  ```typescript
  interface NotificationPrefs {
    morning:   { enabled: boolean; time: string }; // time = "HH:MM" (24h)
    afternoon: { enabled: boolean; time: string };
    evening:   { enabled: boolean; time: string };
    night:     { enabled: boolean; time: string };
  }
  ```
- Default times (user-confirmed): Morning 08:00, Afternoon 13:00, Evening 18:00, Night 21:00.
- Clean separation from ProtocolState — App.tsx can read this key independently for reschedule without loading the full protocol.

### D-03: Permission Request — On First Toggle-On
- When the user enables a slot for the first time, call `expo-notifications` `requestPermissionsAsync()`.
- If granted → activate the slot and schedule the notification.
- If denied → leave the toggle off; show an inline plain-language message **below the slot row**:
  `"Notifications are disabled — go to Settings › Notifications to enable."`
- No Alert dialog, no modal — inline only. No crash or broken UI state.

### D-04: Post-Update Reschedule — On Every App Launch
- A `useEffect` in `App.tsx` runs on mount, reads `@vitalspan_notification_prefs`, cancels all scheduled notifications (`cancelAllScheduledNotificationsAsync`), then reschedules only the enabled slots.
- Runs unconditionally on every launch — keeps notifications fresh after any EAS update.
- No AppState listener needed for this phase.

### D-05: Notification Content
- Title: `"Vitalspan Reminder"`
- Body: `"Time to take your morning supplements."` (slot name lower-cased, filled in at schedule time)
- Trigger: `DailyTriggerInput` (repeat daily at configured hour/minute)
- Generic content — no runtime ProtocolState read at notification fire time.

### D-06: EAS Production Build — Manual Two-Step
- Phase 23 configures `app.json` and `eas.json` correctly; the plan documents the two commands:
  ```
  eas build --platform ios --profile production
  eas submit --platform ios
  ```
- No `autoSubmit` in `eas.json`. Manual submission preserves the ability to inspect the build before sending to App Store Connect.
- The phase must include verifying that `eas build` succeeds without entitlement errors (SC#1).

### D-07: app.json Changes Required
- Add `expo-notifications` to `plugins` array (with config: `{ "sounds": [] }` for silent system sounds).
- Add `aps-environment: production` to `ios.entitlements` alongside the existing HealthKit entitlement.
- The `@kingstinct/react-native-healthkit` and `react-native-adapty` plugins are already present — do not remove them.

### Claude's Discretion
- Time picker component: use the standard `@react-native-community/datetimepicker` (already common in Expo projects — planner to confirm Expo SDK 54 compatibility, or use a time-input modal if not available).
- Exact slot-row typography and toggle style — follow existing ProtocolScreen design conventions (warm-beige palette, `Spacing.*`, `Colors.*` from theme).
- Identifier scheme for scheduled notifications (e.g., `"vitalspan-morning"`) — planner decides.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Protocol Types (notification consumers)
- `src/types/protocol.ts` — `TimeSlot` type (`'morning' | 'afternoon' | 'evening' | 'night'`) and `ProtocolState` — notification slots map directly to TimeSlot values; Phase 23 notification consumers are documented here

### App Entry Point (reschedule hook)
- `App.tsx` — existing bootstrap `useEffect` pattern for async init; Phase 23 adds a parallel reschedule effect here

### App Configuration
- `app.json` — existing entitlements (`com.apple.developer.healthkit`) and plugins (`expo-font`, `@kingstinct/react-native-healthkit`, `react-native-adapty`); Phase 23 adds `expo-notifications` plugin and `aps-environment: production` entitlement
- `eas.json` — existing `development` / `preview` / `production` build profiles; EAS project ID `4d42a8cb-bf83-4229-82a5-1b2273356a54` already in `app.json`

### Existing Protocol Screen
- `src/screens/ProtocolScreen.tsx` — where the Reminders section goes (below streak row, above supplement list); existing streak row from Phase 22 is the anchor

### Phase 22 CONTEXT.md (streak row anchor for placement)
- `.planning/phases/22-engagement-and-visualization/22-CONTEXT.md` — D-03 defines the streak stat row layout that Phase 23 Reminders section sits below

### ROADMAP.md Success Criteria
- `.planning/ROADMAP.md` §Phase 23 — 5 success criteria; SC#1 (aps-environment entitlement), SC#2 (permission UX), SC#3 (per-slot toggle + time picker), SC#4 (auto-reschedule after update), SC#5 (TestFlight install + full user flow)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TimeSlot` type (`src/types/protocol.ts:19`) — the 4 notification slots map exactly to the 4 existing TimeSlot values; reuse this type for slot keys in `NotificationPrefs`
- `ProtocolScreen.tsx` streak stat row (Phase 22) — the insertion point for the Reminders section; planner should locate the streak row JSX and insert Reminders directly below it
- `App.tsx` bootstrap `useEffect` — existing pattern for async AsyncStorage reads on mount; the reschedule effect follows the same pattern

### Established Patterns
- AsyncStorage key naming: `@vitalspan_*` prefix (MUST follow — preserve existing keys)
- All colors from `src/theme/index.ts` — no hardcoded hex values
- All spacing from `Spacing.*` — no hardcoded margin/padding numbers
- StyleSheet at bottom of every file, named `s`
- TypeScript strict — no `any`

### Integration Points
- `App.tsx` — Phase 23 adds a `useEffect` that reads `@vitalspan_notification_prefs` and calls `expo-notifications` schedule on launch
- `ProtocolScreen.tsx` — Phase 23 inserts a Reminders section (4 slot rows) below the streak stat row
- `app.json` — needs `expo-notifications` plugin entry and `aps-environment: production` entitlement
- `eas.json` — already has `production` profile; may need minor updates (e.g., channel or credentials config)

### Known Constraints
- `expo-notifications` requires a **physical device** for push testing — simulator cannot receive push notifications (noted in STATE.md)
- `expo-notifications` must be compatible with Expo SDK ~54 — planner must verify the correct package version before installing

</code_context>

<specifics>
## Specific Ideas

- The Reminders section is always expanded (not collapsible) — 4 slot rows always visible on ProtocolScreen load.
- Notification body uses the slot name lower-cased inline: `"Time to take your evening supplements."`
- Default times are hardcoded in `NotificationPrefs` default object: 08:00 / 13:00 / 18:00 / 21:00.
- When user denies permission, the inline message appears below the slot row — no Alert, no navigation, no modal.

</specifics>

<deferred>
## Deferred Ideas

- Remote push notifications via Supabase push tokens — deferred to v5.1+ (confirmed in STATE.md deferred items)
- Per-item notification (reminder tied to a specific supplement name) — deferred; generic slot reminder is sufficient for v5.0

</deferred>

---

*Phase: 23-notifications-and-production-build*
*Context gathered: 2026-06-19*
