import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
  TextInput, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { BIOMARKERS } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StoredEntry, getStatus } from './BiomarkerEntryScreen';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  { key: 'cardio',        label: 'Cardiovascular' },
  { key: 'metabolic',     label: 'Metabolic' },
  { key: 'inflammation',  label: 'Inflammation' },
  { key: 'hormones',      label: 'Hormones' },
  { key: 'thyroid',       label: 'Thyroid' },
  { key: 'liver',         label: 'Liver Function' },
  { key: 'kidney',        label: 'Kidney Function' },
  { key: 'vitamins',      label: 'Vitamins & Minerals' },
  { key: 'cbc',           label: 'Complete Blood Count' },
  { key: 'metabolicPanel',label: 'Metabolic Panel' },
  { key: 'longevity',     label: 'Longevity' },
] as const;

// Precomputed at module level — BIOMARKERS is static
const BIOMARKERS_BY_CATEGORY = new Map(
  CATEGORIES.map(cat => [cat.key, BIOMARKERS.filter(b => b.category === cat.key)])
);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BiomarkerDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'BiomarkerDetail'>>();
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    route.params?.biomarkerId ?? null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const loadEntries = useCallback(() => {
    return AsyncStorage.getItem('@vitalspan_biomarkers')
      .then(raw => { if (raw) setEntries(JSON.parse(raw)); })
      .catch(console.error);
  }, []);

  useFocusEffect(
    useCallback(() => { loadEntries(); }, [loadEntries])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }

  async function saveEdit(entryId: string) {
    const parsed = parseFloat(editingValue);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid value', 'Enter a positive number.');
      return;
    }
    const updated = entries.map(e => e.id === entryId ? { ...e, value: parsed } : e);
    setEntries(updated);
    await AsyncStorage.setItem('@vitalspan_biomarkers', JSON.stringify(updated)).catch(console.error);
    setEditingId(null);
    setEditingValue('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  }

  // Single O(n) pass — builds sorted lists per biomarker
  const entryMap = useMemo(() => {
    const map = new Map<string, StoredEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.biomarkerId) ?? [];
      arr.push(e);
      map.set(e.biomarkerId, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => b.date.localeCompare(a.date));
    }
    return map;
  }, [entries]);

  function latestFor(biomarkerId: string): StoredEntry | null {
    return entryMap.get(biomarkerId)?.[0] ?? null;
  }

  function historyFor(biomarkerId: string): StoredEntry[] {
    return entryMap.get(biomarkerId) ?? [];
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  if (selectedId) {
    const bm = BIOMARKERS.find(b => b.id === selectedId)!;
    const latest = latestFor(selectedId);
    const history = historyFor(selectedId);
    const status = latest ? getStatus(latest.value, bm.optMin, bm.optMax) : null;

    return (
      <SafeAreaView style={s.safe}>
        <View style={s.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedId(null)}>
            <Text style={s.back}>← Biomarkers</Text>
          </TouchableOpacity>
          <View style={s.headerActions}>
            <TouchableOpacity
              style={s.uploadBtn}
              onPress={() => nav.navigate('LabUpload')}
            >
              <Text style={s.uploadBtnTxt}>📋 Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.addBtnSmall}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
                nav.navigate('BiomarkerEntry', { biomarkerId: selectedId });
              }}
            >
              <Text style={s.addBtnSmallTxt}>+ Log</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
        >
          <View style={s.detailHero}>
            <View style={s.detailHeroLeft}>
              <Text style={s.detailName}>{bm.name}</Text>
              <Text style={s.detailCat}>{bm.categoryLabel}</Text>
            </View>
            {latest ? (
              <View style={s.detailValGroup}>
                <Text style={s.detailVal}>{latest.value}</Text>
                <Text style={s.detailUnit}>{bm.unit}</Text>
              </View>
            ) : (
              <Text style={s.noData}>No data</Text>
            )}
          </View>

          <View style={s.metaRow}>
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
            <View style={s.targetBadge}>
              <Text style={s.targetTxt}>Target: {bm.target}</Text>
            </View>
          </View>

          {latest && (
            <View style={s.insightCard}>
              <Text style={s.insightTxt}>{bm.insight}</Text>
            </View>
          )}

          <Text style={s.sectionLabel}>History</Text>
          <View style={s.card}>
            {history.length === 0 ? (
              <View style={s.emptyHistRow}>
                <Text style={s.emptyTxt}>No entries logged yet</Text>
                <TouchableOpacity
                  style={s.logCta}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
                    nav.navigate('BiomarkerEntry', { biomarkerId: selectedId });
                  }}
                >
                  <Text style={s.logCtaTxt}>+ Log first entry →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              history.map((entry, i) => {
                const isEditing = editingId === entry.id;
                return (
                  <View key={entry.id} style={[s.histRow, i < history.length - 1 && s.rowBorder]}>
                    <View style={s.histLeft}>
                      <Text style={s.histDate}>{formatDate(entry.date)}</Text>
                      <Text style={s.histSource}>{entry.source}</Text>
                    </View>
                    {isEditing ? (
                      <View style={s.editRow}>
                        <TextInput
                          style={s.editInput}
                          value={editingValue}
                          onChangeText={setEditingValue}
                          keyboardType="decimal-pad"
                          autoFocus
                          selectTextOnFocus
                        />
                        <Text style={s.editUnit}>{bm.unit}</Text>
                        <TouchableOpacity style={s.editSaveBtn} onPress={() => saveEdit(entry.id)}>
                          <Text style={s.editSaveTxt}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.editCancelBtn} onPress={() => { setEditingId(null); setEditingValue(''); }}>
                          <Text style={s.editCancelTxt}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={s.histRight}>
                        <Text style={s.histVal}>{entry.value} <Text style={s.histUnit}>{bm.unit}</Text></Text>
                        <TouchableOpacity
                          style={s.editPencilBtn}
                          onPress={() => {
                            Haptics.selectionAsync().catch(() => null);
                            setEditingId(entry.id);
                            setEditingValue(String(entry.value));
                          }}
                        >
                          <Text style={s.editPencilTxt}>✎</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>

          <Text style={s.sectionLabel}>About</Text>
          <View style={s.card}>
            <Text style={s.bodyTxt}>{bm.description}</Text>
            <View style={s.citationRow}>
              <Text style={s.citationTxt}>
                References: Levine et al. Aging Cell 2018 · Attia, Outlive (2023) · Longevity Medicine Alliance guidelines
              </Text>
            </View>
          </View>

          <Text style={s.sectionLabel}>How to improve</Text>
          <View style={s.card}>
            <Text style={s.bodyTxt}>{bm.howToImprove}</Text>
            <View style={s.citationRow}>
              <Text style={s.citationTxt}>
                Pharmacist-reviewed · Evidence grade based on RCT + meta-analysis literature
              </Text>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.listHeader}>
        <View>
          <Text style={s.heading}>Biomarkers</Text>
          <Text style={s.headingSub}>Longevity-optimized ranges</Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity
            style={s.uploadBtn}
            onPress={() => nav.navigate('LabUpload')}
          >
            <Text style={s.uploadBtnTxt}>📋 Upload labs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: undefined })}
          >
            <Text style={s.addBtnTxt}>+ Log</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {entries.length === 0 && (
          <View style={s.emptyTabCard}>
            <Text style={s.emptyTabIcon}>📊</Text>
            <Text style={s.emptyTabHeading}>No biomarkers tracked yet</Text>
            <Text style={s.emptyTabBody}>
              Start with your most recent lab results. Three values unlock your biological age score.
            </Text>
            <TouchableOpacity
              activeOpacity={0.82}
              style={s.emptyTabCta}
              onPress={() => nav.navigate('GuidedFirstRun')}
            >
              <Text style={s.emptyTabCtaTxt}>Log Your First Result</Text>
            </TouchableOpacity>
          </View>
        )}
        {CATEGORIES.map(cat => {
          const bms = BIOMARKERS_BY_CATEGORY.get(cat.key) ?? [];
          if (bms.length === 0) return null;
          return (
            <View key={cat.key}>
              <Text style={s.catLabel}>{cat.label}</Text>
              <View style={s.card}>
                {bms.map((bm, i) => {
                  const latest = latestFor(bm.id);
                  const isOptimal = latest
                    ? latest.value >= bm.optMin && latest.value <= bm.optMax
                    : false;
                  return (
                    <TouchableOpacity
                      key={bm.id}
                      style={[s.listRow, i < bms.length - 1 && s.rowBorder]}
                      onPress={() => setSelectedId(bm.id)}
                    >
                      <View style={s.nameGroup}>
                        <Text style={s.bmName}>{bm.name}</Text>
                        <Text style={s.bmTarget}>Target: {bm.target}</Text>
                      </View>
                      {latest ? (
                        <View style={s.valGroup}>
                          <Text style={s.bmVal}>{latest.value}</Text>
                          <Text style={s.bmUnit}>{bm.unit}</Text>
                        </View>
                      ) : (
                        <Text style={s.noBmData}>—</Text>
                      )}
                      {latest ? (
                        <View style={[s.badge, isOptimal ? s.badgeGood : s.badgeWarn]}>
                          <Text style={[s.badgeTxt, isOptimal ? s.badgeTxtGood : s.badgeTxtWarn]}>
                            {isOptimal ? 'Optimal' : 'Review'}
                          </Text>
                        </View>
                      ) : (
                        <View style={s.badgeLog}>
                          <Text style={s.badgeLogTxt}>Tap to log</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: Spacing.base, paddingTop: Spacing.md },
  heading: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  headingSub: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  uploadBtn: { backgroundColor: Colors.bgCard, borderRadius: Radius.full, paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 1, borderWidth: 1, borderColor: Colors.border },
  uploadBtnTxt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1 },
  addBtnTxt: { fontSize: Typography.sizes.sm, color: Colors.primaryBg, fontWeight: '600' },
  catLabel: { fontSize: 11, fontWeight: '500', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    padding: Spacing.md,
  },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  nameGroup: { flex: 1 },
  bmName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  bmTarget: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  valGroup: { alignItems: 'flex-end', marginRight: Spacing.sm },
  bmVal: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  bmUnit: { fontSize: 10, color: Colors.textMuted },
  noBmData: { fontSize: Typography.sizes.lg, color: Colors.textMuted, marginRight: Spacing.sm },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeGood: { backgroundColor: Colors.status.optimalBg },
  badgeWarn: { backgroundColor: Colors.status.reviewBg },
  badgeTxt: { fontSize: 10, fontWeight: '600' },
  badgeTxtGood: { color: Colors.status.optimalText },
  badgeTxtWarn: { color: Colors.status.reviewText },
  badgeLog: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
    backgroundColor: Colors.bgSecondary, borderWidth: 0.5, borderColor: Colors.border,
  },
  badgeLogTxt: { fontSize: 10, fontWeight: '500', color: Colors.primaryLight },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, paddingTop: Spacing.md },
  back: { fontSize: Typography.sizes.base, color: Colors.primaryLight },
  addBtnSmall: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1 },
  addBtnSmallTxt: { fontSize: Typography.sizes.sm, color: Colors.primaryBg, fontWeight: '600' },
  detailHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.base, paddingBottom: Spacing.md },
  detailHeroLeft: { flex: 1 },
  detailName: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  detailCat: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 2 },
  detailValGroup: { alignItems: 'flex-end' },
  detailVal: { fontSize: 44, fontWeight: '300', color: Colors.textPrimary },
  detailUnit: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  noData: { fontSize: Typography.sizes.md, color: Colors.textMuted, marginTop: 8 },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, marginBottom: Spacing.base, flexWrap: 'wrap' },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5 },
  statusOpt: { backgroundColor: Colors.status.optimalBg, borderColor: Colors.status.optimalBorder },
  statusSub: { backgroundColor: Colors.status.reviewBg, borderColor: Colors.status.reviewBorder },
  statusOut: { backgroundColor: Colors.status.criticalBg, borderColor: Colors.status.criticalBorder },
  statusTxt: { fontSize: Typography.sizes.xs, fontWeight: '600' },
  statusTxtOpt: { color: Colors.status.optimalText },
  statusTxtSub: { color: Colors.status.reviewText },
  statusTxtOut: { color: Colors.status.criticalText },
  targetBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  targetTxt: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
  insightCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.status.optimalBg, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.base, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  insightTxt: { fontSize: Typography.sizes.sm, color: Colors.status.optimalText, lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base },
  histRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  histLeft: { flex: 1 },
  histDate: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  histSource: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  histRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  histVal: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  histUnit: { fontSize: Typography.sizes.xs, color: Colors.textMuted, fontWeight: '400' },
  editPencilBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.bgSecondary, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  editPencilTxt: { fontSize: 14, color: Colors.textMuted },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' },
  editInput: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4, fontSize: 16, fontWeight: '600', color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.primaryBorder, minWidth: 72, textAlign: 'right' },
  editUnit: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  editSaveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
  editSaveTxt: { fontSize: Typography.sizes.xs, color: Colors.primaryBg, fontWeight: '600' },
  editCancelBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.bgSecondary, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  editCancelTxt: { fontSize: 11, color: Colors.textMuted },
  emptyHistRow: { paddingVertical: Spacing.sm, gap: Spacing.sm },
  emptyTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted },
  logCta: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5, borderColor: Colors.primaryBorder, alignSelf: 'flex-start' },
  logCtaTxt: { fontSize: Typography.sizes.sm, color: Colors.primary, fontWeight: '500' },
  bodyTxt: { fontSize: Typography.sizes.base, color: Colors.textSecondary, lineHeight: 22 },
  citationRow: {
    marginTop: Spacing.md, paddingTop: Spacing.sm,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  citationTxt: {
    fontSize: 10, color: Colors.textMuted, fontStyle: 'italic', lineHeight: 15,
  },
  emptyTabCard: { marginHorizontal: Spacing.base, marginTop: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, padding: Spacing.xl, alignItems: 'center' },
  emptyTabIcon: { fontSize: 32, marginBottom: Spacing.md },
  emptyTabHeading: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  emptyTabBody: { fontSize: Typography.sizes.body, fontWeight: '400', color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.lg },
  emptyTabCta: { backgroundColor: Colors.primary, borderRadius: Radius.xl, height: 48, paddingHorizontal: Spacing.base, justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch' },
  emptyTabCtaTxt: { color: Colors.bgCard, fontSize: Typography.sizes.base, fontWeight: '600' },
});
