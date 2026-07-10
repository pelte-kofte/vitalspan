import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Switch, Alert, Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { setStatusBarStyle } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { PersonIcon, ShieldIcon, BellIcon, ChartBarIcon, RulerIcon, ShareIcon, TrashIcon, ClipboardIcon, RefreshIcon, StarIcon, InfoIcon } from '../components/DesignSystemIcons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { STORAGE_KEYS } from '../lib/storageKeys';
import { loadNotificationPrefs, saveNotificationPrefs, rescheduleAll, DEFAULT_PREFS, NotificationPrefs } from '../lib/notifications';
import { signOutUser } from '../lib/supabase';
import { getAdaptyDebugInfo, AdaptyDebugInfo } from '../lib/adapty';

type Nav = NativeStackNavigationProp<RootStackParamList>;


// ── Row building blocks ──────────────────────────────────────────────────────
interface RowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
  topBorder?: boolean;
}

function SettingsRow({ icon, title, subtitle, onPress, right, danger, topBorder }: RowProps) {
  return (
    <TouchableOpacity
      style={[s.row, topBorder && s.rowBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={s.rowIconWrap}>
        {typeof icon === 'string' ? <Text style={s.rowIcon}>{icon}</Text> : icon}
      </View>
      <View style={s.rowBody}>
        <Text style={[s.rowTitle, danger && s.rowDanger]}>{title}</Text>
        {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress && !right ? <Text style={[s.rowArrow, danger && s.rowDanger]}>›</Text> : null)}
    </TouchableOpacity>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const nav = useNavigation<Nav>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const notifPrefsRef = useRef<NotificationPrefs | null>(null);

  // Hidden Adapty debug panel — tap the version number 5 times to reveal it.
  // Works in TestFlight/production (unlike the __DEV__-gated section below),
  // so pricing issues can be diagnosed on-device without a device log pull
  // (Build 9 bug batch, issue 2).
  const [versionTapCount, setVersionTapCount] = useState(0);
  const [adaptyDebug, setAdaptyDebug] = useState<AdaptyDebugInfo | null>(null);
  function handleVersionTap() {
    const next = versionTapCount + 1;
    setVersionTapCount(next);
    if (next === 5) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
      getAdaptyDebugInfo().then(setAdaptyDebug).catch(() => null);
    }
  }

  useFocusEffect(useCallback(() => {
    setStatusBarStyle('light');
    void loadNotificationPrefs().then(prefs => {
      notifPrefsRef.current = prefs;
      setNotificationsEnabled(Object.values(prefs).some(s => s.enabled));
    });
    return () => {};
  }, []));

  function handleToggleNotif(val: boolean) {
    Haptics.selectionAsync().catch(() => null);
    setNotificationsEnabled(val);
    const base = notifPrefsRef.current ?? DEFAULT_PREFS;
    const updated: NotificationPrefs = {
      morning:   { ...base.morning,   enabled: val },
      afternoon: { ...base.afternoon, enabled: val },
      evening:   { ...base.evening,   enabled: val },
      night:     { ...base.night,     enabled: val },
    };
    notifPrefsRef.current = updated;
    saveNotificationPrefs(updated).catch(() => null);
    rescheduleAll(updated).catch(() => null);
  }

  function handleToggleReport(val: boolean) {
    Haptics.selectionAsync().catch(() => null);
    setWeeklyReport(val);
  }

  function handleUnitToggle() {
    Haptics.selectionAsync().catch(() => null);
    setUnitSystem(u => u === 'metric' ? 'imperial' : 'metric');
  }

  function handleSignOut() {
    Alert.alert(
      'Sign out',
      'This will return you to the landing screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          onPress: async () => {
            // This row previously only navigated to Welcome without ever calling
            // signOutUser() — the Supabase session stayed alive underneath, so the
            // next app launch silently restored it. signOutUser() also clears all
            // local app data now, so sign-out always starts fresh (see supabase.ts).
            const { error } = await signOutUser();
            if (error) {
              Alert.alert('Sign out failed', error);
              return;
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
            nav.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          },
        },
      ],
    );
  }

  function handleClearData() {
    Alert.alert(
      'Clear all data',
      'Permanently deletes your profile, biomarker history, and protocol. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([...STORAGE_KEYS]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => null);
              nav.reset({ index: 0, routes: [{ name: 'Welcome' }] });
            } catch {
              Alert.alert('Clear failed', 'Could not delete all data. Please try again.');
            }
          },
        },
      ],
    );
  }

  async function handleExportData() {
    try {
      const pairs = await AsyncStorage.multiGet([...STORAGE_KEYS]);
      const data: Record<string, unknown> = {};
      for (const [key, value] of pairs) {
        data[key] = value ? JSON.parse(value) : null;
      }
      const json = JSON.stringify(data, null, 2);
      await Share.share({ message: json, title: 'Vitalspan data export' });
    } catch (e) {
      Alert.alert('Export failed', String(e));
    }
  }

  function handleResetOnboarding() {
    Alert.alert(
      'Reset onboarding',
      'Clears onboarding flag. Useful for testing. Profile data is kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            const raw = await AsyncStorage.getItem('@vitalspan_user_profile');
            if (raw) {
              const profile = JSON.parse(raw);
              delete profile.onboardingComplete;
              await AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(profile));
            }
            nav.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.closeBtn}>
          <Text style={s.closeTxt}>Done</Text>
        </TouchableOpacity>
        <Text style={s.title}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Account */}
        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.card}>
          <SettingsRow icon={<PersonIcon color={Colors.dark.text} size={20} />} title="Edit profile" subtitle="Go to Profile to edit" onPress={() => nav.navigate('Main', { screen: 'Profile' })} />
          <SettingsRow icon={<ShieldIcon color={Colors.dark.text} size={20} />} title="Sign out" subtitle="Returns to landing screen" onPress={handleSignOut} topBorder />
        </View>

        {/* Preferences */}
        <Text style={s.sectionLabel}>Preferences</Text>
        <View style={s.card}>
          <SettingsRow
            icon={<BellIcon color={Colors.dark.text} size={20} />}
            title="Daily reminders"
            subtitle="Protocol check-ins & biomarker logging"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotif}
                trackColor={{ false: Colors.dark.cardBorder, true: Colors.dark.accentBorder }}
                thumbColor={notificationsEnabled ? Colors.dark.ctaPrimary : Colors.dark.textMuted}
              />
            }
          />
          <SettingsRow
            icon={<ChartBarIcon color={Colors.dark.text} size={20} />}
            title="Weekly report"
            subtitle="Biomarker trends & progress summary"
            topBorder
            right={
              <Switch
                value={weeklyReport}
                onValueChange={handleToggleReport}
                trackColor={{ false: Colors.dark.cardBorder, true: Colors.dark.accentBorder }}
                thumbColor={weeklyReport ? Colors.dark.ctaPrimary : Colors.dark.textMuted}
              />
            }
          />
          <SettingsRow
            icon={<RulerIcon color={Colors.dark.text} size={20} />}
            title="Measurement system"
            subtitle={unitSystem === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, ft)'}
            topBorder
            onPress={handleUnitToggle}
            right={
              <View style={s.unitToggle}>
                <View style={[s.unitOpt, unitSystem === 'metric' && s.unitOptActive]}>
                  <Text style={[s.unitOptTxt, unitSystem === 'metric' && s.unitOptTxtActive]}>kg</Text>
                </View>
                <View style={[s.unitOpt, unitSystem === 'imperial' && s.unitOptActive]}>
                  <Text style={[s.unitOptTxt, unitSystem === 'imperial' && s.unitOptTxtActive]}>lb</Text>
                </View>
              </View>
            }
          />
        </View>

        {/* Data */}
        <Text style={s.sectionLabel}>Data</Text>
        <View style={s.card}>
          <SettingsRow icon={<ShareIcon color={Colors.dark.text} size={20} />} title="Export my data" subtitle="JSON file with all your health data" onPress={handleExportData} />
          <SettingsRow icon={<TrashIcon color={Colors.viz.coral} size={20} />} title="Clear all data" danger onPress={handleClearData} topBorder />
        </View>

        {/* About */}
        <Text style={s.sectionLabel}>About</Text>
        <View style={s.card}>
          <SettingsRow icon={<InfoIcon color={Colors.dark.text} size={20} />} title="About Vitalspan" subtitle="Mission, citations, evidence grading" onPress={() => nav.navigate('About')} />
          <SettingsRow icon={<ShieldIcon color={Colors.dark.text} size={20} />} title="Privacy Policy" subtitle="How your data is used" topBorder onPress={() => {}} />
          <SettingsRow icon={<ClipboardIcon color={Colors.dark.text} size={20} />} title="Terms of Use" topBorder onPress={() => {}} />
          <SettingsRow icon={<StarIcon color={Colors.dark.text} size={20} />} title="Rate on App Store" subtitle="Help us grow" topBorder onPress={() => {}} />
        </View>

        {/* Debug (dev only) */}
        {__DEV__ && (
          <>
            <Text style={s.sectionLabel}>Developer</Text>
            <View style={s.card}>
              <SettingsRow icon={<RefreshIcon color={Colors.dark.text} size={20} />} title="Reset onboarding" subtitle="Debug: clears onboarding flag" onPress={handleResetOnboarding} />
            </View>
          </>
        )}

        {adaptyDebug && (
          <>
            <Text style={s.sectionLabel}>Adapty Debug</Text>
            <View style={s.card}>
              <View style={s.debugRow}>
                <Text style={s.debugLabel}>Key present</Text>
                <Text style={s.debugValue}>
                  {adaptyDebug.keyPresent ? `Yes (${adaptyDebug.keyPrefix}…, ${adaptyDebug.keyLength} chars)` : 'No'}
                </Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Activation status</Text>
                <Text style={s.debugValue}>{adaptyDebug.activationStatus}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Last activation error</Text>
                <Text style={s.debugValue}>{adaptyDebug.lastActivationError ?? 'None'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Placement ID</Text>
                <Text style={s.debugValue}>{adaptyDebug.placementId}</Text>
              </View>
            </View>
          </>
        )}

        <View style={s.disclaimer}>
          <Text style={s.disclaimerTxt}>
            ⚕ Vitalspan is built by a licensed pharmacist. Biomarker ranges are longevity-optimized and evidence-graded. Not a substitute for professional medical advice.
          </Text>
          <TouchableOpacity onPress={handleVersionTap} accessibilityRole="button" accessibilityLabel="Version">
            <Text style={s.versionTxt}>Version 0.1.0</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    backgroundColor: Colors.dark.bgElevated,
  },
  closeBtn: { paddingVertical: Spacing.xs },
  closeTxt: { fontSize: Typography.sizes.base, color: Colors.dark.ctaPrimary, fontWeight: '600' },
  title: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.dark.text },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.dark.textMuted,
    textTransform: 'uppercase', letterSpacing: Typography.letterSpacing.wider,
    paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base,
  },
  card: {
    marginHorizontal: Spacing.base, backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  rowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.dark.cardBorder },
  debugRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  debugLabel: { fontSize: Typography.sizes.bodySmall, color: Colors.dark.textMuted },
  debugValue: { fontSize: Typography.sizes.bodySmall, color: Colors.dark.text, flexShrink: 1, textAlign: 'right' },
  rowIconWrap: {
    width: 32, height: 32, borderRadius: 8, /* intentional — no Radius.* equivalent for 8 */
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
  },
  rowIcon: { fontSize: Typography.sizes.lg },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: Typography.sizes.base, color: Colors.dark.text, fontWeight: '400' },
  rowDanger: { color: Colors.viz.coral },
  rowSub: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: 2 }, /* intentional — no Spacing.* equivalent for marginTop: 2 */
  rowArrow: { fontSize: Typography.sizes.h3, color: Colors.dark.textMuted, fontWeight: '300' },
  unitToggle: {
    flexDirection: 'row', backgroundColor: Colors.dark.bgElevated,
    borderRadius: Radius.md, overflow: 'hidden',
    borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
  },
  unitOpt: { paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 1 },
  unitOptActive: { backgroundColor: Colors.dark.ctaPrimary, borderRadius: Radius.md },
  unitOptTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, fontWeight: '500' },
  unitOptTxtActive: { color: Colors.dark.bg },
  disclaimer: {
    marginHorizontal: Spacing.base, marginTop: Spacing.base,
    backgroundColor: Colors.dark.cardBg, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
  },
  disclaimerTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, lineHeight: 18 },
  versionTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: Spacing.sm, textAlign: 'center' },
});
