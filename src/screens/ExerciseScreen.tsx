import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { setStatusBarStyle } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { Colors, ProductLayout, Spacing, Radius, Typography } from '../theme';
import { RunnerIcon } from '../components/DesignSystemIcons';
import {
  EXERCISE_CATEGORIES, Exercise, ExerciseCategory, ExerciseLogEntry,
} from '../data/exercises';
import { getExercises } from '../lib/exerciseService';
import { SwipeableLogRow } from '../components/SwipeableLogRow';
import QuickLogModal from '../components/QuickLogModal';
import MuscleMapView, { muscleMatches, MUSCLE_REGIONS } from '../components/MuscleMapView';
import { RootStackParamList } from '../navigation/AppNavigator';
import RoutineCard from '../components/RoutineCard';
import EditLogSheet from '../components/EditLogSheet';
import { SkeletonBlock, SkeletonPulse } from '../components/Skeleton';
import StaggerIn from '../components/StaggerIn';
import AnimatedPressable from '../components/AnimatedPressable';
import ProductScreenHeader from '../components/ProductScreenHeader';
import {
  estimateZone2HeartRate,
  summarizeLongevityWeek,
  ZONE_2_EXERCISE,
} from '../lib/exerciseLongevity';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Cold-mount loading shape — mirrors the exercise row list below. */
function ExerciseSkeleton() {
  return (
    <SkeletonPulse style={{ paddingTop: Spacing.base, paddingHorizontal: Spacing.base, gap: Spacing.sm }}>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 12 }}>
          <SkeletonBlock w={44} h={44} radius={Radius.md} />
          <View style={{ flex: 1, gap: 6 }}>
            <SkeletonBlock w="60%" h={14} />
            <SkeletonBlock w="40%" h={11} />
          </View>
        </View>
      ))}
    </SkeletonPulse>
  );
}

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

function getWeeklyMaxWeight(logs: ExerciseLogEntry[], exerciseId: string, weekMonday: string): number | null {
  const nextMonday = new Date(new Date(weekMonday + 'T00:00:00').getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const filtered = logs.filter(l => l.exerciseId === exerciseId && l.date >= weekMonday && l.date < nextMonday);
  if (filtered.length === 0) return null;
  const hasWeight = filtered.some(l => l.setsData?.some(s => s.weightKg !== undefined));
  if (hasWeight) {
    const weights = filtered.flatMap(l =>
      l.setsData?.filter(s => s.weightKg !== undefined).map(s => s.weightKg as number) ?? []
    ).filter(n => n > 0);
    return weights.length > 0 ? Math.max(...weights) : 0;
  }
  const reps = filtered.flatMap(l =>
    l.setsData?.map(s => s.reps) ?? (l.reps ? [l.reps] : [0])
  );
  return reps.length > 0 ? Math.max(0, ...reps) : 0;
}

function getTrendBadge(curr: number | null, prev: number | null): '↑' | '–' | '↓' | null {
  if (curr === null) return null;
  if (prev === null) return curr > 0 ? '↑' : null;
  if (curr > prev) return '↑';
  if (curr < prev) return '↓';
  return '–';
}

function getTrendColor(badge: '↑' | '–' | '↓' | null): string {
  if (badge === '↑') return Colors.viz.bioGreen;
  if (badge === '↓') return Colors.viz.coral;
  if (badge === '–') return Colors.dark.textMuted;
  return 'transparent';
}

function formatDateHeader(dateStr: string, todayStr: string): string {
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yesterdayStr = yest.toISOString().slice(0, 10);
  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function groupLogsByDate(logList: ExerciseLogEntry[]): Array<{ dateStr: string; entries: ExerciseLogEntry[] }> {
  const map: Record<string, ExerciseLogEntry[]> = {};
  for (const log of logList) {
    if (!map[log.date]) map[log.date] = [];
    map[log.date].push(log);
  }
  return Object.keys(map)
    .sort((a, b) => b.localeCompare(a))
    .map(dateStr => ({ dateStr, entries: map[dateStr] }));
}

function getLastSessionSummary(logs: ExerciseLogEntry[], exerciseId: string): string | null {
  const recent = logs.filter(l => l.exerciseId === exerciseId).sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))[0];
  if (!recent) return null;
  if (recent.setsData && recent.setsData.length > 0) {
    const s0 = recent.setsData[0];
    return s0.weightKg !== undefined
      ? `${recent.setsData.length}×${s0.reps} @ ${s0.weightKg}kg`
      : `${recent.setsData.length}×${s0.reps} reps`;
  }
  if (recent.sets) return `${recent.sets}×${recent.reps}`;
  return null;
}

