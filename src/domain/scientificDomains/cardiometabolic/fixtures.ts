import type { CardiometabolicMeasurementId, CardiometabolicMeasurementInput } from './contracts';
import { getCardiometabolicMeasurement } from './measurementRegistry';

const METHOD: Record<CardiometabolicMeasurementId, string | null> = {
  apolipoprotein_b: 'CMH-ASSAY-APOB-STANDARDIZED',
  ldl_c_direct: 'CMH-ASSAY-LDLC-DIRECT-VALIDATED',
  ldl_c_calculated: 'CMH-CALC-LDLC-SAMPSON',
  non_hdl_c: 'CMH-CALC-NHDLC',
  hdl_c: 'CMH-ASSAY-HDLC-STANDARDIZED',
  triglycerides: 'CMH-ASSAY-TG-ENZYMATIC',
  lipoprotein_a_molar: 'CMH-ASSAY-LPA-MOLAR-ISOFORM-INSENSITIVE',
  lipoprotein_a_mass: 'CMH-ASSAY-LPA-MASS',
  hba1c: 'CMH-ASSAY-HBA1C-IFCC-NGSP',
  fasting_plasma_glucose: 'CMH-ASSAY-GLUCOSE-HEXOKINASE',
  home_cuff_blood_pressure: null,
  office_blood_pressure: null,
  automated_office_blood_pressure: null,
  waist_circumference: null,
  waist_to_height_ratio: null,
};

const PROTOCOL: Record<CardiometabolicMeasurementId, string | null> = {
  apolipoprotein_b: null, ldl_c_direct: null, ldl_c_calculated: null, non_hdl_c: null,
  hdl_c: null, triglycerides: null, lipoprotein_a_molar: null, lipoprotein_a_mass: null,
  hba1c: null,
  fasting_plasma_glucose: 'CMH-PROT-FPG-VENOUS-FASTING',
  home_cuff_blood_pressure: 'CMH-PROT-HBPM-UPPER-ARM-SERIES',
  office_blood_pressure: 'CMH-PROT-OBP-REPEATED-OCCASIONS',
  automated_office_blood_pressure: 'CMH-PROT-AOBP-SEQUENCE',
  waist_circumference: 'CMH-PROT-WAIST-WHO-MIDPOINT',
  waist_to_height_ratio: 'CMH-PROT-WHTR-NICE-ADULT',
};

const POLICY: Partial<Record<CardiometabolicMeasurementId, [string, string, string, 'US' | 'Europe' | 'UK' | 'WHO']>> = {
  ldl_c_direct: ['CMH-IP-LDLD-001', 'CMH-REF-LIPID-ACC-2026', '2026-03-13', 'US'],
  ldl_c_calculated: ['CMH-IP-LDLC-001', 'CMH-REF-LIPID-ACC-2026', '2026-03-13', 'US'],
  triglycerides: ['CMH-IP-TG-001', 'CMH-REF-LIPID-ACC-2026', '2026-03-13', 'US'],
  lipoprotein_a_molar: ['CMH-IP-LPA-NMOL-001', 'CMH-REF-LPA-NLA-2024', '2024', 'US'],
  lipoprotein_a_mass: ['CMH-IP-LPA-MASS-001', 'CMH-REF-LPA-NLA-2024', '2024', 'US'],
  hba1c: ['CMH-IP-HBA1C-001', 'CMH-REF-GLY-ADA-2026', '2026', 'US'],
  fasting_plasma_glucose: ['CMH-IP-FPG-001', 'CMH-REF-GLY-ADA-2026', '2026', 'US'],
  home_cuff_blood_pressure: ['CMH-IP-HBPM-001', 'CMH-REF-BP-NICE-2026', '2026-02-26', 'UK'],
  office_blood_pressure: ['CMH-IP-OBP-001', 'CMH-REF-BP-AHA-2025', '2025-08-14', 'US'],
  waist_to_height_ratio: ['CMH-IP-WHTR-001', 'CMH-REF-WHTR-NICE-2026', '2026-01-08', 'UK'],
};

