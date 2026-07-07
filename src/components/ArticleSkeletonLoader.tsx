import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, DimensionValue } from 'react-native';
import { Colors, Spacing, Radius } from '../theme';

function Blk({ w, h }: { w: DimensionValue; h: number }) {
  return <View style={[s.block, { width: w, height: h }]} />;
}

export function SkeletonLoader() {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View style={{ opacity: anim, gap: 10, paddingTop: Spacing.base }}>
      <View style={s.heroCard}>
        <View style={s.accentBar} />
        <View style={s.heroContent}>
          <Blk w={64} h={18} /><Blk w="90%" h={16} /><Blk w="70%" h={16} />
          <Blk w="50%" h={12} /><Blk w="95%" h={12} />
        </View>
      </View>
      {[0, 1].map((i) => (
        <View key={i} style={s.stdCard}>
          <View style={s.row}><Blk w="55%" h={11} /><Blk w={50} h={11} /></View>
          <Blk w="90%" h={14} /><Blk w="75%" h={14} /><Blk w="90%" h={11} />
        </View>
      ))}
    </Animated.View>
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
  block: {
    borderRadius: 4,
    backgroundColor: Colors.dark.bgElevated,
  },
});
