import { stableSha256 } from '../sha256';
import {
  CLINICAL_PHENOAGE_CANONICAL_UNITS,
  CLINICAL_PHENOAGE_COEFFICIENT_VERSION,
  CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT,
  CLINICAL_PHENOAGE_FORMULA_DEFINITION,
  CLINICAL_PHENOAGE_IMPLEMENTATION_VERSION,
  CLINICAL_PHENOAGE_LIMITATIONS,
  CLINICAL_PHENOAGE_MODEL_ID,
  CLINICAL_PHENOAGE_MODEL_VERSION,
  CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
  CLINICAL_PHENOAGE_WARNINGS,
} from './constants';
import { assertClinicalPhenoAgeFormulaIntegrity } from './integrity';
import {
  ClinicalPhenoAgeCalculationError,
  type ClinicalPhenoAgeAuditResult,
  type ClinicalPhenoAgeCalculationRequest,
  type ClinicalPhenoAgeResult,
} from './models';
import { validateClinicalPhenoAgeRequest } from './validation';

function numericFormula() {
  const definition = CLINICAL_PHENOAGE_FORMULA_DEFINITION;
  return {
    linear: Object.fromEntries(Object.entries(definition.linearPredictor)
      .map(([key, value]) => [key, Number(value)])) as Record<keyof typeof definition.linearPredictor, number>,
    observationMonths: Number(definition.mortalityTransformation.observationMonths),
    gompertzGamma: Number(definition.mortalityTransformation.gompertzGamma),
    mortalityMultiplier: Number(definition.ageTransformation.mortalityMultiplier),
    ageIntercept: Number(definition.ageTransformation.intercept),
    ageScale: Number(definition.ageTransformation.scale),
  };
}

function requireFinite(value: number, stage: string): number {
  if (!Number.isFinite(value)) {
    throw new ClinicalPhenoAgeCalculationError(
      'ComputationalDomainError',
      `The published formula left its finite computational domain at ${stage}; no partial age was returned.`,
    );
  }
  return value;
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value as Record<string, unknown>).forEach(item => deepFreeze(item));
    Object.freeze(value);
  }
  return value;
}

export function calculateClinicalPhenoAgeWithAudit(
  request: ClinicalPhenoAgeCalculationRequest,
): ClinicalPhenoAgeAuditResult {
  const now = Date.now();
  const validated = validateClinicalPhenoAgeRequest(request, now);
  assertClinicalPhenoAgeFormulaIntegrity();
  const formula = numericFormula();
  const value = validated.values;

  const naturalLogCrp = requireFinite(Math.log(value.crp), 'natural-log CRP transformation');
  const linearPredictor = requireFinite(
    formula.linear.intercept
      + formula.linear.albumin * value.albumin
      + formula.linear.creatinine * value.creatinine
      + formula.linear.glucose * value.glucose
      + formula.linear.natural_log_crp * naturalLogCrp
      + formula.linear.lymphocyte_percent * value.lymphocyte_percent
      + formula.linear.mean_cell_volume * value.mean_cell_volume
      + formula.linear.red_cell_distribution_width * value.red_cell_distribution_width
      + formula.linear.alkaline_phosphatase * value.alkaline_phosphatase
      + formula.linear.white_blood_cell_count * value.white_blood_cell_count
      + formula.linear.chronological_age * value.chronological_age,
    'linear predictor',
  );
  const publishedMortalityTransformation = requireFinite(
    1 - Math.exp(
      -Math.exp(linearPredictor)
      * (Math.exp(formula.observationMonths * formula.gompertzGamma) - 1)
      / formula.gompertzGamma,
    ),
    'published mortality transformation',
  );
  if (publishedMortalityTransformation <= 0 || publishedMortalityTransformation >= 1) {
    throw new ClinicalPhenoAgeCalculationError(
      'ComputationalDomainError',
      'The published mortality transformation is outside the open interval (0, 1); no partial age was returned.',
    );
  }
  const transformedMortality = requireFinite(
    formula.mortalityMultiplier * Math.log(1 - publishedMortalityTransformation),
    'age transformation',
  );
  if (transformedMortality <= 0) {
    throw new ClinicalPhenoAgeCalculationError(
      'ComputationalDomainError',
      'The logarithmic age transformation is undefined for the supplied values; no partial age was returned.',
    );
  }
  const phenotypicAgeYears = requireFinite(
    formula.ageIntercept + Math.log(transformedMortality) / formula.ageScale,
    'phenotypic-age output',
  );
  const ageDifferenceYears = requireFinite(
    phenotypicAgeYears - value.chronological_age,
    'age-difference output',
  );

  const inputSnapshotHash = stableSha256({
    modelVersion: CLINICAL_PHENOAGE_MODEL_VERSION,
    normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
    inputs: validated.inputs,
  });
  const result: ClinicalPhenoAgeResult = {
    calculationStatus: 'calculated',
    modelId: CLINICAL_PHENOAGE_MODEL_ID,
    modelVersion: CLINICAL_PHENOAGE_MODEL_VERSION,
    coefficientVersion: CLINICAL_PHENOAGE_COEFFICIENT_VERSION,
    normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
    implementationVersion: CLINICAL_PHENOAGE_IMPLEMENTATION_VERSION,
    phenotypicAgeYears,
    chronologicalAgeYears: value.chronological_age,
    ageDifferenceYears,
    calculatedAt: new Date(now).toISOString(),
    inputSnapshot: validated.inputs,
    inputSnapshotHash,
    authorization: {
      reference: validated.authorization.authorizationReference,
      integrityHash: validated.authorization.authorizationIntegrityHash,
      issuedAt: validated.authorization.authorizationIssuedAt,
      expiresAt: validated.authorization.authorizationExpiresAt,
    },
    evidenceReferences: [{
      id: 'levine_phenoage_2018',
      title: 'An epigenetic biomarker of aging for lifespan and healthspan',
      doi: '10.18632/aging.101414',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5940111/',
    }],
    formulaProvenance: {
      model: 'Clinical Phenotypic Age',
      publication: 'Levine et al. (2018)',
      doi: '10.18632/aging.101414',
      coefficientFingerprint: CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT,
    },
    canonicalUnits: CLINICAL_PHENOAGE_CANONICAL_UNITS,
    warnings: CLINICAL_PHENOAGE_WARNINGS,
    limitations: CLINICAL_PHENOAGE_LIMITATIONS,
    precision: {
      arithmetic: 'IEEE-754 binary64',
      intermediateRounding: 'none',
      outputRounding: 'none',
      presentationRounding: 'not_applied',
      deterministicTestTolerance: { absolute: 1e-10, relative: 1e-12 },
    },
  };
  return deepFreeze({
    result: deepFreeze(result) as ClinicalPhenoAgeResult,
    audit: {
      validatedInputSnapshot: validated.inputs,
      transformedInputs: { naturalLogCrp },
      linearPredictor,
      publishedMortalityTransformation,
      transformedMortality,
      phenotypicAgeYears,
    },
  }) as ClinicalPhenoAgeAuditResult;
}

export function calculateClinicalPhenoAge(
  request: ClinicalPhenoAgeCalculationRequest,
): ClinicalPhenoAgeResult {
  return calculateClinicalPhenoAgeWithAudit(request).result;
}
