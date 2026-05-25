# Phase 1: First-Run & Empty States - Pattern Map

**Mapped:** 2026-05-25
**Files analyzed:** 8 (2 new, 6 modified)
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/screens/GuidedFirstRunScreen.tsx` | screen | request-response (multi-step form + AsyncStorage write) | `src/screens/OnboardingScreen.tsx` | exact |
| `src/data/firstRunContent.ts` | data | static object map | `src/data/biomarkers.ts` (interface + const array pattern) | role-match |
| `src/navigation/AppNavigator.tsx` | config | n/a (route registration) | self — add to existing `LongevityScore` fullScreenModal block | exact |
| `src/screens/OnboardingScreen.tsx` | screen | request-response | self — change one `nav.reset` target on line 88 | exact |
| `src/screens/DashboardScreen.tsx` | screen | CRUD + conditional render | self — add AsyncStorage key to `Promise.all`, add empty-state branch | exact |
| `src/screens/BiomarkerDetailScreen.tsx` | screen | CRUD + conditional render | self — add empty-state card to list view | exact |
| `src/screens/BiomarkerEntryScreen.tsx` | screen | request-response | self — prepend explanation card when `paramId` matches supported list | exact |
| `src/screens/SettingsScreen.tsx` | config/screen | n/a (key registration) | self — add one string to `ALL_STORAGE_KEYS` array | exact |

---

## Pattern Assignments

---

### `src/screens/GuidedFirstRunScreen.tsx` (NEW — screen, multi-step form)

**Primary analog:** `src/screens/OnboardingScreen.tsx`

**Imports pattern** (OnboardingScreen.tsx lines 1–12):
```typescript
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ScrollView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
```

Add for this screen:
```typescript
import { KeyboardAvoidingView, Platform } from 'react-native';
import BreathingCard from '../components/BreathingCard';
import RangeBar from '../components/RangeBar';
import { BIOMARKERS } from '../data/biomarkers';
import { FIRST_RUN_CONTENT } from '../data/firstRunContent';
import { Motion } from '../theme';
```

**Step-machine pattern** (OnboardingScreen.tsx lines 91–263 — early-return per step):
```typescript
// Each step returns its own JSX from the component function body.
// No switch/case — sequential early-returns keep each step self-contained.
if (step === 0) return (
  <SafeAreaView style={s.safe}>
    {/* step 0 UI */}
  </SafeAreaView>
);

if (step === 1) return (
  <SafeAreaView style={s.safe}>
    {/* step 1 UI */}
  </SafeAreaView>
);

// Final step falls through to the default return.
return (
  <SafeAreaView style={s.safe}>
    {/* step 2 UI */}
  </SafeAreaView>
);
```

**Step progress indicator — ProgressBar sub-component pattern** (OnboardingScreen.tsx lines 31–40):
```typescript
// OnboardingScreen uses a segmented bar. GuidedFirstRunScreen uses dot indicators per UI-SPEC.
// Sub-component pattern to copy:
function ProgressBar({ step }: { step: number }) {
  return (
    <View style={s.progressRow}>
      {[0, 1, 2].map(i => (
        <View key={i} style={[s.progressDot,
          i === step ? s.progressDotActive : s.progressDotInactive]} />
      ))}
    </View>
  );
}
// Render above ScrollView: <ProgressBar step={step} />
```

**Navigation reset pattern — nav.reset to Main** (OnboardingScreen.tsx line 87–88):
```typescript
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
nav.reset({ index: 0, routes: [{ name: 'Main' }] });
```

**AsyncStorage write + haptics pattern** (OnboardingScreen.tsx lines 76–88):
```typescript
async function finish() {
  // ... build payload ...
  await AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(profile));
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  nav.reset({ index: 0, routes: [{ name: 'Main' }] });
}
```
Adapt for GuidedFirstRunScreen step advance:
```typescript
async function handleStepAdvance() {
  const parsed = parseFloat(inputValue);
  if (isNaN(parsed) || parsed <= 0) { setInputError('Enter a number to continue'); return; }
  setInputError('');
  // save entry to @vitalspan_biomarkers (same pattern as BiomarkerEntryScreen lines 94–106)
  const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
  const entries: StoredEntry[] = raw ? JSON.parse(raw) : [];
  entries.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    biomarkerId: STEPS[step].biomarkerId, value: parsed,
    date: new Date().toISOString(), source: 'Blood test', notes: '' });
  await AsyncStorage.setItem('@vitalspan_biomarkers', JSON.stringify(entries));
  Haptics.selectionAsync().catch(() => null);
  setInputValue('');
  setStep(s => s + 1);
}

