import {
  COVER_METAPHOR_OUTPUT_SCHEMA,
  buildAnthropicCoverMetaphorRequest,
  buildCoverMetaphorRequest,
  generateAnthropicCoverMetaphorCandidates,
  generateCoverMetaphorCandidates,
  selectCoverMetaphorCandidates,
  type CoverConceptInput,
  type CoverMetaphorCandidate,
  type CoverMetaphorRequest,
} from '../../supabase/functions/_shared/briefCoverConcept';

const input: CoverConceptInput = {
  editorialThesis: 'Promising intervention signals meet evidence limits before they can guide confident decisions.',
  themeConfidence: 'medium',
  themeType: 'evidence-limitation',
  evidence: [
    { sourcePhrase: 'A promising signal remains limited by study design and incomplete reporting.' },
    { sourcePhrase: 'Intervention-specific findings do not establish a shared mechanism.' },
  ],
  claimsNotImply: [
    'The studies demonstrate one shared mechanism.',
    'An intervention signal is sufficient for a treatment recommendation.',
    'The findings generalize across populations.',
  ],
};

function candidate(overrides: Partial<CoverMetaphorCandidate> = {}): CoverMetaphorCandidate {
  return {
    relationship: 'Intervention promise advances faster than decision confidence.',
    editorialTension: 'A promising signal remains separated from a confident decision by unresolved evidence limits.',
    metaphorFamily: 'asymmetric progress',
    whyItFitsThesis: 'It preserves the thesis relationship between promising intervention signals and evidence limits.',
    whatItMustNotImply: 'It must not imply that the studies establish a shared mechanism.',
    ...overrides,
  };
}

function payload(candidates: unknown[] = [
  candidate(),
  candidate({
    relationship: 'Evidence constraints narrow while practical uncertainty remains open.',
    editorialTension: 'The intervention signal becomes clearer without making the resulting decision confident.',
    metaphorFamily: 'incomplete convergence',
    whyItFitsThesis: 'The thesis turns on evidence becoming promising before it becomes decision-ready.',
    whatItMustNotImply: 'It must not imply that an intervention signal supports a treatment recommendation.',
  }),
  candidate({
    relationship: 'Trade-offs accumulate around a signal that still resists a confident conclusion.',
    editorialTension: 'More intervention evidence creates interest and constraint at the same time.',
    metaphorFamily: 'counterweighted momentum',
    whyItFitsThesis: 'It expresses why promising evidence can increase attention without resolving decision limits.',
    whatItMustNotImply: 'It must not imply that the findings generalize across populations.',
  }),
  candidate({
    relationship: 'Different evidence paths approach confidence without arriving together.',
    editorialTension: 'The intervention findings appear related editorially while their uncertainties remain distinct.',
    metaphorFamily: 'parallel approach',
    whyItFitsThesis: 'It keeps the thesis focused on shared evidence limits instead of a shared biological explanation.',
    whatItMustNotImply: 'It must not imply that the studies demonstrate one shared mechanism.',
  }),
]) {
  return { candidates };
}

