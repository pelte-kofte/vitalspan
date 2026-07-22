import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, ProductLayout, Spacing, Typography } from '../theme';

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  compact?: boolean;
}

/** Dark product header shared by Home-adjacent primary screens. */
export default function ProductScreenHeader({ eyebrow, title, subtitle, action, compact = false }: Props) {
  return (
    <View style={[s.header, compact && s.headerCompact]}>
      <View style={s.copy}>
        <Text style={s.eyebrow} maxFontSizeMultiplier={1.3}>{eyebrow}</Text>
        <Text style={[s.title, compact && s.titleCompact]} maxFontSizeMultiplier={1.2}>{title}</Text>
        {subtitle ? <Text style={s.subtitle} maxFontSizeMultiplier={1.35}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={s.action}>{action}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: ProductLayout.pageInset,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerCompact: { paddingHorizontal: ProductLayout.compactPageInset },
  copy: { flex: 1 },
  eyebrow: {
    color: Colors.dark.ctaPrimary,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.widest,
  },
  title: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.display3,
    lineHeight: Typography.lineHeights.display3,
    fontWeight: Typography.weights.title,
    marginTop: Spacing.xs,
  },
  titleCompact: {
    fontSize: Typography.sizes.h1,
    lineHeight: Typography.lineHeights.h1,
  },
  subtitle: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.sm,
    maxWidth: 480,
  },
  action: { paddingTop: Spacing.lg, flexShrink: 0 },
});
