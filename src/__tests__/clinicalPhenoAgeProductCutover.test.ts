import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { isScientificExecutionAuthorized } from '../domain/scientificModels';
import {
  adaptClinicalPhenoAgeForPresentation,
  getClinicalPhenoAgePresentation,
} from '../lib/clinicalPhenoAgePresentation';
import { evaluateClinicalPhenoAgeForProduct } from '../lib/clinicalPhenoAgeProduct';
import type { StoredEntry } from '../types/biomarkerEntry';

const NOW = new Date('2026-07-17T12:00:00.000Z');
const COLLECTION = '2026-07-10T08:00:00.000Z';

const CANONICAL_FIXTURE = [
  ['albumin', 44, 'g/L'],
  ['creatinine', 80, 'μmol/L'],
  ['fastingglucose', 5, 'mmol/L'],
  ['hscrp', 0.1, 'mg/dL'],
  ['lymphocytepct', 30, '%'],
  ['mcv', 90, 'fL'],
  ['rdw', 12.5, '%'],
  ['alp', 70, 'U/L'],
  ['wbc', 6, '10^3/μL'],
] as const;

const DISPLAY_UNIT_FIXTURE = [
  ['albumin', 4.4, 'g/dL'],
  ['creatinine', 0.9, 'mg/dL'],
  ['fastingglucose', 90, 'mg/dL'],
  ['hscrp', 1, 'mg/L'],
  ['lymphocytepct', 30, '%'],
  ['mcv', 90, 'fL'],
  ['rdw', 13, '%'],
  ['alp', 65, 'IU/L'],
  ['wbc', 6, '10^9/L'],
] as const;

function entry(
  biomarkerId: string,
  value: number,
  unit: string,
  overrides: Partial<StoredEntry> = {},
): StoredEntry {
  return {
    id: `measurement-${biomarkerId}`,
    biomarkerId,
    value,
    unit,
    date: COLLECTION,
    source: 'Validation Laboratory',
    notes: '',
    ...overrides,
  };
}

