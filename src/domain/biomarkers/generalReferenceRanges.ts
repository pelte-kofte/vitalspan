import type { SourceLabRange } from '../../types/biomarkerKnowledge';

export const GENERAL_REFERENCE_RANGE_REGISTRY_VERSION =
  'biomarker-general-reference-range/2.0.0';

export const GENERAL_REFERENCE_RANGE_REVIEW_DATE = '2026-07-25';

export const GENERAL_REFERENCE_RANGE_BATCH_1_BIOMARKER_IDS = Object.freeze([
  'ldl',
  'hdl',
  'totalcholesterol',
  'triglycerides',
  'fastingglucose',
  'hba1c',
  'apob',
  'hscrp',
  'creatinine',
  'alt',
  'ast',
  'ferritin',
  'b12',
  'vitd',
  'tsh',
] as const);

export type GeneralReferenceRangeBatch1BiomarkerId =
  (typeof GENERAL_REFERENCE_RANGE_BATCH_1_BIOMARKER_IDS)[number];

export type GeneralReferenceSex = 'female' | 'male';

export type PregnancyContext =
  | 'not_applicable'
  | 'not_pregnant_breastfeeding_or_within_one_year_postpartum';

export type ReferenceAssayTraceability =
  | 'ifcc_reference_measurement_procedure_at_37_c'
  | 'idms_traceable';

export type ReferencePopulationGroup =
  | 'international_multicenter_adults'
  | 'white_adults';

export interface GeneralReferenceRangeContext {
  readonly unit: string;
  readonly ageYears?: number;
  readonly sex?: GeneralReferenceSex;
  readonly pregnancyContext?: PregnancyContext;
  readonly specimen?: 'serum' | 'plasma';
  readonly assayTraceability?: ReferenceAssayTraceability;
  readonly fastingHours?: number;
  readonly populationGroup?: ReferencePopulationGroup;
}

export interface ReferenceAuthority {
  readonly organization: string;
  readonly sourceTitle: string;
  readonly citation: string;
  readonly sourceVersion: string;
  readonly sourceUrl: string;
  readonly reviewedAt: typeof GENERAL_REFERENCE_RANGE_REVIEW_DATE;
}

export interface GeneralReferenceRangeConditions {
  readonly ageRangeYears: readonly [number, number];
  readonly sex: GeneralReferenceSex;
  readonly pregnancyContext: PregnancyContext;
  readonly specimen: 'serum' | 'plasma';
  readonly assayTraceability: ReferenceAssayTraceability;
  readonly fastingMoreThanHours?: number;
  readonly populationGroup: ReferencePopulationGroup;
}

export interface GeneralReferenceRange {
  readonly id: string;
  readonly biomarkerId: GeneralReferenceRangeBatch1BiomarkerId;
  readonly lowerBound: number;
  readonly upperBound: number;
  readonly unit: string;
  readonly reportedText: string;
  readonly evidenceKind: 'laboratory_reference_interval';
  readonly reviewStatus: 'reviewed';
  readonly approvedUse: 'general_reference_display';
  readonly registryVersion: typeof GENERAL_REFERENCE_RANGE_REGISTRY_VERSION;
  readonly provenance: 'international_authoritative_source';
  readonly authority: ReferenceAuthority;
  readonly populationContext: string;
  readonly limitations: readonly string[];
  readonly conditions: GeneralReferenceRangeConditions;
}

export type GeneralReferenceUnavailabilityReason =
  | 'clinical_decision_threshold_not_reference_interval'
  | 'no_single_defensible_general_interval';

export interface GeneralReferenceReviewRecord {
  readonly biomarkerId: GeneralReferenceRangeBatch1BiomarkerId;
  readonly unit: string;
  readonly status: 'eligible_with_complete_context' | 'unavailable';
  readonly evidenceKind:
    | 'laboratory_reference_interval'
    | 'clinical_decision_threshold'
    | 'insufficient_for_general_reference_interval';
  readonly reason?: GeneralReferenceUnavailabilityReason;
  readonly authority: ReferenceAuthority;
  readonly populationContext: string;
  readonly limitations: readonly string[];
  readonly reviewedAt: typeof GENERAL_REFERENCE_RANGE_REVIEW_DATE;
  readonly registryVersion: typeof GENERAL_REFERENCE_RANGE_REGISTRY_VERSION;
}

