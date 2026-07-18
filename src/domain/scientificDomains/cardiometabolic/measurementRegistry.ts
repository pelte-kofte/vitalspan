import type { CardiometabolicFamily, CardiometabolicMeasurementId } from './contracts';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export interface CardiometabolicMeasurementDefinition {
  id: CardiometabolicMeasurementId;
  standardId: string;
  displayName: string;
  family: CardiometabolicFamily;
  directness: 'direct' | 'calculated' | 'derived' | 'protocol_summary';
  canonicalUnit: string;
  acceptedUnits: readonly string[];
  interpretationMode: 'conditional_exact_match' | 'raw_and_trend_only';
  assayRequired: boolean;
  protocolRequired: boolean;
}

export const CARDIOMETABOLIC_MEASUREMENT_REGISTRY = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.measurementRegistry,
  measurements: [
    { id: 'apolipoprotein_b', standardId: 'CMH-MS-APOB-1', displayName: 'Apolipoprotein B', family: 'atherogenic_lipids', directness: 'direct', canonicalUnit: 'g/L', acceptedUnits: ['g/L', 'mg/dL'], interpretationMode: 'raw_and_trend_only', assayRequired: true, protocolRequired: false },
    { id: 'ldl_c_direct', standardId: 'CMH-MS-LDLC-DIRECT-1', displayName: 'LDL cholesterol — direct', family: 'atherogenic_lipids', directness: 'direct', canonicalUnit: 'mmol/L', acceptedUnits: ['mmol/L', 'mg/dL'], interpretationMode: 'conditional_exact_match', assayRequired: true, protocolRequired: false },
    { id: 'ldl_c_calculated', standardId: 'CMH-MS-LDLC-CALCULATED-1', displayName: 'LDL cholesterol — calculated', family: 'atherogenic_lipids', directness: 'calculated', canonicalUnit: 'mmol/L', acceptedUnits: ['mmol/L', 'mg/dL'], interpretationMode: 'conditional_exact_match', assayRequired: true, protocolRequired: false },
    { id: 'non_hdl_c', standardId: 'CMH-MS-NHDLC-1', displayName: 'Non-HDL cholesterol', family: 'atherogenic_lipids', directness: 'derived', canonicalUnit: 'mmol/L', acceptedUnits: ['mmol/L', 'mg/dL'], interpretationMode: 'raw_and_trend_only', assayRequired: true, protocolRequired: false },
    { id: 'hdl_c', standardId: 'CMH-MS-HDLC-1', displayName: 'HDL cholesterol', family: 'atherogenic_lipids', directness: 'direct', canonicalUnit: 'mmol/L', acceptedUnits: ['mmol/L', 'mg/dL'], interpretationMode: 'raw_and_trend_only', assayRequired: true, protocolRequired: false },
    { id: 'triglycerides', standardId: 'CMH-MS-TG-1', displayName: 'Triglycerides', family: 'atherogenic_lipids', directness: 'direct', canonicalUnit: 'mmol/L', acceptedUnits: ['mmol/L', 'mg/dL'], interpretationMode: 'conditional_exact_match', assayRequired: true, protocolRequired: false },
    { id: 'lipoprotein_a_molar', standardId: 'CMH-MS-LPA-MOLAR-1', displayName: 'Lipoprotein(a) — molar', family: 'atherogenic_lipids', directness: 'direct', canonicalUnit: 'nmol/L', acceptedUnits: ['nmol/L'], interpretationMode: 'conditional_exact_match', assayRequired: true, protocolRequired: false },
    { id: 'lipoprotein_a_mass', standardId: 'CMH-MS-LPA-MASS-1', displayName: 'Lipoprotein(a) — mass', family: 'atherogenic_lipids', directness: 'direct', canonicalUnit: 'mg/dL', acceptedUnits: ['mg/dL', 'mg/L', 'g/L'], interpretationMode: 'conditional_exact_match', assayRequired: true, protocolRequired: false },
    { id: 'hba1c', standardId: 'CMH-MS-HBA1C-1', displayName: 'Hemoglobin A1c', family: 'glycemic_status', directness: 'direct', canonicalUnit: 'mmol/mol', acceptedUnits: ['mmol/mol', '%'], interpretationMode: 'conditional_exact_match', assayRequired: true, protocolRequired: false },
    { id: 'fasting_plasma_glucose', standardId: 'CMH-MS-FPG-1', displayName: 'Fasting plasma glucose', family: 'glycemic_status', directness: 'direct', canonicalUnit: 'mmol/L', acceptedUnits: ['mmol/L', 'mg/dL'], interpretationMode: 'conditional_exact_match', assayRequired: true, protocolRequired: true },
    { id: 'home_cuff_blood_pressure', standardId: 'CMH-MS-HBPM-1', displayName: 'Home cuff blood pressure', family: 'blood_pressure', directness: 'protocol_summary', canonicalUnit: 'mmHg', acceptedUnits: ['mmHg'], interpretationMode: 'conditional_exact_match', assayRequired: false, protocolRequired: true },
    { id: 'office_blood_pressure', standardId: 'CMH-MS-OBP-1', displayName: 'Office blood pressure', family: 'blood_pressure', directness: 'protocol_summary', canonicalUnit: 'mmHg', acceptedUnits: ['mmHg'], interpretationMode: 'conditional_exact_match', assayRequired: false, protocolRequired: true },
    { id: 'automated_office_blood_pressure', standardId: 'CMH-MS-AOBP-1', displayName: 'Automated office blood pressure', family: 'blood_pressure', directness: 'protocol_summary', canonicalUnit: 'mmHg', acceptedUnits: ['mmHg'], interpretationMode: 'raw_and_trend_only', assayRequired: false, protocolRequired: true },
    { id: 'waist_circumference', standardId: 'CMH-MS-WAIST-WHO-1', displayName: 'Waist circumference — WHO midpoint', family: 'central_adiposity', directness: 'direct', canonicalUnit: 'cm', acceptedUnits: ['cm', 'in'], interpretationMode: 'raw_and_trend_only', assayRequired: false, protocolRequired: true },
    { id: 'waist_to_height_ratio', standardId: 'CMH-MS-WHTR-WHO-1', displayName: 'Waist-to-height ratio', family: 'central_adiposity', directness: 'derived', canonicalUnit: 'ratio', acceptedUnits: ['ratio'], interpretationMode: 'conditional_exact_match', assayRequired: false, protocolRequired: true },
  ] as const satisfies readonly CardiometabolicMeasurementDefinition[],
});

export function getCardiometabolicMeasurement(id: string | null): CardiometabolicMeasurementDefinition | null {
  return CARDIOMETABOLIC_MEASUREMENT_REGISTRY.measurements.find(item => item.id === id) ?? null;
}
