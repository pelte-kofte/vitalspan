import type { FunctionalCapacityConfidence, FunctionalCapacitySourceId, FunctionalCapacityTestId } from './contracts';
import { FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export interface FunctionalCapacitySourceDefinition {
  id: FunctionalCapacitySourceId;
  title: string;
  defaultConfidence: FunctionalCapacityConfidence;
  acceptance: 'accepted' | 'conditional' | 'research_only' | 'unsupported';
  allowedTests: readonly FunctionalCapacityTestId[] | 'all';
  directObservationRequired: boolean;
  verifiedOriginalRecordRequired: boolean;
  rule: string;
}

const ALL_TESTS = 'all' as const;

export const FUNCTIONAL_CAPACITY_SOURCE_REGISTRY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.sourceRegistry,
  sources: [
    { id: 'validated_clinical_assessment', title: 'Validated clinical assessment', defaultConfidence: 'clinical_grade', acceptance: 'accepted', allowedTests: ALL_TESTS, directObservationRequired: true, verifiedOriginalRecordRequired: true, rule: 'Qualified assessor, complete protocol, controlled equipment, safety, and original record.' },
    { id: 'validated_rehabilitation_assessment', title: 'Validated rehabilitation assessment', defaultConfidence: 'clinical_grade', acceptance: 'accepted', allowedTests: ALL_TESTS, directObservationRequired: true, verifiedOriginalRecordRequired: true, rule: 'Same scientific conditions as clinical assessment; treatment context does not alter the endpoint.' },
    { id: 'trained_research_assessment', title: 'Trained research assessment', defaultConfidence: 'high_confidence', acceptance: 'accepted', allowedTests: ALL_TESTS, directObservationRequired: true, verifiedOriginalRecordRequired: true, rule: 'Trained assessor, auditable protocol, source data, equipment quality, deviations, and safety events.' },
    { id: 'supervised_standardized_home_assessment', title: 'Live professionally supervised standardized home assessment', defaultConfidence: 'moderate_confidence', acceptance: 'conditional', allowedTests: ['hand_grip_strength', 'usual_gait_speed', 'four_meter_walk', 'chair_stand_30_second', 'five_times_sit_to_stand', 'timed_up_and_go', 'short_physical_performance_battery'], directObservationRequired: true, verifiedOriginalRecordRequired: true, rule: 'Live verified setup and safety; no general home 6MWT authorization.' },
    { id: 'unsupervised_home_assessment', title: 'Unsupervised home assessment', defaultConfidence: 'research_only', acceptance: 'research_only', allowedTests: ALL_TESTS, directObservationRequired: false, verifiedOriginalRecordRequired: false, rule: 'Protocol adherence, timing, environment, and safety cannot be established for production.' },
    { id: 'validated_connected_medical_device', title: 'Method-validated connected medical device', defaultConfidence: 'high_confidence', acceptance: 'conditional', allowedTests: ALL_TESTS, directObservationRequired: true, verifiedOriginalRecordRequired: true, rule: 'Exact model, firmware, calibration, algorithm, and method agreement are required.' },
    { id: 'unvalidated_connected_device', title: 'Unvalidated connected device', defaultConfidence: 'research_only', acceptance: 'research_only', allowedTests: ALL_TESTS, directObservationRequired: false, verifiedOriginalRecordRequired: false, rule: 'Experimental device capture cannot replace the standard endpoint.' },
    { id: 'consumer_wearable', title: 'Consumer wearable', defaultConfidence: 'unsupported', acceptance: 'unsupported', allowedTests: ALL_TESTS, directObservationRequired: false, verifiedOriginalRecordRequired: false, rule: 'Passive or consumer-derived output is not an administered performance test.' },
    { id: 'passive_estimate', title: 'Passive estimate', defaultConfidence: 'unsupported', acceptance: 'unsupported', allowedTests: ALL_TESTS, directObservationRequired: false, verifiedOriginalRecordRequired: false, rule: 'An estimate is not a validated test endpoint.' },
    { id: 'clinician_verified_transcription', title: 'Clinician transcription of verified original record', defaultConfidence: 'clinical_grade', acceptance: 'conditional', allowedTests: ALL_TESTS, directObservationRequired: false, verifiedOriginalRecordRequired: true, rule: 'Confidence inherits the verified underlying assessment; the entry route alone confers no trust.' },
    { id: 'clinician_entered_unverified', title: 'Unverified clinician-entered value', defaultConfidence: 'unsupported', acceptance: 'unsupported', allowedTests: ALL_TESTS, directObservationRequired: false, verifiedOriginalRecordRequired: false, rule: 'Professional identity does not establish method or provenance.' },
    { id: 'user_transcription_pending_verification', title: 'User transcription with source document pending verification', defaultConfidence: 'low_confidence', acceptance: 'conditional', allowedTests: ALL_TESTS, directObservationRequired: false, verifiedOriginalRecordRequired: true, rule: 'Historical retention only until independently verified; no interpretation.' },
    { id: 'user_entered_unverified', title: 'Unverified user-entered value', defaultConfidence: 'unsupported', acceptance: 'unsupported', allowedTests: ALL_TESTS, directObservationRequired: false, verifiedOriginalRecordRequired: false, rule: 'Unverified time, count, force, or distance is not accepted.' },
    { id: 'self_report', title: 'Self-reported ability or result', defaultConfidence: 'unsupported', acceptance: 'unsupported', allowedTests: ALL_TESTS, directObservationRequired: false, verifiedOriginalRecordRequired: false, rule: 'Self-report is not objective administered performance testing.' },
  ] as const satisfies readonly FunctionalCapacitySourceDefinition[],
});

export function getFunctionalCapacitySourceDefinition(
  id: FunctionalCapacitySourceId | null,
): FunctionalCapacitySourceDefinition | null {
  return FUNCTIONAL_CAPACITY_SOURCE_REGISTRY.sources.find(source => source.id === id) ?? null;
}
