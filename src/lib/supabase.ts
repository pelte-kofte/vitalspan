import 'react-native-url-polyfill/auto'
import * as WebBrowser from 'expo-web-browser'
import * as AppleAuthentication from 'expo-apple-authentication'
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
  // Log the raw error so it always appears in Metro/device logs for diagnosis.
  console.error('[Auth] Raw error:', message)
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials') || lower.includes('wrong password')) {
    return 'Incorrect password'
  }
  if (lower.includes('user not found') || lower.includes('no user found')) {
    return 'No account found with that email'
  }
  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('already been registered')) {
    return 'An account with that email already exists — try logging in instead'
  }
  if (lower.includes('over_email_send_rate_limit') || lower.includes('email rate limit') || lower.includes('email link')) {
    return 'Too many sign-up attempts — please wait a few minutes and try again'
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
  if (lower.includes('auth session missing') || lower.includes('session missing') || lower.includes('no session found')) {
    return 'Session expired — please try again'
  }
  if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
    return 'Please verify your email first'
  }
  if (lower.includes('provider') && (lower.includes('not enabled') || lower.includes('not supported') || lower.includes('invalid'))) {
    return 'This sign-in method is not configured — please use email'
  }
  if (lower.includes('invalid') && (lower.includes('email') || lower.includes('format'))) {
    return 'Please enter a valid email address'
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
    const returnedUrl = new URL(result.url)
    // supabase-js v2 defaults to PKCE flow: the callback contains a `code`
    // query param that must be exchanged for a session.
    const code = returnedUrl.searchParams.get('code')
    if (code) {
      const { error: sessErr } = await supabase.auth.exchangeCodeForSession(code)
      if (sessErr) return { error: mapAuthError(sessErr.message) }
      return { error: null }
    }
    // Implicit-flow fallback: tokens arrive in the URL hash fragment.
    const hash = returnedUrl.hash.startsWith('#') ? returnedUrl.hash.slice(1) : returnedUrl.hash
    const hashParams = new URLSearchParams(hash)
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    if (accessToken && refreshToken) {
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    }
    return { error: null }
  } catch (e: unknown) {
    return { error: mapAuthError(e instanceof Error ? e.message : String(e)) }
  }
}

/**
 * Native Sign in with Apple via expo-apple-authentication.
 *
 * Uses the system-native Apple authentication sheet (ASAuthorizationController)
 * and passes the resulting identityToken directly to Supabase signInWithIdToken.
 * This is the App Store-required approach for native iOS apps — not the
 * WebBrowser OAuth redirect flow.
 *
 * Requires:
 *  - expo-apple-authentication installed and plugin registered in app.json
 *  - app.json entitlement: "com.apple.developer.applesignin": ["Default"]
 *  - Supabase Dashboard → Auth → Providers → Apple enabled (JWT Secret populated)
 *  - Apple Developer Console: Sign in with Apple capability on the App ID
 */
export async function signInWithApple(): Promise<{ error: string | null }> {
  try {
    const isAvailable = await AppleAuthentication.isAvailableAsync()
    if (!isAvailable) {
      return { error: 'Sign in with Apple is not available on this device' }
    }
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    })
    if (!credential.identityToken) {
      console.error('[Apple Auth] signInAsync succeeded but identityToken is null')
      return { error: 'Apple sign-in did not return an identity token' }
    }
    // signInWithIdToken validates the token's `aud` claim against the Client IDs
    // configured in Supabase Dashboard → Auth → Providers → Apple.
    // Native iOS tokens carry the Bundle ID (com.vitalspan.app) as `aud` — NOT
    // the Service ID (com.vitalspan.app.signin) used by the web OAuth flow.
    // Both must be listed (comma-separated) in Supabase's "Client IDs" field.
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    })
    if (error) return { error: mapAuthError(error.message) }
    return { error: null }
  } catch (e: unknown) {
    console.error('[Apple Auth] Exception:', e)
    const msg = e instanceof Error ? e.message : String(e)
    // User cancelled the native sheet — not an error worth showing
    if (msg.includes('canceled') || msg.includes('cancelled') || msg.includes('ERR_CANCELED')) {
      return { error: null }
    }
    return { error: mapAuthError(msg) }
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
