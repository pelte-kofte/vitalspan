import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../theme';
import { SkeletonBlock, SkeletonPulse } from './Skeleton';
import AnimatedPressable from './AnimatedPressable';
import type { PaywallPlanSummary } from '../lib/paywallProducts';

// Day markers: 1–7 are free trial days, Day 8 is first billed day (D-07)
const DAYS = [1, 2, 3, 4, 5, 6, 7, 8];

// Blinkist-style trial timeline legend — explains what happens at each
// milestone instead of leaving the day-strip to speak for itself.
const TIMELINE_STEPS = [
  { day: 'Day 1', label: 'Full access starts today' },
  { day: 'Day 5', label: 'Reminder before your trial ends' },
  { day: 'Day 8', label: 'Trial ends — billing starts unless cancelled' },
];

interface Props {
  primaryPlan: PaywallPlanSummary | null;
  secondaryPlan: PaywallPlanSummary | null;
  loadingProducts: boolean;
  loadErrorTitle?: string;
  loadErrorMessage?: string;
  onRetry?: () => void;
  purchasing: boolean;
  onSubscribePrimary: () => void;
  onSubscribeSecondary: () => void;
  onRestore: () => void;
}

export default function PaywallPriceCard({
  primaryPlan,
  secondaryPlan,
  loadingProducts,
  loadErrorTitle,
  loadErrorMessage,
  onRetry,
  purchasing,
  onSubscribePrimary,
  onSubscribeSecondary,
  onRestore,
}: Props) {
  const hasFreeTrial = Boolean(
    primaryPlan?.product.subscription?.offer?.phases?.some(
      (phase) => phase.paymentMode === 'free_trial',
    ),
  );

  // Products failed to load — show an explicit retry state instead of
  // leaving the CTA stuck on "…/yr" placeholders forever.
  if (loadErrorTitle && !loadingProducts) {
    return (
      <View style={s.card}>
        <View style={s.handle} />
        <Text style={s.errorTitle}>{loadErrorTitle}</Text>
        <Text style={s.errorBody}>
          {loadErrorMessage ?? 'Check your connection and try again.'}
        </Text>
        <AnimatedPressable style={s.btnPrimary} onPress={onRetry} accessibilityLabel="Retry loading subscription pricing">
          <Text style={s.btnPrimaryTxt}>Retry</Text>
        </AnimatedPressable>
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

  return (
    <View style={s.card}>
      <View style={s.handle} />

      {/* Annual primary CTA — D-06 */}
      <AnimatedPressable
        style={[s.btnPrimary, purchasing && s.btnDisabled]}
        disabled={purchasing || loadingProducts || !primaryPlan}
        onPress={onSubscribePrimary}
        haptic="medium"
        accessibilityLabel={
          primaryPlan
            ? `${primaryPlan.ctaLabel} for ${primaryPlan.product.price?.localizedString ?? 'the current App Store price'}`
            : 'Loading subscription pricing'
        }
      >
        {loadingProducts ? (
          <SkeletonPulse>
            <SkeletonBlock w={190} h={16} radius={4} style={s.shimmerOnBrand} />
            <SkeletonBlock w={120} h={11} radius={4} style={[s.shimmerOnBrand, { marginTop: 6 }]} />
          </SkeletonPulse>
        ) : (
          <>
            <Text style={s.btnPrimaryTxt}>
              {primaryPlan
                ? `${primaryPlan.ctaLabel} · ${primaryPlan.product.price?.localizedString ?? '...'}${primaryPlan.intervalSuffix}`
                : 'Pricing unavailable'}
            </Text>
            <Text style={s.btnSubTxt}>
              {primaryPlan?.timelineCaption ?? 'Please retry to load subscription pricing'}
            </Text>
          </>
        )}
      </AnimatedPressable>

      {/* Monthly secondary link — D-06 */}
      {secondaryPlan ? (
        <TouchableOpacity
          style={s.monthlyLink}
          onPress={onSubscribeSecondary}
          disabled={purchasing || loadingProducts}
          accessibilityRole="button"
          accessibilityLabel={`${secondaryPlan.ctaLabel} for ${secondaryPlan.product.price?.localizedString ?? 'the current App Store price'}`}
        >
          <Text style={s.monthlyTxt}>
            {loadingProducts
              ? 'Loading pricing…'
              : `${secondaryPlan.ctaLabel} · ${secondaryPlan.product.price?.localizedString ?? '...'}${secondaryPlan.intervalSuffix}`}
          </Text>
        </TouchableOpacity>
      ) : null}

      {hasFreeTrial ? (
        <>
          {/* Day 1–7 free / Day 8 billed timeline — D-07 */}
          <View style={s.timelineContainer}>
            {DAYS.map(day => (
              <View key={day} style={[s.dayMarker, day <= 7 ? s.dayFree : s.dayBilled]}>
                <Text style={[s.dayNum, day <= 7 ? s.dayNumFree : s.dayNumBilled]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <Text style={s.timelineCaption}>
            {primaryPlan?.timelineCaption ?? 'Pricing provided by the App Store'}
          </Text>

          {/* Trial timeline legend — what happens at each milestone */}
          <View style={s.timelineLegend}>
            {TIMELINE_STEPS.map(step => (
              <View key={step.day} style={s.timelineLegendRow}>
                <Text style={s.timelineLegendDay}>{step.day}</Text>
                <Text style={s.timelineLegendLabel}>{step.label}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={s.timelineCaption}>
          {primaryPlan?.timelineCaption ?? 'Pricing provided by the App Store'}
        </Text>
      )}

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
  card: {
    backgroundColor: Colors.dark.bgElevated,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
    borderBottomWidth: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.borderStrong,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  btnPrimary: {
    backgroundColor: Colors.dark.ctaPrimary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base + 4,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryTxt: {
    color: Colors.dark.bg,
    fontSize: Typography.sizes.body,
    fontWeight: '600',
  },
  btnSubTxt: {
    color: 'rgba(12,15,13,0.65)',
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  shimmerOnBrand: {
    backgroundColor: 'rgba(12,15,13,0.2)',
  },
  monthlyLink: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  monthlyTxt: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.bodySmall,
    textAlign: 'center',
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  dayMarker: {
    width: 24,
    height: 24,
    borderRadius: Radius.card,
    backgroundColor: Colors.dark.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayFree: { opacity: 1 },
  dayBilled: { opacity: 0.45 },
  dayNum: { fontSize: Typography.sizes.captionSmall, fontWeight: '600', color: Colors.dark.textMuted },
  dayNumFree: {},
  dayNumBilled: {},
  timelineCaption: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  timelineLegend: {
    gap: 6,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  timelineLegendRow: { flexDirection: 'row', gap: Spacing.sm },
  timelineLegendDay: {
    fontSize: Typography.sizes.captionSmall,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    width: 42,
  },
  timelineLegendLabel: {
    fontSize: Typography.sizes.captionSmall,
    color: Colors.dark.textMuted,
    flex: 1,
  },
  restoreBtn: { alignItems: 'center' },
  restoreLink: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  errorTitle: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.h3,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  errorBody: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
