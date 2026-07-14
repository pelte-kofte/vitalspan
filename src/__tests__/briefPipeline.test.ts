import {
  type ResearchCandidate,
  classifyStudyType,
  deduplicateByIdentity,
  deriveSafetyFlags,
  rankCandidates,
  scoreEvidence,
  selectIssueCandidates,
  totalCandidateScore,
} from '../../supabase/functions/_shared/briefPipeline';

function candidate(overrides: Partial<ResearchCandidate> & Pick<ResearchCandidate, 'pmid'>): ResearchCandidate {
  return {
    pmid: overrides.pmid,
    doi: overrides.doi ?? `10.1000/${overrides.pmid}`,
    title: overrides.title ?? `Study ${overrides.pmid}`,
    abstract: overrides.abstract === undefined ? 'A complete human study abstract.' : overrides.abstract,
    publicationDate: overrides.publicationDate ?? '2026-07-10',
    publicationTypes: overrides.publicationTypes ?? [],
    studyType: overrides.studyType ?? 'randomized-controlled-trial',
    sampleSize: overrides.sampleSize ?? 500,
    topics: overrides.topics ?? ['cardiometabolic-health'],
    biomarkerTags: overrides.biomarkerTags ?? ['hba1c'],
    safetyFlags: overrides.safetyFlags ?? [],
    evidenceScore: overrides.evidenceScore ?? 88,
    relevanceScore: overrides.relevanceScore ?? 66,
    noveltyScore: overrides.noveltyScore ?? 90,
  };
}

function classify(input: {
  title: string;
  abstract?: string | null;
  publicationTypes?: string[];
  sampleSize?: number | null;
}) {
  const abstract = input.abstract === undefined ? 'Completed study results.' : input.abstract;
  const publicationTypes = input.publicationTypes ?? ['Journal Article'];
  const studyType = classifyStudyType(publicationTypes, input.title, abstract);
  const safetyFlags = deriveSafetyFlags(studyType, abstract, publicationTypes);
  return {
    studyType,
    safetyFlags,
    evidenceScore: scoreEvidence(studyType, input.sampleSize ?? null, Boolean(abstract?.trim()), safetyFlags),
  };
}

