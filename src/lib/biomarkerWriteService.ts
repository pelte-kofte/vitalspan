import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  captureAuthRequestScope,
  isAuthRequestScopeCurrent,
  supabase,
} from './supabase';
import type { AuthRequestScope } from './authSessionCoordinator';
import type { StoredEntry } from '../types/biomarkerEntry';
import { BIOMARKER_PERSISTENCE_MIGRATION_KEY } from './storageKeys';

const PROVENANCE_ENRICHMENT_BATCH_SIZE = 1000;

function toRemoteRow(entry: StoredEntry) {
  return {
    id: entry.id,
    biomarker_id: entry.biomarkerId,
    value: entry.value,
    date: entry.date,
    source: entry.source,
    notes: entry.notes,
    unit: entry.unit,
    reported_value: entry.reportedValue,
    reported_unit: entry.reportedUnit,
    source_lab_range_lower: entry.sourceLabRange?.lowerBound,
    source_lab_range_upper: entry.sourceLabRange?.upperBound,
    source_lab_range_unit: entry.sourceLabRange?.unit,
    source_lab_range_reported_text: entry.sourceLabRange?.reportedText,
    source_lab_name: entry.sourceLabRange?.laboratoryName,
  };
}

/**
 * Write service for biomarker entries in Supabase.
 *
 * Owns all write operations against the `biomarker_entries` table.
 * Screens never call `supabase` directly — all write logic lives here.
 *
 * Functions:
 *   - syncEntry(entry): fire-and-forget insert for a single entry after AsyncStorage write.
 *   - migrateHistory(entries): retry-safe bulk insert for local history migration.
 *   - markBiomarkerHistoryDirty(): schedules an idempotent startup retry.
 *
 * All functions catch their operational errors internally and never
 * throw or reject to callers.
 */

export async function markBiomarkerHistoryDirty(
  expectedScope: AuthRequestScope | null = captureAuthRequestScope(),
): Promise<void> {
  if (!expectedScope || !isAuthRequestScopeCurrent(expectedScope)) return;
  try {
    await AsyncStorage.removeItem(BIOMARKER_PERSISTENCE_MIGRATION_KEY);
  } catch (err: unknown) {
    if (!isAuthRequestScopeCurrent(expectedScope)) return;
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[biomarkerWriteService] failed to schedule history retry:', message);
  }
}

/**
 * Fire-and-forget write of a single biomarker entry to Supabase.
 *
 * Return type is void (not Promise<void>) — the fire-and-forget contract is
 * explicit: callers cannot accidentally await this function.
 *
 * Callers should invoke this immediately after AsyncStorage.setItem without
 * awaiting. Errors are absorbed and logged.
 */
export function syncEntry(entry: StoredEntry): void {
  async function _sync(): Promise<void> {
    try {
      const scope = captureAuthRequestScope();
      if (!scope) {
        console.warn('[biomarkerWriteService] syncEntry: no authenticated user');
        return;
      }

      const { error } = await supabase.from('biomarker_entries').upsert(
        [
          toRemoteRow(entry),
        ],
        {
          onConflict: 'id',
          ignoreDuplicates: true,
          defaultToNull: false,
        }
      );

      if (error) {
        console.warn('[biomarkerWriteService] syncEntry failed:', error.message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[biomarkerWriteService] syncEntry unexpected error:', message);
    }
  }

  _sync().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[biomarkerWriteService] syncEntry unhandled rejection:', message);
  });
}

/**
 * Retry-safe bulk insert of all local biomarker entries into Supabase.
 *
 * Designed for the one-time migration on first app launch after Supabase is
 * provisioned. Duplicate IDs are ignored rather than updated, preserving the
 * append-only database contract.
 *
 * - Returns true for an empty array or a confirmed successful insert.
 * - Returns false for missing/stale auth scope or a remote failure.
 * - Catches all errors and never rejects.
 */
export async function migrateHistory(
  entries: StoredEntry[],
  expectedScope: AuthRequestScope | null = captureAuthRequestScope(),
): Promise<boolean> {
  try {
    if (entries.length === 0) {
      return true;
    }

    if (!expectedScope || !isAuthRequestScopeCurrent(expectedScope)) {
      console.warn('[biomarkerWriteService] migrateHistory: no authenticated user');
      return false;
    }

    const rows = entries.map(toRemoteRow);

    if (!isAuthRequestScopeCurrent(expectedScope)) return false;
    const { error } = await supabase
      .from('biomarker_entries')
      .upsert(rows, {
        onConflict: 'id',
        ignoreDuplicates: true,
        defaultToNull: false,
      });

    if (!isAuthRequestScopeCurrent(expectedScope)) return false;

    if (error) {
      console.warn('[biomarkerWriteService] migrateHistory failed:', error.message);
      return false;
    }

    for (let offset = 0; offset < rows.length; offset += PROVENANCE_ENRICHMENT_BATCH_SIZE) {
      if (!isAuthRequestScopeCurrent(expectedScope)) return false;
      const { error: enrichmentError } = await supabase.rpc(
        'enrich_biomarker_entry_provenance',
        { p_entries: rows.slice(offset, offset + PROVENANCE_ENRICHMENT_BATCH_SIZE) },
      );

      if (!isAuthRequestScopeCurrent(expectedScope)) return false;

      if (enrichmentError) {
        console.warn('[biomarkerWriteService] provenance enrichment failed:', enrichmentError.message);
        return false;
      }
    }
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[biomarkerWriteService] migrateHistory unexpected error:', message);
    return false;
  }
}
