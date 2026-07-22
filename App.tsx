import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAuthRequestScopeCurrent } from './src/lib/supabase';
import { migrateHistory } from './src/lib/biomarkerWriteService';
import { pruneExpiredCache } from './src/services/rxnav';
import { StoredEntry } from './src/screens/BiomarkerEntryScreen';
import AppNavigator from './src/navigation/AppNavigator';
import MedicalDisclaimer from './src/components/MedicalDisclaimer';
import BootLoadingScreen from './src/components/BootLoadingScreen';
import { PremiumProvider } from './src/context/PremiumContext';
import { AuthSessionProvider, useAuthSession } from './src/context/AuthSessionContext';
import * as Notifications from 'expo-notifications';
import { loadNotificationPrefs, rescheduleAll } from './src/lib/notifications';
import { BIOMARKER_PERSISTENCE_MIGRATION_KEY } from './src/lib/storageKeys';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  return (
    <AuthSessionProvider>
      <VitalspanApp />
    </AuthSessionProvider>
  );
}

function VitalspanApp() {
  const auth = useAuthSession();
  const [routeState, setRouteState] = useState<{
    route: 'Welcome' | 'Onboarding' | 'Main';
    generation: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (auth.status === 'initializing') {
        setRouteState(null);
        return;
      }

      if (auth.status === 'signedOut') {
        await Notifications.cancelAllScheduledNotificationsAsync().catch(() => null);
        if (!cancelled) setRouteState({ route: 'Welcome', generation: auth.generation });
        return;
      }

      const scope = { userId: auth.userId!, generation: auth.generation };
      try {
        const profileRaw = await AsyncStorage.getItem('@vitalspan_user_profile');
        if (!isAuthRequestScopeCurrent(scope) || cancelled) return;
        const profile = profileRaw ? JSON.parse(profileRaw) as { onboardingComplete?: boolean } : null;
        const route = profile?.onboardingComplete ? 'Main' : 'Onboarding';
        const sessionKind = auth.session?.user.is_anonymous ? 'anon' : 'auth';
        console.log(`[Boot] session=${sessionKind} onboarding=${Boolean(profile?.onboardingComplete)} → route=${route}`);
        setRouteState({ route, generation: auth.generation });

        const migrated = await AsyncStorage.getItem(BIOMARKER_PERSISTENCE_MIGRATION_KEY)
          .catch(() => null);
        if (!migrated && isAuthRequestScopeCurrent(scope)) {
          const biomarkersRaw = await AsyncStorage.getItem('@vitalspan_biomarkers').catch(() => null);
          const entries: StoredEntry[] = biomarkersRaw ? JSON.parse(biomarkersRaw) : [];
          const migrationSucceeded = await migrateHistory(entries, scope);
          const latestBiomarkersRaw = migrationSucceeded
            ? await AsyncStorage.getItem('@vitalspan_biomarkers').catch(() => null)
            : null;
          if (
            migrationSucceeded
            && latestBiomarkersRaw === biomarkersRaw
            && isAuthRequestScopeCurrent(scope)
          ) {
            await AsyncStorage.setItem(BIOMARKER_PERSISTENCE_MIGRATION_KEY, 'true')
              .catch(() => null);
          }
        }
      } catch (error) {
        console.error('[App] Boot error:', error);
        if (!cancelled && isAuthRequestScopeCurrent(scope)) {
          setRouteState({ route: 'Onboarding', generation: auth.generation });
        }
      }
    };

    void init();
    return () => { cancelled = true; };
  // Session token refreshes keep the same generation and must not remount data.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.generation, auth.status, auth.userId]);

  useEffect(() => {
    pruneExpiredCache().catch(() => null);
  }, []);

  useEffect(() => {
    if (auth.status !== 'authenticated' || !auth.userId) return;
    const scope = { userId: auth.userId, generation: auth.generation };
    void (async () => {
      try {
        const prefs = await loadNotificationPrefs();
        const protocolRaw = await AsyncStorage.getItem('@vitalspan_protocol').catch(() => null);
        if (!isAuthRequestScopeCurrent(scope)) return;
        const protocol = protocolRaw
          ? (JSON.parse(protocolRaw) as { supplements?: Array<{ id: string; name: string; reminderEnabled?: boolean; reminderSlot?: import('./src/types/protocol').TimeSlot }>; medReminders?: Record<string, { enabled: boolean; slot: import('./src/types/protocol').TimeSlot }> })
          : undefined;
        await rescheduleAll(prefs, protocol, scope);
      } catch (error) {
        console.error('[App] Notification reschedule failed:', error);
      }
    })();
  }, [auth.generation, auth.status, auth.userId]);

  if (!routeState || routeState.generation !== auth.generation) {
    return <BootLoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <PremiumProvider key={auth.generation}>
        <AppNavigator key={auth.generation} initialRoute={routeState.route} />
      </PremiumProvider>
      <MedicalDisclaimer />
    </GestureHandlerRootView>
  );
}
