import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
  Modal, TextInput, Alert,
  KeyboardAvoidingView, Keyboard, Platform,
} from 'react-native';
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

                <Text style={ms.fieldLabel}>Search database</Text>
                <TextInput
                  style={ms.input}
                  placeholder="Search Berberine, Quercetin, NMN…"
                  placeholderTextColor={Colors.onSurfaceMuted}
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
                  placeholderTextColor={Colors.onSurfaceMuted}
                  value={name}
                  onChangeText={setName}
                  editable={!selectedDb}
                />

                <Text style={ms.fieldLabel}>Dose</Text>
                <TextInput
                  style={ms.input}
                  placeholder="e.g. 500mg, 2 capsules"
                  placeholderTextColor={Colors.onSurfaceMuted}
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
                  placeholderTextColor={Colors.onSurfaceMuted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />

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
  onSave: (updates: { personalDose?: string; timing?: TimeSlot }) => void;
}

function EditSupplementSheet({ visible, item, onClose, onSave }: EditSupplementSheetProps) {
  const [personalDose, setPersonalDose] = useState('');
  const [timing, setTiming] = useState<TimeSlot | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (item) {
      setPersonalDose(item.personalDose ?? item.dose);
      setTiming(item.timing);
      setNotes('');
    }
  }, [item]);

  function handleClose() {
    onClose();
  }

  function handleSave() {
    onSave({
      personalDose: personalDose.trim() || undefined,
      timing,
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
                placeholderTextColor={Colors.onSurfaceMuted}
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
                    placeholderTextColor={Colors.onSurfaceMuted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                  />
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
  onClose: () => void;
  onSaveTiming: (time: TimeSlot | undefined) => void;
  onHide: () => void;
}

function EditMedicationSheet({ visible, medName, currentTiming, onClose, onSaveTiming, onHide }: EditMedicationSheetProps) {
  const [selectedTiming, setSelectedTiming] = useState<TimeSlot | undefined>(undefined);

  useEffect(() => {
    setSelectedTiming(currentTiming);
  }, [currentTiming, medName]);

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

              <TouchableOpacity style={ms.destructiveBtn} onPress={handleHide}>
                <Text style={ms.destructiveTxt}>Remove from view</Text>
              </TouchableOpacity>

              <View style={ms.btnRow}>
                <TouchableOpacity style={ms.cancelBtn} onPress={onClose}>
                  <Text style={ms.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ms.addBtn} onPress={() => onSaveTiming(selectedTiming)}>
                  <Text style={ms.addBtnTxt}>Save Timing</Text>
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
                  style={[ms.dbRow, isAdded && { backgroundColor: Colors.primaryBg }, i === allRecommended.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => { Haptics.selectionAsync().catch(() => null); onToggle(supp.name); }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[ms.dbName, isAdded && { color: Colors.primary }]}>{supp.name}</Text>
                    <Text style={ms.dbDesc}>{supp.dose}</Text>
                  </View>
                  <View style={[ms.gradeBadge, { backgroundColor: isAdded ? Colors.primaryBg : Colors.surfaceElevated, minWidth: 28, alignItems: 'center' }]}>
                    <Text style={[ms.gradeTxt, { color: isAdded ? Colors.primary : Colors.onSurfaceMuted }]}>
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
              <Text style={ms.addBtnTxt}>+ Custom</Text>
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
  const [showRecommendedSheet, setShowRecommendedSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<ProtocolItem | null>(null);
  const [editingMed, setEditingMed] = useState<string | null>(null);

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

  // Medication timing is now set from EditMedicationSheet only
  function setMedTimeFromSheet(med: string, time: TimeSlot | undefined) {
    const newTimes = { ...protocol.medTimes };
    if (time === undefined) {
      delete newTimes[med];
    } else {
      newTimes[med] = time;
    }
    persist({ ...protocol, medTimes: newTimes });
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

  // Update a supplement item's personalDose/timing
  function updateSupplementItem(id: string, updates: Partial<Pick<ProtocolItem, 'personalDose' | 'timing'>>) {
    const supplements = protocol.supplements.map(s =>
      s.id === id ? { ...s, ...updates } : s,
    );
    persist({ ...protocol, supplements });
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
        <Text style={s.sectionLabel}>Medications</Text>
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
          const gradeBg = ({ A: Colors.primaryBg, B: Colors.warningBg, C: Colors.surfaceElevated } as const)[evidence];
          const gradeBdr = ({ A: Colors.primaryBorder, B: Colors.warningBorder, C: Colors.borderLight } as const)[evidence];
          const gradeClr = ({ A: Colors.primary, B: Colors.warning, C: Colors.onSurfaceMuted } as const)[evidence];
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
      <EditSupplementSheet
        visible={editingSupplement !== null}
        item={editingSupplement}
        onClose={() => setEditingSupplement(null)}
        onSave={updates => {
          if (editingSupplement) {
            updateSupplementItem(editingSupplement.id, updates);
          }
          setEditingSupplement(null);
        }}
      />
      <EditMedicationSheet
        visible={editingMed !== null}
        medName={editingMed}
        currentTiming={editingMed ? protocol.medTimes[editingMed] : undefined}
        onClose={() => setEditingMed(null)}
        onSaveTiming={t => {
          if (editingMed) setMedTimeFromSheet(editingMed, t);
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
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1 },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    padding: Spacing.base, paddingTop: Spacing.md,
  },
  heading: { fontSize: Typography.sizes.xxl, fontWeight: '300', color: Colors.onSurface },
  date: { fontSize: Typography.sizes.sm, color: Colors.onSurfaceMuted, marginTop: 2 },
  progressPill: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 0.5, borderColor: Colors.primaryBorder,
  },
  progressTxt: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.primary },

  // ── Section labels ───────────────────────────────────────────
  sectionLabel: {
    fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.onSurfaceMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
    paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base,
  },
  sectionHdrRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, marginTop: Spacing.base, marginBottom: Spacing.sm,
  },
  stackHdrTxt: {
    fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.onSurfaceMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  sectionAddBtn: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderWidth: 0.5, borderColor: Colors.primaryBorder,
  },
  sectionAddTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '600' },

  // ── Item card ────────────────────────────────────────────────
  itemCard: {
    marginHorizontal: Spacing.base, marginBottom: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl, borderWidth: 0.5, borderColor: Colors.borderLight,
    ...Elevation.sm, padding: Spacing.md, overflow: 'hidden',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  cardNameDone: { color: Colors.onSurfaceMuted, textDecorationLine: 'line-through' },
  cardSub: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, marginTop: 2 },

  // ── Check circle ─────────────────────────────────────────────
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkCircleOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkMark: { fontSize: 11, color: Colors.surface, fontWeight: '700' },
  checkPlaceholder: { width: 22, height: 22, flexShrink: 0 },

  // ── Grade + dose badges ──────────────────────────────────────
  badgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gradeBadge: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 0.5,
  },
  gradeBadgeTxt: { fontSize: 10, fontWeight: '700' },
  doseBadge: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.sm,
    borderWidth: 0.5, borderColor: Colors.borderLight, paddingHorizontal: 7, paddingVertical: 3,
  },
  doseBadgeTxt: { fontSize: 11, color: Colors.onSurface, fontWeight: '500' },

  // ── Remove button ────────────────────────────────────────────
  removeBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.borderLight,
  },
  removeTxt: { fontSize: 10, color: Colors.onSurfaceMuted },

  // ── Info chips (best time, food timing, personal timing) ─────
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  infoChip: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 8,
    borderWidth: 0.5, borderColor: Colors.borderLight, paddingHorizontal: 7, paddingVertical: 3,
  },
  infoChipTxt: { fontSize: 11, color: Colors.onSurfaceMuted, fontWeight: '500' },

  // ── Medication timing chip (read-only display) ───────────────
  timeChip: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.sm, backgroundColor: Colors.surfaceElevated,
    borderWidth: 0.5, borderColor: Colors.borderLight,
  },
  timeChipOn: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  timeChipTxt: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, fontWeight: '500' },
  timeChipTxtOn: { color: Colors.primary },

  // ── Conflict pill ────────────────────────────────────────────
  conflictPill: {
    marginTop: 8, backgroundColor: Colors.warningBg,
    borderRadius: Radius.sm, borderWidth: 0.5, borderColor: Colors.warningBorder,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  conflictPillTxt: { fontSize: 11, color: Colors.warningText, fontWeight: '500' },

  // ── Multi-dose rows ──────────────────────────────────────────
  multiDoseBlock: { marginTop: 10, gap: 4 },
  doseTrack: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 2 },
  checkSm: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkSmOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkSmTxt: { fontSize: 9, color: Colors.surface, fontWeight: '700' },
  doseTrackTxt: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  doseTrackDone: { color: Colors.onSurfaceMuted, textDecorationLine: 'line-through' },

  // ── Empty states ─────────────────────────────────────────────
  emptyCard: {
    marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    borderWidth: 0.5, borderColor: Colors.borderLight,
    ...Elevation.sm, padding: Spacing.md, gap: Spacing.sm,
  },
  emptyTxt: { fontSize: Typography.sizes.base, color: Colors.onSurfaceMuted },
  emptyCtaBtn: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 0.5, borderColor: Colors.primaryBorder, alignSelf: 'flex-start',
  },
  emptyCtaTxt: { fontSize: Typography.sizes.sm, color: Colors.primary, fontWeight: '500' },

  // ── Screen-level empty state ─────────────────────────────────
  emptyScreenCard: {
    marginHorizontal: Spacing.base, backgroundColor: Colors.surface,
    borderRadius: Radius.xl, borderWidth: 0.5, borderColor: Colors.borderLight,
    ...Elevation.sm, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.base, overflow: 'hidden',
  },
  emptyScreenHeadline: {
    fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.onSurface,
    textAlign: 'center', marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  emptyScreenSubtext: {
    fontSize: Typography.sizes.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg,
  },
  emptyScreenCta: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    minHeight: 44, height: 44, justifyContent: 'center', alignItems: 'center',
    alignSelf: 'stretch', paddingHorizontal: Spacing.base,
  },
  emptyScreenCtaTxt: { color: Colors.surface, fontSize: Typography.sizes.base, fontWeight: '600', textAlign: 'center' },

  // ── Library divider ──────────────────────────────────────────
  libDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.base, marginVertical: Spacing.lg },
});

