# Phase 16: Adapty Paywall & Subscriptions — Pattern Map

**Mapped:** 2026-06-12
**Files analyzed:** 7 new/modified files
**Analogs found:** 7 / 7

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/adapty.ts` | service/singleton | request-response | `src/lib/supabase.ts` | role-match (same singleton + AppState pattern) |
| `src/context/PremiumContext.tsx` | provider/context | event-driven | `src/lib/supabase.ts` (AppState listener block) | partial-match (no existing React context in project) |
| `src/screens/PaywallScreen.tsx` | screen/fullScreenModal | request-response | `src/screens/LongevityScoreScreen.tsx` + `src/screens/WelcomeScreen.tsx` | role-match (dark hero from LongevityScore; bottom-sheet card from WelcomeScreen) |
| `src/screens/AIAdvisorScreen.tsx` | screen/stub | — | `src/screens/LongevityScoreScreen.tsx` | role-match (fullScreenModal boilerplate only) |
| `src/navigation/AppNavigator.tsx` | config/route | — | self (modify existing) | exact |
| `App.tsx` | app-root/startup | request-response | self (modify existing) | exact |
| `src/screens/DashboardScreen.tsx` | screen/feature-insert | CRUD | self (modify existing, lines 543–559) | exact |

---

## Pattern Assignments

### `src/lib/adapty.ts` (service, request-response)

**Analog:** `src/lib/supabase.ts`

**Imports pattern** (`supabase.ts` lines 1–18):
```typescript
import 'react-native-url-polyfill/auto'   // polyfill first (order matters)
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
```

**Mirror for adapty.ts** — same env-var guard pattern:
```typescript
import { adapty } from 'react-native-adapty';

const ADAPTY_API_KEY = process.env.EXPO_PUBLIC_ADAPTY_API_KEY ?? '';

// Guard missing key — mirrors supabase.ts lines 26–32
if (!ADAPTY_API_KEY) {
  console.error(
    '[Adapty] EXPO_PUBLIC_ADAPTY_API_KEY is missing. ' +
    'Add it to .env and rebuild the dev client.',
  );
}
```

**Singleton / module-level activation pattern** (`supabase.ts` lines 34–44 — client creation at module load):
```typescript
// supabase.ts: client created at module load, exported as singleton
export const supabase = createClient(supabaseUrl ?? '...', supabaseAnonKey ?? '...', { auth: { ... } })

// adapty.ts analog: activation promise created at module load (IIFE), awaited in init()
export const activationPromise: Promise<void> = (async () => {
  try {
    await adapty.activate(ADAPTY_API_KEY);
  } catch (err) {
    console.warn('[Adapty] activation failed:', err);
  }
})();
```

**Never-throws async helper pattern** (`supabase.ts` lines 72–86 — initSupabaseSession):
```typescript
// supabase.ts pattern: try/catch, console.warn, never throws
export async function initSupabaseSession(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) return
    const { error } = await supabase.auth.signInAnonymously()
    if (error) console.warn('[Supabase] Anonymous sign-in failed:', error.message)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[Supabase] initSupabaseSession error:', message)
  }
}

// adapty.ts mirror:
export async function fetchPremiumStatus(): Promise<boolean> {
  try {
    await activationPromise;
    const profile = await adapty.getProfile();
    return profile.accessLevels?.['premium']?.isActive ?? false;
  } catch {
    return false;   // fallback — never blocks the user
  }
}

export async function identifyAdaptyUser(userId: string): Promise<void> {
  try {
    await activationPromise;
    await adapty.identify(userId);
  } catch (err) {
    console.warn('[Adapty] identify failed:', err);
  }
}
```

---

### `src/context/PremiumContext.tsx` (provider, event-driven)

**Analog:** `src/lib/supabase.ts` — AppState listener block (lines 47–61)

No existing React context file in `src/context/` (directory does not exist). This is a new pattern in the project. Use the AppState listener from `supabase.ts` as the structural model.

**AppState listener pattern** (`supabase.ts` lines 47–61):
```typescript
// supabase.ts — singleton subscription guard + addEventListener
let _appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null

if (Platform.OS !== 'web' && !_appStateSubscription) {
  _appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}
