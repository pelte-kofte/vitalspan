import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
  Modal, TextInput, Alert,
  KeyboardAvoidingView, Keyboard, Platform, Switch,
} from 'react-native';
import {
  NotificationPrefs,
  DEFAULT_PREFS,
  NOTIFICATION_PREFS_KEY,
  scheduleItemReminder,
  cancelItemReminder,
  ensurePermission,
} from '../lib/notifications';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography, Elevation } from '../theme';
import { setStatusBarStyle } from 'expo-status-bar';
import { RootStackParamList, MainTabParamList } from '../navigation/AppNavigator';
import { INTERACTIONS } from '../data/biomarkers';
import { SUPPLEMENT_DATABASE, SupplementInfo } from '../data/supplementTimings';
import { MEDICATION_DATABASE } from '../data/medications';
import SupplementLibrarySection from '../components/SupplementLibrarySection';
import { PillIcon } from '../components/DesignSystemIcons';
import {
  ProtocolItem,
  ProtocolState,
  TimeSlot,
  CustomSupplement,
  EMPTY_PROTOCOL,
} from '../types/protocol';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface UserProfile {
  name: string;
  goal: string;
  medications: string[];
}

interface Supplement {
  name: string;
  dose: string;
  evidence: 'A' | 'B' | 'C';
  goals: string[];
  dbId?: string;
  dbInfo?: SupplementInfo;
}

const BASE_SUPPLEMENTS: Supplement[] = [
  { name: 'Vitamin D3',          dose: '2000 IU', evidence: 'A', goals: ['all'],                             dbId: 'vitamin_d3' },
  { name: 'Magnesium Glycinate',  dose: '400 mg',  evidence: 'A', goals: ['all'],                             dbId: 'magnesium_glycinate' },
  { name: 'Omega-3',             dose: '2 g',      evidence: 'A', goals: ['all'],                             dbId: 'omega3' },
];

const GOAL_SUPPLEMENTS: Supplement[] = [
  { name: 'NMN',        dose: '500 mg',           evidence: 'B', goals: ['Extend lifespan', 'Slow biological aging', 'Track & understand'], dbId: 'nmn' },
  { name: 'Resveratrol', dose: '500 mg',           evidence: 'B', goals: ['Extend lifespan', 'Slow biological aging'],  dbId: 'resveratrol' },
  { name: 'CoQ10',       dose: '200 mg',           evidence: 'B', goals: ['Optimize healthspan', 'Track & understand'], dbId: 'coq10' },
  { name: 'Berberine',   dose: '500mg (3x daily)', evidence: 'A', goals: ['Optimize healthspan', 'Slow biological aging', 'Track & understand'], dbId: 'berberine' },
];

// Parse "Nx daily" from a dose string → returns count, defaults to 1
function parseDoseCount(dose: string): number {
  const m = dose.match(/(\d+)x\s*daily/i);
  if (m) return Math.min(Math.max(parseInt(m[1], 10), 1), 6);
  return 1;
}

const DOSE_TIME_LABELS: Record<number, string[]> = {
  2: ['Morning', 'Evening'],
  3: ['Morning', 'Afternoon', 'Evening'],
  4: ['Morning', 'Noon', 'Afternoon', 'Evening'],
};

function getDoseTimeLabels(count: number): string[] {
  return DOSE_TIME_LABELS[count] ?? Array.from({ length: count }, (_, i) => `Dose ${i + 1}`);
}

function doseId(name: string, n: number): string {
  return `${name}_dose_${n}`;
}

const TIME_SLOTS: { key: TimeSlot; label: string }[] = [
  { key: 'morning',   label: 'AM' },
  { key: 'afternoon', label: 'PM' },
  { key: 'evening',   label: 'Eve' },
  { key: 'night',     label: 'Night' },
];

const TIMING_LABELS: Record<string, string> = {
  fasted: 'Fasted', with_meal: 'With meal', with_fat: 'With fat',
  flexible: 'Flexible', bedtime: 'Bedtime',
};
const BEST_TIME_LABELS: Record<string, string> = {
  morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening',
  bedtime: 'Bedtime', anytime: 'Anytime',
};

// ── Migration utility ─────────────────────────────────────────────────────────
function migrateProtocol(parsed: Record<string, unknown>): ProtocolState {
  try {
    // Old schema: has 'addedSupplements' key
    if ('addedSupplements' in parsed) {
      const oldAdded = (parsed.addedSupplements as string[]) ?? [];
      const oldCustom = (parsed.customSupplements as CustomSupplement[]) ?? [];

      const convertedDb: ProtocolItem[] = oldAdded.map((name, index) => {
        const dbEntry = SUPPLEMENT_DATABASE.find(s => s.name.toLowerCase() === name.toLowerCase());
        return {
          id: `supp_migrated_${Date.now()}_${index}`,
          name: dbEntry?.name ?? name,
          dose: dbEntry?.defaultDose ?? '—',
          source: 'db' as const,
          addedAt: new Date().toISOString(),
        };
      });

      const convertedCustom: ProtocolItem[] = oldCustom.map(cs => ({
        id: cs.id,
        name: cs.name,
        dose: cs.dose,
        timing: cs.timing,
        source: 'manual' as const,
        addedAt: cs.addedAt,
      }));

      return {
        supplements: [...convertedDb, ...convertedCustom],
        medTimes: (parsed.medTimes as Record<string, TimeSlot>) ?? {},
        hiddenMeds: [],
        taken: [],
        takenDate: '',
      };
    }

    // New schema: has 'supplements' key
    if ('supplements' in parsed) {
      return {
        ...EMPTY_PROTOCOL,
        ...(parsed as unknown as ProtocolState),
        hiddenMeds: (parsed.hiddenMeds as string[]) ?? [],
        supplements: (parsed.supplements as ProtocolItem[]) ?? [],
        medTimes: (parsed.medTimes as Record<string, TimeSlot>) ?? {},
        taken: (parsed.taken as string[]) ?? [],
        takenDate: (parsed.takenDate as string) ?? '',
      };
    }

    // Unknown shape
    return EMPTY_PROTOCOL;
  } catch {
    return EMPTY_PROTOCOL;
  }
}

// ── Custom Supplement Modal ──────────────────────────────────────────────────
interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (s: CustomSupplement) => void;
}

