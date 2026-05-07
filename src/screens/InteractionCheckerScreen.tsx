import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { INTERACTIONS } from '../data/biomarkers';
import MedicationSearch from '../components/MedicationSearch';

const SUPPLEMENTS = ['NMN', 'Omega-3', 'Berberine', 'Resveratrol', 'CoQ10', 'Vitamin K2', 'Magnesium', 'Vitamin D'];

const SAFE_COMBOS = [
  { pair: 'NMN + Resveratrol', body: 'Synergistic NAD+ pathway. No known adverse interactions.' },
  { pair: 'Vitamin D3 + K2 + Magnesium', body: 'Classic longevity trio. Mutually beneficial.' },
  { pair: 'CoQ10 + Statin', body: 'Statins deplete CoQ10 — supplementing is widely recommended.' },
  { pair: 'Ashwagandha + Magnesium', body: 'Complementary stress & sleep support. No interactions known.' },
];

export default function InteractionCheckerScreen() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState<{ name: string; type: 'drug' | 'supp' }[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  function addItem(name: string, type: 'drug' | 'supp') {
    if (!items.find(i => i.name.toLowerCase() === name.toLowerCase())) {
      setItems(prev => [...prev, { name, type }]);
    }
  }

  function removeItem(name: string) {
    setItems(prev => prev.filter(i => i.name !== name));
  }

  function getInteractions() {
    const found: typeof INTERACTIONS = [];
    const checked = new Set<string>();
    for (const item of items) {
      for (const item2 of items) {
        if (item.name === item2.name) continue;
        const interaction = INTERACTIONS.find(inter => {
          const key = [inter.drug.toLowerCase(), inter.supplement.toLowerCase()];
          return (
            key.includes(item.name.toLowerCase()) &&
            key.includes(item2.name.toLowerCase())
          );
        });
        if (interaction && !checked.has(interaction.id)) {
          found.push(interaction);
          checked.add(interaction.id);
        }
      }
    }
    return found.sort((a, b) => {
      const order = { high: 0, moderate: 1, low: 2, beneficial: 3 };
      return order[a.severity] - order[b.severity];
    });
  }

  const interactions = getInteractions();

  const sevColor = (sev: string) => ({
    high: Colors.danger,
    moderate: Colors.warning,
    low: Colors.primaryLight,
    beneficial: Colors.primaryLight,
  }[sev] || Colors.textMuted);

  const sevLabel = (sev: string) => ({
    high: 'High Risk',
    moderate: 'Moderate',
    low: 'Monitor',
    beneficial: 'Beneficial ✓',
  }[sev] || sev);

  const sevBg = (sev: string) => ({
    high: Colors.dangerBg,
    moderate: Colors.warningBg,
    low: Colors.primaryBg,
    beneficial: Colors.primaryBg,
  }[sev] || Colors.bg);

  return (
    <SafeAreaView style={s.safe}>
      {/* Tab bar */}
      <View style={s.tabRow}>
        {['Check now', 'Safe combos'].map((label, i) => (
          <TouchableOpacity key={i} style={[s.tab, tab === i && s.tabActive]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab === i && s.tabTxtActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 0 && (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Drug search */}
          <Text style={s.sectionLbl}>Drugs</Text>
          <View style={s.searchRow}>
            <MedicationSearch
              onSelect={(med) => addItem(med.brandName || med.genericName, 'drug')}
              placeholder="Search medications..."
            />
          </View>

          <Text style={s.sectionLbl}>Supplements</Text>
          <View style={s.chipRow}>
            {SUPPLEMENTS.map(d => (
              <TouchableOpacity key={d} style={[s.chip, s.chipSupp]} onPress={() => addItem(d, 'supp')}>
                <Text style={s.chipSuppTxt}>+ {d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected items */}
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
                      {item.name} ×
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Results */}
          {items.length < 2 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>Add at least 2 items</Text>
              <Text style={s.emptySub}>Add your medications and supplements above to check for interactions.</Text>
            </View>
          ) : interactions.length === 0 ? (
            <View style={s.safeCard}>
              <Text style={s.safeTitle}>✓ No known interactions found</Text>
              <Text style={s.safeBody}>Your current combination appears safe. Always consult your doctor before starting supplements.</Text>
            </View>
          ) : (
            <>
              <Text style={s.sectionLbl}>{interactions.length} interaction{interactions.length > 1 ? 's' : ''} found</Text>
              {interactions.map(inter => (
                <TouchableOpacity
                  key={inter.id}
                  style={s.interCard}
                  onPress={() => setExpanded(expanded === inter.id ? null : inter.id)}
                >
                  <View style={s.interHeader}>
                    <View style={[s.interDot, { backgroundColor: sevColor(inter.severity) }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.interTitle}>{inter.title}</Text>
                      <Text style={s.interSub}>Tap to see details</Text>
                    </View>
                    <View style={[s.severityBadge, { backgroundColor: sevBg(inter.severity) }]}>
                      <Text style={[s.severityTxt, { color: sevColor(inter.severity) }]}>
                        {sevLabel(inter.severity)}
                      </Text>
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
              ))}
            </>
          )}

          {/* Pharmacist note */}
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
              <Text style={s.safeTitle}>✓ {c.pair}</Text>
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
  tabRow: { flexDirection: 'row', margin: Spacing.base, backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, padding: 3, gap: 3 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: Radius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.bgCard, borderWidth: 0.5, borderColor: Colors.border },
  tabTxt: { fontSize: Typography.sizes.sm, color: Colors.textMuted, fontWeight: '500' },
  tabTxtActive: { color: Colors.textPrimary },
  searchRow: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  sectionLbl: { fontSize: Typography.sizes.xs, fontWeight: '500', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.7, paddingHorizontal: Spacing.base, marginBottom: 8, marginTop: 4 },
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
  interCard: { marginHorizontal: Spacing.base, marginBottom: 10, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden' },
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
  safeCard: { marginHorizontal: Spacing.base, marginBottom: 10, backgroundColor: Colors.primaryBg, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 0.5, borderColor: Colors.primaryBorder },
  safeTitle: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.primaryDark, marginBottom: 4 },
  safeBody: { fontSize: Typography.sizes.sm, color: Colors.primaryDark, lineHeight: 18 },
  pharmCard: { margin: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 0.5, borderColor: Colors.border, flexDirection: 'row', gap: 10 },
  pharmAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryBg, borderWidth: 0.5, borderColor: Colors.primaryBorder, alignItems: 'center', justifyContent: 'center' },
  pharmName: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.primaryDark, marginBottom: 3 },
  pharmBody: { fontSize: Typography.sizes.xs, color: Colors.textMuted, lineHeight: 16 },
});
