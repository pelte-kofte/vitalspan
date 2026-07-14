import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.5.3";
import {
  BRIEF_TOPICS,
  INGESTION_LOOKBACK_DAYS,
  MAX_RESULTS_PER_TOPIC,
} from "../_shared/briefTopics.ts";
import {
  classifyStudyType,
  deduplicateByIdentity,
  deriveSafetyFlags,
  extractSampleSize,
  normalizeDoi,
  scoreEvidence,
  scoreNovelty,
  scoreRelevance,
} from "../_shared/briefPipeline.ts";
import {
  authorizePipelineRequest,
  fetchWithRetry,
  finishPublicationJob,
  jsonResponse,
  startPublicationJob,
} from "../_shared/briefRuntime.ts";

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", trimValues: true });

type JsonObject = Record<string, unknown>;

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function textOf(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(" ");
  if (value && typeof value === "object") {
    const object = value as JsonObject;
    return Object.entries(object)
      .filter(([key]) => !key.startsWith("@_"))
      .map(([, child]) => textOf(child))
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function nested(object: unknown, ...keys: string[]): unknown {
  let current = object;
  for (const key of keys) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as JsonObject)[key];
  }
  return current;
}

function isoDate(article: JsonObject): string | null {
  const articleDate = asArray(nested(article, "MedlineCitation", "Article", "ArticleDate"))[0] as JsonObject | undefined;
  const pubDate = nested(article, "MedlineCitation", "Article", "Journal", "JournalIssue", "PubDate") as JsonObject | undefined;
  const source = articleDate ?? pubDate;
  if (!source) return null;
  const year = textOf(source.Year);
  const rawDay = Number.parseInt(textOf(source.Day), 10);
  const day = rawDay >= 1 && rawDay <= 31 ? String(rawDay).padStart(2, "0") : "01";
  const rawMonth = textOf(source.Month);
  const monthMap: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const numericMonth = Number.parseInt(rawMonth, 10);
  const month = monthMap[rawMonth.slice(0, 3)]
    ?? (numericMonth >= 1 && numericMonth <= 12 ? String(numericMonth).padStart(2, "0") : "01");
  if (/^\d{4}$/.test(year)) return `${year}-${month}-${day}`;

  const medlineDate = textOf(source.MedlineDate);
  const match = medlineDate.match(/\b(19|20)\d{2}\b/);
  return match ? `${match[0]}-01-01` : null;
}

function extractDoi(article: JsonObject): string | null {
  const ids = asArray(nested(article, "PubmedData", "ArticleIdList", "ArticleId"));
  for (const raw of ids) {
    if (raw && typeof raw === "object" && (raw as JsonObject)["@_IdType"] === "doi") {
      return normalizeDoi(textOf(raw));
    }
  }
  return null;
}

function extractAuthors(article: JsonObject): JsonObject[] {
  return asArray(nested(article, "MedlineCitation", "Article", "AuthorList", "Author"))
    .map((raw) => raw as JsonObject)
    .map((author) => ({
      family: textOf(author.LastName) || null,
      given: textOf(author.ForeName) || null,
      initials: textOf(author.Initials) || null,
      collective: textOf(author.CollectiveName) || null,
    }));
}

function extractAbstract(article: JsonObject): string | null {
  const sections = asArray(nested(article, "MedlineCitation", "Article", "Abstract", "AbstractText"));
  const text = sections.map((section) => {
    const label = section && typeof section === "object" ? textOf((section as JsonObject)["@_Label"]) : "";
    const value = textOf(section);
    return label && value ? `${label}: ${value}` : value;
  }).filter(Boolean).join("\n\n");
  return text || null;
}

function buildNcbiParams(email: string, apiKey: string | undefined): URLSearchParams {
  const params = new URLSearchParams({ tool: Deno.env.get("NCBI_TOOL") ?? "VitalspanBrief", email });
  if (apiKey) params.set("api_key", apiKey);
  return params;
}

