export interface TodayEmailVerificationUser {
  readonly isAnonymous: boolean;
  readonly email: string | null;
  readonly emailConfirmedAt: string | null;
  readonly provider: string | null;
}

export interface TodayEmailVerificationAuthState {
  readonly status: 'initializing' | 'signedOut' | 'authenticated';
  readonly userId: string | null;
  readonly generation: number;
  readonly user: TodayEmailVerificationUser | null;
}

export interface TodayEmailVerificationReminder {
  readonly email: string;
  readonly scopeKey: string;
}

/**
 * Preserves the legacy reminder eligibility without creating another
 * verification authority or changing the sign-up confirmation flow.
 */
export function resolveTodayEmailVerificationReminder(
  auth: TodayEmailVerificationAuthState,
): TodayEmailVerificationReminder | null {
  if (
    auth.status !== 'authenticated'
    || !auth.userId
    || !auth.user
    || auth.user.isAnonymous
    || auth.user.provider !== 'email'
    || auth.user.emailConfirmedAt
  ) {
    return null;
  }

  const email = auth.user.email?.trim();
  if (!email) return null;

  return {
    email,
    scopeKey: `${auth.generation}:${auth.userId}`,
  };
}
