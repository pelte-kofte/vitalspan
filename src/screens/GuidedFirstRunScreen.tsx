import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography, Motion } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StoredEntry } from './BiomarkerEntryScreen';
import { BIOMARKERS } from '../data/biomarkers';
import ExplanationCard from '../components/ExplanationCard';
import { FIRST_RUN_CONTENT } from '../data/firstRunContent';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STEP_BIOMARKERS = ['fastingglucose', 'hba1c', 'totalcholesterol'] as const;
const CTA_LABELS = ['Log Glucose', 'Log HbA1c', 'Finish & See My Dashboard'];

function ProgressBar({ step }: { step: number }) {
  return (
    <>
      <Text style={s.progressLabel}>{`Step ${step + 1} of 3`}</Text>
      <View style={s.progressRow}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[s.progressDot, i === step ? s.progressDotActive : s.progressDotInactive]} />
        ))}
      </View>
    </>
  );
}

export default function GuidedFirstRunScreen() {
  const nav = useNavigation<Nav>();
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveEntry(stepIndex: number): Promise<void> {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed <= 0) {
      setInputError('Enter a number to continue');
      return Promise.reject();
    }
    setInputError('');
    const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
    const entries: StoredEntry[] = raw ? JSON.parse(raw) : [];
    entries.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      biomarkerId: STEP_BIOMARKERS[stepIndex],
      value: parsed,
      date: new Date().toISOString(),
      source: 'Blood test',
      notes: '',
    });
    await AsyncStorage.setItem('@vitalspan_biomarkers', JSON.stringify(entries));
  }

  async function handleStepAdvance() {
    if (saving) return;
    setSaving(true);
    try {
      await saveEntry(step);
    } catch {
      setSaving(false);
      return;
    }
    Haptics.selectionAsync().catch(() => null);
    setInputValue('');
    setStep(s => s + 1);
    setSaving(false);
  }

  async function handleFinish() {
    if (saving) return;
    setSaving(true);
    try {
      await saveEntry(step);
    } catch {
      setSaving(false);
      return;
    }
    await AsyncStorage.setItem('@vitalspan_first_run_complete', 'true');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    nav.reset({ index: 0, routes: [{ name: 'Main' }] });
  }

  async function handleSkip() {
    await AsyncStorage.setItem('@vitalspan_first_run_complete', 'true');
    nav.reset({ index: 0, routes: [{ name: 'Main' }] });
  }

  const content = FIRST_RUN_CONTENT[step];
  const biomarker = BIOMARKERS.find(b => b.id === STEP_BIOMARKERS[step]);

  return (
    <SafeAreaView style={s.safe}>
      <ProgressBar step={step} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          <ExplanationCard
            icon={content.icon}
            headline={content.headline}
            body={content.body}
            style={s.explanationWrapper}
          />
          <Text style={s.inputLabel}>
            {`${biomarker?.name ?? ''} (${biomarker?.unit ?? ''})`}
          </Text>
          <TextInput
            style={[s.valueInput, { borderColor: focused ? Colors.primary : Colors.border }]}
            keyboardType="decimal-pad"
            value={inputValue}
            onChangeText={(v) => { setInputValue(v); if (inputError) setInputError(''); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={String(biomarker?.defaultVal ?? '')}
            placeholderTextColor={Colors.textMuted}
          />
          {inputError !== '' && (
            <Text style={s.inputError}>{inputError}</Text>
          )}
        </ScrollView>
        <View style={s.footer}>
          <TouchableOpacity
            activeOpacity={saving ? 1 : 0.82}
            style={s.btnMain}
            onPress={step === 2 ? handleFinish : handleStepAdvance}
            disabled={saving}
          >
            <Text style={s.btnMainTxt}>{saving ? 'Saving…' : CTA_LABELS[step]}</Text>
          </TouchableOpacity>
          {step < 2 && (
            <TouchableOpacity onPress={handleSkip} style={s.skipTouchable}>
              <Text style={s.btnSkip}>{"I'll do this later"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  progressLabel: { textAlign: 'center', fontSize: Typography.sizes.lg, fontWeight: '600', color: Colors.textPrimary, paddingTop: Spacing.xl },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  progressDotActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  progressDotInactive: { backgroundColor: Colors.border },
  explanationWrapper: { marginBottom: Spacing.base },
  inputLabel: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textSecondary, marginTop: Spacing.base },
  valueInput: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, borderWidth: 1.5, height: 52, paddingHorizontal: Spacing.base, fontSize: Typography.sizes.h3, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.md },
  inputError: { color: Colors.status.critical, fontSize: Typography.sizes.sm, marginTop: Spacing.xs },
  footer: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.bg },
  btnMain: { backgroundColor: Colors.primary, borderRadius: Radius.xl, height: 52, justifyContent: 'center', alignItems: 'center' },
  btnMainTxt: { color: Colors.bgCard, fontSize: Typography.sizes.lg, fontWeight: '600' },
  skipTouchable: { paddingVertical: 12, alignItems: 'center' },
  btnSkip: { color: Colors.textMuted, fontSize: Typography.sizes.sm, textAlign: 'center' },
});
