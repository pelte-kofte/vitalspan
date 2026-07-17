import {
  COVER_METAPHOR_ENDPOINT,
  COVER_METAPHOR_MODEL,
  type CoverStoryExtraction,
  type CoverVisualConcept,
} from "./briefCoverConcept.ts";
import { assertEditorialDistinctiveness } from "./briefCoverEditorialDistinctiveness.ts";

export type VisualFamily = "Living Tapestry" | "Landscape" | "Architecture" | "Living Still";
/** Compatibility alias for older callers; the contract now exposes four families. */
export type VisualMode = VisualFamily;

export interface PreviousCoverSummary {
  id: string;
  selectedVisualFamily: VisualFamily | null;
  visualWorld: string;
  dominantScientificRelationship: string;
  silhouettePlan: string;
}

export interface GovernanceDocument { version: string; content: string }

export interface VisualDirectionInput {
  coverStory: CoverStoryExtraction;
  selectedConcept: CoverVisualConcept;
  artBible: GovernanceDocument;
  foundingCoverDna: GovernanceDocument;
  previousCovers: PreviousCoverSummary[];
}

export interface VisualDirection {
  selectedVisualFamily: VisualFamily;
  familyJustification: string;
  dominantScientificRelationship: string;
  visualWorld: string;
  visualEvent: string;
  structuralContinuity: string;
  macroComposition: string;
  microDetailLanguage: string;
  depthStrategy: string;
  focalPath: string;
  silhouettePlan: string;
  materialLanguage: string;
  colorStrategy: string;
  lightingStrategy: string;
  uncertaintyTreatment: string;
  prohibitedImplications: string[];
  optionalForms: string[];
}

export interface VisualDirectionValidation { passed: boolean; errors: string[]; warnings: string[] }
export interface VisualDirectionRequest { system: string; input: VisualDirectionInput; outputSchema: Record<string, unknown> }
export interface AnthropicVisualDirectionRequest {
  model: string;
  max_tokens: number;
  system: string;
  messages: Array<{ role: "user"; content: string }>;
  output_config: { format: { type: "json_schema"; schema: Record<string, unknown> } };
}
export type VisualDirectionGenerator = (request: VisualDirectionRequest) => Promise<unknown>;

export const VISUAL_DIRECTION_MAX_TOKENS = 2_800;
const VISUAL_FAMILIES: VisualFamily[] = ["Living Tapestry", "Landscape", "Architecture", "Living Still"];
const DIRECTION_FIELDS = [
  "selectedVisualFamily", "familyJustification", "dominantScientificRelationship", "visualWorld", "visualEvent",
  "structuralContinuity", "macroComposition", "microDetailLanguage", "depthStrategy", "focalPath", "silhouettePlan",
  "materialLanguage", "colorStrategy", "lightingStrategy", "uncertaintyTreatment", "prohibitedImplications", "optionalForms",
] as const;

