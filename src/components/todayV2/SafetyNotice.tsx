import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '../../theme';
import type {
  TodayAction,
  TodaySafetyNotice as TodaySafetyNoticeModel,
} from '../../types/today';

export interface SafetyNoticeProps {
  readonly notice: TodaySafetyNoticeModel | null;
  readonly onAction: (action: TodayAction) => void;
}

function SafetyNoticeComponent({ notice, onAction }: SafetyNoticeProps) {
  if (!notice) return null;

  return (
    <View
      style={styles.notice}
      accessibilityRole="alert"
      accessibilityLabel={`Safety review. ${notice.title}. ${notice.summary}`}
      accessibilityLiveRegion="assertive"
    >
      <Text style={styles.eyebrow}>SAFETY REVIEW</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {notice.title}
      </Text>
      <Text style={styles.summary}>{notice.summary}</Text>
      {notice.uncertainty ? (
        <Text style={styles.supporting}>{notice.uncertainty}</Text>
      ) : null}
      {notice.professionalCareGuidance ? (
        <Text style={styles.supporting}>{notice.professionalCareGuidance}</Text>
      ) : null}
      <Pressable
        onPress={() => onAction(notice.action)}
        style={({ pressed }) => [
          styles.action,
          pressed ? styles.pressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={notice.actionLabel}
        accessibilityHint="Opens the relevant safety review"
      >
        <Text style={styles.actionText}>{notice.actionLabel}</Text>
      </Pressable>
    </View>
  );
}

export const SafetyNotice = React.memo(SafetyNoticeComponent);

const styles = StyleSheet.create({
  notice: {
    backgroundColor: Colors.health.attentionSoft,
    borderColor: Colors.health.attention,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  eyebrow: {
    color: Colors.warningTextDark,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.wider,
  },
  title: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.h3,
    lineHeight: Typography.lineHeights.h3,
    fontWeight: Typography.weights.subheadline,
  },
  summary: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
  },
  supporting: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
  },
  action: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderRadius: Radius.card,
    backgroundColor: Colors.health.ink,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  pressed: {
    opacity: 0.72,
  },
  actionText: {
    color: Colors.health.surfaceStrong,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
});
