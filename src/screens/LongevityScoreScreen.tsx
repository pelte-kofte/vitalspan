import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, Radius } from '../theme';
import NeuralGrid from '../components/NeuralGrid';

const { width: W } = Dimensions.get('window');
const SPHERE_R = 88;
const SPHERE_CX = W / 2;
const SPHERE_CY = 156;
const ORBIT_R = 148;
const SVG_H = 340;

// Data points equally spaced around orbit
const DATA_POINTS = [
  { key: 'sleep', label: 'Sleep', unit: 'hrs', angle: -90 },
  { key: 'hrv', label: 'HRV', unit: 'ms', angle: -30 },
  { key: 'recovery', label: 'Recovery', unit: '%', angle: 30 },
  { key: 'inflammation', label: 'Inflam.', unit: '', angle: 90 },
  { key: 'glucose', label: 'Glucose', unit: 'mg/dL', angle: 150 },
  { key: 'fitness', label: 'Fitness', unit: '', angle: 210 },
] as const;

interface HealthSnap {
  sleep?: number;
  hrv?: number;
  recovery?: number;
  inflammation?: string;
  glucose?: number;
  fitness?: string;
}

interface UserProfile {
  name?: string;
  age?: number;
  biologicalAge?: number;
}

function polarToXY(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function healthScoreColor(bioAge?: number, age?: number): [string, string] {
  if (bioAge == null || age == null) return ['#1C3B2A', '#2D6A4F'];
  const diff = age - bioAge;
  if (diff >= 3) return ['#0D2B22', '#2D6A4F']; // optimal — green
  if (diff >= 0) return ['#1A2010', '#3A5C2E']; // good
  return ['#2A1A0A', '#6B3B12']; // review — amber
}

function dataValue(snap: HealthSnap, key: string): string {
  switch (key) {
    case 'sleep': return snap.sleep != null ? `${snap.sleep}h` : '—';
    case 'hrv': return snap.hrv != null ? `${snap.hrv}` : '—';
    case 'recovery': return snap.recovery != null ? `${snap.recovery}%` : '—';
    case 'inflammation': return snap.inflammation ?? '—';
    case 'glucose': return snap.glucose != null ? `${snap.glucose}` : '—';
    case 'fitness': return snap.fitness ?? '—';
    default: return '—';
  }
}

export default function LongevityScoreScreen() {
  const nav = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [healthSnap, setHealthSnap] = useState<HealthSnap>({});

  useFocusEffect(
    React.useCallback(() => {
      Promise.all([
        AsyncStorage.getItem('@vitalspan_user_profile'),
        AsyncStorage.getItem('@vitalspan_health_data'),
      ]).then(([pRaw, hRaw]) => {
        if (pRaw) setProfile(JSON.parse(pRaw));
        if (hRaw) setHealthSnap(JSON.parse(hRaw));
      }).catch(console.error);
    }, []),
  );

  // Rotating outer arc
  const rotation = useSharedValue(0);
  // Inner sphere pulse
  const spherePulse = useSharedValue(0.85);
  // Entrance scale
  const entranceScale = useSharedValue(0.7);
  const entranceOpacity = useSharedValue(0);
  // Data point stagger
  const dpOpacity = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 14000, easing: Easing.linear }),
      -1,
      false,
    );
    spherePulse.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 3200, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
        withTiming(0.85, { duration: 3200, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
      ),
      -1,
      false,
    );
    entranceScale.value = withTiming(1.0, { duration: 900, easing: Easing.out(Easing.cubic) });
    entranceOpacity.value = withTiming(1.0, { duration: 700, easing: Easing.out(Easing.quad) });
    dpOpacity.value = withDelay(
      500,
      withTiming(1.0, { duration: 600, easing: Easing.out(Easing.quad) }),
    );
  }, []);

  const arcStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const sphereContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: entranceScale.value }],
    opacity: entranceOpacity.value,
  }));

  const dpStyle = useAnimatedStyle(() => ({ opacity: dpOpacity.value }));

  const sphereInnerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(spherePulse.value, [0.85, 1.0], [0.85, 1.0]),
  }));

  const bioAge = profile?.biologicalAge;
  const chronoAge = profile?.age;
  const yearsDiff = bioAge != null && chronoAge != null ? chronoAge - bioAge : 0;
  const [gradStart, gradEnd] = healthScoreColor(bioAge, chronoAge);

  // Build dashed arc path for the rotating ring
  // Draws ~270° arc with gaps
  function arcPath(r: number): string {
    const start = polarToXY(-135, r, SPHERE_CX, SPHERE_CY);
    const end = polarToXY(135, r, SPHERE_CX, SPHERE_CY);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`;
  }

  const projectedLifespan =
    bioAge != null && chronoAge != null
      ? `${85 + yearsDiff}–${92 + yearsDiff} years`
      : 'Log your biomarkers to unlock';

  return (
    <LinearGradient
      colors={['#080D09', '#0C1410', '#0F1C14']}
      style={s.gradient}
    >
      <SafeAreaView style={s.safe}>
        {/* Background grid */}
        <NeuralGrid intensity="high" tone="vital" />

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.topBar}>
            <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={s.screenTitle}>LONGEVITY SCORE</Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Sphere + orbit visualization */}
          <Animated.View style={[s.sphereArea, sphereContainerStyle]}>
            <Svg width={W} height={SVG_H} style={StyleSheet.absoluteFill}>
              <Defs>
                <RadialGradient
                  id="sphereGlow"
                  cx="40%"
                  cy="35%"
                  r="65%"
                  fx="40%"
                  fy="35%"
                >
                  <Stop offset="0%" stopColor={gradStart === gradEnd ? '#3A6B4A' : '#2D5C3E'} stopOpacity="1" />
                  <Stop offset="60%" stopColor={gradEnd} stopOpacity="1" />
                  <Stop offset="100%" stopColor="#040808" stopOpacity="1" />
                </RadialGradient>
                <SvgGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor={Colors.viz.bioGreen} stopOpacity="0.8" />
                  <Stop offset="50%" stopColor={Colors.viz.cyan} stopOpacity="0.6" />
                  <Stop offset="100%" stopColor={Colors.viz.bioGreen} stopOpacity="0.1" />
                </SvgGradient>
              </Defs>

              {/* Faint orbit ring */}
              <Circle
                cx={SPHERE_CX}
                cy={SPHERE_CY}
                r={ORBIT_R + 2}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={1}
              />

              {/* Outer atmospheric ring */}
              <Circle
                cx={SPHERE_CX}
                cy={SPHERE_CY}
                r={SPHERE_R + 22}
                fill="none"
                stroke={Colors.viz.bioGreen}
                strokeWidth={0.5}
                strokeOpacity={0.15}
              />

              {/* Main sphere */}
              <Circle
                cx={SPHERE_CX}
                cy={SPHERE_CY}
                r={SPHERE_R}
                fill="url(#sphereGlow)"
              />

              {/* Sphere rim highlight */}
              <Circle
                cx={SPHERE_CX}
                cy={SPHERE_CY}
                r={SPHERE_R - 1}
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={1.5}
              />
            </Svg>

            {/* Rotating arc — separate view for rotation transform */}
            <Animated.View style={[StyleSheet.absoluteFill, arcStyle]}>
              <Svg width={W} height={SVG_H} style={StyleSheet.absoluteFill}>
                <Path
                  d={arcPath(SPHERE_R + 14)}
                  fill="none"
                  stroke="url(#arcGrad)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                />
              </Svg>
            </Animated.View>

            {/* Bio age overlay on sphere */}
            <Animated.View style={[s.sphereTextContainer, sphereInnerStyle]}>
              <Text style={s.bioAgeHero}>{bioAge ?? '—'}</Text>
              <Text style={s.bioAgeLabel}>BIO AGE</Text>
              {yearsDiff > 0 && (
                <Text style={s.bioAgeDiff}>↓ {yearsDiff}y younger</Text>
              )}
            </Animated.View>

            {/* Data point orbs */}
            <Animated.View style={[StyleSheet.absoluteFill, dpStyle]}>
              {DATA_POINTS.map(dp => {
                const { x, y } = polarToXY(dp.angle, ORBIT_R, SPHERE_CX, SPHERE_CY);
                const val = dataValue(healthSnap, dp.key);
                return (
                  <View
                    key={dp.key}
                    style={[
                      s.dataOrb,
                      {
                        left: x - 30,
                        top: y - 22,
                      },
                    ]}
                  >
                    <Text style={s.dataOrbVal}>{val}</Text>
                    <Text style={s.dataOrbLabel}>{dp.label}</Text>
                  </View>
                );
              })}
            </Animated.View>
          </Animated.View>

          {/* Longevity projection */}
          <View style={s.projectionCard}>
            <Text style={s.projLabel}>PROJECTED LIFESPAN</Text>
            <Text style={s.projValue}>{projectedLifespan}</Text>
            {bioAge != null && (
              <Text style={s.projSub}>
                Based on current biological age vs chronological age.
                {yearsDiff > 0
                  ? ` You're tracking ${yearsDiff} year${yearsDiff !== 1 ? 's' : ''} ahead.`
                  : ' Optimise biomarkers to improve your trajectory.'}
              </Text>
            )}
          </View>

          {/* Metric grid */}
          <View style={s.metricGrid}>
            {DATA_POINTS.map(dp => {
              const val = dataValue(healthSnap, dp.key);
              const hasData = val !== '—';
              return (
                <View key={dp.key} style={s.metricCell}>
                  <Text style={[s.metricVal, !hasData && s.metricEmpty]}>{val}</Text>
                  <Text style={s.metricLabel}>{dp.label}</Text>
                  {dp.unit !== '' && hasData && (
                    <Text style={s.metricUnit}>{dp.unit}</Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Connect HealthKit prompt */}
          <TouchableOpacity style={s.healthKitCard}>
            <Text style={s.hkIcon}>⌚</Text>
            <View style={s.hkBody}>
              <Text style={s.hkTitle}>Connect Apple Health</Text>
              <Text style={s.hkSub}>
                Sync HRV, sleep, VO₂ max & glucose automatically
              </Text>
            </View>
            <Text style={s.hkArrow}>→</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: Colors.dark.text },
  screenTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    letterSpacing: Typography.letterSpacing.widest,
  },

  sphereArea: {
    width: W,
    height: SVG_H,
    alignSelf: 'center',
  },

  sphereTextContainer: {
    position: 'absolute',
    left: SPHERE_CX - 60,
    top: SPHERE_CY - 36,
    width: 120,
    alignItems: 'center',
  },
  bioAgeHero: {
    fontSize: 52,
    fontWeight: '200',
    color: Colors.dark.text,
    lineHeight: 56,
    letterSpacing: -1,
  },
  bioAgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    letterSpacing: Typography.letterSpacing.widest,
    marginTop: -4,
  },
  bioAgeDiff: {
    fontSize: Typography.sizes.xs,
    color: Colors.viz.bioGreen,
    marginTop: 4,
    fontWeight: '500',
  },

  dataOrb: {
    position: 'absolute',
    width: 60,
    height: 44,
    backgroundColor: 'rgba(20,25,22,0.85)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dataOrbVal: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.viz.bioGreen,
    letterSpacing: -0.3,
  },
  dataOrbLabel: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    marginTop: 1,
    letterSpacing: 0.3,
  },

  projectionCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.base,
  },
  projLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    letterSpacing: Typography.letterSpacing.widest,
    marginBottom: Spacing.xs,
  },
  projValue: {
    fontSize: Typography.sizes.h2,
    fontWeight: '300',
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  projSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    lineHeight: 18,
  },

  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    gap: Spacing.sm,
  },
  metricCell: {
    width: (W - Spacing.base * 2 - Spacing.sm * 2) / 3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: Spacing.md,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: Typography.sizes.lg,
    fontWeight: '400',
    color: Colors.viz.bioGreen,
    letterSpacing: -0.3,
  },
  metricEmpty: { color: Colors.dark.textMuted },
  metricLabel: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  metricUnit: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    opacity: 0.6,
    marginTop: 1,
  },

  healthKitCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  hkIcon: { fontSize: 24 },
  hkBody: { flex: 1 },
  hkTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  hkSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    lineHeight: 16,
  },
  hkArrow: {
    fontSize: Typography.sizes.md,
    color: Colors.dark.textMuted,
  },
});