const STOP_WORDS = new Set([
  "about", "after", "again", "against", "also", "among", "because", "before", "being", "between",
  "could", "does", "each", "from", "have", "into", "itself", "more", "must", "only", "other", "over",
  "same", "should", "than", "that", "their", "there", "these", "they", "this", "those", "through", "under",
  "very", "what", "when", "where", "which", "while", "with", "without", "would",
]);
const ARCHITECTURE_RELATIONSHIP = /\b(?:barrier|access|compartment|threshold|scaffold|structural failure|protected|exposed|translation|permeability|boundary)\b/i;
const GENERIC_ARCHITECTURE = /\b(?:generic (?:planes?|blocks?|corridors?|geometry)|monumental void|fashionable abstraction|architecture magazine|modernist pavilion)\b/i;
const LIVING_STILL_PROOF = /\b(?:unique|uniquely|physical relationship|material relationship|directly maps|specific relationship)\b/i;
const DEFAULT_STILL_PROPS = /\b(?:bowls?|vessels?|stones?|linen|seeds?|paper sheets?|tabletops?|anomalous shadows?)\b/i;
const GENERIC_STILL = /\b(?:tasteful still life|tastefully arranged|elegant arrangement|quiet objects? on a surface|generic props?)\b/i;
const OBJECT_INVENTORY = /(?:,\s*){3,}|\b(?:hero object|supporting objects|object inventory|collection of objects)\b/i;
const CONTINUITY = /\b(?:continu\w*|flow\w*|rhythm\w*|transition\w*|transform\w*|echo\w*|branch\w*|fold\w*|field|cohes\w*|migration)\b/i;
const MACRO = /\b(?:macro|one (?:memorable|dominant|coherent)|single (?:memorable|dominant|coherent)|asymmetric|silhouette|thumbnail|unified)\b/i;
const MICRO = /\b(?:micro|cell\w*|fiber\w*|membrane\w*|vascular|neural|linework|vein\w*|grain|close|branch\w*|texture)\b/i;
const CANONICAL_LIGHT = /\b(?:cool morning|morning daylight|north-facing|north facing)\b/i;
const UPPER_LEFT = /\bupper[- ]left\b/i;
const COLOR_CONTROL = /\b(?:restrain\w*|selective|limited|controlled|concentrated|unequal\w* distributed)\b/i;
const PROVIDER_LANGUAGE = /\b(?:gpt-image|openai|midjourney|stable diffusion|prompt weights?|negative prompt|seed value|sampler|cfg scale)\b/i;
const UNSUPPORTED_CERTAINTY = /\b(?:proves?|guarantees?|cures?|reverses?|eliminates?|definitive(?:ly)?)\b/i;
const GENERIC_SCIENTIFIC_RELATIONSHIP = /^(?:uncertainty remains|promising (?:but )?limited signals?|risk and benefit|evidence approaches practice)/i;
const FOUNDING_COPY_MOTIFS = [
  /\b(?:s-shaped|serpentine) vertical (?:path|column|silhouette)\b/i,
  /\bnear-black (?:field|ground|background)\b/i,
  /\bwarm central (?:nexus|hinge|core)\b/i,
  /\b(?:pale )?upper-right (?:mass|lobe)\b/i,
  /\bdense lower-left (?:field|lobe|ecosystem)\b/i,
  /\bgut[-– ]heart[-– ]brain\b/i,
];

export const VISUAL_DIRECTION_SYSTEM_PROMPT = [
  "You are Vitalspan's visual-direction editor. Translate the already-selected article-specific concept into one provider-neutral visual direction.",
  "Select the visual family only now, after the scientific story and concept exist. Use this preference when scientifically justified: Living Tapestry, Landscape, Architecture, Living Still.",
  "Living Tapestry is preferred for grounded biological mechanisms, connected systems, metabolism, neurobiology, cardiovascular biology, muscle physiology, cellular adaptation, and cross-scale relationships.",
  "Landscape is for an environmental event that directly maps to the finding. Architecture is rare and requires a named scientific barrier, access, compartment, threshold, scaffold, protected/exposed, or translation relationship. Living Still is exceptional and requires a one-sentence proof that one physical relationship is uniquely appropriate.",
  "Preserve article-specific science. Establish the dominant relationship and visual event before deriving forms. An integrated field without a central object is welcome.",
  "The scientific relationship must be understood before any named object. Prefer woven systems, living fabrics, emergent structures, interconnected fields, dynamic gradients, layered ecologies, biological topology, adaptive geometries, network tension, and collective emergence.",
  "Apply the one-second test to macroComposition and silhouettePlan before returning. Never use a tree, Tree of Life, bonsai, flower, leaf, brain, neuron icon, DNA helix, heart, lungs, eye, butterfly, bird, hands, globe, planet, mountain, river, sun, roots, coral, blood vessel, mushroom, or recognizable animal as the primary silhouette; these may appear only as microscopic internal references.",
  "Create one memorable macro silhouette plus close-view scientific discovery. Treat uncertainty by limiting resolution or closure, never by erasing specificity.",
  "Reject generic architecture, tasteful still-life defaults, bowls, vessels, stones, seeds, linen, paper, object inventories, vague AI abstraction, and copies of the founding gut-heart-brain arrangement.",
  "Use the supplied Art Bible as governance and the Founding Cover DNA only as an advisory quality benchmark.",
  "Return strict structured data only.",
].join(" ");

