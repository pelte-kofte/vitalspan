import type { StudyType } from "./briefPipeline.ts";
import { buildEditorialSchema, buildMinimalDiagnosticSchema, type JsonSchema } from "./briefSchema.ts";

export const MAX_AI_SOURCE_CANDIDATES = 5;
export const MAX_ABSTRACT_CHARACTERS = 2_400;
export const EDITORIAL_MAX_TOKENS = 1_800;
export const EDITORIAL_MODEL = "claude-sonnet-4-6";

export interface EditorialCandidateSource {
  id: string;
  pmid: string;
  doi: string | null;
  sourceUrl: string;
  title: string;
  abstract: string | null;
  journal: string | null;
  publicationDate: string | null;
  publicationTypes: string[];
  studyType: StudyType;
  sampleSize: number | null;
  topics: string[];
  biomarkerTags: string[];
  safetyFlags: string[];
  evidenceScore: number;
  relevanceScore: number;
  noveltyScore: number;
}

export interface EditorialSourcePacket {
  id: string;
  pmid: string;
  doi: string | null;
  sourceUrl: string;
  title: string;
  abstract: string | null;
  journal: string | null;
  publicationDate: string | null;
  publicationTypes: string[];
  studyType: StudyType;
  sampleSize: number | null;
  scores: {
    evidence: number;
    relevance: number;
    novelty: number;
  };
  topics: string[];
  biomarkerTags: string[];
  safetyFlags: string[];
}

export interface EditorialItem {
  id: string;
  headline: string;
  summary: string;
  whyItMatters: string;
  limitations: string;
  evidenceLabel: "High" | "Moderate" | "Preliminary" | "Limited";
}

export type ThemeConfidence = "high" | "medium" | "low";
export type ThemeType =
  | "scientific-tension"
  | "decision-problem"
  | "population-or-life-stage"
  | "trade-off"
  | "systems-relationship"
  | "evidence-limitation"
  | "no-unifying-theme";

export interface EditorialThemeEvidence {
  candidateId: string;
  sourcePhrase: string;
}

export interface ValidatedEditorialIssue {
  editorialThesis: string;
  themeConfidence: ThemeConfidence;
  themeType: ThemeType;
  themeKeywords: string[];
  themeEvidence: EditorialThemeEvidence[];
  issueTitle: string;
  pharmacistNote: string;
  items: EditorialItem[];
}

export interface EditorialIntelligenceValidationCheck {
  name:
    | "theme_grounding"
    | "cover_theme_framing"
    | "issue_title"
    | "editors_letter"
    | "headline_factuality"
    | "varied_openings"
    | "distinct_takeaways";
  passed: boolean;
  detail: string;
}

export interface EditorialIntelligenceValidationResult {
  passed: boolean;
  groundedThemeCandidateIds: string[];
  checks: EditorialIntelligenceValidationCheck[];
}