function entryMap(
  fixture: readonly (readonly [string, number, string])[] = CANONICAL_FIXTURE,
): Map<string, StoredEntry> {
  return new Map(fixture.map(([biomarkerId, value, unit]) => [
    biomarkerId,
    entry(biomarkerId, value, unit),
  ]));
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(item => {
    const path = join(directory, item.name);
    if (item.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(item.name) ? [path] : [];
  });
}

describe('Clinical PhenoAge production cutover', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('executes eligibility, authorization, and the validated engine in order', () => {
    const evaluation = evaluateClinicalPhenoAgeForProduct(40, entryMap(), NOW);
    expect(evaluation.status).toBe('available');
    expect(isScientificExecutionAuthorized(evaluation.eligibility, NOW)).toBe(true);
    expect(evaluation.scientificResult).toMatchObject({
      calculationStatus: 'calculated',
      modelId: 'clinical_phenoage',
      modelVersion: 'clinical-phenoage/1.0.0',
      phenotypicAgeYears: 31.514754353039137,
      chronologicalAgeYears: 40,
    });
    expect(evaluation.scientificResult?.authorization.reference)
      .toBe(evaluation.eligibility.authorizationReference);
  });

  test('rounds only in the presentation adapter', () => {
    const evaluation = evaluateClinicalPhenoAgeForProduct(40, entryMap(), NOW);
    const presentation = adaptClinicalPhenoAgeForPresentation(evaluation);
    expect(evaluation.scientificResult?.phenotypicAgeYears).toBe(31.514754353039137);
    expect(presentation).toMatchObject({
      status: 'available', valueYears: 31.5, formattedValue: '31.5',
      modelVersion: 'clinical-phenoage/1.0.0', presentCount: 9,
    });
  });

  test('normalizes only explicitly supported source units before authorization', () => {
    const presentation = getClinicalPhenoAgePresentation(40, entryMap(DISPLAY_UNIT_FIXTURE), NOW);
    expect(presentation.status).toBe('available');
    expect(presentation.valueYears).toBe(33.2);
    expect(presentation.requirements.every(requirement => requirement.status === 'present')).toBe(true);
  });

  test('accepts the app biomarker catalogue WBC unit without an alternate path', () => {
    const entries = entryMap();
    entries.set('wbc', entry('wbc', 6, '10³/μL'));
    expect(getClinicalPhenoAgePresentation(40, entries, NOW).status).toBe('available');
  });

  test('withholds calculation when a biomarker is missing', () => {
    const entries = entryMap();
    entries.delete('albumin');
    const result = getClinicalPhenoAgePresentation(40, entries, NOW);
    expect(result).toMatchObject({
      status: 'unavailable', valueYears: null, presentCount: 8,
      failure: { code: 'missing_biomarkers' },
    });
    expect(result.unavailableMeasurements).toContain('Albumin');
  });

  test('maps stale, invalid, and unit-incompatible evidence to safe states', () => {
    const stale = entryMap();
    stale.set('albumin', entry('albumin', 44, 'g/L', { date: '2024-01-01T00:00:00.000Z' }));
    expect(getClinicalPhenoAgePresentation(40, stale, NOW).failure?.code).toBe('stale_evidence');

    const invalid = entryMap();
    invalid.set('albumin', entry('albumin', Number.NaN, 'g/L'));
    expect(getClinicalPhenoAgePresentation(40, invalid, NOW).failure?.code).toBe('invalid_measurements');

    const units = entryMap();
    units.set('albumin', entry('albumin', 44, 'ambiguous-unit'));
    expect(getClinicalPhenoAgePresentation(40, units, NOW).failure?.code).toBe('unsupported_units');
  });

  test('rejects incomplete reported-value provenance instead of guessing', () => {
    const entries = entryMap();
    entries.set('albumin', entry('albumin', 44, 'g/L', { reportedValue: 4.4 }));
    const result = getClinicalPhenoAgePresentation(40, entries, NOW);
    expect(result.status).toBe('unavailable');
    expect(result.requirements.find(requirement => requirement.inputId === 'albumin')?.status)
      .toBe('unit_incompatible');
  });

  test('requires one identifiable laboratory collection', () => {
    const mixedDate = entryMap();
    mixedDate.set('albumin', entry('albumin', 44, 'g/L', {
      date: '2026-07-09T08:00:00.000Z',
    }));
    expect(getClinicalPhenoAgePresentation(40, mixedDate, NOW).failure?.code)
      .toBe('invalid_measurement_context');

    const mixedSource = entryMap();
    mixedSource.set('albumin', entry('albumin', 44, 'g/L', { source: 'Other Laboratory' }));
    expect(getClinicalPhenoAgePresentation(40, mixedSource, NOW).failure?.code)
      .toBe('invalid_measurement_context');
  });

  test('requires a scientifically supported chronological age', () => {
    expect(getClinicalPhenoAgePresentation(null, entryMap(), NOW).failure?.code)
      .toBe('missing_profile');
    expect(getClinicalPhenoAgePresentation(19, entryMap(), NOW).failure?.code)
      .toBe('missing_profile');
  });

  test('never exposes stack traces or scientific exception text to product consumers', () => {
    const entries = entryMap();
    entries.set('albumin', entry('albumin', 44, 'ambiguous-unit'));
    const failure = getClinicalPhenoAgePresentation(40, entries, NOW).failure;
    expect(failure).not.toBeNull();
    expect(failure).not.toHaveProperty('stack');
    expect(failure?.detail).not.toMatch(/ClinicalPhenoAgeCalculationError|at \w+ \(/);
  });

  test('contains one production engine invocation and no legacy implementation', () => {
    const legacyPath = join(process.cwd(), 'src/lib/phenoAge.ts');
    expect(existsSync(legacyPath)).toBe(false);

    const srcRoot = join(process.cwd(), 'src');
    const files = sourceFiles(srcRoot).filter(path => !path.includes('/__tests__/')
      && !path.includes('/domain/scientificModels/'));
    const directCallers = files.filter(path => readFileSync(path, 'utf8').includes('calculateClinicalPhenoAge'));
    expect(directCallers.map(path => relative(srcRoot, path))).toEqual(['lib/clinicalPhenoAgeProduct.ts']);

    const productSource = readFileSync(join(srcRoot, 'lib/clinicalPhenoAgeProduct.ts'), 'utf8');
    expect(productSource).not.toMatch(/-19\.9067|141\.50225|mortalityTransformation|Math\.exp/);
    const allProductSource = files.map(path => readFileSync(path, 'utf8')).join('\n');
    expect(allProductSource).not.toMatch(/computePhenoAge|createPhenoAgeInputsFromEntries|lib\/phenoAge/);
  });
});
