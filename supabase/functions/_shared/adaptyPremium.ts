export interface AdaptyAccessLevel {
  access_level_id?: string;
  expires_at?: string | null;
  is_in_grace_period?: boolean;
}

export const ADAPTY_PROFILE_URL = 'https://api.adapty.io/api/v2/server-side-api/profile/';
export const ADAPTY_REQUEST_TIMEOUT_MS = 8_000;

type FetchPort = typeof fetch;

/** Maps the Adapty server profile contract to the premium access decision. */
export function hasActivePremiumAccess(
  accessLevels: unknown,
  nowMs = Date.now(),
): boolean {
  if (!Array.isArray(accessLevels)) return false;
  const premium = accessLevels.find((level): level is AdaptyAccessLevel =>
    typeof level === 'object'
      && level !== null
      && (level as AdaptyAccessLevel).access_level_id === 'premium'
  );
  if (!premium) return false;
  if (premium.is_in_grace_period === true) return true;
  if (premium.expires_at === null) return true;
  if (typeof premium.expires_at !== 'string') return false;
  const expiresAt = Date.parse(premium.expires_at);
  return Number.isFinite(expiresAt) && expiresAt > nowMs;
}

export async function fetchActivePremiumAccess(
  userId: string,
  secretKey: string,
  options: {
    fetchImpl?: FetchPort;
    timeoutMs?: number;
    nowMs?: number;
  } = {},
): Promise<boolean> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? ADAPTY_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetchImpl(ADAPTY_PROFILE_URL, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Authorization: `Api-Key ${secretKey}`,
        'adapty-customer-user-id': userId,
        Accept: 'application/json',
      },
    });
    if (response.status === 404) return false;
    if (!response.ok) {
      throw new Error(`Adapty profile lookup failed with status ${response.status}`);
    }
    const payload = await response.json();
    return hasActivePremiumAccess(payload?.data?.access_levels, options.nowMs);
  } finally {
    clearTimeout(timeoutId);
  }
}
