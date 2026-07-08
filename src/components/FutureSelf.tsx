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
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, Typography, Radius } from '../theme';
import { LockIcon } from './DesignSystemIcons';
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
  onViewBiomarkers?: () => void; // navigate to the Biomarkers tab (locked-state tap)
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
    return { projectedAge: null, agingRate: 1.0, gainYears: 0, label: '' };
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
  onViewBiomarkers,
  onPress,
}: Props) {
  const [showExplainer, setShowExplainer] = React.useState(false);

  const { projectedAge, agingRate, gainYears, label } = computeProjection(
    biologicalAge, chronologicalAge, optimality,
  );

  const isLocked = biologicalAge == null || chronologicalAge == null;
  const dashOffset = CIRC * (1 - Math.min(Math.max(optimality, 0), 1));

  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  const footerLabel = gainYears > 0 ? `Saving ${gainYears} bio-years vs. normal aging` : label;

  if (isLocked) {
    return (
      <Animated.View style={[s.lockedWrapper, containerStyle]}>
        <TouchableOpacity
          style={s.lockedTouchable}
          activeOpacity={0.85}
          onPress={() => (onViewBiomarkers ? onViewBiomarkers() : onPress?.())}
        >
          <View style={s.lockChip}>
            <LockIcon color={Colors.dark.textMuted} size={16} />
          </View>
          <Text style={s.lockedLabel}>
            Ready once you've logged your first {PHENO_BIOMARKER_LIST.length} biomarkers
          </Text>
          <Text style={s.lockedChevron}>›</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <>
      <Animated.View style={[s.wrapper, containerStyle]}>
        <TouchableOpacity
          onPress={() => setShowExplainer(true)}
          activeOpacity={0.85}
          style={s.touchable}
        >
          <Text style={s.eyebrow}>5-year projection</Text>

          <Svg width={SVG_W} height={SVG_H}>
            {/* Dashed connector */}
            <Line
              x1={CX_LEFT + R + 8} y1={CY}
              x2={CX_RIGHT - R - 8} y2={CY}
              stroke={Colors.dark.cardBorder}
              strokeWidth={1.2}
              strokeDasharray="5 4"
            />

            {/* Current circle — flat surface, no gradient fill */}
            <Circle cx={CX_LEFT} cy={CY} r={R} fill={Colors.dark.bgElevated} />
            <Circle cx={CX_LEFT} cy={CY} r={R - 1} fill="none"
              stroke={Colors.dark.borderStrong} strokeWidth={1.5} />
            <SvgText
              x={CX_LEFT} y={CY - 4} textAnchor="middle"
              fill={Colors.dark.text} fontSize={26} fontWeight="300"
            >
              {biologicalAge}
            </SvgText>
            <SvgText
              x={CX_LEFT} y={CY + 14} textAnchor="middle"
              fill={Colors.dark.textMuted} fontSize={9} fontWeight="400" letterSpacing={0.6}
            >
              TODAY
            </SvgText>

            {/* Future circle — flat surface, colored ring shows optimality */}
            <Circle cx={CX_RIGHT} cy={CY} r={R} fill={Colors.dark.bgElevated} />
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

          <View style={s.footer}>
            <View style={s.gainBadge}>
              <Text style={s.gainTxt}>{footerLabel}</Text>
            </View>
            <Text style={s.tap}>Details ›</Text>
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
              Aging rate is bio age divided by chronological age. A rate below 1.0 means you're aging slower than time. Biomarker optimality can reduce your rate by up to 8%.
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
  // Compact locked teaser — deliberately minimal: lock chip, one line, chevron.
  // This is a link to the Biomarkers tab, not a co-hero with the BioAge card.
  lockedWrapper: {
    marginHorizontal: Spacing.base, marginBottom: Spacing.base,
    backgroundColor: Colors.dark.cardBg, borderRadius: Radius.card,
    borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
  },
  lockedTouchable: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
  },
  lockChip: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  lockedLabel: { flex: 1, fontSize: Typography.sizes.bodySmall, color: Colors.dark.textMuted },
  lockedChevron: { fontSize: 18, color: Colors.dark.textMuted },

  wrapper: {
    marginHorizontal: Spacing.base, marginBottom: Spacing.base,
    backgroundColor: Colors.dark.cardBg, borderRadius: Radius.card,
    borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  touchable: { padding: Spacing.md },
  eyebrow: {
    fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label,
    color: Colors.dark.textMuted, textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.widest, marginBottom: Spacing.sm,
  },

  rateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs, marginLeft: 4 },
  rateBadge: {
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 3,
    borderRadius: Radius.full, backgroundColor: Colors.dark.cardBg,
    borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
  },
  rateBadgeGood: { backgroundColor: Colors.dark.statusOptimalBg, borderColor: Colors.dark.statusOptimalBorder },
  rateBadgePoor: { backgroundColor: Colors.dark.statusWarnBg, borderColor: Colors.dark.statusWarnBorder },
  rateTxt: { fontSize: Typography.sizes.xs, fontWeight: '700', color: Colors.dark.textMuted },
  rateTxtGood: { color: Colors.viz.bioGreen },
  rateTxtPoor: { color: Colors.viz.amber },
  rateDesc: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  gainBadge: {
    backgroundColor: Colors.dark.statusOptimalBg, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 0.5, borderColor: Colors.dark.statusOptimalBorder,
    flexShrink: 1,
  },
  gainTxt: { fontSize: Typography.sizes.xs, color: Colors.viz.bioGreen, fontWeight: '500' },
  tap: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, flexShrink: 0, marginLeft: Spacing.sm },
});

const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.dark.bgElevated, borderTopLeftRadius: Radius.sheet, borderTopRightRadius: Radius.sheet,
    padding: Spacing.base, paddingBottom: 40,
    borderWidth: 0.5, borderColor: Colors.dark.borderStrong, borderBottomWidth: 0,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.dark.borderStrong,
    alignSelf: 'center', marginBottom: Spacing.base,
  },
  title: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.dark.text, marginBottom: Spacing.base },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.dark.cardBorder,
  },
  rowLabel: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted },
  rowVal: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.dark.text },
  rowValGood: { color: Colors.viz.bioGreen },
  rowValPoor: { color: Colors.viz.amber },
  note: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, lineHeight: 18, marginTop: Spacing.base },
  citation: { fontSize: 10, color: Colors.dark.textMuted, marginTop: Spacing.sm, fontStyle: 'italic' },
});
