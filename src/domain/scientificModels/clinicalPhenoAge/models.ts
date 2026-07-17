import type { ScientificEligibilityResult, ScientificExecutionAuthorization } from '../eligibilityModels';
import type { EvidenceReferenceId } from '../models';

export type ClinicalPhenoAgeInputId =
  | 'chronological_age'
  | 'albumin'
  | 'creatinine'
  | 'glucose'
  | 'crp'
  | 'lymphocyte_percent'
  | 'mean_cell_volume'
  | 'red_cell_distribution_width'
  | 'alkaline_phosphatase'
  | 'white_blood_cell_count';

export type ClinicalPhenoAgeCanonicalUnit =
  | 'years'
  | 'g/L'
  | 'μmol/L'
  | 'mmol/L'
  | 'mg/dL'
  | '%'
  | 'fL'
  | 'U/L'
  | '10^3/μL';

export interface ClinicalPhenoAgeInput {
  id: ClinicalPhenoAgeInputId;
  measurementId: string;
  value: number;
  unit: ClinicalPhenoAgeCanonicalUnit;
}

export interface ClinicalPhenoAgeCalculationRequest {
  authorization?: ScientificExecutionAuthorization | ScientificEligibilityResult | null;
  normalizationVersion: string;
  inputs: readonly ClinicalPhenoAgeInput[];
}

export type ClinicalPhenoAgeErrorCode =
  | 'AuthorizationMissing'
  | 'AuthorizationDenied'
  | 'AuthorizationModelMismatch'
  | 'AuthorizationVersionMismatch'
  | 'AuthorizationExpired'
  | 'AuthorizationAltered'
  | 'InputPolicyMismatch'
  | 'InputSetMismatch'
  | 'MissingInput'
  | 'DuplicateInput'
  | 'MeasurementIdentifierMismatch'
  | 'AuthorizedEvidenceMismatch'
  | 'InvalidUnit'
  | 'InvalidNumericType'
  | 'NonFiniteValue'
  | 'OutOfSafetyBounds'
  | 'ComputationalDomainError'
  | 'UnsupportedNormalizationVersion'
  | 'FormulaIntegrityError';

export class ClinicalPhenoAgeCalculationError extends Error {
  readonly code: ClinicalPhenoAgeErrorCode;
  readonly inputId: ClinicalPhenoAgeInputId | null;

  constructor(code: ClinicalPhenoAgeErrorCode, message: string, inputId: ClinicalPhenoAgeInputId | null = null) {
    super(message);
    this.name = 'ClinicalPhenoAgeCalculationError';
    this.code = code;
    this.inputId = inputId;
  }
}

export interface ClinicalPhenoAgeInputSnapshot {
  id: ClinicalPhenoAgeInputId;
  measurementId: string;
  value: number;
  unit: ClinicalPhenoAgeCanonicalUnit;
}

export interface ClinicalPhenoAgeEvidenceReference {
  id: EvidenceReferenceId;
  title: string;
  doi: string;
  url: string;
}

export interface ClinicalPhenoAgePrecisionMetadata {
  arithmetic: 'IEEE-754 binary64';
  intermediateRounding: 'none';
  outputRounding: 'none';
  presentationRounding: 'not_applied';
  deterministicTestTolerance: { absolute: number; relative: number };
}

export interface ClinicalPhenoAgeResult {
  calculationStatus: 'calculated';
  modelId: 'clinical_phenoage';
  modelVersion: 'clinical-phenoage/1.0.0';
  coefficientVersion: 'clinical-phenoage-coefficients/1.0.0';
  normalizationVersion: 'clinical-phenoage-canonical-units/1.0.0';
  implementationVersion: 'vitalspan-clinical-phenoage/1.0.0';
  phenotypicAgeYears: number;
  chronologicalAgeYears: number;
  ageDifferenceYears: number;
  calculatedAt: string;
  inputSnapshot: readonly ClinicalPhenoAgeInputSnapshot[];
  inputSnapshotHash: string;
  authorization: {
    reference: string;
    integrityHash: string;
    issuedAt: string;
    expiresAt: string;
  };
  evidenceReferences: readonly ClinicalPhenoAgeEvidenceReference[];
  formulaProvenance: {
    model: 'Clinical Phenotypic Age';
    publication: 'Levine et al. (2018)';
    doi: '10.18632/aging.101414';
    coefficientFingerprint: string;
  };
  canonicalUnits: Readonly<Record<ClinicalPhenoAgeInputId, ClinicalPhenoAgeCanonicalUnit>>;
  warnings: readonly string[];
  limitations: readonly string[];
  precision: ClinicalPhenoAgePrecisionMetadata;
}

/** Audit-only stages. The mortality transformation is never included in the product result. */
export interface ClinicalPhenoAgeAuditStages {
  validatedInputSnapshot: readonly ClinicalPhenoAgeInputSnapshot[];
  transformedInputs: { naturalLogCrp: number };
  linearPredictor: number;
  publishedMortalityTransformation: number;
  transformedMortality: number;
  phenotypicAgeYears: number;
}

export interface ClinicalPhenoAgeAuditResult {
  result: ClinicalPhenoAgeResult;
  audit: ClinicalPhenoAgeAuditStages;
}
