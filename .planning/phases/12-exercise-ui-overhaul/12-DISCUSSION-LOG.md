# Phase 12: Exercise UI Overhaul - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-05
**Phase:** 12-exercise-ui-overhaul
**Areas discussed:** SVG illustration strategy, Exercise detail surface, Muscle map selector, Content authorship

---

## SVG Illustration Strategy

### Q1: Illustration level

| Option | Description | Selected |
|--------|-------------|----------|
| Per-exercise unique SVG | 60 individual movement illustrations — gold standard (Strong app, JEFIT). High effort, realistic fitness app feel. | |
| Movement-archetype SVGs (8–12 shared) | All squats share one "squat" illustration, etc. Faster, lower quality. | |
| Neural-dot movement figure | Simple stick/silhouette in NeuralGrid neural-dot aesthetic with directional arrows. Unique to Vitalspan. | ✓ |

**User's choice:** Neural-dot movement figure

### Q2: How many unique figures?

| Option | Description | Selected |
|--------|-------------|----------|
| One per archetype (~12–15 figures) | Movement families shared. Realistic scope. | |
| One per exercise (60 figures) | Every exercise unique. Researcher generates SVG code. | ✓ |
| One per category (8 figures) | Minimal scope, lower quality. | |

**User's choice:** One per exercise (60 figures)
**Notes:** SVG is code, not artwork — researcher can generate all 60 programmatically.

### Q3: Static or animated?

| Option | Description | Selected |
|--------|-------------|----------|
| Static figures | SVG snapshots of end position. No animation overhead. | ✓ |
| 2-frame loop animation | Start→end position loop. Shows movement. Heavier. | |
| You decide | Let Claude choose. | |

**User's choice:** Static figures

### Q4: Figure color scheme

| Option | Description | Selected |
|--------|-------------|----------|
| Accent color (neural blue-green) | Colors.accent on Beige surface. Consistent with neural aesthetic. | ✓ |
| Dark text color on Beige | Charcoal figure on cream. More clinical. | |
| You decide | Let Claude choose. | |

**User's choice:** Accent color (neural blue-green)

---

## Exercise Detail Surface

### Q1: Where does detail content live?

| Option | Description | Selected |
|--------|-------------|----------|
| New ExerciseDetailScreen (stack nav) | Full-screen detail card pushed from library. | ✓ |
| Expanded bottom sheet | Full-height modal over ExerciseScreen. No new screen. | |
| Accordion/inline expand in list | Tapping row expands inline. No navigation. | |

**User's choice:** New ExerciseDetailScreen (stack nav)

### Q2: Layout of detail screen?

| Option | Description | Selected |
|--------|-------------|----------|
| Neural figure → muscle map → metadata → form cue + sets/reps → Log CTA | Full scroll top-to-bottom. | ✓ |
| Muscle map → neural figure → metadata → form cue + sets/reps → Log CTA | Muscle map gets prime real estate at top. | |
| You decide | Let Claude pick the layout. | |

**User's choice:** Neural-dot figure → muscle map → metadata chips → form cue + sets/reps → Log CTA

### Q3: How does logging work from detail screen?

| Option | Description | Selected |
|--------|-------------|----------|
| Open existing QuickLogModal | Reuse the existing bottom sheet. No duplication. | ✓ |
| Inline log fields on detail screen | Fields directly on the screen. Clutters layout. | |
| Navigate back and open QuickLogModal | Pop to ExerciseScreen then trigger modal. Awkward. | |

**User's choice:** Open existing QuickLogModal

---

## Muscle Map Selector — Interaction Model

### Q1: Front view only or front + back?

| Option | Description | Selected |
|--------|-------------|----------|
| Front + back (toggle button) | Two views; flip button. Necessary for posterior muscles. | ✓ |
| Front view only | Simpler. Back muscles shown approximately on front. | |
| You decide | Let Claude pick based on muscle data. | |

**User's choice:** Front + back (two views, toggle button)

### Q2: Visual style of silhouette?

| Option | Description | Selected |
|--------|-------------|----------|
| Neural-dot grid overlaid on silhouette | NeuralGrid aesthetic. Dot grid highlights by muscle region. | ✓ |
| Clean anatomical regions (colored polygons) | Medical-style flat colored regions. | |
| Outline only, highlight filled regions | Plain outline with fill color on tap/highlight. | |

**User's choice:** Neural-dot grid overlaid on silhouette

### Q3: Filter granularity?

| Option | Description | Selected |
|--------|-------------|----------|
| Muscle-level regions (~12–15) | Maps to actual muscleGroup values in exercises.ts. | ✓ |
| Body-zone regions (8 zones) | Match 8 exercise categories. Less anatomically precise. | |
| You decide | Let Claude map exercise data to optimal count. | |

**User's choice:** Muscle-level regions (~12–15 regions)

### Q4: Replace or coexist with category chips?

| Option | Description | Selected |
|--------|-------------|----------|
| Muscle map replaces category chips | Single filtering paradigm. | |
| Both coexist | Category chips + body map as dual filters. Standard fitness app pattern. | ✓ |
| Muscle map is a modal/overlay | Filter button opens body map modal. | |

**User's choice:** Both coexist — category chips remain, muscle map is a separate filter panel

---

## Content Authorship — Sets/Reps & Form Cues

### Q1: Who generates the content?

| Option | Description | Selected |
|--------|-------------|----------|
| AI-generated + pharmacist review checkpoint | Researcher generates all 60, pharmacist reviews before commit. | ✓ |
| Pharmacist provides content directly | User provides sets/reps and form cues as input. | |
| AI-generated, no explicit review step | Researcher commits directly. Fastest path. | |

**User's choice:** AI-generated + pharmacist review checkpoint

### Q2: Training framework for sets/reps?

| Option | Description | Selected |
|--------|-------------|----------|
| Peter Attia / Outlive framework | Centenarian Decathlon: stability, Zone 2, strength. Well-cited. | ✓ |
| General longevity literature (Longo, de Cabo) | Broader research sources. Less prescriptive. | |
| User-specified protocol | Custom reference from the user. | |

**User's choice:** Peter Attia / Outlive framework

### Q3: Data model location?

| Option | Description | Selected |
|--------|-------------|----------|
| New fields on Exercise interface in exercises.ts | Additive optional fields. All exercise data in one file. | ✓ |
| Separate data file (exerciseContent.ts) | exercises.ts unchanged. Separate id→content map. | |
| You decide | Let Claude choose most maintainable approach. | |

**User's choice:** New fields on Exercise interface in exercises.ts

---

## Claude's Discretion

None — all decisions were made explicitly by the user.

## Deferred Ideas

None — discussion stayed within phase scope.
