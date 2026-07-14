import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  DRAFT_ARTICLE_COUNT,
  MAX_EDITORIAL_SHORTLIST,
  MAX_RANKING_POOL,
} from "../_shared/briefTopics.ts";
import {
  type ResearchCandidate,
  buildEditorialShortlist,
  classifyStudyType,
  deriveSafetyFlags,
  rankEligibleCandidates,
  scoreEvidence,
  selectRankedIssueCandidates,
} from "../_shared/briefPipeline.ts";
import {
  type EditorialCandidateSource,
  type EditorialItem,
  buildAnthropicEditorialRequest,
  buildEditorialSourcePacket,
  extractSafeAnthropicError,
  safeEditorialRequestMetrics,
  validateEditorial,
} from "../_shared/briefEditorial.ts";
import {
  type FetchAttemptMetadata,
  FetchRequestError,
} from "../_shared/fetchWithRetry.ts";
import {
  authorizePipelineRequest,
  fetchWithRetry,
  finishPublicationJob,
  jsonResponse,
  startPublicationJob,
} from "../_shared/briefRuntime.ts";

interface CandidateRow {
  id: string;
  pmid: string;
  doi: string | null;
  title: string;
  abstract: string | null;
  journal: string | null;
  publication_date: string | null;
  study_type: ResearchCandidate["studyType"];
  sample_size: number | null;
  topics: string[];
  biomarker_tags: string[];
  safety_flags: string[];
  evidence_score: number;
  relevance_score: number;
  novelty_score: number;
  source_url: string;
  publication_types: unknown;
}

function normalizePublicationTypes(values: unknown): string[] {
  return Array.isArray(values) ? values.filter((value): value is string => typeof value === "string") : [];
}

function withCanonicalClassification(row: CandidateRow): CandidateRow {
  const publicationTypes = normalizePublicationTypes(row.publication_types);
  const studyType = classifyStudyType(publicationTypes, row.title, row.abstract);
  const safetyFlags = deriveSafetyFlags(studyType, row.abstract, publicationTypes);
  return {
    ...row,
    study_type: studyType,
    safety_flags: safetyFlags,
    evidence_score: scoreEvidence(studyType, row.sample_size, Boolean(row.abstract?.trim()), safetyFlags),
  };
}

interface EditorialResult {
  issue: {
    issueTitle: string;
    pharmacistNote: string;
    items: EditorialItem[];
  };
  usage: { input_tokens?: number; output_tokens?: number } | null;
}

interface SafeAnthropicStats {
  candidateCount: number;
  payloadBytes: number;
  estimatedInputTokens: number;
  attemptCount: number;
  elapsedMs: number;
  errorCategory: string | null;
  httpStatus: number | null;
  upstreamErrorType: string | null;
  upstreamErrorMessage: string | null;
  requestId: string | null;
  attempts: FetchAttemptMetadata[];
}

const ANTHROPIC_ATTEMPT_TIMEOUT_MS = 80_000;
// The scheduler has a 120s HTTP deadline. This total budget leaves time to
// persist the failed job and is also below Supabase's 150s request-idle limit.
const ANTHROPIC_TOTAL_TIMEOUT_MS = 110_000;
const ANTHROPIC_MAX_ATTEMPTS = 2;
const ANTHROPIC_RETRY_DELAY_MS = 750;

function mondayUtc(date = new Date()): string {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const offset = (copy.getUTCDay() + 6) % 7;
  copy.setUTCDate(copy.getUTCDate() - offset);
  return copy.toISOString().slice(0, 10);
}

function asResearchCandidate(row: CandidateRow): ResearchCandidate {
  return {
    pmid: row.pmid,
    doi: row.doi,
    title: row.title,
    abstract: row.abstract,
    publicationDate: row.publication_date,
    publicationTypes: normalizePublicationTypes(row.publication_types),
    studyType: row.study_type,
    sampleSize: row.sample_size,
    topics: row.topics,
    biomarkerTags: row.biomarker_tags,
    safetyFlags: row.safety_flags,
    evidenceScore: Number(row.evidence_score),
    relevanceScore: Number(row.relevance_score),
    noveltyScore: Number(row.novelty_score),
  };
}

function asEditorialCandidate(row: CandidateRow): EditorialCandidateSource {
  return {
    id: row.id,
    pmid: row.pmid,
    doi: row.doi,
    sourceUrl: row.source_url,
    title: row.title,
    abstract: row.abstract,
    journal: row.journal,
    publicationDate: row.publication_date,
    publicationTypes: normalizePublicationTypes(row.publication_types),
    studyType: row.study_type,
    sampleSize: row.sample_size,
    topics: row.topics,
    biomarkerTags: row.biomarker_tags,
    safetyFlags: row.safety_flags,
    evidenceScore: Number(row.evidence_score),
    relevanceScore: Number(row.relevance_score),
    noveltyScore: Number(row.novelty_score),
  };
}

