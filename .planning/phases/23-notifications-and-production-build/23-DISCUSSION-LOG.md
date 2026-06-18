# Phase 23: Notifications & Production Build - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-19
**Phase:** 23-notifications-and-production-build
**Areas discussed:** Settings UI placement, Permission denial UX, Post-update reschedule trigger, EAS submission

---

## Settings UI Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Inline section in ProtocolScreen | Below streak row, above supplement list — no new screen needed | ✓ |
| New NotificationSettingsScreen | Dedicated screen reachable from Protocol header or Profile | |
| Section in ProfileScreen | Notifications as a Profile settings section | |

**User's choice:** Inline section in ProtocolScreen

### Placement within ProtocolScreen

| Option | Description | Selected |
|--------|-------------|----------|
| Below streak row, above supplement list | Visible without scrolling, in header area | ✓ |
| Collapsible footer at bottom | Below supplement/medication lists | |
| Behind a bell icon button in header | Hidden behind icon tap | |

**User's choice:** Below the streak row, above supplement list

### Expansion state

| Option | Description | Selected |
|--------|-------------|----------|
| Collapsed by default | Summary row showing '0 active', expands on tap | |
| Always expanded | 4 slot rows always visible on Protocol load | ✓ |

**User's choice:** Always expanded

---

## Permission Denial UX

| Option | Description | Selected |
|--------|-------------|----------|
| Inline plain-language message | Below the denied slot: "Notifications are disabled — go to Settings › Notifications to enable." | ✓ |
| Alert dialog directing to Settings | Alert.alert() with 'Go to Settings' button | |
| Silently leave toggle off | No explanation shown | |

**User's choice:** Inline plain-language message below the denied slot

### Permission request timing

| Option | Description | Selected |
|--------|-------------|----------|
| On first slot toggle-on | Requested at the moment user enables any slot for the first time | ✓ |
| On Protocol screen mount if any slot is enabled | Proactive request on load | |

**User's choice:** On first slot toggle-on

---

## Post-Update Reschedule Trigger

| Option | Description | Selected |
|--------|-------------|----------|
| On every app launch in App.tsx | useEffect on mount: cancel-all + reschedule from prefs | ✓ |
| On every app foreground (AppState listener) | More overhead, handles time zone changes | |

**User's choice:** On every app launch in App.tsx

### Notification preferences storage

| Option | Description | Selected |
|--------|-------------|----------|
| New AsyncStorage key @vitalspan_notification_prefs | Clean separation from ProtocolState | ✓ |
| Add fields to ProtocolState (@vitalspan_protocol) | Piggyback on existing key | |

**User's choice:** New AsyncStorage key `@vitalspan_notification_prefs`

---

## EAS Submission

| Option | Description | Selected |
|--------|-------------|----------|
| Manual: eas build + eas submit separately | Two commands, full control before submitting | ✓ |
| Automated: configure eas.json autoSubmit | Auto-submit after successful build | |

**User's choice:** Manual two-step process

### Default slot times

| Option | Description | Selected |
|--------|-------------|----------|
| 8am / 1pm / 6pm / 9pm | Morning: 08:00, Afternoon: 13:00, Evening: 18:00, Night: 21:00 | ✓ |
| 7am / 12pm / 6pm / 10pm | Earlier morning, noon lunch reminder | |

**User's choice:** 8am / 1pm / 6pm / 9pm

### Notification content

| Option | Description | Selected |
|--------|-------------|----------|
| Generic slot reminder | Title: 'Vitalspan Reminder', Body: 'Time to take your {slot} supplements.' | ✓ |
| Personalized with item count | Body includes count of items due that slot | |

**User's choice:** Generic slot reminder

---

## Claude's Discretion

- Time picker component: use `@react-native-community/datetimepicker` or a time-input modal if not Expo SDK 54 compatible — planner to verify
- Exact slot-row typography and toggle style — follow existing ProtocolScreen warm-beige theme conventions
- Notification identifier scheme for cancellation (e.g., `"vitalspan-morning"`) — planner decides

## Deferred Ideas

- Remote push notifications via Supabase push tokens — v5.1+
- Per-item notification tied to a specific supplement name — future phase
