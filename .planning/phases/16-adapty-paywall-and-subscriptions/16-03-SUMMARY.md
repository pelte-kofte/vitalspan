# Plan 16-03 Summary: Adapty Dashboard + App Store Connect Setup

**Status:** Complete
**Completed:** 2026-06-13
**Type:** Human action (no code files modified)

## What Was Done

External configuration required for PaywallScreen to fetch live product data:

- App Store Connect: Two subscription products created (`com.vitalspan.app.premium.annual` with 7-day Free Trial, `com.vitalspan.app.premium.monthly` with no trial)
- Adapty dashboard: App registered (bundle ID `com.vitalspan.app`), both products imported, "premium" access level assigned, Placement `vitalspan_premium_paywall` published
- `.env` created with `EXPO_PUBLIC_ADAPTY_API_KEY` set to real public SDK key
- Sandbox Apple ID created for purchase testing
- Dev client rebuilt: `npx expo prebuild --clean && pod install && npx expo run:ios`

## Requirements Covered

- PAY-01 (purchase flow infrastructure ready)
- PAY-02 (trial configured in App Store Connect)
- PAY-03 (restore purchases infrastructure ready)

## Key Artifacts

- Adapty Placement ID: `vitalspan_premium_paywall`
- Annual product ID: `com.vitalspan.app.premium.annual`
- Monthly product ID: `com.vitalspan.app.premium.monthly`
- `.env` (local, gitignored): `EXPO_PUBLIC_ADAPTY_API_KEY` set
