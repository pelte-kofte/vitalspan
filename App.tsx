import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import MedicalDisclaimer from './src/components/MedicalDisclaimer';

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Landing' | 'Main' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@vitalspan_user_profile')
      .then(raw => {
        if (raw) {
          const profile = JSON.parse(raw);
          setInitialRoute(profile.onboardingComplete ? 'Main' : 'Landing');
        } else {
          setInitialRoute('Landing');
        }
      })
      .catch(() => setInitialRoute('Landing'));
  }, []);

  if (!initialRoute) return null;

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator initialRoute={initialRoute} />
      <MedicalDisclaimer />
    </>
  );
}
