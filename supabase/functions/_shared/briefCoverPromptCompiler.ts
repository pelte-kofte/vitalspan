import type { CoverMetaphorCandidate } from "./briefCoverConcept.ts";
import type { GovernanceDocument, VisualDirection } from "./briefCoverDirection.ts";

export const GPT_IMAGE_2_PROMPT_VERSION = 1;
export const GPT_IMAGE_2_PROMPT_MIN_WORDS = 160;
export const GPT_IMAGE_2_PROMPT_MAX_WORDS = 260;

export interface CoverPromptCompilerInput {
  selectedCandidate: CoverMetaphorCandidate;
  visualDirection: VisualDirection;
  artBible: GovernanceDocument;
  foundingCoverDna: GovernanceDocument;
  editorialThesis: string;
  themeConfidence: "high" | "medium" | "low";
  prohibitedImplications: string[];
}

export interface GptImage2ProviderParameters {
  model: "gpt-image-2";
  n: 1;
  size: "1152x1536";
  width: 1152;
  height: 1536;
  quality: "medium";
  outputFormat: "png";
  externalRetry: false;
}

export interface CompiledCoverPrompt {
  finalPrompt: string;
  exclusionPrompt: string;
  providerParameters: GptImage2ProviderParameters;
  promptWordCount: number;
  promptVersion: number;
}

export interface GptImage2CompiledRequest {
  model: "gpt-image-2";
  prompt: string;
  n: 1;
  size: "1152x1536";
  quality: "medium";
  output_format: "png";
}

export interface CoverPromptValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export const GPT_IMAGE_2_PROVIDER_PARAMETERS: GptImage2ProviderParameters = {
  model: "gpt-image-2",
  n: 1,
  size: "1152x1536",
  width: 1152,
  height: 1536,
  quality: "medium",
  outputFormat: "png",
  externalRetry: false,
};

const STOP_WORDS = new Set([
  "about", "after", "again", "against", "also", "among", "because", "before", "being", "between",
  "could", "does", "each", "from", "have", "into", "itself", "more", "must", "only", "other", "over",
  "same", "should", "than", "that", "their", "there", "these", "they", "this", "those", "through", "under",
  "very", "what", "when", "where", "which", "while", "with", "without", "would",
]);

const DEFAULT_OBJECTS = /\b(?:bowls?|vessels?|stones?|linen|seeds?|seed pods?|tabletops?|sills?)\b/i;
const PROVIDER_SYNTAX = /(?:--ar\b|--style\b|\bcfg(?: scale)?\b|\bsampler\b|\bseed(?: value)?\s*[:=]|\bnegative prompt\b|\bprompt weight\b|\bgpt-image\b|\bopenai\b|\bmidjourney\b|\bstable diffusion\b)/i;
const FOUNDING_COPY_MOTIFS = [
  /\b(?:s-shaped|serpentine) vertical (?:path|column|silhouette)\b/i,
  /\bnear-black (?:field|ground|background)\b/i,
  /\bwarm central (?:nexus|hinge|core)\b/i,
  /\b(?:pale )?upper-right (?:mass|lobe)\b/i,
  /\bdense lower-left (?:field|lobe|ecosystem)\b/i,
  /\bbroad botanical counterforms?\b/i,
  /\bgut[-– ]heart[-– ]brain\b/i,
];

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalize(value: string): string {
  return normalizeWhitespace(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function words(value: string): string[] {
  return normalizeWhitespace(value).split(" ").filter(Boolean);
}

export function countPromptWords(value: string): number {
  return words(value).length;
}

function clipWords(value: string, maximum: number): string {
  const source = words(value.replace(/^[A-Z][A-Za-z ]+:\s*/, ""));
  if (source.length <= maximum) return source.join(" ").replace(/[,:;.]+$/, "");
  return `${source.slice(0, maximum).join(" ").replace(/[,:;.]+$/, "")}…`;
}

function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter((token) => token.length >= 4 && !STOP_WORDS.has(token)));
}

function overlap(left: Set<string>, right: Set<string>): number {
  let count = 0;
  for (const token of left) if (right.has(token)) count += 1;
  return count;
}

