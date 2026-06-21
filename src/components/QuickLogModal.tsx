import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  Exercise, ExerciseIntensity, ExerciseLogEntry, SetRecord, CATEGORY_MET,
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
  const [repsPerSet, setRepsPerSet] = useState('10');
  const [weightKg, setWeightKg] = useState('');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [dateMode, setDateMode] = useState<'today' | 'yesterday'>('today');
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
      setRepsPerSet('10');
      setWeightKg('');
      setDuration('30');
      setNotes('');
      setDateMode('today');
    }
  }, [exercise?.id]);

  if (!exercise) return null;

  const isCardio = exercise.category === 'Cardio';

  async function handleSave() {
    if (!exercise) return;
    const setsNum = Math.min(parseInt(sets) || 1, 20);
    const repsNum = parseInt(repsPerSet.replace(',', '.')) || 0;
    const weightNum = parseFloat(weightKg.replace(',', '.')) || undefined;
    const setsData: SetRecord[] = Array(setsNum).fill({ reps: repsNum, weightKg: weightNum });
    const durationNum = parseInt(duration) || 0;
    const logDate = dateMode === 'yesterday'
      ? (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); })()
      : new Date().toISOString().slice(0, 10);
    const entry: ExerciseLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      date: logDate,
      sets: isCardio ? undefined : setsNum,
      reps: isCardio ? undefined : parseInt(reps) || undefined,
      durationMin: durationNum > 0 ? durationNum : undefined,
      intensity: undefined,
      caloriesEstimated: undefined,
      notes: notes.trim() || undefined,
      setsData: isCardio ? undefined : setsData,
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
      <KeyboardAvoidingView
        style={s.kavContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <View style={s.sheet}>
        <View style={s.sheetHandle} />
        <Text style={s.sheetTitle}>{exercise.name}</Text>
        <Text style={s.sheetCat}>{exercise.category} · {exercise.equipment}</Text>

        <View style={s.dateRow}>
          {(['today', 'yesterday'] as const).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[s.dateChip, dateMode === mode && s.dateChipActive]}
              onPress={() => setDateMode(mode)}
            >
              <Text style={[s.dateChipTxt, dateMode === mode && s.dateChipTxtActive]}>
                {mode === 'today' ? 'Today' : 'Yesterday'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.logFields}>
          {!isCardio && (
            <>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Sets</Text>
                <TextInput style={s.fieldInput} value={sets} onChangeText={setSets} keyboardType="numeric" selectTextOnFocus />
              </View>
              <View style={[s.fieldRow, s.fieldRowBorder]}>
                <Text style={s.fieldLabel}>Reps / set</Text>
                <TextInput style={s.fieldInput} value={repsPerSet} onChangeText={setRepsPerSet} keyboardType="decimal-pad" selectTextOnFocus />
              </View>
              <View style={[s.fieldRow, s.fieldRowBorder]}>
                <Text style={s.fieldLabel}>Weight (kg)</Text>
                <TextInput
                  style={s.fieldInput}
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="decimal-pad"
                  placeholder="optional"
                  placeholderTextColor={Colors.onSurfaceMuted}
                />
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
              placeholderTextColor={Colors.onSurfaceMuted}
            />
          </View>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnTxt}>Log Exercise ✓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
          <Text style={s.cancelBtnTxt}>Cancel</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  kavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.base,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: { fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.onSurface, marginBottom: 4 /* intentional — no Spacing.* equivalent */ },
  sheetCat: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, marginBottom: Spacing.base },
  logFields: {
    backgroundColor: Colors.surface,
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
  fieldRowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.borderLight },
  fieldLabel: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
  fieldInput: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.onSurface,
    textAlign: 'right',
    minWidth: 64,
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
  cancelBtnTxt: { fontSize: Typography.sizes.base, color: Colors.onSurfaceMuted },
  dateRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  dateChip: { flex: 1, paddingVertical: 8, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.borderLight, alignItems: 'center', backgroundColor: Colors.surface },
  dateChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  dateChipTxt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  dateChipTxtActive: { color: Colors.primaryDark, fontWeight: '600' },
});
