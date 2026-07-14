import {
  type ResearchCandidate,
  deduplicateByIdentity,
  rankCandidates,
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
});
