import React, { useCallback, useId, useMemo } from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';
import type { LivingSphereRendererContract } from '../../domain/livingSphere';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { LivingSphereArtwork } from './LivingSphereArtwork';
import { livingSphereAccessibilityProps } from './accessibility';
import { resolveLivingSpherePalette } from './palette';
import {
  assertLivingSpherePerformanceBounds,
  buildLivingSphereRenderPlan,
  type LivingSphereAppearance,
} from './renderPlan';
import { useLivingSphereMotion } from './useLivingSphereMotion';

export interface LivingSphereRendererProps {
  contract: LivingSphereRendererContract;
  size?: number;
  appearance?: LivingSphereAppearance | 'system';
  onPress?: () => void;
  onLongPress?: () => void;
  /** Stable hook for a future haptic adapter; the renderer never triggers haptics itself. */
  onInteraction?: (interaction: 'tap' | 'long_press') => void;
  testID?: string;
}

/**
 * Lightweight Living Sphere v1 renderer. It accepts only the bounded semantic
 * renderer contract and has no dependency on raw health-domain inputs.
 */
export const LivingSphereRenderer = React.memo(function LivingSphereRenderer({
  contract,
  size = 280,
  appearance = 'system',
  onPress,
  onLongPress,
  onInteraction,
  testID,
}: LivingSphereRendererProps) {
  const systemAppearance = useColorScheme();
  const systemReduceMotion = useReducedMotion();
  const resolvedAppearance: LivingSphereAppearance = appearance === 'system'
    ? systemAppearance === 'dark' ? 'dark' : 'light'
    : appearance;
  const boundedSize = Math.min(440, Math.max(96, size));
  const plan = useMemo(() => {
    const value = buildLivingSphereRenderPlan(contract, resolvedAppearance, systemReduceMotion);
    assertLivingSpherePerformanceBounds(value);
    return value;
  }, [contract, resolvedAppearance, systemReduceMotion]);
  const palette = useMemo(
    () => resolveLivingSpherePalette(resolvedAppearance, contract.state.palette),
    [contract.state.palette, resolvedAppearance],
  );
  const interactive = Boolean(onPress || onLongPress || onInteraction);
  const accessibility = useMemo(
    () => livingSphereAccessibilityProps(contract, interactive),
    [contract, interactive],
  );
  const reactId = useId();
  const idPrefix = useMemo(
    () => `living-sphere-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [reactId],
  );
  const { sphereStyle, flowStyle, pressIn, pressOut } = useLivingSphereMotion(plan);

  const handlePress = useCallback(() => {
    onInteraction?.('tap');
    onPress?.();
  }, [onInteraction, onPress]);
  const handleLongPress = useCallback(() => {
    onInteraction?.('long_press');
    onLongPress?.();
  }, [onInteraction, onLongPress]);

  return (
    <Pressable
      testID={testID}
      accessible
      accessibilityRole={accessibility.role}
      accessibilityLabel={accessibility.label}
      accessibilityHint={accessibility.hint}
      accessibilityIgnoresInvertColors
      onPress={interactive ? handlePress : undefined}
      onLongPress={interactive ? handleLongPress : undefined}
      onPressIn={interactive ? pressIn : undefined}
      onPressOut={interactive ? pressOut : undefined}
      delayLongPress={500}
      style={[s.container, { width: boundedSize, height: boundedSize }]}
    >
      <Animated.View style={[s.sphere, { width: boundedSize, height: boundedSize }, sphereStyle]}>
        <LivingSphereArtwork
          size={boundedSize}
          idPrefix={idPrefix}
          plan={plan}
          palette={palette}
          flowStyle={flowStyle}
        />
      </Animated.View>
    </Pressable>
  );
});

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphere: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
