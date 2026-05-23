/**
 * HealthKit integration layer.
 *
 * STATUS: Simulator/mock-first.
 * expo-health is not yet installed (requires native build).
 * This module provides a realistic mock that:
 *  - Simulates the permission request flow via Alert dialogs
 *  - Generates realistic health data for demonstration
 *  - Saves to AsyncStorage @vitalspan_health_data
 *  - Marks data as isDemoMode so UI can show the "Demo" badge
 *
 * When expo-health is installed (npx expo install expo-health + npx expo run:ios),
 * replace the mock blocks with the commented-out real implementations.
 */

import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@vitalspan_health_data';
const PERMISSIONS_KEY = '@vitalspan_health_permissions';

export interface HealthData {
  hrv?: number;               // ms, rmssd — Heart Rate Variability
  restingHeartRate?: number;  // bpm
  vo2max?: number;            // mL/kg/min
  sleepHours?: number;        // last night total
  sleepDeep?: number;         // deep sleep hours
  sleepRem?: number;          // REM hours
  respiratoryRate?: number;   // breaths/min
  steps?: number;             // last 7 days average
  mindfulMinutes?: number;    // last 7 days total
  glucose?: number;           // mg/dL, last reading
  recovery?: number;          // 0–100 composite score
  lastSynced?: string;        // ISO date
  isDemoMode?: boolean;       // true when using mock data
}

export interface PermissionStatus {
  granted: boolean;
  categories: {
    heart: boolean;
    sleep: boolean;
    activity: boolean;
    glucose: boolean;
  };
  requestedAt?: string;
}

export interface SyncResult {
  success: boolean;
  data?: HealthData;
  error?: string;
  isDemoMode?: boolean;
}

/** Returns true if HealthKit is available on this device/platform. */
export function isHealthKitAvailable(): boolean {
  return Platform.OS === 'ios';
}

/** Load saved permission status. */
export async function loadPermissionStatus(): Promise<PermissionStatus | null> {
  try {
    const raw = await AsyncStorage.getItem(PERMISSIONS_KEY);
    return raw ? (JSON.parse(raw) as PermissionStatus) : null;
  } catch {
    return null;
  }
}

/** Save permission status. */
async function savePermissionStatus(status: PermissionStatus): Promise<void> {
  await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(status));
}

/**
 * Request HealthKit permissions with a step-by-step explanation flow.
 * Returns the granted status.
 *
 * Real implementation (when expo-health installed):
 * const { status } = await Health.requestPermissionsAsync({
 *   read: [
 *     Health.HealthDataType.HeartRateVariabilitySDNN,
 *     Health.HealthDataType.RestingHeartRate,
 *     Health.HealthDataType.Vo2Max,
 *     Health.HealthDataType.SleepAnalysis,
 *     Health.HealthDataType.RespiratoryRate,
 *     Health.HealthDataType.Steps,
 *     Health.HealthDataType.MindfulSession,
 *     Health.HealthDataType.BloodGlucose,
 *   ],
 * });
 */
export function requestHealthKitPermissions(): Promise<PermissionStatus> {
  return new Promise((resolve) => {
    if (!isHealthKitAvailable()) {
      const status: PermissionStatus = {
        granted: false,
        categories: { heart: false, sleep: false, activity: false, glucose: false },
      };
      resolve(status);
      return;
    }

    // Step 1: Show benefits explanation
    Alert.alert(
      'Connect Apple Health',
      'Vitalspan reads from Apple Health to populate your longevity dashboard:\n\n• Heart Rate Variability (HRV)\n• Sleep analysis & stages\n• VO₂ max & fitness\n• Resting heart rate\n• Blood glucose (if available)\n\nNo data is sent to any server — everything stays on your device.',
      [
        {
          text: 'Not now',
          style: 'cancel',
          onPress: () => {
            const status: PermissionStatus = {
              granted: false,
              categories: { heart: false, sleep: false, activity: false, glucose: false },
            };
            savePermissionStatus(status).catch(() => null);
            resolve(status);
          },
        },
        {
          text: 'Allow Access',
          onPress: () => {
            // Mock: simulate iOS HealthKit permission prompt result
            // In real implementation, the system prompt fires here
            const status: PermissionStatus = {
              granted: true,
              categories: { heart: true, sleep: true, activity: true, glucose: true },
              requestedAt: new Date().toISOString(),
            };
            savePermissionStatus(status)
              .then(() => resolve(status))
              .catch(() => resolve(status));
          },
        },
      ],
    );
  });
}

