#!/usr/bin/env -S deno run --allow-env=ANTHROPIC_API_KEY --allow-net=eutils.ncbi.nlm.nih.gov,api.anthropic.com

import {
  type EditorialCandidateSource,
  buildAnthropicEditorialRequest,
  buildEditorialSourcePacket,
  evaluateEditorialIntelligence,
  validateEditorial,
} from "../supabase/functions/_shared/briefEditorial.ts";
import {
  classifyStudyType,
  deriveSafetyFlags,
  scoreEvidence,
} from "../supabase/functions/_shared/briefPipeline.ts";

const CURRENT_SELECTED_PMIDS = ["42438056", "42443539", "42440326", "42442701", "42442374"];

function decodeXml(value: string): string {
  const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(x?[0-9a-f]+);/gi, (_match, code: string) =>
      String.fromCodePoint(code[0].toLowerCase() === "x" ? Number.parseInt(code.slice(1), 16) : Number.parseInt(code, 10)))
    .replace(/&(amp|lt|gt|quot|apos);/g, (_match, name: string) => entities[name])
    .replace(/\s+/g, " ")
    .trim();
}

function firstXml(block: string, pattern: RegExp): string {
  const match = block.match(pattern);
  return match ? decodeXml(match[1]) : "";
}

function allXml(block: string, pattern: RegExp): string[] {
  return [...block.matchAll(pattern)].map((match) => decodeXml(match[1])).filter(Boolean);
}

async function fetchPubMedCandidates(pmids: string[]): Promise<EditorialCandidateSource[]> {
  const endpoint = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi");
  endpoint.search = new URLSearchParams({
    db: "pubmed",
    id: pmids.join(","),
    retmode: "xml",
    tool: "vitalspan",
    email: "editorial-preview@example.com",
  }).toString();
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`NCBI read failed with HTTP ${response.status}`);
  const xml = await response.text();
  const articleBlocks = [...xml.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g)].map((match) => match[1]);
  const byPmid = new Map(
    articleBlocks.map((block) => [firstXml(block, /<PMID[^>]*>([\s\S]*?)<\/PMID>/), block]),
  );

  return pmids.map((pmid) => {
    const block = byPmid.get(pmid);
    if (!block) throw new Error(`NCBI response omitted PMID ${pmid}`);
    const title = firstXml(block, /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/);
    const abstract = [...block.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g)]
      .map((match) => {
        const label = match[1].match(/Label="([^"]+)"/)?.[1];
        return `${label ? `${decodeXml(label)}: ` : ""}${decodeXml(match[2])}`;
      })
      .join("\n\n");
    const publicationTypes = allXml(block, /<PublicationType[^>]*>([\s\S]*?)<\/PublicationType>/g);
    const studyType = classifyStudyType(publicationTypes, title, abstract);
    const safetyFlags = deriveSafetyFlags(studyType, abstract, publicationTypes);
    return {
      id: `preview-${pmid}`,
      pmid,
      doi: firstXml(block, /<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/) || null,
      sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      title,
      abstract,
      journal: firstXml(block, /<Journal>[\s\S]*?<Title>([\s\S]*?)<\/Title>/) || null,
      publicationDate: null,
      publicationTypes,
      studyType,
      sampleSize: null,
      topics: [],
      biomarkerTags: [],
      safetyFlags,
      evidenceScore: scoreEvidence(studyType, null, Boolean(abstract), safetyFlags),
      relevanceScore: 0,
      noveltyScore: 0,
    };
  });
}

const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required for the local editorial preview");
const pmids = Deno.args.length > 0 ? Deno.args : CURRENT_SELECTED_PMIDS;
if (pmids.length !== 5 || pmids.some((pmid) => !/^\d+$/.test(pmid))) {
  throw new Error("Supply exactly five numeric PMIDs, or omit arguments to use the current selected preview set");
}

const candidates = await fetchPubMedCandidates(pmids);
const packets = buildEditorialSourcePacket(candidates);
const request = buildAnthropicEditorialRequest(packets);
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  },
  body: JSON.stringify(request),
});
if (!response.ok) throw new Error(`Anthropic preview failed with HTTP ${response.status}`);
const envelope = await response.json() as { content?: Array<{ type?: string; text?: string }> };
const text = envelope.content?.find((block) => block.type === "text")?.text;
if (typeof text !== "string") throw new Error("Anthropic preview returned no editorial JSON");

const raw = JSON.parse(text);
let validated;
try {
  validated = validateEditorial(raw, packets.map((packet) => packet.id), packets);
} catch (error) {
  console.log(JSON.stringify({
    readOnly: true,
    productionSupabaseCalled: false,
    selectedPmids: pmids,
    validationError: error instanceof Error ? error.message : String(error),
    raw,
  }, null, 2));
  Deno.exit(2);
}
const validation = evaluateEditorialIntelligence(validated, packets);
console.log(JSON.stringify({
  readOnly: true,
  productionSupabaseCalled: false,
  selectedPmids: pmids,
  editorialThesis: validated.editorialThesis,
  themeKeywords: validated.themeKeywords,
  issueTitle: validated.issueTitle,
  editorsLetter: validated.pharmacistNote,
  coverHeadline: validated.items[0].headline,
  briefHeadlines: validated.items.slice(1).map((item) => item.headline),
  validation,
}, null, 2));
