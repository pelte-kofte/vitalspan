import type {
  EvidenceReferenceId,
  ScientificInputPolicyId,
  ScientificInputSource,
  ScientificModelId,
} from './models';

export type ScientificEligibilityStatus =
  | 'eligible'
  | 'conditionally_eligible'
  | 'research_only'
  | 'not_eligible'
  | 'unsupported'
  | 'retired';

export type ScientificEligibilityConfidence =
  | 'insufficient'
  | 'limited'
  | 'moderate'
  | 'high'
  | 'very_high';

export type ScientificModelLifecycle =
  | 'active'
  | 'research_only'
  | 'unsupported'
  | 'retired';

export type ScientificSex = 'female' | 'male' | 'intersex' | 'unknown' | 'not_recorded';
export type Compatibility = 'supported' | 'unsupported' | 'unknown';
export type MeasurementValidity = 'valid' | 'invalid' | 'unknown';
export type EvidenceFreshness = 'current' | 'stale' | 'unknown';
export type DeviceQuality = 'validated' | 'unvalidated' | 'unknown';

export interface ScientificEligibilityInput {
  id: string;
  /** Stable identifier for the exact measurement authorized for downstream use. */
  measurementId: string;
  present: boolean;
  source: ScientificInputSource;
  unit?: string;
  measurementValidity: MeasurementValidity;
  freshness: EvidenceFreshness;
  assayCompatibility: Compatibility;
  confidence: ScientificEligibilityConfidence;
  measuredAt?: string;
  deprecated?: boolean;
}

export interface ScientificPopulationEvidence {
  ageYears?: number;
  sex: ScientificSex;
  compatibility: Compatibility;
  provenance: string;
}

export interface ScientificLaboratoryEvidence {
  compatibility: Compatibility;
  contextId?: string;
  provenance: string;
}

export interface ScientificCalibrationEvidence {
  calibrationId?: string;
  compatibility: Compatibility;
  version?: string;
  provenance: string;
}

export interface ScientificDeviceEvidence {
  deviceType?: string;
  compatibility: Compatibility;
  quality: DeviceQuality;
  provenance: string;
}

export interface ScientificHistoryEvidence {
  observationCount: number;
  timeSpanDays: number;
  continuity: 'continuous' | 'sparse' | 'unknown';
}

export interface ScientificEligibilityRequest {
  modelId: ScientificModelId;
  requestedVersion: string;
  assessedAt: string;
  inputs: readonly ScientificEligibilityInput[];
  population: ScientificPopulationEvidence;
  laboratory: ScientificLaboratoryEvidence | null;
  calibration: ScientificCalibrationEvidence | null;
  device: ScientificDeviceEvidence | null;
  history: ScientificHistoryEvidence;
}

export interface ScientificModelVersion {
  modelId: ScientificModelId;
  version: string;
  lifecycle: ScientificModelLifecycle;
  inputPolicyId: ScientificInputPolicyId | null;
  minimumAgeYears: number | null;
  maximumAgeYears: number | null;
  allowedSex: readonly ScientificSex[] | null;
  requiresLaboratoryContext: boolean;
  requiredCalibrationIds: readonly string[];
  requiresDevice: boolean;
  supportedDeviceTypes: readonly string[];
  minimumHistoryObservations: number;
  minimumHistoryDays: number;
  sparseHistoryIsWarning: boolean;
  deprecatedInputIds: readonly string[];
  evidenceReferenceIds: readonly EvidenceReferenceId[];
  scientificNotes: readonly string[];
}

export type ScientificEligibilityIssueCode =
  | 'unknown_model_version'
  | 'research_only_model'
  | 'unsupported_model'
  | 'retired_model'
  | 'missing_required_input'
  | 'duplicate_input'
  | 'missing_measurement_identifier'
  | 'duplicate_measurement_identifier'
  | 'wrong_input_source'
  | 'missing_unit'
  | 'unsupported_unit'
  | 'invalid_measurement'
  | 'unknown_measurement_validity'
  | 'stale_measurement'
  | 'unknown_freshness'
  | 'unsupported_assay'
  | 'unknown_assay'
  | 'insufficient_input_confidence'
  | 'population_mismatch'
  | 'population_unknown'
  | 'missing_age'
  | 'age_outside_range'
  | 'missing_required_sex'
  | 'sex_restriction_mismatch'
  | 'missing_laboratory_context'
  | 'unsupported_laboratory_context'
  | 'unknown_laboratory_context'
  | 'missing_reference_calibration'
  | 'unsupported_reference_calibration'
  | 'unknown_reference_calibration'
  | 'missing_device'
  | 'unsupported_device'
  | 'unknown_device_compatibility'
  | 'unvalidated_device_quality'
  | 'unknown_device_quality'
  | 'insufficient_history'
  | 'sparse_history'
  | 'deprecated_input'
  | 'invalid_assessment_timestamp';

export type ScientificEligibilityIssueSeverity = 'blocking' | 'conditional' | 'informational';

export interface ScientificEligibilityIssue {
  code: ScientificEligibilityIssueCode;
  severity: ScientificEligibilityIssueSeverity;
  message: string;
  inputId?: string;
}

export interface ScientificEligibilityResult {
  modelId: ScientificModelId;
  requestedVersion: string;
  status: ScientificEligibilityStatus;
  confidence: ScientificEligibilityConfidence;
  blockingIssues: readonly ScientificEligibilityIssue[];
  warnings: readonly ScientificEligibilityIssue[];
  missingInputs: readonly string[];
  satisfiedInputs: readonly string[];
  scientificNotes: readonly string[];
  failureReasons: readonly string[];
  eligibleVersion: string | null;
  evidenceSource: readonly EvidenceReferenceId[];
  calculationAllowed: boolean;
  humanExplanation: string;
  inputPolicyId: ScientificInputPolicyId | null;
  authorizationReference: string | null;
  authorizationIssuedAt: string | null;
  authorizationExpiresAt: string | null;
  authorizationIntegrityHash: string | null;
  authorizedEvidence: readonly ScientificAuthorizedEvidence[];
  authorizedChronologicalAgeYears: number | null;
}

export interface ScientificAuthorizedEvidence {
  inputId: string;
  measurementId: string;
  source: ScientificInputSource;
  unit: string;
  measuredAt: string | null;
}

export type ScientificExecutionAuthorization = ScientificEligibilityResult & {
  status: 'eligible';
  eligibleVersion: string;
  calculationAllowed: true;
  inputPolicyId: ScientificInputPolicyId;
  authorizationReference: string;
  authorizationIssuedAt: string;
  authorizationExpiresAt: string;
  authorizationIntegrityHash: string;
  authorizedChronologicalAgeYears: number;
};

export type ScientificAuthorizationInvalidReason =
  | 'not_issued_by_engine'
  | 'not_eligible'
  | 'altered'
  | 'expired';

export type ScientificAuthorizationVerification =
  | { valid: true; authorization: ScientificExecutionAuthorization }
  | { valid: false; reason: ScientificAuthorizationInvalidReason };
