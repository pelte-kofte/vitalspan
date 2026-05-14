import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import SupplementRow from '../components/SupplementRow';

interface UserProfile {
  name: string;
  goal: string;
  medications: string[];
}

type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

interface ProtocolState {
  medTimes: Record<string, TimeSlot>;
  addedSupplements: string[];
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
  { name: 'Vitamin D3',         dose: '2000 IU', evidence: 'A', goals: ['all'], dbId: 'vitamin_d3' },
  { name: 'Magnesium glycinate', dose: '400 mg',  evidence: 'A', goals: ['all'], dbId: 'magnesium_glycinate' },
  { name: 'Omega-3',            dose: '2 g',      evidence: 'A', goals: ['all'], dbId: 'omega3' },
];

const GOAL_SUPPLEMENTS: Supplement[] = [
  { name: 'NMN',        dose: '500 mg', evidence: 'B', goals: ['Extend lifespan', 'Slow biological aging'], dbId: 'nmn' },
  { name: 'Resveratrol', dose: '500 mg', evidence: 'B', goals: ['Extend lifespan', 'Slow biological aging'], dbId: 'resveratrol' },
  { name: 'CoQ10',       dose: '200 mg', evidence: 'B', goals: ['Optimize healthspan'],                      dbId: 'coq10' },
  { name: 'Berberine',   dose: '500 mg', evidence: 'B', goals: ['Optimize healthspan'],                      dbId: 'berberine' },
];

const TIME_SLOTS: { key: TimeSlot; label: string }[] = [
  { key: 'morning', label: 'AM' },
  { key: 'afternoon', label: 'PM' },
  { key: 'evening', label: 'Eve' },
  { key: 'night', label: 'Night' },
];

const EMPTY_PROTOCOL: ProtocolState = {
  medTimes: {},
  addedSupplements: [],
  taken: [],
  takenDate: '',
};

export default function ProtocolScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [protocol, setProtocol] = useState<ProtocolState>(EMPTY_PROTOCOL);
  const [expandedTimings, setExpandedTimings] = useState<Set<string>>(new Set());

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const [profileRaw, protocolRaw] = await Promise.all([
        AsyncStorage.getItem('@vitalspan_user_profile'),
        AsyncStorage.getItem('@vitalspan_protocol'),
      ]);
      if (profileRaw) setProfile(JSON.parse(profileRaw));
      if (protocolRaw) {
        const saved: ProtocolState = JSON.parse(protocolRaw);
        const today = new Date().toISOString().slice(0, 10);
        setProtocol(saved.takenDate === today ? saved : { ...saved, taken: [], takenDate: today });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function persist(next: ProtocolState) {
    setProtocol(next);
    try {
      await Promise.all([
        AsyncStorage.setItem('@vitalspan_protocol', JSON.stringify(next)),
        AsyncStorage.setItem('@vitalspan_protocol_today', JSON.stringify({
          date: next.takenDate,
          taken: next.taken,
        })),
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  function toggleTaken(name: string) {
    const today = new Date().toISOString().slice(0, 10);
    const taken = protocol.taken.includes(name)
      ? protocol.taken.filter(t => t !== name)
      : [...protocol.taken, name];
    persist({ ...protocol, taken, takenDate: today });
  }

  function setMedTime(med: string, time: TimeSlot) {
    const newTimes = { ...protocol.medTimes };
    if (newTimes[med] === time) {
      delete newTimes[med];
    } else {
      newTimes[med] = time;
    }
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

  const recommended = useMemo(() => {
    const goal = profile?.goal ?? '';
    return [...BASE_SUPPLEMENTS, ...GOAL_SUPPLEMENTS].filter(s =>
      s.goals.includes('all') || s.goals.some(g => g.toLowerCase() === goal.toLowerCase())
    );
  }, [profile?.goal]);

  const medications = profile?.medications ?? [];
  const addedSupps = recommended.filter(s => protocol.addedSupplements.includes(s.name));
  const totalItems = medications.length + addedSupps.length;
  const takenCount = protocol.taken.filter(t =>
    medications.includes(t) || addedSupps.some(s => s.name === t)
  ).length;
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

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

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>Medications</Text>
        <View style={s.card}>
          {medications.length === 0 ? (
            <Text style={s.emptyTxt}>Add medications in your profile to see them here</Text>
          ) : (
            medications.map((med, i) => {
              const taken = protocol.taken.includes(med);
              const time = protocol.medTimes[med];
              return (
                <View key={med} style={[s.medRow, i < medications.length - 1 && s.rowBorder]}>
                  <TouchableOpacity style={s.medLeft} onPress={() => toggleTaken(med)} activeOpacity={0.7}>
                    <View style={[s.dot, taken && s.dotTaken]} />
                    <View>
                      <Text style={[s.medName, taken && s.nameTaken]}>{med}</Text>
                      {time && <Text style={s.medTimeLbl}>{time.charAt(0).toUpperCase() + time.slice(1)}</Text>}
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

        <View style={s.suppSectionHdr}>
          <Text style={s.suppSectionTitle}>Recommended Supplements</Text>
          {profile?.goal && <Text style={s.goalLbl}>Based on: {profile.goal}</Text>}
        </View>
        <View style={s.card}>
          {recommended.map((supp, i) => (
            <SupplementRow
              key={supp.name}
              supp={supp}
              isAdded={protocol.addedSupplements.includes(supp.name)}
              isTaken={protocol.taken.includes(supp.name)}
              isExpanded={expandedTimings.has(supp.name)}
              medications={medications}
              showBorder={i < recommended.length - 1}
              onToggleTaken={() => toggleTaken(supp.name)}
              onToggle={() => toggleSupplement(supp.name)}
              onToggleExpanded={() => toggleExpanded(supp.name)}
            />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: Spacing.base,
    paddingTop: Spacing.md,
  },
  heading: { fontSize: Typography.sizes.xxl, fontWeight: '300', color: Colors.textPrimary },
  date: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 2 },
  progressPill: {
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 0.5,
    borderColor: Colors.primaryBorder,
  },
  progressTxt: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.primary },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  suppSectionHdr: { paddingHorizontal: Spacing.base, marginTop: Spacing.base, marginBottom: Spacing.sm },
  suppSectionTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  goalLbl: { fontSize: Typography.sizes.xs, color: Colors.primaryLight, marginTop: 3 },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    padding: Spacing.md,
  },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  emptyTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted, paddingVertical: Spacing.xs },
  medRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm },
  medLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  medName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  nameTaken: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  medTimeLbl: { fontSize: Typography.sizes.xs, color: Colors.primaryLight, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  dotTaken: { backgroundColor: Colors.primaryLight },
  timeRow: { flexDirection: 'row', gap: 4 },
  timeChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  timeChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  timeChipTxt: { fontSize: 9, color: Colors.textMuted, fontWeight: '500' },
  timeChipTxtActive: { color: Colors.primary },
});
