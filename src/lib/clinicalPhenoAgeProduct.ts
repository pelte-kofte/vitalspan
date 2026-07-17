import {
  CLINICAL_PHENOAGE_CANONICAL_UNITS,
  CLINICAL_PHENOAGE_COMPUTATIONAL_BOUNDS,
  CLINICAL_PHENOAGE_INPUT_ORDER,
  CLINICAL_PHENOAGE_LIMITATIONS,
  CLINICAL_PHENOAGE_MODEL_VERSION,
  CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
  calculateClinicalPhenoAge,
  evaluateScientificEligibility,
  isScientificExecutionAuthorized,
  stableSha256,
  type ClinicalPhenoAgeCalculationError,
  type ClinicalPhenoAgeInput,
  type ClinicalPhenoAgeInputId,
  type ClinicalPhenoAgeResult,
  type ScientificEligibilityInput,
  type ScientificEligibilityIssueCode,
  type ScientificEligibilityResult,
} from '../domain/scientificModels';
import type { StoredEntry } from '../types/biomarkerEntry';

const DAY_MS = 86_400_000;
const MAX_EVIDENCE_AGE_DAYS = 365;

export type ClinicalPhenoAgeRequirementStatus =
  | 'present'
  | 'missing'
  | 'stale'
  | 'invalid'
  | 'unit_incompatible';

export interface ClinicalPhenoAgeRequirementPresentationSource {
  inputId: Exclude<ClinicalPhenoAgeInputId, 'chronological_age'>;
  biomarkerId: string;
  label: string;
  canonicalUnit: string;
  status: ClinicalPhenoAgeRequirementStatus;
  measurementId: string | null;
  reportedUnit: string | null;
  collectedAt: string | null;
}

export type ClinicalPhenoAgeProductFailureCode =
  | 'missing_profile'
  | 'missing_biomarkers'
  | 'stale_evidence'
  | 'unsupported_units'
  | 'invalid_measurements'
  | 'invalid_measurement_context'
  | 'unsupported_version'
  | 'research_only'
  | 'authorization_denied'
  | 'calculation_unavailable';

export interface ClinicalPhenoAgeProductFailure {
  code: ClinicalPhenoAgeProductFailureCode;
  title: string;
  detail: string;
}

export interface ClinicalPhenoAgeProductEvaluation {
  status: 'available' | 'unavailable';
  scientificResult: ClinicalPhenoAgeResult | null;
  eligibility: ScientificEligibilityResult;
  requirements: readonly ClinicalPhenoAgeRequirementPresentationSource[];
  chronologicalAgeYears: number | null;
  failure: ClinicalPhenoAgeProductFailure | null;
  evaluatedAt: string;
  limitations: readonly string[];
}

interface NormalizedMeasurement {
  input: ClinicalPhenoAgeInput;
  eligibility: ScientificEligibilityInput;
  requirement: ClinicalPhenoAgeRequirementPresentationSource;
  source: string;
  collectionDay: string;
}

interface BloodInputDefinition {
  inputId: Exclude<ClinicalPhenoAgeInputId, 'chronological_age'>;
  biomarkerId: string;
  label: string;
  normalize: (value: number, unit: string) => number | null;
}

function exactUnit(unit: string, allowed: readonly string[]): string | null {
  const normalized = unit.trim().replace(/µ/g, 'μ');
  return allowed.includes(normalized) ? normalized : null;
}

