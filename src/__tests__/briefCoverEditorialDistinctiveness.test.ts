import { readFileSync } from 'node:fs';
import {
  EDITORIAL_DISTINCTIVENESS_GATE,
  ONE_SECOND_TEST,
  EDITORIAL_SCORE_MINIMUMS,
  EditorialDistinctivenessError,
  FinalRenderEditorialError,
  assertEditorialDistinctiveness,
  reviewEditorialDistinctiveness,
} from '../../supabase/functions/_shared/briefCoverEditorialDistinctiveness';
import type { VisualDirection } from '../../supabase/functions/_shared/briefCoverDirection';

const preview = JSON.parse(readFileSync('fixtures/brief/issue-1-cover-preview.json', 'utf8'));

function direction(overrides: Partial<VisualDirection> = {}): VisualDirection {
  return { ...preview.direction, ...overrides };
}

describe('pre-render editorial distinctiveness gate', () => {
  test('applies the explicit one-second test to only the dominant macro fields', () => {
    const review = reviewEditorialDistinctiveness({ phase: '4B', direction: direction({
      macroComposition: 'One unfamiliar woven living topology stretches across the field without resolving into a named form.',
      silhouettePlan: 'An interlocked asymmetric tissue field remains legible at thumbnail size.',
      visualWorld: 'Subtle internal linework may echo a leaf, neuron, coral, and blood vessel at close range.',
      microDetailLanguage: 'Tiny roots and flower-like folds remain internal references only.',
    }) });

    expect(review).toEqual({
      gate: EDITORIAL_DISTINCTIVENESS_GATE,
      oneSecondTest: ONE_SECOND_TEST,
      passed: true,
      dominantObjectImmediatelyRecognizable: false,
      recognizedObjects: [],
      reviewedFields: ['macroComposition', 'silhouettePlan'],
      reason: 'Accept: the dominant silhouette reads as an unfamiliar living relationship before resolving into subtle biological references.',
      nextAction: 'accept_for_phase_4c',
    });
  });

  test('rejects the existing Issue 1 canopy as a familiar tree-like primary silhouette', () => {
    const review = reviewEditorialDistinctiveness({ phase: '4B', direction: direction() });

    expect(review.passed).toBe(false);
    expect(review.dominantObjectImmediatelyRecognizable).toBe(true);
    expect(review.recognizedObjects).toContain('tree-like canopy');
    expect(review.nextAction).toBe('reject_concept_and_generate_replacement');
  });

  test.each([
    ['tree', 'A single tree forms the dominant silhouette.'],
    ['flower', 'One open flower defines the cover silhouette.'],
    ['leaf', 'A single leaf-shaped mass dominates the image.'],
    ['brain', 'Two cerebral hemispheres form a recognizable brain.'],
    ['neuron icon', 'A single neuron icon fills the cover.'],
    ['DNA helix', 'A double helix creates the primary outline.'],
    ['heart', 'One heart-shaped mass is immediately visible.'],
    ['lungs', 'A pair of lungs forms the dominant silhouette.'],
    ['eye', 'A large eye-shaped opening defines the silhouette.'],
    ['hands', 'Two hands make the central outline.'],
    ['butterfly', 'A butterfly-shaped field fills the frame.'],
    ['globe', 'One globe is the primary silhouette.'],
    ['planet', 'A ringed planet controls the composition.'],
    ['mountain', 'A single mountain peak defines the thumbnail.'],
    ['river', 'A river delta forms the primary silhouette.'],
    ['sun', 'A single sunburst dominates the cover.'],
    ['coral', 'One coral-shaped structure dominates the frame.'],
    ['roots', 'A root system creates the recognizable outline.'],
    ['blood vessel', 'An arterial tree is the central silhouette.'],
    ['mushroom', 'A mushroom-shaped structure dominates the cover.'],
    ['recognizable animal', 'A whale creates the primary silhouette.'],
  ])('rejects a dominant familiar %s object', (expected, macroComposition) => {
    const review = reviewEditorialDistinctiveness({ phase: '4B', direction: direction({
      macroComposition,
      silhouettePlan: 'One clear recognizable silhouette remains visible at thumbnail size.',
    }) });

    expect(review.passed).toBe(false);
    expect(review.recognizedObjects).toContain(expected);
  });

  test('throws a bounded rejection that instructs the workflow to replace the concept', () => {
    try {
      assertEditorialDistinctiveness({ phase: '4B', direction: direction() });
      throw new Error('expected editorial rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(EditorialDistinctivenessError);
      expect(error).toMatchObject({
        code: 'familiar_dominant_silhouette',
        review: {
          passed: false,
          nextAction: 'reject_concept_and_generate_replacement',
        },
      });
    }
  });

  test('reviews Phase 4A self-scores and primary concept language before ranking', () => {
    const concept = preview.concepts[0];
    expect(reviewEditorialDistinctiveness({ phase: '4A', concept })).toMatchObject({
      gate: 'phase_4a_editorial_quality',
      passed: true,
      scoreMinimums: EDITORIAL_SCORE_MINIMUMS,
      nextAction: 'keep_in_phase_4a_ranking',
    });

    expect(reviewEditorialDistinctiveness({
      phase: '4A',
      concept: {
        ...concept,
        editorialScores: { ...concept.editorialScores, novelty: 3 },
      },
    })).toMatchObject({
      passed: false,
      failedScores: ['novelty'],
      nextAction: 'discard_and_generate_different_concept',
    });
    expect(reviewEditorialDistinctiveness({
      phase: '4A',
      concept: {
        ...concept,
        visualEvent: 'The currents resolve into a single DNA helix filling the frame.',
      },
    })).toMatchObject({ passed: false, recognizedObjects: ['DNA helix'] });
  });

  test('performs a separate Phase 4D package review without refining a rejected package', () => {
    const abstractDirection = direction({
      macroComposition: 'One unfamiliar adaptive geometry crosses the portrait field without resolving into a named form.',
      silhouettePlan: 'An asymmetric woven topology remains distinct at thumbnail scale.',
      visualWorld: 'A layered ecology of interpenetrating living fields.',
      visualEvent: 'Network tensions redistribute across one continuous biological fabric.',
      materialLanguage: 'Hand-painted mineral washes and restrained scientific linework.',
    });
    expect(reviewEditorialDistinctiveness({
      phase: '4D',
      concept: preview.concepts[0],
      direction: abstractDirection,
      compiledPrompt: 'An unfamiliar living system reveals coordinated intervention only after sustained looking. Exclusions: No medical infographic, AI concept art, wellness branding, or Tree of Life.',
    })).toMatchObject({
      gate: 'phase_4d_final_render_review',
      passed: true,
      nextAction: 'accept_for_single_render',
    });

    const rejected = reviewEditorialDistinctiveness({
      phase: '4D',
      concept: preview.concepts[0],
      direction: { ...abstractDirection, materialLanguage: 'Glossy AI concept art with a familiar Tree of Life.' },
      compiledPrompt: 'Render without labels.',
    });
    expect(rejected).toMatchObject({
      passed: false,
      familiarMetaphors: ['Tree of Life'],
      genericTreatments: ['AI concept art'],
      nextAction: 'discard_and_generate_different_concept',
    });
    expect(() => assertEditorialDistinctiveness({
      phase: '4D',
      concept: preview.concepts[0],
      direction: { ...abstractDirection, materialLanguage: 'A wellness branding treatment.' },
      compiledPrompt: 'Render without labels.',
    })).toThrow(FinalRenderEditorialError);
  });

  test('is enforced in Phase 4A, after Phase 4B, and at the Phase 4D provider boundary', () => {
    const admin = readFileSync('scripts/brief-admin.mjs', 'utf8');
    const localAdmin = readFileSync('scripts/brief-cover-admin.mjs', 'utf8');
    const concept = readFileSync('supabase/functions/_shared/briefCoverConcept.ts', 'utf8');
    const directionModule = readFileSync('supabase/functions/_shared/briefCoverDirection.ts', 'utf8');
    const compiler = readFileSync('supabase/functions/_shared/briefCoverPromptCompiler.ts', 'utf8');
    const canonicalReview = readFileSync('supabase/functions/_shared/briefCoverEditorialDistinctiveness.ts', 'utf8');
    const compileBranch = admin.slice(
      admin.indexOf("if (command === 'compile-cover-prompt')"),
      admin.indexOf("if (command === 'create-cover-direction'"),
    );

    expect(compileBranch.indexOf("assertEditorialDistinctiveness({ phase: '4B', direction: visualDirection })"))
      .toBeLessThan(compileBranch.indexOf('compileGptImage2CoverPrompt({'));
    expect(compileBranch.indexOf("assertEditorialDistinctiveness({ phase: '4A', concept: selectedConcept })"))
      .toBeLessThan(compileBranch.indexOf('compileGptImage2CoverPrompt({'));
    expect(localAdmin).toContain('phase4cBlocked: !editorialDistinctivenessReview.passed');
    expect(localAdmin).toContain("phase: '4D'");
    expect(localAdmin).toContain("command === 'render-review'");
    expect(concept).toContain('reviewEditorialDistinctiveness({ phase: "4A", concept })');
    expect(directionModule).toContain('assertEditorialDistinctiveness({ phase: "4A", concept: cleaned })');
    expect(compiler).not.toContain('briefCoverEditorialDistinctiveness');
    expect(canonicalReview.match(/const FAMILIAR_OBJECT_RULES/g)).toHaveLength(1);
    expect(canonicalReview.match(/function recognizedPrimaryObjects/g)).toHaveLength(1);
    expect(`${concept}\n${directionModule}\n${admin}\n${localAdmin}`)
      .not.toMatch(/reviewCoverConceptEditorialQuality|assertCoverConceptEditorialQuality|reviewFinalRenderEditorialQuality|assertFinalRenderEditorialQuality/);
  });
});
