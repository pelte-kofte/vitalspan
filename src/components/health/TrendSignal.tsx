import React from 'react';
import { StyleSheet, View } from 'react-native';

import { TREND_LABELS, TREND_TONES, type HealthTrend } from '../../lib/healthExperience';
import { Colors, Radius, Spacing, Typography } from '../../theme';
import Text from './HealthText';

interface Props {
  trend: HealthTrend;
  compact?: boolean;
}

export default function TrendSignal({ trend, compact = false }: Props) {
  const attention = TREND_TONES[trend] === 'attention';
  const neutral = TREND_TONES[trend] === 'neutral';
  return (
    <View
      style={[s.signal, attention && s.attention, neutral && s.neutral, compact && s.compact]}
      accessible
      accessibilityLabel={`Trend: ${TREND_LABELS[trend]}`}
    >
      <View style={[s.dot, attention && s.dotAttention, neutral && s.dotNeutral]} />
      <Text style={[s.label, attention && s.labelAttention, neutral && s.labelNeutral]}>{TREND_LABELS[trend]}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  signal: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.health.accentSoft,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: '100%',
  },
  attention: { backgroundColor: Colors.health.attentionSoft },
  neutral: { backgroundColor: Colors.health.neutralSoft },
  compact: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  dot: { width: Spacing.xs + 2, height: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.health.accent },
  dotAttention: { backgroundColor: Colors.health.attention },
  dotNeutral: { backgroundColor: Colors.health.neutralInk },
  label: { color: Colors.health.accent, fontSize: Typography.sizes.caption, fontWeight: Typography.weights.label, flexShrink: 1 },
  labelAttention: { color: Colors.health.attention },
  labelNeutral: { color: Colors.health.neutralInk },
});
