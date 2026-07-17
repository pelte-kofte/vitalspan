# Living Sphere final reference captures

These deterministic native reference captures document the frozen Phase 3.3D
composition:

- `iphone-se-light.png` — smallest supported editorial composition
- `iphone-17-pro-dark.png` — tall-screen dark appearance
- `light-mode.png` — standard light appearance
- `dark-mode.png` — standard dark appearance
- `reduce-motion.png` — complete static expression with motion disabled

Regenerate them from the repository root with:

```sh
swift scripts/living-sphere-snapshots.swift --integrated output/living-sphere-final
```

The harness is intentionally deterministic and has no simulator dependency. Final
OLED color, VoiceOver order, device frame pacing, and energy use remain release-build
validation tasks.