export interface AnthropicEditorialRequest {
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

export interface SafeEditorialRequestMetrics {
  candidateCount: number;
  payloadBytes: number;
  estimatedInputTokens: number;
}

export interface SafeAnthropicErrorDetails {
  httpStatus: number;
  errorType: string | null;
  errorMessage: string | null;
  requestId: string | null;
}

export interface AnthropicRequestCompatibilityAudit {
  hasCitations: boolean;
  hasAssistantPrefill: boolean;
}

function compactWhitespace(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncateAtBoundary(value: string, maximum: number): string {
  if (value.length <= maximum) return value;
  if (maximum <= 1) return "…".slice(0, maximum);
  const slice = value.slice(0, maximum - 1);
  const boundary = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("; "), slice.lastIndexOf(" "));
  const minimumUsefulBoundary = Math.floor(maximum * 0.7);
  return `${(boundary >= minimumUsefulBoundary ? slice.slice(0, boundary + 1) : slice).trimEnd()}…`;
}

type AbstractSection = { category: string; text: string; index: number };

const SECTION_CATEGORIES: Array<[string, RegExp]> = [
  ["objective", /\b(?:background|objective|objectives|aim|aims|purpose|importance)\b/i],
  ["methods", /\b(?:method|methods|design|setting|participants?|interventions?)\b/i],
  ["results", /\b(?:result|results|findings|outcomes?)\b/i],
  ["limitations", /\b(?:limitation|limitations|strengths and limitations)\b/i],
  ["conclusion", /\b(?:conclusion|conclusions|interpretation|discussion)\b/i],
];

function categoryFor(value: string): string | null {
  return SECTION_CATEGORIES.find(([, pattern]) => pattern.test(value))?.[0] ?? null;
}

function structuredSections(abstract: string): AbstractSection[] {
  const paragraphs = abstract.split(/\n{2,}/);
  const sections: AbstractSection[] = [];
  paragraphs.forEach((paragraph, index) => {
    const match = paragraph.match(/^([A-Za-z][A-Za-z &/\-]{1,45}):\s+([\s\S]+)$/);
    if (!match) return;
    const category = categoryFor(match[1]);
    if (category) sections.push({ category, text: `${match[1]}: ${match[2]}`, index });
  });
  return sections;
}

function unstructuredSections(abstract: string): AbstractSection[] {
  const sentences = abstract.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
  const sections: AbstractSection[] = [];
  const seen = new Set<string>();
  sentences.forEach((sentence, index) => {
    const category = categoryFor(sentence);
    if (category && !seen.has(category)) {
      seen.add(category);
      sections.push({ category, text: sentence, index });
    }
  });
  const selectedIndexes = new Set(sections.map((section) => section.index));
  for (let index = 0; index < sentences.length && sections.length < 7; index += 1) {
    if (!selectedIndexes.has(index)) sections.push({ category: "context", text: sentences[index], index });
  }
  return sections.sort((left, right) => left.index - right.index);
}

function fitSections(sections: AbstractSection[], maximum: number): string {
  const firstByCategory = new Map<string, AbstractSection>();
  for (const section of sections) {
    if (!firstByCategory.has(section.category)) firstByCategory.set(section.category, section);
  }
  const selected = [...firstByCategory.values()].sort((left, right) => left.index - right.index);
  let remaining = maximum;
  const output: string[] = [];
  selected.forEach((section, index) => {
    const separatorLength = index === 0 ? 0 : 2;
    remaining -= separatorLength;
    const remainingSections = selected.length - index;
    const allowance = Math.max(1, Math.floor(remaining / remainingSections));
    const text = truncateAtBoundary(section.text, allowance);
    output.push(text);
    remaining -= text.length;
  });
  return output.join("\n\n").slice(0, maximum);
}

/**
 * Deterministic, extractive truncation. Structured objective/methods/results/
 * limitations sections are retained when present; no new medical text is added.
 */
export function truncateAbstract(abstract: string | null, maximum = MAX_ABSTRACT_CHARACTERS): string | null {
  if (!abstract) return null;
  const normalized = compactWhitespace(abstract);
  if (!normalized) return null;
  if (normalized.length <= maximum) return normalized;
  const structured = structuredSections(normalized);
  const sections = structured.length >= 2 ? structured : unstructuredSections(normalized);
  return sections.length > 0 ? fitSections(sections, maximum) : truncateAtBoundary(normalized, maximum);
}

export function buildEditorialSourcePacket(rows: EditorialCandidateSource[]): EditorialSourcePacket[] {
  return rows.slice(0, MAX_AI_SOURCE_CANDIDATES).map((row) => ({
    id: row.id,
    pmid: row.pmid,
    doi: row.doi,
    sourceUrl: row.sourceUrl,
    title: row.title,
    abstract: truncateAbstract(row.abstract),
    journal: row.journal,
    publicationDate: row.publicationDate,
    publicationTypes: row.publicationTypes,
    studyType: row.studyType,
    sampleSize: row.sampleSize,
    scores: {
      evidence: row.evidenceScore,
      relevance: row.relevanceScore,
      novelty: row.noveltyScore,
    },
    topics: row.topics,
    biomarkerTags: row.biomarkerTags,
    safetyFlags: row.safetyFlags,
  }));
}

export const EDITORIAL_SYSTEM_PROMPT = [
  "You are the Editor-in-Chief of The Vitalspan Brief, a premium weekly longevity magazine for intelligent non-specialist readers. Write with the calm judgment, clarity, pacing, curiosity, and scientific restraint of an experienced science journalist; never imitate another publication's wording and never sound like an AI summary, PubMed abstract, news feed, or press release.",
  "Hard output budget: the complete JSON response must fit comfortably within 1,800 tokens. Brevity is a validation requirement; never spend the full allowance on any one article.",
  "Use only the supplied PubMed sourcePackets. Never add, infer, or alter facts, mechanisms, effect sizes, sample sizes, study designs, journals, identifiers, diagnoses, treatment instructions, clinical recommendations, or certainty not supported by a packet. Keep association distinct from causation, preserve uncertainty and every safety signal, and use conservative evidence labels: High, Moderate, Preliminary, or Limited.",
  "The first supplied candidate is the cover and every remaining candidate is an ordered brief. The selection and order are deterministic: do not choose a different cover, omit an item, add an item, or reorder anything.",
  "Apply an editorial lens to every item: establish why the question matters, state what actually happened, explain why the result is scientifically interesting, make the uncertainty visible, and identify what researchers or readers should watch next. Do not merely recite what the paper says.",
  "Headlines should create intelligent curiosity without overstating the evidence and use no more than 10 words. Use normal English title capitalization. Avoid paper-description formulas, clickbait, miracle language, and the words breakthrough, game changer, revolutionary, or rescue. Prefer qualified language such as may, suggests, or is linked with when the design requires it.",
  "Headline factuality is strict: greater cognitive improvement versus a comparator is not automatically slowed cognitive decline; association is not causation; a review that examines outcomes does not prove effectiveness; and preliminary evidence must retain hedging. Do not force a theme word or phrase into any headline.",
  "Write summary as exactly three brief single-sentence paragraphs separated by blank lines inside the JSON string, using no more than 45 words total: first the context and why readers should care; second what the study found; third why the finding matters and what remains worth watching. Paraphrase the source rather than copying its abstract.",
  "Write takeaway as one memorable sentence of no more than 16 words that a reader could accurately recall tomorrow. It must not instruct the reader to start, stop, or change treatment.",
  "Write limitations plainly and specifically in no more than 18 words. Treat uncertainty as useful information. When detail is absent, say the supplied abstract lacks enough detail instead of inventing a limitation.",
  "Before reader-facing copy, identify whether at least three packets support one specific editorial relationship. Valid themeType values represent a scientific tension, decision problem, population or life-stage concern, trade-off, systems relationship, or recurring evidence limitation. Simple shared-word frequency is not a theme.",
  "The following generic words cannot serve as themeKeywords by themselves: risk, risks, health, study, studies, research, patient, patients, treatment, intervention, interventions, effect, effects, benefit, benefits, outcome, outcomes, clinical, disease, conditions, results, evidence, management, associated, association, improve, improvement. A specific phrase may contain one of them only when the other words make a defensible concept, such as a named trade-off or decision tension.",
  "For a real theme, return a concise editorialThesis and one to four specific themeKeywords. Return themeEvidence from distinct packets, each with the unchanged candidateId and an exact 6-20 word sourcePhrase copied from that packet's title or abstract. Include the cover. Set themeConfidence high only for a clear specific relationship supported by at least four packets; set medium for a defensible tension supported by at least three.",
  "If no meaningful theme connects three packets, do not force one: set themeConfidence low, themeType no-unifying-theme, themeKeywords and themeEvidence to empty arrays, state internally in editorialThesis that no high-confidence unifying theme was found, and use the restrained issueTitle 'Five Signals From This Week in Longevity Science'. A low-confidence theme must never produce an assertive thematic title.",
  "For high or medium confidence, create a concise memorable issueTitle derived from the thesis. Never concatenate topic names or append a month or year.",
  "The pharmacistNote field name is retained only for data compatibility; its content must be an Editor's Letter of exactly two short paragraphs, preferably about 100 words and no more than 170 words. Open with the week's central idea. For high or medium confidence, connect the selected studies through one coherent scientific theme and explain why they belong together. For low confidence, frame them as five distinct signals without pretending they share a stronger relationship; mention no more than three studies explicitly and preferably mention only two, avoid a paper-by-paper recap, and end with the main uncertainty or question readers should carry forward. Keep it source-grounded and free of direct medical recommendations.",
  "For high or medium confidence, frame the deterministic cover as an entry point into the larger editorialThesis without calling it the most important study unless supported. Do this through framing, not by inserting a theme keyword into its headline. For low confidence, introduce it simply as the cover without pretending it unifies the issue.",
  "Preserve the supplied article order. Use transitions, varied first sentences, and different opening constructions so the issue reads as one sequence rather than five templated summaries. Do not begin every summary with 'A study', 'A review', 'A trial', or an equivalent formula, and do not repeat the same takeaway across articles.",
  "Maintain one recognizable Vitalspan voice across every topic and issue. Before returning, remove generic phrasing, simplify anything that can be simpler, check that the writing sounds human, and make every sentence earn its place.",
  "Return exactly editorialThesis, themeConfidence, themeType, themeKeywords, themeEvidence, issueTitle, cover, briefs, and pharmacistNote. For the cover and every brief return candidateId, headline, summary, takeaway, limitations, and evidenceLabel. Return strict JSON only, with no markdown or prose outside the schema.",
  "Final check before returning: thesis at most 30 words; every headline at most 10; every three-paragraph summary at most 45 total; every takeaway at most 16; every limitation at most 18; Editor's Letter exactly two paragraphs and at most 170. If any field is longer, rewrite it rather than returning it.",
].join(" ");

export function buildAnthropicEditorialRequest(
  packets: EditorialSourcePacket[],
  model = EDITORIAL_MODEL,
): AnthropicEditorialRequest {
  return {
    model,
    max_tokens: EDITORIAL_MAX_TOKENS,
    system: EDITORIAL_SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify({ sourcePackets: packets }) }],
    output_config: {
      format: {
        type: "json_schema",
        schema: buildEditorialSchema(),
      },
    },
  };
}

