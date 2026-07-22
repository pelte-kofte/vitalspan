import { useState, useEffect, useCallback } from 'react';
import { Issue, IssueWithArticles, loadAllIssues, loadIssueWithArticles } from '../lib/issueService';

export interface UseIssueResult {
  issue: IssueWithArticles | null;
  /** Populated only for the current-issue view (issueNumber param omitted) — every
   * other issue, including the legacy "Issue 0" archive. Empty on a past-issue view. */
  pastIssues: Issue[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

/** Loads a specific issue by number, or the current (latest, issueNumber > 0) issue when omitted. */
export function useIssue(issueNumber?: number): UseIssueResult {
  const [issue, setIssue] = useState<IssueWithArticles | null>(null);
  const [pastIssues, setPastIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    if (issueNumber !== undefined) {
      const result = await loadIssueWithArticles(issueNumber, forceRefresh);
      return { issue: result, pastIssues: [] as Issue[] };
    }

    const all = await loadAllIssues(forceRefresh); // newest first
    const current = all.find((i) => i.issueNumber > 0) ?? null;
    return {
      issue: current
        ? await loadIssueWithArticles(current.issueNumber, forceRefresh, current)
        : null,
      pastIssues: all.filter((i) => i.issueNumber !== current?.issueNumber),
    };
  }, [issueNumber]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .then(result => {
        if (cancelled) return;
        setIssue(result.issue);
        setPastIssues(result.pastIssues);
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        console.error('[useIssue] load error', message);
        setError(message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await load(true);
      setIssue(result.issue);
      setPastIssues(result.pastIssues);
      setError(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('[useIssue] refresh error', message);
      setError(message);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return { issue, pastIssues, loading, refreshing, error, onRefresh };
}