/** Generate realistic mock HealthKit data for simulator / demo mode. */
function generateMockData(): HealthData {
  // Realistic ranges for a health-conscious person in their 30s–40s
  const hrv = 48 + Math.round(Math.random() * 28); // 48–76 ms (good range)
  const rhr = 52 + Math.round(Math.random() * 14); // 52–66 bpm
  const vo2max = 44 + Math.round(Math.random() * 16 * 10) / 10; // 44–60
  const sleepTotal = 6.8 + Math.round(Math.random() * 1.8 * 10) / 10; // 6.8–8.6h
  const sleepDeep = Math.round(sleepTotal * (0.12 + Math.random() * 0.08) * 10) / 10;
  const sleepRem = Math.round(sleepTotal * (0.18 + Math.random() * 0.07) * 10) / 10;
  const steps = 7200 + Math.round(Math.random() * 5800); // 7200–13000/day
  const recovery = Math.min(100, Math.round(55 + (hrv - 48) * 1.2 + Math.random() * 10));
  const glucose = 82 + Math.round(Math.random() * 14); // 82–96 mg/dL fasting

  return {
    hrv,
    restingHeartRate: rhr,
    vo2max,
    sleepHours: sleepTotal,
    sleepDeep,
    sleepRem,
    respiratoryRate: 13 + Math.round(Math.random() * 3),
    steps,
    mindfulMinutes: Math.round(Math.random() * 60),
    glucose,
    recovery,
    lastSynced: new Date().toISOString(),
    isDemoMode: true,
  };
}

/**
 * Pull latest data from HealthKit (or mock) and persist to AsyncStorage.
 */
export async function syncHealthData(): Promise<SyncResult> {
  // Real implementation (expo-health):
  // const granted = await requestHealthKitPermissions();
  // if (!granted.granted) return { success: false, error: 'Permission denied' };
  // ... read from Health SDK ...

  const perms = await loadPermissionStatus();
  if (!perms?.granted) {
    return { success: false, error: 'Permission not granted' };
  }

  // Mock sync — generates realistic data
  const data = generateMockData();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return { success: true, data, isDemoMode: true };
}

/**
 * Connect Apple Health: request permissions then immediately sync.
 * Returns the synced data on success.
 */
export async function connectAndSync(): Promise<SyncResult> {
  const perms = await requestHealthKitPermissions();
  if (!perms.granted) {
    return { success: false, error: 'Permission denied by user' };
  }
  return syncHealthData();
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

/**
 * Derive a health state label from HealthData for NeuralGrid tone.
 * neutral → no data
 * good    → high HRV, good sleep
 * poor    → low HRV or poor sleep
 * stressed → very low HRV
 */
export type HealthState = 'neutral' | 'good' | 'poor' | 'stressed';

export function deriveHealthState(data: HealthData | null): HealthState {
  if (!data) return 'neutral';
  const { hrv, sleepHours, recovery } = data;
  if (hrv == null && sleepHours == null) return 'neutral';
  const score = recovery ?? (hrv != null ? (hrv > 60 ? 80 : hrv > 40 ? 55 : 35) : 50);
  if (score >= 70) return 'good';
  if (score >= 45) return 'poor';
  return 'stressed';
}

/** Format last sync time nicely. */
export function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Never synced';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 2) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
