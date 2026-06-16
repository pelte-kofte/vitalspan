# Requirements: Vitalspan v5.0 — Personalization & Production

**Defined:** 2026-06-16
**Core Value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.

---

## v5.0 Requirements

### Exercise Routine (ROUT)

- [ ] **ROUT-01**: User can toggle between "Rutinim" (personal routine) and "Keşfet" (full library) views within the Exercise tab using an in-screen toggle
- [ ] **ROUT-02**: User can add any exercise from the full library to their personal routine (max 10 exercises)
- [ ] **ROUT-03**: User can reorder exercises in their personal routine via drag-to-reorder
- [ ] **ROUT-04**: User can remove an exercise from their personal routine
- [ ] **ROUT-05**: "Rutinim" view shows an empty state with an "Add exercises" CTA when no exercises have been added

### Exercise History (HIST)

- [ ] **HIST-01**: Past exercise log entries display the full date (day + month + year)
- [ ] **HIST-02**: User can edit a past exercise log entry (update sets, reps, weight)
- [ ] **HIST-03**: User can delete a past exercise log entry
- [ ] **HIST-04**: Exercise log entries capture weight (weightKg) and reps (repsPerSet) per set, in addition to intensity

### Progressive Overload (OVLD)

- [ ] **OVLD-01**: Routine exercise cards display the user's last-session weight and reps for that exercise
- [ ] **OVLD-02**: Each exercise card in the routine shows a weekly trend indicator (improving / stable / declining)
- [ ] **OVLD-03**: ExerciseDetailScreen shows a weekly progressive overload sparkline chart for the selected exercise

### Protocol Overhaul (PROT)

- [x] **PROT-01**: User can enter and edit a personal dose for any supplement in their protocol (independent of the DB recommended range) — medication personal dose deferred to Phase 22 per D-06 (medications are prescribed; no user dose override in Phase 20)
- [x] **PROT-02**: User can edit any supplement or medication they have added to their protocol
- [x] **PROT-03**: User can remove any supplement or medication from their protocol
- [x] **PROT-04**: Items added to the protocol appear in the correct type-based section (Supplements or Medications) — the "Custom" category is removed; all items route to the appropriate section
- [ ] **PROT-05**: AI Advisor context includes the user's personal dose for each protocol item, bucketed as "high/standard/low" relative to the DB recommended range

### Adherence Streak (STRK)

- [ ] **STRK-01**: User sees their current consecutive-day adherence streak on the Protocol screen
- [ ] **STRK-02**: User sees their all-time best streak on the Protocol screen
- [ ] **STRK-03**: Streak increments only when the user marks all protocol items as taken for the day; missed days reset the current streak to zero

### Notifications (NTFY)

- [ ] **NTFY-01**: User can independently enable or disable push notification reminders for each timing slot (Morning, Afternoon, Evening, Night)
- [ ] **NTFY-02**: User can set the time for each enabled notification slot
- [ ] **NTFY-03**: App requests notification permission on the first reminder toggle; permission denial is handled gracefully with a user-friendly explanation
- [ ] **NTFY-04**: Scheduled notifications repeat daily at the configured times and are rescheduled automatically after app updates

### Biomarker Trend Charts (TRND)

- [ ] **TRND-01**: BiomarkerDetailScreen shows a sparkline chart of lab values over time with a 30/90/365-day view toggle
- [ ] **TRND-02**: Chart renders correctly with 2 or more data points; displays a placeholder when fewer than 2 data points exist
- [ ] **TRND-03**: Chart displays the biomarker's optimal range band as a visual overlay

### Data Limits (DLIM)

- [ ] **DLIM-01**: Non-premium users can view only the last 30 days of biomarker history; premium users see full history
- [ ] **DLIM-02**: Non-premium users see an upgrade banner indicating how many entries are hidden beyond the 30-day window

### Production Build (PROD)

- [ ] **PROD-01**: app.json includes expo-notifications config plugin and `aps-environment: production` entitlement — TestFlight-compatible push notification support
- [ ] **PROD-02**: EAS production build profile configured with autoIncrement and store distribution; no secrets in source code; build succeeds cleanly

---

## Deferred to v5.1

### Articles Redesign

- **ARTC-01**: Articles screen uses card/grid layout with a featured/hero article
- **ARTC-02**: User can search articles by keyword
- **ARTC-03**: User can filter articles by category
- **ARTC-04**: Articles relevant to the user's AI Advisor findings are surfaced prominently (e.g., "Vitamin D suboptimal" → related articles highlighted)

## Deferred to v6.0+

- **NTFY-REMOTE**: Remote push notifications via Supabase push tokens (server-side lab reminders)
- **ROUT-MULTI**: Multiple named routines (e.g., "Upper Body Day", "Leg Day")
- **ROUT-AI**: AI-generated routine recommendations based on logged history

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Raw dose string in AI Advisor context | Pharmacist liability — bucketed values (high/standard/low) are safer and sufficient for Claude context |
| Personal dose stored in Supabase | AsyncStorage-first for v5.0; Supabase sync deferred |
| `victory-native` chart library | Requires heavy Skia native dep + peer conflict with Expo SDK 54; react-native-chart-kit already installed and sufficient |
| `date-fns` / `dayjs` | Built-in Date sufficient for all v5.0 operations |
| Android support | iOS-only by architecture decision |

---

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ROUT-01 | Phase 21 | Pending |
| ROUT-02 | Phase 21 | Pending |
| ROUT-03 | Phase 21 | Pending |
| ROUT-04 | Phase 21 | Pending |
| ROUT-05 | Phase 21 | Pending |
| HIST-01 | Phase 21 | Pending |
| HIST-02 | Phase 21 | Pending |
| HIST-03 | Phase 21 | Pending |
| HIST-04 | Phase 21 | Pending |
| OVLD-01 | Phase 21 | Pending |
| OVLD-02 | Phase 21 | Pending |
| OVLD-03 | Phase 21 | Pending |
| PROT-01 | Phase 20 | Complete |
| PROT-02 | Phase 20 | Complete |
| PROT-03 | Phase 20 | Complete |
| PROT-04 | Phase 20 | Complete |
| PROT-05 | Phase 22 | Pending |
| STRK-01 | Phase 22 | Pending |
| STRK-02 | Phase 22 | Pending |
| STRK-03 | Phase 22 | Pending |
| NTFY-01 | Phase 23 | Pending |
| NTFY-02 | Phase 23 | Pending |
| NTFY-03 | Phase 23 | Pending |
| NTFY-04 | Phase 23 | Pending |
| TRND-01 | Phase 22 | Pending |
| TRND-02 | Phase 22 | Pending |
| TRND-03 | Phase 22 | Pending |
| DLIM-01 | Phase 22 | Pending |
| DLIM-02 | Phase 22 | Pending |
| PROD-01 | Phase 23 | Pending |
| PROD-02 | Phase 23 | Pending |

**Coverage:**

- v5.0 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-16*
*Last updated: 2026-06-16 — traceability filled in after roadmap creation*
