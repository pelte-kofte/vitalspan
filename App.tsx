import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, initSupabaseSession } from './src/lib/supabase';
import { migrateHistory } from './src/lib/biomarkerWriteService';
import { pruneExpiredCache } from './src/services/rxnav';
import { StoredEntry } from './src/screens/BiomarkerEntryScreen';
import AppNavigator from './src/navigation/AppNavigator';
import MedicalDisclaimer from './src/components/MedicalDisclaimer';
import BootLoadingScreen from './src/components/BootLoadingScreen';
import { identifyAdaptyUser } from './src/lib/adapty';
import { PremiumProvider } from './src/context/PremiumContext';
import * as Notifications from 'expo-notifications';
import { loadNotificationPrefs, rescheduleAll } from './src/lib/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Welcome' | 'Onboarding' | 'Main' | null>(null);

  useEffect(() => {
    const init = async () => {
      // 10-second safety net: if any boot step hangs (e.g. SDK network call with
      // no internal timeout), we fall through to the catch and show Welcome rather
      // than leaving the user on the loading spinner forever.
      const bootTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('[App] Boot timed out after 10s')), 10_000),
      );

      const boot = async () => {
        await initSupabaseSession();
        // activationPromise (Adapty SDK init) is intentionally NOT awaited here.
        // adapty.activate() can stall indefinitely on some network conditions and
        // is not required for routing. identifyAdaptyUser() awaits it internally
        // when called below; PremiumContext handles it for premium gating.
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id) {
          identifyAdaptyUser(user.id).catch(() => null);
        }
        if (user && !user.is_anonymous) {
          const profileRaw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
          const profile = profileRaw ? JSON.parse(profileRaw) : null;
          setInitialRoute(profile?.onboardingComplete ? 'Main' : 'Onboarding');
        } else {
          setInitialRoute('Welcome');
        }
      };

      try {
        await Promise.race([boot(), bootTimeout]);
      } catch (error) {
        console.error('[App] Boot error:', error);
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

  useEffect(() => {
    void (async () => {
      try {
        const prefs = await loadNotificationPrefs();
        const protocolRaw = await AsyncStorage.getItem('@vitalspan_protocol').catch(() => null);
        const protocol = protocolRaw
          ? (JSON.parse(protocolRaw) as { supplements?: Array<{ id: string; name: string; reminderEnabled?: boolean; reminderSlot?: import('./src/types/protocol').TimeSlot }>; medReminders?: Record<string, { enabled: boolean; slot: import('./src/types/protocol').TimeSlot }> })
          : undefined;
        await rescheduleAll(prefs, protocol);
      } catch (error) {
        console.error('[App] Notification reschedule failed:', error);
      }
    })();
  }, []);

  if (!initialRoute) {
    return <BootLoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <PremiumProvider>
        <AppNavigator initialRoute={initialRoute} />
      </PremiumProvider>
      <MedicalDisclaimer />
    </GestureHandlerRootView>
  );
}
