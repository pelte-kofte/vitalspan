/** Rough reading time from word count at ~200wpm, minimum 1 minute. */
export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export interface EditorialArticleCopy {
  summary: string;
  whyItMatters: string | null;
}

/**
 * Published Brief articles store the edited summary and takeaway together.
 * Keep that storage contract intact while presenting each piece in its own
 * editorial section. Legacy abstracts simply remain a summary.
 */
export function splitEditorialArticle(text: string | null): EditorialArticleCopy {
  if (!text?.trim()) return { summary: '', whyItMatters: null };

  const marker = /\n\s*\nWhy it matters:\s*/i;
  const match = marker.exec(text);
  if (!match || match.index < 0) {
    return { summary: text.trim(), whyItMatters: null };
  }

  const summary = text.slice(0, match.index).trim();
  const whyItMatters = text.slice(match.index + match[0].length).trim();
  return { summary, whyItMatters: whyItMatters || null };
}

/** A single, deterministic deck sentence for issue contents. */
export function articleDeck(text: string | null): string | null {
  const { summary, whyItMatters } = splitEditorialArticle(text);
  const source = whyItMatters ?? summary;
  if (!source) return null;

  const normalized = source.replace(/\s+/g, ' ').trim();
  const sentence = normalized.match(/^.*?[.!?](?=\s|$)/)?.[0];
  return sentence ?? normalized;
}

/** Human-readable labels for database-safe study-type slugs. */
export function formatStudyType(studyType: string | null | undefined): string {
  if (!studyType?.trim()) return 'Study';
  return studyType
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function articleCategory(topics: string[] | undefined, studyType?: string | null): string {
  const topic = topics?.find((value) => value.trim().length > 0);
  if (topic) return topic.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  return formatStudyType(studyType);
}

/** Formats an ISO date ("2026-07-06") as "Jul 6, 2026". Falls back to the raw string if unparseable. */
export function formatIssueDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
