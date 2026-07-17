import type {
  ScientificEligibilityConfidence,
  ScientificEligibilityInput,
  ScientificEligibilityIssue,
  ScientificEligibilityIssueCode,
  ScientificEligibilityIssueSeverity,
  ScientificEligibilityRequest,
  ScientificEligibilityResult,
  ScientificEligibilityStatus,
  ScientificAuthorizationVerification,
  ScientificAuthorizedEvidence,
  ScientificExecutionAuthorization,
  ScientificModelVersion,
} from './eligibilityModels';
import { SCIENTIFIC_INPUT_POLICIES } from './inputPolicies';
import type { ScientificInputPolicy, ScientificInputRequirement } from './models';
import { SCIENTIFIC_MODEL_VERSIONS } from './modelVersions';
import { getScientificModel } from './validation';
import { stableSha256 } from './sha256';

export const SCIENTIFIC_AUTHORIZATION_VALIDITY_MS = 5 * 60 * 1000;

const issuedAuthorizations = new WeakMap<object, string>();

function emptyAuthorizationFields() {
  return {
    inputPolicyId: null,
    authorizationReference: null,
    authorizationIssuedAt: null,
    authorizationExpiresAt: null,
    authorizationIntegrityHash: null,
    authorizedEvidence: [] as readonly ScientificAuthorizedEvidence[],
    authorizedChronologicalAgeYears: null,
  };
}

function authorizationPayload(result: ScientificEligibilityResult) {
  return {
    modelId: result.modelId,
    requestedVersion: result.requestedVersion,
    eligibleVersion: result.eligibleVersion,
    inputPolicyId: result.inputPolicyId,
    status: result.status,
    calculationAllowed: result.calculationAllowed,
    confidence: result.confidence,
    blockingIssues: result.blockingIssues,
    warnings: result.warnings,
    missingInputs: result.missingInputs,
    satisfiedInputs: result.satisfiedInputs,
    scientificNotes: result.scientificNotes,
    failureReasons: result.failureReasons,
    humanExplanation: result.humanExplanation,
    authorizationIssuedAt: result.authorizationIssuedAt,
    authorizationExpiresAt: result.authorizationExpiresAt,
    authorizedEvidence: result.authorizedEvidence,
    authorizedChronologicalAgeYears: result.authorizedChronologicalAgeYears,
    evidenceSource: result.evidenceSource,
  };
}

const CONFIDENCE_ORDER: Record<ScientificEligibilityConfidence, number> = {
  insufficient: 0,
  limited: 1,
  moderate: 2,
  high: 3,
  very_high: 4,
};

function issue(
  code: ScientificEligibilityIssueCode,
  severity: ScientificEligibilityIssueSeverity,
  message: string,
  inputId?: string,
): ScientificEligibilityIssue {
  return { code, severity, message, ...(inputId ? { inputId } : {}) };
}

function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

function minimumConfidence(inputs: readonly ScientificEligibilityInput[]): ScientificEligibilityConfidence {
  if (inputs.length === 0) return 'insufficient';
  return inputs.reduce<ScientificEligibilityConfidence>((lowest, input) =>
    CONFIDENCE_ORDER[input.confidence] < CONFIDENCE_ORDER[lowest] ? input.confidence : lowest,
  'very_high');
}

function lifecycleResult(
  request: ScientificEligibilityRequest,
  version: ScientificModelVersion | null,
  status: ScientificEligibilityStatus,
  code: ScientificEligibilityIssueCode,
  message: string,
  eligibleVersion: string | null = null,
): ScientificEligibilityResult {
  const model = getScientificModel(request.modelId);
  const blocker = issue(code, 'blocking', message);
  return {
    modelId: request.modelId,
    requestedVersion: request.requestedVersion,
    status,
    confidence: 'insufficient',
    blockingIssues: [blocker],
    warnings: [],
    missingInputs: [],
    satisfiedInputs: [],
    scientificNotes: [...model.notes, ...(version?.scientificNotes ?? [])],
    failureReasons: [message],
    eligibleVersion,
    evidenceSource: unique(version?.evidenceReferenceIds ?? model.evidenceReferenceIds),
    calculationAllowed: false,
    humanExplanation: `${model.modelName} cannot execute: ${message}`,
    ...emptyAuthorizationFields(),
  };
}