export function buildMinimalStructuredOutputRequest(model = EDITORIAL_MODEL): AnthropicEditorialRequest {
  return {
    model,
    max_tokens: 64,
    system: "Return the required JSON value only.",
    messages: [{ role: "user", content: "Return a short greeting." }],
    output_config: {
      format: {
        type: "json_schema",
        schema: buildMinimalDiagnosticSchema(),
      },
    },
  };
}

export function buildPlainJsonEditorialRequest(
  packets: EditorialSourcePacket[],
  model = EDITORIAL_MODEL,
): Omit<AnthropicEditorialRequest, "output_config"> {
  const { output_config: _outputConfig, ...request } = buildAnthropicEditorialRequest(packets, model);
  return request;
}

export function auditAnthropicRequestCompatibility(request: unknown): AnthropicRequestCompatibilityAudit {
  let hasCitations = false;
  const inspect = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) inspect(item);
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key === "citations") hasCitations = true;
      inspect(child);
    }
  };
  inspect(request);
  const messages = request && typeof request === "object"
    ? (request as { messages?: unknown }).messages
    : null;
  const lastMessage = Array.isArray(messages) ? messages.at(-1) : null;
  const hasAssistantPrefill = Boolean(
    lastMessage && typeof lastMessage === "object" && (lastMessage as { role?: unknown }).role === "assistant",
  );
  return { hasCitations, hasAssistantPrefill };
}

