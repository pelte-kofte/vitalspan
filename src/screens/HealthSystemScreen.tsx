import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStatusBarStyle, StatusBar } from 'expo-status-bar';

import BodySystemIcon from '../components/health/BodySystemIcon';
import DisclosureSection from '../components/health/DisclosureSection';
import TrendSignal from '../components/health/TrendSignal';
import Text from '../components/health/HealthText';
import type { Biomarker } from '../data/biomarkers';
import { formatSourceLabRange } from '../lib/biomarkerInterpretation';
import { getBiomarkers } from '../lib/biomarkerService';
import { buildHealthExperience, formatHealthDate } from '../lib/healthExperience';
import { computePhenoAge, createPhenoAgeInputsFromEntries } from '../lib/phenoAge';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Radius, Spacing, Typography } from '../theme';
import type { StoredEntry } from '../types/biomarkerEntry';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'HealthSystem'>;

export default function HealthSystemScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();
  const { width } = useWindowDimensions();
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [age, setAge] = useState(0);

  const load = useCallback(async () => {
    const [definitions, entriesRaw, profileRaw] = await Promise.all([
      getBiomarkers(),
      AsyncStorage.getItem('@vitalspan_biomarkers'),
      AsyncStorage.getItem('@vitalspan_user_profile'),
    ]);
    setBiomarkers(definitions);
    setEntries(entriesRaw ? JSON.parse(entriesRaw) as StoredEntry[] : []);
    setAge(profileRaw ? (JSON.parse(profileRaw) as { age?: number }).age ?? 0 : 0);
  }, []);

  useFocusEffect(useCallback(() => {
    setStatusBarStyle('dark');
    void load();
    return () => undefined;
  }, [load]));

  const latestMap = useMemo(() => {
    const map = new Map<string, StoredEntry>();
    for (const entry of entries) {
      const current = map.get(entry.biomarkerId);
      if (!current || entry.date > current.date) map.set(entry.biomarkerId, entry);
    }
    return map;
  }, [entries]);
  const result = useMemo(() => computePhenoAge(createPhenoAgeInputsFromEntries(age, latestMap)), [age, latestMap]);
  const experience = useMemo(
    () => buildHealthExperience({ biomarkers, entries, phenoAge: result, healthData: null }),
    [biomarkers, entries, result],
  );
  const system = experience.systems.find(item => item.id === route.params.systemId);
  if (!system) return <SafeAreaView style={s.safe} />;

  const entriesByMarker = new Map(system.currentEntries.map(entry => [entry.biomarkerId, entry]));
  const withReviewedEvidence = system.biomarkers.filter(marker => marker.evidenceGrade && marker.evidenceGrade !== 'not_reviewed');
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[s.content, { width: Math.min(width, 720) }]} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} style={s.back} accessibilityRole="button" accessibilityLabel="Back to Health">
          <Text style={s.backChevron} accessible={false}>‹</Text><Text style={s.backText}>Health</Text><Text style={s.backGlyph}> / </Text><Text style={s.backMuted}>Body systems</Text>
        </Pressable>
        <View style={s.hero}>
          <View style={s.icon}><BodySystemIcon system={system.id} color={Colors.health.ink} size={Spacing.xxl + Spacing.sm} /></View>
          <Text maxFontSizeMultiplier={1.2} style={s.title}>{system.name}</Text>
          <Text style={[s.state, system.state === 'Needs review' && s.attention]}>{system.state}</Text>
          <Text style={s.driver}>{system.currentEntries.length > 0 ? system.driver : system.nextAction ?? 'Add a relevant laboratory result'}</Text>
          {system.currentEntries.length > 0 && <View style={s.heroMeta}><TrendSignal trend={system.trend} /><Text style={s.confidence}>{system.confidence} confidence</Text></View>}
        </View>

        <DisclosureSection title="Summary" summary={system.currentEntries.length > 0 ? system.changed : 'No assessment yet'}>
          <Text style={s.body}>{system.currentEntries.length > 0 ? `${system.changed}. This view is based on ${system.currentEntries.length} available measurements.` : 'Add a relevant laboratory result to begin this system assessment.'}</Text>
          <Text style={s.caution}>System states organize data; they are not diagnoses.</Text>
        </DisclosureSection>
        {system.currentEntries.length === 0 && <Pressable onPress={() => navigation.navigate('LabUpload')} style={s.primaryButton} accessibilityRole="button" accessibilityLabel="Add relevant laboratory data"><Text style={s.primaryButtonText}>Add relevant laboratory data</Text></Pressable>}
        <DisclosureSection title="Key biomarkers" summary={`${system.biomarkers.length} measurements can inform this system`} initiallyOpen={system.currentEntries.length > 0}>
          {system.currentEntries.length === 0 ? <Text style={s.body}>Relevant biomarkers are listed here once data is available.</Text> : system.biomarkers.map((marker, index) => {
            const entry = entriesByMarker.get(marker.id);
            return (
              <Pressable
                key={marker.id}
                style={[s.marker, index > 0 && s.markerRule]}
                onPress={() => navigation.navigate('BiomarkerDetail', { biomarkerId: marker.id })}
                accessibilityRole="button"
                accessibilityLabel={`${marker.name}. ${entry ? `${entry.reportedValue ?? entry.value} ${entry.reportedUnit ?? entry.unit ?? marker.unit}` : 'No data'}`}
              >
                <View style={s.markerName}><Text style={s.markerTitle}>{marker.name}</Text><Text style={s.markerDate}>{entry ? formatHealthDate(entry.date) : 'No collection'}</Text></View>
                <Text style={s.markerValue}>{entry ? `${entry.reportedValue ?? entry.value} ${entry.reportedUnit ?? entry.unit ?? marker.unit}` : 'No collection'}</Text>
              </Pressable>
            );
          })}
        </DisclosureSection>
        <DisclosureSection title="Historical trends" summary="Detailed charts open from each biomarker">
          <Text style={s.body}>Vitalspan summarizes meaningful direction first. Open a biomarker to inspect its dated measurements and detailed chart.</Text>
        </DisclosureSection>
        <DisclosureSection title="Clinical reference ranges" summary="Ranges preserved from source laboratories">
          {system.biomarkers.filter(marker => entriesByMarker.has(marker.id)).map(marker => (
            <Text key={marker.id} style={s.reference}>{marker.name}: {formatSourceLabRange(entriesByMarker.get(marker.id)?.sourceLabRange)}</Text>
          ))}
          {system.currentEntries.length === 0 && <Text style={s.body}>No source laboratory ranges are available.</Text>}
        </DisclosureSection>
        <DisclosureSection title="Longevity evidence" summary="Kept separate from clinical significance">
          <Text style={s.body}>{withReviewedEvidence.length > 0 ? `${withReviewedEvidence.length} biomarkers have reviewed evidence metadata.` : 'No reviewed longevity evidence is linked to this system yet. Legacy targets are not presented as clinical truth.'}</Text>
        </DisclosureSection>
        <DisclosureSection title="Important limitations" summary="Context that constrains interpretation">
          <Text style={s.body}>Laboratory ranges vary by assay, population, collection conditions, and clinical history. A system may be informed by the same measurement as another system. Missing data lowers confidence.</Text>
        </DisclosureSection>
        <DisclosureSection title="Relevant protocol actions" summary="Only reviewed actions appear here">
          <Text style={s.body}>No reviewed protocol action is linked to this system. Vitalspan does not promise treatment benefit.</Text>
        </DisclosureSection>
        <DisclosureSection title="Research links" summary="Source-level reading, when reviewed">
          <Text style={s.body}>No reviewed research links are available for this system yet.</Text>
        </DisclosureSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.health.background }, content: { alignSelf: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl * 2 },
  back: { flexDirection: 'row', alignItems: 'center', minHeight: Spacing.xxl + Spacing.md }, backChevron: { color: Colors.health.accent, fontSize: Typography.sizes.xxl, lineHeight: Typography.sizes.xxl, marginRight: Spacing.xs }, backText: { color: Colors.health.accent, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label }, backGlyph: { color: Colors.health.ruleStrong }, backMuted: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.bodySmall },
  hero: { paddingVertical: Spacing.lg }, icon: { width: Spacing.xxl * 2, height: Spacing.xxl * 2, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.health.ruleStrong, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  title: { color: Colors.health.ink, fontSize: Typography.sizes.display3, lineHeight: Typography.lineHeights.display3, fontWeight: Typography.weights.title }, state: { color: Colors.health.accent, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: Typography.weights.headline, marginTop: Spacing.md }, attention: { color: Colors.health.attention },
  driver: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body, marginTop: Spacing.sm, maxWidth: 520 }, heroMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.lg }, confidence: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.caption },
  body: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body }, caution: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption, marginTop: Spacing.md },
  primaryButton: { minHeight: Spacing.xxl + Spacing.base, justifyContent: 'center', alignItems: 'center', borderRadius: Radius.card, backgroundColor: Colors.health.ink, paddingHorizontal: Spacing.base, marginBottom: Spacing.lg }, primaryButtonText: { color: Colors.health.surfaceStrong, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
  marker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, paddingVertical: Spacing.md, minHeight: Spacing.xxl + Spacing.xl }, markerRule: { borderTopWidth: 1, borderTopColor: Colors.health.rule }, markerName: { flex: 1 }, markerTitle: { color: Colors.health.ink, fontSize: Typography.sizes.body, fontWeight: Typography.weights.headline }, markerDate: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, marginTop: Spacing.xs }, markerValue: { color: Colors.health.ink, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label, textAlign: 'right' },
  reference: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginBottom: Spacing.sm },
});
