import type { EvidenceReferenceId } from '../models';
import type {
  ArchitectureFitStatus,
  CandidateArchitectureArea,
  CandidateArchitectureAssessment,
  CandidateRiskAssessment,
  CandidateRiskCategory,
  CandidateRiskLevel,
  CandidateRubricAssessment,
  CandidateRubricCriterionId,
  QualitativeScientificAssessment,
} from './contracts';
import { CANDIDATE_EVALUATION_RUBRIC } from './rubric';

type RubricInput = Readonly<Record<
CandidateRubricCriterionId,
readonly [QualitativeScientificAssessment, string]
>>;

type ArchitectureInput = Readonly<Record<
CandidateArchitectureArea,
readonly [ArchitectureFitStatus, string]
>>;

type RiskInput = Readonly<Record<
CandidateRiskCategory,
readonly [CandidateRiskLevel, string, string]
>>;

export function defineCandidateRubric(
  evidenceReferenceIds: readonly EvidenceReferenceId[],
  input: RubricInput,
): readonly CandidateRubricAssessment[] {
  return CANDIDATE_EVALUATION_RUBRIC.map(criterion => ({
    criterionId: criterion.id,
    assessment: input[criterion.id][0],
    rationale: input[criterion.id][1],
    evidenceReferenceIds,
  }));
}

export function defineArchitectureFit(
  input: ArchitectureInput,
): readonly CandidateArchitectureAssessment[] {
  return (Object.keys(input) as CandidateArchitectureArea[]).map(area => ({
    area,
    status: input[area][0],
    rationale: input[area][1],
  }));
}

export function defineCandidateRisks(
  input: RiskInput,
): readonly CandidateRiskAssessment[] {
  return (Object.keys(input) as CandidateRiskCategory[]).map(category => ({
    category,
    level: input[category][0],
    rationale: input[category][1],
    mitigation: input[category][2],
  }));
}
