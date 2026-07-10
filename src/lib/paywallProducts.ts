import type { AdaptyPaywallProduct } from 'react-native-adapty'

export type PaywallPlanKind =
  | 'annual'
  | 'monthly'
  | 'weekly'
  | 'quarterly'
  | 'semiannual'
  | 'lifetime'
  | 'unknown'

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

function getTimelineCaption(product: AdaptyPaywallProduct, kind: PaywallPlanKind): string {
  const trialCopy = getTrialCopy(product)
  if (trialCopy) {
    const price = product.price?.localizedString ?? 'this price'
    return `${trialCopy}, then ${price}${getIntervalSuffix(kind)}`
  }

  const periodLabel = getPeriodLabel(product, kind)
  if (periodLabel) {
    return `Billed every ${periodLabel.toLowerCase()}`
  }

  return 'Pricing provided by the App Store'
}

export function summarizePaywallProduct(
  product: AdaptyPaywallProduct,
): PaywallPlanSummary {
  const kind = inferPaywallPlanKind(product)
  const title = getTitle(kind, product)
  return {
    product,
    kind,
    title,
    intervalSuffix: getIntervalSuffix(kind),
    ctaLabel: kind === 'unknown' ? 'Continue' : `Subscribe ${title}`,
    timelineCaption: getTimelineCaption(product, kind),
    hasLocalizedPrice: Boolean(product.price?.localizedString),
    vendorProductId: product.vendorProductId,
    periodLabel: getPeriodLabel(product, kind),
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
