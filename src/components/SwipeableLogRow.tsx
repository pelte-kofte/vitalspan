import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography } from '../theme';
import { ExerciseLogEntry, ExerciseIntensity } from '../data/exercises';

const SWIPE_THRESHOLD = 80;

const INTENSITY_DOT: Record<ExerciseIntensity, string> = {
  easy: Colors.status.optimal,
  moderate: Colors.status.review,
  hard: Colors.status.critical,
};

interface SwipeableLogRowProps {
  log: ExerciseLogEntry;
  onDelete: (id: string) => void;
  showBorder: boolean;
}

export function SwipeableLogRow({ log, onDelete, showBorder }: SwipeableLogRowProps) {
  const translateX = useSharedValue(0);

  function triggerDelete() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => null);
    onDelete(log.id);
  }

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 999])
    .onUpdate(e => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd(() => {
      if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(triggerDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / SWIPE_THRESHOLD),
  }));

  const dotColor = log.intensity ? INTENSITY_DOT[log.intensity] : Colors.status.optimal;

  return (
    <View style={[s.container, showBorder && s.border]}>
      {/* Red delete zone revealed as user swipes left */}
      <Animated.View style={[s.deleteZone, deleteOpacity]}>
        <Text style={s.deleteText}>Delete</Text>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[s.row, rowStyle]}>
          <View style={s.left}>
            <Text style={s.name}>{log.exerciseName}</Text>
            <Text style={s.meta}>
              {log.category}
              {log.sets ? ` · ${log.sets}×${log.reps}` : ''}
              {log.durationMin ? ` · ${log.durationMin}min` : ''}
            </Text>
          </View>
          <View style={[s.dot, { backgroundColor: dotColor }]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const s = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: Colors.surface },
  border: { borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  deleteZone: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.status.critical,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: Spacing.base,
  },
  deleteText: { color: Colors.surface, fontWeight: '600', fontSize: Typography.sizes.base },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  left: { flex: 1 },
  name: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.onSurface },
  meta: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, marginTop: 2 /* intentional — no Spacing.* equivalent */ },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.status.optimal },
});
