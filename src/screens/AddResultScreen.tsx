import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Text from '../components/health/HealthText';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Radius, Spacing, Typography } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AddResultScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close add result"
        >
          <Text style={s.close}>Close</Text>
        </Pressable>
      </View>

      <View style={s.content}>
        <Text style={s.eyebrow}>ADD RESULT</Text>
        <Text accessibilityRole="header" style={s.title}>How would you like to add it?</Text>
        <Text style={s.subtitle}>Enter one result now, or import values from a laboratory report.</Text>

        <Pressable
          onPress={() => navigation.replace('BiomarkerEntry', { biomarkerId: undefined })}
          style={({ pressed }) => [s.primaryAction, pressed && s.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Enter a result manually"
        >
          <View style={s.numberPrimary}><Text style={s.numberPrimaryText}>1</Text></View>
          <View style={s.actionCopy}>
            <Text style={s.primaryTitle}>Enter manually</Text>
            <Text style={s.primaryBody}>Choose a biomarker and enter its value.</Text>
          </View>
          <Text style={s.primaryArrow} accessible={false}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.replace('LabUpload')}
          style={({ pressed }) => [s.secondaryAction, pressed && s.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Import a laboratory PDF"
        >
          <View style={s.numberSecondary}><Text style={s.numberSecondaryText}>2</Text></View>
          <View style={s.actionCopy}>
            <Text style={s.secondaryTitle}>Import laboratory PDF</Text>
            <Text style={s.secondaryBody}>Import values and the reference intervals reported by the laboratory.</Text>
          </View>
          <Text style={s.secondaryArrow} accessible={false}>›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.health.background },
  header: { minHeight: 56, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  closeButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  close: { color: Colors.health.accent, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl * 2 },
  eyebrow: { color: Colors.health.accent, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest },
  title: { color: Colors.health.ink, fontSize: Typography.sizes.display3, lineHeight: Typography.lineHeights.display3, fontWeight: Typography.weights.title, marginTop: Spacing.sm, maxWidth: 520 },
  subtitle: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body, marginTop: Spacing.md, marginBottom: Spacing.xxl },
  primaryAction: { minHeight: 112, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.health.ink, borderRadius: Radius.card, padding: Spacing.lg },
  secondaryAction: { minHeight: 112, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.health.surfaceStrong, borderWidth: 1, borderColor: Colors.health.ruleStrong, borderRadius: Radius.card, padding: Spacing.lg, marginTop: Spacing.md },
  pressed: { opacity: 0.78 },
  numberPrimary: { width: 36, height: 36, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.health.surfaceStrong },
  numberPrimaryText: { color: Colors.health.ink, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
  numberSecondary: { width: 36, height: 36, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.health.accentSoft },
  numberSecondaryText: { color: Colors.health.accent, fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.label },
  actionCopy: { flex: 1 },
  primaryTitle: { color: Colors.health.surfaceStrong, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: Typography.weights.headline },
  primaryBody: { color: Colors.health.background, opacity: 0.72, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
  secondaryTitle: { color: Colors.health.ink, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: Typography.weights.headline },
  secondaryBody: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
  primaryArrow: { color: Colors.health.surfaceStrong, fontSize: Typography.sizes.xxl },
  secondaryArrow: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.xxl },
});
