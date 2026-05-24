import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
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
} from 'react-native-reanimated';
import { Colors, Spacing, Typography, Radius } from '../theme';
import NeuralGrid from './NeuralGrid';
import { PHENO_BIOMARKER_LIST } from '../lib/phenoAge';

const { width: SCREEN_W } = Dimensions.get('window');
const SVG_W = SCREEN_W - Spacing.base * 2;
const SVG_H = 148;
const R = 44;
const CX_LEFT  = 70;
const CX_RIGHT = SVG_W - 70;
const CY = SVG_H / 2 - 6;
const CIRC = 2 * Math.PI * R;

interface Props {
  biologicalAge?: number;
  chronologicalAge?: number;
  optimality?: number; // 0–1
  loggedBiomarkerIds?: string[]; // IDs of biomarkers the user has logged
  onBiomarkerPress?: (id: string) => void; // navigate to log a specific biomarker
  onPress?: () => void;
}

/**
 * Project bio age in 5 years using aging rate.
 * aging_rate = 1.0 means aging normally (bio age increases 1 yr per calendar year)
 * aging_rate < 1.0 means aging slower than time
 * aging_rate > 1.0 means aging faster than time
 */
function computeProjection(
  bioAge: number | undefined,
  chronoAge: number | undefined,
  optimality: number,
): { projectedAge: number | null; agingRate: number; gainYears: number; label: string } {
  if (bioAge == null || chronoAge == null) {
    return { projectedAge: null, agingRate: 1.0, gainYears: 0, label: 'Log 5+ biomarkers to unlock' };
  }

  // aging_rate: how many biological years per calendar year
  // If bio < chrono, you're aging slower than 1:1
  const agingRate = Math.max(0.3, Math.min(1.5, bioAge / Math.max(chronoAge, 1)));

  // Project 5 calendar years forward, using current aging rate
  // plus a small improvement if optimality > 0.5 (user has good biomarkers)
  const adjustedRate = agingRate * (1 - optimality * 0.08); // optimality reduces aging up to 8%
  const projectedBioAge = Math.round((bioAge + adjustedRate * 5) * 10) / 10;

  const gainVsNormal = Math.round((bioAge + 5 - projectedBioAge) * 10) / 10; // years saved vs normal aging

  return {
    projectedAge: projectedBioAge,
    agingRate: Math.round(adjustedRate * 100) / 100,
    gainYears: gainVsNormal,
    label: `Aging ${adjustedRate.toFixed(2)} yr/yr`,
  };
}

