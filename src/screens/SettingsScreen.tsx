import React, { useState, useCallback } from 'react';
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
import { Colors, Spacing, Radius, Typography, Elevation } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ALL_STORAGE_KEYS = [
  '@vitalspan_user_profile',
  '@vitalspan_biomarkers',
  '@vitalspan_protocol',
  '@vitalspan_protocol_today',
  '@vitalspan_health_data',
  '@vitalspan_health_permissions',
  '@vitalspan_first_run_complete',   // Phase 1: guided first-run completion flag
  '@vitalspan_exercise_log',         // exercise history
];

// ── Row building blocks ──────────────────────────────────────────────────────
interface RowProps {
  icon: string;
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
        <Text style={s.rowIcon}>{icon}</Text>
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

  useFocusEffect(useCallback(() => { setStatusBarStyle('dark'); return () => {}; }, []));

  function handleToggleNotif(val: boolean) {
    Haptics.selectionAsync().catch(() => null);
    setNotificationsEnabled(val);
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
      'This will return you to the landing screen. Your data stays on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
            nav.reset({ index: 0, routes: [{ name: 'Landing' }] });
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
              await Promise.all(ALL_STORAGE_KEYS.map(k => AsyncStorage.removeItem(k)));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => null);
              nav.reset({ index: 0, routes: [{ name: 'Landing' }] });
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
      const entries = await Promise.all(
        ALL_STORAGE_KEYS.map(async k => ({ key: k, value: await AsyncStorage.getItem(k) })),
      );
      const data: Record<string, unknown> = {};
      for (const { key, value } of entries) {
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
            nav.reset({ index: 0, routes: [{ name: 'Landing' }] });
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
          <SettingsRow icon="👤" title="Edit profile" subtitle="Go to Profile to edit" onPress={() => { nav.goBack(); }} />
          <SettingsRow icon="🔒" title="Sign out" subtitle="Returns to landing screen" onPress={handleSignOut} topBorder />
        </View>

        {/* Preferences */}
        <Text style={s.sectionLabel}>Preferences</Text>
        <View style={s.card}>
          <SettingsRow
            icon="🔔"
            title="Daily reminders"
            subtitle="Protocol check-ins & biomarker logging"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotif}
                trackColor={{ false: Colors.Beige.border, true: Colors.primaryBorder }}
                thumbColor={notificationsEnabled ? Colors.primary : Colors.Beige.textMuted}
              />
            }
          />
          <SettingsRow
            icon="📊"
            title="Weekly report"
            subtitle="Biomarker trends & progress summary"
            topBorder
            right={
              <Switch
                value={weeklyReport}
                onValueChange={handleToggleReport}
                trackColor={{ false: Colors.Beige.border, true: Colors.primaryBorder }}
                thumbColor={weeklyReport ? Colors.primary : Colors.Beige.textMuted}
              />
            }
          />
          <SettingsRow
            icon="📏"
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
          <SettingsRow icon="📤" title="Export my data" subtitle="JSON file with all your health data" onPress={handleExportData} />
          <SettingsRow icon="🗑" title="Clear all data" danger onPress={handleClearData} topBorder />
        </View>

        {/* About */}
        <Text style={s.sectionLabel}>About</Text>
        <View style={s.card}>
          <SettingsRow icon="ℹ" title="About Vitalspan" subtitle="Mission, citations, evidence grading" onPress={() => nav.navigate('About')} />
          <SettingsRow icon="🔏" title="Privacy Policy" subtitle="How your data is used" topBorder onPress={() => {}} />
          <SettingsRow icon="📋" title="Terms of Use" topBorder onPress={() => {}} />
          <SettingsRow icon="⭐" title="Rate on App Store" subtitle="Help us grow" topBorder onPress={() => {}} />
        </View>

        {/* Debug (dev only) */}
        {__DEV__ && (
          <>
            <Text style={s.sectionLabel}>Developer</Text>
            <View style={s.card}>
              <SettingsRow icon="🔄" title="Reset onboarding" subtitle="Debug: clears onboarding flag" onPress={handleResetOnboarding} />
            </View>
          </>
        )}

        <View style={s.disclaimer}>
          <Text style={s.disclaimerTxt}>
            ⚕ Vitalspan is built by a licensed pharmacist. Biomarker ranges are longevity-optimized and evidence-graded. Not a substitute for professional medical advice.
          </Text>
          <Text style={s.versionTxt}>Version 0.1.0</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.Beige.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    backgroundColor: Colors.Beige.headerBg,
  },
  closeBtn: { paddingVertical: Spacing.xs },
  closeTxt: { fontSize: Typography.sizes.base, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.Beige.text },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: Colors.Beige.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
    paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base,
  },
  card: {
    marginHorizontal: Spacing.base, backgroundColor: Colors.Beige.card,
    borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 0.5, borderColor: Colors.Beige.border,
    ...Elevation.sm,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  rowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.Beige.divider },
  rowIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.Beige.bgShade, alignItems: 'center', justifyContent: 'center',
  },
  rowIcon: { fontSize: 16 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: Typography.sizes.base, color: Colors.Beige.text, fontWeight: '400' },
  rowDanger: { color: Colors.danger },
  rowSub: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginTop: 2 },
  rowArrow: { fontSize: 18, color: Colors.Beige.textMuted, fontWeight: '300' },
  unitToggle: {
    flexDirection: 'row', backgroundColor: Colors.Beige.bgShade,
    borderRadius: Radius.md, overflow: 'hidden',
    borderWidth: 0.5, borderColor: Colors.Beige.border,
  },
  unitOpt: { paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 1 },
  unitOptActive: { backgroundColor: Colors.primary, borderRadius: Radius.md },
  unitOptTxt: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, fontWeight: '500' },
  unitOptTxtActive: { color: Colors.primaryBg },
  disclaimer: {
    marginHorizontal: Spacing.base, marginTop: Spacing.base,
    backgroundColor: Colors.Beige.card, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 0.5, borderColor: Colors.primaryBorder,
  },
  disclaimerTxt: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, lineHeight: 18 },
  versionTxt: { fontSize: 10, color: Colors.Beige.textMuted, marginTop: Spacing.sm, textAlign: 'center' },
});
