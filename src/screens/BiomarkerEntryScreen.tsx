import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStatusBarStyle } from 'expo-status-bar';
import { Colors, ProductLayout, Spacing, Radius, Typography } from '../theme';
import type { Biomarker } from '../data/biomarkers';
import { getBiomarkers } from '../lib/biomarkerService';
import { markBiomarkerHistoryDirty, syncEntry } from '../lib/biomarkerWriteService';
import { RootStackParamList } from '../navigation/AppNavigator';
import RangeBar from '../components/RangeBar';
import BreathingCard from '../components/BreathingCard';
import { FIRST_RUN_CONTENT_MAP } from '../data/firstRunContent';
import { BIOMARKER_STATUS_LABELS, classifyBiomarkerValue } from '../lib/biomarkerInterpretation';
import { createStoredBiomarkerEntry, type StoredEntry } from '../types/biomarkerEntry';
import type { SourceLabRange } from '../types/biomarkerKnowledge';
import { captureAuthRequestScope, isAuthRequestScopeCurrent } from '../lib/supabase';

export type { StoredEntry } from '../types/biomarkerEntry';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Source = 'Blood test' | 'Home kit' | 'Hospital' | 'Private clinic';
type InputUnit = 'native' | 'mmol/L';

const SOURCES: Source[] = ['Blood test', 'Home kit', 'Hospital', 'Private clinic'];

// Biomarkers that have a common mmol/L alternate input unit
const MMOL_CONVERTIBLE: Record<string, { altUnit: string; toNative: (value: number) => number }> = {
  fastingglucose: { altUnit: 'mmol/L', toNative: value => value * 18.0182 },
  // NGSP (%) = 0.09148 × IFCC (mmol/mol) + 2.152
  hba1c: { altUnit: 'mmol/mol', toNative: value => 0.09148 * value + 2.152 },
};

function convertToNative(val: number, biomarkerId: string, inputUnit: InputUnit): number {
  if (inputUnit === 'native') return val;
  const conv = MMOL_CONVERTIBLE[biomarkerId];
  if (!conv) return val;
  return Math.round(conv.toNative(val) * 100) / 100;
}