export type SelectedBiomarkerReference =
  | {
      readonly kind: 'source_laboratory';
      readonly range: SourceLabRange;
    }
  | {
      readonly kind: 'general';
      readonly range: GeneralReferenceRange;
    };

const IFCC_AST_ALT_AUTHORITY = Object.freeze({
  organization:
    'International Federation of Clinical Chemistry and Laboratory Medicine (IFCC), C-RIDL and C-RSE',
  sourceTitle:
    'Common reference intervals for aspartate aminotransferase (AST), alanine aminotransferase (ALT) and gamma-glutamyl transferase (GGT) in serum',
  citation:
    'Ceriotti F, Henny J, Queralto J, et al. Clin Chem Lab Med. 2010;48(11):1593-1601. doi:10.1515/CCLM.2010.315.',
  sourceVersion: 'IFCC multicenter study, 2010',
  sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/21034260/',
  reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
} satisfies ReferenceAuthority);

const IFCC_CREATININE_AUTHORITY = Object.freeze({
  organization:
    'International Federation of Clinical Chemistry and Laboratory Medicine (IFCC), C-RIDL',
  sourceTitle:
    'Reference intervals for serum creatinine concentrations: assessment of available data for global application',
  citation:
    'Ceriotti F, Boyd JC, Klein G, et al. Clin Chem. 2008;54(3):559-566. doi:10.1373/clinchem.2007.099648.',
  sourceVersion: 'IFCC C-RIDL systematic review, 2008',
  sourceUrl: 'https://doi.org/10.1373/clinchem.2007.099648',
  reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
} satisfies ReferenceAuthority);

const EAS_EFLM_LIPID_AUTHORITY = Object.freeze({
  organization:
    'European Atherosclerosis Society (EAS) and European Federation of Clinical Chemistry and Laboratory Medicine (EFLM)',
  sourceTitle:
    'Fasting is not routinely required for determination of a lipid profile: clinical and laboratory implications including flagging at desirable concentration cut-points',
  citation:
    'Nordestgaard BG, Langsted A, Mora S, et al. Eur Heart J. 2016;37(25):1944-1958. doi:10.1093/eurheartj/ehw152.',
  sourceVersion: 'EAS/EFLM Joint Consensus Statement, 2016',
  sourceUrl:
    'https://eas-society.org/content/fasting-is-not-routinely-required-for-determination-of-a-lipid-profile-clinical-and-laboratory-implications-including-flagging-at-desirable-concentration-cut-points-a-joint-consensus-statemen/',
  reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
} satisfies ReferenceAuthority);

const ADA_GLYCEMIA_AUTHORITY = Object.freeze({
  organization: 'American Diabetes Association (ADA)',
  sourceTitle:
    'Diagnosis and Classification of Diabetes: Standards of Care in Diabetes—2026',
  citation:
    'American Diabetes Association Professional Practice Committee. Diabetes Care. 2026;49(Suppl 1):S27-S49.',
  sourceVersion: 'Standards of Care in Diabetes, 2026',
  sourceUrl:
    'https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes',
  reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
} satisfies ReferenceAuthority);

const IFCC_GLOBAL_VARIATION_AUTHORITY = Object.freeze({
  organization:
    'International Federation of Clinical Chemistry and Laboratory Medicine (IFCC), C-RIDL',
  sourceTitle:
    'A global multicenter study on reference values: 2. Exploration of sources of variation across the countries',
  citation:
    'Ichihara K, Ozarda Y, Barth JH, et al. Clin Chim Acta. 2017;467:83-97. doi:10.1016/j.cca.2016.09.015.',
  sourceVersion: 'IFCC C-RIDL Global Study Part 2, 2017',
  sourceUrl:
    'https://cms.ifcc.org/media/476753/ifcc-c-ridl_global-study-part-2.pdf',
  reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
} satisfies ReferenceAuthority);

