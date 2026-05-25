# Phase 1: First-Run & Empty States - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire a guided first-run flow so new users get immediate clinical value after onboarding, and add purposeful empty states so blank screens are never the first impression. No new capabilities beyond what's scoped in FIRST-01..04 and EMPTY-01..02.

</domain>

<decisions>
## Implementation Decisions

### Guided Flow Architecture
- **D-01:** New dedicated `GuidedFirstRunScreen` — a separate stack screen, NOT a modal over Dashboard and NOT extra steps in OnboardingScreen.
- **D-02:** Presentation: `fullScreenModal` in AppNavigator — same pattern as `LongevityScoreScreen`. User cannot accidentally back out.
- **D-03:** `OnboardingScreen` navigates to `GuidedFirstRunScreen` instead of resetting to `Main` directly.
- **D-04:** Each step in the guided flow shows the "Why it matters" explanation card + the numeric input field **on the same screen** — no extra navigation hop per biomarker.
- **D-05:** A step progress indicator (e.g., "Step 1 of 3") is shown at the top of GuidedFirstRunScreen.

### "Why It Matters" Card
- **D-06:** Explanation content for the 3 biomarkers (Glucose, HbA1c, Cholesterol) lives in a new file: `src/data/firstRunContent.ts`. Small data object, not a schema change on all BIOMARKERS entries.
- **D-07:** Both `GuidedFirstRunScreen` and `BiomarkerEntryScreen` import from `firstRunContent.ts`. When accessed outside the guided flow, BiomarkerEntryScreen also shows the explanation card for biomarkers that have content in that file.
- **D-08:** Card visual style: `BreathingCard` wrapper with a clinical icon (e.g., 🧬), a one-line headline ("Why Glucose Matters"), and 2–3 sentences of plain-English body copy. Consistent with existing app aesthetic.

### Dashboard Empty State (EMPTY-01)
- **D-09:** When `entries.length === 0`, replace the biomarker card grid entirely with a single focused empty state card. Do NOT show the placeholder grid with dots alongside it.
- **D-10:** The empty state card CTA ("Get started") navigates to `GuidedFirstRunScreen` — re-triggering the full guided flow.
- **D-11:** The FutureSelf / LongevityScore card stays visible even when empty, but rendered in its `locked` state. Gives the user a motivational preview of what they're working toward.

### Biomarkers Tab Empty State (EMPTY-02)
- **D-12:** `BiomarkerDetailScreen` shows an empty state with a brief explanation and a "Start tracking" CTA when no entries exist. The CTA navigates to `GuidedFirstRunScreen`.

### First-Run Completion Tracking (FIRST-03)
- **D-13:** New AsyncStorage key: `@vitalspan_first_run_complete` (boolean). Follows existing `@vitalspan_*` convention.
- **D-14:** Written `true` in BOTH paths: (a) user taps "Do this later" / skip, AND (b) user completes all 3 steps. The boolean means "user has seen and dismissed this flow."
- **D-15:** After completing all 3 steps, `GuidedFirstRunScreen` does `nav.reset({ index: 0, routes: [{ name: 'Main' }] })` — same pattern as `OnboardingScreen` line 88.
- **D-16:** Dashboard reads `@vitalspan_first_run_complete` on mount. If `false` / missing AND `entries.length === 0` → show empty state CTA. If `true` OR entries exist → normal dashboard rendering.
- **D-17:** The new key must be added to `SettingsScreen.tsx` → `ALL_STORAGE_KEYS` array (used for data reset).

### Claude's Discretion
- Exact wording of the "Why it matters" body copy for each biomarker — pharmacist-accurate, plain English, 2–3 sentences per biomarker. Claude writes the clinical content.
- Exact layout spacing and icon choice for the explanation card within BreathingCard.
- Whether the step progress indicator is a dot pagination or a "1/3" text label.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — FIRST-01, FIRST-02, FIRST-03, FIRST-04, EMPTY-01, EMPTY-02 (full acceptance criteria)
- `.planning/ROADMAP.md` §Phase 1 — Success criteria and phase dependencies

### Existing Navigation Patterns
- `src/navigation/AppNavigator.tsx` — `RootStackParamList`, all existing routes and their `presentation` options; add `GuidedFirstRun` screen here
- `src/screens/OnboardingScreen.tsx:88` — The `nav.reset` call to update to navigate to `GuidedFirstRunScreen` instead of `Main`