```

**PremiumContext structural pattern** — React context wrapping this same listener logic:
```typescript
// src/context/PremiumContext.tsx
// React context is new to the project — use createContext + useContext (standard React)
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { adapty } from 'react-native-adapty';
import { fetchPremiumStatus } from '../lib/adapty';

interface PremiumContextValue {
  isPremium: boolean;
  isPremiumLoading: boolean;   // prevent locked-UI flash on first load
  refreshPremium: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue>({
  isPremium: false,
  isPremiumLoading: true,
  refreshPremium: async () => {},
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumLoading, setIsPremiumLoading] = useState(true);

  const refreshPremium = async () => {
    const status = await fetchPremiumStatus();
    setIsPremium(status);
    setIsPremiumLoading(false);
  };

  useEffect(() => {
    refreshPremium();

    // Reactive push from Adapty SDK (mirrors supabase.ts AppState pattern)
    const listener = adapty.addEventListener('onLatestProfileLoad', (profile) => {
      setIsPremium(profile.accessLevels?.['premium']?.isActive ?? false);
      setIsPremiumLoading(false);
    });

    // AppState active → refresh (exact same pattern as supabase.ts lines 55–57)
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') refreshPremium();
    });

    return () => { listener.remove(); sub.remove(); };
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, isPremiumLoading, refreshPremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremiumContext = () => useContext(PremiumContext);
```

---

### `src/screens/PaywallScreen.tsx` (screen, request-response)

**Primary analog — dark hero:** `src/screens/LongevityScoreScreen.tsx`
**Secondary analog — bottom card:** `src/screens/WelcomeScreen.tsx`

#### Imports pattern (`LongevityScoreScreen.tsx` lines 1–51):
```typescript
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Dimensions, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence,
  Easing, interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, Radius } from '../theme';
import NeuralGrid from '../components/NeuralGrid';
import { RootStackParamList } from '../navigation/AppNavigator';
// Phase 16 adds:
import { adapty, AdaptyPaywallProduct } from 'react-native-adapty';
import { activationPromise } from '../lib/adapty';
import { usePremiumContext } from '../context/PremiumContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: W, height: SCREEN_H } = Dimensions.get('window');
```

#### Dark hero background pattern (`LongevityScoreScreen.tsx` lines 557–559):
```typescript
// LongevityScoreScreen — LinearGradient wrap + NeuralGrid overlay + SafeAreaView
return (
  <LinearGradient colors={['#080D09', '#0C1410', '#0F1C14']} style={s.gradient}>
    <SafeAreaView style={s.safe}>
      <NeuralGrid intensity="high" tone="vital" />
      {/* content here */}
    </SafeAreaView>
  </LinearGradient>
);

// PaywallScreen variation — keep LinearGradient + NeuralGrid; use intensity="medium"
// since the price card occupies the lower 40% and doesn't need full hero intensity
```

#### Close button pattern (`LongevityScoreScreen.tsx` lines 574–581):
```typescript
// All fullScreenModals use this topBar pattern with nav.goBack()
<View style={s.topBar}>
  <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
    <Text style={s.backArrow}>←</Text>
  </TouchableOpacity>
  <Text style={s.screenTitle}>LONGEVITY SCORE</Text>
  <View style={{ width: 38 }} /> {/* spacer to center title */}
</View>
```

#### Orbital animation to reuse (`LongevityScoreScreen.tsx` lines 374–400):
```typescript
// Copy this block verbatim into PaywallScreen's hero section
// Shared values: rotation, spherePulse, entranceScale, entranceOpacity
const rotation = useSharedValue(0);
const spherePulse = useSharedValue(0.85);
const entranceScale = useSharedValue(0.7);
const entranceOpacity = useSharedValue(0);

useEffect(() => {
  rotation.value = withRepeat(
    withTiming(360, { duration: 14000, easing: Easing.linear }), -1, false,
  );
  spherePulse.value = withRepeat(
    withSequence(
      withTiming(1.0, { duration: 3200, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
      withTiming(0.85, { duration: 3200, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
    ), -1, false,
  );
  entranceScale.value = withTiming(1.0, { duration: 900, easing: Easing.out(Easing.cubic) });
  entranceOpacity.value = withTiming(1.0, { duration: 700, easing: Easing.out(Easing.quad) });
}, []);

const arcStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
const sphereContainerStyle = useAnimatedStyle(() => ({
  transform: [{ scale: entranceScale.value }],
  opacity: entranceOpacity.value,
}));
const sphereInnerStyle = useAnimatedStyle(() => ({
  opacity: interpolate(spherePulse.value, [0.85, 1.0], [0.85, 1.0]),
}));
```

#### Sphere SVG pattern (`LongevityScoreScreen.tsx` lines 592–619):
```typescript
// Copy the sphere + rotating arc SVG block; strip DATA_POINTS orbs (not needed in paywall)
// Use constants from LongevityScoreScreen: SPHERE_R = 88, SPHERE_CX = W/2, SPHERE_CY = 156, ORBIT_R = 148
<Animated.View style={[s.sphereArea, sphereContainerStyle]}>
  <Svg width={W} height={SVG_H} style={StyleSheet.absoluteFill}>
    <Defs>
      <RadialGradient id="sphereGlow" cx="40%" cy="35%" r="65%" fx="40%" fy="35%">
        <Stop offset="0%" stopColor="#2D5C3E" stopOpacity="1" />
        <Stop offset="60%" stopColor="#1C3B2A" stopOpacity="1" />
        <Stop offset="100%" stopColor="#040808" stopOpacity="1" />
      </RadialGradient>
      <SvgGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0%" stopColor={Colors.viz.bioGreen} stopOpacity="0.8" />
        <Stop offset="50%" stopColor={Colors.viz.cyan} stopOpacity="0.6" />
        <Stop offset="100%" stopColor={Colors.viz.bioGreen} stopOpacity="0.1" />
      </SvgGradient>
    </Defs>
    <Circle cx={SPHERE_CX} cy={SPHERE_CY} r={ORBIT_R + 2} fill="none"
      stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
    <Circle cx={SPHERE_CX} cy={SPHERE_CY} r={SPHERE_R} fill="url(#sphereGlow)" />
    <Circle cx={SPHERE_CX} cy={SPHERE_CY} r={SPHERE_R - 1} fill="none"
      stroke="rgba(255,255,255,0.10)" strokeWidth={1.5} />
  </Svg>
  <Animated.View style={[StyleSheet.absoluteFill, arcStyle]}>
    <Svg width={W} height={SVG_H} style={StyleSheet.absoluteFill}>
      <Path d={arcPath(SPHERE_R + 14)} fill="none" stroke="url(#arcGrad)"
        strokeWidth={2} strokeLinecap="round" strokeDasharray="8 6" />
    </Svg>
  </Animated.View>
  {/* PaywallScreen: replace sphereTextContainer with premium headline text */}
  <Animated.View style={[s.heroHeadlineContainer, sphereInnerStyle]}>
    <Text style={s.heroHeadline}>Your longevity,{'\n'}unlocked.</Text>
  </Animated.View>
</Animated.View>
```

#### Bottom white card pattern (`WelcomeScreen.tsx` lines 156–177):
```typescript
// WelcomeScreen — bottom sheet on dark background
// PaywallScreen uses the same white surface card but FIXED (not animated up)
// sheet style at WelcomeScreen line 199:
sheet: {
  backgroundColor: Colors.surface,
  borderTopLeftRadius: Radius.xxl,
  borderTopRightRadius: Radius.xxl,
  padding: Spacing.xl,
  paddingBottom: Spacing.xxl,
},
handle: {
  width: 36, height: 4, borderRadius: 2,
  backgroundColor: Colors.border,
  alignSelf: 'center', marginBottom: Spacing.lg,
},

// PaywallScreen: position the card as a fixed bottom View (not Animated.View)
// since D-03 says card does NOT animate up — it's part of the screen layout
<View style={s.priceCard}>
  <View style={s.priceCardHandle} />
  {/* annual CTA, monthly link, day timeline, restore link */}
</View>
```

#### Primary button pattern (`WelcomeScreen.tsx` lines 137–139 + styles line 192):
```typescript
// WelcomeScreen primary button — Colors.brand fill, Radius.full, paddingVertical: 16
<TouchableOpacity style={s.btnPrimary} onPress={() => { ... }}>
  <Text style={s.btnPrimaryTxt}>Sign Up</Text>
</TouchableOpacity>

btnPrimary: { backgroundColor: Colors.brand, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
btnPrimaryTxt: { color: Colors.dark.text, fontSize: Typography.sizes.body, fontWeight: '600' },
```

#### Secondary text-link pattern (`WelcomeScreen.tsx` line 196):
```typescript
// Ghost/link style — used for secondary action below the primary button
ghost: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, textAlign: 'center', paddingVertical: Spacing.sm },

// PaywallScreen: monthly plan link + restore link both use this ghost/muted text style
// Monthly: "Or try monthly at $Y/mo"
// Restore: "Restore Purchases" (slightly bolder — fontWeight: '500')
```

#### Error handling pattern (Alert, `LongevityScoreScreen.tsx` lines 305–312):
```typescript
// All screens use Alert.alert for user-facing errors (no custom error component)
Alert.alert(
  'Data error',
  'Some saved data could not be read. If this persists, use Settings → Clear all data.',
);
// PaywallScreen purchase errors:
Alert.alert('Purchase failed', 'Please try again.');
Alert.alert('Restore failed', 'Please try again.');
Alert.alert('No subscription found', 'No active subscription to restore.');
```

#### Adapty product fetch pattern (from RESEARCH.md — no codebase analog):
```typescript
// In PaywallScreen useEffect — always await activationPromise first
const PLACEMENT_ID = 'vitalspan_premium_paywall';
const [products, setProducts] = useState<AdaptyPaywallProduct[]>([]);
const [loadingProducts, setLoadingProducts] = useState(true);

useEffect(() => {
  (async () => {
    try {
      await activationPromise;
      const paywall = await adapty.getPaywall(PLACEMENT_ID, 'en');
      await adapty.logShowPaywall(paywall); // required for analytics
      const prods = await adapty.getPaywallProducts(paywall);
      setProducts(prods);
    } catch (err) {
      console.warn('[Adapty] paywall fetch failed:', err);
    } finally {
      setLoadingProducts(false);
    }
  })();
}, []);

const annual = products.find(p => p.vendorProductId.includes('annual'));
const monthly = products.find(p => p.vendorProductId.includes('monthly'));
```

#### StyleSheet pattern (`LongevityScoreScreen.tsx` lines 785–791 + project convention):
```typescript
// StyleSheet named `s` at bottom of file — project-wide convention (CLAUDE.md)
const s = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  sphereArea: { width: W, height: SVG_H, alignSelf: 'center' },
  // PaywallScreen additions:
  heroArea: { flex: 0.6 },    // top 60% — dark NeuralGrid + orbital
  priceCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
});
```

---

### `src/screens/AIAdvisorScreen.tsx` (screen, stub)

**Analog:** `src/screens/LongevityScoreScreen.tsx` — fullScreenModal boilerplate only

This is a stub screen (Phase 18 fills the content). Only needs the minimal fullScreenModal shell.

**Minimal fullScreenModal shell** (`LongevityScoreScreen.tsx` lines 556–558, 574–581):
```typescript
export default function AIAdvisorScreen() {
  const nav = useNavigation<Nav>();

  return (
    <LinearGradient colors={['#080D09', '#0C1410', '#0F1C14']} style={s.gradient}>
      <SafeAreaView style={s.safe}>
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.screenTitle}>AI ADVISOR</Text>
          <View style={{ width: 38 }} />
        </View>
        {/* Phase 18 fills content here */}
      </SafeAreaView>
    </LinearGradient>
  );
}
```

---

### `src/navigation/AppNavigator.tsx` (config, modify existing)

**Analog:** self — exact match, extending existing `RootStackParamList` and `Stack.Navigator`

**RootStackParamList extension** (`AppNavigator.tsx` lines 29–45):
```typescript
// Existing pattern — add two new routes after line 44:
export type RootStackParamList = {
  // ... existing routes ...
  Articles: undefined;       // existing
  ExerciseDetail: { exerciseId: string };  // existing (line 44)
  Paywall: undefined;        // Phase 16 — NEW
  AIAdvisor: undefined;      // Phase 16 — NEW (stub; Phase 18 fills)
};
```

**fullScreenModal route config** (`AppNavigator.tsx` lines 183–188 — LongevityScore pattern):
```typescript
// Existing exact pattern to copy for both new routes:
<Stack.Screen
  name="LongevityScore"
  component={LongevityScoreScreen}
  options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
/>

// New routes — same config:
<Stack.Screen
  name="Paywall"
  component={PaywallScreen}
  options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
/>
<Stack.Screen
  name="AIAdvisor"
  component={AIAdvisorScreen}
  options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
/>
```

**Import block to extend** (`AppNavigator.tsx` lines 1–28):
```typescript
// Add after existing screen imports (line 24):
import PaywallScreen from '../screens/PaywallScreen';
import AIAdvisorScreen from '../screens/AIAdvisorScreen';
```

---

### `App.tsx` (app-root, modify existing)

**Analog:** self — extending existing `init()` startup sequence

**Existing init() sequence** (`App.tsx` lines 19–48):
```typescript
const init = async () => {
  try {
    await initSupabaseSession();                           // line 21 — awaited
    const { data: { user } } = await supabase.auth.getUser();  // line 22 — awaited
    if (user && !user.is_anonymous) {
      const profileRaw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
      const profile = profileRaw ? JSON.parse(profileRaw) : null;
      setInitialRoute(profile?.onboardingComplete ? 'Main' : 'Onboarding');
    } else {
      setInitialRoute('Welcome');
    }
  } catch {
    setInitialRoute('Welcome');
  }
  // fire-and-forget tasks below ...
};
```

**Phase 16 modifications — insert between lines 21 and 22:**
```typescript
// New imports to add at top of App.tsx:
import { activationPromise, identifyAdaptyUser } from './src/lib/adapty';
import { PremiumProvider } from './src/context/PremiumContext';

// Modified init():
const init = async () => {
  try {
    await initSupabaseSession();                           // existing (line 21)
    await activationPromise;                               // Phase 16 — Adapty activate
    const { data: { user } } = await supabase.auth.getUser();  // existing (line 22)
    if (user && user.id) {
      // Phase 16 — identify only after getUser() resolves (STATE.md race rule)
      identifyAdaptyUser(user.id).catch(() => null);      // fire-and-forget
    }
    if (user && !user.is_anonymous) {
      const profileRaw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
      const profile = profileRaw ? JSON.parse(profileRaw) : null;
      setInitialRoute(profile?.onboardingComplete ? 'Main' : 'Onboarding');
    } else {
      setInitialRoute('Welcome');
    }
  } catch {
    setInitialRoute('Welcome');
  }
  // existing fire-and-forget tasks unchanged
};

// Modified return — wrap AppNavigator with PremiumProvider:
return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <StatusBar style="auto" />
    <PremiumProvider>
      <AppNavigator initialRoute={initialRoute} />
    </PremiumProvider>
    <MedicalDisclaimer />
  </GestureHandlerRootView>
);
```

---

### `src/screens/DashboardScreen.tsx` (screen, CRUD — feature insert)

**Analog:** self — modifying existing Research CTA block (`DashboardScreen.tsx` lines 543–559)

**Existing Research CTA to replace** (`DashboardScreen.tsx` lines 543–559):
```typescript
{/* Research CTA — current standalone block */}
<TouchableOpacity
  style={[s.uploadCard, s.researchCard]}
  activeOpacity={0.82}
  accessibilityRole="button"
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    nav.navigate('Articles');
  }}
