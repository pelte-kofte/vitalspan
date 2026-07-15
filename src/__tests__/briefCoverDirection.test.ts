import { readFileSync } from 'node:fs';
import {
  VISUAL_DIRECTION_OUTPUT_SCHEMA,
  buildAnthropicVisualDirectionRequest,
  buildVisualDirectionRequest,
  generateAnthropicVisualDirection,
  generateVisualDirection,
  selectCandidateFromPhase4AResult,
  validateVisualDirection,
  type VisualDirection,
  type VisualDirectionInput,
} from '../../supabase/functions/_shared/briefCoverDirection';

function connectedInput(overrides: Partial<VisualDirectionInput> = {}): VisualDirectionInput {
  return {
    editorialThesis: 'Interconnected systems exchange signals while their causal relationship remains unresolved.',
    themeConfidence: 'medium',
    selectedCandidate: {
      relationship: 'Interconnected systems exchange signals without resolving which influence is causal.',
      editorialTension: 'Systemic exchange is visible while the direction and mechanism of influence remain uncertain.',
      metaphorFamily: 'systems relationship',
      whyItFitsThesis: 'It makes the thesis relationship between interconnected systems visible without resolving causation.',
      whatItMustNotImply: 'It must not imply one shared biological mechanism or causal pathway.',
    },
    artBible: {
      version: '1.1',
      content: 'Living Still and Living Tapestry are equal modes. Relationship precedes inventory. Cool morning light enters from the upper left.',
    },
    foundingCoverDna: {
      version: '1.0',
      content: 'Inherit one editorial argument, macro clarity, structural continuity, material depth, and a memorable silhouette. Do not copy anatomy, palette, or arrangement.',
    },
    previousCovers: [],
    ...overrides,
  };
}

function evidenceInput(overrides: Partial<VisualDirectionInput> = {}): VisualDirectionInput {
  return connectedInput({
    editorialThesis: 'Promising evidence approaches decision readiness while uncertainty and trade-offs remain visible.',
    selectedCandidate: {
      relationship: 'Evidence gains definition faster than decision confidence.',
      editorialTension: 'A promising result remains constrained by uncertainty and unresolved trade-offs.',
      metaphorFamily: 'asymmetric progress',
      whyItFitsThesis: 'It preserves the thesis tension between promising evidence and decision limits.',
      whatItMustNotImply: 'It must not imply certainty, causation, or a treatment recommendation.',
    },
    ...overrides,
  });
}

function tapestryDirection(overrides: Partial<VisualDirection> = {}): VisualDirection {
  return {
    visualMode: 'Living Tapestry',
    visualEnergy: 'balanced',
    visualWorld: 'A continuous biological field changes density across several interacting regions while remaining one authored world.',
    dominantRelationship: 'Interconnected systems exchange signals across an unresolved difference in influence.',
    spatialBehavior: 'Layered regions overlap around an open central interval, creating exchange without diagrammatic links.',
    structuralContinuity: 'Repeated branching rhythms and pigment migration create continuity while each system retains a distinct edge grammar.',
    materialLanguage: 'Opaque gouache, translucent glaze, cold-press grain, selective dry brush, and differentiated membrane-like surfaces.',
    depthStrategy: 'Overlapping translucent planes, lost edges, and alternating opacity establish foreground, middle field, and atmospheric recess.',
    focalPath: 'The eye follows one widening exchange from a compressed upper region through the central interval into a quieter lower field.',
    silhouettePlan: 'One dominant asymmetric field structure remains clear and legible at thumbnail size after internal detail disappears.',
    cropPlan: {
      masterAspectRatio: '3:4',
      upperQuietPercent: 18,
      centralSafePercent: 70,
      lowerNonessentialPercent: 13,
    },
    colorStrategy: 'A restrained mineral-biological range concentrates one controlled warm accent at the central exchange.',
    lightingStrategy: 'Cool morning daylight enters from the upper-left with soft chromatic shadows and selective translucent lift.',
    uncertaintyTreatment: 'The exchange remains visibly incomplete: influence passes between regions without declaring direction or resolution.',
    prohibitedImplications: [
      'Do not imply one shared biological mechanism or causal pathway.',
      'Do not imply clinical certainty or recommendation.',
    ],
    optionalForms: [],
    ...overrides,
  };
}

