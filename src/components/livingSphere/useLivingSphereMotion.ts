import { useCallback, useEffect } from 'react';
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { LivingSphereRenderPlan } from './renderPlan';

export function useLivingSphereMotion(plan: LivingSphereRenderPlan) {
  const breath = useSharedValue(0);
  const phase = useSharedValue(0);
  const flowPhase = useSharedValue(0);
  const drift = useSharedValue(0);
  const interactionScale = useSharedValue(1);
  const motion = plan.motion;

  useEffect(() => {
    cancelAnimation(breath);
    cancelAnimation(phase);
    cancelAnimation(flowPhase);
    cancelAnimation(drift);
    if (motion.reduced) {
      cancelAnimation(interactionScale);
      interactionScale.value = 1;
    }
    breath.value = 0;
    phase.value = 0;
    flowPhase.value = 0;
    drift.value = 0;
    if (motion.reduced) return;

    if (motion.breathEnabled) {
      const outward = Math.round(motion.breathCycleMs * (0.5 + motion.rhythmVariance));
      const inward = motion.breathCycleMs - outward;
      breath.value = withRepeat(withSequence(
        withTiming(1, { duration: outward, easing: Easing.bezier(0.33, 0, 0.2, 1) }),
        withTiming(0, { duration: inward, easing: Easing.bezier(0.4, 0, 0.65, 1) }),
      ), -1, false);
    }
    if (motion.flowEnabled) {
      flowPhase.value = withRepeat(withSequence(
        withTiming(1, { duration: motion.flowCycleMs / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: motion.flowCycleMs / 2, easing: Easing.inOut(Easing.sin) }),
      ), -1, false);
    }
    if (motion.rotationEnabled) {
      phase.value = withRepeat(withSequence(
        withTiming(1, { duration: motion.rotationCycleMs / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: motion.rotationCycleMs / 2, easing: Easing.inOut(Easing.sin) }),
      ), -1, false);
    }
    if (motion.driftEnabled) {
      drift.value = withRepeat(withSequence(
        withTiming(1, { duration: motion.driftCycleMs / 4, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: motion.driftCycleMs / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: motion.driftCycleMs / 4, easing: Easing.inOut(Easing.sin) }),
      ), -1, false);
    }
  }, [breath, drift, flowPhase, interactionScale, motion.breathCycleMs, motion.breathEnabled, motion.driftCycleMs,
    motion.driftEnabled, motion.flowCycleMs, motion.flowEnabled, motion.reduced,
    motion.rhythmVariance, motion.rotationCycleMs, motion.rotationEnabled, phase]);

  const sphereStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift.value * motion.driftDistance * motion.driftDirection },
      { translateY: drift.value * motion.driftDistance * 0.45 },
      { scale: (1 + breath.value * motion.breathScale) * interactionScale.value },
      { rotate: `${motion.rotationEnabled ? phase.value * 6 * motion.rotationDirection : 0}deg` },
    ],
  }), [motion.breathScale, motion.driftDirection, motion.driftDistance,
    motion.rotationDirection, motion.rotationEnabled]);

  const flowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${motion.flowEnabled
      ? flowPhase.value * 14 * motion.flowDirection : 0}deg` }],
  }), [motion.flowDirection, motion.flowEnabled]);

  const pressIn = useCallback(() => {
    if (motion.reduced) return;
    interactionScale.value = withTiming(0.985, {
      duration: 140,
      easing: Easing.out(Easing.quad),
    });
  }, [interactionScale, motion.reduced]);
  const pressOut = useCallback(() => {
    if (motion.reduced) return;
    interactionScale.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [interactionScale, motion.reduced]);

  return { sphereStyle, flowStyle, pressIn, pressOut };
}