const boundedString = { type: "string", minLength: 8, maxLength: 700 };
export const VISUAL_DIRECTION_OUTPUT_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: [...DIRECTION_FIELDS],
  properties: {
    selectedVisualFamily: { type: "string", enum: VISUAL_FAMILIES },
    familyJustification: boundedString,
    dominantScientificRelationship: boundedString,
    visualWorld: boundedString,
    visualEvent: boundedString,
    structuralContinuity: boundedString,
    macroComposition: boundedString,
    microDetailLanguage: boundedString,
    depthStrategy: boundedString,
    focalPath: boundedString,
    silhouettePlan: boundedString,
    materialLanguage: boundedString,
    colorStrategy: boundedString,
    lightingStrategy: boundedString,
    uncertaintyTreatment: boundedString,
    prohibitedImplications: { type: "array", minItems: 1, maxItems: 8, items: boundedString },
    optionalForms: { type: "array", minItems: 0, maxItems: 5, items: { type: "string", minLength: 3, maxLength: 180 } },
  },
};

function normalizeWhitespace(value: string): string { return value.replace(/\s+/g, " ").trim(); }
function normalize(value: string): string { return normalizeWhitespace(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter((token) => token.length >= 4 && !STOP_WORDS.has(token)));
}
function overlap(left: Set<string>, right: Set<string>): number { let n = 0; for (const token of left) if (right.has(token)) n += 1; return n; }
function requireText(value: unknown, label: string): string {
  if (typeof value !== "string" || !normalizeWhitespace(value)) throw new Error(`${label} must not be empty`);
  return normalizeWhitespace(value);
}
function requireEditorialScore(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 5) throw new Error(`${label} must be an integer from 1 to 5`);
  return Number(value);
}
function requireStrings(value: unknown, label: string, allowEmpty = false): string[] {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error(`${label} must be ${allowEmpty ? "an array of strings" : "a non-empty array of strings"}`);
  }
  return value.map((item) => normalizeWhitespace(item));
}
function exactKeys(record: Record<string, unknown>): boolean {
  const keys = Object.keys(record).sort();
  const expected = [...DIRECTION_FIELDS].sort();
  return keys.length === expected.length && keys.every((key, index) => key === expected[index]);
}
function cleanStory(story: CoverStoryExtraction): CoverStoryExtraction {
  return {
    coverStoryCandidateId: requireText(story.coverStoryCandidateId, "coverStoryCandidateId"),
    coverStoryReason: requireText(story.coverStoryReason, "coverStoryReason"),
    centralFinding: requireText(story.centralFinding, "centralFinding"),
    whyItMatters: requireText(story.whyItMatters, "whyItMatters"),
    editorialQuestion: requireText(story.editorialQuestion, "editorialQuestion"),
    principalUncertainty: requireText(story.principalUncertainty, "principalUncertainty"),
    prohibitedClaims: requireStrings(story.prohibitedClaims, "prohibitedClaims"),
    visualStorySentence: requireText(story.visualStorySentence, "visualStorySentence"),
  };
}
function cleanConcept(concept: CoverVisualConcept): CoverVisualConcept {
  if (!Array.isArray(concept.suitableVisualFamilies) || concept.suitableVisualFamilies.length === 0
    || concept.suitableVisualFamilies.some((family) => !VISUAL_FAMILIES.includes(family))) {
    throw new Error("selectedConcept.suitableVisualFamilies must contain valid families");
  }
  const cleaned: CoverVisualConcept = {
    visualStory: requireText(concept.visualStory, "selectedConcept.visualStory"),
    relationship: requireText(concept.relationship, "selectedConcept.relationship"),
    visualEvent: requireText(concept.visualEvent, "selectedConcept.visualEvent"),
    scientificAnchor: requireText(concept.scientificAnchor, "selectedConcept.scientificAnchor"),
    whyMemorable: requireText(concept.whyMemorable, "selectedConcept.whyMemorable"),
    editorialScores: {
      novelty: requireEditorialScore(concept.editorialScores?.novelty, "selectedConcept.editorialScores.novelty"),
      originality: requireEditorialScore(concept.editorialScores?.originality, "selectedConcept.editorialScores.originality"),
      scientificAmbiguity: requireEditorialScore(concept.editorialScores?.scientificAmbiguity, "selectedConcept.editorialScores.scientificAmbiguity"),
      narrativeClarity: requireEditorialScore(concept.editorialScores?.narrativeClarity, "selectedConcept.editorialScores.narrativeClarity"),
    },
    suitableVisualFamilies: [...new Set(concept.suitableVisualFamilies)],
    prohibitedImplications: requireStrings(concept.prohibitedImplications, "selectedConcept.prohibitedImplications"),
  };
  assertEditorialDistinctiveness({ phase: "4A", concept: cleaned });
  return cleaned;
}

