/**
 * Adapty SDK singleton for Vitalspan.
 *
 * Mirrors the supabase.ts singleton pattern:
 *   - Module-level activation at import time via an IIFE promise
 *   - EXPO_PUBLIC_* env var guard: logs error, never throws
 *   - All async helpers: awaits activationPromise, try/catch, console.warn on
 *     error, returns a safe fallback — never re-throws
 *
 * ACTIVATION NOTE: activationPromise resolves once adapty.activate() completes
 * OR after ACTIVATION_TIMEOUT_MS elapses, whichever comes first — activate()
 * has no internal timeout and can stall indefinitely on bad network, and
 * nothing in the app should ever be able to hang waiting on it. All helper
 * functions await this promise so callers do not need to coordinate SDK
 * readiness manually.
 *
 * NO AppState listener here — that belongs in PremiumContext.tsx so the
 * component lifecycle controls the subscription.
 */
import { adapty } from 'react-native-adapty'

const ADAPTY_API_KEY = process.env.EXPO_PUBLIC_ADAPTY_API_KEY ?? ''
const ACTIVATION_TIMEOUT_MS = 8_000

// Guard: missing key means all Adapty calls will fail silently at runtime.
// Log clearly so EAS build logs surface the root cause.
if (!ADAPTY_API_KEY) {
  console.error(
    '[Adapty] EXPO_PUBLIC_ADAPTY_API_KEY is missing. ' +
    'Add it to your .env file and EAS secrets: ' +
    'eas secret:create --scope project --name EXPO_PUBLIC_ADAPTY_API_KEY --value <key>',
  )
} else {
  // Log a masked prefix (never the full key) so EAS build logs can confirm
  // *which* key shipped in a given build without leaking the secret.
  console.log(
    `[Adapty] Activating with key ${ADAPTY_API_KEY.slice(0, 6)}… (length ${ADAPTY_API_KEY.length})`,
  )
}

/** Last activation failure, if any — inspectable by UI that wants to show a retry state. */
let lastActivationError: string | null = null

export function getLastActivationError(): string | null {
  return lastActivationError
}

function runActivate(): Promise<void> {
  const startedAt = Date.now()
  return (async () => {
    try {
      if (!ADAPTY_API_KEY) {
        throw new Error('EXPO_PUBLIC_ADAPTY_API_KEY is empty — activate() would fail against Adapty')
      }
      await Promise.race([
        adapty.activate(ADAPTY_API_KEY),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`activate() exceeded ${ACTIVATION_TIMEOUT_MS}ms timeout`)),
            ACTIVATION_TIMEOUT_MS,
          ),
        ),
      ])
      lastActivationError = null
      console.log(`[Adapty] activate() succeeded in ${Date.now() - startedAt}ms`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      lastActivationError = message
      // Full error object (not just .message) so EAS/Sentry logs capture SDK
      // error codes/domains that react-native-adapty attaches to the error.
      console.error('[Adapty] activate() failed:', message, err)
    }
  })()
}

/**
 * Module-level activation promise. Resolves when the Adapty SDK is ready, or
 * after ACTIVATION_TIMEOUT_MS if activate() stalls. Exported so App.tsx can
 * await it during app startup if needed (it currently does not, by design —
 * see App.tsx boot()).
 *
 * Errors are caught and warned — the app continues without premium features.
 */
export let activationPromise: Promise<void> = runActivate()

/**
 * Re-runs adapty.activate() and replaces activationPromise so subsequent
 * awaiters (identifyAdaptyUser, fetchPremiumStatus, and any in-flight paywall
 * retry) pick up the new attempt. Used by the paywall's "Retry" action when
 * the initial background activation failed (e.g. missing key, no network at
 * cold boot).
 */
export function retryActivation(): Promise<void> {
  console.log('[Adapty] retryActivation() called — re-running activate()')
  activationPromise = runActivate()
  return activationPromise
}

/**
 * Associates the current device session with a known user ID.
 *
 * Call after Supabase auth resolves a real userId. Awaits SDK activation
 * first so callers can invoke this at any point after import.
 *
 * Never throws — errors are absorbed and warned.
 */
export async function identifyAdaptyUser(userId: string): Promise<void> {
  await activationPromise
  try {
    await adapty.identify(userId)
    console.log('[Adapty] identify() succeeded')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[Adapty] identify() failed:', message, err)
  }
}

/**
 * Returns true when the user has an active 'premium' access level.
 *
 * Awaits SDK activation first. Returns false on any error so the app
 * defaults to the free experience rather than crashing or locking users out.
 */
export async function fetchPremiumStatus(): Promise<boolean> {
  await activationPromise
  try {
    const profile = await adapty.getProfile()
    return profile.accessLevels?.['premium']?.isActive ?? false
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[Adapty] getProfile() failed:', message, err)
    return false
  }
}
