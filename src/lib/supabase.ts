import 'react-native-url-polyfill/auto'
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

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

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
