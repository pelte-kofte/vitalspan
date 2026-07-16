import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import BiomarkerTrendPlot from '../components/health/BiomarkerTrendPlot';
import DisclosureSection from '../components/health/DisclosureSection';
import TrendSignal from '../components/health/TrendSignal';
import Text from '../components/health/HealthText';
import type { Biomarker } from '../data/biomarkers';
import {
  BIOMARKER_STATUS_LABELS,
  classifyStoredEntry,
  formatSourceLabRange,
} from '../lib/biomarkerInterpretation';
import { getBiomarkers } from '../lib/biomarkerService';
import { deriveEntryTrend, formatHealthDate, freshnessLabel } from '../lib/healthExperience';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Radius, Spacing, Typography } from '../theme';
import type { StoredEntry } from '../types/biomarkerEntry';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'BiomarkerDetail'>;

export default function BiomarkerDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();
  const { width } = useWindowDimensions();
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [entries, setEntries] = useState<StoredEntry[]>([]);

  const load = useCallback(async () => {
    const [definitions, raw] = await Promise.all([getBiomarkers(), AsyncStorage.getItem('@vitalspan_biomarkers')]);
    setBiomarkers(definitions);
    setEntries(raw ? JSON.parse(raw) as StoredEntry[] : []);
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const biomarker = biomarkers.find(item => item.id === route.params?.biomarkerId);
  const history = useMemo(
    () => entries.filter(entry => entry.biomarkerId === route.params?.biomarkerId).sort((a, b) => b.date.localeCompare(a.date)),
    [entries, route.params?.biomarkerId],
  );
  const latest = history[0];
  const trend = deriveEntryTrend(history);

  if (!biomarker) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.fallback}>
          <Text style={s.fallbackTitle}>Biomarker unavailable</Text>
          <Text style={s.body}>Open a body system from Health to choose a biomarker.</Text>
          <Pressable onPress={() => navigation.goBack()} style={s.primaryButton}><Text style={s.primaryButtonText}>Back to Health</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const displayValue = latest?.reportedValue ?? latest?.value;
  const displayUnit = latest?.reportedUnit ?? latest?.unit ?? biomarker.unit;
  const status = latest ? classifyStoredEntry(latest) : null;
  const reviewedClinical = Boolean(biomarker.reviewer && biomarker.reviewedAt && biomarker.clinicalDecisionRules?.length);
  const reviewedEvidence = Boolean(biomarker.evidenceGrade && biomarker.evidenceGrade !== 'not_reviewed' && biomarker.citations?.length);
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={[s.content, { width: Math.min(width, 720) }]} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} style={s.back} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={s.backText}>Health / {biomarker.categoryLabel}</Text>
        </Pressable>
        <View style={s.hero}>
          <Text style={s.kicker}>BIOMARKER</Text>
          <Text maxFontSizeMultiplier={1.2} style={s.title}>{biomarker.name}</Text>
          {latest ? (
            <>
              <View style={s.valueRow}><Text maxFontSizeMultiplier={1.15} style={s.value}>{displayValue}</Text><Text style={s.unit}>{displayUnit}</Text></View>
              <TrendSignal trend={trend} />
            </>
          ) : <Text style={s.noData}>No measurement available</Text>}
        </View>

        <View style={s.provenance}>
          <View style={s.provenanceItem}><Text style={s.metaLabel}>SOURCE</Text><Text style={s.metaValue}>{latest?.source ?? 'Not available'}</Text></View>
          <View style={s.provenanceItem}><Text style={s.metaLabel}>COLLECTED</Text><Text style={s.metaValue}>{formatHealthDate(latest?.date ?? null)}</Text></View>
          <View style={s.provenanceItem}><Text style={s.metaLabel}>FRESHNESS</Text><Text style={s.metaValue}>{latest ? freshnessLabel(latest.date) : 'No data'}</Text></View>
          <View style={s.provenanceItem}><Text style={s.metaLabel}>UNIT</Text><Text style={s.metaValue}>{displayUnit}</Text></View>
        </View>

        <DisclosureSection title="Laboratory reference" summary={status ? BIOMARKER_STATUS_LABELS[status] : 'No measurement'} initiallyOpen>
          <Text style={s.sectionLead}>{latest ? formatSourceLabRange(latest.sourceLabRange) : 'No source laboratory range was provided.'}</Text>
          <Text style={s.body}>{status ? BIOMARKER_STATUS_LABELS[status] : 'Unable to classify without a measurement.'} This comparison uses the interval on the source report, not a Vitalspan target.</Text>
        </DisclosureSection>
        <DisclosureSection title="Clinical significance" summary={reviewedClinical ? 'Reviewed clinical context available' : 'Clinical review pending'}>
          <Text style={s.body}>{reviewedClinical ? 'Reviewed clinical decision context is available for this measurement.' : 'Clinical interpretation has not been reviewed for this biomarker. Vitalspan does not infer diagnosis or treatment from the legacy marker description.'}</Text>
        </DisclosureSection>
        <DisclosureSection title="Longevity evidence" summary={reviewedEvidence ? `${biomarker.evidenceGrade} evidence` : 'Research only; review pending'}>
          <Text style={s.body}>{reviewedEvidence ? `Evidence grade: ${biomarker.evidenceGrade}. Open the linked sources before applying this evidence to an individual.` : 'No reviewed longevity evidence is linked yet. Association research, laboratory reference intervals, and treatment targets are distinct concepts.'}</Text>
        </DisclosureSection>
        <DisclosureSection title="Historical trend" summary={`${history.length} collection${history.length === 1 ? '' : 's'}; chart on demand`}>
          <BiomarkerTrendPlot history={history} unit={displayUnit} />
          {history.map(entry => <Text key={entry.id} style={s.history}>{formatHealthDate(entry.date)} · {entry.reportedValue ?? entry.value} {entry.reportedUnit ?? entry.unit ?? biomarker.unit} · {entry.source}</Text>)}
        </DisclosureSection>
        <DisclosureSection title="Clinical context" summary="Assay, population, and collection details matter">
          <Text style={s.body}>Reference ranges vary by laboratory, assay, specimen, age, sex, fasting status, medications, and clinical history. Review an unexpected result with a qualified clinician.</Text>
        </DisclosureSection>
        <DisclosureSection title="Sources & research" summary="Reviewed links only">
          <Text style={s.body}>{biomarker.citations?.length ? `${biomarker.citations.length} reviewed citations are recorded.` : 'No reviewed research links are available for this biomarker yet.'}</Text>
        </DisclosureSection>
        <Pressable onPress={() => navigation.navigate('BiomarkerEntry', { biomarkerId: biomarker.id })} style={s.primaryButton} accessibilityRole="button">
          <Text style={s.primaryButtonText}>Add another result</Text>
        </Pressable>
        <Text style={s.disclaimer}>This screen separates the source laboratory reference, clinical significance, and longevity research. It does not promise treatment benefit.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.health.background }, content: { alignSelf: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl * 2 },
  back: { minHeight: Spacing.xxl + Spacing.lg, justifyContent: 'center' }, backText: { color: Colors.health.accent, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
  hero: { paddingVertical: Spacing.xxl }, kicker: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest }, title: { color: Colors.health.ink, fontSize: Typography.sizes.display3, lineHeight: Typography.lineHeights.display3, fontWeight: Typography.weights.title, marginTop: Spacing.sm },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, marginTop: Spacing.xl, marginBottom: Spacing.lg }, value: { color: Colors.health.ink, fontSize: Typography.sizes.display1, lineHeight: Typography.lineHeights.display1, fontWeight: Typography.weights.displayHero }, unit: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.body, paddingBottom: Spacing.sm }, noData: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.h3, marginTop: Spacing.xl },
  provenance: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg, borderWidth: 1, borderColor: Colors.health.rule, borderRadius: Radius.card, backgroundColor: Colors.health.surface, padding: Spacing.lg, marginBottom: Spacing.xxl }, provenanceItem: { flexGrow: 1, flexBasis: 120 }, metaLabel: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.wider }, metaValue: { color: Colors.health.ink, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
  sectionLead: { color: Colors.health.ink, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: Typography.weights.headline, marginBottom: Spacing.sm }, body: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body }, history: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption, marginTop: Spacing.sm },
  primaryButton: { minHeight: Spacing.xxl + Spacing.base, justifyContent: 'center', alignItems: 'center', borderRadius: Radius.card, backgroundColor: Colors.health.ink, paddingHorizontal: Spacing.base, marginTop: Spacing.xxl }, primaryButtonText: { color: Colors.health.surfaceStrong, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label }, disclaimer: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.captionSmall, textAlign: 'center', marginTop: Spacing.lg },
  fallback: { flex: 1, justifyContent: 'center', padding: Spacing.xl }, fallbackTitle: { color: Colors.health.ink, fontSize: Typography.sizes.h1, lineHeight: Typography.lineHeights.h1, fontWeight: Typography.weights.title, marginBottom: Spacing.sm },
});
