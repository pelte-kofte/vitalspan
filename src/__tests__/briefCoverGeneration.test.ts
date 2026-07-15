import { readFileSync } from 'node:fs';
import {
  ART_BIBLE,
  ART_BIBLE_SHA256,
  COVER_PROMPT_VERSION,
  PERMANENT_EXCLUSION_BLOCK,
  PERMANENT_STYLE_BLOCK,
  buildLegacyCoverDirection,
  buildOpenAIProductionRequest,
  type IssueCoverFixture,
} from '../../supabase/functions/_shared/briefCover';
import {
  CoverProviderError,
  generateOpenAICover,
  validateOpenAICoverBytes,
  type GeneratedCoverAsset,
} from '../../supabase/functions/_shared/briefCoverProvider';
import {
  conceptFromClaim,
  executeCoverGeneration,
  type ClaimedCoverGeneration,
  type ClaimedCoverSource,
  type CoverCompletionMetadata,
  type CoverGenerationRepository,
} from '../../supabase/functions/_shared/briefCoverGeneration';

const DRAFT_ID = '11111111-1111-4111-8111-111111111111';
const GENERATION_ID = '22222222-2222-4222-8222-222222222222';

function fixtureConcept() {
  const fixture = JSON.parse(readFileSync('fixtures/brief/issue-1-draft.json', 'utf8')) as IssueCoverFixture;
  return buildLegacyCoverDirection(fixture);
}

function generationClaim(): { generation: ClaimedCoverGeneration; sources: ClaimedCoverSource[] } {
  const concept = fixtureConcept();
  return {
    generation: {
      id: GENERATION_ID,
      draft_id: DRAFT_ID,
      version: 1,
      issue_number_snapshot: concept.issueNumber,
      issue_title_snapshot: concept.issueTitle,
      editorial_thesis: concept.editorialThesis,
      theme_confidence: concept.themeConfidence,
      theme_type: concept.themeType,
      central_tension: concept.centralTension,
      cover_paper_role: concept.coverPaperRole,
      composition_family: concept.compositionFamily,
      physical_world: concept.physicalWorld,
      hero_object: concept.heroObject,
      supporting_forms: concept.supportingForms,
      dominant_objects: concept.dominantObjects,
      hero_description: concept.heroDescription,
      controlled_impossibility: concept.controlledImpossibility,
      unresolved_state: concept.unresolvedState,
      supported_interpretation: concept.supportedInterpretation,
      principal_uncertainty: concept.principalUncertainty,
      claims_not_imply: concept.claimsNotImply,
      palette: concept.palette,
      crop_plan: concept.cropPlan,
      permanent_style_block: PERMANENT_STYLE_BLOCK,
      permanent_exclusion_block: PERMANENT_EXCLUSION_BLOCK,
      art_bible_version: ART_BIBLE.version,
      art_bible_sha256: ART_BIBLE_SHA256,
      prompt_version: COVER_PROMPT_VERSION,
    },
    sources: concept.supportingSources.map((source, index) => ({
      candidate_id: source.candidateId,
      pmid: source.pmid,
      source_phrase: source.sourcePhrase,
      ordinal: index + 1,
    })),
  };
}

function png(width = 1152, height = 1536): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  bytes.set([0, 0, 0, 13], 8);
  bytes.set([73, 72, 68, 82], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width, false);
  view.setUint32(20, height, false);
  return bytes;
}

function asset(): GeneratedCoverAsset {
  const bytes = png();
  return {
    bytes,
    mimeType: 'image/png',
    width: 1152,
    height: 1536,
    byteSize: bytes.byteLength,
    providerRequestId: 'req_safe-123',
    durationMs: 1200,
    estimatedCostUsd: 0.05,
  };
}

class MemoryRepository implements CoverGenerationRepository {
  status: 'concept_ready' | 'generating' | 'ready_for_review' | 'failed' = 'concept_ready';
  uploads: Array<{ bucket: string; path: string; mimeType: string }> = [];
  completion: CoverCompletionMetadata | null = null;
  failure: { code: string; message: string } | null = null;
  history = [{ id: 'rejected-old', status: 'rejected' }];

