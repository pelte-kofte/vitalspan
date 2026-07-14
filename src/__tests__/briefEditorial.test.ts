import {
  type EditorialCandidateSource,
  MAX_ABSTRACT_CHARACTERS,
  auditAnthropicRequestCompatibility,
  buildAnthropicEditorialRequest,
  buildEditorialSourcePacket,
  buildMinimalStructuredOutputRequest,
  buildSharedThemeLanguage,
  evaluateEditorialIntelligence,
  extractSafeAnthropicError,
  safeEditorialRequestMetrics,
  truncateAbstract,
  validateEditorial,
} from '../../supabase/functions/_shared/briefEditorial';
import {
  auditJsonSchema,
  buildEditorialSchema,
  buildMinimalDiagnosticSchema,
} from '../../supabase/functions/_shared/briefSchema';
import {
  type ResearchCandidate,
  buildEditorialShortlist,
} from '../../supabase/functions/_shared/briefPipeline';
import {
  FetchRequestError,
  fetchWithRetry,
} from '../../supabase/functions/_shared/fetchWithRetry';

function researchCandidate(index: number, overrides: Partial<ResearchCandidate> = {}): ResearchCandidate {
  return {
    pmid: String(10_000 + index),
    doi: `10.1000/${index}`,
    title: `Study ${index}`,
    abstract: 'A complete human study abstract with results.',
    publicationDate: '2026-07-10',
    publicationTypes: ['Journal Article'],
    studyType: 'randomized-controlled-trial',
    sampleSize: 500,
    topics: [`topic-${index}`],
    biomarkerTags: [],
    safetyFlags: [],
    evidenceScore: 100 - index,
    relevanceScore: 70,
    noveltyScore: 90,
    ...overrides,
  };
}

