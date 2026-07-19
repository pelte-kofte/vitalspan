# Vitalspan Agent Instructions

These instructions apply to the entire repository.

## Before material work

- Read docs/VITALSPAN_ENGINEERING_STANDARD.md before architectural, scientific, storage, production, AI, security/privacy, or release work.
- Read docs/SCIENTIFIC_BASELINE_V1_0.md before modifying or integrating scientific domains.
- Read the relevant phase documents and affected module documentation before implementing a phase.
- Inspect git status and identify unrelated or untracked user work before editing.

## Scientific and architecture boundaries

- Preserve scientific-domain isolation and existing dependency direction.
- Never change scientific behavior silently. Behavioral scientific changes require explicit scope, version increments, regression evidence, and approval.
- Never activate an inactive domain, feature flag, production path, or safety policy without explicit instruction.
- Science is authoritative. UI, AI, Advisor, storage, and production services may not calculate, override, reinterpret, upgrade, downgrade, or invent scientific output.
- Keep the Scientific Platform and Production Platform separated through public, versioned contracts.
- Preserve statuses, confidence, reasons, blocked outputs, provenance, audit metadata, and historical versions.
- Fail closed when context, evidence, provenance, protocol, assay, or authority is missing.
- Avoid parent scores, cross-domain composites, silent fallbacks, and hard-coded cross-domain assumptions unless separately governed.

## Change discipline

- Prefer small, isolated, reviewable changes that follow existing naming and architecture conventions.
- Avoid unnecessary abstractions, generic layers, speculative infrastructure, and unrelated cleanup.
- Preserve unrelated user work. Never stage, revert, overwrite, commit, push, tag, migrate, release, or activate unless explicitly instructed.
- Add or update tests for every material change.
- Document assumptions, compatibility impact, unresolved risks, and intentionally deferred work.
- Treat medical safety, security, privacy, and data provenance concerns as blocking.

## Data and security

- Do not expose secrets, API keys, service-role keys, tokens, credentials, or private health data in code, logs, fixtures, tools, or reports.
- Use least-privilege and minimum-data flows. Preserve source identity, original values and units, timestamps, verification, correction history, and deletion boundaries.
- Keep Firestore and Supabase reads and writes efficient where relevant; avoid unnecessary queries, payloads, subscriptions, and write amplification.

## Validation and VES review

- Run focused tests for the change.
- Run affected scientific regressions whenever a scientific domain or integration boundary is relevant.
- Run the full repository test suite, TypeScript, configured lint/build checks, and git diff/whitespace checks.
- Verify modified and untracked files accurately, including final newlines and repository isolation.
- Perform and report a VES review before declaring a major phase complete. Do not claim PASS without the required evidence or invent reviewer approval.

## Required completion report

Report:

- files changed;
- behavior changed;
- tests and TypeScript results;
- governance/VES outcome;
- production wiring or activation;
- scientific impact;
- repository state, including modified and untracked files;
- remaining risks; and
- recommended next action.
