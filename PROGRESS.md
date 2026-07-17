# Vitalspan — Production Readiness Progress

## Architecture decisions made before writing any code

### Stack confirmed
- React Native + Expo SDK 54
- react-native-reanimated 4.1.1 (Reanimated 4 API, worklets via react-native-worklets 0.5.1)
- react-native-svg 15.12.1
- babel plugin already configured: `react-native-reanimated/plugin`

### Animation strategy for NeuralGrid
NeuralGrid uses a single `useSharedValue` (Reanimated) driving an `Animated.View` wrapper.
Nodes are statically positioned (seeded pseudo-random for stability across renders).
Two staggered breathing groups create illusion of independent pulsing.
Lines are static, computed once from distance threshold.
This hits 60fps because the only animated prop is `opacity` on a native View — runs on UI thread.

### No new packages installed
- expo-health is NOT installed. healthkit.ts is a full mock system, ready to swap for real SDK.
- All other dependencies already in package.json.

---

## Session 1 — Cinematic UI

### Phase 1 — Foundation
- [x] `src/theme/index.ts` — extended with Colors.dark, Colors.viz, Gradients, Motion, Elevation, refined Typography
- [x] `src/hooks/useBreathing.ts` — shared animation hook

### Phase 2 — New Components
- [x] `src/components/NeuralGrid.tsx` — animated SVG background
- [x] `src/components/BreathingCard.tsx` — scale + glow wrapper
- [x] `src/components/FutureSelf.tsx` — biological age projection

### Phase 3 — New Screen
- [x] `src/screens/LongevityScoreScreen.tsx` — full-screen sphere visualization
- [x] `src/navigation/AppNavigator.tsx` — add LongevityScore route

### Phase 4 — Dashboard Enhancement
- [x] `src/screens/DashboardScreen.tsx` — NeuralGrid bg, BreathingCard bio, FutureSelf, gradient bm cards

### Phase 5 — HealthKit (stub, ready to activate)
- [x] `src/lib/healthkit.ts` — permission request + sync design

---

## Session 2 — Production Readiness (2026-05-23)

### Audit completed — bugs found and fixed:

**Critical bugs fixed:**
1. `biologicalAge = Math.random()` → Replaced with Levine PhenoAge formula
2. `MedicationSearch` → Replaced external RxNorm API with 200-drug local database + Levenshtein fuzzy search
3. Navigation back-swipe → `gestureEnabled: false` on Landing/Onboarding; `nav.reset()` after onboarding
4. "Already have account" → Now checks AsyncStorage for profile before navigating

**Hardcoded values cleaned up:**
- `borderRadius: 16` → `Radius.lg` in LandingScreen
- Biomarkers array syntax error in biomarkers.ts fixed

### Features implemented:

#### Navigation (App.tsx, AppNavigator.tsx)
- App.tsx checks AsyncStorage on launch → routes directly to Main if onboarding complete
- `gestureEnabled: false` on Landing, Onboarding, Main stack screens
- `nav.reset()` used after onboarding complete
- `nav.reset()` in SettingsScreen sign-out and clear-data flows

#### Medications (src/data/medications.ts, MedicationSearch.tsx)
- 200-drug pharmacist-curated database: statins, cardiovascular, anticoagulants, diabetes, thyroid, psychiatric, antibiotics, NSAIDs, PPIs, respiratory, hormonal, osteoporosis, immunosuppressants, neurological, misc
- TR/US/UK brand names included (Glucophage, Coumadin, Glifor, etc.)
- Levenshtein distance fuzzy search with typo tolerance (threshold: 1 for short queries, 2 for long)
- Shows drug class as subtitle in dropdown
- Fully offline — no network requests
- "+ Add manually" fallback preserved

#### Biological Age (historical implementation; retired in Phase 3.4B)
- The original product calculator was superseded by the validated Clinical PhenoAge v1.0.0 engine
- 9 required biomarkers: albumin, creatinine, glucose, hsCRP, lymphocyte %, MCV, RDW, ALP, WBC
- Historical confidence tiers were removed; the production engine requires complete eligible evidence
- Dashboard bio age card: shows real PhenoAge OR shows missing biomarkers CTA
- LongevityScore sphere shows real PhenoAge
- Profile screen no longer shows fake stored biologicalAge — computed live
- Evidence confidence is now supplied by the Scientific Eligibility Engine

