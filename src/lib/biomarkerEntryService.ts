import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthRequestScope } from './authSessionCoordinator';
import {
  captureAuthRequestScope,
  isAuthRequestScopeCurrent,
  supabase,
} from './supabase';
import { canonicalBiomarkerId, type StoredEntry } from '../types/biomarkerEntry';

const BIOMARKER_STORAGE_KEY = '@vitalspan_biomarkers';

interface BiomarkerEntryRow {
  id: string;
  biomarker_id: string;
  value: number;
  date: string;
  source: string | null;
  notes: string | null;
  unit: string | null;
  reported_value: number | null;
  reported_unit: string | null;
  source_lab_range_lower: number | null;
  source_lab_range_upper: number | null;
  source_lab_range_unit: string | null;
  source_lab_range_reported_text: string | null;
  source_lab_name: string | null;
}

interface RemoteHistoryCache {
  scopeKey: string;
  rows: BiomarkerEntryRow[];
}

let remoteCache: RemoteHistoryCache | null = null;
let remoteRequest: { scopeKey: string; promise: Promise<BiomarkerEntryRow[]> } | null = null;

function scopeKey(scope: AuthRequestScope): string {
  return `${scope.userId}:${scope.generation}`;
}

function parseLocalEntries(raw: string | null): StoredEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? (parsed as StoredEntry[]).map(entry => ({
          ...entry,
          biomarkerId: canonicalBiomarkerId(entry.biomarkerId),
        }))
      : [];
  } catch {
    return [];
  }
}

function mapRemoteRow(row: BiomarkerEntryRow, local?: StoredEntry): StoredEntry {
  const lowerBound = row.source_lab_range_lower ?? local?.sourceLabRange?.lowerBound;
  const upperBound = row.source_lab_range_upper ?? local?.sourceLabRange?.upperBound;
  const rangeUnit = row.source_lab_range_unit ?? local?.sourceLabRange?.unit;
  const hasRange = rangeUnit !== undefined
    && rangeUnit !== null
    && (lowerBound !== undefined || upperBound !== undefined);
  const reportedValue = row.reported_value ?? local?.reportedValue;
  const reportedUnit = row.reported_unit ?? local?.reportedUnit;

  return {
    id: row.id,
    biomarkerId: canonicalBiomarkerId(row.biomarker_id),
    value: row.value,
    date: row.date,
    source: row.source ?? '',
    notes: row.notes ?? '',
    ...(row.unit ?? local?.unit ? { unit: row.unit ?? local?.unit } : {}),
    ...(reportedValue === undefined || reportedValue === null ? {} : { reportedValue }),
    ...(reportedUnit ? { reportedUnit } : {}),
    ...(hasRange ? {
      sourceLabRange: {
        ...(lowerBound === undefined || lowerBound === null ? {} : { lowerBound }),
        ...(upperBound === undefined || upperBound === null ? {} : { upperBound }),
        unit: rangeUnit as string,
        ...((row.source_lab_range_reported_text ?? local?.sourceLabRange?.reportedText)
          ? { reportedText: row.source_lab_range_reported_text ?? local?.sourceLabRange?.reportedText }
          : {}),
        ...((row.source_lab_name ?? local?.sourceLabRange?.laboratoryName)
          ? { laboratoryName: row.source_lab_name ?? local?.sourceLabRange?.laboratoryName }
          : {}),
      },
    } : {}),
  };
}

async function fetchRemoteRows(
  scope: AuthRequestScope,
  forceRefresh: boolean,
): Promise<BiomarkerEntryRow[]> {
  const key = scopeKey(scope);
  if (!forceRefresh && remoteCache?.scopeKey === key) return remoteCache.rows;
  if (!forceRefresh && remoteRequest?.scopeKey === key) return remoteRequest.promise;

  const promise = (async () => {
    const { data, error } = await supabase
      .from('biomarker_entries')
      .select([
        'id',
        'biomarker_id',
        'value',
        'date',
        'source',
        'notes',
        'unit',
        'reported_value',
        'reported_unit',
        'source_lab_range_lower',
        'source_lab_range_upper',
        'source_lab_range_unit',
        'source_lab_range_reported_text',
        'source_lab_name',
      ].join(', '));
    if (error) throw new Error(error.message);
    if (!isAuthRequestScopeCurrent(scope)) return [];
    const rows = (data ?? []) as unknown as BiomarkerEntryRow[];
    remoteCache = { scopeKey: key, rows };
    return rows;
  })();

  remoteRequest = { scopeKey: key, promise };
  try {
    return await promise;
  } finally {
    if (remoteRequest?.promise === promise) remoteRequest = null;
  }
}

/**
 * Loads the current user's biomarker history once per auth generation, merges
 * locally pending writes, and returns one account-isolated view. Explicit
 * refresh bypasses only the in-memory remote cache. The remote response is not
 * persisted here: a logout can race an AsyncStorage write, so screens keep the
 * hydrated result in memory and the write paths remain the only local writers.
 */
export async function loadBiomarkerHistory(forceRefresh = false): Promise<StoredEntry[]> {
  const scope = captureAuthRequestScope();
  if (!scope) return [];

  const raw = await AsyncStorage.getItem(BIOMARKER_STORAGE_KEY).catch(() => null);
  if (!isAuthRequestScopeCurrent(scope)) return [];
  const localEntries = parseLocalEntries(raw);

  try {
    const rows = await fetchRemoteRows(scope, forceRefresh);
    if (!isAuthRequestScopeCurrent(scope)) return [];

    const localById = new Map(localEntries.map(entry => [entry.id, entry]));
    const merged = rows.map(row => mapRemoteRow(row, localById.get(row.id)));
    const remoteIds = new Set(rows.map(row => row.id));
    for (const entry of localEntries) {
      if (!remoteIds.has(entry.id)) merged.push(entry);
    }

    return isAuthRequestScopeCurrent(scope) ? merged : [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[biomarkerEntryService] remote history unavailable, using local cache:', message);
    return isAuthRequestScopeCurrent(scope) ? localEntries : [];
  }
}

export function clearBiomarkerHistoryCache(): void {
  remoteCache = null;
  remoteRequest = null;
}
