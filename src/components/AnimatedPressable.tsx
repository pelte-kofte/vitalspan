import React from 'react';
import { GestureResponderEvent, Pressable, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Motion } from '../theme';

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** Haptic fired on tap. Pass 'none' for controls that already trigger their own haptic. */
  haptic?: 'light' | 'medium' | 'none';
  accessibilityRole?: 'button' | 'link';
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Drop-in replacement for TouchableOpacity for primary/secondary CTAs.
 * Scales to Motion.pressScale on press-in with a spring back on release,
 * and fires a light haptic on tap — the app-wide "premium press" feel.
 *
 * Runs entirely on the UI thread (Reanimated worklets) — never blocks JS.
 */
export default function AnimatedPressable({
  children,
  onPress,
  style,
  disabled = false,
  haptic = 'light',
  accessibilityRole = 'button',
  accessibilityLabel,
  testID,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress(e: GestureResponderEvent) {
    if (haptic === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    if (haptic === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
    onPress?.(e);
  }

  return (
    <ReanimatedPressable
      disabled={disabled}
      onPressIn={() => { scale.value = withSpring(Motion.pressScale, Motion.pressSpring); }}
      onPressOut={() => { scale.value = withSpring(1, Motion.pressSpring); }}
      onPress={handlePress}
      style={[style, animatedStyle, disabled && { opacity: 0.6 }]}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      {children}
    </ReanimatedPressable>
  );
}
