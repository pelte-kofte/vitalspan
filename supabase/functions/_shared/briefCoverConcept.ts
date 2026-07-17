import { reviewEditorialDistinctiveness } from "./briefCoverEditorialDistinctiveness.ts";

export const COVER_CONCEPT_MIN_CANDIDATES = 4;
export const COVER_CONCEPT_MAX_CANDIDATES = 6;
export const COVER_CONCEPT_RETURN_COUNT = 2;
export const COVER_METAPHOR_MIN_CANDIDATES = COVER_CONCEPT_MIN_CANDIDATES;
export const COVER_METAPHOR_MAX_CANDIDATES = COVER_CONCEPT_MAX_CANDIDATES;
export const COVER_METAPHOR_RETURN_COUNT = COVER_CONCEPT_RETURN_COUNT;
export const COVER_METAPHOR_MODEL = "claude-sonnet-4-6";
export const COVER_METAPHOR_MAX_TOKENS = 3_200;
export const COVER_METAPHOR_ENDPOINT = "https://api.anthropic.com/v1/messages";

export const DEFAULT_COVER_CONCEPT_BOUNDARIES = [
  "An association, early signal, or secondary endpoint establishes causation or certainty.",
  "The evidence supports a clinical recommendation or a cure claim.",
  "The findings generalize beyond the studied population, intervention, outcome, and design.",
] as const;

export interface CoverStoryArticle {
  candidateId: string;
  title: string;
  journal: string;
  publicationDate: string;
  sourcePhrase: string;
  abstract?: string;
  studyType?: string;
  evidenceLabel?: string;
  limitations?: string;
  evidenceScore?: number;
  relevanceScore?: number;
  noveltyScore?: number;
}

/** Phase 4A is given exactly the five selected articles and no visual direction. */
export interface CoverConceptInput {
  articles: CoverStoryArticle[];
  deterministicCoverArticleId?: string | null;
  claimsNotImply: string[];
}

export interface CoverStoryExtraction {
  coverStoryCandidateId: string;
  coverStoryReason: string;
  centralFinding: string;
  whyItMatters: string;
  editorialQuestion: string;
  principalUncertainty: string;
  prohibitedClaims: string[];
  visualStorySentence: string;
}

export interface CoverVisualConcept {
  visualStory: string;
  relationship: string;
  visualEvent: string;
  scientificAnchor: string;
  whyMemorable: string;
  editorialScores: {
    novelty: number;
    originality: number;
    scientificAmbiguity: number;
    narrativeClarity: number;
  };
  suitableVisualFamilies: Array<"Living Tapestry" | "Landscape" | "Architecture" | "Living Still">;
  prohibitedImplications: string[];
}

export interface CoverConceptSelection {
  coverStory: CoverStoryExtraction;
  concepts: CoverVisualConcept[];
  strongestTwo: [CoverVisualConcept, CoverVisualConcept];
  selectedConcept: CoverVisualConcept;
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
  output_config: { format: { type: "json_schema"; schema: Record<string, unknown> } };
}

export type CoverMetaphorGenerator = (request: CoverMetaphorRequest) => Promise<unknown>;

const STORY_FIELDS = [
  "coverStoryCandidateId", "coverStoryReason", "centralFinding", "whyItMatters", "editorialQuestion",
  "principalUncertainty", "prohibitedClaims", "visualStorySentence",
] as const;
const CONCEPT_FIELDS = [
  "visualStory", "relationship", "visualEvent", "scientificAnchor", "whyMemorable",
  "editorialScores", "suitableVisualFamilies", "prohibitedImplications",
] as const;
const VISUAL_FAMILIES = ["Living Tapestry", "Landscape", "Architecture", "Living Still"] as const;

