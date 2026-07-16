import React, { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Spacing, Typography } from '../../theme';
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
        <Text style={s.glyph}>{open ? '−' : '+'}</Text>
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
