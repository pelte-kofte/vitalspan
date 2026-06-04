# Phase 11: Supplement & Drug Database - Pattern Map

**Mapped:** 2026-06-04
**Files analyzed:** 5 (2 data files modified, 2 screen files modified, 1 potential new component)
**Analogs found:** 5 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/data/supplementTimings.ts` | data / static DB | transform (interface extension + new entries) | itself (existing 47 entries) | exact |
| `src/data/biomarkers.ts` | data / static DB | transform (append new interaction pairs) | itself (existing 30 pairs in `INTERACTIONS`) | exact |
| `src/screens/InteractionCheckerScreen.tsx` | screen | request-response + event-driven (AsyncStorage read on focus) | `src/screens/ProtocolScreen.tsx` (useFocusEffect + AsyncStorage pattern) | role-match |
| `src/screens/ProtocolScreen.tsx` | screen | CRUD + event-driven (Library section reads SUPPLEMENT_DATABASE) | `AddCustomSupplementModal` inside itself (search + filter + DB rows) | exact (self-analog) |
| `src/components/SupplementLibrarySection.tsx` (new, if extraction needed) | component | transform (filter + group SUPPLEMENT_DATABASE) | `AddCustomSupplementModal` in `ProtocolScreen.tsx` lines 113–198 | role-match |

---

## Pattern Assignments

### `src/data/supplementTimings.ts` — interface extension + new entries

**Analog:** itself (lines 7–22 for interface; lines 727–762 for prescription-only entries)

**Interface extension pattern** (`supplementTimings.ts` lines 7–22) — add three optional fields after `rxNote`:
```typescript
export interface SupplementInfo {
  id: string;
  name: string;
  category: 'nad' | 'mitochondrial' | 'cardiovascular' | 'metabolic' | 'sleep' | 'antioxidant' | 'mineral' | 'vitamin' | 'adaptogen' | 'amino_acid' | 'nootropic' | 'senolytic' | 'prescription_only';
  defaultDose: string;
  timing: SupplementTiming;
  bestTime: BestTime;
  avoidWith: string[];
  separateFromMeds: { drug: string; hours: number; reason: string }[];
  reason: string;
  evidenceGrade: EvidenceGrade;
  shortDescription: string;
  contraindications?: string[];
  prescriptionOnly?: boolean;
  rxNote?: string;
  // NEW — add these three lines:
  mechanismOfAction?: string;
  longevityRelevance?: string;
  rxLabel?: string;
}
```

**OTC supplement entry pattern** (`supplementTimings.ts` lines 55–83) — copy CoQ10 shape for new mitochondrial/antioxidant entries:
```typescript
{
  id: 'coq10',
  name: 'CoQ10 (Ubiquinol)',
  category: 'mitochondrial',
  defaultDose: '100-200mg',
  timing: 'with_fat',
  bestTime: 'morning',
  avoidWith: [],
  separateFromMeds: [
    { drug: 'warfarin', hours: 0, reason: 'May reduce warfarin effectiveness — monitor INR' }
  ],
  reason: 'Fat-soluble — bioavailability increases 3x with dietary fat. Ubiquinol form preferred over 40.',
  evidenceGrade: 'A',
  shortDescription: 'Essential for cellular energy production. Depleted by statins.',
  // New optional fields for all new entries:
  mechanismOfAction: '...',
  longevityRelevance: '...',
},
```

**Prescription-only entry pattern** (`supplementTimings.ts` lines 727–762) — exact shape to copy for Rapamycin rxLabel backfill and new drug class entries:
```typescript
{
  id: 'metformin_rx',
  name: 'Metformin (Rx)',
  category: 'prescription_only',
  defaultDose: '500-1000mg (2x daily)',
  timing: 'with_meal',
  bestTime: 'morning',
  avoidWith: [],
  separateFromMeds: [],
  reason: 'AMPK activator with longevity evidence (TAME trial). Requires prescription.',
  evidenceGrade: 'B',
  shortDescription: 'Longevity candidate drug — AMPK activation, anti-aging in trials.',
  prescriptionOnly: true,
  rxNote: 'Prescription required. Discuss with your physician.',
  // ADD: rxLabel field to existing metformin_rx and rapamycin_rx; use on all new drug class entries:
  rxLabel: 'Off-label (longevity)',  // or 'Rx Only' for standard drug classes
}
```

**Drug class entry pattern** (new entries for D-05) — copy rapamycin shape with drug-class-appropriate `separateFromMeds`:
```typescript
{
  id: 'statins_class',
  name: 'Statins (Atorvastatin / Rosuvastatin / Simvastatin)',
  category: 'prescription_only',
  defaultDose: 'Dose per prescription',
  timing: 'with_meal',
  bestTime: 'evening',
  avoidWith: [],
  separateFromMeds: [
    { drug: 'coq10', hours: 0, reason: 'Statins deplete CoQ10 — supplementation recommended' },
    { drug: 'berberine', hours: 4, reason: 'Berberine inhibits CYP3A4, may increase statin levels' },
  ],
  reason: 'HMG-CoA reductase inhibition. Also depletes CoQ10 — supplement 100-200mg CoQ10 when on statins.',
  evidenceGrade: 'A',
  shortDescription: 'Reduce LDL-C and cardiovascular risk. Deplete CoQ10 — supplement advised.',
  mechanismOfAction: 'Competitive inhibition of HMG-CoA reductase, the rate-limiting enzyme in cholesterol biosynthesis; also depletes CoQ10.',
  longevityRelevance: 'Reduces cardiovascular mortality; growing evidence for pleiotropic anti-inflammatory effects beyond cholesterol lowering.',
  prescriptionOnly: true,
  rxNote: 'Prescription required.',
  rxLabel: 'Rx Only',
}
```

**Helper function pattern** (`supplementTimings.ts` lines 764–767) — keep existing helpers, add none:
```typescript
// Existing helper — do NOT remove or modify
export function getSupplementInfo(id: string): SupplementInfo | undefined {
  return SUPPLEMENT_DATABASE.find(s => s.id === id);
}
```

---

### `src/data/biomarkers.ts` — INTERACTIONS expansion

**Analog:** itself (lines 968–1070, existing 30 pairs)

**New interaction pair pattern** (`biomarkers.ts` lines 968–1013) — copy this exact shape including the `as const` severity assertion and comment header:
```typescript
// ── Additional pharmacist-verified interactions ────────────────────────────
// Source: Stockley's Drug Interactions, Medscape Drug Interaction Checker, 2024
// [PHARMACIST REVIEW REQUIRED] — each new entry must be verified before commit
{
  id: 'cbd-warfarin',
  drug: 'Warfarin',
  supplement: 'CBD',
  severity: 'high' as const,
  title: 'CBD + Warfarin',
  body: 'CBD inhibits CYP2C9, the primary enzyme metabolizing warfarin, raising plasma warfarin levels and bleeding risk.',
  recommendation: 'Avoid combination without physician supervision. If used, INR must be closely monitored and warfarin dose likely reduced.',
},
```

**Critical:** The `drug` field string must exactly match the strings used in `INTERACTIONS` lookup in `InteractionCheckerScreen.tsx` (lines 75–78), which lowercases both sides for comparison. Use `'Statin'` (capital S), `'Warfarin'` (capital W), `'Ibuprofen'` for NSAIDs — these are the existing conventions in the 30-pair array.

**Beneficial pair pattern** (`biomarkers.ts` lines 1024–1031):
```typescript
{
  id: 'coq10-statin',
  drug: 'Statin',
  supplement: 'CoQ10',
  severity: 'beneficial' as const,
  title: 'CoQ10 + Statin',
  body: 'Statins deplete CoQ10. Supplementing CoQ10 alongside statin therapy may reduce statin-related muscle symptoms.',
  recommendation: '100-200mg CoQ10 daily. Take with a fatty meal for absorption.',
},
```

---

### `src/screens/InteractionCheckerScreen.tsx` — auto-populate + chip redesign + SAFE_COMBOS expansion

**Analog:** `src/screens/ProtocolScreen.tsx` lines 337–358 (useFocusEffect + AsyncStorage + Promise.all pattern)

**Import additions** (add to existing imports at `InteractionCheckerScreen.tsx` lines 1–9):
```typescript
// Add to existing React import:
import React, { useState, useMemo, useEffect, useCallback } from 'react';
// Add after existing imports:
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPLEMENT_DATABASE } from '../data/supplementTimings';
import { MEDICATION_DATABASE } from '../data/medications';
```

**SUPPLEMENTS const replacement** (remove line 11 hardcoded array; replace with category-grouped `useMemo`):
```typescript
// REMOVE this line:
// const SUPPLEMENTS = ['NMN', 'Omega-3', 'Berberine', 'Resveratrol', 'CoQ10', 'Vitamin K2', 'Magnesium', 'Vitamin D'];

