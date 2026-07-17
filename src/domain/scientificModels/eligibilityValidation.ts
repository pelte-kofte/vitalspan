import { SCIENTIFIC_EVIDENCE } from './evidence';
import type { ScientificModelVersion } from './eligibilityModels';
import { SCIENTIFIC_INPUT_POLICIES } from './inputPolicies';
import { SCIENTIFIC_MODEL_VERSIONS } from './modelVersions';
import { SCIENTIFIC_MODEL_REGISTRY } from './registry';

export interface EligibilityCatalogIssue {
  path: string;
  message: string;
}

export function validateEligibilityCatalog(
  versions: readonly ScientificModelVersion[] = SCIENTIFIC_MODEL_VERSIONS,
): readonly EligibilityCatalogIssue[] {
  const issues: EligibilityCatalogIssue[] = [];
  const modelIds = new Set(SCIENTIFIC_MODEL_REGISTRY.map(model => model.id));
  const evidenceIds = new Set(SCIENTIFIC_EVIDENCE.map(reference => reference.id));
  const policyIds = new Set(SCIENTIFIC_INPUT_POLICIES.map(policy => policy.id));
  const versionKeys = new Set<string>();

  versions.forEach(version => {
    const path = `versions.${version.modelId}.${version.version}`;
    const key = `${version.modelId}:${version.version}`;
    if (versionKeys.has(key)) issues.push({ path, message: 'Duplicate model version.' });
    versionKeys.add(key);

    const model = SCIENTIFIC_MODEL_REGISTRY.find(candidate => candidate.id === version.modelId);
    if (!modelIds.has(version.modelId) || !model) {
      issues.push({ path, message: 'Version references an unknown registry model.' });
      return;
    }
    if (!version.version.trim()) issues.push({ path, message: 'Version identifier is required.' });
    if (version.inputPolicyId !== null && !policyIds.has(version.inputPolicyId)) {
      issues.push({ path, message: 'Version references an unknown input policy.' });
    }
    if (version.lifecycle === 'active') {
      if (model.classification !== 'core_biological_age_model'
        || model.useDecision !== 'accepted_candidate') {
        issues.push({ path, message: 'Only an accepted core biological-age model may have an active calculation version.' });
      }
      if (version.inputPolicyId === null || version.inputPolicyId !== model.inputPolicyId) {
        issues.push({ path, message: 'Active version must use its registry-approved input policy.' });
      }
    }
    if (version.minimumAgeYears !== null && version.maximumAgeYears !== null
      && version.minimumAgeYears > version.maximumAgeYears) {
      issues.push({ path, message: 'Minimum age cannot exceed maximum age.' });
    }
    if (!Number.isInteger(version.minimumHistoryObservations)
      || version.minimumHistoryObservations < 0 || version.minimumHistoryDays < 0) {
      issues.push({ path, message: 'History requirements must be non-negative and observation count must be an integer.' });
    }
    version.evidenceReferenceIds.forEach(id => {
      if (!evidenceIds.has(id)) issues.push({ path, message: `Unknown evidence reference: ${id}.` });
    });
  });

  SCIENTIFIC_MODEL_REGISTRY.forEach(model => {
    if (!versions.some(version => version.modelId === model.id)) {
      issues.push({ path: `models.${model.id}`, message: 'Every registered model requires at least one explicit eligibility version.' });
    }
  });
  return issues;
}

export function assertEligibilityCatalogIntegrity(): void {
  const issues = validateEligibilityCatalog();
  if (issues.length > 0) {
    throw new Error(issues.map(issue => `${issue.path}: ${issue.message}`).join('\n'));
  }
}
