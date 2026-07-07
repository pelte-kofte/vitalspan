import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FEATURES = [
  'Longevity-optimized biomarker ranges',
  'Pharmacist-verified drug interactions',
  'Evidence-based supplement protocols',
];

export default function LandingScreen() {
  const nav = useNavigation<Nav>();

  async function handleAlreadyHaveAccount() {
    try {
      const raw = await AsyncStorage.getItem('@vitalspan_user_profile');
      if (raw) {
        const profile = JSON.parse(raw);
        if (profile.onboardingComplete) {
          nav.reset({ index: 0, routes: [{ name: 'Main' }] });
          return;
        }
      }
    } catch { /* fall through to onboarding */ }
    nav.navigate('Onboarding');
  }

  return (
    <LinearGradient colors={['#080D09', '#0C1410', '#0F1C14']} style={s.gradient}>
      <SafeAreaView style={s.safe}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.inner}>

          {/* Hero */}
          <View style={s.hero}>
            <Text style={s.eyebrow}>LONGEVITY · SCIENCE</Text>
            <Text style={s.title}>Vitalspan</Text>
            <Text style={s.tagline}>
              Precision longevity tracking,{'\n'}built by a pharmacist.
            </Text>
          </View>

          {/* Feature list */}
          <View style={s.features}>
            {FEATURES.map(f => (
              <View key={f} style={s.featureRow}>
                <View style={s.featureDot} />
                <Text style={s.featureTxt}>{f}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <View style={s.cta}>
            <TouchableOpacity style={s.btnPrimary} onPress={() => nav.navigate('Onboarding')}>
              <Text style={s.btnPrimaryTxt}>Begin your journey</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAlreadyHaveAccount}>
              <Text style={s.ghost}>Already have an account</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* Pharmacist badge */}
        <View style={s.footer}>
          <View style={s.footerBadge}>
            <Text style={s.footerTxt}>⚕ Reviewed by licensed pharmacists</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  inner: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    gap: Spacing.xxl,
  },
  hero: { alignItems: 'center', gap: Spacing.md },
  eyebrow: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Typography.serif,
    fontSize: Typography.sizes.display1,
    fontWeight: '400',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.sizes.base,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  features: { gap: Spacing.md, paddingHorizontal: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.viz.bioGreen,
  },
  featureTxt: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted },
  cta: { gap: Spacing.md },
  btnPrimary: {
    backgroundColor: Colors.dark.ctaPrimary,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryTxt: {
    color: Colors.dark.bg,
    fontSize: Typography.sizes.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  ghost: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    paddingVertical: Spacing.xs,
  },
  footer: { padding: Spacing.base, alignItems: 'center' },
  footerBadge: {
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderWidth: 0.5,
    borderColor: Colors.dark.accentBorder,
  },
  footerTxt: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.ctaPrimary,
    fontWeight: '500',
  },
});
