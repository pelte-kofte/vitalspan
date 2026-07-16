import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { HealthTrend } from '../../lib/healthExperience';
import { formatHealthDate } from '../../lib/healthExperience';
import type { PhenoAgeResult } from '../../lib/phenoAge';
import { Colors, Radius, Spacing, Typography } from '../../theme';
import TrendSignal from './TrendSignal';
import Text from './HealthText';

interface Props {
  result: PhenoAgeResult;
  lastLabDate: string | null;
  overallTrend: HealthTrend;
  actionLabel: string;
  onAction: () => void;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <Svg width={Spacing.base} height={Spacing.base} viewBox="0 0 16 16" accessible={false}>
      <Path d={open ? 'M3 6 L8 11 L13 6' : 'M6 3 L11 8 L6 13'} fill="none" stroke={Colors.health.inkSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function HealthOverviewCard({ result, lastLabDate, overallTrend, actionLabel, onAction }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const calculated = result.status === 'calculated';
  return (
    <View style={s.card} accessibilityLabel="Health overview">
      <View style={s.topline}>
        <Text style={s.eyebrow}>CURRENT BODY STATE</Text>
        <TrendSignal trend={overallTrend} compact />
      </View>
      <Text style={s.label}>Blood phenotypic age</Text>
      {calculated ? (
        <View style={s.ageRow}>
          <Text maxFontSizeMultiplier={1.15} style={s.age}>{result.bloodPhenotypicAge?.toFixed(1)}</Text>
          <Text style={s.years}>YEARS</Text>
        </View>
      ) : (
        <Text maxFontSizeMultiplier={1.2} style={s.unavailable}>Not available yet</Text>
      )}
      <Text style={s.count}>{result.presentCount} of {result.totalRequired} required inputs</Text>
      <Pressable onPress={onAction} style={s.action} accessibilityRole="button" accessibilityLabel={actionLabel}>
        <Text style={s.actionText}>{actionLabel}</Text>
        <Text style={s.actionArrow} accessible={false}>›</Text>
      </Pressable>
      <Pressable
        onPress={() => setDetailsOpen(open => !open)}
        style={s.detailsButton}
        accessibilityRole="button"
        accessibilityState={{ expanded: detailsOpen }}
        accessibilityLabel={`${detailsOpen ? 'Hide' : 'Show'} health overview details`}
      >
        <Text style={s.detailsLabel}>{detailsOpen ? 'Hide details' : 'More about this estimate'}</Text>
        <Chevron open={detailsOpen} />
      </Pressable>
      {detailsOpen && (
        <View style={s.details}>
          <View style={s.metaGrid}>
            <View style={s.metaItem}><Text style={s.metaLabel}>LAST LABORATORY</Text><Text style={s.metaValue}>{formatHealthDate(lastLabDate)}</Text></View>
            <View style={s.metaItem}><Text style={s.metaLabel}>DATA COMPLETENESS</Text><Text style={s.metaValue}>{result.presentCount} / {result.totalRequired}</Text></View>
          </View>
          {result.missingBiomarkers.length > 0 && <Text style={s.missing}>Missing: {result.missingBiomarkers.join(', ')}</Text>}
          <Text style={s.metaLabel}>MODEL LIMITATIONS</Text>
          {result.modelLimitations.map(item => <Text key={item} style={s.limitText}>{item}</Text>)}
          <Text style={s.provenance}>Source: Levine PhenoAge input requirements. This blood model is not a diagnosis and does not represent every dimension of health.</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: Colors.health.surfaceStrong, borderRadius: Radius.card, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.health.rule },
  topline: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  eyebrow: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest },
  label: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label, marginTop: Spacing.lg },
  unavailable: { color: Colors.health.ink, fontSize: Typography.sizes.display3, lineHeight: Typography.lineHeights.display3, fontWeight: Typography.weights.title, marginTop: Spacing.xs },
  ageRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginTop: Spacing.xs },
  age: { color: Colors.health.ink, fontSize: Typography.sizes.display2, lineHeight: Typography.lineHeights.display2, fontWeight: Typography.weights.displayHero },
  years: { color: Colors.health.accent, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.wider },
  count: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
  action: { minHeight: Spacing.xxl + Spacing.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: Radius.card, backgroundColor: Colors.health.ink, paddingHorizontal: Spacing.base, marginTop: Spacing.lg },
  actionText: { color: Colors.health.surfaceStrong, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
  actionArrow: { color: Colors.health.surfaceStrong, fontSize: Typography.sizes.xxl, lineHeight: Typography.sizes.xxl, fontWeight: Typography.weights.title },
  detailsButton: { minHeight: Spacing.xxl + Spacing.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.health.rule, marginTop: Spacing.md },
  detailsLabel: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
  details: { gap: Spacing.md, paddingTop: Spacing.md },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  metaItem: { flexGrow: 1, flexBasis: 130 },
  metaLabel: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, letterSpacing: Typography.letterSpacing.wider, fontWeight: Typography.weights.label },
  metaValue: { color: Colors.health.ink, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
  missing: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption },
  limitText: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption },
  provenance: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.captionSmall },
});