export default function BiomarkerEntryScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'BiomarkerEntry'>>();
  const paramId = route.params?.biomarkerId;

  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [selected, setSelected] = useState<Biomarker | null>(null);
  const [search, setSearch] = useState('');
  const [value, setValue] = useState('');
  const [dateMode, setDateMode] = useState<'today' | 'yesterday' | 'other'>('today');
  const [customDate, setCustomDate] = useState('');
  const [source, setSource] = useState<Source>('Blood test');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [inputUnit, setInputUnit] = useState<InputUnit>('native');
  const [labRangeLow, setLabRangeLow] = useState('');
  const [labRangeHigh, setLabRangeHigh] = useState('');

  useEffect(() => {
    getBiomarkers().then(loaded => {
      setBiomarkers(loaded);
      // If a biomarkerId param was provided, set the selected biomarker once data is available
      if (paramId && selected === null) {
        const found = loaded.find(b => b.id === paramId) ?? null;
        setSelected(found);
      }
    }).catch(console.error);
  // Run once on mount — paramId and selected are intentionally excluded from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(useCallback(() => { setStatusBarStyle('dark'); return () => {}; }, []));

  const rawVal = parseFloat(value.replace(',', '.'));
  const numVal = selected ? convertToNative(rawVal, selected.id, inputUnit) : rawVal;
  const isValidValue = !isNaN(rawVal) && rawVal > 0;
  const canConvert = selected ? !!MMOL_CONVERTIBLE[selected.id] : false;
  const altUnit = selected ? MMOL_CONVERTIBLE[selected.id]?.altUnit : undefined;
  const reportedUnit = inputUnit === 'native' ? selected?.unit : altUnit;
  const parsedRangeLow = labRangeLow.trim() === '' ? undefined : parseFloat(labRangeLow.replace(',', '.'));
  const parsedRangeHigh = labRangeHigh.trim() === '' ? undefined : parseFloat(labRangeHigh.replace(',', '.'));
  const rangeHasInvalidValue =
    (parsedRangeLow !== undefined && !Number.isFinite(parsedRangeLow)) ||
    (parsedRangeHigh !== undefined && !Number.isFinite(parsedRangeHigh)) ||
    (parsedRangeLow !== undefined && parsedRangeHigh !== undefined && parsedRangeLow > parsedRangeHigh);
  const sourceLabRange: SourceLabRange | undefined =
    reportedUnit && !rangeHasInvalidValue && (parsedRangeLow !== undefined || parsedRangeHigh !== undefined)
      ? {
          lowerBound: parsedRangeLow,
          upperBound: parsedRangeHigh,
          unit: reportedUnit,
          reportedText: parsedRangeLow !== undefined && parsedRangeHigh !== undefined
            ? `${labRangeLow.trim()}–${labRangeHigh.trim()}`
            : parsedRangeLow !== undefined
              ? `≥${labRangeLow.trim()}`
              : `≤${labRangeHigh.trim()}`,
        }
      : undefined;
  const status = selected && isValidValue
    ? classifyBiomarkerValue(rawVal, reportedUnit, sourceLabRange)
    : null;

  const filtered = biomarkers.filter(bm =>
    bm.name.toLowerCase().includes(search.toLowerCase()) ||
    bm.categoryLabel.toLowerCase().includes(search.toLowerCase())
  );

  function getEntryDate(): string {
    if (dateMode === 'today') return new Date().toISOString();
    if (dateMode === 'yesterday') {
      const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString();
    }
    const parsed = new Date(customDate);
    return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  async function save() {
    if (!selected || !isValidValue || saving) return;
    const scope = captureAuthRequestScope();
    if (!scope) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
    setSaving(true);
    try {
      const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
      if (!isAuthRequestScopeCurrent(scope)) return;
      const entries: StoredEntry[] = raw ? JSON.parse(raw) : [];
      entries.push(createStoredBiomarkerEntry({
        biomarkerId: selected.id,
        value: numVal,
        unit: selected.unit,
        reportedValue: rawVal,
        reportedUnit,
        date: getEntryDate(),
        source,
        notes: notes.trim(),
        sourceLabRange,
      }));
      await AsyncStorage.setItem('@vitalspan_biomarkers', JSON.stringify(entries));
      if (!isAuthRequestScopeCurrent(scope)) return;
      await markBiomarkerHistoryDirty(scope);
      if (!isAuthRequestScopeCurrent(scope)) return;
      syncEntry(entries[entries.length - 1]);  // fire-and-forget — void return intentional
      nav.goBack();
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  }

  // ── Step 1: select biomarker ──────────────────────────────────────────────
  if (!selected) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={s.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Log Biomarker</Text>
          <View style={s.headerSpacer} />
        </View>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search biomarkers..."
          placeholderTextColor={Colors.health.inkTertiary}
          autoFocus
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map((bm, i) => (
            <TouchableOpacity
              key={bm.id}
              style={[s.pickRow, i < filtered.length - 1 && s.pickRowBorder]}
              onPress={() => setSelected(bm)}
            >
              <View style={s.pickInfo}>
                <Text style={s.pickName}>{bm.name}</Text>
                <Text style={s.pickUnit}>{bm.unit}</Text>
              </View>
              <View style={s.catBadge}>
                <Text style={s.catBadgeTxt}>{bm.categoryLabel}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Step 2: enter value ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => { if (paramId) nav.goBack(); else { setSelected(null); setValue(''); } }}>
          <Text style={s.cancel}>{paramId ? 'Cancel' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{selected.name}</Text>
        <View style={s.headerSpacer} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {selected !== null && FIRST_RUN_CONTENT_MAP[selected.id] !== undefined && (
          <BreathingCard style={s.explanationWrapper}>
            <View style={s.explanationInner}>
              <Text style={s.explanationIcon}>{FIRST_RUN_CONTENT_MAP[selected.id].icon}</Text>
              <Text style={s.explanationHeadline}>{FIRST_RUN_CONTENT_MAP[selected.id].headline}</Text>
              <Text style={s.explanationBody}>{FIRST_RUN_CONTENT_MAP[selected.id].body}</Text>
            </View>
          </BreathingCard>
        )}
        <View style={s.valueCard}>
          <TextInput
            style={s.valueInput}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor={Colors.health.inkTertiary}
            autoFocus
          />
          <Text style={s.valueUnit}>{inputUnit === 'native' ? selected.unit : (altUnit ?? selected.unit)}</Text>
        </View>
        {canConvert && altUnit && (
          <View style={s.unitConvertRow}>
            <Text style={s.unitConvertLabel}>Input in:</Text>
            {(['native', 'mmol/L'] as InputUnit[]).map(u => (
              <TouchableOpacity
                key={u}
                style={[s.unitChip, inputUnit === u && s.unitChipActive]}
                onPress={() => {
                  setInputUnit(u);
                  setValue('');
                  setLabRangeLow('');
                  setLabRangeHigh('');
                  Haptics.selectionAsync().catch(() => null);
                }}
              >
                <Text style={[s.unitChipTxt, inputUnit === u && s.unitChipTxtActive]}>
                  {u === 'native' ? selected.unit : altUnit}
                </Text>
              </TouchableOpacity>
            ))}
            {isValidValue && inputUnit !== 'native' && (
              <Text style={s.convertedVal}>= {numVal} {selected.unit}</Text>
            )}
          </View>
        )}

        {status && (
          <View style={[s.statusBadge,
            status === 'within_reported_range' ? s.statusWithin :
            status === 'outside_reported_range' ? s.statusOutside : s.statusNeutral,
          ]}>
            <Text style={[s.statusTxt,
              status === 'within_reported_range' ? s.statusTxtWithin :
              status === 'outside_reported_range' ? s.statusTxtOutside : s.statusTxtNeutral,
            ]}>
              {status === 'unable_to_classify' || status === 'needs_context'
                ? 'Source-laboratory classification unavailable'
                : BIOMARKER_STATUS_LABELS[status]}
            </Text>
          </View>
        )}

        <Text style={s.fieldLabel}>Reported laboratory range (optional)</Text>
        <Text style={s.rangeNote}>
          Enter the interval exactly as shown on the report, using {reportedUnit ?? selected.unit}.
        </Text>
        <View style={s.rangeInputRow}>
          <TextInput
            style={s.rangeInput}
            value={labRangeLow}
            onChangeText={setLabRangeLow}
            keyboardType="decimal-pad"
            placeholder="Low"
            placeholderTextColor={Colors.health.inkTertiary}
          />
          <Text style={s.rangeDash}>–</Text>
          <TextInput
            style={s.rangeInput}
            value={labRangeHigh}
            onChangeText={setLabRangeHigh}
            keyboardType="decimal-pad"
            placeholder="High"
            placeholderTextColor={Colors.health.inkTertiary}
          />
          <Text style={s.rangeUnit}>{reportedUnit ?? selected.unit}</Text>
        </View>
        {rangeHasInvalidValue && <Text style={s.rangeError}>Enter a valid laboratory interval.</Text>}

        <View style={s.section}>
          <RangeBar
            sourceLabRange={sourceLabRange}
            value={isValidValue ? rawVal : undefined}
            valueUnit={reportedUnit}
          />
        </View>

        <View style={s.knowledgeCard}>
          <Text style={s.knowledgeEyebrow}>RESEARCH TARGET</Text>
          <Text style={s.knowledgeValue}>{selected.target}</Text>
          <Text style={s.knowledgeContext}>Bundled research context · unreviewed · never substituted for the source laboratory interval.</Text>
          <View style={s.knowledgeRule} />
          <Text style={s.knowledgeHeading}>About</Text>
          <Text style={s.knowledgeBody}>{selected.description}</Text>
          <Text style={s.knowledgeHeading}>How to improve</Text>
          <Text style={s.knowledgeBody}>{selected.howToImprove}</Text>
          <Text style={s.knowledgeContext}>Educational context only; not individualized medical advice.</Text>
        </View>

        <Text style={s.fieldLabel}>Date</Text>
        <View style={s.chipRow}>
          {(['today', 'yesterday', 'other'] as const).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[s.chip, dateMode === mode && s.chipActive]}
              onPress={() => setDateMode(mode)}
            >
              <Text style={[s.chipTxt, dateMode === mode && s.chipTxtActive]}>
                {mode === 'today' ? 'Today' : mode === 'yesterday' ? 'Yesterday' : 'Other date'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {dateMode === 'other' && (
          <TextInput
            style={s.customDateInput}
            value={customDate}
            onChangeText={setCustomDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.health.inkTertiary}
          />
        )}

        <Text style={s.fieldLabel}>Source</Text>
        <View style={s.chipRow}>
          {SOURCES.map(src => (
            <TouchableOpacity
              key={src}
              style={[s.chip, source === src && s.chipActive]}
              onPress={() => setSource(src)}
            >
              <Text style={[s.chipTxt, source === src && s.chipTxtActive]}>{src}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.fieldLabel}>Notes (optional)</Text>
        <TextInput
          style={s.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add a note..."
          placeholderTextColor={Colors.health.inkTertiary}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[s.saveBtn, (!isValidValue || rangeHasInvalidValue || saving) && s.saveBtnDisabled]}
          onPress={save}
          disabled={!isValidValue || rangeHasInvalidValue || saving}
        >
          <Text style={s.saveBtnTxt}>{saving ? 'Saving…' : 'Save entry'}</Text>
        </TouchableOpacity>
        <View style={{ height: ProductLayout.bottomClearance }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.health.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, paddingHorizontal: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.health.rule },
  headerTitle: { fontSize: Typography.sizes.body, fontWeight: Typography.weights.label, color: Colors.health.ink },
  cancel: { fontSize: Typography.sizes.body, color: Colors.health.accent, minWidth: 64, fontWeight: Typography.weights.label },
  headerSpacer: { minWidth: 56 },
  searchInput: { marginHorizontal: Spacing.lg, marginVertical: Spacing.md, backgroundColor: Colors.health.surfaceStrong, borderRadius: Radius.card, padding: Spacing.md, fontSize: Typography.sizes.body, color: Colors.health.ink, borderWidth: 1, borderColor: Colors.health.rule },
  pickRow: { flexDirection: 'row', alignItems: 'center', minHeight: 64, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.health.background },
  pickRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.health.rule },
  pickInfo: { flex: 1 },
  pickName: { fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body, fontWeight: Typography.weights.headline, color: Colors.health.ink },
  pickUnit: { fontSize: Typography.sizes.caption, color: Colors.health.inkTertiary, marginTop: Spacing.xs },
  catBadge: { backgroundColor: Colors.health.accentSoft, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  catBadgeTxt: { fontSize: Typography.sizes.captionSmall, color: Colors.health.accent, fontWeight: Typography.weights.label },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  valueCard: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Colors.health.surfaceStrong, borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.health.rule, padding: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.sm },
  valueInput: { flex: 1, fontSize: Typography.sizes.display2, lineHeight: Typography.lineHeights.display2, fontWeight: Typography.weights.title, color: Colors.health.ink },
  valueUnit: { fontSize: Typography.sizes.body, color: Colors.health.inkSecondary, paddingBottom: Spacing.sm },
  statusBadge: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1, marginBottom: Spacing.base, borderWidth: 0.5 },
  statusWithin: { backgroundColor: Colors.health.accentSoft, borderColor: Colors.health.accent },
  statusOutside: { backgroundColor: Colors.health.attentionSoft, borderColor: Colors.health.attention },
  statusNeutral: { backgroundColor: Colors.health.neutralSoft, borderColor: Colors.health.ruleStrong },
  statusTxt: { fontSize: Typography.sizes.sm, fontWeight: '600' },
  statusTxtWithin: { color: Colors.health.accent },
  statusTxtOutside: { color: Colors.health.attention },
  statusTxtNeutral: { color: Colors.health.neutralInk },
  section: { marginBottom: Spacing.base },
  fieldLabel: { fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.captionSmall, fontWeight: Typography.weights.label, color: Colors.health.inkTertiary, textTransform: 'uppercase', letterSpacing: Typography.letterSpacing.wider, marginBottom: Spacing.sm, marginTop: Spacing.md },
  rangeNote: { fontSize: Typography.sizes.bodySmall, color: Colors.health.inkSecondary, lineHeight: Typography.lineHeights.bodySmall, marginBottom: Spacing.sm },
  rangeInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  rangeInput: { flex: 1, backgroundColor: Colors.health.surfaceStrong, borderRadius: Radius.card, padding: Spacing.md, fontSize: Typography.sizes.body, color: Colors.health.ink, borderWidth: 1, borderColor: Colors.health.rule },
  rangeDash: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.body },
  rangeUnit: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.caption, maxWidth: 72 },
  rangeError: { color: Colors.viz.coral, fontSize: Typography.sizes.xs, marginBottom: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { minHeight: 36, justifyContent: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.health.rule, backgroundColor: Colors.health.surface },
  chipActive: { backgroundColor: Colors.health.accentSoft, borderColor: Colors.health.accent },
  chipTxt: { fontSize: Typography.sizes.bodySmall, color: Colors.health.inkSecondary },
  chipTxtActive: { color: Colors.health.accent, fontWeight: Typography.weights.label },
  customDateInput: { backgroundColor: Colors.health.surfaceStrong, borderRadius: Radius.card, padding: Spacing.md, fontSize: Typography.sizes.body, color: Colors.health.ink, borderWidth: 1, borderColor: Colors.health.rule, marginBottom: Spacing.md },
  notesInput: { backgroundColor: Colors.health.surfaceStrong, borderRadius: Radius.card, padding: Spacing.md, fontSize: Typography.sizes.body, color: Colors.health.ink, borderWidth: 1, borderColor: Colors.health.rule, minHeight: 80, textAlignVertical: 'top', marginBottom: Spacing.xl },
  saveBtn: { minHeight: ProductLayout.controlMinHeight, justifyContent: 'center', backgroundColor: Colors.health.ink, borderRadius: Radius.card, paddingHorizontal: Spacing.base, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnTxt: { color: Colors.health.surfaceStrong, fontSize: Typography.sizes.body, fontWeight: Typography.weights.label },
  unitConvertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  unitConvertLabel: { fontSize: Typography.sizes.caption, color: Colors.health.inkTertiary },
  unitChip: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.health.rule, backgroundColor: Colors.health.surface },
  unitChipActive: { backgroundColor: Colors.health.accentSoft, borderColor: Colors.health.accent },
  unitChipTxt: { fontSize: Typography.sizes.caption, color: Colors.health.inkSecondary },
  unitChipTxtActive: { color: Colors.health.accent, fontWeight: Typography.weights.label },
  convertedVal: { fontSize: Typography.sizes.caption, color: Colors.health.accent, fontWeight: Typography.weights.headline },
  explanationWrapper: { marginBottom: Spacing.md },
  explanationInner: { backgroundColor: Colors.health.surface, borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.health.rule, padding: Spacing.base },
  explanationIcon: { fontSize: 24, marginBottom: Spacing.sm }, /* intentional — no Typography.sizes match for 24; kept as-is */
  explanationHeadline: { fontSize: Typography.sizes.h3, fontWeight: Typography.weights.headline, color: Colors.health.ink, marginBottom: Spacing.sm },
  explanationBody: { fontSize: Typography.sizes.body, fontWeight: Typography.weights.body, color: Colors.health.inkSecondary, lineHeight: Typography.lineHeights.body },
  knowledgeCard: { backgroundColor: Colors.health.surface, borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.health.rule, padding: Spacing.lg, marginBottom: Spacing.lg },
  knowledgeEyebrow: { color: Colors.health.accent, fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.wider },
  knowledgeValue: { color: Colors.health.ink, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: Typography.weights.headline, marginTop: Spacing.sm },
  knowledgeContext: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption, marginTop: Spacing.sm },
  knowledgeRule: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.health.rule, marginVertical: Spacing.lg },
  knowledgeHeading: { color: Colors.health.ink, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body, fontWeight: Typography.weights.label, marginTop: Spacing.md },
  knowledgeBody: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
});
