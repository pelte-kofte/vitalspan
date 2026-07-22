import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthRequestScope } from './authSessionCoordinator';
import { isAuthRequestScopeCurrent, supabase } from './supabase';

export const USER_PROFILE_CACHE_KEY = '@vitalspan_user_profile';

export interface DurableUserProfile {
  name: string;
  age: number;
  sex: 'male' | 'female';
  goal: string;
  conditions: string[];
  medications: string[];
  onboardingComplete: boolean;
}

export interface UserProfile extends DurableUserProfile {
  biologicalAge?: number;
  bloodPhenotypicAge?: number;
}

export type UserProfilePatch = Partial<DurableUserProfile>;

export type ProfileHydrationResult =
  | { status: 'complete'; profile: UserProfile }
  | { status: 'incomplete' }
  | { status: 'error'; message: string }
  | { status: 'stale' };

export type ProfileRoute = 'Main' | 'Onboarding' | 'ProfileError' | 'loading';

export interface RemoteProfileSnapshot {
  exists: boolean;
  profile: DurableUserProfile | null;
}

export interface UserProfilePersistencePorts {
  getCached(): Promise<string | null>;
  setCached(value: string): Promise<void>;
  removeCached(): Promise<void>;
  fetchRemote(scope: AuthRequestScope): Promise<RemoteProfileSnapshot>;
  upsertRemote(profile: DurableUserProfile, scope: AuthRequestScope): Promise<DurableUserProfile>;
  updateRemote(patch: UserProfilePatch, scope: AuthRequestScope): Promise<DurableUserProfile>;
  deleteRemote(scope: AuthRequestScope): Promise<void>;
  isScopeCurrent(scope: AuthRequestScope): boolean;
}

interface RemoteProfileRow {
  name: string | null;
  age: number | null;
  sex: string | null;
  goal: string | null;
  conditions: string[] | null;
  medications: string[] | null;
  onboarding_complete: boolean;
}

const PROFILE_COLUMNS =
  'name, age, sex, goal, conditions, medications, onboarding_complete';

function isSupportedSex(value: unknown): value is DurableUserProfile['sex'] {
  return value === 'male' || value === 'female';
}

export function isCompleteUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<UserProfile>;
  return profile.onboardingComplete === true
    && typeof profile.name === 'string'
    && profile.name.trim().length > 0
    && typeof profile.age === 'number'
    && Number.isInteger(profile.age)
    && profile.age >= 18
    && profile.age <= 120
    && isSupportedSex(profile.sex)
    && typeof profile.goal === 'string'
    && profile.goal.trim().length > 0
    && Array.isArray(profile.conditions)
    && profile.conditions.every(item => typeof item === 'string')
    && Array.isArray(profile.medications)
    && profile.medications.every(item => typeof item === 'string');
}

function parseCachedProfile(raw: string | null): UserProfile | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isCompleteUserProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function toRemoteProfile(row: RemoteProfileRow): DurableUserProfile | null {
  const candidate: DurableUserProfile = {
    name: row.name ?? '',
    age: row.age ?? 0,
    sex: isSupportedSex(row.sex) ? row.sex : 'male',
    goal: row.goal ?? '',
    conditions: row.conditions ?? [],
    medications: row.medications ?? [],
    onboardingComplete: row.onboarding_complete,
  };
  return isCompleteUserProfile(candidate) ? candidate : null;
}

function toRemotePayload(profile: UserProfilePatch): Record<string, unknown> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (profile.name !== undefined) payload.name = profile.name;
  if (profile.age !== undefined) payload.age = profile.age;
  if (profile.sex !== undefined) payload.sex = profile.sex;
  if (profile.goal !== undefined) payload.goal = profile.goal;
  if (profile.conditions !== undefined) payload.conditions = profile.conditions;
  if (profile.medications !== undefined) payload.medications = profile.medications;
  if (profile.onboardingComplete !== undefined) {
    payload.onboarding_complete = profile.onboardingComplete;
  }
  return payload;
}

function mergeDerived(
  durable: DurableUserProfile,
  cached: UserProfile | null,
): UserProfile {
  return {
    ...durable,
    ...(cached?.biologicalAge === undefined ? {} : { biologicalAge: cached.biologicalAge }),
    ...(cached?.bloodPhenotypicAge === undefined
      ? {}
      : { bloodPhenotypicAge: cached.bloodPhenotypicAge }),
  };
}