async function ncbiRequest(url: string, delayMs: number): Promise<Response> {
  const response = await fetchWithRetry(url, {}, { attempts: 3, timeoutMs: 20_000, baseDelayMs: 750 });
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  if (!response.ok) throw new Error(`NCBI request failed with HTTP ${response.status}`);
  return response;
}

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  const runtime = authorizePipelineRequest(req);
  if (!runtime) return jsonResponse({ error: "Unauthorized or pipeline secrets are not configured" }, 401);

  const email = Deno.env.get("NCBI_EMAIL");
  const apiKey = Deno.env.get("NCBI_API_KEY");
  if (!email) return jsonResponse({ error: "NCBI_EMAIL is required" }, 500);
  const requestDelayMs = apiKey ? 110 : 350;
  let jobId: string | null = null;
  const stats: Record<string, unknown> = { topics: BRIEF_TOPICS.length, discovered: 0, parsed: 0, inserted: 0, duplicates: 0 };

  try {
    jobId = await startPublicationJob(runtime.supabase, "ingestion");
    const now = new Date();
    const minimum = new Date(now.getTime() - INGESTION_LOOKBACK_DAYS * 86_400_000);
    const formatNcbiDate = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, "/");
    const pmidTopics = new Map<string, Set<string>>();

    for (const topic of BRIEF_TOPICS) {
      const params = buildNcbiParams(email, apiKey);
      params.set("db", "pubmed");
      params.set("retmode", "json");
      params.set("retmax", String(MAX_RESULTS_PER_TOPIC));
      params.set("sort", "pub date");
      params.set("datetype", "pdat");
      params.set("mindate", formatNcbiDate(minimum));
      params.set("maxdate", formatNcbiDate(now));
      params.set("term", topic.query);
      const response = await ncbiRequest(`${EUTILS}/esearch.fcgi?${params}`, requestDelayMs);
      const result = await response.json();
      if (result?.error || result?.esearchresult?.ERROR) {
        throw new Error(`NCBI ESearch error for ${topic.id}`);
      }
      const pmids: string[] = result?.esearchresult?.idlist ?? [];
      for (const pmid of pmids) {
        const topics = pmidTopics.get(pmid) ?? new Set<string>();
        topics.add(topic.id);
        pmidTopics.set(pmid, topics);
      }
    }

    const discoveredPmids = [...pmidTopics.keys()].sort();
    stats.discovered = discoveredPmids.length;
    const rawArticles: JsonObject[] = [];
    for (let offset = 0; offset < discoveredPmids.length; offset += 80) {
      const params = buildNcbiParams(email, apiKey);
      params.set("db", "pubmed");
      params.set("retmode", "xml");
      params.set("rettype", "abstract");
      params.set("id", discoveredPmids.slice(offset, offset + 80).join(","));
      const response = await ncbiRequest(`${EUTILS}/efetch.fcgi?${params}`, requestDelayMs);
      const xml = await response.text();
      const parsed = parser.parse(xml);
      rawArticles.push(...asArray(nested(parsed, "PubmedArticleSet", "PubmedArticle")) as JsonObject[]);
    }
    if (discoveredPmids.length > 0 && rawArticles.length === 0) {
      throw new Error("NCBI EFetch returned no parseable PubMed articles");
    }

    const candidates = rawArticles.map((raw) => {
      const pmid = textOf(nested(raw, "MedlineCitation", "PMID"));
      const title = textOf(nested(raw, "MedlineCitation", "Article", "ArticleTitle"));
      const abstract = extractAbstract(raw);
      const publicationTypes = asArray(nested(raw, "MedlineCitation", "Article", "PublicationTypeList", "PublicationType"))
        .map(textOf).filter(Boolean);
      const studyType = classifyStudyType(publicationTypes, title, abstract);
      const sampleSize = extractSampleSize(abstract);
      const safetyFlags = deriveSafetyFlags(studyType, abstract, publicationTypes);
      const topics = [...(pmidTopics.get(pmid) ?? [])].sort();
      const biomarkerTags = [...new Set(BRIEF_TOPICS
        .filter((topic) => topics.includes(topic.id))
        .flatMap((topic) => topic.biomarkerTags))].sort();
      const publicationDate = isoDate(raw);
      return {
        pmid,
        doi: extractDoi(raw),
        title,
        abstract,
        journal: textOf(nested(raw, "MedlineCitation", "Article", "Journal", "Title")) || null,
        authors: extractAuthors(raw),
        publication_date: publicationDate,
        fetched_at: now.toISOString(),
        study_type: studyType,
        sample_size: sampleSize,
        topics,
        biomarker_tags: biomarkerTags,
        evidence_score: scoreEvidence(studyType, sampleSize, Boolean(abstract), safetyFlags),
        relevance_score: scoreRelevance(topics, biomarkerTags),
        novelty_score: scoreNovelty(publicationDate, now),
        safety_flags: safetyFlags,
        source_url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        status: "new",
        raw_metadata: {
          pmid,
          doi: extractDoi(raw),
          title,
          abstract,
          journal: textOf(nested(raw, "MedlineCitation", "Article", "Journal", "Title")) || null,
          authors: extractAuthors(raw),
          publicationDate,
          publicationTypes,
          ncbiRecord: raw,
        },
      };
    }).filter((candidate) => candidate.pmid && candidate.title);

    const unique = deduplicateByIdentity(candidates);
    stats.parsed = unique.length;
    stats.duplicates = candidates.length - unique.length;
    const pmids = unique.map((candidate) => candidate.pmid);
    const dois = unique.map((candidate) => candidate.doi).filter((doi): doi is string => Boolean(doi));
    const existingPmids = new Set<string>();
    const existingDois = new Set<string>();

    for (const table of ["article_candidates", "articles"] as const) {
      if (pmids.length) {
        const { data, error } = await runtime.supabase.from(table).select("pmid").in("pmid", pmids);
        if (error) throw new Error(`Could not check ${table} PMIDs: ${error.message}`);
        for (const row of data ?? []) existingPmids.add(row.pmid as string);
      }
      if (dois.length) {
        const { data, error } = await runtime.supabase.from(table).select("doi").in("doi", dois);
        if (error) throw new Error(`Could not check ${table} DOIs: ${error.message}`);
        for (const row of data ?? []) if (row.doi) existingDois.add(normalizeDoi(row.doi as string)!);
      }
    }

    const fresh = unique.filter((candidate) => !existingPmids.has(candidate.pmid)
      && (!candidate.doi || !existingDois.has(normalizeDoi(candidate.doi)!)));
    stats.duplicates = Number(stats.duplicates) + unique.length - fresh.length;
    if (fresh.length) {
      const { error } = await runtime.supabase.from("article_candidates").insert(fresh);
      if (error) throw new Error(`Candidate insert failed: ${error.message}`);
    }
    stats.inserted = fresh.length;

    await finishPublicationJob(runtime.supabase, jobId, "completed", stats);
    return jsonResponse({ jobId, ...stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("brief-ingest failed", message);
    if (jobId) await finishPublicationJob(runtime.supabase, jobId, "failed", stats, message);
    return jsonResponse({ error: "Ingestion failed", jobId }, 500);
  }
});
