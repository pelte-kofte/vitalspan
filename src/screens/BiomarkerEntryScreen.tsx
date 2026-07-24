import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  type RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStatusBarStyle } from 'expo-status-bar';

import type { Biomarker } from '../data/biomarkers';
import { loadBiomarkerHistory } from '../lib/biomarkerEntryService';
import { persistBiomarkerEntryUpdate } from '../lib/biomarkerHistoryPersistence';
import { getBiomarkers } from '../lib/biomarkerService';
import { markBiomarkerHistoryDirty, syncEntry } from '../lib/biomarkerWriteService';
import {
  captureAuthRequestScope,
  isAuthRequestScopeCurrent,
} from '../lib/supabase';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, ProductLayout, Radius, Spacing, Typography } from '../theme';
import {
  createStoredBiomarkerEntry,
  type StoredEntry,
} from '../types/biomarkerEntry';

export type { StoredEntry } from '../types/biomarkerEntry';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type InputUnitMode = 'catalog' | 'alternate';
type EntryField = 'value' | 'unit' | 'date';
type SaveState = 'idle' | 'loading' | 'success' | 'failure';

const MMOL_CONVERTIBLE: Readonly<Record<string, {
  altUnit: string;
  toCatalogUnit: (value: number) => number;
}>> = {
  fastingglucose: {
    altUnit: 'mmol/L',
    toCatalogUnit: value => value * 18.0182,
  },
  hba1c: {
    altUnit: 'mmol/mol',
    toCatalogUnit: value => 0.09148 * value + 2.152,
  },
};

function convertToCatalogUnit(
  value: number,
  biomarkerId: string,
  inputUnitMode: InputUnitMode,
): number {
  if (inputUnitMode === 'catalog') return value;
  const conversion = MMOL_CONVERTIBLE[biomarkerId];
  if (!conversion) return value;
  return Math.round(conversion.toCatalogUnit(value) * 100) / 100;
}

function dateForStoredEntry(selectedDate: Date, existingDate?: string): string {
  const base = existingDate ? new Date(existingDate) : new Date();
  const safeBase = Number.isNaN(base.getTime()) ? new Date() : base;
  safeBase.setFullYear(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );
  return safeBase.toISOString();
}

function formatMeasurementDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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

