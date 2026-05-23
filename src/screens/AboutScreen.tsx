import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, Typography } from '../theme';

const VERSION = '1.0.0';
const BUILD = '1';

const EVIDENCE_GRADES = [
  { grade: 'A', desc: 'Strong evidence — multiple RCTs or large cohort studies' },
  { grade: 'B', desc: 'Moderate evidence — smaller trials or mechanistic data' },
  { grade: 'C', desc: 'Early evidence — animal studies or observational data' },
];

const BIOMARKER_RANGES = [
  { marker: 'ApoB', longevity: '<70 mg/dL', standard: '<100 mg/dL' },
  { marker: 'Fasting Glucose', longevity: '<90 mg/dL', standard: '<100 mg/dL' },
  { marker: 'hsCRP', longevity: '<1.0 mg/L', standard: '<3.0 mg/L' },
  { marker: 'Vitamin D', longevity: '50-80 ng/mL', standard: '30-100 ng/mL' },
  { marker: 'HbA1c', longevity: '<5.3%', standard: '<5.7%' },
];

export default function AboutScreen() {
  const nav = useNavigation();

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
          <Text style={s.heroVersion}>Version {VERSION} (Build {BUILD})</Text>
          <View style={s.pharmacistBadge}>
            <Text style={s.pharmacistTxt}>⚕ Built by a licensed pharmacist</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Our mission</Text>
          <Text style={s.bodyTxt}>
            Vitalspan translates longevity medicine into daily practice. We use the
            same biomarker targets and evidence grades used in leading longevity clinics —
            not the conservative ranges on your standard lab report.
          </Text>
        </View>

        {/* Why different ranges */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Longevity vs. standard ranges</Text>
          <Text style={s.bodyTxt}>
            Standard lab ranges flag disease. Our ranges are optimized for healthspan —
            decades of strong health, not just absence of illness.
          </Text>
          <View style={s.rangeTable}>
            <View style={s.rangeHeader}>
              <Text style={[s.rangeCell, s.rangeLabel, { flex: 1.2 }]}>Biomarker</Text>
              <Text style={[s.rangeCell, s.rangeLabel]}>Longevity</Text>
              <Text style={[s.rangeCell, s.rangeLabel]}>Standard</Text>
            </View>
            {BIOMARKER_RANGES.map(r => (
              <View key={r.marker} style={[s.rangeHeader, s.rangeRow]}>
                <Text style={[s.rangeCell, { flex: 1.2, color: Colors.textPrimary }]}>{r.marker}</Text>
                <Text style={[s.rangeCell, { color: Colors.primary }]}>{r.longevity}</Text>
                <Text style={[s.rangeCell, { color: Colors.textMuted }]}>{r.standard}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Evidence grades */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Evidence grading system</Text>
          {EVIDENCE_GRADES.map(eg => (
            <View key={eg.grade} style={s.gradeRow}>
              <View style={[s.gradeChip, eg.grade === 'A' ? s.gradeA : eg.grade === 'B' ? s.gradeB : s.gradeC]}>
                <Text style={s.gradeChipTxt}>{eg.grade}</Text>
              </View>
              <Text style={s.gradeTxt}>{eg.desc}</Text>
            </View>
          ))}
        </View>

        {/* PhenoAge */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Biological age calculation</Text>
          <Text style={s.bodyTxt}>
            Biological age is calculated using the Levine PhenoAge formula, published in{' '}
            <Text style={s.italic}>Aging Cell</Text> (2018). It requires 9 standard blood
            test biomarkers and has been validated in multiple large cohort studies.
          </Text>
          <Text style={s.citation}>
            Levine ME et al. "An epigenetic biomarker of aging for lifespan and healthspan."
            Aging Cell. 2018;17(4):e12748.
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerTitle}>Medical disclaimer</Text>
          <Text style={s.disclaimerTxt}>
            Vitalspan is a wellness tracking tool, not a medical device. It does not diagnose,
            treat, or cure any medical condition. All content is for educational and
            informational purposes only. Always consult a qualified healthcare provider
            before making changes to your medications, supplements, or health protocol.
          </Text>
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
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  closeBtn: { paddingVertical: Spacing.xs },
  closeTxt: { fontSize: Typography.sizes.base, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.textPrimary },
  scroll: { flex: 1 },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  heroTitle: { fontSize: 36, fontWeight: '300', color: Colors.textPrimary, letterSpacing: -0.5 },
  heroVersion: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: Spacing.xs },
  pharmacistBadge: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderWidth: 0.5,
    borderColor: Colors.primaryBorder,
  },
  pharmacistTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '500' },
  section: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  sectionTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  bodyTxt: { fontSize: Typography.sizes.base, color: Colors.textSecondary, lineHeight: 22 },
  italic: { fontStyle: 'italic' },
  citation: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  rangeTable: {
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  rangeHeader: { flexDirection: 'row', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm },
  rangeRow: { borderTopWidth: 0.5, borderTopColor: Colors.border, backgroundColor: Colors.bgCard },
  rangeCell: { flex: 1, fontSize: Typography.sizes.xs },
  rangeLabel: { fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  gradeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  gradeChip: { width: 28, height: 28, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  gradeA: { backgroundColor: Colors.primaryBg, borderWidth: 0.5, borderColor: Colors.primaryBorder },
  gradeB: { backgroundColor: Colors.warningBg, borderWidth: 0.5, borderColor: Colors.warningBorder },
  gradeC: { backgroundColor: Colors.bgSecondary, borderWidth: 0.5, borderColor: Colors.border },
  gradeChipTxt: { fontSize: Typography.sizes.xs, fontWeight: '700', color: Colors.textSecondary },
  gradeTxt: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  disclaimer: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.warningBg,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 0.5,
    borderColor: Colors.warningBorder,
  },
  disclaimerTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.warningText, marginBottom: Spacing.sm },
  disclaimerTxt: { fontSize: Typography.sizes.xs, color: Colors.warningText, lineHeight: 18 },
  credits: { alignItems: 'center', paddingVertical: Spacing.lg },
  creditsTxt: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  creditsVersion: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: Spacing.xs },
});
