import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { adapty } from 'react-native-adapty';
import type { AdaptyProfile } from 'react-native-adapty';
import { fetchPremiumStatus } from '../lib/adapty';

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
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumLoading, setIsPremiumLoading] = useState(true);

  const refreshPremium = async (): Promise<void> => {
    const result = await fetchPremiumStatus();
    setIsPremium(result);
    setIsPremiumLoading(false);
  };

  useEffect(() => {
    // Initial load
    refreshPremium();

    // Listen for Adapty profile pushes (purchases, restores, server-side grants)
    const listener = adapty.addEventListener(
      'onLatestProfileLoad',
      (profile: AdaptyProfile) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
