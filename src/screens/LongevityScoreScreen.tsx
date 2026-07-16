import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, Radius } from '../theme';
import NeuralGrid from '../components/NeuralGrid';
import { OrbitalInfoModal } from '../components/OrbitalInfoModal';
import {
  computePhenoAge,
  createPhenoAgeInputsFromEntries,
  PHENO_BIOMARKER_LIST,
  type PhenoAgeRequirementStatus,
  type PhenoAgeResult,
} from '../lib/phenoAge';
import {
  connectAndSync,
  loadHealthData,
  loadPermissionStatus,
  requestHealthKitPermissions,
  formatSyncTime,
  HealthData,
} from '../lib/healthkit';
import type { StoredEntry } from '../types/biomarkerEntry';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: W } = Dimensions.get('window');
const SPHERE_R = 88;
const SPHERE_CX = W / 2;
const SPHERE_CY = 156;
const ORBIT_R = 148;
const SVG_H = 340;

const DATA_POINTS = [
  { key: 'sleep',       label: 'Sleep',    unit: 'hrs', angle: -90 },
  { key: 'hrv',         label: 'HRV',      unit: 'ms',  angle: -30 },
  { key: 'recovery',    label: 'Recovery', unit: '%',   angle: 30 },
  { key: 'inflammation',label: 'hsCRP',    unit: 'mg/L', angle: 90 },
  { key: 'glucose',     label: 'Glucose',  unit: '',    angle: 150 },
  { key: 'fitness',     label: 'Fitness',  unit: '',    angle: 210 },
] as const;

// Metric empty-state copy — specific reason + CTA hint
const METRIC_EMPTY: Record<string, { reason: string; cta: string }> = {
  sleep:        { reason: '3 nights required', cta: 'Connect Health' },
  hrv:          { reason: 'HealthKit needed',  cta: 'Connect below' },
  recovery:     { reason: 'Needs HRV + sleep', cta: 'Connect below' },
  inflammation: { reason: 'Log hsCRP',         cta: 'Log biomarker' },
  glucose:      { reason: 'Log fasting glucose', cta: 'Log or sync' },
  fitness:      { reason: 'VO₂ max pending',   cta: 'Connect Health' },
};

interface UserProfile { name?: string; age?: number }

