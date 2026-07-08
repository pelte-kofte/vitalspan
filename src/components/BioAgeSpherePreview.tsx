import React, { useEffect } from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../theme';

interface Props {
  /** Overall diameter in points. */
  size?: number;
  /**
   * Dimmed = the "not enough data yet" empty state: desaturated glow, no
   * bioGreen ring. Matches LongevityScoreScreen's sphere motif at small
   * scale without duplicating its full orbit/data-point logic.
   */
  dimmed?: boolean;
}

/**
 * Small reusable riff on the canonical BioAge sphere (see
 * LongevityScoreScreen.tsx) — used wherever a compact "sphere" motif is
 * needed: Dashboard's empty BioAge card, and the boot loading screen.
 * Deliberately does not replace or import from LongevityScoreScreen, which
 * remains the full canonical instance with orbit rings and data orbs.
 */
export default function BioAgeSpherePreview({ size = 64, dimmed = true }: Props) {
  const pulse = useSharedValue(dimmed ? 0.55 : 0.85);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(dimmed ? 0.75 : 1.0, { duration: 2400, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
        withTiming(dimmed ? 0.55 : 0.85, { duration: 2400, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
      ),
      -1,
      false,
    );
  }, [dimmed]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const r = size / 2;
  const gradientId = dimmed ? 'sphereGlowDim' : 'sphereGlowLive';
  const stops = dimmed
    ? [
        { offset: '0%', color: 'rgba(255,255,255,0.14)' },
        { offset: '60%', color: 'rgba(255,255,255,0.04)' },
        { offset: '100%', color: '#040808' },
      ]
    : [
        { offset: '0%', color: '#3A6B4A' },
        { offset: '60%', color: Colors.primaryDark },
        { offset: '100%', color: '#040808' },
      ];

  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradientId} cx="40%" cy="35%" r="65%" fx="40%" fy="35%">
            {stops.map(stop => (
              <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} stopOpacity="1" />
            ))}
          </RadialGradient>
        </Defs>
        <Circle cx={r} cy={r} r={r - 1} fill={`url(#${gradientId})`} />
        <Circle
          cx={r}
          cy={r}
          r={r - 1}
          fill="none"
          stroke={dimmed ? 'rgba(255,255,255,0.10)' : Colors.viz.bioGreen}
          strokeWidth={1}
          strokeOpacity={dimmed ? 1 : 0.3}
        />
      </Svg>
    </Animated.View>
  );
}
