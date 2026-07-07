import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStatusBarStyle } from 'expo-status-bar';
import { Colors, Spacing, Radius, Typography, Motion, Elevation } from '../theme';
import type { Biomarker } from '../data/biomarkers';
import { getBiomarkers } from '../lib/biomarkerService';
import { syncEntry } from '../lib/biomarkerWriteService';
import { RootStackParamList } from '../navigation/AppNavigator';
import RangeBar from '../components/RangeBar';
import BreathingCard from '../components/BreathingCard';
import { FIRST_RUN_CONTENT_MAP } from '../data/firstRunContent';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Source = 'Blood test' | 'Home kit' | 'Hospital' | 'Private clinic';
type InputUnit = 'native' | 'mmol/L';

const SOURCES: Source[] = ['Blood test', 'Home kit', 'Hospital', 'Private clinic'];

// Biomarkers that have a common mmol/L alternate input unit
const MMOL_CONVERTIBLE: Record<string, { factor: number; altUnit: string }> = {
  fastingglucose: { factor: 18.018, altUnit: 'mmol/L' },  // mg/dL = mmol/L × 18.018
  hba1c: { factor: 10.929, altUnit: 'mmol/mol' },          // mmol/mol = % × 10.929 (divide mmol/mol by factor to get %)
};

function convertToNative(val: number, biomarkerId: string, inputUnit: InputUnit): number {
  if (inputUnit === 'native') return val;
  const conv = MMOL_CONVERTIBLE[biomarkerId];
  if (!conv) return val;
  return Math.round((val / conv.factor) * 100) / 100;
}

export interface StoredEntry {
  id: string;
  biomarkerId: string;
  value: number;
  date: string;
  source: string;
  notes: string;
}

