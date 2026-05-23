import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Switch, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ALL_STORAGE_KEYS = [
  '@vitalspan_user_profile',
  '@vitalspan_biomarkers',
  '@vitalspan_protocol',
  '@vitalspan_protocol_today',
  '@vitalspan_health_data',
];

export default function SettingsScreen() {
  const nav = useNavigation<Nav>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

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
      'This will return you to the landing screen. Your data will remain on this device.',
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
      'This will permanently delete your profile, biomarker history, and protocol. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            await Promise.all(ALL_STORAGE_KEYS.map(k => AsyncStorage.removeItem(k)));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => null);
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

        {/* Notifications */}
        <Text style={s.sectionLabel}>Notifications</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <Text style={s.rowTitle}>Daily reminders</Text>
              <Text style={s.rowSub}>Protocol check-ins & biomarker logging</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotif}
              trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.textMuted}
            />
          </View>
          <View style={[s.row, s.rowBorder]}>
            <View style={s.rowLeft}>
              <Text style={s.rowTitle}>Weekly report</Text>
              <Text style={s.rowSub}>Biomarker trends & progress summary</Text>
            </View>
            <Switch
              value={weeklyReport}
              onValueChange={handleToggleReport}
              trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
              thumbColor={weeklyReport ? Colors.primary : Colors.textMuted}
            />
          </View>
        </View>

        {/* Units */}
        <Text style={s.sectionLabel}>Units</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={handleUnitToggle}>
            <View style={s.rowLeft}>
              <Text style={s.rowTitle}>Measurement system</Text>
              <Text style={s.rowSub}>Affects weight, height display</Text>
            </View>
            <View style={s.unitToggle}>
              <View style={[s.unitOption, unitSystem === 'metric' && s.unitOptionActive]}>
                <Text style={[s.unitOptionTxt, unitSystem === 'metric' && s.unitOptionTxtActive]}>Metric</Text>
              </View>
              <View style={[s.unitOption, unitSystem === 'imperial' && s.unitOptionActive]}>
                <Text style={[s.unitOptionTxt, unitSystem === 'imperial' && s.unitOptionTxtActive]}>Imperial</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Privacy & Legal */}
        <Text style={s.sectionLabel}>Privacy & Legal</Text>
        <View style={s.card}>
          <TouchableOpacity
            style={s.row}
            onPress={() => nav.navigate('About')}
          >
            <Text style={s.rowTitle}>About Vitalspan</Text>
            <Text style={s.rowArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, s.rowBorder]}>
            <Text style={s.rowTitle}>Privacy Policy</Text>
            <Text style={s.rowArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, s.rowBorder]}>
            <Text style={s.rowTitle}>Terms of Use</Text>
            <Text style={s.rowArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Data */}
        <Text style={s.sectionLabel}>Data</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={handleSignOut}>
            <Text style={s.rowTitle}>Sign out</Text>
            <Text style={s.rowArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, s.rowBorder]} onPress={handleClearData}>
            <Text style={[s.rowTitle, { color: Colors.danger }]}>Clear all data</Text>
            <Text style={[s.rowArrow, { color: Colors.danger }]}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={s.disclaimer}>
          <Text style={s.disclaimerTxt}>
            ⚕ Vitalspan is built by a licensed pharmacist. All biomarker ranges are longevity-optimized and evidence-graded.
            This app does not provide medical advice and is not a substitute for professional healthcare.
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  closeBtn: { paddingVertical: Spacing.xs },
  closeTxt: { fontSize: Typography.sizes.base, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.textPrimary },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  rowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.border },
  rowLeft: { flex: 1 },
  rowTitle: { fontSize: Typography.sizes.base, color: Colors.textPrimary, fontWeight: '400' },
  rowSub: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  rowArrow: { fontSize: Typography.sizes.md, color: Colors.textMuted },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  unitOption: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs + 1 },
  unitOptionActive: { backgroundColor: Colors.primary, borderRadius: Radius.md },
  unitOptionTxt: { fontSize: Typography.sizes.xs, color: Colors.textMuted, fontWeight: '500' },
  unitOptionTxtActive: { color: Colors.primaryBg },
  disclaimer: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.primaryBorder,
  },
  disclaimerTxt: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
