export type ScientificRubricCriterionId =
  | 'evidence_quality'
  | 'external_validation'
  | 'clinical_adoption'
  | 'reproducibility'
  | 'population_diversity'
  | 'longevity_relevance'
  | 'interpretability'
  | 'implementation_feasibility'
  | 'maintenance_cost'
  | 'future_expandability';

export interface ScientificRubricCriterion {
  id: ScientificRubricCriterionId;
  title: string;
  definition: string;
  requiredEvidence: readonly string[];
  reviewQuestions: readonly string[];
}

export const SCIENTIFIC_RUBRIC_VERSION = '1.0.0' as const;

export const SCIENTIFIC_EVALUATION_RUBRIC = [
  {
    id: 'evidence_quality',
    title: 'Evidence Quality',
    definition: 'Study design, peer-review status, bias control, statistical validity, and directness for the proposed use.',
    requiredEvidence: ['Primary model publication', 'Independent evidence synthesis where available'],
    reviewQuestions: ['Was the proposed output directly validated?', 'Are major sources of bias addressed?'],
  },
  {
    id: 'external_validation',
    title: 'External Validation',
    definition: 'Performance outside the derivation sample, institution, assay batch, and original investigators.',
    requiredEvidence: ['At least one independent population', 'Transparent validation protocol'],
    reviewQuestions: ['Was validation truly external?', 'Did performance remain clinically and statistically meaningful?'],
  },
  {
    id: 'clinical_adoption',
    title: 'Clinical Adoption',
    definition: 'Use in clinical practice, trials, guidelines, or regulated workflows without treating popularity as proof of validity.',
    requiredEvidence: ['Documented use setting', 'Scope and governance of adoption'],
    reviewQuestions: ['Is use clinical or research-only?', 'Does adoption match Vitalspan’s intended use?'],
  },
  {
    id: 'reproducibility',
    title: 'Reproducibility',
    definition: 'Ability to reproduce inputs and outputs across laboratories, devices, software versions, and repeated measurement.',
    requiredEvidence: ['Published specification', 'Measurement reliability evidence'],
    reviewQuestions: ['Are all parameters available?', 'Are assay and preprocessing effects quantified?'],
  },
  {
    id: 'population_diversity',
    title: 'Population Diversity',
    definition: 'Representation and validation across age, sex, ancestry, geography, socioeconomic context, and health status.',
    requiredEvidence: ['Derivation demographics', 'Validation demographics and subgroup performance'],
    reviewQuestions: ['Who is underrepresented?', 'Where would use require unsupported extrapolation?'],
  },
  {
    id: 'longevity_relevance',
    title: 'Longevity Relevance',
    definition: 'Direct evidence that the construct reflects aging biology or validated aging outcomes rather than a single risk factor.',
    requiredEvidence: ['Predefined aging construct', 'Relevant longitudinal outcomes'],
    reviewQuestions: ['Is this aging, disease risk, or chronological-age prediction?', 'Is the distinction explicit?'],
  },
  {
    id: 'interpretability',
    title: 'Interpretability',
    definition: 'Ability to explain model purpose, inputs, provenance, uncertainty, and limitations without causal overstatement.',
    requiredEvidence: ['Model specification', 'Documented failure and uncertainty behavior'],
    reviewQuestions: ['Can every input be audited?', 'Can limitations be stated without reverse engineering?'],
  },
  {
    id: 'implementation_feasibility',
    title: 'Implementation Feasibility',
    definition: 'Availability of validated inputs, units, reference data, licenses, and quality-control procedures.',
    requiredEvidence: ['Dependency inventory', 'Input compatibility assessment'],
    reviewQuestions: ['Can the published method be implemented exactly?', 'Would any substitution create a new model?'],
  },
  {
    id: 'maintenance_cost',
    title: 'Maintenance Cost',
    definition: 'Scientific and operational burden of monitoring model versions, assays, reference populations, and evidence updates.',
    requiredEvidence: ['Versioning plan', 'Revalidation and surveillance requirements'],
    reviewQuestions: ['What changes invalidate comparability?', 'Who owns scientific review?'],
  },
  {
    id: 'future_expandability',
    title: 'Future Expandability',
    definition: 'Ability to support versioned evidence additions without changing the meaning of existing model outputs.',
    requiredEvidence: ['Versioned contract proposal', 'Backward-compatibility analysis'],
    reviewQuestions: ['Can the model remain independent?', 'Can new evidence be added without hidden weighting?'],
  },
] as const satisfies readonly ScientificRubricCriterion[];
