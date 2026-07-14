import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { DRAFT_ARTICLE_COUNT, MAX_EDITORIAL_POOL } from "../_shared/briefTopics.ts";
import {
  type ResearchCandidate,
  selectIssueCandidates,
} from "../_shared/briefPipeline.ts";
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
}

interface EditorialItem {
  id: string;
  headline: string;
  summary: string;
  whyItMatters: string;
  limitations: string;
  evidenceLabel: "High" | "Moderate" | "Preliminary" | "Limited";
}

interface EditorialResult {
  items: EditorialItem[];
  usage: { input_tokens?: number; output_tokens?: number } | null;
}

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
    publicationTypes: [],
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

function validateEditorial(raw: unknown, selectedIds: string[]): EditorialItem[] {
  const articles = (raw as { articles?: unknown[] })?.articles;
  if (!Array.isArray(articles) || articles.length !== selectedIds.length) {
    throw new Error("AI editorial response has the wrong article count");
  }
  const allowedLabels = new Set(["High", "Moderate", "Preliminary", "Limited"]);
  const byId = new Map<string, EditorialItem>();
  for (const item of articles) {
    const value = item as Partial<EditorialItem>;
    if (!value.id || !selectedIds.includes(value.id) || byId.has(value.id)) throw new Error("AI returned an invalid candidate id");
    for (const field of ["headline", "summary", "whyItMatters", "limitations"] as const) {
      if (typeof value[field] !== "string" || !value[field]!.trim()) throw new Error(`AI omitted ${field}`);
    }
    if (!value.evidenceLabel || !allowedLabels.has(value.evidenceLabel)) throw new Error("AI returned an invalid evidence label");
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

async function generateEditorial(rows: CandidateRow[]): Promise<EditorialResult> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required for editorial drafting");
  const sourcePackets = rows.map((row) => ({
    id: row.id,
    pmid: row.pmid,
    doi: row.doi,
    sourceTitle: row.title,
    abstract: row.abstract,
    journal: row.journal,
    publicationDate: row.publication_date,
    studyType: row.study_type,
    sampleSize: row.sample_size,
    topics: row.topics,
    biomarkerTags: row.biomarker_tags,
  }));
  const response = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("BRIEF_AI_MODEL") ?? "claude-sonnet-4-6",
      max_tokens: 2_200,
      system:
        "You are the editorial assistant for The Vitalspan Brief. Work only from each supplied PubMed metadata packet and abstract. "
        + "Do not add facts, effect sizes, sample sizes, study designs, journals, identifiers, diagnoses, treatment instructions, or clinical recommendations. "
        + "Never change an id, PMID, or DOI. Write restrained, premium science-desk copy for human pharmacist review. "
        + "Each summary must be 2-3 factual sentences. 'Why it matters' explains relevance without telling a reader what to take, stop, or change. "
        + "Limitations must name only limitations present or directly inferable from the supplied design/abstract; when detail is absent, say the abstract does not provide enough detail. "
        + "Evidence labels are High, Moderate, Preliminary, or Limited and must align conservatively with the supplied study type. "
        + "Return only JSON: {\"articles\":[{\"id\":\"uuid\",\"headline\":\"string\",\"summary\":\"string\",\"whyItMatters\":\"string\",\"limitations\":\"string\",\"evidenceLabel\":\"High|Moderate|Preliminary|Limited\"}]}",
      messages: [{ role: "user", content: JSON.stringify(sourcePackets) }],
    }),
  }, { attempts: 2, timeoutMs: 35_000, baseDelayMs: 1_000 });
  if (!response.ok) throw new Error(`Anthropic editorial request failed with HTTP ${response.status}`);
  const payload = await response.json();
  const text = payload?.content?.find((block: { type?: string }) => block.type === "text")?.text;
  if (typeof text !== "string") throw new Error("Anthropic returned no editorial text");
  return {
    items: validateEditorial(JSON.parse(text), rows.map((row) => row.id)),
    usage: payload?.usage ?? null,
  };
}

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  const runtime = authorizePipelineRequest(req);
  if (!runtime) return jsonResponse({ error: "Unauthorized or pipeline secrets are not configured" }, 401);
  let jobId: string | null = null;
  const stats: Record<string, unknown> = { pool: 0, selected: 0, draftId: null };

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
      .select("id,pmid,doi,title,abstract,journal,publication_date,study_type,sample_size,topics,biomarker_tags,safety_flags,evidence_score,relevance_score,novelty_score")
      .in("status", ["new", "shortlisted"])
      .order("evidence_score", { ascending: false })
      .order("relevance_score", { ascending: false })
      .limit(MAX_EDITORIAL_POOL);
    if (poolError) throw new Error(`Could not load candidate pool: ${poolError.message}`);
    const pool = (poolData ?? []) as CandidateRow[];
    stats.pool = pool.length;

    const { data: recentData, error: recentError } = await runtime.supabase
      .from("article_candidates")
      .select("topics")
      .eq("status", "published")
      .order("fetched_at", { ascending: false })
      .limit(10);
    if (recentError) throw new Error(`Could not load recent topics: ${recentError.message}`);
    const recentTopics = (recentData ?? []).flatMap((row) => (row.topics as string[]) ?? []);

    const selectedResearch = selectIssueCandidates(pool.map(asResearchCandidate), DRAFT_ARTICLE_COUNT, recentTopics);
    if (selectedResearch.length < 4) throw new Error("Fewer than four eligible candidates are available");
    const selectedRows = selectedResearch.map((candidate) => pool.find((row) => row.pmid === candidate.pmid)!);
    const editorialResult = await generateEditorial(selectedRows);
    const editorial = editorialResult.items;
    stats.selected = selectedRows.length;
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
        pharmacist_note_draft: "Pharmacist review required before publication.",
        title: `The Vitalspan Brief — Week of ${weekStart}`,
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