function AddCustomSupplementModal({ visible, onClose, onAdd }: AddModalProps) {
  const [query, setQuery] = useState('');
  const [selectedDb, setSelectedDb] = useState<SupplementInfo | null>(null);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [timing, setTiming] = useState<TimeSlot | undefined>(undefined);
  const [notes, setNotes] = useState('');

  // Search the database
  const dbResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return SUPPLEMENT_DATABASE.filter(s =>
      s.name.toLowerCase().includes(q) || s.shortDescription.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  function resetForm() {
    setQuery('');
    setSelectedDb(null);
    setName('');
    setDose('');
    setTiming(undefined);
    setNotes('');
  }

  function selectFromDb(info: SupplementInfo) {
    setSelectedDb(info);
    setName(info.name);
    setDose(info.defaultDose);
    setQuery('');
  }

  function handleAdd() {
    const finalName = (selectedDb?.name ?? name).trim();
    if (!finalName) {
      Alert.alert('Name required', 'Please enter a supplement name.');
      return;
    }
    const custom: CustomSupplement = {
      id: `custom_${Date.now()}`,
      name: finalName,
      dose: dose.trim() || '—',
      timing,
      notes: notes.trim() || undefined,
      addedAt: new Date().toISOString(),
    };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    onAdd(custom);
    resetForm();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Outer backdrop tap → dismiss */}
      <TouchableOpacity
        style={ms.overlay}
        activeOpacity={1}
        onPress={() => { Keyboard.dismiss(); onClose(); resetForm(); }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Inner sheet tap → absorbed via TouchableOpacity with activeOpacity=1 */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={ms.sheet}>
                <View style={ms.handle} />
                <Text style={ms.sheetTitle}>Add Supplement</Text>

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={ms.sheetScroll}>
                <Text style={ms.fieldLabel}>Search database</Text>
                <TextInput
                  style={ms.input}
                  placeholder="Search Berberine, Quercetin, NMN…"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={query}
                  onChangeText={t => { setQuery(t); setSelectedDb(null); }}
                  autoCorrect={false}
                />
                {dbResults.length > 0 && (
                  <View style={ms.dbResults}>
                    {dbResults.map(info => (
                      <TouchableOpacity key={info.id} style={ms.dbRow} onPress={() => selectFromDb(info)}>
                        <View style={{ flex: 1 }}>
                          <Text style={ms.dbName}>{info.name}</Text>
                          <Text style={ms.dbDesc}>{info.shortDescription}</Text>
                        </View>
                        <View style={[ms.gradeBadge, { backgroundColor: info.evidenceGrade === 'A' ? Colors.primaryBg : Colors.warningBg }]}>
                          <Text style={[ms.gradeTxt, { color: info.evidenceGrade === 'A' ? Colors.primary : Colors.warning }]}>
                            {info.evidenceGrade}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {query.length >= 2 && dbResults.length === 0 && (
                  <Text style={ms.notFound}>Not in database — enter manually below</Text>
                )}

                {selectedDb && (
                  <View style={ms.selectedBadge}>
                    <Text style={ms.selectedTxt}>✓ From database: {selectedDb.name}</Text>
                  </View>
                )}

                <Text style={ms.fieldLabel}>Name {!selectedDb && <Text style={ms.required}>*</Text>}</Text>
                <TextInput
                  style={ms.input}
                  placeholder="Supplement name"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={name}
                  onChangeText={setName}
                  editable={!selectedDb}
                />

                <Text style={ms.fieldLabel}>Dose</Text>
                <TextInput
                  style={ms.input}
                  placeholder="e.g. 500mg, 2 capsules"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={dose}
                  onChangeText={setDose}
                />

                <Text style={ms.fieldLabel}>Time of day</Text>
                <View style={ms.timingRow}>
                  {TIME_SLOTS.map(slot => (
                    <TouchableOpacity
                      key={slot.key}
                      style={[ms.timingChip, timing === slot.key && ms.timingChipActive]}
                      onPress={() => setTiming(t => t === slot.key ? undefined : slot.key)}
                    >
                      <Text style={[ms.timingTxt, timing === slot.key && ms.timingTxtActive]}>
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={ms.fieldLabel}>Notes (optional)</Text>
                <TextInput
                  style={[ms.input, ms.notesInput]}
                  placeholder="Any notes, interactions, reminders…"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
                </ScrollView>

                <View style={ms.btnRow}>
                  <TouchableOpacity style={ms.cancelBtn} onPress={() => { resetForm(); onClose(); }}>
                    <Text style={ms.cancelTxt}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={ms.addBtn} onPress={handleAdd}>
                    <Text style={ms.addBtnTxt}>Add to Stack</Text>
                  </TouchableOpacity>
                </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Edit Supplement Sheet ─────────────────────────────────────────────────────
interface EditSupplementSheetProps {
  visible: boolean;
  item: ProtocolItem | null;
  onClose: () => void;
  onSave: (updates: { personalDose?: string; timing?: TimeSlot; reminderEnabled?: boolean; reminderSlot?: TimeSlot }) => void;
}

function EditSupplementSheet({ visible, item, onClose, onSave }: EditSupplementSheetProps) {
  const [personalDose, setPersonalDose] = useState('');
  const [timing, setTiming] = useState<TimeSlot | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderSlot, setReminderSlot] = useState<TimeSlot | undefined>(undefined);

  useEffect(() => {
    if (item) {
      setPersonalDose(item.personalDose ?? item.dose);
      setTiming(item.timing);
      setNotes('');
      setReminderEnabled(item.reminderEnabled ?? false);
      setReminderSlot(item.reminderSlot ?? item.timing);
    }
  }, [item]);

  function handleClose() {
    onClose();
  }

  function handleSave() {
    onSave({
      personalDose: personalDose.trim() || undefined,
      timing,
      reminderEnabled,
      reminderSlot: reminderEnabled ? reminderSlot : undefined,
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity
        style={ms.overlay}
        activeOpacity={1}
        onPress={() => { Keyboard.dismiss(); handleClose(); }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={ms.sheet}>
              <View style={ms.handle} />
              <Text style={ms.readOnlyName}>{item?.name ?? ''}</Text>

              <Text style={ms.fieldLabel}>Your Dose</Text>
              <TextInput
                style={ms.input}
                placeholder="e.g. 500mg, 2 capsules"
                placeholderTextColor={Colors.dark.textMuted}
                value={personalDose}
                onChangeText={setPersonalDose}
              />

              <Text style={ms.fieldLabel}>Time of day</Text>
              <View style={ms.timingRow}>
                {TIME_SLOTS.map(slot => (
                  <TouchableOpacity
                    key={slot.key}
                    style={[ms.timingChip, timing === slot.key && ms.timingChipActive]}
                    onPress={() => setTiming(t => t === slot.key ? undefined : slot.key)}
                  >
                    <Text style={[ms.timingTxt, timing === slot.key && ms.timingTxtActive]}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {item?.source === 'manual' && (
                <>
                  <Text style={ms.fieldLabel}>Notes (optional)</Text>
                  <TextInput
                    style={[ms.input, ms.notesInput]}
                    placeholder="Any notes, interactions, reminders…"
                    placeholderTextColor={Colors.dark.textMuted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                  />
                </>
              )}

              <Text style={ms.fieldLabel}>Reminder</Text>
              <View style={ms.reminderToggleRow}>
                <Text style={ms.reminderToggleLbl}>Remind me daily</Text>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: Colors.dark.border, true: Colors.dark.accentBorder }}
                  thumbColor={reminderEnabled ? Colors.dark.ctaPrimary : Colors.dark.textMuted}
                />
              </View>
              {reminderEnabled && (
                <>
                  <Text style={[ms.fieldLabel, { marginTop: Spacing.sm }]}>Remind me at</Text>
                  <View style={ms.timingRow}>
                    {TIME_SLOTS.map(slot => (
                      <TouchableOpacity
                        key={slot.key}
                        style={[ms.timingChip, reminderSlot === slot.key && ms.timingChipActive]}
                        onPress={() => setReminderSlot(s => s === slot.key ? undefined : slot.key)}
                      >
                        <Text style={[ms.timingTxt, reminderSlot === slot.key && ms.timingTxtActive]}>
                          {slot.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <View style={ms.btnRow}>
                <TouchableOpacity style={ms.cancelBtn} onPress={handleClose}>
                  <Text style={ms.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ms.addBtn} onPress={handleSave}>
                  <Text style={ms.addBtnTxt}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Edit Medication Sheet ─────────────────────────────────────────────────────
interface EditMedicationSheetProps {
  visible: boolean;
  medName: string | null;
  currentTiming: TimeSlot | undefined;
  currentReminderEnabled: boolean;
  currentReminderSlot: TimeSlot | undefined;
  onClose: () => void;
  onSave: (timing: TimeSlot | undefined, reminderEnabled: boolean, reminderSlot: TimeSlot | undefined) => void;
  onHide: () => void;
}

function EditMedicationSheet({ visible, medName, currentTiming, currentReminderEnabled, currentReminderSlot, onClose, onSave, onHide }: EditMedicationSheetProps) {
  const [selectedTiming, setSelectedTiming] = useState<TimeSlot | undefined>(undefined);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderSlot, setReminderSlot] = useState<TimeSlot | undefined>(undefined);

  useEffect(() => {
    setSelectedTiming(currentTiming);
    setReminderEnabled(currentReminderEnabled);
    setReminderSlot(currentReminderSlot ?? currentTiming);
  }, [currentTiming, currentReminderEnabled, currentReminderSlot, medName]);

  function handleHide() {
    Alert.alert(
      'Hide medication?',
      `${medName} will be hidden from your protocol view. You can still see it in your profile.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Hide', style: 'destructive', onPress: () => { onClose(); onHide(); } },
      ],
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={ms.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={ms.sheet}>
              <View style={ms.handle} />
              <Text style={ms.readOnlyName}>{medName ?? ''}</Text>

              <Text style={ms.fieldLabel}>Time of day</Text>
              <View style={ms.timingRow}>
                {TIME_SLOTS.map(slot => (
                  <TouchableOpacity
                    key={slot.key}
                    style={[ms.timingChip, selectedTiming === slot.key && ms.timingChipActive]}
                    onPress={() => setSelectedTiming(t => t === slot.key ? undefined : slot.key)}
                  >
                    <Text style={[ms.timingTxt, selectedTiming === slot.key && ms.timingTxtActive]}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={ms.fieldLabel}>Reminder</Text>
              <View style={ms.reminderToggleRow}>
                <Text style={ms.reminderToggleLbl}>Remind me daily</Text>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: Colors.dark.border, true: Colors.dark.accentBorder }}
                  thumbColor={reminderEnabled ? Colors.dark.ctaPrimary : Colors.dark.textMuted}
                />
              </View>
              {reminderEnabled && (
                <>
                  <Text style={[ms.fieldLabel, { marginTop: Spacing.sm }]}>Remind me at</Text>
                  <View style={ms.timingRow}>
                    {TIME_SLOTS.map(slot => (
                      <TouchableOpacity
                        key={slot.key}
                        style={[ms.timingChip, reminderSlot === slot.key && ms.timingChipActive]}
                        onPress={() => setReminderSlot(s => s === slot.key ? undefined : slot.key)}
                      >
                        <Text style={[ms.timingTxt, reminderSlot === slot.key && ms.timingTxtActive]}>
                          {slot.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <TouchableOpacity style={ms.destructiveBtn} onPress={handleHide}>
                <Text style={ms.destructiveTxt}>Remove from view</Text>
              </TouchableOpacity>

              <View style={ms.btnRow}>
                <TouchableOpacity style={ms.cancelBtn} onPress={onClose}>
                  <Text style={ms.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ms.addBtn} onPress={() => onSave(selectedTiming, reminderEnabled, reminderEnabled ? reminderSlot : undefined)}>
                  <Text style={ms.addBtnTxt}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Add Medication Modal ──────────────────────────────────────────────────────
interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
  existingMeds: string[];
}

function AddMedicationModal({ visible, onClose, onAdd, existingMeds }: AddMedicationModalProps) {
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [isPrescription, setIsPrescription] = useState(true);

  const dbResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return MEDICATION_DATABASE.filter(m =>
      m.genericName.toLowerCase().includes(q) ||
      m.brandNames.some(b => b.toLowerCase().includes(q)),
    ).slice(0, 6);
  }, [query]);

  function resetForm() {
    setQuery('');
    setName('');
    setIsPrescription(true);
  }

  function handleAdd() {
    const finalName = name.trim() || query.trim();
    if (!finalName) {
      Alert.alert('Name required', 'Please enter a medication name.');
      return;
    }
    if (existingMeds.some(m => m.toLowerCase() === finalName.toLowerCase())) {
      Alert.alert('Already added', `${finalName} is already in your medications.`);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    onAdd(finalName);
    resetForm();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={ms.overlay}
        activeOpacity={1}
        onPress={() => { Keyboard.dismiss(); onClose(); resetForm(); }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={ms.sheet}>
              <View style={ms.handle} />
              <Text style={ms.sheetTitle}>Add Medication</Text>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={ms.sheetScroll}>
                <Text style={ms.fieldLabel}>Search database</Text>
                <TextInput
                  style={ms.input}
                  placeholder="Search by name or brand (e.g. Metformin, Lipitor)…"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={query}
                  onChangeText={t => { setQuery(t); if (!name) setName(t); }}
                  autoCorrect={false}
                />
                {dbResults.length > 0 && (
                  <View style={ms.dbResults}>
                    {dbResults.map(m => (
                      <TouchableOpacity
                        key={m.genericName}
                        style={ms.dbRow}
                        onPress={() => { setName(m.genericName); setQuery(m.genericName); Keyboard.dismiss(); }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={ms.dbName}>{m.genericName}</Text>
                          <Text style={ms.dbDesc}>{m.brandNames.join(', ')} · {m.drugClass}</Text>
                        </View>
                        {m.category !== 'other' && (
                          <View style={[ms.gradeBadge, { backgroundColor: Colors.accentBg }]}>
                            <Text style={[ms.gradeTxt, { color: Colors.accent }]}>Rx</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {query.length >= 2 && dbResults.length === 0 && (
                  <Text style={ms.notFound}>Not found — you can still add it manually below</Text>
                )}

                <Text style={ms.fieldLabel}>Medication name *</Text>
                <TextInput
                  style={ms.input}
                  placeholder="Generic name (e.g. lisinopril)"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={name}
                  onChangeText={setName}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md }}>
                  <Text style={ms.fieldLabel}>Prescription medication</Text>
                  <Switch
                    value={isPrescription}
                    onValueChange={setIsPrescription}
                    trackColor={{ false: Colors.borderLight, true: Colors.primaryBorder }}
                    thumbColor={isPrescription ? Colors.primary : Colors.onSurfaceMuted}
                  />
                </View>
              </ScrollView>

              <View style={ms.btnRow}>
                <TouchableOpacity style={ms.cancelBtn} onPress={() => { resetForm(); onClose(); }}>
                  <Text style={ms.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ms.addBtn} onPress={handleAdd}>
                  <Text style={ms.addBtnTxt}>Add Medication</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Add Supplement Sheet (recommended picker + custom entry point) ─────────────
interface AddSupplementSheetProps {
  visible: boolean;
  onClose: () => void;
  goal: string;
  addedSupplements: string[];
  onToggle: (name: string) => void;
  onOpenCustom: () => void;
}

function AddSupplementSheet({ visible, onClose, goal, addedSupplements, onToggle, onOpenCustom }: AddSupplementSheetProps) {
  const allRecommended = useMemo(() =>
    [...BASE_SUPPLEMENTS, ...GOAL_SUPPLEMENTS].filter(s =>
      s.goals.includes('all') || s.goals.some(g => g.toLowerCase() === goal.toLowerCase()),
    ), [goal]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <View style={ms.handle} />
          <Text style={ms.sheetTitle}>Add Supplement</Text>
          {goal ? <Text style={[ms.fieldLabel, { marginTop: 0, marginBottom: Spacing.sm }]}>Recommended for: {goal}</Text> : null}
          <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
            {allRecommended.map((supp, i) => {
              const isAdded = addedSupplements.includes(supp.name);
              return (
                <TouchableOpacity
                  key={supp.name}
                  style={[ms.dbRow, isAdded && { backgroundColor: Colors.dark.accentBg }, i === allRecommended.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => { Haptics.selectionAsync().catch(() => null); onToggle(supp.name); }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[ms.dbName, isAdded && { color: Colors.dark.ctaPrimary }]}>{supp.name}</Text>
                    <Text style={ms.dbDesc}>{supp.dose}</Text>
                  </View>
                  <View style={[ms.gradeBadge, { backgroundColor: isAdded ? Colors.dark.accentBg : Colors.dark.cardBg, minWidth: 28, alignItems: 'center' }]}>
                    <Text style={[ms.gradeTxt, { color: isAdded ? Colors.dark.ctaPrimary : Colors.dark.textMuted }]}>
                      {isAdded ? '✓' : '+'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={[ms.btnRow, { marginTop: Spacing.base }]}>
            <TouchableOpacity style={ms.cancelBtn} onPress={onClose}>
              <Text style={ms.cancelTxt}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ms.addBtn} onPress={() => { onClose(); onOpenCustom(); }}>
              <Text style={ms.addBtnTxt}>+ Add manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function ProtocolScreen() {
  const nav = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [protocol, setProtocol] = useState<ProtocolState>(EMPTY_PROTOCOL);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showRecommendedSheet, setShowRecommendedSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<ProtocolItem | null>(null);
  const [editingMed, setEditingMed] = useState<string | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [permDenied, setPermDenied] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATION_PREFS_KEY)
      .then(raw => { if (raw) setNotifPrefs(JSON.parse(raw) as NotificationPrefs); })
      .catch(() => null);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [profileRaw, protocolRaw] = await Promise.all([
        AsyncStorage.getItem('@vitalspan_user_profile'),
        AsyncStorage.getItem('@vitalspan_protocol'),
      ]);
      if (profileRaw) setProfile(JSON.parse(profileRaw));
      if (protocolRaw) {
        const parsed = JSON.parse(protocolRaw) as Record<string, unknown>;
        const migrated = migrateProtocol(parsed);

        // If old schema detected (addedSupplements key), write back immediately
        if ('addedSupplements' in parsed) {
          await AsyncStorage.setItem('@vitalspan_protocol', JSON.stringify(migrated)).catch(console.error);
        }

        // Daily taken reset
        const today = new Date().toISOString().slice(0, 10);

        // ── Phase 22 streak evaluation ──────────────────────────────────────────
        // Guard: only fire when takenDate is a real past date (not '' and not today)
        // Pitfall 1: empty-string guard is mandatory — first launch has takenDate: ''
        // which must NOT trigger streak eval (RESEARCH Pitfall 1)
        if (migrated.takenDate !== '' && migrated.takenDate !== today) {
          const profileData = profileRaw
            ? JSON.parse(profileRaw) as { medications?: string[] }
            : null;
          const medsForStreak = (profileData?.medications ?? []).filter(
            (m: string) => !migrated.hiddenMeds.includes(m),
          );

          // Build visible item IDs — mirrors totalItems / takenCount logic (lines 770-785)
          const visibleItemIds: string[] = [
            ...medsForStreak,
            ...migrated.supplements.flatMap(s => {
              const count = parseDoseCount(s.personalDose ?? s.dose);
              return count === 1
                ? [s.id]
                : Array.from({ length: count }, (_, i) => doseId(s.name, i));
            }),
          ];

          if (visibleItemIds.length === 0) {
            // No visible items — pause streak (neither increment nor reset)
          } else {
            const takenSet = new Set(migrated.taken);
            const allTaken = visibleItemIds.every(id => takenSet.has(id));
            if (allTaken) {
              migrated.currentStreak = (migrated.currentStreak ?? 0) + 1;
              migrated.bestStreak = Math.max(migrated.bestStreak ?? 0, migrated.currentStreak);
              migrated.lastCompleteDate = migrated.takenDate;
            } else {
              migrated.currentStreak = 0;
            }
            // Persist streak update before finalState wipes taken[]
            await AsyncStorage.setItem('@vitalspan_protocol', JSON.stringify({
              ...migrated,
              taken: [],
              takenDate: today,
            })).catch(console.error);
          }
        }
        // ── end streak evaluation ───────────────────────────────────────────────

        const finalState: ProtocolState = {
          ...migrated,
          taken: migrated.takenDate === today ? migrated.taken : [],
          takenDate: today,
        };
        setProtocol(finalState);
      }
    } catch (e) {
      console.error('ProtocolScreen loadData failed:', e);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));
  useFocusEffect(useCallback(() => { setStatusBarStyle('dark'); return () => {}; }, []));

  async function handleRefresh() {
    setRefreshing(true);
    await loadData().catch(console.error);
    setRefreshing(false);
  }

  async function persist(next: ProtocolState) {
    setProtocol(next);
    await Promise.all([
      AsyncStorage.setItem('@vitalspan_protocol', JSON.stringify(next)),
      AsyncStorage.setItem('@vitalspan_protocol_today', JSON.stringify({
        date: next.takenDate, taken: next.taken,
      })),
    ]).catch(console.error);
  }

  function toggleTaken(id: string) {
    Haptics.selectionAsync().catch(() => null);
    const today = new Date().toISOString().slice(0, 10);
    const taken = protocol.taken.includes(id)
      ? protocol.taken.filter(t => t !== id)
      : [...protocol.taken, id];
    persist({ ...protocol, taken, takenDate: today });
  }

  // Medication timing + reminder is now set from EditMedicationSheet only
  async function setMedFromSheet(
    med: string,
    time: TimeSlot | undefined,
    reminderEnabled: boolean,
    reminderSlot: TimeSlot | undefined,
  ) {
    const newTimes = { ...protocol.medTimes };
    if (time === undefined) {
      delete newTimes[med];
    } else {
      newTimes[med] = time;
    }
    const newMedReminders = { ...(protocol.medReminders ?? {}) };
    if (!reminderEnabled) {
      delete newMedReminders[med];
    } else if (reminderSlot) {
      newMedReminders[med] = { enabled: true, slot: reminderSlot };
    }
    await persist({ ...protocol, medTimes: newTimes, medReminders: newMedReminders });
    await applyItemReminder(`med_${med}`, med, reminderEnabled, reminderSlot);
  }

  function hideMedication(name: string) {
    persist({ ...protocol, hiddenMeds: [...protocol.hiddenMeds, name] });
  }

  // Add from library (DB item)
  function addFromLibrary(name: string) {
    const dbEntry = SUPPLEMENT_DATABASE.find(s => s.name.toLowerCase() === name.toLowerCase());
    const item: ProtocolItem = {
      id: `supp_${Date.now()}`,
      name: dbEntry?.name ?? name,
      dose: dbEntry?.defaultDose ?? '—',
      source: 'db',
      addedAt: new Date().toISOString(),
    };
    const alreadyIn = protocol.supplements.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (alreadyIn) return;
    persist({ ...protocol, supplements: [...protocol.supplements, item] });
  }

  // Add manually (custom supplement)
  function addManual(item: Omit<ProtocolItem, 'id' | 'addedAt' | 'source'>) {
    const nameLower = item.name.toLowerCase().trim();
    const alreadyIn = protocol.supplements.some(s => s.name.toLowerCase() === nameLower);
    if (alreadyIn) {
      Alert.alert('Already in your stack', `${item.name} is already in your supplement stack.`);
      return;
    }
    const newItem: ProtocolItem = {
      ...item,
      id: `supp_custom_${Date.now()}`,
      source: 'manual',
      addedAt: new Date().toISOString(),
    };
    persist({ ...protocol, supplements: [...protocol.supplements, newItem] });
  }

  // Remove supplement by id
  function removeFromStack(id: string) {
    Alert.alert('Remove supplement?', 'This will remove it from your stack.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const supplements = protocol.supplements.filter(s => s.id !== id);
          const taken = protocol.taken.filter(t => !t.startsWith(id) && t !== id);
          persist({ ...protocol, supplements, taken });
        },
      },
    ]);
  }

  // Update a supplement item's personalDose/timing/reminder settings
  async function updateSupplementItem(
    id: string,
    updates: Partial<Pick<ProtocolItem, 'personalDose' | 'timing' | 'reminderEnabled' | 'reminderSlot'>>,
  ) {
    const supplements = protocol.supplements.map(s =>
      s.id === id ? { ...s, ...updates } : s,
    );
    await persist({ ...protocol, supplements });
    // Apply or cancel the notification for this specific item
    const item = supplements.find(s => s.id === id);
    if (item && 'reminderEnabled' in updates) {
      await applyItemReminder(id, item.name, item.reminderEnabled ?? false, item.reminderSlot);
    }
  }

  // Toggle for library section: add or remove by name
  function toggleSupplementByName(name: string) {
    const existing = protocol.supplements.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      removeFromStack(existing.id);
    } else {
      addFromLibrary(name);
    }
  }

  // Per-item reminder toggle handler — called from EditSupplementSheet/EditMedicationSheet save.
  async function applyItemReminder(
    id: string,
    name: string,
    enabled: boolean,
    slot: TimeSlot | undefined,
  ): Promise<void> {
    if (!enabled) {
      await cancelItemReminder(id).catch(() => null);
      setPermDenied(false);
      return;
    }
    if (!slot) return; // no slot chosen yet — don't schedule
    const granted = await ensurePermission();
    if (!granted) { setPermDenied(true); return; }
    setPermDenied(false);
    await scheduleItemReminder(id, slot, name, notifPrefs).catch(() => null);
  }

  // Visible medications (excludes hidden)
  const medications = profile?.medications ?? [];
  const visibleMeds = medications.filter(m => !protocol.hiddenMeds.includes(m));

  // Build inline interaction map for medications
  const medInteractionMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const med of visibleMeds) {
      const medLower = med.toLowerCase();
      const conflicts: string[] = [];
      for (const inter of INTERACTIONS) {
        if (medLower.includes(inter.drug.toLowerCase())) {
          const allAdded = protocol.supplements.map(s => s.name);
          if (allAdded.some(s => s.toLowerCase().includes(inter.supplement.toLowerCase()))) {
            conflicts.push(inter.supplement);
          }
        }
      }
      const drugEntry = MEDICATION_DATABASE.find(m =>
        m.genericName.toLowerCase() === medLower ||
        m.brandNames.some(b => b.toLowerCase() === medLower),
      );
      if (drugEntry) {
        for (const inter of INTERACTIONS) {
          if (inter.drug.toLowerCase() === drugEntry.drugClass.toLowerCase()) {
            const allAdded = protocol.supplements.map(s => s.name);
            if (allAdded.some(s => s.toLowerCase().includes(inter.supplement.toLowerCase()))) {
              if (!conflicts.includes(inter.supplement)) conflicts.push(inter.supplement);
            }
          }
        }
      }
      if (conflicts.length > 0) map[med] = conflicts;
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleMeds, protocol.supplements]);

  // Drug class labels from medications database
  const medClassMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const med of visibleMeds) {
      const medLower = med.toLowerCase();
      const drugEntry = MEDICATION_DATABASE.find(m =>
        m.genericName.toLowerCase() === medLower ||
        m.brandNames.some(b => b.toLowerCase() === medLower),
      );
      if (drugEntry?.drugClass) map[med] = drugEntry.drugClass;
    }
    return map;
  }, [visibleMeds]);

  // Names currently in stack (for library toggle check)
  const addedSupplementNames = useMemo(
    () => protocol.supplements.map(s => s.name),
    [protocol.supplements],
  );

  // Total doses: visibleMeds count as 1 each; multi-dose supplements count their full dose count
  const totalItems =
    visibleMeds.length +
    protocol.supplements.reduce((sum, s) => sum + parseDoseCount(s.personalDose ?? s.dose), 0);

  const takenCount = protocol.taken.filter(t => {
    if (visibleMeds.includes(t)) return true;
    for (const s of protocol.supplements) {
      if (t === s.id) return true;
      const count = parseDoseCount(s.personalDose ?? s.dose);
      for (let i = 0; i < count; i++) {
        if (t === doseId(s.name, i)) return true;
      }
    }
    return false;
  }).length;

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.heading}>Today's Protocol</Text>
          <Text style={s.date}>{dateStr}</Text>
        </View>
        {totalItems > 0 && (
          <View style={s.progressPill}>
            <Text style={s.progressTxt}>{takenCount} / {totalItems} taken</Text>
          </View>
        )}
      </View>

      {/* Phase 22: Streak stat row */}
      <View style={s.streakRow}>
        <Text style={[s.streakTxt, (protocol.currentStreak ?? 0) > 0 ? s.streakActive : s.streakMuted]}>
          {'🔥'} {protocol.currentStreak ?? 0}-day streak
        </Text>
        {(protocol.bestStreak ?? 0) > 0 ? (
          <Text style={s.streakBest}>Best: {protocol.bestStreak} days</Text>
        ) : (protocol.currentStreak ?? 0) === 0 ? (
          <Text style={s.streakHint}>Start your streak today!</Text>
        ) : null}
      </View>

      {permDenied && (
        <Text style={s.permDeniedTxt}>
          Notifications are disabled — go to Settings › Notifications to enable.
        </Text>
      )}

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {totalItems === 0 && (
          <View style={s.emptyScreenCard}>
            <PillIcon color={Colors.onSurfaceMuted} size={40} />
            <Text style={s.emptyScreenHeadline}>Build your longevity stack.</Text>
            <Text style={s.emptyScreenSubtext}>
              Add your medications and pharmacist-curated supplements to track your daily protocol and check for interactions.
            </Text>
            <TouchableOpacity style={s.emptyScreenCta} onPress={() => setShowRecommendedSheet(true)} activeOpacity={0.8}>
              <Text style={s.emptyScreenCtaTxt}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Medications ───────────────────────────────────────── */}
        <View style={s.sectionHdrRow}>
          <Text style={s.stackHdrTxt}>Medications</Text>
          <TouchableOpacity
            style={s.sectionAddBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null); setShowAddMedModal(true); }}
          >
            <Text style={s.sectionAddTxt}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {visibleMeds.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTxt}>
              {medications.length === 0
                ? 'No medications in your profile'
                : 'All medications are hidden from view'}
            </Text>
            {medications.length === 0 && (
              <TouchableOpacity style={s.emptyCtaBtn} onPress={() => nav.navigate('Profile')}>
                <Text style={s.emptyCtaTxt}>Go to Profile →</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          visibleMeds.map(med => {
            const isTaken = protocol.taken.includes(med);
            const time = protocol.medTimes[med];
            const conflicts = medInteractionMap[med] ?? [];
            const drugClass = medClassMap[med];
            return (
              <TouchableOpacity
                key={med}
                style={s.itemCard}
                onPress={() => setEditingMed(med)}
                activeOpacity={0.85}
              >
                <View style={s.cardRow}>
                  <TouchableOpacity
                    onPress={e => { e.stopPropagation(); toggleTaken(med); }}
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <View style={[s.checkCircle, isTaken && s.checkCircleOn]}>
                      {isTaken && <Text style={s.checkMark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  <View style={s.cardBody}>
                    <Text style={[s.cardName, isTaken && s.cardNameDone]}>{med}</Text>
                    {drugClass && <Text style={s.cardSub}>{drugClass}</Text>}
                  </View>
                  {time && (
                    <View style={[s.timeChip, s.timeChipOn]}>
                      <Text style={[s.timeChipTxt, s.timeChipTxtOn]}>
                        {TIME_SLOTS.find(sl => sl.key === time)?.label ?? time}
                      </Text>
                    </View>
                  )}
                </View>

                {conflicts.length > 0 && (
                  <TouchableOpacity
                    style={s.conflictPill}
                    onPress={e => { e.stopPropagation(); nav.navigate('InteractionChecker'); }}
                  >
                    <Text style={s.conflictPillTxt}>⚠ Interacts with {conflicts.join(', ')} — tap to review</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}

        {/* ── Your Stack ────────────────────────────────────────── */}
        <View style={s.sectionHdrRow}>
          <Text style={s.stackHdrTxt}>Your Stack</Text>
          <TouchableOpacity
            style={s.sectionAddBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null); setShowRecommendedSheet(true); }}
          >
            <Text style={s.sectionAddTxt}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {protocol.supplements.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyTxt}>No supplements in your stack yet</Text>
          </View>
        )}

        {protocol.supplements.map(item => {
          const displayDose = item.personalDose ?? item.dose;
          const doseCount = parseDoseCount(displayDose);
          const timeLabels = getDoseTimeLabels(doseCount);
          const singleTaken = doseCount === 1 &&
            (protocol.taken.includes(item.id) || protocol.taken.includes(doseId(item.name, 0)));
          const dbInfo = SUPPLEMENT_DATABASE.find(s => s.name.toLowerCase() === item.name.toLowerCase());
          const evidence = (dbInfo?.evidenceGrade ?? 'C') as 'A' | 'B' | 'C';
          const gradeBg = ({ A: Colors.dark.statusOptimalBg, B: Colors.dark.statusWarnBg, C: Colors.dark.cardBg } as const)[evidence];
          const gradeBdr = ({ A: Colors.dark.statusOptimalBorder, B: Colors.dark.statusWarnBorder, C: Colors.dark.border } as const)[evidence];
          const gradeClr = ({ A: Colors.viz.bioGreen, B: Colors.viz.amber, C: Colors.dark.textMuted } as const)[evidence];
          const timingLabel = item.timing ? TIME_SLOTS.find(t => t.key === item.timing)?.label : null;

          return (
            <TouchableOpacity
              key={item.id}
              style={s.itemCard}
              onPress={() => setEditingSupplement(item)}
              activeOpacity={0.85}
            >
              <View style={s.cardRow}>
                {doseCount === 1 ? (
                  <TouchableOpacity
                    onPress={e => { e.stopPropagation(); toggleTaken(item.id); }}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <View style={[s.checkCircle, singleTaken && s.checkCircleOn]}>
                      {singleTaken && <Text style={s.checkMark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={s.checkPlaceholder} />
                )}
                <View style={s.cardBody}>
                  <Text style={[s.cardName, singleTaken && s.cardNameDone]}>{item.name}</Text>
                  {dbInfo?.shortDescription && (
                    <Text style={s.cardSub} numberOfLines={1}>{dbInfo.shortDescription}</Text>
                  )}
                </View>
                <View style={s.badgeGroup}>
                  <View style={[s.gradeBadge, { backgroundColor: gradeBg, borderColor: gradeBdr }]}>
                    <Text style={[s.gradeBadgeTxt, { color: gradeClr }]}>{evidence}</Text>
                  </View>
                  {displayDose !== '—' && (
                    <View style={s.doseBadge}>
                      <Text style={s.doseBadgeTxt}>{displayDose}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={s.removeBtn}
                    onPress={e => { e.stopPropagation(); removeFromStack(item.id); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={s.removeTxt}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {(dbInfo?.bestTime || dbInfo?.timing || timingLabel) && (
                <View style={s.infoRow}>
                  {timingLabel && (
                    <View style={[s.infoChip, { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder }]}>
                      <Text style={[s.infoChipTxt, { color: Colors.primary }]}>{timingLabel}</Text>
                    </View>
                  )}
                  {dbInfo?.bestTime && dbInfo.bestTime !== 'anytime' && (
                    <View style={s.infoChip}>
                      <Text style={s.infoChipTxt}>{BEST_TIME_LABELS[dbInfo.bestTime]}</Text>
                    </View>
                  )}
                  {dbInfo?.timing && dbInfo.timing !== 'flexible' && (
                    <View style={s.infoChip}>
                      <Text style={s.infoChipTxt}>{TIMING_LABELS[dbInfo.timing]}</Text>
                    </View>
                  )}
                </View>
              )}

              {doseCount > 1 && (
                <View style={s.multiDoseBlock}>
                  {timeLabels.map((label, n) => {
                    const id = doseId(item.name, n);
                    const dt = protocol.taken.includes(id);
                    return (
                      <TouchableOpacity
                        key={id}
                        style={s.doseTrack}
                        onPress={e => { e.stopPropagation(); toggleTaken(id); }}
                        activeOpacity={0.7}
                      >
                        <View style={[s.checkSm, dt && s.checkSmOn]}>
                          {dt && <Text style={s.checkSmTxt}>✓</Text>}
                        </View>
                        <Text style={[s.doseTrackTxt, dt && s.doseTrackDone]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* ── Supplement Library ────────────────────────────────── */}
        <View style={s.libDivider} />
        <Text style={s.sectionLabel}>Supplement Library</Text>
        <SupplementLibrarySection
          addedSupplements={addedSupplementNames}
          onToggle={toggleSupplementByName}
        />

        <View style={{ height: 32 }} />
      </ScrollView>

      <AddSupplementSheet
        visible={showRecommendedSheet}
        onClose={() => setShowRecommendedSheet(false)}
        goal={profile?.goal ?? ''}
        addedSupplements={addedSupplementNames}
        onToggle={toggleSupplementByName}
        onOpenCustom={() => setShowAddModal(true)}
      />
      <AddCustomSupplementModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={cs => addManual({ name: cs.name, dose: cs.dose, timing: cs.timing })}
      />
      <AddMedicationModal
        visible={showAddMedModal}
        onClose={() => setShowAddMedModal(false)}
        existingMeds={medications}
        onAdd={async (medName) => {
          const raw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
          const prof = raw ? JSON.parse(raw) as { medications?: string[] } : {};
          const updated = [...(prof.medications ?? []), medName];
          await AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify({ ...prof, medications: updated })).catch(console.error);
          setProfile(p => p ? { ...p, medications: updated } : p);
        }}
      />
      <EditSupplementSheet
        visible={editingSupplement !== null}
        item={editingSupplement}
        onClose={() => setEditingSupplement(null)}
        onSave={updates => {
          if (editingSupplement) {
            void updateSupplementItem(editingSupplement.id, updates);
          }
          setEditingSupplement(null);
        }}
      />
      <EditMedicationSheet
        visible={editingMed !== null}
        medName={editingMed}
        currentTiming={editingMed ? protocol.medTimes[editingMed] : undefined}
        currentReminderEnabled={editingMed ? (protocol.medReminders?.[editingMed]?.enabled ?? false) : false}
        currentReminderSlot={editingMed ? protocol.medReminders?.[editingMed]?.slot : undefined}
        onClose={() => setEditingMed(null)}
        onSave={(t, remEnabled, remSlot) => {
          if (editingMed) void setMedFromSheet(editingMed, t, remEnabled, remSlot);
          setEditingMed(null);
        }}
        onHide={() => {
          if (editingMed) hideMedication(editingMed);
          setEditingMed(null);
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  scroll: { flex: 1 },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    padding: Spacing.base, paddingTop: Spacing.md,
  },
  heading: { fontSize: Typography.sizes.xxl, fontWeight: '300', color: Colors.dark.text },
  date: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted, marginTop: 2 },
  progressPill: {
    backgroundColor: Colors.dark.statusOptimalBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 0.5, borderColor: Colors.dark.statusOptimalBorder,
  },
  progressTxt: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.viz.bioGreen },
  // Phase 22 streak row styles
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  streakTxt: { fontSize: Typography.sizes.xs, fontWeight: '600' },
  streakActive: { color: Colors.viz.bioGreen },
  streakMuted: { color: Colors.dark.textMuted },
  streakBest: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted },
  streakHint: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, fontStyle: 'italic' },

  // ── Section labels ───────────────────────────────────────────
  sectionLabel: {
    fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.dark.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
    paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base,
  },
  sectionHdrRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, marginTop: Spacing.base, marginBottom: Spacing.sm,
  },
  stackHdrTxt: {
    fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.dark.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  sectionAddBtn: {
    backgroundColor: Colors.dark.accentBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderWidth: 0.5, borderColor: Colors.dark.accentBorder,
  },
  sectionAddTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.ctaPrimary, fontWeight: '600' },

  // ── Item card ────────────────────────────────────────────────
  itemCard: {
    marginHorizontal: Spacing.base, marginBottom: 10,
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl, borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
    padding: Spacing.md, overflow: 'hidden',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: Colors.dark.text },
  cardNameDone: { color: Colors.dark.textMuted, textDecorationLine: 'line-through' },
  cardSub: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: 2 },

  // ── Check circle ─────────────────────────────────────────────
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: Colors.dark.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkCircleOn: { backgroundColor: Colors.dark.ctaPrimary, borderColor: Colors.dark.ctaPrimary },
  checkMark: { fontSize: 11, color: Colors.dark.bg, fontWeight: '700' },
  checkPlaceholder: { width: 22, height: 22, flexShrink: 0 },

  // ── Grade + dose badges ──────────────────────────────────────
  badgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gradeBadge: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 0.5,
  },
  gradeBadgeTxt: { fontSize: 10, fontWeight: '700' },
  doseBadge: {
    backgroundColor: Colors.dark.inputBg, borderRadius: Radius.sm,
    borderWidth: 0.5, borderColor: Colors.dark.border, paddingHorizontal: 7, paddingVertical: 3,
  },
  doseBadgeTxt: { fontSize: 11, color: Colors.dark.text, fontWeight: '500' },

  // ── Remove button ────────────────────────────────────────────
  removeBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.dark.inputBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.dark.border,
  },
  removeTxt: { fontSize: 10, color: Colors.dark.textMuted },

  // ── Info chips (best time, food timing, personal timing) ─────
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  infoChip: {
    backgroundColor: Colors.dark.cardBg, borderRadius: 8,
    borderWidth: 0.5, borderColor: Colors.dark.border, paddingHorizontal: 7, paddingVertical: 3,
  },
  infoChipTxt: { fontSize: 11, color: Colors.dark.textMuted, fontWeight: '500' },

  // ── Medication timing chip (read-only display) ───────────────
  timeChip: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.sm, backgroundColor: Colors.dark.cardBg,
    borderWidth: 0.5, borderColor: Colors.dark.border,
  },
  timeChipOn: { backgroundColor: Colors.dark.accentBg, borderColor: Colors.dark.accentBorder },
  timeChipTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, fontWeight: '500' },
  timeChipTxtOn: { color: Colors.dark.ctaPrimary },

  // ── Conflict pill ────────────────────────────────────────────
  conflictPill: {
    marginTop: 8, backgroundColor: Colors.dark.statusWarnBg,
    borderRadius: Radius.sm, borderWidth: 0.5, borderColor: Colors.dark.statusWarnBorder,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  conflictPillTxt: { fontSize: 11, color: Colors.viz.amber, fontWeight: '500' },

  // ── Multi-dose rows ──────────────────────────────────────────
  multiDoseBlock: { marginTop: 10, gap: 4 },
  doseTrack: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 2 },
  checkSm: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.dark.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkSmOn: { backgroundColor: Colors.dark.ctaPrimary, borderColor: Colors.dark.ctaPrimary },
  checkSmTxt: { fontSize: 9, color: Colors.dark.bg, fontWeight: '700' },
  doseTrackTxt: { flex: 1, fontSize: 12, color: Colors.dark.textMuted },
  doseTrackDone: { color: Colors.dark.textMuted, textDecorationLine: 'line-through' },

  // ── Empty states ─────────────────────────────────────────────
  emptyCard: {
    marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
    backgroundColor: Colors.dark.cardBg, borderRadius: Radius.xl,
    borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
    padding: Spacing.md, gap: Spacing.sm,
  },
  emptyTxt: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted },
  emptyCtaBtn: {
    backgroundColor: Colors.dark.accentBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 0.5, borderColor: Colors.dark.accentBorder, alignSelf: 'flex-start',
  },
  emptyCtaTxt: { fontSize: Typography.sizes.sm, color: Colors.dark.ctaPrimary, fontWeight: '500' },

  // ── Screen-level empty state ─────────────────────────────────
  emptyScreenCard: {
    marginHorizontal: Spacing.base, backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.xl, borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.base, overflow: 'hidden',
  },
  emptyScreenHeadline: {
    fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.dark.text,
    textAlign: 'center', marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  emptyScreenSubtext: {
    fontSize: Typography.sizes.base, color: Colors.dark.textMuted,
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg,
  },
  emptyScreenCta: {
    backgroundColor: Colors.dark.ctaPrimary, borderRadius: Radius.xl,
    minHeight: 44, height: 44, justifyContent: 'center', alignItems: 'center',
    alignSelf: 'stretch', paddingHorizontal: Spacing.base,
  },
  emptyScreenCtaTxt: { color: Colors.dark.bg, fontSize: Typography.sizes.base, fontWeight: '600', textAlign: 'center' },

  // ── Library divider ──────────────────────────────────────────
  libDivider: { height: 1, backgroundColor: Colors.dark.border, marginHorizontal: Spacing.base, marginVertical: Spacing.lg },

  permDeniedTxt: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    fontStyle: 'italic',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
});

// Modal styles
const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.dark.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.base, paddingBottom: 40, maxHeight: '90%',
    borderWidth: 0.5, borderColor: Colors.dark.borderStrong,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginBottom: Spacing.base,
  },
  sheetTitle: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.dark.text, marginBottom: Spacing.base },
  readOnlyName: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.dark.textMuted, marginBottom: Spacing.base },
  fieldLabel: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.dark.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: Spacing.sm }, /* intentional — no Spacing.* equivalent for marginBottom: 6 */
  required: { color: Colors.viz.coral },
  input: {
    backgroundColor: Colors.dark.inputBg, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    fontSize: Typography.sizes.base, color: Colors.dark.text,
    borderWidth: 1, borderColor: Colors.dark.inputBorder,
  },
  notesInput: { height: 72, textAlignVertical: 'top' },
  dbResults: {
    marginTop: Spacing.xs, backgroundColor: Colors.dark.bgElevated,
    borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.dark.borderStrong,
  },
  dbRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.dark.border,
  },
  dbName: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.dark.text },
  dbDesc: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: 2 },
  gradeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm }, /* intentional — no Spacing.* equivalent */
  gradeTxt: { fontSize: Typography.sizes.xs, fontWeight: '700' },
  notFound: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: Spacing.xs, fontStyle: 'italic' },
  selectedBadge: {
    backgroundColor: Colors.dark.accentBg, borderRadius: Radius.md,
    padding: Spacing.sm, marginTop: Spacing.sm,
    borderWidth: 0.5, borderColor: Colors.dark.accentBorder,
  },
  selectedTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.ctaPrimary, fontWeight: '500' },
  timingRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  timingChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, backgroundColor: Colors.dark.cardBg,
    borderWidth: 0.5, borderColor: Colors.dark.border,
  },
  timingChipActive: { backgroundColor: Colors.dark.accentBg, borderColor: Colors.dark.accentBorder },
  timingTxt: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted, fontWeight: '500' },
  timingTxtActive: { color: Colors.dark.ctaPrimary },
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  reminderToggleLbl: {
    fontSize: Typography.sizes.base,
    color: Colors.dark.text,
  },
  sheetScroll: { maxHeight: 420 },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.base },
  cancelBtn: {
    flex: 1, padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.dark.cardBg, alignItems: 'center',
    borderWidth: 0.5, borderColor: Colors.dark.border,
  },
  cancelTxt: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted, fontWeight: '500' },
  addBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.dark.ctaPrimary, alignItems: 'center' },
  addBtnTxt: { fontSize: Typography.sizes.base, color: Colors.dark.bg, fontWeight: '600' },
  destructiveBtn: {
    padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.dark.statusCritBg, alignItems: 'center',
    borderWidth: 0.5, borderColor: Colors.dark.statusCritBorder, marginTop: Spacing.base,
  },
  destructiveTxt: { fontSize: Typography.sizes.base, color: Colors.viz.coral, fontWeight: '500' },
});
