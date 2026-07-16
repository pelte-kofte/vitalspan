import {
  PHENO_AGE_COEFFICIENTS,
  PHENO_AGE_GAMMA,
  PHENO_AGE_INTERCEPT,
  PHENO_AGE_TRANSFORM,
  computePhenoAge,
  convertAlbuminToPublishedUnit,
  convertCreatinineToPublishedUnit,
  convertCrpToPublishedUnit,
  convertGlucoseToPublishedUnit,
  createPhenoAgeInputsFromEntries,
  type PhenoAgeInputs,
  type PhenoAgeMeasurement,
} from '../lib/phenoAge';
import type { StoredEntry } from '../types/biomarkerEntry';

const COLLECTED_AT = '2026-01-01T00:00:00.000Z';
const AS_OF = '2026-01-02T00:00:00.000Z';

function measurement(value: number, unit: string): PhenoAgeMeasurement {
  return { value, unit, collectedAt: COLLECTED_AT, unitSource: 'reported' };
}

function publishedFixture(overrides: Partial<PhenoAgeInputs> = {}): PhenoAgeInputs {
  return {
    age: 40,
    asOf: AS_OF,
    albumin: measurement(44, 'g/L'),
    creatinine: measurement(79.56, 'μmol/L'),
    glucose: measurement(4.99495, 'mmol/L'),
    crp: measurement(0.1, 'mg/dL'),
    lymphocytePct: measurement(30, '%'),
    mcv: measurement(90, 'fL'),
    rdw: measurement(13, '%'),
    alkalinePhosphatase: measurement(65, 'U/L'),
    wbc: measurement(6, '10^3/μL'),
    ...overrides,
  };
}

describe('Levine PhenoAge scientific stop-loss', () => {
  test('locks the exact published coefficients, intercept, and gamma', () => {
    expect(PHENO_AGE_INTERCEPT).toBe(-19.9067);
    expect(PHENO_AGE_GAMMA).toBe(0.0076927);
    expect(PHENO_AGE_TRANSFORM).toEqual({
      mortalityHorizonMonths: 120,
      phenotypicAgeIntercept: 141.50225,
      mortalityLogScale: -0.00553,
      phenotypicAgeScale: 0.090165,
    });
    expect(PHENO_AGE_COEFFICIENTS).toEqual({
      albumin: -0.0336,
      creatinine: 0.0095,
      glucose: 0.1953,
      lnCRP: 0.0954,
      lymphocytePct: -0.012,
      mcv: 0.0268,
      rdw: 0.3306,
      alkalinePhosphatase: 0.00188,
      wbc: 0.0554,
      age: 0.0804,
    });
  });

  test('converts original user units explicitly to published formula units', () => {
    expect(convertAlbuminToPublishedUnit(4.4, 'g/dL')).toBeCloseTo(44, 8);
    expect(convertCreatinineToPublishedUnit(0.9, 'mg/dL')).toBeCloseTo(79.56, 8);
    expect(convertGlucoseToPublishedUnit(90, 'mg/dL')).toBeCloseTo(4.99495, 5);
    expect(convertCrpToPublishedUnit(1, 'mg/L')).toBeCloseTo(0.1, 8);
  });

  test('matches a published-formula fixture after normalization', () => {
    const result = computePhenoAge(publishedFixture());
    expect(result.status).toBe('calculated');
    expect(result.bloodPhenotypicAge).toBe(33.2);
    expect(result.presentCount).toBe(9);
    expect(result.missingCount).toBe(0);
  });

  test('US display units produce the same result as published units', () => {
    const result = computePhenoAge(publishedFixture({
      albumin: measurement(4.4, 'g/dL'),
      creatinine: measurement(0.9, 'mg/dL'),
      glucose: measurement(90, 'mg/dL'),
      crp: measurement(1, 'mg/L'),
    }));
    expect(result.bloodPhenotypicAge).toBe(33.2);
  });

  test('chronological age is included with the published coefficient', () => {
    const age40 = computePhenoAge(publishedFixture({ age: 40 }));
    const age50 = computePhenoAge(publishedFixture({ age: 50 }));
    expect(age40.bloodPhenotypicAge).not.toBeNull();
    expect(age50.bloodPhenotypicAge).not.toBeNull();
    expect(age50.bloodPhenotypicAge!).toBeGreaterThan(age40.bloodPhenotypicAge!);
  });

  test('returns insufficient data when any required biomarker is missing', () => {
    const result = computePhenoAge(publishedFixture({ albumin: undefined }));
    expect(result.status).toBe('insufficient_data');
    expect(result.bloodPhenotypicAge).toBeNull();
    expect(result.requirements.find(item => item.key === 'albumin')?.status).toBe('missing');
  });

  test('rejects invalid, stale, and unit-incompatible measurements', () => {
    const invalid = computePhenoAge(publishedFixture({ albumin: measurement(0, 'g/L') }));
    expect(invalid.requirements.find(item => item.key === 'albumin')?.status).toBe('invalid');
    expect(invalid.bloodPhenotypicAge).toBeNull();

    const stale = computePhenoAge(publishedFixture({
      albumin: { ...measurement(44, 'g/L'), collectedAt: '2020-01-01T00:00:00.000Z' },
    }));
    expect(stale.requirements.find(item => item.key === 'albumin')?.status).toBe('stale');
    expect(stale.bloodPhenotypicAge).toBeNull();

    const incompatible = computePhenoAge(publishedFixture({ albumin: measurement(44, 'kg/L') }));
    expect(incompatible.requirements.find(item => item.key === 'albumin')?.status).toBe('unit_incompatible');
    expect(incompatible.bloodPhenotypicAge).toBeNull();
  });

  test('does not calculate from partial data or expose speculative outputs', () => {
    const result = computePhenoAge({
      age: 40,
      asOf: AS_OF,
      albumin: measurement(44, 'g/L'),
      creatinine: measurement(79.56, 'μmol/L'),
      glucose: measurement(4.99495, 'mmol/L'),
    });
    expect(result.bloodPhenotypicAge).toBeNull();
    expect(result.presentCount).toBe(3);
    expect(result).not.toHaveProperty('agingRate');
    expect(result).not.toHaveProperty('projectedLifespan');
    expect(result).not.toHaveProperty('yearsYounger');
    expect(result).not.toHaveProperty('yearsSaved');
    expect(result).not.toHaveProperty('confidence');
  });

  test('legacy entries use an explicit legacy-definition unit provenance', () => {
    const entries = new Map<string, StoredEntry>([
      ['albumin', { id: 'a', biomarkerId: 'albumin', value: 4.4, date: COLLECTED_AT, source: 'Blood test', notes: '' }],
    ]);
    const inputs = createPhenoAgeInputsFromEntries(40, entries, { asOf: AS_OF });
    expect(inputs.albumin).toEqual({
      value: 4.4,
      unit: 'g/dL',
      collectedAt: COLLECTED_AT,
      unitSource: 'legacy_definition',
    });
  });
});
