# Feature Research — Vitalspan v5.0

**Domain:** Longevity tracking iOS app (pharmacist-built; supplement protocol + exercise + biomarkers + AI advisor)
**Researched:** 2026-06-16
**Confidence:** HIGH — analysis based on direct reading of existing source files; no web search needed; behaviors derived from code inspection of ExerciseScreen.tsx, ProtocolScreen.tsx, BiomarkerDetailScreen.tsx, advisorContext.ts, PremiumContext.tsx, AppNavigator.tsx, SwipeableLogRow.tsx

---

## Per-Feature Analysis

### Feature 1: Personal Exercise Routine ("Benim Rutinim") + Kesfet Browse View

**User behavior:** User is on the Exercise tab. Instead of the full 60-exercise library immediately, they see two sub-tabs inside the screen: "Rutinim" (default) and "Kesfet." Rutinim shows only the 5–10 exercises they have picked. Kesfet is the full browseable library (current ExerciseScreen content). From Kesfet, the user taps a "+" button on any exercise row to add it to their routine. From Rutinim, they swipe-to-delete or tap a remove button to remove an exercise.

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| Tab-inside switch (Rutinim / Kesfet) — segmented control at top of the Exercise screen | The structural requirement of the feature |
| Rutinim is the default tab when the Exercise screen opens | User's personal routine is primary; full library is discovery |
| "Add to routine" action on each Kesfet exercise row (distinct from the existing "+ Log" action) | Discoverable path from library to routine |
| Routine persisted to AsyncStorage under a new key (`@vitalspan_routine`) as an array of exercise IDs | Survives app restarts |
| Empty Rutinim state with CTA to go to Kesfet ("Browse exercises to build your routine") | First-run UX; routine starts empty |
| Remove from routine — swipe-to-delete or an inline remove button consistent with existing patterns | Users swap exercises over time |
| "Already in routine" indicator on Kesfet rows (e.g., a checkmark) | Prevents re-adding; shows current state |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Drag-to-reorder exercises in Rutinim | User can sequence their workout mentally |
| Routine exercise count badge ("6 / 10") | Communicates the 5–10 target range |
| Haptic feedback when adding or removing an exercise | Consistent with existing haptics usage |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Separate "Create routine" modal or wizard flow | Adds a new screen for a task that inline add/remove handles | Inline add from Kesfet row; inline remove from Rutinim row |
| Multiple named routines ("Push day," "Full body") | Training-app complexity; loses pharmacist-simplicity brand | One routine; naming can come post-PMF |
| Scheduling routines to specific days of the week | Requires calendar logic for marginal benefit | Protocol notifications handle timing reminders |
| Auto-populated routine based on goal or muscle group | Recommendation engine complexity | User-curated; library muscle-group filter already aids discovery |

**Complexity note:** MEDIUM. The screen already has horizontal category tabs — the Rutinim/Kesfet switch uses the same pattern. Storage is a simple `string[]` of exercise IDs. The main care required: the existing "+ Log" button must continue to work from Rutinim rows (logs to the same `@vitalspan_exercise_log`), and progressive overload data (Feature 2) surfaces inside Rutinim rows.

---

### Feature 2: Progressive Overload Tracking

**User behavior:** In the Rutinim view, each exercise card shows two additional data points below the exercise name: (a) a last-session summary — "Last: Jun 10 · 3×8 @ 60 kg" — and (b) a weekly trend indicator — either a text label ("Progressing") or an up/flat/down arrow — comparing this week's best set to last week's best set.

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| Last session date + sets + reps + weight shown on the Rutinim card | Without this the user must navigate to exercise detail to recall what they lifted |
| Date is included on the last-session line ("Last: Jun 10") | Without a date, "last session" could be yesterday or six months ago |
| Weekly trend direction: up / flat / down — compare best set volume (weight × reps) this week vs. last week | Simplest meaningful progress signal without requiring structured data |
| "No data yet" state for exercises with no logged sets | Graceful first-run for newly added routine exercises |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Sparkline (3–5 data points) of weight over recent sessions on the Rutinim card | More informative than a text label; shares component with Feature 10 |
| "Personal best" badge when today's session exceeds all prior sessions | Positive reinforcement at the right moment |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Showing volume as a number ("1440 load units") | Meaningless to most users | Show last weight + rep count; compute trend invisibly |
| Week-by-week comparison table or data grid | Too dense for a routine card | One-line summary + direction indicator |
| Percentage-change labels ("↑12.5%") | Precision theater for subjective logging data | Arrow icon or "Progressing" / "Same" / "Down" text |

