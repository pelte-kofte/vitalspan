import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
  TextInput, Alert, Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStatusBarStyle } from 'expo-status-bar';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Spacing, Radius, Typography, Elevation } from '../theme';
import { ClipboardIcon, ChartBarIcon } from '../components/DesignSystemIcons';
import type { Biomarker } from '../data/biomarkers';
import { getBiomarkers } from '../lib/biomarkerService';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StoredEntry, getStatus } from './BiomarkerEntryScreen';
import { usePremiumContext } from '../context/PremiumContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ── Chart constants ───────────────────────────────────────────────────────────
const CHART_HEIGHT = 160;
const CHART_TOP_PAD = 16;
const CHART_BOTTOM_PAD = 32;
// rgba helpers — chart-kit color callbacks require rgba functions, not hex tokens
// values mirror Colors.primary and Colors.onSurfaceMuted from theme/index.ts
const PRIMARY_RGBA = (opacity: number): string => `rgba(45, 106, 79, ${opacity})`;
const SURFACE_MUTED_RGBA = (opacity: number): string => `rgba(107, 107, 100, ${opacity})`;

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

type TimeWindow = '30D' | '90D' | '365D';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BiomarkerDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'BiomarkerDetail'>>();
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    route.params?.biomarkerId ?? null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Premium gate (Adapty source of truth — never AsyncStorage)
  const { isPremium } = usePremiumContext();
  // Time-window toggle — default 90D (covers a typical quarterly lab cycle, D-05)
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('90D');

  const loadData = useCallback(() => {
    return Promise.all([
      getBiomarkers().then(setBiomarkers),
      AsyncStorage.getItem('@vitalspan_biomarkers')
        .then(raw => { if (raw) setEntries(JSON.parse(raw)); })
        .catch(console.error),
    ]).catch(console.error);
  }, []);

  useFocusEffect(
    useCallback(() => { void loadData(); }, [loadData])
  );

  useFocusEffect(useCallback(() => { setStatusBarStyle('dark'); return () => {}; }, []));

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
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

  const biomarkersByCategory = useMemo(
    () => new Map(CATEGORIES.map(cat => [cat.key, biomarkers.filter(b => b.category === cat.key)])),
    [biomarkers]
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
    const bm = biomarkers.find(b => b.id === selectedId);
    if (!bm) {
      // Unknown id (stale deep-link or deleted biomarker) — fall back to list
      setSelectedId(null);
      return null;
    }
    const latest = latestFor(selectedId);
    const history = historyFor(selectedId);
    const status = latest ? getStatus(latest.value, bm.optMin, bm.optMax) : null;

    // ── Premium gate + time-window filter (D-06: premium cap applied FIRST, then window on top) ──
    const cutoff30 = new Date();
    cutoff30.setDate(cutoff30.getDate() - 30);
    const cutoff30ISO = cutoff30.toISOString().slice(0, 10);
    const premiumFilteredHistory = isPremium
      ? history
      : history.filter(e => e.date >= cutoff30ISO);
    const hiddenCount = history.length - premiumFilteredHistory.length;

    // Time window filter applied on top of premium filter (anti-pattern: never reverse order)
    const windowDays = timeWindow === '30D' ? 30 : timeWindow === '90D' ? 90 : 365;
    const windowCutoff = new Date();
    windowCutoff.setDate(windowCutoff.getDate() - windowDays);
    const windowCutoffISO = windowCutoff.toISOString().slice(0, 10);
    const chartHistory = premiumFilteredHistory.filter(e => e.date >= windowCutoffISO);

    // Chart data arrays — reverse because history is date-DESC; chart needs ascending order
    const chartValues = [...chartHistory].reverse().map(e => e.value);
    const chartLabels = [...chartHistory].reverse().map(e => {
      const d = new Date(e.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const insightBg = status === 'optimal'
      ? Colors.status.optimalBg
      : status === 'suboptimal'
      ? Colors.status.reviewBg
      : Colors.status.criticalBg;
    const insightTextColor = status === 'optimal'
      ? Colors.status.optimalText
      : status === 'suboptimal'
      ? Colors.status.reviewText
      : Colors.status.criticalText;

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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><ClipboardIcon color={Colors.onSurface} size={16} /><Text style={s.uploadBtnTxt}>Upload</Text></View>
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
            <View style={[s.insightCard, { backgroundColor: insightBg }]}>
              <Text style={[s.insightTxt, { color: insightTextColor }]}>{bm.insight}</Text>
            </View>
          )}

          {/* Phase 22: Time-window segmented pill — same pattern as ExerciseScreen lines 231-245 */}
          <View style={s.segmentedControl}>
            {(['30D', '90D', '365D'] as TimeWindow[]).map(w => (
              <TouchableOpacity
                key={w}
                style={[s.segment, timeWindow === w && s.segmentActive]}
                onPress={() => {
                  setTimeWindow(w);
                  Haptics.selectionAsync().catch(() => null);
                }}
              >
                <Text style={[s.segmentTxt, timeWindow === w && s.segmentTxtActive]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Phase 22: Chart with SVG optimal-range band */}
          {(() => {
            const chartWidth = Dimensions.get('window').width - Spacing.base * 2 - Spacing.md * 2;
            if (chartValues.length < 2) {
              return (
                <View style={s.chartPlaceholder}>
                  <Text style={s.chartPlaceholderTxt}>Add at least 2 entries to see your trend.</Text>
                </View>
              );
            }
            // Y-coordinate math: chart plots dataMin at bottom, dataMax at top (y-axis inverted)
            const plotH = CHART_HEIGHT - CHART_TOP_PAD - CHART_BOTTOM_PAD;
            const dataMin = Math.min(...chartValues);
            const dataMax = Math.max(...chartValues);
            const dataRange = dataMax - dataMin || 1;
            const clampedOptMin = Math.max(bm.optMin, dataMin);
            const clampedOptMax = Math.min(bm.optMax, dataMax);
            const yTop = CHART_TOP_PAD + plotH * (1 - (clampedOptMax - dataMin) / dataRange);
            const yBot = CHART_TOP_PAD + plotH * (1 - (clampedOptMin - dataMin) / dataRange);

            return (
              <View style={{ width: chartWidth, height: CHART_HEIGHT, alignSelf: 'center' }}>
                {/* SVG range band behind the chart — absoluteFill pattern */}
                <Svg width={chartWidth} height={CHART_HEIGHT} style={StyleSheet.absoluteFill}>
                  <Rect
                    x={0}
                    y={yTop}
                    width={chartWidth}
                    height={Math.max(yBot - yTop, 0)}
                    fill={Colors.status.optimalBg}
                    fillOpacity={0.15}
                  />
                </Svg>
                {/* LineChart on top — chartConfig identical to ExerciseDetailScreen */}
                <LineChart
                  data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
                  width={chartWidth}
                  height={CHART_HEIGHT}
                  chartConfig={{
                    backgroundColor: Colors.surface,
                    backgroundGradientFrom: Colors.surface,
                    backgroundGradientTo: Colors.surface,
                    decimalPlaces: 1,
                    color: PRIMARY_RGBA,
                    labelColor: SURFACE_MUTED_RGBA,
                    propsForDots: { r: '3', strokeWidth: '1', stroke: Colors.primary },
                    propsForBackgroundLines: { stroke: Colors.borderLight },
                  }}
                  bezier
                  withShadow={false}
                  withOuterLines={false}
                  style={{ borderRadius: Radius.lg }}
                />
              </View>
            );
          })()}

          {/* Phase 22: Upgrade banner — only for non-premium users with gated history */}
          {!isPremium && hiddenCount > 0 && (
            <TouchableOpacity
              style={s.upgradeBanner}
              onPress={() => nav.navigate('Paywall')}
              activeOpacity={0.8}
            >
              <View style={s.upgradeBannerLeft}>
                <Text style={s.upgradeBannerIcon}>{'🔒'}</Text>
                <Text style={s.upgradeBannerTxt}>{hiddenCount} entries hidden — upgrade to see your full history.</Text>
              </View>
              <View style={s.upgradeCta}>
                <Text style={s.upgradeCtaTxt}>Upgrade</Text>
              </View>
            </TouchableOpacity>
          )}

          <Text style={s.sectionLabel}>History</Text>
          <View style={s.card}>
            {premiumFilteredHistory.length === 0 ? (
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
              premiumFilteredHistory.map((entry, i) => {
                const isEditing = editingId === entry.id;
                return (
                  <View key={entry.id} style={[s.histRow, i < premiumFilteredHistory.length - 1 && s.rowBorder]}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><ClipboardIcon color={Colors.onSurface} size={16} /><Text style={s.uploadBtnTxt}>Upload labs</Text></View>
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
            <ChartBarIcon color={Colors.onSurfaceMuted} size={32} />
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
          const bms = biomarkersByCategory.get(cat.key) ?? [];
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
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: Spacing.base, paddingTop: Spacing.md, backgroundColor: Colors.surface },
  heading: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.onSurface },
  headingSub: { fontSize: Typography.sizes.sm, color: Colors.onSurfaceMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  uploadBtn: { backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 1, borderWidth: 1, borderColor: Colors.borderLight },
  uploadBtnTxt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1 },
  addBtnTxt: { fontSize: Typography.sizes.sm, color: Colors.primaryBg, fontWeight: '600' },
  catLabel: { fontSize: Typography.sizes.xs, fontWeight: '500', color: Colors.onSurfaceMuted, textTransform: 'uppercase', letterSpacing: 1.5, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    ...Elevation.sm,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  nameGroup: { flex: 1 },
  bmName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.onSurface },
  bmTarget: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, marginTop: 2 },
  valGroup: { alignItems: 'flex-end', marginRight: Spacing.sm },
  bmVal: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.onSurface },
  bmUnit: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted },
  noBmData: { fontSize: Typography.sizes.lg, color: Colors.onSurfaceMuted, marginRight: Spacing.sm },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeGood: { backgroundColor: Colors.status.optimalBg },
  badgeWarn: { backgroundColor: Colors.status.reviewBg },
  badgeTxt: { fontSize: 10, fontWeight: '600' },
  badgeTxtGood: { color: Colors.status.optimalText },
  badgeTxtWarn: { color: Colors.status.reviewText },
  badgeLog: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, /* intentional — no Spacing.* equivalent */
    backgroundColor: Colors.surfaceElevated, borderWidth: 0.5, borderColor: Colors.borderLight,
  },
  badgeLogTxt: { fontSize: 10, fontWeight: '500', color: Colors.primaryLight },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, paddingTop: Spacing.md, backgroundColor: Colors.surface },
  back: { fontSize: Typography.sizes.base, color: Colors.primaryLight },
  addBtnSmall: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1 },
  addBtnSmallTxt: { fontSize: Typography.sizes.sm, color: Colors.primaryBg, fontWeight: '600' },
  detailHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.base, paddingBottom: Spacing.md },
  detailHeroLeft: { flex: 1 },
  detailName: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.onSurface },
  detailCat: { fontSize: Typography.sizes.sm, color: Colors.onSurfaceMuted, marginTop: 2 },
  detailValGroup: { alignItems: 'flex-end' },
  detailVal: { fontSize: 44, fontWeight: '300', color: Colors.onSurface }, /* intentional — hero display size, no Typography.sizes match */
  detailUnit: { fontSize: Typography.sizes.sm, color: Colors.onSurfaceMuted },
  noData: { fontSize: Typography.sizes.md, color: Colors.onSurfaceMuted, marginTop: Spacing.sm },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, marginBottom: Spacing.base, flexWrap: 'wrap' },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5 },
  statusOpt: { backgroundColor: Colors.status.optimalBg, borderColor: Colors.status.optimalBorder },
  statusSub: { backgroundColor: Colors.status.reviewBg, borderColor: Colors.status.reviewBorder },
  statusOut: { backgroundColor: Colors.status.criticalBg, borderColor: Colors.status.criticalBorder },
  statusTxt: { fontSize: Typography.sizes.xs, fontWeight: '600' },
  statusTxtOpt: { color: Colors.status.optimalText },
  statusTxtSub: { color: Colors.status.reviewText },
  statusTxtOut: { color: Colors.status.criticalText },
  targetBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5, borderColor: Colors.borderLight, backgroundColor: Colors.surface },
  targetTxt: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
  insightCard: { marginHorizontal: Spacing.base, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.base, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  insightTxt: { fontSize: Typography.sizes.sm, lineHeight: 20 },
  sectionLabel: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.onSurfaceMuted, textTransform: 'uppercase', letterSpacing: 1.5, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base },
  histRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  histLeft: { flex: 1 },
  histDate: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.onSurface },
  histSource: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, marginTop: 2 },
  histRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  histVal: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.onSurface },
  histUnit: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, fontWeight: '400' },
  editPencilBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.borderLight },
  editPencilTxt: { fontSize: Typography.sizes.base, color: Colors.onSurfaceMuted },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }, /* intentional — no Spacing.* equivalent for gap: 6 */
  editInput: { backgroundColor: Colors.surfaceElevated, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, fontSize: 16, fontWeight: '600', color: Colors.onSurface, borderWidth: 1, borderColor: Colors.primaryBorder, minWidth: 72, textAlign: 'right' },
  editUnit: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted },
  editSaveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 5 }, /* intentional — no Spacing.* equivalent for paddingVertical: 5 */
  editSaveTxt: { fontSize: Typography.sizes.xs, color: Colors.primaryBg, fontWeight: '600' },
  editCancelBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.borderLight },
  editCancelTxt: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted },
  emptyHistRow: { paddingVertical: Spacing.sm, gap: Spacing.sm },
  emptyTxt: { fontSize: Typography.sizes.base, color: Colors.onSurfaceMuted },
  logCta: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5, borderColor: Colors.primaryBorder, alignSelf: 'flex-start' },
  logCtaTxt: { fontSize: Typography.sizes.sm, color: Colors.primary, fontWeight: '500' },
  bodyTxt: { fontSize: Typography.sizes.base, color: Colors.textSecondary, lineHeight: 22 },
  citationRow: {
    marginTop: Spacing.md, paddingTop: Spacing.sm,
    borderTopWidth: 0.5, borderTopColor: Colors.borderLight,
  },
  citationTxt: {
    fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, fontStyle: 'italic', lineHeight: 15,
  },
  emptyTabCard: { marginHorizontal: Spacing.base, marginTop: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 0.5, borderColor: Colors.borderLight, ...Elevation.sm, padding: Spacing.xl, alignItems: 'center' },
  emptyTabHeading: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.onSurface, textAlign: 'center', marginBottom: Spacing.sm },
  emptyTabBody: { fontSize: Typography.sizes.body, fontWeight: '400', color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.lg },
  emptyTabCta: { backgroundColor: Colors.primary, borderRadius: Radius.xl, height: 48, paddingHorizontal: Spacing.base, justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch' },
  emptyTabCtaTxt: { color: Colors.surface, fontSize: Typography.sizes.base, fontWeight: '600' },

  // Phase 22: Segmented control — copied from ExerciseScreen.tsx styles
  segmentedControl: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    padding: 3, /* intentional — no Spacing.* equivalent, matches ExerciseScreen */
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: Colors.primary },
  segmentTxt: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.onSurfaceMuted },
  segmentTxtActive: { color: Colors.primaryBg },

  // Phase 22: Chart placeholder
  chartPlaceholder: {
    marginHorizontal: Spacing.base,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  chartPlaceholderTxt: {
    fontSize: Typography.sizes.sm,
    color: Colors.onSurfaceMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Phase 22: Upgrade banner
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.primaryBorder,
    padding: Spacing.md,
  },
  upgradeBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.xs },
  upgradeBannerIcon: { fontSize: Typography.sizes.base },
  upgradeBannerTxt: {
    fontSize: Typography.sizes.xs,
    color: Colors.status.optimalText,
    flex: 1,
    lineHeight: 18,
  },
  upgradeCta: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  upgradeCtaTxt: { fontSize: Typography.sizes.xs, fontWeight: '700', color: Colors.primaryBg },
});
