/**
 * Levine Phenotypic Age (PhenoAge) implementation.
 *
 * Published specification:
 * Levine ME et al. An epigenetic biomarker of aging for lifespan and
 * healthspan. Aging (Albany NY). 2018;10(4):573-591.
 * PMCID: PMC5940111. Formula inputs and units are reproduced exactly below.
 */

import type { StoredEntry } from '../types/biomarkerEntry';

export type PhenoAgeInputKey =
  | 'albumin'
  | 'creatinine'
  | 'glucose'
  | 'crp'
  | 'lymphocytePct'
  | 'mcv'
  | 'rdw'
  | 'alkalinePhosphatase'
  | 'wbc';

export interface PhenoAgeMeasurement {
  value: number;
  unit: string;
  collectedAt: string;
  unitSource?: 'reported' | 'legacy_definition';
}

export interface PhenoAgeInputs {
  age: number;
  asOf?: string;
  maxMeasurementAgeDays?: number;
  albumin?: PhenoAgeMeasurement;
  creatinine?: PhenoAgeMeasurement;
  glucose?: PhenoAgeMeasurement;
  crp?: PhenoAgeMeasurement;
  lymphocytePct?: PhenoAgeMeasurement;
  mcv?: PhenoAgeMeasurement;
  rdw?: PhenoAgeMeasurement;
  alkalinePhosphatase?: PhenoAgeMeasurement;
  wbc?: PhenoAgeMeasurement;
}

export type PhenoAgeRequirementStatus =
  | 'present'
  | 'missing'
  | 'stale'
  | 'invalid'
  | 'unit_incompatible';

export interface PhenoAgeRequirement {
  key: PhenoAgeInputKey;
  biomarkerId: string;
  label: string;
  publishedUnit: string;
  status: PhenoAgeRequirementStatus;
  reportedUnit?: string;
  unitSource?: PhenoAgeMeasurement['unitSource'];
  collectedAt?: string;
}

export interface PhenoAgeResult {
  status: 'calculated' | 'insufficient_data';
  bloodPhenotypicAge: number | null;
  chronologicalAge: number;
  ageValid: boolean;
  requirements: PhenoAgeRequirement[];
  presentCount: number;
  totalRequired: number;
  missingCount: number;
  missingBiomarkers: string[];
  calculatedAt: string | null;
  modelLimitations: readonly string[];
}

export const PHENO_AGE_MODEL_LIMITATIONS = [
  'This estimate is based on chronological age and nine blood measurements.',
  'It is not a diagnosis.',
  'It does not represent every dimension of aging.',
  'Results should not be compared across incompatible laboratories or units without normalization.',
  'Chronological age currently uses the whole-year age in the profile rather than a birthdate-derived age at specimen collection.',
] as const;

export const DEFAULT_PHENO_AGE_MAX_MEASUREMENT_AGE_DAYS = 365;

// Exact published linear-predictor coefficients.
export const PHENO_AGE_COEFFICIENTS = {
  albumin: -0.0336,
  creatinine: 0.0095,
  glucose: 0.1953,
  lnCRP: 0.0954,
  lymphocytePct: -0.0120,
  mcv: 0.0268,
  rdw: 0.3306,
  alkalinePhosphatase: 0.00188,
  wbc: 0.0554,
  age: 0.0804,
} as const;

export const PHENO_AGE_INTERCEPT = -19.9067;
export const PHENO_AGE_GAMMA = 0.0076927;
export const PHENO_AGE_TRANSFORM = {
  mortalityHorizonMonths: 120,
  phenotypicAgeIntercept: 141.50225,
  mortalityLogScale: -0.00553,
  phenotypicAgeScale: 0.090165,
} as const;

interface RequiredFieldDefinition {
  key: PhenoAgeInputKey;
  biomarkerId: string;
  label: string;
  publishedUnit: string;
  legacyUnit: string;
}

export const PHENO_BIOMARKER_LIST: readonly RequiredFieldDefinition[] = [
  { key: 'albumin', biomarkerId: 'albumin', label: 'Albumin', publishedUnit: 'g/L', legacyUnit: 'g/dL' },
  { key: 'creatinine', biomarkerId: 'creatinine', label: 'Creatinine', publishedUnit: 'μmol/L', legacyUnit: 'mg/dL' },
  { key: 'glucose', biomarkerId: 'fastingglucose', label: 'Fasting Glucose', publishedUnit: 'mmol/L', legacyUnit: 'mg/dL' },
  { key: 'crp', biomarkerId: 'hscrp', label: 'hsCRP / CRP', publishedUnit: 'mg/dL', legacyUnit: 'mg/L' },
  { key: 'lymphocytePct', biomarkerId: 'lymphocytepct', label: 'Lymphocyte %', publishedUnit: '%', legacyUnit: '%' },
  { key: 'mcv', biomarkerId: 'mcv', label: 'MCV', publishedUnit: 'fL', legacyUnit: 'fL' },
  { key: 'rdw', biomarkerId: 'rdw', label: 'RDW', publishedUnit: '%', legacyUnit: '%' },
  { key: 'alkalinePhosphatase', biomarkerId: 'alp', label: 'Alkaline Phosphatase', publishedUnit: 'U/L', legacyUnit: 'U/L' },
  { key: 'wbc', biomarkerId: 'wbc', label: 'WBC', publishedUnit: '10^3/μL', legacyUnit: '×10³/μL' },
] as const;

