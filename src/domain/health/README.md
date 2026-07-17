# Vitalspan health-domain intelligence

This module is the deterministic interpretation boundary for multimodal health
evidence. It is independent from screens, navigation, persistence, AI services,
biological-age calculations, and every other domain.

## Pipeline

Each domain engine runs the same pure pipeline against only its own input:

1. Validate the evaluation time, metric identifiers, timestamps, capability,
   provenance, source reliability, and interpretation metadata.
2. Group source-attributed metrics by the domain's declared capabilities.
3. Select the latest interpreted observation for each capability.
4. Emit one structured observed signal per capability. Missing or uninterpreted
   evidence becomes an `unknown` signal rather than an inferred conclusion.
5. Resolve the domain state using semantic precedence, never arithmetic:
   `attention_needed`, `needs_review`, incomplete/unknown evidence, `stable`,
   `good`, then `excellent`.
6. Select exactly one primary driver from the signal that determines the state.
7. Extract evidence-backed strengths, factual gaps, and data-monitoring priorities.
8. Build a provenance-referencing evidence summary and explain confidence through
   completeness, consistency, freshness, source reliability, and history depth.
9. Independently interpret structured domain-state history into trend intelligence.

Every non-unknown state and positive strength contains supporting metric IDs.
Monitoring priorities describe evidence to collect or maintain; they are not
treatment recommendations.

## Interpretation boundary

`DomainMetric.value` is retained exactly as evidence. An arbitrary raw value is
never medically interpreted by the shared engine. A validated domain-local adapter
may attach `MetricInterpretation`, which must include:

- a semantic state;
- observation-only human-readable text;
- a declared basis such as a source reference or longitudinal pattern, plus a
  human-readable explanation of that basis;
- evidence consistency metadata;
- optional factual strength, gap, and monitoring-priority text.

The shared engine reduces this explicit metadata deterministically. It does not
apply undocumented clinical thresholds, infer disease, diagnose, estimate
longevity, or generate advice.

## State rules

- Any current `attention_needed` signal makes the domain `Attention Needed`.
- Otherwise, any current `needs_review` signal makes it `Needs Review`.
- Positive conclusions require complete capability coverage and interpreted
  evidence. Missing or unknown evidence makes the domain `Unknown`.
- With complete evidence, `stable` takes precedence over `good`, and `good` over
  `excellent`, preventing a stronger conclusion than the weakest current signal.
- The latest interpreted observation represents each capability. Historical data
  remains available for summaries and confidence.
- A domain with no evidence always has `Unknown` state and `Insufficient evidence`
  as its primary driver.

## Confidence rules

Confidence is an evidence-quality result, not a health result. Each output includes
all five factors and their explanations. The overall level is the most limiting
factor; no numeric points, weighting, or hidden score is used.

- Completeness uses capability coverage.
- Consistency uses the explicit consistency metadata from interpreted evidence.
- Freshness compares the newest observation with the domain's documented evidence
  window at the required `asOf` time.
- Source reliability uses explicit provenance reliability classifications.
- Historical depth counts distinct visits, nights, days, reviews, assessments,
  sessions, or monitoring periods.

The evaluation timestamp is required whenever evidence is supplied, which keeps
freshness evaluation reproducible and testable.

## Trend Intelligence pipeline

Current State and Trend Intelligence are separate outputs:

```text
Current source-attributed metrics → Current domain state

Prior structured domain states   → Domain trend state
```

`DomainTrendHistory` accepts only prior semantic `DomainHistorySnapshot` records.
Each snapshot contains a domain ID, semantic state, timestamp, provenance, and
supporting metric IDs. It cannot contain raw values or units. Runtime validation
rejects extra fields, cross-domain snapshots, duplicate IDs or timestamps, future
observations, unsupported sources, and seasonal-pattern references to unknown
snapshots.

