import { SCIENTIFIC_RUBRIC_VERSION, type ScientificRubricCriterionId } from '../rubric';
import type {
  ComponentGovernanceRecord,
  ComponentGovernanceStage,
  MultimodalRubricCriterionId,
} from './contracts';

export const COMPONENT_GOVERNANCE_STAGE_ORDER = [
  'registry_entry',
  'evidence_audit',
  'internal_rubric_review',
  'versioned_input_policy',
  'eligibility_implementation',
  'calculation_implementation',
  'independent_verification',
  'compatibility_review',
  'combination_authorization',
  'production_approval',
] as const satisfies readonly ComponentGovernanceStage[];

export interface MultimodalRubricDimension {
  id: MultimodalRubricCriterionId;
  source: 'existing_scientific_rubric' | 'multimodal_extension';
  reviewPurpose: string;
}

const EXISTING_RUBRIC_DIMENSIONS = [
  'evidence_quality',
  'external_validation',
  'reproducibility',
  'population_diversity',
  'longevity_relevance',
  'implementation_feasibility',
  'maintenance_cost',
] as const satisfies readonly ScientificRubricCriterionId[];

export const MULTIMODAL_RUBRIC_DIMENSIONS = [
  ...EXISTING_RUBRIC_DIMENSIONS.map(id => ({
    id,
    source: 'existing_scientific_rubric' as const,
    reviewPurpose: `Apply existing ${id.replace(/_/g, ' ')} evidence requirements to the proposed component role.`,
  })),
  {
    id: 'construct_compatibility',
    source: 'multimodal_extension',
    reviewPurpose: 'Determine whether output meaning and units are compatible without converting one construct into another.',
  },
  {
    id: 'overlap_risk',
    source: 'multimodal_extension',
    reviewPurpose: 'Audit shared inputs, populations, outcomes, correlation groups, and double-counting risk.',
  },
  {
    id: 'independent_replication',
    source: 'multimodal_extension',
    reviewPurpose: 'Require verification independent from derivation authors, implementation code, and candidate composite design.',
  },
] as const satisfies readonly MultimodalRubricDimension[];

export type ComponentGovernanceIssueCode =
  | 'duplicate_stage'
  | 'stage_skipped'
  | 'invalid_current_stage'
  | 'approval_without_complete_review'
  | 'approval_without_reviewer'
  | 'rubric_version_mismatch'
  | 'invalid_terminal_state'
  | 'production_without_full_lifecycle';

export interface ComponentGovernanceIssue {
  code: ComponentGovernanceIssueCode;
  message: string;
}

export function validateComponentGovernance(
  governance: ComponentGovernanceRecord,
): readonly ComponentGovernanceIssue[] {
  const issues: ComponentGovernanceIssue[] = [];
  const completed = governance.completedStages;
  if (new Set(completed).size !== completed.length) {
    issues.push({ code: 'duplicate_stage', message: 'A governance stage may be completed only once.' });
  }
  completed.forEach((stage, index) => {
    if (COMPONENT_GOVERNANCE_STAGE_ORDER[index] !== stage) {
      issues.push({ code: 'stage_skipped', message: `Governance stage ${stage} is not the next required stage.` });
    }
  });

  const expectedCurrent = COMPONENT_GOVERNANCE_STAGE_ORDER[completed.length] ?? null;
  if (governance.currentStage !== expectedCurrent
    && !['retired', 'superseded', 'rejected'].includes(governance.lifecycleStatus)) {
    issues.push({ code: 'invalid_current_stage', message: `Current stage must be ${expectedCurrent ?? 'null'} after the completed stage sequence.` });
  }

  const rubric = governance.rubricReview;
  if (rubric.rubricVersion !== SCIENTIFIC_RUBRIC_VERSION) {
    issues.push({ code: 'rubric_version_mismatch', message: 'Component review must reference the active unscored scientific rubric version.' });
  }
  if (rubric.decision === 'approved' && rubric.completeness !== 'complete') {
    issues.push({ code: 'approval_without_complete_review', message: 'Rubric approval requires a complete evidence review.' });
  }
  if (rubric.decision === 'approved' && rubric.reviewerReferences.length === 0) {
    issues.push({ code: 'approval_without_reviewer', message: 'Rubric approval requires reviewer provenance.' });
  }

  if (governance.lifecycleStatus === 'production_approved') {
    if (completed.length !== COMPONENT_GOVERNANCE_STAGE_ORDER.length
      || governance.currentStage !== null) {
      issues.push({ code: 'production_without_full_lifecycle', message: 'Production approval requires every governance stage in order.' });
    }
  }
  if (governance.lifecycleStatus === 'retired' && !governance.retirementReason?.trim()) {
    issues.push({ code: 'invalid_terminal_state', message: 'Retirement requires a scientific reason.' });
  }
  if (governance.lifecycleStatus === 'superseded' && !governance.supersededByComponentId?.trim()) {
    issues.push({ code: 'invalid_terminal_state', message: 'Supersession requires the replacement component id.' });
  }
  if (governance.lifecycleStatus === 'rejected' && rubric.decision !== 'rejected') {
    issues.push({ code: 'invalid_terminal_state', message: 'A rejected component requires an explicit scientific-review rejection.' });
  }
  if (!['retired', 'superseded'].includes(governance.lifecycleStatus)
    && (governance.retirementReason !== null || governance.supersededByComponentId !== null)) {
    issues.push({ code: 'invalid_terminal_state', message: 'Only retired or superseded components may carry terminal lifecycle metadata.' });
  }
  return issues;
}
