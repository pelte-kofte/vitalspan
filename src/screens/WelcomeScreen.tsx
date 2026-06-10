import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Dimensions, Animated, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import NeuralGrid from '../components/NeuralGrid';
import SheetForm, { SheetFormField } from '../components/auth/SheetForm';
import { signUpWithEmail, signInWithEmail, convertAnonymousToEmail, mapAuthError, supabase } from '../lib/supabase';
import { migrateHistory } from '../lib/biomarkerWriteService';
import { StoredEntry } from './BiomarkerEntryScreen';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { height: SCREEN_H } = Dimensions.get('window');
const METRIC_LABELS = ['HRV', 'Glucose', 'BioAge'] as const;

export default function WelcomeScreen() {
  const nav = useNavigation<Nav>();
  const [sheet, setSheet] = useState<'none' | 'signup' | 'login'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheetAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const metricValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(metricValue, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(metricValue, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ]),
      { iterations: -1 },
    ).start();
  }, []);

  function openSheet(type: 'signup' | 'login') {
    setEmail(''); setPassword(''); setConfirmPassword(''); setError(null);
    setSheet(type);
    Animated.timing(sheetAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
  }

  function closeSheet() {
    Animated.timing(sheetAnim, { toValue: SCREEN_H, duration: 300, useNativeDriver: true })
      .start(() => setSheet('none'));
  }

  async function handleSignUp() {
    if (!email) { setError('Email is required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError(null);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      let result: { user: import('@supabase/supabase-js').User | null; error: string | null };
      if (currentUser?.is_anonymous) {
        result = await convertAnonymousToEmail(email, password);
        if (!result.error) {
          const linked = await AsyncStorage.getItem('@vitalspan_identity_linked');
          if (linked !== 'true') {
            const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
            const entries: StoredEntry[] = raw ? JSON.parse(raw) : [];
            await migrateHistory(entries);
            await AsyncStorage.setItem('@vitalspan_identity_linked', 'true');
          }
        }
      } else {
        result = await signUpWithEmail(email, password);
      }
      if (result.error) { setError(result.error); setLoading(false); return; }
      setLoading(false);
      closeSheet();
      nav.navigate('SignUpConfirmation', { email });
    } catch (e: unknown) {
      setError(mapAuthError(e instanceof Error ? e.message : String(e)));
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (!email || !password) { setError('Email and password are required'); return; }
    setLoading(true); setError(null);
    try {
      const result = await signInWithEmail(email, password);
      if (result.error) { setError(result.error); setLoading(false); return; }
      const raw = await AsyncStorage.getItem('@vitalspan_user_profile');
      const profile = raw ? JSON.parse(raw) : {};
      nav.reset({ index: 0, routes: [{ name: profile.onboardingComplete ? 'Main' : 'Onboarding' }] });
    } catch (e: unknown) {
      setError(mapAuthError(e instanceof Error ? e.message : String(e)));
      setLoading(false);
    }
  }

  async function handleGuest() {
    const raw = await AsyncStorage.getItem('@vitalspan_user_profile');
    const profile = raw ? JSON.parse(raw) : {};
    nav.reset({ index: 0, routes: [{ name: profile.onboardingComplete ? 'Main' : 'Onboarding' }] });
  }

  const signupFields = useMemo<SheetFormField[]>(() => [
    { label: 'Email', placeholder: 'Email address', value: email, onChange: setEmail },
    { label: 'Password', placeholder: 'Password (8+ chars)', secure: true, value: password, onChange: setPassword },
    { label: 'Confirm', placeholder: 'Confirm password', secure: true, value: confirmPassword, onChange: setConfirmPassword },
  ], [email, password, confirmPassword]);

  const loginFields = useMemo<SheetFormField[]>(() => [
    { label: 'Email', placeholder: 'Email address', value: email, onChange: setEmail },
    { label: 'Password', placeholder: 'Password', secure: true, value: password, onChange: setPassword },
  ], [email, password]);

  return (
    <View style={s.root}>
      <NeuralGrid intensity="medium" tone="vital" animate />
      <SafeAreaView style={s.safe}>
        <View style={s.hero}>
          <Text style={s.eyebrow}>LONGEVITY · SCIENCE</Text>
          <Text style={s.title}>Vitalspan</Text>
          <Text style={s.tagline}>Precision longevity tracking,{'\n'}built by a pharmacist.</Text>
          <View style={s.metricRow}>
            {METRIC_LABELS.map((label, i) => (
              <Animated.View key={label} style={[s.metricOrb, { opacity: metricValue.interpolate({ inputRange: [0, 1], outputRange: [0.3 + i * 0.1, 0.9] }) }]}>
                <View style={s.orbCircle} />
                <Text style={s.orbLabel}>{label}</Text>
              </Animated.View>
            ))}
          </View>
        </View>
        <View style={s.cta}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); openSheet('signup'); }}>
            <Text style={s.btnPrimaryTxt}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => openSheet('login')}>
            <Text style={s.btnSecondaryTxt}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGuest}>
            <Text style={s.ghost}>Continue as guest</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {sheet !== 'none' && (
        <TouchableWithoutFeedback onPress={closeSheet}>
          {/* backdrop overlay — rgba used directly; no equivalent theme token for modal scrim */}
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[s.sheet, { transform: [{ translateY: sheetAnim }] }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>{sheet === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>
          <SheetForm
            fields={sheet === 'signup' ? signupFields : loginFields}
            onSubmit={sheet === 'signup' ? handleSignUp : handleLogin}
            submitLabel={sheet === 'signup' ? 'Create Account' : 'Log In'}
            error={error} loading={loading}
            footerSlot={sheet === 'login' ? (
              <TouchableOpacity onPress={() => { closeSheet(); nav.navigate('ForgotPassword', {}); }} style={s.forgotRow}>
                <Text style={s.forgotTxt}>Forgot password?</Text>
              </TouchableOpacity>
            ) : undefined}
          />
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  safe: { flex: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  eyebrow: { fontSize: Typography.sizes.captionSmall, fontWeight: '600', color: Colors.dark.textMuted, letterSpacing: Typography.letterSpacing.widest },
  title: { fontFamily: Typography.serif, fontSize: 44, color: Colors.dark.text, marginTop: Spacing.sm },
  tagline: { fontSize: Typography.sizes.body, color: Colors.dark.textMuted, textAlign: 'center', marginTop: Spacing.sm },
  metricRow: { flexDirection: 'row', gap: Spacing.xl, marginTop: Spacing.lg },
  metricOrb: { alignItems: 'center', gap: Spacing.xs },
  orbCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.viz.bioGreenDim, borderWidth: 1, borderColor: Colors.viz.bioGreen },
  orbLabel: { fontSize: Typography.sizes.captionSmall, color: Colors.dark.textMuted },
  cta: { paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.xxl },
  btnPrimary: { backgroundColor: Colors.brand, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  btnPrimaryTxt: { color: Colors.dark.text, fontSize: Typography.sizes.body, fontWeight: '600' },
  btnSecondary: { borderWidth: 1, borderColor: Colors.dark.cardBorder, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  btnSecondaryTxt: { color: Colors.dark.text, fontSize: Typography.sizes.body, fontWeight: '600' },
  ghost: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, textAlign: 'center', paddingVertical: Spacing.sm },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: Spacing.xl, paddingBottom: Spacing.xxl },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  sheetTitle: { fontSize: Typography.sizes.h2, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.lg },
  forgotRow: { alignSelf: 'flex-end', marginBottom: Spacing.md },
  forgotTxt: { fontSize: Typography.sizes.bodySmall, color: Colors.brand },
});
