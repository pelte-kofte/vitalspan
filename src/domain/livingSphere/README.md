# Living Sphere semantic architecture

The Living Sphere module defines the renderer-independent translation layer for
Vitalspan's Living Sphere. It contains no animation loop, shader, canvas, 3D scene,
visual dependency, biological-age logic, global health score, diagnosis, or advice.

The sphere expresses deterministic domain intelligence. It never determines health
state and never reads raw health records.

```text
Domain Intelligence
        ↓
Raw-data-excluding state + Trend Intelligence projection
        ↓
Isolated semantic layer mapping
        ↓
Deterministic aggregation and validation
        ↓
Stable renderer contract + accessible explanation
        ↓
Pure bounded render plan
        ↓
Living Sphere Renderer v1 (React Native SVG + UI-thread motion)
```

## Supported and excluded domains

The sphere supports Blood, Sleep, Recovery, Fitness, Nutrition, and Lifestyle.
Medication, Supplement, Peptide, and Therapy are rejected at the input boundary.
Protocol presence or adherence therefore cannot imply visual improvement or
deterioration. Genetics is also excluded.

`toLivingSphereDomainInput` is the intended projection boundary. It copies only:

- current semantic state;
- confidence and the freshness, history-depth, and consistency factors;
- data completeness;
- structured observed signals and known gaps;
- limitations;
- the source-attributed evidence summary;
- reduced Trend Intelligence semantics, coverage, provenance, and limitations;
- the latest evidence timestamp.

It does not copy `availableMetrics`, raw values, units, protocol information,
recommendations, or future capability metadata. Runtime validation rejects extra
fields, including raw metric collections.

## Layer ownership

Every supported domain owns exactly one semantic layer. Evidence clarity is the
only aggregate layer.

| Domain | Layer | Properties it may influence |
| --- | --- | --- |
| Blood | Core vitality | luminosity, density, continuity |
| Sleep | Atmospheric rhythm | breath cadence, halo softness, expansion regularity |
| Recovery | Internal flow | flow continuity, pulse stability, movement coherence |
| Fitness | Kinetic presence | rotational energy, structural responsiveness, movement range |
| Nutrition | Surface richness | texture richness, surface continuity, organic detail |
| Lifestyle | Environmental stability | spatial steadiness, ambient noise, drift, environmental calm |
| Aggregate evidence | Evidence clarity | sharpness, opacity, layer visibility, ambiguity |

Changing a domain state changes only its assigned layer mapping. Aggregate
coherence, uncertainty, explanations, and motion mode may respond to the plural set
of domain states, but no aggregate health state is created.

## State expression

Mappings are semantic enums, not numeric health values:

- `unknown` is restrained and indeterminate;
- `excellent` is expressive, coherent, and regular;
- `good` is balanced, continuous, and regular;
- `stable` is balanced, continuous, and steady;
- `needs_review` uses visible but calm variability;
- `attention_needed` uses pronounced variability without critical colors.

Color is supportive only. Palette values are roles such as `neutral_base`,
`warm_vitality`, `cool_depth`, `muted_uncertainty`, and `soft_attention`; there are
no hard-coded colors and no red/green status mapping. Every state remains available
through layer structure, explanation, and accessibility text.

## Evidence clarity and uncertainty

Health state never controls evidence clarity. Clarity is constrained only by:

- domain confidence;
- data completeness;
- represented-domain coverage;
- freshness and uncertainty reasons.

Insufficient confidence is obscured, limited confidence is muted, moderate is
partial, high is clear, and very high is crystalline. Partial completeness caps a
layer at partial visibility. Coverage of one or two domains caps aggregate clarity
at muted; incomplete six-domain coverage caps it at partial.

This separation guarantees that low-confidence `good` evidence cannot appear more
certain than high-confidence `needs_review` evidence. Missing data changes clarity
and visibility, never health quality.

Uncertainty explicitly records missing domains, low confidence, stale evidence,
and conflicting states. Multiple reasons produce compound uncertainty. A sphere
with no evidence has high ambiguity and a calm neutral dormant state.

## Fallback and conflict policy

The primary evidence mode uses deterministic precedence:

1. `no_evidence`
2. `conflicting_evidence`
3. `stale_evidence`
4. `limited_evidence`
5. `sufficient_evidence`

Conflicting evidence means at least one moderate-or-higher-confidence positive
domain state and one moderate-or-higher-confidence review/attention state. It is
not collapsed to Good or Bad. Each assigned layer retains its source state while
overall coherence becomes variable.

