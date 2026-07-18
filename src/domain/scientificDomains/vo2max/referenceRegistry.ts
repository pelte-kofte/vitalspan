import type {
  Vo2MaxConfidence,
  Vo2MaxEndpoint,
  Vo2MaxHealthPopulation,
  Vo2MaxMeasurementNature,
  Vo2MaxMeasurementInput,
  Vo2MaxModality,
  Vo2MaxReasonCode,
  Vo2MaxReferenceDecision,
  Vo2MaxReferenceIdentity,
} from './contracts';
import { VO2MAX_SCIENTIFIC_VERSIONS } from './versions';

export interface Vo2MaxReferenceDefinition {
  id: string;
  version: string;
  status: 'active' | 'research_only' | 'retired';
  title: string;
  publication: string;
  citationUrl: string;
  countryCodes: readonly string[];
  ageMinimum: number;
  ageMaximum: number;
  sourceRecordedSexes: readonly ('female' | 'male')[];
  modalities: readonly Extract<Vo2MaxModality, 'treadmill' | 'cycle'>[];
  endpoints: readonly Extract<Vo2MaxEndpoint, 'vo2max'>[];
  healthPopulations: readonly Extract<Vo2MaxHealthPopulation, 'apparently_healthy'>[];
  measurementNatures: readonly Extract<Vo2MaxMeasurementNature, 'direct_gas'>[];
  measurementConfidences: readonly Extract<Vo2MaxConfidence, 'gold_standard'>[];
  percentilePublicationAvailable: true;
  fallbackPermitted: false;
}

export const VO2MAX_REFERENCE_REGISTRY = Object.freeze({
  version: VO2MAX_SCIENTIFIC_VERSIONS.referenceRegistry,
  references: [
    {
      id: 'friend_2022_us_adults',
      version: 'friend-2022-us-adults/1.0.0',
      status: 'active',
      title: 'Updated 2022 FRIEND U.S. adult direct-CPET reference standards',
      publication: 'Kaminsky et al., Mayo Clinic Proceedings, 2022',
      citationUrl: 'https://pubmed.ncbi.nlm.nih.gov/34809986/',
      countryCodes: ['US'],
      ageMinimum: 20,
      ageMaximum: 89,
      sourceRecordedSexes: ['female', 'male'],
      modalities: ['treadmill', 'cycle'],
      endpoints: ['vo2max'],
      healthPopulations: ['apparently_healthy'],
      measurementNatures: ['direct_gas'],
      measurementConfidences: ['gold_standard'],
      percentilePublicationAvailable: true,
      fallbackPermitted: false,
    },
  ] as const satisfies readonly Vo2MaxReferenceDefinition[],
});

function ageBand(age: number): string {
  const lower = Math.floor(age / 10) * 10;
  return `${lower}-${lower + 9}`;
}

function identity(
  reference: Vo2MaxReferenceDefinition,
  input: Vo2MaxMeasurementInput,
  age: number,
): Vo2MaxReferenceIdentity {
  return {
    id: reference.id,
    version: reference.version,
    publication: reference.publication,
    population: 'Apparently healthy United States adults with direct maximal CPET',
    ageBand: ageBand(age),
    sourceRecordedSex: input.population.sourceRecordedSex as 'female' | 'male',
    countryCode: 'US',
    modality: input.modality as 'treadmill' | 'cycle',
    endpoint: 'vo2max',
  };
}

export function evaluateVo2MaxReferenceEligibility(
  input: Vo2MaxMeasurementInput,
  ageAtMeasurement: number | null,
  confidence: Vo2MaxConfidence,
  measurementAccepted: boolean,
  conditionalMeasurement: boolean,
): Vo2MaxReferenceDecision {
  if (!measurementAccepted || conditionalMeasurement) {
    return { status: 'not_evaluated', reference: null, reasonCodes: ['percentile_unavailable'] };
  }

  const requested = input.requestedReference;
  const candidates = VO2MAX_REFERENCE_REGISTRY.references.filter(reference => {
    if (reference.status !== 'active') return false;
    if (requested.id !== null && requested.id !== reference.id) return false;
    if (requested.version !== null && requested.version !== reference.version) return false;
    return true;
  });
  if (candidates.length === 0) {
    return {
      status: 'ineligible', reference: null,
      reasonCodes: ['reference_version_unavailable', 'no_authorized_reference', 'percentile_unavailable'],
    };
  }

  const reference: Vo2MaxReferenceDefinition = candidates[0];
  const reasons: Vo2MaxReasonCode[] = [];
  if (ageAtMeasurement === null) reasons.push('missing_birth_date_for_reference');
  else if (ageAtMeasurement < reference.ageMinimum || ageAtMeasurement > reference.ageMaximum) {
    reasons.push('age_outside_reference_range');
  }
  if (input.population.sourceRecordedSex === 'not_recorded'
    || input.population.sourceRecordedSex === 'unknown') {
    reasons.push('missing_source_recorded_sex_for_reference');
  } else if (!reference.sourceRecordedSexes.includes(
    input.population.sourceRecordedSex as 'female' | 'male',
  )) reasons.push('sex_not_supported_by_reference');
  if (input.population.countryCode === null) reasons.push('missing_region_for_reference');
  else if (!reference.countryCodes.includes(input.population.countryCode.toUpperCase())) {
    reasons.push('region_not_supported_by_reference');
  }
  if (!reference.healthPopulations.includes(
    input.population.healthPopulation as 'apparently_healthy',
  )) reasons.push('health_population_not_supported_by_reference');
  if (!reference.measurementNatures.includes(input.measurementNature as 'direct_gas')
    || !reference.measurementConfidences.includes(confidence as 'gold_standard')) {
    reasons.push('measurement_class_not_supported_by_reference');
    if (input.measurementNature !== 'direct_gas') reasons.push('estimate_not_reference_eligible');
  }
  if (!reference.endpoints.includes(input.endpoint as 'vo2max')) {
    reasons.push('endpoint_not_supported_by_reference');
  }
  if (input.modality === null
    || !reference.modalities.includes(input.modality as 'treadmill' | 'cycle')) {
    reasons.push('modality_not_supported_by_reference');
  }

  if (reasons.length > 0 || ageAtMeasurement === null) {
    return {
      status: 'ineligible', reference: null,
      reasonCodes: [...reasons, 'no_authorized_reference', 'percentile_unavailable'],
    };
  }
  return {
    status: 'eligible',
    reference: identity(reference, input, ageAtMeasurement),
    reasonCodes: ['reference_exact_match', 'percentile_authorized'],
  };
}
