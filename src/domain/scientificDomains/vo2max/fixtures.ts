import type { Vo2MaxEligibilityStatus, Vo2MaxMeasurementInput } from './contracts';

export interface Vo2MaxValidationFixture {
  id: string;
  expectedStatus: Vo2MaxEligibilityStatus;
  input: Vo2MaxMeasurementInput;
}

const BASE_DIRECT_CPET: Vo2MaxMeasurementInput = {
  recordId: 'vo2max-fixture-direct-us-001',
  personId: 'vo2max-fixture-person-001',
  value: 42.36,
  unit: 'mL/kg/min',
  sourceId: 'direct_cpet_maximal',
  provider: {
    organization: 'Fixture CPET Laboratory',
    application: null,
    deviceManufacturer: 'Fixture Metabolic Systems',
    deviceModel: 'Gas Cart Reference',
    softwareVersion: '1.0.0',
    firmwareVersion: null,
    algorithmVersion: null,
  },
  testType: 'maximal_cpet',
  measurementNature: 'direct_gas',
  endpoint: 'vo2max',
  modality: 'treadmill',
  timestamps: {
    measuredAt: '2026-07-10T09:00:00-04:00',
    precision: 'instant',
    localTime: '2026-07-10T09:00:00',
    utcOffset: '-04:00',
    timeZone: 'America/New_York',
    createdAt: '2026-07-10T10:00:00-04:00',
    revisedAt: null,
    ingestedAt: '2026-07-11T08:00:00Z',
  },
  ingestionMethod: 'clinical_import',
  provenance: {
    sourceRecordId: 'fixture-lab-sample-001',
    sourceReportId: 'fixture-lab-report-001',
    relatedWorkoutId: null,
    originalPayloadReference: 'fixture://reports/direct-cpet-001',
    payloadIntegrityReference: 'fixture-integrity-direct-cpet-001',
    originatingSourceId: 'direct_cpet_maximal',
    providerIdentityVerified: true,
    reportVerified: true,
    directGasAnalysis: true,
    calibrationDocumented: true,
    qualityControlDocumented: true,
    maximalityEvidenceDocumented: true,
    symptomLimitationDocumented: false,
    protocolDocumented: true,
    averagingIntervalDocumented: true,
    terminationReasonDocumented: true,
    clinicianAttestationDocumented: true,
  },
  population: {
    birthDate: '1985-11-20',
    sourceRecordedSex: 'female',
    countryCode: 'US',
    regionCode: 'US-NY',
    healthPopulation: 'apparently_healthy',
  },
  duplicate: {
    disposition: 'not_duplicate',
    canonicalRecordId: null,
    supersedesRecordId: null,
    sharedEventId: null,
  },
  requestedReference: {
    id: 'friend_2022_us_adults',
    version: 'friend-2022-us-adults/1.0.0',
  },
};

type Vo2MaxFixtureChanges = Omit<Partial<Vo2MaxMeasurementInput>,
  'provider' | 'timestamps' | 'provenance' | 'population' | 'duplicate' | 'requestedReference'> & {
  provider?: Partial<Vo2MaxMeasurementInput['provider']>;
  timestamps?: Partial<Vo2MaxMeasurementInput['timestamps']>;
  provenance?: Partial<Vo2MaxMeasurementInput['provenance']>;
  population?: Partial<Vo2MaxMeasurementInput['population']>;
  duplicate?: Partial<Vo2MaxMeasurementInput['duplicate']>;
  requestedReference?: Partial<Vo2MaxMeasurementInput['requestedReference']>;
};

function withChanges(
  id: string,
  expectedStatus: Vo2MaxEligibilityStatus,
  changes: Vo2MaxFixtureChanges,
): Vo2MaxValidationFixture {
  return {
    id,
    expectedStatus,
    input: {
      ...BASE_DIRECT_CPET,
      ...changes,
      recordId: changes.recordId ?? `vo2max-fixture-${id}`,
      provider: { ...BASE_DIRECT_CPET.provider, ...changes.provider },
      timestamps: { ...BASE_DIRECT_CPET.timestamps, ...changes.timestamps },
      provenance: { ...BASE_DIRECT_CPET.provenance, ...changes.provenance },
      population: { ...BASE_DIRECT_CPET.population, ...changes.population },
      duplicate: { ...BASE_DIRECT_CPET.duplicate, ...changes.duplicate },
      requestedReference: { ...BASE_DIRECT_CPET.requestedReference, ...changes.requestedReference },
    },
  };
}