#### 7 New Biomarkers (src/data/biomarkers.ts)
All required for PhenoAge: albumin, creatinine, lymphocyte %, MCV, RDW, alkaline phosphatase, WBC
- Full longevity descriptions and howToImprove sections
- Added `cbc` and `metabolicPanel` categories
- BiomarkerDetailScreen updated to show these new categories

#### Onboarding (OnboardingScreen.tsx)
- Form validation: name required on step 0 (Alert), goal required on step 1 (Alert)
- Button disabled state for steps with required fields
- Haptic feedback (selectionAsync) on every option select, age +/-, sex toggle
- Success haptic on completion
- `nav.reset()` instead of `nav.replace()` — clears full stack

#### Dashboard (DashboardScreen.tsx)
- Pull-to-refresh (RefreshControl)
- Haptics on bio age card tap, interaction checker tap, + Log tap
- Empty protocol state: "Go to Protocol →" CTA button
- Bio age: shows PhenoAge OR shows "Log {biomarkers} to unlock" CTA
- Confidence note when PhenoAge computed with missing biomarkers

#### New Screens
- `src/screens/SettingsScreen.tsx`: notifications toggles, metric/imperial unit switch, About navigation, sign out (with confirmation), clear all data (destructive alert), pharmacist disclaimer
- `src/screens/AboutScreen.tsx`: version, PhenoAge citation, longevity vs standard ranges table, evidence grading system, medical disclaimer

#### Profile (ProfileScreen.tsx)
- Edit mode: name, age, sex, conditions — all editable in-app
- Edit saved to AsyncStorage with success haptic
- Settings + About shortcut cards at bottom of profile
- ⚙️ settings button in header
- Medications empty state: "go to Protocol to add" CTA

#### Polish
- BiomarkerEntryScreen: unit conversion (mmol/L ↔ mg/dL for glucose, mmol/mol ↔ % for HbA1c), haptic on save
- BiomarkerDetailScreen: empty history CTA "+ Log first entry", haptic on Log button
- ProtocolScreen: empty medications CTA "Go to Profile →", haptic on taken toggles

---

## Session 3 — UX Gap Fixes (2026-05-24)

### Issues addressed from user testing:

#### 1. Apple Health — HealthKit mock integration (src/lib/healthkit.ts)
- Full mock system with realistic data generation (HRV 48–76ms, sleep 6.8–8.6h, VO2max 44–60, recovery 55–90, glucose 82–96)
- `connectAndSync()` — shows native Alert permission flow, generates mock data, saves to @vitalspan_health_data
- `deriveHealthState()` — maps HRV/recovery to NeuralGrid tone (neutral/good/poor/stressed)
- `formatSyncTime()` — human-readable last sync time
- "Demo mode" badge shown when mock data is active
- `loadPermissionStatus()` / `savePermissionStatus()` — persists to @vitalspan_health_permissions
- Ready to swap for real expo-health SDK: all real code is commented in-file

#### 2. LongevityScore overhaul (src/screens/LongevityScoreScreen.tsx)
- Orbital cards: replaced "—" with intelligent empty states (reason + CTA copy)
- "?" help button → explainer modal (sphere = PhenoAge, orbitals = HealthKit, projection math)
- Score transparency sheet: biomarker checklist with ✓/○, confidence %, "what improves this?" section
- Quick action row: Log biomarkers, Connect/Resync Health, Bio-age test
- "Connect Apple Health" button actually calls connectAndSync(), shows loading, updates cards
- Demo mode badge when mock data active
- Pull-to-refresh (RefreshControl)
- Presentation changed to fullScreenModal for swipe-down dismiss

#### 3. Custom supplements (src/screens/ProtocolScreen.tsx)
- AddCustomSupplementModal: SUPPLEMENT_DATABASE search (≥2 chars), manual entry fallback
- Fields: name*, dose, time of day (AM/PM/Eve/Night), notes
- Custom supplements stored in @vitalspan_protocol under `customSupplements: CustomSupplement[]`
- "Your Stack" section shows user's custom supplements above recommended list
- Swipe-to-remove (✕ button) with confirmation Alert
- Pull-to-refresh added