const STOP_WORDS = new Set([
  "about", "after", "again", "against", "also", "among", "because", "before", "being", "between",
  "could", "does", "each", "from", "have", "into", "itself", "more", "must", "only", "other", "over",
  "same", "should", "than", "that", "their", "there", "these", "they", "this", "those", "through", "under",
  "very", "what", "when", "where", "which", "while", "with", "without", "would",
]);
const GENERIC_THESIS = /^(?:promising signals? meet their limits|evidence approaches practice|uncertainty remains|risk and benefit)[.!]?$/i;
const GENERIC_EVIDENCE_METAPHOR = /\b(?:bridge to practice|fog of uncertainty|weighing evidence|balance of risk|threshold of evidence|promising signals? meet|evidence approaches)\b/i;
const DECORATIVE_OR_VAGUE = /\b(?:beautiful abstraction|vague abstraction|decorative composition|tasteful arrangement|generic geometry|mysterious forms?)\b/i;
const DEFAULT_PROP_RECIPE = /\b(?:bowls?|vessels?|stones?|linen|seed pods?|tabletops?|paper sheets?)\b/i;
const OBJECT_INVENTORY = /(?:,\s*){2,}|\b(?:alongside|surrounded by|arranged with|collection of)\b/i;
const UNSUPPORTED_CERTAINTY = /\b(?:proves?|proven|guarantees?|cures?|reverses?|eliminates?|ensures?|definitive(?:ly)?|certain(?:ly)?)\b/i;

export const COVER_METAPHOR_SYSTEM_PROMPT = [
  "You are Vitalspan's senior science editor and art-concept editor.",
  "Evaluate all five selected articles explicitly. Choose one cover story using scientific significance, visual potential, reader curiosity, longevity relevance, credible evidence, freshness or surprise, and capacity for a memorable visual story without overstatement.",
  "The deterministic cover article is a nomination to confirm or overturn with a reason; never select randomly.",
  "Extract the chosen article's central finding, importance, editorial question, principal uncertainty, prohibited claims, and one vivid visualStorySentence.",
  "Then generate four to six genuinely different, strongest-first concepts for that single story. Each concept must specify visualStory, relationship, visualEvent, scientificAnchor, whyMemorable, editorialScores, suitableVisualFamilies, and prohibitedImplications.",
  "Every concept must self-score from 1 to 5 for novelty, originality, scientificAmbiguity, and narrativeClarity. Score honestly: editorial quality requires novelty 4, originality 4, scientific ambiguity 3, and narrative clarity 4 or higher.",
  "Apply the one-second test before returning a concept. Reject any primary silhouette that reads immediately as a tree, Tree of Life, bonsai, flower, leaf, brain, neuron icon, DNA helix, heart, lungs, eye, butterfly, bird, hands, globe, planet, mountain, river, sun, roots, coral, blood vessel, mushroom, or recognizable animal. Such forms may exist only as microscopic internal references.",
  "Prefer woven systems, living fabrics, emergent structures, interconnected fields, dynamic gradients, layered ecologies, biological topology, adaptive geometries, network tension, and collective emergence. The scientific relationship must resolve before any named object does.",
  "Concepts must be article-specific scientific stories, not generic evidence metaphors, decorative abstractions, object inventories, unexplained architecture, tasteful still lifes, or copies of the founding artwork.",
  "Do not force the other four articles into the composition. They are selection context only after the cover story is chosen.",
  "Return strict structured data only.",
].join(" ");

const boundedString = { type: "string", minLength: 8, maxLength: 700 };
export const COVER_METAPHOR_OUTPUT_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["coverStory", "concepts"],
  properties: {
    coverStory: {
      type: "object",
      additionalProperties: false,
      required: [...STORY_FIELDS],
      properties: {
        coverStoryCandidateId: { type: "string", minLength: 1, maxLength: 120 },
        coverStoryReason: boundedString,
        centralFinding: boundedString,
        whyItMatters: boundedString,
        editorialQuestion: boundedString,
        principalUncertainty: boundedString,
        prohibitedClaims: { type: "array", minItems: 1, maxItems: 8, items: boundedString },
        visualStorySentence: boundedString,
      },
    },
    concepts: {
      type: "array",
      minItems: COVER_CONCEPT_MIN_CANDIDATES,
      maxItems: COVER_CONCEPT_MAX_CANDIDATES,
      items: {
        type: "object",
        additionalProperties: false,
        required: [...CONCEPT_FIELDS],
        properties: {
          visualStory: boundedString,
          relationship: boundedString,
          visualEvent: boundedString,
          scientificAnchor: boundedString,
          whyMemorable: boundedString,
          editorialScores: {
            type: "object",
            additionalProperties: false,
            required: ["novelty", "originality", "scientificAmbiguity", "narrativeClarity"],
            properties: {
              novelty: { type: "integer", minimum: 1, maximum: 5 },
              originality: { type: "integer", minimum: 1, maximum: 5 },
              scientificAmbiguity: { type: "integer", minimum: 1, maximum: 5 },
              narrativeClarity: { type: "integer", minimum: 1, maximum: 5 },
            },
          },
          suitableVisualFamilies: {
            type: "array", minItems: 1, maxItems: 4, uniqueItems: true,
            items: { type: "string", enum: [...VISUAL_FAMILIES] },
          },
          prohibitedImplications: { type: "array", minItems: 1, maxItems: 8, items: boundedString },
        },
      },
    },
  },
};

