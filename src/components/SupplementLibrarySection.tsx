import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { SUPPLEMENT_DATABASE, SupplementInfo } from '../data/supplementTimings';

interface Props { addedSupplements: string[]; onToggle: (name: string) => void; }

const CAT_ORDER: SupplementInfo['category'][] = [
  'nad', 'mitochondrial', 'senolytic', 'adaptogen', 'nootropic',
  'vitamin', 'mineral', 'antioxidant', 'amino_acid', 'metabolic',
  'cardiovascular', 'sleep', 'prescription_only',
];
const CAT_LABELS: Record<SupplementInfo['category'], string> = {
  nad: 'NAD+ Pathway', mitochondrial: 'Mitochondrial', senolytic: 'Senolytics',
  adaptogen: 'Adaptogens', nootropic: 'Nootropics', vitamin: 'Vitamins',
  mineral: 'Minerals', antioxidant: 'Antioxidants & Polyphenols',
  amino_acid: 'Amino Acids', metabolic: 'Metabolic', cardiovascular: 'Cardiovascular',
  prescription_only: 'Prescription / Drug Classes', sleep: 'Sleep',
};

export default function SupplementLibrarySection({ addedSupplements, onToggle }: Props) {
  const [libSearch, setLibSearch] = useState('');
  const [libExpanded, setLibExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!libSearch) return SUPPLEMENT_DATABASE;
    const q = libSearch.toLowerCase();
    return SUPPLEMENT_DATABASE.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q) ||
      (s.mechanismOfAction ?? '').toLowerCase().includes(q));
  }, [libSearch]);

  function toggleKey(key: string) {
    setLibExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  const grouped = useMemo(() => {
    const map = new Map<SupplementInfo['category'], SupplementInfo[]>();
    for (const cat of CAT_ORDER) {
      const items = filtered.filter(s => s.category === cat);
      if (items.length) map.set(cat, items);
    }
    return map;
  }, [filtered]);

  return (
    <View style={s.container}>
      <TextInput
        style={s.search} placeholder="Search supplements..." placeholderTextColor={Colors.Beige.textMuted}
        value={libSearch} onChangeText={setLibSearch} autoCorrect={false} clearButtonMode="while-editing"
      />
      {Array.from(grouped.entries()).map(([cat, items]) => {
        const catOpen = libExpanded.has(cat);
        return (
          <View key={cat}>
            <TouchableOpacity style={s.catHdr} onPress={() => toggleKey(cat)} activeOpacity={0.7}>
              <Text style={s.catLbl}>{CAT_LABELS[cat]}</Text>
              <View style={s.catRight}>
                <Text style={s.catCount}>{items.length}</Text>
                <Text style={s.chev}>{catOpen ? '▾' : '▸'}</Text>
              </View>
            </TouchableOpacity>
            {catOpen && items.map(info => {
              const rowKey = `detail_${info.id}`;
              const rowOpen = libExpanded.has(rowKey);
              const isAdded = addedSupplements.includes(info.name);
              const gradeA = info.evidenceGrade === 'A';
              return (
                <View key={info.id} style={s.row}>
                  <TouchableOpacity style={s.rowHdr} onPress={() => toggleKey(rowKey)} activeOpacity={0.75}>
                    <View style={[s.grade, gradeA ? s.gradeA : s.gradeBC]}>
                      <Text style={[s.gradeTxt, gradeA ? s.gradeATxt : s.gradeBCTxt]}>{info.evidenceGrade}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={s.nameRow}>
                        <Text style={s.name}>{info.name}</Text>
                        {info.rxLabel ? <View style={s.rxBadge}><Text style={s.rxTxt}>{info.rxLabel}</Text></View> : null}
                      </View>
                      <Text style={s.desc} numberOfLines={rowOpen ? undefined : 2}>{info.shortDescription}</Text>
                    </View>
                    <Text style={s.chev}>{rowOpen ? '▾' : '▸'}</Text>
                  </TouchableOpacity>
                  {rowOpen && (
                    <View style={s.detail}>
                      {info.mechanismOfAction ? <Text style={s.dLine}><Text style={s.dKey}>How: </Text>{info.mechanismOfAction}</Text> : null}
                      {info.longevityRelevance ? <Text style={s.dLine}><Text style={s.dKey}>Why: </Text>{info.longevityRelevance}</Text> : null}
                      <Text style={s.dLine}><Text style={s.dKey}>Dose: </Text>{info.defaultDose} · {info.bestTime}</Text>
                      <TouchableOpacity
                        style={[s.addBtn, isAdded ? s.addBtnOn : s.addBtnOff]}
                        onPress={() => { Haptics.selectionAsync().catch(() => null); onToggle(info.name); }}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.addBtnTxt, isAdded && s.addBtnTxtOn]}>
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
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginHorizontal: Spacing.base, marginBottom: Spacing.base },
  search: {
    backgroundColor: Colors.Beige.card, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    fontSize: Typography.sizes.base, color: Colors.Beige.text,
    borderWidth: 1, borderColor: Colors.Beige.border, marginBottom: Spacing.sm,
  },
  catHdr: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.Beige.bgShade, borderRadius: Radius.sm, marginBottom: 2,
  },
  catLbl: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.Beige.textSecondary },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  catCount: {
    fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, backgroundColor: Colors.Beige.border,
    borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden',
  },
  chev: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, width: 12, textAlign: 'center' },
  row: {
    backgroundColor: Colors.Beige.card, borderRadius: Radius.md,
    borderWidth: 0.5, borderColor: Colors.Beige.border, marginBottom: 4, overflow: 'hidden',
  },
  rowHdr: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.sm },
  grade: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  gradeA: { backgroundColor: Colors.primaryBg },
  gradeBC: { backgroundColor: Colors.warningBg },
  gradeTxt: { fontSize: 10, fontWeight: '700' },
  gradeATxt: { color: Colors.primary },
  gradeBCTxt: { color: Colors.warning },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  name: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.Beige.text },
  rxBadge: {
    backgroundColor: Colors.warningBg, borderRadius: Radius.sm,
    paddingHorizontal: 5, paddingVertical: 1, borderWidth: 0.5, borderColor: Colors.warningBorder,
  },
  rxTxt: { fontSize: 9, fontWeight: '700', color: Colors.warning, textTransform: 'uppercase', letterSpacing: 0.5 },
  desc: { fontSize: Typography.sizes.xs, color: Colors.Beige.textMuted, marginTop: 2 },
  detail: {
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
    borderTopWidth: 0.5, borderTopColor: Colors.Beige.borderLight, gap: Spacing.xs,
  },
  dLine: { fontSize: Typography.sizes.sm, color: Colors.Beige.textSecondary, lineHeight: 18 },
  dKey: { fontWeight: '600', color: Colors.Beige.text },
  addBtn: { marginTop: Spacing.sm, borderRadius: Radius.lg, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, alignItems: 'center', borderWidth: 1 },
  addBtnOff: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  addBtnOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  addBtnTxt: { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.primary },
  addBtnTxtOn: { color: Colors.primaryBg },
});
