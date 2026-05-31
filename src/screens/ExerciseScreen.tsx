import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
  Modal, TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography, Elevation } from '../theme';
import {
  EXERCISES, EXERCISE_CATEGORIES, Exercise, ExerciseCategory, ExerciseLogEntry,
  ExerciseIntensity, CATEGORY_MET,
} from '../data/exercises';

const CATEGORY_EMOJI: Record<string, string> = {
  'Cardio':     '🏃',
  'Legs':       '🦵',
  'Push':       '💪',
  'Pull / Row': '🔙',
  'Core':       '🔥',
  'Shoulders':  '🏋️',
  'Arms':       '💪',
  'Calves':     '🦶',
};

const EQUIPMENT_SHORT: Record<string, string> = {
  'body weight':    'BW',
  'dumbbell':       'DB',
  'barbell':        'BB',
  'kettlebell':     'KB',
  'resistance band':'Band',
  'cable':          'Cable',
};

function equipShort(eq: string): string {
  return EQUIPMENT_SHORT[eq] ?? eq.split(' ').map(w => w[0].toUpperCase()).join('');
}

const INTENSITY_OPTIONS: { key: ExerciseIntensity; label: string; met_mult: number }[] = [
  { key: 'easy',     label: 'Easy',     met_mult: 0.8 },
  { key: 'moderate', label: 'Moderate', met_mult: 1.0 },
  { key: 'hard',     label: 'Hard',     met_mult: 1.3 },
];

function estimateCalories(category: string, durationMin: number, intensity: ExerciseIntensity, weightKg = 75): number {
  const met = (CATEGORY_MET[category] ?? 5.0) * (INTENSITY_OPTIONS.find(i => i.key === intensity)?.met_mult ?? 1);
  return Math.round(met * weightKg * (durationMin / 60));
}

interface QuickLogModalProps {
  exercise: Exercise;
  onClose: () => void;
  onSave: (entry: Omit<ExerciseLogEntry, 'id' | 'loggedAt'>) => void;
  userWeightKg?: number;
}

