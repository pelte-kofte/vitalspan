import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Dimensions, Animated, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import NeuralGrid from '../components/NeuralGrid';
import SheetForm, { SheetFormField } from '../components/auth/SheetForm';
import { signUpWithEmail, signInWithEmail, convertAnonymousToEmail, mapAuthError, supabase, signInWithApple, signInWithGoogle } from '../lib/supabase';
import { migrateHistory } from '../lib/biomarkerWriteService';
import { StoredEntry } from './BiomarkerEntryScreen';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { height: SCREEN_H } = Dimensions.get('window');

export default function WelcomeScreen() {
  const nav = useNavigation<Nav>();
  const [sheet, setSheet] = useState<'none' | 'signup' | 'login'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheetAnim = useRef(new Animated.Value(SCREEN_H)).current;

  // Single source of truth for post-sign-in navigation. Email, Google, and
  // Apple sign-in all end up calling a Supabase auth method that fires a
  // SIGNED_IN event on this listener — so all three land here instead of each
  // needing its own nav call. Anonymous sign-ins (guest, or the boot-time
  // initSupabaseSession() call) are explicitly excluded: guest navigates
  // itself in handleGuest, and must never be redirected by this effect.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const provider = session?.user?.app_metadata?.provider ?? 'none';
      const anonymous = session?.user?.is_anonymous ?? 'n/a';
      console.log(`[Auth] state change: ${event} (provider: ${provider}, anonymous: ${anonymous})`);
      if (event === 'SIGNED_IN' && session?.user && !session.user.is_anonymous) {
        const raw = await AsyncStorage.getItem('@vitalspan_user_profile');
        const profile = raw ? JSON.parse(raw) : {};
        nav.reset({ index: 0, routes: [{ name: profile.onboardingComplete ? 'Main' : 'Onboarding' }] });
      }
    });
    return () => subscription.unsubscribe();
  }, [nav]);

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
          // Successful conversion: migrate local history to the new named account.
          const linked = await AsyncStorage.getItem('@vitalspan_identity_linked');
          if (linked !== 'true') {
            const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
            const entries: StoredEntry[] = raw ? JSON.parse(raw) : [];
            await migrateHistory(entries);
            await AsyncStorage.setItem('@vitalspan_identity_linked', 'true');
          }
        } else {
          // convertAnonymousToEmail failed (e.g. anonymous auth disabled in Supabase,
          // or the anonymous session expired). Fall back to a direct signUp so the
          // user can still create an account — their local data is preserved in
          // AsyncStorage regardless.
          result = await signUpWithEmail(email, password);
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
      setLoading(false);
      closeSheet();
      // Navigation to Home is handled by the onAuthStateChange listener above.
    } catch (e: unknown) {
      setError(mapAuthError(e instanceof Error ? e.message : String(e)));
      setLoading(false);
    }
  }

  async function handleGuest() {
    // Boot-time initSupabaseSession() creates the anonymous session; this is a
    // fallback for the known offline-first-launch case where that call can
    // fail silently, so guest entry never proceeds with zero session.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously();
      console.log('[Auth] guest: no session found, created anonymous session', error ? `(failed: ${error.message})` : '(ok)');
    } else {
      console.log('[Auth] guest: continuing with existing session', session.user.is_anonymous ? '(anonymous)' : '(signed in)');
    }
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
          <Text style={s.supportLine}>Track HRV, glucose, biological age, biomarkers and more.</Text>
        </View>
        <View style={s.cta}>
          <TouchableOpacity style={s.btnApple} onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
            console.log('[Auth] Apple sign-in tapped');
            const { error } = await signInWithApple();
            if (error) { Alert.alert('Sign in failed', error); }
            // Navigation to Home on success is handled by the onAuthStateChange listener above.
          }}>
            <Text style={s.btnAppleTxt}> Sign in with Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnGoogle} onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
            console.log('[Auth] Google sign-in tapped');
            const { error } = await signInWithGoogle();
            if (error) { Alert.alert('Sign in failed', error); }
            // Navigation to Home on success is handled by the onAuthStateChange listener above.
          }}>
            <Text style={s.btnGoogleTxt}>G  Sign in with Google</Text>
          </TouchableOpacity>
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerTxt}>or</Text>
            <View style={s.dividerLine} />
          </View>
          <TouchableOpacity style={s.btnPrimary} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); openSheet('signup'); }}>
            <Text style={s.btnPrimaryTxt}>Sign Up with Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => openSheet('login')}>
            <Text style={s.btnSecondaryTxt}>Log In with Email</Text>
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.sheetKav}
      >
        <Animated.View style={[s.sheet, { transform: [{ translateY: sheetAnim }] }]}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>{sheet === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>
          <SheetForm
            fields={sheet === 'signup' ? signupFields : loginFields}
            onSubmit={sheet === 'signup' ? handleSignUp : handleLogin}
            submitLabel={sheet === 'signup' ? 'Create Account' : 'Log In'}
            error={error} loading={loading}
            footerSlot={sheet === 'login' ? (
              <TouchableOpacity onPress={() => { closeSheet(); nav.navigate('ForgotPassword', { email }); }} style={s.forgotRow}>
                <Text style={s.forgotTxt}>Forgot password?</Text>
              </TouchableOpacity>
            ) : undefined}
          />
        </Animated.View>
      </KeyboardAvoidingView>
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
  supportLine: { fontSize: Typography.sizes.bodySmall, color: Colors.dark.textMuted, textAlign: 'center', marginTop: Spacing.md, opacity: 0.7 },
  cta: { paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.xxl },
  btnPrimary: { backgroundColor: Colors.brand, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  btnPrimaryTxt: { color: Colors.dark.text, fontSize: Typography.sizes.body, fontWeight: '600' },
  btnSecondary: { borderWidth: 1, borderColor: Colors.dark.cardBorder, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  btnSecondaryTxt: { color: Colors.dark.text, fontSize: Typography.sizes.body, fontWeight: '600' },
  ghost: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, textAlign: 'center', paddingVertical: Spacing.sm },
  btnApple: { backgroundColor: '#000000', borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  btnAppleTxt: { color: '#FFFFFF', fontSize: Typography.sizes.body, fontWeight: '600' },
  btnGoogle: { backgroundColor: '#FFFFFF', borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.cardBorder },
  btnGoogleTxt: { color: '#1A1A18', fontSize: Typography.sizes.body, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: Colors.dark.cardBorder },
  dividerTxt: { fontSize: Typography.sizes.bodySmall, color: Colors.dark.textMuted },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheetKav: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: Spacing.xl, paddingBottom: Spacing.xxl },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  sheetTitle: { fontSize: Typography.sizes.h2, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.lg },
  forgotRow: { alignSelf: 'flex-end', marginBottom: Spacing.md },
  forgotTxt: { fontSize: Typography.sizes.bodySmall, color: Colors.brand },
});