export function buildVisualDirectionRequest(input: VisualDirectionInput): VisualDirectionRequest {
  const coverStory = cleanStory(input.coverStory);
  const selectedConcept = cleanConcept(input.selectedConcept);
  const cleanDocument = (document: GovernanceDocument, label: string): GovernanceDocument => ({
    version: requireText(document?.version, `${label}.version`),
    content: requireText(document?.content, `${label}.content`),
  });
  const previousCovers = (input.previousCovers ?? []).slice(0, 8).map((cover) => ({
    id: requireText(cover.id, "previousCover.id"),
    selectedVisualFamily: cover.selectedVisualFamily && VISUAL_FAMILIES.includes(cover.selectedVisualFamily) ? cover.selectedVisualFamily : null,
    visualWorld: requireText(cover.visualWorld, "previousCover.visualWorld"),
    dominantScientificRelationship: requireText(cover.dominantScientificRelationship, "previousCover.dominantScientificRelationship"),
    silhouettePlan: requireText(cover.silhouettePlan, "previousCover.silhouettePlan"),
  }));
  return {
    system: VISUAL_DIRECTION_SYSTEM_PROMPT,
    input: {
      coverStory,
      selectedConcept,
      artBible: cleanDocument(input.artBible, "artBible"),
      foundingCoverDna: cleanDocument(input.foundingCoverDna, "foundingCoverDna"),
      previousCovers,
    },
    outputSchema: VISUAL_DIRECTION_OUTPUT_SCHEMA,
  };
}

export function buildAnthropicVisualDirectionRequest(input: VisualDirectionInput, model = COVER_METAPHOR_MODEL): AnthropicVisualDirectionRequest {
  const request = buildVisualDirectionRequest(input);
  return {
    model,
    max_tokens: VISUAL_DIRECTION_MAX_TOKENS,
    system: request.system,
    messages: [{ role: "user", content: JSON.stringify(request.input) }],
    output_config: { format: { type: "json_schema", schema: request.outputSchema } },
  };
}

function parsePayload(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { throw new Error("Visual direction response must be valid JSON"); }
}

function parseDirection(value: unknown): VisualDirection {
  const payload = parsePayload(value);
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !exactKeys(payload as Record<string, unknown>)) {
    throw new Error("Visual direction fields do not match the Phase 4B schema");
  }
  const record = payload as Record<string, unknown>;
  if (!VISUAL_FAMILIES.includes(record.selectedVisualFamily as VisualFamily)) throw new Error("selectedVisualFamily is invalid");
  return {
    selectedVisualFamily: record.selectedVisualFamily as VisualFamily,
    familyJustification: requireText(record.familyJustification, "familyJustification"),
    dominantScientificRelationship: requireText(record.dominantScientificRelationship, "dominantScientificRelationship"),
    visualWorld: requireText(record.visualWorld, "visualWorld"),
    visualEvent: requireText(record.visualEvent, "visualEvent"),
    structuralContinuity: requireText(record.structuralContinuity, "structuralContinuity"),
    macroComposition: requireText(record.macroComposition, "macroComposition"),
    microDetailLanguage: requireText(record.microDetailLanguage, "microDetailLanguage"),
    depthStrategy: requireText(record.depthStrategy, "depthStrategy"),
    focalPath: requireText(record.focalPath, "focalPath"),
    silhouettePlan: requireText(record.silhouettePlan, "silhouettePlan"),
    materialLanguage: requireText(record.materialLanguage, "materialLanguage"),
    colorStrategy: requireText(record.colorStrategy, "colorStrategy"),
    lightingStrategy: requireText(record.lightingStrategy, "lightingStrategy"),
    uncertaintyTreatment: requireText(record.uncertaintyTreatment, "uncertaintyTreatment"),
    prohibitedImplications: requireStrings(record.prohibitedImplications, "prohibitedImplications"),
    optionalForms: requireStrings(record.optionalForms, "optionalForms", true),
  };
}

