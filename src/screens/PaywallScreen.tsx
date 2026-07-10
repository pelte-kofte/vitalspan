import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { adapty } from 'react-native-adapty';
import type { AdaptyPaywallProduct } from 'react-native-adapty';
import { activationPromise, retryActivation, getLastActivationError, PLACEMENT_ID } from '../lib/adapty';
import {
  classifyPaywallProducts,
  describePaywallProductsForLogs,
  type PaywallPlanSummary,
} from '../lib/paywallProducts';
import { usePremiumContext } from '../context/PremiumContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import PaywallHero from '../components/PaywallHero';
import PaywallBenefits from '../components/PaywallBenefits';
import PaywallPriceCard from '../components/PaywallPriceCard';
import { Colors } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type PaywallLoadErrorCode =
  | 'activation_failed'
  | 'missing_or_invalid_key'
  | 'placement_not_found'
  | 'no_products'
  | 'unclassified_products'
  | 'storekit_unavailable'
  | 'network'
  | 'unknown';

interface PaywallLoadErrorState {
  code: PaywallLoadErrorCode;
  title: string;
  message: string;
}

function createLoadError(
  code: PaywallLoadErrorCode,
  message: string,
): PaywallLoadErrorState {
  switch (code) {
    case 'activation_failed':
      return {
        code,
        title: 'Couldn\'t load pricing',
        message: 'The purchase service is not ready yet. Please try again in a moment.',
      };
    case 'missing_or_invalid_key':
      return {
        code,
        title: 'Couldn\'t load pricing',
        message: 'This build is missing valid purchase configuration. Please contact support or try a newer build.',
      };
    case 'placement_not_found':
      return {
        code,
        title: 'Couldn\'t load pricing',
        message: 'The current paywall configuration could not be found. Please try again later.',
      };
    case 'no_products':
      return {
        code,
        title: 'Couldn\'t load pricing',
        message: 'No purchase options were returned for this paywall. Please try again later.',
      };
    case 'unclassified_products':
      return {
        code,
        title: 'Couldn\'t load pricing',
        message: 'Pricing options were returned, but this build could not match them safely.',
      };
    case 'storekit_unavailable':
      return {
        code,
        title: 'Couldn\'t load pricing',
        message: 'The App Store did not return products for this device right now. Please try again.',
      };
    case 'network':
      return {
        code,
        title: 'Couldn\'t load pricing',
        message: 'Check your connection and try again.',
      };
    default:
      return {
        code,
        title: 'Couldn\'t load pricing',
        message,
      };
  }
}

function categorizePaywallError(err: unknown): PaywallLoadErrorCode {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes('exceeded 8000ms timeout') || lower.includes('activate()')) {
    return lower.includes('invalid') || lower.includes('unresolved') || lower.includes('empty')
      ? 'missing_or_invalid_key'
      : 'activation_failed';
  }
  if (lower.includes('expo_public_adapty_api_key') || lower.includes('public sdk key')) {
    return 'missing_or_invalid_key';
  }
  if (lower.includes('placement') && lower.includes('not found')) {
    return 'placement_not_found';
  }
  if (lower.includes('product') && lower.includes('not available')) {
    return 'storekit_unavailable';
  }
  if (lower.includes('network') || lower.includes('timed out') || lower.includes('fetch')) {
    return 'network';
  }
  return 'unknown';
}

