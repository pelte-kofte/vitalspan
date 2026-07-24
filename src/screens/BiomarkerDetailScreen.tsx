import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStatusBarStyle, StatusBar } from 'expo-status-bar';

import BiomarkerHistoryChart from '../components/health/BiomarkerHistoryChart';
import Text from '../components/health/HealthText';
import type { Biomarker } from '../data/biomarkers';
import {
  biomarkerClassificationStrategyFor,
  classificationBandsForChart,
  resolveBiomarkerClassification,
  type BiomarkerClassificationContext,
} from '../domain/biomarkers/biomarkerClassificationRegistry';
import { loadBiomarkerHistory } from '../lib/biomarkerEntryService';
import { persistBiomarkerEntryDeletion } from '../lib/biomarkerHistoryPersistence';
import { formatSourceLabRange } from '../lib/biomarkerInterpretation';
import { getBiomarkers } from '../lib/biomarkerService';
import {
  captureAuthRequestScope,
  isAuthRequestScopeCurrent,
} from '../lib/supabase';
import { USER_PROFILE_CACHE_KEY } from '../lib/userProfilePersistence';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  Colors,
  Motion,
  ProductLayout,
  Radius,
  Spacing,
  Typography,
} from '../theme';
import type { StoredEntry } from '../types/biomarkerEntry';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'BiomarkerDetail'>;
type HistoryMutationKind = 'added' | 'edited';

interface HistoryMutationSignal {
  readonly entryId: string;
  readonly kind: HistoryMutationKind;
  readonly token: number;
}

interface ResultSnapshot {
  readonly key: string;
  readonly value: number | null;
  readonly unit: string;
  readonly date: string | null;
}

function formatMeasurementDate(date: string | null): string {
  if (!date) return 'No measurements yet';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Date unavailable';
  return parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function displayValue(entry: StoredEntry): number {
  return entry.reportedValue ?? entry.value;
}

function displayUnit(entry: StoredEntry, fallback: string): string {
  return entry.reportedUnit ?? entry.unit ?? fallback;
}

function hasImportedReportReference(entry: StoredEntry | undefined): entry is StoredEntry {
  return Boolean(
    entry?.sourceLabRange
    && entry.source.trim().toLowerCase() === 'lab pdf',
  );
}

function classificationContextFromProfile(
  rawProfile: string | null,
): BiomarkerClassificationContext | undefined {
  if (!rawProfile) return undefined;
  try {
    const profile = JSON.parse(rawProfile) as {
      age?: unknown;
      sex?: unknown;
    };
    if (
      typeof profile.age !== 'number'
      || !Number.isInteger(profile.age)
      || profile.age < 18
      || profile.age > 120
      || (profile.sex !== 'female' && profile.sex !== 'male')
    ) return undefined;
    return { ageYears: profile.age, sex: profile.sex };
  } catch {
    return undefined;
  }
}

function formatClassificationInterval(
  lowerBound: number | undefined,
  upperBound: number | undefined,
  unit: string,
): string {
  if (lowerBound !== undefined && upperBound !== undefined) {
    return `${lowerBound}–${upperBound} ${unit}`;
  }
  if (lowerBound !== undefined) return `≥${lowerBound} ${unit}`;
  if (upperBound !== undefined) return `<${upperBound} ${unit}`;
  return unit;
}

function entryPresentationSignature(entry: StoredEntry): string {
  return JSON.stringify({
    id: entry.id,
    value: entry.value,
    unit: entry.unit,
    reportedValue: entry.reportedValue,
    reportedUnit: entry.reportedUnit,
    date: entry.date,
    source: entry.source,
    notes: entry.notes,
    sourceLabRange: entry.sourceLabRange,
  });
}

function detectHistoryMutation(
  previous: readonly StoredEntry[],
  next: readonly StoredEntry[],
  biomarkerId: string | undefined,
  token: number,
): HistoryMutationSignal | null {
  if (!biomarkerId) return null;
  const previousForMarker = previous.filter(entry => entry.biomarkerId === biomarkerId);
  const nextForMarker = next.filter(entry => entry.biomarkerId === biomarkerId);
  const previousById = new Map(previousForMarker.map(entry => [entry.id, entry]));
  const added = nextForMarker
    .filter(entry => !previousById.has(entry.id))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (added) return { entryId: added.id, kind: 'added', token };

  const edited = nextForMarker.find(entry => {
    const prior = previousById.get(entry.id);
    return prior
      ? entryPresentationSignature(prior) !== entryPresentationSignature(entry)
      : false;
  });
  return edited
    ? { entryId: edited.id, kind: 'edited', token }
    : null;
}

function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduceMotion;
}