export default function BiomarkerEntryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'BiomarkerEntry'>>();
  const paramId = route.params?.biomarkerId;
  const editingEntryId = route.params?.entryId;
  const reduceMotion = useReduceMotion();
  const valueFocus = useRef(new Animated.Value(1)).current;
  const unitFocus = useRef(new Animated.Value(0)).current;
  const dateFocus = useRef(new Animated.Value(0)).current;
  const saveInFlight = useRef(false);

  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [selected, setSelected] = useState<Biomarker | null>(null);
  const [editingEntry, setEditingEntry] = useState<StoredEntry | null>(null);
  const [search, setSearch] = useState('');
  const [value, setValue] = useState('');
  const [measurementDate, setMeasurementDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inputUnitMode, setInputUnitMode] = useState<InputUnitMode>('catalog');
  const [activeField, setActiveField] = useState<EntryField>('value');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      getBiomarkers(),
      editingEntryId ? loadBiomarkerHistory() : Promise.resolve([] as StoredEntry[]),
    ]).then(([definitions, history]) => {
      if (!active) return;
      setBiomarkers(definitions);
      const existing = editingEntryId
        ? history.find(entry => entry.id === editingEntryId) ?? null
        : null;
      const biomarkerId = existing?.biomarkerId ?? paramId;
      const definition = biomarkerId
        ? definitions.find(item => item.id === biomarkerId) ?? null
        : null;
      setSelected(definition);
      setEditingEntry(existing);

      if (existing && definition) {
        setValue(String(existing.reportedValue ?? existing.value));
        const parsedDate = new Date(existing.date);
        if (!Number.isNaN(parsedDate.getTime())) setMeasurementDate(parsedDate);
        const alternateUnit = MMOL_CONVERTIBLE[definition.id]?.altUnit;
        setInputUnitMode(
          alternateUnit && existing.reportedUnit === alternateUnit
            ? 'alternate'
            : 'catalog',
        );
      }
      setLoading(false);
    }).catch(error => {
      console.error(error);
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [editingEntryId, paramId]);

  useFocusEffect(useCallback(() => {
    setStatusBarStyle('dark');
    return () => undefined;
  }, []));

  const rawValue = Number.parseFloat(value.replace(',', '.'));
  const validValue = Number.isFinite(rawValue) && rawValue > 0;
  const catalogValue = selected
    ? convertToCatalogUnit(rawValue, selected.id, inputUnitMode)
    : rawValue;
  const conversion = selected ? MMOL_CONVERTIBLE[selected.id] : undefined;
  const reportedUnit = inputUnitMode === 'alternate'
    ? conversion?.altUnit
    : selected?.unit;
  const filtered = biomarkers.filter(biomarker =>
    biomarker.name.toLowerCase().includes(search.toLowerCase())
    || biomarker.categoryLabel.toLowerCase().includes(search.toLowerCase()),
  );

  const focusField = useCallback((field: EntryField): void => {
    setActiveField(field);
    const duration = reduceMotion ? 120 : 180;
    Animated.parallel([
      [valueFocus, field === 'value' ? 1 : 0],
      [unitFocus, field === 'unit' ? 1 : 0],
      [dateFocus, field === 'date' ? 1 : 0],
    ].map(([animation, target]) => Animated.timing(animation as Animated.Value, {
      toValue: target as number,
      duration,
      useNativeDriver: true,
    }))).start();
  }, [dateFocus, reduceMotion, unitFocus, valueFocus]);

  function clearFailureState(): void {
    if (saveState === 'failure') {
      setSaveState('idle');
      setSaveMessage(null);
    }
  }

  async function save(): Promise<void> {
    if (
      !selected
      || !validValue
      || !reportedUnit
      || saving
      || saveInFlight.current
    ) {
      return;
    }
    const scope = captureAuthRequestScope();
    if (!scope) return;
    saveInFlight.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    setSaving(true);
    setSaveState('loading');
    setSaveMessage(null);

    const entry = createStoredBiomarkerEntry({
      ...(editingEntry ? { id: editingEntry.id } : {}),
      biomarkerId: selected.id,
      value: catalogValue,
      unit: selected.unit,
      reportedValue: rawValue,
      reportedUnit,
      date: dateForStoredEntry(measurementDate, editingEntry?.date),
      source: editingEntry?.source ?? 'Blood test',
      notes: editingEntry?.notes ?? '',
      ...(editingEntry?.sourceLabRange
        ? { sourceLabRange: editingEntry.sourceLabRange }
        : {}),
    });

    try {
      if (editingEntry) {
        const saved = await persistBiomarkerEntryUpdate(entry, scope);
        if (!isAuthRequestScopeCurrent(scope)) return;
        if (!saved) {
          setSaveState('failure');
          setSaveMessage('Your previous result is unchanged. Try again.');
          AccessibilityInfo.announceForAccessibility(
            'Result not changed. Your previous result is unchanged.',
          );
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          ).catch(() => undefined);
          Alert.alert(
            'Result not changed',
            'We could not save this edit. Your previous result is still available.',
          );
          return;
        }
      } else {
        const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
        if (!isAuthRequestScopeCurrent(scope)) return;
        const parsed = raw ? JSON.parse(raw) as unknown : [];
        const entries = Array.isArray(parsed) ? parsed as StoredEntry[] : [];
        entries.push(entry);
        await AsyncStorage.setItem('@vitalspan_biomarkers', JSON.stringify(entries));
        if (!isAuthRequestScopeCurrent(scope)) return;
        await markBiomarkerHistoryDirty(scope);
        if (!isAuthRequestScopeCurrent(scope)) return;
        syncEntry(entry);
      }
      setSaveState('success');
      AccessibilityInfo.announceForAccessibility(
        editingEntry ? 'Result changes saved' : 'Result saved',
      );
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => undefined);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      setSaveState('failure');
      setSaveMessage('Nothing was changed. Try again.');
      AccessibilityInfo.announceForAccessibility(
        editingEntry ? 'Result not changed' : 'Result not saved',
      );
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      ).catch(() => undefined);
      Alert.alert(
        editingEntry ? 'Result not changed' : 'Result not saved',
        'Please try again.',
      );
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centered} accessible accessibilityLabel="Loading result form">
          <Text style={s.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selected) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.headerAction}
            accessibilityRole="button"
            accessibilityLabel="Cancel biomarker entry"
          >
            <Text style={s.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle} accessibilityRole="header">Add Result</Text>
          <View style={s.headerSpacer} />
        </View>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search biomarkers"
          placeholderTextColor={Colors.health.inkTertiary}
          accessibilityLabel="Search biomarkers"
          autoFocus
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map((biomarker, index) => (
            <TouchableOpacity
              key={biomarker.id}
              style={[
                s.pickRow,
                index < filtered.length - 1 && s.pickRowBorder,
              ]}
              onPress={() => {
                setSelected(biomarker);
                setValue('');
                setMeasurementDate(new Date());
                setInputUnitMode('catalog');
              }}
              accessibilityRole="button"
              accessibilityLabel={`${biomarker.name}, ${biomarker.unit}`}
            >
              <View style={s.pickInfo}>
                <Text style={s.pickName}>{biomarker.name}</Text>
                <Text style={s.pickUnit}>{biomarker.unit}</Text>
              </View>
              <View style={s.categoryBadge}>
                <Text style={s.categoryBadgeText}>{biomarker.categoryLabel}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={s.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.headerRow}>
        <TouchableOpacity
          onPress={() => {
            if (paramId || editingEntryId) navigation.goBack();
            else {
              setSelected(null);
              setValue('');
            }
          }}
          style={s.headerAction}
          accessibilityRole="button"
          accessibilityLabel={paramId || editingEntryId ? 'Cancel result' : 'Choose another biomarker'}
        >
          <Text style={s.cancel}>{paramId || editingEntryId ? 'Cancel' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} accessibilityRole="header">
          {editingEntry ? 'Edit Result' : 'Add Result'}
        </Text>
        <View style={s.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.flex}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.biomarkerIdentity}>
            <Text style={s.eyebrow}>BIOMARKER</Text>
            <Text style={s.biomarkerName} accessibilityRole="header">{selected.name}</Text>
          </View>

          <Text style={[s.fieldLabel, activeField === 'value' && s.fieldLabelActive]}>
            Result value
          </Text>
          <Animated.View
            style={[
              s.valueCard,
              {
                transform: [{
                  scale: valueFocus.interpolate({
                    inputRange: [0, 1],
                    outputRange: [reduceMotion ? 1 : 0.995, 1],
                  }),
                }],
              },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, s.focusRing, { opacity: valueFocus }]}
            />
            <TextInput
              style={s.valueInput}
              value={value}
              onChangeText={nextValue => {
                setValue(nextValue);
                clearFailureState();
              }}
              onFocus={() => focusField('value')}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={Colors.health.inkTertiary}
              accessibilityLabel={`Result value for ${selected.name}`}
              autoFocus
            />
          </Animated.View>

          <Text style={[s.fieldLabel, activeField === 'unit' && s.fieldLabelActive]}>
            Unit
          </Text>
          <Animated.View
            onTouchStart={() => focusField('unit')}
            style={[
              s.unitField,
              {
                transform: [{
                  scale: unitFocus.interpolate({
                    inputRange: [0, 1],
                    outputRange: [reduceMotion ? 1 : 0.995, 1],
                  }),
                }],
              },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, s.focusRing, { opacity: unitFocus }]}
            />
            {conversion ? (
              <View style={s.unitOptions} accessibilityRole="radiogroup">
                {(['catalog', 'alternate'] as const).map(mode => {
                  const label = mode === 'catalog' ? selected.unit : conversion.altUnit;
                  const active = inputUnitMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[s.unitOption, active && s.unitOptionActive]}
                      onPress={() => {
                        focusField('unit');
                        setInputUnitMode(mode);
                        setValue('');
                        clearFailureState();
                        void Haptics.selectionAsync().catch(() => undefined);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      accessibilityLabel={`Use ${label}`}
                    >
                      <Text style={[s.unitOptionText, active && s.unitOptionTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View accessible accessibilityLabel={`Unit ${selected.unit}`}>
                <Text style={s.fixedFieldText}>{selected.unit}</Text>
              </View>
            )}
          </Animated.View>
          {validValue && inputUnitMode === 'alternate' ? (
            <Text style={s.conversionNote}>
              Stored as {catalogValue} {selected.unit} for compatible history.
            </Text>
          ) : null}

          <Text style={[s.fieldLabel, activeField === 'date' && s.fieldLabelActive]}>
            Measurement date
          </Text>
          <Animated.View
            onTouchStart={() => focusField('date')}
            style={[
              s.dateField,
              {
                transform: [{
                  scale: dateFocus.interpolate({
                    inputRange: [0, 1],
                    outputRange: [reduceMotion ? 1 : 0.995, 1],
                  }),
                }],
              },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, s.focusRing, { opacity: dateFocus }]}
            />
            <Text style={s.dateText}>{formatMeasurementDate(measurementDate)}</Text>
            <DateTimePicker
              value={measurementDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'compact' : 'default'}
              maximumDate={new Date()}
              onChange={(_, nextDate) => {
                focusField('date');
                if (nextDate) {
                  setMeasurementDate(nextDate);
                  clearFailureState();
                }
              }}
              accessibilityLabel="Choose measurement date"
              themeVariant="light"
            />
          </Animated.View>

          <Pressable
            style={({ pressed }) => [
              s.saveButton,
              saveState === 'failure' && s.saveButtonFailure,
              saveState === 'success' && s.saveButtonSuccess,
              (!validValue || saving) && s.saveButtonDisabled,
              pressed && validValue && !saving
                && (reduceMotion ? s.saveButtonPressedReduced : s.saveButtonPressed),
            ]}
            onPress={() => void save()}
            disabled={!validValue || saving}
            accessibilityRole="button"
            accessibilityState={{ disabled: !validValue || saving, busy: saving }}
            accessibilityLabel={editingEntry ? 'Save result changes' : 'Save result'}
          >
            <Text style={s.saveButtonText}>
              {saveState === 'loading'
                ? 'Saving…'
                : saveState === 'success'
                  ? 'Saved'
                  : saveState === 'failure'
                    ? 'Try again'
                    : editingEntry
                      ? 'Save changes'
                      : 'Save result'}
            </Text>
          </Pressable>
          {saveMessage ? (
            <Text
              style={s.saveMessage}
              accessibilityLiveRegion="assertive"
            >
              {saveMessage}
            </Text>
          ) : null}
          <View style={s.bottomClearance} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.health.background },
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.health.rule,
  },
  headerAction: {
    minWidth: 64,
    minHeight: ProductLayout.controlMinHeight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.health.ink,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    fontWeight: Typography.weights.label,
  },
  cancel: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    fontWeight: Typography.weights.label,
  },
  headerSpacer: { minWidth: 72 },
  searchInput: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    minHeight: ProductLayout.controlMinHeight,
    backgroundColor: Colors.health.surfaceStrong,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.health.rule,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.health.ink,
    fontSize: Typography.sizes.body,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  pickRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.health.rule,
  },
  pickInfo: { flex: 1, minWidth: 0 },
  pickName: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    fontWeight: Typography.weights.headline,
  },
  pickUnit: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.caption,
    lineHeight: Typography.lineHeights.caption,
    marginTop: Spacing.xs,
  },
  categoryBadge: {
    flexShrink: 1,
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.health.accentSoft,
  },
  categoryBadgeText: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    fontWeight: Typography.weights.label,
  },
  content: {
    width: '100%',
    maxWidth: ProductLayout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: ProductLayout.pageInset,
    paddingTop: Spacing.xl,
  },
  biomarkerIdentity: { marginBottom: Spacing.xl },
  eyebrow: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.wider,
  },
  biomarkerName: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.h1,
    lineHeight: Typography.lineHeights.h1,
    fontWeight: Typography.weights.title,
    marginTop: Spacing.xs,
  },
  fieldLabel: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  fieldLabelActive: { color: Colors.health.accent },
  focusRing: {
    borderRadius: Radius.card,
    borderWidth: 2,
    borderColor: Colors.health.accent,
  },
  valueCard: {
    minHeight: 92,
    justifyContent: 'center',
    backgroundColor: Colors.health.surfaceStrong,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.health.rule,
    paddingHorizontal: Spacing.lg,
  },
  valueInput: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.display2,
    lineHeight: Typography.lineHeights.display2,
    fontWeight: Typography.weights.title,
    paddingVertical: Spacing.md,
  },
  unitField: {
    minHeight: ProductLayout.controlMinHeight,
    justifyContent: 'center',
    padding: Spacing.xs,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.health.rule,
    backgroundColor: Colors.health.surfaceStrong,
  },
  unitOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  unitOption: {
    minHeight: ProductLayout.controlMinHeight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.health.rule,
    backgroundColor: Colors.health.surfaceStrong,
  },
  unitOptionActive: {
    borderColor: Colors.health.accent,
    backgroundColor: Colors.health.accentSoft,
  },
  unitOptionText: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
  },
  unitOptionTextActive: {
    color: Colors.health.accent,
    fontWeight: Typography.weights.label,
  },
  fixedFieldText: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  conversionNote: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.sm,
  },
  dateField: {
    minHeight: 56,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.health.rule,
    backgroundColor: Colors.health.surfaceStrong,
  },
  dateText: {
    flexShrink: 1,
    color: Colors.health.ink,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
  },
  saveButton: {
    minHeight: ProductLayout.controlMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.card,
    backgroundColor: Colors.health.ink,
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  saveButtonPressedReduced: { opacity: 0.82 },
  saveButtonSuccess: { backgroundColor: Colors.health.accent },
  saveButtonFailure: { backgroundColor: Colors.danger },
  saveButtonText: {
    color: Colors.health.surfaceStrong,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    fontWeight: Typography.weights.label,
  },
  saveMessage: {
    color: Colors.danger,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  bottomSpace: { height: Spacing.xxl },
  bottomClearance: { height: ProductLayout.bottomClearance },
});