export const PHENO_AGE_BIOMARKER_MAP: Record<string, PhenoAgeInputKey> =
  Object.fromEntries(PHENO_BIOMARKER_LIST.map(item => [item.biomarkerId, item.key])) as Record<string, PhenoAgeInputKey>;

function normalizeUnit(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .replace(/μ/g, 'u')
    .replace(/µ/g, 'u')
    .replace(/³/g, '^3')
    .replace(/×/g, '')
    .replace(/cells?/g, '')
    .replace(/thousands?/g, '10^3')
    .replace(/\s+/g, '');
}

function matchesUnit(unit: string, accepted: string[]): boolean {
  const normalized = normalizeUnit(unit);
  return accepted.some(candidate => normalizeUnit(candidate) === normalized);
}

export function convertAlbuminToPublishedUnit(value: number, unit: string): number | null {
  if (matchesUnit(unit, ['g/L'])) return value;
  if (matchesUnit(unit, ['g/dL'])) return value * 10;
  return null;
}

export function convertCreatinineToPublishedUnit(value: number, unit: string): number | null {
  if (matchesUnit(unit, ['μmol/L', 'umol/L'])) return value;
  if (matchesUnit(unit, ['mg/dL'])) return value * 88.4;
  return null;
}

export function convertGlucoseToPublishedUnit(value: number, unit: string): number | null {
  if (matchesUnit(unit, ['mmol/L'])) return value;
  if (matchesUnit(unit, ['mg/dL'])) return value / 18.0182;
  return null;
}

export function convertCrpToPublishedUnit(value: number, unit: string): number | null {
  if (matchesUnit(unit, ['mg/dL'])) return value;
  if (matchesUnit(unit, ['mg/L'])) return value / 10;
  return null;
}

export function convertPhenoAgeMeasurement(
  key: PhenoAgeInputKey,
  value: number,
  unit: string,
): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  switch (key) {
    case 'albumin':
      return convertAlbuminToPublishedUnit(value, unit);
    case 'creatinine':
      return convertCreatinineToPublishedUnit(value, unit);
    case 'glucose':
      return convertGlucoseToPublishedUnit(value, unit);
    case 'crp':
      return convertCrpToPublishedUnit(value, unit);
    case 'lymphocytePct':
    case 'rdw':
      return matchesUnit(unit, ['%']) ? value : null;
    case 'mcv':
      return matchesUnit(unit, ['fL']) ? value : null;
    case 'alkalinePhosphatase':
      return matchesUnit(unit, ['U/L', 'IU/L']) ? value : null;
    case 'wbc':
      return matchesUnit(unit, ['10^3/μL', '×10³/μL', '10^3/uL', '10^9/L']) ? value : null;
  }
}