const BLOOD_INPUTS = [
  {
    inputId: 'albumin', biomarkerId: 'albumin', label: 'Albumin',
    normalize: (value, unit) => {
      const accepted = exactUnit(unit, ['g/L', 'g/dL']);
      return accepted === 'g/L' ? value : accepted === 'g/dL' ? value * 10 : null;
    },
  },
  {
    inputId: 'creatinine', biomarkerId: 'creatinine', label: 'Creatinine',
    normalize: (value, unit) => {
      const accepted = exactUnit(unit, ['μmol/L', 'umol/L', 'mg/dL']);
      return accepted === 'mg/dL' ? value * 88.4 : accepted ? value : null;
    },
  },
  {
    inputId: 'glucose', biomarkerId: 'fastingglucose', label: 'Fasting Glucose',
    normalize: (value, unit) => {
      const accepted = exactUnit(unit, ['mmol/L', 'mg/dL']);
      return accepted === 'mg/dL' ? value / 18.0182 : accepted ? value : null;
    },
  },
  {
    inputId: 'crp', biomarkerId: 'hscrp', label: 'hsCRP / CRP',
    normalize: (value, unit) => {
      const accepted = exactUnit(unit, ['mg/dL', 'mg/L']);
      return accepted === 'mg/L' ? value / 10 : accepted ? value : null;
    },
  },
  {
    inputId: 'lymphocyte_percent', biomarkerId: 'lymphocytepct', label: 'Lymphocyte %',
    normalize: (value, unit) => exactUnit(unit, ['%']) ? value : null,
  },
  {
    inputId: 'mean_cell_volume', biomarkerId: 'mcv', label: 'MCV',
    normalize: (value, unit) => exactUnit(unit, ['fL']) ? value : null,
  },
  {
    inputId: 'red_cell_distribution_width', biomarkerId: 'rdw', label: 'RDW',
    normalize: (value, unit) => exactUnit(unit, ['%']) ? value : null,
  },
  {
    inputId: 'alkaline_phosphatase', biomarkerId: 'alp', label: 'Alkaline Phosphatase',
    normalize: (value, unit) => exactUnit(unit, ['U/L', 'IU/L']) ? value : null,
  },
  {
    inputId: 'white_blood_cell_count', biomarkerId: 'wbc', label: 'WBC',
    normalize: (value, unit) => exactUnit(unit, [
      '10^3/μL', '10³/μL', '×10³/μL', '10^3/uL', '10^9/L',
    ]) ? value : null,
  },
] as const satisfies readonly BloodInputDefinition[];

function sourceMeasurement(entry: StoredEntry): { value: number; unit: string } | null {
  const hasReportedValue = entry.reportedValue !== undefined;
  const hasReportedUnit = entry.reportedUnit !== undefined;
  if (hasReportedValue !== hasReportedUnit) return null;
  if (hasReportedValue && hasReportedUnit) {
    return { value: entry.reportedValue as number, unit: entry.reportedUnit as string };
  }
  if (!entry.unit) return null;
  return { value: entry.value, unit: entry.unit };
}

function valueWithinComputationalBounds(id: ClinicalPhenoAgeInputId, value: number): boolean {
  const bounds = CLINICAL_PHENOAGE_COMPUTATIONAL_BOUNDS[id];
  return Number.isFinite(value)
    && (bounds.minimumInclusive ? value >= bounds.minimum : value > bounds.minimum)
    && value <= bounds.maximum;
}

function measurementFreshness(
  collectedAt: string,
  assessedAtMs: number,
): 'current' | 'stale' | 'invalid' {
  const collectedAtMs = Date.parse(collectedAt);
  if (!Number.isFinite(collectedAtMs) || collectedAtMs > assessedAtMs) return 'invalid';
  return assessedAtMs - collectedAtMs <= MAX_EVIDENCE_AGE_DAYS * DAY_MS ? 'current' : 'stale';
}

function unavailableRequirement(
  definition: BloodInputDefinition,
  entry: StoredEntry | undefined,
  status: ClinicalPhenoAgeRequirementStatus,
): ClinicalPhenoAgeRequirementPresentationSource {
  return {
    inputId: definition.inputId,
    biomarkerId: definition.biomarkerId,
    label: definition.label,
    canonicalUnit: CLINICAL_PHENOAGE_CANONICAL_UNITS[definition.inputId],
    status,
    measurementId: entry?.id ?? null,
    reportedUnit: entry?.reportedUnit ?? entry?.unit ?? null,
    collectedAt: entry?.date ?? null,
  };
}

