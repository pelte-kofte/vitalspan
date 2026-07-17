# Living Sphere Phase 3.3C — integration and editorial polish

## Product hierarchy

The Health Overview hero now follows one fixed reading order:

1. Health Overview
2. Living Sphere
3. Current State
4. Evidence Clarity
5. Primary Insight
6. Primary Action

The sphere remains a supporting visual. Current state, certainty, insight, action,
limitations, provenance, and the existing blood model remain available as text.
The old blood-age numeral was moved into the optional blood-model disclosure so it
does not become a global-health interpretation or compete with the Living Sphere.

## Integration boundary

`buildHealthLivingSphere` is the only app integration adapter. It turns existing
source-attributed laboratory and HealthKit records into inputs for the established
independent Blood, Sleep, Recovery, and Fitness engines. Nutrition and Lifestyle
remain explicit no-data domains until compatible evidence exists.

Laboratory observations use only the source laboratory's supplied range and the
existing neutral classifier. Wearable values receive no newly invented thresholds
or interpretations. Trend history is not synthesized from raw records. The domain
states are projected through `createLivingSphereInput`, and the renderer receives
only `LivingSphereRendererContract`; raw values cannot cross the boundary.

## Visual refinements

- Removed the bordered-card treatment from the hero to create an editorial flow.
- Sized the sphere responsively from the smaller of available width and hero-height
  allowance, bounded to 112–184 points.
- Reduced sphere size as Dynamic Type grows so explanatory text retains priority.
- Softened the core with additional low-contrast gradient transitions.
- Reduced concentric halo strength and the hard perimeter line.
- Added quiet lower-depth occlusion without blur, glass, shaders, or 3D rendering.
- Kept surface contours sparse and subordinate to evidence clarity.
- Preserved the same low-saturation, evidence-neutral palette in light and dark.

## Motion refinements

- Breathing now uses asymmetric inhale/exhale curves for a less mechanical cadence.
- Rotation and internal flow use slow, reversible arcs rather than full revolutions.
- Drift returns to its origin before repeating, removing visible loop boundaries.
- Trend direction still selects motion direction; confidence, persistence, pattern,
  and velocity remain bounded by the deterministic render plan.
- Unknown trends retain slow non-directional breathing.
- Press feedback uses a restrained 0.985 scale and a longer release; the optional
  haptic adapter hook remains external to the renderer.
- Reduce Motion disables ambient and interaction animation while preserving the
  exact static hierarchy and accessibility content.

## Interaction and accessibility

Tap applies gentle feedback and toggles the evidence explanation. Long press reveals
the same explanation directly. This dual path avoids making a long-press gesture the
only route to information.

The screen-reader order exposes Current State, Evidence Clarity, Primary Insight,
action, represented domains, missing domains, and motion status. The renderer is an
image when passive and an image-button when integrated. Color and animation are never
required for meaning.

## Performance strategy

- The hero and artwork are memoized.
- Contract construction is memoized by source data, assessment time, and Reduce Motion.
- Static SVG geometry and gradient identifiers are reused across frames.
- Current artwork uses 36 SVG elements under a hard limit of 40.
- Five shared values cover four ambient layers plus press feedback.
- Reanimated runs motion on the UI thread with no JavaScript frame callback.
- The shortest generated ambient cycle remains above the six-second guardrail.

## Design review

- **Calm:** no flashes, full rotations, particles, alarms, or urgent motion.
- **Timeless:** restrained geometry, low saturation, system typography, and no HUD treatment.
- **Honest uncertainty:** incomplete evidence softens detail and remains explicit in text.
- **No medical alarmism:** review states do not change the palette or create warning visuals.
- **Alive, not animated:** motion is low-amplitude, asymmetric, continuous, and optional.
- **Premium restraint:** depth comes from occlusion and diffusion rather than glow or blur.

Screenshot review found three issues in the first pass: a perimeter line that read as
a gauge, an over-bright dark-mode highlight, and insufficient text priority on the
small screen. The perimeter and highlight were softened, sphere sizing was capped,
and the Current State/Insight spacing was increased before the final captures.

## Remaining device review

Reference captures validate composition, sizing, palette, and the static Reduce
Motion frame. Final on-device energy impact, VoiceOver rotor order, OLED appearance,
and sustained 60 FPS should be confirmed after the Health screen is available in the
release build on the oldest supported iPhone. This does not require a domain or
renderer architecture change.
