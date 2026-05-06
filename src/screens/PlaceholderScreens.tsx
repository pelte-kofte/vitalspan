import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors, Typography } from '../theme';

export default function ProtocolScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.emoji}>🧬</Text>
        <Text style={s.title}>Protocol Builder</Text>
        <Text style={s.sub}>Coming soon — build your personalized supplement stack with evidence grades and timing.</Text>
      </View>
    </SafeAreaView>
  );
}

export function ProfileScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.emoji}>👤</Text>
        <Text style={s.title}>Profile</Text>
        <Text style={s.sub}>Manage your account, biomarker history, and subscription.</Text>
      </View>
    </SafeAreaView>
  );
}

export function LandingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.emoji}>🌿</Text>
        <Text style={[s.title, { fontSize: 32 }]}>Vitalspan</Text>
        <Text style={s.sub}>Live longer. Live better. Track what matters.</Text>
        <View style={s.btnRow}>
          <Text style={s.btn} onPress={() => navigation.navigate('Onboarding')}>Get started →</Text>
          <Text style={s.btnGhost} onPress={() => navigation.navigate('Main')}>I already have an account</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function BiomarkerDetailScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.emoji}>📊</Text>
        <Text style={s.title}>Biomarker Detail</Text>
        <Text style={s.sub}>Trend charts and detailed analysis — see BiomarkerDetailScreen.tsx</Text>
      </View>
    </SafeAreaView>
  );
}

export function BiomarkerEntryScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.emoji}>➕</Text>
        <Text style={s.title}>Log Biomarker</Text>
        <Text style={s.sub}>Manual entry screen — see BiomarkerEntryScreen.tsx</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '500', color: Colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  sub: { fontSize: Typography.sizes.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  btnRow: { marginTop: 32, gap: 12, alignItems: 'center' },
  btn: { backgroundColor: '#0F6E56', color: '#E1F5EE', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, fontSize: 16, fontWeight: '500', overflow: 'hidden' },
  btnGhost: { color: Colors.textMuted, fontSize: Typography.sizes.base },
});
