/**
 * TDD — Phase 22, Plan 03: dose bucketing in advisorContext supplementDetails
 *
 * Tests that assembleAdvisorContext() produces correct supplementDetails with
 * high/standard/low dose buckets based on personalDose vs SUPPLEMENT_DATABASE
 * defaultDose, and that the legacy supplements: string[] field is preserved.
 */

// ── AsyncStorage mock ─────────────────────────────────────────────────────────
const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
    setItem: jest.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
  },
}));

// ── Minimal mocks for other AsyncStorage deps ─────────────────────────────────
// advisorContext.ts reads 5 keys; we'll populate what we need per test.

import { assembleAdvisorContext } from '../lib/advisorContext';

// Helper — seed AsyncStorage for a test
function seedProtocol(supplements: object[]): void {
  mockStorage['@vitalspan_protocol'] = JSON.stringify({
    supplements,
    medTimes: {},
    hiddenMeds: [],
    taken: [],
    takenDate: '',
  });
}

// Helper — clear all storage
function clearStorage(): void {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('assembleAdvisorContext supplementDetails (PROT-05 dose bucketing)', () => {
  beforeEach(() => {
    clearStorage();
  });

  // ── Backward-compat check ─────────────────────────────────────────────────

  test('supplements: string[] is preserved in context (backward compat)', async () => {
    seedProtocol([
      { id: 'nmn', name: 'NMN (Nicotinamide Mononucleotide)', source: 'db', dose: '500mg' },
    ]);
    const ctx = await assembleAdvisorContext();
    expect(Array.isArray(ctx.supplements)).toBe(true);
    expect(ctx.supplements).toContain('NMN (Nicotinamide Mononucleotide)');
  });

  // ── doseBucket: 'standard' when no personalDose ───────────────────────────

  test('supplement with no personalDose gets doseBucket standard', async () => {
    seedProtocol([
      { id: 'nmn', name: 'NMN (Nicotinamide Mononucleotide)', source: 'db', dose: '500mg' },
    ]);
    const ctx = await assembleAdvisorContext();
    expect(ctx.supplementDetails).toBeDefined();
    const detail = ctx.supplementDetails!.find(s => s.name === 'NMN (Nicotinamide Mononucleotide)');
    expect(detail).toBeDefined();
    expect(detail!.doseBucket).toBe('standard');
  });

  // ── doseBucket: 'high' when personalDose >= 1.25x defaultDose ────────────

  test('personalDose 1000mg vs defaultDose 500mg (ratio 2.0) -> doseBucket high', async () => {
    seedProtocol([
      {
        id: 'nmn',
        name: 'NMN (Nicotinamide Mononucleotide)',
        source: 'db',
        dose: '500mg',
        personalDose: '1000mg',
      },
    ]);
    const ctx = await assembleAdvisorContext();
    const detail = ctx.supplementDetails!.find(s => s.name === 'NMN (Nicotinamide Mononucleotide)');
    expect(detail!.doseBucket).toBe('high');
  });

  // ── doseBucket: 'low' when personalDose <= 0.75x defaultDose ─────────────

  test('personalDose 250mg vs defaultDose 500mg (ratio 0.5) -> doseBucket low', async () => {
    seedProtocol([
      {
        id: 'nmn',
        name: 'NMN (Nicotinamide Mononucleotide)',
        source: 'db',
        dose: '500mg',
        personalDose: '250mg',
      },
    ]);
    const ctx = await assembleAdvisorContext();
    const detail = ctx.supplementDetails!.find(s => s.name === 'NMN (Nicotinamide Mononucleotide)');
    expect(detail!.doseBucket).toBe('low');
  });

  // ── doseBucket: 'standard' when personalDose == defaultDose ─────────────

  test('personalDose 500mg vs defaultDose 500mg (ratio 1.0) -> doseBucket standard', async () => {
    seedProtocol([
      {
        id: 'nmn',
        name: 'NMN (Nicotinamide Mononucleotide)',
        source: 'db',
        dose: '500mg',
        personalDose: '500mg',
      },
    ]);
    const ctx = await assembleAdvisorContext();
    const detail = ctx.supplementDetails!.find(s => s.name === 'NMN (Nicotinamide Mononucleotide)');
    expect(detail!.doseBucket).toBe('standard');
  });

  // ── doseBucket omitted when defaultDose is non-numeric ────────────────────

  test('defaultDose "as directed" (NaN parse) with personalDose set -> doseBucket omitted', async () => {
    // Use a supplement name that maps to a DB entry with non-numeric defaultDose.
    // Vitamin D3 has defaultDose '2000-5000 IU' — parseFloat gives 2000, still numeric.
    // We need a truly non-numeric dose. We'll use a custom supplement not in the DB
    // to simulate: since no dbEntry found, doseBucket cannot be computed — omitted.
    // Actually the spec says: defaultDose 'as directed' (parseFloat NaN) -> doseBucket omitted.
    // The supplement 'Methylated B-Complex (B12 + Folate + B6)' has defaultDose
    // 'Methyl B12 1000mcg + Methylfolate 400mcg + P5P 25mg' -> NaN.
    seedProtocol([
      {
        id: 'methylated_b',
        name: 'Methylated B-Complex (B12 + Folate + B6)',
        source: 'db',
        dose: 'Methyl B12 1000mcg + Methylfolate 400mcg + P5P 25mg',
        personalDose: '2000mg',
      },
    ]);
    const ctx = await assembleAdvisorContext();
    const detail = ctx.supplementDetails!.find(s => s.name === 'Methylated B-Complex (B12 + Folate + B6)');
    expect(detail).toBeDefined();
    // doseBucket should be absent (not 'NaN' or undefined literal)
    expect(detail!.doseBucket).toBeUndefined();
    // Ensure no NaN strings leak
    expect(JSON.stringify(ctx)).not.toContain('NaN');
  });

  // ── Empty state returns supplementDetails: [] ─────────────────────────────

  test('empty protocol state returns supplementDetails: []', async () => {
    // No keys seeded — protocol is null
    const ctx = await assembleAdvisorContext();
    expect(ctx.supplementDetails).toEqual([]);
    expect(ctx.supplements).toEqual([]);
  });

  // ── Legacy schema (addedSupplements) still maps to supplementDetails ───────

  test('legacy addedSupplements schema produces supplementDetails with name only', async () => {
    mockStorage['@vitalspan_protocol'] = JSON.stringify({
      addedSupplements: ['Creatine Monohydrate'],
      customSupplements: [],
      medTimes: {},
      taken: [],
      takenDate: '',
    });
    const ctx = await assembleAdvisorContext();
    expect(ctx.supplementDetails).toBeDefined();
    // Legacy entries have no doseBucket
    const detail = ctx.supplementDetails!.find(s => s.name === 'Creatine Monohydrate');
    expect(detail).toBeDefined();
    expect(detail!.doseBucket).toBeUndefined();
  });
});
