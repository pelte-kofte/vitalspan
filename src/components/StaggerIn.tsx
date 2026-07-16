import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Motion } from '../theme';

interface Props {
  children: React.ReactNode;
  /** Position in the list — each step adds Motion.entranceStagger ms of delay. */
  index?: number;
  style?: StyleProp<ViewStyle>;
  reduceMotion?: boolean;
}

/**
 * Wraps a card/list-item with a subtle fade + slide-up mount animation,
 * staggered by index. Used for card lists across the app (Dashboard,
 * Protocol, Exercise) so content settles in rather than popping in at once.
 *
 * Kept deliberately understated per DESIGN_SYSTEM.md's calm/scientific
 * identity — short duration, no spring overshoot, small offset.
 */
export default function StaggerIn({ children, index = 0, style, reduceMotion = false }: Props) {
  if (reduceMotion) return <View style={style}>{children}</View>;

  return (
    <Animated.View
      style={style}
      entering={FadeInUp
        .duration(Motion.entranceDuration)
        .delay(index * Motion.entranceStagger)
        .withInitialValues({ transform: [{ translateY: Motion.entranceOffset }] })}
    >
      {children}
    </Animated.View>
  );
}