function ResultSnapshotView({
  snapshot,
  compact,
}: {
  snapshot: ResultSnapshot;
  compact: boolean;
}) {
  if (snapshot.value === null) {
    return (
      <>
        <Text style={s.emptyTitle}>No results yet</Text>
        <Text style={s.emptyBody}>
          Add your first measurement to begin a private history.
        </Text>
      </>
    );
  }

  return (
    <>
      <View style={s.resultValueRow}>
        <Text style={[s.resultValue, compact && s.resultValueCompact]}>
          {snapshot.value}
        </Text>
        <Text style={s.resultUnit}>{snapshot.unit}</Text>
      </View>
      <Text style={s.resultDate}>
        {formatMeasurementDate(snapshot.date)}
      </Text>
    </>
  );
}

function CrossfadeResultContent({
  latest,
  fallbackUnit,
  compact,
  reduceMotion,
}: {
  latest: StoredEntry | undefined;
  fallbackUnit: string;
  compact: boolean;
  reduceMotion: boolean;
}) {
  const incoming: ResultSnapshot = latest
    ? {
        key: entryPresentationSignature(latest),
        value: displayValue(latest),
        unit: displayUnit(latest, fallbackUnit),
        date: latest.date,
      }
    : {
        key: 'empty',
        value: null,
        unit: fallbackUnit,
        date: null,
      };
  const [current, setCurrent] = useState(incoming);
  const [outgoing, setOutgoing] = useState<ResultSnapshot | null>(null);
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (incoming.key === current.key) return;
    progress.stopAnimation();
    setOutgoing(current);
    setCurrent(incoming);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: reduceMotion ? 140 : 190,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setOutgoing(null);
    });
  }, [current, incoming, progress, reduceMotion]);

  return (
    <View>
      {outgoing ? (
        <Animated.View
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={[
            StyleSheet.absoluteFill,
            { opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }) },
          ]}
        >
          <ResultSnapshotView snapshot={outgoing} compact={compact} />
        </Animated.View>
      ) : null}
      <Animated.View style={{ opacity: progress }}>
        <ResultSnapshotView snapshot={current} compact={compact} />
      </Animated.View>
    </View>
  );
}

