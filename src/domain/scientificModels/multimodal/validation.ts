import { SCIENTIFIC_EVIDENCE } from '../evidence';
import { SCIENTIFIC_MODEL_VERSIONS } from '../modelVersions';
import { SCIENTIFIC_MODEL_REGISTRY } from '../registry';
import { DOMAIN_CONTEXT_ROLE_MAPPINGS, SCIENTIFIC_MODEL_COMPONENT_MAPPINGS } from './modelMapping';
import { getScientificComponentRolePolicy } from './roles';
import { validateComponentGovernance } from './governance';
import type {
  ComponentUncertaintyCategory,
  MultimodalScientificComponent,
  ScientificModelComponentMapping,
  ScientificOutputConstruct,
  ScientificOutputUnit,
} from './contracts';

export type MultimodalArchitectureIssueCode =
  | 'duplicate_mapping'
  | 'missing_model_mapping'
  | 'unknown_model_mapping'
  | 'unknown_model_version'
  | 'invalid_role_construct'
  | 'invalid_construct_unit'
  | 'invalid_availability'
  | 'invalid_combination_status'
  | 'numeric_age_influence_prohibited'
  | 'invalid_component_identity'
  | 'missing_evidence_reference'
  | 'population_not_supported'
  | 'missing_uncertainty_category'
  | 'duplicate_uncertainty_category'
  | 'invalid_provenance_snapshot'
  | 'missing_execution_authorization'
  | 'unknown_overlap_metadata'
  | 'governance_invalid'
  | 'prohibited_runtime_field';

export interface MultimodalArchitectureIssue {
  code: MultimodalArchitectureIssueCode;
  path: string;
  message: string;
}

const UNCERTAINTY_CATEGORIES = [
  'model_uncertainty',
  'measurement_uncertainty',
  'population_uncertainty',
  'temporal_uncertainty',
  'device_or_assay_uncertainty',
  'combination_uncertainty',
  'missing_evidence',
  'conflicting_evidence',
] as const satisfies readonly ComponentUncertaintyCategory[];

const PROHIBITED_FIELDS = new Set([
  'formula',
  'coefficient',
  'weight',
  'compositeValue',
  'estimatedMultimodalAge',
  'ageContribution',
  'modifierValue',
]);

function duplicateValues(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  values.forEach(value => seen.has(value) ? duplicates.add(value) : seen.add(value));
  return [...duplicates];
}

function constructUnitCompatible(
  construct: ScientificOutputConstruct,
  unit: ScientificOutputUnit,
): boolean {
  const units: Record<ScientificOutputConstruct, readonly ScientificOutputUnit[]> = {
    age_in_years: ['years'],
    pace_per_biological_year: ['pace_per_biological_year'],
    percentile: ['percentile'],
    risk_estimate: ['probability'],
    normative_deviation: ['standard_deviation', 'percentile'],
    proportion: ['proportion'],
    context_only: ['none', 'source_unit'],
  };
  return units[construct].includes(unit);
}

function validateMapping(mapping: ScientificModelComponentMapping): MultimodalArchitectureIssue[] {
  const issues: MultimodalArchitectureIssue[] = [];
  const path = `modelMappings.${mapping.scientificModelId}`;
  const role = getScientificComponentRolePolicy(mapping.componentRole);
  if (!role.permittedConstructs.includes(mapping.outputConstruct)) {
    issues.push({ code: 'invalid_role_construct', path, message: `${mapping.componentRole} cannot expose ${mapping.outputConstruct}.` });
  }
  if (!constructUnitCompatible(mapping.outputConstruct, mapping.outputUnit)) {
    issues.push({ code: 'invalid_construct_unit', path, message: `${mapping.outputConstruct} is incompatible with ${mapping.outputUnit}.` });
  }
  if (mapping.currentModelVersion !== null && !SCIENTIFIC_MODEL_VERSIONS.some(
    version => version.modelId === mapping.scientificModelId
      && version.version === mapping.currentModelVersion,
  )) {
    issues.push({ code: 'unknown_model_version', path, message: 'Mapped version is not present in the scientific model-version registry.' });
  }
  if (mapping.currentAvailability === 'production'
    && !['primary_age_estimate', 'independent_age_estimate'].includes(mapping.componentRole)) {
    issues.push({ code: 'invalid_availability', path, message: 'Only a validated age-estimate role may be a production age component.' });
  }
  if (['context_only', 'rejected'].includes(mapping.currentAvailability)
    && mapping.combinationStatus !== 'ineligible') {
    issues.push({ code: 'invalid_combination_status', path, message: 'Context and rejected mappings must be combination-ineligible.' });
  }
  if (mapping.currentAvailability === 'research_only'
    && mapping.combinationStatus !== 'research_only') {
    issues.push({ code: 'invalid_combination_status', path, message: 'Research-only mappings must remain research-only for combination.' });
  }
  if (mapping.numericAgeInfluence === 'age_model_output_only'
    && !['primary_age_estimate', 'independent_age_estimate'].includes(mapping.componentRole)) {
    issues.push({ code: 'numeric_age_influence_prohibited', path, message: 'Only a validated age-estimate role may report an age-model output.' });
  }
  return issues;
}

