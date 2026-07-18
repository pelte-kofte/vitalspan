import type {
  FunctionalCapacityConfidence,
  FunctionalCapacityMeasurementInput,
  FunctionalCapacityReason,
  FunctionalCapacityReferenceDecision,
} from './contracts';
import { getFunctionalCapacityConfidenceRank } from './confidenceRegistry';
import { reasonForFunctionalCapacity, sortFunctionalCapacityReasons } from './reasonRegistry';
import {
  getFunctionalCapacityReferenceDefinition,
  protocolSupportsReference,
  type FunctionalCapacityReferenceDefinition,
} from './referenceRegistry';
import { FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export const FUNCTIONAL_CAPACITY_REFERENCE_MATCHING_POLICY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.referenceMatchingPolicy,
  exactRequestedReferenceRequired: true,
  permitsNearestAgeFallback: false,
  permitsOppositeSexFallback: false,
  permitsCountryFallback: false,
  permitsRegionalFallback: false,
  permitsHealthyPopulationFallback: false,
  permitsProtocolFallback: false,
  permitsEquipmentFallback: false,
  permitsCourseLengthFallback: false,
  permitsTestSubstitution: false,
  permitsSilentPercentileEstimation: false,
});

function reason(code: Parameters<typeof reasonForFunctionalCapacity>[0]): FunctionalCapacityReason {
  return reasonForFunctionalCapacity(code);
}

function matchEquipment(input: FunctionalCapacityMeasurementInput, reference: FunctionalCapacityReferenceDefinition): boolean {
  if (!reference.exactEquipmentRequired) return true;
  if (input.testId === 'hand_grip_strength') {
    return input.details.handGrip?.calibrationStatus === 'current'
      && Boolean(input.details.handGrip.dynamometerIdentity?.trim());
  }
  if (input.testId === 'chair_stand_30_second') return input.details.chairStand30?.chairHeightCm === 43.2;
  if (input.testId === 'timed_up_and_go') return input.details.timedUpAndGo?.chairHeightCm !== null;
  return input.provenance.equipmentQualityDocumented === true;
}

function matchCourse(input: FunctionalCapacityMeasurementInput, reference: FunctionalCapacityReferenceDefinition): boolean {
  if (!reference.exactCourseRequired) return true;
  if (reference.id === 'nih_toolbox_4m_us_2019' || reference.id === 'clsa_4m_ca_2023') {
    return input.details.gait?.courseLengthM === 4 && input.details.gait.timedDistanceM === 4;
  }
  if (reference.id === 'clsa_tug_ca_2023' || reference.id === 'tromso_tug_no_2021') {
    return input.details.timedUpAndGo?.courseDistanceM === 3;
  }
  if (reference.id === 'casanova_6mwt_multicentre_2011') {
    const walk = input.details.sixMinuteWalk;
    return walk?.corridorLengthM === 30 && walk.courseLayout === 'straight'
      && walk.numberOfTests === 2 && walk.selectionRule === 'greater_qualifying_distance';
  }
  return false;
}

function matchSupervision(input: FunctionalCapacityMeasurementInput, reference: FunctionalCapacityReferenceDefinition): boolean {
  if (!reference.exactSupervisionRequired) return true;
  return ['qualified_clinical', 'qualified_rehabilitation', 'trained_research']
    .includes(input.supervision.supervisionClass)
    && input.supervision.participantContinuouslyObserved === true;
}