const HistoryRow = React.memo(function HistoryRow({
  entry,
  fallbackUnit,
  showBorder,
  mutation,
  exiting,
  actionsDisabled,
  reduceMotion,
  onEdit,
  onDelete,
  onExitComplete,
}: {
  entry: StoredEntry;
  fallbackUnit: string;
  showBorder: boolean;
  mutation: HistoryMutationSignal | null;
  exiting: boolean;
  actionsDisabled: boolean;
  reduceMotion: boolean;
  onEdit: (entry: StoredEntry) => void;
  onDelete: (entry: StoredEntry) => void;
  onExitComplete: (entry: StoredEntry) => void;
}) {
  const isNew = mutation?.entryId === entry.id && mutation.kind === 'added';
  const opacity = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(isNew ? 8 : 0)).current;
  const highlight = useRef(new Animated.Value(0)).current;
  const collapse = useRef(new Animated.Value(0)).current;
  const measuredHeight = useRef(96);
  const handledMutationToken = useRef<number | null>(null);
  const exitStarted = useRef(false);

  useEffect(() => {
    if (
      !mutation
      || mutation.entryId !== entry.id
      || handledMutationToken.current === mutation.token
    ) {
      return;
    }
    handledMutationToken.current = mutation.token;
    if (mutation.kind === 'added') {
      opacity.setValue(0);
      translateY.setValue(reduceMotion ? 0 : 8);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: reduceMotion ? 140 : 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: reduceMotion ? 0 : 220,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    highlight.setValue(0);
    Animated.sequence([
      Animated.timing(highlight, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(highlight, {
        toValue: 0,
        duration: reduceMotion ? 140 : 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    entry.id,
    highlight,
    mutation,
    opacity,
    reduceMotion,
    translateY,
  ]);

  useEffect(() => {
    if (!exiting) {
      if (exitStarted.current) {
        exitStarted.current = false;
        collapse.setValue(0);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
          }),
        ]).start();
      }
      return;
    }
    if (exitStarted.current) return;
    exitStarted.current = true;
    const visualExit = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: reduceMotion ? 120 : 170,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: reduceMotion ? 0 : -6,
        duration: reduceMotion ? 0 : 170,
        useNativeDriver: true,
      }),
    ]);
    if (reduceMotion) {
      visualExit.start(({ finished }) => {
        if (finished) onExitComplete(entry);
      });
      return;
    }
    Animated.parallel([
      visualExit,
      Animated.timing(collapse, {
        toValue: 1,
        duration: 190,
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) onExitComplete(entry);
    });
  }, [
    collapse,
    entry,
    exiting,
    onExitComplete,
    opacity,
    reduceMotion,
    translateY,
  ]);

  const unit = displayUnit(entry, fallbackUnit);
  return (
    <Animated.View
      onLayout={event => {
        if (!exiting && event.nativeEvent.layout.height > 0) {
          measuredHeight.current = event.nativeEvent.layout.height;
        }
      }}
      style={[
        {
          opacity,
          transform: [{ translateY }],
          ...(reduceMotion || !exiting ? {} : {
            maxHeight: collapse.interpolate({
              inputRange: [0, 1],
              outputRange: [measuredHeight.current, 0],
            }),
            overflow: 'hidden' as const,
          }),
        },
      ]}
    >
      <View
        style={[
          s.historyRow,
          showBorder && s.historyRowBorder,
        ]}
        accessible={false}
      >
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, s.historyHighlight, { opacity: highlight }]}
        />
        <View
          style={s.historyValueBlock}
          accessible
          accessibilityLabel={`${displayValue(entry)} ${unit}, measured ${formatMeasurementDate(entry.date)}`}
        >
          <Text style={s.historyValue}>
            {displayValue(entry)} {unit}
          </Text>
          <Text style={s.historyDate}>
            {formatMeasurementDate(entry.date)}
          </Text>
          <Text style={s.historySource}>{entry.source}</Text>
        </View>
        <View style={s.rowActions}>
          <Pressable
            onPress={() => onEdit(entry)}
            disabled={actionsDisabled}
            style={({ pressed }) => [s.rowAction, pressed && s.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Edit result from ${formatMeasurementDate(entry.date)}`}
            accessibilityState={{ disabled: actionsDisabled }}
          >
            <Text style={s.rowActionText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() => onDelete(entry)}
            disabled={actionsDisabled}
            style={({ pressed }) => [
              s.rowAction,
              pressed && s.pressed,
              actionsDisabled && s.disabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Delete result from ${formatMeasurementDate(entry.date)}`}
            accessibilityState={{
              disabled: actionsDisabled,
              busy: exiting,
            }}
          >
            <Text style={s.deleteActionText}>
              {exiting ? 'Deleting…' : 'Delete'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
});

