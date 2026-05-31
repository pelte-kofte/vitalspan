import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { setStatusBarStyle } from 'expo-status-bar';
import { Colors, Spacing, Radius, Typography, Elevation } from '../theme';

const VERSION = Constants.expoConfig?.version ?? '—';

const EVIDENCE_GRADES = [
  { grade: 'A', desc: 'Strong evidence — multiple RCTs or large cohort studies', color: Colors.primary, bg: Colors.primaryBg, border: Colors.primaryBorder },
  { grade: 'B', desc: 'Moderate evidence — smaller trials or mechanistic data',   color: Colors.warning,  bg: Colors.warningBg,  border: Colors.warningBorder },
  { grade: 'C', desc: 'Early evidence — animal studies or observational data',    color: Colors.Beige.textMuted, bg: Colors.Beige.bgShade, border: Colors.Beige.border },
];

const BIOMARKER_RANGES = [
  { marker: 'ApoB',           longevity: '<70 mg/dL',    standard: '<100 mg/dL' },
  { marker: 'Fasting Glucose', longevity: '<90 mg/dL',   standard: '<100 mg/dL' },
  { marker: 'hsCRP',           longevity: '<1.0 mg/L',   standard: '<3.0 mg/L' },
  { marker: 'Vitamin D',       longevity: '50–80 ng/mL', standard: '30–100 ng/mL' },
  { marker: 'HbA1c',           longevity: '<5.3%',       standard: '<5.7%' },
  { marker: 'LDL-C',           longevity: '<70 mg/dL',   standard: '<130 mg/dL' },
];

const CITATIONS = [
  { id: '1', text: 'Levine ME et al. "An epigenetic biomarker of aging for lifespan and healthspan." Aging Cell. 2018;17(4):e12748. DOI: 10.1111/acel.12748' },
  { id: '2', text: 'Attia P. Outlive: The Science and Art of Longevity. Harmony Books. 2023.' },
  { id: '3', text: 'Katz DL et al. "Can We Say What Diet Is Best for Health?" Annu Rev Public Health. 2014;35:83–103.' },
  { id: '4', text: 'Bjelakovic G et al. "Mortality in Randomized Trials of Antioxidant Supplements." JAMA. 2007;297(8):842–857.' },
  { id: '5', text: 'Mills KT et al. "A Systematic Analysis of Worldwide Population-Based Data on the Global Burden of Nonalcoholic Fatty Liver Disease." J Hepatol. 2016;65(5):1087–98.' },
  { id: '6', text: 'Sinclair DA, LaPlante MD. Lifespan: Why We Age — and Why We Don\'t Have To. Atria Books. 2019.' },
  { id: '7', text: 'Fontana L et al. "Extending Healthy Life Span." Science. 2010;328(5976):321–326.' },
  { id: '8', text: 'Longevity Medicine Alliance. Biomarker Reference Intervals for Healthy Aging. 2022.' },
];

