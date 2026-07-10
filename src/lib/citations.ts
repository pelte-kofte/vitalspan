/**
 * citations.ts — Tolerant parser for inline PubMed citations in AI Advisor chat replies.
 *
 * The advisor's system prompt asks the model to cite as "Smith et al. 2022, PMID 12345678",
 * but model output format varies (missing author, "PMID:", lowercase "pmid", etc.) — this
 * parser is deliberately loose: it anchors on the PMID (the one thing we can trust the model
 * to reproduce reliably) and best-efforts an author/year label from the text just before it.
 */

export interface ParsedCitation {
  pmid: string;
  label: string; // e.g. "Smith et al. (2022)" or "PMID 12345678" when no author/year found
}

const PMID_PATTERN = /pmid:?\s*(\d{6,9})/gi;
const AUTHOR_YEAR_BEFORE_PMID = /([A-Z][A-Za-z'’-]+(?:\s+et al\.?)?)\s*,?\s*\(?(\d{4})\)?\s*,?\s*$/;

/** Parses PMIDs (and, where possible, an author/year label) out of free-form chat text. */
export function parseCitations(text: string): ParsedCitation[] {
  const seen = new Set<string>();
  const citations: ParsedCitation[] = [];

  for (const match of text.matchAll(PMID_PATTERN)) {
    const pmid = match[1];
    if (seen.has(pmid)) continue;
    seen.add(pmid);

    const precedingText = text.slice(Math.max(0, match.index! - 60), match.index!);
    const authorYearMatch = precedingText.match(AUTHOR_YEAR_BEFORE_PMID);

    const label = authorYearMatch
      ? `${authorYearMatch[1]} (${authorYearMatch[2]})`
      : `PMID ${pmid}`;

    citations.push({ pmid, label });
  }

  return citations;
}
