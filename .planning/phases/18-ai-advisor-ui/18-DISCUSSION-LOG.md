# Phase 18: AI Advisor — UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-15
**Phase:** 18-ai-advisor-ui
**Areas discussed:** Generation UX, Layout structure, Score Summary card, Evidence grade badges

---

## Generation UX

### When does report generation trigger?

| Option | Description | Selected |
|--------|-------------|----------|
| CTA button | Screen opens with dark hero + "Generate My Report" button. User taps to start. | ✓ |
| Auto-generate on open | Report starts generating immediately on screen open. | |
| You decide | Leave to planner. | |

**User's choice:** CTA button
**Notes:** Explicit trigger makes the AI call intentional and communicates the wait.

---

### What does the 10–30s loading state look like?

| Option | Description | Selected |
|--------|-------------|----------|
| Skeleton cards | 6 shimmer placeholder cards animate while Claude processes. | |
| Full-screen spinner with message | Dark screen with NeuralGrid animation + "Analyzing your health snapshot…" text. | ✓ |
| Progress steps text | Sequential fake-progress text ("Reading biomarkers…", etc.). | |

**User's choice:** Full-screen spinner with message
**Notes:** Matches LongevityScoreScreen loading aesthetic.

---

### Can the user regenerate the report in the same session?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — Regenerate button visible | Button in top bar or at bottom of report; counts against daily limit. | ✓ |
| No — once generated, read-only | Report is final for the session; user must close/reopen. | |
| You decide | Leave to planner. | |

**User's choice:** Yes — Regenerate button visible

---

## Layout Structure

### How are the report and chat organized?

| Option | Description | Selected |
|--------|-------------|----------|
| Single ScrollView — report + chat at bottom | All 6 cards scroll vertically; chat thread + input below. | ✓ |
| Two tabs — Report / Chat | Tab bar switching between report and chat views. | |
| Report-first, chat is a bottom sheet | Chat slides up as a bottom sheet over the report. | |

**User's choice:** Single ScrollView — report + chat at bottom

---

### Where does the chat text input sit?

| Option | Description | Selected |
|--------|-------------|----------|
| Pinned to bottom of screen | Fixed input bar at bottom; keyboard-aware; standard chat pattern. | ✓ |
| Inline at end of ScrollView | Input as last item in scroll; user must scroll down to reach it. | |

**User's choice:** Pinned to bottom of screen

---

### Are the 6 report sections collapsible?

| Option | Description | Selected |
|--------|-------------|----------|
| Always expanded | All cards fully visible on scroll. | ✓ |
| Collapsible accordion | Each section collapses/expands on tap. | |

**User's choice:** Always expanded
**Notes:** Don't hide premium content behind extra taps after a 30s wait.

---

## Score Summary Card

### How does Score Summary display the biological age?

| Option | Description | Selected |
|--------|-------------|----------|
| Large number + headline text | Large biologicalAge centered, ageBand below, Claude headline as 2-line text. | ✓ |
| Reuse LongevityScoreScreen orbital SVG | Same sphere + orbital animation from LongevityScoreScreen. | |
| You decide | Leave visual to planner. | |

**User's choice:** Large number + headline text
**Notes:** No SVG animation — LongevityScoreScreen already owns that pattern. Simpler card keeps Phase 18 focused on content.

---

### What color theme do the report cards use?

| Option | Description | Selected |
|--------|-------------|----------|
| Dark neural (same as AIAdvisorScreen stub) | #080D09 → #0F1C14 gradient, dark surface cards. | ✓ |
| Dark with subtle card elevation | Dark background, slightly lighter surface per card. | |
| You decide | Leave to planner. | |

**User's choice:** Dark neural (same as AIAdvisorScreen stub)

---

## Evidence Grade Badges

### What color coding for A/B/C badges?

| Option | Description | Selected |
|--------|-------------|----------|
| Match intensity pills | A = green, B = amber, C = coral (same as ExerciseScreen). | ✓ |
| Custom grade palette | A = accent green, B = muted gold, C = gray. | |

**User's choice:** Match intensity pills
**Notes:** Reuses existing color semantics — no new color tokens needed.

---

### What happens when a recommendation doesn't match the supplement/drug DB?

| Option | Description | Selected |
|--------|-------------|----------|
| No badge shown | Recommendation appears without grade badge. | ✓ |
| Default 'C' grade | Unmatched items get a C badge. | |
| You decide | Leave to planner. | |

**User's choice:** No badge shown
**Notes:** No made-up grades for unverified items.

---

## Claude's Discretion

None — all gray areas had clear user choices.

## Deferred Ideas

- Report history / past reports (v5.0)
- Streaming Claude responses (future phase)
- Share / PDF export (out of scope for v4.0)
- Adaptive rate limits by subscription tier (future Adapty webhook integration)