export default function PaywallScreen() {
  const nav = useNavigation<Nav>();
  const { refreshPremium } = usePremiumContext();

  const [primaryPlan, setPrimaryPlan] = useState<PaywallPlanSummary | null>(null);
  const [secondaryPlan, setSecondaryPlan] = useState<PaywallPlanSummary | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState<PaywallLoadErrorState | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // Fetch paywall and products from Adapty. `forceReactivate` re-runs
  // adapty.activate() first — used when the initial background activation
  // (kicked off at app boot, see lib/adapty.ts) already failed, so opening
  // the paywall gives the SDK another chance instead of reusing a dead
  // activationPromise forever.
  const loadPaywall = React.useCallback(async (forceReactivate: boolean) => {
    setLoadingProducts(true);
    setLoadError(null);
    try {
      if (forceReactivate) {
        console.log('[Paywall] retrying Adapty activation before paywall fetch');
        await retryActivation();
      } else {
        await activationPromise;
      }
      const activationError = getLastActivationError();
      if (activationError) {
        throw new Error(activationError);
      }
      console.log('[Paywall] fetching paywall', PLACEMENT_ID);
      const paywall = await adapty.getPaywall(PLACEMENT_ID, 'en');
      // Required for Adapty analytics funnel tracking — do not remove (RESEARCH.md anti-pattern)
      await adapty.logShowPaywall(paywall);
      console.log('[Paywall] fetching products for paywall', PLACEMENT_ID);
      const prods = await adapty.getPaywallProducts(paywall);
      console.log('[Paywall] product metadata', describePaywallProductsForLogs(prods));
      if (prods.length === 0) {
        console.error('[Paywall] getPaywallProducts returned 0 products for', PLACEMENT_ID);
        setPrimaryPlan(null);
        setSecondaryPlan(null);
        setLoadError(createLoadError('no_products', 'No products returned.'));
      } else {
        console.log(`[Paywall] loaded ${prods.length} products`);
        const classified = classifyPaywallProducts(prods);
        if (!classified.primary) {
          console.error('[Paywall] Unable to classify returned products for UI', describePaywallProductsForLogs(prods));
          setPrimaryPlan(null);
          setSecondaryPlan(null);
          setLoadError(createLoadError('unclassified_products', 'Returned products could not be classified.'));
          return;
        }
        setPrimaryPlan(classified.primary);
        setSecondaryPlan(classified.secondary);
        if (classified.usedSingleProductFallback) {
          console.log('[Paywall] using single-product fallback for UI', classified.primary.vendorProductId);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Adapty] paywall/product fetch failed:', msg, err);
      setPrimaryPlan(null);
      setSecondaryPlan(null);
      setLoadError(createLoadError(categorizePaywallError(err), msg));
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch paywall and products from Adapty on mount. If the background
  // activation kicked off at app boot already failed, retry it now — the
  // user opening the paywall is a strong signal it's worth spending the time.
  useEffect(() => {
    loadPaywall(getLastActivationError() !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePurchase(product: AdaptyPaywallProduct): Promise<void> {
    setPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
    try {
      const result = await adapty.makePurchase(product);
      switch (result.type) {
        case 'success':
          await refreshPremium();
          nav.goBack();
          break;
        case 'user_cancelled':
          // No action — user dismissed the native payment sheet
          break;
        case 'pending':
          Alert.alert('Purchase pending', 'Your purchase is being processed.');
          break;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Paywall] purchase failed:', {
        productId: product.vendorProductId,
        message: msg,
      });
      Alert.alert('Purchase failed', 'We couldn\'t complete the purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore(): Promise<void> {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    try {
      const profile = await adapty.restorePurchases();
      const active = profile.accessLevels?.['premium']?.isActive ?? false;
      if (active) {
        await refreshPremium();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
        nav.goBack();
      } else {
        Alert.alert(
          'No subscription found',
          'No active subscription was found for your Apple ID.',
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Paywall] restore failed:', msg);
      Alert.alert('Restore failed', 'We couldn\'t restore purchases right now. Please try again.');
    }
  }

  return (
    <View style={s.container}>
      <PaywallHero onClose={() => nav.goBack()} />
      <PaywallBenefits />
      <PaywallPriceCard
        primaryPlan={primaryPlan}
        secondaryPlan={secondaryPlan}
        loadingProducts={loadingProducts}
        loadErrorTitle={loadError?.title}
        loadErrorMessage={loadError?.message}
        onRetry={() => loadPaywall(true)}
        purchasing={purchasing}
        onSubscribePrimary={() => { if (primaryPlan) handlePurchase(primaryPlan.product); }}
        onSubscribeSecondary={() => { if (secondaryPlan) handlePurchase(secondaryPlan.product); }}
        onRestore={handleRestore}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.bg },
});