function stillDirection(overrides: Partial<VisualDirection> = {}): VisualDirection {
  return {
    visualMode: 'Living Still',
    visualEnergy: 'quiet',
    visualWorld: 'An open architectural volume changes material density across one suspended plane, with no required recognizable form.',
    dominantRelationship: 'Evidence gains definition across the volume while decision confidence remains spatially behind it.',
    spatialBehavior: 'One plane advances through open space but stops before the volume fully resolves.',
    structuralContinuity: 'A continuous material gradation carries the relationship from opaque evidence into an unresolved translucent interval.',
    materialLanguage: 'Cold-press grain, opaque pigment, translucent glaze, and selectively dry edges make the transition materially specific.',
    depthStrategy: 'Overlapping planes, atmospheric edge loss, and unequal opacity create a shallow foreground and a deeper unresolved chamber.',
    focalPath: 'The eye moves from the defined lower plane toward the incomplete interval and then returns through the open negative space.',
    silhouettePlan: 'One distinct asymmetric plane creates a clear, recognizable macro silhouette at thumbnail size.',
    cropPlan: {
      masterAspectRatio: '3:4',
      upperQuietPercent: 18,
      centralSafePercent: 70,
      lowerNonessentialPercent: 13,
    },
    colorStrategy: 'A restrained near-monochromatic range uses one selective muted accent only where evidence becomes most defined.',
    lightingStrategy: 'Cool morning daylight from the upper-left reveals the opacity shift through soft chromatic shadow.',
    uncertaintyTreatment: 'The transition stops before closure, preserving the unresolved trade-off between signal and decision.',
    prohibitedImplications: [
      'Do not imply certainty, causation, or a treatment recommendation.',
    ],
    optionalForms: [],
    ...overrides,
  };
}

