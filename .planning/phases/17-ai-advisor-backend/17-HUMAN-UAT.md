---
status: partial
phase: 17-ai-advisor-backend
source: [17-VERIFICATION.md]
started: 2026-06-14T00:00:00Z
updated: 2026-06-14T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Edge Function live invocation
expected: Deploy `supabase functions deploy ai-advisor`, call with a valid Supabase JWT, receive a LongevityReport JSON with all 5 sections (scoreSummary, priorityFindings, biomarkerAnalysis, supplementMedicationReview, recommendations)
result: [pending]

### 2. Rate limit enforcement (live)
expected: Submit 6 report requests from the same authenticated user on the same UTC day — the 6th receives HTTP 429 with the message "You've reached your daily limit. Try again tomorrow."
result: [pending]

### 3. ai_usage migration applied
expected: Run `supabase db push` (or apply migration via Dashboard SQL editor), confirm `public.ai_usage` table exists with `(user_id, date)` composite PK; confirm an unauthenticated INSERT is rejected by RLS
result: [pending]

### 4. Zero-PII runtime confirmation
expected: Inspect the network payload sent from the Expo app to the Edge Function — confirm no user name, no exact birthdate, no raw lab values with timestamps, no Supabase user ID appear in the `context` field
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
