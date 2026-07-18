import type { Vo2MaxProhibitedOutput } from './contracts';
import { VO2MAX_SCIENTIFIC_VERSIONS } from './versions';

export const VO2MAX_PERCENTILE_POLICY = Object.freeze({
  version: VO2MAX_SCIENTIFIC_VERSIONS.percentileInterpretationPolicy,
  output: 'source_bound_percentile_authorization_only' as const,
  lookupImplemented: false,
  requiresExactReferenceMatch: true,
  permitsGlobalFallback: false,
  permitsNearestRegionFallback: false,
  permitsSexFallback: false,
  permitsModalityFallback: false,
  permitsWearableToCpetFallback: false,
  permitsAgeExtrapolation: false,
  prohibitedOutputs: [
    'qualitative_fitness_category',
    'mortality_threshold_label',
    'mortality_prediction',
    'fitness_age',
    'biological_age',
    'biological_age_adjustment',
    'universal_risk_claim',
    'diagnosis',
    'treatment_recommendation',
    'cpet_replacement_claim',
    'composite_longevity_score',
  ] as const satisfies readonly Vo2MaxProhibitedOutput[],
});

