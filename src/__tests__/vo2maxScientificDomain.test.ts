import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  VO2MAX_ALWAYS_BLOCKED_OUTPUTS,
  VO2MAX_CONFIDENCE_REGISTRY,
  VO2MAX_ELIGIBILITY_POLICY,
  VO2MAX_GOVERNANCE_POLICY,
  VO2MAX_MEASUREMENT_VALIDATION_POLICY,
  VO2MAX_PERCENTILE_POLICY,
  VO2MAX_REASON_ORDER,
  VO2MAX_REFERENCE_REGISTRY,
  VO2MAX_SCIENTIFIC_VERSIONS,
  VO2MAX_SOURCE_REGISTRY,
  VO2MAX_VALIDATION_FIXTURES,
  evaluateVo2MaxEligibility,
  getVo2MaxSourceDefinition,
  getVo2MaxValidationFixture,
  validateVo2MaxGovernance,
  type Vo2MaxMeasurementInput,
} from '../domain/scientificDomains/vo2max';

function input(id: string): Vo2MaxMeasurementInput {
  return getVo2MaxValidationFixture(id).input;
}

function alter(
  base: Vo2MaxMeasurementInput,
  changes: Omit<Partial<Vo2MaxMeasurementInput>,
    'timestamps' | 'provenance' | 'population' | 'requestedReference'> & {
    timestamps?: Partial<Vo2MaxMeasurementInput['timestamps']>;
    provenance?: Partial<Vo2MaxMeasurementInput['provenance']>;
    population?: Partial<Vo2MaxMeasurementInput['population']>;
    requestedReference?: Partial<Vo2MaxMeasurementInput['requestedReference']>;
  },
): Vo2MaxMeasurementInput {
  return {
    ...base,
    ...changes,
    timestamps: { ...base.timestamps, ...changes.timestamps },
    provenance: { ...base.provenance, ...changes.provenance },
    population: { ...base.population, ...changes.population },
    requestedReference: { ...base.requestedReference, ...changes.requestedReference },
  };
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return path.endsWith('.ts') || path.endsWith('.tsx') ? [path] : [];
  });
}

