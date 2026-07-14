import { readFileSync } from 'node:fs';
import {
  PROVIDER_CATALOG,
  auditCoverConcept,
  buildCoverConcept,
  buildOpenAIProductionRequest,
  buildProductionCoverPreview,
  buildProviderRequestPlan,
  estimateWeeklyCost,
  type CoverConcept,
  type IssueCoverFixture,
} from '../../supabase/functions/_shared/briefCover';

const fixturePath = 'fixtures/brief/issue-1-draft.json';

function loadFixture(): IssueCoverFixture {
  return JSON.parse(readFileSync(fixturePath, 'utf8')) as IssueCoverFixture;
}

describe('Phase 3C cover concept builder', () => {
  test('builds the local Issue 1 concept without an external call', () => {
    const concept = buildCoverConcept(loadFixture());

    expect(concept.issueTitle).toBe('The Gut, the Heart, and the Aging Brain');
    expect(concept.themeConfidence).toBe('low');
    expect(concept.compositionFamily).toBe('constellation');
    expect(concept.heroObject).toBe('a closed seed pod');
    expect(concept.supportingForms).toHaveLength(4);
    expect(concept.supportingSources.map((source) => source.pmid)).toEqual([
      '42438056',
      '42443539',
      '42440326',
      '42442701',
      '42442374',
    ]);
    expect(concept.execution).toEqual({
      mode: 'concept-only',
      imageGenerated: false,
      providerInvoked: false,
      productionSupabaseCalled: false,
    });
  });

  test('carries the canonical composition, crop, and evidence restraint into the prompt', () => {
    const concept = buildCoverConcept(loadFixture());

    expect(concept.prompt).toContain('quiet hand-painted editorial world');
    expect(concept.prompt).toContain('upper 18%');
    expect(concept.prompt).toContain('central 70%');
    expect(concept.prompt).toContain('lower 12–15%');
    expect(concept.prompt).toContain('no roots, threads, pathways, bridges, network lines, or shared mechanism');
    expect(concept.prompt).toContain('No typography, lettering, labels');
    expect(concept.prompt).not.toContain('gpt-image');
    expect(concept.prompt).not.toContain('imagen-');
  });

  test('passes all deterministic concept audits', () => {
    const audit = auditCoverConcept(buildCoverConcept(loadFixture()));

    expect(audit.passed).toBe(true);
    expect(audit.failures).toEqual([]);
    expect(Object.values(audit.checks).every(Boolean)).toBe(true);
  });

  test('rejects confidence/composition inflation before a concept can be built', () => {
    const fixture = loadFixture();
    fixture.direction.compositionFamily = 'living-system';

    expect(() => buildCoverConcept(fixture)).toThrow('low confidence is incompatible with living-system');
  });

  test('detects connector language that would imply a low-confidence shared mechanism', () => {
    const concept = buildCoverConcept(loadFixture());
    const inflated: CoverConcept = {
      ...concept,
      heroDescription: 'Five objects are joined by a network of roots.',
    };

    expect(auditCoverConcept(inflated)).toMatchObject({
      passed: false,
      failures: expect.arrayContaining(['noLowConfidenceConnectors']),
    });
  });

  test('enforces the Art Bible accent range', () => {
    const fixture = loadFixture();
    fixture.direction.palette.accentPercent = 20;

    expect(() => buildCoverConcept(fixture)).toThrow('5–12%');
  });

  test('produces the complete no-generation production preview', () => {
    const preview = buildProductionCoverPreview(buildCoverConcept(loadFixture()));

    expect(preview).toMatchObject({
      readOnly: true,
      productionSupabaseCalled: false,
      providerInvoked: false,
      imageGenerated: false,
      themeConfidence: 'low',
      compositionFamily: 'constellation',
      heroObject: 'a closed seed pod',
      expectedCostUsd: 0.05,
      promptVersion: 1,
    });
    expect(preview.exactFinalPrompt).toEqual(expect.stringContaining('No typography'));
    expect(preview.exactNegativeExclusionPrompt).toEqual(expect.stringContaining('No typography'));
    expect(preview.cropPlan).toEqual({
      masterAspectRatio: '3:4',
      upperQuietPercent: 18,
      centralSafePercent: 70,
      lowerNonessentialPercent: 13,
    });
  });
});

