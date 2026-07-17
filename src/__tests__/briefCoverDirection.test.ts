import { readFileSync } from 'node:fs';
import {
  VISUAL_DIRECTION_OUTPUT_SCHEMA,
  buildAnthropicVisualDirectionRequest,
  buildVisualDirectionRequest,
  generateAnthropicVisualDirection,
  generateVisualDirection,
  selectConceptFromPhase4AResult,
  validateVisualDirection,
  type VisualDirection,
  type VisualDirectionInput,
} from '../../supabase/functions/_shared/briefCoverDirection';

const preview = JSON.parse(readFileSync('fixtures/brief/issue-1-cover-preview.json', 'utf8'));
const governance = {
  artBible: { version: '2.0', content: 'Four visual families; Living Tapestry preferred when scientifically justified.' },
  foundingCoverDna: { version: '1.1', content: 'Advisory macro/micro, continuity, texture, curiosity, and silhouette benchmark.' },
};

function input(overrides: Partial<VisualDirectionInput> = {}): VisualDirectionInput {
  return {
    coverStory: preview.coverStory,
    selectedConcept: preview.concepts[0],
    ...governance,
    previousCovers: [],
    ...overrides,
  };
}

function direction(overrides: Partial<VisualDirection> = {}): VisualDirection {
  return { ...preview.direction, ...overrides };
}

