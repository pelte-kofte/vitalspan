import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  GENERAL_REFERENCE_RANGE_BATCH_1_BIOMARKER_IDS,
  GENERAL_REFERENCE_RANGE_REGISTRY_VERSION,
  GENERAL_REFERENCE_RANGE_REVIEW_DATE,
  generalReferenceRangeFor,
  generalReferenceReviewFor,
  selectBiomarkerReference,
  type GeneralReferenceRangeContext,
} from '../domain/biomarkers/generalReferenceRanges';
import { compatibleChartReferenceBand } from '../lib/biomarkerChartPresentation';

const ROOT = process.cwd();

const MALE_ALT_CONTEXT: GeneralReferenceRangeContext = {
  unit: 'U/L',
  ageYears: 40,
  sex: 'male',
  pregnancyContext: 'not_applicable',
  specimen: 'serum',
  assayTraceability: 'ifcc_reference_measurement_procedure_at_37_c',
  fastingHours: 10.5,
  populationGroup: 'international_multicenter_adults',
};

const FEMALE_ALT_CONTEXT: GeneralReferenceRangeContext = {
  ...MALE_ALT_CONTEXT,
  sex: 'female',
  pregnancyContext:
    'not_pregnant_breastfeeding_or_within_one_year_postpartum',
};

const FEMALE_CREATININE_CONTEXT: GeneralReferenceRangeContext = {
  unit: 'μmol/L',
  ageYears: 50,
  sex: 'female',
  pregnancyContext:
    'not_pregnant_breastfeeding_or_within_one_year_postpartum',
  specimen: 'serum',
  assayTraceability: 'idms_traceable',
  populationGroup: 'white_adults',
};

