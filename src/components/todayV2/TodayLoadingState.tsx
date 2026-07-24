import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../../theme';

function LoadingLine({
  width,
}: {
  readonly width: `${number}%`;
}) {
  return <View style={[styles.line, { width }]} accessible={false} />;
}

function LoadingSection({ lines }: { readonly lines: readonly `${number}%`[] }) {
  return (
    <View style={styles.card} accessible={false}>
      {lines.map((width, index) => (
        <LoadingLine key={`${width}:${index}`} width={width} />
      ))}
    </View>
  );
}

function TodayLoadingStateComponent() {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading today's health briefing"
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.hiddenLabel}>Loading today&apos;s health briefing</Text>
      <View style={styles.header} accessible={false}>
        <LoadingLine width="58%" />
        <LoadingLine width="34%" />
      </View>
      <LoadingSection lines={['42%', '94%', '78%']} />
      <LoadingSection lines={['36%', '72%', '88%', '40%']} />
      <LoadingSection lines={['38%', '86%', '64%']} />
    </View>
  );
}

export const TodayLoadingState = React.memo(TodayLoadingStateComponent);

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xxl,
  },
  hiddenLabel: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  header: {
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.health.surfaceStrong,
    borderColor: Colors.health.rule,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  line: {
    height: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.health.neutralSoft,
  },
});