function QuickLogModal({ exercise, onClose, onSave, userWeightKg }: QuickLogModalProps) {
  const isCardio = exercise.category === 'Cardio';
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState<ExerciseIntensity>('moderate');
  const [notes, setNotes] = useState('');

  const durationNum = parseInt(duration) || 0;
  const calories = durationNum > 0
    ? estimateCalories(exercise.category, durationNum, intensity, userWeightKg ?? 75)
    : 0;

  function handleSave() {
    const entry: Omit<ExerciseLogEntry, 'id' | 'loggedAt'> = {
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
    };
    onSave(entry);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    onClose();
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
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
            <TextInput style={[s.fieldInput, { flex: 1 }]} value={notes} onChangeText={setNotes} placeholder="Optional notes" placeholderTextColor={Colors.Beige.textMuted} />
          </View>
        </View>

        {/* Intensity picker */}
        <Text style={s.intensityLabel}>Intensity</Text>
        <View style={s.intensityRow}>
          {INTENSITY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[s.intensityChip, intensity === opt.key && s.intensityChipActive]}
              onPress={() => { setIntensity(opt.key); Haptics.selectionAsync().catch(() => null); }}
            >
              <Text style={[s.intensityTxt, intensity === opt.key && s.intensityTxtActive]}>{opt.label}</Text>
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

export default function ExerciseScreen() {
  const [selectedCat, setSelectedCat] = useState<ExerciseCategory | 'All'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logModal, setLogModal] = useState<Exercise | null>(null);
  const [logs, setLogs] = useState<ExerciseLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userWeightKg, setUserWeightKg] = useState<number | undefined>(undefined);

  const loadLogs = useCallback(() => {
    return Promise.all([
      AsyncStorage.getItem('@vitalspan_exercise_log'),
      AsyncStorage.getItem('@vitalspan_user_profile'),
    ])
      .then(([rawLogs, rawProfile]) => {
        if (rawLogs) setLogs(JSON.parse(rawLogs));
        if (rawProfile) {
          const p = JSON.parse(rawProfile);
          if (p.weightKg) setUserWeightKg(p.weightKg);
        }
      })
      .catch(console.error);
  }, []);

  useFocusEffect(useCallback(() => { loadLogs(); }, [loadLogs]));
  useFocusEffect(useCallback(() => { setStatusBarStyle('dark'); return () => {}; }, []));

  async function handleRefresh() {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  }

  async function saveLog(entry: Omit<ExerciseLogEntry, 'id' | 'loggedAt'>) {
    const full: ExerciseLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      loggedAt: new Date().toISOString(),
    };
    const updated = [full, ...logs];
    setLogs(updated);
    await AsyncStorage.setItem('@vitalspan_exercise_log', JSON.stringify(updated)).catch(console.error);
  }

  async function deleteLog(id: string) {
    Alert.alert('Delete entry', 'Remove this log entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = logs.filter(l => l.id !== id);
          setLogs(updated);
          await AsyncStorage.setItem('@vitalspan_exercise_log', JSON.stringify(updated)).catch(console.error);
        },
      },
    ]);
  }

  const filtered = useMemo(() =>
    selectedCat === 'All' ? EXERCISES : EXERCISES.filter(e => e.category === selectedCat),
  [selectedCat]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogs = useMemo(() => logs.filter(l => l.date === todayStr), [logs, todayStr]);

  const todayTotals = useMemo(() => {
    const totalMin = todayLogs.reduce((sum, l) => sum + (l.durationMin ?? 0), 0);
    const totalCal = todayLogs.reduce((sum, l) => sum + (l.caloriesEstimated ?? 0), 0);
    return { totalMin, totalCal, count: todayLogs.length };
  }, [todayLogs]);

  function toggleExpand(id: string) {
    Haptics.selectionAsync().catch(() => null);
    setExpandedId(prev => (prev === id ? null : id));
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <View>
          <Text style={s.title}>Exercise</Text>
          <Text style={s.subtitle}>Longevity movement library</Text>
        </View>
        {todayLogs.length > 0 && (
          <View style={s.todayPill}>
            <Text style={s.todayPillTxt}>{todayLogs.length} today</Text>
          </View>
        )}
      </View>

      {/* Today's activity summary card */}
      <View style={s.activityCard}>
        <Text style={s.activityLabel}>TODAY'S ACTIVITY</Text>
        {todayTotals.count > 0 ? (
          <View style={s.activityRow}>
            <View style={s.activityStat}>
              <Text style={s.activityStatVal}>{todayTotals.count}</Text>
              <Text style={s.activityStatLbl}>exercises</Text>
            </View>
            <View style={s.activityDivider} />
            <View style={s.activityStat}>
              <Text style={s.activityStatVal}>{todayTotals.totalMin}</Text>
              <Text style={s.activityStatLbl}>minutes</Text>
            </View>
            <View style={s.activityDivider} />
            <View style={s.activityStat}>
              <Text style={s.activityStatVal}>{todayTotals.totalCal}</Text>
              <Text style={s.activityStatLbl}>kcal est.</Text>
            </View>
          </View>
        ) : (
          <Text style={s.activityEmpty}>Log a workout below to track today's movement</Text>
        )}
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabsScroll}
        style={s.tabsBar}
      >
        <TouchableOpacity
          style={[s.tab, selectedCat === 'All' && s.tabActive]}
          onPress={() => { setSelectedCat('All'); Haptics.selectionAsync().catch(() => null); }}
        >
          <Text style={[s.tabTxt, selectedCat === 'All' && s.tabTxtActive]}>All</Text>
        </TouchableOpacity>
        {EXERCISE_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[s.tab, selectedCat === cat && s.tabActive]}
            onPress={() => { setSelectedCat(cat); Haptics.selectionAsync().catch(() => null); }}
          >
            <Text style={[s.tabTxt, selectedCat === cat && s.tabTxtActive]}>
              {CATEGORY_EMOJI[cat]} {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Motivating empty state — shown when no logs at all */}
        {logs.length === 0 && (
          <View style={s.emptyStateCard}>
            <Text style={s.emptyStateIcon}>🏃</Text>
            <Text style={s.emptyStateHeadline}>Move daily. Live longer.</Text>
            <Text style={s.emptyStateBody}>
              Log your first workout to start tracking your movement. Consistency compounds — even a 20-minute walk counts.
            </Text>
            <TouchableOpacity
              style={s.emptyStateCta}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
                setLogModal(EXERCISES[0]);
              }}
              activeOpacity={0.82}
            >
              <Text style={s.emptyStateCtaTxt}>Log a Workout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's log */}
        {todayLogs.length > 0 && (
          <>
            <Text style={s.sectionLabel}>Logged today</Text>
            <View style={s.card}>
              {todayLogs.map((log, i) => (
                <TouchableOpacity
                  key={log.id}
                  style={[s.logRow, i < todayLogs.length - 1 && s.rowBorder]}
                  onLongPress={() => deleteLog(log.id)}
                >
                  <View style={s.logLeft}>
                    <Text style={s.logName}>{log.exerciseName}</Text>
                    <Text style={s.logMeta}>
                      {log.category}
                      {log.sets ? ` · ${log.sets}×${log.reps}` : ''}
                      {log.durationMin ? ` · ${log.durationMin}min` : ''}
                    </Text>
                  </View>
                  <View style={s.logDot} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={s.sectionLabel}>
          {selectedCat === 'All' ? 'All exercises' : selectedCat} · {filtered.length}
        </Text>

        <View style={s.card}>
          {filtered.map((ex, i) => {
            const isExpanded = expandedId === ex.id;
            return (
              <View key={ex.id} style={i < filtered.length - 1 && s.rowBorder}>
                <TouchableOpacity
                  style={s.exerciseRow}
                  onPress={() => toggleExpand(ex.id)}
                  activeOpacity={0.75}
                >
                  <View style={s.exLeft}>
                    <Text style={s.exName}>{ex.name}</Text>
                    <View style={s.exMeta}>
                      <View style={s.equipChip}>
                        <Text style={s.equipChipTxt}>{equipShort(ex.equipment)}</Text>
                      </View>
                      <Text style={s.exTarget}>{ex.target}</Text>
                    </View>
                  </View>
                  <View style={s.exRight}>
                    <TouchableOpacity
                      style={s.logBtn}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
                        setLogModal(ex);
                      }}
                    >
                      <Text style={s.logBtnTxt}>+ Log</Text>
                    </TouchableOpacity>
                    <Text style={s.chevron}>{isExpanded ? '▲' : '▼'}</Text>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={s.expandedContent}>
                    {ex.secondaryMuscles.length > 0 && (
                      <Text style={s.musclesTxt}>
                        Also works: {ex.secondaryMuscles.join(', ')}
                      </Text>
                    )}
                    <Text style={s.instructionsTxt}>{ex.instructions}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {logModal && (
        <QuickLogModal
          exercise={logModal}
          onClose={() => setLogModal(null)}
          onSave={saveLog}
          userWeightKg={userWeightKg}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.Beige.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: Spacing.base,
    paddingTop: Spacing.md,
  },
  title: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.Beige.text },
  subtitle: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginTop: 2 },
  todayPill: {
    backgroundColor: Colors.status.optimalBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  todayPillTxt: { fontSize: Typography.sizes.xs, color: Colors.status.optimalText, fontWeight: '600' },

  tabsBar: { maxHeight: 44 },
  tabsScroll: { paddingHorizontal: Spacing.base, gap: 8, paddingBottom: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.Beige.card,
    borderWidth: 1,
    borderColor: Colors.Beige.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabTxt: { fontSize: Typography.sizes.sm, color: Colors.Beige.textSecondary, fontWeight: '500' },
  tabTxtActive: { color: Colors.primaryBg, fontWeight: '600' },

  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.Beige.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.Beige.card,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.Beige.border,
    ...Elevation.sm,
    overflow: 'hidden',
  },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.Beige.divider },

  // Exercise row
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  exLeft: { flex: 1 },
  exName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.Beige.text, marginBottom: 4 },
  exMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  equipChip: {
    backgroundColor: Colors.Beige.bgShade,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  equipChipTxt: { fontSize: 10, fontWeight: '600', color: Colors.Beige.textMuted },
  exTarget: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted },
  exRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
  },
  logBtnTxt: { fontSize: 11, fontWeight: '600', color: Colors.primaryBg },
  chevron: { fontSize: 10, color: Colors.Beige.textMuted },

  // Expanded
  expandedContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 6,
  },
  musclesTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '500' },
  instructionsTxt: { fontSize: Typography.sizes.sm, color: Colors.Beige.textSecondary, lineHeight: 20 },

  // Today log
  logRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  logLeft: { flex: 1 },
  logName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.Beige.text },
  logMeta: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginTop: 2 },
  logDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.status.optimal },

  // Today's activity card
  activityCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.Beige.card,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.Beige.border,
    ...Elevation.sm,
    padding: Spacing.md,
  },
  activityLabel: { fontSize: 11, fontWeight: '600', color: Colors.Beige.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.sm },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityStat: { flex: 1, alignItems: 'center' },
  activityStatVal: { fontSize: 24, fontWeight: '600', color: Colors.Beige.text, lineHeight: 28 },
  activityStatLbl: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginTop: 2 },
  activityDivider: { width: 0.5, height: 32, backgroundColor: Colors.Beige.divider },
  activityEmpty: { fontSize: Typography.sizes.sm, color: Colors.Beige.textMuted },

  // Empty state
  emptyStateCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.Beige.card,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.Beige.border,
    ...Elevation.sm,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyStateHeadline: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.Beige.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  emptyStateBody: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.Beige.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  emptyStateCta: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    minHeight: 44,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  emptyStateCtaTxt: {
    color: Colors.Beige.card,
    fontSize: 14,
    fontWeight: '600',
  },

  // Intensity picker
  intensityLabel: { fontSize: 11, fontWeight: '600', color: Colors.Beige.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.sm, marginTop: Spacing.md },
  intensityRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  intensityChip: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.Beige.bgShade, borderWidth: 1, borderColor: Colors.Beige.border, alignItems: 'center' },
  intensityChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  intensityTxt: { fontSize: Typography.sizes.sm, fontWeight: '500', color: Colors.Beige.textMuted },
  intensityTxtActive: { color: Colors.primary, fontWeight: '600' },
  calEstimate: { fontSize: Typography.sizes.sm, color: Colors.primaryLight, fontWeight: '500', textAlign: 'center', marginBottom: Spacing.sm },

  // Quick log modal
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
