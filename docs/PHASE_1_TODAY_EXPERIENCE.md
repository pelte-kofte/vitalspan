# Phase 1 — Vitalspan Today Experience

## Product contract

Today is the daily decision layer, not a feature dashboard:

`Observe → Interpret → Prioritize → Act → Measure response`

The first screen answers one question: **What is the single most important thing I should know or do today?**

## Pre-implementation UX audit

### Data sources

- `@vitalspan_user_profile`: name, chronological age, and medication names.
- `@vitalspan_biomarkers`: original laboratory values, units, dates, source, and reported ranges.
- Existing read-only `biomarker_entries` refresh: remote values merged with locally preserved provenance.
- `@vitalspan_protocol`: canonical medications/supplements, timing, hidden items, and daily completion state.
- `@vitalspan_protocol_today`: compatibility mirror for existing completion consumers.
- `@vitalspan_exercise_log`: completed exercise records; no planned exercise is inferred.
- `@vitalspan_health_data`: connection/sync presence only. Wearable data is not added to Blood phenotypic age.
- Existing advisor context: deterministic interaction conflicts and privacy-reduced context.
- Existing published Brief issue/article services: the current editor-approved weekly research item.

### Navigation dependencies

`DashboardScreen` remains the `Home` tab. It uses existing routes for Settings, Profile, Biomarkers, Protocol, laboratory entry, interaction review, Blood phenotypic age details, AI Advisor, Paywall, and Articles. No route schema or tab navigator is replaced in Phase 1.

### Reusable components and contracts

- Published PhenoAge calculation and requirement states.
- Neutral source-laboratory-range interpretation.
- Canonical protocol types and existing persistence keys.
- Existing interaction context and published issue services.
- Existing dark clinical-premium theme and skeleton primitives.

### Removed Home assumptions

- Blood phenotypic age is not the primary daily hero.
- Laboratory upload is not a permanent feature card.
- Biomarkers are not a horizontal carousel.
- AI Advisor is not a standalone promotional card.
- Movement history is not a weekly dashboard summary.
- A streak or “Day X” is not shown without a real plan contract.
- Missing data does not generate a score, urgency, or filler card.

### State constraints

- Protocol persistence contains canonical and legacy shapes, so Home adapts both without changing the model.
- Skip and reschedule are not offered on Home because existing persistence does not support them there.
- Completed exercise can be shown, but a planned workout or lifestyle habit cannot be inferred.
- Wearable connection is represented by existing sync provenance, not by a new backend connection state.
- A most-important PhenoAge contributor is withheld because the current validated result does not expose an individually validated contributor attribution.

## Canonical Home hierarchy

1. Safety alert — only a current pharmacodynamic interaction rule with `slot === "any"`.
2. Today’s Priority — exactly one deterministic candidate.
3. Daily Health Brief — Do one thing, Watch, Opportunity.
4. Today’s Protocol — medication, supplement, completed exercise, and future habit presentation types.
5. Health State — scientifically bounded Blood phenotypic age state.
6. Changed Signals — zero to three comparable, provenance-rich updates.
7. Weekly Research — one quiet, editor-approved issue item.

## Priority ranking contract

Safety is rendered separately and always precedes the priority hero. The priority candidate order is:

1. Review a result outside its source laboratory range.
2. Repeat a stale required PhenoAge input.
3. Complete missing/invalid/unit-incompatible PhenoAge inputs.
4. Complete chronological-age profile data.
5. Take the next due item already in the saved protocol.
6. Calm “No action required today” fallback.

Each candidate carries source, freshness, bounded confidence language, a primary action, “Why this?”, “Evidence”, and a dismiss-for-today route. No language model participates in selection.

## Empty and partial data states

- No profile: known profile absence; Blood phenotypic age cannot be evaluated; review profile.
- No laboratory data: 0/9 known; no age estimate; add laboratory data.
- Partial laboratory data: exact present count and unmet statuses; no partial age; complete inputs.
- Stale required input: date is known; deterioration is not inferred; update measurement.
- No wearable connection: blood state remains separate; sleep/recovery cannot be interpreted; open Health State for connection context.
- No protocol: no action is fabricated; review Plan.
- No changed signals: a calm empty state replaces filler.
- Valid state/no action: valid Blood phenotypic age may remain visible while the priority says no action is required.

## Minimal navigation transition

Phase 1 leaves the current tabs unchanged to avoid an unrelated navigator migration. The future structure maps as follows:

| Future destination | Current transition |
| --- | --- |
| Today | Rename the current Home label after navigation research and migration tests. The screen content is already Today. |
| Health | Consolidate Biomarkers and Blood phenotypic age detail behind a Health root. |
| Plan | Rename Protocol and include planned exercise/lifestyle actions only after those models exist. |
| Care | Introduce a care/advisor root only when clinical workflows and permissions are defined. |
| You | Rename Profile and retain Settings as a nested route. |

This transition requires tab-label/root changes later, but no Phase 1 backend, authentication, paywall, Article, medication, supplement, or scientific-model changes.

## Accessibility and layout

- Native text scaling remains enabled; no fixed card widths are used.
- Widths below 360 points use compact padding and a smaller priority headline.
- Every section has a VoiceOver heading; actions, disclosures, safety alerts, and completion controls have semantic labels/roles.
- The skeleton follows the new hierarchy and disables pulse animation when Reduce Motion is enabled.
- No entrance or decorative animation is required for the Today feed.
