import type { CardiometabolicMeasurementId } from './contracts';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export interface CardiometabolicAssayDefinition {
  id: string;
  version: string;
  measurements: readonly CardiometabolicMeasurementId[];
  traceabilityRequired: boolean;
  ngspRequiredForPercent: boolean;
  kind: 'laboratory_assay' | 'calculation_method';
}

export const CARDIOMETABOLIC_ASSAY_REGISTRY = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.assayRegistry,
  methods: [
    { id: 'CMH-ASSAY-APOB-STANDARDIZED', version: '1.0.0', measurements: ['apolipoprotein_b'], traceabilityRequired: true, ngspRequiredForPercent: false, kind: 'laboratory_assay' },
    { id: 'CMH-ASSAY-LDLC-DIRECT-VALIDATED', version: '1.0.0', measurements: ['ldl_c_direct'], traceabilityRequired: true, ngspRequiredForPercent: false, kind: 'laboratory_assay' },
    { id: 'CMH-CALC-LDLC-FRIEDEWALD', version: '1972', measurements: ['ldl_c_calculated'], traceabilityRequired: false, ngspRequiredForPercent: false, kind: 'calculation_method' },
    { id: 'CMH-CALC-LDLC-MARTIN-HOPKINS', version: '2013', measurements: ['ldl_c_calculated'], traceabilityRequired: false, ngspRequiredForPercent: false, kind: 'calculation_method' },
    { id: 'CMH-CALC-LDLC-SAMPSON', version: '2020', measurements: ['ldl_c_calculated'], traceabilityRequired: false, ngspRequiredForPercent: false, kind: 'calculation_method' },
    { id: 'CMH-CALC-NHDLC', version: '1.0.0', measurements: ['non_hdl_c'], traceabilityRequired: false, ngspRequiredForPercent: false, kind: 'calculation_method' },
    { id: 'CMH-ASSAY-HDLC-STANDARDIZED', version: '1.0.0', measurements: ['hdl_c'], traceabilityRequired: true, ngspRequiredForPercent: false, kind: 'laboratory_assay' },
    { id: 'CMH-ASSAY-TG-ENZYMATIC', version: '1.0.0', measurements: ['triglycerides'], traceabilityRequired: true, ngspRequiredForPercent: false, kind: 'laboratory_assay' },
    { id: 'CMH-ASSAY-LPA-MOLAR-ISOFORM-INSENSITIVE', version: '1.0.0', measurements: ['lipoprotein_a_molar'], traceabilityRequired: true, ngspRequiredForPercent: false, kind: 'laboratory_assay' },
    { id: 'CMH-ASSAY-LPA-MASS', version: '1.0.0', measurements: ['lipoprotein_a_mass'], traceabilityRequired: true, ngspRequiredForPercent: false, kind: 'laboratory_assay' },
    { id: 'CMH-ASSAY-HBA1C-IFCC-NGSP', version: '1.0.0', measurements: ['hba1c'], traceabilityRequired: true, ngspRequiredForPercent: true, kind: 'laboratory_assay' },
    { id: 'CMH-ASSAY-GLUCOSE-HEXOKINASE', version: '1.0.0', measurements: ['fasting_plasma_glucose'], traceabilityRequired: true, ngspRequiredForPercent: false, kind: 'laboratory_assay' },
    { id: 'CMH-ASSAY-GLUCOSE-OXIDASE', version: '1.0.0', measurements: ['fasting_plasma_glucose'], traceabilityRequired: true, ngspRequiredForPercent: false, kind: 'laboratory_assay' },
  ] as const satisfies readonly CardiometabolicAssayDefinition[],
});

export function getCardiometabolicAssay(id: string | null): CardiometabolicAssayDefinition | null {
  return CARDIOMETABOLIC_ASSAY_REGISTRY.methods.find(item => item.id === id) ?? null;
}
