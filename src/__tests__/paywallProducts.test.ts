import type { AdaptyPaywallProduct } from 'react-native-adapty'
import {
  classifyPaywallProducts,
  inferPaywallPlanKind,
} from '../lib/paywallProducts'

function makeProduct(
  overrides: Partial<AdaptyPaywallProduct> = {},
): AdaptyPaywallProduct {
  return {
    vendorProductId: 'com.vitalspan.premium.default',
    adaptyId: 'adapty_default',
    localizedTitle: 'Vitalspan Premium',
    localizedDescription: 'Premium access',
    regionCode: 'US',
    paywallName: 'main',
    paywallABTestName: 'default',
    variationId: 'variation',
    accessLevelId: 'premium',
    productType: 'subscription',
    price: {
      amount: 9.99,
      currencyCode: 'USD',
      currencySymbol: '$',
      localizedString: '$9.99',
    },
    paywallProductIndex: 0,
    subscription: {
      subscriptionPeriod: {
        numberOfUnits: 1,
        unit: 'month',
      },
      localizedSubscriptionPeriod: '1 month',
      ios: {
        subscriptionGroupIdentifier: 'group',
      },
    },
    ios: {
      isFamilyShareable: false,
    },
    ...overrides,
  } as AdaptyPaywallProduct
}

describe('paywall product classification', () => {
  test('classifies annual product from subscription metadata', () => {
    const product = makeProduct({
      vendorProductId: 'com.vitalspan.premium.one',
      subscription: {
        subscriptionPeriod: {
          numberOfUnits: 1,
          unit: 'year',
        },
        localizedSubscriptionPeriod: '1 year',
        ios: {
          subscriptionGroupIdentifier: 'group',
        },
      },
    })

    expect(inferPaywallPlanKind(product)).toBe('annual')
  })

  test('classifies monthly product from subscription metadata', () => {
    const product = makeProduct({
      subscription: {
        subscriptionPeriod: {
          numberOfUnits: 1,
          unit: 'month',
        },
        localizedSubscriptionPeriod: '1 month',
        ios: {
          subscriptionGroupIdentifier: 'group',
        },
      },
    })

    expect(inferPaywallPlanKind(product)).toBe('monthly')
  })

  test('falls back to annual keyword when metadata is not useful', () => {
    const product = makeProduct({
      vendorProductId: 'com.vitalspan.premium.yearly_plan',
      subscription: undefined,
    })

    expect(inferPaywallPlanKind(product)).toBe('annual')
  })

  test('falls back to monthly keyword when metadata is not useful', () => {
    const product = makeProduct({
      vendorProductId: 'com.vitalspan.premium.monthly_plan',
      subscription: undefined,
    })

    expect(inferPaywallPlanKind(product)).toBe('monthly')
  })

  test('uses the single unknown product as primary fallback', () => {
    const product = makeProduct({
      vendorProductId: 'com.vitalspan.premium.special',
      localizedTitle: 'Vitalspan Premium Access',
      subscription: undefined,
    })

    const result = classifyPaywallProducts([product])
    expect(result.primary?.vendorProductId).toBe(product.vendorProductId)
    expect(result.secondary).toBeNull()
    expect(result.usedSingleProductFallback).toBe(true)
  })

  test('keeps multiple unknown products unmatched', () => {
    const first = makeProduct({
      vendorProductId: 'com.vitalspan.premium.special_a',
      localizedTitle: 'Plan A',
      subscription: undefined,
    })
    const second = makeProduct({
      vendorProductId: 'com.vitalspan.premium.special_b',
      localizedTitle: 'Plan B',
      subscription: undefined,
    })

    const result = classifyPaywallProducts([first, second])
    expect(result.primary).toBeNull()
    expect(result.secondary).toBeNull()
    expect(result.unmatched).toHaveLength(2)
  })

  test('handles an empty product list', () => {
    const result = classifyPaywallProducts([])
    expect(result.primary).toBeNull()
    expect(result.secondary).toBeNull()
    expect(result.unmatched).toHaveLength(0)
  })
})
