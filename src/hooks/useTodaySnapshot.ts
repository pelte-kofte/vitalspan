import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuthSession } from '../context/AuthSessionContext';
import {
  loadTodayDataSnapshot,
  type TodayDataLoadOptions,
} from '../lib/todayData';
import type { TodayDataSnapshot } from '../types/todayData';

export interface UseTodaySnapshotResult {
  readonly snapshot: TodayDataSnapshot | null;
  readonly loading: boolean;
  readonly refreshing: boolean;
  readonly error: Error | null;
  readonly refresh: (options?: TodayDataLoadOptions) => Promise<void>;
}

export function useTodaySnapshot(): UseTodaySnapshotResult {
  const auth = useAuthSession();
  const requestSequence = useRef(0);
  const [snapshot, setSnapshot] = useState<TodayDataSnapshot | null>(null);
  const [loading, setLoading] = useState(auth.status === 'initializing');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const runLoad = useCallback(async (
    options: TodayDataLoadOptions,
    mode: 'initial' | 'refresh',
  ): Promise<void> => {
    const requestId = ++requestSequence.current;
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);

    try {
      const next = await loadTodayDataSnapshot(options);
      if (requestSequence.current !== requestId) return;
      setSnapshot(next);
      setError(null);
    } catch (reason: unknown) {
      if (requestSequence.current !== requestId) return;
      setError(reason instanceof Error ? reason : new Error(String(reason)));
    } finally {
      if (requestSequence.current !== requestId) return;
      if (mode === 'initial') setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (auth.status !== 'authenticated') {
      requestSequence.current += 1;
      setSnapshot(null);
      setError(null);
      setLoading(auth.status === 'initializing');
      setRefreshing(false);
      return;
    }

    void runLoad({}, 'initial');
    return () => {
      requestSequence.current += 1;
    };
  }, [auth.generation, auth.status, runLoad]);

  const refresh = useCallback(async (
    options: TodayDataLoadOptions = {},
  ): Promise<void> => {
    if (auth.status !== 'authenticated') return;
    await runLoad(options, 'refresh');
  }, [auth.status, runLoad]);

  return { snapshot, loading, refreshing, error, refresh };
}