describe('Phase 5.0D VO2max scientific domain', () => {
  describe('versioned governance and registries', () => {
    test('validates the complete fail-closed governance catalog', () => {
      expect(validateVo2MaxGovernance()).toEqual([]);
      expect(new Set(Object.values(VO2MAX_SCIENTIFIC_VERSIONS)).size).toBe(6);
      expect(VO2MAX_GOVERNANCE_POLICY).toMatchObject({
        standaloneDomain: 'cardiorespiratory_fitness',
        failClosed: true,
        aiScientificDecisioningAllowed: false,
        productionIntegrationAuthorized: false,
        clinicalPhenoAgeInteraction: 'prohibited',
        biologicalAgeOutputAllowed: false,
        fitnessAgeOutputAllowed: false,
        mortalityPredictionAllowed: false,
        compositeLongevityScoreAllowed: false,
      });
    });

    test('exposes independently versioned source, confidence, reference, eligibility, and percentile policy', () => {
      expect(VO2MAX_SOURCE_REGISTRY.version).toBe('vo2max-source-registry/1.0.0');
      expect(VO2MAX_CONFIDENCE_REGISTRY.version).toBe('vo2max-confidence-registry/1.0.0');
      expect(VO2MAX_REFERENCE_REGISTRY.version).toBe('vo2max-reference-registry/1.0.0');
      expect(VO2MAX_PERCENTILE_POLICY.version).toBe('vo2max-percentile-policy/1.0.0');
      expect(VO2MAX_SCIENTIFIC_VERSIONS.eligibilityPolicy).toBe('vo2max-eligibility-policy/1.0.0');
      expect(VO2MAX_SCIENTIFIC_VERSIONS.domainSpecification).toBe('vo2max-domain/1.0.0');
      expect(VO2MAX_ELIGIBILITY_POLICY.version).toBe(VO2MAX_SCIENTIFIC_VERSIONS.eligibilityPolicy);
      expect(VO2MAX_MEASUREMENT_VALIDATION_POLICY.version)
        .toBe(VO2MAX_SCIENTIFIC_VERSIONS.eligibilityPolicy);
    });

    test('locks the approved Phase 5.0B source classifications without collapsing wearables', () => {
      expect(getVo2MaxSourceDefinition('direct_cpet_maximal')?.confidence).toBe('gold_standard');
      expect(getVo2MaxSourceDefinition('direct_cpet_symptom_limited')?.confidence).toBe('clinical_grade');
      expect(getVo2MaxSourceDefinition('apple_watch_estimate')?.confidence).toBe('moderate_confidence');
      expect(getVo2MaxSourceDefinition('garmin_supported_estimate')?.confidence).toBe('moderate_confidence');
      expect(getVo2MaxSourceDefinition('polar_running_index')?.confidence).toBe('moderate_confidence');
      expect(getVo2MaxSourceDefinition('fitbit_google_qualifying_gps_estimate')?.confidence).toBe('moderate_confidence');
      expect(getVo2MaxSourceDefinition('polar_fitness_test_resting')?.confidence).toBe('low_confidence');
      expect(getVo2MaxSourceDefinition('coros_evolab')?.productionAcceptance).toBe('research_only');
      expect(getVo2MaxSourceDefinition('whoop_5_mg')?.productionAcceptance).toBe('research_only');
      expect(getVo2MaxSourceDefinition('healthkit_unverified')?.confidence).toBe('unsupported');
      expect(getVo2MaxSourceDefinition('user_manual_entry')?.confidence).toBe('unsupported');
      expect(new Set(VO2MAX_SOURCE_REGISTRY.sources.map(source => source.id)).size)
        .toBe(VO2MAX_SOURCE_REGISTRY.sources.length);
    });
  });

  describe('measurement and reference eligibility', () => {
    test.each(VO2MAX_VALIDATION_FIXTURES.map(fixture => [
      fixture.id, fixture.expectedStatus,
    ] as const))('fixture %s produces %s', (id, expectedStatus) => {
      expect(evaluateVo2MaxEligibility(input(id)).status).toBe(expectedStatus);
    });

    test('accepts maximal direct-gas CPET and authorizes only the exact FRIEND reference', () => {
      const result = evaluateVo2MaxEligibility(input('valid_friend_direct_cpet'));
      expect(result).toMatchObject({
        status: 'eligible',
        measurementAccepted: true,
        measurementConfidence: 'gold_standard',
        interpretationAvailability: 'normative_percentile_authorized',
        canonicalMeasurement: {
          originalValue: 42.36,
          canonicalValue: 42.4,
          originalUnit: 'mL/kg/min',
          endpoint: 'vo2max',
          measurementNature: 'direct_gas',
          modality: 'treadmill',
          ageAtMeasurement: 40,
        },
        referenceEligibility: {
          status: 'eligible',
          reference: {
            id: 'friend_2022_us_adults',
            version: 'friend-2022-us-adults/1.0.0',
            sourceRecordedSex: 'female',
            countryCode: 'US',
            modality: 'treadmill',
            endpoint: 'vo2max',
          },
        },
        percentileEligibility: { status: 'authorized', value: null },
      });
      expect(result.authorizedOutputs).toContain('percentile');
      expect(result.reasonCodes).toEqual(['reference_exact_match', 'percentile_authorized']);
    });

    test('accepts valid direct CPET without manufacturing a regional reference', () => {
      const result = evaluateVo2MaxEligibility(input('valid_direct_no_reference'));
      expect(result.status).toBe('measurement_accepted_no_reference');
      expect(result.measurementAccepted).toBe(true);
      expect(result.referenceEligibility.reference).toBeNull();
      expect(result.percentileEligibility.status).toBe('unavailable');
      expect(result.authorizedOutputs).not.toContain('percentile');
      expect(result.reasonCodes).toContain('region_not_supported_by_reference');
    });

    test('preserves VO2peak as Clinical Grade and never promotes it to VO2max', () => {
      const result = evaluateVo2MaxEligibility(input('symptom_limited_vo2peak'));
      expect(result.status).toBe('measurement_accepted_no_reference');
      expect(result.measurementConfidence).toBe('clinical_grade');
      expect(result.canonicalMeasurement.endpoint).toBe('vo2peak');
      expect(result.referenceEligibility.status).toBe('ineligible');
      expect(result.reasonCodes).toContain('endpoint_not_supported_by_reference');
      expect(result.authorizedOutputs).not.toContain('percentile');
    });

    test.each([
      ['apple_watch_estimate', 'moderate_confidence'],
      ['garmin_estimate', 'moderate_confidence'],
      ['polar_running_index', 'moderate_confidence'],
      ['fitbit_google_estimate', 'moderate_confidence'],
      ['polar_resting_fitness_test', 'low_confidence'],
    ] as const)('%s is accepted as %s without a direct-CPET percentile', (id, confidence) => {
      const result = evaluateVo2MaxEligibility(input(id));
      expect(result.status).toBe('measurement_accepted_no_reference');
      expect(result.measurementConfidence).toBe(confidence);
      expect(result.referenceEligibility.reference).toBeNull();
      expect(result.percentileEligibility.status).toBe('unavailable');
      expect(result.reasonCodes).toContain('estimate_not_reference_eligible');
    });

    test('HealthKit preserves Apple Watch origin and cannot upgrade its confidence', () => {
      const result = evaluateVo2MaxEligibility(input('apple_watch_estimate'));
      expect(result.sourceProvenance).toMatchObject({
        sourceId: 'apple_watch_estimate',
        originatingSourceId: 'apple_watch_estimate',
        ingestionMethod: 'healthkit',
        provenanceComplete: true,
      });
      expect(result.measurementConfidence).toBe('moderate_confidence');
      expect(result.measurementConfidence).not.toBe('clinical_grade');
    });

    test.each(['coros_research', 'whoop_research'])('%s remains Research Only', id => {
      const result = evaluateVo2MaxEligibility(input(id));
      expect(result.status).toBe('research_only');
      expect(result.measurementAccepted).toBe(false);
      expect(result.authorizedOutputs).toContain('research_record');
      expect(result.authorizedOutputs).not.toContain('canonical_value');
      expect(result.percentileEligibility.status).toBe('unavailable');
    });

    test.each([
      'unverified_healthkit', 'manual_user_entry', 'unverified_clinician_entry', 'exact_duplicate',
    ])('%s fails closed as unsupported', id => {
      const result = evaluateVo2MaxEligibility(input(id));
      expect(result.status).toBe('unsupported');
      expect(result.measurementAccepted).toBe(false);
      expect(result.percentileEligibility.status).toBe('unavailable');
    });

    test('verified clinician transcription is capped at Clinical Grade and receives no percentile', () => {
      const result = evaluateVo2MaxEligibility(input('verified_clinician_transcription'));
      expect(result.status).toBe('measurement_accepted_no_reference');
      expect(result.measurementConfidence).toBe('clinical_grade');
      expect(result.sourceProvenance.originatingSourceId).toBe('direct_cpet_maximal');
      expect(result.referenceEligibility.reference).toBeNull();
      expect(result.authorizedOutputs).not.toContain('percentile');
    });

    test('user-attached report remains provisional until verification', () => {
      const result = evaluateVo2MaxEligibility(input('provisional_user_report'));
      expect(result.status).toBe('conditionally_eligible');
      expect(result.measurementConfidence).toBe('low_confidence');
      expect(result.percentileEligibility.status).toBe('unavailable');
    });
  });

  describe('validation failures and no-fallback policy', () => {
    test('missing source and timestamp remain insufficient rather than inferred', () => {
      const missingSource = evaluateVo2MaxEligibility(input('missing_source'));
      const missingTimestamp = evaluateVo2MaxEligibility(input('missing_timestamp'));
      expect(missingSource.status).toBe('insufficient_data');
      expect(missingSource.reasonCodes).toContain('missing_source');
      expect(missingTimestamp.status).toBe('insufficient_data');
      expect(missingTimestamp.reasonCodes).toContain('missing_timestamp');
      expect(missingSource.sourceProvenance.sourceId).toBeNull();
    });

    test.each([
      [Number.NaN, 'non_finite_value'],
      [Number.POSITIVE_INFINITY, 'non_finite_value'],
      [0, 'non_positive_value'],
      [-1, 'non_positive_value'],
    ] as const)('rejects impossible numeric value %s', (value, reasonCode) => {
      const result = evaluateVo2MaxEligibility(alter(input('valid_friend_direct_cpet'), {
        recordId: `numeric-${String(value)}`,
        value,
      }));
      expect(result.status).toBe('invalid');
      expect(result.reasonCodes).toContain(reasonCode);
      expect(result.authorizedOutputs).not.toContain('canonical_value');
    });

    test('rejects unsupported units and preserves the original audit value and unit', () => {
      const result = evaluateVo2MaxEligibility(input('unsupported_unit'));
      expect(result.status).toBe('invalid');
      expect(result.reasonCodes).toContain('unsupported_unit');
      expect(result.audit.originalValue).toBe(42.36);
      expect(result.audit.originalUnit).toBe('MET');
      expect(result.audit.canonicalValue).toBeNull();
    });

    test('normalizes an explicitly supported litre unit without overwriting raw provenance', () => {
      const result = evaluateVo2MaxEligibility(alter(input('valid_friend_direct_cpet'), {
        recordId: 'supported-litre-unit', value: 0.04236, unit: 'L/kg/min',
      }));
      expect(result.status).toBe('eligible');
      expect(result.canonicalMeasurement).toMatchObject({
        originalValue: 0.04236,
        originalUnit: 'L/kg/min',
        canonicalValue: 42.4,
        canonicalUnit: 'mL O2·kg^-1·min^-1',
      });
    });

    test.each([
      ['age_outside_reference', 'age_outside_reference_range'],
      ['sex_mismatch', 'sex_not_supported_by_reference'],
      ['region_mismatch', 'region_not_supported_by_reference'],
      ['modality_mismatch', 'modality_source_mismatch'],
    ] as const)('%s receives no percentile and reports %s', (id, code) => {
      const result = evaluateVo2MaxEligibility(input(id));
      expect(result.percentileEligibility.status).toBe('unavailable');
      expect(result.authorizedOutputs).not.toContain('percentile');
      expect(result.reasonCodes).toContain(code);
    });

    test('does not use a global, nearest-region, sex, modality, wearable, or age fallback', () => {
      expect(VO2MAX_PERCENTILE_POLICY).toMatchObject({
        permitsGlobalFallback: false,
        permitsNearestRegionFallback: false,
        permitsSexFallback: false,
        permitsModalityFallback: false,
        permitsWearableToCpetFallback: false,
        permitsAgeExtrapolation: false,
      });
      for (const id of [
        'age_outside_reference', 'sex_mismatch', 'region_mismatch',
        'modality_mismatch', 'apple_watch_estimate',
      ]) {
        expect(evaluateVo2MaxEligibility(input(id)).referenceEligibility.reference).toBeNull();
      }
    });

    test('fails closed when direct-gas, quality, or maximality provenance is absent', () => {
      const noGas = evaluateVo2MaxEligibility(alter(input('valid_friend_direct_cpet'), {
        recordId: 'missing-gas', provenance: { directGasAnalysis: false },
      }));
      const noQuality = evaluateVo2MaxEligibility(alter(input('valid_friend_direct_cpet'), {
        recordId: 'missing-quality', provenance: { qualityControlDocumented: false },
      }));
      const noMaximality = evaluateVo2MaxEligibility(alter(input('valid_friend_direct_cpet'), {
        recordId: 'missing-maximality', provenance: { maximalityEvidenceDocumented: false },
      }));
      expect(noGas.status).toBe('invalid');
      expect(noGas.reasonCodes).toContain('direct_gas_not_verified');
      expect(noQuality.status).toBe('insufficient_data');
      expect(noQuality.reasonCodes).toContain('missing_direct_cpet_quality');
      expect(noMaximality.status).toBe('insufficient_data');
      expect(noMaximality.reasonCodes).toContain('maximality_not_documented');
    });

    test('quarantines extreme verified values conditionally and withholds percentiles', () => {
      const result = evaluateVo2MaxEligibility(alter(input('valid_friend_direct_cpet'), {
        recordId: 'extreme-direct-cpet', value: 101,
      }));
      expect(result.status).toBe('conditionally_eligible');
      expect(result.reasonCodes).toContain('extreme_value_requires_review');
      expect(result.percentileEligibility.status).toBe('unavailable');
    });

    test('preserves corrections and requires probable same-event duplicates to be reconciled', () => {
      const correction = evaluateVo2MaxEligibility(alter(input('valid_friend_direct_cpet'), {
        recordId: 'source-correction',
        duplicate: {
          ...input('valid_friend_direct_cpet').duplicate,
          disposition: 'source_correction',
          supersedesRecordId: 'prior-record',
        },
      }));
      const probable = evaluateVo2MaxEligibility(alter(input('valid_friend_direct_cpet'), {
        recordId: 'probable-duplicate',
        duplicate: {
          ...input('valid_friend_direct_cpet').duplicate,
          disposition: 'probable_same_event',
          sharedEventId: 'shared-event-001',
        },
      }));
      expect(correction.status).toBe('eligible');
      expect(correction.reasonCodes).toContain('source_correction_preserved');
      expect(correction.audit.duplicate.supersedesRecordId).toBe('prior-record');
      expect(probable.status).toBe('conditionally_eligible');
      expect(probable.reasonCodes).toContain('probable_duplicate_requires_reconciliation');
      expect(probable.percentileEligibility.status).toBe('unavailable');
    });
  });

  describe('determinism, auditability, and prohibited outputs', () => {
    test('repeated evaluation is deeply deterministic', () => {
      const measurement = input('valid_friend_direct_cpet');
      expect(evaluateVo2MaxEligibility(measurement)).toEqual(evaluateVo2MaxEligibility(measurement));
    });

    test('reason-code ordering is stable and registry-defined', () => {
      const result = evaluateVo2MaxEligibility(alter(input('valid_friend_direct_cpet'), {
        recordId: 'many-reasons', value: -1, unit: 'MET', timestamps: { measuredAt: null },
        provenance: { directGasAnalysis: false, qualityControlDocumented: false },
      }));
      const positions = result.reasonCodes.map(code => VO2MAX_REASON_ORDER.indexOf(code));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
      expect(evaluateVo2MaxEligibility(alter(input('valid_friend_direct_cpet'), {
        recordId: 'many-reasons', value: -1, unit: 'MET', timestamps: { measuredAt: null },
        provenance: { directGasAnalysis: false, qualityControlDocumented: false },
      })).reasonCodes).toEqual(result.reasonCodes);
    });

    test('every result exposes all registry versions and a complete scientific audit snapshot', () => {
      const result = evaluateVo2MaxEligibility(input('valid_friend_direct_cpet'));
      expect(result.scientificVersion).toEqual(VO2MAX_SCIENTIFIC_VERSIONS);
      expect(result.audit.registryVersions).toEqual(VO2MAX_SCIENTIFIC_VERSIONS);
      expect(result.audit).toMatchObject({
        originalValue: 42.36,
        canonicalValue: 42.4,
        originalUnit: 'mL/kg/min',
        canonicalUnit: 'mL O2·kg^-1·min^-1',
        sourceId: 'direct_cpet_maximal',
        testType: 'maximal_cpet',
        endpoint: 'vo2max',
        modality: 'treadmill',
        ingestionMethod: 'clinical_import',
        provenanceComplete: true,
        confidenceDecision: 'gold_standard',
        eligibilityDecision: 'eligible',
      });
      expect(result.audit.evaluationKey).toContain('vo2max-domain/1.0.0');
      expect(result.audit.reasonCodes).toEqual(result.reasonCodes);
    });

    test('blocks every unauthorized scientific conclusion for every fixture', () => {
      for (const fixture of VO2MAX_VALIDATION_FIXTURES) {
        const result = evaluateVo2MaxEligibility(fixture.input);
        expect(result.blockedOutputs).toEqual(expect.arrayContaining(VO2MAX_ALWAYS_BLOCKED_OUTPUTS));
        expect(result.blockedOutputs).toEqual(expect.arrayContaining([
          'qualitative_fitness_category', 'mortality_threshold_label', 'mortality_prediction',
          'fitness_age', 'biological_age', 'biological_age_adjustment',
          'universal_risk_claim', 'diagnosis', 'treatment_recommendation',
          'cpet_replacement_claim', 'composite_longevity_score',
        ]));
      }
    });

    test('keeps the module isolated from production sources and Clinical PhenoAge', () => {
      const root = process.cwd();
      const moduleRoot = join(root, 'src/domain/scientificDomains/vo2max');
      const moduleTypeScript = sourceFiles(moduleRoot)
        .map(path => readFileSync(path, 'utf8'))
        .join('\n');
      expect(moduleTypeScript).not.toMatch(/from ['"][^'"]*clinicalPhenoAge|calculateClinicalPhenoAge/);
      const importTargets = [...moduleTypeScript.matchAll(/from ['"]([^'"]+)['"]/g)]
        .map(match => match[1]);
      expect(importTargets.every(target => target.startsWith('./'))).toBe(true);

      const productionFiles = sourceFiles(join(root, 'src')).filter(path =>
        !path.startsWith(moduleRoot)
        && !path.includes(`${join('src', '__tests__')}`));
      for (const path of productionFiles) {
        const content = readFileSync(path, 'utf8');
        expect(content).not.toContain('scientificDomains/vo2max');
        expect(content).not.toContain('VO2MAX_SCIENTIFIC_VERSIONS');
      }
    });
  });
});
