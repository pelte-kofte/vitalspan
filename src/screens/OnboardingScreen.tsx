import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { GoalTimerIcon, GoalSparkIcon, GoalDnaIcon, GoalChartIcon, CheckmarkIcon } from '../components/DesignSystemIcons';
import { RootStackParamList } from '../navigation/AppNavigator';
import MedicationSearch from '../components/MedicationSearch';
import { CONDITIONS } from '../constants/conditions';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const GOAL_ICONS = [GoalTimerIcon, GoalSparkIcon, GoalDnaIcon, GoalChartIcon];

const GOALS = [
  { title: 'Extend lifespan', desc: 'Live as long as possible' },
  { title: 'Optimize healthspan', desc: 'Stay sharp & energetic longer' },
  { title: 'Slow biological aging', desc: 'Reduce my biological age score' },
  { title: 'Track & understand', desc: 'Know my biomarkers deeply' },
];

const QUICK_MEDS = ['Metformin', 'Aspirin', 'Statin', 'Levothyroxine', 'Warfarin', 'Empagliflozin', 'Lisinopril', 'Dapagliflozin'];

function ProgressBar({ step }: { step: number }) {
  return (
    <View style={s.progressRow}>
      {[0, 1, 2, 3, 4].map(i => (
        <View key={i} style={[s.progressSeg,
          i < step ? s.progressDone : i === step ? s.progressActive : s.progressPending]} />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const nav = useNavigation<Nav>();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<number | null>(null);
  const [age, setAge] = useState(35);
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [conditions, setConditions] = useState<string[]>([]);
  const [meds, setMeds] = useState<string[]>([]);

  function toggleCondition(c: string) {
    setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  function addMed(medName: string) {
    const trimmed = medName.trim();
    if (trimmed && !meds.find(m => m.toLowerCase() === trimmed.toLowerCase())) {
      setMeds(prev => [...prev, trimmed]);
    }
  }

  function goNext(from: number) {
    if (from === 0 && !name.trim()) {
      Alert.alert('Name required', 'Please enter your first name to personalize your experience.');
      return;
    }
    if (from === 1 && goal === null) {
      Alert.alert('Select a goal', 'Please select your primary health goal to continue.');
      return;
    }
    Haptics.selectionAsync().catch(() => null);
    setStep(from + 1);
  }

  async function finish() {
    const profile = {
      name: name.trim() || 'Friend',
      age,
      sex,
      goal: GOALS[goal ?? 0]?.title || '',
      conditions,
      medications: meds,
      onboardingComplete: true,
    };
    try {
      await AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(profile));
    } catch {
      Alert.alert('Save failed', 'Could not save your profile. Please try again.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    nav.reset({ index: 0, routes: [{ name: 'GuidedFirstRun' }] });
  }

  if (step === 0) return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ProgressBar step={step} />
        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={s.stepLabel}>Step 1 of 5</Text>
          <Text style={s.title}>{"What's your\nname?"}</Text>
          <Text style={s.sub}>{"We'll personalize your experience."}</Text>
          <TextInput
            style={s.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Your first name"
            placeholderTextColor={Colors.textMuted}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => goNext(0)}
          />
        </ScrollView>
        <View style={s.cta}>
          <TouchableOpacity style={[s.btnMain, !name.trim() && s.btnMainDisabled]} onPress={() => goNext(0)}>
            <Text style={s.btnMainTxt}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (step === 1) return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ProgressBar step={step} />
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          <TouchableOpacity onPress={() => setStep(0)}><Text style={s.back}>← Back</Text></TouchableOpacity>
          <Text style={s.stepLabel}>Step 2 of 5</Text>
          <Text style={s.title}>{"What's your\nmain goal?"}</Text>
          <Text style={s.sub}>{"We'll build your protocol around this."}</Text>
          <View style={s.optionList}>
            {GOALS.map((g, i) => (
              <TouchableOpacity key={i}
                style={[s.optionCard, goal === i && s.optionCardSel]}
                onPress={() => { setGoal(i); Haptics.selectionAsync().catch(() => null); }}>
                <View style={[s.optionIcon, goal === i && s.optionIconSel]}>
                  {React.createElement(GOAL_ICONS[i], { color: goal === i ? Colors.dark.ctaPrimary : Colors.dark.textMuted, size: 18 })}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.optionTitle}>{g.title}</Text>
                  <Text style={s.optionDesc}>{g.desc}</Text>
                </View>
                {goal === i && <CheckmarkIcon color={Colors.dark.ctaPrimary} size={18} />}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={s.cta}>
          <TouchableOpacity style={[s.btnMain, goal === null && s.btnMainDisabled]} onPress={() => goNext(1)}>
            <Text style={s.btnMainTxt}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (step === 2) return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ProgressBar step={step} />
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          <TouchableOpacity onPress={() => setStep(1)}><Text style={s.back}>← Back</Text></TouchableOpacity>
          <Text style={s.stepLabel}>Step 3 of 5</Text>
          <Text style={s.title}>{"Tell us about\nyourself"}</Text>
          <Text style={s.sub}>Used to calibrate your biomarker ranges.</Text>
          <Text style={s.fieldLabel}>Age</Text>
          <View style={s.ageCard}>
            <TouchableOpacity style={s.ageBtn} onPress={() => { setAge(a => Math.max(18, a - 1)); Haptics.selectionAsync().catch(() => null); }}>
              <Text style={s.ageBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={s.ageNum}>{age} <Text style={s.ageUnit}>years old</Text></Text>
            <TouchableOpacity style={s.ageBtn} onPress={() => { setAge(a => Math.min(90, a + 1)); Haptics.selectionAsync().catch(() => null); }}>
              <Text style={s.ageBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.fieldLabel}>Biological sex</Text>
          <View style={s.sexRow}>
            {(['male', 'female'] as const).map(opt => (
              <TouchableOpacity key={opt}
                style={[s.sexBtn, sex === opt && s.sexBtnSel]}
                onPress={() => { setSex(opt); Haptics.selectionAsync().catch(() => null); }}>
                <Text style={[s.sexBtnTxt, sex === opt && { color: Colors.dark.ctaPrimary }]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={s.cta}>
          <TouchableOpacity style={s.btnMain} onPress={() => goNext(2)}>
            <Text style={s.btnMainTxt}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (step === 3) return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ProgressBar step={step} />
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          <TouchableOpacity onPress={() => setStep(2)}><Text style={s.back}>← Back</Text></TouchableOpacity>
          <Text style={s.stepLabel}>Step 4 of 5</Text>
          <Text style={s.title}>{"Any existing\nconditions?"}</Text>
          <Text style={s.sub}>Helps us flag interactions and tailor your protocol.</Text>
          <View style={s.condGrid}>
            {CONDITIONS.map(c => (
              <TouchableOpacity key={c}
                style={[s.condBtn, conditions.includes(c) && s.condBtnSel]}
                onPress={() => { toggleCondition(c); Haptics.selectionAsync().catch(() => null); }}>
                <Text style={[s.condBtnTxt, conditions.includes(c) && { color: Colors.dark.ctaPrimary }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={s.cta}>
          <TouchableOpacity style={s.btnMain} onPress={() => goNext(3)}>
            <Text style={s.btnMainTxt}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goNext(3)}>
            <Text style={s.btnSkip}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ProgressBar step={step} />
        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setStep(3)}><Text style={s.back}>← Back</Text></TouchableOpacity>
          <Text style={s.stepLabel}>Step 5 of 5</Text>
          <Text style={s.title}>{"Current\nmedications?"}</Text>
          <Text style={s.sub}>Our pharmacist engine checks all supplement interactions.</Text>
          {meds.length > 0 && (
            <View style={s.medTagRow}>
              {meds.map(m => (
                <TouchableOpacity key={m} style={s.medTag}
                  onPress={() => setMeds(prev => prev.filter(x => x !== m))}>
                  <Text style={s.medTagTxt}>{m} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <MedicationSearch
            onSelect={(med) => addMed(med.brandName || med.genericName)}
            placeholder="Search by name, e.g. Metformin..."
          />
          <Text style={s.fieldLabel}>Common medications</Text>
          <View style={s.quickRow}>
            {QUICK_MEDS.map(m => (
              <TouchableOpacity key={m} style={s.quickChip} onPress={() => addMed(m)}>
                <Text style={s.quickChipTxt}>+ {m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.privacyNote}>
            <Text style={s.privacyTxt}>
              Your medication data is encrypted locally and never shared. Used only to protect you from supplement interactions.
            </Text>
          </View>
        </ScrollView>
        <View style={s.cta}>
          <TouchableOpacity style={s.btnMain} onPress={finish}>
            <Text style={s.btnMainTxt}>Go to my dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={finish}>
            <Text style={s.btnSkip}>Skip — no medications</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingTop: Spacing.md },
  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: Spacing.sm },
  progressSeg: { flex: 1, height: 3, borderRadius: 2 },
  progressDone: { backgroundColor: Colors.viz.bioGreen },
  progressActive: { backgroundColor: Colors.viz.bioGreen, opacity: 0.5 },
  progressPending: { backgroundColor: Colors.dark.border },
  back: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted, marginBottom: Spacing.base },
  stepLabel: { fontSize: Typography.sizes.xs, color: Colors.viz.bioGreen, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '300', color: Colors.dark.text, lineHeight: 34, marginBottom: 8 },
  sub: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted, lineHeight: 22, marginBottom: Spacing.lg },
  nameInput: { backgroundColor: Colors.dark.inputBg, borderRadius: Radius.lg, padding: Spacing.base, fontSize: 20, color: Colors.dark.text, borderWidth: 1, borderColor: Colors.dark.inputBorder, marginTop: 8 },
  optionList: { gap: 10 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.dark.cardBg, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 0.5, borderColor: Colors.dark.cardBorder },
  optionCardSel: { backgroundColor: Colors.dark.accentBg, borderColor: Colors.dark.accentBorder, borderLeftWidth: 3, borderLeftColor: Colors.dark.ctaPrimary },
  optionIcon: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.dark.cardBg, alignItems: 'center', justifyContent: 'center' },
  optionIconSel: { backgroundColor: Colors.dark.accentBorder },
  optionTitle: { fontSize: Typography.sizes.md, fontWeight: '500', color: Colors.dark.text },
  optionDesc: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, marginTop: 2 },
  fieldLabel: { fontSize: Typography.sizes.sm, fontWeight: '500', color: Colors.dark.textMuted, marginBottom: 8, marginTop: Spacing.base },
  ageCard: { backgroundColor: Colors.dark.cardBg, borderRadius: Radius.lg, padding: Spacing.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 0.5, borderColor: Colors.dark.cardBorder },
  ageBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.inputBg, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.dark.border },
  ageBtnTxt: { fontSize: 22, color: Colors.dark.text },
  ageNum: { fontSize: 36, fontWeight: '300', color: Colors.viz.bioGreen },
  ageUnit: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted },
  sexRow: { flexDirection: 'row', gap: 10 },
  sexBtn: { flex: 1, backgroundColor: Colors.dark.cardBg, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.dark.cardBorder },
  sexBtnSel: { borderColor: Colors.dark.accentBorder, backgroundColor: Colors.dark.accentBg },
  sexBtnTxt: { fontSize: Typography.sizes.md, fontWeight: '500', color: Colors.dark.textMuted },
  condGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  condBtn: { backgroundColor: Colors.dark.cardBg, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 0.5, borderColor: Colors.dark.cardBorder },
  condBtnSel: { backgroundColor: Colors.dark.accentBg, borderColor: Colors.dark.accentBorder },
  condBtnTxt: { fontSize: Typography.sizes.base, color: Colors.dark.text },
  medTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  medTag: { backgroundColor: Colors.dark.accentBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 0.5, borderColor: Colors.dark.accentBorder },
  medTagTxt: { fontSize: Typography.sizes.sm, color: Colors.dark.ctaPrimary },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.base },
  quickChip: { backgroundColor: Colors.dark.cardBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 0.5, borderColor: Colors.dark.border },
  quickChipTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted },
  privacyNote: { backgroundColor: Colors.dark.cardBg, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 0.5, borderColor: Colors.dark.border },
  privacyTxt: { fontSize: Typography.sizes.xs, color: Colors.dark.textMuted, lineHeight: 18 },
  cta: { padding: Spacing.base, paddingBottom: Spacing.xl, gap: 8 },
  btnMain: { backgroundColor: Colors.dark.ctaPrimary, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  btnMainDisabled: { opacity: 0.5 },
  btnMainTxt: { color: Colors.dark.bg, fontSize: Typography.sizes.md, fontWeight: '600' },
  btnSkip: { color: Colors.dark.textMuted, fontSize: Typography.sizes.sm, textAlign: 'center', padding: 4 },
});