const WHO_FERRITIN_AUTHORITY = Object.freeze({
  organization: 'World Health Organization (WHO)',
  sourceTitle:
    'WHO guideline on use of ferritin concentrations to assess iron status in individuals and populations',
  citation:
    'World Health Organization. WHO guideline on use of ferritin concentrations to assess iron status in individuals and populations. 2020. ISBN 978-92-4-000012-4.',
  sourceVersion: 'WHO guideline, 2020',
  sourceUrl:
    'https://www.who.int/publications/i/item/9789240000124',
  reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
} satisfies ReferenceAuthority);

const WHO_B12_AUTHORITY = Object.freeze({
  organization: 'World Health Organization (WHO)',
  sourceTitle: 'Guidelines on food fortification with micronutrients',
  citation:
    'Allen L, de Benoist B, Dary O, Hurrell R, eds. Guidelines on food fortification with micronutrients. World Health Organization and Food and Agriculture Organization; 2006.',
  sourceVersion: 'WHO/FAO guideline, 2006',
  sourceUrl:
    'https://iris.who.int/bitstream/handle/10665/43412/9241594012_eng.pdf',
  reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
} satisfies ReferenceAuthority);

const WHO_VITAMIN_D_AUTHORITY = Object.freeze({
  organization: 'World Health Organization (WHO)',
  sourceTitle: 'Micronutrient survey manual',
  citation:
    'World Health Organization. Micronutrient survey manual. 2020. ISBN 978-92-4-001269-1.',
  sourceVersion: 'WHO manual, 2020',
  sourceUrl:
    'https://iris.who.int/bitstream/handle/10665/336010/9789240012691-eng.pdf',
  reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
} satisfies ReferenceAuthority);

const IFCC_TSH_AUTHORITY = Object.freeze({
  organization:
    'International Federation of Clinical Chemistry and Laboratory Medicine (IFCC), C-STFT',
  sourceTitle: 'Harmonization of TSH measurements',
  citation:
    'IFCC Committee for Standardization of Thyroid Function Tests. Harmonization of TSH measurements.',
  sourceVersion: 'IFCC C-STFT harmonization programme, reviewed 2026',
  sourceUrl: 'https://ifcc-cstft.org/harmonization-of-tsh-measurements',
  reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
} satisfies ReferenceAuthority);

function frozenRange(
  range: Omit<
    GeneralReferenceRange,
    | 'reviewStatus'
    | 'approvedUse'
    | 'registryVersion'
    | 'provenance'
    | 'evidenceKind'
  >,
): GeneralReferenceRange {
  return Object.freeze({
    ...range,
    evidenceKind: 'laboratory_reference_interval',
    reviewStatus: 'reviewed',
    approvedUse: 'general_reference_display',
    registryVersion: GENERAL_REFERENCE_RANGE_REGISTRY_VERSION,
    provenance: 'international_authoritative_source',
    authority: Object.freeze({ ...range.authority }),
    limitations: Object.freeze([...range.limitations]),
    conditions: Object.freeze({
      ...range.conditions,
      ageRangeYears: Object.freeze([...range.conditions.ageRangeYears]) as
        unknown as readonly [number, number],
    }),
  });
}

const GENERAL_REFERENCE_RANGES: Readonly<
  Record<GeneralReferenceRangeBatch1BiomarkerId, readonly GeneralReferenceRange[]>