**Complexity note:** LOW-MEDIUM. `ExerciseLogEntry` already records `sets`, `reps`, and `date`. The trend logic is a filter + reduce over `@vitalspan_exercise_log` by `exerciseId`. No new schema needed. The sparkline differentiator is where the shared component with Feature 10 pays off.

**Dependency:** Requires Feature 1 (Rutinim view must exist to surface per-exercise trend data).

---

### Feature 3: Exercise History Edit/Delete with Full Date

**User behavior:** In the Today / This Week / History sections, each log row shows a full date (e.g., "Jun 10"). Swipe-to-delete already exists via `SwipeableLogRow`. For edit, tapping a log row opens a sheet pre-filled with the existing values (sets, reps, weight, intensity, duration, notes). The user edits any field and saves. The updated entry replaces the original in `@vitalspan_exercise_log` (same ID, updated fields).

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| Full date displayed on each log row (currently the meta line shows only category + sets) | User must identify which session an entry belongs to, especially in History |
| Swipe-to-delete retained as-is (already built) | Consistency with Phase 7 architecture decision |
| Tap-to-edit: tapping a log row opens an edit sheet pre-filled with existing values | Users make input errors — wrong weight, wrong reps |
| Edit saves as an update to the existing entry (same ID, same date) — not a new entry | Preserves historical ordering; does not create duplicates |
| Delete without confirmation dialog — consistent with existing swipe behavior | Phase 7 decision: single-device local data, low stakes |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Allow editing the date of a log entry | User forgot to log yesterday; backfill scenario |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Separate "History" screen for full edit/delete management | A new route for functionality already visible in ExerciseScreen sections | Inline edit sheet, opened by tapping an existing row |
| Confirmation dialog for delete | Adds friction for low-stakes local data; inconsistent with existing swipe pattern | Keep no-confirmation swipe-to-delete |

**Complexity note:** LOW. `SwipeableLogRow` already handles delete. Edit requires a modal — reuse `QuickLogModal` with a pre-fill prop, or a lightweight bottom sheet. Primary code change: add a tap handler to `SwipeableLogRow` (or the parent row) that passes pre-filled data to the edit sheet.

---

### Feature 4: Protocol Editable Personal Dose

**User behavior:** On a supplement card in the Protocol screen, the user sees the DB-recommended dose badge (e.g., "2000 IU"). They tap an edit icon next to the dose to open an inline input or bottom sheet, enter their actual taken dose ("4000 IU"), and save. The personal dose replaces the DB default in the display going forward. The personal dose is also what gets surfaced to the AI Advisor (Feature 9).

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| Tap-to-edit dose on any supplement card in the protocol | Pharmacist users have actual doses that differ from DB defaults |
| Personal dose stored in `ProtocolState` in a backward-compatible way (e.g., `personalDoses: Record<string, string>` keyed by supplement name) | Must persist without breaking existing installs |
| The dose badge on the card immediately updates to show the personal dose after save | Visual confirmation that the change took effect |
| Applies to both `addedSupplements` (DB-sourced items) and `customSupplements` | Custom supplements already have a `dose` field — edit flow must be consistent |
| "Reset to default" option when editing a DB-sourced supplement dose | User should be able to undo their override |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Dose unit selector (mg, IU, g, mcg) alongside the number field | Prevents "4000" without unit context |
| Warning if personal dose significantly exceeds the DB max dose | Clinical credibility; pharmacist brand requires safety guardrails |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Requiring delete-and-re-add to change dose | Destroys taken history; creates duplicates | Inline edit on the existing card |
| Storing personal dose overrides in a separate AsyncStorage key from ProtocolState | Splits state across two keys; creates sync complexity | Add `personalDoses: Record<string, string>` field inside the existing `ProtocolState` |

