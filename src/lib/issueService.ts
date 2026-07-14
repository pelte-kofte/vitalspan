/**
 * issueService.ts — "The Vitalspan Brief" weekly editorial reads.
 * Pure Supabase reads only. Issues are published through the human-approved
 * Brief pipeline documented in CONTENT_GUIDE.md, never fetched live here.
 */
import { supabase } from './supabase';
import { Article } from './articleService';

// Types -----------------------------------------------------------------------

export interface Issue {
  issueNumber: number;
  publishDate: string; // ISO date, e.g. "2026-07-06"
  coverArticleId: string | null;
  articleIds: string[];
  pharmacistNote: string | null;
}

export interface IssueWithArticles extends Issue {
  coverArticle: Article | null;
  briefArticles: Article[];
}

interface IssueRow {
  issue_number: number;
  publish_date: string;
  cover_article_id: string | null;
  article_ids: string[] | null;
  pharmacist_note: string | null;
}

// Internal helpers ------------------------------------------------------------

function mapIssueRow(row: IssueRow): Issue {
  return {
    issueNumber: row.issue_number,
    publishDate: row.publish_date,
    coverArticleId: row.cover_article_id,
    articleIds: row.article_ids ?? [],
    pharmacistNote: row.pharmacist_note,
  };
}

async function attachArticles(issue: Issue): Promise<IssueWithArticles> {
  // Issue 0 is the synthetic legacy archive — its membership is every article
  // tagged issue_number = 0 by the migration backfill, not an article_ids list.
  if (issue.issueNumber === 0) {
    const { data } = await supabase.from('articles').select('*').eq('issue_number', 0);
    return { ...issue, coverArticle: null, briefArticles: (data as Article[] | null) ?? [] };
  }

  if (issue.articleIds.length === 0) {
    return { ...issue, coverArticle: null, briefArticles: [] };
  }

  const { data } = await supabase.from('articles').select('*').in('pmid', issue.articleIds);
  const byPmid = new Map<string, Article>((data as Article[] | null ?? []).map((a) => [a.pmid, a]));
  const coverArticle = issue.coverArticleId ? byPmid.get(issue.coverArticleId) ?? null : null;
  const briefArticles = issue.articleIds
    .filter((id) => id !== issue.coverArticleId)
    .map((id) => byPmid.get(id))
    .filter((a): a is Article => a != null);

  return { ...issue, coverArticle, briefArticles };
}

// Exported functions ------------------------------------------------------------

/** All issues (including the synthetic Issue 0 archive), newest first. */
export async function loadAllIssues(): Promise<Issue[]> {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('issue_number', { ascending: false });
    if (error || !data) return [];
    return (data as IssueRow[]).map(mapIssueRow);
  } catch (e) {
    console.error('[issueService] loadAllIssues error', e);
    return [];
  }
}

/** Fetches one issue by number with its cover + brief articles resolved. */
export async function loadIssueWithArticles(issueNumber: number): Promise<IssueWithArticles | null> {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('issue_number', issueNumber)
      .maybeSingle();
    if (error || !data) return null;
    return await attachArticles(mapIssueRow(data as IssueRow));
  } catch (e) {
    console.error('[issueService] loadIssueWithArticles error', e);
    return null;
  }
}

/** Fetches one article by PMID for the reading view. */
export async function loadArticleByPmid(pmid: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase.from('articles').select('*').eq('pmid', pmid).maybeSingle();
    if (error || !data) return null;
    return data as Article;
  } catch (e) {
    console.error('[issueService] loadArticleByPmid error', e);
    return null;
  }
}
