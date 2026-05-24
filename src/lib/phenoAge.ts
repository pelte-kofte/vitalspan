// Levine PhenoAge Biological Age Calculator
// Based on: Levine ME et al. "An epigenetic biomarker of aging for lifespan
// and healthspan." Aging Cell. 2018;17(4):e12748.
// DOI: 10.1111/acel.12748

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

const INTERCEPT = -19.9067;

// Mortality score → phenotypic age conversion
// Based on Gompertz-Makeham parameterization from Levine 2018
const GAMMA = 0.0076927;
const LAMBDA = 0.0000001025;

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

  // Debug: log which fields are present vs missing
  const present = REQUIRED_FIELDS
    .filter(f => { const v = inputs[f.key]; return v != null && v > 0; })
    .map(f => f.key);
  console.log('[PhenoAge] age:', inputs.age, '| present:', present.join(','), '| missing:', missing.join(','));

  const missingCount = missing.length;
  const totalRequired = REQUIRED_FIELDS.length;

  // Determine confidence tier
  let confidence: PhenoAgeResult['confidence'];
  if (missingCount === 0) confidence = 'high';
  else if (missingCount <= 2) confidence = 'medium';
  else if (missingCount <= 5) confidence = 'low';
  else confidence = 'insufficient';

  // Can't compute if too many missing
  if (confidence === 'insufficient') {
    return {
      biologicalAge: null,
      confidence,
      missingCount,
      totalRequired,
      missingBiomarkers: missing,
      yearsYounger: null,
    };
  }

  // Use available values; substitute medians for missing (reduces accuracy but gives estimate)
  const MEDIANS: Record<string, number> = {
    albumin:             4.3,
    creatinine:          0.9,
    glucose:             92,
    crp:                 0.8,
    lymphocytePct:       28,
    mcv:                 90,
    rdw:                 12.8,
    alkalinePhosphatase: 67,
    wbc:                 6.0,
  };

  const alb   = inputs.albumin              ?? MEDIANS.albumin;
  const cr    = inputs.creatinine           ?? MEDIANS.creatinine;
  const glu   = inputs.glucose              ?? MEDIANS.glucose;
  const crpRaw = inputs.crp                 ?? MEDIANS.crp;
  const lymph = inputs.lymphocytePct        ?? MEDIANS.lymphocytePct;
  const mcv   = inputs.mcv                  ?? MEDIANS.mcv;
  const rdw   = inputs.rdw                  ?? MEDIANS.rdw;
  const alp   = inputs.alkalinePhosphatase  ?? MEDIANS.alkalinePhosphatase;
  const wbc   = inputs.wbc                  ?? MEDIANS.wbc;

  // Natural log of CRP (add 1 to handle very low values)
  const lnCRP = Math.log(Math.max(crpRaw, 0.01) + 1);

  // Compute linear combination (mortality score)
  const xb =
    COEFFICIENTS.albumin             * alb   +
    COEFFICIENTS.creatinine          * cr    +
    COEFFICIENTS.glucose             * glu   +
    COEFFICIENTS.lnCRP               * lnCRP +
    COEFFICIENTS.lymphocytePct       * lymph +
    COEFFICIENTS.mcv                 * mcv   +
    COEFFICIENTS.rdw                 * rdw   +
    COEFFICIENTS.alkalinePhosphatase * alp   +
    COEFFICIENTS.wbc                 * wbc   +
    COEFFICIENTS.age                 * inputs.age +
    INTERCEPT;

  // Convert xb to 10-year mortality probability
  const mortProb = 1 - Math.exp(-LAMBDA * Math.exp(xb) / GAMMA);

  // Convert to phenotypic age
  const clampedProb = Math.max(0.0001, Math.min(0.9999, mortProb));
  const phenoAge = 141.50225 + Math.log(-0.00553 * Math.log(1 - clampedProb)) / 0.090165;

  const biologicalAge = Math.round(Math.max(1, Math.min(120, phenoAge)));
  const yearsYounger = inputs.age - biologicalAge;

  return {
    biologicalAge,
    confidence,
    missingCount,
    totalRequired,
    missingBiomarkers: missing,
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
