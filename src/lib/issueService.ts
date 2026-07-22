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
    const { data, error } = await supabase.from('articles').select('*').eq('issue_number', 0);
    if (error) throw new Error(error.message);
    return { ...issue, coverArticle: null, briefArticles: (data as Article[] | null) ?? [] };
  }

  if (issue.articleIds.length === 0) {
    return { ...issue, coverArticle: null, briefArticles: [] };
  }

  const { data, error } = await supabase.from('articles').select('*').in('pmid', issue.articleIds);
  if (error) throw new Error(error.message);
  const byPmid = new Map<string, Article>((data as Article[] | null ?? []).map((a) => [a.pmid, a]));
  const coverArticle = issue.coverArticleId ? byPmid.get(issue.coverArticleId) ?? null : null;
  const briefArticles = issue.articleIds
    .filter((id) => id !== issue.coverArticleId)
    .map((id) => byPmid.get(id))
    .filter((a): a is Article => a != null);

  return { ...issue, coverArticle, briefArticles };
}

// Exported functions ------------------------------------------------------------

let issueIndexCache: Issue[] | null = null;
let issueIndexRequest: Promise<Issue[]> | null = null;
const issueDetailCache = new Map<number, IssueWithArticles>();
const issueDetailRequests = new Map<number, Promise<IssueWithArticles | null>>();

/** All issues (including the synthetic Issue 0 archive), newest first. */
export async function loadAllIssues(forceRefresh = false): Promise<Issue[]> {
  if (!forceRefresh && issueIndexCache) return issueIndexCache;
  if (!forceRefresh && issueIndexRequest) return issueIndexRequest;

  const request = (async () => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('issue_number', { ascending: false });
    if (error) throw new Error(error.message);
    const issues = ((data ?? []) as IssueRow[]).map(mapIssueRow);
    issueIndexCache = issues;
    return issues;
  })();

  issueIndexRequest = request;
  try {
    return await request;
  } finally {
    if (issueIndexRequest === request) issueIndexRequest = null;
  }
}

/** Fetches one issue by number with its cover + brief articles resolved. */
export async function loadIssueWithArticles(
  issueNumber: number,
  forceRefresh = false,
  knownIssue?: Issue,
): Promise<IssueWithArticles | null> {
  if (!forceRefresh && issueDetailCache.has(issueNumber)) {
    return issueDetailCache.get(issueNumber) ?? null;
  }
  if (!forceRefresh && issueDetailRequests.has(issueNumber)) {
    return issueDetailRequests.get(issueNumber)!;
  }

  const request = (async () => {
    const issue = knownIssue
      ?? (await loadAllIssues(forceRefresh)).find(item => item.issueNumber === issueNumber);
    if (!issue) return null;
    const result = await attachArticles(issue);
    issueDetailCache.set(issueNumber, result);
    return result;
  })();

  issueDetailRequests.set(issueNumber, request);
  try {
    return await request;
  } finally {
    if (issueDetailRequests.get(issueNumber) === request) {
      issueDetailRequests.delete(issueNumber);
    }
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

/** Test and sign-out hygiene; published editorial data itself is not user-scoped. */
export function clearIssueServiceCache(): void {
  issueIndexCache = null;
  issueIndexRequest = null;
  issueDetailCache.clear();
  issueDetailRequests.clear();
}
