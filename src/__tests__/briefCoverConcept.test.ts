import { readFileSync } from 'node:fs';
import {
  COVER_METAPHOR_OUTPUT_SCHEMA,
  DEFAULT_COVER_CONCEPT_BOUNDARIES,
  buildAnthropicCoverMetaphorRequest,
  buildCoverMetaphorRequest,
  generateAnthropicCoverMetaphorCandidates,
  generateCoverMetaphorCandidates,
  selectCoverMetaphorCandidates,
  selectRandomCoverStoryForLocalTest,
  type CoverConceptInput,
  type CoverVisualConcept,
} from '../../supabase/functions/_shared/briefCoverConcept';

const fixture = JSON.parse(readFileSync('fixtures/brief/issue-1-draft.json', 'utf8'));
const preview = JSON.parse(readFileSync('fixtures/brief/issue-1-cover-preview.json', 'utf8'));
const input: CoverConceptInput = {
  articles: fixture.sources,
  deterministicCoverArticleId: fixture.sources[0].candidateId,
  claimsNotImply: [...DEFAULT_COVER_CONCEPT_BOUNDARIES],
};
const payload = () => ({ coverStory: preview.coverStory, concepts: preview.concepts });

describe('Phase 4A cover-story and concept engine', () => {
  test('requires and explicitly evaluates exactly five selected articles', () => {
    const request = buildCoverMetaphorRequest(input);

    expect(request.input.articles).toHaveLength(5);
    expect(request.input.deterministicCoverArticleId).toBe('local-pmid-42438056');
    expect(request.system).toMatch(/Evaluate all five selected articles explicitly/);
    expect(request.system).toMatch(/never select randomly/i);
    expect(() => buildCoverMetaphorRequest({ ...input, articles: input.articles.slice(0, 4) }))
      .toThrow('exactly five');
  });

  test('uses the required story extraction and article-specific concept schemas', () => {
    const properties = COVER_METAPHOR_OUTPUT_SCHEMA.properties as Record<string, any>;
    const storyProperties = properties.coverStory.properties;
    const conceptProperties = properties.concepts.items.properties;

    expect(Object.keys(storyProperties).sort()).toEqual([
      'centralFinding', 'coverStoryCandidateId', 'coverStoryReason', 'editorialQuestion',
      'principalUncertainty', 'prohibitedClaims', 'visualStorySentence', 'whyItMatters',
    ]);
    expect(Object.keys(conceptProperties).sort()).toEqual([
      'prohibitedImplications', 'relationship', 'scientificAnchor', 'suitableVisualFamilies',
      'visualEvent', 'visualStory', 'whyMemorable',
    ]);
  });

  test('confirms or overturns the deterministic cover nomination and returns the strongest two', () => {
    const result = selectCoverMetaphorCandidates(input, payload());

    expect(result.coverStory.coverStoryCandidateId).toBe('local-pmid-42442374');
    expect(result.coverStory.coverStoryReason).toMatch(/overtakes the deterministic kidney-diet nomination/i);
    expect(result.concepts).toHaveLength(6);
    expect(result.strongestTwo).toEqual(result.concepts.slice(0, 2));
    expect(result.selectedConcept).toEqual(result.concepts[0]);
    expect(result.selectedConcept.scientificAnchor).toMatch(/LatAm-FINGERS/i);
  });

  test('rejects unselected or ungrounded cover stories', () => {
    expect(() => selectCoverMetaphorCandidates(input, {
      ...payload(),
      coverStory: { ...preview.coverStory, coverStoryCandidateId: 'not-selected' },
    })).toThrow('not one of the five');

    expect(() => selectCoverMetaphorCandidates(input, {
      ...payload(),
      coverStory: {
        ...preview.coverStory,
        centralFinding: 'Unrelated atmospheric pressure changes a distant weather system.',
        whyItMatters: 'Weather forecasting becomes more colorful for unrelated observers.',
      },
    })).toThrow('not grounded');
  });

  test('filters generic evidence metaphors, object inventories, and vague abstraction', () => {
    const bad = (overrides: Partial<CoverVisualConcept>): CoverVisualConcept => ({
      ...preview.concepts[0],
      ...overrides,
    });
    const result = selectCoverMetaphorCandidates(input, {
      coverStory: preview.coverStory,
      concepts: [
        bad({ visualStory: 'Evidence approaches practice across a bridge to practice.' }),
        bad({ visualEvent: 'A bowl, stone, linen, and seed are arranged with paper.' }),
        bad({ visualStory: 'A beautiful abstraction of mysterious forms.', relationship: 'A vague abstraction remains decorative.' }),
        ...preview.concepts.slice(0, 3),
      ],
    });

    expect(result.concepts).toHaveLength(3);
    expect(JSON.stringify(result.concepts)).not.toMatch(/bridge to practice|\bbowl\b|beautiful abstraction/i);
  });

  test('makes one injected generation call and does not pass visual direction fields', async () => {
    let receivedRequest: ReturnType<typeof buildCoverMetaphorRequest> | undefined;
    const generate = jest.fn(async (request: ReturnType<typeof buildCoverMetaphorRequest>) => {
      receivedRequest = request;
      return payload();
    });
    const result = await generateCoverMetaphorCandidates(input, generate);

    expect(generate).toHaveBeenCalledTimes(1);
    expect(result.selectedConcept).toEqual(result.concepts[0]);
    expect(JSON.stringify(receivedRequest?.input)).not.toMatch(/palette|composition|lighting|visualWorld|heroObject/);
  });

  test('makes one structured provider call without leaking the key', async () => {
    let body = '';
    const fetcher = jest.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      body = String(init?.body);
      return new Response(JSON.stringify({ content: [{ type: 'text', text: JSON.stringify(payload()) }] }), { status: 200 });
    }) as typeof fetch;

    const result = await generateAnthropicCoverMetaphorCandidates(input, 'test-secret', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(JSON.parse(body)).toEqual(buildAnthropicCoverMetaphorRequest(input));
    expect(body).not.toContain('test-secret');
    expect(result.coverStory.coverStoryCandidateId).toBe('local-pmid-42442374');
  });

  test('isolates random selection behind an explicit local-test-only API', () => {
    expect(selectRandomCoverStoryForLocalTest(input.articles, { localOnly: true, random: true }, () => 0.99))
      .toEqual(input.articles[4]);
    expect(JSON.stringify(buildAnthropicCoverMetaphorRequest(input))).not.toMatch(/Math\.random|randomCover/i);
  });
});
