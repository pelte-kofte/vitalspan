import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  Exercise, ExerciseIntensity, ExerciseLogEntry, CATEGORY_MET,
} from '../data/exercises';
import { Colors, Spacing, Radius, Typography } from '../theme';

export interface QuickLogModalProps {
  exercise: Exercise | null;
  visible: boolean;
  onClose: () => void;
}

export const INTENSITY_OPTIONS: { key: ExerciseIntensity; label: string; met_mult: number }[] = [
  { key: 'easy',     label: 'Easy',     met_mult: 0.8 },
  { key: 'moderate', label: 'Moderate', met_mult: 1.0 },
  { key: 'hard',     label: 'Hard',     met_mult: 1.3 },
];

export const INTENSITY_COLORS: Record<ExerciseIntensity, { bg: string; border: string; text: string }> = {
  easy:     { bg: Colors.status.optimalBg,  border: Colors.status.optimalBorder,  text: Colors.status.optimalText },
  moderate: { bg: Colors.status.reviewBg,   border: Colors.status.reviewBorder,   text: Colors.status.reviewText },
  hard:     { bg: Colors.status.criticalBg, border: Colors.status.criticalBorder, text: Colors.status.criticalText },
};

export function estimateCalories(
  category: string,
  durationMin: number,
  intensity: ExerciseIntensity,
  weightKg = 75,
): number {
  const met = (CATEGORY_MET[category] ?? 5.0) * (INTENSITY_OPTIONS.find(i => i.key === intensity)?.met_mult ?? 1);
  return Math.round(met * weightKg * (durationMin / 60));
}

export default function QuickLogModal({ exercise, visible, onClose }: QuickLogModalProps) {
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState<ExerciseIntensity>('moderate');
  const [notes, setNotes] = useState('');
  const [userWeightKg, setUserWeightKg] = useState<number>(75);

  useEffect(() => {
    AsyncStorage.getItem('@vitalspan_user_profile').then(raw => {
      if (raw) {
        const p = JSON.parse(raw) as { weightKg?: number };
        if (p.weightKg) setUserWeightKg(p.weightKg);
      }
    }).catch(() => null);
  }, []);

  useEffect(() => {
    if (exercise) {
      setSets('3');
      setReps('12');
      setDuration('30');
      setIntensity('moderate');
      setNotes('');
    }
  }, [exercise?.id]);

  if (!exercise) return null;

  const isCardio = exercise.category === 'Cardio';
  const durationNum = parseInt(duration) || 0;
  const calories = durationNum > 0
    ? estimateCalories(exercise.category, durationNum, intensity, userWeightKg)
    : 0;

  async function handleSave() {
    if (!exercise) return;
    const entry: ExerciseLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      date: new Date().toISOString().slice(0, 10),
      sets: isCardio ? undefined : parseInt(sets) || undefined,
      reps: isCardio ? undefined : parseInt(reps) || undefined,
      durationMin: durationNum > 0 ? durationNum : undefined,
      intensity,
      caloriesEstimated: durationNum > 0 ? calories : undefined,
      notes: notes.trim() || undefined,
      loggedAt: new Date().toISOString(),
    };
    try {
      const raw = await AsyncStorage.getItem('@vitalspan_exercise_log');
      const existing: ExerciseLogEntry[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem('@vitalspan_exercise_log', JSON.stringify([entry, ...existing]));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
      onClose();
    } catch (err) {
      console.error('[QuickLogModal] save failed', err);
      Alert.alert('Save failed', 'Could not save your workout. Please try again.');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.sheetHandle} />
        <Text style={s.sheetTitle}>{exercise.name}</Text>
        <Text style={s.sheetCat}>{exercise.category} · {exercise.equipment}</Text>

        <View style={s.logFields}>
          {!isCardio && (
            <>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Sets</Text>
                <TextInput style={s.fieldInput} value={sets} onChangeText={setSets} keyboardType="numeric" selectTextOnFocus />
              </View>
              <View style={[s.fieldRow, s.fieldRowBorder]}>
                <Text style={s.fieldLabel}>Reps</Text>
                <TextInput style={s.fieldInput} value={reps} onChangeText={setReps} keyboardType="numeric" selectTextOnFocus />
              </View>
            </>
          )}
          <View style={[s.fieldRow, !isCardio && s.fieldRowBorder]}>
            <Text style={s.fieldLabel}>Duration (min)</Text>
            <TextInput style={s.fieldInput} value={duration} onChangeText={setDuration} keyboardType="numeric" selectTextOnFocus />
          </View>
          <View style={[s.fieldRow, s.fieldRowBorder]}>
            <Text style={s.fieldLabel}>Notes</Text>
            <TextInput
              style={[s.fieldInput, { flex: 1 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={Colors.Beige.textMuted}
            />
          </View>
        </View>

        <Text style={s.intensityLabel}>Intensity</Text>
        <View style={s.intensityRow}>
          {INTENSITY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[
                s.intensityChip,
                intensity === opt.key && {
                  backgroundColor: INTENSITY_COLORS[opt.key].bg,
                  borderColor: INTENSITY_COLORS[opt.key].border,
                },
              ]}
              onPress={() => { setIntensity(opt.key); Haptics.selectionAsync().catch(() => null); }}
            >
              <Text style={[
                s.intensityTxt,
                intensity === opt.key && { color: INTENSITY_COLORS[opt.key].text, fontWeight: '600' },
              ]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {calories > 0 && (
          <Text style={s.calEstimate}>≈ {calories} kcal estimated</Text>
        )}

        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnTxt}>Log Exercise ✓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
          <Text style={s.cancelBtnTxt}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.Beige.card,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.base,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.Beige.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: { fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.Beige.text, marginBottom: 4 },
  sheetCat: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginBottom: Spacing.base },
  logFields: {
    backgroundColor: Colors.Beige.bg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  fieldRowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.Beige.border },
  fieldLabel: { fontSize: Typography.sizes.base, color: Colors.Beige.textSecondary },
  fieldInput: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.Beige.text,
    textAlign: 'right',
    minWidth: 64,
  },
  intensityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.Beige.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  intensityRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  intensityChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.Beige.bgShade,
    borderWidth: 1,
    borderColor: Colors.Beige.border,
    alignItems: 'center',
  },
  intensityTxt: { fontSize: Typography.sizes.sm, fontWeight: '500', color: Colors.Beige.textMuted },
  calEstimate: {
    fontSize: Typography.sizes.sm,
    color: Colors.primaryLight,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: 15,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnTxt: { fontSize: Typography.sizes.base, fontWeight: '700', color: Colors.primaryBg },
  cancelBtn: { padding: Spacing.sm, alignItems: 'center' },
  cancelBtnTxt: { fontSize: Typography.sizes.base, color: Colors.Beige.textMuted },
});
