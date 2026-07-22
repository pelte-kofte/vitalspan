/**
 * HealthKit integration via @kingstinct/react-native-healthkit (Nitro Modules, New Architecture).
 * Replaces react-native-health (old Bridge API — incompatible with RN New Arch / reanimated v4).
 *
 * Data types read: HRV (SDNN ms), resting HR, VO2max, sleep analysis,
 * respiratory rate, steps, mindful minutes, blood glucose.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isHealthDataAvailable,
  requestAuthorization,
  queryQuantitySamples,
  queryCategorySamples,
  CategoryValueSleepAnalysis,
} from '@kingstinct/react-native-healthkit';
import type { ObjectTypeIdentifier } from '@kingstinct/react-native-healthkit';
import type { AuthRequestScope } from './authSessionCoordinator';
import { captureAuthRequestScope, isAuthRequestScopeCurrent } from './supabase';

const STORAGE_KEY = '@vitalspan_health_data';
const PERMISSIONS_KEY = '@vitalspan_health_permissions';

const READ_TYPES: readonly ObjectTypeIdentifier[] = [
  'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
  'HKQuantityTypeIdentifierRestingHeartRate',
  'HKQuantityTypeIdentifierVO2Max',
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKQuantityTypeIdentifierRespiratoryRate',
  'HKQuantityTypeIdentifierStepCount',
  'HKCategoryTypeIdentifierMindfulSession',
  'HKQuantityTypeIdentifierBloodGlucose',
];

export interface HealthData {
  /** Provenance lets the Health OS distinguish HealthKit from a wearable adapter. */
  source?: 'healthkit' | 'wearable';
  hrv?: number;               // ms, SDNN
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
  isDemoMode?: boolean;
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
  hasRequestedHealthKit?: boolean;
}

export interface SyncResult {
  success: boolean;
  data?: HealthData;
  error?: string;
  isDemoMode?: boolean;
}

export type HealthState = 'neutral' | 'good' | 'poor' | 'stressed';

export function isHealthKitAvailable(): boolean {
  return Platform.OS === 'ios' && isHealthDataAvailable();
}

export async function loadPermissionStatus(): Promise<PermissionStatus | null> {
  const scope = captureAuthRequestScope();
  if (!scope) return null;
  try {
    const raw = await AsyncStorage.getItem(PERMISSIONS_KEY);
    if (!isAuthRequestScopeCurrent(scope)) return null;
    return raw ? (JSON.parse(raw) as PermissionStatus) : null;
  } catch {
    return null;
  }
}

async function savePermissionStatus(status: PermissionStatus, scope: AuthRequestScope): Promise<void> {
  if (!isAuthRequestScopeCurrent(scope)) return;
  await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(status)).catch(() => null);
}

export async function requestHealthKitPermissions(
  expectedScope: AuthRequestScope | null = captureAuthRequestScope(),
): Promise<PermissionStatus> {
  const unavailable: PermissionStatus = {
    granted: false,
    categories: { heart: false, sleep: false, activity: false, glucose: false },
  };
  if (!expectedScope || !isAuthRequestScopeCurrent(expectedScope)) return unavailable;
  try {
    await requestAuthorization({ toRead: READ_TYPES });
    const status: PermissionStatus = {
      granted: true,
      categories: { heart: true, sleep: true, activity: true, glucose: true },
      requestedAt: new Date().toISOString(),
      hasRequestedHealthKit: true,
    };
    await savePermissionStatus(status, expectedScope);
    return status;
  } catch (e) {
    console.error('[healthkit requestHealthKitPermissions]', e);
    const denied: PermissionStatus = {
      granted: false,
      categories: { heart: false, sleep: false, activity: false, glucose: false },
      requestedAt: new Date().toISOString(),
      hasRequestedHealthKit: true,
    };
    await savePermissionStatus(denied, expectedScope);
    return denied;
  }
}

