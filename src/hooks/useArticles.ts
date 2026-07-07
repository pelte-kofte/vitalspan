import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Article,
  loadCachedArticles,
  refreshArticlesIfStale,
  forceRefreshArticles,
} from '../lib/articleService';

export interface StoredEntry { biomarkerId: string; value: number; date: string; unit: string }

export interface UseArticlesResult {
  articles: Article[];
  loading: boolean;
  refreshing: boolean;
  entries: StoredEntry[];
  onRefresh: () => Promise<void>;
}

async function readEntries(): Promise<StoredEntry[]> {
  try {
    const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
    return raw ? (JSON.parse(raw) as StoredEntry[]) : [];
  } catch {
    return [];
  }
}

export function useArticles(): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [entries, setEntries] = useState<StoredEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      const parsed = await readEntries();
      if (!cancelled) setEntries(parsed);

      const cached = await loadCachedArticles(parsed);
      if (!cancelled) {
        if (cached.length > 0) { setArticles(cached); setLoading(false); }
        else setLoading(true);
      }

      const fresh = await refreshArticlesIfStale(parsed);
      if (!cancelled) {
        if (fresh !== null) setArticles(fresh);
        setLoading(false);
      }
    }

    init().catch((e) => {
      console.error('[useArticles] init error', e);
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const parsed = await readEntries();
    setEntries(parsed);
    const result = await forceRefreshArticles(parsed);
    if (result !== null) setArticles(result);
    setRefreshing(false);
  };

  return { articles, loading, refreshing, entries, onRefresh };
}
