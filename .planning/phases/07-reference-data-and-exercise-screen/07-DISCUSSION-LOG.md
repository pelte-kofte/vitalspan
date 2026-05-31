# Phase 7: Reference Data & Exercise Screen - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-31
**Phase:** 7 — Reference Data & Exercise Screen
**Areas discussed:** Data layer pattern, biomarker_definitions scope, Log section grouping, Swipe-to-delete approach

---

## Data Layer Pattern

### Q1: Where should the Supabase fetch + fallback logic live?

| Option | Description | Selected |
|--------|-------------|----------|
| Service files | `src/lib/exerciseService.ts` + `src/lib/biomarkerService.ts`. Each exports a single async function. | ✓ |
| Custom hooks | `useExercises.ts` + `useBiomarkerDefinitions.ts`. React-idiomatic but more boilerplate. | |
| Inline in screens | Fetch logic in screens, consistent with AsyncStorage pattern. Hard to reuse. | |

**User's choice:** Service files (recommended)
**Notes:** No elaboration — selected recommended option.

---

### Q2: Which screens should consume biomarker_definitions from Supabase?

| Option | Description | Selected |
|--------|-------------|----------|
| BiomarkersScreen only | Keeps scope tight; Dashboard and LongevityScore stay on static array. | |
| All biomarker consumers | BiomarkersScreen, BiomarkerDetailScreen, BiomarkerEntryScreen, LongevityScoreScreen all use service. | ✓ |
| No screen changes | Just seed the table; no client fetch changes in Phase 7. | |

**User's choice:** All biomarker consumers
**Notes:** User opted for broader consistency despite higher surface area.

---

### Q3: How should the Supabase tables be seeded?

| Option | Description | Selected |
|--------|-------------|----------|
| SQL seed files in repo | `src/db/seed_*.sql` committed, run once via Supabase SQL editor. | ✓ |
| Supabase migration files | `supabase/migrations/` folder, uses supabase CLI. Adds tooling dependency. | |
| Manual via dashboard | Nothing committed. Not reproducible. | |

**User's choice:** SQL seed files in repo (recommended)
**Notes:** No elaboration — selected recommended option.

---

## biomarker_definitions Scope

### Q1: What fields go in the biomarker_definitions Supabase table?

| Option | Description | Selected |
|--------|-------------|----------|
| Ranges only | `id, name, unit, opt_min, opt_max, category`. UI fields stay static. | |
| Full metadata | Every field including `howToImprove`, `insight`. Entirely in Supabase. | |
| Ranges + display strings | `id, name, unit, opt_min, opt_max, category, target, description`. Middle ground. | ✓ |

**User's choice:** Ranges + display strings
**Notes:** Allows updating clinical descriptions without app releases.

---

### Q2: How should the service merge Supabase data with the static array?

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase overrides static | Supabase values overwrite field-by-field on matching id. Static UI fields preserved. | ✓ |
| Static always wins | Supabase fetched but app renders static. Defeats purpose of SUPA-04. | |
| Supabase replaces entire array | Online: render only Supabase rows. Requires all fields in table. | |

**User's choice:** Supabase overrides static (recommended)
**Notes:** No elaboration — selected recommended option.

---

### Q3: Seed all 59 exercises or a curated subset?

| Option | Description | Selected |
|--------|-------------|----------|
| All 59 exercises | Seed complete EXERCISES array. Supabase = authoritative source; static = fallback. | |
| Curated longevity subset | 20–30 exercises, more meaningful for longevity use case. Requires manual curation. | |
| All 59 + extend in Supabase | Seed all 59 now; add more directly in Supabase later without app updates. | ✓ |

**User's choice:** All 59 + extend in Supabase
**Notes:** Schema should be forward-compatible to accommodate future exercises added via dashboard.

---

## Log Section Grouping

### Q1: What does "This Week" mean?

| Option | Description | Selected |
|--------|-------------|----------|
| Calendar week Mon–Sun, excluding today | Standard calendar week; most intuitive for users. | ✓ |
| Rolling 7 days, excluding today | Rolling window; simpler to compute but shifts daily. | |

**User's choice:** Calendar week Mon–Sun, excluding today (recommended)
**Notes:** No elaboration — selected recommended option.

---

### Q2: What does "History" show?

| Option | Description | Selected |
|--------|-------------|----------|
| Last 14 days before this week | Total window: today + this week + 14 prior days. Clean boundary. | ✓ |
| Last 14 calendar days, excluding today + this week | 0–9 days depending on day of week. Potentially confusing. | |

**User's choice:** Last 14 days before this week (recommended)
**Notes:** No elaboration — selected recommended option.

---

### Q3: What if a section is empty?

| Option | Description | Selected |
|--------|-------------|----------|
| Hide the section entirely | Header and card don't appear when section has no entries. | ✓ |
| Show header with empty state message | Always visible structure, reminds user the section exists. | |

**User's choice:** Hide the section entirely (recommended)
**Notes:** Keeps the screen clean; avoids visual noise from empty section headers.

---

## Swipe-to-Delete Approach

### Q1: How should swipe-to-delete be implemented?

| Option | Description | Selected |
|--------|-------------|----------|
| Reanimated + PanGestureHandler | No new deps. Matches existing animation style. Full control. | ✓ |
| react-native-swipe-list-view | Dedicated package; needs Expo SDK 54 compat check. New dependency. | |
| Simple translate with Animated API | Built-in Animated API. Lower fidelity but simpler code. | |

**User's choice:** Reanimated + PanGestureHandler (recommended)
**Notes:** Both libraries already installed; consistent with existing app animation approach.

---

### Q2: What happens when delete is triggered?

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate delete, no confirmation | Full swipe → delete instantly with haptic. iOS native pattern. | ✓ |
| Reveal red Delete button, tap to confirm | Two-step; prevents accidental deletion but adds friction. | |
| Keep Alert confirmation | Swipe reveals button, tap shows existing Alert. Jarring UX. | |

**User's choice:** Immediate delete, no confirmation (recommended)
**Notes:** Log entries are not critical data; accidental deletes recoverable by re-logging. iOS Mail-style pattern.

---

### Q3: Keep long-press delete as fallback?

| Option | Description | Selected |
|--------|-------------|----------|
| Remove long-press | Swipe is canonical. Unambiguous interactions. | ✓ |
| Keep long-press as well | Both gestures work. Accessibility benefit. | |

**User's choice:** Remove long-press (recommended)
**Notes:** No elaboration — selected recommended option.

---

## Claude's Discretion

- Swipe threshold distance (chose 80px) — not asked; reasonable iOS standard
- Red background behind row during swipe — implementation detail not discussed, visual affordance is standard
- Exact `Colors.status.*` token mapping for intensity colors — instructed to check theme file; specific tokens deferred to implementation

## Deferred Ideas

- User biomarker write path / Supabase sync — Phase 8
- Trend charts (BiomarkerDetail sparklines) — v3+
- Exercise history beyond 14 days — future history tab or export feature
