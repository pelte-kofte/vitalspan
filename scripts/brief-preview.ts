#!/usr/bin/env -S deno run --allow-read

import {
  type ResearchCandidate,
  buildEditorialShortlist,
  classifyStudyType,
  deriveSafetyFlags,
  rankEligibleCandidates,
  scoreEvidence,
  selectIssueCandidates,
  selectRankedIssueCandidates,
} from "../supabase/functions/_shared/briefPipeline.ts";
import {
  type EditorialCandidateSource,
  buildAnthropicEditorialRequest,
  buildEditorialSourcePacket,
  estimateInputTokens,
  utf8ByteLength,
} from "../supabase/functions/_shared/briefEditorial.ts";
import {
  DRAFT_ARTICLE_COUNT,
  MAX_EDITORIAL_SHORTLIST,
} from "../supabase/functions/_shared/briefTopics.ts";

interface PreviewRow {
  id: string;
  pmid: string;
  doi: string | null;
  title: string;
  abstract: string | null;
  journal: string | null;
  publication_date: string | null;
  publication_types: string[];
  study_type: ResearchCandidate["studyType"];
  sample_size: number | null;
  topics: string[];
  biomarker_tags: string[];
  safety_flags: string[];
  evidence_score: number;
  relevance_score: number;
  novelty_score: number;
  source_url: string;
  status: string;
}

interface PreviewInput {
  storedCount: number;
  candidates: PreviewRow[];
  recentTopics: string[];
}

function canonical(row: PreviewRow): PreviewRow {
  const studyType = classifyStudyType(row.publication_types, row.title, row.abstract);
  const safetyFlags = deriveSafetyFlags(studyType, row.abstract, row.publication_types);
  return {
    ...row,
    study_type: studyType,
    safety_flags: safetyFlags,
    evidence_score: scoreEvidence(studyType, row.sample_size, Boolean(row.abstract?.trim()), safetyFlags),
  };
}

function research(row: PreviewRow): ResearchCandidate {
  return {
    pmid: row.pmid,
    doi: row.doi,
    title: row.title,
    abstract: row.abstract,
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

function editorial(row: PreviewRow): EditorialCandidateSource {
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

function legacyRequest(rows: PreviewRow[]) {
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
  return {
    model: "claude-sonnet-4-6",
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
  };
}

function estimateLegacyInputTokens(request: ReturnType<typeof legacyRequest>): number {
  return Math.ceil(utf8ByteLength(JSON.stringify({ system: request.system, messages: request.messages })) / 4);
}

const inputPath = Deno.args[0];
if (!inputPath) throw new Error("Usage: brief-preview.ts <read-only-candidate-export.json>");
const input = JSON.parse(await Deno.readTextFile(inputPath)) as PreviewInput;
const active = input.candidates.filter((row) => ["new", "shortlisted"].includes(row.status)).map(canonical);
const byPmid = new Map(active.map((row) => [row.pmid, row]));

const legacyPool = active.slice(0, 24);
const legacySelected = selectIssueCandidates(legacyPool.map(research), DRAFT_ARTICLE_COUNT, input.recentTopics)
  .map((candidate) => byPmid.get(candidate.pmid)!);
const oldRequest = legacyRequest(legacySelected);
const oldBody = JSON.stringify(oldRequest);

const rankedEligible = rankEligibleCandidates(active.map(research));
const shortlist = buildEditorialShortlist(active.map(research), MAX_EDITORIAL_SHORTLIST);
const selected = selectRankedIssueCandidates(shortlist, DRAFT_ARTICLE_COUNT, input.recentTopics)
  .map((candidate) => byPmid.get(candidate.pmid)!);
const packets = buildEditorialSourcePacket(selected.map(editorial));
const newRequest = buildAnthropicEditorialRequest(packets);
const newBody = JSON.stringify(newRequest);
const forbiddenFlags = new Set([
  "retracted",
  "editorial",
  "editorial-content",
  "protocol",
  "incomplete-evidence",
  "conference-abstract",
  "missing-abstract",
]);

console.log(JSON.stringify({
  readOnly: true,
  anthropicCalled: false,
  storedCandidateCount: input.storedCount,
  activeCandidateCount: active.length,
  old: {
    loadedPoolCount: legacyPool.length,
    aiCandidateCount: legacySelected.length,
    pmids: legacySelected.map((row) => row.pmid),
    payloadBytes: utf8ByteLength(oldBody),
    estimatedInputTokens: estimateLegacyInputTokens(oldRequest),
    fullAbstracts: true,
    rawMetadataIncluded: false,
  },
  proposed: {
    rankedCandidateCount: active.length,
    eligibleCandidateCount: rankedEligible.length,
    deterministicShortlistCount: shortlist.length,
    aiCandidateCount: selected.length,
    pmids: selected.map((row) => row.pmid),
    payloadBytes: utf8ByteLength(newBody),
    estimatedInputTokens: estimateInputTokens(newRequest),
    maxAbstractCharacters: 2_400,
    rawMetadataIncluded: packets.some((packet) => "raw_metadata" in packet || "rawMetadata" in packet),
    weakOrIncompleteExcluded: selected.every((row) =>
      Boolean(row.abstract?.trim()) && !row.safety_flags.some((flag) => forbiddenFlags.has(flag))
    ),
    selectedSafetyFlags: selected.map((row) => ({ pmid: row.pmid, flags: row.safety_flags })),
  },
}, null, 2));
