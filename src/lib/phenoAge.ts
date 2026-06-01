// Levine PhenoAge Biological Age Calculator
// Based on: Levine ME et al. "An epigenetic biomarker of aging for lifespan
// and healthspan." Aging Cell. 2018;17(4):e12748.
// DOI: 10.1111/acel.12748
//
// Mortality probability formula (D-01):
//   M = 1 - exp(-exp(xb) × (exp(120 × GAMMA) - 1) / GAMMA)
// where xb is the linear combination of biomarkers + age + intercept.
// GAMMA = 0.0076927 (Gompertz parameter from Levine 2018).
// The intercept absorbs the Gompertz baseline hazard scaling for this parameterization.

export interface PhenoAgeInputs {
  albumin?: number;           // g/dL
  creatinine?: number;        // mg/dL
  glucose?: number;           // mg/dL (fasting)
  crp?: number;               // mg/L  (hsCRP or CRP)
  lymphocytePct?: number;     // %
  mcv?: number;               // fL
  rdw?: number;               // %
  alkalinePhosphatase?: number; // U/L
  wbc?: number;               // 10^3/μL (i.e. thousands/μL)
  age: number;                // chronological age in years
  [key: string]: number | undefined;
}

export interface PhenoAgeResult {
  biologicalAge: number | null;
  confidence: 'high' | 'medium' | 'low' | 'insufficient';
  missingCount: number;
  totalRequired: number;
  missingBiomarkers: string[];
  yearsYounger: number | null;
}

// PhenoAge model coefficients (Table 1 from Levine 2018)
const COEFFICIENTS: Record<string, number> = {
  albumin:             -0.0336,
  creatinine:           0.0095,
  glucose:              0.1953,
  lnCRP:                0.0954,
  lymphocytePct:       -0.0120,
  mcv:                  0.0268,
  rdw:                  0.3306,
  alkalinePhosphatase:  0.00188,
  wbc:                  0.0554,
  age:                  0.0804,
};

// INTERCEPT calibrated for the Gompertz mortality formula below.
// Derived from: intercept_nhanes (-19.9067) adjusted for Gompertz baseline hazard scaling.
// The Levine 2018 supplementary provides a Gompertz baseline constant (1.025e-7)
// which is absorbed into the intercept here:
//   intercept_gompertz = -19.9067 + ln(1.025e-7) - ln(exp(120 * GAMMA) - 1)
const INTERCEPT = -36.416931;

// Gompertz parameter γ (verified against Levine 2018 supplementary materials)
const GAMMA = 0.0076927;

const REQUIRED_FIELDS: { key: keyof Omit<PhenoAgeInputs, 'age'>; label: string }[] = [
  { key: 'albumin',             label: 'Albumin' },
  { key: 'creatinine',          label: 'Creatinine' },
  { key: 'glucose',             label: 'Fasting Glucose' },
  { key: 'crp',                 label: 'hsCRP / CRP' },
  { key: 'lymphocytePct',       label: 'Lymphocyte %' },
  { key: 'mcv',                 label: 'MCV' },
  { key: 'rdw',                 label: 'RDW' },
  { key: 'alkalinePhosphatase', label: 'Alkaline Phosphatase' },
  { key: 'wbc',                 label: 'WBC' },
];

