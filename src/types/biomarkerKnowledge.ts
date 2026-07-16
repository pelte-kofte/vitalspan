export type EvidenceGrade =
  | 'high'
  | 'moderate'
  | 'low'
  | 'insufficient'
  | 'not_reviewed';

export interface SourceLabRange {
  lowerBound?: number;
  upperBound?: number;
  unit: string;
  reportedText?: string;
  laboratoryName?: string;
}

export interface ClinicalDecisionRule {
  id: string;
  label: string;
  comparator: 'less_than' | 'less_than_or_equal' | 'greater_than' | 'greater_than_or_equal' | 'between';
  threshold: number | [number, number];
  unit: string;
  action: 'review' | 'urgent_review' | 'emergency';
  populationContext?: string;
  citations: string[];
  reviewer: string;
  reviewedAt: string;
}

export interface RiskAssociationBand {
  label: string;
  lowerBound?: number;
  upperBound?: number;
  unit: string;
  populationContext: string;
  evidenceGrade: EvidenceGrade;
  citations: string[];
}

export interface TreatmentTarget {
  label: string;
  lowerBound?: number;
  upperBound?: number;
  unit: string;
  populationContext: string;
  evidenceGrade: EvidenceGrade;
  citations: string[];
}

export interface PopulationContext {
  ageRange?: [number, number];
  sex?: 'female' | 'male' | 'all';
  pregnancyContext?: string;
  conditions?: string[];
  notes?: string;
}

export interface SpecimenAndAssayContext {
  specimen?: string;
  assay?: string;
  fastingRequired?: boolean;
  collectionTiming?: string;
  notes?: string;
}

export interface UnitConversionDefinition {
  fromUnit: string;
  toUnit: string;
  multiplier?: number;
  offset?: number;
  formula?: string;
}

/**
 * Compatibility shape for the future reviewed biomarker knowledge system.
 * Legacy biomarkers intentionally leave reviewed fields empty rather than
 * treating their historical optMin/optMax values as clinical truth.
 */
export interface BiomarkerKnowledgeFields {
  sourceLabRange?: SourceLabRange;
  clinicalDecisionRules?: ClinicalDecisionRule[];
  riskAssociationBands?: RiskAssociationBand[];
  treatmentTargets?: TreatmentTarget[];
  populationContext?: PopulationContext;
  specimenAndAssayContext?: SpecimenAndAssayContext;
  evidenceGrade?: EvidenceGrade;
  citations?: string[];
  reviewer?: string;
  reviewedAt?: string;
  unitConversions?: UnitConversionDefinition[];
}

export interface BiomarkerKnowledgeCompatibility extends BiomarkerKnowledgeFields {
  reviewStatus: 'reviewed' | 'legacy_unreviewed';
}

export function createLegacyKnowledgeCompatibility(
  fields: BiomarkerKnowledgeFields = {},
): BiomarkerKnowledgeCompatibility {
  const reviewed = Boolean(fields.reviewer && fields.reviewedAt);
  return {
    ...fields,
    clinicalDecisionRules: fields.clinicalDecisionRules ?? [],
    riskAssociationBands: fields.riskAssociationBands ?? [],
    treatmentTargets: fields.treatmentTargets ?? [],
    citations: fields.citations ?? [],
    unitConversions: fields.unitConversions ?? [],
    evidenceGrade: fields.evidenceGrade ?? 'not_reviewed',
    reviewStatus: reviewed ? 'reviewed' : 'legacy_unreviewed',
  };
}
