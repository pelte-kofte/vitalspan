import { verifyScientificExecutionAuthorization } from '../eligibility';
import type { ScientificExecutionAuthorization } from '../eligibilityModels';
import {
  CLINICAL_PHENOAGE_CANONICAL_UNITS,
  CLINICAL_PHENOAGE_COMPUTATIONAL_BOUNDS,
  CLINICAL_PHENOAGE_INPUT_ORDER,
  CLINICAL_PHENOAGE_INPUT_POLICY_ID,
  CLINICAL_PHENOAGE_MODEL_ID,
  CLINICAL_PHENOAGE_MODEL_VERSION,
  CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
} from './constants';
import {
  ClinicalPhenoAgeCalculationError,
  type ClinicalPhenoAgeCalculationRequest,
  type ClinicalPhenoAgeInput,
  type ClinicalPhenoAgeInputId,
  type ClinicalPhenoAgeInputSnapshot,
} from './models';

export interface ValidatedClinicalPhenoAgeRequest {
  authorization: ScientificExecutionAuthorization;
  inputs: readonly ClinicalPhenoAgeInputSnapshot[];
  values: Readonly<Record<ClinicalPhenoAgeInputId, number>>;
}

function isInputId(value: unknown): value is ClinicalPhenoAgeInputId {
  return typeof value === 'string'
    && (CLINICAL_PHENOAGE_INPUT_ORDER as readonly string[]).includes(value);
}

function validateAuthorization(
  authorization: ClinicalPhenoAgeCalculationRequest['authorization'],
  now: number,
): ScientificExecutionAuthorization {
  if (!authorization) {
    throw new ClinicalPhenoAgeCalculationError(
      'AuthorizationMissing',
      'A ScientificExecutionAuthorization is required before Clinical PhenoAge can execute.',
    );
  }
  if (authorization.modelId !== CLINICAL_PHENOAGE_MODEL_ID) {
    throw new ClinicalPhenoAgeCalculationError(
      'AuthorizationModelMismatch',
      `Authorization is for ${authorization.modelId}, not ${CLINICAL_PHENOAGE_MODEL_ID}.`,
    );
  }
  if (authorization.eligibleVersion !== CLINICAL_PHENOAGE_MODEL_VERSION
    || authorization.requestedVersion !== CLINICAL_PHENOAGE_MODEL_VERSION) {
    throw new ClinicalPhenoAgeCalculationError(
      'AuthorizationVersionMismatch',
      `Authorization does not permit ${CLINICAL_PHENOAGE_MODEL_VERSION}.`,
    );
  }
  if (authorization.status !== 'eligible' || !authorization.calculationAllowed) {
    throw new ClinicalPhenoAgeCalculationError(
      'AuthorizationDenied',
      'Eligibility did not grant calculation permission.',
    );
  }
  if (authorization.inputPolicyId !== CLINICAL_PHENOAGE_INPUT_POLICY_ID) {
    throw new ClinicalPhenoAgeCalculationError(
      'InputPolicyMismatch',
      `Authorization does not bind ${CLINICAL_PHENOAGE_INPUT_POLICY_ID}.`,
    );
  }
  const verification = verifyScientificExecutionAuthorization(authorization, now);
  if (!verification.valid) {
    const expired = verification.reason === 'expired';
    throw new ClinicalPhenoAgeCalculationError(
      expired ? 'AuthorizationExpired' : 'AuthorizationAltered',
      expired
        ? 'Scientific execution authorization has expired and must be re-evaluated.'
        : 'Scientific execution authorization was not issued by the eligibility engine or no longer matches its integrity binding.',
    );
  }
  return verification.authorization;
}

