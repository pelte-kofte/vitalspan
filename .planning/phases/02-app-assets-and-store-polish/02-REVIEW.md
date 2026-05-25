---
phase: 02-app-assets-and-store-polish
reviewed: 2026-05-25T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - scripts/generate-icon.js
  - scripts/generate-splash.js
  - app.json
  - package.json
  - src/screens/AboutScreen.tsx
findings:
  critical: 2
  warning: 5
  info: 4
  total: 11
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-25
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed two asset-generation scripts, the Expo config, the package manifest, and the AboutScreen. The generate scripts introduce a runtime crash risk because they depend on the native `canvas` package, which cannot be installed on Apple Silicon Macs and in CI environments without the `canvas` prebuilt binary. The `app.json` is missing the Android and EAS build configuration fields that are required before a TestFlight or store build can succeed. The `AboutScreen` has a non-functional "Privacy Policy" button (no `onPress` handler), unsafe `JSON.parse` usage without try/catch in the disclaimer loader, and multiple project-rule violations (hardcoded font sizes, hardcoded spacing values).

---

## Critical Issues

### CR-01: Privacy Policy button has no `onPress` — dead call-to-action on a legal screen

**File:** `src/screens/AboutScreen.tsx:196-198`
**Issue:** The `TouchableOpacity` that renders "Privacy Policy →" has no `onPress` prop. Tapping it does nothing. This is on the Medical Disclaimer section — a screen that is specifically user-facing for legal/compliance purposes. Users attempting to read the privacy policy before accepting terms will receive no feedback, which is a trust and potential regulatory gap.

```tsx
// Current — no handler
<TouchableOpacity style={s.privacyLink}>
  <Text style={s.privacyLinkTxt}>Privacy Policy →</Text>
</TouchableOpacity>
```

**Fix:** Wire an `onPress` that opens the actual privacy policy URL via `Linking.openURL`, or replace with a `Text` if navigation is not yet ready:

```tsx
import { Linking } from 'react-native';

<TouchableOpacity
  style={s.privacyLink}
  onPress={() => Linking.openURL('https://vitalspan.app/privacy')}
>
  <Text style={s.privacyLinkTxt}>Privacy Policy →</Text>
</TouchableOpacity>
```

---

### CR-02: Unguarded `JSON.parse` on untrusted AsyncStorage data — crashes on corrupt/malformed storage

**File:** `src/screens/AboutScreen.tsx:46`
**Issue:** `JSON.parse(raw)` is called without a surrounding `try/catch`. If the stored value is malformed (truncated write, storage migration, manual manipulation), this throws a `SyntaxError` which is swallowed by the outer `.catch(() => {})` — but only because there is one. However, the type assertion `as { version: string; acceptedAt: string }` means that even a valid JSON object missing the `acceptedAt` field will later crash on line 209 where `new Date(disclaimerInfo.acceptedAt)` is called with `undefined`, producing `Invalid Date` rendered to the screen silently. More critically, if `acceptedAt` is a non-parseable string, `toLocaleDateString` on an Invalid Date does not throw but renders "Invalid Date" to the user in the Legal section.

```ts
// Line 46 — type is asserted, not validated
if (raw) setDisclaimerInfo(JSON.parse(raw) as { version: string; acceptedAt: string });
```

**Fix:** Parse defensively and validate both fields exist before storing in state:

```ts
.then(raw => {
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.version === 'string' &&
      typeof parsed.acceptedAt === 'string' &&
      !isNaN(new Date(parsed.acceptedAt).getTime())
    ) {
      setDisclaimerInfo(parsed as { version: string; acceptedAt: string });
    }
  } catch {
    // corrupt storage — leave as null (shows "Not yet accepted")
  }
})
.catch(() => {});
```

---

## Warnings

### WR-01: `canvas` npm package in `devDependencies` will fail to install in EAS / CI without native build tools

