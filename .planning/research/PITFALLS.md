# Pitfalls Research

**Domain:** Adding v5.0 features to an existing Expo ~54 React Native iOS app (Vitalspan)
**Researched:** 2026-06-16
**Confidence:** HIGH (based on direct code reading + verified against known issues)

---

## Critical Pitfalls

### Pitfall 1: addedSupplements string[] to object migration silently corrupts existing users' data

**What goes wrong:**
`ProtocolState.addedSupplements` is currently `string[]` (supplement names). The v5.0 plan adds a "personal dose" field per supplement. If you change this to an object array — e.g. `{ name: string; personalDose?: string }[]` — without a migration guard, all existing users who open the app after the update will have their `addedSupplements` silently treated as the wrong type. Any code that calls `.includes(name)` on the new object array returns `false` for every supplement name, effectively wiping the user's entire stack from the UI even though the bytes are still in AsyncStorage.

**Why it happens:**
`JSON.parse` does not throw when the array shape changes. The existing `ProtocolScreen` `loadData()` function already does `addedSupplements: saved.addedSupplements ?? []` — it spreads whatever it finds. If the shape changes and a migration is not run, old string values are assigned to the new type and every downstream `.includes(name)` check breaks silently.

**How to avoid:**
Run a one-time migration on first load after the schema change. The pattern: on `@vitalspan_protocol` read, check `Array.isArray(saved.addedSupplements) && typeof saved.addedSupplements[0] === 'string'`. If true, convert each string to `{ name: string }` before setting state. Write back immediately. Store a schema version in the protocol object (`schemaVersion: 2`) so the migration never runs twice. Never change the key name `@vitalspan_protocol` — just upgrade the value in-place.

**Warning signs:**
- User's supplement stack appears empty after app update
- `addedSupplements.includes(name)` always returns `false` in production
- `takenCount` reads 0 even when the user had taken items yesterday

**Phase to address:**
Address in the Protocol Overhaul phase, before any UI for editing doses is built. The migration must ship in the same release that changes the schema — never before, never after.

---

### Pitfall 2: customSupplements merge into addedSupplements breaks the taken[] reference chain

**What goes wrong:**
The goal is to remove the "Custom" category and have all supplements live in one unified list. Currently `taken[]` stores supplement IDs in two formats: raw supplement names for `addedSupplements` items (e.g. `"Vitamin D3"`) and `id` strings for `customSupplements` items (e.g. `"custom_1718000000000"`). The `takenCount` logic in `ProtocolScreen` explicitly handles both formats in the same filter. If you merge the two arrays without migrating the `taken[]` array at the same time, every user's taken state becomes partially invalid: items that were in `customSupplements` and were marked taken will stop counting, because the ID format changes when the item moves from the custom list.

**Why it happens:**
The `taken[]` array is a denormalized list of IDs that comes from two different namespaces. Merging the source lists without updating the ID format in `taken[]` is an easy oversight because the merge and the ID format are in different parts of the code.

**How to avoid:**
In the same migration that merges the lists, normalize `taken[]`: for each entry in the old `customSupplements`, if its `id` appears in `taken[]`, also add `name`-based entries under the new unified format. Or: adopt a single canonical ID strategy for all supplements (e.g. `dbId` for database supplements, `custom_{timestamp}` for custom ones) and migrate `taken[]` to reference only those IDs. Run the `taken[]` migration atomically with the `addedSupplements` migration in the same `persist()` call.

**Warning signs:**
- Progress counter (`takenCount / totalItems`) drops after update
- Items that were ticked in the old "Custom" section appear unticked in the new unified section
- `taken[]` array contains IDs that no longer match any key in the merged supplement list

**Phase to address:**
Protocol Overhaul phase. Must be the first thing built in that phase, before any UI work, so all subsequent UI code is written against the new unified schema.

---

### Pitfall 3: expo-notifications missing from app.json plugins causes silent APNS failure at TestFlight

