import {
  COVER_METAPHOR_ENDPOINT,
  COVER_METAPHOR_MODEL,
  type CoverMetaphorCandidate,
} from "./briefCoverConcept.ts";

export type VisualMode = "Living Still" | "Living Tapestry";
export type VisualEnergy = "quiet" | "balanced" | "immersive";

export interface PreviousCoverSummary {
  id: string;
  visualMode: VisualMode | null;
  visualWorld: string;
  dominantRelationship: string;
  silhouettePlan: string;
}

export interface GovernanceDocument {
  version: string;
  content: string;
}

export interface VisualDirectionInput {
  editorialThesis: string;
  themeConfidence: "high" | "medium" | "low";
  selectedCandidate: CoverMetaphorCandidate;
  artBible: GovernanceDocument;
  foundingCoverDna: GovernanceDocument;
  previousCovers: PreviousCoverSummary[];
}

export interface OptionalVisualForm {
  form: string;
  relationalRole: string;
  necessity: string;
}

export interface VisualDirection {
  visualMode: VisualMode;
  visualEnergy: VisualEnergy;
  visualWorld: string;
  dominantRelationship: string;
  spatialBehavior: string;
  structuralContinuity: string;
  materialLanguage: string;
  depthStrategy: string;
  focalPath: string;
  silhouettePlan: string;
  cropPlan: {
    masterAspectRatio: "3:4";
    upperQuietPercent: 18;
    centralSafePercent: 70;
    lowerNonessentialPercent: number;
  };
  colorStrategy: string;
  lightingStrategy: string;
  uncertaintyTreatment: string;
  prohibitedImplications: string[];
  optionalForms: OptionalVisualForm[];
}

export interface VisualDirectionValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export interface VisualDirectionRequest {
  system: string;
  input: VisualDirectionInput;
  outputSchema: Record<string, unknown>;
}

export interface AnthropicVisualDirectionRequest {
  model: string;
  max_tokens: number;
  system: string;
  messages: Array<{ role: "user"; content: string }>;
  output_config: {
    format: {
      type: "json_schema";
      schema: Record<string, unknown>;
    };
  };
}

export type VisualDirectionGenerator = (request: VisualDirectionRequest) => Promise<unknown>;

export const VISUAL_DIRECTION_MAX_TOKENS = 2_400;

const DIRECTION_FIELDS = [
  "visualMode",
  "visualEnergy",
  "visualWorld",
  "dominantRelationship",
  "spatialBehavior",
  "structuralContinuity",
  "materialLanguage",
  "depthStrategy",
  "focalPath",
  "silhouettePlan",
  "cropPlan",
  "colorStrategy",
  "lightingStrategy",
  "uncertaintyTreatment",
  "prohibitedImplications",
  "optionalForms",
] as const;

const CANDIDATE_FIELDS = [
  "relationship",
  "editorialTension",
  "metaphorFamily",
  "whyItFitsThesis",
  "whatItMustNotImply",
] as const;

const STOP_WORDS = new Set([
  "about", "after", "again", "against", "also", "among", "because", "before", "being", "between",
  "could", "does", "each", "from", "have", "into", "itself", "more", "must", "only", "other", "over",
  "same", "should", "than", "that", "their", "there", "these", "they", "this", "those", "through", "under",
  "very", "what", "when", "where", "which", "while", "with", "without", "would",
]);

