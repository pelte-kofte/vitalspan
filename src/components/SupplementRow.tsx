import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { WarningIcon } from './DesignSystemIcons';
import { getSupplementInfo, SupplementTiming, BestTime } from '../data/supplementTimings';

interface SuppData { name: string; dose: string; evidence: 'A' | 'B' | 'C'; dbId?: string }

interface Props {
  supp: SuppData;
  isAdded: boolean;
  isTaken: boolean;
  isExpanded: boolean;
  medications: string[];
  showBorder: boolean;
  onToggleTaken: () => void;
  onToggle: () => void;
  onToggleExpanded: () => void;
}

const EVIDENCE_STYLE: Record<string, { bg: string; color: string }> = {
  A: { bg: Colors.primaryBg,   color: Colors.primary },
  B: { bg: Colors.warningBg,   color: Colors.warning },
  C: { bg: Colors.bgSecondary, color: Colors.textMuted },
};

const TIMING_META: Record<SupplementTiming, { label: string; bg: string; color: string }> = {
  fasted:    { label: 'Fasted',    bg: Colors.accentBg,    color: Colors.accentDark },
  with_meal: { label: 'With meal', bg: Colors.primaryBg,   color: Colors.primary },
  with_fat:  { label: 'With fat',  bg: Colors.warningBg,   color: Colors.warning },
  flexible:  { label: 'Flexible',  bg: Colors.bgSecondary, color: Colors.textMuted },
  bedtime:   { label: 'Bedtime',   bg: Colors.bgSecondary, color: Colors.chartPurple },
};

const BEST_TIME_LABEL: Record<BestTime, string> = {
  morning:   '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening:   '🌆 Evening',
  bedtime:   '🌙 Bedtime',
  anytime:   '⏰ Anytime',
};

export default function SupplementRow({
  supp, isAdded, isTaken, isExpanded, medications,
  showBorder, onToggleTaken, onToggle, onToggleExpanded,
}: Props) {
  const info = supp.dbId ? getSupplementInfo(supp.dbId) : undefined;
  const ev = EVIDENCE_STYLE[supp.evidence];

  // Match user meds (case-insensitive) against separateFromMeds
  const conflicts: string[] = info?.separateFromMeds.flatMap(sep =>
    medications
      .filter(med => med.toLowerCase().includes(sep.drug.toLowerCase()))
      .map(med => sep.hours > 0 ? `Take ${sep.hours}h apart from ${med}` : `Caution with ${med}`)
  ) ?? [];

  return (
    <View style={[s.row, showBorder && s.rowBorder]}>
      {/* ── Top row ── */}
      <View style={s.topRow}>
        {isAdded ? (
          <TouchableOpacity
            onPress={onToggleTaken}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[s.dot, isTaken && s.dotTaken]} />
          </TouchableOpacity>
        ) : (
          <View style={s.dotDim} />
        )}

        <View style={s.suppInfo}>
          <Text style={[s.suppName, !isAdded && s.suppNameDim]}>{supp.name}</Text>
          {info && <Text style={s.shortDesc}>{info.shortDescription}</Text>}
          <Text style={s.suppDose}>{supp.dose}</Text>
        </View>

        <View style={[s.evidBadge, { backgroundColor: ev.bg }]}>
          <Text style={[s.evidTxt, { color: ev.color }]}>{supp.evidence}</Text>
        </View>

        <TouchableOpacity
          style={[s.addBtn, isAdded && s.addBtnAdded]}
          onPress={onToggle}
        >
          <Text style={[s.addBtnTxt, isAdded && s.addBtnTxtAdded]}>
            {isAdded ? 'Added ✓' : '+ Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Detail panel (only when added and db info exists) ── */}
      {isAdded && info && (
        <View style={s.details}>
          {/* Timing + best-time chips */}
          <View style={s.chipsRow}>
            <View style={[s.timingChip, { backgroundColor: TIMING_META[info.timing].bg }]}>
              <Text style={[s.timingChipTxt, { color: TIMING_META[info.timing].color }]}>
                {TIMING_META[info.timing].label}
              </Text>
            </View>
            <View style={s.bestTimeChip}>
              <Text style={s.bestTimeTxt}>{BEST_TIME_LABEL[info.bestTime]}</Text>
            </View>
          </View>

          {/* Medication separation warnings */}
          {conflicts.map((c, i) => (
            <View key={i} style={s.warnChip}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><WarningIcon color={Colors.semantic.warning} size={12} /><Text style={s.warnTxt}>{c}</Text></View>
            </View>
          ))}

          {/* Expandable timing rationale */}
          <TouchableOpacity style={s.whyRow} onPress={onToggleExpanded}>
            <Text style={s.whyTxt}>Why this timing?</Text>
            <Text style={s.whyArrow}>{isExpanded ? ' ▲' : ' ▼'}</Text>
          </TouchableOpacity>
          {isExpanded && <Text style={s.reasonTxt}>{info.reason}</Text>}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: { paddingVertical: Spacing.md },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  dot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border, marginTop: 4 },
  dotTaken: { backgroundColor: Colors.primaryLight },
  dotDim:   { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.bgShade, marginTop: 4 },
  suppInfo: { flex: 1 },
  suppName:    { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  suppNameDim: { color: Colors.textMuted },
  shortDesc:   { fontSize: Typography.sizes.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  suppDose:    { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  evidBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.sm, alignSelf: 'flex-start', marginTop: 2 },
  evidTxt:   { fontSize: 10, fontWeight: '700' },
  addBtn:       { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSecondary, alignSelf: 'flex-start', marginTop: 2 },
  addBtnAdded:  { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  addBtnTxt:      { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.textMuted },
  addBtnTxtAdded: { color: Colors.primary },
  // Detail panel
  details:  { marginTop: Spacing.sm, marginLeft: 18, gap: Spacing.xs + 1 },
  chipsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  timingChip:    { borderRadius: Radius.full, paddingHorizontal: Spacing.sm + 2, paddingVertical: 3 },
  timingChipTxt: { fontSize: Typography.sizes.xs, fontWeight: '600' },
  bestTimeChip: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm + 2, paddingVertical: 3, backgroundColor: Colors.bgSecondary, borderWidth: 0.5, borderColor: Colors.border },
  bestTimeTxt:  { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
  warnChip: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: Colors.warningBg, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderWidth: 0.5, borderColor: Colors.warningBorder },
  warnTxt:  { fontSize: Typography.sizes.xs, color: Colors.warningText, fontWeight: '500' },
  whyRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  whyTxt:  { fontSize: Typography.sizes.xs, color: Colors.primaryLight, fontWeight: '500' },
  whyArrow: { fontSize: 8, color: Colors.primaryLight },
  reasonTxt: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, lineHeight: 18, fontStyle: 'italic' },
});
