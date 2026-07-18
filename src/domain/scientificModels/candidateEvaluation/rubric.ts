import type { CandidateRubricCriterionDefinition } from './contracts';

export const CANDIDATE_EVALUATION_RUBRIC_VERSION = '1.0.0' as const;

export const CANDIDATE_EVALUATION_RUBRIC = [
  { id: 'scientific_evidence_quality', title: 'Scientific Evidence Quality', question: 'How directly and rigorously does peer-reviewed evidence support the proposed construct and use?', existingRubricCriterionId: 'evidence_quality' },
  { id: 'external_validation', title: 'External Validation', question: 'Has performance been evaluated outside derivation data and investigators?', existingRubricCriterionId: 'external_validation' },
  { id: 'independent_replication', title: 'Independent Replication', question: 'Has the model been independently reproduced with compatible inputs and outcomes?', existingRubricCriterionId: 'reproducibility' },
  { id: 'population_diversity', title: 'Population Diversity', question: 'Are derivation and validation populations sufficiently diverse for intended use?', existingRubricCriterionId: 'population_diversity' },
  { id: 'clinical_relevance', title: 'Clinical Relevance', question: 'Does the construct have a clear, appropriately bounded clinical or health interpretation?', existingRubricCriterionId: 'clinical_adoption' },
  { id: 'longevity_relevance', title: 'Longevity Relevance', question: 'Does the model measure an aging construct rather than only disease risk or chronological age?', existingRubricCriterionId: 'longevity_relevance' },
  { id: 'construct_clarity', title: 'Construct Clarity', question: 'Is the output meaning explicit and distinct from age, pace, risk, frailty, or context?', existingRubricCriterionId: 'interpretability' },
  { id: 'interpretability', title: 'Interpretability', question: 'Can inputs, output, provenance, uncertainty, and limitations be explained without overstatement?', existingRubricCriterionId: 'interpretability' },
  { id: 'input_reliability', title: 'Input Reliability', question: 'Can inputs be measured reproducibly under a validated protocol?', existingRubricCriterionId: 'reproducibility' },
  { id: 'measurement_availability', title: 'Measurement Availability', question: 'Are required measurements realistically accessible to Vitalspan users?', existingRubricCriterionId: 'implementation_feasibility' },
  { id: 'standardization', title: 'Standardization', question: 'Are assay, device, preprocessing, units, and reference procedures standardized?', existingRubricCriterionId: 'reproducibility' },
  { id: 'implementation_complexity', title: 'Implementation Complexity', question: 'Can the published method be implemented and verified without scientific substitution?', existingRubricCriterionId: 'implementation_feasibility' },
  { id: 'maintenance_burden', title: 'Maintenance Burden', question: 'What surveillance, assay, dependency, and revalidation burden will persist?', existingRubricCriterionId: 'maintenance_cost' },
  { id: 'calibration_availability', title: 'Calibration Availability', question: 'Is an exact, licensed, population-compatible calibration available?', existingRubricCriterionId: 'implementation_feasibility' },
  { id: 'version_stability', title: 'Version Stability', question: 'Can one immutable scientific version be maintained and reproduced?', existingRubricCriterionId: 'future_expandability' },
  { id: 'temporal_robustness', title: 'Temporal Robustness', question: 'Are measurement window, repeatability, and longitudinal meaning scientifically governed?', existingRubricCriterionId: 'reproducibility' },
  { id: 'generalizability', title: 'Generalizability', question: 'Is transport beyond derivation populations and settings supported?', existingRubricCriterionId: 'population_diversity' },
  { id: 'risk_of_misuse', title: 'Risk of Misuse', question: 'How easily could the output be mistaken for diagnosis, lifespan, treatment effect, or whole-person age?', existingRubricCriterionId: 'interpretability' },
  { id: 'double_counting_risk', title: 'Double-Counting Risk', question: 'Does the model reuse inputs, physiology, outcomes, or training targets already represented?', existingRubricCriterionId: null },
  { id: 'correlation_with_production_model', title: 'Correlation with Production Model', question: 'How dependent or correlated is the candidate with Clinical PhenoAge?', existingRubricCriterionId: null },
  { id: 'architecture_compatibility', title: 'Architecture Compatibility', question: 'Can the candidate use existing registry, eligibility, authorization, version, and uncertainty boundaries?', existingRubricCriterionId: 'future_expandability' },
  { id: 'multimodal_suitability', title: 'Multimodal Suitability', question: 'Would the candidate add independent validated information without unsupported synthesis?', existingRubricCriterionId: null },
  { id: 'expert_review_need', title: 'Expert Review Need', question: 'What independent scientific, clinical, statistical, or laboratory review is required?', existingRubricCriterionId: null },
  { id: 'future_calibration_need', title: 'Future Calibration Need', question: 'Would use require new or population-specific calibration?', existingRubricCriterionId: null },
  { id: 'additional_governance_need', title: 'Additional Governance Need', question: 'What new authorization, surveillance, licensing, or retirement governance is required?', existingRubricCriterionId: null },
] as const satisfies readonly CandidateRubricCriterionDefinition[];
