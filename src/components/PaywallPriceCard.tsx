import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../theme';
import { SkeletonBlock, SkeletonPulse } from './Skeleton';
import AnimatedPressable from './AnimatedPressable';
import PaywallPlanCard from './PaywallPlanCard';
import PaywallLoadError from './PaywallLoadError';
import {
  computeAnnualSavingsPercent,
  type PaywallPlanSummary,
} from '../lib/paywallProducts';

// Compact trial timeline legend — what happens at each milestone. Shown only
// when the selected plan actually carries a free trial.
const TIMELINE_STEPS = [
  { day: 'Day 1', label: 'Full access starts today' },
  { day: 'Day 5', label: 'Reminder before your trial ends' },
  { day: 'Day 8', label: 'Trial ends — billing starts unless cancelled' },
];

interface Props {
  primaryPlan: PaywallPlanSummary | null;
  secondaryPlan: PaywallPlanSummary | null;
  selectedVendorId: string | null;
  onSelectPlan: (vendorProductId: string) => void;
  loadingProducts: boolean;
  loadErrorTitle?: string;
  loadErrorMessage?: string;
  loadErrorStage?: string | null;
  loadErrorCode?: string | number | null;
  onRetry?: () => void;
  purchasing: boolean;
  onSubscribe: () => void;
  onRestore: () => void;
}

/**
 * Price selection panel — the hero of the paywall. Two selectable plan cards
 * (annual pre-selected upstream), one solid CTA whose label follows the
 * selection, then the compact trial timeline and Restore Purchases.
 */
export default function PaywallPriceCard({
  primaryPlan,
  secondaryPlan,
  selectedVendorId,
  onSelectPlan,
  loadingProducts,
  loadErrorTitle,
  loadErrorMessage,
  loadErrorStage,
  loadErrorCode,
  onRetry,
  purchasing,
  onSubscribe,
  onRestore,
}: Props) {
  if (loadErrorTitle && !loadingProducts) {
    return (
      <PaywallLoadError
        title={loadErrorTitle}
        message={loadErrorMessage}
        failedStage={loadErrorStage}
        errorCode={loadErrorCode}
        onRetry={onRetry}
        onRestore={onRestore}
      />
    );
  }

  const plans = [primaryPlan, secondaryPlan].filter(
    (plan): plan is PaywallPlanSummary => plan !== null,
  );
  const selectedPlan =
    plans.find((plan) => plan.vendorProductId === selectedVendorId) ?? plans[0] ?? null;

  const annual = plans.find((plan) => plan.kind === 'annual') ?? null;
  const monthly = plans.find((plan) => plan.kind === 'monthly') ?? null;
  const savingsPercent = computeAnnualSavingsPercent(annual, monthly);

  const ctaLabel = selectedPlan?.trial?.ctaLabel ?? 'Subscribe';

  return (
    <View>
      {loadingProducts ? (
        <SkeletonPulse>
          <SkeletonBlock w="100%" h={84} radius={Radius.card} />
          <SkeletonBlock w="100%" h={64} radius={Radius.card} style={s.skeletonGap} />
        </SkeletonPulse>
      ) : (
        <View style={s.cards}>
          {plans.map((plan) => (
            <PaywallPlanCard
              key={plan.vendorProductId}
              plan={plan}
              selected={plan.vendorProductId === selectedPlan?.vendorProductId}
              disabled={purchasing}
              badgeLabel={
                plan.kind === 'annual' && savingsPercent !== null
                  ? `Best value · Save ${savingsPercent}%`
                  : null
              }
              onSelect={() => onSelectPlan(plan.vendorProductId)}
            />
          ))}
        </View>
      )}

      <AnimatedPressable
        style={[s.btnPrimary, (purchasing || loadingProducts || !selectedPlan) && s.btnDisabled]}
        disabled={purchasing || loadingProducts || !selectedPlan}
        onPress={onSubscribe}
        haptic="medium"
        accessibilityLabel={
          selectedPlan
            ? `${ctaLabel}, ${selectedPlan.title} plan, ${selectedPlan.product.price?.localizedString ?? 'the current App Store price'}${selectedPlan.intervalSuffix}`
            : 'Loading subscription pricing'
        }
      >
        <Text style={s.btnPrimaryTxt}>
          {loadingProducts ? 'Loading pricing…' : selectedPlan ? ctaLabel : 'Pricing unavailable'}
        </Text>
      </AnimatedPressable>
      <Text style={s.cancelLine}>Cancel anytime in Settings.</Text>

      {selectedPlan?.trial ? (
        <View style={s.timelineLegend}>
          {TIMELINE_STEPS.map((step) => (
            <View key={step.day} style={s.timelineLegendRow}>
              <Text style={s.timelineLegendDay}>{step.day}</Text>
              <Text style={s.timelineLegendLabel}>{step.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Restore Purchases — App Store requirement */}
      <TouchableOpacity
        onPress={onRestore}
        style={s.restoreBtn}
        accessibilityRole="button"
        accessibilityLabel="Restore Purchases"
      >
        <Text style={s.restoreLink}>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  cards: { gap: Spacing.md },
  skeletonGap: { marginTop: Spacing.md },
  btnPrimary: {
    backgroundColor: Colors.dark.ctaPrimary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryTxt: {
    color: Colors.dark.bg,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.subheadline,
  },
  cancelLine: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.caption,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  timelineLegend: {
    gap: 6,
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.xs,
  },
  timelineLegendRow: { flexDirection: 'row', gap: Spacing.sm },
  timelineLegendDay: {
    fontSize: Typography.sizes.captionSmall,
    fontWeight: Typography.weights.label,
    color: Colors.dark.textMuted,
    width: 42,
  },
  timelineLegendLabel: {
    fontSize: Typography.sizes.captionSmall,
    color: Colors.dark.textMuted,
    flex: 1,
  },
  restoreBtn: { alignItems: 'center', marginTop: Spacing.md },
  restoreLink: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.xs,
    paddingVertical: Spacing.sm,
  },
});