export function validateClinicalPhenoAgeRequest(
  request: ClinicalPhenoAgeCalculationRequest,
  now: number,
): ValidatedClinicalPhenoAgeRequest {
  const authorization = validateAuthorization(request?.authorization, now);
  if (request.normalizationVersion !== CLINICAL_PHENOAGE_NORMALIZATION_VERSION) {
    throw new ClinicalPhenoAgeCalculationError(
      'UnsupportedNormalizationVersion',
      `Inputs must already satisfy ${CLINICAL_PHENOAGE_NORMALIZATION_VERSION}; no conversion is performed here.`,
    );
  }
  if (!Array.isArray(request.inputs)) {
    throw new ClinicalPhenoAgeCalculationError('InputSetMismatch', 'Clinical PhenoAge inputs must be an explicit array.');
  }

  const rawInputs = request.inputs as readonly unknown[];
  const unknownIndex = rawInputs.findIndex(input => !input || typeof input !== 'object'
    || !isInputId((input as { id?: unknown }).id));
  if (unknownIndex >= 0) {
    const unknown = rawInputs[unknownIndex];
    const identifier = unknown && typeof unknown === 'object'
      ? (unknown as { id?: unknown }).id
      : unknown;
    throw new ClinicalPhenoAgeCalculationError(
      'InputSetMismatch',
      `Unexpected input identifier ${String(identifier)}; substitutions are not permitted.`,
    );
  }
  const typedInputs = rawInputs as readonly ClinicalPhenoAgeInput[];
  const inputIds = typedInputs.map(input => input.id);
  const duplicate = inputIds.find((id, index) => inputIds.indexOf(id) !== index);
  if (duplicate) {
    throw new ClinicalPhenoAgeCalculationError('DuplicateInput', `${duplicate} was supplied more than once.`, duplicate);
  }
  const missing = CLINICAL_PHENOAGE_INPUT_ORDER.find(id => !inputIds.includes(id));
  if (missing) {
    throw new ClinicalPhenoAgeCalculationError('MissingInput', `${missing} is required; missing values are never estimated.`, missing);
  }
  if (typedInputs.length !== CLINICAL_PHENOAGE_INPUT_ORDER.length) {
    throw new ClinicalPhenoAgeCalculationError('InputSetMismatch', 'The supplied input set does not exactly match the published model.');
  }

  const authorizedByInputId = new Map(authorization.authorizedEvidence.map(evidence => [evidence.inputId, evidence]));
  if (authorizedByInputId.size !== CLINICAL_PHENOAGE_INPUT_ORDER.length) {
    throw new ClinicalPhenoAgeCalculationError('InputSetMismatch', 'Authorization does not bind the exact published evidence set.');
  }

  const snapshots: ClinicalPhenoAgeInputSnapshot[] = [];
  const values = {} as Record<ClinicalPhenoAgeInputId, number>;
  for (const id of CLINICAL_PHENOAGE_INPUT_ORDER) {
    const input = typedInputs.find(candidate => candidate.id === id);
    if (!input) throw new ClinicalPhenoAgeCalculationError('MissingInput', `${id} is required.`, id);
    const authorized = authorizedByInputId.get(id);
    if (!authorized || input.measurementId !== authorized.measurementId || !input.measurementId?.trim()) {
      throw new ClinicalPhenoAgeCalculationError(
        'MeasurementIdentifierMismatch',
        `${id} does not match the measurement authorized by scientific eligibility.`,
        id,
      );
    }
    const expectedUnit = CLINICAL_PHENOAGE_CANONICAL_UNITS[id];
    if (input.unit !== expectedUnit || authorized.unit !== expectedUnit) {
      throw new ClinicalPhenoAgeCalculationError(
        'InvalidUnit',
        `${id} must be pre-normalized to ${expectedUnit}; unit conversion is not performed by the calculation engine.`,
        id,
      );
    }
    if (typeof input.value !== 'number') {
      throw new ClinicalPhenoAgeCalculationError('InvalidNumericType', `${id} must be a numeric value, not a locale-formatted string.`, id);
    }
    if (!Number.isFinite(input.value)) {
      throw new ClinicalPhenoAgeCalculationError('NonFiniteValue', `${id} must be finite.`, id);
    }
    const bounds = CLINICAL_PHENOAGE_COMPUTATIONAL_BOUNDS[id];
    const belowMinimum = bounds.minimumInclusive
      ? input.value < bounds.minimum
      : input.value <= bounds.minimum;
    if (belowMinimum || input.value > bounds.maximum) {
      throw new ClinicalPhenoAgeCalculationError(
        'OutOfSafetyBounds',
        `${id} is outside explicit computational safety bounds; the value was not clamped.`,
        id,
      );
    }
    const value = Object.is(input.value, -0) ? 0 : input.value;
    if (id === 'chronological_age'
      && value !== authorization.authorizedChronologicalAgeYears) {
      throw new ClinicalPhenoAgeCalculationError(
        'AuthorizedEvidenceMismatch',
        'Chronological age does not match the age evidence evaluated by scientific eligibility.',
        id,
      );
    }
    values[id] = value;
    snapshots.push({ id, measurementId: input.measurementId, value, unit: expectedUnit });
  }
  return { authorization, inputs: snapshots, values };
}