function inputIssues(
  input: ScientificEligibilityInput,
  requirement: ScientificInputRequirement,
  policy: ScientificInputPolicy,
  assessedAtMs: number,
  required: boolean,
): ScientificEligibilityIssue[] {
  const blocking: ScientificEligibilityIssueSeverity = required ? 'blocking' : 'informational';
  const conditional: ScientificEligibilityIssueSeverity = required ? 'conditional' : 'informational';
  const issues: ScientificEligibilityIssue[] = [];
  if (typeof input.measurementId !== 'string' || !input.measurementId.trim()) {
    issues.push(issue('missing_measurement_identifier', blocking, `${requirement.label} requires a stable measurement identifier.`, input.id));
  }
  if (!requirement.acceptedSources.includes(input.source)) {
    issues.push(issue('wrong_input_source', blocking, `${requirement.label} came from an unsupported source (${input.source}).`, input.id));
  }
  if (requirement.unitRequired && !input.unit) {
    issues.push(issue('missing_unit', blocking, `${requirement.label} requires an explicit unit.`, input.id));
  } else if (input.unit && requirement.acceptedUnits
    && !requirement.acceptedUnits.includes(input.unit)) {
    issues.push(issue('unsupported_unit', blocking, `${requirement.label} uses ${input.unit}; this version accepts only ${requirement.acceptedUnits.join(' or ')}. Units are not converted automatically.`, input.id));
  }
  if (input.measurementValidity === 'invalid') {
    issues.push(issue('invalid_measurement', blocking, `${requirement.label} failed measurement validity checks.`, input.id));
  } else if (input.measurementValidity === 'unknown') {
    issues.push(issue('unknown_measurement_validity', conditional, `${requirement.label} has unknown measurement validity.`, input.id));
  }
  if (input.freshness === 'stale') {
    issues.push(issue('stale_measurement', blocking, `${requirement.label} is marked stale for this model.`, input.id));
  } else if (input.freshness === 'unknown') {
    issues.push(issue('unknown_freshness', conditional, `${requirement.label} freshness is unknown.`, input.id));
  }
  if (input.assayCompatibility === 'unsupported') {
    issues.push(issue('unsupported_assay', blocking, `${requirement.label} uses an unsupported assay or method.`, input.id));
  } else if (input.assayCompatibility === 'unknown') {
    issues.push(issue('unknown_assay', conditional, `${requirement.label} assay compatibility is unknown.`, input.id));
  }
  if (input.measuredAt) {
    const measuredAtMs = Date.parse(input.measuredAt);
    if (!Number.isFinite(measuredAtMs) || measuredAtMs > assessedAtMs) {
      issues.push(issue('invalid_measurement', blocking, `${requirement.label} has an invalid or future measurement timestamp.`, input.id));
    }
  }
  const requiredRank = CONFIDENCE_ORDER[policy.confidenceRequirement];
  const actualRank = CONFIDENCE_ORDER[input.confidence];
  if (actualRank < requiredRank) {
    const severity: ScientificEligibilityIssueSeverity = required
      ? (actualRank >= CONFIDENCE_ORDER.high ? 'conditional' : 'blocking')
      : 'informational';
    issues.push(issue('insufficient_input_confidence', severity, `${requirement.label} confidence is ${input.confidence}; ${policy.confidenceRequirement} is required.`, input.id));
  }
  return issues;
}

