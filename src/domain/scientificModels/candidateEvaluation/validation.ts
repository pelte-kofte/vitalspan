import { SCIENTIFIC_EVIDENCE } from '../evidence';
import { SCIENTIFIC_MODEL_REGISTRY } from '../registry';
import { CANDIDATE_EVALUATION_RUBRIC } from './rubric';
import { CANDIDATE_PRIORITIZATION_DECISION, SCIENTIFIC_CANDIDATE_DOSSIERS } from './prioritization';
import type {
  CandidateArchitectureArea,
  CandidatePriorityTier,
  CandidateRiskCategory,
  ScientificCandidateDossier,
  ScientificCandidateId,
} from './contracts';

export type CandidateEvaluationIssueCode =
  | 'duplicate_candidate'
  | 'missing_candidate'
  | 'unknown_model'
  | 'unknown_evidence'
  | 'incomplete_rubric'
  | 'incomplete_architecture_review'
  | 'incomplete_risk_review'
  | 'incomplete_evidence_profile'
  | 'invalid_readiness'
  | 'invalid_priority_tier'
  | 'governance_bypass'
  | 'prohibited_numeric_scoring_field'
  | 'invalid_prioritization';

export interface CandidateEvaluationIssue {
  code: CandidateEvaluationIssueCode;
  path: string;
  message: string;
}

const REQUIRED_CANDIDATES = [
  'clinical_phenoage_reference', 'kdm', 'vo2max', 'dunedinpace', 'dnam_phenoage',
  'grim_age', 'cardiometage', 'frailty_index', 'hrv_biological_age',
  'sleep_biological_age',
] as const satisfies readonly ScientificCandidateId[];

const ARCHITECTURE_AREAS = [
  'scientific_registry', 'eligibility_engine', 'execution_authorization', 'versioning',
  'scientific_governance', 'component_contracts', 'temporal_policies',
  'uncertainty_architecture', 'combination_safety', 'presentation_layer',
  'multimodal_framework', 'living_sphere',
] as const satisfies readonly CandidateArchitectureArea[];

const RISK_CATEGORIES = [
  'scientific_uncertainty', 'implementation_risk', 'maintenance_risk',
  'future_migration_risk', 'regulatory_ambiguity', 'clinical_interpretation_risk',
  'user_misunderstanding_risk', 'biological_age_overstatement_risk',
  'unsupported_marketing_risk', 'double_counting_risk',
  'population_transportability_risk', 'version_drift_risk',
] as const satisfies readonly CandidateRiskCategory[];

const PROHIBITED_KEYS = new Set([
  'score', 'numericScore', 'totalScore', 'weightedScore', 'weight', 'coefficient',
  'formula', 'calculation', 'estimatedAge', 'compositeAge',
]);

function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicate = new Set<string>();
  values.forEach(value => seen.has(value) ? duplicate.add(value) : seen.add(value));
  return [...duplicate];
}

function missingText(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0 || value.some(item => missingText(item));
  return false;
}

function findProhibitedKeys(value: unknown, path: string): CandidateEvaluationIssue[] {
  if (value === null || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((item, index) => findProhibitedKeys(item, `${path}.${index}`));
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => [
    ...(PROHIBITED_KEYS.has(key)
      ? [{ code: 'prohibited_numeric_scoring_field' as const, path: `${path}.${key}`, message: 'Candidate evaluation cannot contain calculations, numeric scores, coefficients, or weighting.' }]
      : []),
    ...findProhibitedKeys(child, `${path}.${key}`),
  ]);
}