function wearableFixture(
  id: string,
  changes: Vo2MaxFixtureChanges,
  expectedStatus: Vo2MaxEligibilityStatus = 'measurement_accepted_no_reference',
): Vo2MaxValidationFixture {
  return withChanges(id, expectedStatus, {
    value: 41,
    endpoint: 'vo2max',
    ingestionMethod: 'device_sync',
    ...changes,
    population: {
      countryCode: 'US', healthPopulation: 'apparently_healthy',
      ...changes.population,
    },
    provenance: {
      sourceRecordId: `fixture-${id}-source`,
      sourceReportId: null,
      originalPayloadReference: `fixture://device/${id}`,
      originatingSourceId: changes.sourceId ?? null,
      providerIdentityVerified: true,
      reportVerified: false,
      directGasAnalysis: false,
      calibrationDocumented: null,
      qualityControlDocumented: null,
      maximalityEvidenceDocumented: null,
      symptomLimitationDocumented: null,
      protocolDocumented: null,
      averagingIntervalDocumented: null,
      terminationReasonDocumented: null,
      clinicianAttestationDocumented: null,
      ...changes.provenance,
    },
    requestedReference: { id: null, version: null, ...changes.requestedReference },
  });
}

export const VO2MAX_VALIDATION_FIXTURES = [
  withChanges('valid_friend_direct_cpet', 'eligible', {}),
  withChanges('valid_direct_no_reference', 'measurement_accepted_no_reference', {
    population: { countryCode: 'CA', regionCode: 'CA-ON' },
    requestedReference: { id: null, version: null },
  }),
  withChanges('symptom_limited_vo2peak', 'measurement_accepted_no_reference', {
    sourceId: 'direct_cpet_symptom_limited',
    testType: 'symptom_limited_cpet',
    endpoint: 'vo2peak',
    provenance: {
      originatingSourceId: 'direct_cpet_symptom_limited',
      maximalityEvidenceDocumented: false,
      symptomLimitationDocumented: true,
      terminationReasonDocumented: true,
    },
    requestedReference: { id: null, version: null },
  }),
  wearableFixture('apple_watch_estimate', {
    sourceId: 'apple_watch_estimate',
    testType: 'outdoor_walk_run_hike_estimate',
    measurementNature: 'exercise_estimate',
    modality: 'running',
    ingestionMethod: 'healthkit',
    provider: {
      organization: 'Apple', application: 'Apple Health', deviceManufacturer: 'Apple',
      deviceModel: 'Apple Watch Fixture', softwareVersion: 'fixture',
    },
    provenance: { originatingSourceId: 'apple_watch_estimate' },
  }),
  wearableFixture('garmin_estimate', {
    sourceId: 'garmin_supported_estimate',
    testType: 'supported_running_or_cycling_estimate',
    measurementNature: 'exercise_estimate', modality: 'running',
    provider: { organization: 'Garmin', application: 'Garmin Connect', deviceManufacturer: 'Garmin', deviceModel: 'Supported Fixture' },
  }),
  wearableFixture('polar_running_index', {
    sourceId: 'polar_running_index', testType: 'running_index_estimate',
    measurementNature: 'exercise_estimate', modality: 'running',
    provider: { organization: 'Polar', application: 'Polar Flow', deviceManufacturer: 'Polar', deviceModel: 'Supported Fixture' },
  }),
  wearableFixture('polar_resting_fitness_test', {
    sourceId: 'polar_fitness_test_resting', testType: 'resting_nonexercise_estimate',
    measurementNature: 'resting_estimate', modality: 'resting',
    provider: { organization: 'Polar', application: 'Polar Flow', deviceManufacturer: 'Polar', deviceModel: 'Supported Fixture' },
  }),
  wearableFixture('fitbit_google_estimate', {
    sourceId: 'fitbit_google_qualifying_gps_estimate', testType: 'qualifying_gps_run_estimate',
    measurementNature: 'exercise_estimate', modality: 'running',
    provider: { organization: 'Google', application: 'Fitbit', deviceManufacturer: 'Fitbit', deviceModel: 'Qualifying Fixture' },
  }),
  wearableFixture('coros_research', {
    sourceId: 'coros_evolab', testType: 'running_index_estimate',
    measurementNature: 'exercise_estimate', modality: 'running',
    provider: { organization: 'COROS', application: 'COROS', deviceManufacturer: 'COROS', deviceModel: 'EvoLab Fixture' },
  }, 'research_only'),
  wearableFixture('whoop_research', {
    sourceId: 'whoop_5_mg', testType: 'rolling_wearable_estimate',
    measurementNature: 'resting_estimate', modality: 'mixed',
    provider: { organization: 'WHOOP', application: 'WHOOP', deviceManufacturer: 'WHOOP', deviceModel: '5.0 Fixture' },
  }, 'research_only'),
  withChanges('unverified_healthkit', 'unsupported', {
    sourceId: 'healthkit_unverified', testType: 'unknown', measurementNature: 'unknown',
    endpoint: 'unknown', modality: 'unknown', ingestionMethod: 'healthkit',
    provenance: {
      sourceRecordId: null, sourceReportId: null, originatingSourceId: null,
      providerIdentityVerified: false, reportVerified: false, directGasAnalysis: null,
    },
    requestedReference: { id: null, version: null },
  }),
  withChanges('manual_user_entry', 'unsupported', {
    sourceId: 'user_manual_entry', testType: 'manual_transcription', measurementNature: 'transcription',
    endpoint: 'vo2max', modality: 'unknown', ingestionMethod: 'manual_user',
    provenance: {
      sourceRecordId: null, sourceReportId: null, originatingSourceId: null,
      providerIdentityVerified: false, reportVerified: false, directGasAnalysis: null,
    },
    requestedReference: { id: null, version: null },
  }),
  withChanges('verified_clinician_transcription', 'measurement_accepted_no_reference', {
    sourceId: 'clinician_verified_transcription',
    testType: 'manual_transcription', measurementNature: 'transcription',
    endpoint: 'vo2max', modality: 'treadmill', ingestionMethod: 'manual_clinician',
    provenance: {
      originatingSourceId: 'direct_cpet_maximal',
      sourceRecordId: 'fixture-clinician-transcription-001',
      sourceReportId: 'fixture-lab-report-001',
      providerIdentityVerified: true,
      reportVerified: true,
      clinicianAttestationDocumented: true,
    },
    requestedReference: { id: null, version: null },
  }),
  withChanges('unverified_clinician_entry', 'unsupported', {
    sourceId: 'clinician_unverified_entry',
    testType: 'manual_transcription', measurementNature: 'transcription',
    endpoint: 'vo2max', modality: 'treadmill', ingestionMethod: 'manual_clinician',
    provenance: {
      originatingSourceId: null, sourceRecordId: null, sourceReportId: null,
      providerIdentityVerified: false, reportVerified: false,
      clinicianAttestationDocumented: false,
    },
    requestedReference: { id: null, version: null },
  }),
  withChanges('provisional_user_report', 'conditionally_eligible', {
    sourceId: 'user_report_transcription_unverified',
    testType: 'manual_transcription', measurementNature: 'transcription',
    endpoint: 'vo2max', modality: 'treadmill', ingestionMethod: 'manual_user',
    provenance: {
      originatingSourceId: 'direct_cpet_maximal',
      sourceRecordId: 'fixture-user-report-transcription-001',
      sourceReportId: 'fixture-attached-report-001',
      originalPayloadReference: 'fixture://reports/user-attached-001',
      providerIdentityVerified: false, reportVerified: false,
      clinicianAttestationDocumented: false,
    },
    requestedReference: { id: null, version: null },
  }),
  withChanges('missing_source', 'insufficient_data', {
    sourceId: null,
    requestedReference: { id: null, version: null },
  }),
  withChanges('missing_timestamp', 'insufficient_data', {
    timestamps: { measuredAt: null, precision: 'unknown' },
  }),
  withChanges('unsupported_unit', 'invalid', { unit: 'MET' }),
  withChanges('age_outside_reference', 'measurement_accepted_no_reference', {
    population: { birthDate: '1930-01-01' },
  }),
  withChanges('sex_mismatch', 'measurement_accepted_no_reference', {
    population: { sourceRecordedSex: 'intersex' },
  }),
  withChanges('region_mismatch', 'measurement_accepted_no_reference', {
    population: { countryCode: 'TR', regionCode: 'TR-34' },
  }),
  withChanges('modality_mismatch', 'invalid', { modality: 'running' }),
  withChanges('exact_duplicate', 'unsupported', {
    duplicate: { disposition: 'exact_reimport', canonicalRecordId: 'vo2max-fixture-direct-us-001' },
  }),
] as const satisfies readonly Vo2MaxValidationFixture[];

export function getVo2MaxValidationFixture(id: string): Vo2MaxValidationFixture {
  const fixture = VO2MAX_VALIDATION_FIXTURES.find(candidate => candidate.id === id);
  if (!fixture) throw new Error(`Unknown VO2max validation fixture: ${id}.`);
  return fixture;
}
