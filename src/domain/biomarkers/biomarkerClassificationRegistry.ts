import type { SourceLabRange } from '../../types/biomarkerKnowledge';

export const BIOMARKER_CLASSIFICATION_REGISTRY_VERSION =
  'biomarker-classification-registry/1.0.0';
export const BIOMARKER_CLASSIFICATION_REVIEW_DATE = '2026-07-25';

export type BiomarkerClassificationModelType =
  | 'reference_interval'
  | 'clinical_decision_categories'
  | 'governed_domain'
  | 'unavailable';

export type BiomarkerClassificationContextField =
  | 'age'
  | 'sex'
  | 'fasting'
  | 'pregnancy'
  | 'specimen'
  | 'assay'
  | 'measurement_protocol';

export interface BiomarkerClassificationContext {
  readonly ageYears?: number;
  readonly sex?: 'female' | 'male';
  readonly fasting?: boolean;
  readonly pregnancy?: 'pregnant' | 'not_pregnant' | 'unknown';
  readonly specimen?: string;
  readonly assay?: string;
  readonly measurementProtocol?: string;
}

export interface BiomarkerClassificationAuthority {
  readonly organization: string;
  readonly title: string;
  readonly citation: string;
  readonly url: string;
  readonly sourceVersion: string;
  readonly reviewedAt: typeof BIOMARKER_CLASSIFICATION_REVIEW_DATE;
}

export interface BiomarkerUnitConversion {
  readonly fromUnit: string;
  readonly toUnit: string;
  readonly multiplier: number;
  readonly offset: number;
  readonly standard: string;
}

export interface BiomarkerClassificationConditions {
  readonly minimumAge?: number;
  readonly maximumAge?: number;
  readonly sex?: 'female' | 'male';
  readonly fasting?: true;
  readonly pregnancy?: 'not_pregnant';
  readonly specimen?: string;
  readonly assay?: string;
}

export interface BiomarkerClassificationBand {
  readonly id: string;
  readonly label: string;
  readonly lowerBound?: number;
  readonly upperBound?: number;
  readonly lowerInclusive: boolean;
  readonly upperInclusive: boolean;
  readonly unit: string;
  readonly optimal: true | null;
  readonly conditions?: BiomarkerClassificationConditions;
}

interface BiomarkerClassificationStrategyBase {
  readonly biomarkerId: string;
  readonly modelType: BiomarkerClassificationModelType;
  readonly supportedUnits: readonly string[];
  readonly conversions: readonly BiomarkerUnitConversion[];
  readonly requiredContext: readonly BiomarkerClassificationContextField[];
  readonly authority: BiomarkerClassificationAuthority;
  readonly populationContext: string;
  readonly limitations: readonly string[];
  readonly registryVersion: typeof BIOMARKER_CLASSIFICATION_REGISTRY_VERSION;
}

export interface ReferenceIntervalClassificationStrategy
  extends BiomarkerClassificationStrategyBase {
  readonly modelType: 'reference_interval';
  readonly intervals: readonly {
    readonly id: string;
    readonly lowerBound: number;
    readonly upperBound: number;
    readonly unit: string;
    readonly conditions?: BiomarkerClassificationConditions;
  }[];
}

export interface ClinicalDecisionClassificationStrategy
  extends BiomarkerClassificationStrategyBase {
  readonly modelType: 'clinical_decision_categories';
  readonly categories: readonly BiomarkerClassificationBand[];
}

export interface GovernedDomainClassificationStrategy
  extends BiomarkerClassificationStrategyBase {
  readonly modelType: 'governed_domain';
  readonly governedDomain:
    | 'vo2max'
    | 'functional_capacity';
  readonly reason: string;
}

export interface UnavailableClassificationStrategy
  extends BiomarkerClassificationStrategyBase {
  readonly modelType: 'unavailable';
  readonly reason: string;
}

export type BiomarkerClassificationStrategy =
  | ReferenceIntervalClassificationStrategy
  | ClinicalDecisionClassificationStrategy
  | GovernedDomainClassificationStrategy
  | UnavailableClassificationStrategy;

export interface ResolvedBiomarkerClassification {
  readonly biomarkerId: string;
  readonly modelType:
    | 'reference_interval'
    | 'clinical_decision_categories';
  readonly source: 'source_laboratory' | 'app_registry';
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly optimal: true | null;
  readonly selectedBandId: string;
  readonly bands: readonly BiomarkerClassificationBand[];
  readonly authority: BiomarkerClassificationAuthority;
  readonly populationContext: string;
  readonly limitations: readonly string[];
  readonly registryVersion: typeof BIOMARKER_CLASSIFICATION_REGISTRY_VERSION;
}

const MEDLINEPLUS_CMP = authority(
  'U.S. National Library of Medicine, MedlinePlus',
  'Comprehensive metabolic panel',
  'MedlinePlus Medical Encyclopedia. Comprehensive metabolic panel.',
  'https://medlineplus.gov/ency/article/003468.htm',
  'Reviewed 2024',
);

const MEDLINEPLUS_CBC = authority(
  'U.S. National Library of Medicine, MedlinePlus',
  'CBC blood test',
  'MedlinePlus Medical Encyclopedia. CBC blood test.',
  'https://medlineplus.gov/ency/article/003642.htm',
  'Reviewed 2024',
);

const MEDLINEPLUS_DIFFERENTIAL = authority(
  'U.S. National Library of Medicine, MedlinePlus',
  'Blood differential test',
  'MedlinePlus Medical Encyclopedia. Blood differential test.',
  'https://medlineplus.gov/ency/article/003657.htm',
  'Reviewed 2025',
);

const CLEVELAND_CLINIC_RDW = authority(
  'Cleveland Clinic',
  'RDW Blood Test',
  'Cleveland Clinic Health Library. RDW Blood Test.',
  'https://my.clevelandclinic.org/health/diagnostics/22980-rdw-blood-test',
  'Medically reviewed 2026',
);

const MEDLINEPLUS_HOMOCYSTEINE = authority(
  'U.S. National Library of Medicine, MedlinePlus',
  'Homocysteine test',
  'MedlinePlus Medical Test. Homocysteine Test.',
  'https://medlineplus.gov/lab-tests/homocysteine-test/',
  'Reviewed 2025',
);

