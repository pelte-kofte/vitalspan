#!/usr/bin/env -S deno run --allow-env=ANTHROPIC_API_KEY --allow-net=api.anthropic.com --allow-read

import {
  type AnthropicEditorialRequest,
  type EditorialCandidateSource,
  buildAnthropicEditorialRequest,
  buildEditorialSourcePacket,
  buildMinimalStructuredOutputRequest,
  buildPlainJsonEditorialRequest,
  extractSafeAnthropicError,
} from "../supabase/functions/_shared/briefEditorial.ts";

type DiagnosticRequest = AnthropicEditorialRequest | Omit<AnthropicEditorialRequest, "output_config">;

interface PreviewRow {
  id: string;
  pmid: string;
  doi: string | null;
  title: string;
  abstract: string | null;
  journal: string | null;
  publication_date: string | null;
  publication_types: string[];
  study_type: EditorialCandidateSource["studyType"];
  sample_size: number | null;
  topics: string[];
  biomarker_tags: string[];
  safety_flags: string[];
  evidence_score: number;
  relevance_score: number;
  novelty_score: number;
  source_url: string;
}

interface PreviewInput {
  candidates: PreviewRow[];
}

interface DiagnosticResult {
  test: string;
  httpStatus: number | null;
  errorType: string | null;
  errorMessage: string | null;
  requestId: string | null;
  elapsedMs: number;
  validJsonReturned: boolean;
}

const SELECTED_PMIDS = ["42438056", "42443539", "42440326", "42442701", "42442374"];

function asEditorialCandidate(row: PreviewRow): EditorialCandidateSource {
  return {
    id: row.id,
    pmid: row.pmid,
    doi: row.doi,
    sourceUrl: row.source_url,
    title: row.title,
    abstract: row.abstract,
    journal: row.journal,
    publicationDate: row.publication_date,
    publicationTypes: row.publication_types,
    studyType: row.study_type,
    sampleSize: row.sample_size,
    topics: row.topics,
    biomarkerTags: row.biomarker_tags,
    safetyFlags: row.safety_flags,
    evidenceScore: row.evidence_score,
    relevanceScore: row.relevance_score,
    noveltyScore: row.novelty_score,
  };
}

function validJsonFromAnthropicEnvelope(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { content?: Array<{ type?: string; text?: string }> };
    const text = payload.content?.find((block) => block.type === "text")?.text;
    if (typeof text !== "string") return false;
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

async function runOnce(
  test: string,
  request: DiagnosticRequest,
  apiKey: string,
): Promise<DiagnosticResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  const startedAt = Date.now();
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (!response.ok) {
      const safeError = await extractSafeAnthropicError(response);
      return {
        test,
        httpStatus: safeError.httpStatus,
        errorType: safeError.errorType,
        errorMessage: safeError.errorMessage,
        requestId: safeError.requestId,
        elapsedMs: Date.now() - startedAt,
        validJsonReturned: false,
      };
    }
    const requestId = response.headers.get("request-id") ?? response.headers.get("x-request-id");
    const body = await response.text();
    return {
      test,
      httpStatus: response.status,
      errorType: null,
      errorMessage: null,
      requestId,
      elapsedMs: Date.now() - startedAt,
      validJsonReturned: validJsonFromAnthropicEnvelope(body),
    };
  } catch (error) {
    return {
      test,
      httpStatus: null,
      errorType: error instanceof DOMException && error.name === "AbortError" ? "timeout" : "network_error",
      errorMessage: error instanceof Error ? error.message.slice(0, 1_000) : "Request failed",
      requestId: null,
      elapsedMs: Date.now() - startedAt,
      validJsonReturned: false,
    };
  } finally {
    clearTimeout(timer);
  }
}

const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not available in the local environment");
const previewPath = Deno.args[0];
if (!previewPath) throw new Error("Usage: brief-anthropic-diagnostic.ts <read-only-preview-export.json>");
const preview = JSON.parse(await Deno.readTextFile(previewPath)) as PreviewInput;
const byPmid = new Map(preview.candidates.map((row) => [row.pmid, row]));
const selected = SELECTED_PMIDS.map((pmid) => byPmid.get(pmid));
if (selected.some((row) => !row)) throw new Error("The preview export does not contain every selected PMID");
const packets = buildEditorialSourcePacket(selected.map((row) => asEditorialCandidate(row!)));
const realRequest = buildAnthropicEditorialRequest(packets);
const testB: AnthropicEditorialRequest = {
  ...realRequest,
  max_tokens: 900,
  system: "Return only JSON matching the supplied schema.",
  messages: [{ role: "user", content: "Create five placeholder editorial items." }],
};
const tests: Array<[string, DiagnosticRequest]> = [
  ["A-minimal-schema", buildMinimalStructuredOutputRequest()],
  ["B-real-editorial-schema", testB],
  ["C-editorial-packet-plain-json", buildPlainJsonEditorialRequest(packets)],
];

for (const [name, request] of tests) {
  const result = await runOnce(name, request, apiKey);
  console.log(JSON.stringify(result));
}
