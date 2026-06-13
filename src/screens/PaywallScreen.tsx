import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { adapty } from 'react-native-adapty';
import type { AdaptyPaywallProduct } from 'react-native-adapty';
import { activationPromise } from '../lib/adapty';
import { usePremiumContext } from '../context/PremiumContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import PaywallHero from '../components/PaywallHero';
import PaywallPriceCard from '../components/PaywallPriceCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PLACEMENT_ID = 'vitalspan_premium_paywall';

export default function PaywallScreen() {
  const nav = useNavigation<Nav>();
  const { refreshPremium } = usePremiumContext();

  const [products, setProducts] = useState<AdaptyPaywallProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // Fetch paywall and products from Adapty
  useEffect(() => {
    (async () => {
      try {
        await activationPromise;
        const paywall = await adapty.getPaywall(PLACEMENT_ID, 'en');
        // Required for Adapty analytics funnel tracking — do not remove (RESEARCH.md anti-pattern)
        await adapty.logShowPaywall(paywall);
        const prods = await adapty.getPaywallProducts(paywall);
        setProducts(prods);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('[Adapty] paywall fetch failed:', msg);
      } finally {
        setLoadingProducts(false);
      }
    })();
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
      <PaywallPriceCard
        annualPrice={annual?.price?.localizedString}
        monthlyPrice={monthly?.price?.localizedString}
        loadingProducts={loadingProducts}
        purchasing={purchasing}
        onSubscribeAnnual={() => { if (annual) handlePurchase(annual); }}
        onSubscribeMonthly={() => { if (monthly) handlePurchase(monthly); }}
        onRestore={handleRestore}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
});