async function handleSkip() {
  await AsyncStorage.setItem('@vitalspan_first_run_complete', 'true');
  nav.reset({ index: 0, routes: [{ name: 'Main' }] });
}

async function handleFinish() {
  // save final entry first (same as handleStepAdvance without advancing step)
  await AsyncStorage.setItem('@vitalspan_first_run_complete', 'true');
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  nav.reset({ index: 0, routes: [{ name: 'Main' }] });
}
```

**BreathingCard explanation card pattern** (from DashboardScreen.tsx lines 181–233 and BreathingCard.tsx):
```typescript
// BreathingCard wraps any View — pass glowColor, children are inner card content.
<BreathingCard style={s.explanationCardWrapper} glowColor={Colors.primaryDark}>
  <View style={s.explanationCardInner}>
    <Text style={s.explanationIcon}>{content.icon}</Text>
    <Text style={s.explanationHeadline}>{content.headline}</Text>
    <Text style={s.explanationBody}>{content.body}</Text>
  </View>
</BreathingCard>
```

**TextInput with focus border color** (dynamic inline style, not in StyleSheet — convention from UI-SPEC):
```typescript
const [focused, setFocused] = useState(false);
// ...
<TextInput
  style={[s.valueInput, { borderColor: focused ? Colors.primary : Colors.border }]}
  keyboardType="decimal-pad"
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
/>
```

**Primary CTA button style** (OnboardingScreen.tsx line 311):
```typescript
btnMain: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center' },
btnMainTxt: { color: Colors.primaryBg, fontSize: Typography.sizes.md, fontWeight: '600' },
```
UI-SPEC requires `Radius.xl` and `height: 52` — use `borderRadius: Radius.xl, height: 52, justifyContent: 'center'`.

**Skip link style** (OnboardingScreen.tsx line 314):
```typescript
btnSkip: { color: Colors.textMuted, fontSize: Typography.sizes.sm, textAlign: 'center', padding: 4 },
```
UI-SPEC requires `paddingVertical: 12` for 44pt touch target — override to `paddingVertical: 12`.

**StyleSheet placement convention** (all screen files — bottom of file, named `s`):
```typescript
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  // ... all values from theme tokens, no hardcoded hex or numbers ...
});
```

**KeyboardAvoidingView for footer** (not in OnboardingScreen but specified by UI-SPEC — wrap footer `View`):
```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={s.footer}
>
  <TouchableOpacity style={s.btnMain} onPress={step === 2 ? handleFinish : handleStepAdvance}>
    <Text style={s.btnMainTxt}>{CTA_LABELS[step]}</Text>
  </TouchableOpacity>
  {step < 2 && (
    <TouchableOpacity onPress={handleSkip} style={s.skipTouchable}>
      <Text style={s.btnSkip}>{"I'll do this later"}</Text>
    </TouchableOpacity>
  )}
</KeyboardAvoidingView>
```

---

### `src/data/firstRunContent.ts` (NEW — data, static object map)

**Primary analog:** `src/data/biomarkers.ts` (interface + exported const pattern, lines 1–19)

**Interface + exported const pattern** (biomarkers.ts lines 3–19):
```typescript
import { Colors } from '../theme';  // only if needed; firstRunContent.ts has no color deps

export interface FirstRunContent {
  biomarkerId: string;
  icon: string;
  headline: string;
  body: string;
}

export const FIRST_RUN_CONTENT: FirstRunContent[] = [
  {
    biomarkerId: 'fastingglucose',
    icon: '🍬',
    headline: 'Why Fasting Glucose Matters',
    body: 'Fasting glucose is one of the earliest signals...',
  },
  // ...
];

// Lookup map for O(1) access in screens
export const FIRST_RUN_CONTENT_MAP: Record<string, FirstRunContent> =
  Object.fromEntries(FIRST_RUN_CONTENT.map(c => [c.biomarkerId, c]));
