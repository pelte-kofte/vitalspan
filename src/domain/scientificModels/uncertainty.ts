export type ScientificUncertaintyId =
  | 'missing_required_input'
  | 'single_laboratory_visit'
  | 'sparse_wearable_history'
  | 'conflicting_model_evidence'
  | 'no_longitudinal_data'
  | 'future_integration_unavailable'
  | 'population_mismatch'
  | 'source_or_unit_uncertainty';

export type ScientificUncertaintyAction =
  | 'exclude_affected_model'
  | 'allow_cross_sectional_eligibility_only'
  | 'retain_context_without_age_influence'
  | 'preserve_disagreement_without_combining'
  | 'defer_until_supported';

export interface ScientificUncertaintyRule {
  id: ScientificUncertaintyId;
  trigger: string;
  action: ScientificUncertaintyAction;
  policy: string;
}

export const SCIENTIFIC_UNCERTAINTY_POLICY = [
  {
    id: 'missing_required_input',
    trigger: 'Any required model input is absent, invalid, stale, or unit-incompatible.',
    action: 'exclude_affected_model',
    policy: 'Do not impute, backfill, substitute, or silently reduce the published input set.',
  },
  {
    id: 'single_laboratory_visit',
    trigger: 'Only one complete laboratory visit is available.',
    action: 'allow_cross_sectional_eligibility_only',
    policy: 'A single visit may satisfy a cross-sectional model policy but never supports change, pace, persistence, or treatment-effect claims.',
  },
  {
    id: 'sparse_wearable_history',
    trigger: 'Wearable observations are sparse, irregular, device-inconsistent, or lack source metadata.',
    action: 'retain_context_without_age_influence',
    policy: 'Keep source-attributed observations as context and exclude them from biological-age influence.',
  },
  {
    id: 'conflicting_model_evidence',
    trigger: 'Eligible models or evidence sources disagree.',
    action: 'preserve_disagreement_without_combining',
    policy: 'Retain model-specific provenance and limitations. Do not average, rank, rescale, or select a winner automatically.',
  },
  {
    id: 'no_longitudinal_data',
    trigger: 'No repeated observations exist for a longitudinal or pace construct.',
    action: 'exclude_affected_model',
    policy: 'Unknown remains unknown. A cross-sectional observation cannot be converted into a longitudinal trend.',
  },
  {
    id: 'future_integration_unavailable',
    trigger: 'A required assay, reference dataset, licensed algorithm, or validated integration is unavailable.',
    action: 'defer_until_supported',
    policy: 'Keep the registry entry research-only or deferred and produce no substitute result.',
  },
  {
    id: 'population_mismatch',
    trigger: 'The user falls outside the model validation population or required stratification is unavailable.',
    action: 'exclude_affected_model',
    policy: 'Do not extrapolate beyond supported age, population, specimen, protocol, or clinical setting.',
  },
  {
    id: 'source_or_unit_uncertainty',
    trigger: 'Measurement provenance, assay method, collection time, or unit conversion is not auditable.',
    action: 'exclude_affected_model',
    policy: 'Source attribution and unit compatibility are eligibility requirements, not optional metadata.',
  },
] as const satisfies readonly ScientificUncertaintyRule[];
