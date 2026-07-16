import React, { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Spacing, Typography } from '../../theme';
import Svg, { Path } from 'react-native-svg';
import Text from './HealthText';

interface Props {
  title: string;
  summary?: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}

export default function DisclosureSection({ title, summary, children, initiallyOpen = false }: Props) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={s.section}>
      <Pressable
        style={s.header}
        onPress={() => setOpen(value => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}. ${summary ?? ''}`}
      >
        <View style={s.headingGroup}>
          <Text style={s.title}>{title}</Text>
          {!open && summary && <Text style={s.summary} numberOfLines={2}>{summary}</Text>}
        </View>
        <Svg width={Spacing.base} height={Spacing.base} viewBox="0 0 16 16" accessible={false}>
          <Path d={open ? 'M3 6 L8 11 L13 6' : 'M6 3 L11 8 L6 13'} fill="none" stroke={Colors.health.inkSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
      {open && <View style={s.body}>{children}</View>}
    </View>
  );
}

const s = StyleSheet.create({
  section: { borderTopWidth: 1, borderTopColor: Colors.health.rule },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md, paddingVertical: Spacing.lg, minHeight: Spacing.xxl + Spacing.lg },
  headingGroup: { flex: 1 },
  title: { color: Colors.health.ink, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: Typography.weights.headline },
  summary: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
  glyph: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.title, lineHeight: Typography.lineHeights.h3 },
  body: { paddingBottom: Spacing.xl },
});