const CONNECTED_SYSTEMS = /\b(?:connected systems?|interconnected|interdependen\w*|multisystem|networked physiology|ecosystem|feedback|cross-scale|coordinated systems?|systemic exchange|systems relationship)\b/i;
const LIVING_STILL_JUSTIFICATION = /\b(?:trade-?offs?|uncertainty|evidence|decision|constraint|tension|balance|containment|boundary|threshold|asymmetr\w*|incomplete|divergen\w*)\b/i;
const OBJECT_FIRST_LANGUAGE = /\b(?:hero objects?|supporting objects?|supporting forms?|object inventory|arrange[sd]? objects?|collection of objects|centerpiece|placed on (?:a|the)|sits? on (?:a|the))\b/i;
const DEFAULT_STILL_LIFE_OBJECTS = /\b(?:tabletop|bowls?|vessels?|ceramic(?:s)?|stones?|linen|seed pods?|still[ -]life)\b/i;
const GENERIC_STILL_LIFE = /\b(?:tasteful|tastefully arranged|elegant arrangement|minimalist arrangement|decorative still[ -]life|quiet objects? on a surface)\b/i;
const THRESHOLD_LANGUAGE = /\b(?:threshold|boundary|sill|crossing)\b/i;
const CONTINUITY_LANGUAGE = /\b(?:continu\w*|flow\w*|rhythm\w*|transition\w*|transform\w*|echo\w*|path\w*|field|cohes\w*|separat\w*|repeat\w*|gradation|migration)\b/i;
const SILHOUETTE_LANGUAGE = /\b(?:single|one dominant|distinct|legible|recognizable|clear|bold|asymmetric|macro|field structure|separated masses|unified mass)\b/i;
const WEAK_SILHOUETTE = /\b(?:subtle details?|delicate details?|fine details?|texture alone|color alone)\b/i;
const SHARED_MECHANISM = /\b(?:shared (?:biological )?mechanism|common pathway|biologically connected|interconnected biology|networked mechanism|causal pathway|rooted together|threads? connect|physiological link)\b/i;
const PROVIDER_LANGUAGE = /\b(?:gpt-image|openai|midjourney|stable diffusion|stability ai|imagen|anthropic|claude|prompt weights?|negative prompt|seed value|sampler|cfg scale)\b/i;
const CANONICAL_LIGHT = /\b(?:cool morning|morning daylight|north-facing|north facing)\b/i;
const UPPER_LEFT = /\bupper[- ]left\b/i;
const COLOR_CONTROL = /\b(?:restrain\w*|selective|limited|controlled|single accent|one accent|unequal\w* distributed|concentrated)\b/i;
const FOUNDING_COPY_MOTIFS = [
  /\b(?:s-shaped|serpentine) vertical (?:path|column|silhouette)\b/i,
  /\bnear-black (?:field|ground|background)\b/i,
  /\bwarm central (?:nexus|hinge|core)\b/i,
  /\b(?:pale )?upper-right (?:mass|lobe)\b/i,
  /\bdense lower-left (?:field|lobe|ecosystem)\b/i,
  /\bbroad botanical counterforms?\b/i,
  /\bgut[-– ]heart[-– ]brain\b/i,
];

export const VISUAL_DIRECTION_SYSTEM_PROMPT = [
  "You are the Vitalspan visual-direction editor. Translate one already-selected editorial metaphor into one provider-neutral visual direction.",
  "The relationship must control the image. Decide visual mode, energy, world, space, continuity, material, depth, focal path, silhouette, crop, color, light, and uncertainty before deriving any recognizable form.",
  "Forms are optional and must be derived last. Return an empty optionalForms array whenever the relationship can be carried by a field, landscape, transformation, architecture, atmosphere, or material behavior alone.",
  "Never require a hero object or supporting objects. Never default to a tabletop, vessel, bowl, stone, linen, seed, or threshold.",
  "The visual world may be a continuous biological field, landscape, material transformation, architectural space, or a restrained still life only when the selected metaphor materially requires it.",
  "Use Living Tapestry for grounded connected-systems theses when confidence permits. Use Living Still for materially justified tension, uncertainty, evidence, decision, or trade-off relationships, and never as a default.",
  "Low-confidence themes must remain quiet Living Still constellations: maintain visible separation and never invent roots, threads, pathways, shared rhythm, or biological connection.",
  "Apply the supplied Art Bible as governance. Inherit the Founding Cover DNA principles of relationship-first hierarchy, macro clarity, structural continuity, material specificity, depth, curiosity, and thumbnail memory without copying its anatomy, botanical motifs, dark ground, palette, S-path, or anchor placement.",
  "Use previous-cover summaries only to avoid repeating recent worlds. Do not mention an image provider, model, prompt syntax, seed, or render setting.",
  "Return exactly the requested schema and no prose outside it.",
].join(" ");

const longString = { type: "string", minLength: 12, maxLength: 700 };