function validateDossier(
  dossier: ScientificCandidateDossier,
  modelIds: ReadonlySet<string>,
  evidenceIds: ReadonlySet<string>,
): CandidateEvaluationIssue[] {
  const issues: CandidateEvaluationIssue[] = [];
  const path = `candidates.${dossier.id}`;
  dossier.scientificModelIds.forEach(id => {
    if (!modelIds.has(id)) issues.push({ code: 'unknown_model', path: `${path}.scientificModelIds`, message: `Unknown model: ${id}.` });
  });
  if (dossier.evidenceReferenceIds.length === 0
    || dossier.evidenceReferenceIds.some(id => !evidenceIds.has(id))) {
    issues.push({ code: 'unknown_evidence', path: `${path}.evidenceReferenceIds`, message: 'Every dossier requires known peer-reviewed evidence.' });
  }
  const rubricIds = dossier.rubric.map(item => item.criterionId);
  const expectedRubric = CANDIDATE_EVALUATION_RUBRIC.map(item => item.id);
  if (duplicates(rubricIds).length > 0 || expectedRubric.some(id => !rubricIds.includes(id))
    || dossier.rubric.some(item => !item.rationale.trim()
      || item.evidenceReferenceIds.some(id => !evidenceIds.has(id)))) {
    issues.push({ code: 'incomplete_rubric', path: `${path}.rubric`, message: 'Every qualitative rubric criterion requires rationale and valid evidence.' });
  }
  const architectureAreas = dossier.architectureFit.map(item => item.area);
  if (duplicates(architectureAreas).length > 0
    || ARCHITECTURE_AREAS.some(area => !architectureAreas.includes(area))
    || dossier.architectureFit.some(item => !item.rationale.trim())) {
    issues.push({ code: 'incomplete_architecture_review', path: `${path}.architectureFit`, message: 'Every architecture area requires an explicit assessment.' });
  }
  const risks = dossier.risks.map(item => item.category);
  if (duplicates(risks).length > 0 || RISK_CATEGORIES.some(category => !risks.includes(category))
    || dossier.risks.some(item => !item.rationale.trim() || !item.mitigation.trim())) {
    issues.push({ code: 'incomplete_risk_review', path: `${path}.risks`, message: 'Every risk category requires rationale and mitigation.' });
  }
  if (Object.values(dossier.evidenceProfile).some(value => missingText(value))) {
    issues.push({ code: 'incomplete_evidence_profile', path: `${path}.evidenceProfile`, message: 'Evidence profile fields must be complete and non-empty.' });
  }
  if (dossier.canBypassGovernance !== false || dossier.governancePrerequisites.length === 0) {
    issues.push({ code: 'governance_bypass', path, message: 'No candidate may bypass governance.' });
  }
  if (dossier.id === 'clinical_phenoage_reference'
    && (!dossier.referenceOnly || dossier.priorityTier !== 'reference_only')) {
    issues.push({ code: 'invalid_readiness', path, message: 'Clinical PhenoAge is reference-only in this evaluation.' });
  }
  if (dossier.id !== 'clinical_phenoage_reference' && dossier.implementationReadiness === 'production_ready') {
    issues.push({ code: 'invalid_readiness', path, message: 'No new candidate is production ready.' });
  }
  if (dossier.implementationReadiness === 'rejected' && dossier.priorityTier !== 'rejected') {
    issues.push({ code: 'invalid_priority_tier', path, message: 'Rejected candidates must remain in the rejected tier.' });
  }
  issues.push(...findProhibitedKeys(dossier, path));
  return issues;
}

export function validateScientificCandidateEvaluations(): readonly CandidateEvaluationIssue[] {
  const issues: CandidateEvaluationIssue[] = [];
  const ids = SCIENTIFIC_CANDIDATE_DOSSIERS.map(dossier => dossier.id);
  duplicates(ids).forEach(id => issues.push({ code: 'duplicate_candidate', path: 'candidates', message: `Duplicate candidate: ${id}.` }));
  REQUIRED_CANDIDATES.forEach(id => {
    if (!ids.includes(id)) issues.push({ code: 'missing_candidate', path: 'candidates', message: `Missing candidate: ${id}.` });
  });
  const modelIds = new Set(SCIENTIFIC_MODEL_REGISTRY.map(model => model.id));
  const evidenceIds = new Set(SCIENTIFIC_EVIDENCE.map(reference => reference.id));
  SCIENTIFIC_CANDIDATE_DOSSIERS.forEach(dossier => issues.push(...validateDossier(dossier, modelIds, evidenceIds)));

  const tierIds = (Object.keys(CANDIDATE_PRIORITIZATION_DECISION.tierOrder) as CandidatePriorityTier[])
    .flatMap(tier => CANDIDATE_PRIORITIZATION_DECISION.tierOrder[tier]);
  if (duplicates(tierIds).length > 0 || ids.some(id => !tierIds.includes(id))
    || CANDIDATE_PRIORITIZATION_DECISION.productionImplementationAuthorizedNow !== false) {
    issues.push({ code: 'invalid_prioritization', path: 'prioritization', message: 'Prioritization must cover each candidate exactly once and authorize no new production implementation.' });
  }
  SCIENTIFIC_CANDIDATE_DOSSIERS.forEach(dossier => {
    const tierCandidateIds: readonly string[] = CANDIDATE_PRIORITIZATION_DECISION
      .tierOrder[dossier.priorityTier];
    if (!tierCandidateIds.includes(dossier.id)) {
      issues.push({ code: 'invalid_priority_tier', path: `candidates.${dossier.id}.priorityTier`, message: 'Dossier tier does not match the canonical roadmap.' });
    }
  });
  issues.push(...findProhibitedKeys(CANDIDATE_PRIORITIZATION_DECISION, 'prioritization'));
  return issues;
}

export function assertScientificCandidateEvaluationIntegrity(): void {
  const issues = validateScientificCandidateEvaluations();
  if (issues.length > 0) throw new Error(issues.map(issue => `${issue.path}: ${issue.message}`).join('\n'));
}
