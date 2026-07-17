import { SCIENTIFIC_EVIDENCE } from './evidence';
import { SCIENTIFIC_INPUT_POLICIES } from './inputPolicies';
import type {
  ScientificModelClassification,
  ScientificModelId,
  ScientificModelRecord,
  ScientificUseDecision,
} from './models';
import { SCIENTIFIC_MODEL_ALIASES, SCIENTIFIC_MODEL_REGISTRY } from './registry';
import { SCIENTIFIC_EVALUATION_RUBRIC } from './rubric';
import { SCIENTIFIC_UNCERTAINTY_POLICY } from './uncertainty';

export type ScientificRegistryIssueCode =
  | 'duplicate_id'
  | 'missing_evidence'
  | 'unknown_evidence'
  | 'unknown_related_model'
  | 'invalid_self_reference'
  | 'invalid_decision'
  | 'missing_input_policy'
  | 'unexpected_input_policy'
  | 'unknown_input_policy'
  | 'invalid_metadata'
  | 'invalid_reference'
  | 'invalid_alias'
  | 'prohibited_runtime_field';

export interface ScientificRegistryIssue {
  code: ScientificRegistryIssueCode;
  path: string;
  message: string;
}

const EXPECTED_DECISION: Record<ScientificModelClassification, ScientificUseDecision> = {
  core_biological_age_model: 'accepted_candidate',
  candidate_modifier: 'accepted_candidate',
  context_only: 'reference_only',
  research_only: 'deferred',
  rejected: 'excluded',
  placeholder: 'deferred',
};

const PROHIBITED_FIELDS = new Set([
  'calculation',
  'coefficient',
  'formula',
  'healthScore',
  'modelScore',
  'weight',
  'estimatedAge',
  'lifespan',
]);

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  values.forEach(value => seen.has(value) ? repeated.add(value) : seen.add(value));
  return [...repeated];
}

function hasTextList(value: readonly string[]): boolean {
  return value.length > 0 && value.every(item => item.trim().length > 0);
}

function validateModel(
  model: ScientificModelRecord,
  modelIds: ReadonlySet<string>,
  evidenceIds: ReadonlySet<string>,
  inputPolicyIds: ReadonlySet<string>,
): ScientificRegistryIssue[] {
  const issues: ScientificRegistryIssue[] = [];
  const path = `models.${model.id}`;

  if (!model.modelName.trim() || !model.purpose.trim() || !hasTextList(model.primaryInputs)
    || !hasTextList(model.population) || !hasTextList(model.strengths)
    || !hasTextList(model.knownLimitations)) {
    issues.push({ code: 'invalid_metadata', path, message: 'Required scientific metadata must be non-empty.' });
  }
  if (model.evidenceReferenceIds.length === 0) {
    issues.push({ code: 'missing_evidence', path, message: 'Every registry entry requires peer-reviewed evidence.' });
  }
  model.evidenceReferenceIds.forEach(id => {
    if (!evidenceIds.has(id)) {
      issues.push({ code: 'unknown_evidence', path: `${path}.evidenceReferenceIds`, message: `Unknown evidence reference: ${id}.` });
    }
  });
  model.relatedModelIds.forEach(id => {
    if (id === model.id) {
      issues.push({ code: 'invalid_self_reference', path: `${path}.relatedModelIds`, message: 'A model cannot relate to itself.' });
    } else if (!modelIds.has(id)) {
      issues.push({ code: 'unknown_related_model', path: `${path}.relatedModelIds`, message: `Unknown related model: ${id}.` });
    }
  });

  if (model.useDecision !== EXPECTED_DECISION[model.classification]) {
    issues.push({ code: 'invalid_decision', path, message: `${model.classification} must use decision ${EXPECTED_DECISION[model.classification]}.` });
  }
  if (model.useDecision === 'accepted_candidate' && model.inputPolicyId === null) {
    issues.push({ code: 'missing_input_policy', path, message: 'Accepted candidates require an explicit input policy.' });
  }
  if (model.useDecision !== 'accepted_candidate' && model.inputPolicyId !== null) {
    issues.push({ code: 'unexpected_input_policy', path, message: 'Only accepted candidates may expose an input policy.' });
  }
  if (model.inputPolicyId !== null && !inputPolicyIds.has(model.inputPolicyId)) {
    issues.push({ code: 'unknown_input_policy', path, message: `Unknown input policy: ${model.inputPolicyId}.` });
  }
  Object.keys(model).forEach(key => {
    if (PROHIBITED_FIELDS.has(key)) {
      issues.push({ code: 'prohibited_runtime_field', path: `${path}.${key}`, message: 'The scientific registry cannot contain calculations, scores, weights, or age estimates.' });
    }
  });
  return issues;
}

