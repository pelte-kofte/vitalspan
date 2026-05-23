import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Motion } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  period?: number;
}

const BreathingCard = React.memo(function BreathingCard({
  children,
  style,
  glowColor = '#1C3B2A',
  period = Motion.breath,
}: Props) {
  const scale = useSharedValue(1.0);
  const shadowOpacity = useSharedValue(0.08);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.005, {
          duration: period / 2,
          easing: Easing.bezier(0.37, 0, 0.63, 1),
        }),
        withTiming(1.0, {
          duration: period / 2,
          easing: Easing.bezier(0.37, 0, 0.63, 1),
        }),
      ),
      -1,
      false,
    );

    shadowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.22, {
          duration: period / 2,
          easing: Easing.bezier(0.37, 0, 0.63, 1),
        }),
        withTiming(0.08, {
          duration: period / 2,
          easing: Easing.bezier(0.37, 0, 0.63, 1),
        }),
      ),
      -1,
      false,
    );
  }, [period]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 20,
          elevation: 6,
        },
        animStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
});

export default BreathingCard;
