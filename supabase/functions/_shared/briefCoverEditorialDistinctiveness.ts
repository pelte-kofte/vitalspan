import type { CoverVisualConcept } from "./briefCoverConcept.ts";
import type { VisualDirection } from "./briefCoverDirection.ts";

export const EDITORIAL_DISTINCTIVENESS_GATE = "one_second_dominant_silhouette" as const;
export const ONE_SECOND_TEST = "If a reader saw this image for one second, would they immediately identify the dominant object?" as const;
export const EDITORIAL_SCORE_MINIMUMS = {
  novelty: 4,
  originality: 4,
  scientificAmbiguity: 3,
  narrativeClarity: 4,
} as const;

type ConceptReviewInput = Pick<
  CoverVisualConcept,
  "visualStory" | "visualEvent" | "whyMemorable" | "editorialScores"
>;
type DirectionReviewInput = Pick<
  VisualDirection,
  "macroComposition" | "silhouettePlan" | "visualWorld" | "visualEvent" | "materialLanguage"
>;

export interface Phase4AEditorialDistinctivenessInput {
  phase: "4A";
  concept: ConceptReviewInput;
}

export interface Phase4BEditorialDistinctivenessInput {
  phase: "4B";
  direction: Pick<VisualDirection, "macroComposition" | "silhouettePlan">;
}

export interface Phase4DEditorialDistinctivenessInput {
  phase: "4D";
  concept: ConceptReviewInput;
  direction: DirectionReviewInput;
  compiledPrompt: string;
}

export type EditorialDistinctivenessInput =
  | Phase4AEditorialDistinctivenessInput
  | Phase4BEditorialDistinctivenessInput
  | Phase4DEditorialDistinctivenessInput;

export interface CoverConceptEditorialReview {
  gate: "phase_4a_editorial_quality";
  passed: boolean;
  scoreMinimums: typeof EDITORIAL_SCORE_MINIMUMS;
  failedScores: Array<keyof typeof EDITORIAL_SCORE_MINIMUMS>;
  dominantObjectImmediatelyRecognizable: boolean;
  recognizedObjects: string[];
  reason: string;
  nextAction: "keep_in_phase_4a_ranking" | "discard_and_generate_different_concept";
}

export interface EditorialDistinctivenessReview {
  gate: typeof EDITORIAL_DISTINCTIVENESS_GATE;
  oneSecondTest: typeof ONE_SECOND_TEST;
  passed: boolean;
  dominantObjectImmediatelyRecognizable: boolean;
  recognizedObjects: string[];
  reviewedFields: Array<"macroComposition" | "silhouettePlan">;
  reason: string;
  nextAction: "accept_for_phase_4c" | "reject_concept_and_generate_replacement";
}

export interface FinalRenderEditorialReview {
  gate: "phase_4d_final_render_review";
  passed: boolean;
  oneSecondReview: EditorialDistinctivenessReview;
  conceptReview: CoverConceptEditorialReview;
  familiarMetaphors: string[];
  genericTreatments: string[];
  reason: string;
  nextAction: "accept_for_single_render" | "discard_and_generate_different_concept";
}

export type EditorialDistinctivenessResult =
  | CoverConceptEditorialReview
  | EditorialDistinctivenessReview
  | FinalRenderEditorialReview;

export class CoverConceptEditorialError extends Error {
  readonly code = "phase_4a_editorial_rejection";
  readonly review: CoverConceptEditorialReview;

  constructor(review: CoverConceptEditorialReview) {
    super(review.reason);
    this.name = "CoverConceptEditorialError";
    this.review = review;
  }
}

export class EditorialDistinctivenessError extends Error {
  readonly code = "familiar_dominant_silhouette";
  readonly review: EditorialDistinctivenessReview;

  constructor(review: EditorialDistinctivenessReview) {
    super(`Editorial distinctiveness gate rejected familiar dominant silhouette: ${review.recognizedObjects.join(", ")}`);
    this.name = "EditorialDistinctivenessError";
    this.review = review;
  }
}

export class FinalRenderEditorialError extends Error {
  readonly code = "phase_4d_editorial_rejection";
  readonly review: FinalRenderEditorialReview;

