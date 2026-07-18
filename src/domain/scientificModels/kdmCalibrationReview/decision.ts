import type { KdmGovernanceDecision, KdmProductionDecision } from './contracts';

export const KDM_CALIBRATION_GOVERNANCE_DECISIONS = [
  {
    question: 'Should Vitalspan use exactly one calibration?',
    decision: 'Yes. One immutable calibration version may be active for a KDM result lineage.',
    rationale: ['KDM outputs depend on panel, population, preprocessing, and stratification.', 'Multiple active definitions under one label would be scientifically ambiguous.'],
  },
  {
    question: 'Should calibration ever change automatically by country?',
    decision: 'No. Country must never silently switch the scientific model.',
    rationale: ['Geography is not a validated proxy for calibration compatibility.', 'A country-specific model requires its own evidence, version, eligibility policy, and result lineage.'],
  },
  {
    question: 'Should calibration differ by ethnicity?',
    decision: 'Not automatically. Ethnicity must not be guessed or used as a silent selector.',
    rationale: ['Broad ethnicity labels are poor proxies for physiology, environment, and assay compatibility.', 'A subgroup-specific branch is permissible only when the named calibration explicitly requires it and has direct validation.'],
  },
  {
    question: 'Should calibration differ by sex?',
    decision: 'Only when the selected peer-reviewed calibration explicitly defines validated sex-specific parameters.',
    rationale: ['Levine KDM calibrations were sex stratified.', 'The same user must retain the same eligible model branch over time; unsupported sex context must fail closed.'],
  },
  {
    question: 'Should calibration differ by laboratory?',
    decision: 'No silent laboratory-specific recalibration. Laboratory context belongs in eligibility and compatibility checks.',
    rationale: ['A compatible assay may be accepted under one fixed model.', 'A changed measurement definition or local refit creates a new scientific version.'],
  },
  {
    question: 'Should users ever choose a calibration manually?',
    decision: 'No.',
    rationale: ['Calibration selection is a scientific-governance decision, not a preference.', 'Manual choice would enable result shopping and break longitudinal interpretability.'],
  },
  {
    question: 'Would multiple calibrations damage longitudinal consistency?',
    decision: 'Yes, unless results remain in separate, explicitly versioned lineages and are never spliced.',
    rationale: ['A panel or reference-population change can move the output without biological change.', 'Historical results must retain their original version and must not be backfilled silently.'],
  },
  {
    question: 'How should future recalibration be governed?',
    decision: 'As a new model version requiring full evidence review, independent validation, overlap review, eligibility policy, authorization binding, and migration approval.',
    rationale: ['Recalibration is a scientific change.', 'No registry alias or deployment flag may turn one calibration into another.'],
  },
  {
    question: 'Should Vitalspan freeze one version permanently?',
    decision: 'Freeze every released version permanently, but do not promise that one version will remain the only future version forever.',
    rationale: ['Immutability preserves reproducibility.', 'Scientific governance must still permit a separately validated successor or retirement.'],
  },
  {
    question: 'How should version migration work?',
    decision: 'Opt-in scientific cutover at the product level with parallel internal validation, explicit effective date, preserved historical lineage, and no mixed-version trend.',
    rationale: ['Old outputs remain attributable to their original calibration.', 'A successor starts a new comparable series only after a documented bridging study supports comparison.'],
  },
] as const satisfies readonly KdmGovernanceDecision[];

export const KDM_PRODUCTION_CALIBRATION_DECISION = {
  recommendation: 'proceed_after_prerequisites',
  selectedCalibrationId: 'levine_nhanes_iii_kdm1_2013',
  recommendedVersionName: 'KDM-Levine-NHANES-III-KDM1 v1.0.0',
  implementationAuthorized: false,
  rationale: [
    'It is the most mature fixed KDM calibration identity reviewed.',
    'Its ten-biomarker panel is stable across sex strata and is recognized in later peer-reviewed work as the Levine Original comparator.',
    'It has direct long-follow-up mortality evidence and external peer-reviewed reuse.',
    'It has less exact biomarker overlap with Clinical PhenoAge than the BioAge V2 and Mak 18-biomarker alternatives.',
    'The conditional recommendation preserves Unknown until assay, population, overlap, and independent-verification gates pass.',
  ],
  prerequisites: [
    'Obtain and independently audit the complete sex-specific parameter artifacts from the primary calibration.',
    'Define exact unit, specimen, assay, spirometry, blood-pressure, and CMV optical-density compatibility contracts.',
    'Confirm lawful access and long-term reproducibility of the historical calibration artifacts.',
    'Prospectively validate transportability in Vitalspan target populations, including unsupported-population failure behavior.',
    'Demonstrate test–retest reliability and define acute-illness and repeat-collection exclusions.',
    'Quantify incremental information and correlation relative to Clinical PhenoAge without combining the models.',
    'Create independent reference fixtures, a scientific validation report, and immutable fingerprints in a later authorized phase.',
    'Complete clinical, statistical, laboratory, regulatory, and scientific-governance review.',
  ],
  openScientificQuestions: [
    'Can the historical CMV optical-density measurement be reproduced across current assays without creating a new calibration?',
    'Does the calibration transport outside the historical US population and across current laboratory practice?',
    'How should eligibility behave when the published binary sex stratum is scientifically unsupported for a user?',
    'Does KDM1 add independent longitudinal or outcome information beyond Clinical PhenoAge?',
    'What collection interval is needed to distinguish biological change from analytic and physiological variability?',
  ],
} as const satisfies KdmProductionDecision;
