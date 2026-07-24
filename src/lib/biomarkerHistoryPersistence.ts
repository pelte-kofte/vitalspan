import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthRequestScope } from './authSessionCoordinator';
import {
  clearBiomarkerHistoryCache,
} from './biomarkerEntryService';
import {
  deleteEntry,
  updateEntry,
} from './biomarkerWriteService';
import { isAuthRequestScopeCurrent } from './supabase';
import type { StoredEntry } from '../types/biomarkerEntry';

const BIOMARKER_STORAGE_KEY = '@vitalspan_biomarkers';

function parseStoredEntries(raw: string | null): StoredEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed as StoredEntry[] : [];
  } catch {
    return [];
  }
}

async function restoreLocalHistory(
  previousRaw: string | null,
  scope: AuthRequestScope,
): Promise<void> {
  if (!isAuthRequestScopeCurrent(scope)) return;
  if (previousRaw === null) {
    await AsyncStorage.removeItem(BIOMARKER_STORAGE_KEY);
  } else {
    await AsyncStorage.setItem(BIOMARKER_STORAGE_KEY, previousRaw);
  }
}

/**
 * Coordinates an edit across the existing local history array and the
 * user-owned remote row. The StoredEntry shape and identity remain unchanged.
 */
export async function persistBiomarkerEntryUpdate(
  entry: StoredEntry,
  scope: AuthRequestScope,
): Promise<boolean> {
  if (!isAuthRequestScopeCurrent(scope)) return false;
  const previousRaw = await AsyncStorage.getItem(BIOMARKER_STORAGE_KEY);
  if (!isAuthRequestScopeCurrent(scope)) return false;
  const entries = parseStoredEntries(previousRaw);
  const existingIndex = entries.findIndex(candidate => candidate.id === entry.id);
  const next = [...entries];
  if (existingIndex >= 0) next[existingIndex] = entry;
  else next.push(entry);

  await AsyncStorage.setItem(BIOMARKER_STORAGE_KEY, JSON.stringify(next));
  if (!isAuthRequestScopeCurrent(scope)) return false;
  const updated = await updateEntry(entry, scope);
  if (!updated) {
    await restoreLocalHistory(previousRaw, scope).catch(() => undefined);
    return false;
  }
  clearBiomarkerHistoryCache();
  return true;
}

/**
 * Coordinates deletion across the existing local history array and the
 * user-owned remote row. On a remote failure, the prior local history is
 * restored so the result is never silently hidden on only one storage layer.
 */
export async function persistBiomarkerEntryDeletion(
  id: string,
  scope: AuthRequestScope,
): Promise<boolean> {
  if (!isAuthRequestScopeCurrent(scope)) return false;
  const previousRaw = await AsyncStorage.getItem(BIOMARKER_STORAGE_KEY);
  if (!isAuthRequestScopeCurrent(scope)) return false;
  const next = parseStoredEntries(previousRaw).filter(entry => entry.id !== id);

  await AsyncStorage.setItem(BIOMARKER_STORAGE_KEY, JSON.stringify(next));
  if (!isAuthRequestScopeCurrent(scope)) return false;
  const deleted = await deleteEntry(id, scope);
  if (!deleted) {
    await restoreLocalHistory(previousRaw, scope).catch(() => undefined);
    return false;
  }
  clearBiomarkerHistoryCache();
  return true;
}