**What goes wrong:**
The current `app.json` does not include `expo-notifications` in the `plugins` array. When you install `expo-notifications` and use it in code but forget to add the config plugin to `app.json`, local notifications work in development builds but the `aps-environment` entitlement is never added to the iOS provisioning profile. The build succeeds. The TestFlight upload succeeds. But Apple's ITMS returns `ITMS-90078: Missing Push Notification Entitlement` on submission, and even local scheduled notifications (which use the same APNS permission model) silently fail to fire on real devices.

**Why it happens:**
Developers confuse "push notifications require APNS" with "local notifications don't use APNS." On iOS, even local notifications require the `aps-environment` entitlement when the app is signed with a distribution profile. The expo-notifications config plugin injects this entitlement automatically — but only if listed in `plugins`.

**How to avoid:**
Add to `app.json` before running any EAS build:
```json
"plugins": [
  "expo-font",
  "expo-notifications",
  ["@kingstinct/react-native-healthkit", { ... }],
  "react-native-adapty"
]
```
Also add to `ios.entitlements`:
```json
"aps-environment": "production"
```
Use `"production"` not `"development"` — development builds will still work, and production/TestFlight builds will be correctly signed. Verify with `npx expo config --type introspect` before building.

**Warning signs:**
- Notifications fire in Expo Dev Build but not after TestFlight install
- EAS build log does not mention `aps-environment` in the entitlements section
- Apple Connect shows ITMS-90078 error on submission

**Phase to address:**
Notification setup phase, before the first EAS production build. Do not ship any release build without verifying the entitlement appears in the introspected config.

---

### Pitfall 4: expo-notifications SDK 54 requires development build — Expo Go no longer works for testing

**What goes wrong:**
Starting with Expo SDK 53/54, push notifications (and the underlying notification permission flow) no longer work inside Expo Go. This means any QR-code-scanned testing of the notification feature produces no-ops with no error. Developers assume notifications are broken, spend time debugging the wrong thing, and may disable the feature or ship broken code.

**Why it happens:**
Apple restricts certain capabilities (APNS, background fetch) to apps with the correct entitlements. Expo Go cannot carry your app's entitlements.

**How to avoid:**
Test all notification features exclusively in a development build (`eas build --profile development --platform ios`). Create the dev build once at the start of the notifications phase and use it throughout. Do not test notifications in Expo Go at any point — treat any result there as meaningless.

**Warning signs:**
- `requestPermissionsAsync()` returns `{ granted: false }` immediately in Expo Go without showing the system dialog
- Scheduled notifications never fire during QR-code-scan testing
- No system notification dialog appears when running in Expo Go

**Phase to address:**
Notification setup phase, first step. Document this constraint in the phase instructions so all testing goes through the dev build from day one.

---

### Pitfall 5: iOS 64 pending-notification limit breaks AM/PM/Evening/Night recurring schedules

**What goes wrong:**
iOS imposes a hard system limit of 64 simultaneously pending `UNNotificationRequest` objects per app. If you naively schedule reminders for 4 time slots × 7 days × N supplements in advance, you will silently hit this ceiling. Notifications beyond slot 64 are dropped without error. On a user with 6–8 supplements and 4 daily time slots, a 30-day pre-schedule would require ~960 notification requests — far over the limit.

**Why it happens:**
expo-notifications wraps `UNNotificationRequest` directly. The limit is enforced by iOS, not by Expo, and Expo does not surface an error when the limit is exceeded — slots are just silently discarded.

**How to avoid:**
Use `CalendarTrigger` (repeating daily at a fixed hour/minute) rather than scheduling individual notification instances. A single repeating daily trigger for "Morning Protocol" counts as one pending notification regardless of how many days it repeats. Four time slots = 4 pending notifications total. Cancel and re-schedule only when the user changes their time preferences. On app foreground, call `cancelAllScheduledNotificationsAsync()` then `scheduleNotificationAsync()` for each active time slot to keep them fresh.

