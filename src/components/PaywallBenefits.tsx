import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../theme';
import { MicroscopeIcon, GoalDnaIcon, ShieldIcon, ClipboardIcon } from './DesignSystemIcons';

const BENEFITS = [
  { Icon: MicroscopeIcon, label: 'AI Advisor from a pharmacist' },
  { Icon: GoalDnaIcon, label: 'Biological age projection' },
  { Icon: ShieldIcon, label: 'Timing conflict detection' },
  { Icon: ClipboardIcon, label: 'Personalized articles' },
] as const;

/**
 * Compact benefit list shown on the paywall between the hero and the price
 * card. Deliberately does not include a fabricated user-count/testimonial —
 * DESIGN_SYSTEM.md + Apple HIG both rule out dark patterns, and we have no
 * real usage numbers to back a claim like "10,000+ users". The credibility
 * line leans on the actual brand differentiator (pharmacist review) instead.
 */
export default function PaywallBenefits() {
  return (
    <View style={s.wrap}>
      {BENEFITS.map(({ Icon, label }) => (
        <View key={label} style={s.row}>
          <Icon color={Colors.viz.bioGreen} size={20} />
          <Text style={s.label}>{label}</Text>
        </View>
      ))}
      <Text style={s.credibility}>
        Every recommendation is pharmacist-reviewed — not AI guesswork.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.dark.cardBg,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    borderRadius: Radius.card,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  label: { color: Colors.dark.text, fontSize: Typography.sizes.bodySmall, fontWeight: '500' },
  credibility: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.caption,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});
