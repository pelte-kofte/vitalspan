import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { setStatusBarStyle } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography, Elevation } from '../theme';
import { RunnerIcon } from '../components/DesignSystemIcons';
import {
  EXERCISE_CATEGORIES, Exercise, ExerciseCategory, ExerciseLogEntry,
} from '../data/exercises';
import { getExercises } from '../lib/exerciseService';
import { SwipeableLogRow } from '../components/SwipeableLogRow';
import QuickLogModal from '../components/QuickLogModal';
import MuscleMapView, { muscleMatches, MUSCLE_REGIONS } from '../components/MuscleMapView';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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

function getMondayStr(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}


export default function ExerciseScreen() {
  const nav = useNavigation<Nav>();
  const [selectedCat, setSelectedCat] = useState<ExerciseCategory | 'All'>('All');
  const [logModal, setLogModal] = useState<Exercise | null>(null);
  const [logs, setLogs] = useState<ExerciseLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [muscleMapOpen, setMuscleMapOpen] = useState(false);
  const [muscleMapView, setMuscleMapView] = useState<'front' | 'back'>('front');

  const loadData = useCallback(() => {
    return Promise.all([
      AsyncStorage.getItem('@vitalspan_exercise_log'),
      getExercises(),
    ]).then(([rawLogs, exs]) => {
      if (rawLogs) setLogs(JSON.parse(rawLogs));
      setExercises(exs);
    }).catch(console.error);
  }, []);

  useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));
  useFocusEffect(useCallback(() => { setStatusBarStyle('dark'); return () => {}; }, []));

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function deleteLog(id: string) {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    await AsyncStorage.setItem('@vitalspan_exercise_log', JSON.stringify(updated)).catch(console.error);
  }

  const filtered = useMemo(() => {
    let result = selectedCat === 'All' ? exercises : exercises.filter(e => e.category === selectedCat);
    if (selectedMuscle) {
      result = result.filter(e =>
        muscleMatches(e.muscleGroup, selectedMuscle) ||
        e.secondaryMuscles.some(m => muscleMatches(m, selectedMuscle))
      );
    }
    return result;
  }, [selectedCat, exercises, selectedMuscle]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const mondayStr = useMemo(() => getMondayStr(new Date()), []);
  const historyStartStr = useMemo(() => {
    const d = new Date(getMondayStr(new Date()));
    d.setDate(d.getDate() - 14);
    return d.toISOString().slice(0, 10);
  }, []);

  const todayLogs = useMemo(() => logs.filter(l => l.date === todayStr), [logs, todayStr]);
  const thisWeekLogs = useMemo(() => logs.filter(l => l.date >= mondayStr && l.date < todayStr), [logs, mondayStr, todayStr]);
  const historyLogs = useMemo(() => logs.filter(l => l.date >= historyStartStr && l.date < mondayStr), [logs, historyStartStr, mondayStr]);

  const todayTotals = useMemo(() => ({
    totalMin: todayLogs.reduce((sum, l) => sum + (l.durationMin ?? 0), 0),
    totalCal: todayLogs.reduce((sum, l) => sum + (l.caloriesEstimated ?? 0), 0),
    count: todayLogs.length,
  }), [todayLogs]);

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
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Muscle map filter toggle button */}
      <TouchableOpacity
        style={s.muscleFilterToggle}
        onPress={() => {
          Haptics.selectionAsync().catch(() => null);
          setMuscleMapOpen(prev => !prev);
        }}
        activeOpacity={0.75}
      >
        <Text style={s.muscleFilterToggleTxt}>
          {selectedMuscle
            ? `Muscle: ${MUSCLE_REGIONS.find(r => r.id === selectedMuscle)?.label ?? selectedMuscle}`
            : 'Muscle Group Filter'}
        </Text>
        <Text style={s.muscleFilterChevron}>{muscleMapOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Collapsible muscle map filter panel */}
      {muscleMapOpen && (
        <View style={s.muscleFilterPanel}>
          <MuscleMapView
            interactive={true}
            view={muscleMapView}
            onViewToggle={() => setMuscleMapView(v => v === 'front' ? 'back' : 'front')}
            onMusclePress={(regionId) => {
              Haptics.selectionAsync().catch(() => null);
              setSelectedMuscle(prev => prev === regionId ? null : regionId);
            }}
            primaryMuscles={selectedMuscle ? [selectedMuscle] : []}
            secondaryMuscles={[]}
          />
          {selectedMuscle && (
            <TouchableOpacity
              style={s.clearFilterBtn}
              onPress={() => { Haptics.selectionAsync().catch(() => null); setSelectedMuscle(null); }}
              activeOpacity={0.75}
            >
              <Text style={s.clearFilterTxt}>
                Clear filter: {MUSCLE_REGIONS.find(r => r.id === selectedMuscle)?.label ?? selectedMuscle}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
            <RunnerIcon color={Colors.onSurfaceMuted} size={48} />
            <Text style={s.emptyStateHeadline}>Move daily. Live longer.</Text>
            <Text style={s.emptyStateBody}>
              Log your first workout to start tracking your movement. Consistency compounds — even a 20-minute walk counts.
            </Text>
            <TouchableOpacity
              style={s.emptyStateCta}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
                setLogModal(exercises[0] ?? null);
              }}
              activeOpacity={0.82}
            >
              <Text style={s.emptyStateCtaTxt}>Log a Workout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today section */}
        {todayLogs.length > 0 && (
          <>
            <Text style={s.sectionLabel}>Today</Text>
            <View style={s.card}>
              {todayLogs.map((log, i) => (
                <SwipeableLogRow
                  key={log.id}
                  log={log}
                  onDelete={deleteLog}
                  showBorder={i < todayLogs.length - 1}
                />
              ))}
            </View>
          </>
        )}

        {/* This Week section */}
        {thisWeekLogs.length > 0 && (
          <>
            <Text style={s.sectionLabel}>This Week</Text>
            <View style={s.card}>
              {thisWeekLogs.map((log, i) => (
                <SwipeableLogRow
                  key={log.id}
                  log={log}
                  onDelete={deleteLog}
                  showBorder={i < thisWeekLogs.length - 1}
                />
              ))}
            </View>
          </>
        )}

        {/* History section */}
        {historyLogs.length > 0 && (
          <>
            <Text style={s.sectionLabel}>History</Text>
            <View style={s.card}>
              {historyLogs.map((log, i) => (
                <SwipeableLogRow
                  key={log.id}
                  log={log}
                  onDelete={deleteLog}
                  showBorder={i < historyLogs.length - 1}
                />
              ))}
            </View>
          </>
        )}

        {/* Exercise library */}
        {exercises.length > 0 && (
          <>
            <Text style={s.sectionLabel}>
              {selectedMuscle
                ? `${selectedCat === 'All' ? 'All' : selectedCat} · ${MUSCLE_REGIONS.find(r => r.id === selectedMuscle)?.label ?? selectedMuscle} · ${filtered.length}`
                : `${selectedCat === 'All' ? 'All exercises' : selectedCat} · ${filtered.length}`}
            </Text>

            <View style={s.card}>
              {filtered.map((ex, i) => (
                <View key={ex.id} style={i < filtered.length - 1 && s.rowBorder}>
                  <TouchableOpacity
                    style={s.exerciseRow}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
                      nav.navigate('ExerciseDetail', { exerciseId: ex.id });
                    }}
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
                      <Text style={s.chevron}>→</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <QuickLogModal
        exercise={logModal}
        visible={logModal !== null}
        onClose={() => { setLogModal(null); void loadData(); }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: Spacing.base,
    paddingTop: Spacing.md,
  },
  title: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.onSurface },
  subtitle: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, marginTop: 2 },
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
    paddingHorizontal: 14, /* intentional — no Spacing.* equivalent */
    paddingVertical: 7, /* intentional — no Spacing.* equivalent */
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabTxt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  tabTxtActive: { color: Colors.primaryBg, fontWeight: '600' },

  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.onSurfaceMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    ...Elevation.sm,
    overflow: 'hidden',
  },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },

  // Exercise row
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  exLeft: { flex: 1 },
  exName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.onSurface, marginBottom: 4 },
  exMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  equipChip: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: 6, /* intentional — no Spacing.* equivalent */
    paddingVertical: 2, /* intentional — no Spacing.* equivalent */
  },
  equipChipTxt: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.onSurfaceMuted },
  exTarget: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted },
  exRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
  },
  logBtnTxt: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.primaryBg },
  chevron: { fontSize: 12, color: Colors.onSurfaceMuted, fontWeight: '600' },

  // Muscle map filter
  muscleFilterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
  },
  muscleFilterToggleTxt: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
  muscleFilterChevron: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted },
  muscleFilterPanel: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  clearFilterBtn: {
    alignSelf: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.accentBorder,
  },
  clearFilterTxt: { fontSize: Typography.sizes.xs, color: Colors.accent, fontWeight: '600' },

  // Today's activity card
  activityCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    ...Elevation.sm,
    padding: Spacing.md,
  },
  activityLabel: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.onSurfaceMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.sm },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityStat: { flex: 1, alignItems: 'center' },
  activityStatVal: { fontSize: Typography.sizes.xl, fontWeight: '600', color: Colors.onSurface, lineHeight: 28 },
  activityStatLbl: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, marginTop: 2 },
  activityDivider: { width: 0.5, height: 32, backgroundColor: Colors.borderLight },
  activityEmpty: { fontSize: Typography.sizes.sm, color: Colors.onSurfaceMuted },

  // Empty state
  emptyStateCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    ...Elevation.sm,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  emptyStateHeadline: {
    fontSize: Typography.sizes.h3,
    fontWeight: '600',
    color: Colors.onSurface,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  emptyStateBody: {
    fontSize: Typography.sizes.base,
    fontWeight: '400',
    color: Colors.textSecondary,
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
    color: Colors.surface,
    fontSize: Typography.sizes.base,
    fontWeight: '600',
  },

});
