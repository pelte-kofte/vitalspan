import type { CardiometabolicMeasurementId } from './contracts';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export interface CardiometabolicReferenceDefinition {
  id: string;
  version: string;
  authority: string;
  measurements: readonly CardiometabolicMeasurementId[];
  region: 'US' | 'Europe' | 'UK' | 'WHO' | 'Canada' | 'Global';
  targetPopulation: string;
  activation: 'active_conditional' | 'active_supporting' | 'context_only';
  fallbackPermitted: false;
}

export const CARDIOMETABOLIC_REFERENCE_REGISTRY = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.referenceRegistry,
  references: [
    { id: 'CMH-REF-LIPID-ACC-2026', version: '2026-03-13', authority: 'ACC/AHA multisociety dyslipidemia guideline', measurements: ['apolipoprotein_b', 'ldl_c_direct', 'ldl_c_calculated', 'non_hdl_c', 'hdl_c', 'triglycerides', 'lipoprotein_a_molar', 'lipoprotein_a_mass'], region: 'US', targetPopulation: 'Adults in the exact US guideline context with analyte, method, unit, and relevant clinical-risk fields', activation: 'active_conditional', fallbackPermitted: false },
    { id: 'CMH-REF-LIPID-ESC-2025', version: '2025-08-29', authority: 'ESC/EAS focused dyslipidaemia update', measurements: ['apolipoprotein_b', 'ldl_c_direct', 'ldl_c_calculated', 'non_hdl_c', 'hdl_c', 'triglycerides', 'lipoprotein_a_molar', 'lipoprotein_a_mass'], region: 'Europe', targetPopulation: 'European clinical-risk groups', activation: 'context_only', fallbackPermitted: false },
    { id: 'CMH-REF-LIPID-ESC-2019', version: '2019', authority: 'ESC/EAS dyslipidaemia guideline', measurements: ['apolipoprotein_b', 'ldl_c_direct', 'ldl_c_calculated', 'non_hdl_c', 'hdl_c', 'triglycerides'], region: 'Europe', targetPopulation: 'European clinical-risk groups', activation: 'context_only', fallbackPermitted: false },
    { id: 'CMH-REF-LPA-NLA-2024', version: '2024', authority: 'National Lipid Association focused update', measurements: ['lipoprotein_a_molar', 'lipoprotein_a_mass'], region: 'US', targetPopulation: 'Adults with exact Lp(a) unit and assay metadata', activation: 'active_conditional', fallbackPermitted: false },
    { id: 'CMH-REF-LIPID-CCS-2021', version: '2021', authority: 'Canadian Cardiovascular Society lipid guideline', measurements: ['apolipoprotein_b', 'non_hdl_c', 'ldl_c_direct', 'ldl_c_calculated'], region: 'Canada', targetPopulation: 'Canadian clinical population with required risk context', activation: 'context_only', fallbackPermitted: false },
    { id: 'CMH-REF-LIPID-NICE-2023', version: '2023-12-14', authority: 'NICE NG238', measurements: ['ldl_c_direct', 'ldl_c_calculated', 'non_hdl_c', 'hdl_c', 'triglycerides'], region: 'UK', targetPopulation: 'UK adults with required disease, CKD, diabetes, risk, and treatment context', activation: 'context_only', fallbackPermitted: false },
    { id: 'CMH-REF-LIPID-EAS-EFLM-2016', version: '2016', authority: 'EAS/EFLM joint consensus', measurements: ['triglycerides', 'ldl_c_direct', 'ldl_c_calculated', 'non_hdl_c', 'hdl_c'], region: 'Europe', targetPopulation: 'Exact fasting status and lipid method', activation: 'active_supporting', fallbackPermitted: false },
    { id: 'CMH-REF-LIPID-CDC-2025', version: '2025-12-02', authority: 'CDC CRMLN and Lipid Standardization Program', measurements: ['apolipoprotein_b', 'ldl_c_direct', 'hdl_c', 'triglycerides'], region: 'US', targetPopulation: 'Exact assay, laboratory traceability, and certification', activation: 'active_supporting', fallbackPermitted: false },
    { id: 'CMH-REF-GLY-ADA-2026', version: '2026', authority: 'American Diabetes Association Standards of Care, Section 2', measurements: ['hba1c', 'fasting_plasma_glucose'], region: 'US', targetPopulation: 'Nonpregnant adults with valid assay or specimen, region, confounder, and confirmation context', activation: 'active_conditional', fallbackPermitted: false },
    { id: 'CMH-REF-GLY-WHO-2006', version: '2006', authority: 'WHO/IDF definition and diagnosis report', measurements: ['fasting_plasma_glucose'], region: 'WHO', targetPopulation: 'Named WHO policy in nonpregnant adults with valid fasting venous-plasma measurement', activation: 'active_conditional', fallbackPermitted: false },
    { id: 'CMH-REF-GLY-NICE-PH38', version: '2012-current-2026', authority: 'NICE PH38', measurements: ['hba1c', 'fasting_plasma_glucose'], region: 'UK', targetPopulation: 'Applicable UK prevention population with valid assay or fasting context', activation: 'active_conditional', fallbackPermitted: false },
    { id: 'CMH-REF-HBA1C-NGSP-2026', version: '2026-07-18', authority: 'NGSP interference guidance', measurements: ['hba1c'], region: 'Global', targetPopulation: 'Exact HbA1c assay and confounder context', activation: 'active_supporting', fallbackPermitted: false },
    { id: 'CMH-REF-BP-AHA-2025', version: '2025-08-14', authority: 'AHA/ACC high blood pressure guideline', measurements: ['office_blood_pressure'], region: 'US', targetPopulation: 'US adults with repeated valid office measurements and exact setting', activation: 'active_conditional', fallbackPermitted: false },
    { id: 'CMH-REF-BP-ESC-2024', version: '2024-08-30', authority: 'ESC hypertension guideline', measurements: ['office_blood_pressure', 'home_cuff_blood_pressure'], region: 'Europe', targetPopulation: 'European adults with exact setting and protocol', activation: 'active_conditional', fallbackPermitted: false },
    { id: 'CMH-REF-BP-NICE-2026', version: '2026-02-26', authority: 'NICE NG136', measurements: ['office_blood_pressure', 'home_cuff_blood_pressure'], region: 'UK', targetPopulation: 'UK adults with complete clinic or home protocol', activation: 'active_conditional', fallbackPermitted: false },
    { id: 'CMH-REF-BP-ISH-2020', version: '2020', authority: 'International Society of Hypertension global guideline', measurements: ['office_blood_pressure', 'home_cuff_blood_pressure'], region: 'Global', targetPopulation: 'Exact clinical setting and resource context', activation: 'context_only', fallbackPermitted: false },
    { id: 'CMH-REF-BP-WHO-2021', version: '2021-08-24', authority: 'WHO pharmacological treatment guideline', measurements: ['office_blood_pressure'], region: 'WHO', targetPopulation: 'Adults with clinical treatment context', activation: 'context_only', fallbackPermitted: false },
    { id: 'CMH-REF-WAIST-WHO-2011', version: '2011', authority: 'WHO waist circumference and waist–hip ratio report', measurements: ['waist_circumference'], region: 'WHO', targetPopulation: 'Exact sex, population, and WHO-midpoint landmark context', activation: 'context_only', fallbackPermitted: false },
    { id: 'CMH-REF-WAIST-IDF-2006', version: '2006', authority: 'International Diabetes Federation metabolic syndrome consensus', measurements: ['waist_circumference'], region: 'Global', targetPopulation: 'Exact sex- and ethnicity-specific clinical framework', activation: 'context_only', fallbackPermitted: false },
    { id: 'CMH-REF-WHTR-SR-2010', version: '2010-09-07', authority: 'Browning, Hsieh, and Ashwell systematic review', measurements: ['waist_to_height_ratio'], region: 'Global', targetPopulation: 'Heterogeneous adult screening populations; evidence context only', activation: 'context_only', fallbackPermitted: false },
    { id: 'CMH-REF-WHTR-NICE-2026', version: '2026-01-08', authority: 'NICE NG246', measurements: ['waist_to_height_ratio'], region: 'UK', targetPopulation: 'UK/NICE nonpregnant adults with BMI below 35 and valid current waist/height lineage', activation: 'active_conditional', fallbackPermitted: false },
  ] as const satisfies readonly CardiometabolicReferenceDefinition[],
});

export function getCardiometabolicReference(id: string | null, version: string | null): CardiometabolicReferenceDefinition | null {
  return CARDIOMETABOLIC_REFERENCE_REGISTRY.references.find(item => item.id === id && item.version === version) ?? null;
}
