# Living Sphere Health Overview captures

Deterministic native reference captures generated with:

```sh
swift scripts/living-sphere-snapshots.swift --integrated output/living-sphere-integration
```

| File | Configuration | Pixels |
| --- | --- | --- |
| `iphone-se-light.png` | iPhone SE, integrated light hero | 750 × 1334 |
| `iphone-17-pro-dark.png` | iPhone 17 Pro, integrated dark hero | 1206 × 2622 |
| `light-mode.png` | Standard integrated light reference | 1179 × 2556 |
| `dark-mode.png` | Standard integrated dark reference | 1179 × 2556 |
| `reduce-motion.png` | Integrated dark static phase | 1179 × 2556 |

The captures are review artifacts, not a new app route. This keeps navigation and
the production Health experience unchanged outside the requested hero integration.
