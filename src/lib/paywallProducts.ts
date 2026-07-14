import type { AdaptyPaywallProduct } from 'react-native-adapty'

export type PaywallPlanKind =
  | 'annual'
  | 'monthly'
  | 'weekly'
  | 'quarterly'
  | 'semiannual'
  | 'lifetime'
  | 'unknown'

export interface PaywallTrialInfo {
  /** Line shown on the plan card, e.g. "7-day free trial". */
  cardLine: string
  /** CTA label when this plan is selected, e.g. "Start 7-day free trial". */
  ctaLabel: string
}

export interface PaywallPlanSummary {
  product: AdaptyPaywallProduct
  kind: PaywallPlanKind
  title: string
  intervalSuffix: string
  ctaLabel: string
  timelineCaption: string
  hasLocalizedPrice: boolean
  vendorProductId: string
  periodLabel: string | null
  /** Billing cadence copy, e.g. "Billed monthly" / "Billed annually". */
  billedCaption: string
  /** Per-month equivalent for multi-month plans, e.g. "$4.17/mo". Computed from price.amount. */
  monthlyEquivalent: string | null
  trial: PaywallTrialInfo | null
}

export interface ClassifiedPaywallProducts {
  primary: PaywallPlanSummary | null
  secondary: PaywallPlanSummary | null
  unmatched: PaywallPlanSummary[]
  usedSingleProductFallback: boolean
}

type SubscriptionUnit = 'day' | 'week' | 'month' | 'year'

interface SubscriptionPeriodLike {
  unit?: string
  numberOfUnits?: number
}

function getSubscriptionPeriod(
  product: AdaptyPaywallProduct,
): SubscriptionPeriodLike | null {
  return product.subscription?.subscriptionPeriod ?? null
}

function formatUnit(unit: SubscriptionUnit, count: number): string {
  if (count === 1) return unit
  return `${unit}s`
}

function inferKindFromMetadata(product: AdaptyPaywallProduct): PaywallPlanKind {
  if (product.productType === 'non_subscription') return 'lifetime'

  const period = getSubscriptionPeriod(product)
  const unit = period?.unit
  const count = period?.numberOfUnits

  if (unit === 'year' && count === 1) return 'annual'
  if (unit === 'month' && count === 1) return 'monthly'
  if (unit === 'week' && count === 1) return 'weekly'
  if (unit === 'month' && count === 3) return 'quarterly'
  if (unit === 'month' && count === 6) return 'semiannual'
  if (unit === 'day' && count === 7) return 'weekly'

  return 'unknown'
}