  async claim() {
    if (this.status !== 'concept_ready') throw new Error('cover generation already active or complete');
    this.status = 'generating';
    return generationClaim();
  }

  async upload(bucket: string, path: string, _bytes: Uint8Array, mimeType: string) {
    if (this.uploads.some((upload) => upload.bucket === bucket && upload.path === path)) {
      throw new Error('asset already exists');
    }
    this.uploads.push({ bucket, path, mimeType });
  }

  async complete(_generationId: string, metadata: CoverCompletionMetadata) {
    this.status = 'ready_for_review';
    this.completion = metadata;
  }

  async fail(_generationId: string, code: string, message: string) {
    this.status = 'failed';
    this.failure = { code, message };
  }

  async remove() {}
}

describe('GPT Image 2 provider boundary', () => {
  test('sends exactly one server-side image request and stores only safe output metadata', async () => {
    const prompt = fixtureConcept().prompt;
    const image = png();
    let requestBody = '';
    let authorization = '';
    const fetcher = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestBody = String(init?.body);
      authorization = new Headers(init?.headers).get('authorization') ?? '';
      return new Response(JSON.stringify({ data: [{ b64_json: Buffer.from(image).toString('base64') }] }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'req_safe-123' },
      });
    }) as typeof fetch;

    const generated = await generateOpenAICover(prompt, 'test-secret-key', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(JSON.parse(requestBody)).toEqual(buildOpenAIProductionRequest(prompt));
    expect(JSON.parse(requestBody).n).toBe(1);
    expect(requestBody).not.toContain('test-secret-key');
    expect(authorization).toBe('Bearer test-secret-key');
    expect(generated).toMatchObject({
      mimeType: 'image/png',
      width: 1152,
      height: 1536,
      byteSize: 24,
      providerRequestId: 'req_safe-123',
      estimatedCostUsd: 0.05,
    });
  });

  test('rejects invalid MIME and dimensions before storage', () => {
    expect(() => validateOpenAICoverBytes(new Uint8Array([1, 2, 3]))).toThrow('not a PNG');
    expect(() => validateOpenAICoverBytes(png(1024, 1536))).toThrow('must be 1152x1536');
  });

  test('turns provider HTTP and response errors into bounded error types', async () => {
    const httpFailure = jest.fn(async () => new Response('sensitive upstream body', { status: 500 })) as typeof fetch;
    await expect(generateOpenAICover('prompt', 'secret', httpFailure)).rejects.toMatchObject({
      code: 'provider_http_error',
      message: 'OpenAI image request failed with HTTP 500',
    });

    const missingImage = jest.fn(async () => new Response(JSON.stringify({ data: [] }), { status: 200 })) as typeof fetch;
    await expect(generateOpenAICover('prompt', 'secret', missingImage)).rejects.toBeInstanceOf(CoverProviderError);
  });
});

