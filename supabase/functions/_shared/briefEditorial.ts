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
  issueTitle: string;
  pharmacistNote: string;
  items: EditorialItem[];
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

const EDITORIAL_SYSTEM_PROMPT = [
  "You draft The Vitalspan Brief for mandatory human pharmacist review.",
  "Use only the supplied PubMed source packets. Never add or alter facts, effect sizes, sample sizes, designs, journals, identifiers, diagnoses, treatment instructions, or clinical recommendations.",
  "Keep association distinct from causation. Preserve uncertainty and all safety signals. Evidence labels must be conservative and one of High, Moderate, Preliminary, or Limited.",
  "The first supplied candidate is the cover and every remaining candidate is an ordered brief; do not change the selection or order.",
  "Return exactly issueTitle, cover, briefs, and pharmacistNote. For the cover and every brief return candidateId, a restrained headline, a 2-3 sentence factual summary, a concise takeaway without reader instructions, concise limitations grounded in the packet, and an evidenceLabel.",
  "Keep issueTitle concise. Keep pharmacistNote concise, grounded in the supplied sources, and free of direct medical recommendations.",
  "When limitation detail is absent, say the supplied abstract does not provide enough detail. Return strict JSON only, with no markdown or prose outside the schema.",
].join(" ");

export function buildAnthropicEditorialRequest(
  packets: EditorialSourcePacket[],
  model = EDITORIAL_MODEL,
): AnthropicEditorialRequest {
  return {
    model,
    max_tokens: EDITORIAL_MAX_TOKENS,
    system: EDITORIAL_SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(packets) }],
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

export function validateEditorial(raw: unknown, selectedIds: string[]): ValidatedEditorialIssue {
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
  return {
    issueTitle: requiredEditorialText(value.issueTitle, "issueTitle").slice(0, 180),
    pharmacistNote: requiredEditorialText(value.pharmacistNote, "pharmacistNote").slice(0, 1_200),
    items: selectedIds.map((id) => byId.get(id)!),
  };
}
