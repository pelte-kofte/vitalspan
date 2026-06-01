# Requirements: Vitalspan v2.0 — Premium, Backend & Exercise

**Defined:** 2026-05-30
**Core Value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.

## v2 Requirements

### Supabase Infrastructure

- [x] **SUPA-01**: Supabase client singleton (`src/lib/supabase.ts`) initialized with `storage: AsyncStorage`, `persistSession: true`, `detectSessionInUrl: false`, `autoRefreshToken: true`
- [x] **SUPA-02**: Anonymous auth initiated on first app launch; session UUID persists across restarts as stable `user_id`
- [x] **SUPA-03**: AppState listener calls `startAutoRefresh()` on `active` and `stopAutoRefresh()` on `background`/`inactive` to prevent JWT expiry after 1h backgrounding
- [ ] **SUPA-04**: `biomarker_definitions` table seeded with longevity-optimized ranges; public-read RLS (`anon` role); app falls back to static `biomarkers.ts` when offline
- [ ] **SUPA-05**: `exercises` table seeded with exercise library; public-read RLS; app falls back to static data when offline
- [x] **SUPA-06**: User biomarker entries written to Supabase `biomarker_entries` after AsyncStorage save (fire-and-forget); Dashboard pulls on mount with staleness gate
- [x] **SUPA-07**: One-time migration on first authenticated session — all existing `@vitalspan_biomarkers` entries inserted into `biomarker_entries`; guarded by `@vitalspan_migrated_v2` idempotency flag

### Security

- [x] **SEC-01**: No Supabase URL or anon key exists in any source file — all read from `process.env.EXPO_PUBLIC_*`; confirmed by audit

### SVG Icons

- [x] **ICON-01**: Five custom SVG tab bar icon components replace the emoji `TabIcon`: Home, Biomarkers, Protocol, Exercise, Profile — validated Phase 5
- [x] **ICON-02**: All tab icons use `viewBox="0 0 24 24"`, stroke-based at `strokeWidth={1.5}`, accepting `color` and `size` props from React Navigation — validated Phase 5

### UI/UX Overhaul

- [ ] **THEME-01**: `Beige` token block appended to `src/theme/index.ts`; no existing `Colors.*` constants renamed or removed
- [ ] **THEME-02**: Biomarkers, Protocol, Exercise, Profile, Settings, and About screens use warm Beige tokens (background, card, text)
- [ ] **THEME-03**: LongevityScore, Dashboard neural sections, and Landing dark neural aesthetic left untouched
- [ ] **THEME-04**: Per-screen `expo-status-bar` style: `"dark"` on warm screens, `"light"` on dark screens via `useFocusEffect`
- [ ] **THEME-05**: Premium card layouts on warm-themed screens — consistent elevation, rounded corners, `Spacing.*` padding
- [ ] **THEME-06**: Motivating empty states with outcome-focused headlines and single CTA on Exercise, Protocol, and Profile screens

### Exercise Screen

- [ ] **EX-01**: Exercise screen rebuilt from scratch with Today → This Week → History (last 14 days) log grouping
- [ ] **EX-02**: Exercise library fetches from Supabase `exercises` table (falls back to static data offline); category filter chips preserved
- [ ] **EX-03**: Intensity selection shows Easy / Moderate / Hard pills with color coding (green/amber/coral) and haptic feedback
- [ ] **EX-04**: Log entries color-coded by intensity; swipe-to-delete removes an entry

### PhenoAge Fix

- [ ] **PHENO-01**: Levine PhenoAge formula in `src/lib/phenoAge.ts` corrected; verified against published coefficients; biological age output matches expected values

### Release Quality

- [ ] **QUAL-01**: `tsc --noEmit` passes with zero errors — no `any` types
- [ ] **QUAL-02**: Key flows verified crash-free on device/simulator: onboarding → biomarker entry → protocol → exercise log → LongevityScore
- [ ] **QUAL-03**: Source audit confirms no hardcoded Supabase URL or anon key — all from `process.env.EXPO_PUBLIC_*`

## v3 Requirements (Deferred)

### Apple HealthKit

- **HK-01**: User can connect Apple Health to pull HRV, sleep, steps automatically
- **HK-02**: HealthKit data populates LongevityScore orbitals without manual entry
- **HK-03**: User can disconnect HealthKit and revert to manual-only mode

### Monetization

- **PAY-01**: Premium features gated behind RevenueCat subscription paywall
- **PAY-02**: Free tier: biomarker tracking (up to 5), no protocol or score
- **PAY-03**: Premium tier: full access, interaction checker, longevity score

### Notifications

- **NOTIF-01**: Daily protocol reminder at user-configured time
- **NOTIF-02**: Weekly "update your labs" nudge if no biomarkers entered in 30 days

### Auth Upgrade

- **AUTH-01**: User can create an email/password account linked to their anonymous session (`linkIdentity()`)
- **AUTH-02**: User can sign in on a new device and see synced biomarker history

### Trend Charts

- **CHART-01**: BiomarkerDetail screen shows 30-day sparkline trend chart
- **CHART-02**: Protocol adherence 30-day SVG timeline

## Out of Scope

| Feature | Reason |
|---------|--------|
| Android support | iOS-only by architecture decision |
| Email/password auth UI | Deferred to v3 — anonymous auth provides stable user_id without friction |
| RevenueCat paywall | Deferred until beta user traction |
| Real-time Supabase subscriptions | Batch pull is sufficient for v2; real-time adds complexity |
| Full AsyncStorage replacement | AsyncStorage keys preserved as offline fallback; Supabase is additive |
| Social / sharing features | Not core to longevity tracking |
| Wearable integrations (Garmin, Whoop) | Apple Health is the natural integration point (v3+) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SUPA-01 | Phase 4 | Complete |
| SUPA-02 | Phase 4 | Complete |
| SUPA-03 | Phase 4 | Complete |
| SEC-01 | Phase 4 | Complete |
| ICON-01 | Phase 5 | Pending |
| ICON-02 | Phase 5 | Pending |
| THEME-01 | Phase 5 | Pending |
| THEME-02 | Phase 6 | Pending |
| THEME-03 | Phase 6 | Pending |
| THEME-04 | Phase 6 | Pending |
| THEME-05 | Phase 6 | Pending |
| THEME-06 | Phase 6 | Pending |
| SUPA-04 | Phase 7 | Pending |
| SUPA-05 | Phase 7 | Pending |
| EX-01 | Phase 7 | Pending |
| EX-02 | Phase 7 | Pending |
| EX-03 | Phase 7 | Pending |
| EX-04 | Phase 7 | Pending |
| SUPA-06 | Phase 8 | In Progress (08-01 done) |
| SUPA-07 | Phase 8 | In Progress (08-01 done) |
| PHENO-01 | Phase 9 | Pending |
| QUAL-01 | Phase 9 | Pending |
| QUAL-02 | Phase 9 | Pending |
| QUAL-03 | Phase 9 | Pending |

**Coverage:**
- v2 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0

---
*Requirements defined: 2026-05-30*
*Last updated: 2026-06-01 — SUPA-06/07 in progress after 08-01 (table schema done)*