describe('Vitalspan Brief deterministic pipeline', () => {
  test('deduplicates by PMID and normalized DOI with stable first-wins behavior', () => {
    const rows = [
      { pmid: '100', doi: 'https://doi.org/10.1/ABC', marker: 'first' },
      { pmid: '100', doi: '10.1/different', marker: 'same-pmid' },
      { pmid: '101', doi: '10.1/abc', marker: 'same-doi' },
      { pmid: '102', doi: null, marker: 'unique' },
    ];

    expect(deduplicateByIdentity(rows)).toEqual([rows[0], rows[3]]);
  });

  test('ranks strong human evidence above low-quality or unsafe evidence', () => {
    const systematicReview = candidate({
      pmid: '200', studyType: 'systematic-review', evidenceScore: 94, relevanceScore: 70,
    });
    const animalStudy = candidate({
      pmid: '201', studyType: 'animal-study', evidenceScore: 10, safetyFlags: ['animal-only'], relevanceScore: 90,
    });
    const missingAbstract = candidate({
      pmid: '202', abstract: null, evidenceScore: 35, safetyFlags: ['missing-abstract'], relevanceScore: 90,
    });

    const ranked = rankCandidates([animalStudy, missingAbstract, systematicReview]);
    expect(ranked.map((item) => item.pmid)).toEqual(['200', '202', '201']);
    expect(totalCandidateScore(ranked[0])).toBeGreaterThan(totalCandidateScore(ranked[2]));
  });

  test('down-ranks a near-duplicate title when a stronger version exists', () => {
    const stronger = candidate({
      pmid: '300',
      title: 'Exercise training and cardiorespiratory fitness in healthy aging adults',
      evidenceScore: 95,
    });
    const weakerDuplicate = candidate({
      pmid: '301',
      title: 'Exercise training and cardiorespiratory fitness in healthy aging adults: a report',
      evidenceScore: 70,
    });

    const ranked = rankCandidates([weakerDuplicate, stronger]);
    expect(ranked[0].pmid).toBe('300');
    expect(ranked.find((item) => item.pmid === '301')?.noveltyScore).toBe(45);
  });

  test('selects one cover plus four briefs with topic diversity and stable ordering', () => {
    const pool = [
      candidate({ pmid: '400', topics: ['lipids-apob'], evidenceScore: 99 }),
      candidate({ pmid: '401', topics: ['lipids-apob'], evidenceScore: 98 }),
      candidate({ pmid: '402', topics: ['sleep-circadian'], evidenceScore: 90 }),
      candidate({ pmid: '403', topics: ['exercise-vo2max'], evidenceScore: 88 }),
      candidate({ pmid: '404', topics: ['nutrition'], evidenceScore: 86 }),
      candidate({ pmid: '405', topics: ['cognitive-aging'], evidenceScore: 84 }),
    ];

    const selected = selectIssueCandidates(pool, 5, ['lipids-apob']);
    expect(selected).toHaveLength(5);
    // A recently covered lead topic should not automatically win the cover,
    // even when its raw evidence score is slightly higher.
    expect(selected[0].pmid).toBe('402');
    expect(new Set(selected.slice(0, 4).map((item) => item.topics[0])).size).toBe(4);
  });

  test('never selects candidates without abstracts or retracted/editorial content', () => {
    const pool = [
      candidate({ pmid: '500', abstract: null, evidenceScore: 100 }),
      candidate({ pmid: '501', safetyFlags: ['retracted'], evidenceScore: 100 }),
      candidate({ pmid: '502', safetyFlags: ['editorial-content'], evidenceScore: 100 }),
      candidate({ pmid: '503', topics: ['sleep-circadian'] }),
      candidate({ pmid: '504', topics: ['nutrition'] }),
      candidate({ pmid: '505', topics: ['exercise-vo2max'] }),
      candidate({ pmid: '506', topics: ['cognitive-aging'] }),
    ];

    expect(selectIssueCandidates(pool, 4).map((item) => item.pmid)).toEqual(['503', '504', '505', '506']);
  });

  test('case report overrides literature review language', () => {
    expect(classify({
      title: 'Sustained metabolic control: a case report and literature review',
      publicationTypes: ['Journal Article', 'Review'],
    })).toEqual({
      studyType: 'case-report',
      safetyFlags: ['case-report'],
      evidenceScore: 14,
    });
  });

  test('review protocol overrides systematic review and meta-analysis language', () => {
    expect(classify({
      title: 'Protocol for a randomized-trial systematic review and meta-analysis',
    })).toEqual({
      studyType: 'protocol',
      safetyFlags: ['incomplete-evidence', 'protocol'],
      evidenceScore: 6,
    });
  });

  test('completed systematic reviews retain high evidence scores', () => {
    expect(classify({
      title: 'Sleep duration and healthy aging: a systematic review',
      publicationTypes: ['Journal Article', 'Systematic Review'],
    })).toEqual({
      studyType: 'systematic-review',
      safetyFlags: [],
      evidenceScore: 94,
    });
  });

  test('completed meta-analyses retain the highest evidence score', () => {
    expect(classify({
      title: 'Exercise and cardiovascular outcomes: meta-analysis of randomized trials',
      publicationTypes: ['Journal Article', 'Meta-Analysis'],
    })).toEqual({
      studyType: 'meta-analysis',
      safetyFlags: [],
      evidenceScore: 100,
    });
  });

  test('does not promote a retrospective comparative cohort when its methods use meta-analysis', () => {
    expect(classify({
      title: 'Cognitive Aging and Brain Health: A Comparison of Super Movers vs Nonsuper Movers.',
      abstract: 'This study used a retrospective study design. Hazard ratios from five datasets were pooled in a meta-analysis.',
      publicationTypes: ['Journal Article', 'Comparative Study'],
      sampleSize: 3989,
    })).toEqual({
      studyType: 'observational-study',
      safetyFlags: [],
      evidenceScore: 61,
    });
  });

  test('uses an explicit PubMed Meta-Analysis publication type as the primary high-evidence signal', () => {
    expect(classify({
      title: 'Exercise interventions and cardiometabolic outcomes',
      abstract: 'Completed results from the eligible controlled studies are reported.',
      publicationTypes: ['Journal Article', 'Meta-Analysis'],
    })).toEqual({
      studyType: 'meta-analysis',
      safetyFlags: [],
      evidenceScore: 100,
    });
  });

  test('recognizes a completed meta-analysis clearly identified in the title', () => {
    expect(classify({
      title: 'Exercise and healthy aging: a meta-analysis of randomized trials',
      publicationTypes: ['Journal Article'],
    })).toEqual({
      studyType: 'meta-analysis',
      safetyFlags: [],
      evidenceScore: 100,
    });
  });

  test('keeps a cohort design when the abstract compares findings with a prior meta-analysis', () => {
    expect(classify({
      title: 'Sleep duration and mortality in a prospective cohort',
      abstract: 'The cohort findings were compared with a prior meta-analysis.',
      publicationTypes: ['Journal Article'],
    })).toEqual({
      studyType: 'prospective-cohort',
      safetyFlags: [],
      evidenceScore: 72,
    });
  });

  test('does not treat an individual-participant-data pooled analysis as a formal meta-analysis', () => {
    expect(classify({
      title: 'Individual-participant-data pooled analysis of aging cohorts',
      abstract: 'We pooled individual records from three observational cohorts for a harmonized analysis.',
      publicationTypes: ['Journal Article', 'Observational Study'],
    })).toEqual({
      studyType: 'observational-study',
      safetyFlags: [],
      evidenceScore: 52,
    });
  });

  test('recognizes a completed systematic review from an unambiguous title', () => {
    expect(classify({
      title: 'Diet quality and healthy aging: a systematic review of prospective studies',
      publicationTypes: ['Journal Article'],
    })).toEqual({
      studyType: 'systematic-review',
      safetyFlags: [],
      evidenceScore: 94,
    });
  });

  test('keeps a systematic-review protocol below completed evidence', () => {
    expect(classify({
      title: 'Protocol for a systematic review of sleep interventions',
      abstract: 'This article describes the planned search and synthesis methods.',
      publicationTypes: ['Journal Article'],
    })).toEqual({
      studyType: 'protocol',
      safetyFlags: ['incomplete-evidence', 'protocol'],
      evidenceScore: 6,
    });
  });

  test('RCT protocol wording in metadata or abstract overrides trial language', () => {
    expect(classify({
      title: 'A randomized controlled trial of resistance training',
      abstract: 'This article presents the protocol for a clinical trial.',
      publicationTypes: ['Clinical Trial Protocol'],
    })).toEqual({
      studyType: 'protocol',
      safetyFlags: ['incomplete-evidence', 'protocol'],
      evidenceScore: 6,
    });
  });

  test('case series is kept below completed clinical evidence', () => {
    expect(classify({
      title: 'Metabolic outcomes after treatment: a case series',
      publicationTypes: ['Journal Article', 'Case Reports'],
    })).toEqual({
      studyType: 'case-series',
      safetyFlags: ['case-report'],
      evidenceScore: 18,
    });
  });

  test.each([
    ['Editorial: interpreting new longevity evidence', ['Editorial']],
    ['Commentary: limits of biological age clocks', ['Comment']],
    ['Letter to the editor: reporting standards', ['Letter']],
  ])('classifies editorial, commentary, and letter content conservatively', (title, publicationTypes) => {
    expect(classify({ title, publicationTypes })).toEqual({
      studyType: 'editorial',
      safetyFlags: ['editorial'],
      evidenceScore: 3,
    });
  });

  test('conference abstracts receive incomplete-evidence flags and a low score', () => {
    expect(classify({
      title: 'Cardiometabolic outcomes: conference abstract',
      publicationTypes: ['Conference Abstract'],
    })).toEqual({
      studyType: 'conference-abstract',
      safetyFlags: ['conference-abstract', 'incomplete-evidence'],
      evidenceScore: 5,
    });
  });

  test('missing abstracts remain down-ranked', () => {
    expect(classify({
      title: 'Completed systematic review of dietary patterns',
      abstract: null,
      publicationTypes: ['Systematic Review'],
    })).toEqual({
      studyType: 'systematic-review',
      safetyFlags: ['missing-abstract'],
      evidenceScore: 69,
    });
  });

  test.each([
    {
      title: 'Systematic analysis of aging in mice',
      publicationTypes: ['Journal Article', 'Animals'],
      expected: { studyType: 'animal-study', safetyFlags: ['animal-only'], evidenceScore: 10 },
    },
    {
      title: 'Meta-analysis methods applied in vitro to cultured cells',
      publicationTypes: ['Journal Article'],
      expected: { studyType: 'in-vitro-study', safetyFlags: ['in-vitro'], evidenceScore: 7 },
    },
  ])('keeps animal-only and in-vitro evidence below human evidence', ({ title, publicationTypes, expected }) => {
    expect(classify({ title, publicationTypes })).toEqual(expected);
  });
});