>
  <ClipboardIcon color={Colors.onSurface} size={20} />
  <View style={s.uploadCardBody}>
    <Text style={s.uploadCardTitle}>Longevity Research</Text>
    <Text style={s.uploadCardSub}>Personalised PubMed articles for your biomarker profile</Text>
  </View>
  <Text style={s.uploadCardArrow}>→</Text>
</TouchableOpacity>
```

**Replacement — Intelligence section** (based on `sectionHdr`/`sectionTitle` pattern from line 561, `uploadCard`/`researchCard` pattern from lines 670–676):
```typescript
// Add import at top of DashboardScreen.tsx:
import { usePremiumContext } from '../context/PremiumContext';

// Inside the component:
const { isPremium } = usePremiumContext();

// Replace lines 543–559 with:
<View style={s.sectionHdr}>
  <Text style={s.sectionTitle}>Intelligence</Text>
</View>

{/* Longevity Research — now gated */}
<TouchableOpacity
  style={[s.uploadCard, s.researchCard]}
  activeOpacity={0.82}
  accessibilityRole="button"
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    isPremium ? nav.navigate('Articles') : nav.navigate('Paywall');
  }}
>
  <ClipboardIcon color={Colors.onSurface} size={20} />
  <View style={s.uploadCardBody}>
    <Text style={s.uploadCardTitle}>Longevity Research</Text>
    <Text style={s.uploadCardSub}>Personalised PubMed articles for your biomarker profile</Text>
  </View>
  <Text style={s.uploadCardArrow}>→</Text>
