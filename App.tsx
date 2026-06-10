import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, initSupabaseSession } from './src/lib/supabase';
import { migrateHistory } from './src/lib/biomarkerWriteService';
import { pruneExpiredCache } from './src/services/rxnav';
import { StoredEntry } from './src/screens/BiomarkerEntryScreen';
import AppNavigator from './src/navigation/AppNavigator';
import MedicalDisclaimer from './src/components/MedicalDisclaimer';
import { Colors } from './src/theme';

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Welcome' | 'Onboarding' | 'Main' | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initSupabaseSession();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !user.is_anonymous) {
          const profileRaw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
          const profile = profileRaw ? JSON.parse(profileRaw) : null;
          setInitialRoute(profile?.onboardingComplete ? 'Main' : 'Onboarding');
        } else {
          setInitialRoute('Welcome');
        }
      } catch {
        setInitialRoute('Welcome');
      }
      // Fire-and-forget: cache pruning + data migration (non-blocking)
      pruneExpiredCache().catch(() => null);
      // Migration chain: only runs after session is established
      void (async () => {
        const migrated = await AsyncStorage.getItem('@vitalspan_migrated_v2').catch(() => null);
        if (!migrated) {
          const biomarkersRaw = await AsyncStorage.getItem('@vitalspan_biomarkers').catch(() => null);
          const entries: StoredEntry[] = biomarkersRaw ? JSON.parse(biomarkersRaw) : [];
          migrateHistory(entries)
            .then(() => AsyncStorage.setItem('@vitalspan_migrated_v2', 'true'))
            .catch(() => null);
        }
      })();
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