A dominant influence is exposed only for non-unknown evidence with at least
moderate confidence. Attention and review states have visual prominence, followed
by excellent, good, and stable states. Confidence breaks state ties; an unresolved
tie returns no dominant influence. These internal ordinal comparisons select a
semantic influence only. They are not exposed values, combined health calculations,
or scores.

## Trend projection and temporal stability

The sphere does not derive trends from raw observations or from current-state
heuristics. It consumes each domain's deterministic Trend Intelligence output:

- `unknown` with zero or one observation → `insufficient_history`;
- supported but unestablished history → `snapshot`;
- `emerging_pattern` → `emerging_trend`;
- `stable_pattern`, `volatile_pattern`, `seasonal_pattern`, and
  `interrupted_pattern` retain their explicit semantics.

Every represented layer receives a motion profile containing only direction, trend
confidence, pattern, persistence, and velocity. Trend provenance and limitations
remain attached to the input projection for deterministic explanation and audit.
No trend is inferred from insufficient history, and `unknown` is never converted to
stable. Temporal aggregation is a visual rhythm decision only; it is not a global
health trend and carries no medical interpretation.

## Accessibility and motion

Every visual state includes a deterministic accessible summary covering living
coherence, evidence clarity, represented domains, limiting evidence, and motion.
Layer explanations identify the assigned domain, evidence summary, source providers,
and update time.

`animationRequiredForMeaning` is always `false`. With Reduce Motion enabled, a
represented sphere uses static mode and retains semantic continuity, clarity,
layer state, and complete accessibility text. No state depends solely on motion or
palette.

## Renderer contract and validation

`LivingSphereRendererContract` contains only a versioned `LivingSphereVisualState`,
the Reduce Motion preference, and accessibility data. It has no dependency on
Skia, Three.js, WebGL, Lottie, SVG, Reanimated, Metal, or a UI framework.

Renderer properties use bounded enums. The only numbers are transparent domain and
evidence counts. Validation rejects duplicate or unsupported domains, future-dated
evidence, raw/extra fields, inconsistent completeness, undefined behavior, NaN,
infinite values, unknown enum values, and incorrect layer ownership.

## Renderer v1 pipeline

`src/components/livingSphere` is the only rendering implementation. Its public
component accepts `LivingSphereRendererContract`; it has no raw-domain, metric,
protocol, score, or recommendation prop.

```text
LivingSphereRendererContract
        ↓ validate bounded semantics
buildLivingSphereRenderPlan (pure and deterministic)
        ↓
evidence-neutral palette + cached SVG paths/gradients
        ↓
five independent UI-thread animated values at most, including press feedback
        ↓
accessible Pressable wrapper + static semantic fallback
```

The seven visual concerns are composed as a soft core, atmosphere, clipped internal
flow, restrained surface contours, kinetic rotation, environmental drift, and a
clarity multiplier. Evidence clarity alone controls opacity/certainty. Health state
never selects a traffic-light color. Light and dark palettes are low-saturation
theme tokens and carry no good/bad meaning.

Trend-to-motion mapping is deliberately bounded:

- direction selects forward/reverse/idle motion;
- trend confidence reduces motion amplitude and expression;
- pattern controls whether rhythm is continuous, variable, or interrupted;
- persistence reduces deterministic rhythm variance and damps layer motion until established;
- velocity selects only a conservative duration multiplier;
- unknown trends retain calm, non-directional idle breathing.

Reduce Motion disables all animation values without changing layers, clarity,
explanations, or accessibility text. The renderer exposes the complete summary as
an image label, or as a button label and hint when tap/long-press hooks are supplied.
No animation or color is required to understand the state.

The production resource guard permits at most 40 SVG elements (36 currently used), five animated
values, and no animation cycle shorter than six seconds. Geometry and gradient
definitions are static, the artwork and renderer are memoized, and Reanimated runs
the slow loops on the UI thread without JavaScript frame callbacks.

## Prohibited uses

The Living Sphere must never diagnose disease, infer treatment, estimate biological
age, predict lifespan or mortality, calculate a health/readiness score, inspect raw
records, include protocol domains, hide uncertainty, translate missing data into
poor health, imply clinical precision, or use AI-generated state logic.

Future biological-age, protocol, Copilot, widget, Watch, and lock-screen work must
extend the versioned semantic contract rather than read health data from the
renderer.

## Renderer freeze

Phase 3.3D freezes Renderer v1's semantic contract, layer ownership, render-plan
mapping, evidence-neutral palette roles, motion channels, accessibility contract,
and public component props. Changes are limited to verified bug, accessibility, and
performance fixes. Future capabilities must use a versioned contract extension;
they must not move scientific interpretation or raw health access into the renderer.
