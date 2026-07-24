import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  type TextProps,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import {
  ChangedSignalsSection,
  DailyBriefCard,
  HealthStateSection,
  SafetyAlertCard,
  TodayPriorityHero,
  TodayProtocolSection,
  TodaySectionHeading,
  TodaySkeleton,
  WeeklyResearchCard,
} from '../components/today/TodaySections';
import AnimatedPressable from '../components/AnimatedPressable';
import { GearIcon } from '../components/DesignSystemIcons';
import StaggerIn from '../components/StaggerIn';
import { usePremiumContext } from '../context/PremiumContext';
import { getAIAdvisorAccessState } from '../lib/premiumAccess';
import type { ExerciseLogEntry } from '../data/exercises';
import { useIssue } from '../hooks/useIssue';
import { assembleAdvisorContext, type AdvisorContext } from '../lib/advisorContext';
import { loadHealthData, type HealthData } from '../lib/healthkit';
import { getClinicalPhenoAgePresentation } from '../lib/clinicalPhenoAgePresentation';
import { loadBiomarkerHistory } from '../lib/biomarkerEntryService';
import {
  authSessionCoordinator,
  captureAuthRequestScope,
  isAuthRequestScopeCurrent,
  resendVerificationEmail,
} from '../lib/supabase';
import {
  buildTodayExperience,
  getTodayLayout,
  type TodayAction,
  type TodayProtocolItem,
} from '../lib/todayExperience';
import {
  MainTabParamList,
  RootStackParamList,
} from '../navigation/AppNavigator';
import { Colors, Radius, Spacing, Typography } from '../theme';
import type { StoredEntry } from '../types/biomarkerEntry';
import { EMPTY_PROTOCOL, type ProtocolState } from '../types/protocol';
import {
  PROTOCOL_STORAGE_KEY,
  parseProtocolState,
  persistProtocolState,
  toggleProtocolCompletion,
} from '../lib/protocolPersistence';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface UserProfile {
  name: string;
  age: number;
  biologicalAge?: number;
  bloodPhenotypicAge?: number;
  medications: string[];
}

const TODAY_DISMISSED_KEY = '@vitalspan_today_priority_dismissed';
const TODAY_TEXT_SECONDARY = 'rgba(232,245,238,0.66)';
const TODAY_TEXT_TERTIARY = 'rgba(232,245,238,0.46)';

function Text({ maxFontSizeMultiplier = 1.4, ...props }: TextProps) {
  return <NativeText maxFontSizeMultiplier={maxFontSizeMultiplier} {...props} />;
}

function parseDismissed(raw: string | null, today: string): Set<string> {
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as { date?: string; ids?: string[] };
    return parsed.date === today ? new Set(parsed.ids ?? []) : new Set();
  } catch {
    return new Set();
  }
}

