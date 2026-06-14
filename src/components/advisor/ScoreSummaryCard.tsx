import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LongevityReport } from '../../lib/advisorService';
import { Colors, Spacing, Typography, Radius } from '../../theme';

export interface ScoreSummaryCardProps {
  scoreSummary: LongevityReport['scoreSummary'];
}

export default function ScoreSummaryCard({ scoreSummary }: ScoreSummaryCardProps) {
  const { biologicalAge, ageBand, headline, trend } = scoreSummary;

  return (
    <View style={s.card}>
      <Text style={s.ageNumber}>
        {biologicalAge !== null ? String(biologicalAge) : '—'}
      </Text>
      <Text style={s.ageBand}>{ageBand}</Text>
      {biologicalAge === null && (
        <Text style={s.nullCaption}>
          Add more biomarkers for your biological age
        </Text>
      )}
      <Text style={s.headline}>{headline}</Text>
      <Text style={s.trend}>{trend}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.cardBg,
    borderColor: Colors.dark.cardBorder,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  ageNumber: {
    fontSize: Typography.sizes.display2,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  ageBand: {
    fontSize: Typography.sizes.sm,
    color: Colors.dark.textMuted,
    letterSpacing: Typography.letterSpacing.wide,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  nullCaption: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  headline: {
    fontSize: Typography.sizes.md,
    color: Colors.dark.text,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  trend: {
    fontSize: Typography.sizes.sm,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