export default function BiomarkerDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();
  const { width } = useWindowDimensions();
  const compact = width < ProductLayout.compactBreakpoint;
  const reduceMotion = useReduceMotion();
  const resultEntrance = useRef(new Animated.Value(0)).current;
  const chartEntrance = useRef(new Animated.Value(0)).current;
  const historyEntrance = useRef(new Animated.Value(0)).current;
  const entriesRef = useRef<StoredEntry[]>([]);
  const historyLoaded = useRef(false);
  const screenEntrancePlayed = useRef(false);
  const mutationToken = useRef(0);
  const mutationExecution = useRef(new Set<string>());

  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [profileClassificationContext, setProfileClassificationContext] =
    useState<BiomarkerClassificationContext | undefined>();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [historyMutation, setHistoryMutation] =
    useState<HistoryMutationSignal | null>(null);
  const biomarkerId = route.params?.biomarkerId;

  const load = useCallback(async (forceRefresh = false) => {
    try {
      const [definitions, history, rawProfile] = await Promise.all([
        getBiomarkers(),
        loadBiomarkerHistory(forceRefresh),
        AsyncStorage.getItem(USER_PROFILE_CACHE_KEY),
      ]);
      if (historyLoaded.current) {
        const signal = detectHistoryMutation(
          entriesRef.current,
          history,
          biomarkerId,
          mutationToken.current + 1,
        );
        if (signal) {
          mutationToken.current = signal.token;
          setHistoryMutation(signal);
        }
      }
      entriesRef.current = history;
      historyLoaded.current = true;
      setBiomarkers(definitions);
      setEntries(history);
      setProfileClassificationContext(
        classificationContextFromProfile(rawProfile),
      );
    } finally {
      setLoading(false);
    }
  }, [biomarkerId]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));
  useFocusEffect(useCallback(() => {
    setStatusBarStyle('dark');
    return () => undefined;
  }, []));

  const biomarker = biomarkers.find(
    item => item.id === biomarkerId,
  );
  const history = useMemo(
    () => entries
      .filter(entry => entry.biomarkerId === biomarkerId)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [biomarkerId, entries],
  );
  const latest = history[history.length - 1];

  useEffect(() => {
    if (loading || !biomarker || screenEntrancePlayed.current) return;
    screenEntrancePlayed.current = true;
    resultEntrance.setValue(0);
    chartEntrance.setValue(0);
    historyEntrance.setValue(0);
    const duration = reduceMotion ? 140 : 220;
    const animations = [resultEntrance, chartEntrance, historyEntrance].map(value =>
      Animated.timing(value, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    );
    Animated.stagger(reduceMotion ? 0 : 90, animations).start();
  }, [
    biomarker,
    chartEntrance,
    historyEntrance,
    loading,
    reduceMotion,
    resultEntrance,
  ]);

  const addResult = useCallback((): void => {
    if (!biomarker) return;
    navigation.navigate('BiomarkerEntry', { biomarkerId: biomarker.id });
  }, [biomarker, navigation]);

  const editResult = useCallback((entry: StoredEntry): void => {
    navigation.navigate('BiomarkerEntry', {
      biomarkerId: entry.biomarkerId,
      entryId: entry.id,
    });
  }, [navigation]);

  const requestDelete = useCallback((entry: StoredEntry): void => {
    if (deletingId || pendingDeleteId) return;
    Alert.alert(
      'Delete this result?',
      `${displayValue(entry)} ${displayUnit(entry, biomarker?.unit ?? '')} from ${formatMeasurementDate(entry.date)} will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDeletingId(entry.id);
            setPendingDeleteId(entry.id);
          },
        },
      ],
    );
  }, [biomarker?.unit, deletingId, pendingDeleteId]);

  const deleteResult = useCallback(async (entry: StoredEntry): Promise<void> => {
    if (mutationExecution.current.has(entry.id)) return;
    mutationExecution.current.add(entry.id);
    const scope = captureAuthRequestScope();
    if (!scope) {
      mutationExecution.current.delete(entry.id);
      setDeletingId(null);
      setPendingDeleteId(null);
      return;
    }
    try {
      const deleted = await persistBiomarkerEntryDeletion(entry.id, scope);
      if (!isAuthRequestScopeCurrent(scope)) return;
      if (!deleted) {
        Alert.alert(
          'Result not deleted',
          'Your result is still available. Please try again.',
        );
        return;
      }
      await load(true);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Result not deleted',
        'Your result is still available. Please try again.',
      );
    } finally {
      mutationExecution.current.delete(entry.id);
      if (isAuthRequestScopeCurrent(scope)) {
        setDeletingId(null);
        setPendingDeleteId(null);
      }
    }
  }, [load]);

  if (!loading && !biomarker) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.fallback}>
          <Text style={s.fallbackTitle} accessibilityRole="header">
            Biomarker unavailable
          </Text>
          <Text style={s.body}>
            Return to Health and choose a biomarker.
          </Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [s.primaryButton, pressed && s.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Back to Health"
          >
            <Text style={s.primaryButtonText}>Back to Health</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!biomarker) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.fallback} accessible accessibilityLabel="Loading biomarker">
          <Text style={s.body}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const latestValue = latest ? displayValue(latest) : null;
  const latestUnit = latest ? displayUnit(latest, biomarker.unit) : biomarker.unit;
  const contentInset = compact
    ? ProductLayout.compactPageInset
    : ProductLayout.pageInset;
  const reportReference = hasImportedReportReference(latest)
    ? latest.sourceLabRange
    : undefined;
  const classificationContext: BiomarkerClassificationContext = {
    ...profileClassificationContext,
    ...(biomarker.id === 'fastingglucose'
      || biomarker.id === 'fastinginsulin'
      ? { fasting: true }
      : {}),
  };
  const strategy = biomarkerClassificationStrategyFor(biomarker.id);
  const classification = latest
    ? resolveBiomarkerClassification({
        biomarkerId: biomarker.id,
        value: latestValue as number,
        unit: latestUnit,
        context: classificationContext,
        ...(reportReference ? { sourceLabRange: reportReference } : {}),
      })
    : null;
  const chartBands = classificationBandsForChart({
    biomarkerId: biomarker.id,
    unit: biomarker.unit,
    context: classificationContext,
    ...(reportReference ? { sourceLabRange: reportReference } : {}),
  });
  const generalReferenceBand = strategy?.modelType === 'reference_interval'
    ? chartBands.find(band => band.label === 'Within reference interval')
    : undefined;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          s.content,
          {
            width: Math.min(width, ProductLayout.maxContentWidth),
            paddingHorizontal: contentInset,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [s.back, pressed && s.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={s.backText}>Back</Text>
        </Pressable>

        <View style={s.titleBlock}>
          <Text style={s.kicker}>BIOMARKER</Text>
          <Text style={s.title} accessibilityRole="header">{biomarker.name}</Text>
        </View>

        <Animated.View
          style={[
            s.resultCard,
            {
              opacity: resultEntrance,
              transform: [{
                translateY: resultEntrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [reduceMotion ? 0 : 8, 0],
                }),
              }],
            },
          ]}
          accessible
          accessibilityLabel={latest
            ? `Latest result ${latestValue} ${latestUnit}, measured ${formatMeasurementDate(latest.date)}`
            : `No results recorded for ${biomarker.name}`}
        >
          <Text style={s.resultEyebrow}>LATEST RESULT</Text>
          <CrossfadeResultContent
            latest={latest}
            fallbackUnit={biomarker.unit}
            compact={compact}
            reduceMotion={reduceMotion}
          />
          <Pressable
            onPress={addResult}
            style={({ pressed }) => [s.resultAction, pressed && s.resultActionPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Add result for ${biomarker.name}`}
          >
            <Text style={s.resultActionText}>Add result</Text>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={{
            opacity: chartEntrance,
            transform: [{
              translateY: chartEntrance.interpolate({
                inputRange: [0, 1],
                outputRange: [reduceMotion ? 0 : 7, 0],
              }),
            }],
          }}
        >
          {classification ? (
            <View
              style={s.classificationCard}
              accessible
              accessibilityLabel={`${classification.modelType === 'reference_interval'
                ? 'Reference comparison'
                : 'Clinical decision category'}: ${classification.label}`}
            >
              <Text style={s.sectionEyebrow}>
                {classification.modelType === 'reference_interval'
                  ? 'REFERENCE COMPARISON'
                  : 'CLINICAL DECISION CATEGORY'}
              </Text>
              <Text style={s.classificationLabel} accessibilityRole="header">
                {classification.label}
              </Text>
              <Text style={s.classificationSource}>
                {classification.source === 'source_laboratory'
                  ? 'Based on the interval from this laboratory report.'
                  : classification.authority.organization}
              </Text>
              <Text style={s.classificationNote}>
                {classification.modelType === 'reference_interval'
                  ? 'A reference comparison does not establish or exclude a health condition.'
                  : 'This category is informational and does not establish a diagnosis.'}
              </Text>
            </View>
          ) : null}

          {reportReference ? (
            <View style={s.referenceCard}>
              <Text style={s.sectionEyebrow}>
                Reference interval from this laboratory report
              </Text>
              <Text style={s.referenceValue}>
                {formatSourceLabRange(reportReference)}
              </Text>
              {reportReference.laboratoryName ? (
                <Text style={s.referenceSource}>
                  {reportReference.laboratoryName}
                </Text>
              ) : null}
            </View>
          ) : generalReferenceBand ? (
            <View style={s.referenceCard}>
              <Text style={s.sectionEyebrow}>General reference interval</Text>
              <Text style={s.referenceValue}>
                {formatClassificationInterval(
                  generalReferenceBand.lowerBound,
                  generalReferenceBand.upperBound,
                  generalReferenceBand.unit,
                )}
              </Text>
              <Text style={s.referenceNote}>
                Ranges may vary by laboratory, method, age, sex, and clinical context.
              </Text>
            </View>
          ) : null}

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionHeadingText}>
                <Text style={s.sectionEyebrow}>HISTORY</Text>
                <Text style={s.sectionTitle} accessibilityRole="header">
                  Historical chart
                </Text>
              </View>
              <Text style={s.collectionCount}>
                {history.length} {history.length === 1 ? 'result' : 'results'}
              </Text>
            </View>
            <View style={s.chartCard}>
              <BiomarkerHistoryChart
                history={history}
                canonicalUnit={biomarker.unit}
                referenceInterval={reportReference}
                classificationBands={chartBands}
                selectedBandId={classification?.selectedBandId}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: historyEntrance,
            transform: [{
              translateY: historyEntrance.interpolate({
                inputRange: [0, 1],
                outputRange: [reduceMotion ? 0 : 7, 0],
              }),
            }],
          }}
        >
          <View style={s.section}>
            <Text style={s.sectionEyebrow}>MEASUREMENTS</Text>
            <Text style={s.sectionTitle} accessibilityRole="header">
              Measurement history
            </Text>
            {history.length === 0 ? (
              <Text style={s.emptyHistory}>
                Saved measurements will appear here in date order.
              </Text>
            ) : (
              <View style={s.historyList}>
                {history.map((entry, index) => (
                  <HistoryRow
                    key={entry.id}
                    entry={entry}
                    fallbackUnit={biomarker.unit}
                    showBorder={index < history.length - 1}
                    mutation={historyMutation?.entryId === entry.id
                      ? historyMutation
                      : null}
                    exiting={pendingDeleteId === entry.id}
                    actionsDisabled={Boolean(deletingId)}
                    reduceMotion={reduceMotion}
                    onEdit={editResult}
                    onDelete={requestDelete}
                    onExitComplete={deleteResult}
                  />
                ))}
              </View>
            )}
          </View>

          <Pressable
            onPress={addResult}
            style={({ pressed }) => [s.primaryButton, pressed && s.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Add another result for ${biomarker.name}`}
          >
            <Text style={s.primaryButtonText}>
              {latest ? 'Add another result' : 'Add result'}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.health.background },
  content: {
    alignSelf: 'center',
    paddingBottom: ProductLayout.bottomClearance + Spacing.xxl,
  },
  back: {
    alignSelf: 'flex-start',
    minHeight: ProductLayout.controlMinHeight,
    minWidth: ProductLayout.controlMinHeight,
    justifyContent: 'center',
  },
  backText: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    fontWeight: Typography.weights.label,
  },
  titleBlock: { paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  kicker: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.widest,
  },
  title: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.display3,
    lineHeight: Typography.lineHeights.display3,
    fontWeight: Typography.weights.title,
    marginTop: Spacing.sm,
  },
  resultCard: {
    padding: ProductLayout.cardPadding,
    borderRadius: Radius.sheet,
    backgroundColor: Colors.health.ink,
  },
  resultEyebrow: {
    color: Colors.health.ruleStrong,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.wider,
  },
  resultValueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  resultValue: {
    color: Colors.health.surfaceStrong,
    fontSize: Typography.sizes.display1,
    lineHeight: Typography.lineHeights.display1,
    fontWeight: Typography.weights.title,
  },
  resultValueCompact: {
    fontSize: Typography.sizes.display2,
    lineHeight: Typography.lineHeights.display2,
  },
  resultUnit: {
    flexShrink: 1,
    color: Colors.health.ruleStrong,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    paddingBottom: Spacing.sm,
  },
  resultDate: {
    color: Colors.health.ruleStrong,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.sm,
  },
  resultAction: {
    minHeight: ProductLayout.controlMinHeight,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.card,
    backgroundColor: Colors.health.surfaceStrong,
  },
  resultActionPressed: { opacity: 0.82 },
  resultActionText: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  emptyTitle: {
    color: Colors.health.surfaceStrong,
    fontSize: Typography.sizes.h1,
    lineHeight: Typography.lineHeights.h1,
    fontWeight: Typography.weights.title,
    marginTop: Spacing.base,
  },
  emptyBody: {
    color: Colors.health.ruleStrong,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    marginTop: Spacing.sm,
  },
  referenceCard: {
    marginTop: Spacing.lg,
    padding: ProductLayout.cardPadding,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.health.rule,
    backgroundColor: Colors.health.surfaceStrong,
  },
  classificationCard: {
    marginTop: Spacing.lg,
    padding: ProductLayout.cardPadding,
    borderRadius: Radius.card,
    backgroundColor: Colors.health.accentSoft,
  },
  classificationLabel: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.h2,
    lineHeight: Typography.lineHeights.h2,
    fontWeight: Typography.weights.headline,
    marginTop: Spacing.sm,
  },
  classificationSource: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.sm,
  },
  classificationNote: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.sm,
  },
  referenceValue: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.h2,
    lineHeight: Typography.lineHeights.h2,
    fontWeight: Typography.weights.headline,
    marginTop: Spacing.sm,
  },
  referenceSource: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.sm,
  },
  referenceNote: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.sm,
  },
  section: { marginTop: ProductLayout.sectionGap },
  sectionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  sectionHeadingText: { flex: 1, minWidth: 180 },
  sectionEyebrow: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.wider,
  },
  sectionTitle: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.h2,
    lineHeight: Typography.lineHeights.h2,
    fontWeight: Typography.weights.headline,
    marginTop: Spacing.xs,
  },
  collectionCount: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
  },
  chartCard: {
    marginTop: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.health.rule,
    backgroundColor: Colors.health.surfaceStrong,
  },
  historyList: {
    marginTop: Spacing.base,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.health.rule,
    backgroundColor: Colors.health.surfaceStrong,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  historyHighlight: {
    backgroundColor: Colors.health.accentSoft,
  },
  historyRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.health.rule,
  },
  historyValueBlock: { flex: 1, minWidth: 164 },
  historyValue: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    fontWeight: Typography.weights.label,
  },
  historyDate: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.xs,
  },
  historySource: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.caption,
    lineHeight: Typography.lineHeights.caption,
    marginTop: Spacing.xs,
  },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  rowAction: {
    minWidth: ProductLayout.controlMinHeight,
    minHeight: ProductLayout.controlMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  rowActionText: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  deleteActionText: {
    color: Colors.danger,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  emptyHistory: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    marginTop: Spacing.base,
  },
  primaryButton: {
    minHeight: ProductLayout.controlMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ProductLayout.sectionGap,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.card,
    backgroundColor: Colors.health.ink,
  },
  primaryButtonText: {
    color: Colors.health.surfaceStrong,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    fontWeight: Typography.weights.label,
  },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.45 },
  fallback: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
  fallbackTitle: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.h1,
    lineHeight: Typography.lineHeights.h1,
    fontWeight: Typography.weights.title,
    marginBottom: Spacing.sm,
  },
  body: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
  },
});
