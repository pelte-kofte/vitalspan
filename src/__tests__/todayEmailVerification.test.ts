import {
  resolveTodayEmailVerificationReminder,
  type TodayEmailVerificationAuthState,
} from '../lib/todayEmailVerification';

function authState(
  overrides: Partial<TodayEmailVerificationAuthState> = {},
): TodayEmailVerificationAuthState {
  return {
    status: 'authenticated',
    userId: 'user-1',
    generation: 4,
    user: {
      isAnonymous: false,
      email: 'person@example.com',
      emailConfirmedAt: null,
      provider: 'email',
    },
    ...overrides,
  };
}

describe('Today email-verification reminder eligibility', () => {
  test('shows only for the current unverified email account', () => {
    expect(resolveTodayEmailVerificationReminder(authState())).toEqual({
      email: 'person@example.com',
      scopeKey: '4:user-1',
    });
  });

  test.each([
    ['initializing', authState({ status: 'initializing' })],
    ['signed out', authState({ status: 'signedOut', userId: null })],
    ['missing user', authState({ user: null })],
    ['anonymous', authState({
      user: {
        isAnonymous: true,
        email: 'person@example.com',
        emailConfirmedAt: null,
        provider: 'email',
      },
    })],
    ['verified', authState({
      user: {
        isAnonymous: false,
        email: 'person@example.com',
        emailConfirmedAt: '2026-07-24T10:00:00.000Z',
        provider: 'email',
      },
    })],
    ['non-email provider', authState({
      user: {
        isAnonymous: false,
        email: 'person@example.com',
        emailConfirmedAt: null,
        provider: 'google',
      },
    })],
    ['missing email', authState({
      user: {
        isAnonymous: false,
        email: null,
        emailConfirmedAt: null,
        provider: 'email',
      },
    })],
  ])('hides for %s state', (_label, state) => {
    expect(resolveTodayEmailVerificationReminder(state)).toBeNull();
  });

  test('changes dismissal scope when the account generation changes', () => {
    expect(
      resolveTodayEmailVerificationReminder(authState({ generation: 5 }))
        ?.scopeKey,
    ).toBe('5:user-1');
  });
});
