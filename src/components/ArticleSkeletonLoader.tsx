import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../theme';
import { SkeletonBlock, SkeletonPulse } from './Skeleton';

export function SkeletonLoader() {
  return (
    <SkeletonPulse style={{ gap: 10, paddingTop: Spacing.base }}>
      <View style={s.heroCard}>
        <View style={s.accentBar} />
        <View style={s.heroContent}>
          <SkeletonBlock w={64} h={18} /><SkeletonBlock w="90%" h={16} /><SkeletonBlock w="70%" h={16} />
          <SkeletonBlock w="50%" h={12} /><SkeletonBlock w="95%" h={12} />
        </View>
      </View>
      {[0, 1].map((i) => (
        <View key={i} style={s.stdCard}>
          <View style={s.row}><SkeletonBlock w="55%" h={11} /><SkeletonBlock w={50} h={11} /></View>
          <SkeletonBlock w="90%" h={14} /><SkeletonBlock w="75%" h={14} /><SkeletonBlock w="90%" h={11} />
        </View>
      ))}
    </SkeletonPulse>
  );
}

const CARD_BG = Colors.dark.cardBg;
const CARD_BORDER = Colors.dark.cardBorder;

const s = StyleSheet.create({
  heroCard: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: CARD_BORDER,
    marginHorizontal: Spacing.base,
    overflow: 'hidden',
    minHeight: 180,
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: Colors.dark.bgElevated,
  },
  heroContent: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    gap: 6,
  },
  stdCard: {
    backgroundColor: CARD_BG,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: CARD_BORDER,
    marginHorizontal: Spacing.base,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
