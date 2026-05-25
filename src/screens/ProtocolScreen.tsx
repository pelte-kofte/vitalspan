import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
  Modal, TextInput, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { INTERACTIONS } from '../data/biomarkers';
import { SUPPLEMENT_DATABASE, SupplementInfo } from '../data/supplementTimings';
import { MEDICATION_DATABASE } from '../data/medications';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
}

const BASE_SUPPLEMENTS: Supplement[] = [
  { name: 'Vitamin D3',          dose: '2000 IU', evidence: 'A', goals: ['all'],                             dbId: 'vitamin_d3' },
  { name: 'Magnesium glycinate',  dose: '400 mg',  evidence: 'A', goals: ['all'],                             dbId: 'magnesium_glycinate' },
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
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <View style={ms.handle} />
          <Text style={ms.sheetTitle}>Add Supplement</Text>

          <Text style={ms.fieldLabel}>Search database</Text>
          <TextInput
            style={ms.input}
            placeholder="Search Berberine, Quercetin, NMN…"
            placeholderTextColor={Colors.textMuted}
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
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            editable={!selectedDb}
          />

          <Text style={ms.fieldLabel}>Dose</Text>
          <TextInput
            style={ms.input}
            placeholder="e.g. 500mg, 2 capsules"
            placeholderTextColor={Colors.textMuted}
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
            placeholderTextColor={Colors.textMuted}
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
      </View>
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
                  <View style={[ms.gradeBadge, { backgroundColor: isAdded ? Colors.primaryBg : Colors.bgSecondary, minWidth: 28, alignItems: 'center' }]}>
                    <Text style={[ms.gradeTxt, { color: isAdded ? Colors.primary : Colors.textMuted }]}>
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
  }, []);

  useFocusEffect(useCallback(() => { loadData().catch(console.error); }, [loadData]));

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

  const addedSupps = recommended.filter(s => protocol.addedSupplements.includes(s.name));
  const customSupps = protocol.customSupplements ?? [];

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
        {/* Screen-level empty state — shown only when there are no items at all */}
        {totalItems === 0 && (
          <View style={s.emptyScreenCard}>
            <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: Spacing.md }}>💊</Text>
            <Text style={s.emptyScreenHeadline}>Build your longevity stack</Text>
            <Text style={s.emptyScreenSubtext}>
              Add your medications and pharmacist-curated supplements to track your daily protocol and check for interactions.
            </Text>
            <TouchableOpacity
              style={s.emptyScreenCta}
              onPress={() => setShowRecommendedSheet(true)}
              activeOpacity={0.8}
            >
              <Text style={s.emptyScreenCtaTxt}>Get started →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Medications section */}
        <Text style={s.sectionLabel}>Medications</Text>
        <View style={s.card}>
          {medications.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyTxt}>No medications in your profile</Text>
              <TouchableOpacity
                style={s.emptyCtaBtn}
                onPress={() => nav.navigate('Profile' as never)}
              >
                <Text style={s.emptyCtaTxt}>Go to Profile →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            medications.map((med, i) => {
              const taken = protocol.taken.includes(med);
              const time = protocol.medTimes[med];
              const conflicts = medInteractionMap[med] ?? [];
              const drugClass = medClassMap[med];
              return (
                <View key={med} style={[s.medRow, i < medications.length - 1 && s.rowBorder]}>
                  <TouchableOpacity style={s.medLeft} onPress={() => toggleTaken(med)} activeOpacity={0.7}>
                    <View style={[s.dot, taken && s.dotTaken]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.medName, taken && s.nameTaken]}>{med}</Text>
                      {drugClass && <Text style={s.medClass}>{drugClass}</Text>}
                      {time && <Text style={s.medTimeLbl}>{time.charAt(0).toUpperCase() + time.slice(1)}</Text>}
                      {conflicts.length > 0 && (
                        <TouchableOpacity
                          style={s.conflictRow}
                          onPress={() => nav.navigate('InteractionChecker')}
                        >
                          <Text style={s.conflictTxt}>
                            ⚠ Conflicts with {conflicts.join(', ')} — tap to review
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={s.timeRow}>
                    {TIME_SLOTS.map(slot => (
                      <TouchableOpacity
                        key={slot.key}
                        style={[s.timeChip, time === slot.key && s.timeChipActive]}
                        onPress={() => setMedTime(med, slot.key)}
                      >
                        <Text style={[s.timeChipTxt, time === slot.key && s.timeChipTxtActive]}>
                          {slot.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Your Stack — recommended-added + custom supplements */}
        <Text style={s.sectionLabel}>Your Stack</Text>
        <View style={s.card}>
          {addedSupps.length === 0 && customSupps.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyTxt}>No supplements in your stack yet</Text>
            </View>
          ) : null}

          {/* Recommended supplements that are added */}
          {addedSupps.map((supp, i) => {
            const doseCount = parseDoseCount(supp.dose);
            const timeLabels = getDoseTimeLabels(doseCount);
            const isLast = i === addedSupps.length - 1 && customSupps.length === 0;
            return (
              <View key={supp.name}>
                <View style={[s.medRow, !isLast && s.rowBorder]}>
                  <View style={[s.medLeft, { flex: 1 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.medName}>{supp.name}</Text>
                      <Text style={s.medClass}>{supp.dose} · Grade {supp.evidence}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={s.removeBtn} onPress={() => toggleSupplement(supp.name)}>
                    <Text style={s.removeTxt}>✕</Text>
                  </TouchableOpacity>
                </View>
                {doseCount === 1 ? (
                  <TouchableOpacity
                    style={[s.doseRow, { paddingLeft: Spacing.md, marginBottom: 4 }]}
                    onPress={() => toggleTaken(doseId(supp.name, 0))}
                    activeOpacity={0.7}
                  >
                    {(() => {
                      const taken = protocol.taken.includes(doseId(supp.name, 0)) || protocol.taken.includes(supp.name);
                      return <>
                        <View style={[s.dot, taken && s.dotTaken]} />
                        <Text style={[s.doseLbl, taken && s.doseLblTaken]}>Mark taken</Text>
                        <Text style={[s.doseTick, taken && s.doseTickDone]}>{taken ? '✓' : '○'}</Text>
                      </>;
                    })()}
                  </TouchableOpacity>
                ) : (
                  <View style={s.doseRows}>
                    {timeLabels.map((label, n) => {
                      const id = doseId(supp.name, n);
                      const taken = protocol.taken.includes(id);
                      return (
                        <TouchableOpacity key={id} style={s.doseRow} onPress={() => toggleTaken(id)} activeOpacity={0.7}>
                          <View style={[s.dot, taken && s.dotTaken]} />
                          <Text style={[s.doseLbl, taken && s.doseLblTaken]}>{label}</Text>
                          <Text style={[s.doseTick, taken && s.doseTickDone]}>{taken ? '✓' : '○'}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}

          {/* Custom supplements */}
          {customSupps.map((cs, i) => {
            const taken = protocol.taken.includes(cs.id) || protocol.taken.includes(cs.name);
            return (
              <View key={cs.id} style={[s.medRow, i < customSupps.length - 1 && s.rowBorder]}>
                <TouchableOpacity style={s.medLeft} onPress={() => toggleTaken(cs.id)} activeOpacity={0.7}>
                  <View style={[s.dot, taken && s.dotTaken]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.medName, taken && s.nameTaken]}>{cs.name}</Text>
                    <Text style={s.medClass}>{cs.dose}{cs.timing ? ` · ${cs.timing}` : ''}</Text>
                    {cs.notes ? <Text style={s.medTimeLbl}>{cs.notes}</Text> : null}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={s.removeBtn} onPress={() => removeCustomSupplement(cs.id)}>
                  <Text style={s.removeTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Add supplement button */}
        <TouchableOpacity
          style={s.addStackBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
            setShowRecommendedSheet(true);
          }}
        >
          <Text style={s.addStackIcon}>+</Text>
          <Text style={s.addStackTxt}>Add supplement</Text>
        </TouchableOpacity>

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
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    padding: Spacing.base, paddingTop: Spacing.md,
  },
  heading: { fontSize: Typography.sizes.xxl, fontWeight: '300', color: Colors.textPrimary },
  date: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 2 },
  progressPill: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 0.5, borderColor: Colors.primaryBorder,
  },
  progressTxt: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.primary },
  sectionLabel: {
    fontSize: 11, fontWeight: '500', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
    paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.base,
  },
  suppSectionHdr: { paddingHorizontal: Spacing.base, marginTop: Spacing.base, marginBottom: Spacing.sm },
  suppSectionTitle: {
    fontSize: 11, fontWeight: '500', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  goalLbl: { fontSize: Typography.sizes.xs, color: Colors.primaryLight, marginTop: 3 },
  card: {
    marginHorizontal: Spacing.base, backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, padding: Spacing.md,
  },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  emptyState: { paddingVertical: Spacing.sm, gap: Spacing.sm },
  emptyTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted, paddingVertical: Spacing.xs },
  emptyCtaBtn: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 0.5, borderColor: Colors.primaryBorder, alignSelf: 'flex-start',
  },
  emptyCtaTxt: { fontSize: Typography.sizes.sm, color: Colors.primary, fontWeight: '500' },
  medRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: Spacing.sm, gap: Spacing.sm },
  medLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  medName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  nameTaken: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  medClass: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  medTimeLbl: { fontSize: Typography.sizes.xs, color: Colors.primaryLight, marginTop: 2 },
  conflictRow: {
    marginTop: 4, backgroundColor: Colors.warningBg,
    borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderWidth: 0.5, borderColor: Colors.warningBorder, alignSelf: 'flex-start',
  },
  conflictTxt: { fontSize: 10, color: Colors.warningText, fontWeight: '500' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border, marginTop: 4 },
  dotTaken: { backgroundColor: Colors.primaryLight },
  timeRow: { flexDirection: 'row', gap: 4, flexShrink: 0, marginTop: 4 },
  timeChip: {
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.sm,
    backgroundColor: Colors.bgSecondary, borderWidth: 0.5, borderColor: Colors.border,
  },
  timeChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  timeChipTxt: { fontSize: 9, color: Colors.textMuted, fontWeight: '500' },
  timeChipTxtActive: { color: Colors.primary },
  removeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.bgSecondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.border, marginTop: 2,
  },
  removeTxt: { fontSize: 11, color: Colors.textMuted },
  addCustomBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, paddingTop: Spacing.base,
    borderTopWidth: 0.5, borderTopColor: Colors.border, marginTop: Spacing.sm,
  },
  addCustomIcon: { fontSize: 20, color: Colors.primaryLight, width: 22, textAlign: 'center' },
  addCustomTxt: { fontSize: Typography.sizes.base, color: Colors.primaryLight, fontWeight: '500' },
  addStackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.base, marginTop: Spacing.sm,
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.primaryBorder,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  addStackIcon: { fontSize: 20, color: Colors.primary, width: 22, textAlign: 'center', fontWeight: '300' },
  addStackTxt: { fontSize: Typography.sizes.base, color: Colors.primary, fontWeight: '500' },

  // Screen-level empty state (totalItems === 0)
  emptyScreenCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  emptyScreenHeadline: {
    fontSize: Typography.sizes.h3,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyScreenSubtext: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  emptyScreenCta: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  emptyScreenCtaTxt: {
    color: Colors.primaryBg,
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Multi-dose supplement rows
  doseRows: { marginLeft: 18, marginBottom: Spacing.sm, gap: 2 },
  doseRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 5 },
  doseLbl: { flex: 1, fontSize: Typography.sizes.xs, color: Colors.textSecondary },
  doseLblTaken: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  doseTick: { fontSize: Typography.sizes.xs, color: Colors.border, width: 16, textAlign: 'center' },
  doseTickDone: { color: Colors.primaryLight },
});

// Modal styles
const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.base, paddingBottom: 40, maxHeight: '90%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: Spacing.base,
  },
  sheetTitle: { fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.base },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: Spacing.sm },
  required: { color: Colors.danger },
  input: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    fontSize: Typography.sizes.base, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
  notesInput: { height: 72, textAlignVertical: 'top' },
  dbResults: {
    marginTop: Spacing.xs, backgroundColor: Colors.bgCard,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
  },
  dbRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  dbName: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.textPrimary },
  dbDesc: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  gradeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  gradeTxt: { fontSize: 10, fontWeight: '700' },
  notFound: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: Spacing.xs, fontStyle: 'italic' },
  selectedBadge: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.md,
    padding: Spacing.sm, marginTop: Spacing.sm,
    borderWidth: 0.5, borderColor: Colors.primaryBorder,
  },
  selectedTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '500' },
  timingRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  timingChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, backgroundColor: Colors.bgSecondary,
    borderWidth: 1, borderColor: Colors.border,
  },
  timingChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  timingTxt: { fontSize: Typography.sizes.sm, color: Colors.textMuted, fontWeight: '500' },
  timingTxtActive: { color: Colors.primary },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.base },
  cancelBtn: {
    flex: 1, padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.bgSecondary, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cancelTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted, fontWeight: '500' },
  addBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center' },
  addBtnTxt: { fontSize: Typography.sizes.base, color: Colors.primaryBg, fontWeight: '600' },
});
