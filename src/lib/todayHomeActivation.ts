import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthRequestScope } from './authSessionCoordinator';
import {
  PROTOCOL_STORAGE_KEY,
  parseProtocolState,
  persistProtocolState,
  protocolDayKey,
  toggleProtocolCompletion,
} from './protocolPersistence';
import {
  captureAuthRequestScope,
  isAuthRequestScopeCurrent,
} from './supabase';

interface TodayHomeActivationStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
}

export interface TodayHomeActivationDependencies {
  readonly storage: TodayHomeActivationStorage;
  readonly captureScope: () => AuthRequestScope | null;
  readonly isScopeCurrent: (scope: AuthRequestScope) => boolean;
  readonly now: () => Date;
}

export type TodayPlanCompletionResult =
  | 'changed'
  | 'unchanged'
  | 'cancelled';

export type TodayMutationExecution<T> =
  | { readonly status: 'completed'; readonly value: T }
  | { readonly status: 'duplicate' };

export interface TodayMutationExecutor {
  run<T>(
    key: string,
    mutation: () => Promise<T>,
  ): Promise<TodayMutationExecution<T>>;
}

const DEFAULT_DEPENDENCIES: TodayHomeActivationDependencies = {
  storage: AsyncStorage,
  captureScope: captureAuthRequestScope,
  isScopeCurrent: isAuthRequestScopeCurrent,
  now: () => new Date(),
};

/**
 * Coalesces only concurrent mutation attempts. Entries exist for the lifetime
 * of the in-flight promise and are always released after settlement.
 */
export function createTodayMutationExecutor(): TodayMutationExecutor {
  const inFlight = new Set<string>();
  return {
    async run<T>(
      key: string,
      mutation: () => Promise<T>,
    ): Promise<TodayMutationExecution<T>> {
      if (inFlight.has(key)) return { status: 'duplicate' };
      inFlight.add(key);
      try {
        return { status: 'completed', value: await mutation() };
      } finally {
        inFlight.delete(key);
      }
    },
  };
}

/**
 * Bridges a resolved Today completion action to the existing Protocol
 * persistence contract. It adds no plan rules and performs no scientific work.
 */
export async function setTodayPlanItemCompletion(
  itemId: string,
  completed: boolean,
  dependencies: TodayHomeActivationDependencies = DEFAULT_DEPENDENCIES,
): Promise<TodayPlanCompletionResult> {
  const scope = dependencies.captureScope();
  if (!scope) return 'cancelled';

  const raw = await dependencies.storage.getItem(PROTOCOL_STORAGE_KEY);
  if (!dependencies.isScopeCurrent(scope)) return 'cancelled';

  const now = dependencies.now();
  const state = parseProtocolState(raw, now).state;
  const completedToday = state.takenDate === protocolDayKey(now)
    && state.taken.includes(itemId);
  if (completedToday === completed) return 'unchanged';

  const next = toggleProtocolCompletion(state, itemId, now);
  if (!dependencies.isScopeCurrent(scope)) return 'cancelled';

  await persistProtocolState(
    next,
    (key, value) => dependencies.storage.setItem(key, value),
  );
  return dependencies.isScopeCurrent(scope) ? 'changed' : 'cancelled';
}