const VALUE: Record<CardiometabolicMeasurementId, [number, string]> = {
  apolipoprotein_b: [0.9, 'g/L'], ldl_c_direct: [3.2, 'mmol/L'], ldl_c_calculated: [3.1, 'mmol/L'],
  non_hdl_c: [3.7, 'mmol/L'], hdl_c: [1.4, 'mmol/L'], triglycerides: [1.4, 'mmol/L'],
  lipoprotein_a_molar: [80, 'nmol/L'], lipoprotein_a_mass: [35, 'mg/dL'], hba1c: [42, 'mmol/mol'],
  fasting_plasma_glucose: [5.8, 'mmol/L'], home_cuff_blood_pressure: [0, 'mmHg'],
  office_blood_pressure: [0, 'mmHg'], automated_office_blood_pressure: [0, 'mmHg'],
  waist_circumference: [88, 'cm'], waist_to_height_ratio: [0.52, 'ratio'],
};

function bpReadings(id: CardiometabolicMeasurementId) {
  const count = id === 'home_cuff_blood_pressure' ? 14 : id === 'office_blood_pressure' ? 4 : 3;
  return Array.from({ length: count }, (_, index) => ({
    readingId: `${id}-reading-${index + 1}`,
    systolic: 128,
    diastolic: 78,
    timestamp: new Date(Date.UTC(2026, 0, 10 + Math.floor(index / 2), 7 + index % 2)).toISOString(),
    occasionId: `${id}-occasion-${Math.floor(index / 2) + 1}`,
    sequence: index % 2 + 1,
  }));
}

