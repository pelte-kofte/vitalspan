import type {
  CardiometabolicCanonicalMeasurement,
  CardiometabolicMeasurementInput,
  CardiometabolicReason,
  CardiometabolicSafetyDecision,
} from './contracts';
import type { CardiometabolicMeasurementDefinition } from './measurementRegistry';
import { reasonForCardiometabolic, sortCardiometabolicReasons } from './reasonRegistry';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

const DISPLAY = {
  safety_candidate_symptom_context_required: 'Safety Candidate — Symptom Context Required',
  safety_candidate_time_sensitive_clinical_review: 'Safety Candidate — Time-Sensitive Clinical Review',
  clinician_review_candidate: 'Clinician Review Candidate',
  no_authorized_safety_candidate: 'No Authorized Safety Candidate',
  insufficient_safety_context: 'Insufficient Safety Context',
} as const;

export function evaluateCardiometabolicSafetyCandidate(
  input: CardiometabolicMeasurementInput,
  definition: CardiometabolicMeasurementDefinition | null,
  canonical: CardiometabolicCanonicalMeasurement,
  validationReasons: readonly CardiometabolicReason[],
): CardiometabolicSafetyDecision {
  const reasons: CardiometabolicReason[] = [];
  let status: keyof typeof DISPLAY = 'no_authorized_safety_candidate';
  let authority: string | null = null;
  let boundaryVersion: string | null = null;
  const blockingMeasurement = validationReasons.some(reason => [
    'blocking_invalid', 'blocking_source', 'blocking_assay', 'blocking_protocol', 'blocking_insufficient',
  ].includes(reason.severity));

  if (!definition) status = 'insufficient_safety_context';
  else if (definition.id === 'ldl_c_direct' || definition.id === 'ldl_c_calculated') {
    if (canonical.value === null || blockingMeasurement) status = 'insufficient_safety_context';
    else if (canonical.value >= 4.9) {
      status = 'clinician_review_candidate';
      authority = 'American College of Cardiology/American Heart Association';
      boundaryVersion = '2026-03-13';
      reasons.push(reasonForCardiometabolic('safety_candidate_boundary_met'));
    }
  } else if (definition.id === 'triglycerides') {
    if (canonical.value === null || blockingMeasurement) status = 'insufficient_safety_context';
    else if (canonical.value >= 11.3 || (input.numeric?.unit === 'mg/dL' && (input.numeric.value ?? 0) >= 1000)) {
      status = 'safety_candidate_time_sensitive_clinical_review';
      authority = 'American College of Cardiology/American Heart Association';
      boundaryVersion = '2026-03-13';
      reasons.push(reasonForCardiometabolic('safety_candidate_boundary_met'));
    }
  } else if (definition.family === 'blood_pressure') {
    const boundary = (canonical.systolic ?? 0) > 180 || (canonical.diastolic ?? 0) > 120;
    const repeatedValidatedCuff = input.bloodPressure?.seriesComplete === true
      && (input.bloodPressure.readingCount ?? 0) >= 2
      && input.protocol.validatedDevice === true && input.protocol.upperArmCuff === true;
    if (boundary && (!repeatedValidatedCuff || blockingMeasurement)) {
      status = 'insufficient_safety_context';
      reasons.push(reasonForCardiometabolic('safety_context_incomplete'));
    } else if (boundary && input.context.symptomsPresent === null) {
      status = 'safety_candidate_symptom_context_required';
      authority = 'Phase 7.0C blood-pressure candidate boundary';
      boundaryVersion = CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.safetyCandidatePolicy;
      reasons.push(reasonForCardiometabolic('safety_candidate_boundary_met'));
    } else if (boundary) {
      status = 'safety_candidate_time_sensitive_clinical_review';
      authority = 'Phase 7.0C blood-pressure candidate boundary';
      boundaryVersion = CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.safetyCandidatePolicy;
      reasons.push(reasonForCardiometabolic('safety_candidate_boundary_met'));
    }
  } else if (definition.id === 'hba1c' || definition.id === 'fasting_plasma_glucose') {
    reasons.push(reasonForCardiometabolic('no_authorized_glucose_safety_boundary'));
  }

  if (status === 'insufficient_safety_context' && reasons.length === 0) reasons.push(reasonForCardiometabolic('safety_context_incomplete'));
  return {
    status,
    displayStatus: DISPLAY[status],
    boundaryAuthority: authority,
    boundaryVersion,
    reasons: sortCardiometabolicReasons(reasons),
    diagnosisAuthorized: false,
    emergencyDispositionAuthorized: false,
  };
}
