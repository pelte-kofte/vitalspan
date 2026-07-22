import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { adapty } from 'react-native-adapty';
import type { AdaptyProfile } from 'react-native-adapty';
import { fetchPremiumStatus, identifyAdaptyUser, logoutAdaptyUser } from '../lib/adapty';
import { useAuthSession } from './AuthSessionContext';
import { isAuthRequestScopeCurrent } from '../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PremiumContextValue {
  isPremium: boolean;
  /**
   * True while the first Adapty profile fetch is in-flight.
   * Prevents a locked-UI flash before premium status resolves (D-11 / pitfall 6).
   */
  isPremiumLoading: boolean;
  refreshPremium: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const PremiumContext = createContext<PremiumContextValue>({
  isPremium: false,
  isPremiumLoading: true,
  refreshPremium: async () => { /* no-op default */ },
});

// ─── Provider ────────────────────────────────────────────────────────────────

/**
 * Wraps the app tree and keeps isPremium in sync with the Adapty SDK.
 *
 * Source of truth chain:
 *   1. Mount → fetchPremiumStatus() for the initial value
 *   2. adapty.addEventListener('onLatestProfileLoad') fires on every profile
 *      update (purchase, restore, background refresh) — updates immediately
 *   3. AppState 'active' → refreshPremium() so foregrounding picks up any
 *      server-side grant that happened while the app was backgrounded
 *
 * Security: default is false (T-16-02). No AsyncStorage persistence (T-16-03).
 */
export function PremiumProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const auth = useAuthSession();
  const identifiedScopeRef = useRef<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumLoading, setIsPremiumLoading] = useState(true);

  const refreshPremium = async (): Promise<void> => {
    if (auth.status !== 'authenticated' || !auth.userId) {
      setIsPremium(false);
      setIsPremiumLoading(false);
      return;
    }
    const scope = { userId: auth.userId, generation: auth.generation };
    const identified = await identifyAdaptyUser(scope.userId);
    if (!isAuthRequestScopeCurrent(scope)) return;
    if (!identified) {
      setIsPremium(false);
      setIsPremiumLoading(false);
      return;
    }
    identifiedScopeRef.current = `${scope.generation}:${scope.userId}`;
    const result = await fetchPremiumStatus();
    if (!isAuthRequestScopeCurrent(scope)) return;
    setIsPremium(result);
    setIsPremiumLoading(false);
  };

  useEffect(() => {
    if (auth.status !== 'authenticated' || !auth.userId) {
      setIsPremium(false);
      setIsPremiumLoading(false);
      identifiedScopeRef.current = null;
      void logoutAdaptyUser();
      return;
    }
    const scope = { userId: auth.userId, generation: auth.generation };
    const scopeKey = `${scope.generation}:${scope.userId}`;
    identifiedScopeRef.current = null;
    setIsPremium(false);
    setIsPremiumLoading(true);

    // Initial load
    void refreshPremium();

    // Listen for Adapty profile pushes (purchases, restores, server-side grants)
    const listener = adapty.addEventListener(
      'onLatestProfileLoad',
      (profile: AdaptyProfile) => {
        if (!isAuthRequestScopeCurrent(scope) || identifiedScopeRef.current !== scopeKey) return;
        const active = profile.accessLevels?.['premium']?.isActive ?? false;
        setIsPremium(active);
        setIsPremiumLoading(false);
      },
    );

    // Re-check on foreground so any server-side change takes effect immediately
    const sub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshPremium();
      }
    });

    return () => {
      listener.remove();
      sub.remove();
    };
  // refreshPremium intentionally closes over this exact authenticated generation.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.generation, auth.status, auth.userId]);

  return (
    <PremiumContext.Provider value={{ isPremium, isPremiumLoading, refreshPremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePremiumContext(): PremiumContextValue {
  return useContext(PremiumContext);
}
