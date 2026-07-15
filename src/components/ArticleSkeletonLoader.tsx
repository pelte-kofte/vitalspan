import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../hooks/useReducedMotion';
import { EditorialColors, EditorialLayout } from '../theme/editorial';
import { SkeletonBlock, SkeletonPulse } from './Skeleton';

export function SkeletonLoader() {
  const reduceMotion = useReducedMotion();
  const content = (
    <>
      <View style={s.masthead}>
        <SkeletonBlock w={120} h={8} />
        <SkeletonBlock w="78%" h={25} />
        <SkeletonBlock w={170} h={8} />
      </View>
      <View style={s.hero}>
        <View style={s.heroCopy}>
          <SkeletonBlock w={84} h={9} />
          <SkeletonBlock w="88%" h={32} />
          <SkeletonBlock w="72%" h={32} />
          <SkeletonBlock w={150} h={12} />
          <SkeletonBlock w={132} h={38} radius={0} />
        </View>
      </View>
      <View style={s.listHeading}>
        <SkeletonBlock w={74} h={8} />
        <SkeletonBlock w={142} h={27} />
      </View>
      {[0, 1, 2].map((index) => (
        <View key={index} style={s.row}>
          <SkeletonBlock w={20} h={10} />
          <View style={s.rowCopy}>
            <SkeletonBlock w="94%" h={18} />
            <SkeletonBlock w="74%" h={18} />
            <SkeletonBlock w="88%" h={11} />
            <SkeletonBlock w="52%" h={9} />
          </View>
        </View>
      ))}
    </>
  );

  if (reduceMotion) return <View style={s.container}>{content}</View>;
  return <SkeletonPulse style={s.container}>{content}</SkeletonPulse>;
}

const s = StyleSheet.create({
  container: { flex: 1, gap: 28, paddingTop: 4 },
  masthead: {
    marginHorizontal: EditorialLayout.pageInset,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: EditorialColors.rule,
  },
  hero: {
    height: 420,
    marginHorizontal: 12,
    borderRadius: EditorialLayout.heroRadius,
    backgroundColor: EditorialColors.surface,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroCopy: { padding: 22, gap: 13 },
  listHeading: { marginHorizontal: EditorialLayout.pageInset, gap: 8 },
  row: {
    marginHorizontal: EditorialLayout.pageInset,
    paddingVertical: 18,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: EditorialColors.rule,
  },
  rowCopy: { flex: 1, gap: 8 },
});