describe('inert provider abstraction', () => {
  const concept = buildCoverConcept(loadFixture());

  test.each(Object.keys(PROVIDER_CATALOG) as Array<keyof typeof PROVIDER_CATALOG>)(
    '%s plans a request without enabling execution or including credentials',
    (provider) => {
      const plan = buildProviderRequestPlan(provider, concept.prompt);
      const serialized = JSON.stringify(plan);

      expect(plan.safety).toEqual({
        executionEnabled: false,
        networkAllowed: false,
        credentialsIncluded: false,
        imageGenerated: false,
      });
      expect(plan.requiredSecrets.length).toBeGreaterThan(0);
      expect(serialized).not.toMatch(/Bearer\s+[A-Za-z0-9._-]+/);
      expect(serialized).not.toContain('BRIEF_ADMIN_ACCESS_TOKEN');
    },
  );

  test('keeps provider-specific controls out of the canonical prompt', () => {
    const openai = buildProviderRequestPlan('openai', concept.prompt);
    const google = buildProviderRequestPlan('google', concept.prompt);
    const stability = buildProviderRequestPlan('stability', concept.prompt);

    expect(openai.request).toMatchObject({ size: '1152x1536', output_format: 'png', n: 1 });
    expect(google.request).toMatchObject({
      model: 'gemini-3.1-flash-image',
      response_format: { aspect_ratio: '3:4', image_size: '1K' },
    });
    expect(stability.request).toMatchObject({
      aspect_ratio: '4:5',
      output_format: 'png',
    });
    expect(stability.postprocess).toEqual({
      operation: 'center-crop',
      targetAspectRatio: '3:4',
      constraint: 'within-crop-safe-zone',
    });
    expect(PROVIDER_CATALOG.stability.supportsThreeByFour).toBe(false);
    expect(openai.request.prompt).toBe(concept.prompt);
  });

  test('requests exactly one production GPT Image 2 output', () => {
    expect(buildOpenAIProductionRequest(concept.prompt)).toEqual({
      model: 'gpt-image-2',
      prompt: concept.prompt,
      size: '1152x1536',
      quality: 'medium',
      output_format: 'png',
      n: 1,
    });
  });

  test('returns conservative weekly estimates for three concepts and one final', () => {
    expect(estimateWeeklyCost('openai')).toBe(0.35);
    expect(estimateWeeklyCost('google')).toBe(0.302);
    expect(estimateWeeklyCost('stability')).toBe(0.32);
    expect(() => estimateWeeklyCost('openai', -1, 1)).toThrow('non-negative integers');
  });
});

describe('production metadata migration safety', () => {
  const migrationPath = 'supabase/migrations/20260715000000_brief_cover_pipeline.sql';
  const sql = readFileSync(migrationPath, 'utf8');

  test('is in the production migration path and transactional', () => {
    expect(migrationPath.split('/')).toHaveLength(3);
    expect(sql).toMatch(/BEGIN;[\s\S]*COMMIT;\s*$/);
  });

  test('uses admin-only reads and exposes no direct client write policy', () => {
    expect(sql.match(/ENABLE ROW LEVEL SECURITY/g)).toHaveLength(2);
    expect(sql).toContain('CREATE POLICY "brief admins read cover generations"');
    expect(sql).toContain('CREATE POLICY "brief admins review private covers"');
    expect(sql).not.toMatch(/GRANT (?:INSERT|UPDATE|DELETE|ALL)[\s\S]* TO (?:anon|authenticated)/i);
  });

  test('stores provenance but no credentials, response bodies, or image bytes', () => {
    expect(sql).toContain('provider_request_id text');
    expect(sql).toContain('asset_sha256 text');
    expect(sql).not.toMatch(/^\s+(?:access_token|refresh_token|api_key|password|provider_response)\b/im);
    expect(sql).not.toMatch(/^\s+(?:image_data|image_bytes|base64)\b/im);
  });

  test('blocks publication without separate cover approval while retaining legacy nullability', () => {
    expect(sql).toContain("status = 'approved'");
    expect(sql).toContain('an explicitly approved cover is required');
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS cover_generation_id uuid');
    expect(sql).not.toMatch(/UPDATE public\.issues\s+SET cover_generation_id/s);
  });

  test('keeps generation writes service-only and approved assets immutable', () => {
    expect(sql).toContain('TO service_role;');
    expect(sql).toContain('approved cover generations are immutable');
  });
});
