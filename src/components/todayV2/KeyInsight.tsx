import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '../../theme';
import type {
  TodayAction,
  TodayKeyInsight as TodayKeyInsightModel,
} from '../../types/today';

export interface KeyInsightProps {
  readonly insight: TodayKeyInsightModel | null;
  readonly onAction: (action: TodayAction) => void;
}

function KeyInsightComponent({ insight, onAction }: KeyInsightProps) {
  if (!insight) return null;

  return (
    <View style={styles.section} accessibilityLabel="Key insight">
      <Text accessibilityRole="header" style={styles.heading}>
        Key insight
      </Text>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          {insight.title}
        </Text>
        <Text style={styles.summary}>{insight.summary}</Text>
        <Text style={styles.label}>WHY IT MATTERS</Text>
        <Text style={styles.meaning}>{insight.whyItMatters}</Text>
        {insight.action && insight.actionLabel ? (
          <Pressable
            onPress={() => onAction(insight.action!)}
            style={({ pressed }) => [
              styles.action,
              pressed ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={insight.actionLabel}
          >
            <Text style={styles.actionText}>{insight.actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export const KeyInsight = React.memo(KeyInsightComponent);

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  heading: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.h2,
    lineHeight: Typography.lineHeights.h2,
    fontWeight: Typography.weights.headline,
  },
  card: {
    backgroundColor: Colors.health.accentSoft,
    borderColor: Colors.health.accent,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.sm,
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
  label: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.wider,
    marginTop: Spacing.xs,
  },
  meaning: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
  },
  action: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionText: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  pressed: {
    opacity: 0.62,
  },
});