export function evaluateScientificEligibility(
  request: ScientificEligibilityRequest,
  versions: readonly ScientificModelVersion[] = SCIENTIFIC_MODEL_VERSIONS,
  inputPolicies: readonly ScientificInputPolicy[] = SCIENTIFIC_INPUT_POLICIES,
): ScientificEligibilityResult {
  const model = getScientificModel(request.modelId);
  const matchingVersions = versions.filter(version => version.modelId === request.modelId);
  const version = matchingVersions.find(candidate => candidate.version === request.requestedVersion) ?? null;
  const activeVersions = matchingVersions.filter(candidate => candidate.lifecycle === 'active');
  const activeVersion = activeVersions.length === 1 ? activeVersions[0].version : null;

  if (!version) {
    return lifecycleResult(request, null, 'unsupported', 'unknown_model_version',
      `Version ${request.requestedVersion} is not registered for this model.`, activeVersion);
  }
  if (version.lifecycle === 'retired') {
    return lifecycleResult(request, version, 'retired', 'retired_model',
      `Version ${version.version} is scientifically retired and cannot execute.`);
  }
  if (version.lifecycle === 'research_only') {
    return lifecycleResult(request, version, 'research_only', 'research_only_model',
      `Version ${version.version} is restricted to research and cannot execute a production biological-age calculation.`);
  }
  if (version.lifecycle === 'unsupported') {
    return lifecycleResult(request, version, 'unsupported', 'unsupported_model',
      `Version ${version.version} has no scientifically supported calculation pathway.`);
  }

  const policy = inputPolicies.find(candidate => candidate.id === version.inputPolicyId);
  if (!policy) {
    return lifecycleResult(request, version, 'unsupported', 'unsupported_model',
      `Version ${version.version} has no valid scientific input policy.`);
  }

  const blockers: ScientificEligibilityIssue[] = [];
  const warnings: ScientificEligibilityIssue[] = [];
  const missingInputs: string[] = [];
  const satisfiedInputs: string[] = [];
  const assessedAtMs = Date.parse(request.assessedAt);
  if (!Number.isFinite(assessedAtMs)) {
    blockers.push(issue('invalid_assessment_timestamp', 'blocking', 'Eligibility assessment time is invalid.'));
  }

  const inputIds = request.inputs.map(input => input.id);
  unique(inputIds.filter((id, index) => inputIds.indexOf(id) !== index)).forEach(id => {
    blockers.push(issue('duplicate_input', 'blocking', `Input ${id} appears more than once.`, id));
  });
  const measurementIds = request.inputs.filter(input => input.present
    && typeof input.measurementId === 'string' && input.measurementId.trim())
    .map(input => input.measurementId);
  unique(measurementIds.filter((id, index) => measurementIds.indexOf(id) !== index)).forEach(measurementId => {
    blockers.push(issue('duplicate_measurement_identifier', 'blocking', `Measurement identifier ${measurementId} is bound to more than one input.`));
  });

  const evaluateRequirement = (requirement: ScientificInputRequirement, required: boolean) => {
    const input = request.inputs.find(candidate => candidate.id === requirement.id && candidate.present);
    if (!input) {
      if (required) {
        missingInputs.push(requirement.id);
        blockers.push(issue('missing_required_input', 'blocking', `${requirement.label} is required and was not supplied.`, requirement.id));
      }
      return;
    }
    const issues = inputIssues(input, requirement, policy, assessedAtMs, required);
    if (issues.length === 0) satisfiedInputs.push(requirement.id);
    issues.forEach(candidate => {
      if (candidate.severity === 'blocking') blockers.push(candidate);
      else warnings.push(candidate);
    });
  };
  policy.requiredInputs.forEach(requirement => evaluateRequirement(requirement, true));
  policy.optionalInputs.forEach(requirement => evaluateRequirement(requirement, false));

  request.inputs.filter(input => input.present && (input.deprecated
    || version.deprecatedInputIds.includes(input.id))).forEach(input => {
    blockers.push(issue('deprecated_input', 'blocking', `Input ${input.id} is deprecated for ${version.version}.`, input.id));
  });

  if (request.population.compatibility === 'unsupported') {
    blockers.push(issue('population_mismatch', 'blocking', 'The documented population is outside this model version’s supported evidence base.'));
  } else if (request.population.compatibility === 'unknown') {
    warnings.push(issue('population_unknown', 'conditional', 'Population compatibility is unknown and must be scientifically reviewed.'));
  }
  if (version.minimumAgeYears !== null || version.maximumAgeYears !== null) {
    if (request.population.ageYears === undefined || !Number.isFinite(request.population.ageYears)) {
      blockers.push(issue('missing_age', 'blocking', 'A valid chronological age is required to evaluate the published population range.'));
    } else if ((version.minimumAgeYears !== null && request.population.ageYears < version.minimumAgeYears)
      || (version.maximumAgeYears !== null && request.population.ageYears > version.maximumAgeYears)) {
      blockers.push(issue('age_outside_range', 'blocking', `Chronological age is outside the supported ${version.minimumAgeYears ?? 'unbounded'}–${version.maximumAgeYears ?? 'unbounded'} year range.`));
    }
  }
  if (version.allowedSex) {
    if (request.population.sex === 'unknown' || request.population.sex === 'not_recorded') {
      blockers.push(issue('missing_required_sex', 'blocking', 'This model version requires a scientifically supported sex stratum; none was supplied.'));
    } else if (!version.allowedSex.includes(request.population.sex)) {
      blockers.push(issue('sex_restriction_mismatch', 'blocking', 'The supplied sex stratum is not supported by this model version.'));
    }
  }

  if (version.requiresLaboratoryContext) {
    if (!request.laboratory?.contextId) {
      blockers.push(issue('missing_laboratory_context', 'blocking', 'A source-attributed laboratory context is required.'));
    } else if (request.laboratory.compatibility === 'unsupported') {
      blockers.push(issue('unsupported_laboratory_context', 'blocking', 'The laboratory context is incompatible with this model version.'));
    } else if (request.laboratory.compatibility === 'unknown') {
      warnings.push(issue('unknown_laboratory_context', 'conditional', 'Laboratory compatibility is unknown and cannot be assumed.'));
    }
  }

  if (version.requiredCalibrationIds.length > 0) {
    if (!request.calibration?.calibrationId) {
      blockers.push(issue('missing_reference_calibration', 'blocking', 'A named reference calibration is required.'));
    } else if (request.calibration.compatibility === 'unsupported'
      || !version.requiredCalibrationIds.includes(request.calibration.calibrationId)) {
      blockers.push(issue('unsupported_reference_calibration', 'blocking', `Calibration ${request.calibration.calibrationId} is not supported by ${version.version}.`));
    } else if (request.calibration.compatibility === 'unknown') {
      warnings.push(issue('unknown_reference_calibration', 'conditional', 'Reference-calibration compatibility is unknown.'));
    }
  }

  if (version.requiresDevice) {
    if (!request.device) {
      blockers.push(issue('missing_device', 'blocking', 'A validated measurement device is required.'));
    } else {
      if (!request.device.deviceType && version.supportedDeviceTypes.length > 0) {
        blockers.push(issue('missing_device', 'blocking', 'A source-attributed device type is required.'));
      } else if (request.device.compatibility === 'unsupported'
        || (request.device.deviceType && version.supportedDeviceTypes.length > 0
          && !version.supportedDeviceTypes.includes(request.device.deviceType))) {
        blockers.push(issue('unsupported_device', 'blocking', 'The supplied device type is unsupported for this model version.'));
      } else if (request.device.compatibility === 'unknown') {
        warnings.push(issue('unknown_device_compatibility', 'conditional', 'Device compatibility is unknown.'));
      }
      if (request.device.quality === 'unvalidated') {
        blockers.push(issue('unvalidated_device_quality', 'blocking', 'Device measurement quality is explicitly unvalidated.'));
      } else if (request.device.quality === 'unknown') {
        warnings.push(issue('unknown_device_quality', 'conditional', 'Device measurement quality is unknown.'));
      }
    }
  }

  if (!Number.isInteger(request.history.observationCount) || request.history.observationCount < version.minimumHistoryObservations
    || !Number.isFinite(request.history.timeSpanDays) || request.history.timeSpanDays < version.minimumHistoryDays) {
    blockers.push(issue('insufficient_history', 'blocking', `This version requires at least ${version.minimumHistoryObservations} observations across ${version.minimumHistoryDays} days.`));
  } else if (version.sparseHistoryIsWarning && (request.history.continuity === 'sparse'
    || request.history.observationCount === 1)) {
    warnings.push(issue('sparse_history', 'informational', 'Available history supports only a cross-sectional eligibility decision; no longitudinal conclusion is permitted.'));
  }

  const requiredEvidence = request.inputs.filter(input => input.present
    && policy.requiredInputs.some(requirement => requirement.id === input.id));
  const confidence = missingInputs.length > 0 ? 'insufficient' : minimumConfidence(requiredEvidence);
  const hasConditional = warnings.some(candidate => candidate.severity === 'conditional');
  const status: ScientificEligibilityStatus = blockers.length > 0
    ? 'not_eligible'
    : hasConditional ? 'conditionally_eligible' : 'eligible';
  const calculationAllowed = status === 'eligible'
    && model.classification === 'core_biological_age_model';
  const failureReasons = [...blockers, ...warnings.filter(candidate => candidate.severity === 'conditional')]
    .map(candidate => candidate.message);
  const humanExplanation = status === 'eligible'
    ? `${model.modelName} ${version.version} is scientifically eligible: every required input and context check is satisfied.`
    : status === 'conditionally_eligible'
      ? `${model.modelName} ${version.version} is conditionally eligible but cannot execute until ${warnings.filter(candidate => candidate.severity === 'conditional').length} unresolved scientific condition(s) are resolved.`
      : `${model.modelName} ${version.version} is not eligible because ${blockers.length} scientific blocking issue(s) remain.`;

  const baseResult: ScientificEligibilityResult = {
    modelId: request.modelId,
    requestedVersion: request.requestedVersion,
    status,
    confidence,
    blockingIssues: blockers,
    warnings,
    missingInputs: unique(missingInputs),
    satisfiedInputs: unique(satisfiedInputs),
    scientificNotes: unique([...model.notes, ...version.scientificNotes, ...policy.notes]),
    failureReasons,
    eligibleVersion: version.version,
    evidenceSource: unique([...model.evidenceReferenceIds, ...version.evidenceReferenceIds]),
    calculationAllowed,
    humanExplanation,
    ...emptyAuthorizationFields(),
  };

  if (!calculationAllowed) return baseResult;

  const authorizationIssuedAt = new Date(assessedAtMs).toISOString();
  const authorizationExpiresAt = new Date(assessedAtMs + SCIENTIFIC_AUTHORIZATION_VALIDITY_MS).toISOString();
  const authorizedEvidence: ScientificAuthorizedEvidence[] = policy.requiredInputs.map(requirement => {
    const input = request.inputs.find(candidate => candidate.present && candidate.id === requirement.id);
    if (!input?.unit) throw new Error(`Eligible authorization invariant failed for ${requirement.id}.`);
    return {
      inputId: input.id,
      measurementId: input.measurementId,
      source: input.source,
      unit: input.unit,
      measuredAt: input.measuredAt ?? null,
    };
  });
  const unsigned: ScientificEligibilityResult = {
    ...baseResult,
    inputPolicyId: policy.id,
    authorizationIssuedAt,
    authorizationExpiresAt,
    authorizedEvidence,
    authorizedChronologicalAgeYears: request.population.ageYears ?? null,
  };
  const authorizationIntegrityHash = stableSha256(authorizationPayload(unsigned));
  const result: ScientificEligibilityResult = {
    ...unsigned,
    authorizationReference: `scientific-auth-${authorizationIntegrityHash.slice(0, 24)}`,
    authorizationIntegrityHash,
  };
  issuedAuthorizations.set(result, authorizationIntegrityHash);
  return result;
}

