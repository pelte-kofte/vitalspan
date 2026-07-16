import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { HealthEmptyStateCopy, HealthInputState } from '../../lib/healthExperience';
import { Colors, Radius, Spacing, Typography } from '../../theme';
import Text from './HealthText';

interface Props {
  state: HealthInputState;
  copy: HealthEmptyStateCopy;
  onAction: () => void;
}

export default function HealthStateNote({ state, copy, onAction }: Props) {
  return (
    <View style={s.note} accessibilityLabel={`${copy.title}. ${copy.known} ${copy.unknown}`}>
      <Text style={s.state}>{state.replace(/_/g, ' ').toUpperCase()}</Text>
      <Text style={s.title}>{copy.title}</Text>
      <View style={s.line} />
      <Text style={s.label}>WHAT WE KNOW</Text>
      <Text style={s.body}>{copy.known}</Text>
      <Text style={s.label}>WHAT WE DON'T KNOW</Text>
      <Text style={s.body}>{copy.unknown}</Text>
      <Text style={s.label}>BEST NEXT ACTION</Text>
      <Text style={s.body}>{copy.action}</Text>
      <Pressable onPress={onAction} style={s.action} accessibilityRole="button">
        <Text style={s.actionText}>{copy.actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  note: { backgroundColor: Colors.health.surface, borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.health.rule, padding: Spacing.lg },
  state: { color: Colors.health.accent, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest },
  title: { color: Colors.health.ink, fontSize: Typography.sizes.h2, lineHeight: Typography.lineHeights.h2, fontWeight: Typography.weights.headline, marginTop: Spacing.sm },
  line: { height: 1, backgroundColor: Colors.health.rule, marginVertical: Spacing.lg },
  label: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.wider, marginTop: Spacing.md },
  body: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
  action: { minHeight: Spacing.xxl + Spacing.base, justifyContent: 'center', alignItems: 'center', borderRadius: Radius.card, backgroundColor: Colors.health.ink, marginTop: Spacing.lg, paddingHorizontal: Spacing.base },
  actionText: { color: Colors.health.surfaceStrong, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
});
