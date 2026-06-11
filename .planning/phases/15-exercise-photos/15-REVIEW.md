---
phase: 15-exercise-photos
reviewed: 2026-06-11T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/data/exercises.ts
  - src/screens/ExerciseDetailScreen.tsx
  - package.json
findings:
  critical: 2
  warning: 3
  info: 2
  total: 7
status: issues_found
---

# Phase 15: Code Review Report

**Reviewed:** 2026-06-11
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Phase 15 adds `photoKey?: string` to the `Exercise` interface plus 44 photoKey values in the static exercises array, constructs CDN URLs pointing to `yuhonas/free-exercise-db` via jsDelivr, and renders them through `expo-image` v3 with a three-tier fallback (CDN photo → SVG illustration → placeholder text).

The expo-image integration itself is technically correct: the package version (`~3.0.11`) is the SDK 54 bundled version, the `source` prop accepts a plain string, `transition={number}` is valid, and `onError` has the right signature. The CDN URL format is also correct for the upstream repo's folder structure.

However, there is a showstopper data-path bug: `exerciseService.ts` — the module that feeds the screen — does not map `photoKey` from Supabase rows, and the Supabase table schema has no `photo_key` column at all. Every user whose app fetches live data from Supabase will see zero CDN photos. Only users who hit the static fallback path (Supabase unreachable or empty) will ever see photos. This makes the feature non-functional in production.

Two additional warnings cover a crash path in `equipShort()` with empty-string equipment and missing cleanup in the async fetch effect.

---

## Critical Issues

### CR-01: `photoKey` is never mapped from Supabase — feature is broken for all live-DB users

**File:** `src/lib/exerciseService.ts` (entire `ExerciseRow` interface and `mapRowToExercise` function)
**Also affects:** `src/db/seed_exercises.sql` (schema)

**Issue:** `ExerciseRow` does not declare a `photo_key` field, and `mapRowToExercise` does not include `photoKey` in the returned object. When `getExercises()` successfully retrieves rows from Supabase (the non-fallback path), every mapped exercise has `photoKey: undefined`. The CDN photo banner is therefore never rendered for any exercise — all 44 photoKey values in `exercises.ts` are silently ignored. This affects every user whose Supabase instance is reachable and has data, which is the normal production path.

Additionally, the `CREATE TABLE` statement in `seed_exercises.sql` has no `photo_key` column, so fixing the TypeScript side alone is insufficient: the DB column must also be added.

**Fix — Step 1: add the column to the schema**
```sql
-- Add to seed_exercises.sql CREATE TABLE block, or run as a migration:
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS photo_key text;

-- Then add the value in each INSERT, e.g.:
INSERT INTO exercises (id, name, ..., photo_key) VALUES
('0720', 'Side-to-Side Chin', ..., 'Side_To_Side_Chins')
ON CONFLICT (id) DO NOTHING;
```

**Fix — Step 2: extend `ExerciseRow` and `mapRowToExercise` in `exerciseService.ts`**
```typescript
interface ExerciseRow {
  id: string;
  name: string;
  category: string;
  body_part: string | null;
  equipment: string | null;
  muscle_group: string | null;
  secondary_muscles: string[] | null;
  target: string | null;
  instructions: string | null;
  illustration_id: string | null;
  form_cue: string | null;
  sets_reps: string | null;
  longevity_note: string | null;
  photo_key: string | null;   // <-- add this
}

function mapRowToExercise(row: ExerciseRow): Exercise {
  return {
    // ...existing fields...
    photoKey: row.photo_key ?? undefined,  // <-- add this
  };
}
```

---

### CR-02: `equipShort('')` throws `TypeError: Cannot read properties of undefined (reading 'toUpperCase')` when equipment is an empty string

**File:** `src/screens/ExerciseDetailScreen.tsx:25`

**Issue:** When `EQUIPMENT_SHORT[eq]` has no match, the fallback is:
```ts
eq.split(' ').map(w => w[0].toUpperCase()).join('')
```
If `eq` is `''`, `''.split(' ')` returns `['']`, and `w[0]` on the empty string `''` is `undefined`. Calling `.toUpperCase()` on `undefined` throws a `TypeError` and crashes the screen.

`mapRowToExercise` in `exerciseService.ts` already maps `equipment: row.equipment ?? ''`, so any exercise row with a `NULL` equipment column produces exactly this input. The Supabase schema declares `equipment text` (nullable), so this crash is reachable in the live-DB path.

**Fix:**
```typescript
function equipShort(eq: string): string {
  if (!eq) return '—';
  return EQUIPMENT_SHORT[eq] ?? eq.split(' ').map(w => w[0]?.toUpperCase() ?? '').join('');
}
```

