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

const PROTOCOL = [
  { name: 'NMN', dose: '500mg', time: 'Morning', status: 'taken' },
  { name: 'Magnesium glycinate', dose: '400mg', time: 'Morning', status: 'taken' },
  { name: 'Omega-3', dose: '2g with food', time: 'Now', status: 'warning' },
  { name: 'Berberine', dose: '500mg', time: '12:00', status: 'pending' },
  { name: 'Apigenin', dose: '50mg', time: '21:00', status: 'pending' },
];

export default function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<StoredEntry[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const [profileRaw, entriesRaw] = await Promise.all([
        AsyncStorage.getItem('@vitalspan_user_profile'),
        AsyncStorage.getItem('@vitalspan_biomarkers'),
      ]);
      if (profileRaw) setProfile(JSON.parse(profileRaw));
      if (entriesRaw) setEntries(JSON.parse(entriesRaw));
    } catch (e) {
      console.error(e);
    }
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

  // Only alert when the user has a medication that appears in the INTERACTIONS database
  const hasKnownInteractions = profile !== null &&
    profile.medications.length > 0 &&
    profile.medications.some(med =>
      INTERACTIONS.some(inter => inter.drug.toLowerCase() === med.toLowerCase())
    );

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
          <Text style={s.sectionLink}>3 / 5 taken</Text>
        </View>

        <View style={s.protocolCard}>
          {PROTOCOL.map((item, i) => (
            <View key={i} style={[s.protoItem, i < PROTOCOL.length - 1 && s.protoItemBorder]}>
              <View style={[s.protoDot,
                item.status === 'taken' && s.protoDotTaken,
                item.status === 'warning' && s.protoDotWarn,
                item.status === 'pending' && s.protoDotPending,
              ]} />
              <View style={{ flex: 1 }}>
                <Text style={s.protoName}>{item.name}</Text>
                <Text style={s.protoDose}>{item.dose}</Text>
              </View>
              {item.status === 'warning' ? (
                <View style={s.warnPill}><Text style={s.warnPillTxt}>Check</Text></View>
              ) : (
                <Text style={s.protoTime}>{item.status === 'taken' ? 'Taken ✓' : item.time}</Text>
              )}
            </View>
          ))}
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
  sectionTitle: { fontSize: Typography.sizes.md, fontWeight: '500', color: Colors.textPrimary },
  sectionLink: { fontSize: Typography.sizes.sm, color: Colors.primaryLight },
  sectionAddBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  sectionAddTxt: { fontSize: Typography.sizes.xs, color: Colors.primaryBg, fontWeight: '600' },
  bmScroll: { paddingHorizontal: Spacing.base, gap: 10, paddingBottom: Spacing.base },
  bmCard: { width: 120, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 0.5 },
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
  protocolCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden', marginBottom: Spacing.base },
  protoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md },
  protoItemBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  protoDot: { width: 10, height: 10, borderRadius: 5 },
  protoDotTaken: { backgroundColor: Colors.primaryLight },
  protoDotWarn: { backgroundColor: Colors.warning },
  protoDotPending: { backgroundColor: Colors.border },
  protoName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  protoDose: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 1 },
  protoTime: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  warnPill: { backgroundColor: Colors.warningBg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  warnPillTxt: { fontSize: 9, color: Colors.warningText, fontWeight: '500' },
});