describe('Phase 4B four-family visual direction engine', () => {
  test('selects a family after concept selection and validates the Issue 1 tapestry', async () => {
    const generate = jest.fn(async () => direction());
    const result = await generateVisualDirection(input(), generate);

    expect(generate).toHaveBeenCalledTimes(1);
    expect(result.direction.selectedVisualFamily).toBe('Living Tapestry');
    expect(result.validation).toEqual({ passed: true, errors: [], warnings: [] });
    expect(buildVisualDirectionRequest(input()).system).toMatch(/preference.*Living Tapestry, Landscape, Architecture, Living Still/i);
    expect(buildVisualDirectionRequest(input()).system).toMatch(/one-second test.*Never use a tree.*lungs.*sun.*primary silhouette/i);
    expect(buildVisualDirectionRequest(input()).system).toMatch(/woven systems.*biological topology.*collective emergence/i);
  });

  test('uses exactly the requested visual-direction fields', () => {
    const properties = VISUAL_DIRECTION_OUTPUT_SCHEMA.properties as Record<string, unknown>;
    expect(Object.keys(properties).sort()).toEqual([
      'colorStrategy', 'depthStrategy', 'dominantScientificRelationship', 'familyJustification', 'focalPath',
      'lightingStrategy', 'macroComposition', 'materialLanguage', 'microDetailLanguage', 'optionalForms',
      'prohibitedImplications', 'selectedVisualFamily', 'silhouettePlan', 'structuralContinuity',
      'uncertaintyTreatment', 'visualEvent', 'visualWorld',
    ]);
  });

  test('does not allow a manually supplied rejected Phase 4A concept into Phase 4B', () => {
    expect(() => buildVisualDirectionRequest(input({
      selectedConcept: {
        ...preview.concepts[0],
        editorialScores: { ...preview.concepts[0].editorialScores, narrativeClarity: 2 },
      },
    }))).toThrow(/editorial score below threshold/i);

    expect(() => buildVisualDirectionRequest(input({
      selectedConcept: {
        ...preview.concepts[0],
        visualEvent: 'The primary event resolves into a single brain-shaped object.',
      },
    }))).toThrow(/familiar primary silhouette/i);
  });

  test('requires the selected concept to support the family', () => {
    const result = validateVisualDirection(input(), direction({ selectedVisualFamily: 'Architecture' }));
    expect(result.validation.errors).toContain('family_not_supported_by_selected_concept');
  });

  test('accepts Landscape only when its environmental event maps to the finding', () => {
    const landscapeInput = input({ selectedConcept: preview.concepts[1] });
    const valid = direction({
      selectedVisualFamily: 'Landscape',
      familyJustification: 'Landscape directly maps the incomplete cognitive response to uneven recovery across a changing environment.',
      dominantScientificRelationship: preview.concepts[1].relationship,
      visualWorld: 'A highland basin responds unevenly to several seasonal flows and retains unchanged ground at its margins.',
      visualEvent: preview.concepts[1].visualEvent,
      structuralContinuity: 'Water flow and geological strata continue across the terrain while the thaw remains incomplete.',
      macroComposition: 'One memorable basin silhouette divides into changed and unchanged terrain at thumbnail scale.',
      microDetailLanguage: 'Close viewing reveals branching rivulets, fibrous ground, and cellular frost textures.',
    });
    expect(validateVisualDirection(landscapeInput, valid).validation.passed).toBe(true);

    expect(validateVisualDirection(landscapeInput, {
      ...valid,
      visualEvent: 'Unrelated clouds drift above an attractive valley without changing it.',
    }).validation.errors).toEqual(expect.arrayContaining(['visual_event_not_grounded', 'landscape_event_not_mapped_to_finding']));
  });

  test('keeps Architecture rare, structural, and scientifically named', () => {
    const architectureInput = input({ selectedConcept: preview.concepts[3] });
    const valid = direction({
      selectedVisualFamily: 'Architecture',
      familyJustification: 'Architecture is justified by the named scientific relationship of access through several permeable boundaries into one protected region.',
      dominantScientificRelationship: preview.concepts[3].relationship,
      visualWorld: 'A protected inner region is defined by several permeable boundaries, each opening with a different width.',
      visualEvent: preview.concepts[3].visualEvent,
    });
    expect(validateVisualDirection(architectureInput, valid).validation.passed).toBe(true);

    const invalid = validateVisualDirection(architectureInput, {
      ...valid,
      familyJustification: 'Architecture looks stylish and dramatic for this story.',
      dominantScientificRelationship: 'Several inputs produce a coordinated result without component attribution.',
      visualWorld: 'A fashionable abstraction of generic blocks and corridors surrounds a monumental void.',
    });
    expect(invalid.validation.errors).toEqual(expect.arrayContaining([
      'architecture_missing_named_scientific_structure',
      'generic_architectural_abstraction',
    ]));
  });

  test('allows Living Still only with a unique physical proof and no default prop recipe', () => {
    const stillInput = input({ selectedConcept: preview.concepts[5] });
    const valid = direction({
      selectedVisualFamily: 'Living Still',
      familyJustification: 'This one physical relationship is uniquely appropriate because independent tensions directly map to a package-level effect without component attribution.',
      dominantScientificRelationship: preview.concepts[5].relationship,
      visualWorld: 'One flexible woven membrane changes curvature under several independent tensions in open space.',
      visualEvent: preview.concepts[5].visualEvent,
      structuralContinuity: 'Continuous woven fibers carry each tension into the shared curvature while remaining individually visible.',
      macroComposition: 'One memorable curved membrane creates a unified asymmetric silhouette.',
      microDetailLanguage: 'Close viewing reveals distinct fibers, fine tension lines, and irregular material grain.',
    });
    expect(validateVisualDirection(stillInput, valid).validation.passed).toBe(true);

    expect(validateVisualDirection(stillInput, {
      ...valid,
      familyJustification: 'A restrained scene feels calm and suitable.',
      visualWorld: 'A tasteful still life of bowls, stones, linen, and seeds occupies a tabletop.',
    }).validation.errors).toEqual(expect.arrayContaining([
      'living_still_missing_unique_physical_proof',
      'generic_tasteful_still_life',
      'default_still_life_object_family',
    ]));
  });

  test('requires one macro silhouette and close-view scientific discovery', () => {
    const result = validateVisualDirection(input(), direction({
      macroComposition: 'Small details scatter evenly everywhere.',
      silhouettePlan: 'Fine color changes carry the composition.',
      microDetailLanguage: 'Smooth decoration fills every region.',
    }));
    expect(result.validation.errors).toEqual(expect.arrayContaining([
      'weak_macro_silhouette',
      'missing_close_view_scientific_discovery',
    ]));
  });

  test('preserves uncertainty without erasing article-specific science', () => {
    const generic = validateVisualDirection(input(), direction({
      dominantScientificRelationship: 'Uncertainty remains around a promising but limited signal.',
      visualEvent: 'An attractive shape becomes less certain at its edges.',
    }));
    expect(generic.validation.errors).toEqual(expect.arrayContaining([
      'scientific_relationship_not_grounded',
      'visual_event_not_grounded',
    ]));
    expect(direction().uncertaintyTreatment).toMatch(/no current receives visual dominance/i);
  });

  test('warns when a recent cover repeats the same world', () => {
    const current = direction();
    const result = validateVisualDirection(input({
      previousCovers: [{
        id: 'previous-1',
        selectedVisualFamily: 'Living Tapestry',
        visualWorld: current.visualWorld,
        dominantScientificRelationship: current.dominantScientificRelationship,
        silhouettePlan: current.silhouettePlan,
      }],
    }), current);
    expect(result.validation.warnings).toContain('repeated_recent_visual_world:previous-1');
  });

  test('makes one provider-neutral structured call and invokes no image provider', async () => {
    let body = '';
    const fetcher = jest.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      body = String(init?.body);
      return new Response(JSON.stringify({ content: [{ type: 'text', text: JSON.stringify(direction()) }] }), { status: 200 });
    }) as typeof fetch;
    const result = await generateAnthropicVisualDirection(input(), 'test-secret', fetcher);
    expect(JSON.parse(body)).toEqual(buildAnthropicVisualDirectionRequest(input()));
    expect(body).not.toContain('test-secret');
    expect(result.validation.passed).toBe(true);
    expect(JSON.stringify(result.direction)).not.toMatch(/gpt-image|openai|seed value/i);
  });

  test('selects a concept and its cover story from Phase 4A output', () => {
    const selected = selectConceptFromPhase4AResult('concept-2', preview);
    expect(selected.coverStory).toEqual(preview.coverStory);
    expect(selected.selectedConcept).toEqual(preview.concepts[1]);
  });

  test('admin direction preview remains read-only', () => {
    const admin = readFileSync('scripts/brief-admin.mjs', 'utf8');
    const branch = admin.slice(admin.indexOf("if (command === 'generate-cover-direction')"), admin.indexOf("if (command === 'compile-cover-prompt')"));
    expect(admin).toContain('generate-cover-direction <draft-id> --concept <conceptId>');
    expect(branch).toContain("persisted: false");
    expect(branch).toContain("imageProviderInvoked: false");
    expect(branch).toContain('.limit(8)');
    expect(branch).not.toMatch(/\.insert\(|\.update\(|\.upsert\(|\.rpc\(|invokeCoverPipeline/);
  });
});