The trend reducer never reads `DomainMetric.value` or the current engine's metric
history. Every domain engine calls the same pure reducer with only its own typed
history, so there is no global trend or cross-domain reasoning.

### Direction rules

- No history or one observation → `unknown`.
- Two unchanged observations → `unknown`; two changing observations → `emerging`.
- Three or more uninterrupted known observations are required to establish a
  direction.
- No semantic state transitions → `stable`.
- Consistently upward semantic-state transitions → `improving`.
- Consistently downward semantic-state transitions → `declining`.
- Transitions in both directions → `mixed`.
- Any declared missing period or unknown historical state → `unknown`.

The internal semantic order is `attention_needed`, `needs_review`, `stable`,
`good`, `excellent`. It compares prior deterministic domain conclusions only; it
does not rank raw measurements or create a health score.

### Pattern rules

- Established stable direction → `stable_pattern`.
- Emerging, improving, or declining change → `emerging_pattern`.
- Mixed direction → `volatile_pattern`.
- Missing periods or unknown snapshots → `interrupted_pattern`.
- `seasonal_pattern` requires explicit structured seasonal evidence referencing
  at least two valid snapshots. The trend engine never discovers seasonality from
  arbitrary raw history.

### Persistence and velocity

Persistence describes how long a consistent observed behavior remains represented:

- at least three observations → `recent`;
- at least 90 days or six observations → `established`;
- at least 365 days or twelve observations → `long_term`.

Mixed direction, a two-point emerging direction, interrupted history, or
insufficient history has unknown persistence.

Velocity describes transition frequency only. It is unknown for stable, emerging,
interrupted, or insufficient history. For established improving, declining, or
mixed direction:

- a state transition in every supported interval → `rapid`;
- at least one transition per three supported intervals → `moderate`;
- less frequent observed transitions → `slow`.

Velocity never implies urgency or danger.

### Trend confidence

Trend confidence is independent from current health quality and uses the most
limiting of five explained factors:

- historical depth;
- continuity and missing periods;
- freshness;
- source reliability;
- directional consistency.

No numeric weighting or hidden score is used. Two observations are always limited;
five continuous device observations may reach high confidence; twelve continuous,
fresh, clinically verified observations may reach very high confidence.

### Coverage, provenance, and limitations

Every trend exposes observation count, history length in days, exact time span,
interval type, supported intervals, and missing periods. Provenance preserves every
supporting source and adds a `calculated` record from the versioned deterministic
trend engine with the contributing snapshot IDs.

Limitations identify insufficient depth, sparse laboratory history, missing
windows, unknown states, irregular intervals or manual logging, and limited source
reliability. Explanations are fixed deterministic observations with snapshot IDs;
they contain no advice or diagnosis.

Trend output is entirely semantic and remains understandable without animation.
Phase 3.2.1 does not connect trend output to Living Sphere motion; that integration
belongs to a later phase.

## Domain policies

Each file under `domains/` owns only its capability copy, missing-evidence language,
monitoring language, and evidence-quality policy. No domain imports another.

| Domain | Freshness window | Moderate history | Strong history | Collection unit |
| --- | ---: | ---: | ---: | --- |
| Blood | 365 days | 2 | 3 | visit |
| Sleep | 14 days | 7 | 28 | night |
| Recovery | 7 days | 7 | 21 | day |
| Fitness | 90 days | 2 | 6 | assessment |
| Nutrition | 14 days | 7 | 28 | day |
| Lifestyle | 180 days | 2 | 4 | review |
| Medication | 90 days | 2 | 4 | review |
| Supplement | 30 days | 7 | 28 | day |
| Peptide | 30 days | 2 | 4 | monitoring period |
| Therapy | 90 days | 2 | 6 | session |

These windows affect evidence confidence only. They are not clinical ranges and do
not change health state.

Phenotypic age and future longevity interventions remain inactive capability
metadata. Genetics remains `GENETICS_DOMAIN_PLACEHOLDER` and has no executable
engine.
