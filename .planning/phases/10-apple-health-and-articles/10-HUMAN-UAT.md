---
status: partial
phase: 10-apple-health-and-articles
source: [10-VERIFICATION.md]
started: 2026-06-03T00:00:00Z
updated: 2026-06-03T00:00:00Z
---

## Current Test

[awaiting human testing — EAS build required for HealthKit native code]

## Tests

### 1. EAS preview build completes without native module errors
expected: `eas build --profile preview --platform ios` succeeds; react-native-health native module is compiled and linked
result: [pending]

### 2. On-device HealthKit live data
expected: On physical iPhone with Apple Watch, granting permissions in the LongevityScore prompt causes HRV, sleep, recovery, and glucose orbitals to populate with real values within the same session
result: [pending]

### 3. Supabase articles table created
expected: Run `src/db/create_articles_table.sql` in Supabase SQL Editor. Table "articles" visible with 7 columns: pmid, title, journal, pub_date, abstract, biomarker_tags, fetched_at. Three RLS policies visible: "public read articles", "anon insert articles", "anon update articles".
result: [pending]

### 4. Articles UI visual verification
expected: Dashboard shows "Longevity Research" card (green-tinted background) → taps to ArticlesScreen → article cards show title (2 lines), journal, date, abstract snippet (3 lines), "Read article →" link → pull-to-refresh works → tapping opens PubMed URL in SafariViewController
result: [pending]

### 5. LongevityScoreScreen State A (pre-request prompt)
expected: On clean install (no prior health permissions), LongevityScore shows "Connect Apple Health" prompt card with watch icon, body text about HRV/sleep/VO₂/glucose, green CTA button — NOT demo orbital values. Fade-in animation visible.
result: [pending]

### 6. ProfileScreen Disconnect row
expected: After granting HealthKit permissions on a physical device, Profile tab shows "Disconnect Apple Health" row in red text. Tapping shows Alert confirmation. Confirming removes health data from storage and hides the row.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