const MEDLINEPLUS_URIC_ACID = authority(
  'U.S. National Library of Medicine, MedlinePlus',
  'Uric acid blood test',
  'MedlinePlus Medical Encyclopedia. Uric acid blood test.',
  'https://medlineplus.gov/ency/article/003476.htm',
  'Reviewed 2024',
);

const MEDLINEPLUS_FERRITIN = authority(
  'U.S. National Library of Medicine, MedlinePlus',
  'Ferritin blood test',
  'MedlinePlus Medical Test. Ferritin Blood Test.',
  'https://medlineplus.gov/ency/article/003490.htm',
  'Reviewed 2026',
);

const MEDLINEPLUS_B12 = authority(
  'U.S. National Library of Medicine, MedlinePlus',
  'Vitamin B12 level',
  'MedlinePlus Medical Encyclopedia. Vitamin B12 level.',
  'https://medlineplus.gov/ency/article/003705.htm',
  'Reviewed 2024',
);

const MEDLINEPLUS_FIBRINOGEN = authority(
  'U.S. National Library of Medicine, MedlinePlus',
  'Fibrinogen blood test',
  'MedlinePlus Medical Encyclopedia. Fibrinogen blood test.',
  'https://medlineplus.gov/ency/article/003650.htm',
  'Reviewed 2024',
);

const MEDLINEPLUS_CORTISOL = authority(
  'U.S. National Library of Medicine, MedlinePlus',
  'Cortisol blood test',
  'MedlinePlus Medical Encyclopedia. Cortisol blood test.',
  'https://medlineplus.gov/ency/article/003693.htm',
  'Reviewed 2024',
);

const MEDLINEPLUS_TSH = authority(
  'U.S. National Library of Medicine, MedlinePlus',
  'TSH test',
  'MedlinePlus Medical Encyclopedia. TSH test.',
  'https://medlineplus.gov/ency/article/003684.htm',
  'Reviewed 2024',
);

const AHA_LIPIDS = authority(
  'American Heart Association',
  'Understanding cholesterol levels',
  'American Heart Association. Cholesterol levels educational reference.',
  'https://watchlearnlive.heart.org/modules/chlscr-media01.php',
  'AHA reviewed resource, accessed 2026',
);

const ADA_GLYCEMIA = authority(
  'American Diabetes Association',
  'Diagnosis and Classification of Diabetes: Standards of Care in Diabetes—2026',
  'American Diabetes Association Professional Practice Committee. Diabetes Care. 2026;49(Suppl 1):S27-S49.',
  'https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes',
  'Standards of Care 2026',
);

const ACC_AHA_APOB = authority(
  'American College of Cardiology and American Heart Association',
  '2018 Guideline on the Management of Blood Cholesterol',
  'Grundy SM, et al. Circulation. 2019;139:e1082-e1143. doi:10.1161/CIR.0000000000000625.',
  'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000625',
  '2018 multisociety guideline',
);

const CDC_AHA_HSCRP = authority(
  'Centers for Disease Control and Prevention and American Heart Association',
  'Markers of inflammation and cardiovascular disease',
  'Pearson TA, et al. Circulation. 2003;107:499-511. doi:10.1161/01.CIR.0000052939.59093.45.',
  'https://www.ahajournals.org/doi/10.1161/01.CIR.0000052939.59093.45',
  'CDC/AHA scientific statement, 2003',
);

const NIH_VITAMIN_D = authority(
  'National Institutes of Health, Office of Dietary Supplements',
  'Vitamin D: Fact Sheet for Health Professionals',
  'NIH Office of Dietary Supplements. Vitamin D Fact Sheet for Health Professionals.',
  'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/',
  'Current fact sheet reviewed 2026',
);

const NLA_LPA = authority(
  'National Lipid Association',
  'A focused update to the 2019 NLA scientific statement on lipoprotein(a)',
  'Koschinsky ML, et al. J Clin Lipidol. 2024;18(3):e308-e319. doi:10.1016/j.jacl.2024.03.001.',
  'https://pubmed.ncbi.nlm.nih.gov/38565461/',
  'NLA focused update, 2024',
);

const KDIGO_CKD = authority(
  'Kidney Disease: Improving Global Outcomes',
  'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease',
  'Kidney Disease: Improving Global Outcomes CKD Work Group. Kidney Int. 2024;105(4S):S117-S314.',
  'https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf',
  'KDIGO 2024',
);

const VO2MAX_DOMAIN = authority(
  'Vitalspan governed VO₂max scientific domain',
  'VO₂max scientific domain reference registry',
  'Vitalspan VO₂max scientific domain; FRIEND 2022 source-bound eligibility.',
  'https://pubmed.ncbi.nlm.nih.gov/34809986/',
  'vo2max-reference-registry/1.0.0',
);

const GRIP_GOVERNED_DOMAIN_AUTHORITY = authority(
  'Vitalspan governed Functional Capacity scientific domain',
  'Functional Capacity scientific domain reference registry',
  'Vitalspan Functional Capacity scientific domain; source-bound protocol and reference matching.',
  'https://pubmed.ncbi.nlm.nih.gov/40167612/',
  'functional-capacity-reference-registry/1.0.0',
);

const IFCC_CONTEXT_AUTHORITY = authority(
  'International Federation of Clinical Chemistry and Laboratory Medicine',
  'Reference intervals and decision limits',
  'IFCC Committee on Reference Intervals and Decision Limits. Reviewed reference-interval evidence.',
  'https://ifcc.org/ifcc-scientific-division/sd-committees/c-ridl/',
  'IFCC C-RIDL, reviewed 2026',
);

const GENERAL_RANGE_LIMITATIONS = Object.freeze([
  'This app interval is general context; the interval printed by the source laboratory takes precedence.',
  'Laboratory method, specimen handling, population, and clinical context can change the applicable interval.',
  'A value inside or outside this interval does not establish or exclude a health condition.',
] as const);

const DECISION_LIMITATIONS = Object.freeze([
  'These are authority-defined decision categories, not laboratory reference intervals.',
  'The category does not establish a diagnosis and must be interpreted with clinical context.',
] as const);

const GLUCOSE_CONVERSION = Object.freeze({
  fromUnit: 'mmol/L',
  toUnit: 'mg/dL',
  multiplier: 18.0182,
  offset: 0,
  standard: 'Glucose molar-mass conversion',
} satisfies BiomarkerUnitConversion);