**Complexity note:** LOW. `ProtocolState` gains one field. The dose badge already exists on supplement cards. The edit sheet follows the pattern established by `AddCustomSupplementModal`.

**Dependency:** This is the prerequisite for Feature 9 (AI Advisor must read personal dose from ProtocolState).

---

### Feature 5: Protocol Edit/Delete Added Items

**User behavior:** For any supplement in the user's stack (from `addedSupplements` or `customSupplements`), the user can either delete it or edit it. Currently both item types have only a remove "✕" button. The feature adds a consistent edit path: tapping the item card (or long-pressing) opens an edit sheet pre-filled with the item's current values (dose, timing, notes).

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| Delete any added supplement — the "✕" button already exists; confirm it works identically for all item types after Feature 6 removes the Custom/Stack bifurcation | Baseline already partially built |
| Edit sheet for DB-sourced supplements: change timing preference, notes, and personal dose (links to Feature 4) | DB supplements have timing fields; user may need to override |
| Edit sheet for custom supplements: change name, dose, timing, notes — all fields already in `CustomSupplement` schema | All data is available |
| Changes persist to `ProtocolState` | Fundamental |
| Medications: timing slot is already editable via the AM/PM/Eve/Night chip row — retain that; add the ability to change it via the same mechanism | Medications come from Profile; only timing is protocol-editable |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Swipe-to-delete consistent with exercise log pattern | UI consistency across tabs |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Edit flowing to a new screen/route | Adds navigation overhead for a detail task | Bottom sheet modal consistent with `AddCustomSupplementModal` |
| Allowing the user to rename a DB-sourced supplement | Breaks interaction checking — supplement name must match DB keys | Lock name for DB supplements; only dose/timing/notes are editable |

**Complexity note:** LOW-MEDIUM. The edit sheet pattern is established (`AddCustomSupplementModal`). Primary work is routing the "edit existing item" use case through the same component with pre-filled state, plus writing the update path back to `ProtocolState`.

**Dependency:** Feature 6 (category routing cleanup) should be done first — it simplifies the data model so Feature 5 has a single consistent edit flow rather than two separate edit paths (one for "Custom" items, one for "Stack" items).

---

### Feature 6: Protocol Category Routing (Remove "Custom" Category)

**User behavior:** Currently, items added via `AddCustomSupplementModal` land in a hardcoded "Custom" category section at the bottom of the protocol. After this change, items found in `SUPPLEMENT_DATABASE` render under their correct category (e.g., "Antioxidant," "Mineral"). Items not found in any database render under "Other" within the supplement section. The "Custom" label and section disappear entirely.

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| Remove the "Custom" category rendering block from `ProtocolScreen` | The stated goal |
| Items added via `AddCustomSupplementModal` that match a `SUPPLEMENT_DATABASE` entry render under that entry's `category` | Type-correct categorization |
| Items not in any database render under "Other" within the supplement groups (not a floating top-level "Custom" block) | Graceful fallback that doesn't recreate the same problem |
| Medications from Profile still render under "Medications" — unchanged | Preserve existing behavior |
| Items added via the search-and-select path in `AddCustomSupplementModal` (where `selectedDb` is set) automatically pick up the DB `category` | The data already exists in `selectedDb`; routing just needs to use it |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Existing custom items in `customSupplements` that predate this feature: display them under "Other" on first load without requiring user action | Zero-migration-friction upgrade |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Type toggle (Supplement / Medication) in the Add Custom modal | Medications are entered via Profile; the protocol is supplement-first | Route by database lookup, not user declaration |
| Re-categorizing existing "Custom" items on first launch | Risk for existing users with saved data | Show pre-existing custom items under "Other" without any migration |

