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
 * DOUBLE-ACTIVATION NOTE (#3005 activateOnceError, TestFlight build 10): the
 * SDK-level adapty.activate() call is only ever invoked from startActivateCall()
 * below, and startActivateCall() caches its promise in `activateCall` so it is
 * physically impossible to invoke adapty.activate() a second time while a prior
 * call is still in flight or has already succeeded. The bug that shipped in
 * build 10 was: the boot-time timeout race gave up on a *slow* activate() call
 * (still running in the background, not actually failed) and recorded it as a
 * failure; PaywallScreen then saw that failure and called retryActivation(),
 * which fired a genuinely new adapty.activate() call while the first one was
 * still pending — the SDK's own "activate once" guard then rejected the second
 * call with #3005. retryActivation() now only ever starts a new activate() call
 * when the previous one is fully settled AND definitively failed; if it's still
 * pending, retryActivation() re-awaits that same call instead. And if
 * adapty.activate() itself ever rejects with #3005, that means the SDK is
 * already active (from a call we lost track of) — it's treated as success, not
 * failure.
 *
 * NO AppState listener here — that belongs in PremiumContext.tsx so the
 * component lifecycle controls the subscription.
 */
import { adapty } from 'react-native-adapty'
import type {
  AdaptyError,
  AdaptyPaywall,
  AdaptyPaywallProduct,
  AdaptyProfile,
  AdaptyPurchaseResult,
} from 'react-native-adapty'

const packageJson = require('../../package.json') as {
  dependencies?: Record<string, string>
}
const appJson = require('../../app.json') as {
  expo?: {
    ios?: {
      bundleIdentifier?: string
    }
  }
}

const ADAPTY_API_KEY = process.env.EXPO_PUBLIC_ADAPTY_API_KEY ?? ''
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
const ACTIVATION_TIMEOUT_MS = 8_000
const ADAPTY_ACTIVATE_ONCE_ERROR_CODE = 3005
const EXPECTED_BUNDLE_IDENTIFIER = appJson.expo?.ios?.bundleIdentifier ?? 'unknown'
const ADAPTY_SDK_VERSION = packageJson.dependencies?.['react-native-adapty'] ?? 'unknown'

/** Single source of truth for the paywall placement id — PaywallScreen and the
 * Settings debug panel (Build 9 bug batch, issue 2) both read this. */
export const PLACEMENT_ID = 'vitalspan_premium_paywall'

export type AdaptyDiagnosticStage =
  | 'adapty.activate()'
  | 'adapty.getPaywall()'
  | 'adapty.getPaywallProducts()'
  | 'adapty.makePurchase()'
  | 'adapty.restorePurchases()'

type AdaptyDiagnosticStatus = 'pending' | 'succeeded' | 'failed'

interface SafeOriginalError {
  code: string | number | null
  message: string | null
}

interface SafeAdaptyDiagnosticError {
  name: string | null
  code: string | number | null
  adaptyErrorCode: string | number | null
  message: string
  originalError: SafeOriginalError | null
  localizedDescription: string | null
  detail: string | null
}

interface SafeSubscriptionPeriodDiagnostic {
  vendorProductId: string
  localizedPriceAvailable: boolean
  localizedPrice: string | null
  currencyCode: string | null
  subscriptionPeriod: string | null
  localizedSubscriptionPeriod: string | null
  offerPaymentModes: string[]
}

export interface SafeLocalizedPriceDiagnostic {
  vendorProductId: string
  localizedPriceAvailable: boolean
  localizedPrice: string | null
}

export interface AdaptyStageDiagnostic {
  stage: AdaptyDiagnosticStage
  status: AdaptyDiagnosticStatus
  sequence: number
  startedAt: string
  completedAt: string | null
  durationMs: number | null
  placementId: string | null
  paywallVariationId: string | null
  paywallRevision: number | null
  returnedProductCount: number | null
  vendorProductIds: string[]
  subscriptionPeriodMetadata: SafeSubscriptionPeriodDiagnostic[]
  error: SafeAdaptyDiagnosticError | null
  notes: string[]
}

interface AdaptyRuntimeChecks {
  expectedBundleIdentifier: string
  bundleIdentifierMatchesExpected: boolean
  placementIdMatchesExpected: boolean
  adaptyKeyStatus: 'missing' | 'placeholder' | 'present'
  adaptyKeyPresent: boolean
  supabaseUrlPresent: boolean
  supabaseAnonKeyPresent: boolean
  placeholderDetected: boolean
  keyLooksLikePublicLive: boolean
  keyLooksLikePublicKey: boolean
  sdkVersion: string
  sdkVersionLooksLike317: boolean
  activationStarted: boolean
  activationCallCount: number
  activationCompletedBeforeGetPaywall: boolean | null
  getPaywallCalledWithExactPlacementId: boolean | null
  getPaywallProductsUsedFreshPaywall: boolean | null
  livePaywallAttachmentStatus: 'not_verifiable_locally'
  publicKeyPlatformStatus: 'not_verifiable_locally'
}

function isLikelyUnresolvedEnvLiteral(value: string): boolean {
  return value.startsWith('$EXPO_PUBLIC_') || value === 'EXPO_PUBLIC_ADAPTY_API_KEY'
}

function getKeyDiagnostics(): {
  isMissing: boolean
  isPlaceholder: boolean
  maskedPrefix: string | null
  length: number
} {
  return {
    isMissing: ADAPTY_API_KEY.length === 0,
    isPlaceholder: isLikelyUnresolvedEnvLiteral(ADAPTY_API_KEY),
    maskedPrefix: ADAPTY_API_KEY ? ADAPTY_API_KEY.slice(0, 8) : null,
    length: ADAPTY_API_KEY.length,
  }
}

// Guard: missing key means all Adapty calls will fail silently at runtime.
// Log clearly so EAS build logs surface the root cause.
const keyDiagnostics = getKeyDiagnostics()
if (keyDiagnostics.isMissing) {
  console.error(
    '[Adapty] EXPO_PUBLIC_ADAPTY_API_KEY is missing. ' +
    'Add it to your .env file and EAS secrets: ' +
    'eas secret:create --scope project --name EXPO_PUBLIC_ADAPTY_API_KEY --value <key>',
  )
} else if (keyDiagnostics.isPlaceholder) {
  console.error(
    '[Adapty] EXPO_PUBLIC_ADAPTY_API_KEY looks unresolved. ' +
    'The current build received a placeholder-like string instead of a real public SDK key.',
  )
} else {
  // Log a masked prefix (never the full key) so EAS build logs can confirm
  // *which* key shipped in a given build without leaking the secret.
  console.log(
    `[Adapty] Activating with key ${ADAPTY_API_KEY.slice(0, 8)}… (length ${ADAPTY_API_KEY.length})`,
  )
}

/** Last activation failure, if any — inspectable by UI that wants to show a retry state. */
let lastActivationError: string | null = null

/** True if the current 'activated' state was reached by catching #3005 rather
 * than a clean activate() success — surfaced separately so the debug panel
 * can distinguish "activated normally" from "activated, but we lost track of
 * that on our end first." Never reset back to false; once true it describes
 * how activation ultimately succeeded for this app session. */
let recoveredFromActivateOnceError = false

export function getLastActivationError(): string | null {
  return lastActivationError
}

/** True whenever adapty.activate() has been called and settled (resolved or
 * rejected) — used to distinguish "still pending" from "definitively failed"
 * so retryActivation() knows when it's actually safe to call activate() again. */
let activateSettled = false
let activationStarted = false
let activationCallCount = 0
let activationCompletedBeforeGetPaywall: boolean | null = null
let getPaywallCalledWithExactPlacementId: boolean | null = null
let getPaywallProductsUsedFreshPaywall: boolean | null = null
let latestPaywallReference: AdaptyPaywall | null = null
let diagnosticSequence = 0
let lastPurchaseStage: AdaptyDiagnosticStage | null = null
let lastPurchaseResult: string | null = null
let lastRestoreResult: string | null = null
let lastPurchaseLifecycleTimestamp: string | null = null

const latestStageDiagnostics = new Map<AdaptyDiagnosticStage, AdaptyStageDiagnostic>()

function nextDiagnosticSequence(): number {
  diagnosticSequence += 1
  return diagnosticSequence
}

function extractOriginalError(err: unknown): SafeOriginalError | null {
  const source = (err as { originalError?: unknown; cause?: unknown })?.originalError
    ?? (err as { cause?: unknown })?.cause
  if (!source || typeof source !== 'object') return null

  const original = source as { code?: string | number; message?: string }
  return {
    code: original.code ?? null,
    message: original.message ?? null,
  }
}

function hasPlaceholderEnv(value: string): boolean {
  return value.length > 0 && isLikelyUnresolvedEnvLiteral(value)
}

function toSafeDiagnosticError(err: unknown): SafeAdaptyDiagnosticError {
  const typed = err as Partial<AdaptyError> & {
    code?: string | number
    originalError?: unknown
    cause?: unknown
    localizedDescription?: string
    detail?: string
  }

  return {
    name: typed.name ?? null,
    code: typed.code ?? null,
    adaptyErrorCode: typed.adaptyCode ?? null,
    message: err instanceof Error ? err.message : String(err),
    originalError: extractOriginalError(err),
    localizedDescription: typed.localizedDescription ?? null,
    detail: typed.detail ?? null,
  }
}

function formatSubscriptionPeriod(
  product: AdaptyPaywallProduct,
): SafeSubscriptionPeriodDiagnostic {
  const period = product.subscription?.subscriptionPeriod
  return {
    vendorProductId: product.vendorProductId,
    localizedPriceAvailable: Boolean(product.price?.localizedString),
    localizedPrice: product.price?.localizedString ?? null,
    currencyCode: product.price?.currencyCode ?? null,
    subscriptionPeriod: period
      ? `${period.numberOfUnits} ${period.unit}`
      : null,
    localizedSubscriptionPeriod: product.subscription?.localizedSubscriptionPeriod ?? null,
    offerPaymentModes:
      product.subscription?.offer?.phases?.map((phase) => phase.paymentMode) ?? [],
  }
}

function getPaywallRevision(paywall: AdaptyPaywall | null | undefined): number | null {
  return paywall?.placement?.revision ?? null
}

function getPaywallVariationId(
  paywall: AdaptyPaywall | AdaptyPaywallProduct | null | undefined,
): string | null {
  return paywall?.variationId ?? null
}

function setStageDiagnostic(
  diagnostic: Omit<AdaptyStageDiagnostic, 'sequence'>,
): AdaptyStageDiagnostic {
  const withSequence = {
    ...diagnostic,
    sequence: nextDiagnosticSequence(),
  }
  latestStageDiagnostics.set(withSequence.stage, withSequence)
  return withSequence
}

function startStageDiagnostic(
  stage: AdaptyDiagnosticStage,
  input?: Partial<AdaptyStageDiagnostic>,
): { startedAt: number } {
  const startedAt = Date.now()
  setStageDiagnostic({
    stage,
    status: 'pending',
    startedAt: new Date(startedAt).toISOString(),
    completedAt: null,
    durationMs: null,
    placementId: input?.placementId ?? null,
    paywallVariationId: input?.paywallVariationId ?? null,
    paywallRevision: input?.paywallRevision ?? null,
    returnedProductCount: input?.returnedProductCount ?? null,
    vendorProductIds: input?.vendorProductIds ?? [],
    subscriptionPeriodMetadata: input?.subscriptionPeriodMetadata ?? [],
    error: null,
    notes: input?.notes ?? [],
  })
  return { startedAt }
}

function finishStageDiagnostic(
  stage: AdaptyDiagnosticStage,
  startedAt: number,
  status: AdaptyDiagnosticStatus,
  input?: Partial<AdaptyStageDiagnostic>,
): AdaptyStageDiagnostic {
  return setStageDiagnostic({
    stage,
    status,
    startedAt: new Date(startedAt).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    placementId: input?.placementId ?? null,
    paywallVariationId: input?.paywallVariationId ?? null,
    paywallRevision: input?.paywallRevision ?? null,
    returnedProductCount: input?.returnedProductCount ?? null,
    vendorProductIds: input?.vendorProductIds ?? [],
    subscriptionPeriodMetadata: input?.subscriptionPeriodMetadata ?? [],
    error: input?.error ?? null,
    notes: input?.notes ?? [],
  })
}

function getRuntimeChecks(): AdaptyRuntimeChecks {
  const placeholderDetected = keyDiagnostics.isPlaceholder
    || hasPlaceholderEnv(SUPABASE_URL)
    || hasPlaceholderEnv(SUPABASE_ANON_KEY)
  return {
    expectedBundleIdentifier: EXPECTED_BUNDLE_IDENTIFIER,
    bundleIdentifierMatchesExpected: EXPECTED_BUNDLE_IDENTIFIER === 'com.vitalspan.app',
    placementIdMatchesExpected: PLACEMENT_ID === 'vitalspan_premium_paywall',
    adaptyKeyStatus: keyDiagnostics.isMissing
      ? 'missing'
      : keyDiagnostics.isPlaceholder
        ? 'placeholder'
        : 'present',
    adaptyKeyPresent: !keyDiagnostics.isMissing,
    supabaseUrlPresent: SUPABASE_URL.length > 0,
    supabaseAnonKeyPresent: SUPABASE_ANON_KEY.length > 0,
    placeholderDetected,
    keyLooksLikePublicLive: ADAPTY_API_KEY.startsWith('public_live_'),
    keyLooksLikePublicKey: ADAPTY_API_KEY.startsWith('public_'),
    sdkVersion: ADAPTY_SDK_VERSION,
    sdkVersionLooksLike317: /3\.17\./.test(ADAPTY_SDK_VERSION),
    activationStarted,
    activationCallCount,
    activationCompletedBeforeGetPaywall,
    getPaywallCalledWithExactPlacementId,
    getPaywallProductsUsedFreshPaywall,
    livePaywallAttachmentStatus: 'not_verifiable_locally',
    publicKeyPlatformStatus: 'not_verifiable_locally',
  }
}

function getLatestStageDiagnostics(): AdaptyStageDiagnostic[] {
  return [...latestStageDiagnostics.values()].sort(
    (left, right) => left.sequence - right.sequence,
  )
}

function getLatestFailedStageDiagnostic(
  stageDiagnostics: AdaptyStageDiagnostic[],
): AdaptyStageDiagnostic | null {
  return [...stageDiagnostics].reverse().find((stage) => stage.status === 'failed') ?? null
}

function getLatestCompletedStageDiagnostic(
  stageDiagnostics: AdaptyStageDiagnostic[],
): AdaptyStageDiagnostic | null {
  return [...stageDiagnostics].reverse().find((stage) => stage.completedAt !== null) ?? null
}

function getSnapshotStageDiagnostic(
  stageDiagnostics: AdaptyStageDiagnostic[],
): AdaptyStageDiagnostic | null {
  return getLatestFailedStageDiagnostic(stageDiagnostics)
    ?? getLatestCompletedStageDiagnostic(stageDiagnostics)
}

function getLastUpdatedAt(
  stageDiagnostics: AdaptyStageDiagnostic[],
): string | null {
  return getSnapshotStageDiagnostic(stageDiagnostics)?.completedAt
    ?? getSnapshotStageDiagnostic(stageDiagnostics)?.startedAt
    ?? lastPurchaseLifecycleTimestamp
}

function toLocalizedPriceDiagnostics(
  subscriptionMetadata: SafeSubscriptionPeriodDiagnostic[],
): SafeLocalizedPriceDiagnostic[] {
  return subscriptionMetadata.map((item) => ({
    vendorProductId: item.vendorProductId,
    localizedPriceAvailable: item.localizedPriceAvailable,
    localizedPrice: item.localizedPrice,
  }))
}

function recordPurchaseLifecycle(
  stage: AdaptyDiagnosticStage,
  result: string,
): void {
  lastPurchaseStage = stage
  lastPurchaseResult = result
  lastPurchaseLifecycleTimestamp = new Date().toISOString()
}

function recordRestoreLifecycle(result: string): void {
  lastRestoreResult = result
  lastPurchaseLifecycleTimestamp = new Date().toISOString()
}

function isActivateOnceError(err: unknown): boolean {
  const adaptyErr = err as Partial<AdaptyError>
  return adaptyErr?.adaptyCode === ADAPTY_ACTIVATE_ONCE_ERROR_CODE
}

/**
 * The single, real adapty.activate() call for the lifetime of the app.
 * Cached in `activateCall` so this function can be invoked any number of
 * times (module boot, retryActivation() while a call is already in flight)
 * without ever triggering a second real SDK call — that's what produced the
 * #3005 activateOnceError in build 10 (see file header).
 *
 * Only retryActivation() is allowed to clear `activateCall` back to null,
 * and only once it has confirmed the previous attempt is fully settled and
 * definitively failed (see retryActivation() below).
 */
let activateCall: Promise<void> | null = null

function startActivateCall(): Promise<void> {
  if (activateCall) return activateCall
  const startedAt = Date.now()
  activationStarted = true
  activationCallCount += 1
  startStageDiagnostic('adapty.activate()', {
    placementId: PLACEMENT_ID,
    notes: [`SDK version ${ADAPTY_SDK_VERSION}`],
  })
  activateCall = (async () => {
    try {
      if (keyDiagnostics.isMissing) {
        throw new Error('EXPO_PUBLIC_ADAPTY_API_KEY is empty — activate() would fail against Adapty')
      }
      if (keyDiagnostics.isPlaceholder) {
        throw new Error(
          'EXPO_PUBLIC_ADAPTY_API_KEY looks unresolved — check EAS environment configuration for a literal $EXPO_PUBLIC_* value',
        )
      }
      await adapty.activate(ADAPTY_API_KEY)
      activateSettled = true
      lastActivationError = null
      finishStageDiagnostic('adapty.activate()', startedAt, 'succeeded', {
        placementId: PLACEMENT_ID,
        notes: [`Activation call count: ${activationCallCount}`],
      })
      console.log(`[Adapty] activate() succeeded in ${Date.now() - startedAt}ms`)
    } catch (err: unknown) {
      activateSettled = true
      if (isActivateOnceError(err)) {
        // The SDK is already active from a call we lost track of (e.g. a
        // previous attempt that our own boot-time timeout gave up on while it
        // was still running in the background). That's success, not failure —
        // never surface #3005 as an activation failure.
        recoveredFromActivateOnceError = true
        lastActivationError = null
        finishStageDiagnostic('adapty.activate()', startedAt, 'succeeded', {
          placementId: PLACEMENT_ID,
          notes: [
            'Activation recovered from #3005 activateOnceError',
            `Activation call count: ${activationCallCount}`,
          ],
        })
        console.warn('[Adapty] activate() returned #3005 activateOnceError — SDK already active, treating as success')
        return
      }
      const message = err instanceof Error ? err.message : String(err)
      lastActivationError = message
      finishStageDiagnostic('adapty.activate()', startedAt, 'failed', {
        placementId: PLACEMENT_ID,
        error: toSafeDiagnosticError(err),
        notes: [`Activation call count: ${activationCallCount}`],
      })
      // Full error object (not just .message) so EAS/Sentry logs capture SDK
      // error codes/domains that react-native-adapty attaches to the error.
      console.error('[Adapty] activate() failed:', message, err)
      throw err
    }
  })()
  return activateCall
}

/**
 * Module-level activation promise. Resolves when the Adapty SDK is ready, or
 * after ACTIVATION_TIMEOUT_MS if activate() stalls. Exported so App.tsx can
 * await it during app startup if needed (it currently does not, by design —
 * see App.tsx boot()).
 *
 * IMPORTANT: the timeout race only controls how long THIS promise waits — it
 * never cancels or abandons the underlying adapty.activate() call, which
 * keeps running via the cached `activateCall` and will still update
 * lastActivationError / recoveredFromActivateOnceError whenever it truly
 * settles. This is what makes it safe for retryActivation() to check "is the
 * real call still pending?" instead of blindly firing a second activate().
 *
 * Errors are caught and warned — the app continues without premium features.
 */
export let activationPromise: Promise<void> = (async () => {
  try {
    await Promise.race([
      startActivateCall(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`activate() exceeded ${ACTIVATION_TIMEOUT_MS}ms timeout`)),
          ACTIVATION_TIMEOUT_MS,
        ),
      ),
    ])
  } catch {
    // Either activate() itself failed/timed-out-for-real (activateSettled is
    // true and lastActivationError is already set by startActivateCall), or
    // our timeout won the race while the real call is still pending
    // (activateSettled is still false) — record a distinct pending message so
    // the debug panel doesn't misreport a real call as failed prematurely.
    // startActivateCall()'s own handlers overwrite this once it truly settles.
    if (!activateSettled) {
      lastActivationError = `activate() exceeded ${ACTIVATION_TIMEOUT_MS}ms timeout (still pending in background)`
    }
  }
})()

