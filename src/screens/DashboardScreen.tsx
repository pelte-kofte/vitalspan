import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl, Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, resendVerificationEmail } from '../lib/supabase';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RunnerIcon, BellIcon, DnaHelixIcon, ClipboardIcon, WarningIcon } from '../components/DesignSystemIcons';
import { BIOMARKERS, INTERACTIONS } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StoredEntry } from './BiomarkerEntryScreen';
import FutureSelf from '../components/FutureSelf';
import BioAgeSpherePreview from '../components/BioAgeSpherePreview';
import AnimatedPressable from '../components/AnimatedPressable';
import StaggerIn from '../components/StaggerIn';
import { SkeletonBlock, SkeletonPulse } from '../components/Skeleton';
import { computePhenoAge, PHENO_AGE_BIOMARKER_MAP, PhenoAgeInputs } from '../lib/phenoAge';
import { loadHealthData, HealthData } from '../lib/healthkit';
import { ExerciseLogEntry } from '../data/exercises';
import { usePremiumContext } from '../context/PremiumContext';
import { assembleAdvisorContext } from '../lib/advisorContext';
import { computeProactiveInsight, ProactiveInsight, InsightAction } from '../lib/insightEngine';
import ProactiveInsightBanner from '../components/ProactiveInsightBanner';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getMondayStr(date: Date): string {
  const d = new Date(date); const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

interface UserProfile {
  name: string;
  age: number;
  biologicalAge?: number;
  medications: string[];
  conditions: string[];
}

/** Cold-mount loading shape — mirrors the topbar/bio-card/carousel/protocol layout below. */
function DashboardSkeleton() {
  return (
    <View style={{ flex: 1 }}>
      <SkeletonPulse style={{ paddingTop: Spacing.md, gap: Spacing.base }}>
        <View style={{ paddingHorizontal: Spacing.base, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ gap: 6 }}>
            <SkeletonBlock w={90} h={12} />
            <SkeletonBlock w={140} h={22} />
          </View>
          <SkeletonBlock w={38} h={38} radius={19} />
        </View>
        <View style={{ paddingHorizontal: Spacing.base }}>
          <SkeletonBlock w="100%" h={168} radius={Radius.xl} />
        </View>
        <View style={{ paddingHorizontal: Spacing.base, gap: 6 }}>
          <SkeletonBlock w={110} h={16} />
        </View>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base }}>
          {[0, 1, 2].map(i => <SkeletonBlock key={i} w={110} h={120} radius={Radius.lg} />)}
        </View>
        <View style={{ paddingHorizontal: Spacing.base }}>
          <SkeletonBlock w="100%" h={140} radius={Radius.xl} />
        </View>
      </SkeletonPulse>
    </View>
  );
}

