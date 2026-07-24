import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '../../theme';
import type {
  TodayAction,
  TodayProgress as TodayProgressModel,
} from '../../types/today';

export interface TodayProgressProps {
  readonly progress: TodayProgressModel;
  readonly onAction: (action: TodayAction) => void;
}

function TodayProgressComponent({
  progress,
  onAction,
}: TodayProgressProps) {
  const totalCount = Math.max(progress.totalCount, 0);
  const boundedCompleted = Math.min(
    Math.max(progress.completedCount, 0),
    totalCount,
  );
  const percentage = totalCount > 0
    ? (boundedCompleted / totalCount) * 100
    : 0;
  const accessibilityValue = totalCount > 0
    ? {
        min: 0,
        max: totalCount,
        now: boundedCompleted,
        text: progress.summary,
      }
    : { text: progress.summary };

  return (
    <View style={styles.section} accessibilityLabel="Today's progress">
      <Text accessibilityRole="header" style={styles.heading}>
        Today&apos;s progress
      </Text>
      <View style={styles.card}>
        <Text style={styles.summary}>{progress.summary}</Text>
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityLabel="Plan completion"
          accessibilityValue={accessibilityValue}
        >
          <View
            style={[styles.progressFill, { width: `${percentage}%` }]}
            accessible={false}
          />
        </View>
        {progress.nextItem ? (
          <View style={styles.nextItem}>
            <View style={styles.nextCopy}>
              <Text style={styles.label}>NEXT IN YOUR PLAN</Text>
              <Text style={styles.itemTitle}>{progress.nextItem.title}</Text>
              {progress.nextItem.timingLabel ? (
                <Text style={styles.timing}>
                  {progress.nextItem.timingLabel}
                </Text>
              ) : null}
            </View>
            {progress.nextItem.completionAction ? (
              <Pressable
                onPress={() => onAction(progress.nextItem!.completionAction!)}
                style={({ pressed }) => [
                  styles.completionAction,
                  pressed ? styles.pressed : null,
                ]}
                accessibilityRole="checkbox"
                accessibilityLabel={`${progress.nextItem.completionAction.completed ? 'Mark' : 'Unmark'} ${progress.nextItem.title} complete`}
                accessibilityState={{
                  checked: progress.nextItem.completed,
                }}
              >
                <Text style={styles.completionSymbol} accessible={false}>
                  {progress.nextItem.completed ? '✓' : '○'}
                </Text>
                <Text style={styles.completionText}>
                  {progress.nextItem.completed ? 'Completed' : 'Mark complete'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {progress.openPlanAction ? (
          <Pressable
            onPress={() => onAction(progress.openPlanAction!)}
            style={({ pressed }) => [
              styles.openPlanAction,
              pressed ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open plan"
          >
            <Text style={styles.openPlanText}>Open plan</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export const TodayProgress = React.memo(TodayProgressComponent);

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
    backgroundColor: Colors.health.surfaceStrong,
    borderColor: Colors.health.rule,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  summary: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
  },
  progressTrack: {
    height: Spacing.xs,
    backgroundColor: Colors.health.neutralSoft,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: Spacing.xs,
    backgroundColor: Colors.health.accent,
    borderRadius: Radius.full,
  },
  nextItem: {
    borderTopColor: Colors.health.rule,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  nextCopy: {
    gap: Spacing.xs,
  },
  label: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.wider,
  },
  itemTitle: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    fontWeight: Typography.weights.subheadline,
  },
  timing: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
  },
  completionAction: {
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.card,
    borderColor: Colors.health.ruleStrong,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  completionSymbol: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.lg,
    lineHeight: Typography.lineHeights.body,
  },
  completionText: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  openPlanAction: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  openPlanText: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  pressed: {
    opacity: 0.62,
  },
});
