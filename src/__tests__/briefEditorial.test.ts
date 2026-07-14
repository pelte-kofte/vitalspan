import {
  type EditorialCandidateSource,
  MAX_ABSTRACT_CHARACTERS,
  auditAnthropicRequestCompatibility,
  buildAnthropicEditorialRequest,
  buildEditorialSourcePacket,
  buildMinimalStructuredOutputRequest,
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
      'issueTitle', 'cover', 'briefs', 'pharmacistNote',
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
  const valid = {
    candidateId: 'one',
    headline: 'Headline',
    summary: 'Summary',
    takeaway: 'Why it matters',
    limitations: 'Limitations',
    evidenceLabel: 'Moderate',
  };

  function issue(cover = valid, briefs: typeof valid[] = []) {
    return {
      issueTitle: 'Issue title',
      cover,
      briefs,
      pharmacistNote: 'Pharmacist note',
    };
  }

  test('keeps deterministic cover and selected-id order behavior', () => {
    const second = { ...valid, candidateId: 'two', headline: 'Second' };
    expect(validateEditorial(issue(valid, [second]), ['one', 'two']).items.map((item) => item.id))
      .toEqual(['one', 'two']);
  });

  test('still rejects wrong counts, duplicate ids, and omitted fields', () => {
    expect(() => validateEditorial(issue(valid), ['one', 'two']))
      .toThrow('wrong article count');
    expect(() => validateEditorial(issue(valid, [valid]), ['one', 'two']))
      .toThrow('invalid candidate id');
    expect(() => validateEditorial(issue({ ...valid, summary: '' }), ['one']))
      .toThrow('AI omitted summary');
  });

  test('rejects an AI attempt to replace the deterministic cover', () => {
    const second = { ...valid, candidateId: 'two' };
    expect(() => validateEditorial(issue(second, [valid]), ['one', 'two']))
      .toThrow('deterministic cover');
  });
});