**Complexity note:** LOW. The `groupedSupps` useMemo already groups by `dbInfo?.category`. The change is: include `customSupplements` in the grouping loop with their resolved category, remove the separate `customSupps.length > 0` render block, and remove the "Custom" label. The `selectedDb` lookup in `AddCustomSupplementModal` already provides the category.

**Dependency:** Prerequisite for Feature 5. Resolving the Custom/Stack bifurcation before building the edit flow ensures one consistent edit path rather than two.

---

### Feature 7: Adherence Streak

**User behavior:** On the Protocol screen header area, the user sees "7-day streak" (or a count with a flame-style icon). The streak increments when the user marks 100% of their protocol items as taken for a given calendar day. It resets to 0 when a day passes with less than full completion. A streak of 0 or no history yet shows nothing (no shaming).

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| Streak count stored in AsyncStorage (new key, e.g., `@vitalspan_streak`) with at minimum a `currentStreak: number` and `lastCompletedDate: string` | Persists across sessions |
| Streak increments when the day's protocol is 100% complete (all items in `taken` match all expected items) | The trigger condition |
| Streak resets to 0 when a day passes without full completion — detected on next app open by comparing `lastCompletedDate` to today | Integrity of the metric |
| Streak of 0 or no streak yet: do not show the streak element | Avoids shaming new users |
| Streak visible on Protocol screen header alongside existing "X / Y taken" pill | The natural location where users interact with completion |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Best streak (personal record) displayed alongside current: "5-day streak / Best: 14" | Motivational context |
| Dashboard surface referencing current streak | Protocol adherence visibility outside the Protocol tab |
| Haptic + brief toast at meaningful milestones (7-day, 30-day) | Positive reinforcement at salient thresholds |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Gamification (badges, level-up animations, points system) | Out of character for a pharmacist-credibility app | Simple number + icon only |
| "Grace period" to preserve streak past midnight | Adds complexity; hard reset at next calendar day is more motivating | Hard reset |
| Social sharing of streak | Privacy-first product | Internal milestone only |

**Complexity note:** LOW. `takenDate` and `taken` already live in `ProtocolState`. The streak utility reads completion history. The main design decision is history storage: store a `completionHistory: Record<string, boolean>` (date-string → boolean) in `ProtocolState` or in `@vitalspan_streak` to compute streaks correctly without relying on real-time completion detection. The "100% complete" denominator must account for Feature 4's personal dose — if the user set a custom multi-dose, the count must use that, not the DB default.

**Dependency:** Uses `taken` and `takenDate` from `ProtocolState`. Must be consistent with Feature 4 (personal dose changes the item count denominator).

---

### Feature 8: Local Push Notifications (AM/PM/Evening/Night Protocol Reminders)

