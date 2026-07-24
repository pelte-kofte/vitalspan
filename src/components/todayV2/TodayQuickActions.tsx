import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '../../theme';
import type {
  TodayAction,
  TodayQuickActions as TodayQuickActionsModel,
} from '../../types/today';

export interface TodayQuickActionsProps {
  readonly actions: TodayQuickActionsModel;
  readonly onAction: (action: TodayAction) => void;
}

function TodayQuickActionsComponent({
  actions,
  onAction,
}: TodayQuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <View style={styles.section} accessibilityLabel="Quick actions">
      <Text accessibilityRole="header" style={styles.heading}>
        Quick actions
      </Text>
      <View style={styles.actions}>
        {actions.map(item => (
          <Pressable
            key={item.id}
            onPress={() => onAction(item.action)}
            style={({ pressed }) => [
              styles.action,
              pressed ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Text style={styles.actionText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export const TodayQuickActions = React.memo(TodayQuickActionsComponent);

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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  action: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    borderRadius: Radius.card,
    borderColor: Colors.health.ruleStrong,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: Colors.health.surfaceStrong,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  actionText: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  pressed: {
    opacity: 0.68,
  },
});
