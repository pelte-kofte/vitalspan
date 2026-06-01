import { supabase } from './supabase';
import { StoredEntry } from '../screens/BiomarkerEntryScreen';

/**
 * Write service for biomarker entries in Supabase.
 *
 * Owns all write operations against the `biomarker_entries` table.
 * Screens never call `supabase` directly — all write logic lives here.
 *
 * Functions:
 *   - syncEntry(entry): fire-and-forget insert for a single entry after AsyncStorage write.
 *   - migrateHistory(entries): bulk upsert for one-time migration on app start.
 *
 * Both functions catch all errors internally, warn via console.warn, and never
 * throw or reject to callers.
 */

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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn('[biomarkerWriteService] syncEntry: no authenticated user');
        return;
      }

      const { error } = await supabase.from('biomarker_entries').upsert(
        [
          {
            id: entry.id,
            user_id: user.id,
            biomarker_id: entry.biomarkerId,
            value: entry.value,
            date: entry.date,
            source: entry.source,
            notes: entry.notes,
          },
        ],
        { onConflict: 'id' }
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
 * Bulk upsert of all local biomarker entries into Supabase.
 *
 * Designed for the one-time migration on first app launch after Supabase is
 * provisioned. Safe to retry: upsert with onConflict: 'id' is idempotent.
 *
 * - Returns immediately (resolves) when entries array is empty.
 * - Warns and returns (resolves) when no authenticated user is present.
 * - Catches all errors, warns, and resolves (never rejects).
 */
export async function migrateHistory(entries: StoredEntry[]): Promise<void> {
  try {
    if (entries.length === 0) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('[biomarkerWriteService] migrateHistory: no authenticated user');
      return;
    }

    const rows = entries.map((e) => ({
      id: e.id,
      user_id: user.id,
      biomarker_id: e.biomarkerId,
      value: e.value,
      date: e.date,
      source: e.source,
      notes: e.notes,
    }));

    const { error } = await supabase
      .from('biomarker_entries')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.warn('[biomarkerWriteService] migrateHistory failed:', error.message);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[biomarkerWriteService] migrateHistory unexpected error:', message);
  }
}
