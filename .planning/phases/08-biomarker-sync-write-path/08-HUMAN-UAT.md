---
status: partial
phase: 08-biomarker-sync-write-path
source: [08-VERIFICATION.md]
started: 2026-06-01T00:00:00Z
updated: 2026-06-01T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Biomarker entry syncs to Supabase after save
expected: Save a biomarker entry in BiomarkerEntryScreen. Within ~5 seconds, a row appears in the Supabase dashboard `biomarker_entries` table matching the saved entry (id, biomarker_id, value, date, source). syncEntry is fire-and-forget — no UI feedback is shown.
result: [pending]

### 2. One-time migration runs on first authenticated session
expected: Clear `@vitalspan_migrated_v2` from AsyncStorage (via Settings → Clear Data or AsyncStorage direct write). Pre-populate `@vitalspan_biomarkers` with at least 2 entries. Relaunch app. Verify: (a) rows appear in Supabase `biomarker_entries` table; (b) `@vitalspan_migrated_v2` is set to `'true'`; (c) relaunching a second time does not duplicate rows.
result: [pending]

### 3. Dashboard reads biomarker entries from Supabase on mount
expected: Clear `@vitalspan_biomarkers` from AsyncStorage while Supabase has entries. Navigate to Dashboard (or force a mount via tab switch). Dashboard biomarker cards populate from Supabase data — not empty.
result: [pending]

### 4. Dashboard falls back to AsyncStorage silently when Supabase is unreachable
expected: Simulate offline (airplane mode or disconnect). Navigate to Dashboard. Dashboard shows biomarker data from local AsyncStorage. No error dialog, no crash, no blank state.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