export default function FutureSelf({
  biologicalAge,
  chronologicalAge,
  optimality = 0,
  loggedBiomarkerIds = [],
  onBiomarkerPress,
  onPress,
}: Props) {
  const [showExplainer, setShowExplainer] = React.useState(false);

  const { projectedAge, agingRate, gainYears, label } = computeProjection(
    biologicalAge, chronologicalAge, optimality,
  );

  const isLocked = biologicalAge == null || chronologicalAge == null;
  const dashOffset = CIRC * (1 - Math.min(Math.max(optimality, 0), 1));

  const fadeIn = useSharedValue(0);
  const ringProgress = useSharedValue(CIRC);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    ringProgress.value = withDelay(
      400,
      withTiming(dashOffset, { duration: 1200, easing: Easing.out(Easing.cubic) }),
    );
  }, [dashOffset]);

  const ringGlow = useSharedValue(0.5);
  useEffect(() => {
    ringGlow.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 2400, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
        withTiming(0.5, { duration: 2400, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
      ),
      -1, false,
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  const footerLabel = isLocked
    ? 'Log 5+ biomarkers to unlock your projection'
    : gainYears > 0
      ? `Saving ${gainYears} bio-years vs. normal aging`
      : label;

  return (
    <>
      <Animated.View style={[s.wrapper, containerStyle]}>
        {/* Subtle neural grid overlay at very low opacity — gives the card life */}
        <View style={[StyleSheet.absoluteFill, { opacity: 0.35 }]} pointerEvents="none">
          <NeuralGrid intensity="low" tone="calm" />
        </View>
        <TouchableOpacity
          onPress={() => {
            if (onPress) onPress();
            else setShowExplainer(true);
          }}
          activeOpacity={0.85}
          style={s.touchable}
        >
          <View style={s.header}>
            <Text style={s.headerTitle}>Future Self Projection</Text>
            <Text style={s.headerSub}>5-year biological trajectory</Text>
          </View>

          {isLocked ? (
            <View style={s.lockedState}>
              <Text style={s.lockedIcon}>🔒</Text>
              <Text style={s.lockedMsg}>Log these 5 biomarkers to unlock projection</Text>
              <View style={s.checklistBox}>
                {PHENO_BIOMARKER_LIST.slice(0, 5).map(b => {
                  const logged = loggedBiomarkerIds.includes(b.id);
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={s.checklistRow}
                      onPress={() => !logged && onBiomarkerPress && onBiomarkerPress(b.id)}
                      activeOpacity={logged ? 1 : 0.7}
                    >
                      <Text style={[s.checkMark, logged ? s.checkMarkDone : s.checkMarkPending]}>
                        {logged ? '✓' : '○'}
                      </Text>
                      <Text style={[s.checkLabel, logged && s.checkLabelDone]}>
                        {b.label} <Text style={s.checkUnit}>{b.unit}</Text>
                      </Text>
                      {!logged && <Text style={s.checkCta}>+ Log →</Text>}
                    </TouchableOpacity>
                  );
                })}
                {loggedBiomarkerIds.filter(id => PHENO_BIOMARKER_LIST.some(b => b.id === id)).length < 5 && (
                  <Text style={s.checklistNote}>
                    {5 - Math.min(loggedBiomarkerIds.filter(id => PHENO_BIOMARKER_LIST.some(b => b.id === id)).length, 5)} more needed — tap any row to log
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <>
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
                  x1={CX_LEFT + R + 8} y1={CY}
                  x2={CX_RIGHT - R - 8} y2={CY}
                  stroke="url(#connectorGrad)"
                  strokeWidth={1.2}
                  strokeDasharray="5 4"
                />

                {/* Current circle */}
                <Circle cx={CX_LEFT} cy={CY} r={R} fill="url(#currentFill)" />
                <Circle cx={CX_LEFT} cy={CY} r={R - 3} fill="none"
                  stroke="rgba(232,245,238,0.12)" strokeWidth={1} />
                <SvgText
                  x={CX_LEFT} y={CY - 4} textAnchor="middle"
                  fill="#E8F5EE" fontSize={26} fontWeight="300"
                >
                  {biologicalAge}
                </SvgText>
                <SvgText
                  x={CX_LEFT} y={CY + 14} textAnchor="middle"
                  fill="rgba(232,245,238,0.6)" fontSize={9} fontWeight="400" letterSpacing={0.6}
                >
                  TODAY
                </SvgText>

                {/* Future circle */}
                <Circle cx={CX_RIGHT} cy={CY} r={R} fill="none"
                  stroke={Colors.viz.cyanDim} strokeWidth={1} strokeOpacity={0.3} />
                <Circle cx={CX_RIGHT} cy={CY} r={R - 1} fill={Colors.viz.cyan}
                  fillOpacity={optimality * 0.08} />
                <Circle
                  cx={CX_RIGHT} cy={CY} r={R} fill="none"
                  stroke={Colors.viz.cyan} strokeWidth={2.5}
                  strokeDasharray={`${CIRC} ${CIRC}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${CX_RIGHT}, ${CY}`}
                  strokeOpacity={0.75}
                />
                <SvgText
                  x={CX_RIGHT} y={CY - 4} textAnchor="middle"
                  fill={Colors.viz.cyan} fontSize={26} fontWeight="300"
                >
                  {projectedAge != null ? projectedAge.toFixed(1) : '—'}
                </SvgText>
                <SvgText
                  x={CX_RIGHT} y={CY + 14} textAnchor="middle"
                  fill={Colors.viz.cyanDim} fontSize={9} fontWeight="400" letterSpacing={0.6}
                >
                  IN 5 YEARS
                </SvgText>
              </Svg>

              {/* Aging rate badge */}
              <View style={s.rateRow}>
                <View style={[s.rateBadge, agingRate <= 0.85 && s.rateBadgeGood, agingRate >= 1.1 && s.rateBadgePoor]}>
                  <Text style={[s.rateTxt, agingRate <= 0.85 && s.rateTxtGood, agingRate >= 1.1 && s.rateTxtPoor]}>
                    {agingRate.toFixed(2)} yr/yr
                  </Text>
                </View>
                <Text style={s.rateDesc}>aging rate</Text>
              </View>
            </>
          )}

          <View style={s.footer}>
            <View style={s.gainBadge}>
              <Text style={s.gainTxt}>{footerLabel}</Text>
            </View>
            <Text style={s.tap}>Tap for details →</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Projection explainer modal */}
      <Modal visible={showExplainer} transparent animationType="slide" onRequestClose={() => setShowExplainer(false)}>
        <TouchableOpacity style={ms.overlay} activeOpacity={1} onPress={() => setShowExplainer(false)}>
          <View style={ms.sheet}>
            <View style={ms.handle} />
            <Text style={ms.title}>How is this projected?</Text>

            <View style={ms.row}>
              <Text style={ms.rowLabel}>Your bio age today</Text>
              <Text style={ms.rowVal}>{biologicalAge ?? '—'}</Text>
            </View>
            <View style={ms.row}>
              <Text style={ms.rowLabel}>Chronological age</Text>
              <Text style={ms.rowVal}>{chronologicalAge ?? '—'}</Text>
            </View>
            <View style={ms.row}>
              <Text style={ms.rowLabel}>Aging rate</Text>
              <Text style={[ms.rowVal, agingRate <= 0.85 ? ms.rowValGood : agingRate >= 1.1 ? ms.rowValPoor : undefined]}>
                {agingRate.toFixed(2)} biological yr / calendar yr
              </Text>
            </View>
            <View style={ms.row}>
              <Text style={ms.rowLabel}>In 5 years (projected)</Text>
              <Text style={ms.rowVal}>{projectedAge?.toFixed(1) ?? '—'}</Text>
            </View>

            <Text style={ms.note}>
              Aging rate = bio age ÷ chronological age. A rate below 1.0 means you're aging slower than time. Biomarker optimality can reduce your rate by up to 8%.
            </Text>
            <Text style={ms.citation}>
              Methodology based on Levine PhenoAge (Aging Cell, 2018) and actuarial aging models.
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.base, marginBottom: Spacing.base,
    backgroundColor: Colors.bgCard, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.borderLight,
    overflow: 'hidden', shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
    shadowRadius: 16, elevation: 3,
    position: 'relative',
  },
  touchable: { padding: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: Spacing.sm },
  headerTitle: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.textPrimary, letterSpacing: 0.2 },
  headerSub: { fontSize: Typography.sizes.xs, color: Colors.textMuted },

  lockedState: { paddingVertical: Spacing.md, gap: Spacing.sm },
  lockedIcon: { fontSize: 22, textAlign: 'center' },
  lockedMsg: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  checklistBox: { marginTop: Spacing.xs, gap: 2 },
  checklistRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 5, paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
  },
  checkMark: { fontSize: 13, width: 16, textAlign: 'center' },
  checkMarkDone: { color: Colors.primaryLight },
  checkMarkPending: { color: Colors.border },
  checkLabel: { flex: 1, fontSize: Typography.sizes.xs, color: Colors.textPrimary, fontWeight: '500' },
  checkLabelDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  checkUnit: { fontWeight: '400', color: Colors.textMuted },
  checkCta: { fontSize: 10, color: Colors.primaryLight, fontWeight: '600' },
  checklistNote: { fontSize: 10, color: Colors.textMuted, marginTop: 4, textAlign: 'center', fontStyle: 'italic' },

  rateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs, marginLeft: 4 },
  rateBadge: {
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 3,
    borderRadius: Radius.full, backgroundColor: Colors.bgSecondary,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  rateBadgeGood: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  rateBadgePoor: { backgroundColor: Colors.warningBg, borderColor: Colors.warningBorder },
  rateTxt: { fontSize: Typography.sizes.xs, fontWeight: '700', color: Colors.textMuted },
  rateTxtGood: { color: Colors.primary },
  rateTxtPoor: { color: Colors.warning },
  rateDesc: { fontSize: Typography.sizes.xs, color: Colors.textMuted },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  gainBadge: {
    backgroundColor: Colors.primaryBg, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 0.5, borderColor: Colors.primaryBorder,
    flexShrink: 1,
  },
  gainTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '500' },
  tap: { fontSize: Typography.sizes.xs, color: Colors.textMuted, flexShrink: 0, marginLeft: Spacing.sm },
});

const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.base, paddingBottom: 40,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: Spacing.base,
  },
  title: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.base },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  rowLabel: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
  rowVal: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.textPrimary },
  rowValGood: { color: Colors.primary },
  rowValPoor: { color: Colors.warning },
  note: { fontSize: Typography.sizes.xs, color: Colors.textMuted, lineHeight: 18, marginTop: Spacing.base },
  citation: { fontSize: 10, color: Colors.textMuted, marginTop: Spacing.sm, fontStyle: 'italic' },
});
