import type { CardiometabolicConfidenceId } from './contracts';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export interface CardiometabolicSourceDefinition {
  id: string;
  displayName: string;
  acceptance: 'accepted' | 'conditional' | 'research_only' | 'unsupported';
  maximumConfidence: CardiometabolicConfidenceId;
  rule: string;
}

export const CARDIOMETABOLIC_SOURCE_REGISTRY = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.sourceRegistry,
  sources: [
    { id: 'CMH-SRC-REFLAB', displayName: 'Reference measurement laboratory', acceptance: 'accepted', maximumConfidence: 'CMH-CONF-R', rule: 'Documented reference procedure and traceability are required.' },
    { id: 'CMH-SRC-CLAB', displayName: 'Accredited or certified clinical laboratory', acceptance: 'accepted', maximumConfidence: 'CMH-CONF-F', rule: 'Accreditation does not replace assay metadata.' },
    { id: 'CMH-SRC-HOSP-EHR', displayName: 'Hospital or primary-care health-record import', acceptance: 'conditional', maximumConfidence: 'CMH-CONF-F', rule: 'Confidence inherits the verified originating source.' },
    { id: 'CMH-SRC-RESEARCH', displayName: 'Research cohort or laboratory', acceptance: 'research_only', maximumConfidence: 'CMH-CONF-F', rule: 'Production use requires protocol and assay equivalence; otherwise research only.' },
    { id: 'CMH-SRC-POCT', displayName: 'Professional point-of-care testing', acceptance: 'conditional', maximumConfidence: 'CMH-CONF-L', rule: 'Exact device, calibration, matrix, and limitations are required.' },
    { id: 'CMH-SRC-HOMEKIT', displayName: 'Home collection sent to laboratory', acceptance: 'conditional', maximumConfidence: 'CMH-CONF-L', rule: 'Collection, stability, transport, and laboratory chain are required.' },
    { id: 'CMH-SRC-CLIN-BP', displayName: 'Clinician office or automated-office blood pressure', acceptance: 'accepted', maximumConfidence: 'CMH-CONF-F', rule: 'Validated device and complete protocol metadata are required.' },
    { id: 'CMH-SRC-HOME-BP', displayName: 'Home upper-arm cuff blood pressure', acceptance: 'conditional', maximumConfidence: 'CMH-CONF-F', rule: 'Validated upper-arm device and complete home protocol are required.' },
    { id: 'CMH-SRC-CLIN-ANTH', displayName: 'Professionally measured anthropometry', acceptance: 'accepted', maximumConfidence: 'CMH-CONF-F', rule: 'Registered landmark and technique are required.' },
    { id: 'CMH-SRC-SELF-ANTH', displayName: 'Guided self-measured anthropometry', acceptance: 'conditional', maximumConfidence: 'CMH-CONF-L', rule: 'Guided protocol, repeat values, and complete metadata are required.' },
    { id: 'CMH-SRC-MANUAL-DOC', displayName: 'Manual entry with source document', acceptance: 'conditional', maximumConfidence: 'CMH-CONF-P', rule: 'Remains provisional until independently verified, then inherits source confidence.' },
    { id: 'CMH-SRC-MANUAL', displayName: 'Manual entry without source evidence', acceptance: 'unsupported', maximumConfidence: 'CMH-CONF-P', rule: 'No scientific interpretation is authorized.' },
    { id: 'CMH-SRC-CONTAINER', displayName: 'Health-data container or interoperability import', acceptance: 'conditional', maximumConfidence: 'CMH-CONF-P', rule: 'Must retain and resolve the original source; the container confers no trust.' },
    { id: 'CMH-SRC-CUFFLESS', displayName: 'Consumer cuffless blood-pressure estimate', acceptance: 'unsupported', maximumConfidence: 'CMH-CONF-X', rule: 'Not an authorized cuff blood-pressure measurement.' },
    { id: 'CMH-SRC-CONSUMER-BIO', displayName: 'Unsupported consumer biomarker device', acceptance: 'unsupported', maximumConfidence: 'CMH-CONF-X', rule: 'Method equivalence and laboratory governance are insufficient.' },
  ] as const satisfies readonly CardiometabolicSourceDefinition[],
});

export function getCardiometabolicSource(id: string | null): CardiometabolicSourceDefinition | null {
  return CARDIOMETABOLIC_SOURCE_REGISTRY.sources.find(item => item.id === id) ?? null;
}
