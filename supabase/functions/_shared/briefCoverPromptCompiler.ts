import type { CoverStoryExtraction, CoverVisualConcept } from "./briefCoverConcept.ts";
import type { GovernanceDocument, VisualDirection, VisualFamily } from "./briefCoverDirection.ts";

export const GPT_IMAGE_2_PROMPT_VERSION = 2;
export const GPT_IMAGE_2_PROMPT_MIN_WORDS = 170;
export const GPT_IMAGE_2_PROMPT_MAX_WORDS = 260;

export interface CoverPromptCompilerInput {
  coverStory: CoverStoryExtraction;
  selectedConcept: CoverVisualConcept;
  visualDirection: VisualDirection;
  artBible: GovernanceDocument;
  foundingCoverDna: GovernanceDocument;
}
export interface GptImage2ProviderParameters {
  model: "gpt-image-2"; n: 1; size: "1152x1536"; width: 1152; height: 1536;
  quality: "medium"; outputFormat: "png"; externalRetry: false;
}
export interface CompiledCoverPrompt {
  finalPrompt: string;
  exclusionPrompt: string;
  providerParameters: GptImage2ProviderParameters;
  promptWordCount: number;
  promptVersion: number;
  selectedVisualFamily: VisualFamily;
}
export interface GptImage2CompiledRequest {
  model: "gpt-image-2"; prompt: string; n: 1; size: "1152x1536"; quality: "medium"; output_format: "png";
}
export interface CoverPromptValidation { passed: boolean; errors: string[]; warnings: string[] }

export const GPT_IMAGE_2_PROVIDER_PARAMETERS: GptImage2ProviderParameters = {
  model: "gpt-image-2", n: 1, size: "1152x1536", width: 1152, height: 1536,
  quality: "medium", outputFormat: "png", externalRetry: false,
};

const STOP_WORDS = new Set([
  "about", "after", "again", "against", "also", "among", "because", "before", "being", "between",
  "could", "does", "each", "from", "have", "into", "itself", "more", "must", "only", "other", "over",
  "same", "should", "than", "that", "their", "there", "these", "they", "this", "those", "through", "under",
  "very", "what", "when", "where", "which", "while", "with", "without", "would",
]);
const DEFAULT_STILL_PROPS = /\b(?:bowls?|vessels?|stones?|linen|seeds?|seed pods?|tabletops?|paper sheets?|anomalous shadows?)\b/i;
const GENERIC_ARCHITECTURE = /\b(?:generic (?:planes?|blocks?|corridors?|geometry)|monumental void|fashionable abstraction|modernist pavilion)\b/i;
const PROVIDER_SYNTAX = /(?:--ar\b|--style\b|\bcfg(?: scale)?\b|\bsampler\b|\bseed(?: value)?\s*[:=]|\bnegative prompt\b|\bprompt weight\b|\bgpt-image\b|\bopenai\b|\bmidjourney\b|\bstable diffusion\b)/i;
const FOUNDING_COPY_MOTIFS = [
  /\b(?:s-shaped|serpentine) vertical (?:path|column|silhouette)\b/i,
  /\bnear-black (?:field|ground|background)\b/i,
  /\bwarm central (?:nexus|hinge|core)\b/i,
  /\b(?:pale )?upper-right (?:mass|lobe)\b/i,
  /\bdense lower-left (?:field|lobe|ecosystem)\b/i,
  /\bgut[-– ]heart[-– ]brain\b/i,
];

