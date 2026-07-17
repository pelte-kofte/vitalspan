import type {
  ClinicalPhenoAgeCanonicalUnit,
  ClinicalPhenoAgeInputId,
} from './models';

export const CLINICAL_PHENOAGE_MODEL_ID = 'clinical_phenoage' as const;
export const CLINICAL_PHENOAGE_MODEL_VERSION = 'clinical-phenoage/1.0.0' as const;
export const CLINICAL_PHENOAGE_INPUT_POLICY_ID = 'clinical_phenoage_complete_visit' as const;
export const CLINICAL_PHENOAGE_COEFFICIENT_VERSION = 'clinical-phenoage-coefficients/1.0.0' as const;
export const CLINICAL_PHENOAGE_NORMALIZATION_VERSION = 'clinical-phenoage-canonical-units/1.0.0' as const;
export const CLINICAL_PHENOAGE_IMPLEMENTATION_VERSION = 'vitalspan-clinical-phenoage/1.0.0' as const;

export const CLINICAL_PHENOAGE_INPUT_ORDER = [
  'chronological_age',
  'albumin',
  'creatinine',
  'glucose',
  'crp',
  'lymphocyte_percent',
  'mean_cell_volume',
  'red_cell_distribution_width',
  'alkaline_phosphatase',
  'white_blood_cell_count',
] as const satisfies readonly ClinicalPhenoAgeInputId[];

export const CLINICAL_PHENOAGE_CANONICAL_UNITS = Object.freeze({
  chronological_age: 'years',
  albumin: 'g/L',
  creatinine: 'μmol/L',
  glucose: 'mmol/L',
  crp: 'mg/dL',
  lymphocyte_percent: '%',
  mean_cell_volume: 'fL',
  red_cell_distribution_width: '%',
  alkaline_phosphatase: 'U/L',
  white_blood_cell_count: '10^3/μL',
} as const satisfies Record<ClinicalPhenoAgeInputId, ClinicalPhenoAgeCanonicalUnit>);

/**
 * These are computational safety bounds, not reference intervals or clinical
 * interpretations. Values are rejected, never clamped.
 */
export const CLINICAL_PHENOAGE_COMPUTATIONAL_BOUNDS = Object.freeze({
  chronological_age: { minimum: 20, maximum: 130, minimumInclusive: true },
  albumin: { minimum: 0, maximum: 200, minimumInclusive: false },
  creatinine: { minimum: 0, maximum: 5000, minimumInclusive: false },
  glucose: { minimum: 0, maximum: 100, minimumInclusive: false },
  crp: { minimum: 0, maximum: 1000, minimumInclusive: false },
  lymphocyte_percent: { minimum: 0, maximum: 100, minimumInclusive: true },
  mean_cell_volume: { minimum: 0, maximum: 300, minimumInclusive: false },
  red_cell_distribution_width: { minimum: 0, maximum: 100, minimumInclusive: false },
  alkaline_phosphatase: { minimum: 0, maximum: 10000, minimumInclusive: true },
  white_blood_cell_count: { minimum: 0, maximum: 1000, minimumInclusive: true },
} as const satisfies Record<ClinicalPhenoAgeInputId, {
  minimum: number;
  maximum: number;
  minimumInclusive: boolean;
}>);

/** Exact decimal text is fingerprinted before conversion to binary64 numbers. */
export const CLINICAL_PHENOAGE_FORMULA_DEFINITION = Object.freeze({
  formula: 'levine-clinical-phenotypic-age',
  coefficientVersion: CLINICAL_PHENOAGE_COEFFICIENT_VERSION,
  linearPredictor: Object.freeze({
    intercept: '-19.9067',
    chronological_age: '0.0804',
    albumin: '-0.0336',
    creatinine: '0.0095',
    glucose: '0.1953',
    natural_log_crp: '0.0954',
    lymphocyte_percent: '-0.0120',
    mean_cell_volume: '0.0268',
    red_cell_distribution_width: '0.3306',
    alkaline_phosphatase: '0.00188',
    white_blood_cell_count: '0.0554',
  }),
  mortalityTransformation: Object.freeze({
    observationMonths: '120',
    gompertzGamma: '0.0076927',
  }),
  ageTransformation: Object.freeze({
    mortalityMultiplier: '-0.00553',
    intercept: '141.50225',
    scale: '0.090165',
  }),
  doi: '10.18632/aging.101414',
} as const);

// Locked to the canonical JSON representation above. Any edit requires a new
// coefficient and implementation version plus fixture review.
export const CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT = '26d3842b55885598405ae13ae1d058c6403f11a049063d1c565c031f3e5ac4dc';

export const CLINICAL_PHENOAGE_LIMITATIONS = Object.freeze([
  'The model is a population-derived cross-sectional estimator and is not a diagnosis.',
  'A single complete laboratory visit does not establish a longitudinal aging trend.',
  'The output is not a lifespan, mortality, disease-risk, treatment-effect, or years-gained estimate.',
  'Transportability may be limited outside populations, assays, and measurement contexts represented by validation evidence.',
  'The engine does not interpret medications, symptoms, diagnoses, genetics, wearable data, or other health domains.',
] as const);

export const CLINICAL_PHENOAGE_WARNINGS = Object.freeze([
  'Interpret only with the source laboratory context and the scientific limitations retained in this result.',
  'No clinical recommendation or causal interpretation is produced.',
] as const);