describe('governed general biomarker reference registry Batch 1', () => {
  test('contains a reviewed decision with complete authority metadata for every requested biomarker', () => {
    expect(GENERAL_REFERENCE_RANGE_BATCH_1_BIOMARKER_IDS).toHaveLength(15);

    for (const biomarkerId of GENERAL_REFERENCE_RANGE_BATCH_1_BIOMARKER_IDS) {
      const review = generalReferenceReviewFor(biomarkerId);
      expect(review).toBeDefined();
      expect(review).toMatchObject({
        biomarkerId,
        reviewedAt: GENERAL_REFERENCE_RANGE_REVIEW_DATE,
        registryVersion: GENERAL_REFERENCE_RANGE_REGISTRY_VERSION,
      });
      expect(review?.unit.trim()).not.toBe('');
      expect(review?.authority.organization.trim()).not.toBe('');
      expect(review?.authority.sourceTitle.trim()).not.toBe('');
      expect(review?.authority.citation.trim()).not.toBe('');
      expect(review?.authority.sourceVersion.trim()).not.toBe('');
      expect(review?.authority.sourceUrl).toMatch(/^https:\/\//);
      expect(review?.authority.reviewedAt).toBe(
        GENERAL_REFERENCE_RANGE_REVIEW_DATE,
      );
      expect(review?.populationContext.trim()).not.toBe('');
      expect(review?.limitations.length).toBeGreaterThan(0);
    }
  });

  test('releases only the context-matched IFCC ALT interval', () => {
    expect(generalReferenceRangeFor('alt', MALE_ALT_CONTEXT)).toMatchObject({
      biomarkerId: 'alt',
      lowerBound: 9,
      upperBound: 59,
      unit: 'U/L',
      evidenceKind: 'laboratory_reference_interval',
      reviewStatus: 'reviewed',
      approvedUse: 'general_reference_display',
      registryVersion: GENERAL_REFERENCE_RANGE_REGISTRY_VERSION,
      provenance: 'international_authoritative_source',
      conditions: {
        ageRangeYears: [18, 85],
        sex: 'male',
        pregnancyContext: 'not_applicable',
        specimen: 'serum',
        assayTraceability: 'ifcc_reference_measurement_procedure_at_37_c',
        fastingMoreThanHours: 10,
        populationGroup: 'international_multicenter_adults',
      },
    });
    expect(generalReferenceRangeFor('alt', FEMALE_ALT_CONTEXT)).toMatchObject({
      lowerBound: 8,
      upperBound: 41,
      conditions: { sex: 'female' },
    });
  });

  test('retains authority, citation, version, review date, population, unit, and limitations on every releasable range', () => {
    const contexts: ReadonlyArray<
      readonly [string, GeneralReferenceRangeContext]
    > = [
      ['alt', MALE_ALT_CONTEXT],
      ['alt', FEMALE_ALT_CONTEXT],
      ['ast', MALE_ALT_CONTEXT],
      ['ast', FEMALE_ALT_CONTEXT],
      ['creatinine', FEMALE_CREATININE_CONTEXT],
      ['creatinine', {
        ...FEMALE_CREATININE_CONTEXT,
        sex: 'male',
        pregnancyContext: 'not_applicable',
      }],
    ];
    const rangeIds = new Set<string>();

    for (const [biomarkerId, context] of contexts) {
      const range = generalReferenceRangeFor(biomarkerId, context);
      expect(range).toBeDefined();
      if (!range) continue;
      rangeIds.add(range.id);
      expect(range.unit.trim()).not.toBe('');
      expect(range.authority.organization.trim()).not.toBe('');
      expect(range.authority.citation.trim()).not.toBe('');
      expect(range.authority.sourceVersion.trim()).not.toBe('');
      expect(range.authority.sourceUrl).toMatch(/^https:\/\//);
      expect(range.authority.reviewedAt).toBe(
        GENERAL_REFERENCE_RANGE_REVIEW_DATE,
      );
      expect(range.populationContext.trim()).not.toBe('');
      expect(range.limitations.length).toBeGreaterThan(0);
    }

    expect(rangeIds.size).toBe(contexts.length);
  });

  test('models creatinine sex, population, specimen, assay, pregnancy, age, and unit conditions', () => {
    expect(
      generalReferenceRangeFor('creatinine', FEMALE_CREATININE_CONTEXT),
    ).toMatchObject({
      lowerBound: 49,
      upperBound: 90,
      unit: 'µmol/L',
      conditions: {
        ageRangeYears: [18, 74],
        sex: 'female',
        pregnancyContext:
          'not_pregnant_breastfeeding_or_within_one_year_postpartum',
        specimen: 'serum',
        assayTraceability: 'idms_traceable',
        populationGroup: 'white_adults',
      },
    });

    expect(generalReferenceRangeFor('creatinine', {
      ...FEMALE_CREATININE_CONTEXT,
      sex: 'male',
      pregnancyContext: 'not_applicable',
    })).toMatchObject({
      lowerBound: 64,
      upperBound: 104,
      conditions: { sex: 'male' },
    });
    expect(generalReferenceRangeFor('creatinine', {
      ...FEMALE_CREATININE_CONTEXT,
      populationGroup: 'international_multicenter_adults',
    })).toBeUndefined();
    expect(generalReferenceRangeFor('creatinine', {
      ...FEMALE_CREATININE_CONTEXT,
      pregnancyContext: 'not_applicable',
    })).toBeUndefined();
    expect(generalReferenceRangeFor('creatinine', {
      ...FEMALE_CREATININE_CONTEXT,
      ageYears: 75,
    })).toBeUndefined();
  });

  test('requires exact compatible units and performs no scientific conversion', () => {
    expect(generalReferenceRangeFor('alt', {
      ...MALE_ALT_CONTEXT,
      unit: 'µkat/L',
    })).toBeUndefined();
    expect(generalReferenceRangeFor('creatinine', {
      ...FEMALE_CREATININE_CONTEXT,
      unit: 'mg/dL',
    })).toBeUndefined();
    expect(generalReferenceRangeFor('creatinine', {
      ...FEMALE_CREATININE_CONTEXT,
      unit: ' µmol/L ',
    })).toBeDefined();
  });

  test('fails closed when any required condition is absent or incompatible', () => {
    expect(generalReferenceRangeFor('alt')).toBeUndefined();
    expect(generalReferenceRangeFor('alt', {
      ...MALE_ALT_CONTEXT,
      fastingHours: 10,
    })).toBeUndefined();
    expect(generalReferenceRangeFor('alt', {
      ...MALE_ALT_CONTEXT,
      assayTraceability: 'idms_traceable',
    })).toBeUndefined();
    expect(generalReferenceRangeFor('alt', {
      ...MALE_ALT_CONTEXT,
      specimen: 'plasma',
    })).toBeUndefined();
    expect(generalReferenceRangeFor('alt', {
      ...MALE_ALT_CONTEXT,
      ageYears: undefined,
    })).toBeUndefined();
  });

  test('keeps clinical decision thresholds and unsupported common intervals unavailable', () => {
    for (const biomarkerId of [
      'ldl',
      'hdl',
      'totalcholesterol',
      'triglycerides',
      'fastingglucose',
      'hba1c',
      'apob',
      'ferritin',
      'b12',
    ] as const) {
      expect(generalReferenceReviewFor(biomarkerId)).toMatchObject({
        status: 'unavailable',
        evidenceKind: 'clinical_decision_threshold',
        reason: 'clinical_decision_threshold_not_reference_interval',
      });
      expect(generalReferenceRangeFor(biomarkerId, {
        ...MALE_ALT_CONTEXT,
        unit: generalReferenceReviewFor(biomarkerId)?.unit ?? '',
      })).toBeUndefined();
    }

    for (const biomarkerId of ['hscrp', 'vitd', 'tsh'] as const) {
      expect(generalReferenceReviewFor(biomarkerId)).toMatchObject({
        status: 'unavailable',
        evidenceKind: 'insufficient_for_general_reference_interval',
        reason: 'no_single_defensible_general_interval',
      });
      expect(generalReferenceRangeFor(biomarkerId, {
        ...MALE_ALT_CONTEXT,
        unit: generalReferenceReviewFor(biomarkerId)?.unit ?? '',
      })).toBeUndefined();
    }
  });

  test('prioritizes an exact source report interval over general and unavailable records', () => {
    const sourceLabRange = {
      lowerBound: 5,
      upperBound: 40,
      unit: 'U/L',
      laboratoryName: 'Example Lab',
    };

    expect(
      selectBiomarkerReference('alt', sourceLabRange, MALE_ALT_CONTEXT),
    ).toEqual({
      kind: 'source_laboratory',
      range: sourceLabRange,
    });
    expect(selectBiomarkerReference(
      'alt',
      undefined,
      MALE_ALT_CONTEXT,
    )).toMatchObject({
      kind: 'general',
      range: { lowerBound: 9, upperBound: 59, unit: 'U/L' },
    });
    expect(selectBiomarkerReference('tsh', {
      lowerBound: 0.4,
      upperBound: 4,
      unit: 'mIU/L',
    })).toMatchObject({
      kind: 'source_laboratory',
    });
  });

  test('does not expose registry state for mutation', () => {
    const first = generalReferenceRangeFor('alt', MALE_ALT_CONTEXT);
    if (!first) throw new Error('Expected reviewed ALT interval');
    (first as { lowerBound: number }).lowerBound = 99;
    (first.conditions.ageRangeYears as unknown as number[])[0] = 99;
    (first.authority as { organization: string }).organization = 'Changed';
    (first.limitations as string[])[0] = 'Changed';

    const second = generalReferenceRangeFor('alt', MALE_ALT_CONTEXT);
    expect(second?.lowerBound).toBe(9);
    expect(second?.conditions.ageRangeYears).toEqual([18, 85]);
    expect(second?.authority.organization).toContain(
      'International Federation',
    );
    expect(second?.limitations[0]).not.toBe('Changed');

    const review = generalReferenceReviewFor('alt');
    if (!review) throw new Error('Expected reviewed ALT decision');
    (review.authority as { organization: string }).organization = 'Changed';
    expect(generalReferenceReviewFor('alt')?.authority.organization).toContain(
      'International Federation',
    );
  });

  test('contains no dependency on legacy catalogue interpretations or targets', () => {
    const model = readFileSync(
      join(ROOT, 'src/domain/biomarkers/generalReferenceRanges.ts'),
      'utf8',
    );
    expect(model).not.toMatch(/from ['"].*data\/biomarkers/);
    expect(model).not.toMatch(
      /\boptMin\b|\boptMax\b|\.target\b|\.howToImprove\b|\.insight\b/,
    );
  });
});

describe('historical chart reference band', () => {
  test('accepts only directly compatible units', () => {
    expect(compatibleChartReferenceBand({
      lowerBound: 9,
      upperBound: 59,
      unit: 'U/L',
    }, 'U/L')).toEqual({ lowerBound: 9, upperBound: 59 });

    expect(compatibleChartReferenceBand({
      lowerBound: 3.9,
      upperBound: 5.5,
      unit: 'mmol/L',
    }, 'mg/dL')).toBeNull();
  });

  test('fails closed for missing, non-finite, or reversed bounds', () => {
    expect(compatibleChartReferenceBand(undefined, 'mg/dL')).toBeNull();
    expect(compatibleChartReferenceBand({
      unit: 'mg/dL',
    }, 'mg/dL')).toBeNull();
    expect(compatibleChartReferenceBand({
      lowerBound: Number.NaN,
      upperBound: Number.POSITIVE_INFINITY,
      unit: 'mg/dL',
    }, 'mg/dL')).toBeNull();
    expect(compatibleChartReferenceBand({
      lowerBound: 10,
      upperBound: 5,
      unit: 'mg/dL',
    }, 'mg/dL')).toBeNull();
  });

  test('supports valid one-sided report intervals without inventing a bound', () => {
    expect(compatibleChartReferenceBand({
      upperBound: 5,
      unit: 'mg/dL',
    }, 'mg/dL')).toEqual({ upperBound: 5 });
  });
});
