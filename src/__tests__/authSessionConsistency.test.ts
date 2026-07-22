import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import {
  AuthSessionCoordinator,
  type AuthClientPort,
  type AuthStoragePort,
} from '../lib/authSessionCoordinator';

const OWNER_KEY = '@vitalspan_auth_owner_id';
const USER_KEYS = ['profile', 'biomarkers', 'premium-cache'] as const;

function session(userId: string, token = `token-${userId}`, anonymous = false): Session {
  return {
    access_token: token,
    refresh_token: `refresh-${userId}`,
    expires_in: 3600,
    expires_at: 2_000_000_000,
    token_type: 'bearer',
    user: {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email: anonymous ? undefined : `${userId}@example.com`,
      is_anonymous: anonymous,
      app_metadata: {},
      user_metadata: {},
      identities: [],
      created_at: '2026-01-01T00:00:00.000Z',
    } as User,
  };
}

class MemoryStorage implements AuthStoragePort {
  readonly values = new Map<string, string>();
  readonly removals: string[][] = [];

  async getItem(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.values.delete(key);
  }

  async multiRemove(keys: readonly string[]): Promise<void> {
    this.removals.push([...keys]);
    for (const key of keys) this.values.delete(key);
  }
}

class FakeAuth implements AuthClientPort {
  currentSession: Session | null;
  getSessionError: Error | null = null;
  listenerCount = 0;
  private callback: ((event: AuthChangeEvent, session: Session | null) => void) | null = null;

  constructor(initialSession: Session | null) {
    this.currentSession = initialSession;
  }

  async getSession() {
    if (this.getSessionError) throw this.getSessionError;
    return { data: { session: this.currentSession }, error: null };
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, value: Session | null) => void) {
    this.callback = callback;
    this.listenerCount += 1;
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listenerCount -= 1;
            this.callback = null;
          },
        },
      },
    };
  }

  async signOut() {
    this.currentSession = null;
    return { error: null };
  }

  emit(event: AuthChangeEvent, value: Session | null): void {
    this.currentSession = value;
    this.callback?.(event, value);
  }
}

function setup(initialSession: Session | null, ownerId?: string, initializationTimeoutMs?: number) {
  const auth = new FakeAuth(initialSession);
  const storage = new MemoryStorage();
  if (ownerId) storage.values.set(OWNER_KEY, ownerId);
  const identityCleanup = jest.fn(async () => undefined);
  const coordinator = new AuthSessionCoordinator({
    auth,
    storage,
    ownerStorageKey: OWNER_KEY,
    userScopedStorageKeys: USER_KEYS,
    onIdentityCleared: identityCleanup,
    initializationTimeoutMs,
  });
  return { auth, storage, identityCleanup, coordinator };
}

