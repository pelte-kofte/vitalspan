import type {
  Vo2MaxConfidence,
  Vo2MaxEndpoint,
  Vo2MaxMeasurementNature,
  Vo2MaxModality,
  Vo2MaxSourceId,
  Vo2MaxTestType,
} from './contracts';
import { VO2MAX_SCIENTIFIC_VERSIONS } from './versions';

export interface Vo2MaxSourceDefinition {
  id: Vo2MaxSourceId;
  title: string;
  confidence: Vo2MaxConfidence;
  productionAcceptance: 'accepted' | 'conditional' | 'research_only' | 'unsupported';
  measurementNature: Vo2MaxMeasurementNature;
  allowedEndpoints: readonly Vo2MaxEndpoint[];
  allowedTestTypes: readonly Vo2MaxTestType[];
  allowedModalities: readonly Vo2MaxModality[];
  providerIdentityRequired: boolean;
  sourceRecordIdRequired: boolean;
  directCpetQualityRequired: boolean;
  sourceRange: { minimum: number; maximum: number } | null;
  provenanceRule: string;
  interpretationRule: string;
}

export const VO2MAX_SOURCE_REGISTRY = Object.freeze({
  version: VO2MAX_SCIENTIFIC_VERSIONS.sourceRegistry,
  sources: [
    {
      id: 'direct_cpet_maximal', title: 'Validated maximal direct-gas CPET',
      confidence: 'gold_standard', productionAcceptance: 'accepted', measurementNature: 'direct_gas',
      allowedEndpoints: ['vo2max'], allowedTestTypes: ['maximal_cpet'], allowedModalities: ['treadmill', 'cycle'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: true, sourceRange: null,
      provenanceRule: 'Requires a verified report, respiratory gas analysis, calibration, quality control, protocol, averaging interval, and maximality evidence.',
      interpretationRule: 'Criterion VO2max for the recorded modality; eligible for exact-match reference review.',
    },
    {
      id: 'direct_cpet_symptom_limited', title: 'Symptom-limited direct CPET',
      confidence: 'clinical_grade', productionAcceptance: 'accepted', measurementNature: 'direct_gas',
      allowedEndpoints: ['vo2peak'], allowedTestTypes: ['symptom_limited_cpet'], allowedModalities: ['treadmill', 'cycle'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: true, sourceRange: null,
      provenanceRule: 'Requires a verified report, respiratory gas analysis, calibration, quality control, protocol, termination reason, and symptom-limitation record.',
      interpretationRule: 'Clinical VO2peak as reported; never silently promoted to VO2max.',
    },
    {
      id: 'laboratory_exercise_estimate', title: 'Laboratory exercise test without direct gas analysis',
      confidence: 'moderate_confidence', productionAcceptance: 'accepted', measurementNature: 'exercise_estimate',
      allowedEndpoints: ['vo2max'], allowedTestTypes: ['maximal_exercise_without_gas'], allowedModalities: ['treadmill', 'cycle'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Requires the estimating protocol and laboratory source; must be labelled estimated.',
      interpretationRule: 'Estimate only; no direct-CPET percentile.',
    },
    {
      id: 'apple_watch_estimate', title: 'Apple Watch cardio-fitness estimate',
      confidence: 'moderate_confidence', productionAcceptance: 'accepted', measurementNature: 'exercise_estimate',
      allowedEndpoints: ['vo2max'], allowedTestTypes: ['outdoor_walk_run_hike_estimate'], allowedModalities: ['running', 'walking', 'hiking'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: false, sourceRange: { minimum: 14, maximum: 65 },
      provenanceRule: 'Requires Apple Watch origin, identifiable device/application, test type, and source record.',
      interpretationRule: 'Estimated contextual monitoring only; Apple Health ingestion does not change confidence.',
    },
    {
      id: 'garmin_supported_estimate', title: 'Supported Garmin exercise-based estimate',
      confidence: 'moderate_confidence', productionAcceptance: 'accepted', measurementNature: 'exercise_estimate',
      allowedEndpoints: ['vo2max'], allowedTestTypes: ['supported_running_or_cycling_estimate'], allowedModalities: ['running', 'cycle'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Requires a supported Garmin model, exercise modality, source record, and identifiable provider.',
      interpretationRule: 'Within-model estimate context only; no direct-CPET percentile.',
    },
    {
      id: 'polar_running_index', title: 'Polar Running Index',
      confidence: 'moderate_confidence', productionAcceptance: 'accepted', measurementNature: 'exercise_estimate',
      allowedEndpoints: ['vo2max'], allowedTestTypes: ['running_index_estimate'], allowedModalities: ['running'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Requires Polar origin, qualifying running context, and source record.',
      interpretationRule: 'Running-specific estimate context only; no direct-CPET percentile.',
    },
    {
      id: 'polar_fitness_test_resting', title: 'Polar resting Fitness Test',
      confidence: 'low_confidence', productionAcceptance: 'accepted', measurementNature: 'resting_estimate',
      allowedEndpoints: ['vo2max'], allowedTestTypes: ['resting_nonexercise_estimate'], allowedModalities: ['resting'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Requires Polar origin, resting-test identity, and source record.',
      interpretationRule: 'Supplemental estimated context only; no precise trend or direct-CPET percentile.',
    },
    {
      id: 'fitbit_google_qualifying_gps_estimate', title: 'Qualifying Fitbit or Google Health GPS-run estimate',
      confidence: 'moderate_confidence', productionAcceptance: 'accepted', measurementNature: 'exercise_estimate',
      allowedEndpoints: ['vo2max'], allowedTestTypes: ['qualifying_gps_run_estimate'], allowedModalities: ['running'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Requires a qualifying supported model/workflow, GPS-run method, source record, and provider identity.',
      interpretationRule: 'Supported-model estimate context only; no direct-CPET percentile.',
    },
    {
      id: 'coros_evolab', title: 'COROS EvoLab running VO2max',
      confidence: 'research_only', productionAcceptance: 'research_only', measurementNature: 'exercise_estimate',
      allowedEndpoints: ['vo2max'], allowedTestTypes: ['running_index_estimate'], allowedModalities: ['running'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Requires COROS EvoLab origin and source record.',
      interpretationRule: 'Research ingestion only; excluded from production scientific interpretation.',
    },
    {
      id: 'whoop_5_mg', title: 'WHOOP 5.0/MG VO2max estimate',
      confidence: 'research_only', productionAcceptance: 'research_only', measurementNature: 'resting_estimate',
      allowedEndpoints: ['vo2max'], allowedTestTypes: ['rolling_wearable_estimate'], allowedModalities: ['mixed'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Requires WHOOP 5.0/MG origin, rolling-estimate identity, and source record.',
      interpretationRule: 'Research ingestion only; excluded from production scientific interpretation.',
    },
    {
      id: 'healthkit_unverified', title: 'Unverified Apple Health/HealthKit value',
      confidence: 'unsupported', productionAcceptance: 'unsupported', measurementNature: 'unknown',
      allowedEndpoints: ['vo2max', 'vo2peak', 'unknown'], allowedTestTypes: ['unknown'], allowedModalities: ['unknown'],
      providerIdentityRequired: false, sourceRecordIdRequired: false, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Origin, method, or test type is unresolved. HealthKit is only a container.',
      interpretationRule: 'Unsupported; no scientific interpretation.',
    },
    {
      id: 'clinician_verified_transcription', title: 'Verified clinician transcription',
      confidence: 'clinical_grade', productionAcceptance: 'accepted', measurementNature: 'transcription',
      allowedEndpoints: ['vo2max', 'vo2peak'], allowedTestTypes: ['manual_transcription'], allowedModalities: ['treadmill', 'cycle'],
      providerIdentityRequired: true, sourceRecordIdRequired: true, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Requires clinician attestation, verified original report identity, and originating method.',
      interpretationRule: 'Inherits the source meaning but is capped at Clinical Grade as an entry route; no direct-CPET percentile in this version.',
    },
    {
      id: 'clinician_unverified_entry', title: 'Unverified clinician-entered value',
      confidence: 'unsupported', productionAcceptance: 'unsupported', measurementNature: 'transcription',
      allowedEndpoints: ['vo2max', 'vo2peak', 'unknown'], allowedTestTypes: ['manual_transcription'], allowedModalities: ['treadmill', 'cycle', 'unknown'],
      providerIdentityRequired: false, sourceRecordIdRequired: false, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Original measurement method or report is unverified.', interpretationRule: 'Unsupported.',
    },
    {
      id: 'user_report_transcription_unverified', title: 'User transcription with attached report awaiting verification',
      confidence: 'low_confidence', productionAcceptance: 'conditional', measurementNature: 'transcription',
      allowedEndpoints: ['vo2max', 'vo2peak'], allowedTestTypes: ['manual_transcription'], allowedModalities: ['treadmill', 'cycle'],
      providerIdentityRequired: false, sourceRecordIdRequired: true, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'Requires an attached source report and remains provisional until verified.',
      interpretationRule: 'Conditional transcription context only; no percentile.',
    },
    {
      id: 'user_manual_entry', title: 'Unverified manual user entry',
      confidence: 'unsupported', productionAcceptance: 'unsupported', measurementNature: 'transcription',
      allowedEndpoints: ['vo2max', 'vo2peak', 'unknown'], allowedTestTypes: ['manual_transcription'], allowedModalities: ['treadmill', 'cycle', 'unknown'],
      providerIdentityRequired: false, sourceRecordIdRequired: false, directCpetQualityRequired: false, sourceRange: null,
      provenanceRule: 'No verifiable source report or measurement method.', interpretationRule: 'Unsupported.',
    },
  ] as const satisfies readonly Vo2MaxSourceDefinition[],
});

export function getVo2MaxSourceDefinition(
  sourceId: Vo2MaxSourceId | null,
): Vo2MaxSourceDefinition | null {
  if (sourceId === null) return null;
  return VO2MAX_SOURCE_REGISTRY.sources.find(source => source.id === sourceId) ?? null;
}