> = Object.freeze({
  ldl: Object.freeze([]),
  hdl: Object.freeze([]),
  totalcholesterol: Object.freeze([]),
  triglycerides: Object.freeze([]),
  fastingglucose: Object.freeze([]),
  hba1c: Object.freeze([]),
  apob: Object.freeze([]),
  hscrp: Object.freeze([]),
  creatinine: Object.freeze([
    frozenRange({
      id: 'general-reference/creatinine/white-adult-male-idms/1.0.0',
      biomarkerId: 'creatinine',
      lowerBound: 64,
      upperBound: 104,
      unit: 'µmol/L',
      reportedText: '64–104',
      authority: IFCC_CREATININE_AUTHORITY,
      populationContext:
        'White male adults aged 18–74 years; serum creatinine measured with results traceable to the IDMS reference method.',
      limitations: [
        'Not transferable to other population groups without scientific validation.',
        'Creatinine is influenced by muscle mass, diet, supplements, pregnancy, and changing kidney function.',
        'A source laboratory interval remains authoritative for the individual report.',
      ],
      conditions: {
        ageRangeYears: [18, 74],
        sex: 'male',
        pregnancyContext: 'not_applicable',
        specimen: 'serum',
        assayTraceability: 'idms_traceable',
        populationGroup: 'white_adults',
      },
    }),
    frozenRange({
      id: 'general-reference/creatinine/white-adult-female-idms/1.0.0',
      biomarkerId: 'creatinine',
      lowerBound: 49,
      upperBound: 90,
      unit: 'µmol/L',
      reportedText: '49–90',
      authority: IFCC_CREATININE_AUTHORITY,
      populationContext:
        'White nonpregnant female adults aged 18–74 years; serum creatinine measured with results traceable to the IDMS reference method.',
      limitations: [
        'Not transferable to other population groups without scientific validation.',
        'Not approved for pregnancy or the postpartum period.',
        'Creatinine is influenced by muscle mass, diet, supplements, and changing kidney function.',
        'A source laboratory interval remains authoritative for the individual report.',
      ],
      conditions: {
        ageRangeYears: [18, 74],
        sex: 'female',
        pregnancyContext:
          'not_pregnant_breastfeeding_or_within_one_year_postpartum',
        specimen: 'serum',
        assayTraceability: 'idms_traceable',
        populationGroup: 'white_adults',
      },
    }),
  ]),
  alt: Object.freeze([
    frozenRange({
      id: 'general-reference/alt/adult-male-ifcc-37c/1.0.0',
      biomarkerId: 'alt',
      lowerBound: 9,
      upperBound: 59,
      unit: 'U/L',
      reportedText: '9–59',
      authority: IFCC_AST_ALT_AUTHORITY,
      populationContext:
        'Apparently healthy fasting male adults aged 18–85 years from an international multicenter population; serum activity measured on systems standardized to the IFCC reference measurement procedure at 37 °C.',
      limitations: [
        'Requires compatible IFCC-standardized enzyme methodology.',
        'The study collection followed an overnight fast of more than 10 hours.',
        'A source laboratory interval remains authoritative for the individual report.',
      ],
      conditions: {
        ageRangeYears: [18, 85],
        sex: 'male',
        pregnancyContext: 'not_applicable',
        specimen: 'serum',
        assayTraceability: 'ifcc_reference_measurement_procedure_at_37_c',
        fastingMoreThanHours: 10,
        populationGroup: 'international_multicenter_adults',
      },
    }),
    frozenRange({
      id: 'general-reference/alt/adult-female-ifcc-37c/1.0.0',
      biomarkerId: 'alt',
      lowerBound: 8,
      upperBound: 41,
      unit: 'U/L',
      reportedText: '8–41',
      authority: IFCC_AST_ALT_AUTHORITY,
      populationContext:
        'Apparently healthy fasting female adults aged 18–85 years who were not pregnant, breastfeeding, or within one year postpartum; serum activity measured on systems standardized to the IFCC reference measurement procedure at 37 °C.',
      limitations: [
        'Requires compatible IFCC-standardized enzyme methodology.',
        'Not approved for pregnancy, breastfeeding, or the first postpartum year.',
        'The study collection followed an overnight fast of more than 10 hours.',
        'A source laboratory interval remains authoritative for the individual report.',
      ],
      conditions: {
        ageRangeYears: [18, 85],
        sex: 'female',
        pregnancyContext:
          'not_pregnant_breastfeeding_or_within_one_year_postpartum',
        specimen: 'serum',
        assayTraceability: 'ifcc_reference_measurement_procedure_at_37_c',
        fastingMoreThanHours: 10,
        populationGroup: 'international_multicenter_adults',
      },
    }),
  ]),
  ast: Object.freeze([
    frozenRange({
      id: 'general-reference/ast/adult-male-ifcc-37c/1.0.0',
      biomarkerId: 'ast',
      lowerBound: 11,
      upperBound: 34,
      unit: 'U/L',
      reportedText: '11–34',
      authority: IFCC_AST_ALT_AUTHORITY,
      populationContext:
        'Apparently healthy fasting male adults aged 18–85 years from an international multicenter population; serum activity measured on systems standardized to the IFCC reference measurement procedure at 37 °C.',
      limitations: [
        'Requires compatible IFCC-standardized enzyme methodology.',
        'The study collection followed an overnight fast of more than 10 hours.',
        'A source laboratory interval remains authoritative for the individual report.',
      ],
      conditions: {
        ageRangeYears: [18, 85],
        sex: 'male',
        pregnancyContext: 'not_applicable',
        specimen: 'serum',
        assayTraceability: 'ifcc_reference_measurement_procedure_at_37_c',
        fastingMoreThanHours: 10,
        populationGroup: 'international_multicenter_adults',
      },
    }),
    frozenRange({
      id: 'general-reference/ast/adult-female-ifcc-37c/1.0.0',
      biomarkerId: 'ast',
      lowerBound: 11,
      upperBound: 34,
      unit: 'U/L',
      reportedText: '11–34',
      authority: IFCC_AST_ALT_AUTHORITY,
      populationContext:
        'Apparently healthy fasting female adults aged 18–85 years who were not pregnant, breastfeeding, or within one year postpartum; serum activity measured on systems standardized to the IFCC reference measurement procedure at 37 °C.',
      limitations: [
        'Requires compatible IFCC-standardized enzyme methodology.',
        'Not approved for pregnancy, breastfeeding, or the first postpartum year.',
        'The study collection followed an overnight fast of more than 10 hours.',
        'A source laboratory interval remains authoritative for the individual report.',
      ],
      conditions: {
        ageRangeYears: [18, 85],
        sex: 'female',
        pregnancyContext:
          'not_pregnant_breastfeeding_or_within_one_year_postpartum',
        specimen: 'serum',
        assayTraceability: 'ifcc_reference_measurement_procedure_at_37_c',
        fastingMoreThanHours: 10,
        populationGroup: 'international_multicenter_adults',
      },
    }),
  ]),
  ferritin: Object.freeze([]),
  b12: Object.freeze([]),
  vitd: Object.freeze([]),
  tsh: Object.freeze([]),
});

