import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { BIOMARKERS, Biomarker } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StoredEntry } from './BiomarkerEntryScreen';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  { key: 'cardio', label: 'Cardiovascular' },
  { key: 'metabolic', label: 'Metabolic' },
  { key: 'inflammation', label: 'Inflammation' },
  { key: 'hormones', label: 'Hormones' },
  { key: 'vitamins', label: 'Vitamins' },
] as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatus(val: number, optMin: number, optMax: number) {
  if (val >= optMin && val <= optMax) return 'optimal';
  const buf = (optMax - optMin) * (2 / 3);
  if (val >= optMin - buf && val <= optMax + buf) return 'suboptimal';
  return 'out_of_range';
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

  function latestFor(biomarkerId: string): StoredEntry | null {
    return entries
      .filter(e => e.biomarkerId === biomarkerId)
      .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
  }

  function historyFor(biomarkerId: string): StoredEntry[] {
    return entries
      .filter(e => e.biomarkerId === biomarkerId)
      .sort((a, b) => b.date.localeCompare(a.date));
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
          <TouchableOpacity
            style={s.addBtnSmall}
            onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: selectedId })}
          >
            <Text style={s.addBtnSmallTxt}>+ Log</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero value */}
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

          {/* Status + target */}
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

          {/* Insight */}
          {latest && (
            <View style={s.insightCard}>
              <Text style={s.insightTxt}>{bm.insight}</Text>
            </View>
          )}

          {/* History */}
          <Text style={s.sectionLabel}>History</Text>
          <View style={s.card}>
            {history.length === 0 ? (
              <View style={s.emptyRow}>
                <Text style={s.emptyTxt}>No entries logged yet</Text>
              </View>
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

          {/* Description */}
          <Text style={s.sectionLabel}>About</Text>
          <View style={s.card}>
            <View style={s.textRow}>
              <Text style={s.bodyTxt}>{bm.description}</Text>
            </View>
          </View>

          {/* How to improve */}
          <Text style={s.sectionLabel}>How to improve</Text>
          <View style={s.card}>
            <View style={s.textRow}>
              <Text style={s.bodyTxt}>{bm.howToImprove}</Text>
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
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: undefined })}
        >
          <Text style={s.addBtnTxt}>+ Log</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map(cat => {
          const bms = BIOMARKERS.filter(b => b.category === cat.key);
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
  // List header
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: Spacing.base, paddingTop: Spacing.md },
  heading: { fontSize: Typography.sizes.xxl, fontWeight: '300', color: Colors.textPrimary },
  headingSub: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 2 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1 },
  addBtnTxt: { fontSize: Typography.sizes.sm, color: Colors.primaryBg, fontWeight: '600' },
  catLabel: { fontSize: 11, fontWeight: '500', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  listRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
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
  // Detail header
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, paddingTop: Spacing.md },
  back: { fontSize: Typography.sizes.base, color: Colors.primaryLight },
  addBtnSmall: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1 },
  addBtnSmallTxt: { fontSize: Typography.sizes.sm, color: Colors.primaryBg, fontWeight: '600' },
  // Detail hero
  detailHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.base, paddingBottom: Spacing.md },
  detailHeroLeft: { flex: 1 },
  detailName: { fontSize: Typography.sizes.xxl, fontWeight: '300', color: Colors.textPrimary },
  detailCat: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 2 },
  detailValGroup: { alignItems: 'flex-end' },
  detailVal: { fontSize: 44, fontWeight: '300', color: Colors.textPrimary },
  detailUnit: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  noData: { fontSize: Typography.sizes.md, color: Colors.textMuted, marginTop: 8 },
  // Status + target
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
  sectionLabel: { fontSize: Typography.sizes.xs, fontWeight: '500', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.7, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base },
  histRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  histLeft: { flex: 1 },
  histDate: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  histSource: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  histVal: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  histUnit: { fontSize: Typography.sizes.xs, color: Colors.textMuted, fontWeight: '400' },
  emptyRow: { padding: Spacing.md },
  emptyTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted },
  textRow: { padding: Spacing.md },
  bodyTxt: { fontSize: Typography.sizes.base, color: Colors.textSecondary, lineHeight: 22 },
});
