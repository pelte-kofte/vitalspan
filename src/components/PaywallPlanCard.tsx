import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../theme';
import AnimatedPressable from './AnimatedPressable';
import type { PaywallPlanSummary } from '../lib/paywallProducts';

interface Props {
  plan: PaywallPlanSummary;
  selected: boolean;
  disabled?: boolean;
  /** e.g. "BEST VALUE · SAVE 58%" — annual card only, computed from real prices. */
  badgeLabel?: string | null;
  onSelect: () => void;
}

/**
 * Selectable plan card — a selector, not a CTA (the single subscribe button
 * lives below the cards, per the one-CTA-per-card editorial rule). Selection
 * state uses the accent tint tokens: green hairline border + subtle fill.
 */
export default function PaywallPlanCard({
  plan,
  selected,
  disabled = false,
  badgeLabel,
  onSelect,
}: Props) {
  const price = plan.product.price?.localizedString;
  const subLine = [plan.monthlyEquivalent, plan.trial?.cardLine ?? plan.billedCaption]
    .filter(Boolean)
    .join(' · ');

  return (
    <AnimatedPressable
      style={[s.card, selected ? s.cardSelected : null]}
      onPress={onSelect}
      disabled={disabled}
      accessibilityLabel={`${plan.title} plan, ${price ?? 'price loading'}${plan.intervalSuffix}${selected ? ', selected' : ''}`}
    >
      {badgeLabel ? (
        <View style={s.badge}>
          <Text style={s.badgeTxt}>{badgeLabel}</Text>
        </View>
      ) : null}
      <View style={s.mainRow}>
        <Text style={s.title}>{plan.title}</Text>
        <View style={s.priceWrap}>
          <Text style={s.price}>{price ?? '—'}</Text>
          <Text style={s.priceSuffix}>{plan.intervalSuffix}</Text>
        </View>
      </View>
      <Text style={s.subLine}>{subLine}</Text>
    </AnimatedPressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.cardBg,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    borderRadius: Radius.card,
    padding: Spacing.base,
  },
  cardSelected: {
    backgroundColor: Colors.dark.accentBg,
    borderColor: Colors.dark.accentBorder,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.dark.statusOptimalBg,
    borderWidth: 0.5,
    borderColor: Colors.dark.statusOptimalBorder,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginBottom: Spacing.sm,
  },
  badgeTxt: {
    color: Colors.viz.bioGreen,
    fontSize: Typography.sizes.captionSmall,
    fontWeight: Typography.weights.label,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wider,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  title: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.subheadline,
  },
  priceWrap: { flexDirection: 'row', alignItems: 'baseline' },
  price: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.h2,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  priceSuffix: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.bodySmall,
  },
  subLine: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.caption,
    marginTop: Spacing.xs,
  },
});
