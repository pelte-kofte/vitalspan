import { readFileSync } from 'node:fs';
import {
  buildGptImage2CompiledRequest,
  compileGptImage2CoverPrompt,
  countPromptWords,
  validateCompiledCoverPrompt,
  type CompiledCoverPrompt,
  type CoverPromptCompilerInput,
} from '../../supabase/functions/_shared/briefCoverPromptCompiler';
import type { VisualDirection, VisualFamily } from '../../supabase/functions/_shared/briefCoverDirection';

const preview = JSON.parse(readFileSync('fixtures/brief/issue-1-cover-preview.json', 'utf8'));
const governance = {
  artBible: { version: '2.0', content: 'Story-first four-family visual constitution.' },
  foundingCoverDna: { version: '1.1', content: 'Advisory continuity, macro/micro depth, texture, curiosity, silhouette.' },
};

function input(overrides: Partial<CoverPromptCompilerInput> = {}): CoverPromptCompilerInput {
  return {
    coverStory: preview.coverStory,
    selectedConcept: preview.concepts[0],
    visualDirection: preview.direction,
    ...governance,
    ...overrides,
  };
}

function familyInput(family: VisualFamily): CoverPromptCompilerInput {
  const conceptIndex = family === 'Landscape' ? 1 : family === 'Architecture' ? 3 : family === 'Living Still' ? 5 : 0;
  const concept = preview.concepts[conceptIndex];
  const direction: VisualDirection = {
    ...preview.direction,
    selectedVisualFamily: family,
    familyJustification: family === 'Living Still'
      ? 'This physical relationship is uniquely appropriate because independent tensions directly map to package-level evidence.'
      : preview.direction.familyJustification,
    dominantScientificRelationship: concept.relationship,
    visualEvent: concept.visualEvent,
  };
  return input({ selectedConcept: concept, visualDirection: direction });
}

describe('Phase 4C story-first prompt compiler', () => {
  test('compiles a 170–260 word prompt beginning with the scientific visual story', () => {
    const { compiled, validation } = compileGptImage2CoverPrompt(input());
    expect(compiled.finalPrompt.startsWith('Scientific visual story:')).toBe(true);
    expect(compiled.promptWordCount).toBeGreaterThanOrEqual(170);
    expect(compiled.promptWordCount).toBeLessThanOrEqual(260);
    expect(compiled.promptWordCount).toBe(countPromptWords(compiled.finalPrompt));
    expect(validation).toEqual({ passed: true, errors: [], warnings: [] });
  });

  test('preserves the Living Tapestry requirements without serializing the Art Bible', () => {
    const { compiled } = compileGptImage2CoverPrompt(input());
    expect(compiled.finalPrompt).toMatch(/one continuous visual language/i);
    expect(compiled.finalPrompt).toMatch(/integrated organic systems/i);
    expect(compiled.finalPrompt).toMatch(/macro-to-micro transitions/i);
    expect(compiled.finalPrompt).toMatch(/scientific linework embedded in material texture/i);
    expect(compiled.finalPrompt).toMatch(/Nature, Scientific American, NYT Science, and Guardian Science/i);
    expect(compiled.finalPrompt).toMatch(/Silhouette:|Close-view discovery:/);
    expect(compiled.finalPrompt).not.toContain(governance.artBible.content);
  });

  test.each([
    ['Landscape', /environmental event maps directly to the finding/i],
    ['Architecture', /named scientific structural relationship governs the space/i],
    ['Living Still', /physical relationship is uniquely appropriate/i],
  ] as const)('uses a separate concise %s branch', (family, expected) => {
    const { compiled } = compileGptImage2CoverPrompt(familyInput(family));
    expect(compiled.selectedVisualFamily).toBe(family);
    expect(compiled.finalPrompt).toMatch(expected);
    expect(compiled.promptWordCount).toBeGreaterThanOrEqual(170);
    expect(compiled.promptWordCount).toBeLessThanOrEqual(260);
  });

  test('keeps the four other articles out of the core prompt', () => {
    const { compiled } = compileGptImage2CoverPrompt(input());
    expect(compiled.finalPrompt).toMatch(/LatAm-FINGERS|multidomain|lifestyle domains/i);
    expect(compiled.finalPrompt).not.toMatch(/carvedilol|metoprolol|kidney disease|antipsychotic|young children/i);
  });

  test('preserves uncertainty without reducing the story to generic evidence language', () => {
    const { compiled } = compileGptImage2CoverPrompt(input());
    expect(compiled.finalPrompt).toContain('Evidence limitation:');
    expect(compiled.finalPrompt).toMatch(/clinical importance|durability|contribution/i);
    expect(compiled.finalPrompt).not.toMatch(/promising signals meet their limits|evidence approaches practice/i);
  });

  test('builds exactly one fixed GPT Image 2 request with no retry control', () => {
    const { compiled } = compileGptImage2CoverPrompt(input());
    expect(buildGptImage2CompiledRequest(compiled)).toEqual({
      model: 'gpt-image-2',
      prompt: compiled.finalPrompt,
      n: 1,
      size: '1152x1536',
      quality: 'medium',
      output_format: 'png',
    });
    expect(compiled.providerParameters.externalRetry).toBe(false);
  });

  test('detects length, ordering, grounding, provider syntax, copy, crop, and typography failures', () => {
    const source = input();
    const { compiled } = compileGptImage2CoverPrompt(source);
    const invalidPrompt = [
      'A bowl appears first. --ar 3:4.',
      'A serpentine vertical column fills a near-black field around a warm central nexus.',
      ...Array.from({ length: 280 }, () => 'detail'),
    ].join(' ');
    const invalid: CompiledCoverPrompt = {
      ...compiled,
      finalPrompt: invalidPrompt,
      exclusionPrompt: 'Avoid decoration.',
      promptWordCount: countPromptWords(invalidPrompt),
    };
    const result = validateCompiledCoverPrompt(source, invalid);
    expect(result.errors).toEqual(expect.arrayContaining([
      'prompt_too_long',
      'scientific_story_not_first',
      'missing_visual_story',
      'missing_article_specific_science',
      'missing_uncertainty_or_prohibited_implications',
      'provider_syntax_leakage',
      'founding_cover_copy',
      'missing_crop_safe_guidance',
      'typography_or_logo_risk',
    ]));
  });

  test('keeps the read-only compiler command isolated from providers and persistence', () => {
    const admin = readFileSync('scripts/brief-admin.mjs', 'utf8');
    const branch = admin.slice(admin.indexOf("if (command === 'compile-cover-prompt')"), admin.indexOf("if (command === 'create-cover-direction'"));
    expect(admin).toContain('compile-cover-prompt <draft-id> --concept <conceptId> --direction-file <phase4b-result.json>');
    expect(branch).toContain("persisted: false");
    expect(branch).toContain("providerInvoked: false");
    expect(branch).not.toMatch(/\.insert\(|\.update\(|\.upsert\(|\.rpc\(|generateOpenAICover|invokeCoverPipeline/);
    expect(admin).toContain('Legacy issue-thesis cover persistence is disabled');
  });
});