// Modal styles
const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.base, paddingBottom: 40, maxHeight: '90%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.borderLight,
    alignSelf: 'center', marginBottom: Spacing.base,
  },
  sheetTitle: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.onSurface, marginBottom: Spacing.base },
  readOnlyName: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.onSurfaceMuted, marginBottom: Spacing.base },
  fieldLabel: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.onSurfaceMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: Spacing.sm }, /* intentional — no Spacing.* equivalent for marginBottom: 6 */
  required: { color: Colors.danger },
  input: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    fontSize: Typography.sizes.base, color: Colors.onSurface,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  notesInput: { height: 72, textAlignVertical: 'top' },
  dbResults: {
    marginTop: Spacing.xs, backgroundColor: Colors.surface,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderLight,
  },
  dbRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight,
  },
  dbName: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.onSurface },
  dbDesc: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, marginTop: 2 },
  gradeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm }, /* intentional — no Spacing.* equivalent */
  gradeTxt: { fontSize: Typography.sizes.xs, fontWeight: '700' },
  notFound: { fontSize: Typography.sizes.xs, color: Colors.onSurfaceMuted, marginTop: Spacing.xs, fontStyle: 'italic' },
  selectedBadge: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.md,
    padding: Spacing.sm, marginTop: Spacing.sm,
    borderWidth: 0.5, borderColor: Colors.primaryBorder,
  },
  selectedTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '500' },
  timingRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  timingChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  timingChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  timingTxt: { fontSize: Typography.sizes.sm, color: Colors.onSurfaceMuted, fontWeight: '500' },
  timingTxtActive: { color: Colors.primary },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.base },
  cancelBtn: {
    flex: 1, padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  cancelTxt: { fontSize: Typography.sizes.base, color: Colors.onSurfaceMuted, fontWeight: '500' },
  addBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center' },
  addBtnTxt: { fontSize: Typography.sizes.base, color: Colors.primaryBg, fontWeight: '600' },
  destructiveBtn: {
    padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.dangerBg, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.danger, marginTop: Spacing.base,
  },
  destructiveTxt: { fontSize: Typography.sizes.base, color: Colors.danger, fontWeight: '500' },
});
