# Requirements: Vitalspan v4.0 — Monetization & Intelligence

**Defined:** 2026-06-10
**Core Value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.

---

## v4.0 Requirements

### Exercise Photos (Phase 15)

- [ ] **EXP-01**: ExerciseDetailScreen shows a real exercise photo (start position) for exercises with a mapped `photoKey` — displayed in the illustration area, replacing or augmenting the Phase 12 SVG illustration
- [ ] **EXP-02**: Exercises without a photo mapping fall back to the existing Phase 12 SVG illustration; exercises with neither show a neutral placeholder
- [ ] **EXP-03**: All 60 exercises in the Vitalspan library have a `photoKey` mapping attempt — at least 70% resolved with a verified `yuhonas/free-exercise-db` match

### Paywall & Subscriptions (Phase 16)

- [ ] **PAY-01**: User can subscribe to Vitalspan Premium (monthly or annual plan) via Apple in-app purchase from the paywall screen
- [ ] **PAY-02**: Paywall screen displays price, billing period, 7-day free trial with a visual timeline (Day 1–7 free → Day 8 billed), and a visible Restore Purchases button — no toggle trial UI
- [ ] **PAY-03**: User who previously subscribed can tap "Restore Purchases" and regain premium access without a new purchase
- [ ] **PAY-04**: Free tier remains fully accessible (biomarker tracking, PhenoAge, supplement/medication protocol, exercise log); premium features (AI Advisor, Articles feed) are soft-gated behind an active subscription
- [ ] **PAY-05**: Articles feed is gated as a premium feature — free users tapping the Articles entry point see the paywall

### AI Advisor — Backend (Phase 17)

- [ ] **AI-01**: App assembles an anonymized health context object (bucketed age, biomarker status categories, supplement stack, medications list) from local AsyncStorage — no raw lab values, no exact birthdate, no Supabase user ID, no name
- [ ] **AI-02**: App invokes a Supabase Edge Function (`ai-advisor`) via `supabase.functions.invoke()`, which calls Claude API server-side with the anonymized context and returns a structured longevity report (no `@anthropic-ai/sdk` in the Expo project)
- [ ] **AI-03**: Edge Function enforces per-user rate limits (5 report generations/day, 20 follow-up chat messages/day) and returns a 429 with a user-readable message when limits are reached

### AI Advisor — UI (Phase 18)

- [ ] **AI-04**: Premium user can tap "AI Advisor" from the Dashboard and generate a longevity report; report renders as a 6-section card layout: Score Summary, Priority Findings, Biomarker Analysis, Supplement & Medication Review, Recommendations (with evidence grades A/B/C), and a Follow-up Chat entry
- [ ] **AI-05**: User can send follow-up questions about their report in a conversational chat interface; each response from Claude references the generated report context; conversation history is ephemeral (not persisted across sessions)
- [ ] **AI-06**: AI Advisor entry point is soft-gated — free user tapping "AI Advisor" sees the paywall; premium user with an active subscription proceeds directly to report generation

---

## Deferred to v5.0+

### Notifications

- **NOTIF-01**: User receives protocol reminders (medications, supplements) via push notification
- **NOTIF-02**: User receives lab-result reminder at 30/90-day intervals

### Data Limits

- **LIMIT-01**: Free tier is limited to 30 days of biomarker history; premium unlocks full history (deferred — paywall ships first, limits enforced in a follow-up phase)

### Advanced Analytics

- **CHART-01**: BiomarkerDetail screen shows a sparkline trend chart for the last 30/90/365 days
- **CHART-02**: Protocol adherence shown as a 30-day SVG timeline

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| `@anthropic-ai/sdk` in Expo project | React Native is explicitly unsupported runtime; Edge Function proxy is the correct pattern |
| RevenueCat | Switched to Adapty — better A/B paywall testing and analytics |
| Toggle trial UI (on/off switch) | Banned by Apple App Store as of 2024; use visual timeline instead |
| Bundling exercise photos locally | 97 MB repo; remote CDN with `expo-image` disk cache is the correct approach |
| GIF exercise animations | `yuhonas/free-exercise-db` contains only static JPGs — no GIF animations exist in the source data |
| Android support | iOS-only by architecture decision |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| EXP-01 | Phase 15 | Pending |
| EXP-02 | Phase 15 | Pending |
| EXP-03 | Phase 15 | Pending |
| PAY-01 | Phase 16 | Pending |
| PAY-02 | Phase 16 | Pending |
| PAY-03 | Phase 16 | Pending |
| PAY-04 | Phase 16 | Pending |
| PAY-05 | Phase 16 | Pending |
| AI-01 | Phase 17 | Pending |
| AI-02 | Phase 17 | Pending |
| AI-03 | Phase 17 | Pending |
| AI-04 | Phase 18 | Pending |
| AI-05 | Phase 18 | Pending |
| AI-06 | Phase 18 | Pending |

**Coverage:**
- v4.0 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---

*Requirements defined: 2026-06-10*
*Last updated: 2026-06-10 after v4.0 milestone start*
