import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../theme';

// Day markers: 1–7 are free trial days, Day 8 is first billed day (D-07)
const DAYS = [1, 2, 3, 4, 5, 6, 7, 8];

interface Props {
  annualPrice: string | undefined;
  monthlyPrice: string | undefined;
  loadingProducts: boolean;
  purchasing: boolean;
  onSubscribeAnnual: () => void;
  onSubscribeMonthly: () => void;
  onRestore: () => void;
}

export default function PaywallPriceCard({
  annualPrice,
  monthlyPrice,
  loadingProducts,
  purchasing,
  onSubscribeAnnual,
  onSubscribeMonthly,
  onRestore,
}: Props) {
  return (
    <View style={s.card}>
      <View style={s.handle} />

      {/* Annual primary CTA — D-06 */}
      <TouchableOpacity
        style={[s.btnPrimary, purchasing && s.btnDisabled]}
        disabled={purchasing || loadingProducts}
        onPress={onSubscribeAnnual}
        accessibilityRole="button"
        accessibilityLabel={`Subscribe annually for ${annualPrice ?? '...'} per year with a 7-day free trial`}
      >
        {loadingProducts ? (
          <ActivityIndicator color={Colors.surface} />
        ) : (
          <>
            <Text style={s.btnPrimaryTxt}>
              {`Subscribe Annually · ${annualPrice ?? '...'}/yr`}
            </Text>
            <Text style={s.btnSubTxt}>7-day free trial included</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Monthly secondary link — D-06 */}
      <TouchableOpacity
        style={s.monthlyLink}
        onPress={onSubscribeMonthly}
        disabled={purchasing}
        accessibilityRole="button"
        accessibilityLabel={`Or try monthly for ${monthlyPrice ?? '...'} per month`}
      >
        <Text style={s.monthlyTxt}>
          {`Or try monthly · ${monthlyPrice ?? '...'}/mo`}
        </Text>
      </TouchableOpacity>

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
        {`7 days free, then ${annualPrice ?? '...'}/yr · Cancel anytime`}
      </Text>

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
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  btnPrimary: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base + 4,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryTxt: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.body,
    fontWeight: '600',
  },
  btnSubTxt: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  monthlyLink: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  monthlyTxt: {
    color: Colors.textMuted,
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
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayFree: { backgroundColor: Colors.status.optimalBg },
  dayBilled: { backgroundColor: Colors.bgShade },
  dayNum: { fontSize: Typography.sizes.xs, fontWeight: '600' },
  dayNumFree: { color: Colors.status.optimalText },
  dayNumBilled: { color: Colors.textMuted },
  timelineCaption: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  restoreBtn: { alignItems: 'center' },
  restoreLink: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
});