```
Note: `biomarkers.ts` does not export a lookup map but `FIRST_RUN_CONTENT_MAP` is the pattern used by `BiomarkerEntryScreen` to gate the explanation card without a `.find()` on every render.

---

### `src/navigation/AppNavigator.tsx` (MODIFY — add GuidedFirstRun route)

**Exact change location** (AppNavigator.tsx lines 23–34 for type, lines 160–164 for screen):

Add to `RootStackParamList` (line 33, after `LongevityScore: undefined`):
```typescript
GuidedFirstRun: undefined;
```

Add `Stack.Screen` entry — copy the `LongevityScore` block exactly (lines 160–164) and adapt:
```typescript
// Existing pattern to copy:
<Stack.Screen
  name="LongevityScore"
  component={LongevityScoreScreen}
  options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
/>

// New entry — same presentation, add gestureEnabled: false per D-02:
<Stack.Screen
  name="GuidedFirstRun"
  component={GuidedFirstRunScreen}
  options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom', gestureEnabled: false }}
/>
```

Add import at top with other screen imports (lines 7–19):
```typescript
import GuidedFirstRunScreen from '../screens/GuidedFirstRunScreen';
```

---

### `src/screens/OnboardingScreen.tsx` (MODIFY — change nav.reset target)

**Exact change:** line 88 only.

Current (line 88):
```typescript
nav.reset({ index: 0, routes: [{ name: 'Main' }] });
```

Replace with:
```typescript
nav.reset({ index: 0, routes: [{ name: 'GuidedFirstRun' }] });
```

No other changes needed. The `GuidedFirstRun` route must exist in `RootStackParamList` first (AppNavigator change is a prerequisite).

---

### `src/screens/DashboardScreen.tsx` (MODIFY — add first_run_complete read + empty state)

**Primary analog:** self — follow existing `loadData` and conditional render patterns.

**Promise.all extension pattern** (DashboardScreen.tsx lines 41–64):
```typescript
// Existing Promise.all:
const [profileRaw, entriesRaw, protocolRaw, hData, exerciseRaw] = await Promise.all([
  AsyncStorage.getItem('@vitalspan_user_profile'),
  AsyncStorage.getItem('@vitalspan_biomarkers'),
  AsyncStorage.getItem('@vitalspan_protocol_today'),
  loadHealthData(),
  AsyncStorage.getItem('@vitalspan_exercise_log'),
]);

// Extend — add @vitalspan_first_run_complete as 6th item:
const [profileRaw, entriesRaw, protocolRaw, hData, exerciseRaw, firstRunRaw] = await Promise.all([
  AsyncStorage.getItem('@vitalspan_user_profile'),
  AsyncStorage.getItem('@vitalspan_biomarkers'),
  AsyncStorage.getItem('@vitalspan_protocol_today'),
  loadHealthData(),
  AsyncStorage.getItem('@vitalspan_exercise_log'),
  AsyncStorage.getItem('@vitalspan_first_run_complete'),
]);
// After the Promise.all, add:
const firstRunComplete = firstRunRaw === 'true';
setFirstRunComplete(firstRunComplete);
```

Add state variable alongside existing ones (after line 39):
```typescript
const [firstRunComplete, setFirstRunComplete] = useState(false);
```

**Empty state branch pattern** (DashboardScreen.tsx lines 263–314 — the existing "Biomarkers" section):
```typescript
// Replace the horizontal biomarker ScrollView with a conditional:
{entries.length === 0 && !firstRunComplete ? (
  <View style={s.emptyStateCard}>
    <Text style={s.emptyStateIcon}>🧬</Text>
    <Text style={s.emptyStateHeading}>Your longevity data starts here</Text>
    <Text style={s.emptyStateBody}>
      Log your first three biomarkers — Glucose, HbA1c, and Cholesterol — to unlock your
      Longevity Score and biological age projection.
    </Text>
    <TouchableOpacity
      style={s.emptyStateCta}
      onPress={() => nav.navigate('GuidedFirstRun')}
    >
      <Text style={s.emptyStateCtaTxt}>Log Your First Biomarkers</Text>
    </TouchableOpacity>
  </View>
) : (
  // existing biomarker horizontal scroll — unchanged
  <ScrollView horizontal ...>
    {BIOMARKERS.slice(0, 5).map(...)}
  </ScrollView>
)}
```

**FutureSelf locked state** (DashboardScreen.tsx lines 235–241 — existing FutureSelf usage):
```typescript
// Current usage (always shows with data props):
<FutureSelf
  biologicalAge={bioAge ?? undefined}
  chronologicalAge={profile?.age}
  optimality={biomarkerOptimality}
  loggedBiomarkerIds={Array.from(entryMap.keys())}
  onBiomarkerPress={(id) => nav.navigate('BiomarkerEntry', { biomarkerId: id })}
