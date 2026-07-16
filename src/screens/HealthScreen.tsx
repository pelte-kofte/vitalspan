import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Pressable, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStatusBarStyle } from 'expo-status-bar';

import BodySystemsList from '../components/health/BodySystemsList';
import HealthOverviewCard from '../components/health/HealthOverviewCard';
import HealthStateNote from '../components/health/HealthStateNote';
import Text from '../components/health/HealthText';
import type { Biomarker } from '../data/biomarkers';
import { getBiomarkers } from '../lib/biomarkerService';
import { buildHealthExperience, type BodySystemId } from '../lib/healthExperience';
import { loadHealthData, type HealthData } from '../lib/healthkit';
import { computePhenoAge, createPhenoAgeInputsFromEntries } from '../lib/phenoAge';
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
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [loadedBiomarkers, entriesRaw, profileRaw, loadedHealth] = await Promise.all([
      getBiomarkers(),
      AsyncStorage.getItem('@vitalspan_biomarkers'),
      AsyncStorage.getItem('@vitalspan_user_profile'),
      loadHealthData(),
    ]);
    setBiomarkers(loadedBiomarkers);
    setEntries(entriesRaw ? JSON.parse(entriesRaw) as StoredEntry[] : []);
    setProfile(profileRaw ? JSON.parse(profileRaw) as UserProfile : null);
    setHealthData(loadedHealth);
  }, []);

  useFocusEffect(useCallback(() => {
    setStatusBarStyle('dark');
    void load();
    return () => setStatusBarStyle('light');
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
    () => computePhenoAge(createPhenoAgeInputsFromEntries(profile?.age ?? 0, latestMap)),
    [latestMap, profile?.age],
  );
  const experience = useMemo(() => buildHealthExperience({ biomarkers, entries, phenoAge, healthData }), [biomarkers, entries, phenoAge, healthData]);

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
    else navigation.navigate('LabUpload');
  }, [experience.inputState, navigation, openSystem]);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[s.content, { width: Math.min(width, 720) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.health.accent} />}
      >
        <View style={s.header}>
          <View style={s.headerText}>
            <Text maxFontSizeMultiplier={1.15} style={s.kicker}>VITALSPAN / HEALTH</Text>
            <Text maxFontSizeMultiplier={1.2} style={s.title}>Your body, now.</Text>
            <Text style={s.subtitle}>A living map of what your data can—and cannot—say about your physiology.</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('LabUpload')} style={s.addButton} accessibilityRole="button" accessibilityLabel="Add health data">
            <Text style={s.addButtonText}>Add data</Text>
          </Pressable>
        </View>

        <HealthOverviewCard result={phenoAge} lastLabDate={experience.lastLabDate} overallTrend={experience.overallTrend} />

        {experience.inputState !== 'complete' && (
          <View style={s.sectionGap}>
            <HealthStateNote state={experience.inputState} copy={experience.emptyState} onAction={stateAction} />
          </View>
        )}

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
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },
  headerText: { flex: 1 },
  kicker: { color: Colors.health.accent, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest },
  title: { color: Colors.health.ink, fontSize: Typography.sizes.display3, lineHeight: Typography.lineHeights.display3, fontWeight: Typography.weights.title, letterSpacing: Typography.letterSpacing.tight, marginTop: Spacing.sm },
  subtitle: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body, maxWidth: 430, marginTop: Spacing.sm },
  addButton: { minHeight: Spacing.xxl + Spacing.md, justifyContent: 'center', borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.health.ruleStrong, paddingHorizontal: Spacing.md },
  addButtonText: { color: Colors.health.ink, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
  sectionGap: { marginTop: Spacing.base },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.base, marginTop: Spacing.xxl * 2, marginBottom: Spacing.base },
  sectionKicker: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest },
  sectionTitle: { color: Colors.health.ink, fontSize: Typography.sizes.h1, lineHeight: Typography.lineHeights.h1, fontWeight: Typography.weights.title, marginTop: Spacing.xs },
  sectionCount: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.caption, paddingBottom: Spacing.xs },
  footer: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.captionSmall, marginTop: Spacing.xl, textAlign: 'center', paddingHorizontal: Spacing.lg },
});