  constructor(review: FinalRenderEditorialReview) {
    super(review.reason);
    this.name = "FinalRenderEditorialError";
    this.review = review;
  }
}

const FAMILIAR_OBJECT_RULES: Array<{ label: string; pattern: RegExp }> = [
  { label: "tree", pattern: /\b(?:tree(?: of life)?|tree-shaped|tree-like|bonsai)\b/i },
  { label: "flower", pattern: /\b(?:flower|blossom|bloom|petal(?:s|led)?)\b/i },
  { label: "leaf", pattern: /\b(?:leaf-shaped|leaf-like|single leaf|recognizable leaf|leaf silhouette|outline of (?:a )?leaf|leaves? (?:form|define|dominate))\b/i },
  { label: "brain", pattern: /\b(?:brain|brain-shaped|cerebrum|cerebral hemispheres?)\b/i },
  { label: "neuron icon", pattern: /\b(?:neuron icon|neuron-shaped|single neuron|nerve cell icon)\b/i },
  { label: "DNA helix", pattern: /\b(?:dna|double helix|genetic helix|helix-shaped)\b/i },
  { label: "heart", pattern: /\b(?:heart|heart-shaped|cardiac silhouette)\b/i },
  { label: "lungs", pattern: /\b(?:lungs?|lung-shaped|pulmonary silhouette)\b/i },
  { label: "eye", pattern: /\b(?:eye|eye-shaped|iris|pupil)\b/i },
  { label: "hands", pattern: /\b(?:hand|hands|palms?|fingers?)\b/i },
  { label: "butterfly", pattern: /\b(?:butterfly|moth|butterfly-shaped)\b/i },
  { label: "globe", pattern: /\b(?:globe|world sphere|earth-shaped)\b/i },
  { label: "planet", pattern: /\b(?:planet|planetary sphere|orbital world)\b/i },
  { label: "mountain", pattern: /\b(?:mountain|mountain-shaped|snowcapped peak|single peak)\b/i },
  { label: "river", pattern: /\b(?:river|river-shaped|river delta|watercourse)\b/i },
  { label: "sun", pattern: /\b(?:sun|sun-shaped|solar disc|sunburst)\b/i },
  { label: "coral", pattern: /\b(?:coral|coral-shaped|reef)\b/i },
  { label: "roots", pattern: /\b(?:root|roots|rooted silhouette|root system)\b/i },
  { label: "blood vessel", pattern: /\b(?:blood vessel|artery|arterial tree|vascular tree|vein-shaped)\b/i },
  { label: "mushroom", pattern: /\b(?:mushroom|fungus|toadstool|mushroom-shaped)\b/i },
  {
    label: "recognizable animal",
    pattern: /\b(?:animal|bird|eagle|dove|owl|fish|whale|octopus|horse|deer|stag|lion|tiger|wolf|fox|snake|serpent|bee|beetle|dragonfly)\b/i,
  },
];

const FAMILIAR_METAPHOR_RULES: Array<{ label: string; pattern: RegExp }> = [
  { label: "Tree of Life", pattern: /\b(?:tree of life|life tree|flourishing (?:tree|canopy))\b/i },
  { label: "bridge", pattern: /\b(?:bridge|bridging the gap)\b/i },
  { label: "balance scales", pattern: /\b(?:balance scales?|weighing scales?)\b/i },
  { label: "maze", pattern: /\b(?:maze|labyrinth)\b/i },
  { label: "puzzle", pattern: /\b(?:jigsaw|puzzle pieces?)\b/i },
  { label: "ladder", pattern: /\b(?:ladder|stairway to)\b/i },
  { label: "lightbulb", pattern: /\b(?:light ?bulb|idea bulb)\b/i },
];

