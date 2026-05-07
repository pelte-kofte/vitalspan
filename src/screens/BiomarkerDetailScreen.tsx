import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { BIOMARKERS } from '../data/biomarkers';

const CATEGORIES = [
  { key: 'cardio', label: 'Cardiovascular' },
  { key: 'metabolic', label: 'Metabolic' },
  { key: 'inflammation', label: 'Inflammation' },
  { key: 'hormones', label: 'Hormones' },
  { key: 'vitamins', label: 'Vitamins' },
] as const;

export default function BiomarkerDetailScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.heading}>Biomarkers</Text>
        <Text style={s.sub}>Longevity-optimized ranges</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map(cat => {
          const bms = BIOMARKERS.filter(b => b.category === cat.key);
          if (bms.length === 0) return null;
          return (
            <View key={cat.key}>
              <Text style={s.catLabel}>{cat.label}</Text>
              <View style={s.card}>
                {bms.map((bm, i) => {
                  const isOptimal = bm.defaultVal >= bm.optMin && bm.defaultVal <= bm.optMax;
                  return (
                    <View key={bm.id} style={[s.row, i < bms.length - 1 && s.rowBorder]}>
                      <View style={s.nameGroup}>
                        <Text style={s.bmName}>{bm.name}</Text>
                        <Text style={s.bmTarget}>Target: {bm.target}</Text>
                      </View>
                      <View style={s.valGroup}>
                        <Text style={s.bmVal}>{bm.defaultVal}</Text>
                        <Text style={s.bmUnit}>{bm.unit}</Text>
                      </View>
                      <View style={[s.badge, isOptimal ? s.badgeGood : s.badgeWarn]}>
                        <Text style={[s.badgeTxt, isOptimal ? s.badgeTxtGood : s.badgeTxtWarn]}>
                          {isOptimal ? 'Optimal' : 'Review'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.base, paddingTop: Spacing.md },
  heading: { fontSize: Typography.sizes.xxl, fontWeight: '300', color: Colors.textPrimary },
  sub: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 2 },
  scroll: { flex: 1 },
  catLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  nameGroup: { flex: 1 },
  bmName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  bmTarget: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  valGroup: { alignItems: 'flex-end', marginRight: Spacing.sm },
  bmVal: { fontSize: Typography.sizes.lg, fontWeight: '500', color: Colors.textPrimary },
  bmUnit: { fontSize: 10, color: Colors.textMuted },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeGood: { backgroundColor: Colors.primaryBg },
  badgeWarn: { backgroundColor: Colors.warningBg },
  badgeTxt: { fontSize: 10, fontWeight: '600' },
  badgeTxtGood: { color: Colors.primaryDark },
  badgeTxtWarn: { color: '#633806' },
});