**File:** `package.json:41`
**Issue:** `canvas` (`node-canvas`) is a C++ native addon. It requires Xcode command-line tools, `pkg-config`, `cairo`, and `pango` system libraries to compile from source. EAS Build worker images and standard CI environments (GitHub Actions, Bitrise) do not have these libraries pre-installed. `npm install` will fail silently or hard-fail during the build step, causing an obscure build error rather than a clear error message. The scripts themselves are not wired into any npm `scripts` entry and are manually invoked, so this is also an unnecessary devDependency for anyone who only runs the app.

**Fix:** Either:
1. Pre-generate the PNG assets and commit them to `assets/` (they are already present at `assets/icon.png` and `assets/splash.png`), then remove `canvas` from devDependencies entirely.
2. Or add an `.npmrc` with `canvas_binary_host_mirror` to pull prebuilt binaries, and document the requirement in a `CONTRIBUTING.md` note.

Since the generated files are already committed, option 1 is strongly preferred:

```bash
npm uninstall canvas  # removes from devDependencies
```

---

### WR-02: Generate scripts use system `serif`/`sans-serif` font which does not match the app's DM Sans / DM Serif Display brand fonts

**File:** `scripts/generate-splash.js:21,26,31` and `scripts/generate-icon.js:20`
**Issue:** Both scripts render text using generic CSS font families (`'480px serif'`, `'300 96px serif'`, `'400 36px sans-serif'`). The `canvas` package resolves these to system fonts (typically Times New Roman / Arial on macOS, DejaVu on Linux). The resulting splash and icon will not match the DM Serif Display / DM Sans branding used throughout the app, and will look inconsistent on App Store screenshots. This is especially visible on the splash screen where the app name is rendered at 96px.

**Fix:** Register the DM Sans / DM Serif Display font files with `canvas` before drawing:

```js
const { createCanvas, registerFont } = require('canvas');
const path = require('path');

// Register brand fonts (paths relative to project root)
registerFont(path.join(__dirname, '..', 'assets', 'fonts', 'DMSerifDisplay-Regular.ttf'), {
  family: 'DM Serif Display',
});
registerFont(path.join(__dirname, '..', 'assets', 'fonts', 'DMSans-Regular.ttf'), {
  family: 'DM Sans',
});

// Then use in ctx.font:
ctx.font = '300 96px "DM Serif Display"';
ctx.font = '400 36px "DM Sans"';
```

---

### WR-03: `app.json` is missing `android` block — store build is blocked without it

**File:** `app.json`
**Issue:** There is no `android` block in `app.json`. Without `android.package` (the Application ID), `expo prebuild` and EAS Build for Android will fail or auto-generate a potentially wrong package name. While the project is iOS-first, the `package.json` includes `"android": "expo run:android"` as a script, and EAS Build submissions validate the presence of the Android package identifier. Additionally, without `android.adaptiveIcon`, the Play Store icon pipeline is broken.

**Fix:** Add a minimal Android block:

```json
"android": {
  "package": "com.vitalspan.app",
  "adaptiveIcon": {
    "foregroundImage": "./assets/icon.png",
    "backgroundColor": "#2D6A4F"
  }
}
```

---

### WR-04: `app.json` missing `assetBundlePatterns` — custom fonts may not be bundled in production builds

**File:** `app.json`
**Issue:** The project uses `expo-font` (listed in both `plugins` and `dependencies`) to load DM Sans and DM Serif Display. Without an explicit `assetBundlePatterns` entry, Expo's bundler may exclude font files from the standalone production build, causing fonts to silently fall back to the system font. This is a well-known Expo gotcha for OTA updates (EAS Update).

**Fix:** Add to `app.json` under `"expo"`:

```json
"assetBundlePatterns": [
  "**/*"
]
```

---

### WR-05: `generate-splash.js` hardcodes coordinates for a specific device (1284×2778 — iPhone 12 Pro Max) — will be letterboxed on all other devices

