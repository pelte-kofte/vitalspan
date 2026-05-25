import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import BreathingCard from './BreathingCard';
import { Colors, Spacing, Radius, Typography, Motion } from '../theme';

export interface ExplanationCardProps {
  icon: string;
  headline: string;
  body: string;
  glowColor?: string;
  period?: number;
  style?: ViewStyle;
}

export default function ExplanationCard({
  icon,
  headline,
  body,
  glowColor,
  period,
  style,
}: ExplanationCardProps) {
  return (
    <BreathingCard
      glowColor={glowColor ?? Colors.primaryDark}
      period={period ?? Motion.breath}
      style={style}
    >
      <View style={s.inner}>
        <Text style={s.icon}>{icon}</Text>
        <Text style={s.headline}>{headline}</Text>
        <Text style={s.body}>{body}</Text>
      </View>
    </BreathingCard>
  );
}

const s = StyleSheet.create({
  inner: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.base,
  },
  icon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  headline: {
    fontSize: Typography.sizes.h3,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: Typography.sizes.body,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});
