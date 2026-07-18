import type { FunctionalCapacityProtocolId, FunctionalCapacityTestId } from './contracts';
import { FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export interface FunctionalCapacityProtocolDefinition {
  id: FunctionalCapacityProtocolId;
  version: string;
  testId: FunctionalCapacityTestId;
  title: string;
  acceptance: 'accepted' | 'conditional' | 'clinical_specialty';
  endpoint: string;
  referenceCompatible: boolean;
  criticalRule: string;
}

export const FUNCTIONAL_CAPACITY_PROTOCOL_REGISTRY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.protocolRegistry,
  protocols: [
    { id: 'southampton_grip_v1', version: 'southampton-grip/1.0.0', testId: 'hand_grip_strength', title: 'Southampton hand-grip protocol', acceptance: 'accepted', endpoint: 'maximum_for_tested_hand', referenceCompatible: true, criticalRule: 'Three alternating attempts per hand; hand-specific maximum; supported seated posture.' },
    { id: 'asht_grip_v1', version: 'asht-grip/1.0.0', testId: 'hand_grip_strength', title: 'ASHT-style hand-grip protocol', acceptance: 'conditional', endpoint: 'maximum_for_tested_hand', referenceCompatible: false, criticalRule: 'Exact ASHT edition, posture, device, attempts, rest, and endpoint are mandatory.' },
    { id: 'usual_gait_static_4m_nia_v1', version: 'nia-usual-gait-4m/1.0.0', testId: 'usual_gait_speed', title: 'NIA static-start four-metre usual gait', acceptance: 'accepted', endpoint: 'faster_completed_trial', referenceCompatible: false, criticalRule: 'Usual pace, static start, exact four metres, two trials.' },
    { id: 'usual_gait_named_variant_v1', version: 'usual-gait-named-variant/1.0.0', testId: 'usual_gait_speed', title: 'Named published usual-gait variant', acceptance: 'conditional', endpoint: 'protocol_native', referenceCompatible: false, criticalRule: 'Distance, start, pace, timing, attempts, and selection remain explicit.' },
    { id: 'nia_four_meter_walk_v1', version: 'nia-four-meter-walk/1.0.0', testId: 'four_meter_walk', title: 'NIA four-metre walk', acceptance: 'accepted', endpoint: 'faster_completed_trial', referenceCompatible: false, criticalRule: 'Static start, usual pace, two timed trials, faster qualifying trial.' },
    { id: 'nih_toolbox_four_meter_walk_v1', version: 'nih-toolbox-four-meter-walk/1.0.0', testId: 'four_meter_walk', title: 'NIH Toolbox four-metre walk', acceptance: 'conditional', endpoint: 'nih_toolbox_usual_pace', referenceCompatible: true, criticalRule: 'Exact NIH Toolbox static-start usual-pace method.' },
    { id: 'clsa_four_meter_walk_2023', version: 'clsa-four-meter-walk/2023.1', testId: 'four_meter_walk', title: 'CLSA four-metre walk', acceptance: 'conditional', endpoint: 'single_normal_speed_trial', referenceCompatible: true, criticalRule: 'Static start, normal speed, exact four metres, single trial.' },
    { id: 'cdc_steadi_30cst_v1', version: 'cdc-steadi-30cst/1.0.0', testId: 'chair_stand_30_second', title: 'CDC STEADI 30-Second Chair Stand', acceptance: 'accepted', endpoint: 'whole_stands_in_30_seconds', referenceCompatible: true, criticalRule: 'Approximately 43.2-cm armless chair, no arm use, CDC expiration rule.' },
    { id: 'standalone_5xsts_fifth_sit_v1', version: 'standalone-5xsts-fifth-sit/1.0.0', testId: 'five_times_sit_to_stand', title: 'Standalone Five Times Sit-to-Stand', acceptance: 'accepted', endpoint: 'buttocks_contact_after_fifth_sit', referenceCompatible: false, criticalRule: 'Five full cycles; timer ends after return to sitting.' },
    { id: 'cdc_steadi_tug_3m_v1', version: 'cdc-steadi-tug-3m/1.0.0', testId: 'timed_up_and_go', title: 'Standard single-task three-metre TUG', acceptance: 'conditional', endpoint: 'seated_again', referenceCompatible: false, criticalRule: 'Three metres, usual pace, single task, exact chair and aid status.' },
    { id: 'cdc_steadi_tug_10ft_v1', version: 'cdc-steadi-tug-10ft/1.0.0', testId: 'timed_up_and_go', title: 'CDC ten-foot TUG', acceptance: 'conditional', endpoint: 'seated_again', referenceCompatible: false, criticalRule: 'Ten feet, normal pace, single task, exact chair and aid status.' },
    { id: 'clsa_tug_2023', version: 'clsa-tug/2023.1', testId: 'timed_up_and_go', title: 'CLSA single-trial TUG', acceptance: 'conditional', endpoint: 'seated_again', referenceCompatible: true, criticalRule: 'Three metres, one trial, no pace instruction, CLSA chair procedure.' },
    { id: 'tromso_tug_2021', version: 'tromso-tug/2021.1', testId: 'timed_up_and_go', title: 'Tromso original TUG', acceptance: 'conditional', endpoint: 'seated_again', referenceCompatible: true, criticalRule: 'Three metres, regular pace, 43-cm armchair, disease stratum explicit.' },
    { id: 'ers_ats_6mwt_2014', version: 'ers-ats-6mwt/2014.1', testId: 'six_minute_walk_test', title: 'ERS/ATS 30-m corridor 6MWT', acceptance: 'conditional', endpoint: 'total_distance_six_minutes', referenceCompatible: true, criticalRule: 'Qualified supervision, 30-m straight indoor course, standard encouragement, timer continues during rests.' },
    { id: 'six_mwt_specialty_short_course_v1', version: 'six-mwt-specialty-short-course/1.0.0', testId: 'six_minute_walk_test', title: 'Named specialty short-course 6MWT', acceptance: 'clinical_specialty', endpoint: 'total_distance_six_minutes', referenceCompatible: false, criticalRule: 'Specialty use only; never ERS/ATS-equivalent or reference eligible.' },
    { id: 'nia_sppb_4m_v1', version: 'nia-sppb-4m/1.0.0', testId: 'short_physical_performance_battery', title: 'Official NIA SPPB four-metre sequence', acceptance: 'accepted', endpoint: 'official_raw_components', referenceCompatible: false, criticalRule: 'Balance, four-metre gait, chair sequence; fifth-standing chair endpoint.' },
    { id: 'nia_sppb_3m_v1', version: 'nia-sppb-3m/1.0.0', testId: 'short_physical_performance_battery', title: 'Official NIA SPPB three-metre space-limited sequence', acceptance: 'conditional', endpoint: 'official_raw_components', referenceCompatible: false, criticalRule: 'Explicit official three-metre variant; not comparable with four metres.' },
  ] as const satisfies readonly FunctionalCapacityProtocolDefinition[],
});

export function getFunctionalCapacityProtocolDefinition(
  id: FunctionalCapacityProtocolId | null,
): FunctionalCapacityProtocolDefinition | null {
  return FUNCTIONAL_CAPACITY_PROTOCOL_REGISTRY.protocols.find(protocol => protocol.id === id) ?? null;
}