function safeDiagnosticString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, 1_000) : null;
}

/** Consumes an Anthropic error response body exactly once and returns only allowlisted diagnostics. */
export async function extractSafeAnthropicError(response: Response): Promise<SafeAnthropicErrorDetails> {
  let payload: unknown = null;
  try {
    payload = JSON.parse(await response.text());
  } catch {
    // Malformed or non-JSON bodies are deliberately discarded.
  }
  const error = payload && typeof payload === "object"
    ? (payload as { error?: unknown }).error
    : null;
  const safeError = error && typeof error === "object"
    ? error as { type?: unknown; message?: unknown }
    : null;
  return {
    httpStatus: response.status,
    errorType: safeDiagnosticString(safeError?.type),
    errorMessage: safeDiagnosticString(safeError?.message),
    requestId: safeDiagnosticString(
      response.headers.get("request-id") ?? response.headers.get("x-request-id"),
    ),
  };
}

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

/** Conservative offline estimate; preview must not call Anthropic's token-count endpoint. */
export function estimateInputTokens(request: AnthropicEditorialRequest): number {
  const modelInput = JSON.stringify({
    system: request.system,
    messages: request.messages,
    output_config: request.output_config,
  });
  return Math.ceil(utf8ByteLength(modelInput) / 4);
}

/** Contains counts only: never a key, prompt, title, or abstract. */
export function safeEditorialRequestMetrics(
  request: AnthropicEditorialRequest,
  candidateCount: number,
): SafeEditorialRequestMetrics {
  return {
    candidateCount,
    payloadBytes: utf8ByteLength(JSON.stringify(request)),
    estimatedInputTokens: estimateInputTokens(request),
  };
}

interface RawEditorialArticle {
  candidateId?: unknown;
  headline?: unknown;
  summary?: unknown;
  takeaway?: unknown;
  limitations?: unknown;
  evidenceLabel?: unknown;
}

interface RawEditorialThemeEvidence {
  candidateId?: unknown;
  sourcePhrase?: unknown;
}

function requiredEditorialText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`AI omitted ${field}`);
  return value.trim();
}

const EDITORIAL_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "being", "but", "by", "can", "could", "do", "does",
  "for", "from", "had", "has", "have", "how", "if", "in", "into", "is", "it", "its", "may", "more", "most",
  "not", "of", "on", "or", "our", "should", "so", "than", "that", "the", "their", "these", "this", "those",
  "through", "to", "was", "we", "were", "what", "when", "where", "which", "while", "who", "why", "will", "with",
]);

export const GENERIC_THEME_TERMS = new Set([
  "risk", "risks", "health", "study", "studies", "research", "patient", "patients", "treatment", "intervention",
  "interventions", "effect", "effects", "benefit", "benefits", "outcome", "outcomes", "clinical", "disease",
  "conditions", "results", "evidence", "management", "associated", "association", "improve", "improvement",
]);

