---
phase: 02-app-assets-and-store-polish
plan: "01"
subsystem: app-assets
tags: [icon, splash, canvas, branding]
dependency_graph:
  requires: []
  provides: [assets/icon.png, assets/splash.png, splash-app-json-config]
  affects: [app.json, Expo build pipeline]
tech_stack:
  added: [canvas@^3.2.3 (devDependency)]
  patterns: [Node.js canvas generation scripts, PNG binary asset generation]
key_files:
  created:
    - scripts/generate-icon.js
    - scripts/generate-splash.js
    - assets/icon.png
    - assets/splash.png
  modified:
    - package.json (added canvas devDependency)
    - package-lock.json
    - app.json (updated splash config)
decisions:
  - "Used system serif font fallback (480px serif) in icon generator since DM Serif Display is unavailable in Node.js canvas"
  - "Installed canvas as devDependency only — not bundled with Expo app"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-25"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 6
---

# Phase 02 Plan 01: App Icon and Splash Screen Generation Summary

Custom branded 1024x1024 icon (green background, white V lettermark) and 1284x2778 splash screen (warm off-white, Vitalspan wordmark + pharmacist tagline) generated via Node.js canvas scripts, with app.json splash config updated to reference the new asset.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Install canvas and create icon generator | 81804e1 | scripts/generate-icon.js, assets/icon.png, package.json, package-lock.json |
| 2 | Create splash generator, run it, update app.json | b83a937 | scripts/generate-splash.js, assets/splash.png, app.json |

## What Was Built

### Task 1 — App Icon Generator

`scripts/generate-icon.js` creates a 1024x1024 PNG:
- Solid `#2D6A4F` (Colors.primary) background fill
- White `V` lettermark at 480px serif, centered at (512, 512)
- Output: `assets/icon.png` (8-bit/color RGBA PNG)

`canvas@^3.2.3` installed as devDependency (not bundled in the Expo app).

### Task 2 — Splash Screen Generator and app.json Update

`scripts/generate-splash.js` creates a 1284x2778 PNG (iPhone Pro Max native):
- `#EDE8DC` warm off-white background fill
- `Vitalspan` wordmark: 300-weight 96px serif, `#1A1A18`, centered at y=1350
- Tagline: `Track your biological age`, 36px sans-serif, `#4A4A45`, at y=1414
- Pharmacist attribution: `⚕ Built by a licensed pharmacist`, 28px sans-serif, `#2D6A4F`, at y=1478
- Output: `assets/splash.png` (8-bit/color RGBA PNG)

`app.json` splash config updated from `{ "backgroundColor": "#085041" }` to:
```json
{
  "image": "./assets/splash.png",
  "resizeMode": "contain",
  "backgroundColor": "#EDE8DC"
}
```

## Verification Results

1. `node scripts/generate-icon.js` — exits 0, produces `assets/icon.png` at 1024x1024
2. `node scripts/generate-splash.js` — exits 0, produces `assets/splash.png` at 1284x2778
3. `app.json` splash contains `image`, `resizeMode: "contain"`, `backgroundColor: "#EDE8DC"`
4. `grep -r "generate-icon|generate-splash" src/` — no results (scripts not bundled)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — both PNG assets are fully generated and wired into app.json.

## Threat Flags

None — canvas is a devDependency only, not present in the Expo runtime bundle. No new network endpoints or auth surfaces introduced.

## Self-Check: PASSED

- scripts/generate-icon.js: FOUND
- scripts/generate-splash.js: FOUND
- assets/icon.png: FOUND (1024x1024 PNG)
- assets/splash.png: FOUND (1284x2778 PNG)
- app.json splash.image: FOUND (./assets/splash.png)
- Commit 81804e1: FOUND
- Commit b83a937: FOUND
