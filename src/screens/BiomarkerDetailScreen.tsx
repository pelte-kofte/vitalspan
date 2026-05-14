import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { BIOMARKERS } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StoredEntry, getStatus } from './BiomarkerEntryScreen';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  { key: 'cardio', label: 'Cardiovascular' },
  { key: 'metabolic', label: 'Metabolic' },
  { key: 'inflammation', label: 'Inflammation' },
  { key: 'hormones', label: 'Hormones' },
  { key: 'vitamins', label: 'Vitamins' },
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
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('@vitalspan_biomarkers')
        .then(raw => { if (raw) setEntries(JSON.parse(raw)); })
        .catch(console.error);
    }, [])
  );

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
              onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: selectedId })}
            >
              <Text style={s.addBtnSmallTxt}>+ Log</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
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
              <Text style={s.emptyTxt}>No entries logged yet</Text>
            ) : (
              history.map((entry, i) => (
                <View key={entry.id} style={[s.histRow, i < history.length - 1 && s.rowBorder]}>
                  <View style={s.histLeft}>
                    <Text style={s.histDate}>{formatDate(entry.date)}</Text>
                    <Text style={s.histSource}>{entry.source}</Text>
                  </View>
                  <Text style={s.histVal}>{entry.value} <Text style={s.histUnit}>{bm.unit}</Text></Text>
                </View>
              ))
            )}
          </View>

          <Text style={s.sectionLabel}>About</Text>
          <View style={s.card}>
            <Text style={s.bodyTxt}>{bm.description}</Text>
          </View>

          <Text style={s.sectionLabel}>How to improve</Text>
          <View style={s.card}>
            <Text style={s.bodyTxt}>{bm.howToImprove}</Text>
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

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
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
                      <View style={[s.badge, latest ? (isOptimal ? s.badgeGood : s.badgeWarn) : s.badgeNone]}>
                        <Text style={[s.badgeTxt,
                          latest ? (isOptimal ? s.badgeTxtGood : s.badgeTxtWarn) : s.badgeTxtNone,
                        ]}>
                          {latest ? (isOptimal ? 'Optimal' : 'Review') : 'No data'}
                        </Text>
                      </View>
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
  heading: { fontSize: Typography.sizes.xxl, fontWeight: '300', color: Colors.textPrimary },
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
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
  badgeGood: { backgroundColor: Colors.primaryBg },
  badgeWarn: { backgroundColor: Colors.warningBg },
  badgeNone: { backgroundColor: Colors.bgSecondary },
  badgeTxt: { fontSize: 10, fontWeight: '600' },
  badgeTxtGood: { color: Colors.primary },
  badgeTxtWarn: { color: Colors.warning },
  badgeTxtNone: { color: Colors.textMuted },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, paddingTop: Spacing.md },
  back: { fontSize: Typography.sizes.base, color: Colors.primaryLight },
  addBtnSmall: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1 },
  addBtnSmallTxt: { fontSize: Typography.sizes.sm, color: Colors.primaryBg, fontWeight: '600' },
  detailHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.base, paddingBottom: Spacing.md },
  detailHeroLeft: { flex: 1 },
  detailName: { fontSize: Typography.sizes.xxl, fontWeight: '300', color: Colors.textPrimary },
  detailCat: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 2 },
  detailValGroup: { alignItems: 'flex-end' },
  detailVal: { fontSize: 44, fontWeight: '300', color: Colors.textPrimary },
  detailUnit: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  noData: { fontSize: Typography.sizes.md, color: Colors.textMuted, marginTop: 8 },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, marginBottom: Spacing.base, flexWrap: 'wrap' },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5 },
  statusOpt: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  statusSub: { backgroundColor: Colors.warningBg, borderColor: Colors.warningBorder },
  statusOut: { backgroundColor: Colors.dangerBg, borderColor: Colors.danger },
  statusTxt: { fontSize: Typography.sizes.xs, fontWeight: '600' },
  statusTxtOpt: { color: Colors.primary },
  statusTxtSub: { color: Colors.warningText },
  statusTxtOut: { color: Colors.danger },
  targetBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  targetTxt: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
  insightCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.primaryBg, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 0.5, borderColor: Colors.primaryBorder, marginBottom: Spacing.base },
  insightTxt: { fontSize: Typography.sizes.sm, color: Colors.primaryDark, lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '500', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base },
  histRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  histLeft: { flex: 1 },
  histDate: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  histSource: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  histVal: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  histUnit: { fontSize: Typography.sizes.xs, color: Colors.textMuted, fontWeight: '400' },
  emptyTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted },
  bodyTxt: { fontSize: Typography.sizes.base, color: Colors.textSecondary, lineHeight: 22 },
});
