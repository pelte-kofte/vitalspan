import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '../../theme';
import type {
  TodayAction,
  TodayDailyHealthBrief,
} from '../../types/today';

export interface DailyHealthBriefProps {
  readonly brief: TodayDailyHealthBrief;
  readonly onAction: (action: TodayAction) => void;
}

function DailyHealthBriefComponent({
  brief,
  onAction,
}: DailyHealthBriefProps) {
  return (
    <View style={styles.section} accessibilityLabel="Daily health brief">
      <Text accessibilityRole="header" style={styles.heading}>
        Daily health brief
      </Text>
      <View style={styles.brief}>
        {brief.sentences.map((sentence, index) => (
          <Text key={`${index}:${sentence}`} style={styles.sentence}>
            {sentence}
          </Text>
        ))}
        {brief.lastUpdatedLabel ? (
          <Text style={styles.updated}>{brief.lastUpdatedLabel}</Text>
        ) : null}
        {brief.explanationAction ? (
          <Pressable
            onPress={() => onAction(brief.explanationAction!)}
            style={({ pressed }) => [
              styles.explainAction,
              pressed ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Explain this health brief"
            accessibilityHint="Provides a focused explanation of this brief"
          >
            <Text style={styles.explainText}>Explain this brief</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export const DailyHealthBrief = React.memo(DailyHealthBriefComponent);

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
  brief: {
    backgroundColor: Colors.health.surfaceStrong,
    borderColor: Colors.health.rule,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sentence: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
  },
  updated: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.caption,
    lineHeight: Typography.lineHeights.caption,
  },
  explainAction: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  explainText: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  pressed: {
    opacity: 0.62,
  },
});
