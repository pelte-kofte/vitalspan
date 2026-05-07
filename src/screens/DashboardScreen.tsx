import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
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

interface ProtocolItem {
  name: string;
  dose: string;
  time: string;
  type: 'medication' | 'supplement';
}

const DEFAULT_SUPPLEMENTS: ProtocolItem[] = [
  { name: 'NMN', dose: '500mg', time: 'Morning', type: 'supplement' },
  { name: 'Magnesium glycinate', dose: '400mg', time: 'Evening', type: 'supplement' },
  { name: 'Vitamin D3', dose: '2000IU', time: 'Morning', type: 'supplement' },
];

export default function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [protocolItems, setProtocolItems] = useState<ProtocolItem[]>([]);
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

      if (profileRaw) {
        const p: UserProfile = JSON.parse(profileRaw);
        setProfile(p);
        const medItems: ProtocolItem[] = p.medications.map(med => ({
          name: med,
          dose: '',
          time: 'As prescribed',
          type: 'medication' as const,
        }));
        setProtocolItems([...medItems, ...DEFAULT_SUPPLEMENTS]);
      } else {
        setProtocolItems(DEFAULT_SUPPLEMENTS);
      }

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
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      const today = new Date().toISOString().slice(0, 10);
      AsyncStorage.setItem('@vitalspan_protocol_today', JSON.stringify({
        date: today,
        taken: Array.from(next),
      })).catch(console.error);
      return next;
    });
  }

  function latestFor(biomarkerId: string): StoredEntry | null {
    return entries
      .filter(e => e.biomarkerId === biomarkerId)
      .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
  }

  const displayName = profile?.name || 'there';
  const bioAge = profile?.biologicalAge || '-';
  const chronoAge = profile?.age || '-';
  const yearsDiff = profile ? (profile.age - (profile.biologicalAge || profile.age)) : 0;

  const hasKnownInteractions = profile !== null &&
    profile.medications.length > 0 &&
    profile.medications.some(med =>
      INTERACTIONS.some(inter => inter.drug.toLowerCase() === med.toLowerCase())
    );

  const takenCount = protocolItems.filter(item => takenItems.has(item.name)).length;

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Topbar */}
        <View style={s.topbar}>
          <View>
            <Text style={s.greetSmall}>{getGreeting()}</Text>
            <Text style={s.greetName}>{displayName}</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Bio age card */}
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

        {/* Interaction alert — only shown when a logged medication has known interactions */}
        {hasKnownInteractions && (
          <TouchableOpacity style={s.alertCard} onPress={() => nav.navigate('InteractionChecker')}>
            <View style={s.alertIcon}>
              <Text style={{ fontSize: 14 }}>⚠️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>Interaction check recommended</Text>
              <Text style={s.alertBody}>
                One or more of your medications has known supplement interactions. Tap to review.
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Biomarkers */}
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
            const latest = latestFor(bm.id);
            const displayVal = latest !== null ? String(latest.value) : '—';
            const isOptimal = latest !== null
              ? latest.value >= bm.optMin && latest.value <= bm.optMax
              : false;
            const hasData = latest !== null;
            return (
              <View key={bm.id} style={[s.bmCard, hasData ? (isOptimal ? s.bmCardGood : s.bmCardWarning) : s.bmCardNone]}>
                <Text style={[s.bmName, hasData ? (isOptimal ? { color: Colors.primaryDark } : { color: Colors.warningText }) : { color: Colors.textMuted }]}>{bm.name}</Text>
                <Text style={[s.bmVal, hasData ? (isOptimal ? { color: Colors.primary } : { color: Colors.warning }) : { color: Colors.textMuted }]}>{displayVal}</Text>
                <Text style={s.bmUnit}>{bm.unit}</Text>
                <View style={[s.bmBadge, hasData ? (isOptimal ? s.bmBadgeGood : s.bmBadgeWarn) : s.bmBadgeNone]}>
                  <Text style={[s.bmBadgeTxt, hasData ? (isOptimal ? { color: Colors.primaryDark } : { color: Colors.warningTextDark }) : { color: Colors.textMuted }]}>
                    {hasData ? (isOptimal ? 'Optimal' : 'Review') : 'No data'}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Protocol */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>{"Today's protocol"}</Text>
          <Text style={s.sectionLink}>{takenCount} / {protocolItems.length} taken</Text>
        </View>

        <View style={s.protocolCard}>
          {protocolItems.length === 0 ? (
            <View style={s.protoEmpty}>
              <Text style={s.protoEmptyTxt}>Complete your profile to get started</Text>
            </View>
          ) : (
            protocolItems.map((item, i) => {
              const taken = takenItems.has(item.name);
              return (
                <TouchableOpacity
                  key={`${item.name}-${i}`}
                  style={[s.protoItem, i < protocolItems.length - 1 && s.protoItemBorder]}
                  onPress={() => toggleTaken(item.name)}
                >
                  <View style={[s.protoDot, taken ? s.protoDotTaken : s.protoDotPending]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.protoName}>{item.name}</Text>
                    {item.dose ? <Text style={s.protoDose}>{item.dose}</Text> : null}
                  </View>
                  <Text style={[s.protoTime, taken && { color: Colors.primaryLight }]}>
                    {taken ? 'Taken ✓' : item.time}
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
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.bgCard, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  bioCard: { marginHorizontal: Spacing.base, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.base },
  bioLabel: { fontSize: Typography.sizes.xs, color: 'rgba(232,245,238,0.7)', letterSpacing: 0.8, marginBottom: 6 },
  bioNum: { fontSize: 52, color: Colors.primaryBg, fontWeight: '300', lineHeight: 58 },
  bioSub: { fontSize: Typography.sizes.xs, color: 'rgba(232,245,238,0.75)', marginTop: 4 },
  bioPill: { position: 'absolute', top: Spacing.base, right: Spacing.base, backgroundColor: 'rgba(168,213,190,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  bioPillTxt: { fontSize: Typography.sizes.xs, color: Colors.primaryBorder },
  alertCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.warningBg, borderColor: Colors.warningBorder, borderWidth: 0.5, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: Spacing.base },
  alertIcon: { width: 32, height: 32, backgroundColor: Colors.warningBorder, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.warningTextDark, marginBottom: 2 },
  alertBody: { fontSize: Typography.sizes.xs, color: Colors.warningText, lineHeight: 16 },
  sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.sizes.md, fontWeight: '600', color: Colors.textPrimary },
  sectionLink: { fontSize: Typography.sizes.sm, color: Colors.primaryLight },
  sectionAddBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  sectionAddTxt: { fontSize: Typography.sizes.xs, color: Colors.primaryBg, fontWeight: '600' },
  bmScroll: { paddingHorizontal: Spacing.base, gap: 10, paddingBottom: Spacing.base },
  bmCard: { width: 120, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 0.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
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
  protocolCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, marginBottom: Spacing.base, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  protoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md },
  protoItemBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  protoDot: { width: 10, height: 10, borderRadius: 5 },
  protoDotTaken: { backgroundColor: Colors.primaryLight },
  protoDotPending: { backgroundColor: Colors.border },
  protoName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  protoDose: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 1 },
  protoTime: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  protoEmpty: { padding: Spacing.md },
  protoEmptyTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted },
});
