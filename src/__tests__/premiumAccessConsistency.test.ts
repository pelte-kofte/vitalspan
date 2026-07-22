import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getAIAdvisorAccessState } from '../lib/premiumAccess';
import {
  ADAPTY_PROFILE_URL,
  fetchActivePremiumAccess,
  hasActivePremiumAccess,
} from '../../supabase/functions/_shared/adaptyPremium';

const ROOT = process.cwd();
const source = (path: string): string => readFileSync(join(ROOT, path), 'utf8');

describe('premium and AI Advisor consistency', () => {
  test('implements the advertised premium-only AI Advisor policy', () => {
    expect(getAIAdvisorAccessState(false, true)).toBe('loading');
    expect(getAIAdvisorAccessState(false, false)).toBe('paywall');
    expect(getAIAdvisorAccessState(true, false)).toBe('allowed');
    expect(source('src/components/PaywallBenefits.tsx')).toContain('AI Advisor');
  });

  test('accepts only active, lifetime, or grace-period premium server access', () => {
    const now = Date.parse('2026-07-22T12:00:00.000Z');
    expect(hasActivePremiumAccess([], now)).toBe(false);
    expect(hasActivePremiumAccess([
      { access_level_id: 'premium', expires_at: '2026-07-22T11:59:59.000Z' },
    ], now)).toBe(false);
    expect(hasActivePremiumAccess([
      { access_level_id: 'premium', expires_at: '2026-07-22T12:00:01.000Z' },
    ], now)).toBe(true);
    expect(hasActivePremiumAccess([
      { access_level_id: 'premium', expires_at: null },
    ], now)).toBe(true);
    expect(hasActivePremiumAccess([
      { access_level_id: 'premium', expires_at: '2026-07-01T00:00:00.000Z', is_in_grace_period: true },
    ], now)).toBe(true);
    expect(hasActivePremiumAccess([
      { access_level_id: 'other', expires_at: null },
    ], now)).toBe(false);
  });

  test('uses the JWT customer ID and fails safely for missing or malformed profiles', async () => {
    const now = Date.parse('2026-07-22T12:00:00.000Z');
    const fetchImpl = jest.fn(async () => new Response(JSON.stringify({
      data: { access_levels: [{ access_level_id: 'premium', expires_at: null }] },
    }), { status: 200 }));

    await expect(fetchActivePremiumAccess('supabase-user-a', 'server-secret', {
      fetchImpl,
      nowMs: now,
    })).resolves.toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(ADAPTY_PROFILE_URL, expect.objectContaining({
      signal: expect.any(AbortSignal),
      headers: expect.objectContaining({
        Authorization: 'Api-Key server-secret',
        'adapty-customer-user-id': 'supabase-user-a',
      }),
    }));

    const notFound = jest.fn(async () => new Response(null, { status: 404 }));
    await expect(fetchActivePremiumAccess('missing', 'server-secret', {
      fetchImpl: notFound,
    })).resolves.toBe(false);

    const malformed = jest.fn(async () => new Response(JSON.stringify({ data: {} }), {
      status: 200,
    }));
    await expect(fetchActivePremiumAccess('malformed', 'server-secret', {
      fetchImpl: malformed,
    })).resolves.toBe(false);
  });

  test('Adapty timeout and upstream errors reject for the Edge Function to return 503', async () => {
    jest.useFakeTimers();
    const hangingFetch = jest.fn((_url: URL | RequestInfo, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      }));
    const pending = fetchActivePremiumAccess('user-a', 'server-secret', {
      fetchImpl: hangingFetch,
      timeoutMs: 25,
    });
    const timeoutExpectation = expect(pending).rejects.toThrow('aborted');
    await jest.advanceTimersByTimeAsync(25);
    await timeoutExpectation;
    jest.useRealTimers();

    const unavailable = jest.fn(async () => new Response(null, { status: 503 }));
    await expect(fetchActivePremiumAccess('user-a', 'server-secret', {
      fetchImpl: unavailable,
    })).rejects.toThrow('status 503');
  });

  test('defensively gates both dashboard navigation and the Advisor screen', () => {
    expect(source('src/screens/DashboardScreen.tsx')).toContain('getAIAdvisorAccessState');
    const advisor = source('src/screens/AIAdvisorScreen.tsx');
    expect(advisor).toContain("nav.replace('Paywall')");
    expect(advisor).toContain("accessState !== 'allowed'");
  });

  test('clears the Adapty identity in the centralized auth clear boundary', () => {
    const supabase = source('src/lib/supabase.ts');
    const adapty = source('src/lib/adapty.ts');
    expect(supabase).toContain('onIdentityCleared: logoutAdaptyUser');
    expect(adapty).toMatch(
      /export async function logoutAdaptyUser[\s\S]*identifiedAdaptyUserId = null[\s\S]*await activationPromise/,
    );
  });

  test('server verifies premium for the JWT owner before usage or AI cost', () => {
    const edge = source('supabase/functions/ai-advisor/index.ts');
    const premiumPosition = edge.indexOf('verifyPremiumAccess(userId)');
    expect(edge).toContain('serviceClient.auth.getUser(token)');
    expect(edge).toContain('Deno.env.get("ADAPTY_SECRET_API_KEY")');
    expect(edge).toContain('fetchActivePremiumAccess(userId, secretKey)');
    expect(edge).toContain('Premium subscription required');
    expect(premiumPosition).toBeGreaterThan(edge.indexOf('const userId = user.id'));
    expect(premiumPosition).toBeLessThan(edge.indexOf('.from("ai_usage")'));
    expect(premiumPosition).toBeLessThan(edge.indexOf('Deno.env.get("ANTHROPIC_API_KEY")'));
    expect(edge).not.toMatch(/body[^\n]*userId/);
  });
});
