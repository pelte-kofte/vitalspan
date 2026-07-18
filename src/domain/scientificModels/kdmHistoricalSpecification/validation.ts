import { KDM_HISTORICAL_BIOMARKERS } from './biomarkers';
import { KDM_HISTORICAL_EVIDENCE } from './evidence';
import { KDM_HISTORICAL_OPEN_QUESTIONS } from './openQuestions';
import {
  KDM_FUTURE_IMPLEMENTATION_CONTRACT,
  KDM_HISTORICAL_CONTEXT_SPECIFICATION,
  KDM_HISTORICAL_PIPELINE,
  KDM_HISTORICAL_RECONSTRUCTION_DECISION,
  KDM_PREPROCESSING_SPECIFICATION,
} from './specification';

export interface KdmHistoricalValidationIssue {
  code: string;
  path: string;
  message: string;
}

export function validateKdmHistoricalSpecification(): readonly KdmHistoricalValidationIssue[] {
  const issues: KdmHistoricalValidationIssue[] = [];
  const evidenceIds = new Set<string>();
  for (const source of KDM_HISTORICAL_EVIDENCE) {
    if (evidenceIds.has(source.id)) issues.push({ code: 'duplicate_evidence', path: source.id, message: 'Evidence ids must be unique.' });
    evidenceIds.add(source.id);
    if (!source.url.startsWith('https://')) issues.push({ code: 'invalid_evidence_url', path: source.id, message: 'Evidence must use an HTTPS source.' });
  }

  const checkEvidence = (path: string, ids: readonly string[]) => {
    if (ids.length === 0) issues.push({ code: 'missing_traceability', path, message: 'Every scientific claim requires evidence.' });
    for (const id of ids) if (!evidenceIds.has(id)) issues.push({ code: 'unresolved_evidence', path, message: `Evidence ${id} does not resolve.` });
  };

  const biomarkerIds = new Set<string>();
  for (const biomarker of KDM_HISTORICAL_BIOMARKERS) {
    const path = `biomarkers.${biomarker.id}`;
    if (biomarkerIds.has(biomarker.id)) issues.push({ code: 'duplicate_biomarker', path, message: 'Biomarker ids must be unique.' });
    biomarkerIds.add(biomarker.id);
    checkEvidence(path, biomarker.evidenceIds);
    checkEvidence(`${path}.unit`, biomarker.requiredUnit.evidenceIds);
    checkEvidence(`${path}.range`, biomarker.historicalRange.evidenceIds);
    checkEvidence(`${path}.transformation`, biomarker.transformationBeforeModel.evidenceIds);
    if (biomarker.productionAllowedRange.resolution !== 'unknown' || biomarker.productionAllowedRange.value !== null) {
      issues.push({ code: 'invented_production_range', path, message: 'The reconstruction may not promote archive ranges into production bounds.' });
    }
  }

  for (const stage of KDM_HISTORICAL_PIPELINE) checkEvidence(`pipeline.${stage.id}`, stage.evidenceIds);
  checkEvidence('context.referenceCohort', KDM_HISTORICAL_CONTEXT_SPECIFICATION.referenceCohort.evidenceIds);
  checkEvidence('context.measurementTiming', KDM_HISTORICAL_CONTEXT_SPECIFICATION.measurementTiming.evidenceIds);
  checkEvidence('context.laboratoryRequirements', KDM_HISTORICAL_CONTEXT_SPECIFICATION.laboratoryRequirements.evidenceIds);
  checkEvidence('context.qualityControlPolicy', KDM_HISTORICAL_CONTEXT_SPECIFICATION.qualityControlPolicy.evidenceIds);
  for (const [index, assumption] of KDM_HISTORICAL_CONTEXT_SPECIFICATION.statisticalAssumptions.entries()) {
    checkEvidence(`context.statisticalAssumptions.${index}`, assumption.evidenceIds);
  }
  for (const operation of KDM_PREPROCESSING_SPECIFICATION) checkEvidence(`preprocessing.${operation.operation}`, operation.evidenceIds);
  for (const question of KDM_HISTORICAL_OPEN_QUESTIONS) checkEvidence(`questions.${question.id}`, question.evidenceIds);

  const orders = KDM_HISTORICAL_PIPELINE.map(stage => stage.order);
  if (new Set(orders).size !== orders.length || orders.some((order, index) => order !== index + 1)) {
    issues.push({ code: 'invalid_pipeline_order', path: 'pipeline', message: 'Pipeline stages must have a unique contiguous order.' });
  }

  const cmv = KDM_HISTORICAL_BIOMARKERS.find(item => item.id === 'cmv_optical_density');
  if (cmv?.mappingStatus !== 'incompatible_public_artifact' || cmv.requiredUnit.resolution !== 'conflicted') {
    issues.push({ code: 'cmv_conflict_lost', path: 'biomarkers.cmv_optical_density', message: 'The public CMV incompatibility must remain explicit.' });
  }
  if (KDM_FUTURE_IMPLEMENTATION_CONTRACT.implementationAuthorized !== false || KDM_FUTURE_IMPLEMENTATION_CONTRACT.executionAllowed !== false) {
    issues.push({ code: 'execution_enabled', path: 'implementationContract', message: 'This phase must never enable implementation or execution.' });
  }
  if (KDM_HISTORICAL_RECONSTRUCTION_DECISION.goNoGo !== 'not_yet' || KDM_HISTORICAL_RECONSTRUCTION_DECISION.faithfulImplementationPossibleNow !== false) {
    issues.push({ code: 'unsafe_go_decision', path: 'decision', message: 'Blocking unknowns require NOT YET.' });
  }
  if (!KDM_HISTORICAL_OPEN_QUESTIONS.some(question => question.severity === 'blocking')) {
    issues.push({ code: 'missing_blockers', path: 'questions', message: 'Known blocking unknowns must remain represented.' });
  }
  return issues;
}
