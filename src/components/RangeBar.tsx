import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme';

interface Props {
  optMin: number;
  optMax: number;
  value: number;
  target: string;
}

export default function RangeBar({ optMin, optMax, value, target }: Props) {
  const [barWidth, setBarWidth] = useState(0);

  const range = optMax - optMin;
  const spread = range * (7 / 6);
  const displayMin = Math.max(0, optMin - spread);
  const displayMax = optMax + spread;
  const displayRange = displayMax - displayMin;

  const isValid = Number.isFinite(value) && value >= 0;
  const pct = isValid
    ? Math.max(0, Math.min(100, ((value - displayMin) / displayRange) * 100))
    : -1;
  const markerLeft = pct >= 0 && barWidth > 0 ? (barWidth * pct) / 100 - 1.5 : -10;

  return (
    <View style={s.wrapper}>
      <Text style={s.label}>Longevity target: {target}</Text>
      <View
        style={s.barOuter}
        onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
      >
        <View style={s.barInner}>
          <View style={s.zoneDanger} />
          <View style={s.zoneSubopt} />
          <View style={s.zoneOpt} />
          <View style={s.zoneSubopt} />
          <View style={s.zoneDanger} />
        </View>
        {pct >= 0 && <View style={[s.marker, { left: markerLeft }]} />}
      </View>
      <View style={s.scaleRow}>
        <Text style={s.scaleTxt}>Low</Text>
        <Text style={s.scaleTxt}>Optimal</Text>
        <Text style={s.scaleTxt}>High</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { marginBottom: Spacing.base },
  label: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  barOuter: { height: 28 },
  barInner: {
    flexDirection: 'row',
    height: 28,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  zoneDanger: { flex: 15, backgroundColor: Colors.dangerBg },
  zoneSubopt: { flex: 20, backgroundColor: Colors.warningBg },
  zoneOpt: { flex: 30, backgroundColor: Colors.primaryBg },
  marker: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: 3,
    backgroundColor: Colors.primaryDark,
    borderRadius: 2,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  scaleTxt: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
});
