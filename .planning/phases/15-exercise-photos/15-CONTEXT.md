# Phase 15: Exercise Photos - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Add CDN-hosted JPG photos to `ExerciseDetailScreen` for exercises with a `photoKey` mapping. When a `photoKey` is present, the illustration area expands to a full-width banner (~220px tall) and renders the photo via `expo-image` (with disk caching). When no `photoKey` exists, the screen shows the existing Phase 12 SVG illustration unchanged. A failed photo load falls back silently to the SVG.

Deliverables:
1. `photoKey?: string` added to the `Exercise` interface and populated for 42+ of 60 exercises
2. `expo-image` installed (Expo SDK 54 compatible)
3. `ExerciseDetailScreen` updated to render photo banner when `photoKey` is present, SVG otherwise
4. All 60 exercises have a `photoKey` mapping attempt — unmatched exercises intentionally left undefined

</domain>

<decisions>
## Implementation Decisions

### Photo Display Layout

- **D-01:** **Full-width banner layout (~220px tall)** — when a photo is present, the illustration area expands to a full-width card with a fixed ~220px height. The photo fills the banner using `contentFit: 'cover'` (center-cropped). The card retains the same border-radius, border, and shadow (`Elevation.sm`) as the existing `illustrationCard`.
- **D-02:** **SVG fallback keeps the existing 160×160 square layout** — when no `photoKey` is present (or photo fails to load), the screen renders the existing `IllustrationComponent size={160}` in the original `illustrationCard` styling. No layout change for unmapped exercises.
- **D-03:** **No overlay on the photo** — clean photo fill, no gradient, no in-photo text. Exercise name is shown in the header above.

### Photo Layout: Two distinct illustration card sizes

When `photoKey` is defined and photo loads: use `s.illustrationCardPhoto` (full-width, 220px tall).
When no `photoKey` or photo fails: use `s.illustrationCard` (existing 160×160 square). These are two separate card styles in the same StyleSheet.

### photoKey Sourcing

- **D-04:** **Pre-researched mapping table** — the research agent browses `yuhonas/free-exercise-db`, matches all 60 exercises by name/category similarity, and produces a ready-to-use `photoKey` mapping table. The planner hardcodes the verified table directly into `exercises.ts`. No mapping script needed.
- **D-05:** **Unmatched exercises → leave `photoKey` undefined** — exercises the researcher cannot confidently match get no `photoKey`. They show the SVG fallback. A best-effort guess with wrong exercise content is worse than no photo.

### Photo Loading & Failure UX

- **D-06:** **Neutral grey placeholder while loading** — `expo-image` renders a solid neutral background in the banner area while the JPG downloads on first visit, then crossfades to the photo. No spinner, no SVG shown during loading.
- **D-07:** **On load failure → fall back to SVG silently** — `onError` callback sets local error state; the component swaps to `IllustrationComponent` in the 160×160 `illustrationCard`. User sees the SVG as if the exercise were unmapped. No error message shown.

### CDN URL Strategy

- **D-08:** **jsDelivr CDN base URL** — photos are loaded from:
  ```
  https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{photoKey}/images/0.jpg
  ```
  jsDelivr is a proper CDN (global PoPs, correct caching headers, designed for GitHub asset delivery). `raw.githubusercontent.com` is explicitly excluded — not a CDN, rate-limited, unreliable for production.
- **D-09:** **`photoKey` value is the yuhonas exercise folder name** (e.g., `"Barbell-Deadlift"` for `exercises/Barbell-Deadlift/images/0.jpg`). The research agent must confirm the exact folder naming convention from the yuhonas repo.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Exercise Data & Screen
- `src/data/exercises.ts` — `Exercise` interface + 60 exercise definitions. Phase 15 adds `photoKey?: string` to the interface and populates mappings.
- `src/screens/ExerciseDetailScreen.tsx` — Current illustration rendering logic (`IllustrationComponent` lookup from `exercise.illustrationId`). Phase 15 modifies the illustration area to conditionally render photo vs SVG.
- `src/components/exercise-illustrations/` — 60 SVG illustration components (barrel-exported). These remain the fallback — do not remove or rename them.

