import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
  Modal, TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import {
  EXERCISES, EXERCISE_CATEGORIES, Exercise, ExerciseCategory, ExerciseLogEntry,
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

interface QuickLogModalProps {
  exercise: Exercise;
  onClose: () => void;
  onSave: (entry: Omit<ExerciseLogEntry, 'id' | 'loggedAt'>) => void;
}

function QuickLogModal({ exercise, onClose, onSave }: QuickLogModalProps) {
  const isCardio = exercise.category === 'Cardio';
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');

  function handleSave() {
    const entry: Omit<ExerciseLogEntry, 'id' | 'loggedAt'> = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      date: new Date().toISOString().slice(0, 10),
      sets: isCardio ? undefined : parseInt(sets) || undefined,
      reps: isCardio ? undefined : parseInt(reps) || undefined,
      durationMin: isCardio ? parseInt(duration) || undefined : undefined,
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
          {isCardio ? (
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Duration (min)</Text>
              <TextInput
                style={s.fieldInput}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                selectTextOnFocus
              />
            </View>
          ) : (
            <>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Sets</Text>
                <TextInput
                  style={s.fieldInput}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
              </View>
              <View style={[s.fieldRow, s.fieldRowBorder]}>
                <Text style={s.fieldLabel}>Reps</Text>
                <TextInput
                  style={s.fieldInput}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
              </View>
            </>
          )}
          <View style={[s.fieldRow, s.fieldRowBorder]}>
            <Text style={s.fieldLabel}>Notes</Text>
            <TextInput
              style={[s.fieldInput, { flex: 1 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={Colors.textMuted}
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
    </Modal>
  );
}

export default function ExerciseScreen() {
  const [selectedCat, setSelectedCat] = useState<ExerciseCategory | 'All'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logModal, setLogModal] = useState<Exercise | null>(null);
  const [logs, setLogs] = useState<ExerciseLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(() => {
    return AsyncStorage.getItem('@vitalspan_exercise_log')
      .then(raw => { if (raw) setLogs(JSON.parse(raw)); })
      .catch(console.error);
  }, []);

  useFocusEffect(useCallback(() => { loadLogs(); }, [loadLogs]));

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
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: Spacing.base,
    paddingTop: Spacing.md,
  },
  title: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
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
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabTxt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  tabTxtActive: { color: Colors.primaryBg, fontWeight: '600' },

  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },

  // Exercise row
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  exLeft: { flex: 1 },
  exName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary, marginBottom: 4 },
  exMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  equipChip: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  equipChipTxt: { fontSize: 10, fontWeight: '600', color: Colors.textMuted },
  exTarget: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  exRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
  },
  logBtnTxt: { fontSize: 11, fontWeight: '600', color: Colors.primaryBg },
  chevron: { fontSize: 10, color: Colors.textMuted },

  // Expanded
  expandedContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 6,
  },
  musclesTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '500' },
  instructionsTxt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },

  // Today log
  logRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  logLeft: { flex: 1 },
  logName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  logMeta: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  logDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.status.optimal },

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
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.base,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: { fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  sheetCat: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginBottom: Spacing.base },
  logFields: {
    backgroundColor: Colors.bg,
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
  fieldRowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.border },
  fieldLabel: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
  fieldInput: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
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
  cancelBtnTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted },
});