function unavailableReview(
  biomarkerId: GeneralReferenceRangeBatch1BiomarkerId,
  unit: string,
  evidenceKind:
    | 'clinical_decision_threshold'
    | 'insufficient_for_general_reference_interval',
  reason: GeneralReferenceUnavailabilityReason,
  authority: ReferenceAuthority,
  populationContext: string,
  limitations: readonly string[],
): GeneralReferenceReviewRecord {
  return Object.freeze({
    biomarkerId,
    unit,
    status: 'unavailable',
    evidenceKind,
    reason,
    authority: Object.freeze({ ...authority }),
    populationContext,
    limitations: Object.freeze([...limitations]),
    reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
    registryVersion: GENERAL_REFERENCE_RANGE_REGISTRY_VERSION,
  });
}

function eligibleReview(
  biomarkerId: 'creatinine' | 'alt' | 'ast',
  unit: string,
  authority: ReferenceAuthority,
  populationContext: string,
  limitations: readonly string[],
): GeneralReferenceReviewRecord {
  return Object.freeze({
    biomarkerId,
    unit,
    status: 'eligible_with_complete_context',
    evidenceKind: 'laboratory_reference_interval',
    authority: Object.freeze({ ...authority }),
    populationContext,
    limitations: Object.freeze([...limitations]),
    reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
    registryVersion: GENERAL_REFERENCE_RANGE_REGISTRY_VERSION,
  });
}