async function generateEditorial(rows: CandidateRow[], stats: SafeAnthropicStats): Promise<EditorialResult> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required for editorial drafting");
  const sourcePackets = buildEditorialSourcePacket(rows.map(asEditorialCandidate));
  const request = buildAnthropicEditorialRequest(
    sourcePackets,
    Deno.env.get("BRIEF_AI_MODEL") ?? undefined,
  );
  const body = JSON.stringify(request);
  const requestMetrics = safeEditorialRequestMetrics(request, sourcePackets.length);
  stats.candidateCount = requestMetrics.candidateCount;
  stats.payloadBytes = requestMetrics.payloadBytes;
  stats.estimatedInputTokens = requestMetrics.estimatedInputTokens;
  console.info("brief-draft Anthropic request metrics", JSON.stringify({
    candidateCount: stats.candidateCount,
    payloadBytes: stats.payloadBytes,
    estimatedInputTokens: stats.estimatedInputTokens,
  }));

  const startedAt = Date.now();
  try {
    const response = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body,
    }, {
      attempts: ANTHROPIC_MAX_ATTEMPTS,
      timeoutMs: ANTHROPIC_ATTEMPT_TIMEOUT_MS,
      totalTimeoutMs: ANTHROPIC_TOTAL_TIMEOUT_MS,
      baseDelayMs: ANTHROPIC_RETRY_DELAY_MS,
      maxDelayMs: ANTHROPIC_RETRY_DELAY_MS,
      onAttempt: (metadata) => {
        stats.attempts.push(metadata);
        stats.attemptCount = stats.attempts.length;
        stats.errorCategory = metadata.errorCategory;
        console.info("brief-draft Anthropic attempt", JSON.stringify(metadata));
      },
    });
    stats.elapsedMs = Date.now() - startedAt;
    if (!response.ok) {
      stats.errorCategory = response.status >= 400 && response.status < 500 ? "permanent_4xx" : "server_error";
      const safeError = await extractSafeAnthropicError(response);
      stats.httpStatus = safeError.httpStatus;
      stats.upstreamErrorType = safeError.errorType;
      stats.upstreamErrorMessage = safeError.errorMessage;
      stats.requestId = safeError.requestId;
      stats.elapsedMs = Date.now() - startedAt;
      console.error("brief-draft Anthropic safe error", JSON.stringify(safeError));
      const detail = [safeError.errorType, safeError.errorMessage].filter(Boolean).join(": ");
      throw new Error(
        `Anthropic editorial request failed with HTTP ${response.status}${detail ? `: ${detail}` : ""}`,
      );
    }

    let payload: {
      content?: Array<{ type?: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    try {
      payload = await response.json();
      const text = payload.content?.find((block) => block.type === "text")?.text;
      if (typeof text !== "string") throw new Error("Anthropic returned no editorial text");
      return {
        issue: validateEditorial(JSON.parse(text), rows.map((row) => row.id)),
        usage: payload.usage ?? null,
      };
    } catch (error) {
      stats.errorCategory = "schema_validation";
      throw error;
    }
  } catch (error) {
    stats.elapsedMs = Date.now() - startedAt;
    if (error instanceof FetchRequestError) stats.errorCategory = error.category;
    throw error;
  }
}

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  const runtime = authorizePipelineRequest(req);
  if (!runtime) return jsonResponse({ error: "Unauthorized or pipeline secrets are not configured" }, 401);
  let jobId: string | null = null;
  const stats: Record<string, unknown> = { pool: 0, shortlist: 0, selected: 0, draftId: null };

  try {
    jobId = await startPublicationJob(runtime.supabase, "editorial_generation");
    const weekStart = mondayUtc();
    const { data: existing, error: existingError } = await runtime.supabase
      .from("editorial_drafts")
      .select("id")
      .eq("editorial_week", weekStart)
      .neq("status", "rejected")
      .limit(1)
      .maybeSingle();
    if (existingError) throw new Error(`Could not check weekly draft: ${existingError.message}`);
    if (existing) {
      stats.draftId = existing.id;
      stats.idempotent = true;
      await finishPublicationJob(runtime.supabase, jobId, "completed", stats);
      return jsonResponse({ jobId, ...stats });
    }

    const { data: poolData, error: poolError } = await runtime.supabase
      .from("article_candidates")
      .select("id,pmid,doi,title,abstract,journal,publication_date,study_type,sample_size,topics,biomarker_tags,safety_flags,evidence_score,relevance_score,novelty_score,source_url,publication_types:raw_metadata->publicationTypes")
      .in("status", ["new", "shortlisted"])
      .order("evidence_score", { ascending: false })
      .order("relevance_score", { ascending: false })
      .limit(MAX_RANKING_POOL);
    if (poolError) throw new Error(`Could not load candidate pool: ${poolError.message}`);
    const pool = ((poolData ?? []) as CandidateRow[]).map(withCanonicalClassification);
    stats.pool = pool.length;

    const { data: recentData, error: recentError } = await runtime.supabase
      .from("article_candidates")
      .select("topics")
      .eq("status", "published")
      .order("fetched_at", { ascending: false })
      .limit(10);
    if (recentError) throw new Error(`Could not load recent topics: ${recentError.message}`);
    const recentTopics = (recentData ?? []).flatMap((row) => (row.topics as string[]) ?? []);

    const researchPool = pool.map(asResearchCandidate);
    const rankedEligible = rankEligibleCandidates(researchPool);
    const deterministicShortlist = buildEditorialShortlist(researchPool, MAX_EDITORIAL_SHORTLIST);
    stats.shortlist = deterministicShortlist.length;
    stats.excludedWeakOrIncomplete = pool.length - rankedEligible.length;
    const selectedResearch = selectRankedIssueCandidates(
      deterministicShortlist,
      DRAFT_ARTICLE_COUNT,
      recentTopics,
    );
    if (selectedResearch.length < 4) throw new Error("Fewer than four eligible candidates are available");
    const selectedRows = selectedResearch.map((candidate) => pool.find((row) => row.pmid === candidate.pmid)!);
    stats.selected = selectedRows.length;
    const anthropicStats: SafeAnthropicStats = {
      candidateCount: 0,
      payloadBytes: 0,
      estimatedInputTokens: 0,
      attemptCount: 0,
      elapsedMs: 0,
      errorCategory: null,
      httpStatus: null,
      upstreamErrorType: null,
      upstreamErrorMessage: null,
      requestId: null,
      attempts: [],
    };
    stats.anthropic = anthropicStats;
    const editorialResult = await generateEditorial(selectedRows, anthropicStats);
    const editorial = editorialResult.issue.items;
    stats.aiUsage = editorialResult.usage;

    for (const item of editorial) {
      const { error } = await runtime.supabase
        .from("article_candidates")
        .update({
          editorial_headline: item.headline,
          ai_summary: item.summary,
          ai_takeaway: item.whyItMatters,
          limitations: item.limitations,
          evidence_label: item.evidenceLabel,
          status: "shortlisted",
        })
        .eq("id", item.id)
        .in("status", ["new", "shortlisted"])
        .select("id")
        .single();
      if (error) throw new Error(`Could not store editorial copy: ${error.message}`);
    }

    const { data: issueRows, error: issueError } = await runtime.supabase
      .from("issues")
      .select("issue_number")
      .gt("issue_number", 0)
      .order("issue_number", { ascending: false })
      .limit(1);
    if (issueError) throw new Error(`Could not propose issue number: ${issueError.message}`);
    const proposedIssueNumber = ((issueRows?.[0]?.issue_number as number | undefined) ?? 0) + 1;
    const selectedIds = selectedRows.map((row) => row.id);
    const { data: draft, error: draftError } = await runtime.supabase
      .from("editorial_drafts")
      .insert({
        issue_number: proposedIssueNumber,
        editorial_week: weekStart,
        proposed_publish_date: new Date().toISOString().slice(0, 10),
        cover_candidate_id: selectedIds[0],
        candidate_ids: selectedIds,
        pharmacist_note_draft: editorialResult.issue.pharmacistNote,
        title: editorialResult.issue.issueTitle,
        status: "ready_for_review",
      })
      .select("id")
      .single();
    if (draftError || !draft) throw new Error(`Could not create editorial draft: ${draftError?.message ?? "unknown error"}`);
    stats.draftId = draft.id;

    await finishPublicationJob(runtime.supabase, jobId, "completed", stats);
    return jsonResponse({ jobId, ...stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("brief-draft failed", message);
    if (jobId) await finishPublicationJob(runtime.supabase, jobId, "failed", stats, message);
    return jsonResponse({ error: "Draft generation failed", jobId }, 500);
  }
});