// ADD — derive chips from SUPPLEMENT_DATABASE grouped by category:
// (Place after state declarations, not at module level, because it uses useMemo)
const chipsByCategory = useMemo(() => {
  const map = new Map<string, typeof SUPPLEMENT_DATABASE>();
  for (const supp of SUPPLEMENT_DATABASE) {
    if (!map.has(supp.category)) map.set(supp.category, []);
    map.get(supp.category)!.push(supp);
  }
  return map;
}, []);
```

**Category-to-drug-class resolution constant** (add at module level, after SAFE_COMBOS, before component function):
```typescript
const CATEGORY_TO_DRUG_CLASS: Record<string, string> = {
  statin: 'Statin',
  nsaid: 'Ibuprofen',
  thyroid: 'Levothyroxine',
  diabetes: 'Metformin',
  anticoagulant: 'Warfarin',
};
```

**Auto-populate useFocusEffect pattern** — copy the structure from `ProtocolScreen.tsx` lines 337–358, adapted for InteractionChecker:
```typescript
// Reference: ProtocolScreen.tsx loadData() pattern (lines 337–358) + useFocusEffect (line 358)
// Add AFTER existing state declarations (~line 37), BEFORE addItem/removeItem functions:

const [autoPopulated, setAutoPopulated] = useState(false);

