import type { CardiometabolicBlockedOutput, CardiometabolicMeasurementId } from './contracts';
import { CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS } from './eligibility';
import { CARDIOMETABOLIC_ASSAY_REGISTRY } from './assayRegistry';
import { CARDIOMETABOLIC_INTERPRETATION_POLICY_REGISTRY } from './interpretationPolicyRegistry';
import { CARDIOMETABOLIC_MEASUREMENT_REGISTRY } from './measurementRegistry';
import { CARDIOMETABOLIC_PROTOCOL_REGISTRY } from './protocolRegistry';
import { CARDIOMETABOLIC_REASON_ORDER } from './reasonRegistry';
import { CARDIOMETABOLIC_REFERENCE_MATCHING_POLICY } from './referenceMatching';
import { CARDIOMETABOLIC_REFERENCE_REGISTRY } from './referenceRegistry';
import { CARDIOMETABOLIC_SOURCE_REGISTRY } from './sourceRegistry';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export const CARDIOMETABOLIC_GOVERNANCE = Object.freeze({
  domain: 'Cardiometabolic Health',
  domainVersion: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.domainSpecification,
  authoritativeDocuments: [
    'Phase 7.0A — Cardiometabolic Health Scientific Evidence Review',
    'Phase 7.0B — Cardiometabolic Health Measurement Standard',
    'Phase 7.0C — Cardiometabolic Health Reference and Interpretation Standard',
  ],
  phase7BIdentityAuthority: true,
  phase7CDisplayAliasesAreNotAcceptedInputIdentities: true,
  standaloneDomain: true,
  independentMeasurements: true,
  failClosed: true,
  artificialIntelligenceScientificDecisionsAllowed: false,
  productionIntegrationAuthorized: false,
  persistenceIntegrationAuthorized: false,
  ingestionIntegrationAuthorized: false,
  uiIntegrationAuthorized: false,
  scoreAuthorized: false,
  diagnosisAuthorized: false,
  treatmentAdviceAuthorized: false,
  individualRiskPredictionAuthorized: false,
  silentFallbackAllowed: false,
  crossMeasurementSubstitutionAllowed: false,
  originalInputPreserved: true,
  historicalCorrectionsAppendOnly: true,
  prohibitedOutputs: CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS,
});

export interface CardiometabolicGovernanceAudit {
  valid: boolean;
  issues: readonly string[];
  checkedVersions: readonly string[];
  checkedMeasurementIds: readonly CardiometabolicMeasurementId[];
  checkedProhibitedOutputs: readonly CardiometabolicBlockedOutput[];
}

function duplicates(values: readonly string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

export function auditCardiometabolicGovernance(): CardiometabolicGovernanceAudit {
  const issues: string[] = [];
  const versions = Object.values(CARDIOMETABOLIC_SCIENTIFIC_VERSIONS);
  const measurements = CARDIOMETABOLIC_MEASUREMENT_REGISTRY.measurements.map(item => item.id);
  const standards = CARDIOMETABOLIC_MEASUREMENT_REGISTRY.measurements.map(item => item.standardId);
  const protocols = CARDIOMETABOLIC_PROTOCOL_REGISTRY.protocols.map(item => item.id);
  const assays = CARDIOMETABOLIC_ASSAY_REGISTRY.methods.map(item => item.id);
  const sources = CARDIOMETABOLIC_SOURCE_REGISTRY.sources.map(item => item.id);
  const references = CARDIOMETABOLIC_REFERENCE_REGISTRY.references.map(item => `${item.id}|${item.version}`);
  const policies = CARDIOMETABOLIC_INTERPRETATION_POLICY_REGISTRY.policies.map(item => item.id);
  [measurements, standards, protocols, assays, sources, references, policies, [...CARDIOMETABOLIC_REASON_ORDER]]
    .forEach(values => duplicates(values).forEach(value => issues.push(`Duplicate governed identity: ${value}`)));
  if (CARDIOMETABOLIC_MEASUREMENT_REGISTRY.measurements.length !== 15) issues.push('The Phase 7.0B registry must contain exactly 15 independent measurement identities.');
  CARDIOMETABOLIC_PROTOCOL_REGISTRY.protocols.forEach(protocol => protocol.measurements.forEach(id => {
    if (!measurements.includes(id)) issues.push(`Protocol ${protocol.id} references unknown measurement ${id}.`);
  }));
  CARDIOMETABOLIC_ASSAY_REGISTRY.methods.forEach(method => method.measurements.forEach(id => {
    if (!measurements.includes(id)) issues.push(`Method ${method.id} references unknown measurement ${id}.`);
  }));
  CARDIOMETABOLIC_REFERENCE_REGISTRY.references.forEach(reference => {
    if (reference.fallbackPermitted) issues.push(`Reference ${reference.id} improperly permits fallback.`);
    reference.measurements.forEach(id => {
      if (!measurements.includes(id)) issues.push(`Reference ${reference.id} references unknown measurement ${id}.`);
    });
  });
  CARDIOMETABOLIC_INTERPRETATION_POLICY_REGISTRY.policies.forEach(policy => {
    if (!measurements.includes(policy.measurementId)) issues.push(`Policy ${policy.id} references unknown measurement.`);
    policy.referenceIds.forEach(id => {
      if (!CARDIOMETABOLIC_REFERENCE_REGISTRY.references.some(reference => reference.id === id)) issues.push(`Policy ${policy.id} references unknown reference ${id}.`);
    });
  });
  Object.entries(CARDIOMETABOLIC_REFERENCE_MATCHING_POLICY)
    .filter(([key, value]) => key.startsWith('permits') && value !== false)
    .forEach(([key]) => issues.push(`Fallback policy ${key} is unexpectedly enabled.`));
  const mandatory: CardiometabolicBlockedOutput[] = [
    'cardiometabolic_health_score', 'cross_marker_composite', 'diabetes_diagnosis',
    'hypertension_diagnosis', 'medication_initiation', 'individual_event_risk_prediction',
    'lpa_unit_conversion', 'clinical_phenoage_modification',
  ];
  mandatory.forEach(output => {
    if (!CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS.includes(output)) issues.push(`Mandatory output is not blocked: ${output}.`);
  });
  return { valid: issues.length === 0, issues, checkedVersions: versions, checkedMeasurementIds: measurements, checkedProhibitedOutputs: CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS };
}