### Requirements
- `.planning/REQUIREMENTS.md §EXP-01, EXP-02, EXP-03` — The 3 exercise photo requirements; authoritative acceptance criteria for this phase.

### External Data Source
- yuhonas/free-exercise-db GitHub repo — the research agent must confirm: exact folder naming convention, image path structure (`exercises/{id}/images/0.jpg`), and which of our 60 exercises have valid matches.
- CDN base: `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/`

### Dependencies
- `expo-image` (not currently installed) — Expo SDK 54 compatible package for CDN loading + disk caching. Install via `npx expo install expo-image`. Research agent must confirm SDK 54 compatibility before the plan uses it.

### Prior Phase Context
- `.planning/phases/12-exercise-ui-overhaul/` — Phase 12 created the 60 SVG illustrations and `ExerciseDetailScreen`. Phase 15 must not regress any Phase 12 behavior for unmapped exercises.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ExerciseIllustrations` barrel import (`src/components/exercise-illustrations/index.ts`): used as `(ExerciseIllustrations as Record<string, React.ComponentType<{ size?: number }>>)[exercise.illustrationId]` — this pattern stays for the SVG fallback path.
- `Elevation.sm`, `Radius.xl`, `Colors.surface`, `Colors.borderLight`, `Spacing.xl` — all in `src/theme/index.ts`. Photo banner card uses the same tokens as `illustrationCard`.

### Established Patterns
- Two-tier render based on optional field: `exercise.illustrationId` already drives the SVG lookup with a null-check. `exercise.photoKey` follows the same pattern — check before rendering the photo.
- `StyleSheet` named `s` at bottom of file — add `s.illustrationCardPhoto` for the 220px banner variant; leave `s.illustrationCard` unchanged.
- `useFocusEffect` + `useCallback` pattern already in `ExerciseDetailScreen` for data loading — do not add additional hooks, just add `photoError` local state for the failure fallback.
- No inline styles except dynamic ones (CLAUDE.md constraint).

### Integration Points
- `Exercise` interface in `src/data/exercises.ts` — add `photoKey?: string`. The `getExercises()` service returns these objects; adding an optional field is non-breaking.
- `ExerciseDetailScreen.tsx` illustration area (lines ~82–91): replace the single `IllustrationComponent` block with a three-tier conditional: photo (if `photoKey` defined and no error) → SVG (if `illustrationId`) → neutral placeholder (neither). The neutral placeholder is the existing `illustrationPlaceholder` style.
- No navigation changes, no new screens, no AsyncStorage keys.

</code_context>

<specifics>
## Specific Ideas

- The photo banner should feel like a reference card — clean, wide, just the exercise. No decorative overlays. The clinical-premium tone of the app means the photo should look purposeful, not glossy.
- For the `photoKey` field: the research agent should output a table of all 60 exercises with their mapped yuhonas folder name (or `undefined` if unmatched). The planner copies this table directly into `exercises.ts`.
- `expo-image` transition: use `transition={200}` prop for a 200ms crossfade from placeholder to photo — smooth but not slow.

</specifics>

<deferred>
## Deferred Ideas

- **GIF animations instead of static JPGs** — yuhonas/free-exercise-db also provides animated GIFs for some exercises. Showing the start→end movement as a GIF would be more instructive but adds complexity (heavier files, autoplay behavior). Could be a future enhancement to Phase 15 work.
- **Video clips** — Full exercise demo video (from a licensed source) is a bigger feature for a later phase.
- **Photo upload by user** — letting users add their own form-check photo to an exercise detail is a personalization feature outside v4.0 scope.

</deferred>

---

*Phase: 15-exercise-photos*
*Context gathered: 2026-06-10*