#### 4. Medication interaction warnings (src/screens/ProtocolScreen.tsx)
- Drug class label shown under medication name (from MEDICATION_DATABASE)
- Inline "⚠ Conflicts with {supplement} — tap to review" row on each medication
- Tapping conflict → InteractionChecker screen
- Checks INTERACTIONS list against user's added supplements (base + custom)
- Also checks drug class-level interactions (e.g., any Statin + CoQ10)

#### 5. Biomarker citations (src/screens/BiomarkerDetailScreen.tsx)
- Citation block at bottom of "About" section: "References: Levine et al. Aging Cell 2018 · Attia, Outlive (2023) · Longevity Medicine Alliance guidelines"
- Citation block at bottom of "How to improve": "Pharmacist-reviewed · Evidence grade based on RCT + meta-analysis literature"
- Professional `fontStyle: 'italic'` styling with border-top separator

#### 6. FutureSelf projection math (src/components/FutureSelf.tsx)
- aging_rate = bio_age / chrono_age (real ratio, not fixed 1.0)
- adjustedRate = agingRate * (1 - optimality * 0.08) — biomarker quality reduces rate up to 8%
- projectedBioAge = bio_age + adjustedRate * 5 calendar years
- Shows rate badge: "0.72 yr/yr" with green/warning color coding
- Locked state (🔒) when biologicalAge or chronologicalAge is null
- Projection explainer modal: tap → see full math breakdown
- Neural grid overlay at 0.35 opacity for subtle animation

#### 7. Settings polish (src/screens/SettingsScreen.tsx)
- Grouped sections: Account, Preferences, Data, About, Developer (dev-only)
- Icon per row (📤 📊 🔔 ℹ 🔒 etc.) in 32×32 rounded square
- "Export my data" → Share() with JSON of all storage keys
- "Reset onboarding" debug option (hidden behind __DEV__ flag)
- Section labels 11px uppercase 1.5 letter-spacing

#### 8. About screen authority (src/screens/AboutScreen.tsx)
- Founder section: "Rx" avatar, PharmD credentials
- "Why pharmacist-built matters" expandable: 3 bullet points explaining clinical rigor
- 8-citation Sources & Citations expandable list (Levine, Attia, Sinclair, Fontana, etc.)
- Privacy Policy link (placeholder)
- Evidence grading color-coded chips

#### 9. Pull-to-refresh added to all data screens
- BiomarkerDetailScreen (both list view and detail view)
- ProtocolScreen
- ProfileScreen
- LongevityScoreScreen

#### 10. Empty states upgraded
- Dashboard biomarker cards: "No data" → "Tap to log first reading" CTA badge
- Dashboard empty protocol: "Go to Protocol →" CTA
- BiomarkerDetail list: "No data" → "Tap to log" badge
- Orbital metrics: "—" → reason + CTA copy (e.g., "3 nights required / Connect Health")
- LongevityScore bio age pending: "—" → "LOG 4+ BMs"

#### 11. Reactive NeuralGrid
- DashboardScreen reads @vitalspan_health_data on load
- `deriveHealthState()` maps to tone: stressed → 'alert', good → 'vital', else 'calm'
- NeuralGrid tone changes based on user's HRV/recovery state

---

## Preserved / Untouched
- All existing AsyncStorage keys: `@vitalspan_user_profile`, `@vitalspan_biomarkers`, `@vitalspan_protocol`, `@vitalspan_protocol_today`, `@vitalspan_health_data`
- New keys: `@vitalspan_health_permissions` (HealthKit consent), `customSupplements` added to `@vitalspan_protocol`
- All business logic in src/data/
- All existing screen functionality
- All existing theme tokens (only added new ones)
- NeuralGrid, BreathingCard, SupplementRow, RangeBar components
- LongevityScoreScreen dark theme
- All navigation paths

---

## What's still pending (next session)

