import type { FunctionalCapacityScientificVersions } from './contracts';

export const FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS = Object.freeze({
  domainSpecification: 'functional-capacity-domain/1.0.0',
  testRegistry: 'functional-capacity-test-registry/1.0.0',
  protocolRegistry: 'functional-capacity-protocol-registry/1.0.0',
  sourceRegistry: 'functional-capacity-source-registry/1.0.0',
  confidenceRegistry: 'functional-capacity-confidence-registry/1.0.0',
  validationPolicy: 'functional-capacity-validation-policy/1.0.0',
  eligibilityPolicy: 'functional-capacity-eligibility-policy/1.0.0',
  referenceRegistry: 'functional-capacity-reference-registry/1.0.0',
  referenceMatchingPolicy: 'functional-capacity-reference-matching-policy/1.0.0',
  interpretationPolicy: 'functional-capacity-interpretation-policy/1.0.0',
  trendComparisonPolicy: 'functional-capacity-trend-comparison-policy/1.0.0',
}) satisfies FunctionalCapacityScientificVersions;

export const FUNCTIONAL_CAPACITY_CANONICAL_UNITS = Object.freeze({
  hand_grip_strength: 'kgf',
  usual_gait_speed: 'm/s',
  four_meter_walk: 'm/s',
  chair_stand_30_second: 'completed_stands',
  five_times_sit_to_stand: 's',
  timed_up_and_go: 's',
  six_minute_walk_test: 'm',
  short_physical_performance_battery: 'native_raw_components',
} as const);

export const FUNCTIONAL_CAPACITY_UNIT_STANDARD = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.validationPolicy,
  poundForceToKilogramForce: 0.45359237,
  newtonToKilogramForce: 0.10197162129779,
  centimetrePerSecondToMetrePerSecond: 0.01,
  footPerSecondToMetrePerSecond: 0.3048,
  millisecondToSecond: 0.001,
  footToMetre: 0.3048,
});