function foundingCopyCount(value: string): number { return FOUNDING_COPY_MOTIFS.filter((pattern) => pattern.test(value)).length; }
function repeatedRecentWorld(direction: VisualDirection, previous: PreviousCoverSummary): boolean {
  const left = tokens(`${direction.visualWorld} ${direction.macroComposition} ${direction.silhouettePlan}`);
  const right = tokens(`${previous.visualWorld} ${previous.silhouettePlan}`);
  const shared = overlap(left, right);
  return shared >= 5 && shared / Math.max(1, Math.min(left.size, right.size)) >= 0.55;
}

export function validateVisualDirection(input: VisualDirectionInput, rawDirection: unknown): { direction: VisualDirection; validation: VisualDirectionValidation } {
  const normalizedInput = buildVisualDirectionRequest(input).input;
  const direction = parseDirection(rawDirection);
  const errors: string[] = [];
  const warnings: string[] = [];
  const concept = normalizedInput.selectedConcept;
  const story = normalizedInput.coverStory;
  const directionText = DIRECTION_FIELDS.map((field) => JSON.stringify(direction[field])).join(" ");
  const scientificText = `${story.centralFinding} ${story.visualStorySentence} ${concept.relationship} ${concept.visualEvent} ${concept.scientificAnchor}`;

  if (!concept.suitableVisualFamilies.includes(direction.selectedVisualFamily)) errors.push("family_not_supported_by_selected_concept");
  if (GENERIC_SCIENTIFIC_RELATIONSHIP.test(direction.dominantScientificRelationship)
    || overlap(tokens(direction.dominantScientificRelationship), tokens(scientificText)) < 2) {
    errors.push("scientific_relationship_not_grounded");
  }
  if (overlap(tokens(direction.visualEvent), tokens(`${concept.visualEvent} ${concept.relationship} ${story.visualStorySentence}`)) < 1) {
    errors.push("visual_event_not_grounded");
  }
  const affirmativeDirectionText = DIRECTION_FIELDS
    .filter((field) => field !== "prohibitedImplications")
    .map((field) => JSON.stringify(direction[field]))
    .join(" ");
  if (UNSUPPORTED_CERTAINTY.test(affirmativeDirectionText)) errors.push("unsupported_claim_strength");

  if (direction.selectedVisualFamily === "Living Tapestry") {
    if (!CONTINUITY.test(direction.structuralContinuity) || !MICRO.test(direction.microDetailLanguage)) {
      errors.push("living_tapestry_missing_continuity_or_scientific_detail");
    }
  }
  if (direction.selectedVisualFamily === "Landscape"
    && overlap(tokens(direction.visualEvent), tokens(`${concept.visualEvent} ${story.centralFinding}`)) < 2) {
    errors.push("landscape_event_not_mapped_to_finding");
  }
  if (direction.selectedVisualFamily === "Architecture") {
    if (!ARCHITECTURE_RELATIONSHIP.test(`${direction.familyJustification} ${direction.dominantScientificRelationship}`)) {
      errors.push("architecture_missing_named_scientific_structure");
    }
    if (GENERIC_ARCHITECTURE.test(directionText)) errors.push("generic_architectural_abstraction");
  } else if (GENERIC_ARCHITECTURE.test(directionText)) {
    errors.push("generic_architectural_abstraction");
  }
  if (direction.selectedVisualFamily === "Living Still" && !LIVING_STILL_PROOF.test(direction.familyJustification)) {
    errors.push("living_still_missing_unique_physical_proof");
  }
  if (GENERIC_STILL.test(directionText)) errors.push("generic_tasteful_still_life");
  if (DEFAULT_STILL_PROPS.test(directionText) && !DEFAULT_STILL_PROPS.test(scientificText)) {
    errors.push("default_still_life_object_family");
  }
  if (OBJECT_INVENTORY.test(directionText) || direction.optionalForms.length > 3) errors.push("over_prescriptive_object_inventory");

  if (!CONTINUITY.test(direction.structuralContinuity)) errors.push("missing_structural_continuity");
  if (!MACRO.test(`${direction.macroComposition} ${direction.silhouettePlan}`)) errors.push("weak_macro_silhouette");
  if (!MICRO.test(direction.microDetailLanguage)) errors.push("missing_close_view_scientific_discovery");
  if (!CANONICAL_LIGHT.test(direction.lightingStrategy) || !UPPER_LEFT.test(direction.lightingStrategy)) errors.push("noncanonical_lighting_strategy");
  if (!COLOR_CONTROL.test(direction.colorStrategy)) errors.push("uncontrolled_color_strategy");
  if (PROVIDER_LANGUAGE.test(directionText)) errors.push("provider_specific_direction");
  if (foundingCopyCount(directionText) >= 2) errors.push("founding_cover_copy");

  const prohibitedSource = tokens(`${story.prohibitedClaims.join(" ")} ${concept.prohibitedImplications.join(" ")}`);
  if (overlap(tokens(direction.prohibitedImplications.join(" ")), prohibitedSource) < 1) errors.push("prohibited_implications_incomplete");
  normalizedInput.previousCovers.forEach((cover) => {
    if (repeatedRecentWorld(direction, cover)) warnings.push(`repeated_recent_visual_world:${cover.id}`);
  });
  const validation = { passed: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
  return { direction, validation };
}

export async function generateVisualDirection(input: VisualDirectionInput, generate: VisualDirectionGenerator): Promise<{ direction: VisualDirection; validation: VisualDirectionValidation }> {
  const request = buildVisualDirectionRequest(input);
  const result = validateVisualDirection(request.input, await generate(request));
  if (!result.validation.passed) throw new Error(`Visual direction validation failed: ${result.validation.errors.join(", ")}`);
  return result;
}

export async function generateAnthropicVisualDirection(
  input: VisualDirectionInput,
  apiKey: string,
  fetcher: typeof fetch = fetch,
  model = COVER_METAPHOR_MODEL,
): Promise<{ direction: VisualDirection; validation: VisualDirectionValidation }> {
  if (!apiKey.trim()) throw new Error("ANTHROPIC_API_KEY is required for visual direction generation");
  const response = await fetcher(COVER_METAPHOR_ENDPOINT, {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(buildAnthropicVisualDirectionRequest(input, model)),
  });
  if (!response.ok) throw new Error(`Anthropic visual direction request failed with HTTP ${response.status}`);
  const payload = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const text = payload.content?.find((block) => block.type === "text")?.text;
  if (typeof text !== "string") throw new Error("Anthropic returned no structured visual direction");
  return generateVisualDirection(input, async () => text);
}

export function selectConceptFromPhase4AResult(conceptId: string, value: unknown): { coverStory: CoverStoryExtraction; selectedConcept: CoverVisualConcept } {
  if (!conceptId.trim()) throw new Error("conceptId must not be empty");
  const payload = parsePayload(value);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Phase 4A result must be an object");
  const record = payload as Record<string, unknown>;
  const coverStory = (record.coverStory ?? (record.result as Record<string, unknown> | undefined)?.coverStory) as CoverStoryExtraction;
  const concepts = (record.concepts ?? (record.result as Record<string, unknown> | undefined)?.concepts) as unknown;
  if (!coverStory || !Array.isArray(concepts)) throw new Error("Phase 4A result must contain coverStory and concepts");
  const index = /^concept-(\d+)$/.exec(conceptId)?.[1];
  if (!index) throw new Error("conceptId must use concept-N format");
  const selectedConcept = concepts[Number(index) - 1] as CoverVisualConcept | undefined;
  if (!selectedConcept) throw new Error(`Phase 4A ${conceptId} was not found`);
  return { coverStory: cleanStory(coverStory), selectedConcept: cleanConcept(selectedConcept) };
}

/** Compatibility name retained for CLI imports during the story-first rollout. */
export function selectCandidateFromPhase4AResult(conceptId: string, value: unknown): CoverVisualConcept {
  return selectConceptFromPhase4AResult(conceptId, value).selectedConcept;
}
