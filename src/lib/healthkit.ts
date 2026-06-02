/**
 * HealthKit integration layer.
 *
 * Real HealthKit reads via react-native-health (Agency Enterprise).
 * Requires EAS build — does not run in Expo Go.
 * Entitlement: com.apple.developer.healthkit (set in app.json)
 *
 * Data types read: HRV (RMSSD), resting HR, VO2max, sleep analysis,
 * respiratory rate, steps, mindful minutes, blood glucose.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';

const STORAGE_KEY = '@vitalspan_health_data';
const PERMISSIONS_KEY = '@vitalspan_health_permissions';

/**
 * Module-level initialization guard.
 * Reads must not execute before initHealthKit callback fires (Pitfall 2).
 */
let _isInitialized = false;

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
  hasRequestedHealthKit?: boolean; // first-visit gate flag (D-05); Plan 03 depends on this field
}

export interface SyncResult {
  success: boolean;
  data?: HealthData;
  error?: string;
  isDemoMode?: boolean;
}

const PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.Vo2Max,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.MindfulSession,
      AppleHealthKit.Constants.Permissions.BloodGlucose,
    ],
    write: [],
  },
};

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
 * Request HealthKit permissions via AppleHealthKit.initHealthKit.
 * Calls the iOS system HealthKit permission prompt.
 * Sets _isInitialized = true on success so reads can proceed.
 *
 * NOTE: iOS does not report "denied" status to the app (privacy design).
 * If the user denies, initHealthKit may still succeed but reads return empty.
 * Per Pitfall 2: all reads are guarded by _isInitialized flag.
 */
export function requestHealthKitPermissions(): Promise<PermissionStatus> {
  return new Promise((resolve) => {
    if (!isHealthKitAvailable()) {
      const status: PermissionStatus = {
        granted: false,
        categories: { heart: false, sleep: false, activity: false, glucose: false },
        hasRequestedHealthKit: false,
      };
      resolve(status);
      return;
    }

    AppleHealthKit.initHealthKit(PERMISSIONS, (error: string) => {
      if (error) {
        console.error('[HealthKit] initHealthKit error', error);
        _isInitialized = false;
        const status: PermissionStatus = {
          granted: false,
          categories: { heart: false, sleep: false, activity: false, glucose: false },
          requestedAt: new Date().toISOString(),
          hasRequestedHealthKit: true,
        };
        savePermissionStatus(status).catch(() => null);
        resolve(status);
        return;
      }

      _isInitialized = true;
      const status: PermissionStatus = {
        granted: true,
        categories: { heart: true, sleep: true, activity: true, glucose: true },
        requestedAt: new Date().toISOString(),
        hasRequestedHealthKit: true,
      };
      savePermissionStatus(status)
        .then(() => resolve(status))
        .catch(() => resolve(status));
    });
  });
}

/**
 * Wrap a react-native-health callback method into a Promise.
 * Returns undefined on error or empty results rather than throwing.
 */
function wrapSample<T>(
  fn: (opts: Record<string, unknown>, cb: (err: string, results: T[]) => void) => void,
  opts: Record<string, unknown>,
): Promise<T[]> {
  return new Promise((resolve) => {
    fn(opts, (err: string, results: T[]) => {
      if (err || !results) {
        resolve([]);
      } else {
        resolve(results);
      }
    });
  });
}

/**
 * Pull latest data from HealthKit and persist to AsyncStorage.
 * All 8 metric reads run concurrently via Promise.all.
 * Guard: returns error if _isInitialized is false (initHealthKit not yet called).
 */
