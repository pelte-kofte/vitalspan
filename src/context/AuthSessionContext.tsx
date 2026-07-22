import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthSessionSnapshot } from '../lib/authSessionCoordinator';
import { authSessionCoordinator, initSupabaseSession } from '../lib/supabase';

const INITIAL_SNAPSHOT: AuthSessionSnapshot = {
  status: 'initializing',
  session: null,
  userId: null,
  generation: 0,
};

const AuthSessionContext = createContext<AuthSessionSnapshot>(INITIAL_SNAPSHOT);

export function AuthSessionProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [snapshot, setSnapshot] = useState<AuthSessionSnapshot>(authSessionCoordinator.getSnapshot());

  useEffect(() => {
    const unsubscribe = authSessionCoordinator.subscribe(() => {
      setSnapshot(authSessionCoordinator.getSnapshot());
    });
    void initSupabaseSession();
    return unsubscribe;
  }, []);

  return (
    <AuthSessionContext.Provider value={snapshot}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionSnapshot {
  return useContext(AuthSessionContext);
}