export default function AboutScreen() {
  const nav = useNavigation();
  const [citationsExpanded, setCitationsExpanded] = useState(false);
  const [disclaimerInfo, setDisclaimerInfo] = useState<{ version: string; acceptedAt: string } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@vitalspan_disclaimer_accepted')
      .then(raw => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            typeof parsed.version === 'string' &&
            typeof parsed.acceptedAt === 'string' &&
            !isNaN(new Date(parsed.acceptedAt).getTime())
          ) {
            setDisclaimerInfo(parsed as { version: string; acceptedAt: string });
          }
        } catch {
          // corrupt storage — leave as null (shows "Not yet accepted")
        }
      })
      .catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => { setStatusBarStyle('dark'); return () => {}; }, []));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.closeBtn}>
          <Text style={s.closeTxt}>Done</Text>
        </TouchableOpacity>
        <Text style={s.title}>About Vitalspan</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Vitalspan</Text>
          <Text style={s.heroVersion}>Version {VERSION}</Text>
          <View style={s.pharmacistBadge}>
            <Text style={s.pharmacistTxt}>⚕ Built by a licensed pharmacist</Text>
          </View>
        </View>

        {/* About the builder */}
        <View style={s.section}>
          <View style={s.founderRow}>
            <View style={s.founderAvatar}>
              <Text style={s.founderAvatarTxt}>Rx</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.founderName}>Dr. Bekircem Kusdemir, PharmD</Text>
              <Text style={s.founderCred}>PharmD · Clinical Pharmacist</Text>
            </View>
          </View>
          <Text style={s.founderPracticeFocus}>
            Longevity medicine, metabolic health optimization, and drug–supplement interaction safety.
          </Text>
          <Text style={s.bodyTxt}>
            Every biomarker range, supplement recommendation, and interaction warning in Vitalspan is pharmacist-reviewed. We hold ourselves to the standard of clinical practice — not wellness trends.
          </Text>
        </View>

        {/* Why pharmacist-built matters */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Why pharmacist-built matters</Text>
          <Text style={s.bodyTxt}>
            Most health apps are built by engineers, not clinicians. This leads to dangerous oversimplifications — recommending supplements without checking your medications, using population-average ranges rather than longevity targets, and missing critical interactions.
          </Text>
          <View style={s.whyPoint}>
            <Text style={s.whyIcon}>💊</Text>
            <Text style={s.whyTxt}>Every supplement recommendation checks your medication list for interactions using our pharmacist-curated database of 200+ drugs.</Text>
          </View>
          <View style={s.whyPoint}>
            <Text style={s.whyIcon}>🎯</Text>
            <Text style={s.whyTxt}>Biomarker targets are based on longevity medicine literature, not standard lab normals designed to detect disease.</Text>
          </View>
          <View style={s.whyPoint}>
            <Text style={s.whyIcon}>🔬</Text>
            <Text style={s.whyTxt}>Biological age is calculated using the validated Levine PhenoAge algorithm, not a proprietary black-box score.</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Our mission</Text>
          <Text style={s.bodyTxt}>
            Longevity medicine has existed in elite clinics for years. We're making it accessible — the same tools, the same biomarker targets, the same evidence-based protocols used by the world's leading longevity physicians.
          </Text>
        </View>

        {/* Longevity vs standard ranges */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Longevity vs. standard ranges</Text>
          <Text style={s.bodyTxt}>
            Standard lab ranges detect disease. Longevity ranges optimize for decades of strong health.
          </Text>
          <View style={s.rangeTable}>
            <View style={s.rangeHeaderRow}>
              <Text style={[s.rangeCell, s.rangeLabel, { flex: 1.2 }]}>Biomarker</Text>
              <Text style={[s.rangeCell, s.rangeLabel]}>Longevity</Text>
              <Text style={[s.rangeCell, s.rangeLabel]}>Standard</Text>
            </View>
            {BIOMARKER_RANGES.map(r => (
              <View key={r.marker} style={[s.rangeHeaderRow, s.rangeRow]}>
                <Text style={[s.rangeCell, { flex: 1.2, color: Colors.Beige.text }]}>{r.marker}</Text>
                <Text style={[s.rangeCell, { color: Colors.primary, fontWeight: '600' }]}>{r.longevity}</Text>
                <Text style={[s.rangeCell, { color: Colors.Beige.textMuted }]}>{r.standard}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Evidence grading */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Evidence grading system</Text>
          {EVIDENCE_GRADES.map(eg => (
            <View key={eg.grade} style={s.gradeRow}>
              <View style={[s.gradeChip, { backgroundColor: eg.bg, borderColor: eg.border }]}>
                <Text style={[s.gradeChipTxt, { color: eg.color }]}>{eg.grade}</Text>
              </View>
              <Text style={s.gradeTxt}>{eg.desc}</Text>
            </View>
          ))}
        </View>

        {/* PhenoAge */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Biological age calculation</Text>
          <Text style={s.bodyTxt}>
            Biological age uses the Levine PhenoAge formula (
            <Text style={s.italic}>Aging Cell</Text>, 2018). It requires 9 standard blood biomarkers and is validated across multiple large cohort studies. All math is transparent — no black-box scores.
          </Text>
          <View style={s.citationBlock}>
            <Text style={s.citationText}>
              Levine ME et al. Aging Cell. 2018;17(4):e12748.
            </Text>
          </View>
        </View>

        {/* Sources & Citations expandable */}
        <TouchableOpacity
          style={s.section}
          onPress={() => setCitationsExpanded(e => !e)}
          activeOpacity={0.8}
        >
          <View style={s.expandHeader}>
            <Text style={s.sectionTitle}>Sources & Citations</Text>
            <Text style={s.expandArrow}>{citationsExpanded ? '▲' : '▼'}</Text>
          </View>
          {citationsExpanded && (
            <View>
              {CITATIONS.map(c => (
                <View key={c.id} style={s.citationItem}>
                  <Text style={s.citationNum}>[{c.id}]</Text>
                  <Text style={s.citationItemText}>{c.text}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Medical disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerTitle}>Medical disclaimer</Text>
          <Text style={s.disclaimerTxt}>
            Vitalspan is a wellness tracking tool, not a medical device. It does not diagnose, treat, or cure any condition. All content is for educational purposes only. Always consult a qualified healthcare provider before making changes to your medications or supplements.
          </Text>
          <TouchableOpacity
            style={s.privacyLink}
            onPress={() => Linking.openURL('https://vitalspan.app/privacy')}
          >
            <Text style={s.privacyLinkTxt}>Privacy Policy →</Text>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={s.legalCard}>
          <Text style={s.legalTitle}>Legal</Text>
          <Text style={s.legalDisclaimerLine}>
            {disclaimerInfo ? `Medical disclaimer v${disclaimerInfo.version}` : 'Medical disclaimer v1.0'}
          </Text>
          <Text style={s.legalDateLine}>
            {disclaimerInfo
              ? `Accepted: ${new Date(disclaimerInfo.acceptedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
              : 'Not yet accepted'}
          </Text>
          <Text style={s.legalVersionLine}>{`App version: ${VERSION}`}</Text>
        </View>

        <View style={s.credits}>
          <Text style={s.creditsTxt}>Made with care for longevity.</Text>
          <Text style={s.creditsVersion}>v{VERSION}</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.Beige.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    backgroundColor: Colors.Beige.headerBg,
  },
  closeBtn: { paddingVertical: Spacing.xs },
  closeTxt: { fontSize: Typography.sizes.base, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.Beige.text },
  scroll: { flex: 1 },

  hero: { alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.base },
  heroTitle: { fontSize: 36, fontWeight: '300', color: Colors.Beige.text, letterSpacing: -0.5 },
  heroVersion: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginTop: Spacing.xs },
  pharmacistBadge: {
    marginTop: Spacing.md, backgroundColor: Colors.primaryBg,
    borderRadius: Radius.full, paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs,
    borderWidth: 0.5, borderColor: Colors.primaryBorder,
  },
  pharmacistTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '500' },

  section: {
    marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
    backgroundColor: Colors.Beige.card, borderRadius: Radius.xl,
    padding: Spacing.base, borderWidth: 0.5, borderColor: Colors.Beige.border,
    ...Elevation.sm,
  },
  expandHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expandArrow: { fontSize: 10, color: Colors.Beige.textMuted, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.Beige.text, marginBottom: Spacing.sm },
  bodyTxt: { fontSize: Typography.sizes.base, color: Colors.Beige.textSecondary, lineHeight: 22 },
  italic: { fontStyle: 'italic' },

  founderRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', marginBottom: Spacing.md },
  founderAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  founderAvatarTxt: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  founderName: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.Beige.text },
  founderCred: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginTop: 3 },
  founderPracticeFocus: { fontSize: Typography.sizes.xs, fontWeight: '400', color: Colors.Beige.textSecondary, marginTop: Spacing.sm },

  whyPoint: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  whyIcon: { fontSize: 16, width: 22 },
  whyTxt: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.Beige.textSecondary, lineHeight: 20 },

  rangeTable: {
    marginTop: Spacing.md, borderRadius: Radius.md,
    overflow: 'hidden', borderWidth: 0.5, borderColor: Colors.Beige.border,
  },
  rangeHeaderRow: { flexDirection: 'row', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm },
  rangeRow: { borderTopWidth: 0.5, borderTopColor: Colors.Beige.border, backgroundColor: Colors.Beige.card },
  rangeCell: { flex: 1, fontSize: Typography.sizes.xs },
  rangeLabel: { fontWeight: '600', color: Colors.Beige.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  gradeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  gradeChip: { width: 28, height: 28, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 0.5 },
  gradeChipTxt: { fontSize: Typography.sizes.xs, fontWeight: '700' },
  gradeTxt: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.Beige.textSecondary, lineHeight: 20 },

  citationBlock: {
    marginTop: Spacing.sm, backgroundColor: Colors.Beige.bgShade,
    borderRadius: Radius.sm, padding: Spacing.sm,
    borderLeftWidth: 2, borderLeftColor: Colors.primaryBorder,
  },
  citationText: { fontSize: 10, color: Colors.Beige.textMuted, fontStyle: 'italic', lineHeight: 16 },

  citationItem: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  citationNum: { fontSize: 10, fontWeight: '700', color: Colors.primary, width: 20 },
  citationItemText: { flex: 1, fontSize: 10, color: Colors.Beige.textMuted, lineHeight: 16 },

  disclaimer: {
    marginHorizontal: Spacing.base, marginBottom: Spacing.base,
    backgroundColor: Colors.warningBg, borderRadius: Radius.lg,
    padding: Spacing.base, borderWidth: 0.5, borderColor: Colors.warningBorder,
  },
  disclaimerTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.warningText, marginBottom: Spacing.sm },
  disclaimerTxt: { fontSize: Typography.sizes.xs, color: Colors.warningText, lineHeight: 18 },
  privacyLink: { marginTop: Spacing.sm },
  privacyLinkTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '500' },

  legalCard: {
    backgroundColor: Colors.Beige.bgShade, borderRadius: Radius.lg, borderWidth: 0.5,
    borderColor: Colors.Beige.border, padding: Spacing.base, marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm, borderLeftWidth: 2, borderLeftColor: Colors.primaryBorder,
  },
  legalTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.Beige.text, marginBottom: Spacing.sm },
  legalDisclaimerLine: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.Beige.textSecondary },
  legalDateLine: { fontSize: Typography.sizes.xs, fontWeight: '400' as const, color: Colors.Beige.textMuted, marginTop: Spacing.xs },
  legalVersionLine: { fontSize: Typography.sizes.xs, fontWeight: '400' as const, color: Colors.Beige.textMuted, marginTop: Spacing.sm },

  credits: { alignItems: 'center', paddingVertical: Spacing.lg },
  creditsTxt: { fontSize: Typography.sizes.sm, color: Colors.Beige.textMuted },
  creditsVersion: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginTop: Spacing.xs },
});
