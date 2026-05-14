import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { BIOMARKERS, INTERACTIONS } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StoredEntry } from './BiomarkerEntryScreen';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface UserProfile {
  name: string;
  age: number;
  biologicalAge?: number;
  medications: string[];
  conditions: string[];
}

export default function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [takenItems, setTakenItems] = useState<Set<string>>(new Set());

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const [profileRaw, entriesRaw, protocolRaw] = await Promise.all([
        AsyncStorage.getItem('@vitalspan_user_profile'),
        AsyncStorage.getItem('@vitalspan_biomarkers'),
        AsyncStorage.getItem('@vitalspan_protocol_today'),
      ]);

      if (profileRaw) setProfile(JSON.parse(profileRaw));
      if (entriesRaw) setEntries(JSON.parse(entriesRaw));

      if (protocolRaw) {
        const { date, taken }: { date: string; taken: string[] } = JSON.parse(protocolRaw);
        const today = new Date().toISOString().slice(0, 10);
        setTakenItems(date === today ? new Set(taken) : new Set());
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleTaken(name: string) {
    setTakenItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      const today = new Date().toISOString().slice(0, 10);
      AsyncStorage.setItem('@vitalspan_protocol_today', JSON.stringify({
        date: today,
        taken: Array.from(next),
      })).catch(console.error);
      return next;
    });
  }

  // O(1) latest entry lookup — built once when entries change
  const entryMap = useMemo(() => {
    const map = new Map<string, StoredEntry>();
    for (const e of entries) {
      const existing = map.get(e.biomarkerId);
      if (!existing || e.date > existing.date) map.set(e.biomarkerId, e);
    }
    return map;
  }, [entries]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  }, []);

  const hasKnownInteractions = useMemo(() =>
    profile !== null &&
    profile.medications.length > 0 &&
    profile.medications.some(med =>
      INTERACTIONS.some(inter => inter.drug.toLowerCase() === med.toLowerCase())
    ),
  [profile]);

  const medications = profile?.medications ?? [];
  const takenCount = medications.filter(m => takenItems.has(m)).length;
  const bioAge = profile?.biologicalAge ?? '-';
  const chronoAge = profile?.age ?? '-';
  const yearsDiff = profile ? (profile.age - (profile.biologicalAge ?? profile.age)) : 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.topbar}>
          <View>
            <Text style={s.greetSmall}>{greeting}</Text>
            <Text style={s.greetName}>{profile?.name ?? 'there'}</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.bioCard}
        >
          <Text style={s.bioLabel}>YOUR BIOLOGICAL AGE</Text>
          <Text style={s.bioNum}>{bioAge}</Text>
          <Text style={s.bioSub}>
            Chronological: {chronoAge}
            {yearsDiff > 0 ? ` · You're ${yearsDiff} years younger` : ''}
          </Text>
          {yearsDiff > 0 && (
            <View style={s.bioPill}>
              <Text style={s.bioPillTxt}>↓ improving</Text>
            </View>
          )}
        </LinearGradient>

        {hasKnownInteractions && (
          <TouchableOpacity style={s.alertCard} onPress={() => nav.navigate('InteractionChecker')}>
            <View style={s.alertIcon}>
              <Text style={{ fontSize: 14 }}>⚠️</Text>
            </View>
            <View style={s.alertBody}>
              <Text style={s.alertTitle}>Interaction check recommended</Text>
              <Text style={s.alertTxt}>
                One or more of your medications has known supplement interactions. Tap to review.
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Biomarkers</Text>
          <TouchableOpacity
            style={s.sectionAddBtn}
            onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: undefined })}
          >
            <Text style={s.sectionAddTxt}>+ Log</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.bmScroll}>
          {BIOMARKERS.slice(0, 5).map((bm) => {
            const latest = entryMap.get(bm.id) ?? null;
            const hasData = latest !== null;
            const isOptimal = hasData && latest.value >= bm.optMin && latest.value <= bm.optMax;
            return (
              <View key={bm.id} style={[s.bmCard, hasData ? (isOptimal ? s.bmCardGood : s.bmCardWarning) : s.bmCardNone]}>
                <Text style={[s.bmName, { color: hasData ? (isOptimal ? Colors.primaryDark : Colors.warningText) : Colors.textMuted }]}>{bm.name}</Text>
                <Text style={[s.bmVal, { color: hasData ? (isOptimal ? Colors.primary : Colors.warning) : Colors.textMuted }]}>
                  {hasData ? String(latest.value) : '—'}
                </Text>
                <Text style={s.bmUnit}>{bm.unit}</Text>
                <View style={[s.bmBadge, hasData ? (isOptimal ? s.bmBadgeGood : s.bmBadgeWarn) : s.bmBadgeNone]}>
                  <Text style={[s.bmBadgeTxt, { color: hasData ? (isOptimal ? Colors.primaryDark : Colors.warningTextDark) : Colors.textMuted }]}>
                    {hasData ? (isOptimal ? 'Optimal' : 'Review') : 'No data'}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={s.uploadCard} onPress={() => nav.navigate('LabUpload')}>
          <Text style={s.uploadCardIcon}>📋</Text>
          <View style={s.uploadCardBody}>
            <Text style={s.uploadCardTitle}>Upload lab results</Text>
            <Text style={s.uploadCardSub}>Import biomarkers from your PDF</Text>
          </View>
          <Text style={s.uploadCardArrow}>→</Text>
        </TouchableOpacity>

        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>{"Today's protocol"}</Text>
          <Text style={s.sectionLink}>{takenCount} / {medications.length} taken</Text>
        </View>

        <View style={s.protocolCard}>
          {medications.length === 0 ? (
            <Text style={s.protoEmptyTxt}>Add medications in your profile to build your protocol</Text>
          ) : (
            medications.map((med, i) => {
              const taken = takenItems.has(med);
              return (
                <TouchableOpacity
                  key={med}
                  style={[s.protoItem, i < medications.length - 1 && s.protoItemBorder]}
                  onPress={() => toggleTaken(med)}
                >
                  <View style={[s.protoDot, taken ? s.protoDotTaken : s.protoDotPending]} />
                  <Text style={s.protoName}>{med}</Text>
                  <Text style={[s.protoTime, taken && { color: Colors.primaryLight }]}>
                    {taken ? 'Taken ✓' : '—'}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.base, paddingTop: Spacing.md },
  greetSmall: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  greetName: { fontSize: 22, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  bioCard: { marginHorizontal: Spacing.base, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.base },
  bioLabel: { fontSize: Typography.sizes.xs, color: 'rgba(232,245,238,0.7)', letterSpacing: 0.8, marginBottom: 6 },
  bioNum: { fontSize: 52, color: Colors.primaryBg, fontWeight: '300', lineHeight: 58 },
  bioSub: { fontSize: Typography.sizes.xs, color: 'rgba(232,245,238,0.75)', marginTop: 4 },
  bioPill: { position: 'absolute', top: Spacing.base, right: Spacing.base, backgroundColor: 'rgba(168,213,190,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  bioPillTxt: { fontSize: Typography.sizes.xs, color: Colors.primaryBorder },
  alertCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.warningBg, borderColor: Colors.warningBorder, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: Spacing.base },
  alertIcon: { width: 32, height: 32, backgroundColor: Colors.warningBorder, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.warningTextDark, marginBottom: 2 },
  alertTxt: { fontSize: Typography.sizes.xs, color: Colors.warningText, lineHeight: 16 },
  sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.sizes.md, fontWeight: '600', color: Colors.textPrimary },
  sectionLink: { fontSize: Typography.sizes.sm, color: Colors.primaryLight },
  sectionAddBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  sectionAddTxt: { fontSize: Typography.sizes.xs, color: Colors.primaryBg, fontWeight: '600' },
  bmScroll: { paddingHorizontal: Spacing.base, gap: 10, paddingBottom: Spacing.base },
  bmCard: { width: 120, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  bmCardWarning: { backgroundColor: Colors.warningBg, borderColor: Colors.warningBorder },
  bmCardGood: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  bmCardNone: { backgroundColor: Colors.bgCard, borderColor: Colors.border },
  bmName: { fontSize: Typography.sizes.xs, marginBottom: 4 },
  bmVal: { fontSize: 22, fontWeight: '500', lineHeight: 26 },
  bmUnit: { fontSize: 10, color: Colors.textMuted, marginBottom: 6 },
  bmBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
  bmBadgeWarn: { backgroundColor: Colors.warningBorder },
  bmBadgeGood: { backgroundColor: Colors.primaryBorder },
  bmBadgeNone: { backgroundColor: Colors.bgSecondary },
  bmBadgeTxt: { fontSize: 9, fontWeight: '500' },
  protocolCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.base, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, padding: Spacing.md },
  protoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: Spacing.sm },
  protoItemBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  protoDot: { width: 10, height: 10, borderRadius: 5 },
  protoDotTaken: { backgroundColor: Colors.primaryLight },
  protoDotPending: { backgroundColor: Colors.border },
  protoName: { flex: 1, fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  protoTime: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  protoEmptyTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted, paddingVertical: Spacing.sm },
  uploadCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  uploadCardIcon: { fontSize: 28 },
  uploadCardBody: { flex: 1 },
  uploadCardTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.textPrimary },
  uploadCardSub: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  uploadCardArrow: { fontSize: Typography.sizes.md, color: Colors.textMuted },
});
