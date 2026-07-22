import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, Alert, Share,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { setStatusBarStyle } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ProductLayout, Spacing, Radius, Typography } from '../theme';
import { PersonIcon, ShieldIcon, BellIcon, ChartBarIcon, RulerIcon, ShareIcon, TrashIcon, ClipboardIcon, RefreshIcon, StarIcon, InfoIcon } from '../components/DesignSystemIcons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { STORAGE_KEYS } from '../lib/storageKeys';
import { loadNotificationPrefs, saveNotificationPrefs, rescheduleAll, DEFAULT_PREFS, NotificationPrefs } from '../lib/notifications';
import {
  authSessionCoordinator,
  captureAuthRequestScope,
  isAuthRequestScopeCurrent,
  signOutUser,
} from '../lib/supabase';
import { getAdaptyDebugInfo, AdaptyDebugInfo } from '../lib/adapty';
import { userProfilePersistence } from '../lib/userProfilePersistence';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const APP_VERSION = Constants.expoConfig?.version ?? '—';
const APP_BUILD = Constants.expoConfig?.ios?.buildNumber
  ?? Constants.nativeBuildVersion
  ?? '—';


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
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
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
  const { width } = useWindowDimensions();
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
  const subscriptionMetadataJson = adaptyDebug
    ? JSON.stringify(adaptyDebug.subscriptionMetadata, null, 2)
    : null;
  const localizedPricesJson = adaptyDebug
    ? JSON.stringify(adaptyDebug.localizedPrices, null, 2)
    : null;
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
              const scope = captureAuthRequestScope();
              if (!scope) throw new Error('Session is unavailable');
              const registeredAccount = !authSessionCoordinator
                .getSnapshot()
                .session?.user.is_anonymous;
              await userProfilePersistence.delete(scope, registeredAccount);
              await AsyncStorage.multiRemove([...STORAGE_KEYS]);
              const { error } = await signOutUser();
              if (error) throw new Error(error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => null);
            } catch {
              Alert.alert('Clear failed', 'Could not delete all data. Please try again.');
            }
          },
        },
      ],
    );
  }

  async function handleExportData() {
    const scope = captureAuthRequestScope();
    if (!scope) return;
    try {
      const pairs = await AsyncStorage.multiGet([...STORAGE_KEYS]);
      if (!isAuthRequestScopeCurrent(scope)) return;
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
            const scope = captureAuthRequestScope();
            if (!scope) return;
            const raw = await AsyncStorage.getItem('@vitalspan_user_profile');
            if (!isAuthRequestScopeCurrent(scope)) return;
            if (raw) {
              const profile = JSON.parse(raw);
              delete profile.onboardingComplete;
              await AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(profile));
            }
            nav.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
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

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { width: Math.min(width, ProductLayout.maxContentWidth) }]}
        showsVerticalScrollIndicator={false}
      >

        <View style={s.hero}>
          <Text style={s.heroEyebrow}>VITALSPAN / SETTINGS</Text>
          <Text style={s.heroTitle}>Make Vitalspan yours.</Text>
          <Text style={s.heroBody}>Manage preferences, privacy, subscription access, and account actions.</Text>
        </View>

        <Text style={s.sectionLabel}>Profile</Text>
        <View style={s.card}>
          <SettingsRow icon={<PersonIcon color={Colors.dark.text} size={20} />} title="Edit profile" subtitle="Go to Profile to edit" onPress={() => nav.navigate('Main', { screen: 'Profile' })} />
        </View>

        <Text style={s.sectionLabel}>Subscription</Text>
        <View style={s.card}>
          <SettingsRow icon={<StarIcon color={Colors.dark.ctaPrimary} size={20} />} title="Subscription & restore purchases" subtitle="View plans, manage access, or restore" onPress={() => nav.navigate('Paywall')} />
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

        <Text style={s.sectionLabel}>Privacy & data</Text>
        <View style={s.card}>
          <SettingsRow icon={<ShareIcon color={Colors.dark.text} size={20} />} title="Export my data" subtitle="JSON file with all your health data" onPress={handleExportData} />
        </View>

        <Text style={s.sectionLabel}>Support & legal</Text>
        <View style={s.card}>
          <SettingsRow icon={<InfoIcon color={Colors.dark.text} size={20} />} title="About Vitalspan" subtitle="Mission, citations, evidence grading" onPress={() => nav.navigate('About')} />
          <SettingsRow icon={<ShieldIcon color={Colors.dark.text} size={20} />} title="Privacy Policy" subtitle="How your data is used" topBorder onPress={() => {}} />
          <SettingsRow icon={<ClipboardIcon color={Colors.dark.text} size={20} />} title="Terms of Use" topBorder onPress={() => {}} />
          <SettingsRow icon={<StarIcon color={Colors.dark.text} size={20} />} title="Rate on App Store" subtitle="Help us grow" topBorder onPress={() => {}} />
        </View>

        <Text style={s.sectionLabel}>Account actions</Text>
        <View style={s.card}>
          <SettingsRow icon={<ShieldIcon color={Colors.dark.text} size={20} />} title="Sign out" subtitle="Clears this account from this device" onPress={handleSignOut} />
        </View>

        <Text style={[s.sectionLabel, s.dangerSectionLabel]}>Destructive actions</Text>
        <View style={[s.card, s.dangerCard]}>
          <SettingsRow icon={<TrashIcon color={Colors.viz.coral} size={20} />} title="Clear all data" subtitle="Permanently deletes supported account data" danger onPress={handleClearData} />
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
                <Text style={s.debugLabel}>Adapty key present</Text>
                <Text style={s.debugValue}>
                  {adaptyDebug.keyStatus === 'present'
                    ? `Yes (${adaptyDebug.keyPrefix}…, ${adaptyDebug.keyLength} chars)`
                    : adaptyDebug.keyStatus === 'placeholder'
                      ? `Invalid placeholder (${adaptyDebug.keyPrefix}…, ${adaptyDebug.keyLength} chars)`
                      : 'No'}
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
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Failed stage</Text>
                <Text style={s.debugValue}>{adaptyDebug.failedStage ?? 'None'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Error name</Text>
                <Text style={s.debugValue}>{adaptyDebug.errorName ?? 'None'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Error code</Text>
                <Text style={s.debugValue}>
                  {adaptyDebug.errorCode !== null ? String(adaptyDebug.errorCode) : 'None'}
                </Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Adapty error code</Text>
                <Text style={s.debugValue}>
                  {adaptyDebug.adaptyErrorCode !== null ? String(adaptyDebug.adaptyErrorCode) : 'None'}
                </Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Error message</Text>
                <Text style={s.debugValue}>{adaptyDebug.errorMessage ?? 'None'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Original error code</Text>
                <Text style={s.debugValue}>
                  {adaptyDebug.originalErrorCode !== null ? String(adaptyDebug.originalErrorCode) : 'None'}
                </Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Original error message</Text>
                <Text style={s.debugValue}>{adaptyDebug.originalErrorMessage ?? 'None'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Variation ID</Text>
                <Text style={s.debugValue}>{adaptyDebug.variationId ?? 'None'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Revision</Text>
                <Text style={s.debugValue}>
                  {adaptyDebug.revision !== null ? String(adaptyDebug.revision) : 'None'}
                </Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Product count</Text>
                <Text style={s.debugValue}>
                  {adaptyDebug.productCount !== null ? String(adaptyDebug.productCount) : 'None'}
                </Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Product IDs</Text>
                <Text style={s.debugValue}>
                  {adaptyDebug.productIds.length > 0 ? adaptyDebug.productIds.join(', ') : 'None'}
                </Text>
              </View>
              <View style={[s.debugRow, s.rowBorder, s.debugBlockRow]}>
                <Text style={s.debugLabel}>Subscription metadata</Text>
                <Text style={[s.debugValue, s.debugJson]} selectable>
                  {subscriptionMetadataJson ?? '[]'}
                </Text>
              </View>
              <View style={[s.debugRow, s.rowBorder, s.debugBlockRow]}>
                <Text style={s.debugLabel}>Localized prices</Text>
                <Text style={[s.debugValue, s.debugJson]} selectable>
                  {localizedPricesJson ?? '[]'}
                </Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Last updated</Text>
                <Text style={s.debugValue}>{adaptyDebug.lastUpdatedAt ?? 'None'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Supabase URL present</Text>
                <Text style={s.debugValue}>{adaptyDebug.runtimeChecks.supabaseUrlPresent ? 'Yes' : 'No'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Supabase anon present</Text>
                <Text style={s.debugValue}>{adaptyDebug.runtimeChecks.supabaseAnonKeyPresent ? 'Yes' : 'No'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Placeholder detected</Text>
                <Text style={s.debugValue}>{adaptyDebug.runtimeChecks.placeholderDetected ? 'Yes' : 'No'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Bundle ID</Text>
                <Text style={s.debugValue}>{adaptyDebug.runtimeChecks.expectedBundleIdentifier}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>SDK version</Text>
                <Text style={s.debugValue}>{adaptyDebug.runtimeChecks.sdkVersion}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Activation calls</Text>
                <Text style={s.debugValue}>{String(adaptyDebug.runtimeChecks.activationCallCount)}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Last purchase stage</Text>
                <Text style={s.debugValue}>{adaptyDebug.lastPurchaseStage ?? 'None'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Last purchase result</Text>
                <Text style={s.debugValue}>{adaptyDebug.lastPurchaseResult ?? 'None'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Last restore result</Text>
                <Text style={s.debugValue}>{adaptyDebug.lastRestoreResult ?? 'None'}</Text>
              </View>
              <View style={[s.debugRow, s.rowBorder]}>
                <Text style={s.debugLabel}>Lifecycle timestamp</Text>
                <Text style={s.debugValue}>{adaptyDebug.timestamp ?? 'None'}</Text>
              </View>
            </View>
          </>
        )}

        <View style={s.disclaimer}>
          <Text style={s.disclaimerTxt}>
            ⚕ Vitalspan is built by a licensed pharmacist. Biomarker ranges are longevity-optimized and evidence-graded. Not a substitute for professional medical advice.
          </Text>
          <TouchableOpacity onPress={handleVersionTap} accessibilityRole="button" accessibilityLabel="Version">
            <Text style={s.versionTxt}>Version {APP_VERSION}</Text>
            <Text style={s.versionTxt}>Build {APP_BUILD}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: ProductLayout.bottomClearance }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    backgroundColor: Colors.dark.bg,
  },
  closeBtn: { paddingVertical: Spacing.xs },
  closeTxt: { fontSize: Typography.sizes.base, color: Colors.dark.ctaPrimary, fontWeight: '600' },
  title: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.dark.text },
  scroll: { flex: 1 },
  scrollContent: { alignSelf: 'center' },
  hero: { paddingHorizontal: ProductLayout.pageInset, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  heroEyebrow: { color: Colors.dark.ctaPrimary, fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest },
  heroTitle: { color: Colors.dark.text, fontSize: Typography.sizes.display3, lineHeight: Typography.lineHeights.display3, fontWeight: Typography.weights.title, marginTop: Spacing.xs },
  heroBody: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.sm, maxWidth: 480 },
  sectionLabel: {
    fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.dark.textMuted,
    textTransform: 'uppercase', letterSpacing: Typography.letterSpacing.wider,
    paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base,
  },
  card: {
    marginHorizontal: Spacing.base, backgroundColor: Colors.dark.bgCard,
    borderRadius: Radius.card, overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.cardBorder,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    minHeight: 64, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  rowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.dark.cardBorder },
  debugRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  debugBlockRow: {
    alignItems: 'flex-start',
  },
  debugLabel: { fontSize: Typography.sizes.bodySmall, color: Colors.dark.textMuted },
  debugValue: { fontSize: Typography.sizes.bodySmall, color: Colors.dark.text, flexShrink: 1, textAlign: 'right' },
  debugJson: {
    flex: 1,
    textAlign: 'left',
    fontFamily: 'Courier',
  },
  rowIconWrap: {
    width: 32, height: 32, borderRadius: 8, /* intentional — no Radius.* equivalent for 8 */
    backgroundColor: Colors.dark.inputBg, alignItems: 'center', justifyContent: 'center',
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
  dangerSectionLabel: { color: Colors.viz.coral, marginTop: Spacing.xl },
  dangerCard: { borderColor: Colors.dark.statusCritBorder },
});
