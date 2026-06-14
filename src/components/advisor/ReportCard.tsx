import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SUPPLEMENT_DATABASE, EvidenceGrade } from '../../data/supplementTimings';
import { MEDICATION_DATABASE } from '../../data/medications';
import { Colors, Spacing, Typography, Radius } from '../../theme';

export type ReportItem =
  | { kind: 'finding'; finding: string; priority: 'high' | 'medium' | 'low' }
  | { kind: 'biomarker'; name: string; status: 'Optimal' | 'Suboptimal' | 'Critical'; insight: string }
  | { kind: 'supplement'; name: string; type: 'supplement' | 'medication'; assessment: string }
  | { kind: 'recommendation'; action: string; category: string; timeframe: string };

export interface ReportCardProps {
  title: string;
  items: ReportItem[];
}

function lookupGrade(action: string): EvidenceGrade | null {
  const lower = action.toLowerCase();
  const supp = SUPPLEMENT_DATABASE.find(s => lower.includes(s.name.toLowerCase()));
  if (supp) return supp.evidenceGrade;
  const med = MEDICATION_DATABASE.find(
    m =>
      lower.includes(m.genericName.toLowerCase()) ||
      m.brandNames.some(b => lower.includes(b.toLowerCase())),
  );
  if (med) return 'B';
  return null;
}

const GRADE_COLORS: Record<EvidenceGrade, { bg: string; border: string; text: string }> = {
  A: { bg: Colors.status.optimalBg,  border: Colors.status.optimalBorder,  text: Colors.status.optimalText },
  B: { bg: Colors.status.reviewBg,   border: Colors.status.reviewBorder,   text: Colors.status.reviewText },
  C: { bg: Colors.status.criticalBg, border: Colors.status.criticalBorder, text: Colors.status.criticalText },
};

const PRIORITY_COLORS: Record<'high' | 'medium' | 'low', string> = {
  high:   Colors.viz.coral,
  medium: Colors.viz.amber,
  low:    Colors.primary,
};

const STATUS_COLORS: Record<'Optimal' | 'Suboptimal' | 'Critical', { bg: string; border: string; text: string }> = {
  Optimal:    { bg: Colors.status.optimalBg,  border: Colors.status.optimalBorder,  text: Colors.status.optimalText },
  Suboptimal: { bg: Colors.status.reviewBg,   border: Colors.status.reviewBorder,   text: Colors.status.reviewText },
  Critical:   { bg: Colors.status.criticalBg, border: Colors.status.criticalBorder, text: Colors.status.criticalText },
};

function renderItem(item: ReportItem, index: number): React.ReactElement {
  if (item.kind === 'finding') {
    return (
      <View key={index} style={s.itemRow}>
        <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />
        <Text style={s.itemText}>{item.finding}</Text>
      </View>
    );
  }
  if (item.kind === 'biomarker') {
    const cols = STATUS_COLORS[item.status];
    return (
      <View key={index} style={s.itemBlock}>
        <View style={s.itemRow}>
          <View style={[s.pill, { backgroundColor: cols.bg, borderColor: cols.border }]}>
            <Text style={[s.pillText, { color: cols.text }]}>{item.status}</Text>
          </View>
          <Text style={s.itemText}>{item.name}</Text>
        </View>
        <Text style={s.itemSub}>{item.insight}</Text>
      </View>
    );
  }
  if (item.kind === 'supplement') {
    return (
      <View key={index} style={s.itemBlock}>
        <View style={s.itemRow}>
          <Text style={s.itemText}>{item.name}</Text>
          <Text style={s.typeTag}>{item.type.toUpperCase()}</Text>
        </View>
        <Text style={s.itemSub}>{item.assessment}</Text>
      </View>
    );
  }
  // recommendation
  const grade = lookupGrade(item.action);
  const gradeCols = grade ? GRADE_COLORS[grade] : null;
  return (
    <View key={index} style={s.itemBlock}>
      <View style={s.itemRow}>
        <Text style={[s.itemText, s.flex1]}>{item.action}</Text>
        {gradeCols && grade && (
          <View style={[s.gradeBadge, { backgroundColor: gradeCols.bg, borderColor: gradeCols.border }]}>
            <Text style={[s.gradeText, { color: gradeCols.text }]}>{grade}</Text>
          </View>
        )}
      </View>
      <Text style={s.itemSub}>{item.timeframe}</Text>
    </View>
  );
}

export default function ReportCard({ title, items }: ReportCardProps) {
  return (
    <View style={s.card}>
      <Text style={s.sectionTitle}>{title}</Text>
      {items.map((item, i) => renderItem(item, i))}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.cardBg,
    borderColor: Colors.dark.cardBorder,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: Typography.letterSpacing.widest,
    color: Colors.dark.textMuted,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemBlock: {
    marginBottom: Spacing.sm,
  },
  itemText: {
    fontSize: Typography.sizes.base,
    color: Colors.dark.text,
    flexShrink: 1,
  },
  itemSub: {
    fontSize: Typography.sizes.sm,
    color: Colors.dark.textMuted,
    marginTop: Spacing.xs,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  pillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  typeTag: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    fontWeight: '600',
  },
  gradeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  gradeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  flex1: {
    flex: 1,
  },
});