export function validateMultimodalArchitecture(): readonly MultimodalArchitectureIssue[] {
  const issues: MultimodalArchitectureIssue[] = [];
  const registryIds = new Set(SCIENTIFIC_MODEL_REGISTRY.map(model => model.id));
  const mappedIds = new Set(SCIENTIFIC_MODEL_COMPONENT_MAPPINGS.map(mapping => mapping.scientificModelId));
  duplicateValues(SCIENTIFIC_MODEL_COMPONENT_MAPPINGS.map(mapping => mapping.scientificModelId))
    .forEach(id => issues.push({ code: 'duplicate_mapping', path: 'modelMappings', message: `Duplicate model mapping: ${id}.` }));
  registryIds.forEach(id => {
    if (!mappedIds.has(id)) issues.push({ code: 'missing_model_mapping', path: 'modelMappings', message: `Registry model ${id} lacks a component-role mapping.` });
  });
  mappedIds.forEach(id => {
    if (!registryIds.has(id)) issues.push({ code: 'unknown_model_mapping', path: 'modelMappings', message: `Component mapping references unknown model ${id}.` });
  });
  SCIENTIFIC_MODEL_COMPONENT_MAPPINGS.forEach(mapping => issues.push(...validateMapping(mapping)));

  DOMAIN_CONTEXT_ROLE_MAPPINGS.forEach(mapping => {
    if (mapping.numericAgeInfluence !== 'prohibited' || mapping.combinationStatus !== 'ineligible') {
      issues.push({ code: 'numeric_age_influence_prohibited', path: `domainContext.${mapping.id}`, message: 'Domain context cannot numerically influence or combine into age.' });
    }
    if (mapping.scientificModelId !== null && !registryIds.has(mapping.scientificModelId)) {
      issues.push({ code: 'unknown_model_mapping', path: `domainContext.${mapping.id}`, message: 'Domain context references an unknown scientific model.' });
    }
  });
  return issues;
}

function findProhibitedField(value: unknown, path: string): MultimodalArchitectureIssue[] {
  if (value === null || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((item, index) => findProhibitedField(item, `${path}.${index}`));
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => [
    ...(PROHIBITED_FIELDS.has(key)
      ? [{ code: 'prohibited_runtime_field' as const, path: `${path}.${key}`, message: 'Multimodal contracts cannot carry calculations, coefficients, weights, contributions, or composite outputs.' }]
      : []),
    ...findProhibitedField(child, `${path}.${key}`),
  ]);
}