function requireText(value: string, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must not be empty`);
  return normalizeWhitespace(value);
}

function sentence(value: string): string {
  const clean = normalizeWhitespace(value).replace(/[.]+$/, "");
  return clean.endsWith("…") ? clean : `${clean}.`;
}

function uniqueImplications(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const clean = requireText(value, "prohibitedImplication");
    const key = normalize(clean);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(clean);
  }
  return output;
}

function optionalFormsLine(direction: VisualDirection): string | null {
  if (direction.optionalForms.length === 0) return null;
  const forms = direction.optionalForms.map((form) => {
    const name = clipWords(form.form, 6);
    const role = clipWords(form.relationalRole, 10);
    return `${name}, only to ${role.charAt(0).toLowerCase()}${role.slice(1)}`;
  });
  return `Optional forms, derived last: ${forms.join("; ")}. Add nothing else.`;
}

function buildExclusionPrompt(input: CoverPromptCompilerInput): string {
  const implications = uniqueImplications([
    input.selectedCandidate.whatItMustNotImply,
    ...input.visualDirection.prohibitedImplications,
    ...input.prohibitedImplications,
  ]).slice(0, 1).map((value) => clipWords(value
    .replace(/^(?:it\s+)?(?:must|do) not imply\s*/i, "")
    .replace(/^that\s+/i, ""), 12));
  return [
    "No text, logos, watermark, medical UI, wellness clichés, neon, glossy 3D, or literal anatomy.",
    "Do not copy the founding gut–heart–brain arrangement, S-path, dark ground, or palette.",
    `Do not imply ${implications.join("; ")}.`,
  ].join(" ");
}

function buildCreativeSections(input: CoverPromptCompilerInput): string[] {
  const direction = input.visualDirection;
  const formLine = optionalFormsLine(direction);
  return [
    `Create a 3:4 Vitalspan cover: ${direction.visualMode}, ${direction.visualEnergy} energy.`,
    `Editorial relationship: ${sentence(clipWords(direction.dominantRelationship, 22))}`,
    `Visual world: ${sentence(clipWords(direction.visualWorld, 24))}`,
    `Structural continuity: ${sentence(clipWords(direction.structuralContinuity, 22))}`,
    `Thumbnail hierarchy: ${sentence(clipWords(direction.silhouettePlan, 20))}`,
    `Material and scientific texture: ${sentence(clipWords(direction.materialLanguage, 18))}`,
    `Color and light: ${sentence(clipWords(direction.colorStrategy, 16))} ${sentence(clipWords(direction.lightingStrategy, 17))}`,
    `Uncertainty: ${sentence(clipWords(direction.uncertaintyTreatment, 22))}`,
    ...(formLine ? [formLine] : []),
    "Keep upper 18% quiet, essential meaning in the central 70%, and the lower 12–15% nonessential.",
    "Use one continuous visual language, strong macro structure, layered depth, symbolic rather than literal biology, scientific texture, a memorable silhouette, and Nature / FT Weekend editorial sensibility—without copying founding motifs.",
  ];
}

function trimCreativeSections(sections: string[], exclusionPrompt: string): string[] {
  const output = [...sections];
  if (countPromptWords(`${output.join("\n\n")}\n\nExclusions: ${exclusionPrompt}`) > GPT_IMAGE_2_PROMPT_MAX_WORDS) {
    throw new Error("Visual direction cannot be compiled within the 260-word prompt limit");
  }
  return output;
}

function objectNouns(input: CoverPromptCompilerInput): Set<string> {
  const nouns = new Set(["bowl", "vessel", "stone", "linen", "seed", "tabletop", "sill"]);
  input.visualDirection.optionalForms.forEach((form) => {
    const formWords = normalize(form.form).split(" ").filter(Boolean);
    if (formWords.length > 0) nouns.add(formWords.at(-1) as string);
  });
  return nouns;
}

function repeatedObjectNouns(input: CoverPromptCompilerInput, prompt: string): string[] {
  const promptWords = normalize(prompt).split(" ");
  return [...objectNouns(input)].filter((noun) => promptWords.filter((word) => word === noun || word === `${noun}s`).length > 1);
}

function foundingCopyCount(value: string): number {
  return FOUNDING_COPY_MOTIFS.filter((pattern) => pattern.test(value)).length;
}

export function validateCompiledCoverPrompt(
  input: CoverPromptCompilerInput,
  compiled: CompiledCoverPrompt,
): CoverPromptValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const finalPrompt = normalizeWhitespace(compiled.finalPrompt);
  const exclusionPrompt = normalizeWhitespace(compiled.exclusionPrompt);
  const relationshipIndex = finalPrompt.indexOf("Editorial relationship:");
  const formsIndex = finalPrompt.indexOf("Optional forms, derived last:");

  if (compiled.promptWordCount !== countPromptWords(finalPrompt)) errors.push("prompt_word_count_mismatch");
  if (compiled.promptWordCount > GPT_IMAGE_2_PROMPT_MAX_WORDS) errors.push("prompt_too_long");
  if (compiled.promptWordCount < GPT_IMAGE_2_PROMPT_MIN_WORDS) warnings.push("prompt_below_target");
  if (repeatedObjectNouns(input, finalPrompt).length > 0) errors.push("repeated_object_nouns");
  if (relationshipIndex < 0 || (formsIndex >= 0 && formsIndex < relationshipIndex)) errors.push("object_first_ordering");
  if (DEFAULT_OBJECTS.test(finalPrompt)
    && !input.visualDirection.optionalForms.some((form) => DEFAULT_OBJECTS.test(form.form))) {
    errors.push("accidental_still_life_default");
  }

  const relationshipTokens = tokens(`${input.selectedCandidate.relationship} ${input.visualDirection.dominantRelationship}`);
  if (relationshipIndex < 0 || overlap(tokens(finalPrompt), relationshipTokens) < 2) {
    errors.push("missing_dominant_relationship");
  }
  if (!/\bUncertainty:/i.test(finalPrompt)
    || overlap(tokens(exclusionPrompt), tokens(input.selectedCandidate.whatItMustNotImply)) === 0) {
    errors.push("missing_uncertainty_or_prohibited_implications");
  }
  if (PROVIDER_SYNTAX.test(`${finalPrompt} ${exclusionPrompt}`)) errors.push("provider_syntax_leakage");

  const exclusionDirectives = exclusionPrompt.match(/\b(?:no|do not|never|avoid)\b/gi)?.length ?? 0;
  if (countPromptWords(exclusionPrompt) > 95 || exclusionDirectives > 12
    || countPromptWords(exclusionPrompt) > compiled.promptWordCount * 0.45) {
    errors.push("excessive_exclusions");
  }
  if (foundingCopyCount(finalPrompt) >= 2) errors.push("founding_cover_copy");
  if (!/upper 18%/i.test(finalPrompt) || !/central 70%/i.test(finalPrompt)
    || !/lower 12[–-]15%/i.test(finalPrompt)) {
    errors.push("missing_crop_safe_guidance");
  }
  if (!/no text/i.test(exclusionPrompt) || !/logos?/i.test(exclusionPrompt)
    || !/watermark/i.test(exclusionPrompt)) {
    errors.push("typography_or_logo_risk");
  }
  if (compiled.providerParameters.model !== "gpt-image-2" || compiled.providerParameters.n !== 1
    || compiled.providerParameters.size !== "1152x1536" || compiled.providerParameters.width !== 1152
    || compiled.providerParameters.height !== 1536 || compiled.providerParameters.quality !== "medium"
    || compiled.providerParameters.outputFormat !== "png" || compiled.providerParameters.externalRetry !== false) {
    errors.push("invalid_provider_parameters");
  }
  if (compiled.promptVersion !== GPT_IMAGE_2_PROMPT_VERSION) errors.push("invalid_prompt_version");

  return { passed: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

export function compileGptImage2CoverPrompt(input: CoverPromptCompilerInput): {
  compiled: CompiledCoverPrompt;
  validation: CoverPromptValidation;
} {
  requireText(input.editorialThesis, "editorialThesis");
  requireText(input.artBible.version, "artBible.version");
  requireText(input.artBible.content, "artBible.content");
  requireText(input.foundingCoverDna.version, "foundingCoverDna.version");
  requireText(input.foundingCoverDna.content, "foundingCoverDna.content");
  if (!["high", "medium", "low"].includes(input.themeConfidence)) {
    throw new Error("themeConfidence must be high, medium, or low");
  }
  const exclusionPrompt = buildExclusionPrompt(input);
  const creativeSections = trimCreativeSections(buildCreativeSections(input), exclusionPrompt);
  const finalPrompt = `${creativeSections.join("\n\n")}\n\nExclusions: ${exclusionPrompt}`;
  const compiled: CompiledCoverPrompt = {
    finalPrompt,
    exclusionPrompt,
    providerParameters: { ...GPT_IMAGE_2_PROVIDER_PARAMETERS },
    promptWordCount: countPromptWords(finalPrompt),
    promptVersion: GPT_IMAGE_2_PROMPT_VERSION,
  };
  const validation = validateCompiledCoverPrompt(input, compiled);
  if (!validation.passed) throw new Error(`Cover prompt validation failed: ${validation.errors.join(", ")}`);
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