**User behavior:** In Protocol screen (via a "Set Reminders" button near the header) or in Settings, the user sees 4 toggle rows matching the existing `TimeSlot` values: Morning, Afternoon, Evening, Night. Each has a time-picker (hour + minute). Toggling on schedules a daily repeating local notification for that time. The notification message says "Time for your [Morning] supplements." Toggling off cancels that notification. Preferences are persisted.

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| 4 independent toggles (Morning / Afternoon / Evening / Night) — matching the existing `TimeSlot` type already used in `ProtocolState` | Notification slots must align with the existing timing system so they feel coherent |
| Time-picker per slot (hour + minute) | "8 AM" is not universal; users have different routines |
| Daily repeating notifications scheduled via `expo-notifications` `scheduleNotificationAsync` with `repeats: true` | Core mechanics |
| Cancellation when user toggles off a slot (`cancelScheduledNotificationAsync` using the stored notification ID) | Notification state must match UI toggle state |
| Notification preferences persisted in AsyncStorage (`@vitalspan_notification_prefs`) | Survive app restarts |
| iOS permission request (`requestPermissionsAsync`) before scheduling | Required on iOS; crash-safe if denied |
| Graceful degradation: if permission denied, show a message explaining why reminders are unavailable | iOS permission is not guaranteed |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Notification content lists the user's actual supplements for that time slot | More actionable than a generic reminder |
| "Snooze 1 hour" action button on the notification | Native iOS notification action; reduces dismiss-without-acting |
| Smart skip: suppress notification for a slot if the user already completed it that day | Avoids nagging users who are ahead |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Push notifications via Supabase/server (APNs) | Requires server pipeline, APNs certificates, user identity linkage | `expo-notifications` local scheduling is sufficient and privacy-preserving |
| Per-supplement individual notifications | Too many notifications; users mute immediately | One notification per time-of-day slot |
| Notification settings buried 3 taps deep in Settings | Users will not find it | "Set reminders" CTA visible on Protocol screen when the protocol has items |

**Complexity note:** MEDIUM. `expo-notifications` is well-supported in Expo SDK 54. The tricky parts: (a) iOS requires explicit permission before scheduling; (b) notification IDs must be stored per-slot so cancellation works; (c) re-scheduling when the user changes a time must cancel the old ID and create a new one; (d) the `aps-environment: production` entitlement must be in the provisioning profile before the EAS production build (links to Feature 12).

**Dependency:** The `expo-notifications` entitlement must be configured before the Feature 12 EAS production build.

---

### Feature 9: Personal Dose in AI Advisor Context