function normalizeBloodMeasurement(
  definition: BloodInputDefinition,
  entry: StoredEntry | undefined,
  assessedAtMs: number,
): NormalizedMeasurement | { eligibility: ScientificEligibilityInput; requirement: ClinicalPhenoAgeRequirementPresentationSource } {
  const baseEligibility = {
    id: definition.inputId,
    measurementId: entry?.id ?? `missing:${definition.inputId}`,
    present: Boolean(entry),
    source: 'laboratory' as const,
    confidence: 'very_high' as const,
    measuredAt: entry?.date,
  };
  if (!entry) {
    return {
      eligibility: {
        ...baseEligibility,
        present: false,
        measurementValidity: 'unknown',
        freshness: 'unknown',
        assayCompatibility: 'unknown',
      },
      requirement: unavailableRequirement(definition, undefined, 'missing'),
    };
  }
  const source = sourceMeasurement(entry);
  if (!source || !entry.source.trim()) {
    return {
      eligibility: {
        ...baseEligibility,
        unit: source?.unit,
        measurementValidity: 'invalid',
        freshness: 'unknown',
        assayCompatibility: source ? 'unknown' : 'unsupported',
      },
      requirement: unavailableRequirement(definition, entry, source ? 'invalid' : 'unit_incompatible'),
    };
  }
  const freshness = measurementFreshness(entry.date, assessedAtMs);
  const normalizedValue = definition.normalize(source.value, source.unit);
  if (normalizedValue === null) {
    return {
      eligibility: {
        ...baseEligibility,
        unit: source.unit,
        measurementValidity: Number.isFinite(source.value) ? 'valid' : 'invalid',
        freshness: freshness === 'invalid' ? 'unknown' : freshness,
        assayCompatibility: 'unsupported',
      },
      requirement: unavailableRequirement(definition, entry, 'unit_incompatible'),
    };
  }
  const validValue = valueWithinComputationalBounds(definition.inputId, normalizedValue);
  const eligibility: ScientificEligibilityInput = {
    ...baseEligibility,
    unit: CLINICAL_PHENOAGE_CANONICAL_UNITS[definition.inputId],
    measurementValidity: freshness === 'invalid' || !validValue ? 'invalid' : 'valid',
    freshness: freshness === 'invalid' ? 'unknown' : freshness,
    assayCompatibility: 'supported',
  };
  const status: ClinicalPhenoAgeRequirementStatus = !validValue || freshness === 'invalid'
    ? 'invalid'
    : freshness === 'stale' ? 'stale' : 'present';
  if (status !== 'present') {
    return { eligibility, requirement: unavailableRequirement(definition, entry, status) };
  }
  return {
    eligibility,
    requirement: unavailableRequirement(definition, entry, 'present'),
    input: {
      id: definition.inputId,
      measurementId: entry.id,
      value: Object.is(normalizedValue, -0) ? 0 : normalizedValue,
      unit: CLINICAL_PHENOAGE_CANONICAL_UNITS[definition.inputId],
    },
    source: entry.source.trim(),
    collectionDay: new Date(entry.date).toISOString().slice(0, 10),
  };
}

