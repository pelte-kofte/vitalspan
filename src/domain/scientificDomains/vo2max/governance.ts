import { VO2MAX_CONFIDENCE_REGISTRY } from './confidenceRegistry';
import type { Vo2MaxConfidence, Vo2MaxSourceId } from './contracts';
import { VO2MAX_PERCENTILE_POLICY } from './percentilePolicy';
import { VO2MAX_REASON_REGISTRY } from './reasonRegistry';
import { VO2MAX_REFERENCE_REGISTRY } from './referenceRegistry';
import { VO2MAX_SOURCE_REGISTRY } from './sourceRegistry';
import { VO2MAX_SCIENTIFIC_VERSIONS } from './versions';

export const VO2MAX_GOVERNANCE_POLICY = Object.freeze({
  version: VO2MAX_SCIENTIFIC_VERSIONS.domainSpecification,
  standaloneDomain: 'cardiorespiratory_fitness' as const,
  failClosed: true,
  aiScientificDecisioningAllowed: false,
  productionIntegrationAuthorized: false,
  clinicalPhenoAgeInteraction: 'prohibited' as const,
  biologicalAgeOutputAllowed: false,
  fitnessAgeOutputAllowed: false,
  mortalityPredictionAllowed: false,
  diagnosisAllowed: false,
  treatmentRecommendationAllowed: false,
  compositeLongevityScoreAllowed: false,
  globalReferenceFallbackAllowed: false,
  wearableToCpetNormalizationAllowed: false,
});

export type Vo2MaxGovernanceIssueCode =
  | 'version_mismatch'
  | 'duplicate_source'
  | 'duplicate_confidence'
  | 'duplicate_reference'
  | 'unknown_source_confidence'
  | 'reference_fallback_enabled'
  | 'prohibited_output_enabled'
  | 'production_integration_enabled';

export interface Vo2MaxGovernanceIssue {
  code: Vo2MaxGovernanceIssueCode;
  message: string;
}

function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicate = new Set<string>();
  values.forEach(value => seen.has(value) ? duplicate.add(value) : seen.add(value));
  return [...duplicate];
}

export function validateVo2MaxGovernance(): readonly Vo2MaxGovernanceIssue[] {
  const issues: Vo2MaxGovernanceIssue[] = [];
  const expectedVersions = new Set(Object.values(VO2MAX_SCIENTIFIC_VERSIONS));
  const actualVersions = [
    VO2MAX_GOVERNANCE_POLICY.version,
    VO2MAX_SOURCE_REGISTRY.version,
    VO2MAX_CONFIDENCE_REGISTRY.version,
    VO2MAX_REASON_REGISTRY.version,
    VO2MAX_REFERENCE_REGISTRY.version,
    VO2MAX_PERCENTILE_POLICY.version,
  ];
  if (actualVersions.some(version => !expectedVersions.has(version))) {
    issues.push({ code: 'version_mismatch', message: 'Every scientific registry must expose an approved independent version.' });
  }
  duplicates(VO2MAX_SOURCE_REGISTRY.sources.map(source => source.id)).forEach((id: string) => {
    issues.push({ code: 'duplicate_source', message: `Duplicate source registry id: ${id as Vo2MaxSourceId}.` });
  });
  duplicates(VO2MAX_CONFIDENCE_REGISTRY.definitions.map(definition => definition.id)).forEach((id: string) => {
    issues.push({ code: 'duplicate_confidence', message: `Duplicate confidence id: ${id as Vo2MaxConfidence}.` });
  });
  duplicates(VO2MAX_REFERENCE_REGISTRY.references.map(reference => `${reference.id}@${reference.version}`))
    .forEach(id => issues.push({ code: 'duplicate_reference', message: `Duplicate reference: ${id}.` }));
  const confidenceIds = new Set(VO2MAX_CONFIDENCE_REGISTRY.definitions.map(item => item.id));
  VO2MAX_SOURCE_REGISTRY.sources.forEach(source => {
    if (!confidenceIds.has(source.confidence)) {
      issues.push({ code: 'unknown_source_confidence', message: `Source ${source.id} has an unknown confidence.` });
    }
  });
  if (VO2MAX_REFERENCE_REGISTRY.references.some(reference => reference.fallbackPermitted)
    || VO2MAX_PERCENTILE_POLICY.permitsGlobalFallback
    || VO2MAX_PERCENTILE_POLICY.permitsNearestRegionFallback
    || VO2MAX_PERCENTILE_POLICY.permitsSexFallback
    || VO2MAX_PERCENTILE_POLICY.permitsModalityFallback
    || VO2MAX_PERCENTILE_POLICY.permitsWearableToCpetFallback
    || VO2MAX_PERCENTILE_POLICY.permitsAgeExtrapolation) {
    issues.push({ code: 'reference_fallback_enabled', message: 'No reference fallback or extrapolation may be enabled.' });
  }
  if (VO2MAX_PERCENTILE_POLICY.prohibitedOutputs.length !== 11) {
    issues.push({ code: 'prohibited_output_enabled', message: 'The complete prohibited-output boundary must remain explicit.' });
  }
  if (VO2MAX_GOVERNANCE_POLICY.productionIntegrationAuthorized) {
    issues.push({ code: 'production_integration_enabled', message: 'Phase 5.0D cannot authorize production integration.' });
  }
  return issues;
}

export function assertVo2MaxGovernanceIntegrity(): void {
  const issues = validateVo2MaxGovernance();
  if (issues.length > 0) throw new Error(issues.map(issue => issue.message).join('\n'));
}

