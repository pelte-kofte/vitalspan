import type { CardiometabolicScientificVersions } from './contracts';

export const CARDIOMETABOLIC_SCIENTIFIC_VERSIONS = Object.freeze({
  domainSpecification: 'Vitalspan-CMH-DOMAIN-1.0.0',
  measurementRegistry: 'Vitalspan-CMH-MEASUREMENT-1.0.0',
  protocolRegistry: 'Vitalspan-CMH-PROTOCOL-1.0.0',
  assayRegistry: 'Vitalspan-CMH-ASSAY-1.0.0',
  sourceRegistry: 'Vitalspan-CMH-SOURCE-1.0.0',
  confidenceRegistry: 'Vitalspan-CMH-CONFIDENCE-1.0.0',
  validationPolicy: 'Vitalspan-CMH-VALIDATION-1.0.0',
  eligibilityPolicy: 'Vitalspan-CMH-ELIGIBILITY-1.0.0',
  reasonRegistry: 'Vitalspan-CMH-REASON-1.0.0',
  referenceRegistry: 'CMH-RR-1.0.0',
  interpretationPolicyRegistry: 'CMH-IPR-1.0.0',
  populationMatchingPolicy: 'CMH-PMP-1.0.0',
  safetyCandidatePolicy: 'CMH-SBP-0.1.0-inactive',
  trendComparabilityPolicy: 'CMH-TCP-1.0.0',
}) satisfies CardiometabolicScientificVersions;

export const CARDIOMETABOLIC_CONVERSION_STANDARD = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.validationPolicy,
  cholesterolMgDlToMmolL: 0.02586,
  triglycerideMgDlToMmolL: 0.01129,
  glucoseMgDlToMmolL: 1 / 18,
  inchToCentimetre: 2.54,
  apoBMgDlToGL: 0.01,
  lpaMgLToMgDl: 0.1,
  lpaGLToMgDl: 100,
  hba1cNgspIntercept: 2.15,
  hba1cNgspToIfccSlope: 10.929,
});
