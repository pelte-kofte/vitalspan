# Phase 21: Exercise Routine & History - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 21-exercise-routine-and-history
**Areas discussed:** Rutinim/Keşfet layout, Per-set data model, Logging UX redesign, Overload metric for sparkline

---

## Rutinim/Keşfet Layout

### Default view

| Option | Description | Selected |
|--------|-------------|----------|
| Rutinim first | Opens to personal routine by default | |
| Keşfet first | Maintains current library-first behavior | |
| Smart default | Open Rutinim if routine has exercises, Keşfet if empty | ✓ |

**User's choice:** Smart default
**Notes:** New users land in Keşfet (library) naturally; returning users with a built routine go straight to it.

### Toggle style

| Option | Description | Selected |
|--------|-------------|----------|
| Segmented control at top | Two-segment pill pinned below header row | ✓ |
| Large tab pills in header | Bold two-tab row replacing screen title | |
| Floating bottom pill | Toggle at bottom of screen | |

**User's choice:** Segmented control at top

### Rutinim card content

| Option | Description | Selected |
|--------|-------------|----------|
| Name + last-session + trend badge | Exercise name, last weight/reps, trend arrow | |
| Name + illustration + trend badge | Same but also shows exercise photo thumbnail | ✓ |

**User's choice:** Include illustration thumbnail

---

## Per-Set Data Model

### Schema approach

| Option | Description | Selected |
|--------|-------------|----------|
| Add setsData?: SetRecord[] alongside existing fields | Backward-compat additive field | ✓ |
| Replace sets/reps with setsData | Breaking change, requires migration | |
| Add single top-level weightKg field | Simple but can't represent varying weights per set | |

**User's choice:** Additive `setsData?: SetRecord[]` — no migration, backward compat preserved.

### SetRecord shape for bodyweight

| Option | Description | Selected |
|--------|-------------|----------|
| weightKg is optional — omit for bodyweight | { reps: number; weightKg?: number } | ✓ |
| Always require weightKg, 0 for bodyweight | Explicit but semantically misleading | |
| Separate cardio path | Separate type for duration-based exercises | |

**User's choice:** `weightKg` optional — bodyweight entries just omit it.

### Type location

| Option | Description | Selected |
|--------|-------------|----------|
| Extend src/data/exercises.ts | Keep all exercise types in one file | ✓ |
| New src/types/exercise.ts | Clean separation, mirrors Phase 20 pattern | |

**User's choice:** Extend `src/data/exercises.ts` — consistent with existing pattern.

---

## Logging UX Redesign

### Set capture UX

| Option | Description | Selected |
|--------|-------------|----------|
| Simple summary form (3 inputs) | Sets × Reps × Weight — all sets assumed equal | ✓ |
| Per-set repeater | Log each set individually, one row per set | |
| Quick log counter | Tap to log each set in real-time during workout | |

**User's choice:** Simple form — fast and covers 95% of workouts.

### Modal scope

| Option | Description | Selected |
|--------|-------------|----------|
| Targeted edits — keep modal shape, replace intensity chips | Lower risk, less diff | ✓ |
| Full redesign from scratch | More work, regression risk | |

**User's choice:** Targeted edits to `QuickLogModal`.

### HIST-02 edit scope

| Option | Description | Selected |
|--------|-------------|----------|
| Sets, reps, weight only — date read-only | Aligns with HIST-02 wording | ✓ |
| All fields including date | Requires date picker | |
| You decide | Claude decides | |

**User's choice:** Sets/reps/weight only; date is read-only.

---

## Overload Metric for Sparkline

### Primary metric

| Option | Description | Selected |
|--------|-------------|----------|
| Max weight (heaviest set per week) | Simple, intuitive, clear progression signal | ✓ |
| Total volume (sets × reps × weight) | Comprehensive but hard to read | |
| Max reps at best weight | Good for bodyweight but complex to compute | |

**User's choice:** Max weight per week. Bodyweight fallback: max reps per week.

### Sparkline window

| Option | Description | Selected |
|--------|-------------|----------|
| 8 weeks (2 months) | Balance of history vs. readability | ✓ |
| 4 weeks | Tighter, recent-focus | |
| 12 weeks | Long-term trend | |

**User's choice:** 8 weeks.

### OVLD-02 trend badge computation

| Option | Description | Selected |
|--------|-------------|----------|
| Compare last 2 weeks of max weight | Simple, current vs. last week | ✓ |
| 4-week rolling average vs. prior 4 weeks | Stable signal, less noise | |
| You decide | Claude picks comparison window | |

**User's choice:** Compare this week vs. last week. ↑ / – / ↓ arrows.

---

## Claude's Discretion

None — all areas were answered explicitly by the user.

## Deferred Ideas

- **Multiple named routines** (Upper Body Day, Leg Day) — ROUT-MULTI, already marked deferred in REQUIREMENTS.md
- **AI-generated routine recommendations** — ROUT-AI, already deferred
- **Per-set repeater logging** — considered, user chose simple form
- **Backdating log entries** — date is read-only in edit sheet
- **Cardio separate path** — duration/calorie fields remain but no new UI for them in Phase 21