export function createValidCardiometabolicFixture(measurementId: CardiometabolicMeasurementId, suffix = 'fixture'): CardiometabolicMeasurementInput {
  const definition = getCardiometabolicMeasurement(measurementId)!;
  const isBp = definition.family === 'blood_pressure';
  const isAnth = definition.family === 'central_adiposity';
  const policy = POLICY[measurementId] ?? null;
  const [value, unit] = VALUE[measurementId];
  const readings = isBp ? bpReadings(measurementId) : [];
  return {
    recordId: `cmh-${measurementId}-${suffix}`,
    measurementId,
    measurementStandardId: definition.standardId,
    numeric: isBp ? null : { value, unit },
    bloodPressure: isBp ? {
      readings,
      summarySystolic: 128,
      summaryDiastolic: 78,
      readingCount: readings.length,
      occasionCount: measurementId === 'home_cuff_blood_pressure' ? 7 : measurementId === 'office_blood_pressure' ? 2 : 2,
      seriesComplete: true,
    } : null,
    timestamps: { measuredAt: '2026-01-15T08:00:00.000Z', ingestedAt: '2026-01-15T09:00:00.000Z' },
    sourceId: isBp ? measurementId === 'home_cuff_blood_pressure' ? 'CMH-SRC-HOME-BP' : 'CMH-SRC-CLIN-BP' : isAnth ? 'CMH-SRC-CLIN-ANTH' : 'CMH-SRC-CLAB',
    ingestionMethod: 'verified_source_import',
    provider: { providerId: 'provider-verified-1', laboratoryId: isBp || isAnth ? null : 'laboratory-accredited-1', deviceId: isBp ? 'validated-upper-arm-device-1' : null },
    provenance: { sourceRecordId: `source-${suffix}`, sourceDocumentVerified: true, originSourceId: null, completenessDeclared: true },
    verificationStatus: 'verified_original',
    assay: {
      methodId: METHOD[measurementId], methodVersion: measurementId === 'ldl_c_calculated' ? '2020' : METHOD[measurementId] ? '1.0.0' : null,
      traceabilityDocumented: METHOD[measurementId] !== null, ngspCertified: measurementId === 'hba1c',
      isoformSensitivity: measurementId === 'lipoprotein_a_molar' ? 'insensitive' : null,
      specimen: measurementId === 'hba1c' ? 'whole_blood' : measurementId === 'fasting_plasma_glucose' ? 'venous_plasma' : definition.family === 'atherogenic_lipids' ? 'serum_or_plasma' : null,
      calculationValid: measurementId === 'ldl_c_calculated' ? true : null,
    },
    protocol: {
      protocolId: PROTOCOL[measurementId], protocolVersion: PROTOCOL[measurementId] ? '1.0.0' : null,
      adherence: PROTOCOL[measurementId] ? 'complete' : null,
      validatedDevice: isBp ? true : null, upperArmCuff: isBp ? true : null,
      cuffSize: isBp ? 'validated_adult_medium' : null, arm: isBp ? 'left' : null,
      bodyPosition: isBp || isAnth ? 'seated_or_standard_standing_as_protocol' : null,
      restMinutes: isBp ? 5 : null, talking: isBp ? 'absent' : null,
      observerPresent: measurementId === 'home_cuff_blood_pressure' ? false : isBp || isAnth ? true : null,
      waistLandmark: isAnth ? 'who_midpoint_last_rib_iliac_crest' : null,
    },
    context: {
      fastingStatus: definition.family === 'atherogenic_lipids' || measurementId === 'fasting_plasma_glucose' ? 'fasting' : null,
      fastingHours: measurementId === 'fasting_plasma_glucose' ? 10 : null,
      pregnancy: definition.family === 'glycemic_status' || definition.family === 'atherogenic_lipids' || isAnth ? 'absent' : null,
      acuteIllness: definition.family === 'atherogenic_lipids' || definition.family === 'glycemic_status' ? 'absent' : null,
      medicationContextKnown: definition.family !== 'central_adiposity', alcoholContextKnown: measurementId === 'triglycerides',
      anemia: measurementId === 'hba1c' ? 'absent' : null, hemoglobinopathy: measurementId === 'hba1c' ? 'absent' : null,
      alteredRedCellTurnover: measurementId === 'hba1c' ? 'absent' : null, recentTransfusion: measurementId === 'hba1c' ? 'absent' : null,
      ckd: definition.family === 'glycemic_status' ? 'absent' : null,
      cardiovascularDiseaseHistoryKnown: Boolean(policy), diabetesHistoryKnown: definition.family === 'glycemic_status' ? true : null,
      symptomsPresent: isBp ? false : null, recentExerciseKnown: isBp ? true : null,
      caffeineKnown: isBp ? true : null, nicotineKnown: isBp ? true : null,
    },
    lineage: {
      sourceAnalytes: measurementId === 'ldl_c_calculated' ? { total_cholesterol: { value: 5.1, unit: 'mmol/L' }, hdl_c: { value: 1.4, unit: 'mmol/L' }, triglycerides: { value: 1.4, unit: 'mmol/L' } }
        : measurementId === 'non_hdl_c' ? { total_cholesterol: { value: 5.1, unit: 'mmol/L' }, hdl_c: { value: 1.4, unit: 'mmol/L' } }
          : measurementId === 'waist_to_height_ratio' ? { waist_circumference: { value: 88, unit: 'cm' } } : null,
      calculationMethodId: measurementId === 'ldl_c_calculated' ? METHOD[measurementId] : measurementId === 'non_hdl_c' ? 'CMH-CALC-NHDLC' : measurementId === 'waist_to_height_ratio' ? 'CMH-CALC-WHTR-SOURCE-REPORTED' : null,
      calculationVersion: measurementId === 'ldl_c_calculated' ? '2020' : ['non_hdl_c', 'waist_to_height_ratio'].includes(measurementId) ? '1.0.0' : null,
      measuredHeightCm: measurementId === 'waist_to_height_ratio' ? 170 : null,
      heightSource: measurementId === 'waist_to_height_ratio' ? 'measured' : null,
      heightTimestamp: measurementId === 'waist_to_height_ratio' ? '2026-01-15T08:00:00.000Z' : null,
      waistRecordId: measurementId === 'waist_to_height_ratio' ? 'cmh-waist-source-1' : null,
      lineageVerified: ['ldl_c_calculated', 'non_hdl_c', 'waist_to_height_ratio'].includes(measurementId) ? true : null,
    },
    population: {
      ageYears: 50, sourceRecordedSex: 'female', countryCode: policy?.[3] === 'UK' ? 'GB' : 'US',
      guidelineRegion: policy?.[3] ?? null, adultEligible: true,
      nicePopulationEligible: measurementId === 'waist_to_height_ratio' ? true : null,
    },
    requestedInterpretation: policy ? { policyId: policy[0], referenceId: policy[1], referenceVersion: policy[2] } : null,
    duplicate: { disposition: 'unique', correctsRecordId: null },
  };
}

