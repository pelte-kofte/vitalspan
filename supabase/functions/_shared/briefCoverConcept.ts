export const COVER_METAPHOR_MIN_CANDIDATES = 4;
export const COVER_METAPHOR_MAX_CANDIDATES = 6;
export const COVER_METAPHOR_RETURN_COUNT = 2;
export const COVER_METAPHOR_MODEL = "claude-sonnet-4-6";
export const COVER_METAPHOR_MAX_TOKENS = 1_400;
export const COVER_METAPHOR_ENDPOINT = "https://api.anthropic.com/v1/messages";

export const DEFAULT_COVER_CONCEPT_BOUNDARIES = [
  "The sources establish one shared biological mechanism.",
  "An association or preliminary signal establishes causation or certainty.",
  "The evidence supports a clinical recommendation.",
  "The findings generalize beyond the studied populations and designs.",
] as const;

export interface CoverConceptEvidence {
  sourcePhrase: string;
}

/**
 * Phase 4A input is editorial only. Visual direction fields are intentionally
 * absent so a provider cannot anchor on an object before metaphor selection.
 */
export interface CoverConceptInput {
  editorialThesis: string;
  themeConfidence: "high" | "medium" | "low";
  themeType: string;
  evidence: CoverConceptEvidence[];
  claimsNotImply: string[];
}

export interface CoverMetaphorCandidate {
  relationship: string;
  editorialTension: string;
  metaphorFamily: string;
  whyItFitsThesis: string;
  whatItMustNotImply: string;
}

export interface CoverMetaphorRequest {
  system: string;
  input: CoverConceptInput;
  outputSchema: Record<string, unknown>;
}

export interface AnthropicCoverMetaphorRequest {
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

export type CoverMetaphorGenerator = (request: CoverMetaphorRequest) => Promise<unknown>;

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

const VISUAL_DIRECTION_LANGUAGE = /\b(?:hero objects?|supporting objects?|supporting forms?|object inventory|composition|palette|physical world|lighting|camera|lens|gouache|watercolou?r|paper ground|tabletop|still[ -]life)\b/i;
const LEGACY_OBJECT_LANGUAGE = /\b(?:bowls?|vessels?|ceramics?|stones?|linen|seed pods?|threads?)\b/i;
const UNSUPPORTED_CERTAINTY = /\b(?:proves?|proven|guarantees?|cures?|reverses?|eliminates?|ensures?|definitive(?:ly)?|certain(?:ly)?)\b/i;

export const COVER_METAPHOR_SYSTEM_PROMPT = [
  "You are a senior editorial concept editor for Vitalspan.",
  "Begin from the approved editorial thesis and identify visible relationships, tensions, and unresolved conditions rather than physical props.",
  "Generate four to six thesis-grounded metaphor candidates and order them from strongest to weakest editorial argument.",
  "Each candidate must contain exactly relationship, editorialTension, metaphorFamily, whyItFitsThesis, and whatItMustNotImply.",
  "A metaphor family is an abstract relational pattern, not an object, scene, medium, or production direction.",
  "Do not choose or mention a hero object, supporting objects, composition, palette, physical world, lighting, camera, material, or named visual prop.",
  "Keep candidates meaningfully distinct. Preserve the thesis uncertainty and never imply a mechanism, causal claim, recommendation, certainty, or generalizability excluded by the input.",
  "Return strict structured data only.",
].join(" ");

export const COVER_METAPHOR_OUTPUT_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["candidates"],
  properties: {
    candidates: {
      type: "array",
      minItems: COVER_METAPHOR_MIN_CANDIDATES,
      maxItems: COVER_METAPHOR_MAX_CANDIDATES,
      items: {
        type: "object",
        additionalProperties: false,
        required: [...CANDIDATE_FIELDS],
        properties: {
          relationship: { type: "string", minLength: 8, maxLength: 500 },
          editorialTension: { type: "string", minLength: 8, maxLength: 500 },
          metaphorFamily: { type: "string", minLength: 3, maxLength: 80 },
          whyItFitsThesis: { type: "string", minLength: 8, maxLength: 500 },
          whatItMustNotImply: { type: "string", minLength: 8, maxLength: 500 },
        },
      },
    },
  },
};

