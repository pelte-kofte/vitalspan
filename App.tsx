import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initSupabaseSession } from './src/lib/supabase';
import { migrateHistory } from './src/lib/biomarkerWriteService';
import { StoredEntry } from './src/screens/BiomarkerEntryScreen';
import AppNavigator from './src/navigation/AppNavigator';
import MedicalDisclaimer from './src/components/MedicalDisclaimer';
import { Colors } from './src/theme';

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Landing' | 'Main' | null>(null);

  useEffect(() => {
    const init = async () => {
      const raw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
      if (raw) {
        try {
          const profile = JSON.parse(raw);
          setInitialRoute(profile.onboardingComplete ? 'Main' : 'Landing');
        } catch {
          setInitialRoute('Landing');
        }
      } else {
        setInitialRoute('Landing');
      }
      initSupabaseSession()
        .then(() => {
          AsyncStorage.getItem('@vitalspan_migrated_v2').then((migrated) => {
            if (!migrated) {
              AsyncStorage.getItem('@vitalspan_biomarkers').then((biomarkersRaw) => {
                const entries: StoredEntry[] = biomarkersRaw ? JSON.parse(biomarkersRaw) : [];
                migrateHistory(entries)
                  .then(() => AsyncStorage.setItem('@vitalspan_migrated_v2', 'true'))
                  .catch(() => null);
              }).catch(() => null);
            }
          }).catch(() => null);
        })
        .catch((err) => {
          console.warn('[App] initSupabaseSession unexpected error:', err);
        });
    };
    init();
  }, []);

  if (!initialRoute) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AppNavigator initialRoute={initialRoute} />
      <MedicalDisclaimer />
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
});