export default function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const { isPremium } = usePremiumContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [takenItems, setTakenItems] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogEntry[]>([]);
  const [addedSupplements, setAddedSupplements] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const hasLoadedOnceRef = useRef(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [proactiveInsight, setProactiveInsight] = useState<ProactiveInsight | null>(null);
  const [dismissedInsights, setDismissedInsights] = useState<Record<string, string>>({});
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const [showVerifiedToast, setShowVerifiedToast] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [profileRaw, entriesRaw, protocolRaw, hData, exerciseRaw, protocolFullRaw] = await Promise.all([
        AsyncStorage.getItem('@vitalspan_user_profile'),
        AsyncStorage.getItem('@vitalspan_biomarkers'),
        AsyncStorage.getItem('@vitalspan_protocol_today'),
        loadHealthData(),
        AsyncStorage.getItem('@vitalspan_exercise_log'),
        AsyncStorage.getItem('@vitalspan_protocol'),
      ]);

      if (profileRaw) setProfile(JSON.parse(profileRaw));

      // Single getUser() call — result reused for biomarker fetch and verification banner (M3)
      let currentUser: import('@supabase/supabase-js').User | null = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;
      } catch { /* non-blocking — falls back to local data below */ }

      // Supabase-first biomarker entries pull (D-04: every mount, D-06: silent fallback)
      try {
        if (currentUser) {
          const { data: sbEntries, error: sbError } = await supabase
            .from('biomarker_entries')
            .select('id, biomarker_id, value, date, source, notes')
            .eq('user_id', currentUser.id);
          if (!sbError && sbEntries && sbEntries.length > 0) {
            setEntries(
              sbEntries.map((row) => ({
                id: row.id as string,
                biomarkerId: row.biomarker_id as string,
                value: row.value as number,
                date: row.date as string,
                source: row.source as string,
                notes: (row.notes ?? '') as string,
              }))
            );
          } else {
            if (entriesRaw) setEntries(JSON.parse(entriesRaw));
          }
        } else {
          if (entriesRaw) setEntries(JSON.parse(entriesRaw));
        }
      } catch {
        if (entriesRaw) setEntries(JSON.parse(entriesRaw));
      }

      if (hData) setHealthData(hData);
      if (exerciseRaw) setExerciseLogs(JSON.parse(exerciseRaw));

      if (protocolRaw) {
        const { date, taken }: { date: string; taken: string[] } = JSON.parse(protocolRaw);
        const today = new Date().toISOString().slice(0, 10);
        setTakenItems(date === today ? new Set(taken) : new Set());
      }

      if (protocolFullRaw) {
        const pt: { addedSupplements?: string[]; customSupplements?: { name: string }[]; currentStreak?: number } = JSON.parse(protocolFullRaw);
        setAddedSupplements([
          ...(pt.addedSupplements ?? []),
          ...(pt.customSupplements ?? []).map(cs => cs.name),
        ]);
        setCurrentStreak(pt.currentStreak ?? 0);
      }

      // Email verification banner check (D-12, D-14) — reuses currentUser from above.
      // Gated to provider === 'email': OAuth users (Google/Apple) are always
      // pre-confirmed by the provider, so without this gate the very first
      // Dashboard load after an OAuth sign-in would fire the one-time
      // "Account verified" toast — misleading, since the user never went
      // through email verification at all.
      try {
        if (currentUser && !currentUser.is_anonymous && currentUser.email && currentUser.app_metadata?.provider === 'email') {
          setUserEmail(currentUser.email);
          if (!currentUser.email_confirmed_at) {
            // Not yet verified — show banner (if not dismissed this session)
            setShowVerificationBanner(true);
          } else {
            // Verified — check if we should show the one-time toast (D-14)
            setShowVerificationBanner(false);
            const notified = await AsyncStorage.getItem('@vitalspan_email_verified_notified').catch(() => null);
            if (!notified) {
              await AsyncStorage.setItem('@vitalspan_email_verified_notified', 'true').catch(() => null);
              setShowVerifiedToast(true);
              if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
              toastTimerRef.current = setTimeout(() => setShowVerifiedToast(false), 3000);
            }
          }
        }
      } catch { /* non-blocking — verification UI is best-effort */ }
    } catch (e) {
      console.error('[loadData] parse error', e);
      Alert.alert('Data error', 'Some saved data could not be read. If this persists, use Settings → Clear all data to reset.');
    } finally {
      // Skeleton only ever shows on the true cold mount — not on every
      // tab-focus refetch, which would flash it on every tab switch.
      if (!hasLoadedOnceRef.current) {
        hasLoadedOnceRef.current = true;
        setInitialLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {
        if (toastTimerRef.current != null) clearTimeout(toastTimerRef.current);
      };
    }, [loadData])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleResend() {
    if (!userEmail) return;
    Haptics.selectionAsync().catch(() => null);
    await resendVerificationEmail(userEmail);
    // No UI feedback needed beyond haptic — Supabase sends the email silently
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
      if (entry != null && entry.value != null) {
        inputs[inputKey] = entry.value;
      }
    }
    return computePhenoAge(inputs);
  }, [entryMap, profile]);

  // CR-01: persist computed biological age back to profile so ProfileScreen stays current
  useEffect(() => {
    if (!phenoResult || phenoResult.biologicalAge == null || !profile) return;
    const updated = { ...profile, biologicalAge: phenoResult.biologicalAge };
    AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(updated)).catch(
      (e) => console.error('[bioAge sync]', e),
    );
  }, [phenoResult?.biologicalAge, profile]);

  // Recompute the proactive insight banner on every tab focus.
  // Times out silently after 2s so the banner never blocks screen rendering.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const timer = setTimeout(() => { cancelled = true; }, 2000);

      async function loadInsight() {
        try {
          const [dismissedRaw, lastReportRaw, ctx] = await Promise.all([
            AsyncStorage.getItem('@vitalspan_dismissed_insights'),
            AsyncStorage.getItem('@vitalspan_last_report_ts'),
            assembleAdvisorContext(),
          ]);
          if (cancelled) return;
          clearTimeout(timer);
          const dismissed: Record<string, string> = dismissedRaw
            ? (JSON.parse(dismissedRaw) as Record<string, string>)
            : {};
          setDismissedInsights(dismissed);
          setProactiveInsight(computeProactiveInsight(ctx, dismissed, lastReportRaw));
        } catch (error) {
          console.error('[Dashboard] Proactive insight assembly failed:', error);
        }
      }

      loadInsight();
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }, []),
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  }, []);

  // Daily context line under the greeting — reuses the real Phase 22 streak
  // counter (ProtocolScreen persists @vitalspan_protocol.currentStreak) and
  // today's remaining protocol items, rather than inventing a new tracker.
  const dashboardContext = useMemo(() => {
    const totalDue = (profile?.medications.length ?? 0) + addedSupplements.length;
    const remaining = Math.max(0, totalDue - takenItems.size);
    const streakPart = currentStreak > 0 ? `Day ${currentStreak}` : null;
    const duePart = totalDue === 0
      ? null
      : remaining === 0
        ? 'All done for today'
        : `${remaining} ${remaining === 1 ? 'item' : 'items'} due today`;
    if (streakPart && duePart) return `${streakPart} · ${duePart}`;
    return streakPart ?? duePart;
  }, [profile, addedSupplements, takenItems, currentStreak]);

  const hasKnownInteractions = useMemo(() => {
    if (!profile || profile.medications.length === 0 || addedSupplements.length === 0) return false;
    const suppLower = addedSupplements.map(s => s.toLowerCase());
    return profile.medications.some(med =>
      INTERACTIONS.some(inter =>
        inter.drug.toLowerCase() === med.toLowerCase() &&
        suppLower.some(s => s.includes(inter.supplement.toLowerCase()) || inter.supplement.toLowerCase().includes(s))
      )
    );
  }, [profile, addedSupplements]);

  const biomarkerOptimality = useMemo(() => {
    const logged = BIOMARKERS.filter(bm => entryMap.has(bm.id));
    if (logged.length === 0) return 0;
    const optimal = logged.filter(bm => {
      const e = entryMap.get(bm.id)!;
      return e.value >= bm.optMin && e.value <= bm.optMax;
    });
    return optimal.length / logged.length;
  }, [entryMap]);

  async function handleInsightDismiss(insightId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const updated = { ...dismissedInsights, [insightId]: today };
    setDismissedInsights(updated);
    setProactiveInsight(null);
    await AsyncStorage.setItem('@vitalspan_dismissed_insights', JSON.stringify(updated)).catch(() => null);
  }

  function handleInsightNavigate(action: InsightAction) {
    if (action.type !== 'navigate') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    switch (action.screen) {
      case 'AIAdvisor':
        nav.navigate('AIAdvisor');
        break;
      case 'BiomarkerDetail': {
        const biomarkerId = typeof action.params?.biomarkerId === 'string'
          ? action.params.biomarkerId
          : undefined;
        nav.navigate('BiomarkerDetail', { biomarkerId });
        break;
      }
      case 'Protocol':
        nav.getParent()?.navigate('Protocol');
        break;
      case 'Biomarkers':
        nav.getParent()?.navigate('Biomarkers');
        break;
      default:
        break;
    }
  }

  const medications = profile?.medications ?? [];
  const takenCount = medications.filter(m => takenItems.has(m)).length;

  const bioAge = phenoResult?.biologicalAge ?? null;
  const chronoAge = profile?.age ?? null;
  const yearsDiff = (bioAge != null && chronoAge != null) ? chronoAge - bioAge : 0;
  const missingForPhenoAge = phenoResult?.missingBiomarkers ?? [];

  // Weekly movement summary (Mon–Sun current week)
  const weeklyMovement = useMemo(() => {
    const mondayStr = getMondayStr(new Date());
    const sundayStr = (() => {
      const d = new Date(mondayStr); d.setDate(d.getDate() + 6);
      return d.toISOString().slice(0, 10);
    })();
    const weekLogs = exerciseLogs.filter(l => l.date >= mondayStr && l.date <= sundayStr);
    if (weekLogs.length === 0) return null;
    const sessions = weekLogs.length;
    const totalMin = weekLogs.reduce((s, l) => s + (l.durationMin ?? 0), 0);
    const catCounts = weekLogs.reduce<Record<string, number>>((acc, l) => {
      acc[l.category] = (acc[l.category] ?? 0) + 1; return acc;
    }, {});
    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    return { sessions, totalMin, topCat };
  }, [exerciseLogs]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screenContainer}>

        {/* Email verification banner (D-12) — amber, dismissable per-session */}
        {showVerificationBanner && !bannerDismissed && (
          <View style={s.verificationBanner}>
            <Text style={s.verificationBannerTxt}>
              Please verify your email — check your inbox.
            </Text>
            <View style={s.verificationBannerActions}>
              <TouchableOpacity onPress={handleResend}>
                <Text style={s.verificationBannerResend}>Resend</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setBannerDismissed(true)}>
                <Text style={s.verificationBannerDismiss}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Verified toast (D-14) — one-time, auto-dismiss after 3s */}
        {showVerifiedToast && (
          <View style={s.verifiedToast} pointerEvents="none">
            <Text style={s.verifiedToastTxt}>Account verified</Text>
          </View>
        )}

        {initialLoading ? <DashboardSkeleton /> : (
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.viz.bioGreen}
            />
          }
        >
          <View style={s.topbar}>
            <View>
              <Text style={s.greetSmall}>{greeting}</Text>
              <Text style={s.greetName}>{profile?.name ?? 'there'}</Text>
              {dashboardContext && <Text style={s.greetContext}>{dashboardContext}</Text>}
            </View>
            <TouchableOpacity
              style={s.notifBtn}
              onPress={() => nav.navigate('Settings')}
            >
              <BellIcon color={Colors.dark.text} size={20} />
            </TouchableOpacity>
          </View>

          {/* Proactive insight banner — surfaces highest-priority health signal */}
          {proactiveInsight !== null && (
            <ProactiveInsightBanner
              insight={proactiveInsight}
              onDismiss={handleInsightDismiss}
              onNavigate={handleInsightNavigate}
            />
          )}

          {/* Bio age card — single hero of the dashboard: flat surface, hairline border,
              no gradient. The whole card is tappable; a chevron top-right is the only hint. */}
          <StaggerIn index={0}>
          <View style={s.bioCardWrapper}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
                nav.navigate('LongevityScore');
              }}
            >
              <View style={[s.bioCardInner, bioAge == null && s.bioCardInnerCompact]}>
                <Text style={s.bioChevron}>›</Text>
                <Text style={s.bioLabel}>Biological age</Text>
                {bioAge != null ? (
                  <>
                    <Text style={s.bioNum}>{bioAge}</Text>
                    <Text style={s.bioSub}>
                      Chronological {chronoAge}
                      {yearsDiff > 0 ? ` · ${yearsDiff} years younger` : ''}
                    </Text>
                  </>
                ) : (
                  <View style={s.bioEmptyState}>
                    <BioAgeSpherePreview size={48} dimmed />
                    <Text style={s.bioEmptyHeadline}>
                      Log 9 biomarkers to see your biological age
                    </Text>
                    <AnimatedPressable
                      style={s.bioCtaBtn}
                      onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: undefined })}
                      accessibilityLabel="Log biomarkers"
                    >
                      <Text style={s.bioCtaTxt}>Log biomarkers</Text>
                    </AnimatedPressable>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
          </StaggerIn>

          <StaggerIn index={1}>
          <FutureSelf
            biologicalAge={bioAge ?? undefined}
            chronologicalAge={profile?.age}
            optimality={biomarkerOptimality}
            onViewBiomarkers={() => nav.getParent()?.navigate('Biomarkers')}
          />
          </StaggerIn>

          {hasKnownInteractions && (
            <TouchableOpacity
              style={s.alertCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
                nav.navigate('InteractionChecker');
              }}
            >
              <WarningIcon color={Colors.viz.amber} size={20} />
              <View style={s.alertBody}>
                <Text style={s.alertTitle}>Interaction check recommended</Text>
                <Text style={s.alertTxt}>
                  A medication and supplement in your protocol have a known interaction.
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <StaggerIn index={2}>
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
          </StaggerIn>

          {entries.length === 0 ? (
            <StaggerIn index={3}>
            <View style={s.emptyStateCard}>
              <DnaHelixIcon color={Colors.dark.textMuted} size={40} />
              <Text style={s.emptyStateHeading}>Your longevity data starts here</Text>
              <Text style={s.emptyStateBody}>
                Log your first three biomarkers — Glucose, HbA1c, and Cholesterol — to see your Longevity Score and biological age.
              </Text>
              <AnimatedPressable
                style={s.emptyStateCta}
                onPress={() => nav.navigate('GuidedFirstRun')}
                accessibilityLabel="Log your first biomarkers"
              >
                <Text style={s.emptyStateCtaTxt}>Log Your First Biomarkers</Text>
              </AnimatedPressable>
            </View>
            </StaggerIn>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.bmScroll}>
              {BIOMARKERS.slice(0, 5).map((bm, idx) => {
                const latest = entryMap.get(bm.id) ?? null;
                const hasData = latest !== null;
                const isOptimal = hasData && latest.value >= bm.optMin && latest.value <= bm.optMax;
                return (
                  <StaggerIn key={bm.id} index={idx}>
                  <View
                    style={[s.bmCard, hasData ? (isOptimal ? s.bmCardGood : s.bmCardWarning) : s.bmCardNone]}
                  >
                    <Text style={[s.bmName, { color: hasData ? (isOptimal ? Colors.viz.bioGreen : Colors.viz.amber) : Colors.dark.textMuted }]}>{bm.name}</Text>
                    <Text style={[s.bmVal, { color: hasData ? (isOptimal ? Colors.viz.bioGreen : Colors.viz.amber) : Colors.dark.textMuted }]}>
                      {hasData ? String(latest.value) : '·'}
                    </Text>
                    <Text style={s.bmUnit}>{bm.unit}</Text>
                    {hasData ? (
                      <View style={[s.bmBadge, isOptimal ? s.bmBadgeGood : s.bmBadgeWarn]}>
                        <Text style={[s.bmBadgeTxt, { color: isOptimal ? Colors.viz.bioGreen : Colors.viz.amber }]}>
                          {isOptimal ? 'Optimal' : 'Review'}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={s.bmBadgeEmpty}
                        onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: bm.id })}
                      >
                        <Text style={s.bmBadgeEmptyTxt}>Log first reading</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  </StaggerIn>
                );
              })}
            </ScrollView>
          )}

          <TouchableOpacity
            style={s.uploadCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
              nav.navigate('LabUpload');
            }}
          >
            <ClipboardIcon color={Colors.dark.text} size={20} />
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
                  nav.getParent()?.navigate('Exercise');
                }}
              >
                <RunnerIcon color={Colors.dark.text} size={20} />
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

          {/* Weekly movement summary */}
          {weeklyMovement && (
            <View style={s.weeklyCard}>
              <Text style={s.weeklyLabel}>THIS WEEK'S MOVEMENT</Text>
              <View style={s.weeklyRow}>
                <View style={s.weeklyStat}>
                  <Text style={s.weeklyStatVal}>{weeklyMovement.sessions}</Text>
                  <Text style={s.weeklyStatLbl}>sessions</Text>
                </View>
                <View style={s.weeklyDivider} />
                <View style={s.weeklyStat}>
                  <Text style={s.weeklyStatVal}>{weeklyMovement.totalMin}</Text>
                  <Text style={s.weeklyStatLbl}>minutes</Text>
                </View>
                {weeklyMovement.topCat !== '' && (
                  <>
                    <View style={s.weeklyDivider} />
                    <View style={s.weeklyStat}>
                      <Text style={s.weeklyStatVal} numberOfLines={1}>{weeklyMovement.topCat}</Text>
                      <Text style={s.weeklyStatLbl}>top group</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

          {/* Intelligence section — D-05: groups Articles + AI Advisor */}
          <View style={s.sectionHdr}>
            <Text style={s.sectionTitle}>Intelligence</Text>
          </View>

          {/* Longevity Research — now gated per PAY-05 */}
          <TouchableOpacity
            style={s.uploadCard}
            activeOpacity={0.82}
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
              isPremium ? nav.navigate('Articles') : nav.navigate('Paywall');
            }}
          >
            <ClipboardIcon color={Colors.dark.text} size={20} />
            <View style={s.uploadCardBody}>
              <Text style={s.uploadCardTitle}>Longevity Research</Text>
              <Text style={s.uploadCardSub}>Personalised PubMed articles for your biomarker profile</Text>
            </View>
            <Text style={s.uploadCardArrow}>→</Text>
          </TouchableOpacity>

          {/* AI Advisor — new, per D-04 and AI-06 */}
          <TouchableOpacity
            style={s.uploadCard}
            activeOpacity={0.82}
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
              isPremium ? nav.navigate('AIAdvisor') : nav.navigate('Paywall');
            }}
          >
            <DnaHelixIcon color={Colors.dark.text} size={20} />
            <View style={s.uploadCardBody}>
              <Text style={s.uploadCardTitle}>AI Advisor</Text>
              <Text style={s.uploadCardSub}>Ask about your biomarkers and protocol</Text>
            </View>
            <Text style={s.uploadCardArrow}>→</Text>
          </TouchableOpacity>

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
                  onPress={() => nav.getParent()?.navigate('Protocol')}
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
                    <Text style={[s.protoTime, taken && { color: Colors.viz.bioGreen }]}>
                      {taken ? 'Taken ✓' : '—'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  screenContainer: { flex: 1 },
  scroll: { flex: 1 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.base, paddingTop: Spacing.md },
  greetSmall: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted },
  greetName: { fontSize: Typography.sizes.h2, fontWeight: Typography.weights.subheadline, color: Colors.dark.text, marginTop: 2 },
  greetContext: { fontSize: Typography.sizes.caption, color: Colors.dark.textMuted, marginTop: 3, letterSpacing: 0.2 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.dark.cardBg, borderWidth: 0.5, borderColor: Colors.dark.cardBorder, alignItems: 'center', justifyContent: 'center' },
  bioCardWrapper: {
    marginHorizontal: Spacing.base, borderRadius: Radius.card, marginBottom: Spacing.base,
    backgroundColor: Colors.dark.bgElevated, borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
    overflow: 'hidden',
  },
  bioCardInner: { borderRadius: Radius.card, padding: Spacing.base, position: 'relative' },
  bioCardInnerCompact: { paddingVertical: Spacing.md },
  bioChevron: { position: 'absolute', top: Spacing.base, right: Spacing.base, fontSize: 20, color: Colors.dark.textMuted },
  bioLabel: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, letterSpacing: Typography.letterSpacing.widest, marginBottom: 6, fontWeight: Typography.weights.label, textTransform: 'uppercase' },
  bioNum: { fontSize: Typography.sizes.heroNumeral, color: Colors.dark.text, fontWeight: Typography.weights.displayHero, lineHeight: 74, fontVariant: ['tabular-nums'] },
  bioSub: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: 4 },
  bioEmptyState: { alignItems: 'flex-start', gap: 6, paddingVertical: Spacing.xs },
  bioEmptyHeadline: { fontSize: Typography.sizes.body, fontWeight: Typography.weights.headline, color: Colors.dark.text, marginTop: Spacing.sm, lineHeight: Typography.lineHeights.body },
  bioCtaBtn: { marginTop: Spacing.sm, backgroundColor: Colors.dark.ctaPrimary, borderRadius: Radius.full, paddingHorizontal: Spacing.base, paddingVertical: 10, alignSelf: 'flex-start' },
  bioCtaTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.bg, fontWeight: '600' },
  alertCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.dark.cardBg, borderColor: Colors.dark.statusWarnBorder, borderWidth: 0.5, borderRadius: Radius.card, padding: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: Spacing.base },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.viz.amber, marginBottom: 2 },
  alertTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, lineHeight: 16 },
  sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: Colors.dark.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },
  sectionLink: { fontSize: Typography.sizes.sm, color: Colors.viz.bioGreen },
  sectionAddBtn: { backgroundColor: Colors.dark.accentBg, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderWidth: 0.5, borderColor: Colors.dark.accentBorder },
  sectionAddTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.ctaPrimary, fontWeight: '600' },
  bmScroll: { paddingHorizontal: Spacing.base, gap: 10, paddingBottom: Spacing.base },
  bmCard: { width: 120, borderRadius: Radius.card, padding: Spacing.md, backgroundColor: Colors.dark.cardBg },
  bmCardWarning: { borderWidth: 0.5, borderColor: Colors.dark.statusWarnBorder },
  bmCardGood: { borderWidth: 0.5, borderColor: Colors.dark.statusOptimalBorder },
  bmCardNone: { borderWidth: 0.5, borderColor: Colors.dark.cardBorder },
  bmName: { fontSize: Typography.sizes.xs, marginBottom: 4 },
  bmVal: { fontSize: 22, fontWeight: '500', lineHeight: 26 },
  bmUnit: { fontSize: 10, color: Colors.dark.textMuted, marginBottom: 6 },
  bmBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
  bmBadgeWarn: { backgroundColor: Colors.dark.statusWarnBg, borderWidth: 0.5, borderColor: Colors.dark.statusWarnBorder },
  bmBadgeGood: { backgroundColor: Colors.dark.statusOptimalBg, borderWidth: 0.5, borderColor: Colors.dark.statusOptimalBorder },
  bmBadgeTxt: { fontSize: 9, fontWeight: '500' },
  bmBadgeEmpty: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10,
    backgroundColor: Colors.dark.cardBg, borderWidth: 0.5, borderColor: Colors.dark.border,
    alignSelf: 'flex-start',
  },
  bmBadgeEmptyTxt: { fontSize: 9, fontWeight: '500', color: Colors.dark.ctaPrimary },
  protocolCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.dark.cardBg, borderRadius: Radius.xl, marginBottom: Spacing.base, borderWidth: 0.5, borderColor: Colors.dark.cardBorder, padding: Spacing.md },
  protoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: Spacing.sm },
  protoItemBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.dark.border },
  protoDot: { width: 10, height: 10, borderRadius: 5 },
  protoDotTaken: { backgroundColor: Colors.viz.bioGreen },
  protoDotPending: { backgroundColor: Colors.dark.border },
  protoName: { flex: 1, fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.dark.text },
  protoTime: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted },
  protoEmpty: { alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  protoEmptyTxt: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted },
  protoEmptyCta: { backgroundColor: Colors.dark.accentBg, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5, borderColor: Colors.dark.accentBorder },
  protoEmptyCtaTxt: { fontSize: Typography.sizes.sm, color: Colors.dark.ctaPrimary, fontWeight: '500' },
  emptyStateCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.dark.cardBg, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.dark.cardBorder, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.base },
  emptyStateIconWrap: { marginBottom: Spacing.md },
  emptyStateHeading: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.dark.text, textAlign: 'center', marginBottom: Spacing.sm },
  emptyStateBody: { fontSize: Typography.sizes.body, fontWeight: '400', color: Colors.dark.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.lg },
  emptyStateCta: { backgroundColor: Colors.dark.ctaPrimary, borderRadius: Radius.xl, height: 48, paddingHorizontal: Spacing.base, justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch' },
  emptyStateCtaTxt: { color: Colors.dark.bg, fontSize: Typography.sizes.base, fontWeight: '600' },
  uploadCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base, backgroundColor: Colors.dark.cardBg, borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 0.5, borderColor: Colors.dark.cardBorder },
  exerciseCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base, backgroundColor: Colors.dark.cardBg, borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 0.5, borderColor: Colors.dark.cardBorder },
  uploadCardBody: { flex: 1 },
  uploadCardTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.dark.text },
  uploadCardSub: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: 2 },
  uploadCardArrow: { fontSize: Typography.sizes.md, color: Colors.dark.textMuted },
  weeklyCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    padding: Spacing.md,
  },
  weeklyLabel: {
    fontSize: Typography.sizes.xs, fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  weeklyRow: { flexDirection: 'row', alignItems: 'center' },
  weeklyStat: { flex: 1, alignItems: 'center' },
  weeklyStatVal: {
    fontSize: Typography.sizes.xl, fontWeight: '600',
    color: Colors.dark.text, lineHeight: 26,
  },
  weeklyStatLbl: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted, marginTop: 2,
  },
  weeklyDivider: {
    width: 0.5, height: 32,
    backgroundColor: Colors.dark.border,
  },
  // Email verification banner (D-12)
  verificationBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.statusWarnBg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.statusWarnBorder,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  verificationBannerTxt: {
    flex: 1,
    fontSize: Typography.sizes.bodySmall,
    color: Colors.viz.amber,
  },
  verificationBannerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  verificationBannerResend: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.viz.amber,
    fontWeight: '600',
  },
  verificationBannerDismiss: {
    fontSize: Typography.sizes.body,
    color: Colors.dark.textMuted,
  },
  // Verified toast (D-14)
  verifiedToast: {
    position: 'absolute',
    bottom: Spacing.xxl,
    alignSelf: 'center',
    backgroundColor: Colors.dark.statusOptimalBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    zIndex: 100,
    borderWidth: 0.5,
    borderColor: Colors.dark.statusOptimalBorder,
  },
  verifiedToastTxt: {
    color: Colors.viz.bioGreen,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: '600',
  },
});
