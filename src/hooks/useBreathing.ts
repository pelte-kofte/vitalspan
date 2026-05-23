import { useEffect } from 'react';
import {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { Motion } from '../theme';

/**
 * Returns a SharedValue oscillating 0→1→0 at the given period (ms).
 * Subscribe multiple components to the same rhythm by passing the same period.
 */
export function useBreathing(period: number = Motion.breath): SharedValue<number> {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: period / 2,
          easing: Easing.bezier(0.37, 0, 0.63, 1),
        }),
        withTiming(0, {
          duration: period / 2,
          easing: Easing.bezier(0.37, 0, 0.63, 1),
        }),
      ),
      -1,
      false,
    );
  }, [period]);

  return value;
}