const HBA1C_CONVERSION = Object.freeze({
  fromUnit: 'mmol/mol',
  toUnit: '%',
  multiplier: 0.09148,
  offset: 2.152,
  standard: 'IFCC-to-NGSP master equation',
} satisfies BiomarkerUnitConversion);

function authority(
  organization: string,
  title: string,
  citation: string,
  url: string,
  sourceVersion: string,
): BiomarkerClassificationAuthority {
  return Object.freeze({
    organization,
    title,
    citation,
    url,
    sourceVersion,
    reviewedAt: BIOMARKER_CLASSIFICATION_REVIEW_DATE,
  });
}

function interval(
  biomarkerId: string,
  unit: string,
  ranges: ReferenceIntervalClassificationStrategy['intervals'],
  authorityRecord: BiomarkerClassificationAuthority,
  populationContext = 'Adults',
  requiredContext: readonly BiomarkerClassificationContextField[] = [],
  limitations: readonly string[] = GENERAL_RANGE_LIMITATIONS,
): ReferenceIntervalClassificationStrategy {
  return Object.freeze({
    biomarkerId,
    modelType: 'reference_interval',
    supportedUnits: Object.freeze([unit]),
    conversions: Object.freeze([]),
    requiredContext: Object.freeze([...requiredContext]),
    authority: authorityRecord,
    populationContext,
    limitations: Object.freeze([...limitations]),
    registryVersion: BIOMARKER_CLASSIFICATION_REGISTRY_VERSION,
    intervals: Object.freeze(ranges.map(range => Object.freeze({
      ...range,
      conditions: range.conditions
        ? Object.freeze({ ...range.conditions })
        : undefined,
    }))),
  });
}

function category(
  id: string,
  label: string,
  unit: string,
  lowerBound?: number,
  upperBound?: number,
  optimal: true | null = null,
  conditions?: BiomarkerClassificationConditions,
  inclusivity: {
    readonly lowerInclusive?: boolean;
    readonly upperInclusive?: boolean;
  } = {},
): BiomarkerClassificationBand {
  return Object.freeze({
    id,
    label,
    ...(lowerBound === undefined ? {} : { lowerBound }),
    ...(upperBound === undefined ? {} : { upperBound }),
    lowerInclusive: inclusivity.lowerInclusive ?? true,
    upperInclusive: inclusivity.upperInclusive ?? false,
    unit,
    optimal,
    ...(conditions ? { conditions: Object.freeze({ ...conditions }) } : {}),
  });
}

function referenceBands(
  id: string,
  labelUnit: string,
  lowerBound: number,
  upperBound: number,
): readonly BiomarkerClassificationBand[] {
  return [
    category(
      `${id}/below`,
      'Below reference interval',
      labelUnit,
      undefined,
      lowerBound,
    ),
    category(
      `${id}/within`,
      'Within reference interval',
      labelUnit,
      lowerBound,
      upperBound,
      null,
      undefined,
      { upperInclusive: true },
    ),
    category(
      `${id}/above`,
      'Above reference interval',
      labelUnit,
      upperBound,
      undefined,
      null,
      undefined,
      { lowerInclusive: false },
    ),
  ];
}

function decision(
  biomarkerId: string,
  unit: string,
  categories: readonly BiomarkerClassificationBand[],
  authorityRecord: BiomarkerClassificationAuthority,
  populationContext: string,
  options: {
    readonly requiredContext?: readonly BiomarkerClassificationContextField[];
    readonly conversions?: readonly BiomarkerUnitConversion[];
    readonly limitations?: readonly string[];
    readonly conditions?: BiomarkerClassificationConditions;
  } = {},
): ClinicalDecisionClassificationStrategy {
  const conversions = options.conversions ?? [];
  const categoriesWithSharedConditions = categories.map(item => Object.freeze({
    ...item,
    ...(options.conditions || item.conditions
      ? {
          conditions: Object.freeze({
            ...options.conditions,
            ...item.conditions,
          }),
        }
      : {}),
  }));
  return Object.freeze({
    biomarkerId,
    modelType: 'clinical_decision_categories',
    supportedUnits: Object.freeze([
      unit,
      ...conversions.map(conversion => conversion.fromUnit),
    ]),
    conversions: Object.freeze([...conversions]),
    requiredContext: Object.freeze([...(options.requiredContext ?? [])]),
    authority: authorityRecord,
    populationContext,
    limitations: Object.freeze([
      ...DECISION_LIMITATIONS,
      ...(options.limitations ?? []),
    ]),
    registryVersion: BIOMARKER_CLASSIFICATION_REGISTRY_VERSION,
    categories: Object.freeze(categoriesWithSharedConditions),
  });
}

function governed(
  biomarkerId: string,
  unit: string,
  governedDomain: GovernedDomainClassificationStrategy['governedDomain'],
  reason: string,
  authorityRecord: BiomarkerClassificationAuthority,
  requiredContext: readonly BiomarkerClassificationContextField[],
): GovernedDomainClassificationStrategy {
  return Object.freeze({
    biomarkerId,
    modelType: 'governed_domain',
    supportedUnits: Object.freeze([unit]),
    conversions: Object.freeze([]),
    requiredContext: Object.freeze([...requiredContext]),
    authority: authorityRecord,
    populationContext: 'Only the exact population, protocol, source, and reference authorized by the governed domain.',
    limitations: Object.freeze([
      'The generic biomarker registry may not calculate, approximate, or replace the governed domain output.',
    ]),
    registryVersion: BIOMARKER_CLASSIFICATION_REGISTRY_VERSION,
    governedDomain,
    reason,
  });
}

function unavailable(
  biomarkerId: string,
  unit: string,
  reason: string,
  limitations: readonly string[],
  requiredContext: readonly BiomarkerClassificationContextField[] = [],
): UnavailableClassificationStrategy {
  return Object.freeze({
    biomarkerId,
    modelType: 'unavailable',
    supportedUnits: Object.freeze([unit]),
    conversions: Object.freeze([]),
    requiredContext: Object.freeze([...requiredContext]),
    authority: IFCC_CONTEXT_AUTHORITY,
    populationContext: 'No app-side classification is authorized for the active catalog definition.',
    limitations: Object.freeze([...limitations]),
    registryVersion: BIOMARKER_CLASSIFICATION_REGISTRY_VERSION,
    reason,
  });
}