export function getStatus(val: number, optMin: number, optMax: number) {
  if (val >= optMin && val <= optMax) return 'optimal';
  const buf = (optMax - optMin) * (2 / 3);
  if (val >= optMin - buf && val <= optMax + buf) return 'suboptimal';
  return 'out_of_range';
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

  useFocusEffect(useCallback(() => { setStatusBarStyle('light'); return () => {}; }, []));

  const rawVal = parseFloat(value.replace(',', '.'));
  const numVal = selected ? convertToNative(rawVal, selected.id, inputUnit) : rawVal;
  const isValidValue = !isNaN(rawVal) && rawVal > 0;
  const status = selected && isValidValue
    ? getStatus(numVal, selected.optMin, selected.optMax)
    : null;
  const canConvert = selected ? !!MMOL_CONVERTIBLE[selected.id] : false;
  const altUnit = selected ? MMOL_CONVERTIBLE[selected.id]?.altUnit : undefined;

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
    setSaving(true);
    try {
      const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
      const entries: StoredEntry[] = raw ? JSON.parse(raw) : [];
      entries.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        biomarkerId: selected.id,
        value: numVal,
        date: getEntryDate(),
        source,
        notes: notes.trim(),
      });
      await AsyncStorage.setItem('@vitalspan_biomarkers', JSON.stringify(entries));
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
          placeholderTextColor={Colors.dark.textMuted}
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
            placeholderTextColor={Colors.dark.textMuted}
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
                onPress={() => { setInputUnit(u); setValue(''); Haptics.selectionAsync().catch(() => null); }}
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
            status === 'optimal' ? s.statusOpt :
            status === 'suboptimal' ? s.statusSub : s.statusOut,
          ]}>
            <Text style={[s.statusTxt,
              status === 'optimal' ? s.statusTxtOpt :
              status === 'suboptimal' ? s.statusTxtSub : s.statusTxtOut,
            ]}>
              {status === 'optimal' ? '✓ Optimal' :
               status === 'suboptimal' ? '~ Suboptimal' : '⚠ Out of range'}
            </Text>
          </View>
        )}

        <View style={s.section}>
          <RangeBar
            optMin={selected.optMin}
            optMax={selected.optMax}
            value={isValidValue ? numVal : NaN}
            target={selected.target}
          />
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
            placeholderTextColor={Colors.dark.textMuted}
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
          placeholderTextColor={Colors.dark.textMuted}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[s.saveBtn, (!isValidValue || saving) && s.saveBtnDisabled]}
          onPress={save}
          disabled={!isValidValue || saving}
        >
          <Text style={s.saveBtnTxt}>{saving ? 'Saving…' : 'Save entry'}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, paddingTop: Spacing.md },
  headerTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.dark.text },
  cancel: { fontSize: Typography.sizes.base, color: Colors.dark.ctaPrimary, minWidth: 56 },
  headerSpacer: { minWidth: 56 },
  searchInput: { marginHorizontal: Spacing.base, marginBottom: Spacing.sm, backgroundColor: Colors.dark.inputBg, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base, color: Colors.dark.text, borderWidth: 0.5, borderColor: Colors.dark.inputBorder },
  pickRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: Colors.dark.bg },
  pickRowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.dark.border },
  pickInfo: { flex: 1 },
  pickName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.dark.text },
  pickUnit: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: 2 },
  catBadge: { backgroundColor: Colors.dark.accentBg, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderWidth: 0.5, borderColor: Colors.dark.accentBorder },
  catBadgeTxt: { fontSize: 10, color: Colors.dark.ctaPrimary, fontWeight: '500' },
  content: { padding: Spacing.base },
  valueCard: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Colors.dark.cardBg, borderRadius: Radius.xl, borderWidth: 0.5, borderColor: Colors.dark.cardBorder, padding: Spacing.base, marginBottom: Spacing.md, gap: Spacing.sm },
  valueInput: { flex: 1, fontSize: 44, fontWeight: '300', color: Colors.dark.text }, /* intentional — hero entry size, no Typography.sizes match */
  valueUnit: { fontSize: Typography.sizes.md, color: Colors.dark.textMuted, paddingBottom: 10 }, /* intentional — no Spacing.* equivalent for paddingBottom: 10 */
  statusBadge: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1, marginBottom: Spacing.base, borderWidth: 0.5 },
  statusOpt: { backgroundColor: Colors.dark.statusOptimalBg, borderColor: Colors.dark.statusOptimalBorder },
  statusSub: { backgroundColor: Colors.dark.statusWarnBg, borderColor: Colors.dark.statusWarnBorder },
  statusOut: { backgroundColor: Colors.dark.statusCritBg, borderColor: Colors.dark.statusCritBorder },
  statusTxt: { fontSize: Typography.sizes.sm, fontWeight: '600' },
  statusTxtOpt: { color: Colors.viz.bioGreen },
  statusTxtSub: { color: Colors.viz.amber },
  statusTxtOut: { color: Colors.viz.coral },
  section: { marginBottom: Spacing.base },
  fieldLabel: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.dark.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.dark.border, backgroundColor: Colors.dark.cardBg }, /* intentional — no Spacing.* equivalent for paddingVertical: 6 */
  chipActive: { backgroundColor: Colors.dark.accentBg, borderColor: Colors.dark.accentBorder },
  chipTxt: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted },
  chipTxtActive: { color: Colors.dark.ctaPrimary, fontWeight: '500' },
  customDateInput: { backgroundColor: Colors.dark.inputBg, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base, color: Colors.dark.text, borderWidth: 0.5, borderColor: Colors.dark.inputBorder, marginBottom: Spacing.md },
  notesInput: { backgroundColor: Colors.dark.inputBg, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base, color: Colors.dark.text, borderWidth: 0.5, borderColor: Colors.dark.inputBorder, minHeight: 80, textAlignVertical: 'top', marginBottom: Spacing.xl },
  saveBtn: { backgroundColor: Colors.dark.ctaPrimary, borderRadius: Radius.full, padding: Spacing.base, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnTxt: { color: Colors.dark.bg, fontSize: Typography.sizes.md, fontWeight: '600' },
  unitConvertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  unitConvertLabel: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted },
  unitChip: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.dark.border, backgroundColor: Colors.dark.cardBg },
  unitChipActive: { backgroundColor: Colors.dark.accentBg, borderColor: Colors.dark.accentBorder },
  unitChipTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted },
  unitChipTxtActive: { color: Colors.dark.ctaPrimary, fontWeight: '600' },
  convertedVal: { fontSize: Typography.sizes.xs, color: Colors.viz.bioGreen, fontWeight: '500' },
  explanationWrapper: { marginBottom: Spacing.md },
  explanationInner: { backgroundColor: Colors.dark.cardBg, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.dark.cardBorder, padding: Spacing.base },
  explanationIcon: { fontSize: 24, marginBottom: Spacing.sm }, /* intentional — no Typography.sizes match for 24; kept as-is */
  explanationHeadline: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.dark.text, marginBottom: Spacing.sm },
  explanationBody: { fontSize: Typography.sizes.body, fontWeight: '400', color: Colors.dark.textMuted, lineHeight: 24 },
});
