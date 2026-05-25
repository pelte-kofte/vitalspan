---
phase: 02-app-assets-and-store-polish
plan: "02"
subsystem: AboutScreen
tags: [about-screen, credibility, legal, expo-constants, async-storage]
dependency_graph:
  requires: []
  provides: [dynamic-version, pharmacist-credential-card, always-visible-why-section, legal-disclaimer-card]
  affects: [src/screens/AboutScreen.tsx]
tech_stack:
  added: [expo-constants]
  patterns: [AsyncStorage-read-on-mount, ternary-null-guard]
key_files:
  created: []
  modified:
    - src/screens/AboutScreen.tsx
decisions:
  - "Kept expandArrow and expandHeader styles in StyleSheet — still used by Sources & Citations expandable section"
  - "Installed expo-constants at project root level (was nested inside expo/node_modules, not directly importable)"
  - "Used string literal '@vitalspan_disclaimer_accepted' directly — constant is not exported from MedicalDisclaimer.tsx"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-25T14:03:12Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 02 Plan 02: About Screen Polish Summary

AboutScreen rewritten with dynamic version from expo-constants, expanded pharmacist credential card with Dr. Bekircem Kusdemir PharmD name and practice focus, always-visible "Why pharmacist-built matters" section, and new Legal card reading disclaimer acceptance date from AsyncStorage.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Dynamic version, expanded credential, always-visible Why | e18f337 | src/screens/AboutScreen.tsx, package.json, package-lock.json |
| 2 | Legal section card with AsyncStorage disclaimer date | c094ced | src/screens/AboutScreen.tsx |

## What Was Built

### Task 1 — Dynamic version, expanded credential section, always-visible Why section

Three changes applied to `src/screens/AboutScreen.tsx`:

**STORE-04: Dynamic version via expo-constants**
- Replaced `const VERSION = '0.1.0'` with `const VERSION = Constants.expoConfig?.version ?? '—'`
- Added `import Constants from 'expo-constants'`
- Both JSX references (heroVersion, creditsVersion) remain unchanged — only source changes

**STORE-01: Expanded pharmacist credential section**
- Founder name changed from "Founded by a Clinical Pharmacist" to "Dr. Bekircem Kusdemir, PharmD"
- Credential subtitle changed from multi-specialty list to "PharmD · Clinical Pharmacist"
- Added practice focus line: "Longevity medicine, metabolic health optimization, and drug–supplement interaction safety."
- New `founderPracticeFocus` style added using `Typography.sizes.xs / Colors.textSecondary / Spacing.sm`

**STORE-02: Remove expand toggle from "Why pharmacist-built matters"**
- Removed `whyExpanded` state and `setWhyExpanded` handler
- Replaced `TouchableOpacity` wrapper with plain `View` (same `s.section` style)
- Removed `expandHeader` row with arrow — `sectionTitle` now renders directly as first child
- All three bullet points unconditionally rendered

### Task 2 — Legal section card with AsyncStorage disclaimer date

**STORE-03: Legal card after medical disclaimer**
- New `disclaimerInfo` state: `{ version: string; acceptedAt: string } | null`
- useEffect reads `@vitalspan_disclaimer_accepted` on mount, JSON.parses the stored value
- `.catch(() => {})` swallows parse errors — null state shows graceful fallback copy
- Legal card placed between `s.disclaimer` View and `s.credits` View
- Disclaimer line: shows `Medical disclaimer v{version}` or `"Medical disclaimer v1.0"` fallback
- Date line: formatted via `toLocaleDateString('en-US', { year, month, day })` or "Not yet accepted"
- App version line: always shows `App version: {VERSION}` from expo-constants
- New styles: `legalCard`, `legalTitle`, `legalDisclaimerLine`, `legalDateLine`, `legalVersionLine`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] expo-constants not installed at project root**
- **Found during:** Task 1, TypeScript check
- **Issue:** `expo-constants` was nested inside `node_modules/expo/node_modules/expo-constants` but not installed at the project root level. TypeScript could not resolve the import.
- **Fix:** Ran `npm install expo-constants@~17.0.8` to install at project level. This is the canonical Expo SDK package — not a hallucinated dependency.
- **Files modified:** package.json, package-lock.json
- **Commit:** e18f337

### Spec Discrepancy (not a deviation — plan takes precedence)

The UI-SPEC.md (line 289) said to "Remove `expandArrow` style from StyleSheet (no longer referenced)" but PLAN.md task instructions explicitly state "Do NOT remove `s.expandHeader` or `s.expandArrow` from the StyleSheet — they are still used by the 'Sources & Citations' section." The PLAN.md instruction was followed — both styles are retained and remain actively used by the Sources & Citations expandable section.

## Threat Model Verification

| Threat ID | Mitigation | Status |
|-----------|-----------|--------|
| T-02-02-01 | Display-only AsyncStorage data, no PII | Verified — data rendered as text only |
| T-02-02-02 | `.catch(() => {})` prevents crash on JSON.parse failure | Verified — null state shows "Not yet accepted" gracefully |

## Known Stubs

None — all data wired to real sources (expo-constants for version, AsyncStorage for disclaimer date).

## Self-Check

- [x] `src/screens/AboutScreen.tsx` exists and was modified
- [x] Commits e18f337 and c094ced exist in git log
- [x] `npx tsc --noEmit` exits 0
- [x] All acceptance criteria verified via grep checks
