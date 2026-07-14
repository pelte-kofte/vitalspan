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

export interface ValidatedEditorialIssue {
  editorialThesis: string;
  themeKeywords: string[];
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

export interface SharedThemeLanguage {
  keyword: string;
  sourceCandidateIds: string[];
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

const THEME_ANCHOR_EXCLUSIONS = new Set([
  "abstract", "analysis", "associated", "authors", "conclusion", "data", "findings", "included", "method", "methods",
  "patient", "patients", "reported", "research", "result", "results", "significant", "strategies", "study", "studies",
  "trial", "trials", "using",
]);

const PREFERRED_THEME_ANCHORS = [
  "uncertainty", "evidence", "risk", "context", "population", "clinical", "intervention", "randomized", "metabolic",
  "weight", "safety", "benefits", "outcomes",
];

/** Extractive only: gives the model traceable language shared by the cover and at least two other packets. */
export function buildSharedThemeLanguage(packets: EditorialSourcePacket[]): SharedThemeLanguage[] {
  if (packets.length === 0) return [];
  const wordsByPacket = packets.map((packet) =>
    new Set(normalizedWords(`${packet.title} ${packet.abstract ?? ""}`).filter((word) => !THEME_ANCHOR_EXCLUSIONS.has(word)))
  );
  const coverWords = wordsByPacket[0];
  const shared = [...coverWords].map((keyword) => ({
    keyword,
    sourceCandidateIds: packets
      .filter((_packet, index) => wordsByPacket[index].has(keyword))
      .map((packet) => packet.id),
  })).filter((item) => item.sourceCandidateIds.length >= Math.min(3, packets.length));
  return shared
    .sort((left, right) => {
      const leftPriority = PREFERRED_THEME_ANCHORS.indexOf(left.keyword);
      const rightPriority = PREFERRED_THEME_ANCHORS.indexOf(right.keyword);
      if (leftPriority >= 0 || rightPriority >= 0) {
        if (leftPriority < 0) return 1;
        if (rightPriority < 0) return -1;
        if (leftPriority !== rightPriority) return leftPriority - rightPriority;
      }
      return right.sourceCandidateIds.length - left.sourceCandidateIds.length || left.keyword.localeCompare(right.keyword);
    })
    .slice(0, 16);
}

export const EDITORIAL_SYSTEM_PROMPT = [
  "You are the Editor-in-Chief of The Vitalspan Brief, a premium weekly longevity magazine for intelligent non-specialist readers. Write with the calm judgment, clarity, pacing, curiosity, and scientific restraint of an experienced science journalist; never imitate another publication's wording and never sound like an AI summary, PubMed abstract, news feed, or press release.",
  "Hard output budget: the complete JSON response must fit comfortably within 1,800 tokens. Brevity is a validation requirement; never spend the full allowance on any one article.",
  "Use only the supplied PubMed sourcePackets. sharedThemeLanguage is an extractive index of words present in the listed source packets, not an additional factual source. Never add, infer, or alter facts, effect sizes, sample sizes, study designs, journals, identifiers, diagnoses, treatment instructions, clinical recommendations, or certainty not supported by the packet. Keep association distinct from causation, preserve uncertainty and every safety signal, and use conservative evidence labels: High, Moderate, Preliminary, or Limited.",
  "The first supplied candidate is the cover and every remaining candidate is an ordered brief. The selection and order are deterministic: do not choose a different cover, omit an item, add an item, or reorder anything.",
  "Apply an editorial lens to every item: establish why the question matters, state what actually happened, explain why the result is scientifically interesting, make the uncertainty visible, and identify what researchers or readers should watch next. Do not merely recite what the paper says.",
  "Headlines should create intelligent curiosity without overstating the evidence and use no more than 10 words. Avoid paper-description formulas, clickbait, miracle language, and the words breakthrough, game changer, revolutionary, or rescue. Prefer qualified language such as may, suggests, or is linked with when the design requires it.",
  "Write summary as exactly three brief single-sentence paragraphs separated by blank lines inside the JSON string, using no more than 45 words total: first the context and why readers should care; second what the study found; third why the finding matters and what remains worth watching. Paraphrase the source rather than copying its abstract.",
  "Write takeaway as one memorable sentence of no more than 16 words that a reader could accurately recall tomorrow. It must not instruct the reader to start, stop, or change treatment.",
  "Write limitations plainly and specifically in no more than 18 words. Treat uncertainty as useful information. When detail is absent, say the supplied abstract lacks enough detail instead of inventing a limitation.",
  "Before writing any reader-facing copy, identify one internal editorialThesis of no more than 30 words grounded only in the supplied titles and abstracts. It must connect at least three selected studies without forcing a connection, inventing a biological mechanism, or claiming that interventions share a pathway unless the packets explicitly support that claim. Keep uncertainty explicit.",
  "Return exactly one themeKeywords entry for this draft: it must exactly equal sharedThemeLanguage[0].keyword and appear verbatim in the editorialThesis. If the shared language supports only an evidence, risk, uncertainty, context, or population theme, prefer that honest throughline over a forced biological connection. This array may support up to four entries in future, but do not add qualifiers now. These fields are internal draft metadata, not reader-facing copy.",
  "Create a concise, memorable issueTitle derived from the editorialThesis. Never concatenate topic names, append a month or year, or use generic language such as 'What This Week's Research Shows' unless no stronger grounded theme exists.",
  "The pharmacistNote field name is retained only for data compatibility; its content must be an Editor's Letter of exactly two short paragraphs, preferably about 100 words and no more than 170 words. Open with the week's central idea, connect the selected studies through one coherent scientific theme, explain why they belong together, mention no more than three studies explicitly and preferably mention only two, avoid a paper-by-paper recap, and end with the main uncertainty or question readers should carry forward. Keep it source-grounded and free of direct medical recommendations.",
  "Frame the deterministic cover as the entry point into the larger editorialThesis, without calling it the most important study unless the packet supports that description. The cover is the first supplied candidate; never call another candidate the entry point. Use the first theme keyword verbatim in the cover headline, summary, or takeaway.",
  "Preserve the supplied article order. Use transitions, varied first sentences, and different opening constructions so the issue reads as one sequence rather than five templated summaries. Do not begin every summary with 'A study', 'A review', 'A trial', or an equivalent formula, and do not repeat the same takeaway across articles.",
  "Maintain one recognizable Vitalspan voice across every topic and issue. Before returning, remove generic phrasing, simplify anything that can be simpler, check that the writing sounds human, and make every sentence earn its place.",
  "Return exactly editorialThesis, themeKeywords, issueTitle, cover, briefs, and pharmacistNote. For the cover and every brief return candidateId, headline, summary, takeaway, limitations, and evidenceLabel. Return strict JSON only, with no markdown or prose outside the schema.",
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
    messages: [{
      role: "user",
      content: JSON.stringify({
        sourcePackets: packets,
        sharedThemeLanguage: buildSharedThemeLanguage(packets),
      }),
    }],
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

function normalizedWords(value: string): string[] {
  return value.toLocaleLowerCase("en-US")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]+/g)
    ?.filter((word) => word.length > 2 && !EDITORIAL_STOP_WORDS.has(word)) ?? [];
}

function sourceSupportsKeyword(packet: EditorialSourcePacket, keyword: string): boolean {
  const sourceWords = new Set(normalizedWords(`${packet.title} ${packet.abstract ?? ""}`));
  const keywordWords = normalizedWords(keyword);
  return keywordWords.length > 0 && keywordWords.every((word) => sourceWords.has(word));
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
  const keywordSupport = new Map<string, string[]>();
  for (const keyword of issue.themeKeywords) {
    keywordSupport.set(keyword, sourcePackets.filter((packet) => sourceSupportsKeyword(packet, keyword)).map((packet) => packet.id));
  }
  const groundedThemeCandidateIds = [...new Set([...keywordSupport.values()].flat())];
  const requiredGroundedCount = Math.min(3, sourcePackets.length);
  const sharedAnchorCandidateIds = keywordSupport.get(issue.themeKeywords[0] ?? "") ?? [];
  const requiredAnchorLanguage = buildSharedThemeLanguage(sourcePackets)[0]?.keyword;
  const firstKeyword = issue.themeKeywords[0] ?? "";
  const thesisWords = new Set(normalizedWords(issue.editorialThesis));
  const unreferencedKeywords = issue.themeKeywords.filter(
    (keyword) => !normalizedWords(keyword).some((word) => thesisWords.has(word)),
  );
  const unsupportedKeywords = [...keywordSupport.entries()].filter(([, ids]) => ids.length === 0).map(([keyword]) => keyword);
  const themeGrounded = sourcePackets.length === 0 || (
    issue.themeKeywords.length >= 1
    && issue.themeKeywords.length <= 4
    && unsupportedKeywords.length === 0
    && unreferencedKeywords.length === 0
    && groundedThemeCandidateIds.length >= requiredGroundedCount
    && sharedAnchorCandidateIds.length >= requiredGroundedCount
    && normalizedWords(firstKeyword).length <= 2
    && firstKeyword.toLocaleLowerCase("en-US") === requiredAnchorLanguage
    && (sourcePackets.length === 0 || sharedAnchorCandidateIds.includes(sourcePackets[0]?.id))
  );

  const coverGrounded = sourcePackets.length === 0
    || groundedThemeCandidateIds.includes(sourcePackets[0]?.id);
  const coverText = issue.items[0]
    ? `${issue.items[0].headline} ${issue.items[0].summary} ${issue.items[0].whyItMatters}`
    : "";
  const coverUsesTheme = sourcePackets.length === 0 || issue.themeKeywords.some((keyword) => {
    const coverWords = new Set(normalizedWords(coverText));
    return normalizedWords(keyword).some((word) => coverWords.has(word));
  });

  const genericTitle = /^(?:what|inside)\s+(?:this|the)\s+week(?:'s)?\s+(?:research|science)/i.test(issue.issueTitle)
    || /^(?:weekly|this week(?:'s)?)\s+(?:research|science)\s+(?:roundup|review|brief)/i.test(issue.issueTitle);
  const datedTitle = /\b(?:january|february|march|april|may|june|july|august|september|october|november|december|20\d{2})\b/i
    .test(issue.issueTitle);
  const issueTitlePassed = !genericTitle && !datedTitle && !titleLooksLikeTopicList(issue.issueTitle);

  const letterParagraphs = paragraphs(issue.pharmacistNote);
  const mentionedStudies = studyMentionCount(issue.pharmacistNote, sourcePackets);
  const paperByPaperLanguage = /\b(?:first|second|third|fourth|fifth)\s+(?:study|paper|review)\b/i.test(issue.pharmacistNote)
    || /\b(?:another|the next|a final)\s+(?:study|paper|review)\b/i.test(issue.pharmacistNote);
  const editorsLetterPassed = letterParagraphs.length === 2
    && wordCount(issue.pharmacistNote) <= 170
    && mentionedStudies <= 3
    && !paperByPaperLanguage;

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
        ? `Shared anchor language traces to ${sharedAnchorCandidateIds.length} packets; the full theme traces to ${groundedThemeCandidateIds.length}.`
        : `The first keyword must anchor ${requiredGroundedCount} packets including the cover; unsupported: ${unsupportedKeywords.join(", ") || "none"}; absent from thesis: ${unreferencedKeywords.join(", ") || "none"}.`,
    },
    {
      name: "cover_theme_framing",
      passed: coverGrounded && coverUsesTheme,
      detail: coverGrounded && coverUsesTheme
        ? "The deterministic cover is grounded in and framed through the issue theme."
        : "The deterministic cover must support and explicitly introduce the issue theme.",
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
  const rawThemeKeywords = value.themeKeywords;
  if (!Array.isArray(rawThemeKeywords) || rawThemeKeywords.length < 1 || rawThemeKeywords.length > 4) {
    throw new Error("AI returned an invalid themeKeywords list");
  }
  const themeKeywords = rawThemeKeywords.map((keyword, index) =>
    requiredEditorialText(keyword, `themeKeywords[${index}]`).slice(0, 80)
  );
  if (new Set(themeKeywords.map((keyword) => keyword.toLocaleLowerCase("en-US"))).size !== themeKeywords.length) {
    throw new Error("AI returned duplicate themeKeywords");
  }
  const issue: ValidatedEditorialIssue = {
    editorialThesis: requiredEditorialText(value.editorialThesis, "editorialThesis").slice(0, 600),
    themeKeywords,
    issueTitle: requiredEditorialText(value.issueTitle, "issueTitle").slice(0, 180),
    pharmacistNote: requiredEditorialText(value.pharmacistNote, "pharmacistNote").slice(0, 1_200),
    items: selectedIds.map((id) => byId.get(id)!),
  };
  const intelligence = evaluateEditorialIntelligence(issue, sourcePackets);
  const failed = intelligence.checks.find((check) => !check.passed);
  if (failed) throw new Error(`Editorial intelligence validation failed (${failed.name}): ${failed.detail}`);
  return issue;
}
