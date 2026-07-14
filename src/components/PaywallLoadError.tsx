import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../theme';
import AnimatedPressable from './AnimatedPressable';

interface Props {
  title: string;
  message?: string;
  failedStage?: string | null;
  errorCode?: string | number | null;
  onRetry?: () => void;
  onRestore: () => void;
}

/**
 * Products failed to load — explicit retry state instead of leaving the CTA
 * stuck on placeholder prices forever.
 */
export default function PaywallLoadError({
  title,
  message,
  failedStage,
  errorCode,
  onRetry,
  onRestore,
}: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.body}>{message ?? 'Check your connection and try again.'}</Text>
      {(failedStage || (errorCode !== null && errorCode !== undefined)) ? (
        <View style={s.metaWrap}>
          {failedStage ? <Text style={s.metaText}>Failed stage: {failedStage}</Text> : null}
          {errorCode !== null && errorCode !== undefined ? (
            <Text style={s.metaText}>Error code: {String(errorCode)}</Text>
          ) : null}
        </View>
      ) : null}
      <AnimatedPressable
        style={s.btnPrimary}
        onPress={onRetry}
        accessibilityLabel="Retry loading subscription pricing"
      >
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

const s = StyleSheet.create({
  wrap: { paddingTop: Spacing.md },
  title: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.subheadline,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  body: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  metaWrap: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 2,
  },
  metaText: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
  },
  btnPrimary: {
    backgroundColor: Colors.dark.ctaPrimary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  btnPrimaryTxt: {
    color: Colors.dark.bg,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.subheadline,
  },
  restoreBtn: { alignItems: 'center' },
  restoreLink: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.xs,
    paddingVertical: Spacing.sm,
  },
});
