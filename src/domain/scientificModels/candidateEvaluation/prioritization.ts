import { CLINICAL_CANDIDATE_DOSSIERS } from './dossiersClinical';
import { CONTEXT_CANDIDATE_DOSSIERS } from './dossiersContext';
import { METHYLATION_CANDIDATE_DOSSIERS } from './dossiersMethylation';
import type {
  CandidatePrioritizationDecision,
  ScientificCandidateDossier,
  ScientificCandidateRecommendation,
} from './contracts';

export const SCIENTIFIC_CANDIDATE_DOSSIERS = [
  ...CLINICAL_CANDIDATE_DOSSIERS,
  ...METHYLATION_CANDIDATE_DOSSIERS,
  ...CONTEXT_CANDIDATE_DOSSIERS,
] as const satisfies readonly ScientificCandidateDossier[];

export const CANDIDATE_PRIORITIZATION_DECISION = {
  recommendedNextCandidateId: 'kdm',
  productionImplementationAuthorizedNow: false,
  decision: 'A named, versioned KDM calibration is the highest-priority next age-model program, but no new candidate is currently authorized for production implementation.',
  prerequisites: [
    'Select one peer-reviewed named KDM calibration rather than implementing generic KDM.',
    'Audit the exact biomarker panel, population, stratification, units, and external dependencies.',
    'Independently reproduce reference outputs without using future production code as the source of truth.',
    'Demonstrate incremental scientific value and explicitly review overlap with Clinical PhenoAge.',
    'Complete versioned input policy, eligibility, independent verification, and governance stages before calculation implementation.',
  ],
  tierOrder: {
    reference_only: ['clinical_phenoage_reference'],
    tier_1: ['kdm'],
    tier_2: ['vo2max', 'dnam_phenoage'],
    tier_3: ['cardiometage', 'frailty_index'],
    research: ['dunedinpace', 'grim_age', 'sleep_biological_age'],
    rejected: ['hrv_biological_age'],
  },
} as const satisfies CandidatePrioritizationDecision;

export const SCIENTIFIC_CANDIDATE_RECOMMENDATIONS = [
  {
    question: 'Should KDM become the next production implementation?',
    decision: 'Not yet. A named KDM calibration should be the next formal candidate program, but generic KDM must not be implemented.',
    rationale: [
      'KDM provides an explicit age-in-years construct with potentially accessible clinical inputs.',
      'The method is calibration-dependent, and Vitalspan has not selected or independently verified one exact calibration.',
      'Overlap and incremental independence from Clinical PhenoAge remain unresolved.',
    ],
    affectedCandidateIds: ['kdm'],
  },
  {
    question: 'Should VO₂max remain contextual or eventually evolve?',
    decision: 'Keep direct measured VO₂max as normative context. It may evolve into a governed validated modifier only if a future composite is independently validated; it must never be converted to years by percentile matching.',
    rationale: [
      'Direct CPET has strong physiological and outcome evidence.',
      'Normative position is not biological age.',
      'Wearable estimates and direct maximal testing are not interchangeable.',
    ],
    affectedCandidateIds: ['vo2max'],
  },
  {
    question: 'Should DunedinPACE remain independent forever?',
    decision: 'Its pace construct must remain scientifically independent from age in years. Future products may present it in parallel only after validation; no unit conversion or automatic combination is permitted.',
    rationale: [
      'DunedinPACE was trained to represent pace per biological year.',
      'A pace measure and an age estimate answer different questions.',
      'A future validated composite could reference both constructs without making them interchangeable.',
    ],
    affectedCandidateIds: ['dunedinpace'],
  },
  {
    question: 'Should DNA methylation models be considered without laboratory access?',
    decision: 'No. Registry and research review may continue, but implementation requires a validated laboratory, exact assay and preprocessing versions, licensing review, and independent end-to-end verification.',
    rationale: [
      'The scientific model cannot be separated from specimen, platform, preprocessing, and quality control.',
      'Synthetic, manually entered, or inferred methylation evidence is impermissible.',
    ],
    affectedCandidateIds: ['dnam_phenoage', 'grim_age', 'dunedinpace'],
  },
  {
    question: 'Should wearable-derived biological age be excluded?',
    decision: 'Yes under current evidence. HRV and sleep remain source-attributed monitoring or interpretation signals, not age models.',
    rationale: [
      'No canonical independently validated wearable-age transformation exists.',
      'Device, protocol, artifact, population, medication, and firmware effects are substantial.',
      'Daily variability would create severe user misunderstanding and marketing risk.',
    ],
    affectedCandidateIds: ['hrv_biological_age', 'sleep_biological_age'],
  },
  {
    question: 'Should frailty remain a separate construct?',
    decision: 'Yes. A validated Frailty Index may be considered later as separately reported context, especially in older populations, but must not alter biological age.',
    rationale: [
      'Frailty measures accumulated deficits and vulnerability rather than age in years.',
      'Deficit-set choice and younger-population floor effects require independent governance.',
    ],
    affectedCandidateIds: ['frailty_index'],
  },
] as const satisfies readonly ScientificCandidateRecommendation[];

export function getScientificCandidateDossier(
  id: ScientificCandidateDossier['id'],
): ScientificCandidateDossier {
  const dossier = SCIENTIFIC_CANDIDATE_DOSSIERS.find(candidate => candidate.id === id);
  if (!dossier) throw new Error(`Unknown scientific candidate dossier: ${id}.`);
  return dossier;
}
