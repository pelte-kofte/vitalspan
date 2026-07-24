import type { ExerciseLogEntry } from '../data/exercises';
import type { HealthData } from '../lib/healthkit';
import type { UserProfile } from '../lib/userProfilePersistence';
import type { StoredEntry } from './biomarkerEntry';
import type { ProtocolState } from './protocol';

export type DeepReadonly<T> =
  T extends (...args: never[]) => unknown
    ? T
    : T extends readonly (infer Item)[]
      ? readonly DeepReadonly<Item>[]
      : T extends object
        ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
        : T;

/**
 * Immutable account-scoped inputs available to the Today experience.
 *
 * This is a data contract only. It contains no scientific calculation,
 * interpretation, presentation copy, priority, or recommendation.
 */
export interface TodayDataSnapshot {
  readonly capturedAt: string;
  readonly localDay: string;
  readonly profile: DeepReadonly<UserProfile> | null;
  readonly biomarkerEntries: readonly DeepReadonly<StoredEntry>[];
  readonly protocol: DeepReadonly<ProtocolState>;
  readonly exerciseLogs: readonly DeepReadonly<ExerciseLogEntry>[];
  readonly healthData: DeepReadonly<HealthData> | null;
}
