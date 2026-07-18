import type { ComponentOverlapMetadata } from './contracts';

export const CLINICAL_PHENOAGE_OVERLAP_PROFILE = {
  inputIds: [
    'chronological_age',
    'albumin',
    'creatinine',
    'glucose',
    'crp',
    'lymphocyte_percent',
    'mean_cell_volume',
    'red_cell_distribution_width',
    'alkaline_phosphatase',
    'white_blood_cell_count',
  ],
  correlationGroups: ['inflammation', 'metabolic', 'hematologic', 'renal'],
  trainingPopulationIds: ['nhanes_iii_us_adults'],
  outcomeConstructIds: ['mortality_calibrated_phenotypic_age'],
  completeness: 'complete',
  notes: [
    'CRP and white blood cell count carry inflammation overlap.',
    'Glucose carries metabolic overlap.',
    'Albumin, creatinine, and hematology measures can overlap future clinical composites.',
    'Overlap metadata is governance information and never a coefficient or weight.',
  ],
} as const satisfies ComponentOverlapMetadata;

export const UNCONFIGURED_KDM_OVERLAP_PROFILE = {
  inputIds: [],
  correlationGroups: ['unresolved'],
  trainingPopulationIds: [],
  outcomeConstructIds: ['calibration_defined_biological_age'],
  completeness: 'unknown',
  notes: [
    'KDM overlap cannot be assessed until a named calibration, biomarker panel, and training population are registered.',
  ],
} as const satisfies ComponentOverlapMetadata;

export const VO2MAX_NORMATIVE_OVERLAP_PROFILE = {
  inputIds: ['direct_measured_vo2max', 'chronological_age', 'reference_stratifiers'],
  correlationGroups: ['cardiorespiratory'],
  trainingPopulationIds: ['friend_2015_reference_population'],
  outcomeConstructIds: ['cardiorespiratory_fitness_normative_position'],
  completeness: 'complete',
  notes: ['Normative position remains distinct from age in years and cannot be silently converted.'],
} as const satisfies ComponentOverlapMetadata;

export const DUNEDINPACE_OVERLAP_PROFILE = {
  inputIds: ['whole_blood_dna_methylation', 'dunedinpace_cpg_features'],
  correlationGroups: ['epigenetic'],
  trainingPopulationIds: ['dunedin_1972_1973_birth_cohort'],
  outcomeConstructIds: ['longitudinal_pace_of_aging'],
  completeness: 'complete',
  notes: ['The pace construct is not compatible with an age-in-years output by unit conversion.'],
} as const satisfies ComponentOverlapMetadata;

export const INFLAMMATION_CONTEXT_OVERLAP_PROFILE = {
  inputIds: ['crp', 'white_blood_cell_count'],
  correlationGroups: ['inflammation', 'hematologic'],
  trainingPopulationIds: [],
  outcomeConstructIds: ['inflammation_context'],
  completeness: 'complete',
  notes: ['CRP and WBC overlap Clinical PhenoAge and require explicit double-counting review.'],
} as const satisfies ComponentOverlapMetadata;