describe('Phase 4B visual direction engine', () => {
  test('creates a Living Tapestry direction from a grounded connected-systems metaphor', async () => {
    const input = connectedInput();
    const generate = jest.fn(async () => tapestryDirection());
    const result = await generateVisualDirection(input, generate);

    expect(generate).toHaveBeenCalledTimes(1);
    expect(result.direction.visualMode).toBe('Living Tapestry');
    expect(result.validation).toEqual({ passed: true, errors: [], warnings: [] });
  });

  test('allows a non-object visual world with no optional forms', () => {
    const result = validateVisualDirection(evidenceInput(), stillDirection());

    expect(result.validation.passed).toBe(true);
    expect(result.direction.optionalForms).toEqual([]);
    expect(result.direction.visualWorld).toContain('architectural volume');
  });

  test('allows Living Still only when the selected metaphor materially justifies it', () => {
    expect(validateVisualDirection(evidenceInput(), stillDirection()).validation.passed).toBe(true);

    const unjustified = evidenceInput({
      editorialThesis: 'A coordinated adaptation changes several systems together.',
      selectedCandidate: {
        relationship: 'Adaptation changes several regions together.',
        editorialTension: 'Coordinated change remains visible across the whole.',
        metaphorFamily: 'coordinated adaptation',
        whyItFitsThesis: 'It expresses coordinated adaptation across several regions.',
        whatItMustNotImply: 'It must not imply clinical certainty or recommendation.',
      },
    });
    expect(validateVisualDirection(unjustified, stillDirection({
      dominantRelationship: 'Adaptation changes several regions together while the result remains open.',
    })).validation.errors).toContain('living_still_unjustified');
  });

  test('rejects bowl, vessel, and tabletop defaults even when placed in optional forms', () => {
    const result = validateVisualDirection(evidenceInput(), stillDirection({
      optionalForms: [{
        form: 'shallow ceramic bowl on a tabletop',
        relationalRole: 'The bowl contains the evidence transition.',
        necessity: 'The vessel makes the uncertainty tangible.',
      }],
    }));

    expect(result.validation.errors).toContain('default_still_life_object_family');
  });

  test('rejects a threshold default when the selected metaphor does not justify one', () => {
    const result = validateVisualDirection(evidenceInput(), stillDirection({
      spatialBehavior: 'The material stops at a mineral threshold before crossing into the far side.',
    }));

    expect(result.validation.errors).toContain('unjustified_threshold_default');
  });

  test('enforces constellation-safe behavior for low-confidence themes', () => {
    const input = evidenceInput({
      editorialThesis: 'Five distinct signals share a week but not a defensible biological explanation.',
      themeConfidence: 'low',
      selectedCandidate: {
        relationship: 'Five distinct signals remain independent within one editorial field.',
        editorialTension: 'Proximity creates comparison while scientific separation remains explicit.',
        metaphorFamily: 'independent constellation',
        whyItFitsThesis: 'It preserves five distinct signals without inventing biological unity.',
        whatItMustNotImply: 'It must not imply a shared biological mechanism or causal pathway.',
      },
    });
    const direction = stillDirection({
      visualWorld: 'Five separated material regions occupy one quiet open field without touching or converging.',
      dominantRelationship: 'Five distinct signals remain independent while their spacing permits editorial comparison.',
      spatialBehavior: 'Each region holds its own interval of negative space and no region points toward another.',
      structuralContinuity: 'Repeated scale and spacing provide compositional continuity while explicit separation keeps every signal unconnected.',
      focalPath: 'The eye visits five independent regions in sequence without following a connecting route.',
      silhouettePlan: 'Five distinct separated masses remain clear and legible as a quiet constellation at thumbnail size.',
      uncertaintyTreatment: 'No shared conclusion forms; separation remains the governing unresolved condition.',
      prohibitedImplications: ['Do not imply a shared biological mechanism or causal pathway.'],
    });

    expect(validateVisualDirection(input, direction).validation).toMatchObject({ passed: true, errors: [] });
    expect(validateVisualDirection(input, tapestryDirection()).validation.errors)
      .toEqual(expect.arrayContaining(['living_tapestry_unjustified', 'low_confidence_requires_quiet_living_still']));
  });

  test('returns a deterministic warning when the visual world repeats a recent cover', () => {
    const direction = stillDirection();
    const input = evidenceInput({
      previousCovers: [{
        id: 'previous-7',
        visualMode: 'Living Still',
        visualWorld: direction.visualWorld,
        dominantRelationship: 'An earlier evidence relationship.',
        silhouettePlan: 'One earlier asymmetric plane.',
      }],
    });
    const result = validateVisualDirection(input, direction);

    expect(result.validation.passed).toBe(true);
    expect(result.validation.warnings).toContain('repeated_recent_visual_world:previous-7');
  });

  test('inherits Founding Cover principles without copying its motifs', () => {
    const result = validateVisualDirection(connectedInput(), tapestryDirection());
    const serialized = JSON.stringify(result.direction);

    expect(result.validation.errors).not.toContain('founding_cover_copy');
    expect(serialized).toMatch(/continuity|macro silhouette|depth|material/i);

    const copied = tapestryDirection({
      visualWorld: 'A near-black field holds a serpentine vertical column with broad botanical counterforms.',
      focalPath: 'A warm central nexus bends through the column into a dense lower region.',
    });
    expect(validateVisualDirection(connectedInput(), copied).validation.errors).toContain('founding_cover_copy');
  });

  test('rejects object-first leakage and generic tasteful still-life direction', () => {
    const leaked = stillDirection({
      visualWorld: 'A tasteful still life uses an elegant arrangement as the centerpiece.',
      spatialBehavior: 'Supporting objects are arranged around the hero object.',
    });
    const errors = validateVisualDirection(evidenceInput(), leaked).validation.errors;

    expect(errors).toEqual(expect.arrayContaining(['object_first_leakage', 'generic_tasteful_still_life']));
  });

  test('rejects weak thumbnail silhouette, missing continuity, and over-prescriptive inventories', () => {
    const result = validateVisualDirection(evidenceInput(), stillDirection({
      structuralContinuity: 'Every area has a different unrelated treatment.',
      silhouettePlan: 'Fine details and color alone make the image interesting.',
      optionalForms: [1, 2, 3, 4].map((number) => ({
        form: `form ${number}`,
        relationalRole: 'It occupies one location in the scene.',
        necessity: 'It adds another visual reference to the scene.',
      })),
    }));

    expect(result.validation.errors).toEqual(expect.arrayContaining([
      'missing_structural_continuity',
      'weak_thumbnail_silhouette',
      'over_prescriptive_object_inventory',
    ]));
  });

  test('keeps the direction schema and validated result provider-neutral', () => {
    const request = buildVisualDirectionRequest(evidenceInput());
    const properties = VISUAL_DIRECTION_OUTPUT_SCHEMA.properties as Record<string, unknown>;
    const result = validateVisualDirection(evidenceInput(), stillDirection());

    expect(Object.keys(properties).sort()).toEqual([
      'colorStrategy', 'cropPlan', 'depthStrategy', 'dominantRelationship', 'focalPath', 'lightingStrategy',
      'materialLanguage', 'optionalForms', 'prohibitedImplications', 'silhouettePlan', 'spatialBehavior',
      'structuralContinuity', 'uncertaintyTreatment', 'visualEnergy', 'visualMode', 'visualWorld',
    ]);
    expect(JSON.stringify(request.input)).not.toMatch(/provider|model|seed|negativePrompt/);
    expect(JSON.stringify(result.direction)).not.toMatch(/gpt-image|openai|midjourney|seed value/i);
    expect(validateVisualDirection(evidenceInput(), stillDirection({
      visualWorld: 'Use GPT-Image prompt weights to render the open architectural volume.',
    })).validation.errors).toContain('provider_specific_direction');
  });

  test('accepts one identified candidate from a Phase 4A result without adding fields to it', () => {
    const candidate = evidenceInput().selectedCandidate;
    const selected = selectCandidateFromPhase4AResult('candidate-2', {
      candidates: [
        { candidateId: 'candidate-1', candidate: connectedInput().selectedCandidate },
        { candidateId: 'candidate-2', candidate },
      ],
    });

    expect(selected).toEqual(candidate);
    expect(Object.keys(selected)).toHaveLength(5);
  });

  test('makes one structured direction call and invokes no image provider', async () => {
    let requestBody = '';
    const fetcher = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestBody = String(init?.body);
      return new Response(JSON.stringify({
        content: [{ type: 'text', text: JSON.stringify(stillDirection()) }],
      }), { status: 200 });
    }) as typeof fetch;
    const result = await generateAnthropicVisualDirection(evidenceInput(), 'test-secret', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(JSON.parse(requestBody)).toEqual(buildAnthropicVisualDirectionRequest(evidenceInput()));
    expect(requestBody).not.toContain('test-secret');
    expect(result.validation.passed).toBe(true);
  });

  test('admin preview is read-only and exposes the required command', () => {
    const admin = readFileSync('scripts/brief-admin.mjs', 'utf8');
    const branch = admin.slice(
      admin.indexOf("if (command === 'generate-cover-direction')"),
      admin.indexOf("if (command === 'create-cover-direction'"),
    );

    expect(admin).toContain('generate-cover-direction <draft-id> --candidate <candidateId>');
    expect(branch).toContain("persisted: false");
    expect(branch).toContain("imageProviderInvoked: false");
    expect(branch).toContain(".limit(8)");
    expect(branch).not.toMatch(/\.insert\(|\.update\(|\.upsert\(|\.rpc\(|invokeCoverPipeline/);
  });
});