</TouchableOpacity>

{/* AI Advisor — new, Phase 16 */}
<TouchableOpacity
  style={[s.uploadCard, s.aiAdvisorCard]}
  activeOpacity={0.82}
  accessibilityRole="button"
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    isPremium ? nav.navigate('AIAdvisor') : nav.navigate('Paywall');
  }}
>
  {/* icon + title + subtitle + arrow — same structure as researchCard */}
  <View style={s.uploadCardBody}>
    <Text style={s.uploadCardTitle}>AI Advisor</Text>
    <Text style={s.uploadCardSub}>Personalised longevity insights from your data</Text>
  </View>
  <Text style={s.uploadCardArrow}>→</Text>
</TouchableOpacity>

// New style to add (mirrors researchCard at line 676):
// aiAdvisorCard: { backgroundColor: Colors.brandBg }, // or Colors.primaryBg variant
```

**sectionHdr/sectionTitle styles** (`DashboardScreen.tsx` lines 629–630):
```typescript
sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
sectionTitle: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },
```

---

## Shared Patterns

### Haptic feedback on interactive elements
**Source:** `src/screens/DashboardScreen.tsx` lines 549–550 / `src/screens/WelcomeScreen.tsx` line 137
**Apply to:** All `onPress` handlers in PaywallScreen (Subscribe, Restore, monthly link) and DashboardScreen Intelligence cards
```typescript
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);   // cards/links
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);  // primary action buttons
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null); // on successful purchase
```

### Environment variable pattern
**Source:** `src/lib/supabase.ts` lines 20–32
**Apply to:** `src/lib/adapty.ts`
```typescript
// Pattern: read EXPO_PUBLIC_* env var, guard missing value, log error (not throw)
const ADAPTY_API_KEY = process.env.EXPO_PUBLIC_ADAPTY_API_KEY ?? '';
if (!ADAPTY_API_KEY) {
  console.error('[Adapty] EXPO_PUBLIC_ADAPTY_API_KEY is missing...');
}
```

### Navigation type pattern
**Source:** All screens — `LongevityScoreScreen.tsx` line 52, `DashboardScreen.tsx` line 24
**Apply to:** `PaywallScreen.tsx`, `AIAdvisorScreen.tsx`
```typescript
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
type Nav = NativeStackNavigationProp<RootStackParamList>;
const nav = useNavigation<Nav>();
```

### StyleSheet-at-bottom convention
**Source:** Every screen file — CLAUDE.md rule
**Apply to:** All new screen files
```typescript
// StyleSheet must be named `s`, placed at the bottom of every file
// No inline styles except dynamic ones (e.g., { color: someVar })
const s = StyleSheet.create({ ... });
```

### Theme token usage
**Source:** `src/screens/WelcomeScreen.tsx` lines 181–204 / `src/screens/LongevityScoreScreen.tsx` lines 785+
**Apply to:** All new files
```typescript
import { Colors, Spacing, Typography, Radius } from '../theme';
// Never hardcode hex values — use Colors.*
// Never hardcode margin/padding numbers — use Spacing.*
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/context/PremiumContext.tsx` (structural) | provider | event-driven | No React context files exist in the project (`src/context/` directory does not exist — must be created). AppState listener in `supabase.ts` is the closest structural model but is not a React context. |

---

## Metadata

**Analog search scope:** `src/screens/`, `src/lib/`, `src/navigation/`, `src/context/`, `App.tsx`
**Files scanned:** 7 (LongevityScoreScreen, WelcomeScreen, AppNavigator, App.tsx, supabase.ts, DashboardScreen, ProfileScreen)
**Pattern extraction date:** 2026-06-12
