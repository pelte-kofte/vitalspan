import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Pressable, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStatusBarStyle, StatusBar } from 'expo-status-bar';

import BodySystemsList from '../components/health/BodySystemsList';
import HealthOverviewCard from '../components/health/HealthOverviewCard';
import Text from '../components/health/HealthText';
import type { Biomarker } from '../data/biomarkers';
import { getBiomarkers } from '../lib/biomarkerService';
import { loadBiomarkerHistory } from '../lib/biomarkerEntryService';
import { buildHealthExperience, type BodySystemId } from '../lib/healthExperience';
import { loadHealthData, type HealthData } from '../lib/healthkit';
import { buildHealthLivingSphere } from '../lib/healthLivingSphere';
import { getClinicalPhenoAgePresentation } from '../lib/clinicalPhenoAgePresentation';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Radius, Spacing, Typography } from '../theme';
import type { StoredEntry } from '../types/biomarkerEntry';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface UserProfile {
  age?: number;
}

export default function HealthScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [assessmentAsOf, setAssessmentAsOf] = useState(() => new Date().toISOString());
  const [refreshing, setRefreshing] = useState(false);
  const reduceMotion = useReducedMotion();

  const load = useCallback(async () => {
    try {
      const [loadedBiomarkers, entriesRaw, profileRaw, loadedHealth] = await Promise.all([
        getBiomarkers(),
        loadBiomarkerHistory(),
        AsyncStorage.getItem('@vitalspan_user_profile'),
        loadHealthData(),
      ]);
      setBiomarkers(loadedBiomarkers);
      setEntries(entriesRaw);
      setProfile(profileRaw ? JSON.parse(profileRaw) as UserProfile : null);
      setHealthData(loadedHealth);
      setAssessmentAsOf(new Date().toISOString());
    } catch {
      // A source failure must leave the Health tab usable and explainable.
      setBiomarkers(current => current.length > 0 ? current : []);
      setEntries([]);
      setHealthData(null);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setStatusBarStyle('dark');
    void load();
    return () => undefined;
  }, [load]));

  const latestMap = useMemo(() => {
    const map = new Map<string, StoredEntry>();
    for (const entry of entries) {
      const latest = map.get(entry.biomarkerId);
      if (!latest || entry.date > latest.date) map.set(entry.biomarkerId, entry);
    }
    return map;
  }, [entries]);

  const phenoAge = useMemo(
    () => getClinicalPhenoAgePresentation(profile?.age, latestMap),
    [latestMap, profile?.age],
  );
  const experience = useMemo(() => buildHealthExperience({ biomarkers, entries, phenoAge, healthData }), [biomarkers, entries, phenoAge, healthData]);
  const livingSphere = useMemo(() => buildHealthLivingSphere({
    asOf: assessmentAsOf,
    biomarkers,
    entries,
    healthData,
    reduceMotion,
  }), [assessmentAsOf, biomarkers, entries, healthData, reduceMotion]);

  const openSystem = useCallback((systemId: BodySystemId) => {
    navigation.navigate('HealthSystem', { systemId });
  }, [navigation]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load().catch(() => null);
    setRefreshing(false);
  }, [load]);

  const stateAction = useCallback(() => {
    if (experience.inputState === 'complete') openSystem('cardiovascular');
    else navigation.navigate('AddResult');
  }, [experience.inputState, navigation, openSystem]);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[s.content, { width: Math.min(width, 720) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.health.accent} />}
      >
        <View style={s.header}>
          <View style={s.headerText}>
            <Text maxFontSizeMultiplier={1.15} style={s.kicker}>VITALSPAN / HEALTH</Text>
            <Text accessibilityRole="header" maxFontSizeMultiplier={1.2} style={s.title}>How healthy am I today?</Text>
            <Text style={s.subtitle}>What your available data can say now.</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('AddResult')} style={s.addButton} accessibilityRole="button" accessibilityLabel="Add a result">
            <Text style={s.addButtonText}>Add result</Text>
          </Pressable>
        </View>

        <HealthOverviewCard
          result={phenoAge}
          lastLabDate={experience.lastLabDate}
          sphere={livingSphere}
          actionLabel={experience.emptyState.actionLabel}
          onAction={stateAction}
        />

        <View style={s.sectionHeader}>
          <View>
            <Text style={s.sectionKicker}>PHYSIOLOGY MAP</Text>
            <Text style={s.sectionTitle}>Body systems</Text>
          </View>
          <Text style={s.sectionCount}>{experience.systems.length} systems</Text>
        </View>
        <BodySystemsList systems={experience.systems} onOpen={openSystem} />
        <Text style={s.footer}>Vitalspan organizes available data; it does not diagnose disease or promise treatment benefit.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.health.background },
  content: { alignSelf: 'center', paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxl * 2 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  headerText: { flex: 1 },
  kicker: { color: Colors.health.accent, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest },
  title: { color: Colors.health.ink, fontSize: Typography.sizes.display3, lineHeight: Typography.lineHeights.display3, fontWeight: Typography.weights.title, letterSpacing: Typography.letterSpacing.tight, marginTop: Spacing.sm },
  subtitle: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, maxWidth: 330, marginTop: Spacing.xs },
  addButton: { minHeight: Spacing.xxl + Spacing.md, justifyContent: 'center', borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.health.ruleStrong, paddingHorizontal: Spacing.md },
  addButtonText: { color: Colors.health.ink, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
  sectionGap: { marginTop: Spacing.base },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.base, marginTop: Spacing.xxl * 2, marginBottom: Spacing.base },
  sectionKicker: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest },
  sectionTitle: { color: Colors.health.ink, fontSize: Typography.sizes.h1, lineHeight: Typography.lineHeights.h1, fontWeight: Typography.weights.title, marginTop: Spacing.xs },
  sectionCount: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.caption, paddingBottom: Spacing.xs },
  footer: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.captionSmall, marginTop: Spacing.xl, textAlign: 'center', paddingHorizontal: Spacing.lg },
});
