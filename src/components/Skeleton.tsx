import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, View, ViewStyle } from 'react-native';
import { Colors, Radius } from '../theme';

/**
 * Generalized skeleton-loading primitives — factored out of
 * ArticleSkeletonLoader.tsx's opacity-pulse pattern so every data-driven
 * screen can build its own loading shape without duplicating the animation.
 *
 * Usage: wrap a screen-shaped arrangement of <SkeletonBlock> placeholders in
 * <SkeletonPulse>. See ArticleSkeletonLoader.tsx, or the Dashboard/Protocol/
 * Exercise skeletons for examples of screen-specific compositions.
 */

interface PulseProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonPulse({ children, style }: PulseProps) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return <Animated.View style={[{ opacity: anim }, style]}>{children}</Animated.View>;
}

interface BlockProps {
  w: DimensionValue;
  h: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBlock({ w, h, radius = 4, style }: BlockProps) {
  return <View style={[s.block, { width: w, height: h, borderRadius: radius }, style]} />;
}

/** A rounded card-shaped skeleton container, matching the app's standard card chrome. */
export function SkeletonCard({ children, style }: PulseProps) {
  return <View style={[s.card, style]}>{children}</View>;
}

const s = {
  block: {
    backgroundColor: Colors.dark.bgElevated,
  },
  card: {
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    overflow: 'hidden' as const,
  },
};
