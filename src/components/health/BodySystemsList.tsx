import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { sortBodySystems, type BodySystemModel, type BodySystemId } from '../../lib/healthExperience';
import { Colors, Radius, Spacing, Typography } from '../../theme';
import BodySystemIcon from './BodySystemIcon';
import TrendSignal from './TrendSignal';
import Text from './HealthText';

interface Props {
  systems: readonly BodySystemModel[];
  onOpen: (systemId: BodySystemId) => void;
}

function Chevron() {
  return (
    <Svg width={Spacing.base} height={Spacing.base} viewBox="0 0 16 16" accessible={false}>
      <Path d="M6 3 L11 8 L6 13" fill="none" stroke={Colors.health.inkTertiary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SystemRow({ system, onOpen, last }: { system: BodySystemModel; onOpen: (id: BodySystemId) => void; last: boolean }) {
  const hasData = system.currentEntries.length > 0;
  const hint = hasData ? system.driver : system.nextAction;
  const accessibilityLabel = [
    system.name,
    system.state,
    hint,
    ...(hasData ? [`Trend ${system.trend.replace(/_/g, ' ')}`, `Confidence ${system.confidence}`] : []),
  ].join('. ');
  return (
    <Pressable
      onPress={() => onOpen(system.id)}
      style={({ pressed }) => [s.row, !last && s.rowRule, pressed && s.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens system summary, biomarkers, evidence, and actions"
    >
      <View style={s.iconFrame}>
        <BodySystemIcon system={system.id} color={Colors.health.ink} size={Spacing.xxl} />
      </View>
      <View style={s.content}>
        <View style={s.titleRow}>
          <Text style={s.title}>{system.name}</Text>
          <Chevron />
        </View>
        <Text style={[s.state, !hasData && s.stateNeutral, system.state === 'Needs attention' && s.stateAttention]}>{system.state}</Text>
        {hint && <Text style={[s.driver, !hasData && s.emptyHint]} numberOfLines={1}>{hint}</Text>}
        {hasData && (
          <View style={s.metaRow}>
            <TrendSignal trend={system.trend} compact />
            {system.nextAction && <Text style={s.action}>{system.nextAction}</Text>}
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function BodySystemsList({ systems, onOpen }: Props) {
  const ordered = sortBodySystems(systems);
  return (
    <View style={s.list}>
      {ordered.map((system, index) => (
        <SystemRow key={system.id} system={system} onOpen={onOpen} last={index === ordered.length - 1} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  list: { backgroundColor: Colors.health.surface, borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.health.rule, overflow: 'hidden' },
  row: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.base, minHeight: Spacing.xxl * 3 },
  rowRule: { borderBottomWidth: 1, borderBottomColor: Colors.health.rule },
  pressed: { backgroundColor: Colors.health.accentSoft },
  iconFrame: { width: Spacing.xxl + Spacing.base, height: Spacing.xxl + Spacing.base, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.health.ruleStrong, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  title: { color: Colors.health.ink, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: Typography.weights.headline, flex: 1 },
  state: { color: Colors.health.accent, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, fontWeight: Typography.weights.label, marginTop: Spacing.xs },
  stateNeutral: { color: Colors.health.neutralInk },
  stateAttention: { color: Colors.health.attention },
  driver: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
  emptyHint: { color: Colors.health.inkTertiary },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  action: { color: Colors.health.accent, fontSize: Typography.sizes.captionSmall, fontWeight: Typography.weights.label },
});