export function validateScientificRegistry(
  registry: readonly ScientificModelRecord[] = SCIENTIFIC_MODEL_REGISTRY,
): readonly ScientificRegistryIssue[] {
  const issues: ScientificRegistryIssue[] = [];
  const modelIds = new Set(registry.map(model => model.id));
  const evidenceIds = new Set(SCIENTIFIC_EVIDENCE.map(reference => reference.id));
  const inputPolicyIds = new Set(SCIENTIFIC_INPUT_POLICIES.map(policy => policy.id));

  duplicates(registry.map(model => model.id)).forEach(id => {
    issues.push({ code: 'duplicate_id', path: 'models', message: `Duplicate model id: ${id}.` });
  });
  duplicates(SCIENTIFIC_EVIDENCE.map(reference => reference.id)).forEach(id => {
    issues.push({ code: 'duplicate_id', path: 'evidence', message: `Duplicate evidence id: ${id}.` });
  });
  duplicates(SCIENTIFIC_INPUT_POLICIES.map(policy => policy.id)).forEach(id => {
    issues.push({ code: 'duplicate_id', path: 'inputPolicies', message: `Duplicate input policy id: ${id}.` });
  });
  duplicates(SCIENTIFIC_EVALUATION_RUBRIC.map(criterion => criterion.id)).forEach(id => {
    issues.push({ code: 'duplicate_id', path: 'rubric', message: `Duplicate rubric criterion: ${id}.` });
  });
  duplicates(SCIENTIFIC_UNCERTAINTY_POLICY.map(rule => rule.id)).forEach(id => {
    issues.push({ code: 'duplicate_id', path: 'uncertainty', message: `Duplicate uncertainty rule: ${id}.` });
  });

  registry.forEach(model => issues.push(...validateModel(model, modelIds, evidenceIds, inputPolicyIds)));

  SCIENTIFIC_EVIDENCE.forEach(reference => {
    if (!reference.doi.trim() || !reference.pmid.trim() || !reference.url.startsWith('https://')) {
      issues.push({ code: 'invalid_reference', path: `evidence.${reference.id}`, message: 'Evidence requires DOI, PMID, and HTTPS source URL.' });
    }
  });

  duplicates(SCIENTIFIC_MODEL_ALIASES.map(alias => alias.alias.toLowerCase())).forEach(alias => {
    issues.push({ code: 'duplicate_id', path: 'aliases', message: `Duplicate model alias: ${alias}.` });
  });
  SCIENTIFIC_MODEL_ALIASES.forEach(alias => {
    if (!alias.alias.trim() || !alias.clarification.trim() || !modelIds.has(alias.canonicalModelId)) {
      issues.push({ code: 'invalid_alias', path: `aliases.${alias.alias}`, message: 'Aliases require text and a valid canonical model.' });
    }
  });

  return issues;
}

export function assertScientificRegistryIntegrity(): void {
  const issues = validateScientificRegistry();
  if (issues.length > 0) {
    throw new Error(issues.map(issue => `${issue.path}: ${issue.message}`).join('\n'));
  }
}

export function getScientificModel(id: ScientificModelId): ScientificModelRecord {
  const model = SCIENTIFIC_MODEL_REGISTRY.find(candidate => candidate.id === id);
  if (!model) throw new Error(`Unknown scientific model: ${id}.`);
  return model;
}
