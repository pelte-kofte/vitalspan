import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { Exercise } from '../data/exercises';
import * as ExerciseIllustrations from './exercise-illustrations';

export interface RoutineCardProps {
  exercise: Exercise;
  index: number;
  lastSession: string | null;
  trendBadge: '↑' | '–' | '↓' | null;
  trendColor: string;
  onPress: () => void;
  onRemove: () => void;
  dragHandle?: React.ReactNode;
}

export default function RoutineCard({
  exercise,
  lastSession,
  trendBadge,
  trendColor,
  onPress,
  onRemove,
  dragHandle,
}: RoutineCardProps) {
  const IllustComp = exercise.illustrationId
    ? (ExerciseIllustrations as Record<string, React.ComponentType<{ size?: number }>>)[exercise.illustrationId]
    : null;

  const photoUrl = exercise.photoKey
    ? `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${exercise.photoKey}/0.jpg`
    : null;

  return (
    <View style={s.wrapper}>
      {dragHandle}
      <TouchableOpacity
        style={s.card}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {/* Thumbnail */}
        <View style={s.thumb}>
          {photoUrl ? (
            <Image source={photoUrl} style={s.thumbImg} contentFit="cover" />
          ) : IllustComp ? (
            <IllustComp size={36} />
          ) : (
            <View style={s.thumbPlaceholder} />
          )}
        </View>

        {/* Info */}
        <View style={s.info}>
          <Text style={s.name} numberOfLines={1}>{exercise.name}</Text>
          <Text style={s.meta}>{exercise.category} · {exercise.equipment}</Text>
          {lastSession ? (
            <Text style={s.lastSession}>{lastSession}</Text>
          ) : null}
        </View>

        {/* Right: trend + remove */}
        <View style={s.right}>
          {trendBadge ? (
            <Text style={[s.trendBadge, { color: trendColor }]}>{trendBadge}</Text>
          ) : null}
          <TouchableOpacity
            onPress={onRemove}
            style={s.removeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={s.removeBtnTxt}>×</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.bgCard,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.dark.inputBg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImg: { width: 44, height: 44 },
  thumbPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: Colors.dark.inputBg,
  },
  info: { flex: 1 },
  name: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  meta: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  lastSession: {
    fontSize: Typography.sizes.sm,
    color: Colors.dark.ctaPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  right: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trendBadge: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  },
  removeBtn: { padding: Spacing.xs },
  removeBtnTxt: {
    fontSize: Typography.sizes.lg,
    color: Colors.status.critical,
    fontWeight: '700',
  },
});