/>

// When entries.length === 0, pass no data props — FutureSelf handles locked state internally:
<FutureSelf
  biologicalAge={undefined}
  chronologicalAge={profile?.age}
  optimality={0}
  loggedBiomarkerIds={[]}
  onBiomarkerPress={(id) => nav.navigate('BiomarkerEntry', { biomarkerId: id })}
/>
// Per CONTEXT D-11: FutureSelf stays visible in locked state above the empty state card.
// No conditional needed — just pass empty/undefined props (existing component already handles this).
```

**Empty state card styles to add to `s`** (follow existing card token pattern — DashboardScreen.tsx lines 463–466):
```typescript
// Model after s.protoEmpty + s.protocolCard patterns:
emptyStateCard: {
  marginHorizontal: Spacing.base,
  backgroundColor: Colors.bgCard,
  borderRadius: Radius.lg,
  borderWidth: 1,
  borderColor: Colors.borderLight,
  padding: Spacing.xl,
  alignItems: 'center',
  marginBottom: Spacing.base,
},
emptyStateIcon: { fontSize: 32, marginBottom: Spacing.md },
emptyStateHeading: {
  fontSize: Typography.sizes.h3,
  fontWeight: '600',
  color: Colors.textPrimary,
  textAlign: 'center',
  marginBottom: Spacing.sm,
},
emptyStateBody: {
  fontSize: Typography.sizes.body,
  fontWeight: '400',
  color: Colors.textSecondary,
  textAlign: 'center',
  lineHeight: 24,
  marginBottom: Spacing.lg,
},
emptyStateCta: {
  backgroundColor: Colors.primary,
  borderRadius: Radius.xl,
  height: 48,
  paddingHorizontal: Spacing.base,
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'stretch',
},
emptyStateCtaTxt: { color: Colors.bgCard, fontSize: Typography.sizes.base, fontWeight: '600' },
```

---

### `src/screens/BiomarkerDetailScreen.tsx` (MODIFY — add EMPTY-02 empty state to list view)

**Primary analog:** self — follow existing `emptyHistRow` pattern (lines 183–195) and card token patterns.

**Existing inline empty state pattern** (BiomarkerDetailScreen.tsx lines 183–195):
```typescript
// Already in detail view for empty history. Same visual pattern to use for list view:
{history.length === 0 ? (
  <View style={s.emptyHistRow}>
    <Text style={s.emptyTxt}>No entries logged yet</Text>
    <TouchableOpacity style={s.logCta} onPress={() => nav.navigate('BiomarkerEntry', { biomarkerId: selectedId })}>
      <Text style={s.logCtaTxt}>+ Log first entry →</Text>
    </TouchableOpacity>
  </View>
) : ( ...history rows... )}
```

**List view insertion point** (BiomarkerDetailScreen.tsx line 271 — just before the `ScrollView` containing `CATEGORIES.map`):
```typescript
// Insert at the top of the list view ScrollView content, above CATEGORIES.map:
// Condition: entries.length === 0
{entries.length === 0 && (
  <View style={s.emptyTabCard}>
    <Text style={s.emptyTabIcon}>📊</Text>
    <Text style={s.emptyTabHeading}>No biomarkers tracked yet</Text>
    <Text style={s.emptyTabBody}>
      Start with your most recent lab results. Three values unlock your biological age score.
    </Text>
    <TouchableOpacity
      style={s.emptyTabCta}
      onPress={() => nav.navigate('GuidedFirstRun')}
    >
      <Text style={s.emptyTabCtaTxt}>Log Your First Result</Text>
    </TouchableOpacity>
  </View>
)}
```

**Empty state card styles** (follow existing `s.card` and `s.insightCard` patterns — lines 367–377, 421):
```typescript
emptyTabCard: {
  marginHorizontal: Spacing.base,
  marginTop: Spacing.base,
  backgroundColor: Colors.bgCard,
  borderRadius: Radius.lg,
  borderWidth: 1,
  borderColor: Colors.borderLight,
  padding: Spacing.xl,
  alignItems: 'center',
},
emptyTabIcon: { fontSize: 32, marginBottom: Spacing.md },
emptyTabHeading: {
  fontSize: Typography.sizes.h3,
  fontWeight: '600',
  color: Colors.textPrimary,
  textAlign: 'center',
  marginBottom: Spacing.sm,
},
emptyTabBody: {
  fontSize: Typography.sizes.body,
  fontWeight: '400',
  color: Colors.textSecondary,
  textAlign: 'center',
  lineHeight: 24,
  marginBottom: Spacing.lg,
},
emptyTabCta: {
  backgroundColor: Colors.primary,
  borderRadius: Radius.xl,
  height: 48,
  paddingHorizontal: Spacing.base,
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'stretch',
},
emptyTabCtaTxt: { color: Colors.bgCard, fontSize: Typography.sizes.base, fontWeight: '600' },
```

---

### `src/screens/BiomarkerEntryScreen.tsx` (MODIFY — add explanation card)

**Primary analog:** self — add conditional block at top of "Step 2: enter value" return (line 154).

**Insertion point** (BiomarkerEntryScreen.tsx — inside the "Step 2" `ScrollView`, before `s.valueCard`):
```typescript
// Add at top of BiomarkerEntryScreen.tsx imports:
import BreathingCard from '../components/BreathingCard';
import { FIRST_RUN_CONTENT_MAP } from '../data/firstRunContent';
import { Motion } from '../theme';