const LIPID_DECISION_LIMITATIONS = Object.freeze([
  'The cited concentrations are desirable or therapeutic decision thresholds, not central-95% laboratory reference intervals.',
  'Clinical interpretation depends on cardiovascular risk, treatment status, and collection context.',
  'No decision threshold is released as a General reference interval.',
]);

const GENERAL_REFERENCE_REVIEWS: Readonly<
  Record<GeneralReferenceRangeBatch1BiomarkerId, GeneralReferenceReviewRecord>
> = Object.freeze({
  ldl: unavailableReview(
    'ldl',
    'mg/dL',
    'clinical_decision_threshold',
    'clinical_decision_threshold_not_reference_interval',
    EAS_EFLM_LIPID_AUTHORITY,
    'Adults undergoing cardiovascular risk assessment.',
    LIPID_DECISION_LIMITATIONS,
  ),
  hdl: unavailableReview(
    'hdl',
    'mg/dL',
    'clinical_decision_threshold',
    'clinical_decision_threshold_not_reference_interval',
    EAS_EFLM_LIPID_AUTHORITY,
    'Adults undergoing cardiovascular risk assessment.',
    LIPID_DECISION_LIMITATIONS,
  ),
  totalcholesterol: unavailableReview(
    'totalcholesterol',
    'mg/dL',
    'clinical_decision_threshold',
    'clinical_decision_threshold_not_reference_interval',
    EAS_EFLM_LIPID_AUTHORITY,
    'Adults undergoing cardiovascular risk assessment.',
    LIPID_DECISION_LIMITATIONS,
  ),
  triglycerides: unavailableReview(
    'triglycerides',
    'mg/dL',
    'clinical_decision_threshold',
    'clinical_decision_threshold_not_reference_interval',
    EAS_EFLM_LIPID_AUTHORITY,
    'Adults; fasting state changes the applicable flagging threshold.',
    LIPID_DECISION_LIMITATIONS,
  ),
  fastingglucose: unavailableReview(
    'fastingglucose',
    'mg/dL',
    'clinical_decision_threshold',
    'clinical_decision_threshold_not_reference_interval',
    ADA_GLYCEMIA_AUTHORITY,
    'Nonpregnant individuals; fasting plasma glucose requires at least 8 hours without caloric intake.',
    [
      'The authoritative values are diagnostic and risk decision thresholds, not a laboratory reference interval.',
      'Pregnancy uses different criteria.',
      'Diagnosis requires clinical context and, absent unequivocal hyperglycemia, confirmatory testing.',
    ],
  ),
  hba1c: unavailableReview(
    'hba1c',
    '%',
    'clinical_decision_threshold',
    'clinical_decision_threshold_not_reference_interval',
    ADA_GLYCEMIA_AUTHORITY,
    'Nonpregnant individuals using an NGSP-certified method standardized to the DCCT reference assay.',
    [
      'The authoritative values are diagnostic and risk decision thresholds, not a laboratory reference interval.',
      'Pregnancy, hemoglobin variants, altered red-cell turnover, and assay interference can change applicability.',
      'Diagnosis requires clinical context and, absent unequivocal hyperglycemia, confirmatory testing.',
    ],
  ),
  apob: unavailableReview(
    'apob',
    'mg/dL',
    'clinical_decision_threshold',
    'clinical_decision_threshold_not_reference_interval',
    EAS_EFLM_LIPID_AUTHORITY,
    'Adults undergoing cardiovascular risk assessment.',
    LIPID_DECISION_LIMITATIONS,
  ),
  hscrp: unavailableReview(
    'hscrp',
    'mg/L',
    'insufficient_for_general_reference_interval',
    'no_single_defensible_general_interval',
    IFCC_GLOBAL_VARIATION_AUTHORITY,
    'International adult populations; high-sensitivity CRP risk use is distinct from routine CRP reference-value studies.',
    [
      'Reference values vary with ethnicity, BMI, geography, and inflammatory context.',
      'Cardiovascular risk bands are risk-association thresholds, not laboratory reference intervals.',
      'The IFCC global study used routine CRP assays and cannot be silently transferred to hs-CRP.',
    ],
  ),
  creatinine: eligibleReview(
    'creatinine',
    'µmol/L',
    IFCC_CREATININE_AUTHORITY,
    'White adults aged 18–74 years, partitioned by sex, using IDMS-traceable serum methods.',
    [
      'Population, age, sex, specimen, assay traceability, and pregnancy context must match.',
      'No unit conversion is performed by this registry.',
    ],
  ),
  alt: eligibleReview(
    'alt',
    'U/L',
    IFCC_AST_ALT_AUTHORITY,
    'Apparently healthy fasting adults aged 18–85 years, partitioned by sex, using compatible IFCC-standardized serum methods at 37 °C.',
    [
      'Age, sex, pregnancy context, specimen, assay traceability, and fasting state must match.',
    ],
  ),
  ast: eligibleReview(
    'ast',
    'U/L',
    IFCC_AST_ALT_AUTHORITY,
    'Apparently healthy fasting adults aged 18–85 years using compatible IFCC-standardized serum methods at 37 °C.',
    [
      'Age, pregnancy context, specimen, assay traceability, and fasting state must match.',
    ],
  ),
  ferritin: unavailableReview(
    'ferritin',
    'ng/mL',
    'clinical_decision_threshold',
    'clinical_decision_threshold_not_reference_interval',
    WHO_FERRITIN_AUTHORITY,
    'Individuals and populations assessed for iron status.',
    [
      'WHO values are iron-status decision cutoffs, not central-95% laboratory reference intervals.',
      'Age, sex, pregnancy, inflammation, infection, and assay context affect interpretation.',
      'No WHO cutoff is released as a General reference interval.',
    ],
  ),
  b12: unavailableReview(
    'b12',
    'pg/mL',
    'clinical_decision_threshold',
    'clinical_decision_threshold_not_reference_interval',
    WHO_B12_AUTHORITY,
    'Population-level assessment of vitamin B12 status.',
    [
      'WHO describes a deficiency cutoff, not a laboratory reference interval.',
      'Values above the cutoff do not necessarily establish adequate status.',
      'Assay method, population, renal function, and confirmatory biomarkers affect interpretation.',
    ],
  ),
  vitd: unavailableReview(
    'vitd',
    'ng/mL',
    'insufficient_for_general_reference_interval',
    'no_single_defensible_general_interval',
    WHO_VITAMIN_D_AUTHORITY,
    'Serum or plasma 25-hydroxyvitamin D across population groups.',
    [
      'WHO reports no international consensus for an optimal blood concentration and no applicable WHO guidance for a universal interval.',
      'Published status cutoffs are clinical or nutritional decision thresholds, not laboratory reference intervals.',
      'Assay standardization, age, geography, season, pregnancy, and clinical context affect interpretation.',
    ],
  ),
  tsh: unavailableReview(
    'tsh',
    'mIU/L',
    'insufficient_for_general_reference_interval',
    'no_single_defensible_general_interval',
    IFCC_TSH_AUTHORITY,
    'Adults and pregnancy-specific populations measured with harmonized TSH assays.',
    [
      'TSH results and reference intervals remain assay- and population-dependent while harmonization is implemented.',
      'Age, pregnancy trimester, iodine status, medication, and clinical context affect applicability.',
      'The legacy bundled 0.5–4.5 mIU/L value has no sufficient provenance for this governed registry.',
    ],
  ),
});

