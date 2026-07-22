import type { AuthRequestScope } from '../lib/authSessionCoordinator';
import {
  profileRouteForHydration,
  UserProfilePersistence,
  type DurableUserProfile,
  type RemoteProfileSnapshot,
  type UserProfilePatch,
  type UserProfilePersistencePorts,
} from '../lib/userProfilePersistence';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('../lib/supabase', () => ({
  supabase: { from: jest.fn() },
  isAuthRequestScopeCurrent: jest.fn(() => true),
}));

const scopeA: AuthRequestScope = { userId: 'apple-user-a', generation: 3 };
const scopeB: AuthRequestScope = { userId: 'apple-user-b', generation: 5 };

const profileA: DurableUserProfile = {
  name: 'Ada',
  age: 42,
  sex: 'female',
  goal: 'Optimize healthspan',
  conditions: ['Hypertension'],
  medications: ['Lisinopril'],
  onboardingComplete: true,
};

const profileB: DurableUserProfile = {
  name: 'Ben',
  age: 38,
  sex: 'male',
  goal: 'Track & understand',
  conditions: [],
  medications: [],
  onboardingComplete: true,
};

class FakePorts implements UserProfilePersistencePorts {
  cache: string | null = null;
  remote: RemoteProfileSnapshot = { exists: false, profile: null };
  currentScope: AuthRequestScope | null = scopeA;
  readonly fetchRemote = jest.fn(async (): Promise<RemoteProfileSnapshot> => this.remote);
  readonly upsertRemote = jest.fn(async (profile: DurableUserProfile) => {
    this.remote = { exists: true, profile };
    return profile;
  });
  readonly updateRemote = jest.fn(async (patch: UserProfilePatch) => {
    if (!this.remote.profile) throw new Error('profile missing');
    const updated = { ...this.remote.profile, ...patch };
    this.remote = { exists: true, profile: updated };
    return updated;
  });
  readonly deleteRemote = jest.fn(async () => {
    this.remote = { exists: false, profile: null };
  });

  async getCached(): Promise<string | null> { return this.cache; }
  async setCached(value: string): Promise<void> { this.cache = value; }
  async removeCached(): Promise<void> { this.cache = null; }
  isScopeCurrent(scope: AuthRequestScope): boolean {
    return this.currentScope?.userId === scope.userId
      && this.currentScope?.generation === scope.generation;
  }
}

describe('durable onboarding profile consistency', () => {
  test('same Apple user logout/login reloads the durable profile and skips onboarding', async () => {
    const ports = new FakePorts();
    ports.remote = { exists: true, profile: profileA };
    const persistence = new UserProfilePersistence(ports);

    const first = await persistence.hydrate(scopeA, true);
    expect(first).toEqual({ status: 'complete', profile: profileA });
    expect(profileRouteForHydration(first)).toBe('Main');

    // Logout removes only the session cache; the account row remains intact.
    ports.cache = null;
    expect(ports.remote.profile).toEqual(profileA);

    const second = await persistence.hydrate(scopeA, true);
    expect(second).toEqual({ status: 'complete', profile: profileA });
    expect(profileRouteForHydration(second)).toBe('Main');
    expect(ports.deleteRemote).not.toHaveBeenCalled();
  });

  test('loading cannot route to onboarding before hydration is conclusive', () => {
    expect(profileRouteForHydration(null)).toBe('loading');
    expect(profileRouteForHydration({ status: 'stale' })).toBe('loading');
  });

  test('an existing incomplete remote profile is authoritative and routes to onboarding', async () => {
    const ports = new FakePorts();
    ports.remote = { exists: true, profile: null };
    ports.cache = JSON.stringify(profileA);
    const persistence = new UserProfilePersistence(ports);

    const result = await persistence.hydrate(scopeA, true);

    expect(result).toEqual({ status: 'incomplete' });
    expect(profileRouteForHydration(result)).toBe('Onboarding');
    expect(ports.cache).toBeNull();
    expect(ports.upsertRemote).not.toHaveBeenCalled();
  });

  test('a pre-migration local profile is promoted once only when no remote row exists', async () => {
    const ports = new FakePorts();
    ports.cache = JSON.stringify(profileA);
    const persistence = new UserProfilePersistence(ports);

    const result = await persistence.hydrate(scopeA, true);

    expect(result.status).toBe('complete');
    expect(ports.upsertRemote).toHaveBeenCalledTimes(1);
    expect(ports.remote.profile).toEqual(profileA);

    const retry = await persistence.hydrate(scopeA, true);
    expect(retry.status).toBe('complete');
    expect(ports.upsertRemote).toHaveBeenCalledTimes(1);
  });

  test('User A response cannot commit after User B becomes active', async () => {
    let resolveFetch!: (snapshot: RemoteProfileSnapshot) => void;
    const ports = new FakePorts();
    ports.fetchRemote.mockImplementationOnce(() => new Promise(resolve => {
      resolveFetch = resolve;
    }));
    const persistence = new UserProfilePersistence(ports);
    const pendingA = persistence.hydrate(scopeA, true);
    await Promise.resolve();

    ports.currentScope = scopeB;
    ports.cache = null;
    resolveFetch({ exists: true, profile: profileA });
    await expect(pendingA).resolves.toEqual({ status: 'stale' });
    expect(ports.cache).toBeNull();

    ports.remote = { exists: true, profile: profileB };
    const resultB = await persistence.hydrate(scopeB, true);
    expect(resultB).toEqual({ status: 'complete', profile: profileB });
    expect(JSON.parse(ports.cache!)).toMatchObject({ name: 'Ben' });
  });

  test('remote failure is recoverable and never starts onboarding', async () => {
    const ports = new FakePorts();
    ports.fetchRemote.mockRejectedValueOnce(new Error('network unavailable'));
    const persistence = new UserProfilePersistence(ports);

    const result = await persistence.hydrate(scopeA, true);

    expect(result).toEqual({ status: 'error', message: 'network unavailable' });
    expect(profileRouteForHydration(result)).toBe('ProfileError');
  });
});
