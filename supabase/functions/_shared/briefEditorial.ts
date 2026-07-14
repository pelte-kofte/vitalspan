import type { StudyType } from "./briefPipeline.ts";

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
  "For each supplied id, write only the existing fields: a restrained headline, a 2-3 sentence factual summary, a concise whyItMatters without reader instructions, concise limitations grounded in the packet, and an evidenceLabel.",
  "When limitation detail is absent, say the supplied abstract does not provide enough detail. Return strict JSON only, with no markdown or prose outside the schema.",
].join(" ");

function editorialSchema(candidateCount: number): Record<string, unknown> {
  return {
    type: "object",
    properties: {
      articles: {
        type: "array",
        minItems: candidateCount,
        maxItems: candidateCount,
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            headline: { type: "string" },
            summary: { type: "string" },
            whyItMatters: { type: "string" },
            limitations: { type: "string" },
            evidenceLabel: { type: "string", enum: ["High", "Moderate", "Preliminary", "Limited"] },
          },
          required: ["id", "headline", "summary", "whyItMatters", "limitations", "evidenceLabel"],
          additionalProperties: false,
        },
      },
    },
    required: ["articles"],
    additionalProperties: false,
  };
}

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
        schema: editorialSchema(packets.length),
      },
    },
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

export function validateEditorial(raw: unknown, selectedIds: string[]): EditorialItem[] {
  const articles = (raw as { articles?: unknown[] })?.articles;
  if (!Array.isArray(articles) || articles.length !== selectedIds.length) {
    throw new Error("AI editorial response has the wrong article count");
  }
  const allowedLabels = new Set(["High", "Moderate", "Preliminary", "Limited"]);
  const byId = new Map<string, EditorialItem>();
  for (const item of articles) {
    const value = item as Partial<EditorialItem>;
    if (!value.id || !selectedIds.includes(value.id) || byId.has(value.id)) {
      throw new Error("AI returned an invalid candidate id");
    }
    for (const field of ["headline", "summary", "whyItMatters", "limitations"] as const) {
      if (typeof value[field] !== "string" || !value[field]!.trim()) throw new Error(`AI omitted ${field}`);
    }
    if (!value.evidenceLabel || !allowedLabels.has(value.evidenceLabel)) {
      throw new Error("AI returned an invalid evidence label");
    }
    byId.set(value.id, {
      id: value.id,
      headline: value.headline!.trim().slice(0, 180),
      summary: value.summary!.trim().slice(0, 1_200),
      whyItMatters: value.whyItMatters!.trim().slice(0, 600),
      limitations: value.limitations!.trim().slice(0, 600),
      evidenceLabel: value.evidenceLabel,
    });
  }
  return selectedIds.map((id) => byId.get(id)!);
}
