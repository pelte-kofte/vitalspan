import React, { useState, useMemo, useCallback } from 'react';
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

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface UserProfile {
  name: string;
  goal: string;
  medications: string[];
}

type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface CustomSupplement {
  id: string;
  name: string;
  dose: string;
  timing?: TimeSlot;
  notes?: string;
  addedAt: string;
}

interface ProtocolState {
  medTimes: Record<string, TimeSlot>;
  addedSupplements: string[];
  customSupplements: CustomSupplement[];
  taken: string[];
  takenDate: string;
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

const CATEGORY_LABELS: Record<string, string> = {
  nad: 'NAD+ Pathway', mitochondrial: 'Mitochondrial', cardiovascular: 'Cardiovascular',
  metabolic: 'Metabolic', antioxidant: 'Antioxidant', mineral: 'Mineral',
  vitamin: 'Vitamin', sleep: 'Sleep Support', adaptogen: 'Adaptogen',
  amino_acid: 'Amino Acid', nootropic: 'Nootropic', senolytic: 'Senolytic',
  prescription_only: 'Prescription', other: 'Other',
};
const TIMING_LABELS: Record<string, string> = {
  fasted: 'Fasted', with_meal: 'With meal', with_fat: 'With fat',
  flexible: 'Flexible', bedtime: 'Bedtime',
};
const BEST_TIME_LABELS: Record<string, string> = {
  morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening',
  bedtime: 'Bedtime', anytime: 'Anytime',
};

const EMPTY_PROTOCOL: ProtocolState = {
  medTimes: {},
  addedSupplements: [],
  customSupplements: [],
  taken: [],
  takenDate: '',
};

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

// ── Add Supplement Sheet (recommended picker + custom entry point) ────────────
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
  const [expandedTimings, setExpandedTimings] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecommendedSheet, setShowRecommendedSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileRaw, protocolRaw] = await Promise.all([
        AsyncStorage.getItem('@vitalspan_user_profile'),
        AsyncStorage.getItem('@vitalspan_protocol'),
      ]);
      if (profileRaw) setProfile(JSON.parse(profileRaw));
      if (protocolRaw) {
        const saved: ProtocolState = JSON.parse(protocolRaw);
        const today = new Date().toISOString().slice(0, 10);
        setProtocol({
          ...EMPTY_PROTOCOL,
          ...saved,
          medTimes: saved.medTimes ?? {},
          addedSupplements: saved.addedSupplements ?? [],
          customSupplements: saved.customSupplements ?? [],
          taken: saved.takenDate === today ? (saved.taken ?? []) : [],
          takenDate: today,
        });
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

  function setMedTime(med: string, time: TimeSlot) {
    const newTimes = { ...protocol.medTimes };
    if (newTimes[med] === time) delete newTimes[med];
    else newTimes[med] = time;
    persist({ ...protocol, medTimes: newTimes });
  }

  function toggleExpanded(name: string) {
    setExpandedTimings(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  function toggleSupplement(name: string) {
    const isAdded = protocol.addedSupplements.includes(name);
    const addedSupplements = isAdded
      ? protocol.addedSupplements.filter(s => s !== name)
      : [...protocol.addedSupplements, name];
    const taken = isAdded ? protocol.taken.filter(t => t !== name) : protocol.taken;
    persist({ ...protocol, addedSupplements, taken });
  }

  function addCustomSupplement(s: CustomSupplement) {
    const nameLower = s.name.toLowerCase().trim();
    const allNames = [
      ...protocol.addedSupplements.map(n => n.toLowerCase()),
      ...(protocol.customSupplements ?? []).map(cs => cs.name.toLowerCase()),
    ];
    if (allNames.includes(nameLower)) {
      Alert.alert('Already in your stack', `${s.name} is already in your supplement stack.`);
      return;
    }
    const customSupplements = [...(protocol.customSupplements ?? []), s];
    persist({ ...protocol, customSupplements });
  }

  function removeCustomSupplement(id: string) {
    Alert.alert('Remove supplement?', 'This will remove it from your stack.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const customSupplements = protocol.customSupplements.filter(s => s.id !== id);
          const taken = protocol.taken.filter(t => t !== id);
          persist({ ...protocol, customSupplements, taken });
        },
      },
    ]);
  }

  const recommended = useMemo(() => {
    const goal = profile?.goal ?? '';
    return [...BASE_SUPPLEMENTS, ...GOAL_SUPPLEMENTS].filter(s =>
      s.goals.includes('all') || s.goals.some(g => g.toLowerCase() === goal.toLowerCase())
    );
  }, [profile?.goal]);

  const medications = profile?.medications ?? [];

  // Build inline interaction map for medications
  const medInteractionMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const med of medications) {
      const medLower = med.toLowerCase();
      const conflicts: string[] = [];
      for (const inter of INTERACTIONS) {
        if (medLower.includes(inter.drug.toLowerCase())) {
          // Check if user has this supplement added
          const allAdded = [
            ...protocol.addedSupplements,
            ...(protocol.customSupplements ?? []).map(cs => cs.name),
          ];
          if (allAdded.some(s => s.toLowerCase().includes(inter.supplement.toLowerCase()))) {
            conflicts.push(inter.supplement);
          }
        }
      }
      // Also check drug class from medications database
      const drugEntry = MEDICATION_DATABASE.find(m =>
        m.genericName.toLowerCase() === medLower ||
        m.brandNames.some(b => b.toLowerCase() === medLower),
      );
      if (drugEntry) {
        for (const inter of INTERACTIONS) {
          if (inter.drug.toLowerCase() === drugEntry.drugClass.toLowerCase()) {
            const allAdded = [
              ...protocol.addedSupplements,
              ...(protocol.customSupplements ?? []).map(cs => cs.name),
            ];
            if (allAdded.some(s => s.toLowerCase().includes(inter.supplement.toLowerCase()))) {
              if (!conflicts.includes(inter.supplement)) conflicts.push(inter.supplement);
            }
          }
        }
      }
      if (conflicts.length > 0) map[med] = conflicts;
    }
    return map;
  }, [medications, protocol.addedSupplements, protocol.customSupplements]);

  // Drug class labels from medications database
  const medClassMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const med of medications) {
      const medLower = med.toLowerCase();
      const drugEntry = MEDICATION_DATABASE.find(m =>
        m.genericName.toLowerCase() === medLower ||
        m.brandNames.some(b => b.toLowerCase() === medLower),
      );
      if (drugEntry?.drugClass) map[med] = drugEntry.drugClass;
    }
    return map;
  }, [medications]);

  const addedSupps = protocol.addedSupplements.map(name => {
    const dbEntry = SUPPLEMENT_DATABASE.find(s => s.name.toLowerCase() === name.toLowerCase());
    return dbEntry
      ? { name: dbEntry.name, dose: dbEntry.defaultDose, evidence: dbEntry.evidenceGrade as 'A' | 'B' | 'C', goals: [] as string[], dbId: dbEntry.id, dbInfo: dbEntry as SupplementInfo }
      : { name, dose: '—', evidence: 'C' as const, goals: [] as string[], dbId: undefined, dbInfo: undefined };
  });
  const customSupps = protocol.customSupplements ?? [];

  const groupedSupps = useMemo(() => {
    const order: string[] = [];
    const groups = new Map<string, typeof addedSupps[number][]>();
    for (const supp of addedSupps) {
      const cat = supp.dbInfo?.category ?? 'other';
      if (!groups.has(cat)) { groups.set(cat, []); order.push(cat); }
      groups.get(cat)!.push(supp);
    }
    return { order, groups };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol.addedSupplements]);

  // Total doses: medications count as 1 each; multi-dose supplements count their full dose count
  const totalItems =
    medications.length +
    addedSupps.reduce((sum, s) => sum + parseDoseCount(s.dose), 0) +
    customSupps.length;

  const takenCount = protocol.taken.filter(t => {
    if (medications.includes(t)) return true;
    if (customSupps.some(cs => cs.id === t || cs.name === t)) return true;
    // Multi-dose supplement dose IDs: "{name}_dose_{n}"
    for (const s of addedSupps) {
      const count = parseDoseCount(s.dose);
      for (let i = 0; i < count; i++) {
        if (t === doseId(s.name, i)) return true;
      }
      // Fallback: old-style single-dose ID
      if (count === 1 && t === s.name) return true;
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
        {medications.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTxt}>No medications in your profile</Text>
            <TouchableOpacity style={s.emptyCtaBtn} onPress={() => nav.navigate('Profile')}>
              <Text style={s.emptyCtaTxt}>Go to Profile →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          medications.map(med => {
            const taken = protocol.taken.includes(med);
            const time = protocol.medTimes[med];
            const conflicts = medInteractionMap[med] ?? [];
            const drugClass = medClassMap[med];
            return (
              <View key={med} style={s.itemCard}>
                <TouchableOpacity style={s.cardRow} onPress={() => toggleTaken(med)} activeOpacity={0.75}>
                  <View style={[s.checkCircle, taken && s.checkCircleOn]}>
                    {taken && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <View style={s.cardBody}>
                    <Text style={[s.cardName, taken && s.cardNameDone]}>{med}</Text>
                    {drugClass && <Text style={s.cardSub}>{drugClass}</Text>}
                  </View>
                  {drugClass && (
                    <View style={s.classChip}>
                      <Text style={s.classChipTxt} numberOfLines={1}>{drugClass}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {conflicts.length > 0 && (
                  <TouchableOpacity style={s.conflictPill} onPress={() => nav.navigate('InteractionChecker')}>
                    <Text style={s.conflictPillTxt}>⚠ Interacts with {conflicts.join(', ')} — tap to review</Text>
                  </TouchableOpacity>
                )}

                <View style={s.cardFooter}>
                  <Text style={s.footerLabel}>When</Text>
                  <View style={s.chipRow}>
                    {TIME_SLOTS.map(slot => (
                      <TouchableOpacity
                        key={slot.key}
                        style={[s.timeChip, time === slot.key && s.timeChipOn]}
                        onPress={() => setMedTime(med, slot.key)}
                      >
                        <Text style={[s.timeChipTxt, time === slot.key && s.timeChipTxtOn]}>{slot.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
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

        {addedSupps.length === 0 && customSupps.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyTxt}>No supplements in your stack yet</Text>
          </View>
        )}

        {groupedSupps.order.map(cat => (
          <View key={cat}>
            <Text style={s.catLabel}>{CATEGORY_LABELS[cat] ?? cat}</Text>
            {groupedSupps.groups.get(cat)!.map(supp => {
              const doseCount = parseDoseCount(supp.dose);
              const timeLabels = getDoseTimeLabels(doseCount);
              const singleTaken = doseCount === 1 &&
                (protocol.taken.includes(doseId(supp.name, 0)) || protocol.taken.includes(supp.name));
              const gradeBg = ({ A: Colors.primaryBg, B: Colors.warningBg, C: Colors.surfaceElevated } as const)[supp.evidence];
              const gradeBdr = ({ A: Colors.primaryBorder, B: Colors.warningBorder, C: Colors.borderLight } as const)[supp.evidence];
              const gradeClr = ({ A: Colors.primary, B: Colors.warning, C: Colors.onSurfaceMuted } as const)[supp.evidence];
              return (
                <View key={supp.name} style={s.itemCard}>
                  <View style={s.cardRow}>
                    {doseCount === 1 ? (
                      <TouchableOpacity onPress={() => toggleTaken(doseId(supp.name, 0))} activeOpacity={0.7}>
                        <View style={[s.checkCircle, singleTaken && s.checkCircleOn]}>
                          {singleTaken && <Text style={s.checkMark}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={s.checkPlaceholder} />
                    )}
                    <View style={s.cardBody}>
                      <Text style={[s.cardName, singleTaken && s.cardNameDone]}>{supp.name}</Text>
                      {supp.dbInfo?.shortDescription && (
                        <Text style={s.cardSub} numberOfLines={1}>{supp.dbInfo.shortDescription}</Text>
                      )}
                    </View>
                    <View style={s.badgeGroup}>
                      <View style={[s.gradeBadge, { backgroundColor: gradeBg, borderColor: gradeBdr }]}>
                        <Text style={[s.gradeBadgeTxt, { color: gradeClr }]}>{supp.evidence}</Text>
                      </View>
                      {supp.dose !== '—' && (
                        <View style={s.doseBadge}>
                          <Text style={s.doseBadgeTxt}>{supp.dose}</Text>
                        </View>
                      )}
                      <TouchableOpacity style={s.removeBtn} onPress={() => toggleSupplement(supp.name)}>
                        <Text style={s.removeTxt}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {(supp.dbInfo?.bestTime || supp.dbInfo?.timing) && (
                    <View style={s.infoRow}>
                      {supp.dbInfo.bestTime && supp.dbInfo.bestTime !== 'anytime' && (
                        <View style={s.infoChip}>
                          <Text style={s.infoChipTxt}>{BEST_TIME_LABELS[supp.dbInfo.bestTime]}</Text>
                        </View>
                      )}
                      {supp.dbInfo.timing && supp.dbInfo.timing !== 'flexible' && (
                        <View style={s.infoChip}>
                          <Text style={s.infoChipTxt}>{TIMING_LABELS[supp.dbInfo.timing]}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {doseCount > 1 && (
                    <View style={s.multiDoseBlock}>
                      {timeLabels.map((label, n) => {
                        const id = doseId(supp.name, n);
                        const dt = protocol.taken.includes(id);
                        return (
                          <TouchableOpacity key={id} style={s.doseTrack} onPress={() => toggleTaken(id)} activeOpacity={0.7}>
                            <View style={[s.checkSm, dt && s.checkSmOn]}>
                              {dt && <Text style={s.checkSmTxt}>✓</Text>}
                            </View>
                            <Text style={[s.doseTrackTxt, dt && s.doseTrackDone]}>{label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {customSupps.length > 0 && (
          <View>
            <Text style={s.catLabel}>Custom</Text>
            {customSupps.map(cs => {
              const taken = protocol.taken.includes(cs.id) || protocol.taken.includes(cs.name);
              const timingLabel = cs.timing ? TIME_SLOTS.find(t => t.key === cs.timing)?.label : null;
              return (
                <View key={cs.id} style={s.itemCard}>
                  <View style={s.cardRow}>
                    <TouchableOpacity onPress={() => toggleTaken(cs.id)} activeOpacity={0.7}>
                      <View style={[s.checkCircle, taken && s.checkCircleOn]}>
                        {taken && <Text style={s.checkMark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                    <View style={s.cardBody}>
                      <Text style={[s.cardName, taken && s.cardNameDone]}>{cs.name}</Text>
                      {cs.notes && <Text style={s.cardSub} numberOfLines={1}>{cs.notes}</Text>}
                    </View>
                    <View style={s.badgeGroup}>
                      {cs.dose !== '—' && (
                        <View style={s.doseBadge}>
                          <Text style={s.doseBadgeTxt}>{cs.dose}</Text>
                        </View>
                      )}
                      {timingLabel && (
                        <View style={[s.timeChip, s.timeChipOn]}>
                          <Text style={[s.timeChipTxt, s.timeChipTxtOn]}>{timingLabel}</Text>
                        </View>
                      )}
                      <TouchableOpacity style={s.removeBtn} onPress={() => removeCustomSupplement(cs.id)}>
                        <Text style={s.removeTxt}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Supplement Library ────────────────────────────────── */}
        <View style={s.libDivider} />
        <Text style={s.sectionLabel}>Supplement Library</Text>
        <SupplementLibrarySection
          addedSupplements={protocol.addedSupplements}
          onToggle={toggleSupplement}
        />

        <View style={{ height: 32 }} />
      </ScrollView>

      <AddSupplementSheet
        visible={showRecommendedSheet}
        onClose={() => setShowRecommendedSheet(false)}
        goal={profile?.goal ?? ''}
        addedSupplements={protocol.addedSupplements}
        onToggle={toggleSupplement}
        onOpenCustom={() => setShowAddModal(true)}
      />
      <AddCustomSupplementModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addCustomSupplement}
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
  catLabel: {
    fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.onSurfaceMuted,
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: Spacing.base, marginTop: Spacing.sm, marginBottom: 6,
  },

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

  // ── Info chips (best time, food timing) ──────────────────────
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  infoChip: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 8,
    borderWidth: 0.5, borderColor: Colors.borderLight, paddingHorizontal: 7, paddingVertical: 3,
  },
  infoChipTxt: { fontSize: 11, color: Colors.onSurfaceMuted, fontWeight: '500' },

  // ── Drug class chip ──────────────────────────────────────────
  classChip: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 8,
    borderWidth: 0.5, borderColor: Colors.borderLight,
    paddingHorizontal: 7, paddingVertical: 3, maxWidth: 120,
  },
  classChipTxt: { fontSize: 11, color: Colors.onSurfaceMuted, fontWeight: '500' },

  // ── Medication timing row ────────────────────────────────────
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 10 },
  footerLabel: {
    fontSize: 11, fontWeight: '600', color: Colors.onSurfaceMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, width: 36,
  },
  chipRow: { flexDirection: 'row', gap: 5, flex: 1 },
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
});
