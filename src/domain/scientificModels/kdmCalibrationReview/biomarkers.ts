import type { KdmBiomarkerDefinition } from './contracts';

type BiomarkerOverrides = Partial<Omit<KdmBiomarkerDefinition, 'id' | 'name' | 'units'>>;

function biomarker(
  id: string,
  name: string,
  units: readonly string[],
  overrides: BiomarkerOverrides = {},
): KdmBiomarkerDefinition {
  return {
    id,
    name,
    units,
    accessibility: 'routine',
    internationalAvailability: 'Generally available through clinical laboratories.',
    measurementVariability: 'moderate',
    acuteIllnessSensitivity: 'moderate',
    assayDependence: 'moderate',
    standardization: 'moderate',
    costImplication: 'low',
    clinicalPhenoAgeOverlap: 'none',
    ...overrides,
  };
}

export const KDM_BIOMARKERS = {
  chronologicalAge: biomarker('chronological_age', 'Chronological age', ['years'], {
    accessibility: 'routine', internationalAvailability: 'Universal when date of birth and collection time are known.',
    measurementVariability: 'low', acuteIllnessSensitivity: 'low', assayDependence: 'low',
    standardization: 'strong', costImplication: 'low', clinicalPhenoAgeOverlap: 'exact',
  }),
  albumin: biomarker('albumin', 'Serum albumin', ['g/dL'], {
    acuteIllnessSensitivity: 'high', clinicalPhenoAgeOverlap: 'exact',
  }),
  alkalinePhosphatase: biomarker('alkaline_phosphatase', 'Serum alkaline phosphatase', ['U/L'], {
    acuteIllnessSensitivity: 'high', assayDependence: 'moderate', clinicalPhenoAgeOverlap: 'exact',
  }),
  bloodUreaNitrogen: biomarker('blood_urea_nitrogen', 'Blood urea nitrogen', ['mg/dL'], {
    internationalAvailability: 'Routine, but many countries report urea rather than urea nitrogen.',
    acuteIllnessSensitivity: 'high', assayDependence: 'low', standardization: 'strong',
  }),
  creatinine: biomarker('creatinine', 'Serum creatinine', ['mg/dL'], {
    acuteIllnessSensitivity: 'high', assayDependence: 'moderate', clinicalPhenoAgeOverlap: 'exact',
  }),
  crp: biomarker('c_reactive_protein', 'C-reactive protein', ['mg/dL'], {
    acuteIllnessSensitivity: 'high', assayDependence: 'high', standardization: 'moderate',
    clinicalPhenoAgeOverlap: 'exact',
  }),
  cmvOpticalDensity: biomarker('cmv_optical_density', 'Cytomegalovirus antibody optical density', ['assay-specific optical density'], {
    accessibility: 'specialty',
    internationalAvailability: 'CMV serology is available, but the historical optical-density measure is not a routine harmonized result.',
    measurementVariability: 'high', acuteIllnessSensitivity: 'variable', assayDependence: 'high',
    standardization: 'limited', costImplication: 'moderate',
  }),
  hba1c: biomarker('hba1c', 'Glycated hemoglobin', ['%'], {
    acuteIllnessSensitivity: 'low', assayDependence: 'moderate', standardization: 'strong',
    clinicalPhenoAgeOverlap: 'related',
  }),
  totalCholesterol: biomarker('total_cholesterol', 'Total cholesterol', ['mg/dL'], {
    acuteIllnessSensitivity: 'moderate', assayDependence: 'low', standardization: 'strong',
  }),
  systolicBloodPressure: biomarker('systolic_blood_pressure', 'Systolic blood pressure', ['mmHg'], {
    internationalAvailability: 'Routine, but protocol, posture, cuff, rest period, and repeated readings matter.',
    measurementVariability: 'high', acuteIllnessSensitivity: 'high', assayDependence: 'variable',
    standardization: 'moderate',
  }),
  fev1: biomarker('fev1', 'Forced expiratory volume in one second', ['mL', 'L'], {
    accessibility: 'specialty',
    internationalAvailability: 'Spirometry is widely available but is not a routine blood-panel measurement.',
    measurementVariability: 'high', acuteIllnessSensitivity: 'high', assayDependence: 'high',
    standardization: 'moderate', costImplication: 'moderate',
  }),
  glucose: biomarker('glucose', 'Serum glucose', ['mmol/L'], {
    acuteIllnessSensitivity: 'high', assayDependence: 'low', standardization: 'strong',
    clinicalPhenoAgeOverlap: 'exact',
  }),
  triglycerides: biomarker('triglycerides', 'Triglycerides', ['mg/dL'], {
    measurementVariability: 'high', acuteIllnessSensitivity: 'moderate', assayDependence: 'low',
    standardization: 'strong',
  }),
  uricAcid: biomarker('uric_acid', 'Uric acid', ['mg/dL'], {
    acuteIllnessSensitivity: 'moderate', assayDependence: 'low', standardization: 'strong',
  }),
  wbc: biomarker('white_blood_cell_count', 'White blood cell count', ['10^3 cells/µL'], {
    acuteIllnessSensitivity: 'high', clinicalPhenoAgeOverlap: 'exact',
  }),
  lymphocytePercent: biomarker('lymphocyte_percentage', 'Lymphocyte percentage', ['%'], {
    acuteIllnessSensitivity: 'high', clinicalPhenoAgeOverlap: 'exact',
  }),
  mcv: biomarker('mean_cell_volume', 'Mean cell volume', ['fL'], {
    acuteIllnessSensitivity: 'moderate', clinicalPhenoAgeOverlap: 'exact',
  }),
  rdw: biomarker('red_cell_distribution_width', 'Red cell distribution width', ['%'], {
    acuteIllnessSensitivity: 'moderate', assayDependence: 'high', standardization: 'limited',
    clinicalPhenoAgeOverlap: 'exact',
  }),
  rbc: biomarker('red_blood_cell_count', 'Red blood cell count', ['10^6 cells/µL'], {
    acuteIllnessSensitivity: 'moderate',
  }),
  diastolicBloodPressure: biomarker('diastolic_blood_pressure', 'Diastolic blood pressure', ['mmHg'], {
    measurementVariability: 'high', acuteIllnessSensitivity: 'high', assayDependence: 'variable',
  }),
  waistCircumference: biomarker('waist_circumference', 'Waist circumference', ['cm'], {
    measurementVariability: 'high', acuteIllnessSensitivity: 'low', assayDependence: 'variable',
  }),
  plateletCount: biomarker('platelet_count', 'Platelet count', ['10^3 cells/µL'], {
    acuteIllnessSensitivity: 'high',
  }),
  ferritin: biomarker('ferritin', 'Ferritin', ['ng/mL'], {
    acuteIllnessSensitivity: 'high', assayDependence: 'moderate',
  }),
  transferrin: biomarker('transferrin', 'Transferrin', ['g/L'], {
    acuteIllnessSensitivity: 'high', assayDependence: 'moderate',
  }),
  igf1: biomarker('igf_1', 'Insulin-like growth factor 1', ['nmol/L'], {
    accessibility: 'specialty', assayDependence: 'high', standardization: 'limited', costImplication: 'moderate',
  }),
  cystatinC: biomarker('cystatin_c', 'Cystatin C', ['mg/L'], {
    accessibility: 'specialty', acuteIllnessSensitivity: 'moderate', assayDependence: 'moderate',
    costImplication: 'moderate',
  }),
  reactionTime: biomarker('reaction_time', 'Reaction time', ['milliseconds'], {
    accessibility: 'mixed', internationalAvailability: 'Available only under a versioned cognitive-test protocol.',
    measurementVariability: 'high', acuteIllnessSensitivity: 'high', assayDependence: 'high',
    standardization: 'limited', costImplication: 'variable',
  }),
  gripStrength: biomarker('grip_strength', 'Hand-grip strength normalized to height', ['kg/m'], {
    accessibility: 'mixed', measurementVariability: 'high', acuteIllnessSensitivity: 'high',
    assayDependence: 'high', standardization: 'moderate', costImplication: 'moderate',
  }),
  egfr: biomarker('estimated_glomerular_filtration_rate', 'Estimated glomerular filtration rate', ['mL/min/1.73m²'], {
    acuteIllnessSensitivity: 'high', assayDependence: 'high', standardization: 'moderate',
  }),
  mmse: biomarker('mmse', 'Mini-Mental State Examination score', ['points'], {
    accessibility: 'specialty', internationalAvailability: 'Requires licensed, language-compatible, standardized cognitive assessment.',
    measurementVariability: 'high', acuteIllnessSensitivity: 'high', assayDependence: 'high',
    standardization: 'limited', costImplication: 'moderate',
  }),
  kneeExtension: biomarker('knee_extension_strength', 'Knee-extension strength', ['kg'], {
    accessibility: 'specialty', measurementVariability: 'high', acuteIllnessSensitivity: 'high',
    assayDependence: 'high', standardization: 'limited', costImplication: 'moderate',
  }),
  timedUpAndGo: biomarker('timed_up_and_go', 'Timed Up and Go', ['seconds'], {
    accessibility: 'mixed', measurementVariability: 'high', acuteIllnessSensitivity: 'high',
    assayDependence: 'high', standardization: 'moderate', costImplication: 'moderate',
  }),
  gaitSpeed: biomarker('gait_speed', 'Gait speed', ['m/s'], {
    accessibility: 'mixed', measurementVariability: 'high', acuteIllnessSensitivity: 'high',
    assayDependence: 'high', standardization: 'moderate', costImplication: 'moderate',
  }),
  hemoglobin: biomarker('hemoglobin', 'Hemoglobin', ['g/dL'], {
    acuteIllnessSensitivity: 'moderate', assayDependence: 'low', standardization: 'strong',
  }),
  height: biomarker('height', 'Standing height', ['cm'], {
    measurementVariability: 'moderate', acuteIllnessSensitivity: 'low', assayDependence: 'variable', standardization: 'strong',
  }),
  thighCircumference: biomarker('thigh_circumference', 'Thigh circumference', ['cm'], {
    accessibility: 'mixed', measurementVariability: 'high', acuteIllnessSensitivity: 'low', assayDependence: 'high', standardization: 'limited',
  }),
  chairRise: biomarker('chair_rise_time', 'Chair-rise time', ['seconds'], {
    accessibility: 'mixed', measurementVariability: 'high', acuteIllnessSensitivity: 'high', assayDependence: 'high', standardization: 'moderate',
  }),
  monocyteCount: biomarker('monocyte_count', 'Monocyte count', ['10^3 cells/µL'], {
    acuteIllnessSensitivity: 'high',
  }),
} as const;

