import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export type AuthInitializationState = 'initializing' | 'signedOut' | 'authenticated';

export interface AuthSessionSnapshot {
  status: AuthInitializationState;
  session: Session | null;
  userId: string | null;
  generation: number;
}

export interface AuthRequestScope {
  userId: string;
  generation: number;
}

interface AuthSubscription {
  unsubscribe(): void;
}

export interface AuthClientPort {
  getSession(): Promise<{ data: { session: Session | null }; error?: { message: string } | null }>;
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ): { data: { subscription: AuthSubscription } };
  signOut(): Promise<{ error: { message: string } | null }>;
}

export interface AuthStoragePort {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiRemove(keys: readonly string[]): Promise<void>;
}

export interface AuthSessionCoordinatorOptions {
  auth: AuthClientPort;
  storage: AuthStoragePort;
  ownerStorageKey: string;
  userScopedStorageKeys: readonly string[];
  onIdentityCleared?: () => Promise<void>;
  initializationTimeoutMs?: number;
}

type SnapshotListener = () => void;

/**
 * Serializes every Supabase identity transition and invalidates user work before
 * a different identity can become visible. Token refreshes for the same user do
 * not change the generation and therefore do not reset valid application state.
 */
export class AuthSessionCoordinator {
  private readonly auth: AuthClientPort;
  private readonly storage: AuthStoragePort;
  private readonly ownerStorageKey: string;
  private readonly userScopedStorageKeys: readonly string[];
  private readonly onIdentityCleared?: () => Promise<void>;
  private readonly initializationTimeoutMs: number;
  private readonly listeners = new Set<SnapshotListener>();
  private snapshot: AuthSessionSnapshot = {
    status: 'initializing',
    session: null,
    userId: null,
    generation: 0,
  };
  private activeUserId: string | null = null;
  private subscription: AuthSubscription | null = null;
  private initializationPromise: Promise<AuthSessionSnapshot> | null = null;
  private initialized = false;
  private hasResolvedIdentity = false;
  private pendingAuthEvent: { event: AuthChangeEvent; session: Session | null } | null = null;
  private transitionQueue: Promise<void> = Promise.resolve();
  private preparedSignedOutTransition = false;

  constructor(options: AuthSessionCoordinatorOptions) {
    this.auth = options.auth;
    this.storage = options.storage;
    this.ownerStorageKey = options.ownerStorageKey;
    this.userScopedStorageKeys = options.userScopedStorageKeys;
    this.onIdentityCleared = options.onIdentityCleared;
    this.initializationTimeoutMs = options.initializationTimeoutMs ?? 10_000;
  }

  getSnapshot = (): AuthSessionSnapshot => this.snapshot;

  subscribe = (listener: SnapshotListener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  initialize(): Promise<AuthSessionSnapshot> {
    if (this.initializationPromise) return this.initializationPromise;

    this.subscription = this.auth.onAuthStateChange((event, session) => {
      if (!this.initialized) {
        this.pendingAuthEvent = { event, session };
        return;
      }
      this.enqueueTransition(session, event);
    }).data.subscription;

    this.initializationPromise = (async () => {
      try {
        const result = await this.getSessionWithTimeout();
        if (result.error) throw new Error(result.error.message);
        await this.applySession(result.data.session, 'INITIAL_SESSION');
      } catch {
        await this.applySession(null, 'INITIAL_SESSION');
      }

      this.initialized = true;
      const pending = this.pendingAuthEvent;
      this.pendingAuthEvent = null;
      if (pending) await this.applySession(pending.session, pending.event);
      return this.snapshot;
    })();

    return this.initializationPromise;
  }

  captureRequestScope(): AuthRequestScope | null {
    if (this.snapshot.status !== 'authenticated' || !this.snapshot.userId) return null;
    return { userId: this.snapshot.userId, generation: this.snapshot.generation };
  }

  isScopeCurrent(scope: AuthRequestScope): boolean {
    return this.snapshot.status === 'authenticated'
      && this.snapshot.userId === scope.userId
      && this.snapshot.generation === scope.generation;
  }

  async signOut(): Promise<{ error: string | null }> {
    if (this.snapshot.status === 'signedOut') return { error: null };

    await this.prepareIdentityChange();
    this.activeUserId = null;
    this.preparedSignedOutTransition = true;

    try {
      const { error } = await this.auth.signOut();
      if (error) {
        const restored = await this.auth.getSession().catch(() => ({ data: { session: null } }));
        this.preparedSignedOutTransition = false;
        await this.applySession(restored.data.session, 'SIGNED_IN');
        return { error: error.message };
      }
      await this.applySession(null, 'SIGNED_OUT');
      return { error: null };
    } catch (error: unknown) {
      const restored = await this.auth.getSession().catch(() => ({ data: { session: null } }));
      this.preparedSignedOutTransition = false;
      await this.applySession(restored.data.session, 'SIGNED_IN');
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  dispose(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  private enqueueTransition(session: Session | null, event: AuthChangeEvent): void {
    this.transitionQueue = this.transitionQueue
      .then(() => this.applySession(session, event))
      .catch(() => this.applySession(null, 'SIGNED_OUT'));
  }

  private async getSessionWithTimeout(): Promise<Awaited<ReturnType<AuthClientPort['getSession']>>> {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        this.auth.getSession(),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error('Supabase session restoration timed out')),
            this.initializationTimeoutMs,
          );
        }),
      ]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  private async applySession(session: Session | null, _event: AuthChangeEvent): Promise<void> {
    const nextUserId = session?.user.id ?? null;

    if (this.hasResolvedIdentity && nextUserId === this.activeUserId) {
      if (nextUserId === null) {
        if (this.preparedSignedOutTransition) this.preparedSignedOutTransition = false;
        this.publish({ status: 'signedOut', session: null, userId: null });
      } else {
        this.publish({ status: 'authenticated', session, userId: nextUserId });
      }
      return;
    }

    if (nextUserId === null && this.preparedSignedOutTransition) {
      this.preparedSignedOutTransition = false;
      this.publish({ status: 'signedOut', session: null, userId: null });
      return;
    }

    const storedOwnerId = await this.storage.getItem(this.ownerStorageKey).catch(() => null);
    const requiresClear = this.hasResolvedIdentity
      ? this.activeUserId !== nextUserId
      : nextUserId === null || storedOwnerId !== nextUserId;
    if (requiresClear) await this.prepareIdentityChange();

    this.activeUserId = nextUserId;
    this.hasResolvedIdentity = true;
    if (nextUserId === null) {
      await this.storage.removeItem(this.ownerStorageKey).catch(() => undefined);
      this.publish({ status: 'signedOut', session: null, userId: null });
      return;
    }

    await this.storage.setItem(this.ownerStorageKey, nextUserId);
    this.publish({ status: 'authenticated', session, userId: nextUserId });
  }

  private async prepareIdentityChange(): Promise<void> {
    this.snapshot = {
      status: 'initializing',
      session: null,
      userId: null,
      generation: this.snapshot.generation + 1,
    };
    this.emit();
    await Promise.all([
      this.storage.multiRemove(this.userScopedStorageKeys),
      this.storage.removeItem(this.ownerStorageKey),
      this.onIdentityCleared?.() ?? Promise.resolve(),
    ]);
  }

  private publish(next: Omit<AuthSessionSnapshot, 'generation'>): void {
    const unchanged = this.snapshot.status === next.status
      && this.snapshot.session?.access_token === next.session?.access_token
      && this.snapshot.userId === next.userId;
    this.snapshot = { ...next, generation: this.snapshot.generation };
    if (!unchanged) this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}
