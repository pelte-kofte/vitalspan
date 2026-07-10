import { useState, useEffect, useCallback } from 'react';
import { Issue, IssueWithArticles, loadAllIssues, loadIssueWithArticles } from '../lib/issueService';

export interface UseIssueResult {
  issue: IssueWithArticles | null;
  /** Populated only for the current-issue view (issueNumber param omitted) — every
   * other issue, including the legacy "Issue 0" archive. Empty on a past-issue view. */
  pastIssues: Issue[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

/** Loads a specific issue by number, or the current (latest, issueNumber > 0) issue when omitted. */
export function useIssue(issueNumber?: number): UseIssueResult {
  const [issue, setIssue] = useState<IssueWithArticles | null>(null);
  const [pastIssues, setPastIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (issueNumber !== undefined) {
      const result = await loadIssueWithArticles(issueNumber);
      setIssue(result);
      setPastIssues([]);
      return;
    }

    const all = await loadAllIssues(); // newest first
    const current = all.find((i) => i.issueNumber > 0) ?? null;
    setPastIssues(all.filter((i) => i.issueNumber !== current?.issueNumber));
    setIssue(current ? await loadIssueWithArticles(current.issueNumber) : null);
  }, [issueNumber]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((e) => console.error('[useIssue] load error', e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return { issue, pastIssues, loading, refreshing, onRefresh };
}