const b = KDM_BIOMARKERS;

export const LEVINE_KDM1_PANEL = [
  b.chronologicalAge, b.crp, b.creatinine, b.hba1c, b.albumin,
  b.totalCholesterol, b.cmvOpticalDensity, b.bloodUreaNitrogen,
  b.alkalinePhosphatase, b.fev1, b.systolicBloodPressure,
] as const;

export const LEVINE_KDM2_MALE_PANEL = [
  b.chronologicalAge, b.crp, b.hba1c, b.albumin, b.cmvOpticalDensity,
  b.alkalinePhosphatase, b.fev1, b.systolicBloodPressure,
] as const;

export const LEVINE_KDM2_FEMALE_PANEL = [
  b.chronologicalAge, b.crp, b.hba1c, b.totalCholesterol,
  b.alkalinePhosphatase, b.fev1, b.bloodUreaNitrogen, b.systolicBloodPressure,
] as const;

export const CALERIE_2017_PANEL = [
  b.chronologicalAge, b.albumin, b.alkalinePhosphatase, b.crp,
  b.totalCholesterol, b.creatinine, b.hba1c, b.systolicBloodPressure,
  b.bloodUreaNitrogen, b.uricAcid, b.wbc,
] as const;

export const BIOAGE_V2_PANEL = [
  b.chronologicalAge, b.albumin, b.alkalinePhosphatase, b.bloodUreaNitrogen,
  b.creatinine, b.crp, b.hba1c, b.totalCholesterol, b.uricAcid, b.wbc,
  b.lymphocytePercent, b.mcv, b.rdw,
] as const;