function inferKindFromKeywords(product: AdaptyPaywallProduct): PaywallPlanKind {
  const haystack = [
    product.vendorProductId,
    product.localizedTitle,
    product.localizedDescription,
    product.subscription?.localizedSubscriptionPeriod,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (
    haystack.includes('annual') ||
    haystack.includes('yearly') ||
    haystack.includes('year') ||
    haystack.includes('12 month') ||
    haystack.includes('12m')
  ) {
    return 'annual'
  }
  if (
    haystack.includes('monthly') ||
    haystack.includes('month') ||
    haystack.includes('1 month') ||
    haystack.includes('1m')
  ) {
    return 'monthly'
  }
  if (
    haystack.includes('weekly') ||
    haystack.includes('week') ||
    haystack.includes('7 day') ||
    haystack.includes('1w')
  ) {
    return 'weekly'
  }
  if (haystack.includes('quarter') || haystack.includes('3 month') || haystack.includes('3m')) {
    return 'quarterly'
  }
  if (haystack.includes('6 month') || haystack.includes('6m') || haystack.includes('semiannual')) {
    return 'semiannual'
  }
  if (
    haystack.includes('lifetime') ||
    haystack.includes('forever') ||
    haystack.includes('one-time') ||
    haystack.includes('one time')
  ) {
    return 'lifetime'
  }

  return 'unknown'
}

export function inferPaywallPlanKind(product: AdaptyPaywallProduct): PaywallPlanKind {
  const fromMetadata = inferKindFromMetadata(product)
  return fromMetadata !== 'unknown' ? fromMetadata : inferKindFromKeywords(product)
}

function getIntervalSuffix(kind: PaywallPlanKind): string {
  switch (kind) {
    case 'annual':
      return '/yr'
    case 'monthly':
      return '/mo'
    case 'weekly':
      return '/wk'
    case 'quarterly':
      return '/3 mo'
    case 'semiannual':
      return '/6 mo'
    case 'lifetime':
      return ' one-time'
    default:
      return ''
  }
}

function getTitle(kind: PaywallPlanKind, product: AdaptyPaywallProduct): string {
  switch (kind) {
    case 'annual':
      return 'Annual'
    case 'monthly':
      return 'Monthly'
    case 'weekly':
      return 'Weekly'
    case 'quarterly':
      return 'Quarterly'
    case 'semiannual':
      return '6-month'
    case 'lifetime':
      return 'Lifetime'
    default:
      return product.localizedTitle || 'Subscription'
  }
}

function getPeriodLabel(product: AdaptyPaywallProduct, kind: PaywallPlanKind): string | null {
  if (product.subscription?.localizedSubscriptionPeriod) {
    return product.subscription.localizedSubscriptionPeriod
  }

  const period = getSubscriptionPeriod(product)
  if (period?.unit && period.numberOfUnits) {
    return `${period.numberOfUnits} ${formatUnit(period.unit as SubscriptionUnit, period.numberOfUnits)}`
  }

  switch (kind) {
    case 'annual':
      return '1 year'
    case 'monthly':
      return '1 month'
    case 'weekly':
      return '1 week'
    case 'quarterly':
      return '3 months'
    case 'semiannual':
      return '6 months'
    default:
      return null
  }
}

function getTrialCopy(product: AdaptyPaywallProduct): string | null {
  const phase = product.subscription?.offer?.phases?.find(
    (item) => item.paymentMode === 'free_trial',
  )
  if (!phase) return null

  return `${phase.localizedSubscriptionPeriod} free trial included`
}

/**
 * Billing cadence copy per plan kind. Monthly must read "Billed monthly" —
 * never the annual plan's "Billed every 1 year" (previous copy bug: the
 * period-label fallback produced the same line under both plans).
 */
export function getBilledCaption(kind: PaywallPlanKind, periodLabel: string | null): string {
  switch (kind) {
    case 'annual':
      return 'Billed annually'
    case 'monthly':
      return 'Billed monthly'
    case 'weekly':
      return 'Billed weekly'
    case 'quarterly':
      return 'Billed every 3 months'
    case 'semiannual':
      return 'Billed every 6 months'
    case 'lifetime':
      return 'One-time purchase'
    default:
      return periodLabel
        ? `Billed every ${periodLabel.toLowerCase()}`
        : 'Pricing provided by the App Store'
  }
}

const MONTHS_PER_PERIOD: Partial<Record<PaywallPlanKind, number>> = {
  annual: 12,
  semiannual: 6,
  quarterly: 3,
}

/**
 * "$4.17/mo" equivalent line for multi-month plans, derived from the real
 * store price (price.amount / months) — never hardcoded. Null when the store
 * did not return a numeric amount or a currency symbol.
 */
function getMonthlyEquivalent(product: AdaptyPaywallProduct, kind: PaywallPlanKind): string | null {
  const months = MONTHS_PER_PERIOD[kind]
  const price = product.price
  if (!months || !price || typeof price.amount !== 'number' || price.amount <= 0) return null
  if (!price.currencySymbol) return null
  return `${price.currencySymbol}${(price.amount / months).toFixed(2)}/mo`
}

function getTrialInfo(product: AdaptyPaywallProduct): PaywallTrialInfo | null {
  const phase = product.subscription?.offer?.phases?.find(
    (item) => item.paymentMode === 'free_trial',
  )
  if (!phase) return null

  const period = phase.subscriptionPeriod
  let lengthLabel: string | null = null
  if (period?.unit === 'day' && period.numberOfUnits > 0) {
    lengthLabel = `${period.numberOfUnits}-day`
  } else if (period?.unit === 'week' && period.numberOfUnits > 0) {
    lengthLabel = `${period.numberOfUnits * 7}-day`
  } else if (period?.unit === 'month' && period.numberOfUnits > 0) {
    lengthLabel = `${period.numberOfUnits}-month`
  }

  if (lengthLabel) {
    return {
      cardLine: `${lengthLabel} free trial`,
      ctaLabel: `Start ${lengthLabel} free trial`,
    }
  }
  const localized = phase.localizedSubscriptionPeriod
  return {
    cardLine: localized ? `${localized} free trial` : 'Free trial included',
    ctaLabel: 'Start free trial',
  }
}

/**
 * Percentage saved by paying annually vs 12× the monthly price, from the real
 * price amounts. Null unless both plans have positive amounts in the same
 * currency and the annual plan is actually cheaper.
 */
export function computeAnnualSavingsPercent(
  annual: PaywallPlanSummary | null,
  monthly: PaywallPlanSummary | null,
): number | null {
  if (!annual || !monthly || annual.kind !== 'annual' || monthly.kind !== 'monthly') return null
  const a = annual.product.price
  const m = monthly.product.price
  if (!a || !m || typeof a.amount !== 'number' || typeof m.amount !== 'number') return null
  if (a.amount <= 0 || m.amount <= 0) return null
  if (a.currencyCode && m.currencyCode && a.currencyCode !== m.currencyCode) return null
  const fullYear = m.amount * 12
  if (a.amount >= fullYear) return null
  return Math.round((1 - a.amount / fullYear) * 100)
}

function getTimelineCaption(product: AdaptyPaywallProduct, kind: PaywallPlanKind): string {
  const trialCopy = getTrialCopy(product)
  if (trialCopy) {
    const price = product.price?.localizedString ?? 'this price'
    return `${trialCopy}, then ${price}${getIntervalSuffix(kind)}`
  }

  return getBilledCaption(kind, getPeriodLabel(product, kind))
}

export function summarizePaywallProduct(
  product: AdaptyPaywallProduct,
): PaywallPlanSummary {
  const kind = inferPaywallPlanKind(product)
  const title = getTitle(kind, product)
  const periodLabel = getPeriodLabel(product, kind)
  return {
    product,
    kind,
    title,
    intervalSuffix: getIntervalSuffix(kind),
    ctaLabel: kind === 'unknown' ? 'Continue' : `Subscribe ${title}`,
    timelineCaption: getTimelineCaption(product, kind),
    hasLocalizedPrice: Boolean(product.price?.localizedString),
    vendorProductId: product.vendorProductId,
    periodLabel,
    billedCaption: getBilledCaption(kind, periodLabel),
    monthlyEquivalent: getMonthlyEquivalent(product, kind),
    trial: getTrialInfo(product),
  }
}

function pickByPriority(
  items: PaywallPlanSummary[],
  priorities: PaywallPlanKind[],
): PaywallPlanSummary | null {
  for (const priority of priorities) {
    const match = items.find((item) => item.kind === priority)
    if (match) return match
  }
  return items[0] ?? null
}

export function classifyPaywallProducts(
  products: AdaptyPaywallProduct[],
): ClassifiedPaywallProducts {
  const summaries = products.map(summarizePaywallProduct)
  if (summaries.length === 0) {
    return {
      primary: null,
      secondary: null,
      unmatched: [],
      usedSingleProductFallback: false,
    }
  }

  const known = summaries.filter((item) => item.kind !== 'unknown')
  if (known.length === 0) {
    if (summaries.length === 1) {
      return {
        primary: summaries[0],
        secondary: null,
        unmatched: [],
        usedSingleProductFallback: true,
      }
    }

    return {
      primary: null,
      secondary: null,
      unmatched: summaries,
      usedSingleProductFallback: false,
    }
  }

  const primary = pickByPriority(known, [
    'annual',
    'semiannual',
    'quarterly',
    'monthly',
    'weekly',
    'lifetime',
  ])
  const secondary = pickByPriority(
    known.filter((item) => item.vendorProductId !== primary?.vendorProductId),
    ['monthly', 'annual', 'quarterly', 'semiannual', 'weekly', 'lifetime'],
  )

  return {
    primary,
    secondary: secondary?.vendorProductId === primary?.vendorProductId ? null : secondary,
    unmatched: summaries.filter(
      (item) =>
        item.vendorProductId !== primary?.vendorProductId &&
        item.vendorProductId !== secondary?.vendorProductId &&
        item.kind === 'unknown',
    ),
    usedSingleProductFallback: false,
  }
}

export function describePaywallProductsForLogs(
  products: AdaptyPaywallProduct[],
): Array<Record<string, string | boolean | null>> {
  return products.map((product) => {
    const summary = summarizePaywallProduct(product)
    return {
      vendorProductId: summary.vendorProductId,
      kind: summary.kind,
      periodLabel: summary.periodLabel,
      hasLocalizedPrice: summary.hasLocalizedPrice,
      price: product.price?.localizedString ?? null,
    }
  })
}