describe('cover generation workflow', () => {
  test('rebuilds the prompt from unchanged canonical blocks and excludes user health data', () => {
    const claim = generationClaim();
    const concept = conceptFromClaim(claim.generation, claim.sources);

    expect(concept.prompt.startsWith(PERMANENT_STYLE_BLOCK)).toBe(true);
    expect(concept.prompt.endsWith(PERMANENT_EXCLUSION_BLOCK)).toBe(true);
    expect(concept.prompt).not.toMatch(/user_id|sleepScore|healthData|medications|biomarker_entries|HRV/);
  });

  test('transitions concept_ready → generating → ready_for_review and uploads privately', async () => {
    const repository = new MemoryRepository();
    const result = await executeCoverGeneration(DRAFT_ID, {
      repository,
      openAIApiKey: 'not-logged',
      generate: async () => asset(),
    });

    expect(result).toEqual({
      generationId: GENERATION_ID,
      status: 'ready_for_review',
      storagePath: `private/${DRAFT_ID}/${GENERATION_ID}/master.png`,
    });
    expect(repository.status).toBe('ready_for_review');
    expect(repository.uploads).toEqual([{
      bucket: 'brief-covers',
      path: `private/${DRAFT_ID}/${GENERATION_ID}/master.png`,
      mimeType: 'image/png',
    }]);
    expect(repository.completion).toMatchObject({ estimatedCostUsd: 0.05, byteSize: 24 });
    expect(repository.history).toEqual([{ id: 'rejected-old', status: 'rejected' }]);
  });

  test('rejects concurrent duplicate claims', async () => {
    const repository = new MemoryRepository();
    let release!: (value: GeneratedCoverAsset) => void;
    const pendingAsset = new Promise<GeneratedCoverAsset>((resolve) => { release = resolve; });
    const first = executeCoverGeneration(DRAFT_ID, {
      repository,
      openAIApiKey: 'secret',
      generate: async () => pendingAsset,
    });
    await Promise.resolve();

    await expect(executeCoverGeneration(DRAFT_ID, {
      repository,
      openAIApiKey: 'secret',
      generate: async () => asset(),
    })).rejects.toThrow('already active');
    release(asset());
    await first;
  });

  test('transitions to failed on a provider error without erasing history', async () => {
    const repository = new MemoryRepository();
    await expect(executeCoverGeneration(DRAFT_ID, {
      repository,
      openAIApiKey: 'secret',
      generate: async () => { throw new CoverProviderError('invalid_mime', 'Generated asset is not a PNG'); },
    })).rejects.toThrow('not a PNG');

    expect(repository.status).toBe('failed');
    expect(repository.failure).toEqual({ code: 'invalid_mime', message: 'Generated asset is not a PNG' });
    expect(repository.history).toEqual([{ id: 'rejected-old', status: 'rejected' }]);
    expect(repository.uploads).toEqual([]);
  });
});

describe('database and storage security contract', () => {
  const sql = readFileSync('supabase/migrations/20260715000000_brief_cover_pipeline.sql', 'utf8');
  const edge = readFileSync('supabase/functions/brief-cover/index.ts', 'utf8');
  const admin = readFileSync('scripts/brief-admin.mjs', 'utf8');

  test('keeps prompts and rejected art behind admin RLS', () => {
    expect(sql).toContain('REVOKE ALL ON public.editorial_cover_generations');
    expect(sql).toContain('TO authenticated\n  USING (public.is_brief_admin())');
    expect(sql).not.toMatch(/cover generations[\s\S]*TO anon/);
  });

  test('uses a private bucket, signed admin review URLs, and no overwrite', () => {
    expect(sql).toContain("VALUES ('brief-covers', 'brief-covers', false");
    expect(sql).toContain('(storage.foldername(name))[1] = \'private\'');
    expect(edge).toContain('upsert: false');
    expect(admin).toContain('createSignedUrl(newest.storage_path, 300)');
  });

  test('preserves rejected history and makes approved generations immutable', () => {
    expect(sql).toMatch(/INSERT INTO public\.editorial_cover_generations[\s\S]*FROM public\.editorial_cover_generations WHERE id = v_previous\.id/);
    expect(sql).toContain('approved cover generations are immutable');
    expect(sql).not.toMatch(/DELETE FROM public\.editorial_cover_generations/);
  });

  test('protects service state transitions and publication independently', () => {
    expect(sql).toContain("OLD.status = 'concept_ready' AND NEW.status = 'generating'");
    expect(sql).toContain("OLD.status = 'generating' AND NEW.status IN ('ready_for_review', 'failed')");
    expect(sql).toContain("OLD.status = 'ready_for_review' AND NEW.status IN ('approved', 'rejected')");
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.begin_cover_generation');
    expect(sql).toContain('TO service_role;');
    expect(sql).toContain('an explicitly approved cover is required');
    expect(edge).not.toMatch(/approve_cover|publish_editorial_draft/);
  });

  test('binds concepts to persisted editorial intelligence and selected candidate PMIDs', () => {
    expect(sql).toContain('cover concept must match the draft editorial intelligence');
    expect(sql).toContain("candidate.pmid = source->>'pmid'");
    expect(sql).toContain("(source->>'candidateId')::uuid = ANY(v_draft.candidate_ids)");
  });

  test('leaves every existing issue row untouched so the current static fallback remains valid', () => {
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS cover_generation_id uuid');
    expect(sql).not.toMatch(/UPDATE public\.issues\s+SET cover_/s);
  });
});