export function isScientificExecutionAuthorized(
  result: ScientificEligibilityResult,
  at: Date | string | number = Date.now(),
): result is ScientificExecutionAuthorization {
  return verifyScientificExecutionAuthorization(result, at).valid;
}

export function verifyScientificExecutionAuthorization(
  result: ScientificEligibilityResult,
  at: Date | string | number = Date.now(),
): ScientificAuthorizationVerification {
  const issuedHash = issuedAuthorizations.get(result);
  if (!issuedHash) return { valid: false, reason: 'not_issued_by_engine' };
  if (result.status !== 'eligible'
    || result.calculationAllowed !== true
    || result.eligibleVersion === null
    || result.inputPolicyId === null
    || result.authorizationReference === null
    || result.authorizationIssuedAt === null
    || result.authorizationExpiresAt === null
    || result.authorizationIntegrityHash === null
    || result.authorizedChronologicalAgeYears === null
    || result.blockingIssues.length > 0
    || result.warnings.some(candidate => candidate.severity === 'conditional')) {
    return { valid: false, reason: 'not_eligible' };
  }
  let recomputed: string;
  try {
    recomputed = stableSha256(authorizationPayload(result));
  } catch {
    return { valid: false, reason: 'altered' };
  }
  if (issuedHash !== result.authorizationIntegrityHash
    || recomputed !== result.authorizationIntegrityHash
    || result.authorizationReference !== `scientific-auth-${recomputed.slice(0, 24)}`) {
    return { valid: false, reason: 'altered' };
  }
  const atMs = at instanceof Date ? at.getTime() : typeof at === 'string' ? Date.parse(at) : at;
  const issuedAtMs = Date.parse(result.authorizationIssuedAt);
  const expiresAtMs = Date.parse(result.authorizationExpiresAt);
  if (!Number.isFinite(atMs) || !Number.isFinite(issuedAtMs) || !Number.isFinite(expiresAtMs)
    || atMs < issuedAtMs || atMs >= expiresAtMs) {
    return { valid: false, reason: 'expired' };
  }
  return { valid: true, authorization: result as ScientificExecutionAuthorization };
}
