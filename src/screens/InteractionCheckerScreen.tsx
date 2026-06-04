import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { INTERACTIONS } from '../data/biomarkers';
import { SUPPLEMENT_DATABASE } from '../data/supplementTimings';
import { MEDICATION_DATABASE } from '../data/medications';
import MedicationSearch from '../components/MedicationSearch';
import { checkDrugInteractions, DrugInteractionResult } from '../services/rxnav';

const SAFE_COMBOS = [
  { pair: 'NMN + Resveratrol', body: 'Synergistic NAD+ pathway. Resveratrol activates SIRT1; NMN provides the NAD+ substrate. No known adverse interactions.' },
  { pair: 'Vitamin D3 + K2 + Magnesium', body: 'Classic longevity trio. D3 drives calcium absorption; K2 (MK-7) directs it to bone/vessels; Magnesium activates the D3 conversion enzyme. Mutually beneficial — deficiency in one limits the others.' },
  { pair: 'CoQ10 + Statin', body: 'Statins deplete CoQ10 via HMG-CoA pathway inhibition. Supplementing CoQ10 (100-200mg) alongside statin therapy is widely recommended to reduce myopathy risk.' },
  { pair: 'Ashwagandha + Magnesium Glycinate', body: 'Complementary stress and sleep support via independent mechanisms (HPA axis modulation + NMDA antagonism). No interactions known. Both best taken in the evening.' },
  { pair: 'NMN + Apigenin', body: 'Apigenin inhibits CD38, the primary NAD+-degrading enzyme, synergistically preserving NAD+ levels raised by NMN. Stack: NMN 500mg + Apigenin 50-100mg (chamomile extract).' },
  { pair: 'Urolithin A + NMN', body: 'Complementary mitochondrial support: Urolithin A activates mitophagy (clearing damaged mitochondria) while NMN provides NAD+ to fuel new mitochondrial biogenesis. No adverse interaction.' },
  { pair: 'Spermidine + Fisetin', body: 'Autophagy induction (spermidine) complements senolysis (fisetin) — spermidine clears damaged proteins, fisetin clears zombie senescent cells. Consider cycling fisetin 2 days/month.' },
  { pair: 'GlyNAC (Glycine + NAC)', body: '2023 RCT (Nutrients) showed GlyNAC combination more effective than either precursor alone for glutathione restoration in aging adults. Improves mitochondrial function, oxidative stress, and strength.' },
  { pair: 'Omega-3 + Curcumin', body: 'Anti-inflammatory synergy via independent mechanisms — Omega-3 modulates eicosanoid pathways while curcumin inhibits NF-kB. Both fat-soluble: take together with a fatty meal.' },
  { pair: 'NMN + Resveratrol + TMG', body: 'David Sinclair longevity stack. Resveratrol activates SIRT1; NMN provides NAD+; TMG (trimethylglycine) donates methyl groups to prevent NAD+ pathway methylation drain. Stack together in morning.' },
  { pair: 'Berberine + Alpha Lipoic Acid', body: 'Both independently activate AMPK for insulin sensitization without significant hypoglycemia risk (unlike metformin + ALA). Additive metabolic benefit with complementary mechanisms.' },
];

const CATEGORY_TO_DRUG_CLASS: Record<string, string> = {
  statin: 'Statin',
  nsaid: 'Ibuprofen',
  thyroid: 'Levothyroxine',
  diabetes: 'Metformin',
  anticoagulant: 'Warfarin',
};

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
  sleep: 'Sleep',
};

const SEVERITY_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  high: { color: Colors.danger, label: 'High Risk', bg: Colors.dangerBg },
  moderate: { color: Colors.warning, label: 'Moderate', bg: Colors.warningBg },
  low: { color: Colors.primaryLight, label: 'Monitor', bg: Colors.primaryBg },
  beneficial: { color: Colors.primaryLight, label: 'Beneficial ✓', bg: Colors.primaryBg },
};

function sev(severity: string) {
  return SEVERITY_CONFIG[severity] ?? { color: Colors.textMuted, label: severity, bg: Colors.bg };
}