---

## Warnings

### WR-01: `useFocusEffect` async fetch has no cleanup — `setExercise` / `setLoading` can fire on an unmounted component

**File:** `src/screens/ExerciseDetailScreen.tsx:40–48`

**Issue:** The effect starts an async chain (`getExercises().then(...)`) and returns an empty cleanup function `() => {}`. If the user navigates back before the Supabase query resolves, the `.then()` callback will call `setExercise` and `setLoading` on the unmounted screen instance. React Native prints a warning in development and the state updates are silently discarded in production, but the pattern is fragile and will trigger the warning on every fast back-navigation.

**Fix:** Use an `isMounted` flag to guard the state updates:
```typescript
useFocusEffect(useCallback(() => {
  let isMounted = true;
  setLoading(true);
  getExercises().then(exs => {
    if (!isMounted) return;
    setExercise(exs.find(e => e.id === exerciseId) ?? null);
    setLoading(false);
  }).catch(() => { if (isMounted) setLoading(false); });
  return () => { isMounted = false; };
}, [exerciseId]));
```

---

### WR-02: CDN URL uses a floating `@main` branch reference — upstream changes silently break photos

**File:** `src/screens/ExerciseDetailScreen.tsx:74`

**Issue:** The URL template is:
```
https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${exercise.photoKey}/0.jpg
```
The `@main` ref resolves to whatever is currently at the HEAD of the default branch of `yuhonas/free-exercise-db`. If that repo renames folders, restructures its image layout, or removes the images entirely, all 44 photos stop loading with no warning and no version lock to fall back to. The `onError` → SVG fallback does handle this gracefully at runtime, but there is no indication in the codebase that the breakage has occurred.

**Fix:** Pin to a specific commit SHA or git tag:
```typescript
// Pin to a known-good commit, update deliberately when upgrading
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@<commit-sha>/exercises';
const photoUrl = exercise.photoKey && !photoError
  ? `${CDN_BASE}/${exercise.photoKey}/0.jpg`
  : null;
```
Add a comment in the file documenting the last verified commit and the date it was validated.

---

### WR-03: `getExercises()` error leaves the screen in a silent "Exercise not found" dead end with no retry

**File:** `src/screens/ExerciseDetailScreen.tsx:46`

**Issue:** When `getExercises()` throws (the `.catch()` branch), `exercise` remains `null` and `loading` becomes `false`. The screen renders the "Exercise not found." state with only a "Go Back" button. The user has no way to retry, and there is no visual signal that a network error occurred rather than a genuinely missing exercise. Because `getExercises()` always falls back to `EXERCISES` on any error (exerciseService.ts catches all exceptions), this path is currently unreachable in practice — but the mismatch between the error handler and the service's own guarantees is a brittleness that could surface if `getExercises` is ever changed.

**Fix:** Either surface the error state explicitly:
```typescript
const [fetchError, setFetchError] = useState(false);
// in .catch: setFetchError(true); setLoading(false);
// render: "Could not load exercise. Tap to retry."
```
Or document that the catch branch is an impossible state given exerciseService's design.

---

## Info

### IN-01: Hardcoded numeric padding in `ctaBtn` style violates project coding rules

**File:** `src/screens/ExerciseDetailScreen.tsx:192`

**Issue:** `padding: 15` is a hardcoded number. CLAUDE.md states: "All spacing from `Spacing.*` — never hardcode margin/padding numbers."

**Fix:**
```typescript
ctaBtn: { backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.base, alignItems: 'center', ...Elevation.sm },
```
(`Spacing.base` is typically 16 — close enough to 15 that the visual result is unchanged. Adjust to `Spacing.md` if the exact value matters.)

---

### IN-02: `useEffect([exerciseId])` reset for `photoError` is dead code on a stack navigator

**File:** `src/screens/ExerciseDetailScreen.tsx:38`

**Issue:**
```typescript
useEffect(() => { setPhotoError(false); }, [exerciseId]);
```
`ExerciseDetailScreen` is registered as a stack screen (not a tab screen). React Navigation pushes a new screen instance for each `navigate('ExerciseDetail', { exerciseId })` call, so `exerciseId` never changes for a mounted instance — state resets to `false` automatically via the new component mount. The effect fires exactly once (on initial mount) and never again, making it semantically equivalent to no-op initialization that `useState(false)` already handles.

**Fix:** Remove the effect. The `useState(false)` initializer is sufficient:
```typescript
// Remove this line entirely:
// useEffect(() => { setPhotoError(false); }, [exerciseId]);
```
If this screen is ever converted to receive `exerciseId` as a tab-level param that can change without remounting, this reset should be restored.

---

_Reviewed: 2026-06-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