function normalizedWords(value: string): string[] {
  return value.toLocaleLowerCase("en-US")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]+/g)
    ?.filter((word) => word.length > 2 && !EDITORIAL_STOP_WORDS.has(word)) ?? [];
}

function meaningfulThemeKeyword(keyword: string): boolean {
  const words = normalizedWords(keyword);
  return words.length > 0 && words.some((word) => !GENERIC_THEME_TERMS.has(word));
}

function normalizedPhrase(value: string): string {
  return value.toLocaleLowerCase("en-US")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function packetContainsPhrase(packet: EditorialSourcePacket, sourcePhrase: string): boolean {
  const phraseWords = sourcePhrase.trim().match(/\S+/g)?.length ?? 0;
  if (phraseWords < 6 || phraseWords > 20) return false;
  return normalizedPhrase(`${packet.title} ${packet.abstract ?? ""}`).includes(normalizedPhrase(sourcePhrase));
}

function paragraphs(value: string): string[] {
  return value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function wordCount(value: string): number {
  return value.trim().match(/\S+/g)?.length ?? 0;
}

function openingSignature(summary: string): string {
  return normalizedWords(paragraphs(summary)[0] ?? summary).slice(0, 4).join(" ");
}

function isGenericStudyOpening(summary: string): boolean {
  return /^(?:a|an|the|this|new)\s+(?:study|review|trial|analysis|paper|research|researchers?)\b/i
    .test((paragraphs(summary)[0] ?? summary).trim());
}

function takeawaySimilarity(left: string, right: string): number {
  const a = new Set(normalizedWords(left));
  const b = new Set(normalizedWords(right));
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const word of a) if (b.has(word)) intersection += 1;
  return intersection / Math.min(a.size, b.size);
}

function titleLooksLikeTopicList(title: string): boolean {
  const commaCount = title.match(/,/g)?.length ?? 0;
  return commaCount >= 2
    || /^[^,:;]+,\s*[^,:;]+\s+(?:and|&)\s+[^,:;]+$/i.test(title)
    || /\s(?:\||\/|·)\s/.test(title);
}

const LOWERCASE_TITLE_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "nor", "of", "on", "or", "over",
  "per", "the", "to", "up", "via", "vs", "with", "without", "yet",
]);

