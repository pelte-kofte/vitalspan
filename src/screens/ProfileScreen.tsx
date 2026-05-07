import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';

interface UserProfile {
  name: string;
  age: number;
  sex: 'male' | 'female';
  goal: string;
  conditions: string[];
  medications: string[];
  biologicalAge: number;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('@vitalspan_user_profile')
        .then(raw => { if (raw) setProfile(JSON.parse(raw) as UserProfile); })
        .catch(console.error);
    }, [])
  );

  if (!profile) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.empty}>
          <Text style={s.emptyTxt}>No profile found.</Text>
          <Text style={s.emptySub}>Complete onboarding to set up your profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const yearsDiff = profile.age - (profile.biologicalAge ?? profile.age);
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{profile.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.name}>{profile.name}</Text>
          {yearsDiff > 0 && (
            <View style={s.agePill}>
              <Text style={s.agePillTxt}>{yearsDiff} years younger biologically</Text>
            </View>
          )}
        </View>

        {/* Personal */}
        <Text style={s.sectionLabel}>Personal</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.rowLabel}>Age</Text>
            <Text style={s.rowValue}>{profile.age} years</Text>
          </View>
          <View style={[s.row, s.rowBorder]}>
            <Text style={s.rowLabel}>Sex</Text>
            <Text style={s.rowValue}>{capitalize(profile.sex)}</Text>
          </View>
          <View style={[s.row, s.rowBorder]}>
            <Text style={s.rowLabel}>Biological age</Text>
            <Text style={s.rowValue}>{profile.biologicalAge}</Text>
          </View>
          {!!profile.goal && (
            <View style={[s.row, s.rowBorder]}>
              <Text style={s.rowLabel}>Goal</Text>
              <Text style={s.rowValue}>{profile.goal}</Text>
            </View>
          )}
        </View>

        {/* Conditions */}
        <Text style={s.sectionLabel}>Health conditions</Text>
        <View style={s.card}>
          {profile.conditions.length === 0 ? (
            <View style={s.emptyRow}>
              <Text style={s.emptyRowTxt}>None logged</Text>
            </View>
          ) : (
            profile.conditions.map((c, i) => (
              <View key={c} style={[s.tagRow, i < profile.conditions.length - 1 && s.rowBorder]}>
                <Text style={s.tagTxt}>{c}</Text>
              </View>
            ))
          )}
        </View>

        {/* Medications */}
        <Text style={s.sectionLabel}>Medications</Text>
        <View style={s.card}>
          {profile.medications.length === 0 ? (
            <View style={s.emptyRow}>
              <Text style={s.emptyRowTxt}>None logged</Text>
            </View>
          ) : (
            profile.medications.map((m, i) => (
              <View key={m} style={[s.tagRow, i < profile.medications.length - 1 && s.rowBorder]}>
                <View style={s.medDot} />
                <Text style={s.tagTxt}>{m}</Text>
              </View>
            ))
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTxt: { fontSize: Typography.sizes.lg, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySub: { fontSize: Typography.sizes.base, color: Colors.textMuted, textAlign: 'center' },
  hero: { alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.base },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarTxt: { fontSize: 28, color: Colors.primary, fontWeight: '500' },
  name: { fontSize: Typography.sizes.xxl, fontWeight: '300', color: Colors.textPrimary, marginBottom: Spacing.sm },
  agePill: {
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 0.5,
    borderColor: Colors.primaryBorder,
  },
  agePillTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '500' },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  rowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.border },
  rowLabel: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
  rowValue: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  medDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryLight },
  tagTxt: { fontSize: Typography.sizes.base, color: Colors.textPrimary },
  emptyRow: { padding: Spacing.md },
  emptyRowTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted },
});
