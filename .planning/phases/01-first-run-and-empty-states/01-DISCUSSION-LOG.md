# Phase 1: First-Run & Empty States - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-25
**Phase:** 1-First-Run & Empty States
**Areas discussed:** Guided Flow Delivery, "Why It Matters" Card, Dashboard Empty State, First-Run Completion Tracking

---

## Guided Flow Delivery

### Where does the guided first-run live?

| Option | Description | Selected |
|--------|-------------|----------|
| New GuidedFirstRunScreen | Dedicated stack screen. OnboardingScreen navigates to it instead of Main. Clean, linear wizard. | ✓ |
| Modal over Dashboard | App resets to Main; sheet/modal appears on top. Dashboard visible behind it. | |
| Extra steps in OnboardingScreen | Guided flow as additional steps in existing OnboardingScreen wizard. | |

**User's choice:** New GuidedFirstRunScreen

---

### How should each step be structured?

| Option | Description | Selected |
|--------|-------------|----------|
| Explanation card + inline input on same screen | Read and enter in one step — no navigation hop per biomarker. | ✓ |
| Explanation card → navigate to BiomarkerEntry | 'Log it' button navigates to existing BiomarkerEntryScreen. Reuses entry UI. | |
| Step-by-step with progress indicator | Same as Option 1 but with a step bar at the top. | |

**User's choice:** Explanation card + inline input on same screen
**Notes:** Progress indicator was not rejected — it's included in the decision as an enhancement (D-05).

---

### What presentation style?

| Option | Description | Selected |
|--------|-------------|----------|
| fullScreenModal — matches LongevityScore | Presented as fullScreenModal in stack. Intentional, user can't back out. | ✓ |
| Regular push screen | Standard push with back button. User could navigate back to Onboarding. | |
| You decide | Leave to planner. | |

**User's choice:** fullScreenModal — matches LongevityScore

---

## "Why It Matters" Card

### Where does explanation content come from?

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded in GuidedFirstRunScreen | Small data object in screen/file with 3 biomarker explanations. Simple. | ✓ |
| Add explanationNote to BIOMARKERS data | Extend Biomarker type — reusable but requires touching all 20+ entries. | |
| You decide | Leave to planner. | |

**User's choice:** Hardcoded in GuidedFirstRunScreen

---

### Card visual style?

| Option | Description | Selected |
|--------|-------------|----------|
| BreathingCard with icon + headline + body | Reuse BreathingCard (scale+glow), clinical icon, 2-3 sentence copy. | ✓ |
| Simple styled View (no animation) | Flat card, no animation. Matches biomarker cards on Dashboard. | |
| You decide | Leave to planner/executor. | |

**User's choice:** BreathingCard with icon + headline + body

---

### Does the explanation also appear in BiomarkerEntry outside the guided flow?

| Option | Description | Selected |
|--------|-------------|----------|
| No — guided flow only for Phase 1 | Card lives exclusively in GuidedFirstRunScreen. | |
| Yes — extend BiomarkerEntry too | Add explanation to BiomarkerEntry for biomarkers with content. | ✓ |

**User's choice:** Yes — extend BiomarkerEntry too
**Notes:** This created a content-location tension — resolved by storing content in `src/data/firstRunContent.ts` (imported by both screens) rather than locked inside GuidedFirstRunScreen.

---

### Since content must be shared, where does it live?

| Option | Description | Selected |
|--------|-------------|----------|
| src/data/firstRunContent.ts | New small data file imported by both screens. No BIOMARKERS schema change. | ✓ |
| Add explanationNote to BIOMARKERS data | Schema change across all 20+ entries. | |

**User's choice:** src/data/firstRunContent.ts

---

## Dashboard Empty State

### When no entries exist, how should the biomarker section look?

| Option | Description | Selected |
|--------|-------------|----------|
| Replace grid with focused empty state card | Hide placeholder grid; show single purposeful card + CTA. | ✓ |
| Keep grid + prominent CTA card at top | Existing dots grid stays; CTA card added above it. | |
| You decide | Leave to planner. | |

**User's choice:** Replace grid with focused empty state card

---

### What does the "Get started" CTA do?

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate to GuidedFirstRunScreen | Re-triggers the full guided flow. | ✓ |
| Navigate directly to BiomarkerEntry | Skips guided flow; user misses clinical education. | |
| Show bottom sheet with options | Sheet with 'Guided walkthrough' and 'Log manually'. More UI to build. | |

**User's choice:** Navigate to GuidedFirstRunScreen

---

### Should LongevityScore section show when empty?

| Option | Description | Selected |
|--------|-------------|----------|
| Show locked / greyed out (existing locked prop) | Motivational preview of what data unlocks. | ✓ |
| Hide score section entirely when empty | Cleaner but loses motivational preview. | |
| You decide | Leave to planner. | |

**User's choice:** Show locked / greyed out using existing FutureSelf locked prop

---

## First-Run Completion Tracking

### How to track completion/skip?

| Option | Description | Selected |
|--------|-------------|----------|
| @vitalspan_first_run_complete (boolean) | Simple bool — true when finished or skipped. Matches onboardingComplete pattern. | ✓ |
| @vitalspan_first_run_state (step tracking) | Track last completed step for mid-flow resumption. | |
| Infer from entries | No new key — if all 3 guided biomarkers logged, treat as complete. | |

**User's choice:** @vitalspan_first_run_complete (simple boolean)

---

### When does the flag get written true?

| Option | Description | Selected |
|--------|-------------|----------|
| On skip AND on completing all 3 steps | Both paths write true. Flag = 'user has seen and dismissed'. | ✓ |
| Only on completing all 3 steps | Skip writes nothing; CTA keeps showing until all 3 logged. | |
| Only on skip — completion inferred from entries | Hybrid. More complex Dashboard logic. | |

**User's choice:** On skip AND on completing all 3 steps

---

### Where does GuidedFirstRunScreen navigate after completion?

| Option | Description | Selected |
|--------|-------------|----------|
| nav.reset to Main — same as OnboardingScreen | Full stack reset to Dashboard. No back to guided flow. | ✓ |
| nav.goBack() to Dashboard | Only works if Dashboard is already in stack (not after onboarding). | |
| Navigate to LongevityScore, then Main | Celebration step before Dashboard. Adds complexity. | |

**User's choice:** nav.reset({ index: 0, routes: [{ name: 'Main' }] })

---

## Claude's Discretion

- Exact wording of "Why it matters" body copy for Glucose, HbA1c, Cholesterol — pharmacist-accurate, plain English, 2–3 sentences per biomarker
- Exact layout spacing and icon choice for the explanation card within BreathingCard
- Whether the step progress indicator is dot pagination or "1/3" text label
- Skip button label wording (suggested: "I'll do this later" or "Remind me later" — non-dismissive)

## Deferred Ideas

- LongevityScore celebration screen after completing all 3 guided steps — good for a future UX polish phase
- Step-progress tracking (`@vitalspan_first_run_state`) for mid-flow resumption — overkill for 3 short steps in Phase 1
- Schema-wide `explanationNote` field on all 20+ BIOMARKERS entries — Phase 1 starts with just the 3 in `firstRunContent.ts`