export const VISUAL_DIRECTION_OUTPUT_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: [...DIRECTION_FIELDS],
  properties: {
    visualMode: { type: "string", enum: ["Living Still", "Living Tapestry"] },
    visualEnergy: { type: "string", enum: ["quiet", "balanced", "immersive"] },
    visualWorld: longString,
    dominantRelationship: longString,
    spatialBehavior: longString,
    structuralContinuity: longString,
    materialLanguage: longString,
    depthStrategy: longString,
    focalPath: longString,
    silhouettePlan: longString,
    cropPlan: {
      type: "object",
      additionalProperties: false,
      required: ["masterAspectRatio", "upperQuietPercent", "centralSafePercent", "lowerNonessentialPercent"],
      properties: {
        masterAspectRatio: { type: "string", const: "3:4" },
        upperQuietPercent: { type: "number", const: 18 },
        centralSafePercent: { type: "number", const: 70 },
        lowerNonessentialPercent: { type: "number", minimum: 12, maximum: 15 },
      },
    },
    colorStrategy: longString,
    lightingStrategy: longString,
    uncertaintyTreatment: longString,
    prohibitedImplications: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: { type: "string", minLength: 8, maxLength: 500 },
    },
    optionalForms: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["form", "relationalRole", "necessity"],
        properties: {
          form: { type: "string", minLength: 3, maxLength: 120 },
          relationalRole: { type: "string", minLength: 8, maxLength: 400 },
          necessity: { type: "string", minLength: 8, maxLength: 400 },
        },
      },
    },
  },
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter((token) => token.length >= 4 && !STOP_WORDS.has(token)));
}

function overlap(left: Set<string>, right: Set<string>): number {
  let count = 0;
  for (const token of left) if (right.has(token)) count += 1;
  return count;
}

function jaccard(left: Set<string>, right: Set<string>): number {
  const intersection = overlap(left, right);
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length && actual.every((key, index) => key === sortedExpected[index]);
}

function cleanCandidate(value: CoverMetaphorCandidate): CoverMetaphorCandidate {
  const record = value as unknown as Record<string, unknown>;
  if (!value || typeof value !== "object" || !exactKeys(record, CANDIDATE_FIELDS)
    || CANDIDATE_FIELDS.some((field) => typeof record[field] !== "string" || !(record[field] as string).trim())) {
    throw new Error("selectedCandidate must be an exact Phase 4A metaphor candidate");
  }
  if ((record.metaphorFamily as string).trim().length < 3 || (record.metaphorFamily as string).trim().length > 80
    || CANDIDATE_FIELDS.filter((field) => field !== "metaphorFamily")
      .some((field) => (record[field] as string).trim().length < 8 || (record[field] as string).trim().length > 500)) {
    throw new Error("selectedCandidate must match the Phase 4A field limits");
  }
  return Object.fromEntries(CANDIDATE_FIELDS.map((field) => [field, (record[field] as string).trim()])) as unknown as CoverMetaphorCandidate;
}

