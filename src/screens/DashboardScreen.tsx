import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography, Gradients } from '../theme';
import { BIOMARKERS, INTERACTIONS } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StoredEntry } from './BiomarkerEntryScreen';
import NeuralGrid from '../components/NeuralGrid';
import BreathingCard from '../components/BreathingCard';
import FutureSelf from '../components/FutureSelf';
import { computePhenoAge, PHENO_AGE_BIOMARKER_MAP, PhenoAgeInputs } from '../lib/phenoAge';
import { loadHealthData, deriveHealthState, HealthData } from '../lib/healthkit';
import { ExerciseLogEntry } from '../data/exercises';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface UserProfile {
  name: string;
  age: number;
  biologicalAge?: number;
  medications: string[];
  conditions: string[];
}

export default function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [takenItems, setTakenItems] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogEntry[]>([]);
  const [firstRunComplete, setFirstRunComplete] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileRaw, entriesRaw, protocolRaw, hData, exerciseRaw, firstRunRaw] = await Promise.all([
        AsyncStorage.getItem('@vitalspan_user_profile'),
        AsyncStorage.getItem('@vitalspan_biomarkers'),
        AsyncStorage.getItem('@vitalspan_protocol_today'),
        loadHealthData(),
        AsyncStorage.getItem('@vitalspan_exercise_log'),
        AsyncStorage.getItem('@vitalspan_first_run_complete'),
      ]);

      if (profileRaw) setProfile(JSON.parse(profileRaw));
      if (entriesRaw) setEntries(JSON.parse(entriesRaw));
      if (hData) setHealthData(hData);
      if (exerciseRaw) setExerciseLogs(JSON.parse(exerciseRaw));
      setFirstRunComplete(firstRunRaw === 'true');

      if (protocolRaw) {
        const { date, taken }: { date: string; taken: string[] } = JSON.parse(protocolRaw);
        const today = new Date().toISOString().slice(0, 10);
        setTakenItems(date === today ? new Set(taken) : new Set());
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { loadData(); }, [loadData])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function toggleTaken(name: string) {
    Haptics.selectionAsync().catch(() => null);
    setTakenItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      const today = new Date().toISOString().slice(0, 10);
      AsyncStorage.setItem('@vitalspan_protocol_today', JSON.stringify({
        date: today,
        taken: Array.from(next),
      })).catch(console.error);
      return next;
    });
  }

  const entryMap = useMemo(() => {
    const map = new Map<string, StoredEntry>();
    for (const e of entries) {
      const existing = map.get(e.biomarkerId);
      if (!existing || e.date > existing.date) map.set(e.biomarkerId, e);
    }
    return map;
  }, [entries]);

  // Compute PhenoAge from logged biomarkers
  const phenoResult = useMemo(() => {
    if (!profile || !profile.age || profile.age <= 0) return null;
    const inputs: PhenoAgeInputs = { age: profile.age };
    for (const [biomarkerId, inputKey] of Object.entries(PHENO_AGE_BIOMARKER_MAP)) {
      const entry = entryMap.get(biomarkerId);
      if (entry) {
        (inputs as Record<string, number>)[inputKey] = entry.value;
      }
    }
    if (__DEV__) {
      console.log('[Dashboard] phenoAge entryMap keys:', Array.from(entryMap.keys()).join(','));
    }
    return computePhenoAge(inputs);
  }, [entryMap, profile]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  }, []);

  const hasKnownInteractions = useMemo(() =>
    profile !== null &&
    profile.medications.length > 0 &&
    profile.medications.some(med =>
      INTERACTIONS.some(inter => inter.drug.toLowerCase() === med.toLowerCase())
    ),
  [profile]);

  const biomarkerOptimality = useMemo(() => {
    const logged = BIOMARKERS.filter(bm => entryMap.has(bm.id));
    if (logged.length === 0) return 0;
    const optimal = logged.filter(bm => {
      const e = entryMap.get(bm.id)!;
      return e.value >= bm.optMin && e.value <= bm.optMax;
    });
    return optimal.length / logged.length;
  }, [entryMap]);

  const medications = profile?.medications ?? [];
  const takenCount = medications.filter(m => takenItems.has(m)).length;

  const bioAge = phenoResult?.biologicalAge ?? null;
  const chronoAge = profile?.age ?? null;
  const yearsDiff = (bioAge != null && chronoAge != null) ? chronoAge - bioAge : 0;
  const missingForPhenoAge = phenoResult?.missingBiomarkers ?? [];

  // Reactive neural background
  const healthState = useMemo(() => deriveHealthState(healthData), [healthData]);
  const neuralTone = healthState === 'stressed' ? 'alert' : healthState === 'good' ? 'vital' : 'calm';

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screenContainer}>
        <NeuralGrid intensity="low" tone={neuralTone} />

        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={s.topbar}>
            <View>
              <Text style={s.greetSmall}>{greeting}</Text>
              <Text style={s.greetName}>{profile?.name ?? 'there'}</Text>
            </View>
            <TouchableOpacity
              style={s.notifBtn}
              onPress={() => nav.navigate('Settings')}
            >
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Bio age card */}
          <BreathingCard style={s.bioCardWrapper} glowColor={Colors.primaryDark}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
                nav.navigate('LongevityScore');
              }}
            >
              <LinearGradient
                colors={['#0A1628', Colors.primaryDark, Colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.bioCardInner}
              >
                <Text style={s.bioLabel}>YOUR BIOLOGICAL AGE</Text>
                {bioAge != null ? (
                  <>
                    <Text style={s.bioNum}>{bioAge}</Text>
                    <Text style={s.bioSub}>
                      Chronological: {chronoAge}
                      {yearsDiff > 0 ? ` · You're ${yearsDiff} years younger` : ''}
                    </Text>
                    {yearsDiff > 0 && (
                      <View style={s.bioPill}>
                        <Text style={s.bioPillTxt}>↓ improving</Text>
                      </View>
                    )}
                    {phenoResult?.confidence === 'medium' && (
                      <Text style={s.bioConfidence}>
                        Estimated · Log {phenoResult.missingCount} more biomarkers for precision
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={s.bioNumPlaceholder}>—</Text>
                    <Text style={s.bioSub}>
                      {missingForPhenoAge.length > 0
                        ? `Need: ${missingForPhenoAge.slice(0, 2).join(', ')}${missingForPhenoAge.length > 2 ? ` +${missingForPhenoAge.length - 2} more` : ''}`
                        : 'Log the 9 PhenoAge biomarkers to unlock'}
                    </Text>
                    <TouchableOpacity
                      style={s.bioCtaBtn}
                      onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: undefined })}
                    >
                      <Text style={s.bioCtaTxt}>+ Log biomarkers →</Text>
                    </TouchableOpacity>
                  </>
                )}
                <Text style={s.bioCardTapHint}>Tap to view longevity score →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BreathingCard>

          <FutureSelf
            biologicalAge={bioAge ?? undefined}
            chronologicalAge={profile?.age}
            optimality={biomarkerOptimality}
            loggedBiomarkerIds={Array.from(entryMap.keys())}
            onBiomarkerPress={(id) => nav.navigate('BiomarkerEntry', { biomarkerId: id })}
          />

          {hasKnownInteractions && (
            <TouchableOpacity
              style={s.alertCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
                nav.navigate('InteractionChecker');
              }}
            >
              <View style={s.alertIcon}>
                <Text style={{ fontSize: 14 }}>⚠️</Text>
              </View>
              <View style={s.alertBody}>
                <Text style={s.alertTitle}>Interaction check recommended</Text>
                <Text style={s.alertTxt}>
                  One or more of your medications has known supplement interactions. Tap to review.
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={s.sectionHdr}>
            <Text style={s.sectionTitle}>Biomarkers</Text>
            <TouchableOpacity
              style={s.sectionAddBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
                nav.navigate('BiomarkerEntry', { biomarkerId: undefined });
              }}
            >
              <Text style={s.sectionAddTxt}>+ Log</Text>
            </TouchableOpacity>
          </View>

          {entries.length === 0 && !firstRunComplete ? (
            <View style={s.emptyStateCard}>
              <Text style={s.emptyStateIcon}>🧬</Text>
              <Text style={s.emptyStateHeading}>Your longevity data starts here</Text>
              <Text style={s.emptyStateBody}>
                Log your first three biomarkers — Glucose, HbA1c, and Cholesterol — to unlock your Longevity Score and biological age projection.
              </Text>
              <TouchableOpacity
                activeOpacity={0.82}
                style={s.emptyStateCta}
                onPress={() => nav.navigate('GuidedFirstRun')}
              >
                <Text style={s.emptyStateCtaTxt}>Log Your First Biomarkers</Text>
              </TouchableOpacity>
            </View>
          ) : entries.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.bmScroll}>
              {BIOMARKERS.slice(0, 5).map((bm) => {
                const latest = entryMap.get(bm.id) ?? null;
                const hasData = latest !== null;
                const isOptimal = hasData && latest.value >= bm.optMin && latest.value <= bm.optMax;
                const gradColors = (hasData
                  ? (isOptimal ? Gradients.cardGood : Gradients.cardWarn)
                  : Gradients.cardNone) as [string, string];
                return (
                  <LinearGradient
                    key={bm.id}
                    colors={gradColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.6, y: 1 }}
                    style={[s.bmCard, hasData ? (isOptimal ? s.bmCardGood : s.bmCardWarning) : s.bmCardNone]}
                  >
                    <Text style={[s.bmName, { color: hasData ? (isOptimal ? Colors.status.optimalText : Colors.status.reviewText) : Colors.textMuted }]}>{bm.name}</Text>
                    <Text style={[s.bmVal, { color: hasData ? (isOptimal ? Colors.status.optimal : Colors.status.review) : Colors.textMuted }]}>
                      {hasData ? String(latest.value) : '·'}
                    </Text>
                    <Text style={s.bmUnit}>{bm.unit}</Text>
                    {hasData ? (
                      <View style={[s.bmBadge, isOptimal ? s.bmBadgeGood : s.bmBadgeWarn]}>
                        <Text style={[s.bmBadgeTxt, { color: isOptimal ? Colors.status.optimalText : Colors.status.reviewText }]}>
                          {isOptimal ? 'Optimal' : 'Review'}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={s.bmBadgeEmpty}
                        onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: bm.id })}
                      >
                        <Text style={s.bmBadgeEmptyTxt}>+ Log first reading</Text>
                      </TouchableOpacity>
                    )}
                  </LinearGradient>
                );
              })}
            </ScrollView>
          ) : null}

          <TouchableOpacity
            style={s.uploadCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
              nav.navigate('LabUpload');
            }}
          >
            <Text style={s.uploadCardIcon}>📋</Text>
            <View style={s.uploadCardBody}>
              <Text style={s.uploadCardTitle}>Upload lab results</Text>
              <Text style={s.uploadCardSub}>Import biomarkers from your PDF</Text>
            </View>
            <Text style={s.uploadCardArrow}>→</Text>
          </TouchableOpacity>

          {/* Movement today */}
          {(() => {
            const today = new Date().toISOString().slice(0, 10);
            const todayEx = exerciseLogs.filter(l => l.date === today);
            const totalMin = todayEx.reduce((sum, l) => sum + (l.durationMin ?? 0), 0);
            const totalCal = todayEx.reduce((sum, l) => sum + (l.caloriesEstimated ?? 0), 0);
            const hasData = todayEx.length > 0;
            return (
              <TouchableOpacity
                style={s.exerciseCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
                  nav.navigate('Main' as never);
                }}
              >
                <Text style={s.exerciseCardIcon}>🏃</Text>
                <View style={s.uploadCardBody}>
                  <Text style={s.uploadCardTitle}>Movement today</Text>
                  {hasData ? (
                    <Text style={s.uploadCardSub}>
                      {todayEx.length} exercise{todayEx.length > 1 ? 's' : ''}
                      {totalMin > 0 ? ` · ${totalMin} min` : ''}
                      {totalCal > 0 ? ` · ~${totalCal} kcal` : ''}
                    </Text>
                  ) : (
                    <Text style={s.uploadCardSub}>Tap to log today's workout</Text>
                  )}
                </View>
                <Text style={s.uploadCardArrow}>→</Text>
              </TouchableOpacity>
            );
          })()}

          <View style={s.sectionHdr}>
            <Text style={s.sectionTitle}>{"Today's protocol"}</Text>
            <Text style={s.sectionLink}>{takenCount} / {medications.length} taken</Text>
          </View>

          <View style={s.protocolCard}>
            {medications.length === 0 ? (
              <View style={s.protoEmpty}>
                <Text style={s.protoEmptyTxt}>No medications in your protocol yet</Text>
                <TouchableOpacity
                  style={s.protoEmptyCta}
                  onPress={() => nav.navigate('Main' as never)}
                >
                  <Text style={s.protoEmptyCtaTxt}>Go to Protocol →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              medications.map((med, i) => {
                const taken = takenItems.has(med);
                return (
                  <TouchableOpacity
                    key={med}
                    style={[s.protoItem, i < medications.length - 1 && s.protoItemBorder]}
                    onPress={() => toggleTaken(med)}
                  >
                    <View style={[s.protoDot, taken ? s.protoDotTaken : s.protoDotPending]} />
                    <Text style={s.protoName}>{med}</Text>
                    <Text style={[s.protoTime, taken && { color: Colors.primaryLight }]}>
                      {taken ? 'Taken ✓' : '—'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  screenContainer: { flex: 1 },
  scroll: { flex: 1 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.base, paddingTop: Spacing.md },
  greetSmall: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  greetName: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  bioCardWrapper: { marginHorizontal: Spacing.base, borderRadius: Radius.xl, marginBottom: Spacing.base },
  bioCardInner: { borderRadius: Radius.xl, padding: Spacing.base },
  bioLabel: { fontSize: Typography.sizes.xs, color: 'rgba(232,245,238,0.7)', letterSpacing: 0.8, marginBottom: 6 },
  bioNum: { fontSize: 52, color: Colors.primaryBg, fontWeight: '300', lineHeight: 58 },
  bioNumPlaceholder: { fontSize: 52, color: 'rgba(232,245,238,0.3)', fontWeight: '300', lineHeight: 58 },
  bioSub: { fontSize: Typography.sizes.xs, color: 'rgba(232,245,238,0.75)', marginTop: 4 },
  bioConfidence: { fontSize: Typography.sizes.xs, color: 'rgba(232,245,238,0.5)', marginTop: 4, fontStyle: 'italic' },
  bioPill: { position: 'absolute', top: Spacing.base, right: Spacing.base, backgroundColor: 'rgba(168,213,190,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  bioPillTxt: { fontSize: Typography.sizes.xs, color: Colors.primaryBorder },
  bioCtaBtn: { marginTop: Spacing.sm, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 6, alignSelf: 'flex-start' },
  bioCtaTxt: { fontSize: Typography.sizes.xs, color: Colors.primaryBg, fontWeight: '600' },
  bioCardTapHint: { fontSize: Typography.sizes.xs, color: 'rgba(232,245,238,0.45)', marginTop: Spacing.sm, letterSpacing: 0.3 },
  alertCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.warningBg, borderColor: Colors.warningBorder, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: Spacing.base },
  alertIcon: { width: 32, height: 32, backgroundColor: Colors.warningBorder, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.warningTextDark, marginBottom: 2 },
  alertTxt: { fontSize: Typography.sizes.xs, color: Colors.warningText, lineHeight: 16 },
  sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },
  sectionLink: { fontSize: Typography.sizes.sm, color: Colors.primaryLight },
  sectionAddBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  sectionAddTxt: { fontSize: Typography.sizes.xs, color: Colors.primaryBg, fontWeight: '600' },
  bmScroll: { paddingHorizontal: Spacing.base, gap: 10, paddingBottom: Spacing.base },
  bmCard: { width: 120, borderRadius: Radius.xl, padding: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  bmCardWarning: { backgroundColor: Colors.status.reviewBg },
  bmCardGood: { backgroundColor: Colors.status.optimalBg },
  bmCardNone: { backgroundColor: Colors.bgCard },
  bmName: { fontSize: Typography.sizes.xs, marginBottom: 4 },
  bmVal: { fontSize: 22, fontWeight: '500', lineHeight: 26 },
  bmUnit: { fontSize: 10, color: Colors.textMuted, marginBottom: 6 },
  bmBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
  bmBadgeWarn: { backgroundColor: Colors.status.reviewBorder },
  bmBadgeGood: { backgroundColor: Colors.status.optimalBorder },
  bmBadgeTxt: { fontSize: 9, fontWeight: '500' },
  bmBadgeEmpty: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10,
    backgroundColor: Colors.bgSecondary, borderWidth: 0.5, borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  bmBadgeEmptyTxt: { fontSize: 9, fontWeight: '500', color: Colors.primaryLight },
  protocolCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, marginBottom: Spacing.base, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2, padding: Spacing.md },
  protoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: Spacing.sm },
  protoItemBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  protoDot: { width: 10, height: 10, borderRadius: 5 },
  protoDotTaken: { backgroundColor: Colors.primaryLight },
  protoDotPending: { backgroundColor: Colors.border },
  protoName: { flex: 1, fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  protoTime: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  protoEmpty: { alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  protoEmptyTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted },
  protoEmptyCta: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5, borderColor: Colors.primaryBorder },
  protoEmptyCtaTxt: { fontSize: Typography.sizes.sm, color: Colors.primary, fontWeight: '500' },
  emptyStateCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.base },
  emptyStateIcon: { fontSize: 32, marginBottom: Spacing.md },
  emptyStateHeading: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  emptyStateBody: { fontSize: Typography.sizes.body, fontWeight: '400', color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.lg },
  emptyStateCta: { backgroundColor: Colors.primary, borderRadius: Radius.xl, height: 48, paddingHorizontal: Spacing.base, justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch' },
  emptyStateCtaTxt: { color: Colors.bgCard, fontSize: Typography.sizes.base, fontWeight: '600' },
  uploadCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  exerciseCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base, backgroundColor: Colors.status.optimalBg, borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  exerciseCardIcon: { fontSize: 28 },
  uploadCardIcon: { fontSize: 28 },
  uploadCardBody: { flex: 1 },
  uploadCardTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.textPrimary },
  uploadCardSub: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  uploadCardArrow: { fontSize: Typography.sizes.md, color: Colors.textMuted },
});
