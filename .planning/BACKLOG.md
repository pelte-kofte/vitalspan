# Vitalspan Backlog Tracking

GitHub Issues are the source of truth for production-readiness follow-ups, deferred roadmap items, and cross-session project tracking in this repo.

## Tracker issue

Primary tracker: https://github.com/pelte-kofte/vitalspan/issues/10

Use the tracker issue for the current grouped view, and use each linked issue for detailed scope, checklist items, acceptance criteria, and milestone ownership.

## Milestones

- `v5.1 — Production Hardening`: production validation, purchase verification, backend abuse checks, App Store release readiness, and architecture documentation alignment.
- `v5.2 — Cloud Sync`: cross-device sync, local-first migration safety, and conflict-handling work.
- `v6.0 — Product Expansion`: deferred product improvements across notifications, articles, and exercise.

## Priority definitions

- `priority: critical`: release-blocking or production-risk work that should be resolved before broad release.
- `priority: high`: important follow-up work that materially improves readiness or architecture clarity.
- `priority: medium`: planned expansion work that is valuable but not release-blocking.

## How new work should be tracked

When a new task is discovered:

1. Check existing GitHub Issues, labels, and milestones first to avoid duplicates.
2. Create or update a GitHub Issue instead of leaving the work only in chat, notes, or memory.
3. Add a clear problem statement, checklist, acceptance criteria, and relevant files.
4. Attach the correct priority label, type label, area label, and milestone.
5. Link the issue from the tracker when it belongs in the active production/deferred roadmap view.

## Completion rule

Completed work should be tracked by closing the corresponding GitHub Issue. Do not treat local notes alone as completion status.

## TODO policy

Random in-code TODO comments are not the roadmap. If something matters beyond a tiny local reminder, it should live in a GitHub Issue and be tracked through the backlog instead.