function normalizeWhitespace(value: string): string { return value.replace(/\s+/g, " ").trim(); }
function normalize(value: string): string { return normalizeWhitespace(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function words(value: string): string[] { return normalizeWhitespace(value).split(" ").filter(Boolean); }
export function countPromptWords(value: string): number { return words(value).length; }
function clipWords(value: string, maximum: number): string {
  const source = words(value.replace(/^[A-Z][A-Za-z ]+:\s*/, ""));
  if (source.length <= maximum) return source.join(" ").replace(/[,:;.]+$/, "");
  let end = maximum;
  for (let index = maximum; index < Math.min(source.length, maximum + 3); index += 1) {
    if (/[,:;.!?]$/.test(source[index])) { end = index + 1; break; }
  }
  const dangling = new Set(["a", "an", "and", "at", "by", "from", "in", "into", "more", "of", "on", "or", "the", "their", "through", "to", "while", "with"]);
  const result = source.slice(0, end);
  while (result.length > 1 && dangling.has(result.at(-1)?.toLowerCase().replace(/[^a-z]/g, "") ?? "")) result.pop();
  return result.join(" ").replace(/[,:;.]+$/, "");
}
function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter((token) => token.length >= 4 && !STOP_WORDS.has(token)));
}
function overlap(left: Set<string>, right: Set<string>): number { let n = 0; for (const token of left) if (right.has(token)) n += 1; return n; }
function requireText(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must not be empty`);
  return normalizeWhitespace(value);
}
function sentence(value: string): string {
  const clean = normalizeWhitespace(value).replace(/[.]+$/, "");
  return `${clean}.`;
}
function foundingCopyCount(value: string): number { return FOUNDING_COPY_MOTIFS.filter((pattern) => pattern.test(value)).length; }

function familySection(direction: VisualDirection): string {
  switch (direction.selectedVisualFamily) {
    case "Living Tapestry":
      return "Living Tapestry: one continuous visual language for integrated organic systems, macro-to-micro transitions, transformed symbolic biology, and scientific linework embedded in material texture. Keep disciplined detail with Nature, Scientific American, NYT Science, and Guardian Science sensibility.";
    case "Landscape":
      return `Landscape: the environmental event maps directly to the finding—${sentence(clipWords(direction.visualEvent, 15))} Terrain, flow, accumulation, recovery, or divergence must carry the science, not merely provide scenery.`;
    case "Architecture":
      return `Architecture: this named scientific structural relationship governs the space—${sentence(clipWords(direction.dominantScientificRelationship, 10))} Every barrier, compartment, threshold, or scaffold must perform it; reject generic planes, blocks, corridors, monumental voids, and fashionable abstraction.`;
    case "Living Still":
      return `Living Still: this physical relationship is uniquely appropriate—${sentence(clipWords(direction.familyJustification, 15))} Use one restrained material event, not a tasteful arrangement; reject bowls, vessels, tabletops, and generic props unless scientifically required.`;
  }
}

function optionalFormsLine(direction: VisualDirection): string | null {
  if (direction.optionalForms.length === 0) return null;
  return `Derive forms last and use only if necessary: ${direction.optionalForms.map((form) => clipWords(form, 7)).join("; ")}.`;
}

function buildExclusionPrompt(input: CoverPromptCompilerInput): string {
  const claims = [
    ...input.coverStory.prohibitedClaims,
    ...input.selectedConcept.prohibitedImplications,
    ...input.visualDirection.prohibitedImplications,
  ];
  const unique = [...new Map(claims.map((claim) => [normalize(claim), claim])).values()];
  return [
    "No text, labels, numbers, logo, signature, watermark, literal anatomy, medical infographic, stock wellness imagery, neon, glossy 3D, or decorative AI abstraction.",
    "Do not copy the founding gut–heart–brain arrangement, ground, or palette.",
    `Do not imply ${clipWords(unique[0] ?? input.coverStory.principalUncertainty, 12).replace(/^(?:the|that)\s+/i, "")}.`,
  ].join(" ");
}

function buildPrompt(input: CoverPromptCompilerInput, exclusionPrompt: string): string {
  const direction = input.visualDirection;
  const optionalForms = optionalFormsLine(direction);
  const sections = [
    `Scientific visual story: ${sentence(clipWords(input.coverStory.visualStorySentence, 22))}`,
    `Scientific anchor: ${sentence(clipWords(input.selectedConcept.scientificAnchor, 10))} Relationship: ${sentence(clipWords(direction.dominantScientificRelationship, 14))}`,
    familySection(direction),
    `Visual world: ${sentence(clipWords(direction.visualWorld, 9))} Event: ${sentence(clipWords(direction.visualEvent, 10))}`,
    `Silhouette: ${sentence(clipWords(direction.silhouettePlan, 8))} Close-view discovery: ${sentence(clipWords(direction.microDetailLanguage, 8))}`,
    `Finish: ${sentence(clipWords(direction.materialLanguage, 6))} ${sentence(clipWords(direction.colorStrategy, 6))} ${sentence(clipWords(direction.lightingStrategy, 7))}`,
    `Evidence limitation: ${sentence(clipWords(input.coverStory.principalUncertainty, 14))} Visual uncertainty: ${sentence(clipWords(direction.uncertaintyTreatment, 9))}`,
    ...(optionalForms ? [optionalForms] : []),
    "Portrait 3:4. Keep upper 18% quiet, meaning in central 70%, lower 12–15% nonessential. Hand-painted gouache, translucent glaze, cold-press tooth, dry brush; symbolic rather than textbook science.",
    `Exclusions: ${exclusionPrompt}`,
  ];
  return sections.join("\n\n");
}

export function validateCompiledCoverPrompt(input: CoverPromptCompilerInput, compiled: CompiledCoverPrompt): CoverPromptValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const finalPrompt = normalizeWhitespace(compiled.finalPrompt);
  const exclusionPrompt = normalizeWhitespace(compiled.exclusionPrompt);
  if (compiled.promptWordCount !== countPromptWords(finalPrompt)) errors.push("prompt_word_count_mismatch");
  if (compiled.promptWordCount > GPT_IMAGE_2_PROMPT_MAX_WORDS) errors.push("prompt_too_long");
  if (compiled.promptWordCount < GPT_IMAGE_2_PROMPT_MIN_WORDS) errors.push("prompt_too_short");
  if (!finalPrompt.startsWith("Scientific visual story:")) errors.push("scientific_story_not_first");
  if (overlap(tokens(finalPrompt.slice(0, 500)), tokens(input.coverStory.visualStorySentence)) < 2) errors.push("missing_visual_story");
  if (overlap(tokens(finalPrompt), tokens(`${input.selectedConcept.scientificAnchor} ${input.visualDirection.dominantScientificRelationship}`)) < 2) {
    errors.push("missing_article_specific_science");
  }
  if (!/Evidence limitation:/i.test(finalPrompt) || overlap(tokens(exclusionPrompt), tokens(input.coverStory.prohibitedClaims.join(" "))) < 1) {
    errors.push("missing_uncertainty_or_prohibited_implications");
  }
  if (input.visualDirection.selectedVisualFamily === "Living Tapestry"
    && !/continuous visual language/i.test(finalPrompt)) errors.push("missing_living_tapestry_branch");
  if (input.visualDirection.selectedVisualFamily === "Landscape"
    && !/maps directly to the finding/i.test(finalPrompt)) errors.push("missing_landscape_mapping");
  if (input.visualDirection.selectedVisualFamily === "Architecture"
    && (!/named scientific structural relationship/i.test(finalPrompt) || GENERIC_ARCHITECTURE.test(input.visualDirection.visualWorld))) {
    errors.push("invalid_architecture_branch");
  }
  if (input.visualDirection.selectedVisualFamily === "Living Still"
    && !/physical relationship is uniquely appropriate/i.test(finalPrompt)) errors.push("missing_living_still_proof");
  if (DEFAULT_STILL_PROPS.test(finalPrompt) && input.visualDirection.selectedVisualFamily !== "Living Still") {
    errors.push("accidental_still_life_default");
  }
  if (PROVIDER_SYNTAX.test(`${finalPrompt} ${exclusionPrompt}`)) errors.push("provider_syntax_leakage");
  if (foundingCopyCount(finalPrompt) >= 2) errors.push("founding_cover_copy");
  if (!/upper 18%/i.test(finalPrompt) || !/central 70%/i.test(finalPrompt) || !/lower 12[–-]15%/i.test(finalPrompt)) {
    errors.push("missing_crop_safe_guidance");
  }
  if (!/no text/i.test(exclusionPrompt) || !/logo/i.test(exclusionPrompt) || !/watermark/i.test(exclusionPrompt)) {
    errors.push("typography_or_logo_risk");
  }
  if (compiled.providerParameters.model !== "gpt-image-2" || compiled.providerParameters.n !== 1
    || compiled.providerParameters.size !== "1152x1536" || compiled.providerParameters.width !== 1152
    || compiled.providerParameters.height !== 1536 || compiled.providerParameters.quality !== "medium"
    || compiled.providerParameters.outputFormat !== "png" || compiled.providerParameters.externalRetry !== false) {
    errors.push("invalid_provider_parameters");
  }
  if (compiled.promptVersion !== GPT_IMAGE_2_PROMPT_VERSION) errors.push("invalid_prompt_version");
  return { passed: errors.length === 0, errors: [...new Set(errors)], warnings };
}

export function compileGptImage2CoverPrompt(input: CoverPromptCompilerInput): { compiled: CompiledCoverPrompt; validation: CoverPromptValidation } {
  requireText(input.coverStory.visualStorySentence, "coverStory.visualStorySentence");
  requireText(input.selectedConcept.scientificAnchor, "selectedConcept.scientificAnchor");
  requireText(input.visualDirection.selectedVisualFamily, "visualDirection.selectedVisualFamily");
  requireText(input.artBible.version, "artBible.version");
  requireText(input.artBible.content, "artBible.content");
  requireText(input.foundingCoverDna.version, "foundingCoverDna.version");
  requireText(input.foundingCoverDna.content, "foundingCoverDna.content");
  const exclusionPrompt = buildExclusionPrompt(input);
  const finalPrompt = buildPrompt(input, exclusionPrompt);
  const compiled: CompiledCoverPrompt = {
    finalPrompt,
    exclusionPrompt,
    providerParameters: { ...GPT_IMAGE_2_PROVIDER_PARAMETERS },
    promptWordCount: countPromptWords(finalPrompt),
    promptVersion: GPT_IMAGE_2_PROMPT_VERSION,
    selectedVisualFamily: input.visualDirection.selectedVisualFamily,
  };
  const validation = validateCompiledCoverPrompt(input, compiled);
  if (!validation.passed) throw new Error(`Cover prompt validation failed (${compiled.promptWordCount} words): ${validation.errors.join(", ")}`);
  return { compiled, validation };
}

export function buildGptImage2CompiledRequest(compiled: CompiledCoverPrompt): GptImage2CompiledRequest {
  return {
    model: compiled.providerParameters.model,
    prompt: compiled.finalPrompt,
    n: compiled.providerParameters.n,
    size: compiled.providerParameters.size,
    quality: compiled.providerParameters.quality,
    output_format: compiled.providerParameters.outputFormat,
  };
}
