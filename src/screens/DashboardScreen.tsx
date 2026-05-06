import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { BIOMARKERS } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PROTOCOL = [
  { name: 'NMN', dose: '500mg', time: 'Morning', status: 'taken' },
  { name: 'Magnesium glycinate', dose: '400mg', time: 'Morning', status: 'taken' },
  { name: 'Omega-3', dose: '2g with food', time: 'Now', status: 'warning' },
  { name: 'Berberine', dose: '500mg', time: '12:00', status: 'pending' },
  { name: 'Apigenin', dose: '50mg', time: '21:00', status: 'pending' },
];

export default function DashboardScreen() {
  const nav = useNavigation<Nav>();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={s.topbar}>
          <View>
            <Text style={s.greetSmall}>Good morning,</Text>
            <Text style={s.greetName}>Alex</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Bio age card */}
        <LinearGradient
          colors={['#085041', '#0F6E56']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.bioCard}
        >
          <Text style={s.bioLabel}>YOUR BIOLOGICAL AGE</Text>
          <Text style={s.bioNum}>34</Text>
          <Text style={s.bioSub}>Chronological: 41 · You're 7 years younger</Text>
          <View style={s.bioPill}>
            <Text style={s.bioPillTxt}>↓ 1.2 yrs this month</Text>
          </View>
        </LinearGradient>

        {/* Interaction alert */}
        <View style={s.alertCard}>
          <View style={s.alertIcon}>
            <Text style={{ fontSize: 14 }}>⚠️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.alertTitle}>Interaction detected</Text>
            <Text style={s.alertBody}>
              Omega-3 (2g) + your aspirin may increase bleeding risk. Tap to review.
            </Text>
          </View>
        </View>

        {/* Biomarkers */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Biomarkers</Text>
          <TouchableOpacity onPress={() => nav.navigate('BiomarkerDetail', { biomarkerId: 'apob' })}>
            <Text style={s.sectionLink}>See all →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.bmScroll}>
          {BIOMARKERS.slice(0, 5).map((bm) => {
            const isOptimal = bm.defaultVal >= bm.optMin && bm.defaultVal <= bm.optMax;
            const isWarning = !isOptimal;
            return (
              <TouchableOpacity
                key={bm.id}
                style={[s.bmCard, isWarning && s.bmCardWarning, isOptimal && s.bmCardGood]}
                onPress={() => nav.navigate('BiomarkerDetail', { biomarkerId: bm.id })}
              >
                <Text style={[s.bmName, isWarning && { color: '#633806' }, isOptimal && { color: '#085041' }]}>
                  {bm.name}
                </Text>
                <Text style={[s.bmVal, isWarning && { color: '#BA7517' }, isOptimal && { color: '#0F6E56' }]}>
                  {bm.defaultVal}
                </Text>
                <Text style={s.bmUnit}>{bm.unit}</Text>
                <View style={[s.bmBadge, isWarning && s.bmBadgeWarn, isOptimal && s.bmBadgeGood]}>
                  <Text style={[s.bmBadgeTxt, isWarning && { color: '#412402' }, isOptimal && { color: '#04342C' }]}>
                    {isOptimal ? 'Optimal' : 'Review'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Today's protocol */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Today's protocol</Text>
          <Text style={s.sectionLink}>3 / 5 taken</Text>
        </View>

        <View style={s.protocolCard}>
          {PROTOCOL.map((item, i) => (
            <View key={i} style={[s.protoItem, i < PROTOCOL.length - 1 && s.protoItemBorder]}>
              <View style={[
                s.protoDot,
                item.status === 'taken' && s.protoDotTaken,
                item.status === 'warning' && s.protoDotWarn,
                item.status === 'pending' && s.protoDotPending,
              ]} />
              <View style={{ flex: 1 }}>
                <Text style={s.protoName}>{item.name}</Text>
                <Text style={s.protoDose}>{item.dose}</Text>
              </View>
              {item.status === 'warning' ? (
                <View style={s.warnPill}>
                  <Text style={s.warnPillTxt}>Check interaction</Text>
                </View>
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
  bioLabel: { fontSize: Typography.sizes.xs, color: 'rgba(225,245,238,0.7)', letterSpacing: 0.8, marginBottom: 6 },
  bioNum: { fontSize: 52, color: '#E1F5EE', fontWeight: '300', lineHeight: 58 },
  bioSub: { fontSize: Typography.sizes.xs, color: 'rgba(225,245,238,0.75)', marginTop: 4 },
  bioPill: { position: 'absolute', top: Spacing.base, right: Spacing.base, backgroundColor: 'rgba(159,225,203,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  bioPillTxt: { fontSize: Typography.sizes.xs, color: '#9FE1CB' },
  alertCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.warningBg, borderColor: Colors.warningBorder, borderWidth: 0.5, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: Spacing.base },
  alertIcon: { width: 32, height: 32, backgroundColor: Colors.warningBorder, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: Typography.sizes.sm, fontWeight: '600', color: '#412402', marginBottom: 2 },
  alertBody: { fontSize: Typography.sizes.xs, color: '#633806', lineHeight: 16 },
  sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.sizes.md, fontWeight: '500', color: Colors.textPrimary },
  sectionLink: { fontSize: Typography.sizes.sm, color: Colors.primaryLight },
  bmScroll: { paddingHorizontal: Spacing.base, gap: 10, paddingBottom: Spacing.base },
  bmCard: { width: 120, backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 0.5, borderColor: Colors.border },
  bmCardWarning: { backgroundColor: '#FAEEDA', borderColor: '#FAC775' },
  bmCardGood: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  bmName: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginBottom: 4 },
  bmVal: { fontSize: 22, fontWeight: '500', lineHeight: 26 },
  bmUnit: { fontSize: 10, color: Colors.textMuted, marginBottom: 6 },
  bmBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: Colors.bgCard, alignSelf: 'flex-start' },
  bmBadgeWarn: { backgroundColor: '#FAC775' },
  bmBadgeGood: { backgroundColor: Colors.primaryBorder },
  bmBadgeTxt: { fontSize: 9, fontWeight: '500', color: Colors.textMuted },
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
  warnPill: { backgroundColor: '#FAEEDA', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  warnPillTxt: { fontSize: 9, color: '#633806', fontWeight: '500' },
});