function polarToXY(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function healthScoreColor(hasEstimate: boolean): [string, string] {
  return hasEstimate ? ['#0D2B22', '#2D6A4F'] : ['#1C3B2A', '#2D6A4F'];
}

// Returns a display value for an orbital metric, or null when data is unavailable.
function dataValue(snap: HealthData, key: string, extras?: { inflammation?: string | null }): string | null {
  switch (key) {
    case 'sleep':
      return snap.sleepHours != null ? `${snap.sleepHours}h` : null;
    case 'hrv':
      return snap.hrv != null ? `${snap.hrv}` : null;
    case 'recovery':
      return snap.recovery != null ? `${snap.recovery}%` : null;
    case 'inflammation':
      return extras?.inflammation ?? null;
    case 'glucose':
      return snap.glucose != null ? `${snap.glucose}` : null;
    case 'fitness':
      return snap.vo2max != null ? `${snap.vo2max.toFixed(0)}` : null;
    default:
      return null;
  }
}


// ── Explainer sheet (module-level to prevent unmount on parent re-render) ──
interface ExplainerModalProps {
  visible: boolean;
  onClose: () => void;
  onConnectHealth: () => void;
  nav: Nav;
}
function ExplainerModal({ visible, onClose, onConnectHealth, nav }: ExplainerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={s.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={s.explainerSheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Blood phenotypic age</Text>
          <Text style={s.sheetBody}>
            An estimate based on chronological age and nine blood measurements. It is not a diagnosis and does not represent every dimension of aging.
          </Text>
          <View style={s.explainItem}>
            <Text style={s.explainEmoji}>🧬</Text>
            <View style={s.explainText}>
              <Text style={s.explainHead}>Sphere center</Text>
              <Text style={s.explainDesc}>Calculated only when all nine required inputs are present, valid, current, and unit-compatible with the published Levine formula.</Text>
            </View>
          </View>
          <View style={s.explainItem}>
            <Text style={s.explainEmoji}>⌚</Text>
            <View style={s.explainText}>
              <Text style={s.explainHead}>Orbital metrics</Text>
              <Text style={s.explainDesc}>Sleep, HRV, Recovery, Fitness, Glucose, and Inflammation — pulled from Apple Health in real-time.</Text>
            </View>
          </View>
          <View style={s.explainItem}>
            <Text style={s.explainEmoji}>ℹ</Text>
            <View style={s.explainText}>
              <Text style={s.explainHead}>Model limitations</Text>
              <Text style={s.explainDesc}>Do not compare results across incompatible laboratories or units without normalization. Longitudinal aging velocity is not calculated yet.</Text>
            </View>
          </View>
          <View style={s.quickActions}>
            <TouchableOpacity
              style={s.qaBtn}
              onPress={() => { onClose(); nav.navigate('BiomarkerEntry', { biomarkerId: undefined }); }}
            >
              <Text style={s.qaBtnTxt}>Log Biomarkers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.qaBtn, s.qaBtnSecondary]}
              onPress={() => { onClose(); onConnectHealth(); }}
            >
              <Text style={s.qaBtnTxt}>Connect Apple Health</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Score transparency sheet (module-level to prevent unmount on parent re-render) ──
interface TransparencyModalProps {
  visible: boolean;
  onClose: () => void;
  result: PhenoAgeResult | null;
}

const REQUIREMENT_LABELS: Record<PhenoAgeRequirementStatus, string> = {
  present: 'Present',
  missing: 'Missing',
  stale: 'Stale',
  invalid: 'Invalid',
  unit_incompatible: 'Unit incompatible',
};

function TransparencyModal({ visible, onClose, result }: TransparencyModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={s.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[s.explainerSheet, { maxHeight: '85%' }]}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>How is this calculated?</Text>
          <Text style={s.sheetBody}>
            Data completeness: <Text style={{ color: Colors.viz.bioGreen, fontWeight: '700' }}>{result?.presentCount ?? 0}/9 required inputs</Text>.
            {' '}Model confidence has not been established for this individual.
          </Text>
          <Text style={s.sheetBody}>
            Chronological age: {result?.ageValid ? result.chronologicalAge : 'Missing or invalid'}
          </Text>

          <Text style={s.transparencySubHead}>Required blood measurements</Text>
          {PHENO_BIOMARKER_LIST.map(b => {
            const requirement = result?.requirements.find(item => item.key === b.key);
            const present = requirement?.status === 'present';
            return (
              <View key={b.biomarkerId} style={s.transparencyRow}>
                <Text
                  style={[s.transparencyCheck, { color: present ? Colors.viz.bioGreen : Colors.dark.textMuted }]}
                >
                  {present ? '✓' : '○'}
                </Text>
                <Text
                  style={[s.transparencyLabel, { color: present ? Colors.dark.text : Colors.dark.textMuted }]}
                >
                  {b.label}
                </Text>
                <View style={s.requirementDetail}>
                  <Text style={s.transparencyUnit}>{REQUIREMENT_LABELS[requirement?.status ?? 'missing']}</Text>
                  <Text style={s.transparencyUnit}>{requirement?.reportedUnit ?? '—'} → {b.publishedUnit}</Text>
                  {requirement?.unitSource === 'legacy_definition' && (
                    <Text style={s.legacyUnitNote}>Legacy unit fallback</Text>
                  )}
                </View>
              </View>
            );
          })}

          <View style={s.improvementSection}>
            <Text style={s.transparencySubHead}>Model limitations</Text>
            {(result?.modelLimitations ?? []).map(limitation => (
              <Text key={limitation} style={s.limitationText}>• {limitation}</Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function LongevityScoreScreen() {
  const nav = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [healthData, setHealthData] = useState<HealthData>({});
  const [biomarkerEntries, setBiomarkerEntries] = useState<StoredEntry[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [showTransparency, setShowTransparency] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionState, setPermissionState] = useState<'pre-request' | 'granted' | 'denied' | 'loading'>('loading');
  const [orbitalModal, setOrbitalModal] = useState<{ title: string; body: string; ctaLabel?: string; onCta?: () => void } | null>(null);

  // Apple Health remains independent from blood phenotypic-age completeness.
  const isConnected = permissionState === 'granted';

  // Prompt fade-in animation
  const promptOpacity = useSharedValue(0);
  const promptStyle = useAnimatedStyle(() => ({ opacity: promptOpacity.value }));

  const loadAll = useCallback(async () => {
    try {
      const [pRaw, bRaw, perms] = await Promise.all([
        AsyncStorage.getItem('@vitalspan_user_profile'),
        AsyncStorage.getItem('@vitalspan_biomarkers'),
        loadPermissionStatus(),
      ]);
      if (pRaw) setProfile(JSON.parse(pRaw));
      if (bRaw) setBiomarkerEntries(JSON.parse(bRaw));

      // Derive permission state
      if (perms == null || !perms.hasRequestedHealthKit) {
        setPermissionState('pre-request');
        promptOpacity.value = withTiming(1.0, { duration: 400 });
      } else if (perms.hasRequestedHealthKit && perms.granted) {
        setPermissionState('granted');
        const hData = await loadHealthData();
        if (hData) setHealthData(hData);
      } else {
        setPermissionState('denied');
        promptOpacity.value = withTiming(1.0, { duration: 400 });
      }
    } catch (e) {
      console.error('[LongevityScore loadAll]', e);
      Alert.alert(
        'Data error',
        'Some saved data could not be read. If this persists, use Settings → Clear all data.',
      );
    }
  }, [promptOpacity]);

  useFocusEffect(
    useCallback(() => {
      loadAll().catch(console.error);
    }, [loadAll]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadAll().catch(console.error);
    setRefreshing(false);
  }

  async function handleResync() {
    if (connecting) return;
    setConnecting(true);
    try {
      const syncResult = await connectAndSync();
      if (syncResult.success && syncResult.data) setHealthData(syncResult.data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    } catch (e) {
      console.error('[LongevityScore resync]', e);
    } finally {
      setConnecting(false);
    }
  }

  async function handleRequestPermission() {
    setConnecting(true);
    try {
      const perms = await requestHealthKitPermissions();
      if (perms.granted) {
        // initHealthKit succeeded — load whatever data is available (no Watch = empty orbitals, not denied)
        const syncResult = await connectAndSync();
        if (syncResult.success && syncResult.data) setHealthData(syncResult.data);
        setPermissionState('granted');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
      } else {
        // initHealthKit error callback fired — user denied at system level
        setPermissionState('denied');
        promptOpacity.value = withTiming(1.0, { duration: 400 });
      }
    } catch (e) {
      console.error('[LongevityScore handleRequestPermission]', e);
      setPermissionState('denied');
      promptOpacity.value = withTiming(1.0, { duration: 400 });
    } finally {
      setConnecting(false);
    }
  }

  function handleOpenSettings() {
    Linking.openURL('app-settings:').catch((e) =>
      console.warn('[LongevityScore] Could not open settings', e),
    );
  }

  function handleDismissPrompt() {
    // User chose to continue without Health data — show empty orbitals
    setPermissionState('granted');
  }

  function handleOrbitalPress(metricKey: 'sleep' | 'hrv' | 'fitness') {
    if (permissionState === 'pre-request') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
      handleRequestPermission();
      return;
    }
    if (metricKey === 'sleep') {
      if (permissionState === 'denied') {
        // D-04: denied → call handleOpenSettings() directly, no modal
        handleOpenSettings();
        return;
      }
      // permissionState === 'granted' but no data
      setOrbitalModal({
        title: 'Sleep Score Unavailable',
        body: 'Open Apple Health, record sleep for at least 3 nights, then return here to see your score.',
      });
    } else {
      // hrv or fitness
      const isGranted = permissionState === 'granted';
      const ctaAction = permissionState === 'denied'
        ? () => { setOrbitalModal(null); handleOpenSettings(); }
        : undefined; // no CTA when already connected — the body text is sufficient
      setOrbitalModal({
        title: metricKey === 'hrv' ? 'HRV Score Unavailable' : 'Fitness Score Unavailable',
        body: isGranted
          ? 'HRV and VO₂ max require an Apple Watch paired to this iPhone and synced with Apple Health.'
          : 'Connect Apple Health to see live HRV and VO₂ max data from your Apple Watch.',
        ctaLabel: isGranted ? undefined : 'Connect Health',
        onCta: ctaAction,
      });
    }
  }

  // Animations
  const rotation = useSharedValue(0);
  const spherePulse = useSharedValue(0.85);
  const entranceScale = useSharedValue(0.7);
  const entranceOpacity = useSharedValue(0);
  const dpOpacity = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 14000, easing: Easing.linear }), -1, false,
    );
    spherePulse.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 3200, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
        withTiming(0.85, { duration: 3200, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
      ), -1, false,
    );
    entranceScale.value = withTiming(1.0, { duration: 900, easing: Easing.out(Easing.cubic) });
    entranceOpacity.value = withTiming(1.0, { duration: 700, easing: Easing.out(Easing.quad) });
    dpOpacity.value = withDelay(500, withTiming(1.0, { duration: 600, easing: Easing.out(Easing.quad) }));
  }, []);

  const arcStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const sphereContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: entranceScale.value }],
    opacity: entranceOpacity.value,
  }));
  const dpStyle = useAnimatedStyle(() => ({ opacity: dpOpacity.value }));
  const sphereInnerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(spherePulse.value, [0.85, 1.0], [0.85, 1.0]),
  }));

  // Single entryMap — used by both PhenoAge computation and score transparency UI
  const entryMap = React.useMemo(() => {
    const m = new Map<string, StoredEntry>();
    for (const e of biomarkerEntries) {
      const ex = m.get(e.biomarkerId);
      if (!ex || e.date > ex.date) m.set(e.biomarkerId, e);
    }
    return m;
  }, [biomarkerEntries]);

  // PhenoAge computation
  const phenoResult = React.useMemo(() => {
    if (!profile?.age || profile.age <= 0) return null;
    return computePhenoAge(createPhenoAgeInputsFromEntries(profile.age, entryMap));
  }, [entryMap, profile]);

  // Enrich health data with biomarker-derived values
  const derivedHealth = React.useMemo((): HealthData => {
    const h = { ...healthData };
    if (h.glucose == null) {
      const entry = biomarkerEntries
        .filter(e => e.biomarkerId === 'fastingglucose')
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      if (entry) h.glucose = entry.value;
    }
    return h;
  }, [healthData, biomarkerEntries]);

  const inflammationValue = React.useMemo((): string | null => {
    const entry = biomarkerEntries
      .filter(e => e.biomarkerId === 'hscrp')
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!entry) return null;
    return String(entry.value);
  }, [biomarkerEntries]);

  const bioAge = phenoResult?.bloodPhenotypicAge ?? null;
  const [gradStart, gradEnd] = healthScoreColor(bioAge != null);

  function arcPath(r: number): string {
    const start = polarToXY(-135, r, SPHERE_CX, SPHERE_CY);
    const end   = polarToXY(135, r, SPHERE_CX, SPHERE_CY);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`;
  }

  // Render the HealthKit card area based on permission state
  function renderHealthKitArea() {
    if (permissionState === 'loading') {
      return null;
    }

    if (permissionState === 'pre-request') {
      return (
        <Animated.View style={[s.permissionPromptCard, promptStyle]}>
          <Text style={s.permissionPromptIcon}>⌚</Text>
          <Text style={s.permissionPromptHeadline}>Connect Apple Health</Text>
          <Text style={s.permissionPromptBody}>
            Sync HRV, sleep, VO₂ max and glucose to power your longevity orbitals.
          </Text>
          <TouchableOpacity
            style={s.permissionCta}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
              handleRequestPermission();
            }}
            disabled={connecting}
            accessibilityRole="button"
            accessibilityLabel="Connect Apple Health"
          >
            <Text style={s.permissionCtaTxt}>
              {connecting ? 'Connecting…' : 'Connect Apple Health'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (permissionState === 'denied') {
      return (
        <Animated.View style={[s.permissionPromptCard, promptStyle]}>
          <Text style={[s.permissionDeniedIcon, { color: Colors.warning }]}>⚠</Text>
          <Text style={s.permissionPromptHeadline}>Apple Health access needed</Text>
          <Text style={s.permissionPromptBody}>
            Enable Health access in Settings to see live HRV, sleep and recovery data.
          </Text>
          <TouchableOpacity
            style={s.permissionCta}
            onPress={handleOpenSettings}
            accessibilityRole="button"
            accessibilityLabel="Open Settings"
          >
            <Text style={s.permissionCtaTxt}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDismissPrompt}
            accessibilityRole="button"
          >
            <Text style={s.permissionDismissLink}>Continue without Health data</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    // State B — granted: preserve existing connected card
    return (
      <TouchableOpacity
        style={[s.healthKitCard, s.healthKitCardConnected]}
        onPress={handleResync}
        disabled={connecting}
      >
        <Text style={s.hkIcon}>✓</Text>
        <View style={s.hkBody}>
          <Text style={s.hkTitle}>Apple Health connected</Text>
          <Text style={s.hkSub}>
            {`Last sync: ${formatSyncTime(healthData.lastSynced)}`}
          </Text>
        </View>
        <Text style={s.hkArrow}>↻</Text>
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient colors={['#080D09', '#0C1410', '#0F1C14']} style={s.gradient}>
      <SafeAreaView style={s.safe}>
        <NeuralGrid intensity="high" tone="vital" />

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.viz.bioGreen}
            />
          }
        >
          {/* Header */}
          <View style={s.topBar}>
            <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={s.screenTitle}>BLOOD PHENOTYPIC AGE</Text>
            <TouchableOpacity
              style={s.helpBtn}
              onPress={() => {
                Haptics.selectionAsync().catch(() => null);
                setShowExplainer(true);
              }}
            >
              <Text style={s.helpBtnTxt}>?</Text>
            </TouchableOpacity>
          </View>

          {/* Sphere + orbit visualization */}
          <Animated.View style={[s.sphereArea, sphereContainerStyle]}>
            <Svg width={W} height={SVG_H} style={StyleSheet.absoluteFill}>
              <Defs>
                <RadialGradient id="sphereGlow" cx="40%" cy="35%" r="65%" fx="40%" fy="35%">
                  <Stop offset="0%" stopColor={gradStart === gradEnd ? '#3A6B4A' : '#2D5C3E'} stopOpacity="1" />
                  <Stop offset="60%" stopColor={gradEnd} stopOpacity="1" />
                  <Stop offset="100%" stopColor="#040808" stopOpacity="1" />
                </RadialGradient>
              </Defs>
              <Circle cx={SPHERE_CX} cy={SPHERE_CY} r={ORBIT_R + 2} fill="none"
                stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
              <Circle cx={SPHERE_CX} cy={SPHERE_CY} r={SPHERE_R + 22} fill="none"
                stroke={Colors.viz.bioGreen} strokeWidth={0.5} strokeOpacity={0.15} />
              <Circle cx={SPHERE_CX} cy={SPHERE_CY} r={SPHERE_R} fill="url(#sphereGlow)" />
              <Circle cx={SPHERE_CX} cy={SPHERE_CY} r={SPHERE_R - 1} fill="none"
                stroke="rgba(255,255,255,0.10)" strokeWidth={1.5} />
            </Svg>

            <Animated.View style={[StyleSheet.absoluteFill, arcStyle]}>
              <Svg width={W} height={SVG_H} style={StyleSheet.absoluteFill}>
                <Defs>
                  <SvgGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor={Colors.viz.bioGreen} stopOpacity="0.8" />
                    <Stop offset="50%" stopColor={Colors.viz.cyan} stopOpacity="0.6" />
                    <Stop offset="100%" stopColor={Colors.viz.bioGreen} stopOpacity="0.1" />
                  </SvgGradient>
                </Defs>
                <Path d={arcPath(SPHERE_R + 14)} fill="none" stroke="url(#arcGrad)"
                  strokeWidth={2} strokeLinecap="round" strokeDasharray="8 6" />
              </Svg>
            </Animated.View>

            <Animated.View style={[s.sphereTextContainer, sphereInnerStyle]}>
              {bioAge != null ? (
                <>
                  <Text style={s.bioAgeHero}>{bioAge}</Text>
                  <Text style={s.bioAgeLabel}>BLOOD PHENOTYPIC AGE</Text>
                </>
              ) : (
                <>
                  <Text style={s.bioAgePending}>—</Text>
                  <Text style={s.bioAgeLabel}>
                    {phenoResult != null
                      ? `${phenoResult.presentCount}/9 INPUTS READY`
                      : 'LOG 9 REQUIRED INPUTS'}
                  </Text>
                </>
              )}
            </Animated.View>

            {/* Data orbs */}
            <Animated.View style={[StyleSheet.absoluteFill, dpStyle]}>
              {DATA_POINTS.map(dp => {
                const { x, y } = polarToXY(dp.angle, ORBIT_R, SPHERE_CX, SPHERE_CY);
                const val = dataValue(derivedHealth, dp.key, { inflammation: inflammationValue });
                const empty = METRIC_EMPTY[dp.key];
                const isTappableKey = dp.key === 'sleep' || dp.key === 'hrv' || dp.key === 'fitness';
                const orbContent = val != null ? (
                  <>
                    <Text style={s.dataOrbVal}>{val}</Text>
                    <Text style={s.dataOrbLabel}>{dp.label}</Text>
                  </>
                ) : (
                  <>
                    <Text style={s.dataOrbEmptyIcon}>+</Text>
                    <Text style={s.dataOrbEmptyLabel}>{empty.cta}</Text>
                  </>
                );
                if (val == null && isTappableKey) {
                  return (
                    <TouchableOpacity
                      key={dp.key}
                      style={{ position: 'absolute', left: x - 30, top: y - 22 }}
                      activeOpacity={0.75}
                      onPress={() => handleOrbitalPress(dp.key as 'sleep' | 'hrv' | 'fitness')}
                    >
                      <View style={[s.dataOrb, s.dataOrbEmpty]}>
                        {orbContent}
                      </View>
                    </TouchableOpacity>
                  );
                }
                return (
                  <View key={dp.key} style={[s.dataOrb, { left: x - 30, top: y - 22 }, val == null && s.dataOrbEmpty]}>
                    {orbContent}
                  </View>
                );
              })}
            </Animated.View>
          </Animated.View>

          {/* Scientific stop-loss status — no lifespan or biological-age projection. */}
          <View style={s.projectionCard}>
            <Text style={s.projLabel}>MODEL STATUS</Text>
            <Text style={s.projValue}>Data completeness: {phenoResult?.presentCount ?? 0}/9</Text>
            <Text style={s.projSub}>Longitudinal trend: Insufficient longitudinal history</Text>
            <Text style={s.projSub}>
              Last calculated: {phenoResult?.calculatedAt
                ? new Date(phenoResult.calculatedAt).toLocaleDateString()
                : 'Not calculated'}
            </Text>
          </View>

          {/* Metric grid */}
          <View style={s.metricGrid}>
            {DATA_POINTS.map(dp => {
              const val = dataValue(derivedHealth, dp.key, { inflammation: inflammationValue });
              const empty = METRIC_EMPTY[dp.key];
              const isTappableKey = dp.key === 'sleep' || dp.key === 'hrv' || dp.key === 'fitness';
              const cellContent = val != null ? (
                <>
                  <Text style={s.metricVal}>{val}</Text>
                  <Text style={s.metricLabel}>{dp.label}</Text>
                  {dp.unit !== '' && <Text style={s.metricUnit}>{dp.unit}</Text>}
                </>
              ) : (
                <>
                  <Text style={s.metricEmptyVal}>○</Text>
                  <Text style={s.metricLabel}>{dp.label}</Text>
                  <Text style={s.metricEmptyReason}>{empty.reason}</Text>
                </>
              );
              if (val == null && isTappableKey) {
                return (
                  <TouchableOpacity
                    key={dp.key}
                    style={[s.metricCell, s.metricCellEmpty]}
                    activeOpacity={0.75}
                    onPress={() => handleOrbitalPress(dp.key as 'sleep' | 'hrv' | 'fitness')}
                  >
                    {cellContent}
                  </TouchableOpacity>
                );
              }
              return (
                <View key={dp.key} style={[s.metricCell, val == null && s.metricCellEmpty]}>
                  {cellContent}
                </View>
              );
            })}
          </View>

          {/* Score transparency toggle */}
          <TouchableOpacity
            style={s.transparencyToggle}
            onPress={() => {
              Haptics.selectionAsync().catch(() => null);
              setShowTransparency(true);
            }}
          >
            <Text style={s.transparencyToggleLeft}>
              How is this calculated?
            </Text>
            <View style={s.confidencePill}>
              <Text style={s.confidenceTxt}>{phenoResult?.presentCount ?? 0}/9 inputs</Text>
            </View>
          </TouchableOpacity>

          {/* HealthKit area — three permission states */}
          {renderHealthKitArea()}

          {/* Quick actions */}
          <View style={s.quickActionRow}>
            <TouchableOpacity
              style={s.quickActionBtn}
              onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: undefined })}
            >
              <Text style={s.quickActionIcon}>🧬</Text>
              <Text style={s.quickActionTxt}>Log biomarkers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.quickActionBtn}
              onPress={() => {
                if (permissionState !== 'granted') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
                  handleRequestPermission();
                } else {
                  handleRefresh();
                }
              }}
            >
              <Text style={s.quickActionIcon}>⌚</Text>
              <Text style={s.quickActionTxt}>{isConnected ? 'Resync health' : 'Connect Health'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.quickActionBtn}
              onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: 'albumin' })}
            >
              <Text style={s.quickActionIcon}>📋</Text>
              <Text style={s.quickActionTxt}>Blood age inputs</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <ExplainerModal
          visible={showExplainer}
          onClose={() => setShowExplainer(false)}
          onConnectHealth={handleRequestPermission}
          nav={nav}
        />
        <TransparencyModal
          visible={showTransparency}
          onClose={() => setShowTransparency(false)}
          result={phenoResult}
        />
        {orbitalModal && (
          <OrbitalInfoModal
            visible={true}
            title={orbitalModal.title}
            body={orbitalModal.body}
            ctaLabel={orbitalModal.ctaLabel}
            onCta={orbitalModal.onCta}
            onDismiss={() => setOrbitalModal(null)}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: Colors.dark.text },
  screenTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    letterSpacing: Typography.letterSpacing.widest,
  },
  helpBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  helpBtnTxt: { fontSize: 16, color: Colors.dark.textMuted, fontWeight: '600' },

  dataOrbDemoChip: {
    fontSize: 7,
    color: 'rgba(245,158,11,0.6)',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  metricDemoChip: {
    fontSize: 8,
    color: 'rgba(245,158,11,0.55)',
    letterSpacing: 0.3,
    marginTop: 1,
  },

  sphereArea: { width: W, height: SVG_H, alignSelf: 'center' },

  sphereTextContainer: {
    position: 'absolute',
    left: SPHERE_CX - 60, top: SPHERE_CY - 36,
    width: 120, alignItems: 'center',
  },
  bioAgeHero: { fontSize: 52, fontWeight: '200', color: Colors.dark.text, lineHeight: 56, letterSpacing: -1 },
  bioAgePending: { fontSize: 44, fontWeight: '200', color: 'rgba(232,245,238,0.25)', lineHeight: 50 },
  bioAgeLabel: { fontSize: 10, fontWeight: '600', color: Colors.dark.textMuted, letterSpacing: Typography.letterSpacing.widest, marginTop: -4 },
  bioAgeDiff: { fontSize: Typography.sizes.xs, color: Colors.viz.bioGreen, marginTop: 4, fontWeight: '500' },

  dataOrb: {
    position: 'absolute', width: 60, height: 44,
    backgroundColor: 'rgba(20,25,22,0.85)',
    borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  dataOrbEmpty: { borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(20,25,22,0.60)' },
  dataOrbVal: { fontSize: 14, fontWeight: '400', color: Colors.viz.bioGreen, letterSpacing: -0.3 },
  dataOrbLabel: { fontSize: 9, color: Colors.dark.textMuted, marginTop: 1, letterSpacing: 0.3 },
  dataOrbEmptyIcon: { fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 14 },
  dataOrbEmptyLabel: { fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 1, textAlign: 'center', letterSpacing: 0.2 },

  projectionCard: {
    marginHorizontal: Spacing.base, marginTop: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.xl, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.base,
  },
  projLabel: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, letterSpacing: Typography.letterSpacing.widest, marginBottom: Spacing.xs },
  projValue: { fontSize: Typography.sizes.h2, fontWeight: '300', color: Colors.dark.text, marginBottom: Spacing.xs },
  projSub: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, lineHeight: 18 },

  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: Spacing.base, marginTop: Spacing.base, gap: Spacing.sm },
  metricCell: {
    width: (W - Spacing.base * 2 - Spacing.sm * 2) / 3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.md, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.07)',
    padding: Spacing.md, alignItems: 'center', minHeight: 72,
  },
  metricCellEmpty: { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' },
  metricVal: { fontSize: Typography.sizes.lg, fontWeight: '400', color: Colors.viz.bioGreen, letterSpacing: -0.3 },
  metricEmptyVal: { fontSize: 16, color: 'rgba(255,255,255,0.18)', marginBottom: 2 },
  metricLabel: { fontSize: 10, color: Colors.dark.textMuted, marginTop: 3, letterSpacing: 0.3 },
  metricUnit: { fontSize: 9, color: Colors.dark.textMuted, opacity: 0.6, marginTop: 1 },
  metricEmptyReason: { fontSize: 8, color: 'rgba(255,255,255,0.22)', marginTop: 2, textAlign: 'center', lineHeight: 11 },

  transparencyToggle: {
    marginHorizontal: Spacing.base, marginTop: Spacing.base,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.lg, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.md,
  },
  transparencyToggleLeft: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted },
  confidencePill: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderWidth: 0.5, borderColor: 'rgba(74,222,128,0.3)',
  },
  confidenceTxt: { fontSize: Typography.sizes.xs, color: Colors.viz.bioGreen, fontWeight: '600' },

  // Permission prompt card (States A and C)
  permissionPromptCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: 'rgba(20,25,22,0.85)',
    borderWidth: 0.5,
    borderColor: Colors.dark.border,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  permissionPromptIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permissionDeniedIcon: {
    fontSize: 20,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permissionPromptHeadline: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  permissionPromptBody: {
    fontSize: Typography.sizes.body,
    fontWeight: '400',
    color: Colors.dark.textMuted,
    lineHeight: 22,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  permissionCta: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xl,
    height: 44,
    marginTop: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionCtaTxt: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.dark.bg,
  },
  permissionDismissLink: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  healthKitCard: {
    marginHorizontal: Spacing.base, marginTop: Spacing.base,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.lg, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  healthKitCardConnected: { borderColor: 'rgba(74,222,128,0.25)', backgroundColor: 'rgba(74,222,128,0.06)' },
  hkIcon: { fontSize: 24 },
  hkBody: { flex: 1 },
  hkTitle: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.dark.text, marginBottom: 2 },
  hkSub: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, lineHeight: 16 },
  hkArrow: { fontSize: Typography.sizes.md, color: Colors.dark.textMuted },

  quickActionRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base, marginTop: Spacing.base, gap: Spacing.sm,
  },
  quickActionBtn: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.md, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: Spacing.md,
  },
  quickActionIcon: { fontSize: 20, marginBottom: 4 },
  quickActionTxt: { fontSize: 10, color: Colors.dark.textMuted, textAlign: 'center', letterSpacing: 0.2 },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  explainerSheet: {
    backgroundColor: Colors.dark.bgElevated,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.base, paddingBottom: 40,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center', marginBottom: Spacing.base,
  },
  sheetTitle: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.dark.text, marginBottom: Spacing.sm },
  sheetBody: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted, lineHeight: 20, marginBottom: Spacing.base },
  explainItem: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  explainEmoji: { fontSize: 22, width: 32 },
  explainText: { flex: 1 },
  explainHead: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.dark.text, marginBottom: 3 },
  explainDesc: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, lineHeight: 17 },
  quickActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.base },
  qaBtn: {
    flex: 1, backgroundColor: Colors.viz.bioGreen,
    borderRadius: Radius.lg, paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  qaBtnSecondary: { backgroundColor: 'rgba(74,222,128,0.15)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  qaBtnTxt: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.dark.bg },

  transparencySubHead: { fontSize: 11, fontWeight: '600', color: Colors.dark.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: Spacing.base, marginBottom: Spacing.sm },
  transparencyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs, gap: Spacing.sm },
  transparencyCheck: { fontSize: 14, width: 18, textAlign: 'center' },
  transparencyLabel: { flex: 1, fontSize: Typography.sizes.sm },
  transparencyUnit: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted },
  requirementDetail: { alignItems: 'flex-end', maxWidth: 130 },
  legacyUnitNote: { fontSize: 9, color: Colors.viz.amber, marginTop: 2 },
  limitationText: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, lineHeight: 18, marginBottom: Spacing.xs },
  improvementSection: { marginTop: Spacing.sm },
  improvementRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs + 2 },
  improvementAction: { fontSize: Typography.sizes.sm, color: Colors.dark.text },
  improvementGain: { fontSize: Typography.sizes.xs, color: Colors.viz.bioGreen, fontWeight: '600' },
});
