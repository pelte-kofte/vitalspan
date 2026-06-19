# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

---

## Milestone: v5.0 — Personalization & Production

**Shipped:** 2026-06-19
**Phases:** 4 | **Plans:** 15
**Timeline:** 4 days (2026-06-16 → 2026-06-19)
**Files changed:** 77 | **LOC delta:** +16,200 / -1,270

### What Was Built

- **Protocol schema migration** — ProtocolItem unified type replaces split arrays; type-correct sections; edit/delete/personal-dose for all items; "Custom" category eliminated via migrateProtocol()
- **Exercise Rutinim** — Drag-to-reorder personal routine (max 10); Sets/Reps/Weight per set; full-date history with edit/delete; 8-week progressive overload sparkline
- **Engagement layer** — Adherence streak (current + all-time best); daily evaluation on protocol load
- **Biomarker trends** — LineChart sparkline with 30/90/365 toggle; SVG range-band overlay; 30-day free-tier cap + upgrade banner
- **Push notifications** — 4-slot AM/PM/Evening/Night local reminders; time picker; permission-on-first-toggle; daily reschedule on launch
- **Production build** — EAS production build with `aps-environment: production`; submitted to TestFlight; verified on device

### What Worked

- **Phase 20 as foundation** — Establishing the canonical ProtocolItem type before any streak, notification, or AI context work eliminated coordination debt across all downstream phases
- **Parallel waves with zero file overlap** — Phase 22's three plans ran entirely in parallel with no conflicts; planning file boundaries upfront saved rework
- **react-native-chart-kit reuse** — Already installed for exercise sparklines in Phase 21; reused immediately in Phase 22 for biomarker charts with no additional install or compatibility checking
- **migrateProtocol() pattern** — Detecting old schema by key presence (`'addedSupplements' in parsed`) and writing back immediately means schema migrations are idempotent without feature flags or version fields
- **pharmacist-liability guardrails as explicit decisions** — Documenting "raw dose string excluded, bucketed values only" as a named decision prevented scope creep in Phase 22 and gave Phase 23 reviewers clear rationale

### What Was Inefficient

- **REQUIREMENTS.md not updated after Phase 23 execution** — NTFY-01–04 and PROD-01–02 checkboxes were left unchecked after Phase 23 completed; discovered and corrected only at milestone close; a post-execution step in the executor workflow would catch this
- **ROADMAP.md Phase 21 progress table** — Row showed "0/5 Not started" despite all 5 SUMMARY.md files existing; progress table updates must be part of phase completion docs commit, not a separate step
- **STATE.md metrics stale for Phases 22–23** — Velocity tracking (duration per phase) was not filled in for the last two phases; metrics section relies on manual entry which was skipped

### Patterns Established

- **Schema migration via key-presence detection** — `if ('addedSupplements' in parsed)` → migrate + write back; no version field needed for one-shot migrations
- **Parallel plan sets with explicit "zero file overlap" annotation** — When phases have parallel plans, noting `zero file overlap` in the wave description gives executors clear permission to run simultaneously without checking
- **Module-scope setNotificationHandler** — Must be called before `export default function` (not inside useEffect) for iOS foreground banners; this is the SDK 54 pattern
- **Pharmacist-liability bucketing** — Any user-entered dose value that would be sent to an external AI must be bucketed (high/standard/low), never sent raw; enforce as a named decision at design time, not at implementation time
- **Personal data AsyncStorage-first** — For health/dose data with regulatory implications, default to AsyncStorage-only in the first implementation; Supabase sync is a follow-up phase once the data model is stable

### Key Lessons

1. **Schema migrations need a clear idempotency contract** — migrateProtocol() worked because the old-schema detection key (`addedSupplements`) does not exist in the new schema; design migration conditions to be structurally unambiguous, not version-number dependent
2. **REQUIREMENTS.md checkbox hygiene matters at milestone close** — Phase execution updates the traceability table but often skips checkboxes; add checkbox update to the executor's "step complete" checklist
3. **Progress table and SUMMARY.md can diverge** — SUMMARY.md files are ground truth for completion; the progress table is a convenience view that requires manual sync; trust the file system, not the table
4. **expo-notifications SDK 54 API is non-obvious** — `shouldShowBanner` / `shouldShowList` replaced the legacy `shouldShowAlert`; module-scope handler placement is required; these are not in most tutorials; document in CONTEXT.md before execution

### Cost Observations

- Model mix: primary sonnet (execution), occasional opus (planning/review)
- Sessions: 4 (one per phase)
- Notable: Phase 22 ran three parallel plans across three distinct feature areas with zero merge conflicts — the zero-file-overlap wave annotation was key

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 3 | 8 | First baseline — linear sequential execution |
| v2.0 | 6 | 20 | Introduced Supabase + parallel wave execution |
| v3.0 | 5 | 28 | HealthKit + full design system; longer phases |
| v4.0 | 4 | 15 | Monetization + AI feature; Edge Function pattern established |
| v4.1 | 1 | 6 | Single-phase UX fix bundle pattern established |
| v5.0 | 4 | 15 | Schema migration as foundation phase; parallel zero-overlap plans |

### Top Lessons (Verified Across Milestones)

1. **AsyncStorage as fallback layer** — Supabase is additive, never a replacement; offline resilience requires AsyncStorage-first persistence throughout (validated v2.0–v5.0)
2. **Zero secrets in source** — `process.env.EXPO_PUBLIC_*` exclusively; security grep at phase end is a required gate (validated every milestone)
3. **Type migrations need idempotency** — Whether it's anonymous-session migration or ProtocolState schema migration, the detection condition must be structurally unambiguous (v2.0 `@vitalspan_migrated_v2` flag → v5.0 key-presence detection)
4. **Foundation phases unlock everything downstream** — Phase 4 (Supabase), Phase 20 (ProtocolState) were each load-bearing for 2–3 downstream phases; identifying and sequencing these first reduces coordination debt
