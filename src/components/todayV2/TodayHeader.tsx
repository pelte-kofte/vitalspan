import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '../../theme';
import type { TodayHeader as TodayHeaderModel } from '../../types/today';

export interface TodayHeaderProps {
  readonly header: TodayHeaderModel;
}

function TodayHeaderComponent({ header }: TodayHeaderProps) {
  return (
    <View style={styles.container} accessibilityLabel="Today">
      <Text accessibilityRole="header" style={styles.greeting}>
        {header.greeting}
      </Text>
      <Text style={styles.date}>{header.dateLabel}</Text>
    </View>
  );
}

export const TodayHeader = React.memo(TodayHeaderComponent);

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  greeting: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.h1,
    lineHeight: Typography.lineHeights.h1,
    fontWeight: Typography.weights.title,
  },
  date: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
  },
});