function failureFromEligibility(result: ScientificEligibilityResult): ClinicalPhenoAgeProductFailure {
  const codes = new Set<ScientificEligibilityIssueCode>([
    ...result.blockingIssues.map(issue => issue.code),
    ...result.warnings.map(issue => issue.code),
  ]);
  if (result.status === 'research_only') {
    return { code: 'research_only', title: 'Calculation unavailable', detail: 'This scientific model version is restricted to research.' };
  }
  if (result.status === 'unsupported' || result.status === 'retired') {
    return { code: 'unsupported_version', title: 'Calculation unavailable', detail: 'The requested scientific model version is not available for production use.' };
  }
  if (codes.has('missing_age') || codes.has('age_outside_range')) {
    return { code: 'missing_profile', title: 'Chronological age required', detail: 'Add a supported chronological age before this calculation can run.' };
  }
  if (codes.has('missing_required_input')) {
    return { code: 'missing_biomarkers', title: 'More laboratory data required', detail: 'All nine required blood measurements are needed before calculation.' };
  }
  if (codes.has('stale_measurement')) {
    return { code: 'stale_evidence', title: 'Current laboratory data required', detail: 'One or more required measurements are out of date.' };
  }
  if (codes.has('missing_unit') || codes.has('unsupported_unit') || codes.has('unsupported_assay')) {
    return { code: 'unsupported_units', title: 'Compatible units required', detail: 'One or more measurements cannot be normalized under the validated unit contract.' };
  }
  if (codes.has('invalid_measurement') || codes.has('missing_measurement_identifier')
    || codes.has('duplicate_measurement_identifier')) {
    return { code: 'invalid_measurements', title: 'Valid measurements required', detail: 'One or more measurements are invalid or cannot be identified reliably.' };
  }
  if (codes.has('missing_laboratory_context') || codes.has('unsupported_laboratory_context')
    || codes.has('unknown_laboratory_context')) {
    return { code: 'invalid_measurement_context', title: 'Laboratory context required', detail: 'The required measurements must come from one identifiable laboratory collection.' };
  }
  return { code: 'authorization_denied', title: 'Calculation unavailable', detail: 'Scientific eligibility did not authorize this calculation.' };
}

function failureFromCalculation(error: ClinicalPhenoAgeCalculationError): ClinicalPhenoAgeProductFailure {
  if (error.code === 'AuthorizationVersionMismatch' || error.code === 'AuthorizationModelMismatch'
    || error.code === 'InputPolicyMismatch' || error.code === 'UnsupportedNormalizationVersion') {
    return { code: 'unsupported_version', title: 'Calculation unavailable', detail: 'The authorized scientific version does not match the production engine.' };
  }
  if (error.code.startsWith('Authorization')) {
    return { code: 'authorization_denied', title: 'Calculation unavailable', detail: 'Scientific authorization could not be verified.' };
  }
  if (error.code === 'InvalidUnit' || error.code === 'InvalidNumericType'
    || error.code === 'NonFiniteValue' || error.code === 'OutOfSafetyBounds'
    || error.code === 'MeasurementIdentifierMismatch' || error.code === 'AuthorizedEvidenceMismatch') {
    return { code: 'invalid_measurements', title: 'Valid measurements required', detail: 'The authorized measurement payload failed scientific validation.' };
  }
  return { code: 'calculation_unavailable', title: 'Calculation unavailable', detail: 'The scientific engine could not produce a valid result from this evidence.' };
}