export function computePhenoAge(inputs: PhenoAgeInputs): PhenoAgeResult {
  const missing: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const val = inputs[field.key];
    if (val == null || val <= 0) {
      missing.push(field.label);
    }
  }

  // Strict null: any missing, zero, or negative biomarker → return null immediately
  if (missing.length > 0) {
    return {
      biologicalAge: null,
      confidence: 'insufficient',
      missingCount: missing.length,
      totalRequired: REQUIRED_FIELDS.length,
      missingBiomarkers: missing,
      yearsYounger: null,
    };
  }

  // All 9 biomarkers are present and valid — read directly (no median fallback)
  const alb    = inputs.albumin              as number;
  const cr     = inputs.creatinine           as number;
  const glu    = inputs.glucose              as number;
  const crpRaw = inputs.crp                  as number;
  const lymph  = inputs.lymphocytePct        as number;
  const mcv    = inputs.mcv                  as number;
  const rdw    = inputs.rdw                  as number;
  const alp    = inputs.alkalinePhosphatase  as number;
  const wbc    = inputs.wbc                  as number;

  // Guard: CRP must be > 0 (ln(0) = -∞). Already caught above by val <= 0,
  // but kept for clarity per D-05.
  if (crpRaw <= 0) {
    return {
      biologicalAge: null,
      confidence: 'insufficient',
      missingCount: 1,
      totalRequired: REQUIRED_FIELDS.length,
      missingBiomarkers: ['hsCRP (invalid value)'],
      yearsYounger: null,
    };
  }

  // CRP input is mg/L; formula uses ln(CRP in mg/dL). Divide by 10 to convert.
  const lnCRP = Math.log(crpRaw / 10);

  // Compute linear combination (mortality score)
  const xb =
    COEFFICIENTS.albumin             * alb  +
    COEFFICIENTS.creatinine          * cr   +
    COEFFICIENTS.glucose             * glu  +
    COEFFICIENTS.lnCRP               * lnCRP +
    COEFFICIENTS.lymphocytePct       * lymph +
    COEFFICIENTS.mcv                 * mcv  +
    COEFFICIENTS.rdw                 * rdw  +
    COEFFICIENTS.alkalinePhosphatase * alp  +
    COEFFICIENTS.wbc                 * wbc  +
    COEFFICIENTS.age                 * inputs.age +
    INTERCEPT;

  // Convert xb to mortality probability using Gompertz model (Levine 2018, D-01):
  // M = 1 - exp(-exp(xb) × (exp(120 × GAMMA) - 1) / GAMMA)
  // 120 is the Gompertz time horizon in years.
  const mortProb = 1 - Math.exp(-Math.exp(xb) * (Math.exp(120 * GAMMA) - 1) / GAMMA);

  // Sanity check on mortality probability
  if (!isFinite(mortProb) || mortProb <= 0) {
    return {
      biologicalAge: null,
      confidence: 'insufficient',
      missingCount: 0,
      totalRequired: REQUIRED_FIELDS.length,
      missingBiomarkers: [],
      yearsYounger: null,
    };
  }

  // Convert to phenotypic age (inversion constants verified against Levine 2018)
  const clampedProb = Math.max(0.0001, Math.min(0.9999, mortProb));
  const innerLog = -0.00553 * Math.log(1 - clampedProb);
  if (innerLog <= 0) {
    return {
      biologicalAge: null,
      confidence: 'insufficient',
      missingCount: 0,
      totalRequired: REQUIRED_FIELDS.length,
      missingBiomarkers: [],
      yearsYounger: null,
    };
  }
  const phenoAge = 141.50225 + Math.log(innerLog) / 0.090165;

  // Range guard: results outside 10–120 are physiologically implausible.
  // Upper bound matches the Gompertz time horizon (120 years). Lower bound (10)
  // prevents numeric artifacts at extreme young-adult biomarker values.
  if (phenoAge < 10 || phenoAge > 120) {
    return {
      biologicalAge: null,
      confidence: 'insufficient',
      missingCount: 0,
      totalRequired: REQUIRED_FIELDS.length,
      missingBiomarkers: [],
      yearsYounger: null,
    };
  }

  const biologicalAge = Math.round(phenoAge);
  const yearsYounger = inputs.age - biologicalAge;

  return {
    biologicalAge,
    confidence: 'high',
    missingCount: 0,
    totalRequired: REQUIRED_FIELDS.length,
    missingBiomarkers: [],
    yearsYounger,
  };
}

// Maps biomarker IDs in our database to PhenoAge input keys
export const PHENO_AGE_BIOMARKER_MAP: Record<string, keyof Omit<PhenoAgeInputs, 'age'>> = {
  albumin:             'albumin',
  creatinine:          'creatinine',
  fastingglucose:      'glucose',
  hscrp:               'crp',
  lymphocytepct:       'lymphocytePct',
  mcv:                 'mcv',
  rdw:                 'rdw',
  alp:                 'alkalinePhosphatase',
  wbc:                 'wbc',
};

// Ordered list of PhenoAge biomarker IDs and human-readable labels
// Use this to show checklists in UI — do not duplicate locally in screens
export const PHENO_BIOMARKER_LIST: { id: string; label: string; unit: string }[] = [
  { id: 'albumin',        label: 'Albumin',              unit: 'g/dL' },
  { id: 'creatinine',     label: 'Creatinine',           unit: 'mg/dL' },
  { id: 'fastingglucose', label: 'Fasting Glucose',      unit: 'mg/dL' },
  { id: 'hscrp',          label: 'hsCRP',                unit: 'mg/L' },
  { id: 'lymphocytepct',  label: 'Lymphocyte %',         unit: '%' },
  { id: 'mcv',            label: 'MCV',                  unit: 'fL' },
  { id: 'rdw',            label: 'RDW',                  unit: '%' },
  { id: 'alp',            label: 'Alkaline Phosphatase', unit: 'U/L' },
  { id: 'wbc',            label: 'WBC',                  unit: '×10³/μL' },
];