function headlineUsesNormalTitleCapitalization(headline: string): boolean {
  const words = headline.split(/\s+/).filter(Boolean);
  return words.every((rawWord, index) => {
    const word = rawWord.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9.'’-]+$/g, "");
    if (!word || /[A-Z0-9]/.test(word) || !/^[a-z][a-z.'’-]*$/.test(word)) return true;
    const normalized = word.replace(/[.'’]/g, "");
    return index > 0 && index < words.length - 1 && LOWERCASE_TITLE_WORDS.has(normalized);
  });
}

function reportedOutcomeText(packet: EditorialSourcePacket): string {
  const abstract = packet.abstract ?? "";
  const reported = abstract.split(/\n\s*\n/).filter((paragraph) =>
    /^(?:results?|findings?|conclusions?|interpretation|synthesis of results):/i.test(paragraph.trim())
  );
  return reported.length > 0 ? reported.join(" ") : abstract;
}

function hasCausalHeadlineVerb(headline: string): boolean {
  return /\b(?:cause[sd]?|cut[st]?|delay(?:s|ed)?|drive[sd]?|improve[sd]?|increase[sd]?|lower[sd]?|prevent[sd]?|protect[sd]?|raise[sd]?|reduce[sd]?|reverse[sd]?|slow[sd]?|stop[sp]?)\b/i.test(headline);
}

function headlineIsHedged(headline: string): boolean {
  return /\b(?:associated|could|linked|may|might|suggests?)\b/i.test(headline);
}

function reviewReportsEffect(packet: EditorialSourcePacket): boolean {
  return /\b(?:associated|difference|evidence is|found|improved|increased|lower|reduced|showed)\b/i.test(reportedOutcomeText(packet));
}

function headlineFactualityFailures(
  issue: ValidatedEditorialIssue,
  packets: EditorialSourcePacket[],
): string[] {
  const failures: string[] = [];
  issue.items.forEach((item, index) => {
    const packet = packets[index];
    if (!packet) return;
    const headline = item.headline;
    const outcomeText = reportedOutcomeText(packet);
    if (!headlineUsesNormalTitleCapitalization(headline)) {
      failures.push(`${item.id}: headline is not in normal title capitalization`);
    }
    if (/(?:\b(?:slow|slows|slowed|slowing|delay|delays|delayed)\b.*\bcognitive decline\b|\bcognitive decline\b.*\b(?:slow|slows|slowed|slowing|delay|delays|delayed)\b)/i.test(headline)
      && !/\b(?:slower|slowed|less|reduced|delay(?:ed|s)?)\b.{0,45}\bcognitive decline\b|\bcognitive decline\b.{0,45}\b(?:slower|slowed|less|reduced)\b/i.test(outcomeText)) {
      failures.push(`${item.id}: greater cognitive improvement does not establish slowed cognitive decline`);
    }
    const sourceFramesAssociation = /\b(?:associated|association|linked)\b/i.test(outcomeText);
    if ((packet.studyType === "observational-study" || sourceFramesAssociation)
      && hasCausalHeadlineVerb(headline) && !headlineIsHedged(headline)) {
      failures.push(`${item.id}: observational association is framed causally`);
    }
    if ((packet.studyType === "systematic-review" || packet.studyType === "meta-analysis")
      && /\b(?:effective|helps?|proves?|works?)\b/i.test(headline)
      && !reviewReportsEffect(packet)) {
      failures.push(`${item.id}: a review that examines outcomes is framed as proving effectiveness`);
    }
    if ((item.evidenceLabel === "Preliminary" || item.evidenceLabel === "Limited")
      && hasCausalHeadlineVerb(headline) && !headlineIsHedged(headline)) {
      failures.push(`${item.id}: preliminary evidence is missing headline hedging`);
    }
    for (const keyword of issue.themeKeywords) {
      if (normalizedWords(keyword).length < 2) continue;
      if (normalizedPhrase(headline).includes(normalizedPhrase(keyword)) && !packetContainsPhrase(packet, keyword)) {
        failures.push(`${item.id}: unsupported theme phrase was forced into the headline`);
        break;
      }
    }
  });
  return failures;
}

function studyMentionCount(letter: string, packets: EditorialSourcePacket[]): number {
  const letterWords = new Set(normalizedWords(letter));
  return packets.filter((packet) => {
    if (letter.includes(packet.pmid) || letter.includes(packet.id)) return true;
    const distinctiveTitleWords = [...new Set(normalizedWords(packet.title))].filter((word) => word.length >= 5);
    return distinctiveTitleWords.filter((word) => letterWords.has(word)).length >= Math.min(2, distinctiveTitleWords.length);
  }).length;
}

export function evaluateEditorialIntelligence(
  issue: ValidatedEditorialIssue,
  sourcePackets: EditorialSourcePacket[],
): EditorialIntelligenceValidationResult {
  const packetsById = new Map(sourcePackets.map((packet) => [packet.id, packet]));
  const invalidEvidence = issue.themeEvidence.filter((evidence) => {
    const packet = packetsById.get(evidence.candidateId);
    return !packet || !packetContainsPhrase(packet, evidence.sourcePhrase);
  });
  const groundedThemeCandidateIds = [...new Set(
    issue.themeEvidence
      .filter((evidence) => !invalidEvidence.includes(evidence))
      .map((evidence) => evidence.candidateId),
  )];
  const hasSpecificKeywords = issue.themeKeywords.length >= 1
    && issue.themeKeywords.length <= 4
    && issue.themeKeywords.every(meaningfulThemeKeyword);
  const thesisWords = new Set(normalizedWords(issue.editorialThesis));
  const keywordsUsedByThesis = issue.themeKeywords.every((keyword) =>
    normalizedWords(keyword).every((word) => thesisWords.has(word))
  );
  const coverId = sourcePackets[0]?.id;
  const coverGrounded = Boolean(coverId && groundedThemeCandidateIds.includes(coverId));
  const realThemeType = issue.themeType !== "no-unifying-theme";
  const confidenceGrounded = issue.themeConfidence === "high"
    ? realThemeType && groundedThemeCandidateIds.length >= 4
    : issue.themeConfidence === "medium"
    ? realThemeType && groundedThemeCandidateIds.length >= 3
    : issue.themeType === "no-unifying-theme"
      && issue.themeKeywords.length === 0
      && issue.themeEvidence.length === 0
      && /no high-confidence unifying theme/i.test(issue.editorialThesis);
  const themeGrounded = invalidEvidence.length === 0
    && confidenceGrounded
    && (issue.themeConfidence === "low" || (hasSpecificKeywords && keywordsUsedByThesis && coverGrounded));

  const genericTitle = /^(?:what|inside)\s+(?:this|the)\s+week(?:'s)?\s+(?:research|science)/i.test(issue.issueTitle)
    || /^(?:weekly|this week(?:'s)?)\s+(?:research|science)\s+(?:roundup|review|brief)/i.test(issue.issueTitle);
  const datedTitle = /\b(?:january|february|march|april|may|june|july|august|september|october|november|december|20\d{2})\b/i
    .test(issue.issueTitle);
  const lowConfidenceTitlePassed = issue.themeConfidence !== "low"
    || issue.issueTitle === "Five Signals From This Week in Longevity Science";
  const issueTitlePassed = lowConfidenceTitlePassed
    && (issue.themeConfidence === "low" || (!genericTitle && !datedTitle && !titleLooksLikeTopicList(issue.issueTitle)));

  const letterParagraphs = paragraphs(issue.pharmacistNote);
  const mentionedStudies = studyMentionCount(issue.pharmacistNote, sourcePackets);
  const paperByPaperLanguage = /\b(?:first|second|third|fourth|fifth)\s+(?:study|paper|review)\b/i.test(issue.pharmacistNote)
    || /\b(?:another|the next|a final)\s+(?:study|paper|review)\b/i.test(issue.pharmacistNote);
  const editorsLetterPassed = letterParagraphs.length === 2
    && wordCount(issue.pharmacistNote) <= 170
    && mentionedStudies <= 3
    && !paperByPaperLanguage;

  const headlineFailures = headlineFactualityFailures(issue, sourcePackets);

  const signatures = issue.items.map((item) => openingSignature(item.summary));
  const signatureCounts = new Map<string, number>();
  for (const signature of signatures) signatureCounts.set(signature, (signatureCounts.get(signature) ?? 0) + 1);
  const largestSignatureGroup = Math.max(0, ...signatureCounts.values());
  const allGeneric = issue.items.length >= 3 && issue.items.every((item) => isGenericStudyOpening(item.summary));
  const allSameOpening = issue.items.length >= 3 && largestSignatureGroup === issue.items.length;
  const variedOpeningsPassed = !allGeneric && !allSameOpening;

  let repeatedTakeawayPair: [string, string] | null = null;
  for (let left = 0; left < issue.items.length && !repeatedTakeawayPair; left += 1) {
    for (let right = left + 1; right < issue.items.length; right += 1) {
      if (takeawaySimilarity(issue.items[left].whyItMatters, issue.items[right].whyItMatters) >= 0.8) {
        repeatedTakeawayPair = [issue.items[left].id, issue.items[right].id];
        break;
      }
    }
  }

  const checks: EditorialIntelligenceValidationCheck[] = [
    {
      name: "theme_grounding",
      passed: themeGrounded,
      detail: themeGrounded
        ? `${issue.themeConfidence} confidence is supported by ${groundedThemeCandidateIds.length} exact source phrases.`
        : `Theme confidence, type, keywords, or exact source evidence is invalid; untraceable evidence items: ${invalidEvidence.length}.`,
    },
    {
      name: "cover_theme_framing",
      passed: issue.themeConfidence === "low" || coverGrounded,
      detail: issue.themeConfidence === "low" || coverGrounded
        ? "The deterministic cover is supported as the issue entry point without forced keyword insertion."
        : "A high- or medium-confidence theme must include exact evidence from the deterministic cover.",
    },
    {
      name: "issue_title",
      passed: issueTitlePassed,
      detail: issueTitlePassed
        ? "The title is thematic, concise, and undated."
        : "The issue title is generic, dated, or formatted as a list of topics.",
    },
    {
      name: "editors_letter",
      passed: editorsLetterPassed,
      detail: editorsLetterPassed
        ? `Two paragraphs, ${wordCount(issue.pharmacistNote)} words, ${mentionedStudies} explicitly identifiable studies.`
        : `The Editor's Letter must be two paragraphs, at most 170 words, mention no more than 3 studies, and avoid a paper-by-paper recap.`,
    },
    {
      name: "headline_factuality",
      passed: headlineFailures.length === 0,
      detail: headlineFailures.length === 0
        ? "Headlines preserve source claim strength, hedging, and normal title capitalization."
        : headlineFailures.join("; "),
    },
    {
      name: "varied_openings",
      passed: variedOpeningsPassed,
      detail: variedOpeningsPassed
        ? "Article summaries use varied opening constructions."
        : "Article summaries repeat the same study/review opening template.",
    },
    {
      name: "distinct_takeaways",
      passed: repeatedTakeawayPair === null,
      detail: repeatedTakeawayPair === null
        ? "Each article has a distinct takeaway."
        : `Takeaways repeat across candidates ${repeatedTakeawayPair[0]} and ${repeatedTakeawayPair[1]}.`,
    },
  ];
  return {
    passed: checks.every((check) => check.passed),
    groundedThemeCandidateIds,
    checks,
  };
}

export function validateEditorial(
  raw: unknown,
  selectedIds: string[],
  sourcePackets: EditorialSourcePacket[] = [],
): ValidatedEditorialIssue {
  const value = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const cover = value.cover as RawEditorialArticle | undefined;
  const briefs = value.briefs;
  if (!cover || !Array.isArray(briefs) || briefs.length !== Math.max(0, selectedIds.length - 1)) {
    throw new Error("AI editorial response has the wrong article count");
  }
  const allowedLabels = new Set(["High", "Moderate", "Preliminary", "Limited"]);
  const byId = new Map<string, EditorialItem>();
  for (const item of [cover, ...briefs] as RawEditorialArticle[]) {
    if (typeof item.candidateId !== "string" || !selectedIds.includes(item.candidateId) || byId.has(item.candidateId)) {
      throw new Error("AI returned an invalid candidate id");
    }
    if (typeof item.evidenceLabel !== "string" || !allowedLabels.has(item.evidenceLabel)) {
      throw new Error("AI returned an invalid evidence label");
    }
    byId.set(item.candidateId, {
      id: item.candidateId,
      headline: requiredEditorialText(item.headline, "headline").slice(0, 180),
      summary: requiredEditorialText(item.summary, "summary").slice(0, 1_200),
      whyItMatters: requiredEditorialText(item.takeaway, "takeaway").slice(0, 600),
      limitations: requiredEditorialText(item.limitations, "limitations").slice(0, 600),
      evidenceLabel: item.evidenceLabel as EditorialItem["evidenceLabel"],
    });
  }
  if (cover.candidateId !== selectedIds[0]) throw new Error("AI changed the deterministic cover selection");
  const allowedThemeConfidence = new Set<ThemeConfidence>(["high", "medium", "low"]);
  if (typeof value.themeConfidence !== "string" || !allowedThemeConfidence.has(value.themeConfidence as ThemeConfidence)) {
    throw new Error("AI returned an invalid themeConfidence");
  }
  const allowedThemeTypes = new Set<ThemeType>([
    "scientific-tension",
    "decision-problem",
    "population-or-life-stage",
    "trade-off",
    "systems-relationship",
    "evidence-limitation",
    "no-unifying-theme",
  ]);
  if (typeof value.themeType !== "string" || !allowedThemeTypes.has(value.themeType as ThemeType)) {
    throw new Error("AI returned an invalid themeType");
  }
  const rawThemeKeywords = value.themeKeywords;
  if (!Array.isArray(rawThemeKeywords) || rawThemeKeywords.length > 4) {
    throw new Error("AI returned an invalid themeKeywords list");
  }
  const themeKeywords = rawThemeKeywords.map((keyword, index) =>
    requiredEditorialText(keyword, `themeKeywords[${index}]`).slice(0, 80)
  );
  if (new Set(themeKeywords.map((keyword) => keyword.toLocaleLowerCase("en-US"))).size !== themeKeywords.length) {
    throw new Error("AI returned duplicate themeKeywords");
  }
  const rawThemeEvidence = value.themeEvidence;
  if (!Array.isArray(rawThemeEvidence) || rawThemeEvidence.length > selectedIds.length) {
    throw new Error("AI returned an invalid themeEvidence list");
  }
  const themeEvidence = rawThemeEvidence.map((rawEvidence, index) => {
    const evidence = rawEvidence && typeof rawEvidence === "object"
      ? rawEvidence as RawEditorialThemeEvidence
      : {};
    if (typeof evidence.candidateId !== "string" || !selectedIds.includes(evidence.candidateId)) {
      throw new Error(`AI returned an invalid themeEvidence candidateId at index ${index}`);
    }
    return {
      candidateId: evidence.candidateId,
      sourcePhrase: requiredEditorialText(evidence.sourcePhrase, `themeEvidence[${index}].sourcePhrase`).slice(0, 300),
    };
  });
  if (new Set(themeEvidence.map((evidence) => evidence.candidateId)).size !== themeEvidence.length) {
    throw new Error("AI returned duplicate themeEvidence candidateIds");
  }
  const issue: ValidatedEditorialIssue = {
    editorialThesis: requiredEditorialText(value.editorialThesis, "editorialThesis").slice(0, 600),
    themeConfidence: value.themeConfidence as ThemeConfidence,
    themeType: value.themeType as ThemeType,
    themeKeywords,
    themeEvidence,
    issueTitle: requiredEditorialText(value.issueTitle, "issueTitle").slice(0, 180),
    pharmacistNote: requiredEditorialText(value.pharmacistNote, "pharmacistNote").slice(0, 1_200),
    items: selectedIds.map((id) => byId.get(id)!),
  };
  const intelligence = evaluateEditorialIntelligence(issue, sourcePackets);
  const failed = intelligence.checks.find((check) => !check.passed);
  if (failed) throw new Error(`Editorial intelligence validation failed (${failed.name}): ${failed.detail}`);
  return issue;
}
