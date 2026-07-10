import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { adapty } from 'react-native-adapty';
import type { AdaptyPaywallProduct } from 'react-native-adapty';
import { activationPromise, retryActivation, getLastActivationError, PLACEMENT_ID } from '../lib/adapty';
import { usePremiumContext } from '../context/PremiumContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import PaywallHero from '../components/PaywallHero';
import PaywallBenefits from '../components/PaywallBenefits';
import PaywallPriceCard from '../components/PaywallPriceCard';
import { Colors } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PaywallScreen() {
  const nav = useNavigation<Nav>();
  const { refreshPremium } = usePremiumContext();

  const [products, setProducts] = useState<AdaptyPaywallProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  // Fetch paywall and products from Adapty. `forceReactivate` re-runs
  // adapty.activate() first — used when the initial background activation
  // (kicked off at app boot, see lib/adapty.ts) already failed, so opening
  // the paywall gives the SDK another chance instead of reusing a dead
  // activationPromise forever.
  const loadPaywall = React.useCallback(async (forceReactivate: boolean) => {
    setLoadingProducts(true);
    setLoadError(false);
    try {
      if (forceReactivate) {
        console.log('[Paywall] retrying Adapty activation before paywall fetch');
        await retryActivation();
      } else {
        await activationPromise;
      }
      console.log('[Paywall] fetching paywall', PLACEMENT_ID);
      const paywall = await adapty.getPaywall(PLACEMENT_ID, 'en');
      // Required for Adapty analytics funnel tracking — do not remove (RESEARCH.md anti-pattern)
      await adapty.logShowPaywall(paywall);
      console.log('[Paywall] fetching products for paywall', PLACEMENT_ID);
      const prods = await adapty.getPaywallProducts(paywall);
      if (prods.length === 0) {
        console.error('[Paywall] getPaywallProducts returned 0 products for', PLACEMENT_ID);
        setLoadError(true);
      } else {
        console.log(`[Paywall] loaded ${prods.length} products`);
        setProducts(prods);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Adapty] paywall/product fetch failed:', msg, err);
      setLoadError(true);
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

  const annual = products.find(p => p.vendorProductId.includes('annual'));
  const monthly = products.find(p => p.vendorProductId.includes('monthly'));

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
    } catch {
      Alert.alert('Purchase failed', 'Please try again.');
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
    } catch {
      Alert.alert('Restore failed', 'Please try again.');
    }
  }

  return (
    <View style={s.container}>
      <PaywallHero onClose={() => nav.goBack()} />
      <PaywallBenefits />
      <PaywallPriceCard
        annualPrice={annual?.price?.localizedString}
        monthlyPrice={monthly?.price?.localizedString}
        loadingProducts={loadingProducts}
        loadError={loadError}
        onRetry={() => loadPaywall(true)}
        purchasing={purchasing}
        onSubscribeAnnual={() => { if (annual) handlePurchase(annual); }}
        onSubscribeMonthly={() => { if (monthly) handlePurchase(monthly); }}
        onRestore={handleRestore}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.bg },
});
