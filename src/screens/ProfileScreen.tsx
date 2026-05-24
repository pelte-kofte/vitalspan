import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, TextInput, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface UserProfile {
  name: string;
  age: number;
  sex: 'male' | 'female';
  goal: string;
  conditions: string[];
  medications: string[];
  biologicalAge?: number;
  onboardingComplete?: boolean;
}

const CONDITIONS = [
  'Type 2 diabetes', 'Hypertension', 'Hypothyroidism',
  'High cholesterol', 'Cardiovascular disease', 'Autoimmune condition',
  'Kidney disease', 'Liver disease',
];

export default function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState(35);
  const [editSex, setEditSex] = useState<'male' | 'female'>('male');
  const [editConditions, setEditConditions] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(() => {
    return AsyncStorage.getItem('@vitalspan_user_profile')
      .then(raw => {
        if (raw) {
          const p = JSON.parse(raw) as UserProfile;
          setProfile(p);
          setEditName(p.name);
          setEditAge(p.age);
          setEditSex(p.sex);
          setEditConditions(p.conditions ?? []);
        }
      })
      .catch(console.error);
  }, []);

  useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

  async function handleRefresh() {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }

  function startEdit() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    setEditing(true);
  }

  async function saveEdit() {
    if (!profile) return;
    if (!editName.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    const updated: UserProfile = {
      ...profile,
      name: editName.trim(),
      age: editAge,
      sex: editSex,
      conditions: editConditions,
    };
    await AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(updated));
    setProfile(updated);
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  }

  function cancelEdit() {
    if (profile) {
      setEditName(profile.name);
      setEditAge(profile.age);
      setEditSex(profile.sex);
      setEditConditions(profile.conditions ?? []);
    }
    setEditing(false);
  }

  function toggleCondition(c: string) {
    Haptics.selectionAsync().catch(() => null);
    setEditConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

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

  if (editing) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.editHeader}>
          <TouchableOpacity onPress={cancelEdit}>
            <Text style={s.editCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.editTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={saveEdit}>
            <Text style={s.editSave}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <Text style={s.sectionLabel}>Personal</Text>
          <View style={s.card}>
            <View style={s.inputRow}>
              <Text style={s.inputLabel}>Name</Text>
              <TextInput
                style={s.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={[s.inputRow, s.rowBorder]}>
              <Text style={s.inputLabel}>Age</Text>
              <View style={s.ageRow}>
                <TouchableOpacity
                  style={s.ageBtn}
                  onPress={() => { setEditAge(a => Math.max(18, a - 1)); Haptics.selectionAsync().catch(() => null); }}
                >
                  <Text style={s.ageBtnTxt}>−</Text>
                </TouchableOpacity>
                <Text style={s.ageVal}>{editAge}</Text>
                <TouchableOpacity
                  style={s.ageBtn}
                  onPress={() => { setEditAge(a => Math.min(90, a + 1)); Haptics.selectionAsync().catch(() => null); }}
                >
                  <Text style={s.ageBtnTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[s.inputRow, s.rowBorder]}>
              <Text style={s.inputLabel}>Sex</Text>
              <View style={s.sexRow}>
                {(['male', 'female'] as const).map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[s.sexBtn, editSex === opt && s.sexBtnActive]}
                    onPress={() => { setEditSex(opt); Haptics.selectionAsync().catch(() => null); }}
                  >
                    <Text style={[s.sexBtnTxt, editSex === opt && s.sexBtnTxtActive]}>
                      {capitalize(opt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={s.sectionLabel}>Health Conditions</Text>
          <View style={s.condGrid}>
            {CONDITIONS.map(c => (
              <TouchableOpacity
                key={c}
                style={[s.condBtn, editConditions.includes(c) && s.condBtnSel]}
                onPress={() => toggleCondition(c)}
              >
                <Text style={[s.condBtnTxt, editConditions.includes(c) && { color: Colors.primaryDark }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.editNote}>
            <Text style={s.editNoteTxt}>
              To update medications, use the Protocol screen.
              Biological age updates automatically as you log biomarkers.
            </Text>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Read view ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.screenTitle}>Profile</Text>
        <View style={s.topActions}>
          <TouchableOpacity style={s.editBtn} onPress={startEdit}>
            <Text style={s.editBtnTxt}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.settingsBtn}
            onPress={() => nav.navigate('Settings')}
          >
            <Text style={{ fontSize: 18 }}>⚙️</Text>
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
          {profile.biologicalAge != null && (
            <View style={[s.row, s.rowBorder]}>
              <Text style={s.rowLabel}>Biological age</Text>
              <Text style={[s.rowValue, { color: Colors.primary }]}>{profile.biologicalAge}</Text>
            </View>
          )}
          {!!profile.goal && (
            <View style={[s.row, s.rowBorder]}>
              <Text style={s.rowLabel}>Goal</Text>
              <Text style={[s.rowValue, { flex: 1, textAlign: 'right' }]}>{profile.goal}</Text>
            </View>
          )}
        </View>

        {/* Conditions */}
        <Text style={s.sectionLabel}>Health conditions</Text>
        <View style={s.card}>
          {profile.conditions.length === 0 ? (
            <TouchableOpacity style={s.emptyRow} onPress={startEdit}>
              <Text style={s.emptyRowTxt}>None logged — tap Edit to add</Text>
            </TouchableOpacity>
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
            <TouchableOpacity style={s.emptyRow} onPress={() => nav.navigate('Protocol' as never)}>
              <Text style={s.emptyRowTxt}>None logged — go to Protocol to add</Text>
            </TouchableOpacity>
          ) : (
            profile.medications.map((m, i) => (
              <View key={m} style={[s.tagRow, i < profile.medications.length - 1 && s.rowBorder]}>
                <View style={s.medDot} />
                <Text style={s.tagTxt}>{m}</Text>
              </View>
            ))
          )}
        </View>

        {/* Settings shortcut */}
        <TouchableOpacity style={s.settingsCard} onPress={() => nav.navigate('Settings')}>
          <Text style={s.settingsCardTxt}>⚙️  Settings</Text>
          <Text style={s.settingsCardArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.aboutCard} onPress={() => nav.navigate('About')}>
          <Text style={s.settingsCardTxt}>ℹ️  About Vitalspan</Text>
          <Text style={s.settingsCardArrow}>→</Text>
        </TouchableOpacity>

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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    paddingTop: Spacing.md,
  },
  screenTitle: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  editBtn: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  editBtnTxt: { fontSize: Typography.sizes.sm, fontWeight: '500', color: Colors.textSecondary },
  settingsBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
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
  name: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
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
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
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
  settingsCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  aboutCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  settingsCardTxt: { fontSize: Typography.sizes.base, color: Colors.textPrimary },
  settingsCardArrow: { fontSize: Typography.sizes.md, color: Colors.textMuted },

  // Edit mode
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    paddingTop: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  editCancel: { fontSize: Typography.sizes.base, color: Colors.textMuted },
  editTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.textPrimary },
  editSave: { fontSize: Typography.sizes.base, color: Colors.primary, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  inputLabel: { fontSize: Typography.sizes.base, color: Colors.textMuted, width: 64 },
  textInput: { flex: 1, fontSize: Typography.sizes.base, color: Colors.textPrimary },
  ageRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.md },
  ageBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bg, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  ageBtnTxt: { fontSize: 18, color: Colors.textPrimary },
  ageVal: { fontSize: Typography.sizes.lg, fontWeight: '500', color: Colors.textPrimary, minWidth: 32, textAlign: 'center' },
  sexRow: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
  sexBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.bg },
  sexBtnActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  sexBtnTxt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  sexBtnTxtActive: { color: Colors.primaryDark, fontWeight: '600' },
  condGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  condBtn: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  condBtnSel: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  condBtnTxt: { fontSize: Typography.sizes.base, color: Colors.textPrimary },
  editNote: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  editNoteTxt: { fontSize: Typography.sizes.xs, color: Colors.textMuted, lineHeight: 18 },
});
