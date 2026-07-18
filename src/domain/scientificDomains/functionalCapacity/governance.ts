import type { FunctionalCapacityProhibitedOutput, FunctionalCapacityTestId } from './contracts';
import { FUNCTIONAL_CAPACITY_ALWAYS_BLOCKED_OUTPUTS } from './eligibility';
import { FUNCTIONAL_CAPACITY_PROTOCOL_REGISTRY } from './protocolRegistry';
import { FUNCTIONAL_CAPACITY_REASON_ORDER } from './reasonRegistry';
import { FUNCTIONAL_CAPACITY_REFERENCE_MATCHING_POLICY } from './referenceMatching';
import { FUNCTIONAL_CAPACITY_REFERENCE_REGISTRY } from './referenceRegistry';
import { FUNCTIONAL_CAPACITY_SOURCE_REGISTRY } from './sourceRegistry';
import { FUNCTIONAL_CAPACITY_TEST_REGISTRY } from './testRegistry';
import { FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export const FUNCTIONAL_CAPACITY_GOVERNANCE = Object.freeze({
  domain: 'Functional Capacity',
  domainVersion: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.domainSpecification,
  authoritativeDocuments: [
    'Phase 6.0A — Functional Capacity Scientific Evidence Review',
    'Phase 6.0B — Functional Capacity Measurement Standard',
    'Phase 6.0C — Functional Capacity Reference Standard',
  ],
  standaloneDomain: true,
  independentTestResults: true,
  failClosed: true,
  artificialIntelligenceScientificDecisionsAllowed: false,
  productionIntegrationAuthorized: false,
  persistenceIntegrationAuthorized: false,
  deviceIngestionIntegrationAuthorized: false,
  deterministicReasonOrdering: true,
  originalInputPreserved: true,
  appendOnlyMeasurementHistory: true,
  silentFallbackAllowed: false,
  crossTestSubstitutionAllowed: false,
  prohibitedOutputs: FUNCTIONAL_CAPACITY_ALWAYS_BLOCKED_OUTPUTS,
});

export interface FunctionalCapacityGovernanceAudit {
  valid: boolean;
  issues: readonly string[];
  checkedVersions: readonly string[];
  checkedTestIds: readonly FunctionalCapacityTestId[];
  checkedProhibitedOutputs: readonly FunctionalCapacityProhibitedOutput[];
}

function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  values.forEach(value => (seen.has(value) ? repeated.add(value) : seen.add(value)));
  return [...repeated];
}

export function auditFunctionalCapacityGovernance(): FunctionalCapacityGovernanceAudit {
  const issues: string[] = [];
  const versions = Object.values(FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS);
  const testIds = FUNCTIONAL_CAPACITY_TEST_REGISTRY.tests.map(test => test.id);
  const protocolIds = FUNCTIONAL_CAPACITY_PROTOCOL_REGISTRY.protocols.map(protocol => protocol.id);
  const sourceIds = FUNCTIONAL_CAPACITY_SOURCE_REGISTRY.sources.map(source => source.id);
  const referenceKeys = FUNCTIONAL_CAPACITY_REFERENCE_REGISTRY.references.map(reference => `${reference.id}|${reference.version}`);

  duplicates(versions).forEach(version => issues.push(`Duplicate scientific version: ${version}`));
  duplicates(testIds).forEach(id => issues.push(`Duplicate test identity: ${id}`));
  duplicates(protocolIds).forEach(id => issues.push(`Duplicate protocol identity: ${id}`));
  duplicates(sourceIds).forEach(id => issues.push(`Duplicate source identity: ${id}`));
  duplicates(referenceKeys).forEach(key => issues.push(`Duplicate reference identity/version: ${key}`));
  duplicates(FUNCTIONAL_CAPACITY_REASON_ORDER).forEach(code => issues.push(`Duplicate reason code: ${code}`));

  FUNCTIONAL_CAPACITY_PROTOCOL_REGISTRY.protocols.forEach(protocol => {
    if (!testIds.includes(protocol.testId)) issues.push(`Protocol ${protocol.id} has no registered test.`);
  });
  FUNCTIONAL_CAPACITY_REFERENCE_REGISTRY.references.forEach(reference => {
    if (!testIds.includes(reference.testId)) issues.push(`Reference ${reference.id} has no registered test.`);
    if (reference.fallbackPermitted) issues.push(`Reference ${reference.id} improperly permits fallback.`);
    reference.protocolIds.forEach(protocolId => {
      const protocol = FUNCTIONAL_CAPACITY_PROTOCOL_REGISTRY.protocols.find(item => item.id === protocolId);
      if (!protocol || protocol.testId !== reference.testId) {
        issues.push(`Reference ${reference.id} has an invalid protocol link: ${protocolId}.`);
      }
    });
  });
  Object.entries(FUNCTIONAL_CAPACITY_REFERENCE_MATCHING_POLICY)
    .filter(([key, value]) => key.startsWith('permits') && value !== false)
    .forEach(([key]) => issues.push(`Fallback policy ${key} is unexpectedly enabled.`));

  const mandatoryBlocked: readonly FunctionalCapacityProhibitedOutput[] = [
    'overall_functional_capacity_score', 'cross_test_ranking', 'qualitative_performance_category',
    'mortality_threshold', 'biological_age', 'fitness_age', 'frailty_diagnosis',
    'fall_risk_diagnosis', 'six_mwt_to_vo2max_conversion', 'cross_test_substitution',
  ];
  mandatoryBlocked.forEach(output => {
    if (!FUNCTIONAL_CAPACITY_ALWAYS_BLOCKED_OUTPUTS.includes(output)) {
      issues.push(`Mandatory prohibited output is not blocked: ${output}.`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    checkedVersions: versions,
    checkedTestIds: testIds,
    checkedProhibitedOutputs: FUNCTIONAL_CAPACITY_ALWAYS_BLOCKED_OUTPUTS,
  };
}
