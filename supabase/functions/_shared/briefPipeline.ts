export type StudyType =
  | "meta-analysis"
  | "systematic-review"
  | "randomized-controlled-trial"
  | "clinical-trial"
  | "prospective-cohort"
  | "cohort-study"
  | "observational-study"
  | "case-report"
  | "animal-study"
  | "in-vitro-study"
  | "editorial"
  | "other";

export interface ResearchCandidate {
  pmid: string;
  doi: string | null;
  title: string;
  abstract: string | null;
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
export interface CandidateIdentity {
  pmid: string;
  doi?: string | null;
}

const TYPE_BASE_SCORE: Record<StudyType, number> = {
  "meta-analysis": 100,
  "systematic-review": 94,
  "randomized-controlled-trial": 88,
  "clinical-trial": 76,
  "prospective-cohort": 72,
  "cohort-study": 64,
  "observational-study": 52,
  "other": 35,
  "case-report": 14,
  "animal-study": 10,
  "in-vitro-study": 7,
  "editorial": 3,
};

export function classifyStudyType(
  publicationTypes: string[],
  title: string,
  abstract: string | null,
): StudyType {
  const types = publicationTypes.map((value) => value.toLowerCase());
  const text = `${title} ${abstract ?? ""}`.toLowerCase();
  const hasType = (needle: string) => types.some((value) => value.includes(needle));

  if (hasType("meta-analysis")) return "meta-analysis";
  if (hasType("systematic review") || text.includes("systematic review")) return "systematic-review";
  if (hasType("randomized controlled trial") || /randomi[sz]ed controlled trial/.test(text)) {
    return "randomized-controlled-trial";
  }
  if (hasType("clinical trial")) return "clinical-trial";
  if (/prospective.{0,20}cohort|cohort.{0,20}prospective/.test(text)) return "prospective-cohort";
  if (hasType("case reports") || /\bcase report\b/.test(text)) return "case-report";
  if (hasType("editorial") || hasType("comment") || hasType("letter")) return "editorial";
  if (/\bin vitro\b|cell line|cultured cells/.test(text)) return "in-vitro-study";
  if (hasType("animals") && !hasType("humans")) return "animal-study";
  if (/\b(mice|mouse|rats?|murine)\b/.test(text) && !/\bparticipants?|patients?|adults?|humans?\b/.test(text)) {
    return "animal-study";
  }
  if (/\bcohort\b/.test(text)) return "cohort-study";
  if (hasType("observational study") || /cross-sectional|case-control|observational/.test(text)) {
    return "observational-study";
  }
  return "other";
}

/** Extract only an explicitly stated participant count; unknown stays null. */
export function extractSampleSize(abstract: string | null): number | null {
  if (!abstract) return null;
  const patterns = [
    /\bn\s*=\s*([1-9][\d,]*)\b/i,
    /\b([1-9][\d,]*)\s+(?:participants?|patients?|adults?|subjects?|individuals?)\b/i,
    /\benrolled\s+([1-9][\d,]*)\b/i,
  ];
  for (const pattern of patterns) {
    const match = abstract.match(pattern);
    if (!match) continue;
    const parsed = Number.parseInt(match[1].replace(/,/g, ""), 10);
    if (Number.isSafeInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

export function deriveSafetyFlags(
  studyType: StudyType,
  abstract: string | null,
  publicationTypes: string[],
): string[] {
  const flags = new Set<string>();
  if (!abstract?.trim()) flags.add("missing-abstract");
  if (studyType === "animal-study") flags.add("animal-only");
  if (studyType === "in-vitro-study") flags.add("in-vitro");
  if (studyType === "case-report") flags.add("case-report");
  if (studyType === "editorial") flags.add("editorial-content");
  if (publicationTypes.some((value) => /retracted publication/i.test(value))) flags.add("retracted");
  return [...flags].sort();
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

export function scoreEvidence(
  studyType: StudyType,
  sampleSize: number | null,
  hasAbstract: boolean,
  safetyFlags: string[],
): number {
  let score = TYPE_BASE_SCORE[studyType];
  if (sampleSize !== null) {
    if (sampleSize >= 10_000) score += 12;
    else if (sampleSize >= 1_000) score += 9;
    else if (sampleSize >= 200) score += 5;
    else if (sampleSize < 20) score -= 15;
    else if (sampleSize < 50) score -= 8;
  }
  if (!hasAbstract) score -= 25;
  if (safetyFlags.includes("retracted")) score = 0;
  return clamp(score);
}

export function scoreRelevance(topics: string[], biomarkerTags: string[]): number {
  return clamp(35 + Math.min(4, new Set(topics).size) * 12 + Math.min(4, new Set(biomarkerTags).size) * 7);
}

export function scoreNovelty(publicationDate: string | null, now = new Date()): number {
  if (!publicationDate) return 20;
  const date = new Date(`${publicationDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return 20;
  const ageDays = Math.max(0, (now.getTime() - date.getTime()) / 86_400_000);
  if (ageDays <= 7) return 100;
  if (ageDays <= 14) return 90;
  if (ageDays <= 30) return 75;
  if (ageDays <= 90) return 50;
  return 20;
}

export function totalCandidateScore(candidate: ResearchCandidate): number {
  const safetyPenalty = candidate.safetyFlags.length * 8;
  return (
    candidate.evidenceScore * 0.5
    + candidate.relevanceScore * 0.3
    + candidate.noveltyScore * 0.2
    - safetyPenalty
  );
}

export function normalizeDoi(doi: string | null | undefined): string | null {
  if (!doi) return null;
  const normalized = doi.trim().toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "");
  return normalized || null;
}

/** Stable first-wins dedupe. DOI is checked in addition to the canonical PMID. */
export function deduplicateByIdentity<T extends CandidateIdentity>(items: T[]): T[] {
  const pmids = new Set<string>();
  const dois = new Set<string>();
  const unique: T[] = [];
  for (const item of items) {
    const pmid = item.pmid.trim();
    const doi = normalizeDoi(item.doi);
    if (!pmid || pmids.has(pmid) || (doi !== null && dois.has(doi))) continue;
    pmids.add(pmid);
    if (doi) dois.add(doi);
    unique.push(item);
  }
  return unique;
}

export function titleSimilarity(left: string, right: string): number {
  const tokens = (value: string) => new Set(
    value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((token) => token.length > 2),
  );
  const a = tokens(left);
  const b = tokens(right);
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

export function rankCandidates(candidates: ResearchCandidate[]): ResearchCandidate[] {
  const ranked = candidates.map((candidate) => {
    const nearDuplicate = candidates.some(
      (other) => other.pmid !== candidate.pmid
        && other.publicationDate !== null
        && titleSimilarity(candidate.title, other.title) >= 0.86
        && totalCandidateScore(other) > totalCandidateScore(candidate),
    );
    return nearDuplicate
      ? { ...candidate, noveltyScore: clamp(candidate.noveltyScore - 45) }
      : candidate;
  });
  return ranked.sort((a, b) => totalCandidateScore(b) - totalCandidateScore(a) || a.pmid.localeCompare(b.pmid));
}

/**
 * Selects one cover plus 3–4 briefs while penalizing repeated lead topics.
 * The returned order is editorial order and the first item is the cover.
 */
export function selectIssueCandidates(
  candidates: ResearchCandidate[],
  desiredCount = 5,
  recentTopics: string[] = [],
): ResearchCandidate[] {
  if (desiredCount < 4 || desiredCount > 5) throw new Error("Issue size must be 4 or 5");
  const eligible = rankCandidates(candidates).filter(
    (candidate) => candidate.abstract?.trim()
      && !candidate.safetyFlags.some((flag) => ["retracted", "editorial-content"].includes(flag)),
  );
  const selected: ResearchCandidate[] = [];
  const usedLeadTopics = new Set<string>();
  const recentlyCovered = new Set(recentTopics);

  while (selected.length < desiredCount && eligible.length > 0) {
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (let index = 0; index < eligible.length; index += 1) {
      const candidate = eligible[index];
      const leadTopic = candidate.topics[0] ?? "uncategorized";
      const repeatPenalty = usedLeadTopics.has(leadTopic) ? 32 : 0;
      const recentPenalty = recentlyCovered.has(leadTopic) ? 12 : 0;
      const score = totalCandidateScore(candidate) - repeatPenalty - recentPenalty;
      if (score > bestScore || (score === bestScore && candidate.pmid < eligible[bestIndex].pmid)) {
        bestScore = score;
        bestIndex = index;
      }
    }
    const [chosen] = eligible.splice(bestIndex, 1);
    selected.push(chosen);
    if (chosen.topics[0]) usedLeadTopics.add(chosen.topics[0]);
  }
  return selected;
}