**Warning signs:**
- `getAllScheduledNotificationsAsync()` returns exactly 64 items
- Notifications for later time slots stop firing but earlier ones work
- User reports inconsistent notification delivery across the day

**Phase to address:**
Notification setup phase. Design the scheduling strategy around repeating `CalendarTrigger` from the start — do not use date-specific triggers for daily protocol reminders.

---

### Pitfall 6: Streak breaks silently when the user's device timezone differs from ISO date string logic

**What goes wrong:**
The current codebase uses `new Date().toISOString().slice(0, 10)` for date strings throughout (`takenDate`, exercise log `date`, etc.). `toISOString()` always returns UTC. A user in UTC+3 who marks their protocol as taken at 11:00 PM local time (which is the next UTC calendar day) will have their `takenDate` stored as tomorrow's date. The streak counter then sees a gap on the calendar day the user actually lived, breaking their streak with no visible cause.

**Why it happens:**
`toISOString()` is the easiest date-to-string method in JS, and it looks correct in testing (most developers test in UTC or UTC-1 to UTC+1 zones). The bug is only visible in UTC+3 and beyond, or in any timezone during the late-evening hours.

**How to avoid:**
Replace all date-string generation with a locale-aware helper:
```typescript
function localDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
```
Use this everywhere a "today's date" string is stored or compared: `takenDate`, `streakDate`, exercise log `date`. Do NOT use `toISOString().slice(0,10)` for anything that represents a local calendar day. Store the streak object as `{ currentStreak: number; lastCheckedDate: string }` where `lastCheckedDate` is always local.

**Warning signs:**
- Streak resets at midnight for users in UTC+X timezones
- User reports completing protocol "today" but seeing yesterday's progress
- Protocol's `takenDate` is one day ahead of the actual calendar day for some users

**Phase to address:**
Protocol Adherence Streak phase, at the very start. Also audit and fix existing `toISOString().slice(0,10)` usages in `ProtocolScreen.tsx` and `ExerciseScreen.tsx` as a prerequisite before building the streak counter.

---

### Pitfall 7: react-native-chart-kit crashes on empty dataset or all-zero data

**What goes wrong:**
`react-native-chart-kit` `LineChart` throws a native SVG error when the `data` prop contains an empty array, a single data point, or an array of all-zero values. The error is `InvalidNumber: SVG path 'd' attribute contains invalid value: NaN` — it crashes the entire screen, not just the chart. This is a known unfixed issue in the library. Because the biomarker and exercise overload trends will frequently have zero or one data points (new users, new exercises), every chart render for new users will crash.

**Why it happens:**
The library computes SVG path coordinates by dividing by the data range (max - min). When all values are equal (or there is one point), the range is zero, causing division-by-zero that produces NaN coordinates. The native SVG renderer rejects the NaN path string.

**How to avoid:**
Never render `LineChart` unless: (a) the dataset has at least 2 data points, and (b) not all values are identical. Wrap all chart renders in a guard:
```typescript
const chartData = entries.map(e => e.value);
const hasValidData = chartData.length >= 2 && new Set(chartData).size > 1;
if (!hasValidData) return <EmptyChartPlaceholder />;
```
If you need to show a flat line for identical values, pad the dataset with a tiny epsilon offset on one end point (`values[0] += 0.00001`). Always pass `fromZero={false}` unless you want zero-floor — `fromZero={true}` with all-positive data does not help when values are equal.

**Warning signs:**
- BiomarkerDetail screen crashes after only one biomarker entry is logged
- Exercise overload chart crashes for exercises that have only one week of data
- Error log contains `NaN` in SVG path coordinates

**Phase to address:**
Biomarker Trend Charts phase. Build the empty-state guard as the first step, before rendering any live data. This same guard must be applied to the Exercise overload chart since they share the chart component.

---

### Pitfall 8: ExerciseLogEntry has no weight field — progressive overload chart has no data to plot