export function evaluateFunctionalCapacityReferenceEligibility(
  input: FunctionalCapacityMeasurementInput,
  ageAtMeasurement: number | null,
  confidence: FunctionalCapacityConfidence,
  measurementEligibleForReference: boolean,
): { decision: FunctionalCapacityReferenceDecision; reasons: readonly FunctionalCapacityReason[] } {
  const reasons: FunctionalCapacityReason[] = [];
  if (input.testId === 'five_times_sit_to_stand') {
    reasons.push(reason('five_times_no_normative_reference'), reason('percentile_unavailable'));
    return { decision: { status: 'ineligible', reference: null, reasonCodes: sortFunctionalCapacityReasons(reasons).map(item => item.code) }, reasons: sortFunctionalCapacityReasons(reasons) };
  }
  if (input.testId === 'short_physical_performance_battery') {
    reasons.push(reason('sppb_no_normative_reference'), reason('percentile_unavailable'));
    return { decision: { status: 'ineligible', reference: null, reasonCodes: sortFunctionalCapacityReasons(reasons).map(item => item.code) }, reasons: sortFunctionalCapacityReasons(reasons) };
  }
  if (input.requestedReference.id === null || input.requestedReference.version === null) {
    reasons.push(reason('reference_not_requested'), reason('no_authorized_reference'), reason('percentile_unavailable'));
    const sorted = sortFunctionalCapacityReasons(reasons);
    return { decision: { status: 'ineligible', reference: null, reasonCodes: sorted.map(item => item.code) }, reasons: sorted };
  }
  const reference = getFunctionalCapacityReferenceDefinition(input.requestedReference.id, input.requestedReference.version);
  if (reference === null) {
    reasons.push(reason('reference_version_unavailable'), reason('no_authorized_reference'), reason('percentile_unavailable'));
  } else if (!reference.active) {
    reasons.push(reason('reference_inactive'), reason('no_authorized_reference'), reason('percentile_unavailable'));
  } else {
    if (input.testId !== reference.testId) reasons.push(reason('endpoint_not_supported_by_reference'));
    if (!protocolSupportsReference(input.protocolId, reference)) reasons.push(reason('protocol_not_supported_by_reference'));
    if (ageAtMeasurement === null) reasons.push(reason('age_not_derivable'));
    else if (ageAtMeasurement < reference.ageRange.minimum || ageAtMeasurement > reference.ageRange.maximum) {
      reasons.push(reason('age_outside_reference_range'));
    }
    if (input.population.sourceRecordedSex === 'unknown' || input.population.sourceRecordedSex === 'not_recorded') {
      reasons.push(reason('missing_source_recorded_sex_for_reference'));
    } else if (!reference.supportedSexes.includes(input.population.sourceRecordedSex)) {
      reasons.push(reason('sex_not_supported_by_reference'));
    }
    if (input.population.countryCode === null) reasons.push(reason('missing_country_for_reference'));
    else if (reference.countryCodes === 'explicitly_confirmed_covered_country') {
      if (input.population.referenceCountrySupported !== true) reasons.push(reason('country_not_supported_by_reference'));
    } else if (!reference.countryCodes.includes(input.population.countryCode)) {
      reasons.push(reason('country_not_supported_by_reference'));
    }
    if (reference.regionCodes !== 'not_required') {
      if (input.population.regionCode === null || !reference.regionCodes.includes(input.population.regionCode)) {
        reasons.push(reason('region_not_supported_by_reference'));
      }
    }
    if (!reference.healthPopulations.includes(input.population.healthPopulation)) {
      reasons.push(reason('health_population_not_supported_by_reference'));
    }
    if (!matchEquipment(input, reference)) reasons.push(reason('equipment_not_supported_by_reference'));
    if (!matchCourse(input, reference)) reasons.push(reason('course_not_supported_by_reference'));
    if (!matchSupervision(input, reference)) reasons.push(reason('supervision_not_supported_by_reference'));
    if (!measurementEligibleForReference || getFunctionalCapacityConfidenceRank(confidence) < 4) {
      reasons.push(reason('no_authorized_reference'));
    }
  }
  const blockingMatchCodes = new Set([
    'reference_version_unavailable', 'reference_inactive', 'endpoint_not_supported_by_reference',
    'protocol_not_supported_by_reference', 'age_not_derivable', 'age_outside_reference_range',
    'missing_source_recorded_sex_for_reference', 'sex_not_supported_by_reference',
    'missing_country_for_reference', 'country_not_supported_by_reference',
    'region_not_supported_by_reference', 'health_population_not_supported_by_reference',
    'equipment_not_supported_by_reference', 'course_not_supported_by_reference',
    'supervision_not_supported_by_reference', 'no_authorized_reference',
  ]);
  const eligible = reference !== null && reference.active && !reasons.some(item => blockingMatchCodes.has(item.code));
  if (eligible) reasons.push(reason('reference_exact_match'));
  else if (!reasons.some(item => item.code === 'no_authorized_reference')) reasons.push(reason('no_authorized_reference'));
  const sorted = sortFunctionalCapacityReasons(reasons);
  return {
    decision: {
      status: eligible ? 'eligible' : 'ineligible',
      reference: eligible && reference !== null ? {
        id: reference.id,
        version: reference.version,
        publication: reference.publication,
        testId: reference.testId,
        protocolIds: reference.protocolIds,
        population: reference.population,
        interpretationType: reference.interpretationType,
      } : null,
      reasonCodes: sorted.map(item => item.code),
    },
    reasons: sorted,
  };
}
