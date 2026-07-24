import type { AuthRequestScope } from '../lib/authSessionCoordinator';
import type { StoredEntry } from '../types/biomarkerEntry';

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();
const mockUpdateEntry = jest.fn();
const mockDeleteEntry = jest.fn();
const mockClearCache = jest.fn();
const mockIsScopeCurrent = jest.fn<boolean, [AuthRequestScope]>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: mockGetItem,
    setItem: mockSetItem,
    removeItem: mockRemoveItem,
  },
}));

jest.mock('../lib/biomarkerEntryService', () => ({
  clearBiomarkerHistoryCache: mockClearCache,
}));

jest.mock('../lib/biomarkerWriteService', () => ({
  updateEntry: mockUpdateEntry,
  deleteEntry: mockDeleteEntry,
}));

jest.mock('../lib/supabase', () => ({
  isAuthRequestScopeCurrent: mockIsScopeCurrent,
}));

import {
  persistBiomarkerEntryDeletion,
  persistBiomarkerEntryUpdate,
} from '../lib/biomarkerHistoryPersistence';

const scope: AuthRequestScope = { userId: 'user-a', generation: 8 };
const original: StoredEntry = {
  id: 'entry-1',
  biomarkerId: 'tsh',
  value: 2.1,
  unit: 'mIU/L',
  reportedValue: 2.1,
  reportedUnit: 'mIU/L',
  date: '2026-07-20T10:00:00.000Z',
  source: 'Lab PDF',
  notes: 'report.pdf',
  sourceLabRange: {
    lowerBound: 0.5,
    upperBound: 4.5,
    unit: 'mIU/L',
    reportedText: '0.5–4.5',
  },
};

describe('biomarker history edit and delete coordination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsScopeCurrent.mockReturnValue(true);
    mockGetItem.mockResolvedValue(JSON.stringify([original]));
    mockSetItem.mockResolvedValue(undefined);
    mockRemoveItem.mockResolvedValue(undefined);
    mockUpdateEntry.mockResolvedValue(true);
    mockDeleteEntry.mockResolvedValue(true);
  });

  test('updates the existing identity while preserving report provenance', async () => {
    const edited: StoredEntry = {
      ...original,
      value: 2.4,
      reportedValue: 2.4,
      date: '2026-07-21T10:00:00.000Z',
    };

    await expect(persistBiomarkerEntryUpdate(edited, scope)).resolves.toBe(true);

    const localHistory = JSON.parse(mockSetItem.mock.calls[0][1]) as StoredEntry[];
    expect(localHistory).toEqual([edited]);
    expect(localHistory[0].sourceLabRange).toEqual(original.sourceLabRange);
    expect(mockUpdateEntry).toHaveBeenCalledWith(edited, scope);
    expect(mockClearCache).toHaveBeenCalledTimes(1);
  });

  test('deletes only the selected entry', async () => {
    const other = { ...original, id: 'entry-2' };
    mockGetItem.mockResolvedValue(JSON.stringify([original, other]));

    await expect(persistBiomarkerEntryDeletion(original.id, scope)).resolves.toBe(true);

    const localHistory = JSON.parse(mockSetItem.mock.calls[0][1]) as StoredEntry[];
    expect(localHistory).toEqual([other]);
    expect(mockDeleteEntry).toHaveBeenCalledWith(original.id, scope);
    expect(mockClearCache).toHaveBeenCalledTimes(1);
  });

  test('restores local history when a remote edit fails', async () => {
    mockUpdateEntry.mockResolvedValue(false);
    const edited = { ...original, value: 2.4, reportedValue: 2.4 };

    await expect(persistBiomarkerEntryUpdate(edited, scope)).resolves.toBe(false);

    expect(mockSetItem).toHaveBeenNthCalledWith(
      2,
      '@vitalspan_biomarkers',
      JSON.stringify([original]),
    );
    expect(mockClearCache).not.toHaveBeenCalled();
  });

  test('restores local history when a remote delete fails', async () => {
    mockDeleteEntry.mockResolvedValue(false);

    await expect(persistBiomarkerEntryDeletion(original.id, scope)).resolves.toBe(false);

    expect(mockSetItem).toHaveBeenNthCalledWith(
      2,
      '@vitalspan_biomarkers',
      JSON.stringify([original]),
    );
    expect(mockClearCache).not.toHaveBeenCalled();
  });

  test('does not mutate storage for a stale account scope', async () => {
    mockIsScopeCurrent.mockReturnValue(false);

    await expect(persistBiomarkerEntryDeletion(original.id, scope)).resolves.toBe(false);

    expect(mockGetItem).not.toHaveBeenCalled();
    expect(mockSetItem).not.toHaveBeenCalled();
    expect(mockDeleteEntry).not.toHaveBeenCalled();
  });
});