describe('Phase 4A metaphor-first concept engine', () => {
  test('requests four to six strongest-first candidates with only the five concept fields', () => {
    const request = buildCoverMetaphorRequest(input);
    const itemSchema = (((COVER_METAPHOR_OUTPUT_SCHEMA.properties as Record<string, unknown>).candidates as {
      items: { properties: Record<string, unknown>; additionalProperties: boolean };
    }).items);

    expect(request.input).toEqual(input);
    expect(itemSchema.additionalProperties).toBe(false);
    expect(Object.keys(itemSchema.properties).sort()).toEqual([
      'editorialTension',
      'metaphorFamily',
      'relationship',
      'whatItMustNotImply',
      'whyItFitsThesis',
    ]);
    expect(request.system).toContain('order them from strongest to weakest');
  });

  test('returns exactly the strongest two safe candidates in generator order', () => {
    const selected = selectCoverMetaphorCandidates(input, payload());

    expect(selected).toHaveLength(2);
    expect(selected[0].metaphorFamily).toBe('asymmetric progress');
    expect(selected[1].metaphorFamily).toBe('incomplete convergence');
    expect(Object.keys(selected[0]).sort()).toEqual([
      'editorialTension',
      'metaphorFamily',
      'relationship',
      'whatItMustNotImply',
      'whyItFitsThesis',
    ]);
  });

  test('filters object-first and visual-direction candidates before selecting two', () => {
    const selected = selectCoverMetaphorCandidates(input, payload([
      { ...candidate(), heroObject: 'a ceramic bowl' },
      candidate({
        relationship: 'A promising intervention signal remains less settled than the evidence around it.',
        editorialTension: 'The composition places the evidence at a dramatic threshold.',
        metaphorFamily: 'staged threshold',
      }),
      candidate({
        relationship: 'Evidence limits remain fixed while intervention promise continues to advance.',
        editorialTension: 'A clearer signal still cannot settle the decision it appears to approach.',
        metaphorFamily: 'bounded advance',
      }),
      candidate({
        relationship: 'Decision confidence trails the intervention evidence supporting it.',
        editorialTension: 'The evidence gains definition while its practical meaning stays unresolved.',
        metaphorFamily: 'lagging resolution',
      }),
    ]));

    expect(selected.map((item) => item.metaphorFamily)).toEqual(['bounded advance', 'lagging resolution']);
    expect(JSON.stringify(selected)).not.toMatch(/heroObject|composition|palette|physicalWorld|lighting/);
  });

  test('filters unsupported certainty and candidates not grounded in the thesis boundaries', () => {
    const selected = selectCoverMetaphorCandidates(input, payload([
      candidate({
        relationship: 'The intervention proves the final decision.',
        metaphorFamily: 'certainty',
      }),
      candidate({
        relationship: 'Unrelated weather patterns remain difficult to predict.',
        editorialTension: 'Seasonal pressure changes before a storm.',
        metaphorFamily: 'forecast',
        whyItFitsThesis: 'Atmospheric change makes this timely.',
      }),
      candidate({ metaphorFamily: 'asymmetric progress' }),
      candidate({
        relationship: 'Evidence limits hold decision confidence behind intervention promise.',
        editorialTension: 'The signal advances but the practical conclusion remains unresolved.',
        metaphorFamily: 'delayed consequence',
      }),
    ]));

    expect(selected.map((item) => item.metaphorFamily)).toEqual(['asymmetric progress', 'delayed consequence']);
  });

  test('requires four to six generated candidates and at least two safe survivors', () => {
    expect(() => selectCoverMetaphorCandidates(input, payload([candidate(), candidate(), candidate()])))
      .toThrow('four to six candidates');
    expect(() => selectCoverMetaphorCandidates(input, payload([
      { ...candidate(), heroObject: 'a bowl' },
      { ...candidate(), palette: 'blue' },
      { ...candidate(), lighting: 'morning' },
      { ...candidate(), composition: 'centered' },
    ]))).toThrow('Fewer than two safe');
  });

  test('rejects invalid editorial input before making a generation call', async () => {
    const generate = jest.fn(async () => payload());
    await expect(generateCoverMetaphorCandidates({
      ...input,
      themeConfidence: 'certain' as CoverConceptInput['themeConfidence'],
    }, generate)).rejects.toThrow('themeConfidence');
    expect(generate).not.toHaveBeenCalled();
  });

  test('uses one injected generation call and never passes visual direction as input', async () => {
    let receivedRequest: CoverMetaphorRequest | null = null;
    const generate = jest.fn(async (request: CoverMetaphorRequest) => {
      receivedRequest = request;
      return payload();
    });
    const selected = await generateCoverMetaphorCandidates(input, generate);
    const serializedInput = JSON.stringify((receivedRequest as CoverMetaphorRequest | null)?.input);

    expect(generate).toHaveBeenCalledTimes(1);
    expect(selected).toHaveLength(2);
    expect(serializedInput).not.toMatch(/heroObject|supportingObjects|composition|palette|physicalWorld|lighting/);
  });

  test('makes exactly one structured provider request without leaking the API key into its body', async () => {
    let requestBody = '';
    let apiKeyHeader = '';
    const fetcher = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestBody = String(init?.body);
      apiKeyHeader = new Headers(init?.headers).get('x-api-key') ?? '';
      return new Response(JSON.stringify({
        content: [{ type: 'text', text: JSON.stringify(payload()) }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    const selected = await generateAnthropicCoverMetaphorCandidates(input, 'test-secret', fetcher);
    const request = JSON.parse(requestBody);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(apiKeyHeader).toBe('test-secret');
    expect(requestBody).not.toContain('test-secret');
    expect(request).toEqual(buildAnthropicCoverMetaphorRequest(input));
    expect(request.output_config.format.type).toBe('json_schema');
    expect(selected).toHaveLength(2);
  });

  test('fails safely on provider errors and never retries inside the adapter', async () => {
    const fetcher = jest.fn(async () => new Response('sensitive upstream body', { status: 500 })) as typeof fetch;

    await expect(generateAnthropicCoverMetaphorCandidates(input, 'test-secret', fetcher))
      .rejects.toThrow('failed with HTTP 500');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