function normalizeWhitespace(value: string): string { return value.replace(/\s+/g, " ").trim(); }
function normalize(value: string): string { return normalizeWhitespace(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter((token) => token.length >= 4 && !STOP_WORDS.has(token)));
}
function overlap(left: Set<string>, right: Set<string>): number {
  let result = 0;
  for (const token of left) if (right.has(token)) result += 1;
  return result;
}
function jaccard(left: Set<string>, right: Set<string>): number {
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : overlap(left, right) / union;
}
function requireText(value: unknown, label: string, minimum = 1): string {
  if (typeof value !== "string" || normalizeWhitespace(value).length < minimum) throw new Error(`${label} must not be empty`);
  return normalizeWhitespace(value);
}
function cleanStrings(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must contain at least one value`);
  return value.map((item, index) => requireText(item, `${label}[${index}]`, 8));
}
function cleanEditorialScore(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 5) throw new Error(`${label} must be an integer from 1 to 5`);
  return Number(value);
}

function cleanArticle(article: CoverStoryArticle): CoverStoryArticle {
  return {
    candidateId: requireText(article?.candidateId, "article.candidateId"),
    title: requireText(article?.title, "article.title", 8),
    journal: requireText(article?.journal, "article.journal"),
    publicationDate: requireText(article?.publicationDate, "article.publicationDate"),
    sourcePhrase: requireText(article?.sourcePhrase, "article.sourcePhrase", 8),
    ...(article.abstract ? { abstract: normalizeWhitespace(article.abstract) } : {}),
    ...(article.studyType ? { studyType: normalizeWhitespace(article.studyType) } : {}),
    ...(article.evidenceLabel ? { evidenceLabel: normalizeWhitespace(article.evidenceLabel) } : {}),
    ...(article.limitations ? { limitations: normalizeWhitespace(article.limitations) } : {}),
    ...(Number.isFinite(article.evidenceScore) ? { evidenceScore: article.evidenceScore } : {}),
    ...(Number.isFinite(article.relevanceScore) ? { relevanceScore: article.relevanceScore } : {}),
    ...(Number.isFinite(article.noveltyScore) ? { noveltyScore: article.noveltyScore } : {}),
  };
}

export function buildCoverMetaphorRequest(input: CoverConceptInput): CoverMetaphorRequest {
  if (!Array.isArray(input.articles) || input.articles.length !== 5) {
    throw new Error("Cover-story evaluation requires exactly five selected articles");
  }
  const articles = input.articles.map(cleanArticle);
  if (new Set(articles.map((article) => article.candidateId)).size !== 5) throw new Error("Selected article IDs must be unique");
  const deterministicCoverArticleId = input.deterministicCoverArticleId?.trim() || null;
  if (deterministicCoverArticleId && !articles.some((article) => article.candidateId === deterministicCoverArticleId)) {
    throw new Error("deterministicCoverArticleId must identify one of the five selected articles");
  }
  const claimsNotImply = cleanStrings(input.claimsNotImply, "claimsNotImply");
  return {
    system: COVER_METAPHOR_SYSTEM_PROMPT,
    input: { articles, deterministicCoverArticleId, claimsNotImply },
    outputSchema: COVER_METAPHOR_OUTPUT_SCHEMA,
  };
}

export function buildAnthropicCoverMetaphorRequest(input: CoverConceptInput, model = COVER_METAPHOR_MODEL): AnthropicCoverMetaphorRequest {
  const request = buildCoverMetaphorRequest(input);
  return {
    model,
    max_tokens: COVER_METAPHOR_MAX_TOKENS,
    system: request.system,
    messages: [{ role: "user", content: JSON.stringify(request.input) }],
    output_config: { format: { type: "json_schema", schema: request.outputSchema } },
  };
}

function parsePayload(payload: unknown): Record<string, unknown> {
  if (typeof payload === "string") {
    try { payload = JSON.parse(payload); } catch { throw new Error("Cover concept response must be valid JSON"); }
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Cover concept response must be an object");
  return payload as Record<string, unknown>;
}

function exactKeys(record: Record<string, unknown>, fields: readonly string[]): boolean {
  const actual = Object.keys(record).sort();
  const expected = [...fields].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function cleanStory(value: unknown, input: CoverConceptInput): CoverStoryExtraction {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("coverStory must be an object");
  const record = value as Record<string, unknown>;
  if (!exactKeys(record, STORY_FIELDS)) throw new Error("coverStory fields do not match the story extraction schema");
  const story: CoverStoryExtraction = {
    coverStoryCandidateId: requireText(record.coverStoryCandidateId, "coverStoryCandidateId"),
    coverStoryReason: requireText(record.coverStoryReason, "coverStoryReason", 8),
    centralFinding: requireText(record.centralFinding, "centralFinding", 8),
    whyItMatters: requireText(record.whyItMatters, "whyItMatters", 8),
    editorialQuestion: requireText(record.editorialQuestion, "editorialQuestion", 8),
    principalUncertainty: requireText(record.principalUncertainty, "principalUncertainty", 8),
    prohibitedClaims: cleanStrings(record.prohibitedClaims, "prohibitedClaims"),
    visualStorySentence: requireText(record.visualStorySentence, "visualStorySentence", 8),
  };
  const article = input.articles.find((item) => item.candidateId === story.coverStoryCandidateId);
  if (!article) throw new Error("Selected cover story is not one of the five articles");
  const grounding = tokens(`${article.title} ${article.sourcePhrase} ${article.abstract ?? ""} ${article.limitations ?? ""}`);
  if (overlap(tokens(`${story.centralFinding} ${story.whyItMatters}`), grounding) < 2) {
    throw new Error("Cover story extraction is not grounded in the selected article");
  }
  if (GENERIC_THESIS.test(story.visualStorySentence) || UNSUPPORTED_CERTAINTY.test(`${story.centralFinding} ${story.visualStorySentence}`)) {
    throw new Error("Cover visual story is generic or overstates the evidence");
  }
  return story;
}

function cleanConcept(value: unknown, story: CoverStoryExtraction, article: CoverStoryArticle): CoverVisualConcept | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (!exactKeys(record, CONCEPT_FIELDS)) return null;
  try {
    const families = record.suitableVisualFamilies;
    if (!Array.isArray(families) || families.length === 0 || families.some((family) => !VISUAL_FAMILIES.includes(family))) return null;
    const concept: CoverVisualConcept = {
      visualStory: requireText(record.visualStory, "visualStory", 8),
      relationship: requireText(record.relationship, "relationship", 8),
      visualEvent: requireText(record.visualEvent, "visualEvent", 8),
      scientificAnchor: requireText(record.scientificAnchor, "scientificAnchor", 8),
      whyMemorable: requireText(record.whyMemorable, "whyMemorable", 8),
      editorialScores: {
        novelty: cleanEditorialScore((record.editorialScores as Record<string, unknown>)?.novelty, "editorialScores.novelty"),
        originality: cleanEditorialScore((record.editorialScores as Record<string, unknown>)?.originality, "editorialScores.originality"),
        scientificAmbiguity: cleanEditorialScore((record.editorialScores as Record<string, unknown>)?.scientificAmbiguity, "editorialScores.scientificAmbiguity"),
        narrativeClarity: cleanEditorialScore((record.editorialScores as Record<string, unknown>)?.narrativeClarity, "editorialScores.narrativeClarity"),
      },
      suitableVisualFamilies: [...new Set(families)] as CoverVisualConcept["suitableVisualFamilies"],
      prohibitedImplications: cleanStrings(record.prohibitedImplications, "prohibitedImplications"),
    };
    const mainText = `${concept.visualStory} ${concept.relationship} ${concept.visualEvent} ${concept.scientificAnchor} ${concept.whyMemorable}`;
    if (GENERIC_EVIDENCE_METAPHOR.test(mainText) || DECORATIVE_OR_VAGUE.test(mainText)
      || DEFAULT_PROP_RECIPE.test(mainText) || OBJECT_INVENTORY.test(concept.visualEvent)
      || UNSUPPORTED_CERTAINTY.test(mainText)) return null;
    if (!reviewEditorialDistinctiveness({ phase: "4A", concept }).passed) return null;
    const grounding = tokens(`${article.title} ${article.sourcePhrase} ${article.abstract ?? ""} ${story.centralFinding} ${story.visualStorySentence}`);
    if (overlap(tokens(`${concept.scientificAnchor} ${concept.relationship}`), grounding) < 1) return null;
    return concept;
  } catch { return null; }
}

export function selectCoverMetaphorCandidates(input: CoverConceptInput, rawPayload: unknown): CoverConceptSelection {
  const normalizedInput = buildCoverMetaphorRequest(input).input;
  const payload = parsePayload(rawPayload);
  if (!exactKeys(payload, ["coverStory", "concepts"]) || !Array.isArray(payload.concepts)) {
    throw new Error("Cover concept response must contain only coverStory and concepts");
  }
  if (payload.concepts.length < COVER_CONCEPT_MIN_CANDIDATES || payload.concepts.length > COVER_CONCEPT_MAX_CANDIDATES) {
    throw new Error("Cover concept response must contain four to six concepts");
  }
  const coverStory = cleanStory(payload.coverStory, normalizedInput);
  const article = normalizedInput.articles.find((item) => item.candidateId === coverStory.coverStoryCandidateId) as CoverStoryArticle;
  const concepts: CoverVisualConcept[] = [];
  const identities: Set<string>[] = [];
  for (const value of payload.concepts) {
    const concept = cleanConcept(value, coverStory, article);
    if (!concept) continue;
    const identity = tokens(`${concept.visualStory} ${concept.relationship} ${concept.visualEvent}`);
    if (identities.some((previous) => jaccard(previous, identity) >= 0.68)) continue;
    concepts.push(concept);
    identities.push(identity);
  }
  if (concepts.length < COVER_CONCEPT_RETURN_COUNT) {
    throw new Error("Fewer than two safe, distinct, cover-story-grounded concepts survived validation");
  }
  const strongestTwo: [CoverVisualConcept, CoverVisualConcept] = [concepts[0], concepts[1]];
  return { coverStory, concepts, strongestTwo, selectedConcept: strongestTwo[0] };
}

export async function generateCoverMetaphorCandidates(input: CoverConceptInput, generate: CoverMetaphorGenerator): Promise<CoverConceptSelection> {
  const request = buildCoverMetaphorRequest(input);
  return selectCoverMetaphorCandidates(request.input, await generate(request));
}

export async function generateAnthropicCoverMetaphorCandidates(
  input: CoverConceptInput,
  apiKey: string,
  fetcher: typeof fetch = fetch,
  model = COVER_METAPHOR_MODEL,
): Promise<CoverConceptSelection> {
  if (!apiKey.trim()) throw new Error("ANTHROPIC_API_KEY is required for cover-story concept generation");
  const response = await fetcher(COVER_METAPHOR_ENDPOINT, {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(buildAnthropicCoverMetaphorRequest(input, model)),
  });
  if (!response.ok) throw new Error(`Anthropic cover-story concept request failed with HTTP ${response.status}`);
  const payload = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const text = payload.content?.find((block) => block.type === "text")?.text;
  if (typeof text !== "string") throw new Error("Anthropic returned no structured cover-story concepts");
  return selectCoverMetaphorCandidates(input, text);
}

/** Random choice is deliberately isolated to explicit local tests and is never called by production adapters. */
export function selectRandomCoverStoryForLocalTest(
  articles: CoverStoryArticle[],
  options: { localOnly: true; random: true },
  random: () => number = Math.random,
): CoverStoryArticle {
  if (options.localOnly !== true || options.random !== true) throw new Error("Random cover-story selection is local-test-only");
  if (articles.length !== 5) throw new Error("Local random selection requires exactly five articles");
  return articles[Math.min(4, Math.floor(Math.max(0, random()) * 5))];
}