const defaultPorts: UserProfilePersistencePorts = {
  getCached: () => AsyncStorage.getItem(USER_PROFILE_CACHE_KEY),
  setCached: value => AsyncStorage.setItem(USER_PROFILE_CACHE_KEY, value),
  removeCached: () => AsyncStorage.removeItem(USER_PROFILE_CACHE_KEY),
  isScopeCurrent: isAuthRequestScopeCurrent,
  async fetchRemote(scope) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(PROFILE_COLUMNS)
      .eq('user_id', scope.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return { exists: false, profile: null };
    return { exists: true, profile: toRemoteProfile(data as RemoteProfileRow) };
  },
  async upsertRemote(profile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(toRemotePayload(profile), {
        onConflict: 'user_id',
        defaultToNull: false,
      })
      .select(PROFILE_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    const saved = toRemoteProfile(data as RemoteProfileRow);
    if (!saved) throw new Error('Saved profile is incomplete');
    return saved;
  },
  async updateRemote(patch, scope) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(toRemotePayload(patch))
      .eq('user_id', scope.userId)
      .select(PROFILE_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    const saved = toRemoteProfile(data as RemoteProfileRow);
    if (!saved) throw new Error('Updated profile is incomplete');
    return saved;
  },
  async deleteRemote(scope) {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', scope.userId);
    if (error) throw new Error(error.message);
  },
};

export class UserProfilePersistence {
  constructor(private readonly ports: UserProfilePersistencePorts = defaultPorts) {}

  async hydrate(
    scope: AuthRequestScope,
    registeredAccount: boolean,
  ): Promise<ProfileHydrationResult> {
    try {
      const cached = parseCachedProfile(await this.ports.getCached());
      if (!this.ports.isScopeCurrent(scope)) return { status: 'stale' };

      if (!registeredAccount) {
        return cached
          ? { status: 'complete', profile: cached }
          : { status: 'incomplete' };
      }

      const remote = await this.ports.fetchRemote(scope);
      if (!this.ports.isScopeCurrent(scope)) return { status: 'stale' };
      if (remote.profile) {
        const hydrated = mergeDerived(remote.profile, cached);
        await this.ports.setCached(JSON.stringify(hydrated));
        return { status: 'complete', profile: hydrated };
      }

      // A real remote row is authoritative even when incomplete. Never let a
      // stale local completion overwrite a profile the server says is incomplete.
      if (remote.exists) {
        await this.ports.removeCached();
        return { status: 'incomplete' };
      }

      // One-time upgrade path for accounts that completed onboarding before
      // governed profile persistence existed. The owner marker and auth scope
      // guarantee this cache belongs to the current identity.
      if (cached) {
        const saved = await this.ports.upsertRemote(cached, scope);
        if (!this.ports.isScopeCurrent(scope)) return { status: 'stale' };
        const hydrated = mergeDerived(saved, cached);
        await this.ports.setCached(JSON.stringify(hydrated));
        return { status: 'complete', profile: hydrated };
      }

      await this.ports.removeCached();
      return { status: 'incomplete' };
    } catch (error: unknown) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async saveCompleted(
    scope: AuthRequestScope,
    profile: DurableUserProfile,
    registeredAccount: boolean,
  ): Promise<UserProfile> {
    if (!isCompleteUserProfile(profile)) throw new Error('Profile is incomplete');
    const cached = parseCachedProfile(await this.ports.getCached());
    const durable = registeredAccount
      ? await this.ports.upsertRemote(profile, scope)
      : profile;
    if (!this.ports.isScopeCurrent(scope)) throw new Error('Session changed');
    const saved = mergeDerived(durable, cached);
    await this.ports.setCached(JSON.stringify(saved));
    return saved;
  }

  async update(
    scope: AuthRequestScope,
    patch: UserProfilePatch,
    registeredAccount: boolean,
  ): Promise<UserProfile> {
    const cached = parseCachedProfile(await this.ports.getCached());
    if (!cached) throw new Error('Profile cache is unavailable');
    const desired = { ...cached, ...patch };
    if (!isCompleteUserProfile(desired)) throw new Error('Profile update is incomplete');
    const durable = registeredAccount
      ? await this.ports.updateRemote(patch, scope)
      : desired;
    if (!this.ports.isScopeCurrent(scope)) throw new Error('Session changed');
    const saved = mergeDerived(durable, cached);
    await this.ports.setCached(JSON.stringify(saved));
    return saved;
  }

  async delete(scope: AuthRequestScope, registeredAccount: boolean): Promise<void> {
    if (registeredAccount) await this.ports.deleteRemote(scope);
    if (!this.ports.isScopeCurrent(scope)) throw new Error('Session changed');
    await this.ports.removeCached();
  }
}

export function profileRouteForHydration(
  result: ProfileHydrationResult | null,
): ProfileRoute {
  if (!result || result.status === 'stale') return 'loading';
  if (result.status === 'complete') return 'Main';
  if (result.status === 'incomplete') return 'Onboarding';
  return 'ProfileError';
}

export const userProfilePersistence = new UserProfilePersistence();
