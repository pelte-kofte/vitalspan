import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, {
  Circle,
  Line,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const SVG_W = SCREEN_W - Spacing.base * 2;
const SVG_H = 148;
const R = 44;
const CX_LEFT = 70;
const CX_RIGHT = SVG_W - 70;
const CY = SVG_H / 2 - 6;
const CIRC = 2 * Math.PI * R;

interface Props {
  biologicalAge?: number;
  chronologicalAge?: number;
  optimality?: number; // 0–1, fraction of biomarkers in optimal range
  onPress?: () => void;
}

function computeProjection(
  bioAge: number | undefined,
  optimality: number,
): { projectedAge: number | null; gainYears: number } {
  if (bioAge == null) return { projectedAge: null, gainYears: 0 };
  // Conservative: up to 3 bio-years younger in 5 calendar years at 100% optimality
  const gain = Math.round(optimality * 3 * 10) / 10;
  return { projectedAge: Math.max(bioAge - gain, bioAge - 3), gainYears: gain };
}

export default function FutureSelf({
  biologicalAge,
  chronologicalAge,
  optimality = 0,
  onPress,
}: Props) {
  const { projectedAge, gainYears } = computeProjection(biologicalAge, optimality);

  // Progress ring dashOffset for the future circle
  const dashOffset = CIRC * (1 - Math.min(Math.max(optimality, 0), 1));

  // Subtle entrance fade
  const fadeIn = useSharedValue(0);
  // Ring fill "draws on" from 0 to target dashOffset on mount
  const ringProgress = useSharedValue(CIRC);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    ringProgress.value = withDelay(
      400,
      withTiming(dashOffset, { duration: 1200, easing: Easing.out(Easing.cubic) }),
    );
  }, [dashOffset]);

  // Gentle pulse on the progress ring glow
  const ringGlow = useSharedValue(0.5);
  useEffect(() => {
    ringGlow.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 2400, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
        withTiming(0.5, { duration: 2400, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
      ),
      -1,
      false,
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const gainLabel =
    gainYears > 0
      ? `+${gainYears} bio-years potential`
      : 'Log biomarkers to see your projection';

  return (
    <Animated.View style={[s.wrapper, containerStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={s.touchable}
      >
        <View style={s.header}>
          <Text style={s.headerTitle}>Future Self Projection</Text>
          <Text style={s.headerSub}>5-year biological trajectory</Text>
        </View>

        <Svg width={SVG_W} height={SVG_H}>
          <Defs>
            <SvgLinearGradient id="currentFill" x1="0" y1="0" x2="0.7" y2="1">
              <Stop offset="0%" stopColor="#1C3B2A" stopOpacity="1" />
              <Stop offset="100%" stopColor="#2D6A4F" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="connectorGrad" x1="0" y1="0.5" x2="1" y2="0.5">
              <Stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.7" />
              <Stop offset="50%" stopColor={Colors.viz.cyan} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={Colors.viz.cyan} stopOpacity="0.15" />
            </SvgLinearGradient>
          </Defs>

          {/* Dashed connector */}
          <Line
            x1={CX_LEFT + R + 8}
            y1={CY}
            x2={CX_RIGHT - R - 8}
            y2={CY}
            stroke="url(#connectorGrad)"
            strokeWidth={1.2}
            strokeDasharray="5 4"
          />

          {/* ── Current circle ── */}
          <Circle cx={CX_LEFT} cy={CY} r={R} fill="url(#currentFill)" />
          {/* Inner ring highlight */}
          <Circle
            cx={CX_LEFT}
            cy={CY}
            r={R - 3}
            fill="none"
            stroke="rgba(232,245,238,0.12)"
            strokeWidth={1}
          />
          <SvgText
            x={CX_LEFT}
            y={CY - 4}
            textAnchor="middle"
            fill="#E8F5EE"
            fontSize={biologicalAge != null ? 26 : 18}
            fontWeight="300"
          >
            {biologicalAge ?? '—'}
          </SvgText>
          <SvgText
            x={CX_LEFT}
            y={CY + 14}
            textAnchor="middle"
            fill="rgba(232,245,238,0.6)"
            fontSize={9}
            fontWeight="400"
            letterSpacing={0.6}
          >
            TODAY
          </SvgText>

          {/* ── Future circle ── */}
          {/* Ghost outline */}
          <Circle
            cx={CX_RIGHT}
            cy={CY}
            r={R}
            fill="none"
            stroke={Colors.viz.cyanDim}
            strokeWidth={1}
            strokeOpacity={0.3}
          />
          {/* Faint fill wash */}
          <Circle
            cx={CX_RIGHT}
            cy={CY}
            r={R - 1}
            fill={Colors.viz.cyan}
            fillOpacity={optimality * 0.08}
          />
          {/* Progress arc — animates in via ringProgress SharedValue */}
          <Circle
            cx={CX_RIGHT}
            cy={CY}
            r={R}
            fill="none"
            stroke={Colors.viz.cyan}
            strokeWidth={2.5}
            strokeDasharray={`${CIRC} ${CIRC}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${CX_RIGHT}, ${CY}`}
            strokeOpacity={0.75}
          />
          <SvgText
            x={CX_RIGHT}
            y={CY - 4}
            textAnchor="middle"
            fill={Colors.viz.cyan}
            fontSize={projectedAge != null ? 26 : 18}
            fontWeight="300"
          >
            {projectedAge != null ? Math.round(projectedAge) : '—'}
          </SvgText>
          <SvgText
            x={CX_RIGHT}
            y={CY + 14}
            textAnchor="middle"
            fill={Colors.viz.cyanDim}
            fontSize={9}
            fontWeight="400"
            letterSpacing={0.6}
          >
            IN 5 YEARS
          </SvgText>
        </Svg>

        <View style={s.footer}>
          <View style={s.gainBadge}>
            <Text style={s.gainTxt}>{gainLabel}</Text>
          </View>
          {onPress && <Text style={s.tap}>Tap for breakdown →</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  touchable: { padding: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  gainBadge: {
    backgroundColor: Colors.primaryBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: Colors.primaryBorder,
  },
  gainTxt: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '500',
  },
  tap: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
});