**File:** `scripts/generate-splash.js:8-9,22-27`
**Issue:** The splash canvas is 1284×2778 px, which is the exact logical resolution of an iPhone 12 Pro Max. Expo's splash screen `resizeMode: "contain"` in `app.json` (line 11) will letterbox this on shorter devices (iPhone SE, iPhone 14 at 1170×2532) and will show bars on iPad if `supportsTablet` is ever enabled. The correct approach for Expo splash images is to use a large square or the recommended 1242×2436 baseline with `resizeMode: "cover"`, or to use a simple centered logo on a solid background.

**Fix:** Use a square canvas with the logo centered, relying on the `backgroundColor` in `app.json` to fill the edges:

```js
const SIZE = 1284;
const canvas = createCanvas(SIZE, SIZE);
// Draw logo centered at SIZE/2, SIZE/2
// Expo will scale and fill with backgroundColor: "#EDE8DC"
```

Or keep the tall canvas but change `resizeMode` to `"cover"` in `app.json` if pixel-exact positioning is required.

---

## Info

### IN-01: Multiple hardcoded `fontSize` values violate project convention — should use `Typography.sizes.*`

**File:** `src/screens/AboutScreen.tsx:238,253,264,270,292,295,296`
**Issue:** Several style entries use raw numeric font sizes instead of `Typography.sizes.*` tokens, violating the CLAUDE.md coding rule ("All spacing from `Spacing.*` — never hardcode margin/padding numbers"; by extension, sizing tokens should be used from Typography). Affected lines: `fontSize: 36` (heroTitle), `fontSize: 10` (expandArrow, citationText, citationNum, citationItemText), `fontSize: 16` (founderAvatarTxt, whyIcon).

`Typography.sizes` has `xs: 11` — closest to 10, but `10` is not a defined token. `Typography.sizes.display3: 36` matches the hero title.

**Fix:**
```ts
heroTitle: { fontSize: Typography.sizes.display3, ... },    // 36
founderAvatarTxt: { fontSize: Typography.sizes.lg, ... },   // 16
whyIcon: { fontSize: Typography.sizes.lg, width: 22 },      // 16
// For 10px citation text — either use Typography.sizes.xs (11) or add a caption token
citationText: { fontSize: Typography.sizes.xs, ... },
```

---

### IN-02: Hardcoded `marginTop: 3` violates `Spacing.*` convention

**File:** `src/screens/AboutScreen.tsx:266`
**Issue:** `founderCred: { ..., marginTop: 3 }` uses a raw pixel value. The project rules require all spacing to come from `Spacing.*`. `Spacing.xs` is 4, which is the closest available token.

**Fix:**
```ts
founderCred: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: Spacing.xs },
```

---

### IN-03: Inline style `{ width: 44 }` in JSX violates the "no inline styles" rule

**File:** `src/screens/AboutScreen.tsx:58`
**Issue:** `<View style={{ width: 44 }} />` is an inline style for a non-dynamic value. CLAUDE.md requires `StyleSheet` for all non-dynamic styles.

**Fix:** Move to StyleSheet:
```ts
// In JSX:
<View style={s.headerSpacer} />

// In StyleSheet:
headerSpacer: { width: 44 },
```

---

### IN-04: Generate scripts have no entry in `package.json` scripts — discoverability gap

**File:** `package.json:6-10`
**Issue:** The two asset generation scripts are invoked manually (`node scripts/generate-icon.js`). There is no `npm run generate:assets` or similar entry in the `scripts` block. New contributors or future CI runs will not know these scripts exist or how to regenerate the assets.

**Fix:** Add to `package.json`:
```json
"scripts": {
  "generate:icon": "node scripts/generate-icon.js",
  "generate:splash": "node scripts/generate-splash.js",
  "generate:assets": "npm run generate:icon && npm run generate:splash",
  ...
}
```

---

_Reviewed: 2026-05-25_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
