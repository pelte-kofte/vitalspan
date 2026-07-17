import {
  evaluateClinicalPhenoAgeForProduct,
  type ClinicalPhenoAgeProductFailure,
  type ClinicalPhenoAgeRequirementPresentationSource,
} from './clinicalPhenoAgeProduct';
import type { StoredEntry } from '../types/biomarkerEntry';
import {
  CLINICAL_PHENOAGE_MODEL_VERSION,
  type ScientificEligibilityConfidence,
} from '../domain/scientificModels';

export interface ClinicalPhenoAgePresentation {
  status: 'available' | 'unavailable';
  valueYears: number | null;
  formattedValue: string | null;
  chronologicalAgeYears: number | null;
  ageValid: boolean;
  calculatedAt: string | null;
  presentCount: number;
  totalRequired: 9;
  missingCount: number;
  unavailableMeasurements: readonly string[];
  requirements: readonly ClinicalPhenoAgeRequirementPresentationSource[];
  limitations: readonly string[];
  failure: ClinicalPhenoAgeProductFailure | null;
  modelVersion: typeof CLINICAL_PHENOAGE_MODEL_VERSION;
  evidenceConfidence: ScientificEligibilityConfidence;
}

export function adaptClinicalPhenoAgeForPresentation(
  evaluation: ReturnType<typeof evaluateClinicalPhenoAgeForProduct>,
): ClinicalPhenoAgePresentation {
  const rawValue = evaluation.scientificResult?.phenotypicAgeYears ?? null;
  const valueYears = rawValue === null ? null : Math.round(rawValue * 10) / 10;
  const presentCount = evaluation.requirements.filter(item => item.status === 'present').length;
  return {
    status: evaluation.status,
    valueYears,
    formattedValue: valueYears === null ? null : valueYears.toFixed(1),
    chronologicalAgeYears: evaluation.chronologicalAgeYears,
    ageValid: evaluation.chronologicalAgeYears !== null
      && evaluation.eligibility.blockingIssues.every(issue => issue.code !== 'missing_age'
        && issue.code !== 'age_outside_range'),
    calculatedAt: evaluation.scientificResult?.calculatedAt ?? null,
    presentCount,
    totalRequired: 9,
    missingCount: 9 - presentCount,
    unavailableMeasurements: evaluation.requirements
      .filter(item => item.status !== 'present')
      .map(item => item.label),
    requirements: evaluation.requirements,
    limitations: evaluation.limitations,
    failure: evaluation.failure,
    modelVersion: CLINICAL_PHENOAGE_MODEL_VERSION,
    evidenceConfidence: evaluation.eligibility.confidence,
  };
}

/** The only production entry point used by product and presentation code. */
export function getClinicalPhenoAgePresentation(
  chronologicalAgeYears: number | null | undefined,
  latestEntries: ReadonlyMap<string, StoredEntry>,
  assessedAt?: Date,
): ClinicalPhenoAgePresentation {
  return adaptClinicalPhenoAgeForPresentation(
    evaluateClinicalPhenoAgeForProduct(chronologicalAgeYears, latestEntries, assessedAt),
  );
}
