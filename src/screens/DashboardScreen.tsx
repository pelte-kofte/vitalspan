import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl, Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, resendVerificationEmail } from '../lib/supabase';
import { Colors, Spacing, Radius, Typography, Gradients } from '../theme';
import { RunnerIcon, BellIcon, DnaHelixIcon, ClipboardIcon, WarningIcon } from '../components/DesignSystemIcons';
import { BIOMARKERS, INTERACTIONS } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StoredEntry } from './BiomarkerEntryScreen';
import NeuralGrid from '../components/NeuralGrid';
import BreathingCard from '../components/BreathingCard';
import FutureSelf from '../components/FutureSelf';
import { computePhenoAge, PHENO_AGE_BIOMARKER_MAP, PhenoAgeInputs } from '../lib/phenoAge';
import { loadHealthData, deriveHealthState, HealthData } from '../lib/healthkit';
import { ExerciseLogEntry } from '../data/exercises';
import { usePremiumContext } from '../context/PremiumContext';

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
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const [showVerifiedToast, setShowVerifiedToast] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
        const pt: { addedSupplements?: string[]; customSupplements?: { name: string }[] } = JSON.parse(protocolFullRaw);
        setAddedSupplements([
          ...(pt.addedSupplements ?? []),
          ...(pt.customSupplements ?? []).map(cs => cs.name),
        ]);
      }

      // Email verification banner check (D-12, D-14) — reuses currentUser from above
      try {
        if (currentUser && !currentUser.is_anonymous && currentUser.email) {
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
              // Auto-dismiss toast after 3 seconds
              setTimeout(() => setShowVerifiedToast(false), 3000);
            }
          }
        }
      } catch { /* non-blocking — verification UI is best-effort */ }
    } catch (e) {
      console.error('[loadData] parse error', e);
      Alert.alert('Data error', 'Some saved data could not be read. If this persists, use Settings → Clear all data to reset.');
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

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  }, []);

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

  const medications = profile?.medications ?? [];
  const takenCount = medications.filter(m => takenItems.has(m)).length;

  const bioAge = phenoResult?.biologicalAge ?? null;
  const chronoAge = profile?.age ?? null;
  const yearsDiff = (bioAge != null && chronoAge != null) ? chronoAge - bioAge : 0;
  const missingForPhenoAge = phenoResult?.missingBiomarkers ?? [];

  // Reactive neural background
  const healthState = useMemo(() => deriveHealthState(healthData), [healthData]);
  const neuralTone = healthState === 'stressed' ? 'alert' : healthState === 'good' ? 'vital' : 'calm';

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
        <NeuralGrid intensity="low" tone={neuralTone} />

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
            <Text style={s.verifiedToastTxt}>Account verified!</Text>
          </View>
        )}

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
              <BellIcon color={Colors.onSurface} size={20} />
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
                <WarningIcon color={Colors.semantic.warning} size={14} />
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

          {entries.length === 0 ? (
            <View style={s.emptyStateCard}>
              <DnaHelixIcon color={Colors.onSurfaceMuted} size={40} />
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
          ) : (
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
          )}

          <TouchableOpacity
            style={s.uploadCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
              nav.navigate('LabUpload');
            }}
          >
            <ClipboardIcon color={Colors.onSurface} size={20} />
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
                <RunnerIcon color={Colors.onSurface} size={20} />
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
            style={[s.uploadCard, s.researchCard]}
            activeOpacity={0.82}
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
              isPremium ? nav.navigate('Articles') : nav.navigate('Paywall');
            }}
          >
            <ClipboardIcon color={Colors.onSurface} size={20} />
            <View style={s.uploadCardBody}>
              <Text style={s.uploadCardTitle}>Longevity Research</Text>
              <Text style={s.uploadCardSub}>Personalised PubMed articles for your biomarker profile</Text>
            </View>
            <Text style={s.uploadCardArrow}>→</Text>
          </TouchableOpacity>

          {/* AI Advisor — new, per D-04 and AI-06 */}
          <TouchableOpacity
            style={[s.uploadCard, s.aiAdvisorCard]}
            activeOpacity={0.82}
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
              isPremium ? nav.navigate('AIAdvisor') : nav.navigate('Paywall');
            }}
          >
            <DnaHelixIcon color={Colors.onSurface} size={20} />
            <View style={s.uploadCardBody}>
              <Text style={s.uploadCardTitle}>AI Advisor</Text>
              <Text style={s.uploadCardSub}>Personalised longevity insights powered by AI</Text>
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
  safe: { flex: 1, backgroundColor: Colors.surface },
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
    backgroundColor: Colors.surfaceElevated, borderWidth: 0.5, borderColor: Colors.border,
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
  emptyStateIconWrap: { marginBottom: Spacing.md },
  emptyStateHeading: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  emptyStateBody: { fontSize: Typography.sizes.body, fontWeight: '400', color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.lg },
  emptyStateCta: { backgroundColor: Colors.primary, borderRadius: Radius.xl, height: 48, paddingHorizontal: Spacing.base, justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch' },
  emptyStateCtaTxt: { color: Colors.bgCard, fontSize: Typography.sizes.base, fontWeight: '600' },
  uploadCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  exerciseCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base, backgroundColor: Colors.status.optimalBg, borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  uploadCardBody: { flex: 1 },
  uploadCardTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.textPrimary },
  uploadCardSub: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  uploadCardArrow: { fontSize: Typography.sizes.md, color: Colors.textMuted },
  researchCard: { backgroundColor: Colors.primaryBg },
  aiAdvisorCard: { backgroundColor: Colors.accentBg },
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
    backgroundColor: Colors.dark.cardBorder,
  },
  // Email verification banner (D-12)
  verificationBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.warningBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warningBorder,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  verificationBannerTxt: {
    flex: 1,
    fontSize: Typography.sizes.bodySmall,
    color: Colors.warningText,
  },
  verificationBannerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  verificationBannerResend: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.warning,
    fontWeight: '600',
  },
  verificationBannerDismiss: {
    fontSize: Typography.sizes.body,
    color: Colors.textMuted,
  },
  // Verified toast (D-14)
  verifiedToast: {
    position: 'absolute',
    bottom: Spacing.xxl,
    alignSelf: 'center',
    backgroundColor: Colors.semantic.success,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    zIndex: 100,
  },
  verifiedToastTxt: {
    color: Colors.surface,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: '600',
  },
});