function parseDate(value: string): number | null {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function requirementFor(
  definition: RequiredFieldDefinition,
  measurement: PhenoAgeMeasurement | undefined,
  asOfMs: number,
  maxMeasurementAgeDays: number,
): { requirement: PhenoAgeRequirement; normalizedValue?: number } {
  const base: PhenoAgeRequirement = {
    key: definition.key,
    biomarkerId: definition.biomarkerId,
    label: definition.label,
    publishedUnit: definition.publishedUnit,
  } as PhenoAgeRequirement;

  if (!measurement) return { requirement: { ...base, status: 'missing' } };

  const details = {
    reportedUnit: measurement.unit,
    unitSource: measurement.unitSource,
    collectedAt: measurement.collectedAt,
  };
  if (!Number.isFinite(measurement.value) || measurement.value <= 0) {
    return { requirement: { ...base, ...details, status: 'invalid' } };
  }

  const collectedAtMs = parseDate(measurement.collectedAt);
  if (collectedAtMs === null || collectedAtMs > asOfMs + 86_400_000) {
    return { requirement: { ...base, ...details, status: 'invalid' } };
  }
  const ageDays = (asOfMs - collectedAtMs) / 86_400_000;
  if (ageDays > maxMeasurementAgeDays) {
    return { requirement: { ...base, ...details, status: 'stale' } };
  }

  const normalizedValue = convertPhenoAgeMeasurement(
    definition.key,
    measurement.value,
    measurement.unit,
  );
  if (normalizedValue === null || !Number.isFinite(normalizedValue)) {
    return { requirement: { ...base, ...details, status: 'unit_incompatible' } };
  }

  return {
    requirement: { ...base, ...details, status: 'present' },
    normalizedValue,
  };
}

export function createPhenoAgeInputsFromEntries(
  age: number,
  entryMap: Map<string, StoredEntry>,
  options: Pick<PhenoAgeInputs, 'asOf' | 'maxMeasurementAgeDays'> = {},
): PhenoAgeInputs {
  const inputs: PhenoAgeInputs = { age, ...options };
  for (const definition of PHENO_BIOMARKER_LIST) {
    const entry = entryMap.get(definition.biomarkerId);
    if (!entry) continue;
    const hasReportedUnit = Boolean(entry.reportedUnit ?? entry.unit);
    inputs[definition.key] = {
      value: entry.reportedValue ?? entry.value,
      unit: entry.reportedUnit ?? entry.unit ?? definition.legacyUnit,
      collectedAt: entry.date,
      unitSource: hasReportedUnit ? 'reported' : 'legacy_definition',
    };
  }
  return inputs;
}

function insufficientResult(
  inputs: PhenoAgeInputs,
  ageValid: boolean,
  requirements: PhenoAgeRequirement[],
): PhenoAgeResult {
  const presentCount = requirements.filter(item => item.status === 'present').length;
  const unmet = requirements.filter(item => item.status !== 'present');
  return {
    status: 'insufficient_data',
    bloodPhenotypicAge: null,
    chronologicalAge: inputs.age,
    ageValid,
    requirements,
    presentCount,
    totalRequired: PHENO_BIOMARKER_LIST.length,
    missingCount: unmet.length,
    missingBiomarkers: unmet.map(item => item.label),
    calculatedAt: null,
    modelLimitations: PHENO_AGE_MODEL_LIMITATIONS,
  };
}

export function computePhenoAge(inputs: PhenoAgeInputs): PhenoAgeResult {
  const asOf = inputs.asOf ?? new Date().toISOString();
  const asOfMs = parseDate(asOf);
  const safeAsOfMs = asOfMs ?? Date.now();
  const maxAgeDays = inputs.maxMeasurementAgeDays ?? DEFAULT_PHENO_AGE_MAX_MEASUREMENT_AGE_DAYS;
  const ageValid = Number.isFinite(inputs.age) && inputs.age > 0;

  const normalized = new Map<PhenoAgeInputKey, number>();
  const requirements = PHENO_BIOMARKER_LIST.map(definition => {
    const evaluated = requirementFor(
      definition,
      inputs[definition.key],
      safeAsOfMs,
      maxAgeDays,
    );
    if (evaluated.normalizedValue !== undefined) {
      normalized.set(definition.key, evaluated.normalizedValue);
    }
    return evaluated.requirement;
  });

  if (!ageValid || requirements.some(item => item.status !== 'present')) {
    return insufficientResult(inputs, ageValid, requirements);
  }

  const albumin = normalized.get('albumin')!;
  const creatinine = normalized.get('creatinine')!;
  const glucose = normalized.get('glucose')!;
  const crp = normalized.get('crp')!;
  const lymphocytePct = normalized.get('lymphocytePct')!;
  const mcv = normalized.get('mcv')!;
  const rdw = normalized.get('rdw')!;
  const alkalinePhosphatase = normalized.get('alkalinePhosphatase')!;
  const wbc = normalized.get('wbc')!;

  const xb =
    PHENO_AGE_INTERCEPT +
    PHENO_AGE_COEFFICIENTS.albumin * albumin +
    PHENO_AGE_COEFFICIENTS.creatinine * creatinine +
    PHENO_AGE_COEFFICIENTS.glucose * glucose +
    PHENO_AGE_COEFFICIENTS.lnCRP * Math.log(crp) +
    PHENO_AGE_COEFFICIENTS.lymphocytePct * lymphocytePct +
    PHENO_AGE_COEFFICIENTS.mcv * mcv +
    PHENO_AGE_COEFFICIENTS.rdw * rdw +
    PHENO_AGE_COEFFICIENTS.alkalinePhosphatase * alkalinePhosphatase +
    PHENO_AGE_COEFFICIENTS.wbc * wbc +
    PHENO_AGE_COEFFICIENTS.age * inputs.age;

  const mortalityScore = 1 - Math.exp(
    -Math.exp(xb) *
      (Math.exp(PHENO_AGE_TRANSFORM.mortalityHorizonMonths * PHENO_AGE_GAMMA) - 1) /
      PHENO_AGE_GAMMA,
  );
  const transformed = PHENO_AGE_TRANSFORM.mortalityLogScale * Math.log(1 - mortalityScore);
  const phenotypicAge =
    PHENO_AGE_TRANSFORM.phenotypicAgeIntercept +
    Math.log(transformed) / PHENO_AGE_TRANSFORM.phenotypicAgeScale;

  if (
    !Number.isFinite(mortalityScore) ||
    mortalityScore <= 0 ||
    mortalityScore >= 1 ||
    !Number.isFinite(phenotypicAge)
  ) {
    return insufficientResult(inputs, ageValid, requirements);
  }

  return {
    status: 'calculated',
    bloodPhenotypicAge: Math.round(phenotypicAge * 10) / 10,
    chronologicalAge: inputs.age,
    ageValid,
    requirements,
    presentCount: PHENO_BIOMARKER_LIST.length,
    totalRequired: PHENO_BIOMARKER_LIST.length,
    missingCount: 0,
    missingBiomarkers: [],
    calculatedAt: new Date(safeAsOfMs).toISOString(),
    modelLimitations: PHENO_AGE_MODEL_LIMITATIONS,
  };
}