/**
 * Ensures the Adapty SDK is (or becomes) active, without ever calling the
 * real adapty.activate() more than once concurrently or after a success.
 * Used by the paywall's "Retry" action when the initial background
 * activation appeared to fail (e.g. missing key, no network at cold boot,
 * or the boot-time timeout raced ahead of a slow-but-successful call).
 *
 * - If the real call is still pending, re-await it instead of starting a new
 *   one — this is the fix for #3005: never let two adapty.activate() calls
 *   be in flight at once.
 * - If it already succeeded (cleanly or via #3005 recovery), no-op.
 * - Only if it's fully settled AND definitively failed does this start a
 *   fresh activate() call.
 */
export function retryActivation(): Promise<void> {
  if (activateCall && !activateSettled) {
    console.log('[Adapty] retryActivation(): activate() already in flight — awaiting existing call instead of starting a new one')
    // .catch() here (not on activateCall itself) preserves the "activationPromise
    // never rejects" contract every caller below relies on, while leaving
    // activateCall's own rejection intact for startActivateCall()'s internal bookkeeping.
    activationPromise = activateCall.catch(() => undefined)
    return activationPromise
  }
  if (activateSettled && lastActivationError === null) {
    console.log('[Adapty] retryActivation(): SDK already active — no-op')
    activationPromise = Promise.resolve()
    return activationPromise
  }
  console.log('[Adapty] retryActivation(): previous attempt definitively failed — retrying activate()')
  activateCall = null
  activateSettled = false
  activationPromise = startActivateCall().catch(() => undefined)
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
let identifiedAdaptyUserId: string | null = null

export async function identifyAdaptyUser(userId: string): Promise<boolean> {
  if (identifiedAdaptyUserId === userId) return true
  await activationPromise
  try {
    if (identifiedAdaptyUserId !== null && identifiedAdaptyUserId !== userId) {
      await adapty.logout()
      identifiedAdaptyUserId = null
    }
    await adapty.identify(userId)
    identifiedAdaptyUserId = userId
    console.log('[Adapty] identify() succeeded')
    return true
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[Adapty] identify() failed:', message, err)
    return false
  }
}

/** Removes the prior Supabase-to-Adapty association on a signed-out device. */
export async function logoutAdaptyUser(): Promise<void> {
  await activationPromise
  try {
    await adapty.logout()
    identifiedAdaptyUserId = null
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[Adapty] logout() failed:', message)
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

export async function getPaywallWithDiagnostics(
  placementId: string,
  locale?: string,
): Promise<AdaptyPaywall> {
  activationCompletedBeforeGetPaywall = activateSettled && lastActivationError === null
  getPaywallCalledWithExactPlacementId = placementId === PLACEMENT_ID
  const started = startStageDiagnostic('adapty.getPaywall()', {
    placementId,
    notes: [
      `Activation settled before getPaywall: ${String(activationCompletedBeforeGetPaywall)}`,
      `Locale: ${locale ?? 'default'}`,
    ],
  })
  try {
    const paywall = await adapty.getPaywall(placementId, locale)
    latestPaywallReference = paywall
    finishStageDiagnostic('adapty.getPaywall()', started.startedAt, 'succeeded', {
      placementId,
      paywallVariationId: getPaywallVariationId(paywall),
      paywallRevision: getPaywallRevision(paywall),
      vendorProductIds: paywall.productIdentifiers.map((product) => product.vendorProductId),
      notes: [
        `Activation settled before getPaywall: ${String(activationCompletedBeforeGetPaywall)}`,
        `Request locale: ${paywall.requestLocale}`,
      ],
    })
    return paywall
  } catch (err: unknown) {
    finishStageDiagnostic('adapty.getPaywall()', started.startedAt, 'failed', {
      placementId,
      error: toSafeDiagnosticError(err),
      notes: [`Activation settled before getPaywall: ${String(activationCompletedBeforeGetPaywall)}`],
    })
    throw err
  }
}

export async function getPaywallProductsWithDiagnostics(
  paywall: AdaptyPaywall,
): Promise<AdaptyPaywallProduct[]> {
  getPaywallProductsUsedFreshPaywall = paywall === latestPaywallReference
  const started = startStageDiagnostic('adapty.getPaywallProducts()', {
    placementId: paywall.placement.id,
    paywallVariationId: getPaywallVariationId(paywall),
    paywallRevision: getPaywallRevision(paywall),
    notes: [`Paywall object matches latest getPaywall result: ${String(getPaywallProductsUsedFreshPaywall)}`],
  })
  try {
    const products = await adapty.getPaywallProducts(paywall)
    finishStageDiagnostic('adapty.getPaywallProducts()', started.startedAt, 'succeeded', {
      placementId: paywall.placement.id,
      paywallVariationId: getPaywallVariationId(paywall),
      paywallRevision: getPaywallRevision(paywall),
      returnedProductCount: products.length,
      vendorProductIds: products.map((product) => product.vendorProductId),
      subscriptionPeriodMetadata: products.map(formatSubscriptionPeriod),
      notes: [`Paywall object matches latest getPaywall result: ${String(getPaywallProductsUsedFreshPaywall)}`],
    })
    return products
  } catch (err: unknown) {
    finishStageDiagnostic('adapty.getPaywallProducts()', started.startedAt, 'failed', {
      placementId: paywall.placement.id,
      paywallVariationId: getPaywallVariationId(paywall),
      paywallRevision: getPaywallRevision(paywall),
      error: toSafeDiagnosticError(err),
      notes: [`Paywall object matches latest getPaywall result: ${String(getPaywallProductsUsedFreshPaywall)}`],
    })
    throw err
  }
}

export async function makePurchaseWithDiagnostics(
  product: AdaptyPaywallProduct,
): Promise<AdaptyPurchaseResult> {
  const started = startStageDiagnostic('adapty.makePurchase()', {
    placementId: PLACEMENT_ID,
    paywallVariationId: getPaywallVariationId(product),
    vendorProductIds: [product.vendorProductId],
    subscriptionPeriodMetadata: [formatSubscriptionPeriod(product)],
  })
  try {
    const result = await adapty.makePurchase(product)
    recordPurchaseLifecycle('adapty.makePurchase()', result.type)
    finishStageDiagnostic('adapty.makePurchase()', started.startedAt, 'succeeded', {
      placementId: PLACEMENT_ID,
      paywallVariationId: getPaywallVariationId(product),
      vendorProductIds: [product.vendorProductId],
      subscriptionPeriodMetadata: [formatSubscriptionPeriod(product)],
      notes: [`Purchase result type: ${result.type}`],
    })
    return result
  } catch (err: unknown) {
    recordPurchaseLifecycle('adapty.makePurchase()', 'failed')
    finishStageDiagnostic('adapty.makePurchase()', started.startedAt, 'failed', {
      placementId: PLACEMENT_ID,
      paywallVariationId: getPaywallVariationId(product),
      vendorProductIds: [product.vendorProductId],
      subscriptionPeriodMetadata: [formatSubscriptionPeriod(product)],
      error: toSafeDiagnosticError(err),
    })
    throw err
  }
}

export async function restorePurchasesWithDiagnostics(): Promise<AdaptyProfile> {
  const started = startStageDiagnostic('adapty.restorePurchases()', {
    placementId: PLACEMENT_ID,
  })
  try {
    const profile = await adapty.restorePurchases()
    recordRestoreLifecycle('success')
    const premium = profile.accessLevels?.premium
    finishStageDiagnostic('adapty.restorePurchases()', started.startedAt, 'succeeded', {
      placementId: PLACEMENT_ID,
      vendorProductIds: premium?.vendorProductId ? [premium.vendorProductId] : [],
      notes: [`Premium access active after restore: ${String(premium?.isActive ?? false)}`],
    })
    return profile
  } catch (err: unknown) {
    recordRestoreLifecycle('failed')
    finishStageDiagnostic('adapty.restorePurchases()', started.startedAt, 'failed', {
      placementId: PLACEMENT_ID,
      error: toSafeDiagnosticError(err),
    })
    throw err
  }
}

export function recordRestorePurchasesOutcome(result: 'active_subscription' | 'no_active_subscription'): void {
  recordRestoreLifecycle(result)
}

// ─── Debug info (Build 9 bug batch, issue 2) ─────────────────────────────────

export interface AdaptyDebugInfo {
  keyPresent: boolean
  keyStatus: 'missing' | 'placeholder' | 'present'
  /** First 8 chars of the key, or null if absent — never the full key. */
  keyPrefix: string | null
  keyLength: number
  // 'activated (recovered)' means adapty.activate() itself returned #3005
  // activateOnceError at some point this session — the SDK was already
  // active from a call we'd lost track of, not a failure. Kept distinct from
  // plain 'activated' so a #3005 in the logs doesn't get misread as still
  // broken next time someone checks this panel (#3005 bug, TestFlight build 10).
  activationStatus: 'activated' | 'activated (recovered)' | 'failed'
  lastActivationError: string | null
  placementId: string
  failedStage: AdaptyDiagnosticStage | null
  errorName: string | null
  errorCode: string | number | null
  adaptyErrorCode: string | number | null
  errorMessage: string | null
  originalErrorCode: string | number | null
  originalErrorMessage: string | null
  variationId: string | null
  revision: number | null
  productCount: number | null
  productIds: string[]
  subscriptionMetadata: SafeSubscriptionPeriodDiagnostic[]
  localizedPrices: SafeLocalizedPriceDiagnostic[]
  lastUpdatedAt: string | null
  runtimeChecks: AdaptyRuntimeChecks
  lastPurchaseStage: AdaptyDiagnosticStage | null
  lastPurchaseResult: string | null
  lastRestoreResult: string | null
  timestamp: string | null
  stageDiagnostics: AdaptyStageDiagnostic[]
}

function buildAdaptyDebugInfo(): AdaptyDebugInfo {
  const stageDiagnostics = getLatestStageDiagnostics()
  const failedStageDiagnostic = getLatestFailedStageDiagnostic(stageDiagnostics)
  const snapshotStageDiagnostic = getSnapshotStageDiagnostic(stageDiagnostics)
  const snapshotError = failedStageDiagnostic?.error ?? null
  const subscriptionMetadata = snapshotStageDiagnostic?.subscriptionPeriodMetadata ?? []
  return {
    keyPresent: !keyDiagnostics.isMissing && !keyDiagnostics.isPlaceholder,
    keyStatus: keyDiagnostics.isMissing
      ? 'missing'
      : keyDiagnostics.isPlaceholder
        ? 'placeholder'
        : 'present',
    keyPrefix: keyDiagnostics.maskedPrefix,
    keyLength: keyDiagnostics.length,
    activationStatus: lastActivationError !== null
      ? 'failed'
      : recoveredFromActivateOnceError
        ? 'activated (recovered)'
        : 'activated',
    lastActivationError,
    placementId: snapshotStageDiagnostic?.placementId ?? PLACEMENT_ID,
    failedStage: failedStageDiagnostic?.stage ?? null,
    errorName: snapshotError?.name ?? null,
    errorCode: snapshotError?.code ?? null,
    adaptyErrorCode: snapshotError?.adaptyErrorCode ?? null,
    errorMessage: snapshotError?.message ?? null,
    originalErrorCode: snapshotError?.originalError?.code ?? null,
    originalErrorMessage: snapshotError?.originalError?.message ?? null,
    variationId: snapshotStageDiagnostic?.paywallVariationId ?? null,
    revision: snapshotStageDiagnostic?.paywallRevision ?? null,
    productCount: snapshotStageDiagnostic?.returnedProductCount ?? null,
    productIds: snapshotStageDiagnostic?.vendorProductIds ?? [],
    subscriptionMetadata,
    localizedPrices: toLocalizedPriceDiagnostics(subscriptionMetadata),
    lastUpdatedAt: getLastUpdatedAt(stageDiagnostics),
    runtimeChecks: getRuntimeChecks(),
    lastPurchaseStage,
    lastPurchaseResult,
    lastRestoreResult,
    timestamp: lastPurchaseLifecycleTimestamp,
    stageDiagnostics,
  }
}

export function getCachedAdaptyDebugInfo(): AdaptyDebugInfo {
  return buildAdaptyDebugInfo()
}

/**
 * Surfaces exactly what the startup "[Adapty] key present/absent + masked
 * prefix" log line shows, plus current activation state — as structured data
 * a hidden Settings debug row can render on-device. Removes the need to pull
 * TestFlight device logs just to check whether the key made it into the build.
 *
 * Awaits activationPromise first, so the returned activationStatus always
 * reflects the outcome of the most recent activate() attempt, not a
 * still-pending one.
 */
export async function getAdaptyDebugInfo(): Promise<AdaptyDebugInfo> {
  await activationPromise
  return buildAdaptyDebugInfo()
}
