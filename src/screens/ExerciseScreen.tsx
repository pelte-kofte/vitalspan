import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography, Elevation } from '../theme';
import {
  EXERCISE_CATEGORIES, Exercise, ExerciseCategory, ExerciseLogEntry,
} from '../data/exercises';
import { getExercises } from '../lib/exerciseService';
import { SwipeableLogRow } from '../components/SwipeableLogRow';
import QuickLogModal from '../components/QuickLogModal';

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

function getMondayStr(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function getYesterdayStr(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function ExerciseScreen() {
  const [selectedCat, setSelectedCat] = useState<ExerciseCategory | 'All'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logModal, setLogModal] = useState<Exercise | null>(null);
  const [logs, setLogs] = useState<ExerciseLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

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

  const filtered = useMemo(
    () => selectedCat === 'All' ? exercises : exercises.filter(e => e.category === selectedCat),
    [selectedCat, exercises],
  );

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const mondayStr = getMondayStr(now);
  const yesterdayStr = getYesterdayStr(now);
  const historyStartStr = (() => { const d = new Date(mondayStr); d.setDate(d.getDate() - 14); return d.toISOString().slice(0, 10); })();

  const todayLogs = useMemo(() => logs.filter(l => l.date === todayStr), [logs, todayStr]);
  const thisWeekLogs = useMemo(() => logs.filter(l => l.date >= mondayStr && l.date <= yesterdayStr), [logs, mondayStr, yesterdayStr]);
  const historyLogs = useMemo(() => logs.filter(l => l.date >= historyStartStr && l.date < mondayStr), [logs, historyStartStr, mondayStr]);

  const todayTotals = useMemo(() => ({
    totalMin: todayLogs.reduce((sum, l) => sum + (l.durationMin ?? 0), 0),
    totalCal: todayLogs.reduce((sum, l) => sum + (l.caloriesEstimated ?? 0), 0),
    count: todayLogs.length,
  }), [todayLogs]);

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

});