function requireText(value: string, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must not be empty`);
  return value.trim();
}

export function buildVisualDirectionRequest(input: VisualDirectionInput): VisualDirectionRequest {
  if (!["high", "medium", "low"].includes(input.themeConfidence)) {
    throw new Error("themeConfidence must be high, medium, or low");
  }
  const previousCovers = Array.isArray(input.previousCovers) ? input.previousCovers.slice(0, 8).map((cover) => ({
    id: requireText(cover.id, "previousCover.id"),
    visualMode: cover.visualMode,
    visualWorld: requireText(cover.visualWorld, "previousCover.visualWorld"),
    dominantRelationship: requireText(cover.dominantRelationship, "previousCover.dominantRelationship"),
    silhouettePlan: requireText(cover.silhouettePlan, "previousCover.silhouettePlan"),
  })) : [];
  return {
    system: VISUAL_DIRECTION_SYSTEM_PROMPT,
    input: {
      editorialThesis: requireText(input.editorialThesis, "editorialThesis"),
      themeConfidence: input.themeConfidence,
      selectedCandidate: cleanCandidate(input.selectedCandidate),
      artBible: {
        version: requireText(input.artBible.version, "artBible.version"),
        content: requireText(input.artBible.content, "artBible.content"),
      },
      foundingCoverDna: {
        version: requireText(input.foundingCoverDna.version, "foundingCoverDna.version"),
        content: requireText(input.foundingCoverDna.content, "foundingCoverDna.content"),
      },
      previousCovers,
    },
    outputSchema: VISUAL_DIRECTION_OUTPUT_SCHEMA,
  };
}

export function buildAnthropicVisualDirectionRequest(
  input: VisualDirectionInput,
  model = COVER_METAPHOR_MODEL,
): AnthropicVisualDirectionRequest {
  const request = buildVisualDirectionRequest(input);
  return {
    model,
    max_tokens: VISUAL_DIRECTION_MAX_TOKENS,
    system: request.system,
    messages: [{ role: "user", content: JSON.stringify(request.input) }],
    output_config: {
      format: { type: "json_schema", schema: request.outputSchema },
    },
  };
}

function parsePayload(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("Visual direction response must be valid JSON");
  }
}

function parseDirection(value: unknown): VisualDirection {
  const payload = parsePayload(value);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Visual direction response must be an object");
  }
  const record = payload as Record<string, unknown>;
  if (!exactKeys(record, DIRECTION_FIELDS)) throw new Error("Visual direction response has an invalid schema");
  const stringFields = DIRECTION_FIELDS.filter((field) => !["cropPlan", "prohibitedImplications", "optionalForms"].includes(field));
  if (stringFields.some((field) => typeof record[field] !== "string" || !(record[field] as string).trim())) {
    throw new Error("Visual direction response contains an invalid text field");
  }
  const narrativeFields = stringFields.filter((field) => !["visualMode", "visualEnergy"].includes(field));
  if (narrativeFields.some((field) => (record[field] as string).trim().length < 12
    || (record[field] as string).trim().length > 700)) {
    throw new Error("Visual direction response contains an invalid text field length");
  }
  if (!['Living Still', 'Living Tapestry'].includes(record.visualMode as string)
    || !['quiet', 'balanced', 'immersive'].includes(record.visualEnergy as string)) {
    throw new Error("Visual direction response contains an invalid mode or energy");
  }
  const crop = record.cropPlan as Record<string, unknown> | null;
  if (!crop || typeof crop !== "object" || Array.isArray(crop)
    || !exactKeys(crop, ["masterAspectRatio", "upperQuietPercent", "centralSafePercent", "lowerNonessentialPercent"])
    || crop.masterAspectRatio !== "3:4" || crop.upperQuietPercent !== 18 || crop.centralSafePercent !== 70
    || typeof crop.lowerNonessentialPercent !== "number" || crop.lowerNonessentialPercent < 12
    || crop.lowerNonessentialPercent > 15) {
    throw new Error("Visual direction response contains an invalid crop plan");
  }
  if (!Array.isArray(record.prohibitedImplications) || record.prohibitedImplications.length < 1
    || record.prohibitedImplications.length > 8
    || record.prohibitedImplications.some((item) => typeof item !== "string"
      || item.trim().length < 8 || item.trim().length > 500)) {
    throw new Error("Visual direction response contains invalid prohibited implications");
  }
  if (!Array.isArray(record.optionalForms) || record.optionalForms.length > 5) {
    throw new Error("Visual direction response contains invalid optional forms");
  }
  const optionalForms = record.optionalForms.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)
      || !exactKeys(item as Record<string, unknown>, ["form", "relationalRole", "necessity"])) {
      throw new Error("Visual direction response contains an invalid optional form");
    }
    const form = item as Record<string, unknown>;
    if (typeof form.form !== "string" || form.form.trim().length < 3 || form.form.trim().length > 120
      || typeof form.relationalRole !== "string" || form.relationalRole.trim().length < 8
      || form.relationalRole.trim().length > 400 || typeof form.necessity !== "string"
      || form.necessity.trim().length < 8 || form.necessity.trim().length > 400) {
      throw new Error("Visual direction response contains an invalid optional form");
    }
    return {
      form: (form.form as string).trim(),
      relationalRole: (form.relationalRole as string).trim(),
      necessity: (form.necessity as string).trim(),
    };
  });
  const text = (field: typeof stringFields[number]): string => (record[field] as string).trim();
  return {
    visualMode: text("visualMode") as VisualMode,
    visualEnergy: text("visualEnergy") as VisualEnergy,
    visualWorld: text("visualWorld"),
    dominantRelationship: text("dominantRelationship"),
    spatialBehavior: text("spatialBehavior"),
    structuralContinuity: text("structuralContinuity"),
    materialLanguage: text("materialLanguage"),
    depthStrategy: text("depthStrategy"),
    focalPath: text("focalPath"),
    silhouettePlan: text("silhouettePlan"),
    cropPlan: crop as unknown as VisualDirection["cropPlan"],
    colorStrategy: text("colorStrategy"),
    lightingStrategy: text("lightingStrategy"),
    uncertaintyTreatment: text("uncertaintyTreatment"),
    prohibitedImplications: (record.prohibitedImplications as string[]).map((item) => item.trim()),
    optionalForms,
  };
}

function supportsConnectedSystems(input: VisualDirectionInput): boolean {
  const text = `${input.editorialThesis} ${input.selectedCandidate.relationship} ${input.selectedCandidate.editorialTension} ${input.selectedCandidate.metaphorFamily} ${input.selectedCandidate.whyItFitsThesis}`;
  return CONNECTED_SYSTEMS.test(text);
}

function repeatsRecentWorld(direction: VisualDirection, previous: PreviousCoverSummary): boolean {
  return normalize(direction.visualWorld) === normalize(previous.visualWorld)
    || jaccard(tokens(direction.visualWorld), tokens(previous.visualWorld)) >= 0.52;
}

function foundingCopyCount(directionText: string): number {
  return FOUNDING_COPY_MOTIFS.filter((pattern) => pattern.test(directionText)).length;
}

export function validateVisualDirection(
  input: VisualDirectionInput,
  rawDirection: unknown,
): { direction: VisualDirection; validation: VisualDirectionValidation } {
  const normalizedInput = buildVisualDirectionRequest(input).input;
  const direction = parseDirection(rawDirection);
  const errors: string[] = [];
  const warnings: string[] = [];
  const connected = supportsConnectedSystems(normalizedInput);
  const candidateText = `${normalizedInput.editorialThesis} ${normalizedInput.selectedCandidate.relationship} ${normalizedInput.selectedCandidate.editorialTension} ${normalizedInput.selectedCandidate.metaphorFamily}`;
  const directionText = DIRECTION_FIELDS
    .filter((field) => !["cropPlan", "prohibitedImplications"].includes(field))
    .map((field) => JSON.stringify(direction[field]))
    .join(" ");
  const mechanismText = `${direction.visualWorld} ${direction.dominantRelationship} ${direction.spatialBehavior} ${direction.structuralContinuity} ${direction.focalPath} ${direction.optionalForms.map((form) => `${form.relationalRole} ${form.necessity}`).join(" ")}`;

  if (direction.visualMode === "Living Tapestry" && (!connected || normalizedInput.themeConfidence === "low")) {
    errors.push("living_tapestry_unjustified");
  }
  if (connected && normalizedInput.themeConfidence !== "low" && direction.visualMode !== "Living Tapestry") {
    errors.push("connected_systems_require_living_tapestry");
  }
  if (direction.visualMode === "Living Still" && normalizedInput.themeConfidence !== "low"
    && !LIVING_STILL_JUSTIFICATION.test(candidateText)) {
    errors.push("living_still_unjustified");
  }
  if (normalizedInput.themeConfidence === "low"
    && (direction.visualMode !== "Living Still" || direction.visualEnergy !== "quiet")) {
    errors.push("low_confidence_requires_quiet_living_still");
  }
  if (direction.visualEnergy === "immersive" && normalizedInput.themeConfidence === "low") {
    errors.push("low_confidence_immersive_energy");
  }

  if (OBJECT_FIRST_LANGUAGE.test(directionText)) errors.push("object_first_leakage");
  if (DEFAULT_STILL_LIFE_OBJECTS.test(directionText)) errors.push("default_still_life_object_family");
  if (GENERIC_STILL_LIFE.test(directionText)
    || (direction.visualMode === "Living Still" && /\bstill[ -]life\b/i.test(direction.visualWorld)
      && !CONTINUITY_LANGUAGE.test(`${direction.dominantRelationship} ${direction.spatialBehavior}`))) {
    errors.push("generic_tasteful_still_life");
  }
  if (THRESHOLD_LANGUAGE.test(directionText) && !THRESHOLD_LANGUAGE.test(candidateText)) {
    errors.push("unjustified_threshold_default");
  }
  if (direction.optionalForms.length > (normalizedInput.themeConfidence === "low" ? 5 : 3)
    || direction.optionalForms.some((form) => form.form.split(/,|\band\b/i).filter((part) => part.trim()).length > 2)) {
    errors.push("over_prescriptive_object_inventory");
  }

  if (!CONTINUITY_LANGUAGE.test(direction.structuralContinuity)) errors.push("missing_structural_continuity");
  if (!SILHOUETTE_LANGUAGE.test(direction.silhouettePlan)
    || (WEAK_SILHOUETTE.test(direction.silhouettePlan) && !/\b(?:macro|distinct|legible|recognizable|clear)\b/i.test(direction.silhouettePlan))) {
    errors.push("weak_thumbnail_silhouette");
  }
  if (overlap(tokens(direction.dominantRelationship), tokens(`${normalizedInput.selectedCandidate.relationship} ${normalizedInput.selectedCandidate.editorialTension}`)) === 0) {
    errors.push("dominant_relationship_not_grounded");
  }

  const sharedMechanismProhibited = /shared (?:biological )?mechanism|common pathway|causal/i
    .test(normalizedInput.selectedCandidate.whatItMustNotImply);
  if ((normalizedInput.themeConfidence === "low" || sharedMechanismProhibited) && SHARED_MECHANISM.test(mechanismText)) {
    errors.push("unsupported_shared_mechanism");
  }
  if (normalizedInput.themeConfidence === "low"
    && !/\b(?:separate|separation|distinct|unconnected|independent|no connection)\b/i.test(direction.structuralContinuity)) {
    errors.push("low_confidence_connections_not_separated");
  }

  if (!CANONICAL_LIGHT.test(direction.lightingStrategy) || !UPPER_LEFT.test(direction.lightingStrategy)) {
    errors.push("noncanonical_lighting_strategy");
  }
  if (!COLOR_CONTROL.test(direction.colorStrategy)) errors.push("uncontrolled_color_strategy");
  if (PROVIDER_LANGUAGE.test(directionText)) errors.push("provider_specific_direction");
  if (foundingCopyCount(directionText) >= 2) errors.push("founding_cover_copy");

  const prohibitedTokens = tokens(direction.prohibitedImplications.join(" "));
  if (overlap(prohibitedTokens, tokens(normalizedInput.selectedCandidate.whatItMustNotImply)) === 0) {
    errors.push("prohibited_implications_incomplete");
  }

  normalizedInput.previousCovers.forEach((cover) => {
    if (repeatsRecentWorld(direction, cover)) warnings.push(`repeated_recent_visual_world:${cover.id}`);
  });

  const validation = { passed: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
  return { direction, validation };
}

export async function generateVisualDirection(
  input: VisualDirectionInput,
  generate: VisualDirectionGenerator,
): Promise<{ direction: VisualDirection; validation: VisualDirectionValidation }> {
  const request = buildVisualDirectionRequest(input);
  const raw = await generate(request);
  const result = validateVisualDirection(request.input, raw);
  if (!result.validation.passed) {
    throw new Error(`Visual direction validation failed: ${result.validation.errors.join(", ")}`);
  }
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
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(buildAnthropicVisualDirectionRequest(input, model)),
  });
  if (!response.ok) throw new Error(`Anthropic visual direction request failed with HTTP ${response.status}`);
  const payload = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const text = payload.content?.find((block) => block.type === "text")?.text;
  if (typeof text !== "string") throw new Error("Anthropic returned no structured visual direction");
  return generateVisualDirection(input, async () => text);
}

export function selectCandidateFromPhase4AResult(candidateId: string, value: unknown): CoverMetaphorCandidate {
  const id = requireText(candidateId, "candidateId");
  const payload = typeof value === "string" ? parsePayload(value) : value;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Phase 4A candidate input must be an object");
  }
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.candidates)) {
    const match = record.candidates.find((item) => item && typeof item === "object"
      && !Array.isArray(item) && (item as Record<string, unknown>).candidateId === id) as Record<string, unknown> | undefined;
    if (!match) throw new Error(`Phase 4A candidate ${id} was not found`);
    return cleanCandidate((match.candidate ?? match) as CoverMetaphorCandidate);
  }
  if (record.candidateId && record.candidateId !== id) throw new Error(`Phase 4A candidate ${id} was not found`);
  return cleanCandidate((record.candidate ?? record) as CoverMetaphorCandidate);
}