export async function syncHealthData(): Promise<SyncResult> {
  if (!_isInitialized) {
    return { success: false, error: 'HealthKit not initialized — call requestHealthKitPermissions first' };
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  try {
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
      wrapSample<{ value: number }>(
        (o, cb) => AppleHealthKit.getHeartRateVariabilitySamples(o, cb),
        { startDate: sevenDaysAgo, limit: 1, ascending: false },
      ),
      wrapSample<{ value: number }>(
        (o, cb) => AppleHealthKit.getRestingHeartRateSamples(o, cb),
        { startDate: sevenDaysAgo, limit: 1, ascending: false },
      ),
      wrapSample<{ value: number }>(
        (o, cb) => AppleHealthKit.getVo2MaxSamples(o, cb),
        { startDate: thirtyDaysAgo, limit: 1, ascending: false, unit: 'ml/(kg * min)' },
      ),
      wrapSample<{ value: string; startDate: string; endDate: string }>(
        (o, cb) => AppleHealthKit.getSleepSamples(o, cb),
        { startDate: yesterday },
      ),
      wrapSample<{ value: number }>(
        (o, cb) => AppleHealthKit.getRespiratoryRateSamples(o, cb),
        { startDate: sevenDaysAgo, limit: 1, ascending: false },
      ),
      wrapSample<{ value: number }>(
        (o, cb) => AppleHealthKit.getDailyStepCountSamples(o, cb),
        { startDate: sevenDaysAgo },
      ),
      wrapSample<{ startDate: string; endDate: string }>(
        (o, cb) => AppleHealthKit.getMindfulSession(o, cb),
        { startDate: sevenDaysAgo },
      ),
      wrapSample<{ value: number }>(
        (o, cb) => AppleHealthKit.getBloodGlucoseSamples(o, cb),
        { startDate: sevenDaysAgo, limit: 1, ascending: false },
      ),
    ]);

    // HRV: react-native-health returns seconds; multiply × 1000 for ms (Pitfall 6)
    const hrv = hrvResults.length > 0
      ? Math.round(hrvResults[0].value * 1000)
      : undefined;

    const restingHeartRate = restingHRResults.length > 0
      ? restingHRResults[0].value
      : undefined;

    const vo2max = vo2maxResults.length > 0
      ? vo2maxResults[0].value
      : undefined;

    // Sleep: aggregate deep, REM, and total (ASLEEP + CORE) from sample segments
    let sleepDeepMs = 0;
    let sleepRemMs = 0;
    let sleepTotalMs = 0;
    for (const s of sleepResults) {
      const dur = new Date(s.endDate).getTime() - new Date(s.startDate).getTime();
      if (s.value === 'DEEP') sleepDeepMs += dur;
      else if (s.value === 'REM') sleepRemMs += dur;
      else if (s.value === 'ASLEEP' || s.value === 'CORE') sleepTotalMs += dur;
    }
    const sleepHours = sleepTotalMs > 0 ? Math.round((sleepTotalMs / 3600000) * 10) / 10 : undefined;
    const sleepDeep = sleepDeepMs > 0 ? Math.round((sleepDeepMs / 3600000) * 10) / 10 : undefined;
    const sleepRem = sleepRemMs > 0 ? Math.round((sleepRemMs / 3600000) * 10) / 10 : undefined;

    const respiratoryRate = respiratoryResults.length > 0
      ? respiratoryResults[0].value
      : undefined;

    // Steps: 7-day average across daily samples
    const steps = stepsResults.length > 0
      ? Math.round(stepsResults.reduce((sum, r) => sum + r.value, 0) / stepsResults.length)
      : undefined;

    // Mindful minutes: sum session durations in ms then convert to minutes
    const mindfulMs = mindfulResults.reduce(
      (sum, r) => sum + (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()),
      0,
    );
    const mindfulMinutes = mindfulMs > 0 ? Math.round(mindfulMs / 60000) : undefined;

    const glucose = glucoseResults.length > 0
      ? glucoseResults[0].value
      : undefined;

    // Recovery composite: same formula as the original mock
    const recovery = Math.min(100, Math.round(55 + ((hrv ?? 50) - 48) * 1.2));

    const data: HealthData = {
      hrv,
      restingHeartRate,
      vo2max,
      sleepHours,
      sleepDeep,
      sleepRem,
      respiratoryRate,
      steps,
      mindfulMinutes,
      glucose,
      recovery,
      lastSynced: new Date().toISOString(),
      // isDemoMode intentionally absent — real data has no demo flag
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { success: true, data };
  } catch (e) {
    console.error('[HealthKit] syncHealthData error', e);
    return { success: false, error: 'HealthKit read failed' };
  }
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
