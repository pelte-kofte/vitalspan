import type { AuthRequestScope } from '../lib/authSessionCoordinator';

const mockGetItem = jest.fn();
const mockSelect = jest.fn();
const mockCaptureScope = jest.fn<AuthRequestScope | null, []>();
const mockIsScopeCurrent = jest.fn<boolean, [AuthRequestScope]>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: mockGetItem },
}));

jest.mock('../lib/supabase', () => ({
  supabase: { from: jest.fn(() => ({ select: mockSelect })) },
  captureAuthRequestScope: mockCaptureScope,
  isAuthRequestScopeCurrent: mockIsScopeCurrent,
}));

import {
  clearBiomarkerHistoryCache,
  loadBiomarkerHistory,
} from '../lib/biomarkerEntryService';

const scopeA: AuthRequestScope = { userId: 'user-a', generation: 3 };

describe('account-scoped biomarker history hydration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearBiomarkerHistoryCache();
    mockCaptureScope.mockReturnValue(scopeA);
    mockIsScopeCurrent.mockReturnValue(true);
    mockGetItem.mockResolvedValue(null);
    mockSelect.mockResolvedValue({ data: [], error: null });
  });

  test('performs one remote read per auth generation and supports explicit refresh', async () => {
    await loadBiomarkerHistory();
    await loadBiomarkerHistory();
    expect(mockSelect).toHaveBeenCalledTimes(1);

    await loadBiomarkerHistory(true);
    expect(mockSelect).toHaveBeenCalledTimes(2);
  });

  test('restores persisted source range and original reported value', async () => {
    mockSelect.mockResolvedValue({
      data: [{
        id: 'entry-1', biomarker_id: 'fastingglucose', value: 90.09,
        date: '2026-07-22', source: 'Hospital', notes: '', unit: 'mg/dL',
        reported_value: 5, reported_unit: 'mmol/L',
        source_lab_range_lower: 3.9, source_lab_range_upper: 5.5,
        source_lab_range_unit: 'mmol/L', source_lab_range_reported_text: '3.9–5.5',
        source_lab_name: 'Example Lab',
      }],
      error: null,
    });

    await expect(loadBiomarkerHistory()).resolves.toEqual([expect.objectContaining({
      reportedValue: 5,
      reportedUnit: 'mmol/L',
      sourceLabRange: {
        lowerBound: 3.9,
        upperBound: 5.5,
        unit: 'mmol/L',
        reportedText: '3.9–5.5',
        laboratoryName: 'Example Lab',
      },
    })]);
  });

  test('discards a response when the active auth generation changes', async () => {
    let resolve!: (value: { data: unknown[]; error: null }) => void;
    mockSelect.mockReturnValueOnce(new Promise(value => { resolve = value; }));
    const pending = loadBiomarkerHistory();
    await Promise.resolve();
    mockIsScopeCurrent.mockReturnValue(false);
    resolve({ data: [{ id: 'stale' }], error: null });

    await expect(pending).resolves.toEqual([]);
  });
});