export const LIU_CHNS_PANEL = [
  b.chronologicalAge, b.totalCholesterol, b.triglycerides, b.hba1c,
  b.bloodUreaNitrogen, b.creatinine, b.albumin, b.crp, b.rbc,
  b.plateletCount, b.ferritin, b.transferrin, b.systolicBloodPressure,
] as const;

export const ZHONG_SLAS_MALE_PANEL = [
  b.chronologicalAge, b.diastolicBloodPressure, b.fev1, b.gripStrength,
  b.kneeExtension, b.timedUpAndGo, b.gaitSpeed, b.hemoglobin, b.egfr, b.mmse,
] as const;

export const ZHONG_SLAS_FEMALE_PANEL = [
  b.chronologicalAge, b.height, b.thighCircumference, b.fev1, b.gripStrength,
  b.kneeExtension, b.timedUpAndGo, b.gaitSpeed, b.chairRise, b.monocyteCount,
  b.egfr, b.mmse,
] as const;

export const MAK_18_PANEL = [
  b.chronologicalAge, b.fev1, b.systolicBloodPressure, b.bloodUreaNitrogen,
  b.hba1c, b.totalCholesterol, b.creatinine, b.glucose,
  b.waistCircumference, b.rdw, b.albumin, b.alkalinePhosphatase,
  b.triglycerides, b.mcv, b.uricAcid, b.lymphocytePercent, b.rbc,
  b.crp, b.diastolicBloodPressure,
] as const;

export const CHAN_REDUCED_PANEL = [
  b.fev1, b.reactionTime, b.igf1, b.cystatinC, b.gripStrength,
  b.systolicBloodPressure, b.diastolicBloodPressure, b.albumin,
  b.alkalinePhosphatase, b.hba1c, b.bloodUreaNitrogen,
] as const;