**What goes wrong:**
The current `ExerciseLogEntry` interface (in `src/data/exercises.ts`) has `sets?: number`, `reps?: number`, `durationMin?`, `intensity?`, `caloriesEstimated?`, but no `weightKg` or `weightLb` field. Progressive overload tracking requires weight-per-set data. If you build the overload trend chart before adding this field and updating `QuickLogModal` to capture it, the chart will always be empty. More dangerously, if you add the field later and forget to handle old log entries that lack it, `undefined` values in the dataset will crash the chart (same root cause as Pitfall 7).

**Why it happens:**
The exercise logging feature was built for longevity movement tracking (cardio, duration, intensity) not strength progression. The weight field was never needed until progressive overload was added to scope.

**How to avoid:**
Add `weightKg?: number` to `ExerciseLogEntry` before modifying any UI. Because the field is optional, existing log entries are backwards compatible — no migration needed. Update `QuickLogModal` to show a weight input field. Update the overload trend chart to guard against `undefined` weight values and show "No weight data yet" for cardio-only exercises.

**Warning signs:**
- QuickLogModal has no field for capturing weight
- The overload chart renders but shows a flat line at zero for all exercises
- Users log workouts but chart never updates

**Phase to address:**
Exercise Routine phase, as the first data-model task before any chart or routine UI is built.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip schema version field in ProtocolState | No extra migration code | Next schema change has no safe upgrade path; must infer version from shape inspection | Never — add `schemaVersion: number` in v5.0 migration |
| Use `toISOString().slice(0,10)` for streak dates | Easy, already used everywhere | Silently wrong for UTC+3+ users; streak breaks at local midnight | Never for user-facing date strings; only acceptable for server-side ISO timestamps |
| Schedule date-specific notifications instead of repeating CalendarTrigger | Simpler scheduling logic | Hits iOS 64 limit for any user with more than a few slots | Never for daily recurring protocol reminders |
| Store `isPremium` in AsyncStorage as a cache | Avoids Adapty SDK latency on cold start | Trivially bypassable; creates split-brain between Adapty truth and cached value | Never — Adapty SDK has its own internal cache; use `isPremiumLoading` state to avoid UI flash |
| Render chart without empty-data guard | Saves a conditional render | Crashes entire screen for new users with 0–1 data points | Never — guard is 3 lines of code |
| Merge addedSupplements and customSupplements without migrating taken[] | Simplifies the data model | taken[] references become orphaned; progress counter drops to 0 | Never — must migrate atomically |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| expo-notifications + EAS | Omitting `"expo-notifications"` from `app.json` plugins array | Add plugin entry AND `"aps-environment": "production"` to `ios.entitlements` before first EAS build |
| expo-notifications + Expo Go SDK 54 | Testing notification permission flow in Expo Go | Use development build exclusively — Expo Go blocks notification permissions in SDK 54 |
| react-native-chart-kit + Hermes | Rendering chart with SVG-heavy animations on lower-end devices | Disable `bezier` prop for sparklines; use `withDots={false}` and `withShadow={false}` to reduce SVG node count |
| Adapty + isPremium | Caching `isPremium` in AsyncStorage to avoid loading state | Use existing `isPremiumLoading` boolean from `PremiumContext`; never persist subscription state locally |
| advisorContext.ts + new dose field | Forgetting to update `assembleAdvisorContext()` after protocol schema migration | After migrating `addedSupplements` to include `personalDose`, update the supplements assembly section — currently it reads `addedSupplements` as a string array |
| expo-notifications + CalendarTrigger | Passing a `Date` object as trigger on iOS (known bug in some SDK versions, fires immediately) | Always use `{ hour, minute, repeats: true }` CalendarTrigger format on iOS; never pass a `Date` object to the trigger parameter |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| react-native-chart-kit with large biomarker history | Chart renders take 2+ seconds; UI thread blocks | Cap visible data points at 90–365 max; use `useMemo` to derive chart dataset outside render | Any dataset over 100 points — biomarker entries accumulate over months |
| SVG-heavy chart inside a ScrollView without clip control | Slow scroll on screens with multiple charts visible | Use `removeClippedSubviews={true}` on ScrollView; consider lazy rendering charts below the fold | Any screen with 2+ charts |
| AsyncStorage reads not batched on useFocusEffect | Multiple sequential reads on every tab switch; visible jank | Use `Promise.all([...])` pattern already established in DashboardScreen — apply to any screen doing 2+ reads | Immediately noticeable on Protocol tab |
| Notification scheduling on every app launch without checking existing schedule | Duplicates scheduled notifications; silently hits 64 limit | Check existing scheduled notifications before rescheduling, or cancel-all then reschedule on foreground only | After approximately 16 app launches with 4 time slots |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Persisting `isPremium: true` in AsyncStorage | On jailbroken devices users can edit AsyncStorage to enable premium features; Adapty's server-side receipt validation is bypassed | Never write premium status to AsyncStorage — explicitly excluded per existing PremiumContext comment (T-16-03) |
| Including personal dose values in AI Advisor context without anonymization | Dose values are PII-adjacent; pharmacist liability exposure if raw values reach Claude API logs | Bucket dose values or send only supplement name to the Edge Function, not the dose string |
| Notification content containing medication names by default | iOS notification previews show on lock screen; third parties can see medication reminder text | Default notification body to generic "Time for your protocol" — only include specific names if user explicitly enables detailed notifications in Settings |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing streak counter before the user completes one full day | Streak of "0" or "1" feels punishing for new users | Only show streak UI once the user has at least 2 consecutive logged days; show "Start your streak today" CTA before that |
| Canceling all notifications when user disables a single time slot | User expects other slots to remain active | Cancel and reschedule only the specific slot that changed; never call `cancelAllScheduledNotificationsAsync` in response to a single-slot toggle |
| Enforcing 30-day history cap by silently truncating the array on every write | Older entries disappear without explanation; user loses context and trust | Show a "Upgrade to keep full history" banner and render a blurred locked row below the cutoff instead of deleting data |
| Requesting notification permission at first app launch | iOS dialog context is lost; users deny without understanding the value | Request permission from the Protocol screen at the moment the user first sets a time slot — the context is immediate and the value is obvious |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Protocol dose migration:** Verify `schemaVersion` field is written back to AsyncStorage AND that the migration function is idempotent (running twice produces no double-migration)
- [ ] **taken[] integrity after merge:** After removing the "Custom" category, verify that items previously in `customSupplements` still appear as ticked in `taken[]` — test with a device seeded with existing custom supplement data marked as taken
- [ ] **Notification scheduling:** Verify `getAllScheduledNotificationsAsync()` returns exactly 4 items (one per time slot) after setup — not 4 x N items accumulating over app launches
- [ ] **aps-environment entitlement:** Run `npx expo config --type introspect` and confirm `aps-environment: "production"` appears in the iOS entitlements section before any EAS build is triggered
- [ ] **Chart empty-state guard:** Test BiomarkerDetail with a biomarker that has exactly 1 entry — confirm no crash and a "not enough data" placeholder appears instead
- [ ] **Streak timezone test:** Set device to UTC+5 or UTC+8 and mark protocol as taken at 11:30 PM local — verify the streak counts the correct local calendar day, not the next UTC day
- [ ] **Weight field in QuickLogModal:** Confirm the weight input is actually saved to the log entry AND appears in the overload chart — the field being in the interface is insufficient if QuickLogModal does not write it
- [ ] **Free-tier data cap during loading:** Verify `isPremiumLoading` state prevents the cap from being incorrectly applied during Adapty SDK cold-start (show all data while loading, then apply cap only if confirmed non-premium)

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Protocol schema migration corrupted users' data | HIGH | Push hotfix with rollback migration that detects broken state (empty `addedSupplements` on device that previously had items) and restores from a backup key written before migration |
| ITMS-90078 rejected from TestFlight | MEDIUM | Add `aps-environment` to entitlements, rebuild production EAS build, resubmit — typically 1-day turnaround |
| taken[] orphaned after supplement merge | HIGH | Push hotfix migration that scans `taken[]` for IDs matching old `customSupplements` ID format and resolves them to the new unified IDs |
| iOS 64 notification limit silently hit | LOW | Delete all scheduled notifications and reschedule using repeating CalendarTrigger — one code change, immediate effect |
| Streak broken for UTC+3+ users | MEDIUM | Replace `toISOString().slice(0,10)` with local date helper going forward; cannot recover historically lost streaks but stops ongoing breakage immediately |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| addedSupplements migration corrupts existing users | Protocol Overhaul — first task | Test with a device seeded with old string-array data; verify supplement stack survives app update |
| taken[] broken after customSupplements merge | Protocol Overhaul — same task, atomic | Test takenCount before and after update with pre-existing custom supplements marked as taken |
| expo-notifications missing from app.json plugins | Notification Setup — first task | `npx expo config --type introspect` shows `aps-environment` before any EAS build runs |
| Expo Go does not work for notification testing | Notification Setup — first task | Dev build is created and used for all notification QA before writing any notification code |
| iOS 64 notification limit | Notification Setup — scheduling design | `getAllScheduledNotificationsAsync().length` equals number of active time slots, not slots x days |
| Streak timezone bug | Protocol Adherence Streak — prerequisite: fix date helper | QA with device in UTC+8; mark taken at 11:45 PM and verify date recorded matches local calendar day |
| Chart crash on empty or single-point data | Biomarker Trend Charts — first task (build guard before chart) | Test with 0 entries, 1 entry, 2 identical values — all show placeholder, no crash |
| ExerciseLogEntry missing weight field | Exercise Routine — first data-model task | QuickLogModal saves weight; overload chart reads it; old entries without weight show "no data" not crash |
| isPremium cached in AsyncStorage | Never build this — use existing PremiumContext | Audit: grep codebase for any AsyncStorage write of premium status; must return zero results |
| Notification content exposes medication names on lock screen | Notification Setup — content design | Default notification body is generic; specific names gated behind explicit user setting |