function normalizeUnit(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .replace(/[µμ]/g, 'u')
    .replace(/\s+/g, '');
}

function contextMatches(
  range: GeneralReferenceRange,
  context: GeneralReferenceRangeContext,
): boolean {
  if (normalizeUnit(range.unit) !== normalizeUnit(context.unit)) return false;

  const [minimumAge, maximumAge] = range.conditions.ageRangeYears;
  if (
    context.ageYears === undefined
    || !Number.isFinite(context.ageYears)
    || context.ageYears < minimumAge
    || context.ageYears > maximumAge
  ) {
    return false;
  }

  if (context.sex !== range.conditions.sex) return false;
  if (context.pregnancyContext !== range.conditions.pregnancyContext) {
    return false;
  }
  if (context.specimen !== range.conditions.specimen) return false;
  if (
    context.assayTraceability !== range.conditions.assayTraceability
  ) {
    return false;
  }
  if (context.populationGroup !== range.conditions.populationGroup) {
    return false;
  }
  if (
    range.conditions.fastingMoreThanHours !== undefined
    && (
      context.fastingHours === undefined
      || !Number.isFinite(context.fastingHours)
      || context.fastingHours <= range.conditions.fastingMoreThanHours
    )
  ) {
    return false;
  }

  return true;
}

function cloneAuthority(authority: ReferenceAuthority): ReferenceAuthority {
  return { ...authority };
}