- [ ] Paywall — RevenueCat integration
- [ ] Supabase backend (auth + sync)
- [ ] Apple HealthKit — real `expo-health` (mock exists, ready to swap: `npx expo install expo-health && npx expo run:ios`)
- [ ] Push notifications — `expo-notifications`
- [ ] Protocol adherence chart (react-native-svg timeline, 30-day history)
- [ ] BiomarkerDetail trend chart (react-native-chart-kit or SVG sparklines)
- [ ] TestFlight build + EAS configuration review
- [ ] App Store screenshots
- [ ] Tab bar gradient/tint (issue #8 partial — NeuralGrid added, tab bar still plain)
- [ ] Parallax scroll effect on LongevityScore orbital cards (issue #9)

---

---

## Session 4 — Bug Fixes from User Testing (2026-05-24)

### 6 critical bugs fixed:

#### BUG 1 & 2: PhenoAge count wrong / never unlocks (historical; calculator retired)
- Added temporary legacy calculation diagnostics (removed during the production cutover)
- Added `console.log` in Dashboard and LongevityScore entryMap keys for runtime diagnosis
- Added `profile.age > 0` guard (was just `!profile`) — prevents NaN computation
- Exported a legacy biomarker list (removed during the production cutover)
- Removed duplicate local `PHENO_BIOMARKER_LABELS` from `LongevityScoreScreen`
- Fixed sphere label: was hardcoded "LOG 4+ BMs" → now dynamic: "{N} MORE BMs" or "LOG BIOMARKERS"
- Dashboard "to unlock" copy: now shows specific biomarker names e.g. "Need: Albumin, hsCRP +5 more"
- All IDs verified consistent: `albumin`, `creatinine`, `fastingglucose`, `hscrp`, `lymphocytepct`, `mcv`, `rdw`, `alp`, `wbc`

#### BUG 3: Multi-dose medications
- Added `parseDoseCount(dose)` → parses "3x daily" → 3, defaults to 1
- Added `getDoseTimeLabels(count)` → ["Morning", "Afternoon", "Evening"] for 3x
- Added `doseId(name, n)` → "Berberine_dose_0", "Berberine_dose_1", etc.
- Berberine updated in `GOAL_SUPPLEMENTS`: `dose: '500mg (3x daily)'` (matches SUPPLEMENT_DATABASE)
- `totalItems` now sums dose counts per supplement, not unique item count
- `takenCount` counts individual dose IDs in `taken[]` array
- Multi-dose supplements show N checkbox rows under the SupplementRow header
- Backward compatible: single-dose items still use their name as the taken key

#### BUG 4: Demo data mixing with real score
- `dataValue()` in LongevityScoreScreen now checks `isDemoMode`
- When `isDemoMode` is true: sleep, HRV, recovery, fitness orbs show "Connect Health" CTA instead of fake values
- Glucose still shows if available (can come from biomarker entries, not just HealthKit)
- PhenoAge computation is unaffected (uses real logged biomarkers)

#### BUG 5: Supplement database expanded
- Grew from 20 → 47 supplements
- New additions: Creatine, Taurine, NAC, Glutathione, ALCAR, L-Theanine, TMG, Choline, Inositol, Fisetin, Spermidine, Pterostilbene, EGCG, Sulforaphane, R-Lipoic Acid, Lion's Mane, Reishi, Cordyceps, Vitamin C, Vitamin E (mixed tocopherols), Iodine, Boron, Rhodiola, Bacopa, Phosphatidylserine, D-Ribose, Metformin (Rx), Rapamycin (Rx)
- Prescription-only supplements clearly marked with `prescriptionOnly: true` and `rxNote`
- New categories: `amino_acid`, `nootropic`, `senolytic`, `prescription_only`

#### BUG 6: FutureSelf unlock confusing
- Locked state redesigned: shows tappable checklist of first 5 PhenoAge biomarkers
- Each row shows ✓ (logged) or ○ (missing) with biomarker name, unit, and "+ Log →" CTA
- Tapping a missing row navigates directly to BiomarkerEntry pre-filled for that biomarker
- `FutureSelf` now accepts `loggedBiomarkerIds` and `onBiomarkerPress` props
- DashboardScreen passes `Array.from(entryMap.keys())` as loggedBiomarkerIds

### Also fixed:
- Bell icon on Dashboard: now navigates to Settings (was a dead button)
- Goal 'Track & understand': NMN, CoQ10, Berberine now recommended for this goal
- Legacy biomarker-list export eliminated during the Phase 3.4B scientific-engine cutover

---

## TypeScript status
✅ `npx tsc --noEmit` passes with 0 errors (verified 2026-05-24, session 4)

## Commits
- `d34a262` feat: visual polish, docs update
- (session 4 bug fixes commit pending)