const APP_CLASSIFICATION_STRATEGIES = [
  decision('apob', 'mg/dL', [
    category('apob-below-risk-enhancer', 'Below the risk-enhancing threshold', 'mg/dL', undefined, 130),
    category('apob-risk-enhancer', 'Risk-enhancing threshold or above', 'mg/dL', 130),
  ], ACC_AHA_APOB, 'Adults undergoing cardiovascular risk assessment.', {
    requiredContext: ['age'],
    conditions: { minimumAge: 18 },
    limitations: ['ApoB treatment goals depend on the person’s overall cardiovascular risk and treatment context.'],
  }),
  decision('hscrp', 'mg/L', [
    category('hscrp-low-relative-risk', 'Low relative cardiovascular risk category', 'mg/L', undefined, 1),
    category('hscrp-average-relative-risk', 'Average relative cardiovascular risk category', 'mg/L', 1, 3, null, undefined, { upperInclusive: true }),
    category('hscrp-high-relative-risk', 'High relative cardiovascular risk category', 'mg/L', 3, 10, null, undefined, { lowerInclusive: false, upperInclusive: true }),
    category('hscrp-above-risk-range', 'Above the usual cardiovascular-risk interpretation range', 'mg/L', 10, undefined, null, undefined, { lowerInclusive: false }),
  ], CDC_AHA_HSCRP, 'Adults without an acute inflammatory or infectious context.', {
    requiredContext: ['age'],
    conditions: { minimumAge: 18 },
    limitations: ['Values at or above 10 mg/L can reflect contexts outside cardiovascular-risk stratification; this app does not infer a cause.'],
  }),
  decision('hba1c', '%', [
    category('hba1c-below-prediabetes', 'Below the prediabetes threshold', '%', undefined, 5.7),
    category('hba1c-prediabetes', 'Prediabetes decision range', '%', 5.7, 6.5),
    category('hba1c-diagnostic-threshold', 'At or above the diabetes diagnostic threshold', '%', 6.5),
  ], ADA_GLYCEMIA, 'Nonpregnant adults using an NGSP-certified method standardized to the DCCT assay.', {
    conversions: [HBA1C_CONVERSION],
    requiredContext: ['age'],
    conditions: { minimumAge: 18 },
    limitations: [
      'A diagnostic threshold is not a diagnosis and ordinarily requires confirmation.',
      'Pregnancy, hemoglobin variants, anemia, altered red-cell turnover, and assay interference can make these categories inapplicable.',
    ],
  }),
  unavailable('igf1', 'ng/mL',
    'IGF-1 reference intervals are materially age-, sex-, pubertal-stage-, and assay-dependent.',
    ['No universal adult interval can be applied from value, unit, and date alone.'],
    ['age', 'sex', 'assay']),
  decision('vitd', 'ng/mL', [
    category('vitd-deficiency-risk', 'Associated with deficiency risk', 'ng/mL', undefined, 12),
    category('vitd-inadequate', 'Generally considered inadequate', 'ng/mL', 12, 20),
    category('vitd-adequate', 'Generally considered adequate for most people', 'ng/mL', 20, 50, null, undefined, { upperInclusive: true }),
    category('vitd-potential-adverse', 'Associated with potential adverse effects', 'ng/mL', 50, undefined, null, undefined, { lowerInclusive: false }),
  ], NIH_VITAMIN_D, 'Serum 25-hydroxyvitamin D in generally healthy people.', {
    requiredContext: ['age'],
    conditions: { minimumAge: 18 },
    limitations: [
      'An optimal concentration has not been established and no category is marked optimal.',
      'Assay variability, life stage, and clinical context affect interpretation.',
    ],
  }),
  unavailable('testosterone', 'ng/dL',
    'Total testosterone interpretation requires sex, age, collection time, assay, and clinical context.',
    ['A universal app interval would silently combine non-equivalent populations and assays.'],
    ['age', 'sex', 'assay', 'measurement_protocol']),
  unavailable('homocysteine', 'μmol/L',
    'Homocysteine reference intervals vary continuously by age and sex and require a named specimen and assay.',
    [
      'The reviewed Mayo LC-MS/MS reference is age- and sex-specific; a generic 5–15 μmol/L interval is not substituted.',
      `Supporting context: ${MEDLINEPLUS_HOMOCYSTEINE.title}.`,
    ], ['age', 'sex', 'specimen', 'assay']),
  decision('fastingglucose', 'mg/dL', [
    category('glucose-below-prediabetes', 'Below the prediabetes threshold', 'mg/dL', undefined, 100),
    category('glucose-prediabetes', 'Impaired fasting glucose decision range', 'mg/dL', 100, 126),
    category('glucose-diagnostic-threshold', 'At or above the diabetes diagnostic threshold', 'mg/dL', 126),
  ], ADA_GLYCEMIA, 'Nonpregnant adults after at least 8 hours without caloric intake; venous plasma.', {
    conversions: [GLUCOSE_CONVERSION],
    requiredContext: ['age', 'fasting'],
    conditions: { minimumAge: 18, fasting: true },
    limitations: [
      'A diagnostic threshold is not a diagnosis and ordinarily requires confirmation.',
      'Pregnancy and nonfasting specimens require different interpretation.',
    ],
  }),
  interval('ferritin', 'ng/mL', [
    { id: 'ferritin-female-adult', lowerBound: 13, upperBound: 150, unit: 'ng/mL', conditions: { minimumAge: 18, sex: 'female' } },
    { id: 'ferritin-male-adult', lowerBound: 30, upperBound: 400, unit: 'ng/mL', conditions: { minimumAge: 18, sex: 'male' } },
  ], MEDLINEPLUS_FERRITIN, 'Adults, partitioned by sex; serum ferritin.', ['age', 'sex'], [
    ...GENERAL_RANGE_LIMITATIONS,
    'Inflammation, infection, liver disease, pregnancy, and iron treatment can affect ferritin interpretation.',
  ]),
  unavailable('dheas', 'μg/dL',
    'DHEA-S reference intervals vary substantially by age, sex, pregnancy, and assay.',
    ['The active profile does not provide sufficient life-stage and assay context.'],
    ['age', 'sex', 'pregnancy', 'assay']),
  unavailable('omega3index', '%',
    'The Omega-3 Index is method-specific and has no universally adopted authority-defined laboratory interval.',
    ['Risk categories cannot be transferred across unverified assays.'],
    ['specimen', 'assay']),
  interval('uricacid', 'mg/dL', [
    { id: 'uric-acid-female-adult', lowerBound: 3, upperBound: 7.1, unit: 'mg/dL', conditions: { minimumAge: 18, sex: 'female' } },
    { id: 'uric-acid-male-adult', lowerBound: 4, upperBound: 8.6, unit: 'mg/dL', conditions: { minimumAge: 18, sex: 'male' } },
  ], MEDLINEPLUS_URIC_ACID, 'Adults, partitioned by sex; blood uric acid.', ['age', 'sex']),
  interval('albumin', 'g/dL', [
    { id: 'albumin-adult-general', lowerBound: 3.4, upperBound: 5.4, unit: 'g/dL', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_CMP, 'Adults; serum albumin.', ['age']),
  interval('creatinine', 'mg/dL', [
    { id: 'creatinine-adult-general', lowerBound: 0.6, upperBound: 1.3, unit: 'mg/dL', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_CMP, 'Adults; serum creatinine. Age and muscle mass affect applicability.', ['age']),
  interval('lymphocytepct', '%', [
    { id: 'lymphocyte-percent-adult-general', lowerBound: 20, upperBound: 40, unit: '%', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_DIFFERENTIAL, 'Adults; automated white-cell differential.', ['age']),
  interval('mcv', 'fL', [
    { id: 'mcv-adult-general', lowerBound: 80, upperBound: 100, unit: 'fL', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_CBC, 'Adults; complete blood count.', ['age']),
  interval('rdw', '%', [
    { id: 'rdw-adult-general', lowerBound: 12, upperBound: 15, unit: '%', conditions: { minimumAge: 18 } },
  ], CLEVELAND_CLINIC_RDW, 'Adults; complete blood count.', ['age']),
  interval('alp', 'U/L', [
    { id: 'alp-adult-general', lowerBound: 20, upperBound: 130, unit: 'U/L', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_CMP, 'Adults; serum alkaline phosphatase.', ['age']),
  interval('wbc', '10³/μL', [
    { id: 'wbc-adult-general', lowerBound: 4.5, upperBound: 11, unit: '10³/μL', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_CBC, 'Adults; complete blood count.', ['age']),
  decision('lpa', 'nmol/L', [
    category('lpa-low', 'Low-risk category', 'nmol/L', undefined, 75),
    category('lpa-intermediate', 'Intermediate category', 'nmol/L', 75, 125),
    category('lpa-high', 'High-risk category', 'nmol/L', 125),
  ], NLA_LPA, 'Adults; molar Lp(a) measurement reported in nmol/L.', {
    requiredContext: ['age'],
    conditions: { minimumAge: 18 },
    limitations: ['Mass and molar Lp(a) units are not interconverted because apo(a) isoform size prevents a single exact conversion.'],
  }),
  decision('hdl', 'mg/dL', [
    category('hdl-low-female', 'Low HDL-C category', 'mg/dL', undefined, 50, null, { minimumAge: 18, sex: 'female' }),
    category('hdl-middle-female', 'Intermediate HDL-C category', 'mg/dL', 50, 60, null, { minimumAge: 18, sex: 'female' }),
    category('hdl-higher-female', 'Higher HDL-C category', 'mg/dL', 60, undefined, null, { minimumAge: 18, sex: 'female' }),
    category('hdl-low-male', 'Low HDL-C category', 'mg/dL', undefined, 40, null, { minimumAge: 18, sex: 'male' }),
    category('hdl-middle-male', 'Intermediate HDL-C category', 'mg/dL', 40, 60, null, { minimumAge: 18, sex: 'male' }),
    category('hdl-higher-male', 'Higher HDL-C category', 'mg/dL', 60, undefined, null, { minimumAge: 18, sex: 'male' }),
  ], AHA_LIPIDS, 'Adults, partitioned by sex.', {
    requiredContext: ['age', 'sex'],
    conditions: { minimumAge: 18 },
  }),
  decision('ldl', 'mg/dL', [
    category('ldl-optimal', 'Optimal LDL-C category', 'mg/dL', undefined, 100, true),
    category('ldl-near-optimal', 'Near or above optimal LDL-C category', 'mg/dL', 100, 130),
    category('ldl-borderline-high', 'Borderline-high LDL-C category', 'mg/dL', 130, 160),
    category('ldl-high', 'High LDL-C category', 'mg/dL', 160, 190),
    category('ldl-very-high', 'Very-high LDL-C category', 'mg/dL', 190),
  ], AHA_LIPIDS, 'Adults; general categories do not replace risk-specific treatment goals.', {
    requiredContext: ['age'],
    conditions: { minimumAge: 18 },
    limitations: ['The word “optimal” is retained only because it is the authority’s category label; individual LDL-C goals depend on cardiovascular risk.'],
  }),
  decision('totalcholesterol', 'mg/dL', [
    category('total-cholesterol-desirable', 'Desirable total cholesterol category', 'mg/dL', undefined, 200),
    category('total-cholesterol-borderline', 'Borderline-high total cholesterol category', 'mg/dL', 200, 240),
    category('total-cholesterol-high', 'High total cholesterol category', 'mg/dL', 240),
  ], AHA_LIPIDS, 'Adults.', {
    requiredContext: ['age'],
    conditions: { minimumAge: 18 },
  }),
  decision('triglycerides', 'mg/dL', [
    category('triglycerides-normal', 'Normal triglyceride category', 'mg/dL', undefined, 150),
    category('triglycerides-borderline', 'Borderline-high triglyceride category', 'mg/dL', 150, 200),
    category('triglycerides-high', 'High triglyceride category', 'mg/dL', 200, 500),
    category('triglycerides-very-high', 'Very-high triglyceride category', 'mg/dL', 500),
  ], AHA_LIPIDS, 'Adults; collection and clinical context remain relevant.', {
    requiredContext: ['age'],
    conditions: { minimumAge: 18 },
  }),
  unavailable('fastinginsulin', 'μIU/mL',
    'No universally standardized fasting-insulin reference or decision categories are available across assays.',
    ['Insulin assays are not sufficiently harmonized for a generic app classification.'],
    ['fasting', 'specimen', 'assay']),
  unavailable('homaIr', 'index',
    'HOMA-IR cutoffs are population-, assay-, and model-version-dependent.',
    ['The catalog value cannot be classified without governed glucose/insulin lineage and a named validated population policy.'],
    ['fasting', 'assay', 'measurement_protocol']),
  unavailable('adiponectin', 'μg/mL',
    'Adiponectin has no universally adopted clinical reference interval or decision categories.',
    ['Assay and population differences materially affect reported concentrations.'],
    ['specimen', 'assay']),
  unavailable('il6', 'pg/mL',
    'IL-6 has no universally adopted general clinical interval for this catalog definition.',
    ['Assay sensitivity, acute illness, specimen handling, and collection context are required.'],
    ['specimen', 'assay', 'measurement_protocol']),
  interval('fibrinogen', 'mg/dL', [
    { id: 'fibrinogen-adult-general', lowerBound: 200, upperBound: 400, unit: 'mg/dL', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_FIBRINOGEN, 'Adults; plasma fibrinogen.', ['age']),
  unavailable('estradiol', 'pg/mL',
    'Estradiol intervals require sex, age, menstrual or menopausal state, pregnancy, collection timing, and assay.',
    ['The current three-field entry cannot establish the required reproductive and assay context.'],
    ['age', 'sex', 'pregnancy', 'assay', 'measurement_protocol']),
  interval('cortisol', 'μg/dL', [
    { id: 'cortisol-morning-adult', lowerBound: 5, upperBound: 25, unit: 'μg/dL', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_CORTISOL, 'Adults; serum sample collected in the morning.', ['age'], [
    ...GENERAL_RANGE_LIMITATIONS,
    'This interval applies only to a morning collection; medication, stress, and collection time can materially affect results.',
  ]),
  unavailable('shbg', 'nmol/L',
    'SHBG intervals vary materially by sex, age, hormonal state, medication, and assay.',
    ['No single reviewed range can be safely attached to the active catalog definition.'],
    ['age', 'sex', 'assay']),
  unavailable('freetestosterone', 'pg/mL',
    'Free-testosterone results are method-dependent and require sex, age, collection time, and assay context.',
    ['Direct immunoassay and calculated/equilibrium-dialysis values are not interchangeable.'],
    ['age', 'sex', 'assay', 'measurement_protocol']),
  interval('b12', 'pg/mL', [
    { id: 'b12-adult-general', lowerBound: 299, upperBound: 1054, unit: 'pg/mL', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_B12, 'Adults; serum vitamin B12.', ['age']),
  unavailable('folate', 'ng/mL',
    'The catalog specifies RBC folate, but its unit does not identify whole-blood versus packed-cell calculation or assay.',
    ['RBC folate reference intervals are method- and laboratory-dependent.'],
    ['specimen', 'assay']),
  unavailable('magnesium', 'mg/dL',
    'The catalog specifies RBC magnesium, for which no universally adopted clinical interval exists.',
    ['Serum magnesium ranges cannot be substituted for an RBC measurement.'],
    ['specimen', 'assay']),
  unavailable('zinc', 'μg/dL',
    'Plasma zinc interpretation requires collection time, fasting state, inflammation status, contamination control, age, sex, and laboratory method.',
    ['A generic interval from value, unit, and date alone is not authorized.'],
    ['age', 'sex', 'fasting', 'specimen', 'assay', 'measurement_protocol']),
  unavailable('vitk2', 'ng/mL',
    'Circulating vitamin K2 (MK-7) has no standardized routine clinical reference interval or decision categories.',
    ['Assays and specimen handling are not sufficiently standardized for app-side classification.'],
    ['specimen', 'assay']),
  interval('tsh', 'mIU/L', [
    { id: 'tsh-adult-general', lowerBound: 0.4, upperBound: 4.8, unit: 'mIU/L', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_TSH, 'Nonpregnant adults; serum TSH.', ['age'], [
    ...GENERAL_RANGE_LIMITATIONS,
    'Pregnancy, age, medications, iodine status, and assay platform can require a different interval.',
  ]),
  unavailable('freeT3', 'pg/mL',
    'Free T3 reference intervals are assay- and population-dependent.',
    ['The catalog does not capture the assay required to select a reviewed interval.'],
    ['age', 'pregnancy', 'assay']),
  unavailable('freeT4', 'ng/dL',
    'Free T4 reference intervals are assay-, pregnancy-, and population-dependent.',
    ['The catalog does not capture the assay required to select a reviewed interval.'],
    ['age', 'pregnancy', 'assay']),
  interval('alt', 'U/L', [
    { id: 'alt-adult-general', lowerBound: 4, upperBound: 36, unit: 'U/L', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_CMP, 'Adults; serum ALT.', ['age']),
  interval('ast', 'U/L', [
    { id: 'ast-adult-general', lowerBound: 8, upperBound: 33, unit: 'U/L', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_CMP, 'Adults; serum AST.', ['age']),
  unavailable('ggt', 'U/L',
    'GGT reference intervals require sex and a compatible temperature-standardized assay.',
    ['The active entry model does not capture assay traceability.'],
    ['age', 'sex', 'specimen', 'assay']),
  decision('egfr', 'mL/min/1.73m²', [
    category('egfr-g5', 'G5 filtration category', 'mL/min/1.73m²', undefined, 15),
    category('egfr-g4', 'G4 filtration category', 'mL/min/1.73m²', 15, 30),
    category('egfr-g3b', 'G3b filtration category', 'mL/min/1.73m²', 30, 45),
    category('egfr-g3a', 'G3a filtration category', 'mL/min/1.73m²', 45, 60),
    category('egfr-g2', 'G2 filtration category', 'mL/min/1.73m²', 60, 90),
    category('egfr-g1', 'G1 filtration category', 'mL/min/1.73m²', 90),
  ], KDIGO_CKD, 'Adults; eGFR normalized to 1.73 m² body-surface area.', {
    requiredContext: ['age'],
    conditions: { minimumAge: 18 },
    limitations: [
      'An eGFR category alone does not establish chronic kidney disease; chronicity and markers of kidney damage are separate requirements.',
      'The app classifies the supplied eGFR and does not calculate or recalculate it.',
    ],
  }),
  unavailable('cystatinC', 'mg/L',
    'Cystatin C interpretation requires assay traceability and is ordinarily used through a validated eGFR equation with clinical context.',
    ['This registry does not calculate eGFR or substitute a generic assay-independent interval.'],
    ['age', 'specimen', 'assay']),
  interval('bun', 'mg/dL', [
    { id: 'bun-adult-general', lowerBound: 6, upperBound: 20, unit: 'mg/dL', conditions: { minimumAge: 18 } },
  ], MEDLINEPLUS_CMP, 'Adults; blood urea nitrogen.', ['age']),
  decision('uacr', 'mg/g', [
    category('uacr-a1', 'A1 albuminuria category', 'mg/g', undefined, 30),
    category('uacr-a2', 'A2 albuminuria category', 'mg/g', 30, 300),
    category('uacr-a3', 'A3 albuminuria category', 'mg/g', 300),
  ], KDIGO_CKD, 'Adults; urine albumin-to-creatinine ratio.', {
    requiredContext: ['age'],
    conditions: { minimumAge: 18 },
    limitations: ['A single UACR measurement does not establish chronicity.'],
  }),
  governed('vo2max', 'mL/kg/min', 'vo2max',
    'VO₂max interpretation remains source-, protocol-, modality-, population-, age-, and sex-bound.',
    VO2MAX_DOMAIN, ['age', 'sex', 'measurement_protocol']),
  governed('gripStrength', 'kg', 'functional_capacity',
    'Grip-strength interpretation remains bound to the governed Functional Capacity protocol and exact reference match.',
    GRIP_GOVERNED_DOMAIN_AUTHORITY, ['age', 'sex', 'measurement_protocol']),
  unavailable('nad', 'μM (WBC)',
    'Cellular NAD+ measurement has no standardized routine clinical assay or authority-defined reference categories.',
    ['The catalog specimen label does not identify a validated interoperable assay.'],
    ['specimen', 'assay']),
] as const satisfies readonly BiomarkerClassificationStrategy[];

export const BIOMARKER_CLASSIFICATION_REGISTRY = Object.freeze({
  version: BIOMARKER_CLASSIFICATION_REGISTRY_VERSION,
  reviewedAt: BIOMARKER_CLASSIFICATION_REVIEW_DATE,
  entries: Object.freeze([...APP_CLASSIFICATION_STRATEGIES]),
});

function normalizeUnit(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .replace(/[µμ]/g, 'u')
    .replace(/³/g, '^3')
    .replace(/²/g, '^2')
    .replace(/\s+/g, '');
}

function matchesConditions(
  conditions: BiomarkerClassificationConditions | undefined,
  context: BiomarkerClassificationContext | undefined,
): boolean {
  if (!conditions) return true;
  if (
    conditions.minimumAge !== undefined
    && (
      context?.ageYears === undefined
      || !Number.isFinite(context.ageYears)
      || context.ageYears < conditions.minimumAge
    )
  ) return false;
  if (
    conditions.maximumAge !== undefined
    && (
      context?.ageYears === undefined
      || !Number.isFinite(context.ageYears)
      || context.ageYears > conditions.maximumAge
    )
  ) return false;
  if (conditions.sex !== undefined && context?.sex !== conditions.sex) {
    return false;
  }
  if (conditions.fasting === true && context?.fasting !== true) return false;
  if (
    conditions.pregnancy === 'not_pregnant'
    && context?.pregnancy !== 'not_pregnant'
  ) return false;
  if (
    conditions.specimen !== undefined
    && normalizeUnit(context?.specimen ?? '') !== normalizeUnit(conditions.specimen)
  ) return false;
  if (
    conditions.assay !== undefined
    && normalizeUnit(context?.assay ?? '') !== normalizeUnit(conditions.assay)
  ) return false;
  return true;
}

function hasRequiredContext(
  required: readonly BiomarkerClassificationContextField[],
  context: BiomarkerClassificationContext | undefined,
): boolean {
  return required.every(field => {
    if (field === 'age') {
      return context?.ageYears !== undefined
        && Number.isFinite(context.ageYears);
    }
    if (field === 'sex') return context?.sex !== undefined;
    if (field === 'fasting') return context?.fasting === true;
    if (field === 'pregnancy') {
      return context?.pregnancy !== undefined
        && context.pregnancy !== 'unknown';
    }
    if (field === 'specimen') return Boolean(context?.specimen?.trim());
    if (field === 'assay') return Boolean(context?.assay?.trim());
    return Boolean(context?.measurementProtocol?.trim());
  });
}

function convertedValue(
  value: number,
  unit: string,
  targetUnit: string,
  conversions: readonly BiomarkerUnitConversion[],
): number | null {
  if (!Number.isFinite(value)) return null;
  if (normalizeUnit(unit) === normalizeUnit(targetUnit)) return value;
  const conversion = conversions.find(candidate =>
    normalizeUnit(candidate.fromUnit) === normalizeUnit(unit)
    && normalizeUnit(candidate.toUnit) === normalizeUnit(targetUnit));
  if (!conversion) return null;
  const converted = value * conversion.multiplier + conversion.offset;
  return Number.isFinite(converted) ? converted : null;
}

function bandContains(
  band: BiomarkerClassificationBand,
  value: number,
): boolean {
  const lowerMatches = band.lowerBound === undefined
    || (band.lowerInclusive ? value >= band.lowerBound : value > band.lowerBound);
  const upperMatches = band.upperBound === undefined
    || (band.upperInclusive ? value <= band.upperBound : value < band.upperBound);
  return lowerMatches && upperMatches;
}

function sourceLaboratoryClassification(
  biomarkerId: string,
  value: number,
  unit: string,
  sourceLabRange: SourceLabRange,
): ResolvedBiomarkerClassification | null {
  if (
    normalizeUnit(unit) !== normalizeUnit(sourceLabRange.unit)
    || !Number.isFinite(value)
  ) return null;
  const { lowerBound, upperBound } = sourceLabRange;
  if (
    (lowerBound === undefined && upperBound === undefined)
    || (lowerBound !== undefined && !Number.isFinite(lowerBound))
    || (upperBound !== undefined && !Number.isFinite(upperBound))
    || (
      lowerBound !== undefined
      && upperBound !== undefined
      && lowerBound > upperBound
    )
  ) return null;

  const bands = lowerBound !== undefined && upperBound !== undefined
    ? referenceBands('source', unit, lowerBound, upperBound)
    : [
        ...(lowerBound === undefined
          ? []
          : [category('source-below', 'Below reference interval', unit, undefined, lowerBound)]),
        category(
          'source-within',
          'Within reference interval',
          unit,
          lowerBound,
          upperBound,
          null,
          undefined,
          { upperInclusive: true },
        ),
        ...(upperBound === undefined
          ? []
          : [category(
              'source-above',
              'Above reference interval',
              unit,
              upperBound,
              undefined,
              null,
              undefined,
              { lowerInclusive: false },
            )]),
      ];
  const selected = bands.find(band => bandContains(band, value));
  if (!selected) return null;

  return {
    biomarkerId,
    modelType: 'reference_interval',
    source: 'source_laboratory',
    label: selected.label,
    value,
    unit,
    optimal: null,
    selectedBandId: selected.id,
    bands,
    authority: authority(
      sourceLabRange.laboratoryName ?? 'Source laboratory',
      'Reference interval from this laboratory report',
      sourceLabRange.reportedText ?? 'Interval supplied with the source laboratory report.',
      'https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/',
      'Measurement-specific laboratory report',
    ),
    populationContext: 'The interval printed for this exact laboratory measurement.',
    limitations: [
      'This comparison applies only to the measurement and interval from the same report.',
      'A reference comparison does not establish or exclude a health condition.',
    ],
    registryVersion: BIOMARKER_CLASSIFICATION_REGISTRY_VERSION,
  };
}

export function biomarkerClassificationStrategyFor(
  biomarkerId: string,
): BiomarkerClassificationStrategy | undefined {
  return BIOMARKER_CLASSIFICATION_REGISTRY.entries
    .find(entry => entry.biomarkerId === biomarkerId);
}

export function resolveBiomarkerClassification(input: {
  readonly biomarkerId: string;
  readonly value: number;
  readonly unit: string;
  readonly context?: BiomarkerClassificationContext;
  readonly sourceLabRange?: SourceLabRange;
}): ResolvedBiomarkerClassification | null {
  if (input.sourceLabRange) {
    const sourceResult = sourceLaboratoryClassification(
      input.biomarkerId,
      input.value,
      input.unit,
      input.sourceLabRange,
    );
    if (sourceResult) return sourceResult;
  }

  const strategy = biomarkerClassificationStrategyFor(input.biomarkerId);
  if (
    !strategy
    || strategy.modelType === 'unavailable'
    || strategy.modelType === 'governed_domain'
  ) return null;
  if (!hasRequiredContext(strategy.requiredContext, input.context)) {
    return null;
  }

  if (strategy.modelType === 'reference_interval') {
    const matchingInterval = strategy.intervals.find(candidate =>
      matchesConditions(candidate.conditions, input.context));
    if (!matchingInterval) return null;
    const value = convertedValue(
      input.value,
      input.unit,
      matchingInterval.unit,
      strategy.conversions,
    );
    if (value === null) return null;
    const bands = referenceBands(
      matchingInterval.id,
      matchingInterval.unit,
      matchingInterval.lowerBound,
      matchingInterval.upperBound,
    );
    const selected = bands.find(band => bandContains(band, value));
    if (!selected) return null;
    return {
      biomarkerId: input.biomarkerId,
      modelType: 'reference_interval',
      source: 'app_registry',
      label: selected.label,
      value,
      unit: matchingInterval.unit,
      optimal: null,
      selectedBandId: selected.id,
      bands,
      authority: strategy.authority,
      populationContext: strategy.populationContext,
      limitations: strategy.limitations,
      registryVersion: strategy.registryVersion,
    };
  }

  const applicableCategories = strategy.categories.filter(candidate =>
    matchesConditions(candidate.conditions, input.context));
  if (applicableCategories.length === 0) return null;
  const targetUnit = applicableCategories[0].unit;
  const value = convertedValue(
    input.value,
    input.unit,
    targetUnit,
    strategy.conversions,
  );
  if (value === null) return null;
  const selected = applicableCategories.find(band => bandContains(band, value));
  if (!selected) return null;
  return {
    biomarkerId: input.biomarkerId,
    modelType: 'clinical_decision_categories',
    source: 'app_registry',
    label: selected.label,
    value,
    unit: targetUnit,
    optimal: selected.optimal,
    selectedBandId: selected.id,
    bands: applicableCategories,
    authority: strategy.authority,
    populationContext: strategy.populationContext,
    limitations: strategy.limitations,
    registryVersion: strategy.registryVersion,
  };
}

export function classificationBandsForChart(input: {
  readonly biomarkerId: string;
  readonly unit: string;
  readonly context?: BiomarkerClassificationContext;
  readonly sourceLabRange?: SourceLabRange;
}): readonly BiomarkerClassificationBand[] {
  const strategy = biomarkerClassificationStrategyFor(input.biomarkerId);
  if (input.sourceLabRange) {
    const lowerBound = input.sourceLabRange.lowerBound;
    const upperBound = input.sourceLabRange.upperBound;
    if (
      normalizeUnit(input.unit) !== normalizeUnit(input.sourceLabRange.unit)
      || (lowerBound === undefined && upperBound === undefined)
      || (lowerBound !== undefined && !Number.isFinite(lowerBound))
      || (upperBound !== undefined && !Number.isFinite(upperBound))
      || (
        lowerBound !== undefined
        && upperBound !== undefined
        && lowerBound > upperBound
      )
    ) return [];
    if (lowerBound !== undefined && upperBound !== undefined) {
      return referenceBands('source', input.unit, lowerBound, upperBound);
    }
    return [
      ...(lowerBound === undefined
        ? []
        : [category('source-below', 'Below reference interval', input.unit, undefined, lowerBound)]),
      category(
        'source-within',
        'Within reference interval',
        input.unit,
        lowerBound,
        upperBound,
        null,
        undefined,
        { upperInclusive: true },
      ),
      ...(upperBound === undefined
        ? []
        : [category(
            'source-above',
            'Above reference interval',
            input.unit,
            upperBound,
            undefined,
            null,
            undefined,
            { lowerInclusive: false },
          )]),
    ];
  }
  if (!strategy) return [];
  if (!hasRequiredContext(strategy.requiredContext, input.context)) return [];
  if (strategy.modelType === 'reference_interval') {
    const selected = strategy.intervals.find(candidate =>
      normalizeUnit(candidate.unit) === normalizeUnit(input.unit)
      && matchesConditions(candidate.conditions, input.context));
    if (!selected) return [];
    return referenceBands(
      selected.id,
      input.unit,
      selected.lowerBound,
      selected.upperBound,
    );
  }
  if (strategy.modelType !== 'clinical_decision_categories') return [];
  return strategy.categories.filter(candidate =>
    normalizeUnit(candidate.unit) === normalizeUnit(input.unit)
    && matchesConditions(candidate.conditions, input.context));
}