useFocusEffect(useCallback(() => {
  if (autoPopulated) return;  // Only auto-populate once (not on every focus)
  let active = true;

  async function autoPopulate() {
    const [protocolRaw, profileRaw] = await Promise.all([
      AsyncStorage.getItem('@vitalspan_protocol'),
      AsyncStorage.getItem('@vitalspan_user_profile'),
    ]);
    if (!active) return;

    const newItems: { name: string; type: 'drug' | 'supp' }[] = [];

    if (protocolRaw) {
      const protocol: { addedSupplements?: string[] } = JSON.parse(protocolRaw);
      for (const suppName of (protocol.addedSupplements ?? [])) {
        newItems.push({ name: suppName, type: 'supp' });
      }
    }

    if (profileRaw) {
      const profile: { medications?: string[] } = JSON.parse(profileRaw);
      for (const medName of (profile.medications ?? [])) {
        const entry = MEDICATION_DATABASE.find(m =>
          m.genericName.toLowerCase() === medName.toLowerCase() ||
          m.brandNames.some(b => b.toLowerCase() === medName.toLowerCase())
        );
        const resolvedClass = entry
          ? (CATEGORY_TO_DRUG_CLASS[entry.category] ?? medName)
          : medName;
        newItems.push({ name: resolvedClass, type: 'drug' });
      }
    }

    if (newItems.length > 0) {
      setItems(prev => {
        const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
        return [
          ...prev,
          ...newItems.filter(i => !existingNames.has(i.name.toLowerCase())),
        ];
      });
    }
    setAutoPopulated(true);
  }

  void autoPopulate();
  return () => { active = false; };
}, [autoPopulated]));
```

**Chip render replacement** (replace flat `SUPPLEMENTS.map` at lines 110–116 with categorized expandable sections):
```typescript
// State for expanded category sections — add to state declarations:
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['nad', 'mitochondrial']));