### Existing Screens to Modify
- `src/screens/DashboardScreen.tsx` — Add `@vitalspan_first_run_complete` read, empty state branch, locked FutureSelf state
- `src/screens/BiomarkerDetailScreen.tsx` — Add EMPTY-02 empty state
- `src/screens/BiomarkerEntryScreen.tsx` — Add explanation card from `firstRunContent.ts` for supported biomarkers
- `src/screens/SettingsScreen.tsx` — Add `@vitalspan_first_run_complete` to `ALL_STORAGE_KEYS`

### Reusable Components
- `src/components/BreathingCard.tsx` — Used for the "Why it matters" explanation card
- `src/components/FutureSelf.tsx` — Already has a `locked` prop; use for Dashboard empty state

### Theme & Conventions
- `src/theme/index.ts` — All colors, spacing, radius, typography tokens
- `.planning/CLAUDE.md` — No new packages without Expo SDK 54 compat check; `@vitalspan_*` key naming convention

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BreathingCard` (`src/components/BreathingCard.tsx`): Scale+glow animated card wrapper — use for "Why it matters" explanation cards in GuidedFirstRunScreen and BiomarkerEntry.
- `FutureSelf` (`src/components/FutureSelf.tsx`): Has `locked` prop already — show in locked state on empty Dashboard without any code changes.
- `BiomarkerEntryScreen` (`src/screens/BiomarkerEntryScreen.tsx`): Accepts `{ biomarkerId: id | undefined }` — no param changes needed; explanation card is added as a conditional UI section.
- `useBreathing` hook: Shared Reanimated oscillation hook used by BreathingCard — no changes needed.

### Established Patterns
- Data loading: `useCallback` + `useFocusEffect` + `Promise.all` for AsyncStorage multi-key reads — follow this pattern in GuidedFirstRunScreen.
- Navigation reset: `nav.reset({ index: 0, routes: [{ name: 'Main' }] })` — use after both skip and completion in GuidedFirstRunScreen.
- AsyncStorage keys: string literals inline, prefixed `@vitalspan_<noun>` — new key is `@vitalspan_first_run_complete`.
- StyleSheet: always named `s`, placed at bottom of file, all values from theme tokens.
- Early-return pattern for step switching: `if (step === 0) return <StepZeroUI />` — use for GuidedFirstRunScreen's 3-step flow.

### Integration Points
- `AppNavigator.tsx`: Add `GuidedFirstRun: undefined` to `RootStackParamList`, add `Stack.Screen` with `presentation: 'fullScreenModal'`.
- `OnboardingScreen.tsx:88`: Change `nav.reset` target from `Main` to `GuidedFirstRun`.
- `DashboardScreen.tsx`: Add `@vitalspan_first_run_complete` to the `Promise.all` load in `loadData`, add conditional rendering for empty state card.

</code_context>

<specifics>
## Specific Ideas

- The guided flow should feel intentional and purposeful, not like a chore. The `fullScreenModal` presentation + `BreathingCard` wrapper creates the same clinical weight as `LongevityScoreScreen`.
- `GuidedFirstRunScreen` progress indicator: step count visible ("Step 1 of 3") so user knows the commitment is short.
- "Do this later" / skip label: plain, non-dismissive language — not "Skip" (implies skipping is bad). Something like "I'll do this later" or "Remind me later."
- After completing step 3, the `nav.reset` to Dashboard should allow the Dashboard to detect fresh entries and show the data (not the empty state).

</specifics>

<deferred>
## Deferred Ideas

- Showing the LongevityScore screen as a celebration step after completing all 3 guided biomarkers — rewarding but adds complexity. Good candidate for a future UX polish phase.
- Step-progress tracking (`@vitalspan_first_run_state` with lastStep) so users who drop off mid-flow resume at the right step — overkill for Phase 1 with only 3 short steps.
- Extending explanation content to all 20+ biomarkers in `BIOMARKERS` data (schema-wide `explanationNote` field) — start with just the 3 in `firstRunContent.ts` for Phase 1.

</deferred>

---

*Phase: 1-First-Run & Empty States*
*Context gathered: 2026-05-25*
