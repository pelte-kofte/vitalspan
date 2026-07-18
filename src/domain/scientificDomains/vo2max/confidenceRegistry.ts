import type { Vo2MaxConfidence } from './contracts';
import { VO2MAX_SCIENTIFIC_VERSIONS } from './versions';

export interface Vo2MaxConfidenceDefinition {
  id: Vo2MaxConfidence;
  title: string;
  authorizedUse: string;
  directlyMeasured: boolean;
  clinicalTruthPermitted: boolean;
}

export const VO2MAX_CONFIDENCE_REGISTRY = Object.freeze({
  version: VO2MAX_SCIENTIFIC_VERSIONS.confidenceRegistry,
  definitions: [
    { id: 'gold_standard', title: 'Gold Standard', authorizedUse: 'Criterion VO2max for the tested modality and date.', directlyMeasured: true, clinicalTruthPermitted: true },
    { id: 'clinical_grade', title: 'Clinical Grade', authorizedUse: 'The clinical VO2peak or transcribed test result exactly as reported.', directlyMeasured: true, clinicalTruthPermitted: true },
    { id: 'high_confidence', title: 'High Confidence', authorizedUse: 'Estimated non-diagnostic monitoring only.', directlyMeasured: false, clinicalTruthPermitted: false },
    { id: 'moderate_confidence', title: 'Moderate Confidence', authorizedUse: 'Contextual estimate and cautious within-source trend only.', directlyMeasured: false, clinicalTruthPermitted: false },
    { id: 'low_confidence', title: 'Low Confidence', authorizedUse: 'Supplemental context only.', directlyMeasured: false, clinicalTruthPermitted: false },
    { id: 'research_only', title: 'Research Only', authorizedUse: 'Segregated research evaluation only.', directlyMeasured: false, clinicalTruthPermitted: false },
    { id: 'unsupported', title: 'Unsupported', authorizedUse: 'No VO2max-domain scientific interpretation.', directlyMeasured: false, clinicalTruthPermitted: false },
  ] as const satisfies readonly Vo2MaxConfidenceDefinition[],
});

export function getVo2MaxConfidenceDefinition(
  confidence: Vo2MaxConfidence,
): Vo2MaxConfidenceDefinition {
  const definition = VO2MAX_CONFIDENCE_REGISTRY.definitions.find(item => item.id === confidence);
  if (!definition) throw new Error(`Unknown VO2max confidence: ${confidence}.`);
  return definition;
}

