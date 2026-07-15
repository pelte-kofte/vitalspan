import { readFileSync } from 'node:fs';
import {
  buildGptImage2CompiledRequest,
  compileGptImage2CoverPrompt,
  countPromptWords,
  validateCompiledCoverPrompt,
  type CompiledCoverPrompt,
  type CoverPromptCompilerInput,
} from '../../supabase/functions/_shared/briefCoverPromptCompiler';
import type { VisualDirection } from '../../supabase/functions/_shared/briefCoverDirection';

function tapestryDirection(overrides: Partial<VisualDirection> = {}): VisualDirection {
  return {
    visualMode: 'Living Tapestry',
    visualEnergy: 'balanced',
    visualWorld: 'A continuous biological field changes density across interacting regions while remaining one authored editorial world.',
    dominantRelationship: 'Promising intervention signals gain definition while decision confidence remains constrained by uneven evidence.',
    spatialBehavior: 'Layered regions overlap around an open interval, creating comparison without diagrammatic links.',
    structuralContinuity: 'Repeated rhythms and pigment migration create continuity while each evidence region retains a distinct edge grammar.',
    materialLanguage: 'Opaque gouache, translucent glaze, cold-press grain, selective dry brush, and fine scientific linework.',
    depthStrategy: 'Overlapping translucent planes, lost edges, and alternating opacity establish macro depth and close-view discovery.',
    focalPath: 'The eye follows one widening movement from a compressed signal through an unresolved central interval.',
    silhouettePlan: 'One dominant asymmetric field structure remains clear and legible at thumbnail size after fine detail disappears.',
    cropPlan: {
      masterAspectRatio: '3:4',
      upperQuietPercent: 18,
      centralSafePercent: 70,
      lowerNonessentialPercent: 13,
    },
    colorStrategy: 'A restrained mineral-biological range concentrates one controlled warm accent at the unresolved interval.',
    lightingStrategy: 'Cool morning daylight enters from the upper-left with soft chromatic shadows and selective translucent lift.',
    uncertaintyTreatment: 'The transition remains visibly incomplete, allowing evidence to strengthen without declaring a decision resolved.',
    prohibitedImplications: [
      'Do not imply one shared biological mechanism.',
      'Do not imply clinical certainty or recommendation.',
    ],
    optionalForms: [],
    ...overrides,
  };
}

function compilerInput(overrides: Partial<CoverPromptCompilerInput> = {}): CoverPromptCompilerInput {
  return {
    selectedCandidate: {
      relationship: 'Intervention promise advances faster than decision confidence.',
      editorialTension: 'Promising signals remain constrained by uneven evidence and unresolved trade-offs.',
      metaphorFamily: 'asymmetric progress',
      whyItFitsThesis: 'It preserves the thesis relationship between promising interventions and decision limits.',
      whatItMustNotImply: 'It must not imply one shared biological mechanism or clinical recommendation.',
    },
    visualDirection: tapestryDirection(),
    artBible: { version: '1.1', content: 'Canonical Living Still and Living Tapestry visual constitution.' },
    foundingCoverDna: { version: '1.0', content: 'Relationship first, macro clarity, depth, materiality, and thumbnail memory without motif copying.' },
    editorialThesis: 'Promising intervention signals repeatedly meet evidence limits that constrain confident decisions.',
    themeConfidence: 'medium',
    prohibitedImplications: [
      'The studies demonstrate one shared mechanism.',
      'The evidence supports a clinical recommendation.',
    ],
    ...overrides,
  };
}