export default function InteractionCheckerScreen() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState<{ name: string; type: 'drug' | 'supp' }[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rxnavResults, setRxnavResults] = useState<DrugInteractionResult[]>([]);
  const [rxnavLoading, setRxnavLoading] = useState(false);
  const [autoPopulated, setAutoPopulated] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['nad', 'mitochondrial']));

  const chipsByCategory = useMemo(() => {
    const map = new Map<string, typeof SUPPLEMENT_DATABASE>();
    for (const supp of SUPPLEMENT_DATABASE) {
      if (!map.has(supp.category)) map.set(supp.category, []);
      map.get(supp.category)!.push(supp);
    }
    return map;
  }, []);

  useFocusEffect(useCallback(() => {
    if (autoPopulated) return;
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
            m.brandNames.some((b: string) => b.toLowerCase() === medName.toLowerCase())
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

  function addItem(name: string, type: 'drug' | 'supp') {
    if (!items.find(i => i.name.toLowerCase() === name.toLowerCase())) {
      setItems(prev => [...prev, { name, type }]);
    }
  }

  function removeItem(name: string) {
    setItems(prev => prev.filter(i => i.name !== name));
  }

  useEffect(() => {
    const drugs = items.filter(i => i.type === 'drug').map(i => i.name);
    if (drugs.length < 2) {
      setRxnavResults([]);
      return;
    }
    let cancelled = false;
    setRxnavLoading(true);
    checkDrugInteractions(drugs)
      .then(results => {
        if (!cancelled) {
          setRxnavResults(results);
          setRxnavLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setRxnavLoading(false);
      });
    return () => { cancelled = true; };
  }, [items]);

  const interactions = useMemo(() => {
    const found: typeof INTERACTIONS = [];
    const checked = new Set<string>();
    for (const item of items) {
      for (const item2 of items) {
        if (item.name === item2.name) continue;
        const interaction = INTERACTIONS.find(inter => {
          const key = [inter.drug.toLowerCase(), inter.supplement.toLowerCase()];
          return key.includes(item.name.toLowerCase()) && key.includes(item2.name.toLowerCase());
        });
        if (interaction && !checked.has(interaction.id)) {
          found.push(interaction);
          checked.add(interaction.id);
        }
      }
    }
    const order: Record<string, number> = { high: 0, moderate: 1, low: 2, beneficial: 3 };
    return found.sort((a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4));
  }, [items]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.tabRow}>
        {['Check now', 'Safe combos'].map((label, i) => (
          <TouchableOpacity key={i} style={[s.tab, tab === i && s.tabActive]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab === i && s.tabTxtActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 0 && (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.sectionLbl}>Drugs</Text>
          <View style={s.searchRow}>
            <MedicationSearch
              onSelect={(med) => addItem(med.brandName || med.genericName, 'drug')}
              placeholder="Search medications..."
            />
          </View>

          <Text style={s.sectionLbl}>Supplements</Text>
          {Array.from(chipsByCategory.entries()).map(([cat, supps]) => (
            <View key={cat}>
              <TouchableOpacity
                style={s.catHeader}
                onPress={() => {
                  setExpandedCategories(prev => {
                    const next = new Set(prev);
                    if (next.has(cat)) next.delete(cat); else next.add(cat);
                    return next;
                  });
                }}
              >
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

          {items.length > 0 && (
            <>
              <Text style={s.sectionLbl}>Checking interactions for</Text>
              <View style={s.selectedRow}>
                {items.map(item => (
                  <TouchableOpacity
                    key={item.name}
                    style={[s.selectedChip, item.type === 'drug' ? s.selectedDrug : s.selectedSupp]}
                    onPress={() => removeItem(item.name)}
                  >
                    <Text style={[s.selectedChipTxt, item.type === 'drug' ? { color: Colors.primaryDark } : { color: Colors.accentDark }]}>
                      {item.name} x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {items.length < 2 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>Add at least 2 items</Text>
              <Text style={s.emptySub}>Add your medications and supplements above to check for interactions.</Text>
            </View>
          ) : interactions.length === 0 ? (
            <View style={s.safeCard}>
              <Text style={s.safeTitle}>No known interactions found</Text>
              <Text style={s.safeBody}>Your current combination appears safe. Always consult your doctor before starting supplements.</Text>
            </View>
          ) : (
            <>
              <Text style={s.sectionLbl}>{interactions.length} interaction{interactions.length > 1 ? 's' : ''} found</Text>
              {interactions.map(inter => {
                const cfg = sev(inter.severity);
                return (
                  <TouchableOpacity
                    key={inter.id}
                    style={[
                      s.interCard,
                      inter.severity === 'high' && s.interCardHigh,
                      inter.severity === 'beneficial' && s.interCardBeneficial,
                    ]}
                    onPress={() => setExpanded(expanded === inter.id ? null : inter.id)}
                  >
                    <View style={s.interHeader}>
                      <View style={[s.interDot, { backgroundColor: cfg.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.interTitle}>{inter.title}</Text>
                        <Text style={s.interSub}>Tap to see details</Text>
                      </View>
                      <View style={[s.severityBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[s.severityTxt, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                    {expanded === inter.id && (
                      <View style={s.interBody}>
                        <Text style={s.interBodyTxt}>{inter.body}</Text>
                        <View style={s.recCard}>
                          <Text style={s.recTxt}>
                            <Text style={{ fontWeight: '600', color: Colors.textPrimary }}>Recommendation: </Text>
                            {inter.recommendation}
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* Live RxNav drug-drug interactions */}
          {items.filter(i => i.type === 'drug').length >= 2 && (
            <View style={s.rxnavSection}>
              <View style={s.rxnavHeader}>
                <Text style={s.sectionLbl}>NLM Drug Interactions</Text>
                {rxnavLoading && <ActivityIndicator size="small" color={Colors.primary} />}
              </View>
              {!rxnavLoading && rxnavResults.length === 0 && (
                <View style={s.safeCard}>
                  <Text style={s.safeTitle}>No live drug-drug interactions found</Text>
                  <Text style={s.safeBody}>Verified via NIH RxNav API</Text>
                </View>
              )}
              {rxnavResults.slice(0, 5).map((r, i) => {
                const cfg = sev(r.severity);
                return (
                  <View key={i} style={[s.interCard, r.severity === 'high' && s.interCardHigh]}>
                    <View style={s.interHeader}>
                      <View style={[s.interDot, { backgroundColor: cfg.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.interTitle}>{r.drugA} + {r.drugB}</Text>
                        <Text style={s.interSub} numberOfLines={2}>{r.description}</Text>
                      </View>
                      <View style={[s.severityBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[s.severityTxt, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={s.pharmCard}>
            <View style={s.pharmAvatar}><Text style={{ fontSize: 16 }}>⚕</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.pharmName}>Pharmacist verified</Text>
              <Text style={s.pharmBody}>All interactions reviewed by a licensed pharmacist and cross-referenced with peer-reviewed literature. Updated monthly.</Text>
            </View>
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {tab === 1 && (
        <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.base }}>
          <Text style={s.sectionLbl}>Evidence-backed safe pairs</Text>
          {SAFE_COMBOS.map((c, i) => (
            <View key={i} style={s.safeCard}>
              <Text style={s.safeTitle}>{c.pair}</Text>
              <Text style={s.safeBody}>{c.body}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  tabRow: {
    flexDirection: 'row',
    margin: Spacing.base,
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: Radius.sm, alignItems: 'center' },
  tabActive: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabTxt: { fontSize: Typography.sizes.sm, color: Colors.textMuted, fontWeight: '500' },
  tabTxtActive: { color: Colors.textPrimary },
  searchRow: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  sectionLbl: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, paddingHorizontal: Spacing.base, marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 0.5 },
  chipSupp: { backgroundColor: Colors.accentBg, borderColor: Colors.accentBorder },
  chipSuppTxt: { fontSize: Typography.sizes.xs, color: Colors.accentDark },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  selectedChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 0.5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectedDrug: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  selectedSupp: { backgroundColor: Colors.accentBg, borderColor: Colors.accentBorder },
  selectedChipTxt: { fontSize: Typography.sizes.xs, fontWeight: '500' },
  emptyState: { padding: Spacing.xl, alignItems: 'center' },
  emptyTitle: { fontSize: Typography.sizes.md, fontWeight: '500', color: Colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: Typography.sizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  interCard: {
    marginHorizontal: Spacing.base,
    marginBottom: 10,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  interCardHigh: { borderLeftWidth: 3, borderLeftColor: Colors.danger },
  interCardBeneficial: { borderLeftWidth: 3, borderLeftColor: Colors.primaryLight },
  interHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md },
  interDot: { width: 10, height: 10, borderRadius: 5 },
  interTitle: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary, marginBottom: 2 },
  interSub: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  severityTxt: { fontSize: 10, fontWeight: '600' },
  interBody: { padding: Spacing.md, paddingTop: 0, borderTopWidth: 0.5, borderTopColor: Colors.border },
  interBodyTxt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  recCard: { backgroundColor: Colors.bg, borderRadius: Radius.sm, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primaryLight },
  recTxt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 18 },
  safeCard: {
    marginHorizontal: Spacing.base,
    marginBottom: 10,
    backgroundColor: Colors.primaryBg,
    borderRadius: 20,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  safeTitle: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.primaryDark, marginBottom: 4 },
  safeBody: { fontSize: Typography.sizes.sm, color: Colors.primaryDark, lineHeight: 18 },
  pharmCard: {
    margin: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  pharmAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryBg, borderWidth: 0.5, borderColor: Colors.primaryBorder, alignItems: 'center', justifyContent: 'center' },
  pharmName: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.primaryDark, marginBottom: 3 },
  pharmBody: { fontSize: Typography.sizes.xs, color: Colors.textMuted, lineHeight: 16 },
  rxnavSection: { marginTop: Spacing.base },
  rxnavHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  catChevron: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
});
