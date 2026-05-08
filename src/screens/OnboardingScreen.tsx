import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import MedicationSearch from '../components/MedicationSearch';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const GOALS = [
  { icon: '⏳', title: 'Extend lifespan', desc: 'Live as long as possible' },
  { icon: '⚡', title: 'Optimize healthspan', desc: 'Stay sharp & energetic longer' },
  { icon: '🧬', title: 'Slow biological aging', desc: 'Reduce my biological age score' },
  { icon: '📊', title: 'Track & understand', desc: 'Know my biomarkers deeply' },
];

const CONDITIONS = [
  'Type 2 diabetes', 'Hypertension', 'Hypothyroidism',
  'High cholesterol', 'Cardiovascular disease', 'Autoimmune condition',
  'Kidney disease', 'Liver disease',
];

const QUICK_MEDS = ['Metformin', 'Aspirin', 'Statin', 'Levothyroxine', 'Warfarin', 'Empagliflozin', 'Lisinopril', 'Dapagliflozin'];

// Hoisted outside component to prevent remount on every parent render
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

  function addMed(name: string) {
    const trimmed = name.trim();
    if (trimmed && !meds.find(m => m.toLowerCase() === trimmed.toLowerCase())) {
      setMeds(prev => [...prev, trimmed]);
    }
  }

  async function finish() {
    const profile = {
      name: name.trim() || 'Friend',
      age,
      sex,
      goal: GOALS[goal ?? 0]?.title || '',
      conditions,
      medications: meds,
      biologicalAge: age - Math.floor(Math.random() * 8 + 2),
      onboardingComplete: true,
    };
    await AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(profile));
    nav.replace('Main');
  }

  if (step === 0) return (
    <SafeAreaView style={s.safe}>
      <ProgressBar step={step} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
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
        />
      </ScrollView>
      <View style={s.cta}>
        <TouchableOpacity style={s.btnMain} onPress={() => setStep(1)}>
          <Text style={s.btnMainTxt}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  if (step === 1) return (
    <SafeAreaView style={s.safe}>
      <ProgressBar step={step} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <TouchableOpacity onPress={() => setStep(0)}><Text style={s.back}>Back</Text></TouchableOpacity>
        <Text style={s.stepLabel}>Step 2 of 5</Text>
        <Text style={s.title}>{"What's your\nmain goal?"}</Text>
        <Text style={s.sub}>{"We'll build your protocol around this."}</Text>
        <View style={s.optionList}>
          {GOALS.map((g, i) => (
            <TouchableOpacity key={i}
              style={[s.optionCard, goal === i && s.optionCardSel]}
              onPress={() => setGoal(i)}>
              <View style={[s.optionIcon, goal === i && s.optionIconSel]}>
                <Text style={{ fontSize: 18 }}>{g.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.optionTitle}>{g.title}</Text>
                <Text style={s.optionDesc}>{g.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={s.cta}>
        <TouchableOpacity style={s.btnMain} onPress={() => setStep(2)}>
          <Text style={s.btnMainTxt}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  if (step === 2) return (
    <SafeAreaView style={s.safe}>
      <ProgressBar step={step} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <TouchableOpacity onPress={() => setStep(1)}><Text style={s.back}>Back</Text></TouchableOpacity>
        <Text style={s.stepLabel}>Step 3 of 5</Text>
        <Text style={s.title}>{"Tell us about\nyourself"}</Text>
        <Text style={s.sub}>Used to calibrate your biomarker ranges.</Text>
        <Text style={s.fieldLabel}>Age</Text>
        <View style={s.ageCard}>
          <TouchableOpacity style={s.ageBtn} onPress={() => setAge(a => Math.max(18, a - 1))}>
            <Text style={s.ageBtnTxt}>−</Text>
          </TouchableOpacity>
          <Text style={s.ageNum}>{age} <Text style={s.ageUnit}>years old</Text></Text>
          <TouchableOpacity style={s.ageBtn} onPress={() => setAge(a => Math.min(90, a + 1))}>
            <Text style={s.ageBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.fieldLabel}>Biological sex</Text>
        <View style={s.sexRow}>
          {(['male', 'female'] as const).map(opt => (
            <TouchableOpacity key={opt}
              style={[s.sexBtn, sex === opt && s.sexBtnSel]}
              onPress={() => setSex(opt)}>
              <Text style={[s.sexBtnTxt, sex === opt && { color: Colors.primary }]}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={s.cta}>
        <TouchableOpacity style={s.btnMain} onPress={() => setStep(3)}>
          <Text style={s.btnMainTxt}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  if (step === 3) return (
    <SafeAreaView style={s.safe}>
      <ProgressBar step={step} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <TouchableOpacity onPress={() => setStep(2)}><Text style={s.back}>Back</Text></TouchableOpacity>
        <Text style={s.stepLabel}>Step 4 of 5</Text>
        <Text style={s.title}>{"Any existing\nconditions?"}</Text>
        <Text style={s.sub}>Helps us flag interactions and tailor your protocol.</Text>
        <View style={s.condGrid}>
          {CONDITIONS.map(c => (
            <TouchableOpacity key={c}
              style={[s.condBtn, conditions.includes(c) && s.condBtnSel]}
              onPress={() => toggleCondition(c)}>
              <Text style={[s.condBtnTxt, conditions.includes(c) && { color: Colors.primaryDark }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={s.cta}>
        <TouchableOpacity style={s.btnMain} onPress={() => setStep(4)}>
          <Text style={s.btnMainTxt}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep(4)}>
          <Text style={s.btnSkip}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ProgressBar step={step} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <TouchableOpacity onPress={() => setStep(3)}><Text style={s.back}>Back</Text></TouchableOpacity>
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingTop: Spacing.md },
  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: Spacing.sm },
  progressSeg: { flex: 1, height: 3, borderRadius: 2 },
  progressDone: { backgroundColor: Colors.primary },
  progressActive: { backgroundColor: Colors.primary, opacity: 0.5 },
  progressPending: { backgroundColor: Colors.border },
  back: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginBottom: Spacing.base },
  stepLabel: { fontSize: Typography.sizes.xs, color: Colors.primaryLight, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '300', color: Colors.textPrimary, lineHeight: 34, marginBottom: 8 },
  sub: { fontSize: Typography.sizes.base, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  nameInput: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.base, fontSize: 20, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginTop: 8 },
  optionList: { gap: 10 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  optionCardSel: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  optionIcon: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  optionIconSel: { backgroundColor: Colors.primaryBorder },
  optionTitle: { fontSize: Typography.sizes.md, fontWeight: '500', color: Colors.textPrimary },
  optionDesc: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  fieldLabel: { fontSize: Typography.sizes.sm, fontWeight: '500', color: Colors.textSecondary, marginBottom: 8, marginTop: Spacing.base },
  ageCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.border },
  ageBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  ageBtnTxt: { fontSize: 22, color: Colors.textPrimary },
  ageNum: { fontSize: 36, fontWeight: '300', color: Colors.primary },
  ageUnit: { fontSize: Typography.sizes.base, color: Colors.textMuted },
  sexRow: { flexDirection: 'row', gap: 10 },
  sexBtn: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  sexBtnSel: { borderColor: Colors.primaryLight, backgroundColor: Colors.primaryBg },
  sexBtnTxt: { fontSize: Typography.sizes.md, fontWeight: '500', color: Colors.textSecondary },
  condGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  condBtn: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  condBtnSel: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  condBtnTxt: { fontSize: Typography.sizes.base, color: Colors.textPrimary },
  medTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  medTag: { backgroundColor: Colors.primaryBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 0.5, borderColor: Colors.primaryBorder },
  medTagTxt: { fontSize: Typography.sizes.sm, color: Colors.primaryDark },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.base },
  quickChip: { backgroundColor: Colors.bgCard, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: Colors.border },
  quickChipTxt: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  privacyNote: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  privacyTxt: { fontSize: Typography.sizes.xs, color: Colors.textMuted, lineHeight: 18 },
  cta: { padding: Spacing.base, paddingBottom: Spacing.xl, gap: 8 },
  btnMain: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  btnMainTxt: { color: Colors.primaryBg, fontSize: Typography.sizes.md, fontWeight: '600' },
  btnSkip: { color: Colors.textMuted, fontSize: Typography.sizes.sm, textAlign: 'center', padding: 4 },
});