export default function ExerciseScreen() {
  const nav = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const compact = width < ProductLayout.compactBreakpoint;
  const [selectedCat, setSelectedCat] = useState<ExerciseCategory | 'All'>('All');
  const [logModal, setLogModal] = useState<Exercise | null>(null);
  const [logs, setLogs] = useState<ExerciseLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [muscleMapOpen, setMuscleMapOpen] = useState(false);
  const [muscleMapView, setMuscleMapView] = useState<'front' | 'back'>('front');
  const [activeTab, setActiveTab] = useState<'routine' | 'discover'>('discover');
  const [routine, setRoutine] = useState<string[]>([]);
  const [editingLog, setEditingLog] = useState<ExerciseLogEntry | null>(null);
  const [editSets, setEditSets] = useState('3');
  const [editRepsPerSet, setEditRepsPerSet] = useState('10');
  const [editWeightKg, setEditWeightKg] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [profileAge, setProfileAge] = useState<number | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const loadData = useCallback(() => {
    return Promise.all([
      AsyncStorage.getItem('@vitalspan_exercise_log'),
      getExercises(),
      AsyncStorage.getItem('@vitalspan_exercise_routine'),
      AsyncStorage.getItem('@vitalspan_user_profile'),
    ]).then(([rawLogs, exs, rawRoutine, rawProfile]) => {
      if (rawLogs) setLogs(JSON.parse(rawLogs));
      setExercises(exs);
      const parsedRoutine: string[] = rawRoutine ? JSON.parse(rawRoutine) : [];
      setRoutine(parsedRoutine);
      setActiveTab(parsedRoutine.length > 0 ? 'routine' : 'discover');
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile) as { age?: number };
        setProfileAge(Number.isFinite(parsed.age) ? parsed.age ?? null : null);
      } else {
        setProfileAge(null);
      }
    }).catch(console.error).finally(() => {
      if (!hasLoadedOnceRef.current) {
        hasLoadedOnceRef.current = true;
        setInitialLoading(false);
      }
    });
  }, []);

  useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));
  useFocusEffect(useCallback(() => { setStatusBarStyle('light'); return () => {}; }, []));

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

  async function addToRoutine(exerciseId: string) {
    if (routine.includes(exerciseId)) return;
    if (routine.length >= 10) {
      Alert.alert('Routine full', 'You can add up to 10 exercises to your routine. Remove one to add another.');
      return;
    }
    const updated = [...routine, exerciseId];
    setRoutine(updated);
    await AsyncStorage.setItem('@vitalspan_exercise_routine', JSON.stringify(updated)).catch(console.error);
  }

  async function removeFromRoutine(exerciseId: string) {
    const updated = routine.filter(id => id !== exerciseId);
    setRoutine(updated);
    await AsyncStorage.setItem('@vitalspan_exercise_routine', JSON.stringify(updated)).catch(console.error);
  }

  async function reorderRoutine(data: string[]) {
    setRoutine(data);
    await AsyncStorage.setItem('@vitalspan_exercise_routine', JSON.stringify(data)).catch(console.error);
  }

  function openEditSheet(log: ExerciseLogEntry) {
    setEditingLog(log);
    setEditSets(String(log.setsData?.length ?? log.sets ?? 3));
    setEditRepsPerSet(String(log.setsData?.[0]?.reps ?? log.reps ?? 10));
    setEditWeightKg(log.setsData?.[0]?.weightKg != null ? String(log.setsData[0].weightKg) : '');
  }

  async function saveEditLog() {
    if (!editingLog) return;
    const setsNum = Math.min(parseInt(editSets) || 1, 20);
    const repsNum = parseInt(editRepsPerSet.replace(',', '.')) || 0;
    const weightNum = parseFloat(editWeightKg.replace(',', '.')) || undefined;
    const updated: ExerciseLogEntry = { ...editingLog, setsData: Array(setsNum).fill({ reps: repsNum, weightKg: weightNum }) };
    const newLogs = logs.map(l => l.id === editingLog.id ? updated : l);
    setLogs(newLogs);
    await AsyncStorage.setItem('@vitalspan_exercise_log', JSON.stringify(newLogs)).catch(console.error);
    setEditingLog(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  }

  async function deleteAndCloseSheet() {
    if (!editingLog) return;
    const id = editingLog.id;
    setEditingLog(null);
    await deleteLog(id);
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
  const nextMondayStr = useMemo(() => {
    const next = new Date(`${mondayStr}T00:00:00`);
    next.setDate(next.getDate() + 7);
    return next.toISOString().slice(0, 10);
  }, [mondayStr]);
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
  const longevityWeek = useMemo(
    () => summarizeLongevityWeek(logs, mondayStr, nextMondayStr),
    [logs, mondayStr, nextMondayStr],
  );
  const estimatedZone2 = useMemo(() => estimateZone2HeartRate(profileAge), [profileAge]);

  return (
    <SafeAreaView style={s.safe}>
      <ProductScreenHeader
        eyebrow="VITALSPAN / EXERCISE"
        title="Move for the long run."
        subtitle="Build aerobic capacity, preserve strength, and keep daily movement sustainable."
        compact={compact}
        action={todayLogs.length > 0 ? (
          <View style={s.todayPill}><Text style={s.todayPillTxt}>{todayLogs.length} today</Text></View>
        ) : undefined}
      />

      {initialLoading ? <ExerciseSkeleton /> : (
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { width: Math.min(width, ProductLayout.maxContentWidth) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.viz.bioGreen} />
        }
      >
        <View style={[s.zone2Hero, compact && s.zone2HeroCompact]}>
          <Text style={s.zone2Eyebrow}>PRIMARY AEROBIC FOUNDATION</Text>
          <Text style={s.zone2Title}>Zone 2 cardio</Text>
          <Text style={s.zone2Body}>
            Steady aerobic work helps build an aerobic base and supports metabolic health without turning every session into a maximal effort.
          </Text>
          {estimatedZone2 ? (
            <View style={s.estimatePanel}>
              <Text style={s.estimateLabel}>ESTIMATED FROM PROFILE AGE</Text>
              <Text style={s.estimateValue}>{estimatedZone2.lowBpm}–{estimatedZone2.highBpm} bpm</Text>
              <Text style={s.estimateNote}>A broad age-based estimate, not a clinical threshold. Laboratory testing can establish a different individual range.</Text>
            </View>
          ) : (
            <View style={s.estimatePanel}>
              <Text style={s.estimateLabel}>PERCEIVED-EFFORT GUIDE</Text>
              <Text style={s.estimateGuide}>Steady pace · breathing deeper but controlled · short sentences remain possible · sustainable for an extended period</Text>
            </View>
          )}
          <AnimatedPressable
            style={s.zone2Cta}
            onPress={() => setLogModal(ZONE_2_EXERCISE)}
            accessibilityRole="button"
            accessibilityLabel="Log Zone 2 cardio"
          >
            <Text style={s.zone2CtaText}>Log Zone 2</Text>
          </AnimatedPressable>
        </View>

        <Text style={s.sectionLabel}>This week</Text>
        <View style={[s.weekCard, compact && s.weekCardCompact]} accessibilityLabel={`${longevityWeek.zone2Minutes} Zone 2 minutes, ${longevityWeek.strengthSessions} strength sessions, ${longevityWeek.vo2Sessions} VO2 max sessions this week`}>
          <View style={s.weekStat}><Text style={s.weekValue}>{longevityWeek.zone2Minutes}</Text><Text style={s.weekLabel}>Zone 2 min</Text></View>
          <View style={s.weekDivider} />
          <View style={s.weekStat}><Text style={s.weekValue}>{longevityWeek.strengthSessions}</Text><Text style={s.weekLabel}>Strength sessions</Text></View>
          <View style={s.weekDivider} />
          <View style={s.weekStat}><Text style={s.weekValue}>{longevityWeek.vo2Sessions}</Text><Text style={s.weekLabel}>VO₂ max sessions</Text></View>
        </View>

        <View style={s.hierarchyCard}>
          <Text style={s.hierarchyTitle}>Longevity movement hierarchy</Text>
          {[
            ['01', 'Zone 2 cardio', 'Build the steady aerobic base.'],
            ['02', 'Strength training', 'Preserve muscle, bone, and function.'],
            ['03', 'VO₂ max intervals', 'Keep higher-intensity work distinct.'],
            ['04', 'Daily movement', 'Walk and break up sedentary time.'],
            ['05', 'Mobility & recovery', 'Maintain comfortable range and readiness.'],
          ].map(([rank, label, detail], index) => (
            <View key={rank} style={[s.hierarchyRow, index > 0 && s.hierarchyRule]}>
              <Text style={s.hierarchyRank}>{rank}</Text>
              <View style={s.hierarchyCopy}><Text style={s.hierarchyLabel}>{label}</Text><Text style={s.hierarchyDetail}>{detail}</Text></View>
            </View>
          ))}
        </View>

        <Text style={s.sectionLabel}>Training log</Text>
        <View style={s.segmentedControl}>
          <TouchableOpacity
            style={[s.segment, activeTab === 'routine' && s.segmentActive]}
            onPress={() => { setActiveTab('routine'); Haptics.selectionAsync().catch(() => null); }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'routine' }}
          >
            <Text style={[s.segmentTxt, activeTab === 'routine' && s.segmentTxtActive]}>My Routine</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.segment, activeTab === 'discover' && s.segmentActive]}
            onPress={() => { setActiveTab('discover'); Haptics.selectionAsync().catch(() => null); }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'discover' }}
          >
            <Text style={[s.segmentTxt, activeTab === 'discover' && s.segmentTxtActive]}>Discover</Text>
          </TouchableOpacity>
        </View>

        <View style={s.activityCard}>
          <Text style={s.activityLabel}>TODAY</Text>
          {todayTotals.count > 0 ? (
            <View style={s.activityRow}>
              <View style={s.activityStat}><Text style={s.activityStatVal}>{todayTotals.count}</Text><Text style={s.activityStatLbl}>exercises</Text></View>
              <View style={s.activityDivider} />
              <View style={s.activityStat}><Text style={s.activityStatVal}>{todayTotals.totalMin}</Text><Text style={s.activityStatLbl}>minutes</Text></View>
              <View style={s.activityDivider} />
              <View style={s.activityStat}><Text style={s.activityStatVal}>{todayTotals.totalCal}</Text><Text style={s.activityStatLbl}>kcal est.</Text></View>
            </View>
          ) : <Text style={s.activityEmpty}>Choose the most useful movement for today, then log it below.</Text>}
        </View>

        {activeTab === 'discover' && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsScroll} style={s.tabsBar}>
              <TouchableOpacity style={[s.tab, selectedCat === 'All' && s.tabActive]} onPress={() => { setSelectedCat('All'); Haptics.selectionAsync().catch(() => null); }}>
                <Text style={[s.tabTxt, selectedCat === 'All' && s.tabTxtActive]}>All</Text>
              </TouchableOpacity>
              {EXERCISE_CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} style={[s.tab, selectedCat === cat && s.tabActive]} onPress={() => { setSelectedCat(cat); Haptics.selectionAsync().catch(() => null); }}>
                  <Text style={[s.tabTxt, selectedCat === cat && s.tabTxtActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={s.muscleFilterToggle}
              onPress={() => { Haptics.selectionAsync().catch(() => null); setMuscleMapOpen(prev => !prev); }}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ expanded: muscleMapOpen }}
            >
              <Text style={s.muscleFilterToggleTxt}>{selectedMuscle ? `Muscle: ${MUSCLE_REGIONS.find(r => r.id === selectedMuscle)?.label ?? selectedMuscle}` : 'Muscle group filter'}</Text>
              <Text style={s.muscleFilterChevron}>{muscleMapOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {muscleMapOpen && (
              <View style={s.muscleFilterPanel}>
                <MuscleMapView interactive view={muscleMapView} onViewToggle={() => setMuscleMapView(v => v === 'front' ? 'back' : 'front')} onMusclePress={(regionId) => { Haptics.selectionAsync().catch(() => null); setSelectedMuscle(prev => prev === regionId ? null : regionId); }} primaryMuscles={selectedMuscle ? [selectedMuscle] : []} secondaryMuscles={[]} />
                {selectedMuscle && <TouchableOpacity style={s.clearFilterBtn} onPress={() => { Haptics.selectionAsync().catch(() => null); setSelectedMuscle(null); }}><Text style={s.clearFilterTxt}>Clear filter: {MUSCLE_REGIONS.find(r => r.id === selectedMuscle)?.label ?? selectedMuscle}</Text></TouchableOpacity>}
              </View>
            )}
          </>
        )}
        {/* My Routine tab: empty state or routine cards */}
        {activeTab === 'routine' && routine.length === 0 && (
          <StaggerIn index={0}>
          <View style={s.emptyStateCard}>
            <RunnerIcon color={Colors.dark.textMuted} size={48} />
            <Text style={s.emptyStateHeadline}>Build your routine</Text>
            <Text style={s.emptyStateBody}>
              Add exercises from Discover to build your personal routine.
            </Text>
            <AnimatedPressable
              style={s.emptyStateCta}
              onPress={() => setActiveTab('discover')}
              accessibilityLabel="Explore exercises"
            >
              <Text style={s.emptyStateCtaTxt}>Explore Exercises</Text>
            </AnimatedPressable>
          </View>
          </StaggerIn>
        )}

        {activeTab === 'routine' && routine.length > 0 && (() => {
          const currentMonday = getMondayStr(new Date());
          const prevMonday = getMondayStr(new Date(new Date(currentMonday + 'T00:00:00').getTime() - 7 * 86400000));
          const routineExercises = routine.map(id => exercises.find(e => e.id === id)).filter((e): e is Exercise => e !== undefined);
          return (
            <View style={s.card}>
              <DraggableFlatList
                data={routine}
                keyExtractor={item => item}
                onDragEnd={({ data }) => reorderRoutine(data)}
                renderItem={({ item: exerciseId, drag, isActive }: RenderItemParams<string>) => {
                  const ex = exercises.find(e => e.id === exerciseId);
                  if (!ex) return null;
                  const currMax = getWeeklyMaxWeight(logs, exerciseId, currentMonday);
                  const prevMax = getWeeklyMaxWeight(logs, exerciseId, prevMonday);
                  const badge = getTrendBadge(currMax, prevMax);
                  return (
                    <ScaleDecorator>
                      <RoutineCard
                        exercise={ex}
                        index={routineExercises.indexOf(ex)}
                        lastSession={getLastSessionSummary(logs, exerciseId)}
                        trendBadge={badge}
                        trendColor={getTrendColor(badge)}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null); nav.navigate('ExerciseDetail', { exerciseId }); }}
                        onRemove={() => removeFromRoutine(exerciseId)}
                        dragHandle={
                          <TouchableOpacity onLongPress={drag} disabled={isActive} style={s.dragHandle} delayLongPress={150}>
                            <Text style={s.dragHandleTxt}>⠿</Text>
                          </TouchableOpacity>
                        }
                      />
                    </ScaleDecorator>
                  );
                }}
              />
            </View>
          );
        })()}

        {/* Motivating empty state — shown when no logs at all (Kesfet only) */}
        {activeTab === 'discover' && logs.length === 0 && (
          <StaggerIn index={0}>
          <View style={s.emptyStateCard}>
            <RunnerIcon color={Colors.dark.textMuted} size={48} />
            <Text style={s.emptyStateHeadline}>Move daily. Live longer.</Text>
            <Text style={s.emptyStateBody}>
              Log your first workout to start tracking your movement. Consistency compounds — even a 20-minute walk counts.
            </Text>
            <AnimatedPressable
              style={s.emptyStateCta}
              onPress={() => setLogModal(ZONE_2_EXERCISE)}
              accessibilityLabel="Log Zone 2 cardio"
            >
              <Text style={s.emptyStateCtaTxt}>Log Zone 2</Text>
            </AnimatedPressable>
          </View>
          </StaggerIn>
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
                  onEdit={openEditSheet}
                  showBorder={i < todayLogs.length - 1}
                />
              ))}
            </View>
          </>
        )}

        {/* This Week — grouped by individual day */}
        {thisWeekLogs.length > 0 && groupLogsByDate(thisWeekLogs).map(({ dateStr, entries }) => (
          <React.Fragment key={dateStr}>
            <Text style={s.sectionLabel}>{formatDateHeader(dateStr, todayStr)}</Text>
            <View style={s.card}>
              {entries.map((log, i) => (
                <SwipeableLogRow
                  key={log.id}
                  log={log}
                  onDelete={deleteLog}
                  onEdit={openEditSheet}
                  showBorder={i < entries.length - 1}
                />
              ))}
            </View>
          </React.Fragment>
        ))}

        {/* History — grouped by individual day */}
        {historyLogs.length > 0 && groupLogsByDate(historyLogs).map(({ dateStr, entries }) => (
          <React.Fragment key={dateStr}>
            <Text style={s.sectionLabel}>{formatDateHeader(dateStr, todayStr)}</Text>
            <View style={s.card}>
              {entries.map((log, i) => (
                <SwipeableLogRow
                  key={log.id}
                  log={log}
                  onDelete={deleteLog}
                  onEdit={openEditSheet}
                  showBorder={i < entries.length - 1}
                />
              ))}
            </View>
          </React.Fragment>
        ))}

        {/* Exercise library — Kesfet only */}
        {activeTab === 'discover' && exercises.length > 0 && (
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
                      <TouchableOpacity
                        style={s.addToRoutineBtn}
                        onPress={() => { Haptics.selectionAsync().catch(() => null); addToRoutine(ex.id); }}
                        disabled={routine.includes(ex.id)}
                        activeOpacity={0.75}
                      >
                        <Text style={[s.addToRoutineTxt, routine.includes(ex.id) && { color: Colors.viz.bioGreen }]}>
                          {routine.includes(ex.id) ? '✓' : '+'}
                        </Text>
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
      )}

      <EditLogSheet
        editingLog={editingLog}
        editSets={editSets}
        editRepsPerSet={editRepsPerSet}
        editWeightKg={editWeightKg}
        onChangeSets={setEditSets}
        onChangeReps={setEditRepsPerSet}
        onChangeWeight={setEditWeightKg}
        onSave={saveEditLog}
        onDelete={deleteAndCloseSheet}
        onClose={() => setEditingLog(null)}
      />

      <QuickLogModal
        exercise={logModal}
        visible={logModal !== null}
        onClose={() => { setLogModal(null); void loadData(); }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  todayPill: {
    backgroundColor: Colors.dark.statusOptimalBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 0.5,
    borderColor: Colors.dark.statusOptimalBorder,
  },
  todayPillTxt: { fontSize: Typography.sizes.xs, color: Colors.viz.bioGreen, fontWeight: '600' },

  tabsBar: { maxHeight: 52, marginBottom: Spacing.sm },
  tabsScroll: { paddingHorizontal: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing.sm },
  tab: {
    paddingHorizontal: 14, /* intentional — no Spacing.* equivalent */
    paddingVertical: 7, /* intentional — no Spacing.* equivalent */
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.cardBg,
    borderWidth: 0.5,
    borderColor: Colors.dark.border,
  },
  tabActive: {
    backgroundColor: Colors.dark.ctaPrimary,
    borderColor: Colors.dark.ctaPrimary,
  },
  tabTxt: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted, fontWeight: '500' },
  tabTxtActive: { color: Colors.dark.bg, fontWeight: '600' },

  scroll: { flex: 1 },
  scrollContent: {
    alignSelf: 'center',
    paddingBottom: ProductLayout.bottomClearance,
  },
  zone2Hero: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
    padding: ProductLayout.cardPadding,
    borderRadius: Radius.card,
    backgroundColor: Colors.dark.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.dark.accentBorder,
    overflow: 'hidden',
  },
  zone2HeroCompact: { padding: Spacing.base },
  zone2Eyebrow: {
    color: Colors.dark.ctaPrimary,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.wider,
  },
  zone2Title: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.h1,
    lineHeight: Typography.lineHeights.h1,
    fontWeight: Typography.weights.title,
    marginTop: Spacing.sm,
  },
  zone2Body: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    marginTop: Spacing.sm,
  },
  estimatePanel: {
    backgroundColor: Colors.dark.accentBg,
    borderRadius: Radius.card,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  estimateLabel: {
    color: Colors.dark.ctaPrimary,
    fontSize: Typography.sizes.captionSmall,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.wider,
  },
  estimateValue: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.h2,
    lineHeight: Typography.lineHeights.h2,
    fontWeight: Typography.weights.headline,
    marginTop: Spacing.xs,
  },
  estimateNote: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.caption,
    lineHeight: Typography.lineHeights.caption,
    marginTop: Spacing.xs,
  },
  estimateGuide: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.sm,
  },
  zone2Cta: {
    minHeight: ProductLayout.controlMinHeight,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.ctaPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  zone2CtaText: { color: Colors.dark.bg, fontSize: Typography.sizes.body, fontWeight: Typography.weights.label },
  weekCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.dark.cardBorder,
  },
  weekCardCompact: { paddingVertical: Spacing.md },
  weekStat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xs },
  weekValue: { color: Colors.dark.text, fontSize: Typography.sizes.h2, lineHeight: Typography.lineHeights.h2, fontWeight: Typography.weights.headline },
  weekLabel: { color: Colors.dark.textMuted, fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.captionSmall, textAlign: 'center', marginTop: Spacing.xs },
  weekDivider: { width: StyleSheet.hairlineWidth, backgroundColor: Colors.dark.border },
  hierarchyCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.dark.cardBorder,
  },
  hierarchyTitle: { color: Colors.dark.text, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: Typography.weights.headline, paddingVertical: Spacing.lg },
  hierarchyRow: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md },
  hierarchyRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.dark.border },
  hierarchyRank: { color: Colors.dark.ctaPrimary, fontSize: Typography.sizes.caption, fontWeight: Typography.weights.label, width: Spacing.lg },
  hierarchyCopy: { flex: 1 },
  hierarchyLabel: { color: Colors.dark.text, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body, fontWeight: Typography.weights.headline },
  hierarchyDetail: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    overflow: 'hidden',
  },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.dark.border },

  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  exLeft: { flex: 1 },
  exName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.dark.text, marginBottom: 4 },
  exMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  equipChip: {
    backgroundColor: Colors.dark.inputBg,
    borderRadius: Radius.sm,
    paddingHorizontal: 6, /* intentional — no Spacing.* equivalent */
    paddingVertical: 2, /* intentional — no Spacing.* equivalent */
    borderWidth: 0.5,
    borderColor: Colors.dark.border,
  },
  equipChipTxt: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.dark.textMuted },
  exTarget: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted },
  exRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logBtn: {
    backgroundColor: Colors.dark.ctaPrimary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
  },
  logBtnTxt: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.dark.bg },
  chevron: { fontSize: 12, color: Colors.dark.textMuted, fontWeight: '600' },

  muscleFilterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
  },
  muscleFilterToggleTxt: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.dark.textMuted },
  muscleFilterChevron: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted },
  muscleFilterPanel: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  clearFilterBtn: {
    alignSelf: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.dark.accentBg,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.dark.accentBorder,
  },
  clearFilterTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.ctaPrimary, fontWeight: '600' },

  activityCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    padding: Spacing.lg,
  },
  activityLabel: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.dark.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.sm },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityStat: { flex: 1, alignItems: 'center' },
  activityStatVal: { fontSize: Typography.sizes.xl, fontWeight: '600', color: Colors.dark.text, lineHeight: 28 },
  activityStatLbl: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: 2 },
  activityDivider: { width: 0.5, height: 32, backgroundColor: Colors.dark.border },
  activityEmpty: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted },

  emptyStateCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  emptyStateHeadline: {
    fontSize: Typography.sizes.h3,
    fontWeight: '600',
    color: Colors.dark.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  emptyStateBody: {
    fontSize: Typography.sizes.base,
    fontWeight: '400',
    color: Colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  emptyStateCta: {
    backgroundColor: Colors.dark.ctaPrimary,
    borderRadius: Radius.full,
    minHeight: 44,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  emptyStateCtaTxt: {
    color: Colors.dark.bg,
    fontSize: Typography.sizes.base,
    fontWeight: '600',
  },

  segmentedControl: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.full,
    padding: 3,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: Colors.dark.ctaPrimary },
  segmentTxt: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.dark.textMuted },
  segmentTxtActive: { color: Colors.dark.bg },

  dragHandle: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.md },
  dragHandleTxt: { fontSize: Typography.sizes.lg, color: Colors.dark.textMuted },

  addToRoutineBtn: { padding: Spacing.sm, minWidth: 28, alignItems: 'center' },
  addToRoutineTxt: { fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.dark.ctaPrimary },

});
