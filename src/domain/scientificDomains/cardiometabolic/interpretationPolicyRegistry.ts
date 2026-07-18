import type { CardiometabolicMeasurementId } from './contracts';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export interface CardiometabolicInterpretationPolicyDefinition {
  id: string;
  measurementId: CardiometabolicMeasurementId;
  mode: 'conditional_exact_match' | 'raw_and_trend_only';
  referenceIds: readonly string[];
  interpretationType: string;
  diagnosticBoundary: string;
  treatmentBoundary: string;
}

export const CARDIOMETABOLIC_INTERPRETATION_POLICY_REGISTRY = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.interpretationPolicyRegistry,
  policies: [
    { id: 'CMH-IP-APOB-001', measurementId: 'apolipoprotein_b', mode: 'raw_and_trend_only', referenceIds: ['CMH-REF-LIPID-ACC-2026'], interpretationType: 'none', diagnosticBoundary: 'No diagnosis is authorized.', treatmentBoundary: 'No treatment target or recommendation is authorized.' },
    { id: 'CMH-IP-LDLD-001', measurementId: 'ldl_c_direct', mode: 'conditional_exact_match', referenceIds: ['CMH-REF-LIPID-ACC-2026'], interpretationType: 'published marked-elevation review context only', diagnosticBoundary: 'No disease or familial hypercholesterolemia diagnosis is authorized.', treatmentBoundary: 'No individualized target or medication recommendation is authorized.' },
    { id: 'CMH-IP-LDLC-001', measurementId: 'ldl_c_calculated', mode: 'conditional_exact_match', referenceIds: ['CMH-REF-LIPID-ACC-2026'], interpretationType: 'published marked-elevation review context only', diagnosticBoundary: 'No disease or familial hypercholesterolemia diagnosis is authorized.', treatmentBoundary: 'No individualized target or medication recommendation is authorized.' },
    { id: 'CMH-IP-NHDL-001', measurementId: 'non_hdl_c', mode: 'raw_and_trend_only', referenceIds: ['CMH-REF-LIPID-ESC-2019'], interpretationType: 'none', diagnosticBoundary: 'No diagnosis is authorized.', treatmentBoundary: 'No treatment target is authorized.' },
    { id: 'CMH-IP-HDLC-001', measurementId: 'hdl_c', mode: 'raw_and_trend_only', referenceIds: ['CMH-REF-LIPID-ESC-2019'], interpretationType: 'marker only', diagnosticBoundary: 'No diagnosis or universal protection claim is authorized.', treatmentBoundary: 'No isolated therapeutic recommendation is authorized.' },
    { id: 'CMH-IP-TG-001', measurementId: 'triglycerides', mode: 'conditional_exact_match', referenceIds: ['CMH-REF-LIPID-ACC-2026'], interpretationType: 'published fasting-state-specific informational context', diagnosticBoundary: 'No pancreatitis or other disease diagnosis is authorized.', treatmentBoundary: 'No individualized target or medication recommendation is authorized.' },
    { id: 'CMH-IP-LPA-NMOL-001', measurementId: 'lipoprotein_a_molar', mode: 'conditional_exact_match', referenceIds: ['CMH-REF-LPA-NLA-2024'], interpretationType: 'published unit-specific risk-enhancing context', diagnosticBoundary: 'No inherited-disease diagnosis is authorized.', treatmentBoundary: 'No treatment recommendation is authorized.' },
    { id: 'CMH-IP-LPA-MASS-001', measurementId: 'lipoprotein_a_mass', mode: 'conditional_exact_match', referenceIds: ['CMH-REF-LPA-NLA-2024'], interpretationType: 'published unit-specific risk-enhancing context', diagnosticBoundary: 'No inherited-disease diagnosis is authorized.', treatmentBoundary: 'No treatment recommendation is authorized.' },
    { id: 'CMH-IP-HBA1C-001', measurementId: 'hba1c', mode: 'conditional_exact_match', referenceIds: ['CMH-REF-GLY-ADA-2026', 'CMH-REF-GLY-NICE-PH38'], interpretationType: 'published informational screening context with repeat confirmation', diagnosticBoundary: 'A single value does not authorize diabetes or prediabetes diagnosis.', treatmentBoundary: 'No treatment recommendation or target is authorized.' },
    { id: 'CMH-IP-FPG-001', measurementId: 'fasting_plasma_glucose', mode: 'conditional_exact_match', referenceIds: ['CMH-REF-GLY-ADA-2026', 'CMH-REF-GLY-WHO-2006', 'CMH-REF-GLY-NICE-PH38'], interpretationType: 'published informational screening context with repeat confirmation', diagnosticBoundary: 'A single value does not authorize diabetes or prediabetes diagnosis.', treatmentBoundary: 'No treatment recommendation or target is authorized.' },
    { id: 'CMH-IP-HBPM-001', measurementId: 'home_cuff_blood_pressure', mode: 'conditional_exact_match', referenceIds: ['CMH-REF-BP-ESC-2024', 'CMH-REF-BP-NICE-2026'], interpretationType: 'protocol-specific repeated home blood-pressure context', diagnosticBoundary: 'No hypertension diagnosis is authorized.', treatmentBoundary: 'No treatment recommendation or target is authorized.' },
    { id: 'CMH-IP-OBP-001', measurementId: 'office_blood_pressure', mode: 'conditional_exact_match', referenceIds: ['CMH-REF-BP-AHA-2025', 'CMH-REF-BP-ESC-2024', 'CMH-REF-BP-NICE-2026'], interpretationType: 'protocol-specific repeated multi-occasion office context', diagnosticBoundary: 'No hypertension diagnosis is authorized.', treatmentBoundary: 'No treatment recommendation or target is authorized.' },
    { id: 'CMH-IP-AOBP-001', measurementId: 'automated_office_blood_pressure', mode: 'raw_and_trend_only', referenceIds: [], interpretationType: 'none', diagnosticBoundary: 'No hypertension diagnosis is authorized.', treatmentBoundary: 'No treatment recommendation or target is authorized.' },
    { id: 'CMH-IP-WAIST-001', measurementId: 'waist_circumference', mode: 'raw_and_trend_only', referenceIds: ['CMH-REF-WAIST-WHO-2011'], interpretationType: 'none', diagnosticBoundary: 'No obesity or visceral-adiposity diagnosis is authorized.', treatmentBoundary: 'No treatment recommendation or target is authorized.' },
    { id: 'CMH-IP-WHTR-001', measurementId: 'waist_to_height_ratio', mode: 'conditional_exact_match', referenceIds: ['CMH-REF-WHTR-NICE-2026'], interpretationType: 'bounded NICE adult informational context', diagnosticBoundary: 'No obesity diagnosis is authorized.', treatmentBoundary: 'No treatment recommendation or target is authorized.' },
  ] as const satisfies readonly CardiometabolicInterpretationPolicyDefinition[],
});

export function getCardiometabolicInterpretationPolicy(id: string | null): CardiometabolicInterpretationPolicyDefinition | null {
  return CARDIOMETABOLIC_INTERPRETATION_POLICY_REGISTRY.policies.find(item => item.id === id) ?? null;
}

export function getDefaultCardiometabolicInterpretationPolicy(measurementId: CardiometabolicMeasurementId): CardiometabolicInterpretationPolicyDefinition {
  const policy = CARDIOMETABOLIC_INTERPRETATION_POLICY_REGISTRY.policies.find(item => item.measurementId === measurementId);
  if (!policy) throw new Error(`No Cardiometabolic interpretation policy for ${measurementId}.`);
  return policy;
}
