import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import BioAgeSpherePreview from './BioAgeSpherePreview';

interface Props {
  onClose: () => void;
}

/**
 * Compact paywall header. The price cards below are this screen's hero —
 * the sphere is a small brand mark (BioAgeSpherePreview, the sanctioned
 * compact sphere), not a full-screen set piece. Deliberately no NeuralGrid
 * and no screen-level gradient (DESIGN_SYSTEM.md motif + editorial rules).
 */
export default function PaywallHero({ onClose }: Props) {
  return (
    <View>
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.closeBtn}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={s.closeTxt}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={s.heroBlock}>
        <BioAgeSpherePreview size={128} dimmed={false} />
        <Text style={s.headline}>Know your biological age.</Text>
        <Text style={s.subline}>
          Built by a pharmacist. Grounded in published evidence — no hype.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.base,
  },
  closeBtn: {
    padding: Spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: { color: Colors.dark.text, fontSize: 22 },
  heroBlock: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  headline: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.h2,
    fontWeight: '500',
    lineHeight: Typography.lineHeights.h2,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  subline: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
