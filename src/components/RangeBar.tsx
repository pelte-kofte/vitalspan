import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme';
import type { SourceLabRange } from '../types/biomarkerKnowledge';
import { classifyBiomarkerValue, formatSourceLabRange } from '../lib/biomarkerInterpretation';

interface Props {
  sourceLabRange?: SourceLabRange;
  value: number;
  valueUnit?: string;
}

export default function RangeBar({ sourceLabRange, value, valueUnit }: Props) {
  const [barWidth, setBarWidth] = useState(0);
  const status = classifyBiomarkerValue(value, valueUnit, sourceLabRange);
  const lower = sourceLabRange?.lowerBound;
  const upper = sourceLabRange?.upperBound;
  const hasTwoSidedRange = lower !== undefined && upper !== undefined && upper > lower;

  const spread = hasTwoSidedRange ? (upper - lower) * 0.75 : 1;
  const displayMin = hasTwoSidedRange ? Math.max(0, lower - spread) : 0;
  const displayMax = hasTwoSidedRange ? upper + spread : 1;
  const pct = hasTwoSidedRange && Number.isFinite(value)
    ? Math.max(0, Math.min(100, ((value - displayMin) / (displayMax - displayMin)) * 100))
    : -1;
  const markerLeft = pct >= 0 && barWidth > 0 ? (barWidth * pct) / 100 - 1.5 : -10;

  return (
    <View style={s.wrapper}>
      <Text style={s.label}>Reported laboratory range: {formatSourceLabRange(sourceLabRange)}</Text>
      <View style={s.barOuter} onLayout={event => setBarWidth(event.nativeEvent.layout.width)}>
        <View style={s.barInner}>
          {hasTwoSidedRange ? (
            <>
              <View style={s.zoneOutside} />
              <View style={s.zoneReported} />
              <View style={s.zoneOutside} />
            </>
          ) : (
            <View style={s.zoneUnknown} />
          )}
        </View>
        {pct >= 0 && <View style={[s.marker, { left: markerLeft }]} />}
      </View>
      <View style={s.scaleRow}>
        <Text style={s.scaleTxt}>
          {status === 'within_reported_range'
            ? 'Within reported range'
            : status === 'outside_reported_range'
              ? 'Outside reported range'
              : status === 'unable_to_classify'
                ? 'Unable to classify'
                : 'Needs laboratory context'}
        </Text>
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
  zoneOutside: { flex: 25, backgroundColor: Colors.warningBg },
  zoneReported: { flex: 50, backgroundColor: Colors.primaryBg },
  zoneUnknown: { flex: 1, backgroundColor: Colors.border },
  marker: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: 3,
    backgroundColor: Colors.primaryDark,
    borderRadius: 2,
  },
  scaleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xs },
  scaleTxt: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
});