const GENERIC_TREATMENT_RULES: Array<{ label: string; pattern: RegExp }> = [
  { label: "stock illustration", pattern: /\b(?:stock (?:image|illustration|visual)|generic commercial illustration|corporate hero image)\b/i },
  { label: "AI concept art", pattern: /\b(?:ai concept art|digital fantasy|surreal neon glow|glowing orb|floating glossy forms?)\b/i },
  { label: "educational textbook art", pattern: /\b(?:textbook illustration|educational diagram|anatomical cutaway|labeled diagram|medical infographic)\b/i },
  { label: "wellness branding", pattern: /\b(?:wellness branding|spa aesthetic|zen stones?|holistic glow|mindfulness branding|yoga silhouette)\b/i },
];

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function matchedLabels(text: string, rules: Array<{ label: string; pattern: RegExp }>): string[] {
  return rules.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label);
}

/** The only implementation of the familiar-primary-silhouette rules. */
function recognizedPrimaryObjects(text: string, includeSemanticProxies: boolean): string[] {
  const recognizedObjects = matchedLabels(text, FAMILIAR_OBJECT_RULES);
  if (includeSemanticProxies) {
    if (/\bcanop(?:y|ies)\b/i.test(text)
      && /\b(?:crown|trunk|tree|branch(?:es|ing)?|root(?:s|ed)?|stem)\b/i.test(text)) {
      recognizedObjects.push("tree-like canopy");
    }
    if (/\b(?:bilateral|paired|two)\b[^.]{0,80}\b(?:lobe|hemisphere)s?\b/i.test(text)
      && /\b(?:neural|folded|cortical)\b/i.test(text)) {
      recognizedObjects.push("brain-like lobes");
    }
  }
  return [...new Set(recognizedObjects)];
}

function reviewPhase4A(concept: ConceptReviewInput): CoverConceptEditorialReview {
  const primaryConceptText = normalize(`${concept.visualStory} ${concept.visualEvent} ${concept.whyMemorable}`);
  const recognizedObjects = recognizedPrimaryObjects(primaryConceptText, false);
  const failedScores = (Object.keys(EDITORIAL_SCORE_MINIMUMS) as Array<keyof typeof EDITORIAL_SCORE_MINIMUMS>)
    .filter((field) => !Number.isInteger(concept.editorialScores[field])
      || concept.editorialScores[field] < EDITORIAL_SCORE_MINIMUMS[field]
      || concept.editorialScores[field] > 5);
  const dominantObjectImmediatelyRecognizable = recognizedObjects.length > 0;
  const passed = failedScores.length === 0 && !dominantObjectImmediatelyRecognizable;
  return {
    gate: "phase_4a_editorial_quality",
    passed,
    scoreMinimums: EDITORIAL_SCORE_MINIMUMS,
    failedScores,
    dominantObjectImmediatelyRecognizable,
    recognizedObjects,
    reason: passed
      ? "Accept: the concept clears the editorial score floor and delays object recognition until after the scientific relationship."
      : `Reject: ${[
        recognizedObjects.length ? `familiar primary silhouette (${recognizedObjects.join(", ")})` : "",
        failedScores.length ? `editorial score below threshold (${failedScores.join(", ")})` : "",
      ].filter(Boolean).join("; ")}.`,
    nextAction: passed ? "keep_in_phase_4a_ranking" : "discard_and_generate_different_concept",
  };
}

function reviewPhase4B(
  direction: Phase4BEditorialDistinctivenessInput["direction"],
): EditorialDistinctivenessReview {
  const macroComposition = normalize(direction.macroComposition);
  const silhouettePlan = normalize(direction.silhouettePlan);
  if (!macroComposition || !silhouettePlan) {
    throw new Error("Editorial distinctiveness review requires macroComposition and silhouettePlan");
  }
  const recognizedObjects = recognizedPrimaryObjects(`${macroComposition} ${silhouettePlan}`, true);
  const dominantObjectImmediatelyRecognizable = recognizedObjects.length > 0;
  return {
    gate: EDITORIAL_DISTINCTIVENESS_GATE,
    oneSecondTest: ONE_SECOND_TEST,
    passed: !dominantObjectImmediatelyRecognizable,
    dominantObjectImmediatelyRecognizable,
    recognizedObjects,
    reviewedFields: ["macroComposition", "silhouettePlan"],
    reason: dominantObjectImmediatelyRecognizable
      ? `Reject: the one-second read is a familiar ${recognizedObjects.join(" / ")} silhouette rather than an unfamiliar scientific relationship.`
      : "Accept: the dominant silhouette reads as an unfamiliar living relationship before resolving into subtle biological references.",
    nextAction: dominantObjectImmediatelyRecognizable
      ? "reject_concept_and_generate_replacement"
      : "accept_for_phase_4c",
  };
}

