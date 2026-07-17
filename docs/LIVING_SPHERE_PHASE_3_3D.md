# Living Sphere Phase 3.3D — final editorial polish

## Final visual refinements

The renderer retains the established seven-layer pipeline and semantic contract.
This pass changes only its editorial expression:

- The sphere silhouette now uses a cached, subtly irregular path instead of a
  mathematically perfect circle.
- The nucleus uses asymmetric cached forms, low-opacity diffusion, and soft lower
  occlusion. It shares the existing breathing transform, so it feels alive without
  adding brightness, glow, or another animation loop.
- Both halo layers are slightly offset and their opacity is reduced by approximately
  18 percent. The same reduction applies in light and dark appearance.
- Surface material combines one faint translucent organic region with two restrained
  contours. There is no generated noise, bitmap texture, or repeating pattern.
- Internal depth comes from layer separation and diffusion rather than stronger
  shadows, blur, glass highlights, or simulated 3D.
- The highlight and perimeter were softened further to reduce the polished-marble
  impression while keeping the static silhouette legible.

## Editorial integration

The space below the sphere is tighter so the visual reads as part of Current State,
without crowding the hero on small screens or at larger text sizes. An understated
`Representing` line names the evidence-bearing domains in plain text. It is hidden
as a duplicate accessibility element because the renderer's semantic label already
announces represented and missing domains.

Evidence Clarity is now a quiet label-and-value block rather than a divided metric
row. Its meaning and reading order are unchanged, and evidence certainty remains
independent from health quality.

## Accessibility and performance

No accessibility semantics were removed. The renderer remains completely meaningful
without animation or color, tap and long press retain the same explanation path, and
Reduce Motion preserves the static composition and full semantic description.

The refinement adds no animated values, frame callbacks, blur, shaders, images, or
runtime geometry construction. All new shapes are module-level cached path strings.
The resource plan remains at 36 SVG elements, five shared values, and a minimum
six-second ambient cycle.

## Final self-review

- **More alive:** asymmetric nucleus diffusion and nonuniform surface layering suggest
  a living material without increasing motion amplitude.
- **Less artificial:** imperfect geometry, reduced halo, and softer specular contrast
  remove the remaining glass-marble cues.
- **Calm focal point:** the eye rests on the sphere, then moves directly to Current
  State and the evidence explanation.
- **Supportive hierarchy:** restrained size and contrast keep text authoritative.
- **Timeless when static:** the Reduce Motion capture preserves depth and expression
  without relying on an animated effect.
- **Honest uncertainty:** only evidence confidence changes visual definition; no state
  is mapped to danger, urgency, or traffic-light color.

## Remaining visual compromises

The committed captures are deterministic native reference renders rather than
device-simulator screenshots. They validate layout, palette, hierarchy, and the
Reduce Motion frame, but OLED appearance, VoiceOver rotor order, sustained device
frame pacing, and energy impact still require release-build validation on the oldest
supported iPhone. Those checks are bug/performance validation, not a reason to alter
the renderer architecture.

## Renderer freeze

Living Sphere Renderer v1 is now frozen. The semantic contract, layer ownership,
render-plan mapping, evidence-neutral palette roles, motion channels, accessibility
contract, and public renderer props should change only for a verified bug,
accessibility defect, or performance regression.

Future Multimodal Biological Age, protocol, Copilot, widget, Watch, and Lock Screen
work must enter through a versioned semantic-contract extension. It must not add raw
health access or scientific interpretation to the renderer.
