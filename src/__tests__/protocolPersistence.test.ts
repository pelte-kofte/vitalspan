import fs from 'node:fs';
import path from 'node:path';

import {
  PROTOCOL_STORAGE_KEY,
  PROTOCOL_TODAY_STORAGE_KEY,
  parseProtocolDoseCount,
  parseProtocolState,
  persistProtocolMainState,
  persistProtocolState,
  prepareProtocolState,
  protocolDayKey,
  protocolDoseId,
  toggleProtocolCompletion,
} from '../lib/protocolPersistence';
import { EMPTY_PROTOCOL, type ProtocolState } from '../types/protocol';

const NOW = new Date(2026, 6, 24, 0, 30, 0);
const TODAY = '2026-07-24';

function protocolState(overrides: Partial<ProtocolState> = {}): ProtocolState {
  return {
    ...EMPTY_PROTOCOL,
    supplements: [],
    medTimes: {},
    hiddenMeds: [],
    taken: [],
    takenDate: TODAY,
    ...overrides,
  };
}

describe('protocol persistence compatibility', () => {
  test('routes Protocol and Today through the shared persistence contract', () => {
    const protocolScreen = fs.readFileSync(
      path.join(process.cwd(), 'src/screens/ProtocolScreen.tsx'),
      'utf8',
    );
    const todayScreen = fs.readFileSync(
      path.join(process.cwd(), 'src/screens/DashboardScreen.tsx'),
      'utf8',
    );

    expect(protocolScreen).toContain('prepareProtocolState(');
    expect(protocolScreen).toContain('persistProtocolState(');
    expect(protocolScreen).toContain('toggleProtocolCompletion(');
    expect(todayScreen).toContain('parseProtocolState(protocolRaw)');
    expect(todayScreen).toContain('persistProtocolState(');
    expect(todayScreen).toContain('toggleProtocolCompletion(');
    expect(`${protocolScreen}\n${todayScreen}`)
      .not.toMatch(/AsyncStorage\.setItem\('@vitalspan_protocol(?:_today)?'/);
  });

  test('uses the local calendar day and preserves bounded dose identifiers', () => {
    expect(protocolDayKey(NOW)).toBe(TODAY);
    expect(parseProtocolDoseCount('500 mg (3x daily)')).toBe(3);
    expect(parseProtocolDoseCount('10x daily')).toBe(6);
    expect(parseProtocolDoseCount('200 mg')).toBe(1);
    expect(protocolDoseId('Magnesium', 1)).toBe('Magnesium_dose_1');
  });

  test('normalizes the current schema without dropping optional state', () => {
    const stored = protocolState({
      supplements: [{
        id: 'magnesium',
        name: 'Magnesium',
        dose: '200 mg',
        source: 'manual',
        addedAt: '2026-01-01T00:00:00.000Z',
        reminderEnabled: true,
        reminderSlot: 'night',
      }],
      medTimes: { Metformin: 'evening' },
      hiddenMeds: ['Aspirin'],
      taken: ['magnesium'],
      currentStreak: 4,
      bestStreak: 8,
      lastCompleteDate: '2026-07-23',
      medReminders: { Metformin: { enabled: true, slot: 'evening' } },
    });

    expect(parseProtocolState(JSON.stringify(stored), NOW)).toEqual({
      state: stored,
      migratedLegacyState: false,
    });
  });

  test('migrates legacy database and custom supplements into the canonical shape', () => {
    const parsed = parseProtocolState(JSON.stringify({
      addedSupplements: ['Vitamin D3'],
      customSupplements: [{
        id: 'custom-1',
        name: 'Custom supplement',
        dose: '10 mg',
        timing: 'morning',
        addedAt: '2025-01-01T00:00:00.000Z',
      }],
      medTimes: { Metformin: 'evening' },
    }), NOW);

    expect(parsed.migratedLegacyState).toBe(true);
    expect(parsed.state).toEqual({
      supplements: [
        {
          id: `supp_migrated_${NOW.getTime()}_0`,
          name: 'Vitamin D3',
          dose: '2000-5000 IU',
          source: 'db',
          addedAt: NOW.toISOString(),
        },
        {
          id: 'custom-1',
          name: 'Custom supplement',
          dose: '10 mg',
          timing: 'morning',
          source: 'manual',
          addedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      medTimes: { Metformin: 'evening' },
      hiddenMeds: [],
      taken: [],
      takenDate: '',
    });
  });

  test('fails closed for missing, malformed, and unknown persisted shapes', () => {
    expect(parseProtocolState(null, NOW)).toEqual({
      state: EMPTY_PROTOCOL,
      migratedLegacyState: false,
    });
    expect(parseProtocolState('{bad json', NOW)).toEqual({
      state: EMPTY_PROTOCOL,
      migratedLegacyState: false,
    });
    expect(parseProtocolState(JSON.stringify({ taken: ['x'] }), NOW)).toEqual({
      state: EMPTY_PROTOCOL,
      migratedLegacyState: false,
    });
  });

  test('rolls a completed prior day forward and preserves streak history', () => {
    const prior = protocolState({
      supplements: [{
        id: 'magnesium',
        name: 'Magnesium',
        dose: '200 mg (2x daily)',
        source: 'manual',
        addedAt: '2026-01-01T00:00:00.000Z',
      }],
      taken: ['Metformin', 'Magnesium_dose_0', 'Magnesium_dose_1'],
      takenDate: '2026-07-23',
      currentStreak: 2,
      bestStreak: 3,
      lastCompleteDate: '2026-07-22',
    });

    const prepared = prepareProtocolState(
      JSON.stringify(prior),
      ['Metformin'],
      NOW,
    );

    expect(prepared.state).toMatchObject({
      taken: [],
      takenDate: TODAY,
      currentStreak: 3,
      bestStreak: 3,
      lastCompleteDate: '2026-07-23',
    });
    expect(prepared.mainStorageWrites).toEqual([prepared.state]);
  });

  test('resets an incomplete streak but pauses it when no visible items exist', () => {
    const incomplete = prepareProtocolState(JSON.stringify(protocolState({
      supplements: [{
        id: 'magnesium',
        name: 'Magnesium',
        dose: '200 mg',
        source: 'manual',
        addedAt: '2026-01-01T00:00:00.000Z',
      }],
      taken: [],
      takenDate: '2026-07-23',
      currentStreak: 5,
      bestStreak: 7,
    })), [], NOW);
    expect(incomplete.state.currentStreak).toBe(0);
    expect(incomplete.state.bestStreak).toBe(7);
    expect(incomplete.mainStorageWrites).toEqual([incomplete.state]);

    const noVisibleItems = prepareProtocolState(JSON.stringify(protocolState({
      takenDate: '2026-07-23',
      currentStreak: 5,
      bestStreak: 7,
    })), [], NOW);
    expect(noVisibleItems.state).toMatchObject({
      taken: [],
      takenDate: TODAY,
      currentStreak: 5,
      bestStreak: 7,
    });
    expect(noVisibleItems.mainStorageWrites).toEqual([]);
  });

  test('toggles completion reversibly and discards completion from another day', () => {
    const added = toggleProtocolCompletion(protocolState(), 'item-1', NOW);
    expect(added).toMatchObject({ taken: ['item-1'], takenDate: TODAY });

    const removed = toggleProtocolCompletion(added, 'item-1', NOW);
    expect(removed).toMatchObject({ taken: [], takenDate: TODAY });

    const replaced = toggleProtocolCompletion(protocolState({
      taken: ['old-item'],
      takenDate: '2026-07-23',
    }), 'item-1', NOW);
    expect(replaced).toMatchObject({ taken: ['item-1'], takenDate: TODAY });
  });

  test('writes the canonical state and compatibility mirror with unchanged keys', async () => {
    const state = protocolState({ taken: ['item-1'] });
    const setItem = jest.fn(async () => undefined);

    await persistProtocolState(state, setItem);

    expect(setItem).toHaveBeenCalledTimes(2);
    expect(setItem).toHaveBeenCalledWith(PROTOCOL_STORAGE_KEY, JSON.stringify(state));
    expect(setItem).toHaveBeenCalledWith(
      PROTOCOL_TODAY_STORAGE_KEY,
      JSON.stringify({ date: TODAY, taken: ['item-1'] }),
    );
  });

  test('keeps migration writes on the canonical key and propagates storage failures', async () => {
    const state = protocolState();
    const successfulSetItem = jest.fn(async () => undefined);
    await persistProtocolMainState(state, successfulSetItem);
    expect(successfulSetItem).toHaveBeenCalledWith(
      PROTOCOL_STORAGE_KEY,
      JSON.stringify(state),
    );

    const failedSetItem = jest.fn(async () => {
      throw new Error('storage unavailable');
    });
    await expect(persistProtocolState(state, failedSetItem))
      .rejects.toThrow('storage unavailable');
  });
});
