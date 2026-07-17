import type { ScientificInputPolicy } from './models';

const LAB = ['laboratory'] as const;

export const SCIENTIFIC_INPUT_POLICIES = [
  {
    id: 'clinical_phenoage_complete_visit',
    requiredInputs: [
      { id: 'chronological_age', label: 'Chronological age at specimen collection', acceptedSources: ['chronological_record'], unitRequired: true, acceptedUnits: ['years'] },
      { id: 'albumin', label: 'Albumin', acceptedSources: LAB, unitRequired: true, acceptedUnits: ['g/L'] },
      { id: 'creatinine', label: 'Creatinine', acceptedSources: LAB, unitRequired: true, acceptedUnits: ['μmol/L'] },
      { id: 'glucose', label: 'Serum glucose', acceptedSources: LAB, unitRequired: true, acceptedUnits: ['mmol/L'] },
      { id: 'crp', label: 'C-reactive protein', acceptedSources: LAB, unitRequired: true, acceptedUnits: ['mg/dL'] },
      { id: 'lymphocyte_percent', label: 'Lymphocyte percentage', acceptedSources: LAB, unitRequired: true, acceptedUnits: ['%'] },
      { id: 'mean_cell_volume', label: 'Mean cell volume', acceptedSources: LAB, unitRequired: true, acceptedUnits: ['fL'] },
      { id: 'red_cell_distribution_width', label: 'Red cell distribution width', acceptedSources: LAB, unitRequired: true, acceptedUnits: ['%'] },
      { id: 'alkaline_phosphatase', label: 'Alkaline phosphatase', acceptedSources: LAB, unitRequired: true, acceptedUnits: ['U/L'] },
      { id: 'white_blood_cell_count', label: 'White blood cell count', acceptedSources: LAB, unitRequired: true, acceptedUnits: ['10^3/μL'] },
    ],
    optionalInputs: [],
    minimumEvidence: 'One complete, source-attributed visit containing chronological age and all nine published biomarkers in compatible units.',
    minimumHistory: 'single_complete_timepoint',
    confidenceRequirement: 'very_high',
    failureConditions: [
      'missing_required_input',
      'incompatible_unit',
      'invalid_or_non_finite_value',
      'invalid_timestamp',
      'stale_evidence',
      'mixed_collection_window',
      'unsupported_population',
    ],
    fallbackBehavior: 'exclude_model',
    missingValuePolicy: 'never_impute',
    notes: [
      'The published model is cross-sectional; one complete visit does not establish a longitudinal trend.',
      'The registry defines eligibility only and contains no coefficients or calculation path.',
    ],
  },
  {
    id: 'validated_kdm_calibration',
    requiredInputs: [
      { id: 'chronological_age', label: 'Chronological age at measurement', acceptedSources: ['chronological_record'], unitRequired: true, acceptedUnits: ['years'] },
      { id: 'reference_calibration', label: 'Versioned reference-population calibration', acceptedSources: ['validated_reference_dataset'], unitRequired: false, acceptedUnits: null },
      { id: 'calibration_panel', label: 'Complete biomarker panel required by that calibration', acceptedSources: ['laboratory', 'clinical_measurement'], unitRequired: true, acceptedUnits: ['calibration-defined'] },
    ],
    optionalInputs: [
      { id: 'stratification_variables', label: 'Calibration-defined population stratifiers', acceptedSources: ['chronological_record', 'clinical_measurement'], unitRequired: false, acceptedUnits: null },
    ],
    minimumEvidence: 'A published, versioned calibration and a complete compatible biomarker panel collected under its measurement assumptions.',
    minimumHistory: 'calibration_defined',
    confidenceRequirement: 'very_high',
    failureConditions: [
      'missing_required_input',
      'missing_reference_calibration',
      'incompatible_unit',
      'invalid_or_non_finite_value',
      'invalid_timestamp',
      'mixed_collection_window',
      'unsupported_population',
    ],
    fallbackBehavior: 'exclude_model',
    missingValuePolicy: 'never_impute',
    notes: [
      'KDM is a method, not a universal fixed biomarker equation; calibration provenance is a required input.',
      'Biomarker substitution creates a different model and requires separate validation and registry review.',
    ],
  },
  {
    id: 'quality_controlled_vo2max',
    requiredInputs: [
      { id: 'chronological_age', label: 'Chronological age at assessment', acceptedSources: ['chronological_record'], unitRequired: true, acceptedUnits: ['years'] },
      { id: 'measured_vo2max', label: 'Directly measured maximal oxygen consumption', acceptedSources: ['cardiopulmonary_exercise_test'], unitRequired: true, acceptedUnits: ['mL/kg/min'] },
      { id: 'test_protocol', label: 'Cardiopulmonary exercise-test protocol and modality', acceptedSources: ['cardiopulmonary_exercise_test'], unitRequired: false, acceptedUnits: null },
      { id: 'reference_stratifiers', label: 'Reference-standard stratification variables', acceptedSources: ['chronological_record', 'clinical_measurement'], unitRequired: false, acceptedUnits: null },
      { id: 'quality_control', label: 'Documented maximal-test quality criteria', acceptedSources: ['cardiopulmonary_exercise_test'], unitRequired: false, acceptedUnits: null },
    ],
    optionalInputs: [
      { id: 'body_mass', label: 'Measured body mass used for mass-normalized VO2max', acceptedSources: ['clinical_measurement'], unitRequired: true, acceptedUnits: ['kg'] },
    ],
    minimumEvidence: 'One directly measured, quality-controlled maximal CPET compatible with a versioned normative reference population.',
    minimumHistory: 'single_quality_controlled_assessment',
    confidenceRequirement: 'high',
    failureConditions: [
      'missing_required_input',
      'missing_reference_calibration',
      'incompatible_unit',
      'invalid_or_non_finite_value',
      'invalid_timestamp',
      'unsupported_population',
      'unverified_assay_or_protocol',
      'failed_quality_control',
    ],
    fallbackBehavior: 'retain_as_context_only',
    missingValuePolicy: 'never_impute',
    notes: [
      'Normative standing is not biological age and cannot be converted into years without a separately validated model.',
      'Wearable-estimated VO2max is not interchangeable with directly measured CPET evidence under this policy.',
    ],
  },
] as const satisfies readonly ScientificInputPolicy[];
