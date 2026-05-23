/**
 * HealthKit integration layer.
 *
 * STATUS: Stub — ready to activate.
 * To enable real syncing, install expo-health:
 *   npx expo install expo-health
 * Then uncomment the import and replace the stubs below.
 *
 * expo-health is confirmed compatible with Expo SDK 54 (managed workflow).
 * After installing, rebuild the dev client:
 *   npx expo run:ios
 */

// import * as Health from 'expo-health';

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@vitalspan_health_data';

export interface HealthData {
  hrv?: number;               // ms, rmssd
  restingHeartRate?: number;  // bpm
  vo2max?: number;            // mL/kg/min
  sleepHours?: number;        // last night total
  respiratoryRate?: number;   // breaths/min
  steps?: number;             // last 7 days average
  mindfulMinutes?: number;    // last 7 days total
  glucose?: number;           // mg/dL, last reading
  lastSynced?: string;        // ISO date
}

export interface SyncResult {
  success: boolean;
  data?: HealthData;
  error?: string;
}

/**
 * Request HealthKit permissions.
 * Returns true if granted (or already granted), false if denied or unavailable.
 */
export async function requestHealthKitPermissions(): Promise<boolean> {
  // When expo-health is installed, replace with:
  //
  // const { status } = await Health.requestPermissionsAsync({
  //   read: [
  //     Health.HealthDataType.HeartRateVariabilitySDNN,
  //     Health.HealthDataType.RestingHeartRate,
  //     Health.HealthDataType.Vo2Max,
  //     Health.HealthDataType.SleepAnalysis,
  //     Health.HealthDataType.RespiratoryRate,
  //     Health.HealthDataType.Steps,
  //     Health.HealthDataType.MindfulSession,
  //     Health.HealthDataType.BloodGlucose,
  //   ],
  // });
  // return status === 'granted';

  console.warn('[HealthKit] expo-health not installed. Using stub.');
  return false;
}

/**
 * Pull last 7 days of data from HealthKit and persist to AsyncStorage.
 */
export async function syncHealthData(): Promise<SyncResult> {
  // When expo-health is installed, replace with:
  //
  // const granted = await requestHealthKitPermissions();
  // if (!granted) return { success: false, error: 'Permission denied' };
  //
  // const end = new Date();
  // const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  //
  // const [hrv, rhr, vo2, sleep] = await Promise.all([
  //   Health.getHeartRateVariabilityAsync({ startDate: start, endDate: end }),
  //   Health.getRestingHeartRateAsync({ startDate: start, endDate: end }),
  //   Health.getVo2MaxAsync({ startDate: start, endDate: end }),
  //   Health.getSleepAnalysisAsync({ startDate: start, endDate: end }),
  // ]);
  //
  // const data: HealthData = {
  //   hrv: hrv.samples?.at(-1)?.value,
  //   restingHeartRate: rhr.samples?.at(-1)?.value,
  //   vo2max: vo2.samples?.at(-1)?.value,
  //   sleepHours: sleep.samples?.at(-1)?.duration != null
  //     ? Math.round(sleep.samples.at(-1)!.duration / 3600 * 10) / 10
  //     : undefined,
  //   lastSynced: new Date().toISOString(),
  // };
  //
  // await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // return { success: true, data };

  return { success: false, error: 'expo-health not installed' };
}

/**
 * Load the most recently synced HealthData from storage.
 */
export async function loadHealthData(): Promise<HealthData | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HealthData) : null;
  } catch {
    return null;
  }
}

/**
 * Check if HealthKit data is stale (older than 4 hours).
 */
export function isHealthDataStale(data: HealthData): boolean {
  if (!data.lastSynced) return true;
  const age = Date.now() - new Date(data.lastSynced).getTime();
  return age > 4 * 60 * 60 * 1000;
}