**User behavior:** No user-visible change. The AI Advisor report improves in quality because `assembleAdvisorContext()` now sends each supplement's personal dose (from Feature 4) alongside its name, instead of just the name. The user may notice that AI recommendations become more specific ("You are taking 4000 IU Vitamin D3, above the standard 2000 IU recommendation — ensure you monitor serum 25-OH-D").

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| `supplements` field in `AdvisorContext` changes from `string[]` to `Array<{ name: string; dose: string }>` | Dose is meaningless without the name; they must travel together |
| Personal dose read from `ProtocolState.personalDoses` (Feature 4's new field) and merged into the supplement payload | The core change |
| Fallback: if no personal dose is set for an item, use the DB default dose | Graceful; advisor still gets dose context |
| Privacy boundary preserved: send name + dose (both already visible to the user); never send raw biomarker numeric values | Consistent with existing privacy design documented in `advisorContext.ts` |
| `advisorContext.test.ts` updated to cover the new `supplements` shape | Test correctness |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Flag in the context object when personal dose exceeds the DB default by a threshold (e.g., `{ name, dose, exceedsDefault: true }`) | Gives Claude a specific signal to address this in the report |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Sending the full `ProtocolState` object to the advisor | Raw protocol state contains `taken[]`, dates, IDs — unnecessary and expands payload | Extract only name + dose into a clean typed array |
| Treating this as a user-facing feature requiring UI work | It is a backend context improvement; no user action required | Transparent improvement; happens automatically when context is assembled |

**Complexity note:** LOW. `assembleAdvisorContext()` already reads `ProtocolState`. The change is adding a `dose` field to the supplement array and updating the `AdvisorContext` type. `advisorContext.test.ts` needs corresponding updates.

**Dependency:** Feature 4 (personal dose must be storable in `ProtocolState` before this feature can read it). Must be authored after Feature 4's schema is finalized.

---

### Feature 10: Biomarker Trend Charts (BiomarkerDetail Sparkline)

**User behavior:** In `BiomarkerDetailScreen`, between the status badges and the "History" section, a sparkline chart appears showing the user's logged values over time. A 30 / 90 / 365 segmented control lets the user switch the time window. The optimal range band (between `optMin` and `optMax`) is visually present on the chart (shaded zone or dashed reference lines). Free-tier users see only the 30-day tab; 90 and 365 tabs show a lock with CTA to Paywall.

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| Sparkline chart showing logged values by date for the selected window | The feature itself |
| 30 / 90 / 365-day segmented toggle | Stated requirement |
| Optimal range band overlaid on chart (shaded zone between `optMin` and `optMax`) | Longevity-optimized ranges are a core differentiator; the chart must reference them |
| No chart rendered when fewer than 2 data points exist — show "Log at least 2 values to see your trend" | Cannot draw a line with one point |
| Free-tier: 30-day tab only; 90 and 365 tabs gated by `isPremium` from `usePremiumContext` | Enforces Feature 11; generates paywall conversion opportunity |
| While `isPremiumLoading` is true, show 30-day view for all users (no flash of locked content) | Consistent with existing `isPremiumLoading` pattern in `PremiumContext` |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Data line color derived from current status (green = optimal, amber = suboptimal, red = critical) | Immediate status communication in chart form |
| Shared sparkline component with Feature 2 (progressive overload) | Code efficiency; consistent visual language across the app |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Full-screen chart screen (new route) | Navigation overhead for a detail enhancement | Inline in BiomarkerDetailScreen scroll view |
| Bar chart instead of line chart | Bar charts are for discrete counts; biomarker values are continuous | Line chart with dots at data points |
| Animated chart entry (values counting up, line drawing) | Adds delay on every screen load; distracting | Static render |
| `react-native-chart-kit` | Largely unmaintained as of 2025; issues with RN 0.74+ | `victory-native` (actively maintained, New Architecture support) or a minimal SVG implementation using `react-native-svg` (already present for exercise illustrations) |

**Complexity note:** MEDIUM-HIGH. Chart library version compatibility with Expo SDK 54 must be verified before committing. `react-native-svg` is already installed (used by exercise illustrations); a hand-rolled SVG sparkline avoids a new dependency and handles the low-complexity case (no axes, no zoom). `victory-native` is the right choice if interactivity (tooltips, pinch-zoom) is needed. The free-tier gating must be built in from the start.

**Dependency:** Feature 11 (free-tier gating logic) must be implemented before the chart UI is wired, so the gate is designed in rather than bolted on.

---

### Feature 11: Free-Tier Data Limits (30-Day Biomarker History Cap)

**User behavior:** Free-tier users viewing a biomarker's history list see only entries from the last 30 days. Entries older than 30 days are hidden from view (but not deleted). Below the visible history, a locked card appears: "Unlock full history — See 90 and 365-day trends with Premium." Tapping it navigates to Paywall. Premium users see all historical entries and all chart time windows.

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| Free users: `historyFor(biomarkerId)` filtered to entries with `date >= 30 days ago` before rendering | Core enforcement |
| Filter applied at render time only — data is never deleted from AsyncStorage | User data is preserved; premium upgrade grants immediate access to all history |
| Lock card below the truncated list with CTA to Paywall | Passive upsell that shows what the user is missing |
| `usePremiumContext().isPremium` gates the filter — premium users see all entries | Integration with existing `PremiumContext` |
| While `isPremiumLoading` is true, show unfiltered history (no flash of truncated content for premium users) | Consistent with existing `isPremiumLoading` pattern |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| Lock card shows "X older entries hidden" with the actual count | Makes the paywall value concrete |
| Free user still sees the most recent entry even if it is older than 30 days (e.g., only one log entry from 45 days ago) | Prevents a completely empty history for infrequent loggers |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Deleting or encrypting data beyond 30 days from AsyncStorage | Destroys user data; creates a hostile upgrade path | Read-time filter only |
| Lock on the entire BiomarkerDetail screen | Blocks the free user from any biomarker functionality | Truncate history list only; current value, status badge, and insight card remain visible |
| Aggressive interstitial paywall triggered by tapping an older entry | Interrupts the core tracking use case | One passive lock card at the bottom of the history list |

**Complexity note:** LOW. One conditional filter on `historyFor()` output. The lock card is static UI. The main decision is exact placement and copy.

**Dependency:** Feature 10 (chart time windows) consumes the same premium gate. The 30-day cutoff constant and the `isPremium` check should be shared between the history list filter and the chart window toggle.

---

### Feature 12: EAS/TestFlight Production Build

**User behavior:** No user-facing behavior change. This is an infrastructure deliverable: a documented, repeatable EAS build pipeline (`eas build --platform ios --profile production`) that produces an `.ipa` submitted to TestFlight.

**Table stakes — must have:**

| Behavior | Why Non-Negotiable |
|----------|-------------------|
| `eas.json` has a `production` profile with `distribution: store` and all required env var references | Builds fail silently or target wrong environment without this |
| `app.json` version and `buildNumber` incremented | TestFlight rejects duplicate build numbers |
| All runtime env vars (Supabase URL, anon key, Adapty key, Edge Function URL) present in EAS Secrets | Missing secrets = silent crashes in production |
| `aps-environment: production` entitlement in provisioning profile | Required for `expo-notifications` (Feature 8) in production |
| Medical disclaimer screen tested on the production build — must appear and accept correctly | Regulatory/liability; disclaimer gate is a launch requirement |

**Differentiators — nice to have:**

| Behavior | Value |
|----------|-------|
| EAS Update (OTA) configured for hotfix deployment | Fixes critical bugs without 24–48h App Store review |
| GitHub Actions trigger on main branch push | CI/CD reduces manual error |

**Anti-features to avoid:**

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| Using the `preview` EAS profile for TestFlight | Preview uses ad-hoc distribution; store distribution is needed | Always `production` profile for TestFlight |
| Hardcoding production secrets in `app.json` or source | Security violation | EAS Secrets / environment variables via `eas.json` |
| Submitting before all v5.0 features are device-tested | TestFlight is the integration test environment | Smoke-test on simulator or local EAS build first |

**Complexity note:** LOW if the existing EAS configuration from v1 is intact and secrets are documented. MEDIUM if the `expo-notifications` entitlement is new to the provisioning profile — requires Apple Developer Portal update and EAS credential sync.

**Dependency:** Feature 8 (push notifications) adds the `aps-environment` entitlement requirement to the build. The EAS production build must be done after Feature 8 is merged and the entitlement is added to the provisioning profile.

---

## Feature Dependencies

```
Feature 1 (Rutinim view)
    └──required by──> Feature 2 (Progressive overload — surfaces inside Rutinim)

Feature 4 (Personal dose in ProtocolState)
    └──required by──> Feature 9 (AI Advisor context reads personal dose)

Feature 6 (Remove Custom category)
    └──prerequisite for──> Feature 5 (Edit/delete items — cleaner single edit path)

Feature 11 (Free-tier data limits / isPremium gate)
    └──required by──> Feature 10 (Chart time window gating)

Feature 8 (Push notifications / aps-environment entitlement)
    └──required before──> Feature 12 (EAS production build with correct entitlements)

Feature 10 (Biomarker sparkline component)
    ──shared component──> Feature 2 (Progressive overload sparkline on Rutinim card)
```

### Dependency Notes

- **Feature 2 requires Feature 1:** Progressive overload trends only make sense surfaced on Rutinim exercise cards. Building Feature 2 without Feature 1 has no natural display surface.
- **Feature 9 requires Feature 4:** `assembleAdvisorContext()` cannot read personal dose until Feature 4 adds `personalDoses` to `ProtocolState`. Author Feature 9 after Feature 4's schema is finalized.
- **Feature 6 before Feature 5:** The Custom/Stack bifurcation in the current `ProtocolScreen` means Feature 5 (edit/delete) would need two separate edit paths if built before Feature 6. Removing "Custom" first means one consistent edit flow for all supplement items.
- **Feature 11 before Feature 10:** The `isPremium` gate for chart windows must be defined before the chart UI is built. Gate designed-in is cheaper than gate bolted-on.
- **Features 10 and 2 share a sparkline component:** If Feature 2 is built first, create the sparkline with an API that Feature 10 can fill (same component, different data). If Feature 10 is built first, the component is reused by Feature 2 directly.
- **Feature 8 before Feature 12:** `expo-notifications` requires the `aps-environment: production` entitlement in the Apple provisioning profile. If notifications are added after the first production build, a new build with updated entitlements is required, adding a full submission cycle.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| F1: Personal routine (Rutinim/Kesfet) | HIGH | MEDIUM | P1 |
| F2: Progressive overload tracking | HIGH | LOW-MEDIUM | P1 (after F1) |
| F3: Exercise history edit/delete + full date | MEDIUM | LOW | P1 |
| F4: Protocol personal dose | HIGH | LOW | P1 |
| F5: Protocol edit/delete items | MEDIUM | LOW-MEDIUM | P1 (after F6) |
| F6: Remove Custom category + type routing | MEDIUM | LOW | P1 (before F5) |
| F7: Adherence streak | MEDIUM | LOW | P2 |
| F8: Push notifications | HIGH | MEDIUM | P1 |
| F9: Personal dose in AI Advisor context | MEDIUM | LOW | P2 (after F4) |
| F10: Biomarker trend charts | HIGH | MEDIUM-HIGH | P1 |
| F11: Free-tier data limits | HIGH | LOW | P1 (before F10) |
| F12: EAS/TestFlight production build | HIGH | LOW-MEDIUM | P1 (last) |

---

## Phase-Ordering Recommendation for Roadmap

**Phase A — Exercise Rutinim:** F6 (protocol cleanup, fast), then F1 + F3, then F2
- F6 is quick Protocol cleanup that reduces debt before the exercise work
- F1 and F3 can be done together (same screen, complementary changes)
- F2 builds on top of F1

**Phase B — Protocol Overhaul:** F4, then F5, then F7 + F8 (can be parallelized)
- F4 (personal dose) first because F5's edit path must include dose editing
- F7 (streak) and F8 (notifications) are independent of each other within this phase

**Phase C — Data Quality + AI:** F9, then F11, then F10
- F9 is small (post-F4); can be done first in this phase
- F11 (gating logic) before F10 (chart consumes the gate)
- F10 is the most complex feature; last in its phase gives the most time

**Phase D — Production Build:** F12
- Nothing ships to TestFlight until features A–C are device-tested

---

## Cross-Cutting Anti-Features

Features that sound appealing but must not be built in v5.0:

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real Apple HealthKit integration | Requires `expo-health` entitlement, provisioning profile change, App Store review annotation; blocks TestFlight if incorrectly configured | Mock layer in `healthkit.ts` is sufficient; defer to a subsequent milestone |
| Supabase sync for all new v5.0 data (routine, personal doses, streak, notification prefs) | Adding sync for 6 new data structures in one milestone creates migration/conflict risk | All new v5.0 features write to AsyncStorage only; Supabase sync is a subsequent milestone |
| Social or community features | Off-brand for a pharmacist-credibility product | Pharmacist citations and evidence grades serve the same trust-building purpose |
| AI-generated routine recommendations | Auto-generating a 10-exercise routine is a separate product decision requiring a recommendation model | User-curated routine; AI Advisor can comment on their current exercises in its report |
| Android builds | No Android support is an existing architectural decision; iOS-specific Expo features are in use | iOS-only, always |

---

*Feature research for: Vitalspan v5.0 — Personalization & Production*
*Researched: 2026-06-16*
*Confidence: HIGH — based on direct code analysis of existing screens, data models, and navigation structure*