function cloneRange(range: GeneralReferenceRange): GeneralReferenceRange {
  return {
    ...range,
    authority: cloneAuthority(range.authority),
    limitations: [...range.limitations],
    conditions: {
      ...range.conditions,
      ageRangeYears: [...range.conditions.ageRangeYears] as [number, number],
    },
  };
}

function cloneReview(
  review: GeneralReferenceReviewRecord,
): GeneralReferenceReviewRecord {
  return {
    ...review,
    authority: cloneAuthority(review.authority),
    limitations: [...review.limitations],
  };
}

function isBatch1BiomarkerId(
  biomarkerId: string,
): biomarkerId is GeneralReferenceRangeBatch1BiomarkerId {
  return (GENERAL_REFERENCE_RANGE_BATCH_1_BIOMARKER_IDS as readonly string[])
    .includes(biomarkerId);
}

/**
 * Returns the reviewed Batch 1 evidence decision, including explicit
 * unavailable states. This contract never exposes a decision threshold as a
 * laboratory reference interval.
 */
export function generalReferenceReviewFor(
  biomarkerId: string,
): GeneralReferenceReviewRecord | undefined {
  if (!isBatch1BiomarkerId(biomarkerId)) return undefined;
  return cloneReview(GENERAL_REFERENCE_REVIEWS[biomarkerId]);
}

/**
 * Returns a common laboratory interval only when every condition required by
 * its authoritative source is explicitly present and matches. No condition is
 * inferred from the biomarker catalogue, profile, unit, or result value.
 */
export function generalReferenceRangeFor(
  biomarkerId: string,
  context?: GeneralReferenceRangeContext,
): GeneralReferenceRange | undefined {
  if (!context || !isBatch1BiomarkerId(biomarkerId)) return undefined;
  const range = GENERAL_REFERENCE_RANGES[biomarkerId]
    .find(candidate => contextMatches(candidate, context));
  return range ? cloneRange(range) : undefined;
}

/**
 * Deterministic reference priority:
 * exact source report → reviewed context-matched general interval → no interval.
 */
export function selectBiomarkerReference(
  biomarkerId: string,
  sourceLabRange?: SourceLabRange,
  context?: GeneralReferenceRangeContext,
): SelectedBiomarkerReference | null {
  if (sourceLabRange) {
    return {
      kind: 'source_laboratory',
      range: { ...sourceLabRange },
    };
  }

  const generalRange = generalReferenceRangeFor(biomarkerId, context);
  return generalRange
    ? { kind: 'general', range: generalRange }
    : null;
}