function reviewPhase4D(input: Phase4DEditorialDistinctivenessInput): FinalRenderEditorialReview {
  const oneSecondReview = reviewPhase4B(input.direction);
  const conceptReview = reviewPhase4A(input.concept);
  // The compiler's exclusion section names forbidden treatments by design; it
  // is not evidence that the positive render direction requests them.
  const positivePrompt = input.compiledPrompt.split(/\bExclusions:/i)[0];
  const packageText = normalize([
    input.concept.visualStory,
    input.concept.visualEvent,
    input.concept.whyMemorable,
    input.direction.macroComposition,
    input.direction.silhouettePlan,
    input.direction.visualWorld,
    input.direction.visualEvent,
    input.direction.materialLanguage,
    positivePrompt,
  ].join(" "));
  const familiarMetaphors = [...new Set(matchedLabels(packageText, FAMILIAR_METAPHOR_RULES))];
  const genericTreatments = [...new Set(matchedLabels(packageText, GENERIC_TREATMENT_RULES))];
  const passed = oneSecondReview.passed && conceptReview.passed
    && familiarMetaphors.length === 0 && genericTreatments.length === 0;
  return {
    gate: "phase_4d_final_render_review",
    passed,
    oneSecondReview,
    conceptReview,
    familiarMetaphors,
    genericTreatments,
    reason: passed
      ? "Accept: the immutable render package is scientifically legible, unfamiliar at first glance, and free of generic editorial treatments."
      : `Reject without prompt refinement: ${[
        !oneSecondReview.passed ? "recognizable primary silhouette" : "",
        !conceptReview.passed ? "concept below Phase 4A editorial quality" : "",
        familiarMetaphors.length ? `familiar metaphor (${familiarMetaphors.join(", ")})` : "",
        genericTreatments.length ? `generic treatment (${genericTreatments.join(", ")})` : "",
      ].filter(Boolean).join("; ")}.`,
    nextAction: passed ? "accept_for_single_render" : "discard_and_generate_different_concept",
  };
}

/** Canonical Phase 4A–4D editorial distinctiveness implementation. */
function evaluateEditorialDistinctiveness(input: EditorialDistinctivenessInput): EditorialDistinctivenessResult {
  switch (input.phase) {
    case "4A": return reviewPhase4A(input.concept);
    case "4B": return reviewPhase4B(input.direction);
    case "4D": return reviewPhase4D(input);
  }
}

export function reviewEditorialDistinctiveness(input: Phase4AEditorialDistinctivenessInput): CoverConceptEditorialReview;
export function reviewEditorialDistinctiveness(input: Phase4BEditorialDistinctivenessInput): EditorialDistinctivenessReview;
export function reviewEditorialDistinctiveness(input: Phase4DEditorialDistinctivenessInput): FinalRenderEditorialReview;
export function reviewEditorialDistinctiveness(input: EditorialDistinctivenessInput): EditorialDistinctivenessResult {
  return evaluateEditorialDistinctiveness(input);
}

export function assertEditorialDistinctiveness(input: Phase4AEditorialDistinctivenessInput): CoverConceptEditorialReview;
export function assertEditorialDistinctiveness(input: Phase4BEditorialDistinctivenessInput): EditorialDistinctivenessReview;
export function assertEditorialDistinctiveness(input: Phase4DEditorialDistinctivenessInput): FinalRenderEditorialReview;
export function assertEditorialDistinctiveness(input: EditorialDistinctivenessInput): EditorialDistinctivenessResult {
  const review = evaluateEditorialDistinctiveness(input);
  if (review.passed) return review;
  switch (input.phase) {
    case "4A": throw new CoverConceptEditorialError(review as CoverConceptEditorialReview);
    case "4B": throw new EditorialDistinctivenessError(review as EditorialDistinctivenessReview);
    case "4D": throw new FinalRenderEditorialError(review as FinalRenderEditorialReview);
  }
}
