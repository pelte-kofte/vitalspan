import type { FunctionalCapacityTestId } from './contracts';
import { FUNCTIONAL_CAPACITY_CANONICAL_UNITS, FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export interface FunctionalCapacityTestDefinition {
  id: FunctionalCapacityTestId;
  title: string;
  readiness: 'production_eligible' | 'conditionally_production_eligible';
  canonicalUnit: string;
  scalarValueRequired: boolean;
  rawComponentsRequired: boolean;
  interpretationBoundary: string;
}

export const FUNCTIONAL_CAPACITY_TEST_REGISTRY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.testRegistry,
  tests: [
    { id: 'hand_grip_strength', title: 'Hand Grip Strength', readiness: 'production_eligible', canonicalUnit: FUNCTIONAL_CAPACITY_CANONICAL_UNITS.hand_grip_strength, scalarValueRequired: true, rawComponentsRequired: false, interpretationBoundary: 'Hand-specific maximal isometric force; hands are never combined.' },
    { id: 'usual_gait_speed', title: 'Usual Gait Speed', readiness: 'production_eligible', canonicalUnit: FUNCTIONAL_CAPACITY_CANONICAL_UNITS.usual_gait_speed, scalarValueRequired: true, rawComponentsRequired: false, interpretationBoundary: 'Usual over-ground gait only; fast, rolling-start, and other courses remain separate.' },
    { id: 'four_meter_walk', title: 'Four-Meter Walk', readiness: 'production_eligible', canonicalUnit: FUNCTIONAL_CAPACITY_CANONICAL_UNITS.four_meter_walk, scalarValueRequired: true, rawComponentsRequired: false, interpretationBoundary: 'Exact four-metre static-start usual-pace identity; not generic gait speed.' },
    { id: 'chair_stand_30_second', title: '30-Second Chair Stand', readiness: 'production_eligible', canonicalUnit: FUNCTIONAL_CAPACITY_CANONICAL_UNITS.chair_stand_30_second, scalarValueRequired: true, rawComponentsRequired: false, interpretationBoundary: 'Whole repetitions in the fixed interval; never converted to timed chair rise.' },
    { id: 'five_times_sit_to_stand', title: 'Five Times Sit-to-Stand', readiness: 'production_eligible', canonicalUnit: FUNCTIONAL_CAPACITY_CANONICAL_UNITS.five_times_sit_to_stand, scalarValueRequired: true, rawComponentsRequired: false, interpretationBoundary: 'Standalone fifth-return-to-sitting endpoint; no normative reference in 1.0.0.' },
    { id: 'timed_up_and_go', title: 'Timed Up and Go', readiness: 'conditionally_production_eligible', canonicalUnit: FUNCTIONAL_CAPACITY_CANONICAL_UNITS.timed_up_and_go, scalarValueRequired: true, rawComponentsRequired: false, interpretationBoundary: 'Mobility context only; no universal fall-risk or diagnostic claim.' },
    { id: 'six_minute_walk_test', title: 'Six-Minute Walk Test', readiness: 'conditionally_production_eligible', canonicalUnit: FUNCTIONAL_CAPACITY_CANONICAL_UNITS.six_minute_walk_test, scalarValueRequired: true, rawComponentsRequired: false, interpretationBoundary: 'Supervised submaximal field-walking distance; never VO2max.' },
    { id: 'short_physical_performance_battery', title: 'Short Physical Performance Battery', readiness: 'production_eligible', canonicalUnit: FUNCTIONAL_CAPACITY_CANONICAL_UNITS.short_physical_performance_battery, scalarValueRequired: false, rawComponentsRequired: true, interpretationBoundary: 'Official raw components only; no Vitalspan total or normative interpretation in 1.0.0.' },
  ] as const satisfies readonly FunctionalCapacityTestDefinition[],
});

export function getFunctionalCapacityTestDefinition(
  id: FunctionalCapacityTestId | null,
): FunctionalCapacityTestDefinition | null {
  return FUNCTIONAL_CAPACITY_TEST_REGISTRY.tests.find(test => test.id === id) ?? null;
}