---

## Sources

- Direct code reading: `src/screens/ProtocolScreen.tsx`, `src/data/exercises.ts`, `src/lib/advisorContext.ts`, `src/context/PremiumContext.tsx`, `app.json`, `eas.json`
- [expo/expo issue #37101 — no valid aps-environment entitlement](https://github.com/expo/expo/issues/37101)
- [expo/expo issue #36651 — undocumented breaking change with expo-notifications on iOS](https://github.com/expo/expo/issues/36651)
- [expo/expo issue #33141 — SDK 52 notifications fire immediately instead of at scheduled time](https://github.com/expo/expo/issues/33141)
- [react-native-chart-kit issue #15 — LineChart crash with zero-only data](https://github.com/indiespirit/react-native-chart-kit/issues/15)
- [react-native-chart-kit issue #245 — undefined dataset.color TypeError](https://github.com/indiespirit/react-native-chart-kit/issues/245)
- [react-native-chart-kit issue #132 — very slow renders](https://github.com/indiespirit/react-native-chart-kit/issues/132)
- [Apple Developer Forums — UNNotificationRequest 64-notification scheduling limit](https://developer.apple.com/forums/thread/811171)
- [Apple Developer Forums — Missing local notifications after DST switch](https://developer.apple.com/forums/thread/115612)
- [Adapty Docs — Check subscription status in React Native SDK](https://adapty.io/docs/react-native-listen-subscription-changes)
- [Expo Docs — iOS capabilities and EAS Build](https://docs.expo.dev/build-reference/ios-capabilities/)
- [Versioned migration pattern for React Native AsyncStorage](https://www.reactnativeschool.com/migrating-data-in-asyncstorage/)

---
*Pitfalls research for: Vitalspan v5.0 — Personalization & Production (Expo ~54 iOS)*
*Researched: 2026-06-16*