function toggleCategory(cat: string) {
  setExpandedCategories(prev => {
    const next = new Set(prev);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    return next;
  });
}

// Replace the existing chipRow View (lines 110–116) with:
{Array.from(chipsByCategory.entries()).map(([cat, supps]) => (
  <View key={cat}>
    <TouchableOpacity style={s.catHeader} onPress={() => toggleCategory(cat)}>
      <Text style={s.catLabel}>{CATEGORY_LABELS[cat] ?? cat}</Text>
      <Text style={s.catChevron}>{expandedCategories.has(cat) ? '▾' : '▸'}</Text>
    </TouchableOpacity>
    {expandedCategories.has(cat) && (
      <View style={s.chipRow}>
        {supps.map(supp => (
          <TouchableOpacity
            key={supp.id}
            style={[s.chip, s.chipSupp]}
            onPress={() => addItem(supp.name, 'supp')}
          >
            <Text style={s.chipSuppTxt}>+ {supp.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
))}
```

**Category label map** (add at module level alongside CATEGORY_TO_DRUG_CLASS):
```typescript
const CATEGORY_LABELS: Record<string, string> = {
  nad: 'NAD+ Pathway',
  mitochondrial: 'Mitochondrial',
  senolytic: 'Senolytics',
  adaptogen: 'Adaptogens',
  nootropic: 'Nootropics',
  vitamin: 'Vitamins',
  mineral: 'Minerals',
  antioxidant: 'Antioxidants',
  amino_acid: 'Amino Acids',
  metabolic: 'Metabolic',
  cardiovascular: 'Cardiovascular',
  prescription_only: 'Prescription / Drug Classes',
};
```

**SAFE_COMBOS expansion pattern** (`InteractionCheckerScreen.tsx` lines 13–18) — copy existing entry shape:
```typescript
// Existing shape — copy exactly for new entries:
{ pair: 'NMN + Resveratrol', body: 'Synergistic NAD+ pathway. No known adverse interactions.' },
// New entries follow same shape:
{ pair: 'NMN + Apigenin', body: 'Apigenin inhibits CD38 (NAD+ degradation enzyme), synergistically preserving NAD+ raised by NMN supplementation.' },
```

**StyleSheet additions** (add to existing `s` StyleSheet at line 248+, following existing naming and token conventions):
```typescript
// All new styles go in the existing `s = StyleSheet.create({...})` block:
catHeader: {
  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
},
catLabel: {
  fontSize: 11, fontWeight: '600', color: Colors.textMuted,
  textTransform: 'uppercase', letterSpacing: 1.5,
},
catChevron: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
```

---

### `src/screens/ProtocolScreen.tsx` — Supplement Library section

**Analog:** `AddCustomSupplementModal` in `ProtocolScreen.tsx` lines 113–198 (search input + DB filter + row with grade badge)

**State additions** (add after line 335 existing state declarations):
```typescript
// Existing state for reference:
const [showAddModal, setShowAddModal] = useState(false);
const [showRecommendedSheet, setShowRecommendedSheet] = useState(false);

// NEW — add after:
const [libSearch, setLibSearch] = useState('');
const [libExpanded, setLibExpanded] = useState<Set<string>>(new Set());
```

**Library search filter pattern** (copy from `AddCustomSupplementModal` lines 122–128, adapted for Library section):
```typescript
// Source: ProtocolScreen.tsx AddCustomSupplementModal lines 122–128
const dbResults = useMemo(() => {
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  return SUPPLEMENT_DATABASE.filter(s =>
    s.name.toLowerCase().includes(q) || s.shortDescription.toLowerCase().includes(q),
  ).slice(0, 6);
}, [query]);

// Library section version — no 6-item cap, grouped by category:
const libFiltered = useMemo(() => {
  const q = libSearch.trim().toLowerCase();
  if (!q) return SUPPLEMENT_DATABASE;
  return SUPPLEMENT_DATABASE.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.shortDescription.toLowerCase().includes(q) ||
    (s.mechanismOfAction ?? '').toLowerCase().includes(q)
  );
}, [libSearch]);
```

**toggleSupplement pattern** (`ProtocolScreen.tsx` lines 401–408) — Library "Add to protocol" button calls this unchanged function:
```typescript
// This existing function handles the Library "Add to protocol" action — no changes needed:
function toggleSupplement(name: string) {
  const isAdded = protocol.addedSupplements.includes(name);
  const addedSupplements = isAdded
    ? protocol.addedSupplements.filter(s => s !== name)
    : [...protocol.addedSupplements, name];
  const taken = isAdded ? protocol.taken.filter(t => t !== name) : protocol.taken;
  persist({ ...protocol, addedSupplements, taken });
}
```

**Evidence grade badge pattern** (`ProtocolScreen.tsx` AddCustomSupplementModal lines 190–196) — reuse for Library rows:
```typescript
// Source: ProtocolScreen.tsx lines 190–196
<View style={[ms.gradeBadge, { backgroundColor: info.evidenceGrade === 'A' ? Colors.primaryBg : Colors.warningBg }]}>
  <Text style={[ms.gradeTxt, { color: info.evidenceGrade === 'A' ? Colors.primary : Colors.warning }]}>
    {info.evidenceGrade}
  </Text>
</View>
```

**Library section JSX insertion point** (`ProtocolScreen.tsx` line 719) — add after the "Add supplement" `addStackBtn` TouchableOpacity and before `<View style={{ height: 32 }} />`:
```typescript
{/* Supplement Library */}
<Text style={s.sectionLabel}>Supplement Library</Text>
<TextInput
  style={libInput}  // see StyleSheet additions below
  placeholder="Search supplements…"
  placeholderTextColor={Colors.Beige.textMuted}
  value={libSearch}
  onChangeText={setLibSearch}
  autoCorrect={false}
/>
{LIBRARY_CATEGORY_ORDER
  .filter(cat => libFiltered.some(s => s.category === cat))
  .map(cat => {
    const catSupps = libFiltered.filter(s => s.category === cat);
    const isOpen = libExpanded.has(cat);
    return (
      <View key={cat}>
        <TouchableOpacity
          style={s.libCatHeader}
          onPress={() => {
            setLibExpanded(prev => {
              const next = new Set(prev);
              if (next.has(cat)) next.delete(cat); else next.add(cat);
              return next;
            });
          }}
        >
          <Text style={s.libCatLabel}>{LIBRARY_CATEGORY_LABELS[cat]}</Text>
          <Text style={s.libCatCount}>{catSupps.length}</Text>
          <Text style={s.libCatChevron}>{isOpen ? '▾' : '▸'}</Text>
        </TouchableOpacity>
        {isOpen && catSupps.map(info => {
          const isAdded = protocol.addedSupplements.includes(info.name);
          const isRowExpanded = libExpanded.has(`detail_${info.id}`);
          return (
            <View key={info.id} style={s.libRow}>
              <TouchableOpacity
                style={s.libRowMain}
                onPress={() => {
                  setLibExpanded(prev => {
                    const next = new Set(prev);
                    const key = `detail_${info.id}`;
                    if (next.has(key)) next.delete(key); else next.add(key);
                    return next;
                  });
                }}
              >
                {/* Grade badge — copy from AddCustomSupplementModal pattern */}
                <View style={[s.gradeBadge, { backgroundColor: info.evidenceGrade === 'A' ? Colors.primaryBg : Colors.warningBg }]}>
                  <Text style={[s.gradeTxt, { color: info.evidenceGrade === 'A' ? Colors.primary : Colors.warning }]}>
                    {info.evidenceGrade}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.libRowName}>{info.name}</Text>
                  <Text style={s.libRowDesc}>{info.shortDescription}</Text>
                </View>
                {info.rxLabel && (
                  <View style={s.rxBadge}>
                    <Text style={s.rxBadgeTxt}>{info.rxLabel}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {isRowExpanded && (
                <View style={s.libDetail}>
                  {info.mechanismOfAction && <Text style={s.libDetailTxt}><Text style={{ fontWeight: '600' }}>How: </Text>{info.mechanismOfAction}</Text>}
                  {info.longevityRelevance && <Text style={s.libDetailTxt}><Text style={{ fontWeight: '600' }}>Why: </Text>{info.longevityRelevance}</Text>}
                  <Text style={s.libDetailDose}>{info.defaultDose} · {info.timing.replace('_', ' ')}</Text>
                  <TouchableOpacity
                    style={[s.libAddBtn, isAdded && s.libAddBtnAdded]}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => null);
                      toggleSupplement(info.name);
                    }}
                  >
                    <Text style={[s.libAddBtnTxt, isAdded && s.libAddBtnTxtAdded]}>
                      {isAdded ? '✓ In your stack' : '+ Add to protocol'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  })
}
```

**Category order and labels constants** (add at module level after `EMPTY_PROTOCOL`, before `AddCustomSupplementModal`):
```typescript
const LIBRARY_CATEGORY_ORDER: SupplementInfo['category'][] = [
  'nad', 'mitochondrial', 'senolytic', 'adaptogen', 'nootropic',
  'vitamin', 'mineral', 'antioxidant', 'amino_acid', 'metabolic',
  'cardiovascular', 'prescription_only',
];

const LIBRARY_CATEGORY_LABELS: Record<SupplementInfo['category'], string> = {
  nad: 'NAD+ Pathway',
  mitochondrial: 'Mitochondrial',
  senolytic: 'Senolytics',
  adaptogen: 'Adaptogens',
  nootropic: 'Nootropics',
  vitamin: 'Vitamins',
  mineral: 'Minerals',
  antioxidant: 'Antioxidants & Polyphenols',
  amino_acid: 'Amino Acids',
  metabolic: 'Metabolic',
  cardiovascular: 'Cardiovascular',
  prescription_only: 'Prescription / Drug Classes',
};
```

**StyleSheet additions** (add to existing `s = StyleSheet.create({...})` block at line 739+):
```typescript
libSearch: {
  marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
  backgroundColor: Colors.Beige.card, borderRadius: Radius.lg,
  paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  fontSize: Typography.sizes.base, color: Colors.Beige.text,
  borderWidth: 0.5, borderColor: Colors.Beige.border,
},
libCatHeader: {
  flexDirection: 'row', alignItems: 'center',
  paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
},
libCatLabel: {
  flex: 1, fontSize: 11, fontWeight: '600', color: Colors.Beige.textMuted,
  textTransform: 'uppercase', letterSpacing: 1.5,
},
libCatCount: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginRight: Spacing.xs },
libCatChevron: { fontSize: Typography.sizes.sm, color: Colors.Beige.textMuted },
libRow: { marginHorizontal: Spacing.base, marginBottom: 2, backgroundColor: Colors.Beige.card, borderRadius: Radius.md },
libRowMain: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
libRowName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.Beige.text },
libRowDesc: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginTop: 2 },
libDetail: { padding: Spacing.md, paddingTop: 0, borderTopWidth: 0.5, borderTopColor: Colors.Beige.border },
libDetailTxt: { fontSize: Typography.sizes.sm, color: Colors.Beige.text, marginBottom: Spacing.xs, lineHeight: 18 },
libDetailDose: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginBottom: Spacing.sm },
libAddBtn: {
  backgroundColor: Colors.primaryBg, borderRadius: Radius.md, borderWidth: 0.5,
  borderColor: Colors.primaryBorder, paddingVertical: Spacing.sm, alignItems: 'center',
},
libAddBtnAdded: { backgroundColor: Colors.primary },
libAddBtnTxt: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.primary },
libAddBtnTxtAdded: { color: Colors.Beige.bg },
rxBadge: { backgroundColor: Colors.warningBg, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
rxBadgeTxt: { fontSize: 9, fontWeight: '700', color: Colors.warning, textTransform: 'uppercase' },
gradeBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
gradeTxt: { fontSize: 11, fontWeight: '700' },
```

---

### `src/components/SupplementLibrarySection.tsx` (extract if ProtocolScreen component exceeds 200 lines)

**Analog:** `AddCustomSupplementModal` in `ProtocolScreen.tsx` lines 113–324 (extracted sub-component pattern with Props interface)

**Component shell** — if extraction is needed, follow this pattern from `AddCustomSupplementModal`:
```typescript
// Source pattern: ProtocolScreen.tsx lines 107–111 (Props interface + function signature)
interface SupplementLibrarySectionProps {
  addedSupplements: string[];
  onToggle: (name: string) => void;
}

export default function SupplementLibrarySection({ addedSupplements, onToggle }: SupplementLibrarySectionProps) {
  // All library state (libSearch, libExpanded) lives here
  // All library JSX moved here
  // StyleSheet `ls` at bottom of this file
}
```

---

## Shared Patterns

### AsyncStorage dual-read (Promise.all)
**Source:** `src/screens/ProtocolScreen.tsx` lines 337–355
**Apply to:** `InteractionCheckerScreen.tsx` auto-populate useFocusEffect
```typescript
const [profileRaw, protocolRaw] = await Promise.all([
  AsyncStorage.getItem('@vitalspan_user_profile'),
  AsyncStorage.getItem('@vitalspan_protocol'),
]);
if (profileRaw) setProfile(JSON.parse(profileRaw));
if (protocolRaw) {
  const saved: ProtocolState = JSON.parse(protocolRaw);
  // ...
}
```

### useFocusEffect + useCallback pattern
**Source:** `src/screens/ProtocolScreen.tsx` line 358
**Apply to:** `InteractionCheckerScreen.tsx` auto-populate
```typescript
useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));
```

### Haptics on user action
**Source:** `src/screens/ProtocolScreen.tsx` lines 378–380
**Apply to:** Library "Add to protocol" button in ProtocolScreen, any new interactive elements
```typescript
Haptics.selectionAsync().catch(() => null);  // lightweight tap feedback
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);  // success feedback
```

### StyleSheet conventions
**Source:** `src/screens/ProtocolScreen.tsx` lines 739–840 (StyleSheet `s`); `src/screens/InteractionCheckerScreen.tsx` lines 248–307 (StyleSheet `s`)
**Apply to:** All new styles in both screen files and any extracted component
- Named `s` (screens) or `ms` (modals inside screens) or `ls` (library section if extracted)
- All colors: `Colors.Beige.*` (warm background screens like ProtocolScreen) or `Colors.*` (dark bg screens like InteractionCheckerScreen)
- All spacing: `Spacing.*`
- All border radii: `Radius.*`
- All typography sizes: `Typography.sizes.*`
- No hardcoded hex or numeric padding values

### Evidence grade badge colors
**Source:** `src/screens/ProtocolScreen.tsx` AddCustomSupplementModal lines 190–196
**Apply to:** Library section rows, any new supplement display
```typescript
backgroundColor: info.evidenceGrade === 'A' ? Colors.primaryBg : Colors.warningBg
color: info.evidenceGrade === 'A' ? Colors.primary : Colors.warning
// Grade 'C' falls back to warningBg/warning (same as B)
```

### Severity config lookup
**Source:** `src/screens/InteractionCheckerScreen.tsx` lines 20–28
**Apply to:** All new interaction pair display — use existing `sev()` helper and `SEVERITY_CONFIG` unchanged
```typescript
const SEVERITY_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  high: { color: Colors.danger, label: 'High Risk', bg: Colors.dangerBg },
  moderate: { color: Colors.warning, label: 'Moderate', bg: Colors.warningBg },
  low: { color: Colors.primaryLight, label: 'Monitor', bg: Colors.primaryBg },
  beneficial: { color: Colors.primaryLight, label: 'Beneficial ✓', bg: Colors.primaryBg },
};
```

### Medication database lookup (genericName + brandNames)
**Source:** `src/screens/ProtocolScreen.tsx` lines 466–482 (medInteractionMap useMemo)
**Apply to:** `InteractionCheckerScreen.tsx` D-09 resolution — exact same lookup pattern already established:
```typescript
const drugEntry = MEDICATION_DATABASE.find(m =>
  m.genericName.toLowerCase() === medLower ||
  m.brandNames.some(b => b.toLowerCase() === medLower),
);
if (drugEntry) {
  // use drugEntry.category for D-09 CATEGORY_TO_DRUG_CLASS lookup
  // use drugEntry.drugClass for direct class name
}
```

---

## No Analog Found

No files in this phase are truly novel — all new code has close analogs in the existing codebase.

| File | Role | Data Flow | Note |
|------|------|-----------|------|
| `src/components/SupplementLibrarySection.tsx` | component | transform | May not be needed if ProtocolScreen component stays under 200 lines; if extracted, the `AddCustomSupplementModal` in ProtocolScreen is an exact analog |

---

## Critical Implementation Notes for Planner

1. **Existing entry count:** `SUPPLEMENT_DATABASE` has 47 entries (not ~25). Run `grep -c "id:" src/data/supplementTimings.ts` to verify before planning entry counts.

2. **`choline` / `alpha_gpc` decision:** Entry `id: 'choline'` has `name: 'Choline (Alpha-GPC)'`. D-04 lists Alpha-GPC separately. Recommend renaming `id` to `alpha_gpc` — but flag to pharmacist user: any existing ProtocolState records storing the supplement by id `'choline'` would lose the match. Plan must include a note about this migration concern.

3. **SAFE_COMBOS lives in screen, not data:** `SAFE_COMBOS` is hardcoded in `InteractionCheckerScreen.tsx` lines 13–18, not in `biomarkers.ts`. Expansion goes in the screen file.

4. **`drug` field case sensitivity in INTERACTIONS:** The lookup at `InteractionCheckerScreen.tsx` lines 75–77 uses `.toLowerCase()` on both sides, so case doesn't matter for matching. However, use sentence-case (`'Statin'`, `'Warfarin'`, `'Ibuprofen'`) to match existing 30-pair conventions.

5. **200-line component rule:** `ProtocolScreen.tsx` is already 942 lines. The screen-level component function starts at line 328. Measure the component function body only (not the file). If the Library JSX pushes the component function past 200 lines, extract to `SupplementLibrarySection.tsx`.

6. **`Colors.Beige.*` vs `Colors.*`:** `ProtocolScreen` uses `Colors.Beige.*` tokens (warm background). `InteractionCheckerScreen` uses `Colors.*` (dark background). New styles in each file must use the correct token namespace — do not cross-contaminate.

---

## Metadata

**Analog search scope:** `src/data/`, `src/screens/`, `src/components/`
**Files scanned:** 5 source files read directly
**Pattern extraction date:** 2026-06-04
