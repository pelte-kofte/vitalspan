import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ExerciseLogEntry } from '../data/exercises';
import type { TodayDataSnapshot, DeepReadonly } from '../types/todayData';
import { loadBiomarkerHistory } from './biomarkerEntryService';
import type { AuthRequestScope } from './authSessionCoordinator';
import { loadHealthData, type HealthData } from './healthkit';
import {
  PROTOCOL_STORAGE_KEY,
  parseProtocolState,
  protocolDayKey,
} from './protocolPersistence';
import {
  captureAuthRequestScope,
  isAuthRequestScopeCurrent,
} from './supabase';
import {
  USER_PROFILE_CACHE_KEY,
  isCompleteUserProfile,
  type UserProfile,
} from './userProfilePersistence';
import type { StoredEntry } from '../types/biomarkerEntry';

const EXERCISE_LOG_STORAGE_KEY = '@vitalspan_exercise_log';

interface TodayDataStorage {
  getItem(key: string): Promise<string | null>;
}

export interface TodayDataDependencies {
  readonly storage: TodayDataStorage;
  readonly loadBiomarkers: (forceRefresh: boolean) => Promise<StoredEntry[]>;
  readonly loadConnectedHealth: () => Promise<HealthData | null>;
  readonly captureScope: () => AuthRequestScope | null;
  readonly isScopeCurrent: (scope: AuthRequestScope) => boolean;
  readonly now: () => Date;
}

export interface TodayDataLoadOptions {
  readonly forceBiomarkerRefresh?: boolean;
}

const DEFAULT_DEPENDENCIES: TodayDataDependencies = {
  storage: AsyncStorage,
  loadBiomarkers: loadBiomarkerHistory,
  loadConnectedHealth: loadHealthData,
  captureScope: captureAuthRequestScope,
  isScopeCurrent: isAuthRequestScopeCurrent,
  now: () => new Date(),
};

function parseProfile(raw: string | null): UserProfile | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isCompleteUserProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function parseExerciseLogs(raw: string | null): ExerciseLogEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as ExerciseLogEntry[] : [];
  } catch {
    return [];
  }
}

function cloneAndFreeze<T>(value: T): DeepReadonly<T> {
  if (Array.isArray(value)) {
    const items = value.map(item => cloneAndFreeze(item));
    return Object.freeze(items) as DeepReadonly<T>;
  }
  if (value !== null && typeof value === 'object') {
    const copy = Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cloneAndFreeze(child)]),
    );
    return Object.freeze(copy) as DeepReadonly<T>;
  }
  return value as DeepReadonly<T>;
}

export async function loadTodayDataSnapshot(
  options: TodayDataLoadOptions = {},
  dependencies: TodayDataDependencies = DEFAULT_DEPENDENCIES,
): Promise<TodayDataSnapshot | null> {
  const scope = dependencies.captureScope();
  if (!scope) return null;

  const [
    profileRaw,
    biomarkerEntries,
    protocolRaw,
    exerciseLogRaw,
    healthData,
  ] = await Promise.all([
    dependencies.storage.getItem(USER_PROFILE_CACHE_KEY),
    dependencies.loadBiomarkers(options.forceBiomarkerRefresh === true),
    dependencies.storage.getItem(PROTOCOL_STORAGE_KEY),
    dependencies.storage.getItem(EXERCISE_LOG_STORAGE_KEY),
    dependencies.loadConnectedHealth(),
  ]);

  if (!dependencies.isScopeCurrent(scope)) return null;

  const capturedAt = dependencies.now();
  return cloneAndFreeze({
    capturedAt: capturedAt.toISOString(),
    localDay: protocolDayKey(capturedAt),
    profile: parseProfile(profileRaw),
    biomarkerEntries,
    protocol: parseProtocolState(protocolRaw, capturedAt).state,
    exerciseLogs: parseExerciseLogs(exerciseLogRaw),
    healthData,
  });
}