export function evaluateClinicalPhenoAgeForProduct(
  chronologicalAgeYears: number | null | undefined,
  latestEntries: ReadonlyMap<string, StoredEntry>,
  assessedAt = new Date(),
): ClinicalPhenoAgeProductEvaluation {
  const assessedAtMs = assessedAt.getTime();
  const evaluatedAt = Number.isFinite(assessedAtMs)
    ? assessedAt.toISOString()
    : new Date(0).toISOString();
  const age = typeof chronologicalAgeYears === 'number' && Number.isFinite(chronologicalAgeYears)
    ? chronologicalAgeYears
    : null;
  const normalized = BLOOD_INPUTS.map(definition => normalizeBloodMeasurement(
    definition,
    latestEntries.get(definition.biomarkerId),
    Date.parse(evaluatedAt),
  ));
  const requirements = normalized.map(item => item.requirement);
  const eligibleMeasurements = normalized.filter(
    (item): item is NormalizedMeasurement => 'input' in item,
  );
  const collectionDays = new Set(eligibleMeasurements.map(item => item.collectionDay));
  const sourceNames = new Set(eligibleMeasurements.map(item => item.source));
  const completeContext = eligibleMeasurements.length === BLOOD_INPUTS.length
    && collectionDays.size === 1
    && sourceNames.size === 1;
  const ageInput: ScientificEligibilityInput = {
    id: 'chronological_age',
    measurementId: age === null ? 'missing:chronological_age' : `profile-age:${age}`,
    present: age !== null,
    source: 'chronological_record',
    unit: 'years',
    measurementValidity: age !== null && valueWithinComputationalBounds('chronological_age', age) ? 'valid' : 'invalid',
    freshness: 'current',
    assayCompatibility: 'supported',
    confidence: 'very_high',
    measuredAt: evaluatedAt,
  };
  const evidenceIds = eligibleMeasurements.map(item => item.input.measurementId).sort();
  const eligibility = evaluateScientificEligibility({
    modelId: 'clinical_phenoage',
    requestedVersion: CLINICAL_PHENOAGE_MODEL_VERSION,
    assessedAt: evaluatedAt,
    inputs: [ageInput, ...normalized.map(item => item.eligibility)],
    population: {
      ...(age === null ? {} : { ageYears: age }),
      sex: 'not_recorded',
      compatibility: age === null ? 'unknown' : 'supported',
      provenance: 'Vitalspan profile chronological-age record',
    },
    laboratory: eligibleMeasurements.length === 0 ? null : {
      compatibility: completeContext ? 'supported' : 'unsupported',
      ...(evidenceIds.length > 0 ? {
        contextId: `clinical-phenoage-evidence:${stableSha256(evidenceIds).slice(0, 24)}`,
      } : {}),
      provenance: completeContext
        ? `Single collection from ${eligibleMeasurements[0]?.source ?? 'source laboratory'}`
        : 'Incomplete or mixed laboratory collection context',
    },
    calibration: null,
    device: null,
    history: {
      observationCount: eligibleMeasurements.length === BLOOD_INPUTS.length ? 1 : 0,
      timeSpanDays: 0,
      continuity: eligibleMeasurements.length === BLOOD_INPUTS.length ? 'sparse' : 'unknown',
    },
  });
  if (!isScientificExecutionAuthorized(eligibility, Date.parse(evaluatedAt))) {
    return {
      status: 'unavailable',
      scientificResult: null,
      eligibility,
      requirements,
      chronologicalAgeYears: age,
      failure: failureFromEligibility(eligibility),
      evaluatedAt,
      limitations: CLINICAL_PHENOAGE_LIMITATIONS,
    };
  }
  try {
    const orderedInputs: ClinicalPhenoAgeInput[] = CLINICAL_PHENOAGE_INPUT_ORDER.map(id => {
      if (id === 'chronological_age') {
        return {
          id,
          measurementId: ageInput.measurementId,
          value: age as number,
          unit: 'years',
        };
      }
      const measurement = eligibleMeasurements.find(item => item.input.id === id);
      if (!measurement) throw new Error(`Authorized product invariant failed for ${id}.`);
      return measurement.input;
    });
    const scientificResult = calculateClinicalPhenoAge({
      authorization: eligibility,
      normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
      inputs: orderedInputs,
    });
    return {
      status: 'available',
      scientificResult,
      eligibility,
      requirements,
      chronologicalAgeYears: age,
      failure: null,
      evaluatedAt,
      limitations: scientificResult.limitations,
    };
  } catch (error) {
    const safeFailure = error instanceof Error && 'code' in error
      ? failureFromCalculation(error as ClinicalPhenoAgeCalculationError)
      : { code: 'calculation_unavailable' as const, title: 'Calculation unavailable', detail: 'The scientific engine could not produce a valid result from this evidence.' };
    return {
      status: 'unavailable',
      scientificResult: null,
      eligibility,
      requirements,
      chronologicalAgeYears: age,
      failure: safeFailure,
      evaluatedAt,
      limitations: CLINICAL_PHENOAGE_LIMITATIONS,
    };
  }
}