function editorialCandidate(index: number, abstract = 'A complete abstract.'): EditorialCandidateSource {
  const candidate = researchCandidate(index, { abstract });
  return {
    id: `00000000-0000-0000-0000-${String(index).padStart(12, '0')}`,
    pmid: candidate.pmid,
    doi: candidate.doi,
    sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${candidate.pmid}/`,
    title: candidate.title,
    abstract: candidate.abstract,
    journal: 'Test Journal',
    publicationDate: candidate.publicationDate,
    publicationTypes: candidate.publicationTypes,
    studyType: candidate.studyType,
    sampleSize: candidate.sampleSize,
    topics: candidate.topics,
    biomarkerTags: candidate.biomarkerTags,
    safetyFlags: candidate.safetyFlags,
    evidenceScore: candidate.evidenceScore,
    relevanceScore: candidate.relevanceScore,
    noveltyScore: candidate.noveltyScore,
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Brief editorial source packet', () => {
  test('caps the deterministic shortlist and excludes weak or incomplete candidates', () => {
    const strong = Array.from({ length: 18 }, (_, index) => researchCandidate(index));
    const protocol = researchCandidate(30, {
      studyType: 'protocol', safetyFlags: ['protocol', 'incomplete-evidence'], evidenceScore: 100,
    });
    const missingAbstract = researchCandidate(31, { abstract: null, evidenceScore: 100 });

    const shortlist = buildEditorialShortlist([protocol, missingAbstract, ...strong], 12);

    expect(shortlist).toHaveLength(12);
    expect(shortlist.map((candidate) => candidate.pmid)).not.toContain(protocol.pmid);
    expect(shortlist.map((candidate) => candidate.pmid)).not.toContain(missingAbstract.pmid);
  });

  test('caps the AI packet at five and excludes raw metadata and duplicate source fields', () => {
    const packets = buildEditorialSourcePacket(Array.from({ length: 7 }, (_, index) => editorialCandidate(index)));

    expect(packets).toHaveLength(5);
    for (const packet of packets) {
      expect(packet).not.toHaveProperty('raw_metadata');
      expect(packet).not.toHaveProperty('rawMetadata');
      expect(packet).not.toHaveProperty('sourceTitle');
      expect(Object.keys(packet).filter((key) => key === 'title')).toHaveLength(1);
      expect(Object.keys(packet).filter((key) => key === 'abstract')).toHaveLength(1);
    }
  });

  test('extracts only cover-inclusive language shared by at least three source packets', () => {
    const packets = buildEditorialSourcePacket([
      { ...editorialCandidate(1, 'Population risk differs by setting.'), title: 'Population risk in sleep research' },
      { ...editorialCandidate(2, 'Risk estimates vary across the population.'), title: 'Dietary response' },
      { ...editorialCandidate(3, 'This population has a distinct baseline risk.'), title: 'Exercise outcomes' },
      { ...editorialCandidate(4, 'A separate biomarker signal.'), title: 'Biomarker analysis' },
    ]);

    expect(buildSharedThemeLanguage(packets)).toEqual(expect.arrayContaining([
      { keyword: 'population', sourceCandidateIds: [packets[0].id, packets[1].id, packets[2].id] },
      { keyword: 'risk', sourceCandidateIds: [packets[0].id, packets[1].id, packets[2].id] },
    ]));
    expect(buildSharedThemeLanguage(packets).some((item) => item.keyword === 'biomarker')).toBe(false);
  });

  test('truncates abstracts deterministically while retaining key structured sections', () => {
    const abstract = [
      `OBJECTIVE: ${'Objective detail '.repeat(80)}`,
      `METHODS: ${'Randomized design detail '.repeat(80)}`,
      `RESULTS: ${'Main result detail '.repeat(80)}`,
      `LIMITATIONS: ${'Limitation detail '.repeat(80)}`,
      `CONCLUSIONS: ${'Conservative conclusion '.repeat(80)}`,
    ].join('\n\n');

    const first = truncateAbstract(abstract);
    const second = truncateAbstract(abstract);

    expect(first).toBe(second);
    expect(first?.length).toBeLessThanOrEqual(MAX_ABSTRACT_CHARACTERS);
    expect(first).toContain('OBJECTIVE:');
    expect(first).toContain('METHODS:');
    expect(first).toContain('RESULTS:');
    expect(first).toContain('LIMITATIONS:');
  });

  test('calculates safe request metrics without retaining content', () => {
    const packets = buildEditorialSourcePacket([editorialCandidate(1, 'private full abstract text')]);
    const request = buildAnthropicEditorialRequest(packets);
    const metrics = safeEditorialRequestMetrics(request, packets.length);
    const serialized = JSON.stringify(metrics);

    expect(metrics).toEqual({
      candidateCount: 1,
      payloadBytes: expect.any(Number),
      estimatedInputTokens: expect.any(Number),
    });
    expect(serialized).not.toContain('private full abstract text');
    expect(serialized).not.toContain('Study 1');
    expect(serialized).not.toContain('api');
  });

  test('keeps every output object closed and schema complexity below Anthropic limits', () => {
    const schema = buildEditorialSchema();
    const audit = auditJsonSchema(schema);

    expect(Object.keys(schema.properties as object)).toEqual([
      'editorialThesis', 'themeKeywords', 'issueTitle', 'cover', 'briefs', 'pharmacistNote',
    ]);
    const properties = schema.properties as Record<string, Record<string, unknown>>;
    const requiredArticleFields = [
      'candidateId', 'headline', 'summary', 'takeaway', 'limitations', 'evidenceLabel',
    ];
    expect(properties.cover.required).toEqual(requiredArticleFields);
    expect((properties.briefs.items as Record<string, unknown>).required).toEqual(requiredArticleFields);
    expect(audit.everyObjectClosed).toBe(true);
    expect(audit.optionalFields).toBeLessThan(24);
    expect(audit.unionTypeFields).toBeLessThan(16);
    expect(audit.arraysWithOptionalObjectFields).toBe(0);
    expect(audit.unsupportedKeywords).toEqual([]);
  });

  test('does not combine structured output with citations or assistant prefill', () => {
    const request = buildAnthropicEditorialRequest(
      buildEditorialSourcePacket([editorialCandidate(1)]),
    );

    expect(auditAnthropicRequestCompatibility(request)).toEqual({
      hasCitations: false,
      hasAssistantPrefill: false,
    });
  });

  test('encodes the Vitalspan editorial voice without changing deterministic selection', () => {
    const request = buildAnthropicEditorialRequest(
      buildEditorialSourcePacket([editorialCandidate(1), editorialCandidate(2)]),
    );

    expect(request.system).toContain('Editor-in-Chief of The Vitalspan Brief');
    expect(request.system).toContain('exactly three brief single-sentence paragraphs');
    expect(request.system).toContain('one memorable sentence');
    expect(request.system).toContain("content must be an Editor's Letter");
    expect(request.system).toContain('connect the selected studies through one coherent scientific theme');
    expect(request.system).toContain('identify one internal editorialThesis');
    expect(request.system).toContain('connect at least three selected studies');
    expect(request.system).toContain('mention no more than three studies explicitly');
    expect(request.system).toContain('no more than 170 words');
    expect(request.system).toContain('Frame the deterministic cover as the entry point');
    expect(request.system).toContain('varied first sentences');
    expect(request.system).toContain('make every sentence earn its place');
    expect(request.system).toContain('The first supplied candidate is the cover');
    expect(request.system).toContain('do not choose a different cover');
    expect(request.system).toContain('Keep association distinct from causation');
    expect(request.system).toContain('Return strict JSON only');
  });

  test('constructs the minimal diagnostic request with one closed required string', () => {
    const request = buildMinimalStructuredOutputRequest();
    const audit = auditJsonSchema(buildMinimalDiagnosticSchema());

    expect(request.output_config.format.type).toBe('json_schema');
    expect(request.messages).toEqual([{ role: 'user', content: 'Return a short greeting.' }]);
    expect(audit).toMatchObject({
      objectNodes: 1,
      everyObjectClosed: true,
      requiredFields: 1,
      optionalFields: 0,
      unionTypeFields: 0,
    });
  });

  test('extracts only allowlisted Anthropic error diagnostics and consumes the body once', async () => {
    const response = new Response(JSON.stringify({
      error: { type: 'invalid_request_error', message: 'Schema keyword is unsupported.' },
      request: {
        apiKey: 'secret-key-value',
        prompt: 'private prompt text',
        abstract: 'private abstract text',
        title: 'private candidate title',
      },
    }), {
      status: 400,
      headers: { 'request-id': 'req_safe_123' },
    });

    const safe = await extractSafeAnthropicError(response);
    const serialized = JSON.stringify(safe);

    expect(safe).toEqual({
      httpStatus: 400,
      errorType: 'invalid_request_error',
      errorMessage: 'Schema keyword is unsupported.',
      requestId: 'req_safe_123',
    });
    expect(response.bodyUsed).toBe(true);
    expect(serialized).not.toContain('secret-key-value');
    expect(serialized).not.toContain('private prompt text');
    expect(serialized).not.toContain('private abstract text');
    expect(serialized).not.toContain('private candidate title');
  });
});

describe('Brief Anthropic retry policy', () => {
  test('retries one transient failure and then succeeds', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('busy', { status: 503 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const attempts: Array<{ errorCategory: string | null }> = [];

    const response = await fetchWithRetry('https://example.test', {}, {
      attempts: 2,
      baseDelayMs: 0,
      onAttempt: (metadata) => attempts.push(metadata),
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(attempts.map((attempt) => attempt.errorCategory)).toEqual(['server_error', null]);
  });

  test('does not retry a permanent 4xx response', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('bad request', { status: 400 }));
    const attempts: Array<{ errorCategory: string | null }> = [];

    const response = await fetchWithRetry('https://example.test', {}, {
      attempts: 2,
      baseDelayMs: 0,
      onAttempt: (metadata) => attempts.push(metadata),
    });

    expect(response.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(attempts[0].errorCategory).toBe('permanent_4xx');
  });

  test('classifies an AbortController deadline as a timeout', async () => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      })) as typeof fetch);
    const attempts: Array<{ errorCategory: string | null }> = [];

    await expect(fetchWithRetry('https://example.test', {}, {
      attempts: 1,
      timeoutMs: 5,
      onAttempt: (metadata) => attempts.push(metadata),
    })).rejects.toMatchObject<Partial<FetchRequestError>>({ category: 'timeout' });

    expect(attempts).toHaveLength(1);
    expect(attempts[0].errorCategory).toBe('timeout');
  });
});

describe('Brief editorial response validation', () => {
  const sourcePackets = buildEditorialSourcePacket([
    {
      ...editorialCandidate(1, 'Population context shaped the observed response to sleep timing in older adults.'),
      id: 'one',
      title: 'Sleep timing responses across an older adult population',
    },
    {
      ...editorialCandidate(2, 'The population response to dietary counseling varied by baseline metabolic status.'),
      id: 'two',
      title: 'Baseline metabolic status and dietary response',
    },
    {
      ...editorialCandidate(3, 'Exercise outcomes differed across the study population and remained uncertain in subgroups.'),
      id: 'three',
      title: 'Exercise outcomes across population subgroups',
    },
    {
      ...editorialCandidate(4, 'An observational analysis linked social context with cognitive aging.'),
      id: 'four',
      title: 'Social context and cognitive aging',
    },
    {
      ...editorialCandidate(5, 'A biomarker signal was preliminary and clinical certainty remains limited.'),
      id: 'five',
      title: 'A preliminary biomarker signal',
    },
  ]);

  const articles = [
    {
      candidateId: 'one',
      headline: 'Sleep Timing Depends on Who Is Sleeping',
      summary: 'Population context gives this sleep question its stakes.\n\nThe reported response differed in older adults.\n\nThat variation makes the next comparison worth watching.',
      takeaway: 'Sleep timing findings may depend on the population being studied.',
      limitations: 'The supplied abstract leaves subgroup methods uncertain.',
      evidenceLabel: 'Moderate',
    },
    {
      candidateId: 'two',
      headline: 'Baseline Metabolism Changes the Dietary Picture',
      summary: 'For dietary counseling, baseline status may shape what follows.\n\nResponses varied with metabolic status.\n\nFuture trials need to test that variation directly.',
      takeaway: 'Baseline metabolic status can change how a dietary result should be read.',
      limitations: 'The supplied abstract does not establish causation.',
      evidenceLabel: 'Moderate',
    },
    {
      candidateId: 'three',
      headline: 'Exercise Results Are Not One-Size-Fits-All',
      summary: 'Exercise research often compresses a varied population into one average.\n\nThis report found different outcomes across subgroups.\n\nThe unresolved question is which differences will replicate.',
      takeaway: 'Average exercise outcomes can conceal meaningful subgroup variation.',
      limitations: 'Subgroup uncertainty remains explicit in the supplied abstract.',
      evidenceLabel: 'Preliminary',
    },
    {
      candidateId: 'four',
      headline: 'Cognitive Aging Has a Social Setting',
      summary: 'Beyond individual behavior sits a wider social context.\n\nThe observational analysis reported a link with cognitive aging.\n\nAssociation alone cannot show which factor leads.',
      takeaway: 'Social context may matter without proving a causal route to cognitive aging.',
      limitations: 'The observational design cannot establish causation.',
      evidenceLabel: 'Limited',
    },
    {
      candidateId: 'five',
      headline: 'A Biomarker Signal Awaits Clinical Certainty',
      summary: 'Promising biomarker signals can arrive before clinical certainty.\n\nThis result remained preliminary.\n\nReplication will determine whether the signal holds.',
      takeaway: 'A preliminary biomarker signal is a reason to investigate, not a clinical conclusion.',
      limitations: 'Clinical certainty remains limited.',
      evidenceLabel: 'Preliminary',
    },
  ];

  function issue(overrides: Record<string, unknown> = {}) {
    return {
      editorialThesis: 'Population context can shape how prevention findings should be interpreted, while uncertainty limits how broadly they travel.',
      themeKeywords: ['population', 'context'],
      issueTitle: 'The Finding Is Not the Whole Story',
      cover: articles[0],
      briefs: articles.slice(1),
      pharmacistNote: 'This week, the central idea is that a result never arrives without context. The selected research belongs together because each finding asks how far an average can travel across people, settings, or stages of evidence.\n\nThe useful question is not whether every signal points in one biological direction; the sources do not support that claim. It is how much uncertainty remains before a finding can be generalized—and what evidence would narrow it.',
      ...overrides,
    };
  }

  test('keeps deterministic cover and selected-id order behavior', () => {
    const validated = validateEditorial(issue(), ['one', 'two', 'three', 'four', 'five'], sourcePackets);
    expect(validated.items.map((item) => item.id)).toEqual(['one', 'two', 'three', 'four', 'five']);
    expect(validated.items[0].id).toBe('one');
  });

  test('still rejects wrong counts, duplicate ids, and omitted fields', () => {
    expect(() => validateEditorial(issue({ briefs: articles.slice(1, 4) }), ['one', 'two', 'three', 'four', 'five'], sourcePackets))
      .toThrow('wrong article count');
    expect(() => validateEditorial(issue({ briefs: [articles[0], ...articles.slice(2)] }), ['one', 'two', 'three', 'four', 'five'], sourcePackets))
      .toThrow('invalid candidate id');
    expect(() => validateEditorial(issue({ cover: { ...articles[0], summary: '' } }), ['one', 'two', 'three', 'four', 'five'], sourcePackets))
      .toThrow('AI omitted summary');
  });

  test('rejects an AI attempt to replace the deterministic cover', () => {
    expect(() => validateEditorial(issue({
      cover: articles[1],
      briefs: [articles[0], ...articles.slice(2)],
    }), ['one', 'two', 'three', 'four', 'five'], sourcePackets))
      .toThrow('deterministic cover');
  });

  test('accepts a coherent theme traceable to at least three selected studies', () => {
    const validated = validateEditorial(issue(), ['one', 'two', 'three', 'four', 'five'], sourcePackets);
    const result = evaluateEditorialIntelligence(validated, sourcePackets);

    expect(result.passed).toBe(true);
    expect(result.groundedThemeCandidateIds).toEqual(expect.arrayContaining(['one', 'two', 'three']));
    expect(result.groundedThemeCandidateIds.length).toBeGreaterThanOrEqual(3);
  });

  test('rejects a topic-list issue title', () => {
    expect(() => validateEditorial(
      issue({ issueTitle: 'Sleep, Nutrition, Exercise, and Cognitive Aging' }),
      ['one', 'two', 'three', 'four', 'five'],
      sourcePackets,
    )).toThrow('issue_title');
  });

  test('rejects a paper-by-paper Editor\'s Letter', () => {
    const recap = 'The first study covers sleep timing. The second study reviews dietary response. The third study considers exercise outcomes.\n\nAnother study follows cognitive aging, and a final study reports a biomarker signal. The question is which finding will replicate.';
    expect(() => validateEditorial(
      issue({ pharmacistNote: recap }),
      ['one', 'two', 'three', 'four', 'five'],
      sourcePackets,
    )).toThrow('editors_letter');
  });

  test('rejects repeated templated article openings', () => {
    const templated = articles.map((article) => ({
      ...article,
      summary: `A study examined its selected question.\n\n${article.summary.split(/\n\n/)[1]}\n\n${article.summary.split(/\n\n/)[2]}`,
    }));
    expect(() => validateEditorial(
      issue({ cover: templated[0], briefs: templated.slice(1) }),
      ['one', 'two', 'three', 'four', 'five'],
      sourcePackets,
    )).toThrow('varied_openings');
  });

  test('rejects an unsupported thematic linkage', () => {
    expect(() => validateEditorial(
      issue({
        editorialThesis: 'Telomere elongation through a shared mTOR pathway explains every selected result.',
        themeKeywords: ['telomere elongation', 'mTOR pathway'],
      }),
      ['one', 'two', 'three', 'four', 'five'],
      sourcePackets,
    )).toThrow('theme_grounding');
  });

  test('rejects the same takeaway repeated across articles', () => {
    const repeated = 'Population context means that uncertainty should temper every conclusion.';
    expect(() => validateEditorial(
      issue({
        cover: { ...articles[0], takeaway: repeated },
        briefs: [{ ...articles[1], takeaway: repeated }, ...articles.slice(2)],
      }),
      ['one', 'two', 'three', 'four', 'five'],
      sourcePackets,
    )).toThrow('distinct_takeaways');
  });
});