export const CARDIOMETABOLIC_REQUIRED_FIXTURE_IDS = Object.freeze([
  'deterministic_repeated_evaluation', 'stable_reason_ordering', 'unknown_identity', 'missing_value',
  'non_finite_value', 'unsupported_unit', 'missing_timestamp', 'incomplete_provenance',
  'unverified_manual_entry', 'historical_correction_retained', 'no_silent_fallback',
  'raw_retained_when_interpretation_fails', 'parent_score_blocked', 'existing_domains_unchanged',
  'apob_valid_raw_only', 'apob_category_blocked', 'apob_target_blocked', 'apob_assay_trend_mismatch',
  'ldl_direct_exact_policy', 'ldl_calculated_authorized_method', 'ldl_identity_separation',
  'ldl_unsupported_method', 'ldl_missing_source_analyte', 'ldl_invalid_triglyceride_context',
  'ldl_190_review_only', 'familial_hypercholesterolemia_blocked',
  'non_hdl_valid_lineage', 'non_hdl_missing_lineage', 'non_hdl_raw_only',
  'hdl_marker_only', 'hdl_not_universally_protective', 'higher_is_better_blocked',
  'triglycerides_fasting', 'triglycerides_nonfasting', 'triglycerides_unknown_fasting',
  'triglycerides_1000_review', 'pancreatitis_blocked',
  'lpa_molar_exact', 'lpa_mass_exact', 'lpa_conversion_blocked', 'lpa_cross_unit_trend_blocked',
  'lpa_inherited_disease_blocked', 'hba1c_traceable', 'hba1c_missing_certification',
  'hba1c_anemia', 'hba1c_red_cell_turnover', 'hba1c_pregnancy', 'hba1c_no_diagnosis',
  'hba1c_repeat_confirmation', 'fpg_valid', 'fpg_unknown_fasting', 'random_glucose_rejected',
  'fpg_glycolysis_missing', 'fpg_no_diagnosis', 'fpg_no_urgent_threshold',
  'home_bp_valid_series', 'home_bp_single_raw', 'home_bp_incomplete_series', 'home_bp_validated_cuff',
  'cuffless_unsupported', 'bp_180_complete', 'bp_180_symptoms_missing', 'hypertension_blocked',
  'office_bp_valid_multi_occasion', 'office_bp_single_raw', 'home_threshold_not_office',
  'office_medication_context', 'aobp_raw_only', 'aobp_no_office_threshold', 'aobp_trend',
  'waist_who_raw', 'waist_landmark_mismatch', 'waist_pregnancy_missing', 'obesity_blocked',
  'waist_landmark_trend_mismatch', 'whtr_complete_nice', 'whtr_self_reported_height',
  'whtr_timestamp_mismatch', 'whtr_pregnancy', 'whtr_pediatric', 'whtr_no_global_fallback',
  'safety_distinct_from_diagnosis', 'no_emergency_instruction', 'safety_version',
  'safety_insufficient_context', 'trend_same_method', 'trend_ldl_identity_mismatch',
  'trend_triglyceride_fasting_mismatch', 'trend_lpa_identity_mismatch', 'trend_bp_setting_mismatch',
  'trend_waist_landmark_mismatch', 'trend_missing_metadata',
]);
