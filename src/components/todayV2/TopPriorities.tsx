import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '../../theme';
import type {
  TodayAction,
  TodayPriority,
  TodayTopPriorities,
} from '../../types/today';

export interface TopPrioritiesProps {
  readonly priorities: TodayTopPriorities;
  readonly onAction: (action: TodayAction) => void;
  readonly onExplain: (priority: TodayPriority) => void;
}

interface PriorityCardProps {
  readonly priority: TodayPriority;
  readonly primary: boolean;
  readonly onAction: (action: TodayAction) => void;
  readonly onExplain: (priority: TodayPriority) => void;
}

function PriorityCard({
  priority,
  primary,
  onAction,
  onExplain,
}: PriorityCardProps) {
  const action = priority.action;
  const actionLabel = priority.actionLabel;

  return (
    <View
      style={[styles.card, primary ? styles.primaryCard : styles.secondaryCard]}
      accessibilityLabel={`${primary ? 'Primary focus' : 'Secondary priority'}. ${priority.title}. ${priority.reason}`}
    >
      <Text style={styles.eyebrow}>
        {primary ? 'PRIMARY FOCUS' : 'SECONDARY PRIORITY'}
      </Text>
      <Text accessibilityRole="header" style={styles.title}>
        {priority.title}
      </Text>
      <Text style={styles.reason}>{priority.reason}</Text>
      {'timingOrEffort' in priority && priority.timingOrEffort ? (
        <Text style={styles.timing}>{priority.timingOrEffort}</Text>
      ) : null}
      <View style={styles.actions}>
        {action && actionLabel ? (
          <Pressable
            onPress={() => onAction(action)}
            style={({ pressed }) => [
              primary ? styles.primaryAction : styles.secondaryAction,
              pressed ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text
              style={
                primary
                  ? styles.primaryActionText
                  : styles.secondaryActionText
              }
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => onExplain(priority)}
          style={({ pressed }) => [
            styles.explainAction,
            pressed ? styles.pressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Why ${priority.title} is shown`}
          accessibilityHint="Explains the observed fact, interpretation, action, and limitations"
        >
          <Text style={styles.explainText}>Why this?</Text>
        </Pressable>
      </View>
    </View>
  );
}

function TopPrioritiesComponent({
  priorities,
  onAction,
  onExplain,
}: TopPrioritiesProps) {
  return (
    <View style={styles.section} accessibilityLabel="Top priorities">
      <Text accessibilityRole="header" style={styles.heading}>
        Top priorities
      </Text>
      <PriorityCard
        priority={priorities.primary}
        primary
        onAction={onAction}
        onExplain={onExplain}
      />
      {priorities.secondary.map(priority => (
        <PriorityCard
          key={priority.id}
          priority={priority}
          primary={false}
          onAction={onAction}
          onExplain={onExplain}
        />
      ))}
    </View>
  );
}

export const TopPriorities = React.memo(TopPrioritiesComponent);

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
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  primaryCard: {
    backgroundColor: Colors.health.accentSoft,
    borderColor: Colors.health.accent,
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryCard: {
    backgroundColor: Colors.health.surfaceStrong,
    borderColor: Colors.health.rule,
    borderWidth: StyleSheet.hairlineWidth,
  },
  eyebrow: {
    color: Colors.health.inkSecondary,
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
  reason: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
  },
  timing: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  primaryAction: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: Radius.card,
    backgroundColor: Colors.health.surfaceStrong,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  secondaryAction: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: Radius.card,
    borderColor: Colors.health.ruleStrong,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  primaryActionText: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  secondaryActionText: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  explainAction: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  explainText: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  pressed: {
    opacity: 0.7,
  },
});