function normalizedText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value: string): Set<string> {
  return new Set(normalizedText(value).split(" ").filter((token) => token.length >= 4 && !STOP_WORDS.has(token)));
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

function requireInputText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} must not be empty`);
  return trimmed;
}

export function buildCoverMetaphorRequest(input: CoverConceptInput): CoverMetaphorRequest {
  requireInputText(input.editorialThesis, "editorialThesis");
  requireInputText(input.themeType, "themeType");
  if (!["high", "medium", "low"].includes(input.themeConfidence)) {
    throw new Error("themeConfidence must be high, medium, or low");
  }
  if (!Array.isArray(input.evidence)
    || input.evidence.some((item) => !item || typeof item.sourcePhrase !== "string" || !item.sourcePhrase.trim())) {
    throw new Error("evidence must contain valid source phrases");
  }
  if (!Array.isArray(input.claimsNotImply) || input.claimsNotImply.length === 0
    || input.claimsNotImply.some((claim) => typeof claim !== "string" || !claim.trim())) {
    throw new Error("claimsNotImply must contain at least one editorial boundary");
  }
  return {
    system: COVER_METAPHOR_SYSTEM_PROMPT,
    input: {
      editorialThesis: input.editorialThesis.trim(),
      themeConfidence: input.themeConfidence,
      themeType: input.themeType.trim(),
      evidence: input.evidence.map(({ sourcePhrase }) => ({ sourcePhrase: sourcePhrase.trim() })),
      claimsNotImply: input.claimsNotImply.map((claim) => claim.trim()),
    },
    outputSchema: COVER_METAPHOR_OUTPUT_SCHEMA,
  };
}

export function buildAnthropicCoverMetaphorRequest(
  input: CoverConceptInput,
  model = COVER_METAPHOR_MODEL,
): AnthropicCoverMetaphorRequest {
  const request = buildCoverMetaphorRequest(input);
  return {
    model,
    max_tokens: COVER_METAPHOR_MAX_TOKENS,
    system: request.system,
    messages: [{ role: "user", content: JSON.stringify(request.input) }],
    output_config: {
      format: {
        type: "json_schema",
        schema: request.outputSchema,
      },
    },
  };
}

function parsePayload(payload: unknown): unknown {
  if (typeof payload !== "string") return payload;
  try {
    return JSON.parse(payload);
  } catch {
    throw new Error("Cover metaphor response must be valid JSON");
  }
}

function candidateFromUnknown(value: unknown): CoverMetaphorCandidate | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const expected = [...CANDIDATE_FIELDS].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) return null;
  if (CANDIDATE_FIELDS.some((field) => typeof record[field] !== "string")) return null;
  const candidate = Object.fromEntries(CANDIDATE_FIELDS.map((field) => [field, (record[field] as string).trim()])) as unknown as CoverMetaphorCandidate;
  if (candidate.metaphorFamily.length < 3 || candidate.metaphorFamily.length > 80) return null;
  if (CANDIDATE_FIELDS.filter((field) => field !== "metaphorFamily")
    .some((field) => candidate[field].length < 8 || candidate[field].length > 500)) return null;
  return candidate;
}

function isSafeAndGrounded(candidate: CoverMetaphorCandidate, input: CoverConceptInput): boolean {
  const conceptualText = [
    candidate.relationship,
    candidate.editorialTension,
    candidate.metaphorFamily,
    candidate.whyItFitsThesis,
  ].join(" ");
  const allText = `${conceptualText} ${candidate.whatItMustNotImply}`;
  if (VISUAL_DIRECTION_LANGUAGE.test(allText) || LEGACY_OBJECT_LANGUAGE.test(allText)) return false;
  if (UNSUPPORTED_CERTAINTY.test(conceptualText)) return false;

  const thesisTokens = tokens(input.editorialThesis);
  if (overlap(tokens(`${candidate.relationship} ${candidate.editorialTension} ${candidate.whyItFitsThesis}`), thesisTokens) === 0) {
    return false;
  }

  const boundaryTokens = tokens(input.claimsNotImply.join(" "));
  return overlap(tokens(candidate.whatItMustNotImply), boundaryTokens) > 0;
}

function candidateIdentity(candidate: CoverMetaphorCandidate): Set<string> {
  return tokens(`${candidate.relationship} ${candidate.editorialTension} ${candidate.metaphorFamily}`);
}

/**
 * Deterministic filtering never assigns an artistic score. The generator must
 * return strongest-first; this function removes unsafe/duplicate candidates and
 * returns the first two survivors, preserving that ranking.
 */
export function selectCoverMetaphorCandidates(
  input: CoverConceptInput,
  rawPayload: unknown,
): [CoverMetaphorCandidate, CoverMetaphorCandidate] {
  const request = buildCoverMetaphorRequest(input);
  const payload = parsePayload(rawPayload);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Cover metaphor response must be an object");
  }
  const topLevel = payload as Record<string, unknown>;
  if (Object.keys(topLevel).length !== 1 || !Array.isArray(topLevel.candidates)) {
    throw new Error("Cover metaphor response must contain only candidates");
  }
  if (topLevel.candidates.length < COVER_METAPHOR_MIN_CANDIDATES
    || topLevel.candidates.length > COVER_METAPHOR_MAX_CANDIDATES) {
    throw new Error("Cover metaphor response must contain four to six candidates");
  }

  const accepted: CoverMetaphorCandidate[] = [];
  const families = new Set<string>();
  const identities: Set<string>[] = [];
  for (const value of topLevel.candidates) {
    const candidate = candidateFromUnknown(value);
    if (!candidate || !isSafeAndGrounded(candidate, request.input)) continue;
    const family = normalizedText(candidate.metaphorFamily);
    const identity = candidateIdentity(candidate);
    if (families.has(family) || identities.some((previous) => jaccard(previous, identity) >= 0.72)) continue;
    accepted.push(candidate);
    families.add(family);
    identities.push(identity);
  }

  if (accepted.length < COVER_METAPHOR_RETURN_COUNT) {
    throw new Error("Fewer than two safe, distinct, thesis-grounded metaphor candidates survived validation");
  }
  return [accepted[0], accepted[1]];
}

export async function generateCoverMetaphorCandidates(
  input: CoverConceptInput,
  generate: CoverMetaphorGenerator,
): Promise<[CoverMetaphorCandidate, CoverMetaphorCandidate]> {
  const request = buildCoverMetaphorRequest(input);
  const response = await generate(request);
  return selectCoverMetaphorCandidates(request.input, response);
}

/** One provider request; retries belong to orchestration, not this Phase 4A adapter. */
export async function generateAnthropicCoverMetaphorCandidates(
  input: CoverConceptInput,
  apiKey: string,
  fetcher: typeof fetch = fetch,
  model = COVER_METAPHOR_MODEL,
): Promise<[CoverMetaphorCandidate, CoverMetaphorCandidate]> {
  if (!apiKey.trim()) throw new Error("ANTHROPIC_API_KEY is required for cover concept generation");
  const response = await fetcher(COVER_METAPHOR_ENDPOINT, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(buildAnthropicCoverMetaphorRequest(input, model)),
  });
  if (!response.ok) {
    throw new Error(`Anthropic cover concept request failed with HTTP ${response.status}`);
  }
  const payload = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const text = payload.content?.find((block) => block.type === "text")?.text;
  if (typeof text !== "string") throw new Error("Anthropic returned no structured cover concepts");
  return selectCoverMetaphorCandidates(input, text);
}