async function settle(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe('Auth Session Consistency test matrix', () => {
  test('A. cold start with no session fails closed and clears stale local state', async () => {
    const { coordinator, storage } = setup(null);
    storage.values.set('profile', 'User A');
    await coordinator.initialize();
    expect(coordinator.getSnapshot().status).toBe('signedOut');
    expect(storage.values.has('profile')).toBe(false);
  });

  test('B. cold start with a valid matching session preserves that user state', async () => {
    const { coordinator, storage } = setup(session('A'), 'A');
    storage.values.set('profile', 'User A');
    await coordinator.initialize();
    expect(coordinator.getSnapshot()).toMatchObject({ status: 'authenticated', userId: 'A' });
    expect(storage.values.get('profile')).toBe('User A');
    expect(storage.removals).toHaveLength(0);
  });

  test('C/K. expired or failed restoration becomes signed out without rendering cached data', async () => {
    const { auth, coordinator, storage } = setup(session('A'), 'A');
    auth.getSessionError = new Error('refresh token expired');
    storage.values.set('biomarkers', 'A health data');
    await coordinator.initialize();
    expect(coordinator.getSnapshot().status).toBe('signedOut');
    expect(storage.values.has('biomarkers')).toBe(false);
  });

  test('K. a restoration request that never settles times out fail-closed', async () => {
    const { auth, coordinator } = setup(session('A'), 'A', 1);
    auth.getSession = () => new Promise(() => undefined);
    await coordinator.initialize();
    expect(coordinator.getSnapshot().status).toBe('signedOut');
  });

  test('D. login from signed-out state clears first and publishes the new session', async () => {
    const { auth, coordinator, storage } = setup(null);
    await coordinator.initialize();
    storage.values.set('profile', 'stale');
    auth.emit('SIGNED_IN', session('A'));
    await settle();
    expect(storage.values.has('profile')).toBe(false);
    expect(coordinator.getSnapshot()).toMatchObject({ status: 'authenticated', userId: 'A' });
  });

  test('E. logout invalidates in-flight work at the start of the transition', async () => {
    const { coordinator } = setup(session('A'), 'A');
    await coordinator.initialize();
    const scope = coordinator.captureRequestScope()!;
    const signOut = coordinator.signOut();
    expect(coordinator.getSnapshot().status).toBe('initializing');
    expect(coordinator.isScopeCurrent(scope)).toBe(false);
    await signOut;
    expect(coordinator.getSnapshot().status).toBe('signedOut');
  });

  test('F. User A logout followed by User B login cannot retain User A state', async () => {
    const { auth, coordinator, storage } = setup(session('A'), 'A');
    storage.values.set('profile', 'User A');
    await coordinator.initialize();
    await coordinator.signOut();
    auth.emit('SIGNED_IN', session('B'));
    await settle();
    expect(storage.values.has('profile')).toBe(false);
    expect(storage.values.get(OWNER_KEY)).toBe('B');
  });

  test('G. rapid account switching serializes transitions and leaves only the last identity active', async () => {
    const { auth, coordinator } = setup(session('A'), 'A');
    await coordinator.initialize();
    auth.emit('SIGNED_IN', session('B'));
    auth.emit('SIGNED_IN', session('C'));
    await settle();
    await settle();
    expect(coordinator.getSnapshot()).toMatchObject({ status: 'authenticated', userId: 'C' });
  });

  test('H. anonymous upgrade with the same Supabase user ID retains state and generation', async () => {
    const { auth, coordinator, storage } = setup(session('A', 'anon-token', true), 'A');
    storage.values.set('biomarkers', 'guest history');
    await coordinator.initialize();
    const generation = coordinator.getSnapshot().generation;
    auth.emit('USER_UPDATED', session('A', 'registered-token', false));
    await settle();
    expect(coordinator.getSnapshot().generation).toBe(generation);
    expect(storage.values.get('biomarkers')).toBe('guest history');
  });

  test('I. token refresh updates the live session without resetting user state', async () => {
    const { auth, coordinator, storage } = setup(session('A', 'old-token'), 'A');
    storage.values.set('profile', 'User A');
    await coordinator.initialize();
    const generation = coordinator.getSnapshot().generation;
    auth.emit('TOKEN_REFRESHED', session('A', 'new-token'));
    await settle();
    expect(coordinator.getSnapshot().session?.access_token).toBe('new-token');
    expect(coordinator.getSnapshot().generation).toBe(generation);
    expect(storage.values.get('profile')).toBe('User A');
  });

  test('J. foreground expiration event signs out and a refreshed session restores cleanly', async () => {
    const { auth, coordinator } = setup(session('A'), 'A');
    await coordinator.initialize();
    auth.emit('SIGNED_OUT', null);
    await settle();
    expect(coordinator.getSnapshot().status).toBe('signedOut');
    auth.emit('SIGNED_IN', session('A', 'fresh-token'));
    await settle();
    expect(coordinator.getSnapshot()).toMatchObject({ status: 'authenticated', userId: 'A' });
  });

  test('L. duplicate auth events neither duplicate listeners nor reset state', async () => {
    const { auth, coordinator, storage } = setup(session('A'), 'A');
    await Promise.all([coordinator.initialize(), coordinator.initialize()]);
    const generation = coordinator.getSnapshot().generation;
    auth.emit('SIGNED_IN', session('A'));
    auth.emit('SIGNED_IN', session('A'));
    await settle();
    expect(auth.listenerCount).toBe(1);
    expect(coordinator.getSnapshot().generation).toBe(generation);
    expect(storage.removals).toHaveLength(0);
  });

  test('M/N. premium and all other declared user caches clear on account change', async () => {
    const { auth, coordinator, storage } = setup(session('A'), 'A');
    for (const key of USER_KEYS) storage.values.set(key, `A:${key}`);
    await coordinator.initialize();
    auth.emit('SIGNED_IN', session('B'));
    await settle();
    for (const key of USER_KEYS) expect(storage.values.has(key)).toBe(false);
  });

  test('O. stale response scope cannot commit after the active user changes', async () => {
    const { auth, coordinator } = setup(session('A'), 'A');
    await coordinator.initialize();
    const requestScope = coordinator.captureRequestScope()!;
    auth.emit('SIGNED_IN', session('B'));
    await settle();
    let committed = false;
    if (coordinator.isScopeCurrent(requestScope)) committed = true;
    expect(committed).toBe(false);
  });
});
