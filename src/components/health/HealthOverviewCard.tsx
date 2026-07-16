import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
}

export default function HealthOverviewCard({ result, lastLabDate, overallTrend }: Props) {
  const [limitationsOpen, setLimitationsOpen] = useState(false);
  const calculated = result.status === 'calculated';
  return (
    <View style={s.card} accessibilityLabel="Health overview">
      <View style={s.topline}>
        <Text style={s.eyebrow}>BLOOD PHENOTYPE</Text>
        <TrendSignal trend={overallTrend} compact />
      </View>
      {calculated ? (
        <View style={s.ageRow}>
          <Text maxFontSizeMultiplier={1.15} style={s.age}>{result.bloodPhenotypicAge?.toFixed(1)}</Text>
          <View style={s.ageMeta}>
            <Text style={s.years}>YEARS</Text>
            <Text style={s.context}>Blood Phenotypic Age</Text>
          </View>
        </View>
      ) : (
        <View style={s.incomplete}>
          <Text maxFontSizeMultiplier={1.2} style={s.incompleteTitle}>Not enough data</Text>
          <Text style={s.incompleteBody}>{result.presentCount} of {result.totalRequired} required measurements available</Text>
        </View>
      )}
      <View style={s.rule} />
      <View style={s.metaGrid}>
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>LAST LABORATORY</Text>
          <Text style={s.metaValue}>{formatHealthDate(lastLabDate)}</Text>
        </View>
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>DATA COMPLETENESS</Text>
          <Text style={s.metaValue}>{result.presentCount} / {result.totalRequired} model inputs</Text>
        </View>
      </View>
      {!calculated && result.missingBiomarkers.length > 0 && (
        <Text style={s.missing} numberOfLines={2}>Missing: {result.missingBiomarkers.join(', ')}</Text>
      )}
      <Pressable
        onPress={() => setLimitationsOpen(open => !open)}
        style={s.limitButton}
        accessibilityRole="button"
        accessibilityState={{ expanded: limitationsOpen }}
        accessibilityLabel={`${limitationsOpen ? 'Hide' : 'Show'} model limitations`}
      >
        <Text style={s.limitButtonText}>{limitationsOpen ? 'Hide model limitations' : 'Model limitations'}</Text>
        <Text style={s.disclosure}>{limitationsOpen ? '−' : '+'}</Text>
      </Pressable>
      {limitationsOpen && (
        <View style={s.limitations}>
          {result.modelLimitations.map(item => <Text key={item} style={s.limitText}>— {item}</Text>)}
        </View>
      )}
      <View style={s.futureRule} />
      <Text style={s.future}>Architecture ready for multimodal age domains; no multimodal score is calculated today.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: Colors.health.surfaceStrong, borderRadius: Radius.card, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.health.rule },
  topline: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md },
  eyebrow: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest },
  ageRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: Spacing.xl },
  age: { color: Colors.health.ink, fontSize: Typography.sizes.heroNumeral, lineHeight: Typography.sizes.heroNumeral + Spacing.xs, fontWeight: Typography.weights.displayHero, letterSpacing: Typography.letterSpacing.tight },
  ageMeta: { paddingBottom: Spacing.md, marginLeft: Spacing.md },
  years: { color: Colors.health.accent, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.wider },
  context: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, marginTop: Spacing.xs },
  incomplete: { marginTop: Spacing.xxl, marginBottom: Spacing.lg },
  incompleteTitle: { color: Colors.health.ink, fontSize: Typography.sizes.display3, lineHeight: Typography.lineHeights.display3, fontWeight: Typography.weights.title },
  incompleteBody: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body, marginTop: Spacing.sm },
  rule: { height: 1, backgroundColor: Colors.health.rule, marginVertical: Spacing.lg },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  metaItem: { flexGrow: 1, flexBasis: 130 },
  metaLabel: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, letterSpacing: Typography.letterSpacing.wider, fontWeight: Typography.weights.label },
  metaValue: { color: Colors.health.ink, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs, fontWeight: Typography.weights.headline },
  missing: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption, marginTop: Spacing.lg },
  limitButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: Spacing.xxl + Spacing.base, marginTop: Spacing.md },
  limitButtonText: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
  disclosure: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.title },
  limitations: { gap: Spacing.sm, paddingBottom: Spacing.md },
  limitText: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption },
  futureRule: { height: 1, backgroundColor: Colors.health.rule, marginTop: Spacing.sm, marginBottom: Spacing.md },
  future: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.captionSmall },
});
