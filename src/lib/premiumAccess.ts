export type PremiumAccessState = 'loading' | 'allowed' | 'paywall';

/** AI Advisor is a premium-only product surface. */
export function getAIAdvisorAccessState(
  isPremium: boolean,
  isPremiumLoading: boolean,
): PremiumAccessState {
  if (isPremiumLoading) return 'loading';
  return isPremium ? 'allowed' : 'paywall';
}