// Inside "Step 2" ScrollView, before the valueCard View (line 166):
{selected && FIRST_RUN_CONTENT_MAP[selected.id] && (() => {
  const content = FIRST_RUN_CONTENT_MAP[selected.id];
  return (
    <BreathingCard style={s.explanationWrapper} glowColor={Colors.primaryDark} period={Motion.breath}>
      <View style={s.explanationInner}>
        <Text style={s.explanationIcon}>{content.icon}</Text>
        <Text style={s.explanationHeadline}>{content.headline}</Text>
        <Text style={s.explanationBody}>{content.body}</Text>
      </View>
    </BreathingCard>
  );
})()}
```

**Explanation card styles to add to `s`** (follow existing `s.valueCard` pattern — BiomarkerEntryScreen.tsx line 298):
```typescript
explanationWrapper: { marginBottom: Spacing.md },
explanationInner: {
  backgroundColor: Colors.bgCard,
  borderRadius: Radius.lg,
  borderWidth: 1,
  borderColor: Colors.borderLight,
  padding: Spacing.base,
},
explanationIcon: { fontSize: 24, marginBottom: Spacing.sm },
explanationHeadline: {
  fontSize: Typography.sizes.h3,
  fontWeight: '600',
  color: Colors.textPrimary,
  marginBottom: Spacing.sm,
},
explanationBody: {
  fontSize: Typography.sizes.body,
  fontWeight: '400',
  color: Colors.textSecondary,
  lineHeight: 24,
},
```

---

### `src/screens/SettingsScreen.tsx` (MODIFY — add key to ALL_STORAGE_KEYS)

**Exact change location** (SettingsScreen.tsx lines 15–22):

Current:
```typescript
const ALL_STORAGE_KEYS = [
  '@vitalspan_user_profile',
  '@vitalspan_biomarkers',
  '@vitalspan_protocol',
  '@vitalspan_protocol_today',
  '@vitalspan_health_data',
  '@vitalspan_health_permissions',
];
```

Add one entry:
```typescript
const ALL_STORAGE_KEYS = [
  '@vitalspan_user_profile',
  '@vitalspan_biomarkers',
  '@vitalspan_protocol',
  '@vitalspan_protocol_today',
  '@vitalspan_health_data',
  '@vitalspan_health_permissions',
  '@vitalspan_first_run_complete',   // Phase 1: guided first-run completion flag
];
```

No other changes needed in this file.

---

## Shared Patterns

### AsyncStorage read — Promise.all + useFocusEffect
**Source:** `src/screens/DashboardScreen.tsx` lines 41–68
**Apply to:** `GuidedFirstRunScreen` (if it needs to read existing data on mount — not required per spec, but the pattern is available if needed)
```typescript
const loadData = useCallback(async () => {
  try {
    const [key1Raw, key2Raw] = await Promise.all([
      AsyncStorage.getItem('@vitalspan_key1'),
      AsyncStorage.getItem('@vitalspan_key2'),
    ]);
    if (key1Raw) setState1(JSON.parse(key1Raw));
    if (key2Raw) setState2(JSON.parse(key2Raw));
  } catch (e) {
    console.error(e);
  }
}, []);

