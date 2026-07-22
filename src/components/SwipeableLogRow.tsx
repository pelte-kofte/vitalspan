import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

function formatLogDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface SwipeableLogRowProps {
  log: ExerciseLogEntry;
  onDelete: (id: string) => void;
  onEdit?: (log: ExerciseLogEntry) => void;
  showBorder: boolean;
}

export function SwipeableLogRow({ log, onDelete, onEdit, showBorder }: SwipeableLogRowProps) {
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

  const dotColor = log.intensity ? INTENSITY_DOT[log.intensity] : Colors.dark.textMuted;

  const setsMetaSegment = log.setsData && log.setsData.length > 0
    ? ` · ${log.setsData.length}×${log.setsData[0]?.reps ?? ''}${log.setsData[0]?.weightKg ? ` @ ${log.setsData[0].weightKg}kg` : ''}`
    : log.sets ? ` · ${log.sets}×${log.reps}` : '';

  return (
    <View style={[s.container, showBorder && s.border]}>
      {/* Red delete zone revealed as user swipes left */}
      <Animated.View style={[s.deleteZone, deleteOpacity]}>
        <Text style={s.deleteText}>Delete</Text>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[s.row, rowStyle]}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => { if (onEdit) onEdit(log); }}
            style={s.rowInner}
          >
            <View style={s.left}>
              <Text style={s.name}>{log.exerciseName}</Text>
              <Text style={s.meta}>
                {formatLogDate(log.date)}
                {` · ${log.category}`}
                {setsMetaSegment}
                {log.durationMin ? ` · ${log.durationMin}min` : ''}
              </Text>
            </View>
            <View style={[s.dot, { backgroundColor: dotColor }]} />
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const s = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: Colors.dark.bgCard },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.dark.border },
  deleteZone: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.status.critical,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: Spacing.base,
  },
  deleteText: { color: Colors.dark.text, fontWeight: '600', fontSize: Typography.sizes.base },
  row: {
    backgroundColor: Colors.dark.bgCard,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  left: { flex: 1 },
  name: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.dark.text },
  meta: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: 2 /* intentional — no Spacing.* equivalent */ },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.status.optimal },
});