export function validateMultimodalComponent(
  component: MultimodalScientificComponent,
): readonly MultimodalArchitectureIssue[] {
  const issues: MultimodalArchitectureIssue[] = [];
  const path = `components.${component.componentId || 'unknown'}`;
  if (!component.componentId.trim() || !component.scientificModelId) {
    issues.push({ code: 'invalid_component_identity', path, message: 'Component and scientific model identifiers are required.' });
  }
  const role = getScientificComponentRolePolicy(component.role);
  if (!role.permittedConstructs.includes(component.output.construct)) {
    issues.push({ code: 'invalid_role_construct', path: `${path}.output`, message: `${component.role} cannot expose ${component.output.construct}.` });
  }
  if (!constructUnitCompatible(component.output.construct, component.output.unit)) {
    issues.push({ code: 'invalid_construct_unit', path: `${path}.output`, message: `${component.output.construct} cannot use ${component.output.unit}.` });
  }
  if (component.output.construct === 'age_in_years'
    && !['primary_age_estimate', 'independent_age_estimate', 'research_only'].includes(component.role)) {
    issues.push({ code: 'invalid_role_construct', path: `${path}.output`, message: 'Only an age-estimate model or an explicitly blocked research record may identify an age-in-years construct.' });
  }
  if (component.role === 'pace_of_aging_measure'
    && (component.output.construct !== 'pace_per_biological_year'
      || component.output.unit !== 'pace_per_biological_year')) {
    issues.push({ code: 'invalid_role_construct', path: `${path}.output`, message: 'A pace component must retain the pace-per-biological-year construct and unit.' });
  }
  if (component.scientificModelVersion === null
    && component.combinationEligibility.status !== 'ineligible') {
    issues.push({ code: 'unknown_model_version', path: `${path}.scientificModelVersion`, message: 'A component without an exact version must be combination-ineligible.' });
  }
  const registeredVersion = component.scientificModelVersion === null
    ? undefined
    : SCIENTIFIC_MODEL_VERSIONS.find(version => version.modelId === component.scientificModelId
      && version.version === component.scientificModelVersion);
  if (component.scientificModelVersion !== null && !registeredVersion) {
    issues.push({ code: 'unknown_model_version', path: `${path}.scientificModelVersion`, message: 'Component version is not registered.' });
  }
  if (registeredVersion?.lifecycle === 'research_only'
    && (component.eligibilityStatus !== 'research_only'
      || component.combinationEligibility.status !== 'research_only')) {
    issues.push({ code: 'invalid_availability', path: `${path}.eligibilityStatus`, message: 'A research-only scientific version cannot masquerade as an eligible production component.' });
  }
  if (registeredVersion && ['unsupported', 'retired'].includes(registeredVersion.lifecycle)
    && !['unsupported', 'retired'].includes(component.eligibilityStatus)) {
    issues.push({ code: 'invalid_availability', path: `${path}.eligibilityStatus`, message: `${registeredVersion.lifecycle} scientific versions cannot be treated as eligible components.` });
  }
  const evidenceIds = new Set(SCIENTIFIC_EVIDENCE.map(reference => reference.id));
  if (component.evidenceReferenceIds.length === 0
    || component.evidenceReferenceIds.some(id => !evidenceIds.has(id))) {
    issues.push({ code: 'missing_evidence_reference', path: `${path}.evidenceReferenceIds`, message: 'Components require known peer-reviewed evidence references.' });
  }
  if (component.combinationEligibility.status === 'eligible_for_review'
    && component.populationApplicability.status !== 'supported') {
    issues.push({ code: 'population_not_supported', path: `${path}.populationApplicability`, message: 'Combination review requires supported population applicability.' });
  }
  const categories = component.uncertainty.map(record => record.category);
  duplicateValues(categories).forEach(category => issues.push({ code: 'duplicate_uncertainty_category', path: `${path}.uncertainty`, message: `Duplicate uncertainty category: ${category}.` }));
  UNCERTAINTY_CATEGORIES.forEach(category => {
    if (!categories.includes(category)) {
      issues.push({ code: 'missing_uncertainty_category', path: `${path}.uncertainty`, message: `Missing preserved uncertainty category: ${category}.` });
    }
  });
  if (component.provenanceSnapshot.registryModelId !== component.scientificModelId
    || component.provenanceSnapshot.registryModelVersion !== component.scientificModelVersion
    || component.provenanceSnapshot.authorizationReference !== component.executionAuthorizationReference) {
    issues.push({ code: 'invalid_provenance_snapshot', path: `${path}.provenanceSnapshot`, message: 'Provenance must preserve the exact model, version, and authorization identity.' });
  }
  if (component.eligibilityStatus === 'eligible'
    && component.combinationEligibility.status === 'eligible_for_review'
    && component.executionAuthorizationReference === null) {
    issues.push({ code: 'missing_execution_authorization', path: `${path}.executionAuthorizationReference`, message: 'An eligible execution snapshot requires its integrity-bound authorization reference.' });
  }
  if (component.overlap.completeness !== 'complete'
    && component.combinationEligibility.status === 'eligible_for_review') {
    issues.push({ code: 'unknown_overlap_metadata', path: `${path}.overlap`, message: 'Unknown or incomplete overlap metadata cannot enter combination review.' });
  }
  if (['interpretive_context', 'monitoring_signal', 'normative_context', 'pace_of_aging_measure', 'rejected'].includes(component.role)
    && !['ineligible', 'research_only'].includes(component.combinationEligibility.status)) {
    issues.push({ code: 'invalid_combination_status', path: `${path}.combinationEligibility`, message: `${component.role} cannot enter an age combination.` });
  }
  if ((component.role === 'research_only' || component.eligibilityStatus === 'research_only')
    && component.combinationEligibility.status !== 'research_only') {
    issues.push({ code: 'invalid_combination_status', path: `${path}.combinationEligibility`, message: 'Research-only evidence must remain research-only for combination.' });
  }
  validateComponentGovernance(component.governance).forEach(issue => {
    issues.push({ code: 'governance_invalid', path: `${path}.governance`, message: issue.message });
  });
  issues.push(...findProhibitedField(component, path));
  return issues;
}

export function assertMultimodalArchitectureIntegrity(): void {
  const issues = validateMultimodalArchitecture();
  if (issues.length > 0) {
    throw new Error(issues.map(issue => `${issue.path}: ${issue.message}`).join('\n'));
  }
}