useFocusEffect(
  useCallback(() => { loadData(); }, [loadData])
);
```

### AsyncStorage write — biomarker entry
**Source:** `src/screens/BiomarkerEntryScreen.tsx` lines 90–111
**Apply to:** `GuidedFirstRunScreen` step advance handler
```typescript
async function save() {
  const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
  const entries: StoredEntry[] = raw ? JSON.parse(raw) : [];
  entries.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    biomarkerId: selected.id,
    value: numVal,
    date: new Date().toISOString(),
    source: 'Blood test',
    notes: '',
  });
  await AsyncStorage.setItem('@vitalspan_biomarkers', JSON.stringify(entries));
}
```

### Navigation reset
**Source:** `src/screens/OnboardingScreen.tsx` line 88; `src/screens/SettingsScreen.tsx` lines 86–91
**Apply to:** `GuidedFirstRunScreen` skip handler and finish handler
```typescript
nav.reset({ index: 0, routes: [{ name: 'Main' }] });
```

### Haptics
**Source:** `src/screens/OnboardingScreen.tsx` lines 73, 87
**Apply to:** `GuidedFirstRunScreen` — selectionAsync on step advance, notificationAsync(Success) on final completion
```typescript
Haptics.selectionAsync().catch(() => null);                                          // step advance
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null); // final step
```

### Primary CTA button
**Source:** `src/screens/OnboardingScreen.tsx` lines 110–113, 311–313
**Apply to:** `GuidedFirstRunScreen`, empty state cards in Dashboard and BiomarkerDetail
```typescript
// TouchableOpacity with activeOpacity: 0.82 (from UI-SPEC) — existing screens use 0.88
<TouchableOpacity style={s.btnMain} onPress={handler} activeOpacity={0.82}>
  <Text style={s.btnMainTxt}>Label</Text>
</TouchableOpacity>

// Style (adapt to Radius.xl + height 52 per UI-SPEC):
btnMain: { backgroundColor: Colors.primary, borderRadius: Radius.xl, height: 52, justifyContent: 'center', alignItems: 'center' },
btnMainTxt: { color: Colors.bgCard, fontSize: Typography.sizes.base, fontWeight: '600' },
```

### BreathingCard wrapper usage
**Source:** `src/screens/DashboardScreen.tsx` lines 181–233; `src/components/BreathingCard.tsx`
**Apply to:** `GuidedFirstRunScreen` explanation card, `BiomarkerEntryScreen` explanation card
```typescript
// BreathingCard accepts: children, style (ViewStyle), glowColor (string), period (number)
// Default glowColor = '#1C3B2A' (Colors.primaryDark) — do not override per UI-SPEC
<BreathingCard glowColor={Colors.primaryDark} period={Motion.breath}>
  <View style={s.innerCard}>
    {/* card content */}
  </View>
</BreathingCard>
```

### StyleSheet convention
**Source:** Every screen file — `s` at bottom of file, all values from theme tokens
**Apply to:** All new/modified files
```typescript
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  // Colors.*, Spacing.*, Radius.*, Typography.sizes.* only
  // No hardcoded hex values or numbers
});
```

---

## No Analog Found

All files in this phase have close analogs. No entries in this section.

---

## Metadata

**Analog search scope:** `src/screens/`, `src/components/`, `src/data/`, `src/navigation/`
**Files read:** 9 source files fully read
**Pattern extraction date:** 2026-05-25
