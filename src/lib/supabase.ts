import 'react-native-url-polyfill/auto'
import * as WebBrowser from 'expo-web-browser'
/**
 * Supabase client singleton for Vitalspan.
 *
 * POLYFILL CONSTRAINT: `react-native-url-polyfill/auto` is the absolute first
 * import (line 1) — before any Supabase import — to patch the global URL
 * constructor that @supabase/supabase-js depends on in React Native. Moving or
 * removing that import will cause runtime errors on device/simulator.
 *
 * OFFLINE-START KNOWN LIMITATION: If the app opens with no network on the very
 * first launch, the anonymous sign-in in initSupabaseSession() will fail
 * silently (caught and warned). The session will be null until the next
 * successful call. Subsequent opens restore the persisted AsyncStorage session
 * without requiring network.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// Guard: missing env vars crash createClient at module load time (silent black
// screen in production). Log clearly so EAS build logs surface the root cause.
// The app starts and works offline; only Supabase calls will fail gracefully.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing. ' +
    'Run: eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value <url> ' +
    'and eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <key>',
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}
)

// Stored to prevent duplicate listeners on Fast Refresh in development.
let _appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null

// Register AppState listener once at module load time to manage JWT lifecycle.
// Guarded by Platform.OS !== 'web' because AppState-driven refresh is only
// relevant on native — the web SDK handles its own visibility-based refresh.
if (Platform.OS !== 'web' && !_appStateSubscription) {
  _appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}

/**
 * Initialise the Supabase session on app start.
 *
 * Checks for an existing persisted session first. Only calls
 * signInAnonymously() when no session is present, so a returning user's
 * session is never clobbered by a new anonymous sign-in.
 *
 * Never throws — errors are absorbed and logged as warnings.
 */
export async function initSupabaseSession(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      return
    }
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.warn('[Supabase] Anonymous sign-in failed:', error.message)
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[Supabase] initSupabaseSession error:', message)
  }
}

// ─── Auth error mapper (D-15) ────────────────────────────────────────────────

/**
 * Maps a raw Supabase AuthError message to a user-facing string (D-15).
 * Returns generic, actionable messages — never exposes raw Supabase error
 * bodies to the user (mitigates T-14-03 information disclosure).
 */
export function mapAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials') || lower.includes('wrong password')) {
    return 'Incorrect password'
  }
  if (lower.includes('user not found') || lower.includes('no user found')) {
    return 'No account found with that email'
  }
  if (
    lower.includes('network request failed') ||
    lower.includes('networkrequest') ||
    lower.includes('fetch')
  ) {
    return 'No internet connection — please try again'
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Too many attempts — please wait a few minutes'
  }
  if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
    return 'Please verify your email first'
  }
  return 'Something went wrong — try again'
}

// ─── Email / password auth methods ──────────────────────────────────────────

import type { User } from '@supabase/supabase-js'

/**
 * Creates a new email/password account in Supabase.
 *
 * For users with an active anonymous session, call convertAnonymousToEmail
 * instead — this function is for fresh sign-ups with no prior session.
 *
 * Returns { user, error: null } on success.
 * Returns { user: null, error } with a user-facing message on failure.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      return { user: null, error: mapAuthError(error.message) }
    }
    return { user: data.user, error: null }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { user: null, error: mapAuthError(message) }
  }
}

/**
 * Authenticates an existing email/password account.
 *
 * Returns { user, error: null } on success.
 * Returns { user: null, error } with a user-facing message on failure.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { user: null, error: mapAuthError(error.message) }
    }
    return { user: data.user, error: null }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { user: null, error: mapAuthError(message) }
  }
}

/**
 * Converts an anonymous Supabase session to an email/password account in-place.
 *
 * Uses updateUser (not linkIdentity — linkIdentity is OAuth-only).
 * Call after verifying user.is_anonymous before sign-up.
 * This is the Supabase-approved method for anonymous→email promotion (D-16).
 * After success, call migrateHistory() guarded by @vitalspan_identity_linked
 * to prevent duplicate migration runs.
 *
 * Returns { user, error: null } on success.
 * Returns { user: null, error } with a user-facing message on failure.
 */
