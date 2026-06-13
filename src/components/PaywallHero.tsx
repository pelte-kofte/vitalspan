import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import NeuralGrid from './NeuralGrid';

const { width: W } = Dimensions.get('window');
const SPHERE_R = 88;
const SPHERE_CX = W / 2;
const SPHERE_CY = 140;
const ORBIT_R = 148;
const SVG_H = 300;

function arcPath(r: number): string {
  const toXY = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: SPHERE_CX + radius * Math.cos(rad), y: SPHERE_CY + radius * Math.sin(rad) };
  };
  const start = toXY(-135, r);
  const end = toXY(135, r);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`;
}

interface Props {
  onClose: () => void;
}

export default function PaywallHero({ onClose }: Props) {
  const rotation = useSharedValue(0);
  const spherePulse = useSharedValue(0.85);
  const entranceScale = useSharedValue(0.7);
  const entranceOpacity = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 14000, easing: Easing.linear }), -1, false,
    );
    spherePulse.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 3200, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
        withTiming(0.85, { duration: 3200, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
      ), -1, false,
    );
    entranceScale.value = withTiming(1.0, { duration: 900, easing: Easing.out(Easing.cubic) });
    entranceOpacity.value = withTiming(1.0, { duration: 700, easing: Easing.out(Easing.quad) });
  }, []);

  const arcStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const sphereContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: entranceScale.value }],
    opacity: entranceOpacity.value,
  }));
  const sphereInnerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(spherePulse.value, [0.85, 1.0], [0.85, 1.0]),
  }));

  return (
    // Dark hero gradient — accepted project exception for LinearGradient dark backgrounds
    // (same pattern as LongevityScoreScreen.tsx). No theme token exists for these deep-dark stops.
    <LinearGradient colors={['#080D09', '#0C1410', '#0F1C14']} style={s.gradient}>
      <SafeAreaView style={s.safe}>
        <NeuralGrid intensity="medium" tone="vital" />

        <View style={s.topBar}>
          <View style={s.spacer} />
          <TouchableOpacity style={s.backBtn} onPress={onClose}>
            <Text style={s.backBtnTxt}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={s.heroArea}>
          <Animated.View style={[s.sphereArea, sphereContainerStyle]}>
            <Svg width={W} height={SVG_H} style={StyleSheet.absoluteFill}>
              <Defs>
                <RadialGradient id="sphereGlow" cx="40%" cy="35%" r="65%" fx="40%" fy="35%">
                  <Stop offset="0%" stopColor="#2D5C3E" stopOpacity="1" />
                  <Stop offset="60%" stopColor="#1C3B2A" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#040808" stopOpacity="1" />
                </RadialGradient>
                <SvgGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor={Colors.viz.bioGreen} stopOpacity="0.8" />
                  <Stop offset="50%" stopColor={Colors.viz.cyan} stopOpacity="0.6" />
                  <Stop offset="100%" stopColor={Colors.viz.bioGreen} stopOpacity="0.1" />
                </SvgGradient>
              </Defs>
              <Circle cx={SPHERE_CX} cy={SPHERE_CY} r={ORBIT_R + 2} fill="none"
                stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
              <Circle cx={SPHERE_CX} cy={SPHERE_CY} r={SPHERE_R} fill="url(#sphereGlow)" />
              <Circle cx={SPHERE_CX} cy={SPHERE_CY} r={SPHERE_R - 1} fill="none"
                stroke="rgba(255,255,255,0.10)" strokeWidth={1.5} />
            </Svg>

            <Animated.View style={[StyleSheet.absoluteFill, arcStyle]}>
              <Svg width={W} height={SVG_H} style={StyleSheet.absoluteFill}>
                <Path d={arcPath(SPHERE_R + 14)} fill="none" stroke="url(#arcGrad)"
                  strokeWidth={2} strokeLinecap="round" strokeDasharray="8 6" />
              </Svg>
            </Animated.View>

            <Animated.View style={[s.heroTextArea, sphereInnerStyle]}>
              <Text style={s.heroHeadline}>{'Your longevity,\nunlocked.'}</Text>
              <Text style={s.heroSubline}>Science-backed tracking, personalized to you.</Text>
            </Animated.View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  spacer: { width: 38 },
  backBtn: { padding: Spacing.sm, width: 38, alignItems: 'center' },
  backBtnTxt: { color: Colors.dark.text, fontSize: 22 },
  heroArea: { flex: 1 },
  sphereArea: { width: W, height: SVG_H, alignSelf: 'center' },
  heroTextArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  heroHeadline: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
  },
  heroSubline: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
