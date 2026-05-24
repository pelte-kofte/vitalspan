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
  // All units are standard US lab units — coefficients are calibrated for these units.
  // albumin: g/dL, creatinine: mg/dL, glucose: mg/dL, crp: mg/L (converted to ln(mg/dL))
  const MEDIANS: Record<string, number> = {
    albumin:             4.3,   // g/dL
    creatinine:          0.9,   // mg/dL
    glucose:             92,    // mg/dL
    crp:                 0.8,   // mg/L
    lymphocytePct:       28,    // %
    mcv:                 90,    // fL
    rdw:                 12.8,  // %
    alkalinePhosphatase: 67,    // U/L
    wbc:                 6.0,   // 10³/μL
  };

  // Use original lab units — coefficients from Levine 2018 (NHANES 3) are for US lab units
  const alb    = inputs.albumin              ?? MEDIANS.albumin;    // g/dL (no conversion)
  const cr     = inputs.creatinine           ?? MEDIANS.creatinine; // mg/dL (no conversion)
  const glu    = inputs.glucose              ?? MEDIANS.glucose;    // mg/dL (no conversion)
  const crpRaw = inputs.crp                  ?? MEDIANS.crp;
  const lymph  = inputs.lymphocytePct        ?? MEDIANS.lymphocytePct;
  const mcv    = inputs.mcv                  ?? MEDIANS.mcv;
  const rdw    = inputs.rdw                  ?? MEDIANS.rdw;
  const alp    = inputs.alkalinePhosphatase  ?? MEDIANS.alkalinePhosphatase;
  const wbc    = inputs.wbc                  ?? MEDIANS.wbc;

  // Guard: CRP must be > 0 (ln(0) = -∞)
  if (crpRaw <= 0) {
    console.log('[PhenoAge] CRP is zero or negative — cannot compute');
    return {
      biologicalAge: null,
      confidence: 'insufficient',
      missingCount: missingCount + 1,
      totalRequired,
      missingBiomarkers: [...missing, 'hsCRP (invalid value)'],
      yearsYounger: null,
    };
  }

  // CRP input is mg/L; formula uses ln(CRP in mg/dL). Divide by 10 to convert.
  const lnCRP = Math.log(crpRaw / 10);

  // Compute linear combination (mortality score)
  const term_alb   = COEFFICIENTS.albumin             * alb;
  const term_cr    = COEFFICIENTS.creatinine          * cr;
  const term_glu   = COEFFICIENTS.glucose             * glu;
  const term_crp   = COEFFICIENTS.lnCRP               * lnCRP;
  const term_lymph = COEFFICIENTS.lymphocytePct       * lymph;
  const term_mcv   = COEFFICIENTS.mcv                 * mcv;
  const term_rdw   = COEFFICIENTS.rdw                 * rdw;
  const term_alp   = COEFFICIENTS.alkalinePhosphatase * alp;
  const term_wbc   = COEFFICIENTS.wbc                 * wbc;
  const term_age   = COEFFICIENTS.age                 * inputs.age;

  const xb = term_alb + term_cr + term_glu + term_crp + term_lymph +
             term_mcv + term_rdw + term_alp + term_wbc + term_age + INTERCEPT;

  console.log('[PhenoAge] inputs: alb=', alb, 'cr=', cr, 'glu=', glu, 'crpRaw=', crpRaw, 'lnCRP=', lnCRP.toFixed(4));
  console.log('[PhenoAge] terms: alb=', term_alb.toFixed(3), 'cr=', term_cr.toFixed(3), 'glu=', term_glu.toFixed(3), 'crp=', term_crp.toFixed(3), 'lymph=', term_lymph.toFixed(3));
  console.log('[PhenoAge] terms: mcv=', term_mcv.toFixed(3), 'rdw=', term_rdw.toFixed(3), 'alp=', term_alp.toFixed(3), 'wbc=', term_wbc.toFixed(3), 'age=', term_age.toFixed(3));
  console.log('[PhenoAge] xb=', xb.toFixed(4), 'intercept=', INTERCEPT);

  // Convert xb to 10-year mortality probability using Gompertz-Makeham model
  const mortProb = 1 - Math.exp(-LAMBDA * Math.exp(xb) / GAMMA);
  console.log('[PhenoAge] mortProb=', mortProb.toFixed(6));

  // Sanity check on mortality probability
  if (!isFinite(mortProb) || mortProb <= 0) {
    console.log('[PhenoAge] Invalid mortProb — returning null');
    return { biologicalAge: null, confidence, missingCount, totalRequired, missingBiomarkers: missing, yearsYounger: null };
  }

  // Convert to phenotypic age
  const clampedProb = Math.max(0.0001, Math.min(0.9999, mortProb));
  const innerLog = -0.00553 * Math.log(1 - clampedProb);
  if (innerLog <= 0) {
    console.log('[PhenoAge] innerLog <= 0 — returning null');
    return { biologicalAge: null, confidence, missingCount, totalRequired, missingBiomarkers: missing, yearsYounger: null };
  }
  const phenoAge = 141.50225 + Math.log(innerLog) / 0.090165;
  console.log('[PhenoAge] phenoAge=', phenoAge.toFixed(2), 'M=', clampedProb.toFixed(6));

  // Range guard: results outside 15–95 are physiologically implausible
  if (phenoAge < 15 || phenoAge > 95) {
    console.log('[PhenoAge] Out-of-range result:', phenoAge.toFixed(2), '— check biomarker values');
    return { biologicalAge: null, confidence, missingCount, totalRequired, missingBiomarkers: missing, yearsYounger: null };
  }

  const biologicalAge = Math.round(phenoAge);
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
