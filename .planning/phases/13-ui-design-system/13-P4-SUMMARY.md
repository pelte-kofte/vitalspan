---
plan: "13-04"
phase: "13"
status: complete
completed: 2026-06-09
---

## Summary

Migrated ExerciseScreen.tsx, ExerciseDetailScreen.tsx, and BiomarkerDetailScreen.tsx from `Colors.Beige.*` to the white/green clinical-premium token system. Replaced 📋 emoji with ClipboardIcon SVG in BiomarkerDetailScreen.

## What Was Built

**Task 1 — ExerciseScreen.tsx + ExerciseDetailScreen.tsx:**
- Zero `Colors.Beige.*` references in both files
- Token mapping applied: `Beige.bg→surface`, `Beige.card→surface`, `Beige.headerBg→surfaceElevated`, `Beige.text→onSurface`, `Beige.textMuted→onSurfaceMuted`, `Beige.textSecondary→textSecondary`, `Beige.border/divider→borderLight`, `Beige.bgShade→surfaceElevated`
- D-12 font size sweep: `fontSize: 11/10→Typography.sizes.xs`, `fontSize: 24→xl`, `fontSize: 18→h3`, `fontSize: 14→base`
- D-12 spacing sweep: `gap: 8→Spacing.sm`; values 14, 7, 6, 2, 40 annotated as intentional exceptions
- `CATEGORY_EMOJI` map preserved per plan (emoji-to-SVG deferred to P6)

**Task 2 — BiomarkerDetailScreen.tsx:**
- Zero `Colors.Beige.*` references
- Same token mapping applied across all 25+ StyleSheet entries
- `ClipboardIcon` imported from `DesignSystemIcons.tsx` and used in both upload button instances (list view + detail view)
- Hero `fontSize: 44` preserved as intentional exception (no Typography.sizes match)
- D-12 font size + spacing sweep applied throughout

## Commits

- `feat(13-04): migrate ExerciseScreen and ExerciseDetailScreen to white/green tokens`
- `feat(13-04): migrate BiomarkerDetailScreen to white/green tokens and replace emoji with ClipboardIcon`

## Self-Check

- [x] ExerciseScreen.tsx: 0 Beige refs
- [x] ExerciseDetailScreen.tsx: 0 Beige refs
- [x] BiomarkerDetailScreen.tsx: 0 Beige refs
- [x] BiomarkerDetailScreen.tsx: ClipboardIcon present (import + 2 usages)
- [x] BiomarkerDetailScreen.tsx: 0 📋 emoji
- [x] CATEGORY_EMOJI not removed
- [x] tsc --noEmit exits 0

## Self-Check: PASSED