function dateHeading(now: Date): string {
  return now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

/**
 * @deprecated Rollback-only legacy Home. No new feature development.
 * Remove only after at least two stable Today releases.
 */
export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { isPremium, isPremiumLoading } = usePremiumContext();
  const { width } = useWindowDimensions();
  const layout = getTodayLayout(width);
  const { issue, loading: issueLoading, error: issueError, onRefresh: refreshIssue } = useIssue();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [protocol, setProtocol] = useState<ProtocolState>(EMPTY_PROTOCOL);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogEntry[]>([]);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [advisorContext, setAdvisorContext] = useState<AdvisorContext | null>(null);
  const [dismissedPriorityIds, setDismissedPriorityIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const [verificationDismissed, setVerificationDismissed] = useState(false);
  const [showVerifiedToast, setShowVerifiedToast] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(enabled => mounted && setReduceMotion(enabled))
      .catch(() => null);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const loadData = useCallback(async (forceBiomarkerRefresh = false) => {
    const scope = captureAuthRequestScope();
    if (!scope) return;
    try {
      const [profileRaw, loadedEntries, protocolRaw, exerciseRaw, loadedHealth, dismissedRaw] = await Promise.all([
        AsyncStorage.getItem('@vitalspan_user_profile'),
        loadBiomarkerHistory(forceBiomarkerRefresh),
        AsyncStorage.getItem(PROTOCOL_STORAGE_KEY),
        AsyncStorage.getItem('@vitalspan_exercise_log'),
        loadHealthData(),
        AsyncStorage.getItem(TODAY_DISMISSED_KEY),
      ]);

      if (!isAuthRequestScopeCurrent(scope)) return;

      const nextProfile = profileRaw ? JSON.parse(profileRaw) as UserProfile : null;
      setProfile(nextProfile);
      setProtocol(parseProtocolState(protocolRaw).state);
      setExerciseLogs(exerciseRaw ? JSON.parse(exerciseRaw) as ExerciseLogEntry[] : []);
      setHealthData(loadedHealth);
      setDismissedPriorityIds(parseDismissed(dismissedRaw, new Date().toISOString().slice(0, 10)));

      const currentUser = authSessionCoordinator.getSnapshot().session?.user ?? null;

      setEntries(loadedEntries);

      try {
        const context = await assembleAdvisorContext();
        if (!isAuthRequestScopeCurrent(scope)) return;
        setAdvisorContext(context);
      } catch {
        setAdvisorContext(null);
      }

      if (currentUser && !currentUser.is_anonymous && currentUser.email && currentUser.app_metadata?.provider === 'email') {
        setUserEmail(currentUser.email);
        if (!currentUser.email_confirmed_at) {
          setShowVerificationBanner(true);
        } else {
          setShowVerificationBanner(false);
          const notified = await AsyncStorage.getItem('@vitalspan_email_verified_notified').catch(() => null);
          if (!isAuthRequestScopeCurrent(scope)) return;
          if (!notified) {
            await AsyncStorage.setItem('@vitalspan_email_verified_notified', 'true').catch(() => null);
            setShowVerifiedToast(true);
            if (toastTimer.current) clearTimeout(toastTimer.current);
            toastTimer.current = setTimeout(() => setShowVerifiedToast(false), 3000);
          }
        }
      }
    } catch (error) {
      if (!isAuthRequestScopeCurrent(scope)) return;
      console.error('[Today] data load failed', error);
      Alert.alert('Data error', 'Some saved data could not be read. Pull to refresh or review Settings if this continues.');
    } finally {
      if (isAuthRequestScopeCurrent(scope) && !hasLoadedOnce.current) {
        hasLoadedOnce.current = true;
        setInitialLoading(false);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [loadData]));

  const entryMap = useMemo(() => {
    const map = new Map<string, StoredEntry>();
    for (const entry of entries) {
      const current = map.get(entry.biomarkerId);
      if (!current || entry.date > current.date) map.set(entry.biomarkerId, entry);
    }
    return map;
  }, [entries]);

  const phenoResult = useMemo(() => {
    return getClinicalPhenoAgePresentation(profile?.age, entryMap);
  }, [entryMap, profile?.age]);

  useEffect(() => {
    if (!profile) return;
    const nextProfile = { ...profile };
    delete nextProfile.biologicalAge;
    if (phenoResult.valueYears === null) delete nextProfile.bloodPhenotypicAge;
    else nextProfile.bloodPhenotypicAge = phenoResult.valueYears;
    AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(nextProfile)).catch(() => null);
  }, [phenoResult.status, phenoResult.valueYears, profile]);

  const experience = useMemo(() => buildTodayExperience({
    profile,
    entries,
    phenoResult,
    protocol,
    exerciseLogs,
    advisorContext,
    dismissedPriorityIds,
    wearableConnected: Boolean(healthData?.lastSynced),
  }), [advisorContext, dismissedPriorityIds, entries, exerciseLogs, healthData?.lastSynced, phenoResult, profile, protocol]);

  const navigate = useCallback((action: TodayAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    switch (action.destination) {
      case 'AIAdvisor':
        if (getAIAdvisorAccessState(isPremium, isPremiumLoading) === 'loading') return;
        navigation.navigate(isPremium ? 'AIAdvisor' : 'Paywall');
        break;
      case 'BiomarkerDetail':
        navigation.navigate('BiomarkerDetail', { biomarkerId: action.params?.biomarkerId as string | undefined });
        break;
      case 'BiomarkerEntry':
        navigation.navigate('BiomarkerEntry', { biomarkerId: action.params?.biomarkerId as string | undefined });
        break;
      case 'Biomarkers':
      case 'Profile':
      case 'Protocol':
        navigation.navigate(action.destination);
        break;
      case 'GuidedFirstRun':
      case 'InteractionChecker':
      case 'LongevityScore':
        navigation.navigate(action.destination);
        break;
    }
  }, [isPremium, isPremiumLoading, navigation]);

  async function dismissPriority() {
    const next = new Set(dismissedPriorityIds);
    next.add(experience.priority.id);
    setDismissedPriorityIds(next);
    await AsyncStorage.setItem(TODAY_DISMISSED_KEY, JSON.stringify({
      date: new Date().toISOString().slice(0, 10),
      ids: Array.from(next),
    })).catch(() => null);
  }

  async function toggleProtocolItem(item: TodayProtocolItem) {
    if (!item.canToggle) return;
    const next = toggleProtocolCompletion(protocol, item.id);
    setProtocol(next);
    Haptics.selectionAsync().catch(() => null);
    await persistProtocolState(
      next,
      (key, value) => AsyncStorage.setItem(key, value),
    ).catch(() => null);
  }

  async function refresh() {
    setRefreshing(true);
    try {
      await Promise.all([loadData(true), refreshIssue()]);
    } finally {
      setRefreshing(false);
    }
  }

  async function resendVerification() {
    if (!userEmail) return;
    await resendVerificationEmail(userEmail);
    Haptics.selectionAsync().catch(() => null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {showVerificationBanner && !verificationDismissed ? (
        <View style={styles.verificationBanner} accessibilityRole="alert">
          <Text style={styles.verificationText}>Verify your email to protect account access.</Text>
          <View style={styles.verificationActions}>
            <Pressable onPress={resendVerification} accessibilityRole="button" accessibilityLabel="Resend verification email">
              <Text style={styles.verificationLink}>Resend</Text>
            </Pressable>
            <Pressable onPress={() => setVerificationDismissed(true)} accessibilityRole="button" accessibilityLabel="Dismiss verification reminder">
              <Text style={styles.verificationDismiss}>Close</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      {showVerifiedToast ? (
        <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
          <Text style={styles.toastText}>Account verified</Text>
        </View>
      ) : null}

      {initialLoading ? <TodaySkeleton reduceMotion={reduceMotion} /> : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingHorizontal: layout.horizontalPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.viz.bioGreen} />}
          accessibilityLabel="Today longevity briefing"
        >
          <StaggerIn index={0} reduceMotion={reduceMotion}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.date}>{dateHeading(new Date()).toUpperCase()}</Text>
                <Text style={styles.title} accessibilityRole="header">Today{profile?.name ? `, ${profile.name}` : ''}</Text>
                <Text style={styles.subtitle}>What matters most today.</Text>
              </View>
              <AnimatedPressable
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings')}
                accessibilityRole="button"
                accessibilityLabel="Open settings"
              >
                <GearIcon color={Colors.dark.text} size={20} />
              </AnimatedPressable>
            </View>
          </StaggerIn>

          {experience.safetyAlert ? (
            <StaggerIn index={1} reduceMotion={reduceMotion}>
              <SafetyAlertCard
                alert={experience.safetyAlert}
                onReview={() => navigate(experience.safetyAlert!.action)}
              />
            </StaggerIn>
          ) : null}

          <StaggerIn index={1} reduceMotion={reduceMotion}>
            <TodayPriorityHero
              priority={experience.priority}
              layout={layout.mode}
              onPrimaryAction={() => navigate(experience.priority.action)}
              onRequirementPress={biomarkerId => navigation.navigate('BiomarkerEntry', { biomarkerId })}
              onDecline={dismissPriority}
              reduceMotion={reduceMotion}
            />
          </StaggerIn>

          <StaggerIn index={2} reduceMotion={reduceMotion}>
            <DailyBriefCard
              brief={experience.brief}
              onAsk={() => navigate({ destination: 'AIAdvisor' })}
            />
          </StaggerIn>

          <StaggerIn index={3} reduceMotion={reduceMotion}>
            <TodayProtocolSection
              items={experience.protocolItems}
              onToggle={toggleProtocolItem}
              onOpenPlan={() => navigation.navigate('Protocol')}
              reduceMotion={reduceMotion}
            />
          </StaggerIn>

          <StaggerIn index={4} reduceMotion={reduceMotion}>
            <HealthStateSection
              state={experience.healthState}
              onOpen={() => navigation.navigate('LongevityScore')}
            />
          </StaggerIn>

          <StaggerIn index={5} reduceMotion={reduceMotion}>
            <ChangedSignalsSection
              signals={experience.changedSignals}
              emptyMessage={experience.changedSignalsEmptyMessage}
              onOpen={biomarkerId => navigation.navigate('BiomarkerDetail', { biomarkerId })}
            />
          </StaggerIn>

          <StaggerIn index={6} reduceMotion={reduceMotion}>
            {issue?.coverArticle ? (
              <WeeklyResearchCard
                issueNumber={issue.issueNumber}
                article={issue.coverArticle}
                onOpen={() => {
                  if (isPremium) navigation.navigate('Articles', { issueNumber: issue.issueNumber });
                  else navigation.navigate('Paywall');
                }}
              />
            ) : (
              <View style={styles.researchEmpty} testID="weekly-research">
                <TodaySectionHeading eyebrow="Weekly research" title="One study worth your time" />
                <Text style={styles.researchEmptyTitle}>{issueLoading ? 'Loading weekly research' : issueError ? 'Weekly research could not refresh' : 'The next issue is being edited'}</Text>
                <Text style={styles.researchEmptyBody}>{issueLoading ? 'Checking for the latest pharmacist-approved edition.' : issueError ? 'Check your connection and pull to refresh. No unreviewed research is substituted.' : 'The next pharmacist-approved edition will appear here after publication.'}</Text>
              </View>
            )}
          </StaggerIn>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  scroll: { flex: 1 },
  content: { paddingTop: Spacing.base, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xl },
  headerCopy: { flex: 1, paddingRight: Spacing.lg },
  date: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 1.55 },
  title: { color: Colors.dark.text, fontSize: 30, lineHeight: 36, fontWeight: '400', letterSpacing: -0.65, marginTop: 7 },
  subtitle: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.base, lineHeight: Typography.lineHeights.body, marginTop: 4 },
  settingsButton: { width: 44, height: 44, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.borderStrong, backgroundColor: 'rgba(255,255,255,0.035)', alignItems: 'center', justifyContent: 'center' },
  verificationBanner: { backgroundColor: Colors.dark.statusWarnBg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.dark.statusWarnBorder, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md },
  verificationText: { flex: 1, color: Colors.viz.amber, fontSize: Typography.sizes.caption },
  verificationActions: { flexDirection: 'row', gap: Spacing.md },
  verificationLink: { color: Colors.viz.amber, fontSize: Typography.sizes.caption, fontWeight: '700' },
  verificationDismiss: { color: Colors.dark.textMuted, fontSize: Typography.sizes.caption },
  toast: { position: 'absolute', zIndex: 10, top: 14, alignSelf: 'center', borderRadius: Radius.card, backgroundColor: Colors.dark.bgElevated, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.borderStrong, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  toastText: { color: Colors.viz.bioGreen, fontSize: Typography.sizes.caption, fontWeight: '600' },
  researchEmpty: { marginTop: 56, marginBottom: 56, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.border, paddingVertical: 28 },
  researchEmptyTitle: { color: Colors.dark.text, fontSize: Typography.sizes.lg, fontWeight: '500' },
  researchEmptyBody: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.base, lineHeight: Typography.lineHeights.body, marginTop: Spacing.sm },
});