export async function convertAnonymousToEmail(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.updateUser({ email, password })
    if (error) {
      return { user: null, error: mapAuthError(error.message) }
    }
    return { user: data.user, error: null }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { user: null, error: mapAuthError(message) }
  }
}

/**
 * Sends a Supabase password reset email to the given address.
 *
 * Returns { error: null } on success.
 * Returns { error } with a user-facing message on failure.
 */
export async function sendPasswordResetEmail(
  email: string,
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      return { error: mapAuthError(error.message) }
    }
    return { error: null }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { error: mapAuthError(message) }
  }
}

/**
 * Signs out the current user by clearing the Supabase session token.
 *
 * Per D-08: does NOT touch AsyncStorage keys — local data is preserved
 * so the user retains their history when continuing as guest post-logout.
 *
 * Returns { error: null } on success.
 * Returns { error } with a user-facing message on failure.
 */
export async function signOutUser(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: mapAuthError(error.message) }
    }
    return { error: null }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { error: mapAuthError(message) }
  }
}

// App URL scheme — must match scheme in app.json and Supabase redirect allowlist
const APP_SCHEME = 'vitalspan'
const OAUTH_REDIRECT = `${APP_SCHEME}://auth/callback`

/**
 * Opens a browser to sign in with Google via Supabase OAuth.
 * Requires: Supabase Dashboard → Auth → Providers → Google enabled,
 * and app.json "scheme": "vitalspan" set.
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: OAUTH_REDIRECT, skipBrowserRedirect: true },
    })
    if (error) return { error: mapAuthError(error.message) }
    if (!data.url) return { error: 'Could not start Google sign-in' }
    const result = await WebBrowser.openAuthSessionAsync(data.url, OAUTH_REDIRECT)
    if (result.type !== 'success') return { error: null }
    const params = new URL(result.url)
    const accessToken = params.searchParams.get('access_token')
    const refreshToken = params.searchParams.get('refresh_token')
    if (accessToken && refreshToken) {
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    }
    return { error: null }
  } catch (e: unknown) {
    return { error: mapAuthError(e instanceof Error ? e.message : String(e)) }
  }
}

/**
 * Opens a browser to sign in with Apple via Supabase OAuth.
 * Requires: Supabase Dashboard → Auth → Providers → Apple enabled,
 * Apple Developer Console setup, and app.json "scheme": "vitalspan" set.
 * Note: native Sign in with Apple requires expo-apple-authentication.
 */
export async function signInWithApple(): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: OAUTH_REDIRECT, skipBrowserRedirect: true },
    })
    if (error) return { error: mapAuthError(error.message) }
    if (!data.url) return { error: 'Could not start Apple sign-in' }
    const result = await WebBrowser.openAuthSessionAsync(data.url, OAUTH_REDIRECT)
    if (result.type !== 'success') return { error: null }
    const params = new URL(result.url)
    const accessToken = params.searchParams.get('access_token')
    const refreshToken = params.searchParams.get('refresh_token')
    if (accessToken && refreshToken) {
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    }
    return { error: null }
  } catch (e: unknown) {
    return { error: mapAuthError(e instanceof Error ? e.message : String(e)) }
  }
}

/**
 * Resends the email verification/confirmation email to the given address.
 *
 * Uses supabase.auth.resend({ type: 'signup', email }) to trigger
 * another confirmation email from Supabase (D-12, D-13).
 *
 * Returns { error: null } on success.
 * Returns { error } with a user-facing message on failure.
 */
export async function resendVerificationEmail(
  email: string,
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) {
      return { error: mapAuthError(error.message) }
    }
    return { error: null }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { error: mapAuthError(message) }
  }
}
