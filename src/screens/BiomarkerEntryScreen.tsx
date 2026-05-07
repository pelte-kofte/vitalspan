import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { BIOMARKERS, Biomarker } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';
import RangeBar from '../components/RangeBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Source = 'Blood test' | 'Home kit' | 'Hospital' | 'Private clinic';

const SOURCES: Source[] = ['Blood test', 'Home kit', 'Hospital', 'Private clinic'];

export interface StoredEntry {
  id: string;
  biomarkerId: string;
  value: number;
  date: string;
  source: string;
  notes: string;
}

function getStatus(val: number, optMin: number, optMax: number) {
  if (val >= optMin && val <= optMax) return 'optimal';
  const buf = (optMax - optMin) * (2 / 3);
  if (val >= optMin - buf && val <= optMax + buf) return 'suboptimal';
  return 'out_of_range';
}

export default function BiomarkerEntryScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'BiomarkerEntry'>>();
  const paramId = route.params?.biomarkerId;

  const [selected, setSelected] = useState<Biomarker | null>(
    () => (paramId ? BIOMARKERS.find(b => b.id === paramId) ?? null : null)
  );
  const [search, setSearch] = useState('');
  const [value, setValue] = useState('');
  const [dateMode, setDateMode] = useState<'today' | 'yesterday' | 'other'>('today');
  const [customDate, setCustomDate] = useState('');
  const [source, setSource] = useState<Source>('Blood test');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const numVal = parseFloat(value);
  const isValidValue = !isNaN(numVal) && numVal >= 0;
  const status = selected && isValidValue
    ? getStatus(numVal, selected.optMin, selected.optMax)
    : null;

  const filtered = BIOMARKERS.filter(bm =>
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
          placeholderTextColor={Colors.textMuted}
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

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.valueCard}>
          <TextInput
            style={s.valueInput}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />
          <Text style={s.valueUnit}>{selected.unit}</Text>
        </View>

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
            placeholderTextColor={Colors.textMuted}
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
          placeholderTextColor={Colors.textMuted}
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, paddingTop: Spacing.md },
  headerTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.textPrimary },
  cancel: { fontSize: Typography.sizes.base, color: Colors.primaryLight, minWidth: 56 },
  headerSpacer: { minWidth: 56 },
  searchInput: { marginHorizontal: Spacing.base, marginBottom: Spacing.sm, backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base, color: Colors.textPrimary, borderWidth: 0.5, borderColor: Colors.border },
  pickRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard },
  pickRowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  pickInfo: { flex: 1 },
  pickName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  pickUnit: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  catBadge: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderWidth: 0.5, borderColor: Colors.primaryBorder },
  catBadgeTxt: { fontSize: 10, color: Colors.primaryDark, fontWeight: '500' },
  content: { padding: Spacing.base },
  valueCard: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.base, marginBottom: Spacing.md, gap: Spacing.sm },
  valueInput: { flex: 1, fontSize: 44, fontWeight: '300', color: Colors.textPrimary },
  valueUnit: { fontSize: Typography.sizes.md, color: Colors.textMuted, paddingBottom: 10 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1, marginBottom: Spacing.base, borderWidth: 0.5 },
  statusOpt: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  statusSub: { backgroundColor: Colors.warningBg, borderColor: Colors.warningBorder },
  statusOut: { backgroundColor: Colors.dangerBg, borderColor: Colors.danger },
  statusTxt: { fontSize: Typography.sizes.sm, fontWeight: '600' },
  statusTxtOpt: { color: Colors.primaryDark },
  statusTxtSub: { color: Colors.warningText },
  statusTxtOut: { color: Colors.danger },
  section: { marginBottom: Spacing.base },
  fieldLabel: { fontSize: Typography.sizes.xs, fontWeight: '500', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  chipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  chipTxt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  chipTxtActive: { color: Colors.primaryDark, fontWeight: '500' },
  customDateInput: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base, color: Colors.textPrimary, borderWidth: 0.5, borderColor: Colors.border, marginBottom: Spacing.md },
  notesInput: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base, color: Colors.textPrimary, borderWidth: 0.5, borderColor: Colors.border, minHeight: 80, textAlignVertical: 'top', marginBottom: Spacing.xl },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: 16, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnTxt: { color: Colors.primaryBg, fontSize: Typography.sizes.md, fontWeight: '600' },
});
