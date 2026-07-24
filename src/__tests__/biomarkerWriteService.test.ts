import type { AuthRequestScope } from '../lib/authSessionCoordinator';
import type { StoredEntry } from '../types/biomarkerEntry';

const mockUpsert = jest.fn();
const mockRpc = jest.fn();
const mockEq = jest.fn();
const mockDelete = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({
  upsert: mockUpsert,
  delete: mockDelete,
}));
const mockCaptureAuthRequestScope = jest.fn<AuthRequestScope | null, []>();
const mockIsAuthRequestScopeCurrent = jest.fn<boolean, [AuthRequestScope]>();
const mockRemoveItem = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { removeItem: mockRemoveItem },
}));

jest.mock('../lib/supabase', () => ({
  supabase: { from: mockFrom, rpc: mockRpc },
  captureAuthRequestScope: mockCaptureAuthRequestScope,
  isAuthRequestScopeCurrent: mockIsAuthRequestScopeCurrent,
}));

import {
  deleteEntry,
  markBiomarkerHistoryDirty,
  migrateHistory,
  syncEntry,
  updateEntry,
} from '../lib/biomarkerWriteService';
import { BIOMARKER_PERSISTENCE_MIGRATION_KEY } from '../lib/storageKeys';

const scope: AuthRequestScope = { userId: 'user-a', generation: 4 };
const entry: StoredEntry = {
  id: 'entry-1',
  biomarkerId: 'fastingglucose',
  value: 91,
  date: '2026-07-22',
  source: 'Blood test',
  notes: '',
};

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('biomarkerWriteService append-only persistence contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCaptureAuthRequestScope.mockReturnValue(scope);
    mockIsAuthRequestScopeCurrent.mockReturnValue(true);
    mockUpsert.mockResolvedValue({ error: null });
    mockEq.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({ error: null });
    mockRemoveItem.mockResolvedValue(undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('syncEntry remains fire-and-forget and uses retry-safe insert semantics', async () => {
    expect(syncEntry(entry)).toBeUndefined();
    await settle();

    expect(mockFrom).toHaveBeenCalledWith('biomarker_entries');
    expect(mockUpsert).toHaveBeenCalledWith(
      [expect.objectContaining({
        id: 'entry-1',
        biomarker_id: 'fastingglucose',
        value: 91,
        date: '2026-07-22',
        source: 'Blood test',
        notes: '',
      })],
      {
        onConflict: 'id',
        ignoreDuplicates: true,
        defaultToNull: false,
      },
    );
  });

  test('updates an existing user-owned entry through its stable identity', async () => {
    const edited = { ...entry, value: 93 };

    await expect(updateEntry(edited, scope)).resolves.toBe(true);

    expect(mockUpsert).toHaveBeenCalledWith(
      [expect.objectContaining({
        id: 'entry-1',
        biomarker_id: 'fastingglucose',
        value: 93,
      })],
      {
        onConflict: 'id',
        ignoreDuplicates: false,
        defaultToNull: false,
      },
    );
  });

  test('deletes an existing user-owned entry through its stable identity', async () => {
    await expect(deleteEntry(entry.id, scope)).resolves.toBe(true);

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockEq).toHaveBeenCalledWith('id', 'entry-1');
  });

  test('fails closed when edit or delete persistence is unavailable', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'network unavailable' } });
    mockEq.mockResolvedValue({ error: { message: 'network unavailable' } });

    await expect(updateEntry(entry, scope)).resolves.toBe(false);
    await expect(deleteEntry(entry.id, scope)).resolves.toBe(false);

    expect(console.warn).toHaveBeenCalledWith(
      '[biomarkerWriteService] updateEntry failed:',
      'network unavailable',
    );
    expect(console.warn).toHaveBeenCalledWith(
      '[biomarkerWriteService] deleteEntry failed:',
      'network unavailable',
    );
  });

  test('migrateHistory confirms successful and empty migrations', async () => {
    await expect(migrateHistory([entry], scope)).resolves.toBe(true);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith(
      'enrich_biomarker_entry_provenance',
      { p_entries: [expect.objectContaining({ id: 'entry-1' })] },
    );

    jest.clearAllMocks();
    await expect(migrateHistory([], scope)).resolves.toBe(true);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  test('marks changed local history for an idempotent startup retry', async () => {
    await markBiomarkerHistoryDirty(scope);
    expect(mockRemoveItem).toHaveBeenCalledWith(BIOMARKER_PERSISTENCE_MIGRATION_KEY);

    mockIsAuthRequestScopeCurrent.mockReturnValue(false);
    await markBiomarkerHistoryDirty(scope);
    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
  });

  test('migrateHistory reports remote failure without throwing', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'network unavailable' } });

    await expect(migrateHistory([entry], scope)).resolves.toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      '[biomarkerWriteService] migrateHistory failed:',
      'network unavailable',
    );
  });

  test('migrateHistory requires provenance enrichment to complete', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'enrichment unavailable' } });

    await expect(migrateHistory([entry], scope)).resolves.toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      '[biomarkerWriteService] provenance enrichment failed:',
      'enrichment unavailable',
    );
  });

  test('migrateHistory refuses stale authentication scopes before and after I/O', async () => {
    mockIsAuthRequestScopeCurrent.mockReturnValue(false);
    await expect(migrateHistory([entry], scope)).resolves.toBe(false);
    expect(mockFrom).not.toHaveBeenCalled();

    mockIsAuthRequestScopeCurrent
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    await expect(migrateHistory([entry], scope)).resolves.toBe(false);
  });
});