export async function syncHealthData(
  expectedScope: AuthRequestScope | null = captureAuthRequestScope(),
): Promise<SyncResult> {
  if (!expectedScope || !isAuthRequestScopeCurrent(expectedScope)) {
    return { success: false, error: 'Authentication session changed' };
  }
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      hrvResults,
      restingHRResults,
      vo2maxResults,
      sleepResults,
      respiratoryResults,
      stepsResults,
      mindfulResults,
      glucoseResults,
    ] = await Promise.all([
      queryQuantitySamples('HKQuantityTypeIdentifierHeartRateVariabilitySDNN', {
        limit: 1, ascending: false, filter: { date: { startDate: sevenDaysAgo } },
      }),
      queryQuantitySamples('HKQuantityTypeIdentifierRestingHeartRate', {
        limit: 1, ascending: false, filter: { date: { startDate: sevenDaysAgo } },
      }),
      queryQuantitySamples('HKQuantityTypeIdentifierVO2Max', {
        limit: 1, ascending: false, filter: { date: { startDate: thirtyDaysAgo } },
      }),
      queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', {
        limit: 0, ascending: false, filter: { date: { startDate: yesterday } },
      }),
      queryQuantitySamples('HKQuantityTypeIdentifierRespiratoryRate', {
        limit: 1, ascending: false, filter: { date: { startDate: sevenDaysAgo } },
      }),
      queryQuantitySamples('HKQuantityTypeIdentifierStepCount', {
        limit: 0, ascending: false, filter: { date: { startDate: sevenDaysAgo } },
      }),
      queryCategorySamples('HKCategoryTypeIdentifierMindfulSession', {
        limit: 0, ascending: false, filter: { date: { startDate: sevenDaysAgo } },
      }),
      queryQuantitySamples('HKQuantityTypeIdentifierBloodGlucose', {
        limit: 1, ascending: false, filter: { date: { startDate: sevenDaysAgo } },
      }),
    ]);

    // HRV: SDNN already in ms (library default unit)
    const hrv = hrvResults.length > 0 ? Math.round(hrvResults[0].quantity) : undefined;

    const restingHeartRate = restingHRResults.length > 0 ? restingHRResults[0].quantity : undefined;
    const vo2max = vo2maxResults.length > 0 ? vo2maxResults[0].quantity : undefined;

    // Sleep: aggregate CORE/DEEP/REM/legacy-asleep into total; DEEP and REM tracked separately
    let sleepDeepMs = 0;
    let sleepRemMs = 0;
    let sleepTotalMs = 0;
    for (const s of sleepResults) {
      const dur = s.endDate.getTime() - s.startDate.getTime();
      if (s.value === CategoryValueSleepAnalysis.asleepDeep) {
        sleepDeepMs += dur; sleepTotalMs += dur;
      } else if (s.value === CategoryValueSleepAnalysis.asleepREM) {
        sleepRemMs += dur; sleepTotalMs += dur;
      } else if (
        s.value === CategoryValueSleepAnalysis.asleepCore ||
        s.value === CategoryValueSleepAnalysis.asleepUnspecified
      ) {
        sleepTotalMs += dur;
      }
    }
    const sleepHours = sleepTotalMs > 0 ? Math.round((sleepTotalMs / 3600000) * 10) / 10 : undefined;
    const sleepDeep = sleepDeepMs > 0 ? Math.round((sleepDeepMs / 3600000) * 10) / 10 : undefined;
    const sleepRem = sleepRemMs > 0 ? Math.round((sleepRemMs / 3600000) * 10) / 10 : undefined;

    // Respiratory rate: library default unit is count/s — convert to breaths/min
    const respiratoryRate = respiratoryResults.length > 0
      ? Math.round(respiratoryResults[0].quantity * 60)
      : undefined;

    // Steps: 7-day average across daily samples
    const steps = stepsResults.length > 0
      ? Math.round(stepsResults.reduce((sum, r) => sum + r.quantity, 0) / stepsResults.length)
      : undefined;

    // Mindful minutes: sum session durations
    const mindfulMs = mindfulResults.reduce(
      (sum, r) => sum + (r.endDate.getTime() - r.startDate.getTime()),
      0,
    );
    const mindfulMinutes = mindfulMs > 0 ? Math.round(mindfulMs / 60000) : undefined;

    const glucose = glucoseResults.length > 0 ? glucoseResults[0].quantity : undefined;

    const recovery = Math.min(100, Math.round(55 + ((hrv ?? 50) - 48) * 1.2));

    const data: HealthData = {
      source: 'healthkit',
      hrv, restingHeartRate, vo2max,
      sleepHours, sleepDeep, sleepRem,
      respiratoryRate, steps, mindfulMinutes,
      glucose, recovery,
      lastSynced: now.toISOString(),
    };

    if (!isAuthRequestScopeCurrent(expectedScope)) {
      return { success: false, error: 'Authentication session changed' };
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { success: true, data };
  } catch (e) {
    console.error('[healthkit syncHealthData]', e);
    return { success: false, error: String(e) };
  }
}

export async function connectAndSync(): Promise<SyncResult> {
  const scope = captureAuthRequestScope();
  if (!scope) return { success: false, error: 'Authentication required' };
  await requestHealthKitPermissions(scope);
  if (!isAuthRequestScopeCurrent(scope)) {
    return { success: false, error: 'Authentication session changed' };
  }
  return syncHealthData(scope);
}

export async function loadHealthData(): Promise<HealthData | null> {
  const scope = captureAuthRequestScope();
  if (!scope) return null;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!isAuthRequestScopeCurrent(scope)) return null;
    return raw ? (JSON.parse(raw) as HealthData) : null;
  } catch {
    return null;
  }
}

export function isHealthDataStale(data: HealthData): boolean {
  if (!data.lastSynced) return true;
  return Date.now() - new Date(data.lastSynced).getTime() > 4 * 60 * 60 * 1000;
}

export function deriveHealthState(data: HealthData | null): HealthState {
  if (!data?.hrv) return 'neutral';
  if (data.hrv >= 60) return 'good';
  if (data.hrv <= 30) return 'stressed';
  if (data.hrv <= 45) return 'poor';
  return 'neutral';
}

export function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Never synced';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