describe('Phase 4C GPT Image 2 prompt compiler', () => {
  test('compiles a concise prompt within the 160–260 word target', () => {
    const { compiled, validation } = compileGptImage2CoverPrompt(compilerInput());

    expect(compiled.promptWordCount).toBeGreaterThanOrEqual(160);
    expect(compiled.promptWordCount).toBeLessThanOrEqual(260);
    expect(compiled.promptWordCount).toBe(countPromptWords(compiled.finalPrompt));
    expect(validation).toEqual({ passed: true, errors: [], warnings: [] });
  });

  test('places the dominant relationship before any optional form', () => {
    const input = compilerInput({
      visualDirection: tapestryDirection({
        optionalForms: [{
          form: 'translucent archway',
          relationalRole: 'holds the unresolved interval open',
          necessity: 'makes the incomplete decision spatially legible',
        }],
      }),
    });
    const { compiled } = compileGptImage2CoverPrompt(input);

    expect(compiled.finalPrompt.indexOf('Editorial relationship:'))
      .toBeLessThan(compiled.finalPrompt.indexOf('Optional forms, derived last:'));
    expect(compiled.finalPrompt.match(/archway/gi)).toHaveLength(1);
  });

  test('never adds bowl or repeated still-life object anchoring', () => {
    const { compiled } = compileGptImage2CoverPrompt(compilerInput());

    expect(compiled.finalPrompt).not.toMatch(/\b(?:bowl|vessel|stone|linen|seed|tabletop|sill)s?\b/i);
    expect(compiled.finalPrompt).not.toMatch(/hero object|supporting objects|object inventory/i);
  });

  test('preserves a Living Tapestry world and creative macro/micro range', () => {
    const { compiled } = compileGptImage2CoverPrompt(compilerInput());

    expect(compiled.finalPrompt).toContain('Living Tapestry');
    expect(compiled.finalPrompt).toMatch(/continuous visual language/i);
    expect(compiled.finalPrompt).toMatch(/macro structure/i);
    expect(compiled.finalPrompt).toMatch(/scientific texture/i);
    expect(compiled.finalPrompt).toMatch(/symbolic rather than literal biology/i);
  });

  test('supports a no-form architectural direction without inventing forms', () => {
    const input = compilerInput({
      visualDirection: tapestryDirection({
        visualMode: 'Living Still',
        visualEnergy: 'quiet',
        visualWorld: 'An open architectural volume changes opacity around one unresolved interval.',
        optionalForms: [],
      }),
    });
    const { compiled } = compileGptImage2CoverPrompt(input);

    expect(compiled.finalPrompt).toContain('open architectural volume');
    expect(compiled.finalPrompt).not.toContain('Optional forms');
  });

  test('compiles a low-confidence prompt that preserves separation and uncertainty', () => {
    const input = compilerInput({
      themeConfidence: 'low',
      selectedCandidate: {
        relationship: 'Five distinct signals remain independent within one editorial field.',
        editorialTension: 'Proximity permits comparison while scientific separation remains explicit.',
        metaphorFamily: 'independent constellation',
        whyItFitsThesis: 'It preserves distinct evidence signals without inventing biological unity.',
        whatItMustNotImply: 'It must not imply a shared biological mechanism or causal pathway.',
      },
      visualDirection: tapestryDirection({
        visualMode: 'Living Still',
        visualEnergy: 'quiet',
        visualWorld: 'Five separated material regions occupy one quiet open field without converging.',
        dominantRelationship: 'Five distinct signals remain independent while their spacing permits editorial comparison.',
        spatialBehavior: 'Each region holds negative space and never points toward another region.',
        structuralContinuity: 'Repeated scale and spacing create visual continuity while explicit separation prevents scientific connection.',
        uncertaintyTreatment: 'No shared conclusion forms; separation remains the unresolved condition.',
        prohibitedImplications: ['Do not imply a shared biological mechanism or causal pathway.'],
      }),
      prohibitedImplications: ['The five studies establish one shared biological mechanism.'],
    });
    const { compiled } = compileGptImage2CoverPrompt(input);

    expect(compiled.finalPrompt).toMatch(/separat|independent/i);
    expect(compiled.exclusionPrompt).toMatch(/shared biological mechanism/i);
  });

  test('inherits founding editorial principles without copying the founding composition', () => {
    const { compiled, validation } = compileGptImage2CoverPrompt(compilerInput());

    expect(compiled.finalPrompt).toMatch(/Nature \/ FT Weekend editorial sensibility/i);
    expect(compiled.finalPrompt).toMatch(/layered depth|macro structure|memorable thumbnail silhouette/i);
    expect(compiled.exclusionPrompt).toContain('Do not copy the founding gut–heart–brain arrangement');
    expect(validation.errors).not.toContain('founding_cover_copy');
  });

  test('builds exactly one fixed GPT Image 2 request with no retry control', () => {
    const { compiled } = compileGptImage2CoverPrompt(compilerInput());
    const request = buildGptImage2CompiledRequest(compiled);

    expect(request).toEqual({
      model: 'gpt-image-2',
      prompt: compiled.finalPrompt,
      n: 1,
      size: '1152x1536',
      quality: 'medium',
      output_format: 'png',
    });
    expect(compiled.providerParameters.externalRetry).toBe(false);
  });

  test('detects prompt length, object ordering, provider syntax, copy, crop, and typography failures', () => {
    const input = compilerInput();
    const { compiled } = compileGptImage2CoverPrompt(input);
    const invalidPrompt = [
      'A bowl bowl appears before any idea. --ar 3:4.',
      'A serpentine vertical column fills a near-black field around a warm central nexus.',
      ...Array.from({ length: 280 }, () => 'detail'),
    ].join(' ');
    const invalid: CompiledCoverPrompt = {
      ...compiled,
      finalPrompt: invalidPrompt,
      exclusionPrompt: 'Avoid decoration.',
      promptWordCount: countPromptWords(invalidPrompt),
    };
    const result = validateCompiledCoverPrompt(input, invalid);

    expect(result.errors).toEqual(expect.arrayContaining([
      'prompt_too_long',
      'repeated_object_nouns',
      'object_first_ordering',
      'accidental_still_life_default',
      'missing_dominant_relationship',
      'missing_uncertainty_or_prohibited_implications',
      'provider_syntax_leakage',
      'founding_cover_copy',
      'missing_crop_safe_guidance',
      'typography_or_logo_risk',
    ]));
  });

  test('keeps the read-only compiler command isolated from providers and persistence', () => {
    const admin = readFileSync('scripts/brief-admin.mjs', 'utf8');
    const branch = admin.slice(
      admin.indexOf("if (command === 'compile-cover-prompt')"),
      admin.indexOf("if (command === 'create-cover-direction'"),
    );

    expect(admin).toContain('compile-cover-prompt <draft-id> --candidate <candidateId> --direction-file <phase4b-result.json>');
    expect(branch).toContain("persisted: false");
    expect(branch).toContain("providerInvoked: false");
    expect(branch).not.toMatch(/\.insert\(|\.update\(|\.upsert\(|\.rpc\(|generateOpenAICover|invokeCoverPipeline/);
  });
});
