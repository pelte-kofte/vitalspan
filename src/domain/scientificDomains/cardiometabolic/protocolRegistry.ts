import type { CardiometabolicMeasurementId } from './contracts';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export interface CardiometabolicProtocolDefinition {
  id: string;
  version: string;
  measurements: readonly CardiometabolicMeasurementId[];
  summary: string;
}

export const CARDIOMETABOLIC_PROTOCOL_REGISTRY = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.protocolRegistry,
  protocols: [
    { id: 'CMH-PROT-FPG-VENOUS-FASTING', version: '1.0.0', measurements: ['fasting_plasma_glucose'], summary: 'Venous plasma, documented fast of at least eight hours, and governed glycolysis control.' },
    { id: 'CMH-PROT-HBPM-UPPER-ARM-SERIES', version: '1.0.0', measurements: ['home_cuff_blood_pressure'], summary: 'Validated upper-arm cuff, standardized rest and position, repeated readings across a governed home series.' },
    { id: 'CMH-PROT-OBP-REPEATED-OCCASIONS', version: '1.0.0', measurements: ['office_blood_pressure'], summary: 'Validated upper-arm office measurement with repeated readings and separately identified occasions.' },
    { id: 'CMH-PROT-AOBP-SEQUENCE', version: '1.0.0', measurements: ['automated_office_blood_pressure'], summary: 'Validated automated-office device and standardized unattended or attended sequence metadata.' },
    { id: 'CMH-PROT-WAIST-WHO-MIDPOINT', version: '1.0.0', measurements: ['waist_circumference'], summary: 'WHO midpoint between the last palpable rib and iliac crest, standing, minimal clothing, end of normal expiration.' },
    { id: 'CMH-PROT-WHTR-NICE-ADULT', version: '1.0.0', measurements: ['waist_to_height_ratio'], summary: 'Verified WHO waist lineage and contemporaneous measured height in the bounded NICE adult population.' },
  ] as const satisfies readonly CardiometabolicProtocolDefinition[],
});

export function getCardiometabolicProtocol(id: string | null): CardiometabolicProtocolDefinition | null {
  return CARDIOMETABOLIC_PROTOCOL_REGISTRY.protocols.find(item => item.id === id) ?? null;
}
