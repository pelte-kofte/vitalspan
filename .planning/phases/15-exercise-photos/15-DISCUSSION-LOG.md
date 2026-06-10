# Phase 15: Exercise Photos - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-10
**Phase:** 15-exercise-photos
**Areas discussed:** Photo display layout, photoKey sourcing, Photo loading & failure UX, CDN URL strategy

---

## Photo Display Layout

### Q1: How much space should photos get?

| Option | Description | Selected |
|--------|-------------|----------|
| Full-width banner (~220px tall) | Photo spans full card width with fixed height — shows more image, looks like a proper exercise reference. SVG keeps existing 160px square. | ✓ |
| Same 160×160 square, center-crop | Consistent size regardless of source — landscape photos cropped at sides. No layout shift. | |
| Aspect ratio fill (natural dimensions) | No cropping, no fixed height — varies per exercise. Avoids cropping but creates inconsistent spacing. | |

**User's choice:** Full-width banner (~220px tall)
**Notes:** None

### Q2: Should the photo banner have any overlay treatment?

| Option | Description | Selected |
|--------|-------------|----------|
| Clean photo, no overlay | Raw photo fills the card — same rounded card with border/shadow as the SVG card, no gradient. | ✓ |
| Subtle dark gradient at bottom | Light-to-dark gradient fade at bottom. Looks cinematic but could conflict with clinical aesthetic. | |
| You decide | Clean card, matching existing illustrationCard style — let Claude handle styling details. | |

**User's choice:** Clean photo, no overlay
**Notes:** None

---

## photoKey Sourcing

### Q1: How should the 60 photoKey values be created?

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-researched mapping table | Research agent browses yuhonas repo, matches all 60 exercises, returns ready-to-use table. Planner hardcodes into exercises.ts. | ✓ |
| Name-match script, then manual review | Node script fuzzy-matches exercise names against yuhonas list, outputs candidates table for review. | |
| Manual curation | Browse yuhonas repo directly, hand-pick folder names. Most accurate, slowest. | |

**User's choice:** Pre-researched mapping table
**Notes:** None

### Q2: What should happen for exercises the researcher can't confidently match?

| Option | Description | Selected |
|--------|-------------|----------|
| Leave photoKey undefined — SVG fallback | Unmatched exercises have no photoKey. ExerciseDetailScreen shows Phase 12 SVG. Clean and safe. | ✓ |
| Best-effort guess — closest match even if imperfect | Use closest available yuhonas exercise even if not a perfect match. More coverage but risks showing wrong photo. | |

**User's choice:** Leave photoKey undefined — SVG fallback
**Notes:** Accuracy over coverage — wrong exercise photo is worse than no photo.

---

## Photo Loading & Failure UX

### Q1: What should users see while a photo is loading (first visit)?

| Option | Description | Selected |
|--------|-------------|----------|
| Neutral grey placeholder, fades to photo | expo-image renders solid neutral background while JPG downloads, then crossfades. No flicker. | ✓ |
| SVG illustration first, swap to photo when ready | Show SVG immediately, then replace with photo when loaded. Complex — layout shift from 160px to 220px would be jarring. | |
| Spinner while loading | ActivityIndicator centered in banner area. Explicit but unpolished for an image component. | |

**User's choice:** Neutral grey placeholder, fades to photo
**Notes:** None

### Q2: When expo-image fails to load the photo, what should happen?

| Option | Description | Selected |
|--------|-------------|----------|
| Fall back to SVG silently | onError callback sets error state — component swaps to IllustrationComponent. User never sees broken image. | ✓ |
| Show neutral placeholder permanently | Keep grey placeholder on failure — simpler but user sees empty grey box instead of useful SVG. | |
| Show error message in the banner | Display 'Photo unavailable' text. Explicit but draws attention to an infrastructure failure the user can't fix. | |

**User's choice:** Fall back to SVG silently
**Notes:** None

---

## CDN URL Strategy

### Q1: Which CDN base URL should we use?

| Option | Description | Selected |
|--------|-------------|----------|
| jsDelivr CDN | cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{photoKey}/images/0.jpg — proper CDN, global PoPs, good caching headers. | ✓ |
| raw.githubusercontent.com | Direct GitHub raw content — not a CDN, rate-limited, unreliable for production. | |
| Let research verify | Let research agent confirm exact URL format and CDN options before locking in. | |

**User's choice:** jsDelivr CDN
**Notes:** None

---

## Claude's Discretion

- `expo-image` transition duration set to 200ms — smooth crossfade from placeholder to photo without being slow.
- `contentFit: 'cover'` for photo cropping — center-crops landscape photos to fill the banner area consistently.
- `photoKey` maps to the yuhonas exercise folder name (e.g., `"Barbell-Deadlift"`) — the research agent confirms exact casing and naming convention.

## Deferred Ideas

- **GIF animations** — yuhonas repo provides animated GIFs for some exercises showing start→end movement. More instructive but heavier and adds autoplay complexity. Future enhancement.
- **Video clips** — Full exercise demo video from a licensed source. Bigger feature for a later phase.
- **User photo upload** — Letting users add their own form-check photo to an exercise detail. Personalization feature outside v4.0 scope.
