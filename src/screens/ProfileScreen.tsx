import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, TextInput, Alert, RefreshControl,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { setStatusBarStyle } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { PersonIcon, GearIcon, InfoIcon } from '../components/DesignSystemIcons';
import AnimatedPressable from '../components/AnimatedPressable';
import StaggerIn from '../components/StaggerIn';
import { RootStackParamList, MainTabParamList } from '../navigation/AppNavigator';
import { loadPermissionStatus } from '../lib/healthkit';
import { authSessionCoordinator, signOutUser } from '../lib/supabase';
import { CONDITIONS } from '../constants/conditions';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface UserProfile {
  name: string;
  age: number;
  sex: 'male' | 'female';
  goal: string;
  conditions: string[];
  medications: string[];
  biologicalAge?: number;
  bloodPhenotypicAge?: number;
  onboardingComplete?: boolean;
}

export default function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState(35);
  const [editSex, setEditSex] = useState<'male' | 'female'>('male');
  const [editConditions, setEditConditions] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [healthConnected, setHealthConnected] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);

  const loadProfile = useCallback(() => {
    return AsyncStorage.getItem('@vitalspan_user_profile')
      .then(async raw => {
        if (raw) {
          const p = JSON.parse(raw) as UserProfile;
          setProfile(p);
          setEditName(p.name);
          setEditAge(p.age);
          setEditSex(p.sex);
          setEditConditions(p.conditions ?? []);
        }
        const perms = await loadPermissionStatus();
        setHealthConnected(perms?.granted ?? false);
        const user = authSessionCoordinator.getSnapshot().session?.user ?? null;
        setIsAnonymous(user?.is_anonymous ?? null);
      })
      .catch(console.error);
  }, []);

  useFocusEffect(useCallback(() => { void loadProfile(); }, [loadProfile]));
  useFocusEffect(useCallback(() => { setStatusBarStyle('light'); return () => {}; }, []));

  async function handleRefresh() {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }

  async function handleDisconnect() {
    await AsyncStorage.multiRemove(['@vitalspan_health_permissions', '@vitalspan_health_data']);
    setHealthConnected(false);
  }

  async function handleLogout() {
    const { error } = await signOutUser();
    if (error) {
      Alert.alert('Logout failed', error);
      return;
    }
    // Root navigation is driven by the centralized auth coordinator.
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
    try {
      await AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(updated));
      setProfile(updated);
      setEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    } catch {
      Alert.alert('Save failed', 'Could not save your profile. Please try again.');
    }
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
        <View style={s.topBar}>
          <Text style={s.screenTitle}>Profile</Text>
        </View>
        <StaggerIn index={0}>
        <View style={s.emptyStateCard}>
          <PersonIcon color={Colors.dark.textMuted} size={40} />
          <Text style={s.emptyStateHeadline}>Your health story starts here.</Text>
          <Text style={s.emptyStateBody}>
            Complete your profile so Vitalspan can personalise your biomarker targets and flag relevant drug interactions.
          </Text>
          <AnimatedPressable
            style={s.emptyStateCta}
            onPress={() => nav.navigate('Onboarding')}
            accessibilityLabel="Complete onboarding"
          >
            <Text style={s.emptyStateCtaTxt}>Complete Onboarding</Text>
          </AnimatedPressable>
        </View>
        </StaggerIn>
      </SafeAreaView>
    );
  }

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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
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
                placeholderTextColor={Colors.dark.textMuted}
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
                <Text style={[s.condBtnTxt, editConditions.includes(c) && { color: Colors.viz.bioGreen }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.editNote}>
            <Text style={s.editNoteTxt}>
              To update medications, use the Protocol screen.
              Blood phenotypic age updates only when all 9 required blood measurements are valid and current.
            </Text>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
        </KeyboardAvoidingView>
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
            <GearIcon color={Colors.dark.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.dark.ctaPrimary} />
        }
      >
        {/* Guest mode card — visible when user is anonymous (D-10) */}
        {isAnonymous === true && (
          <View style={s.guestCard}>
            <Text style={s.guestHeadline}>Your data is stored locally</Text>
            <View style={s.guestBenefits}>
              <Text style={s.guestBenefit}>Sync across your devices</Text>
              <Text style={s.guestBenefit}>Cloud backup for peace of mind</Text>
              <Text style={s.guestBenefit}>Access your data on a new device</Text>
            </View>
            <AnimatedPressable
              style={s.guestCta}
              onPress={() => (nav as unknown as NativeStackNavigationProp<RootStackParamList>).reset({ index: 0, routes: [{ name: 'Welcome' }] })}
              accessibilityLabel="Create account"
            >
              <Text style={s.guestCtaTxt}>Create Account</Text>
            </AnimatedPressable>
          </View>
        )}

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{profile.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.name}>{profile.name}</Text>
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
          {profile.bloodPhenotypicAge != null ? (
            <View style={[s.row, s.rowBorder]}>
              <Text style={s.rowLabel}>Blood phenotypic age</Text>
              <Text style={[s.rowValue, { color: Colors.dark.ctaPrimary }]}>{profile.bloodPhenotypicAge}</Text>
            </View>
          ) : (
            <View style={[s.row, s.rowBorder]}>
              <Text style={s.rowLabel}>Blood phenotypic age</Text>
              <TouchableOpacity onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: undefined })}>
                <Text style={[s.rowValue, { color: Colors.dark.ctaPrimary }]}>
                  Log all 9 required blood measurements
                </Text>
              </TouchableOpacity>
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
            <TouchableOpacity style={s.emptyRow} onPress={() => nav.navigate('Protocol')}>
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

        {/* Settings / About — grouped inset card, matching SettingsScreen's row pattern */}
        <View style={s.settingsCard}>
          <TouchableOpacity style={s.navRow} onPress={() => nav.navigate('Settings')}>
            <View style={s.navRowLeft}><GearIcon color={Colors.dark.text} size={18} /><Text style={s.settingsCardTxt}>Settings</Text></View>
            <Text style={s.settingsCardArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.navRow, s.navRowBorder]} onPress={() => nav.navigate('About')}>
            <View style={s.navRowLeft}><InfoIcon color={Colors.dark.text} size={18} /><Text style={s.settingsCardTxt}>About Vitalspan</Text></View>
            <Text style={s.settingsCardArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout button — visible for authenticated (non-anonymous) users (D-08, D-09) */}
        {isAnonymous === false && (
          <TouchableOpacity style={s.logoutRow} onPress={handleLogout}>
            <Text style={s.logoutTxt}>Log Out</Text>
          </TouchableOpacity>
        )}

        {healthConnected && (
          <TouchableOpacity
            style={s.disconnectCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
              Alert.alert(
                'Disconnect Apple Health',
                'Orbitals will revert to manual-entry data. You can reconnect anytime.',
                [
                  { text: 'Keep Connected', style: 'cancel' },
                  { text: 'Disconnect Health', style: 'destructive', onPress: handleDisconnect },
                ],
              );
            }}
          >
            <Text style={[s.settingsCardTxt, { color: Colors.viz.coral }]}>Disconnect Apple Health</Text>
            <Text style={[s.settingsCardArrow, { color: Colors.viz.coral }]}>›</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  scroll: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    paddingTop: Spacing.md,
    backgroundColor: Colors.dark.bg,
  },
  screenTitle: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.dark.text },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  editBtn: {
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
  },
  editBtnTxt: { fontSize: Typography.sizes.sm, fontWeight: '500', color: Colors.dark.textMuted },
  settingsBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.base },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark.accentBg,
    borderWidth: 1,
    borderColor: Colors.dark.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarTxt: { fontSize: 28, color: Colors.dark.ctaPrimary, fontWeight: '500' },
  name: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.dark.text, marginBottom: Spacing.sm },
  agePill: {
    backgroundColor: Colors.dark.accentBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 0.5,
    borderColor: Colors.dark.accentBorder,
  },
  agePillTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.ctaPrimary, fontWeight: '500' },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wider,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  rowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.dark.cardBorder },
  rowLabel: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted },
  rowValue: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.dark.text },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  medDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.viz.bioGreen },
  tagTxt: { fontSize: Typography.sizes.base, color: Colors.dark.text },
  emptyRow: { padding: Spacing.md },
  emptyRowTxt: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted },
  settingsCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
  },
  navRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md,
  },
  navRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  navRowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.dark.cardBorder },
  disconnectCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
  },
  settingsCardTxt: { fontSize: Typography.sizes.base, color: Colors.dark.text },
  settingsCardArrow: { fontSize: Typography.sizes.md, color: Colors.dark.textMuted },

  // Edit mode
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    paddingTop: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.bg,
  },
  editCancel: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted },
  editTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.dark.text },
  editSave: { fontSize: Typography.sizes.base, color: Colors.dark.ctaPrimary, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  inputLabel: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted, width: 64 },
  textInput: { flex: 1, fontSize: Typography.sizes.base, color: Colors.dark.text },
  ageRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.md },
  ageBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.dark.bgElevated, borderWidth: 0.5, borderColor: Colors.dark.cardBorder, alignItems: 'center', justifyContent: 'center' },
  ageBtnTxt: { fontSize: Typography.sizes.h3, color: Colors.dark.text },
  ageVal: { fontSize: Typography.sizes.lg, fontWeight: '500', color: Colors.dark.text, minWidth: 32, textAlign: 'center' },
  sexRow: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
  sexBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.dark.cardBorder, backgroundColor: Colors.dark.bgElevated },
  sexBtnActive: { backgroundColor: Colors.dark.statusOptimalBg, borderColor: Colors.dark.statusOptimalBorder },
  sexBtnTxt: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted },
  sexBtnTxtActive: { color: Colors.viz.bioGreen, fontWeight: '600' },
  condGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  condBtn: { backgroundColor: Colors.dark.cardBg, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.dark.cardBorder }, /* intentional — no Spacing.* equivalent for 14 and 10 */
  condBtnSel: { backgroundColor: Colors.dark.statusOptimalBg, borderColor: Colors.dark.statusOptimalBorder },
  condBtnTxt: { fontSize: Typography.sizes.base, color: Colors.dark.text },
  editNote: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
  },
  editNoteTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, lineHeight: 18 },

  // Guest mode card (D-10) — informational nudge, not a warning: uses the
  // brand accent tint rather than status-warn tokens (this isn't an error).
  guestCard: {
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.accentBorder,
  },
  guestHeadline: {
    fontSize: Typography.sizes.body,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  guestBenefits: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  guestBenefit: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.dark.textMuted,
  },
  guestCta: {
    backgroundColor: Colors.dark.ctaPrimary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    alignItems: 'center' as const,
  },
  guestCtaTxt: {
    color: Colors.dark.bg,
    fontSize: Typography.sizes.body,
    fontWeight: '600',
  },
  // Logout row (D-08, D-09)
  logoutRow: {
    paddingVertical: Spacing.md,
    alignItems: 'center' as const,
    marginTop: Spacing.md,
  },
  logoutTxt: {
    fontSize: Typography.sizes.body,
    color: Colors.viz.coral,
    fontWeight: '500',
  },

  // Motivating empty state
  emptyStateCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    padding: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyStateHeadline: {
    fontSize: Typography.sizes.h3,
    fontWeight: '600',
    color: Colors.dark.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  emptyStateBody: {
    fontSize: Typography.sizes.base,
    fontWeight: '400',
    color: Colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  emptyStateCta: {
    backgroundColor: Colors.dark.ctaPrimary,
    borderRadius: Radius.xl,
    minHeight: 44,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  emptyStateCtaTxt: {
    color: Colors.dark.bg,
    fontSize: Typography.sizes.base,
    fontWeight: '600',
  },
});
