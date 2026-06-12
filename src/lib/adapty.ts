/**
 * Adapty SDK singleton for Vitalspan.
 *
 * Mirrors the supabase.ts singleton pattern:
 *   - Module-level activation at import time via an IIFE promise
 *   - EXPO_PUBLIC_* env var guard: logs error, never throws
 *   - All async helpers: awaits activationPromise, try/catch, console.warn on
 *     error, returns a safe fallback — never re-throws
 *
 * ACTIVATION NOTE: activationPromise resolves once adapty.activate() completes.
 * All helper functions await this promise so callers do not need to coordinate
 * SDK readiness manually.
 *
 * NO AppState listener here — that belongs in PremiumContext.tsx so the
 * component lifecycle controls the subscription.
 */
import { adapty } from 'react-native-adapty'

const ADAPTY_API_KEY = process.env.EXPO_PUBLIC_ADAPTY_API_KEY ?? ''

// Guard: missing key means all Adapty calls will fail silently at runtime.
// Log clearly so EAS build logs surface the root cause.
if (!ADAPTY_API_KEY) {
  console.error(
    '[Adapty] EXPO_PUBLIC_ADAPTY_API_KEY is missing. ' +
    'Add it to your .env file and EAS secrets: ' +
    'eas secret:create --scope project --name EXPO_PUBLIC_ADAPTY_API_KEY --value <key>',
  )
}

/**
 * Module-level activation promise. Resolves when the Adapty SDK is ready.
 * Exported so App.tsx can await it during app startup if needed.
 *
 * Errors are caught and warned — the app continues without premium features.
 */
export const activationPromise: Promise<void> = (async () => {
  try {
    await adapty.activate(ADAPTY_API_KEY)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[Adapty] activate() failed:', message)
  }
})()

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[Adapty] identify() failed:', message)
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
    console.warn('[Adapty] getProfile() failed:', message)
    return false
  }
}
