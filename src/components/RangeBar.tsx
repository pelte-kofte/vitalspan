import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme';
import type { SourceLabRange } from '../types/biomarkerKnowledge';
import { classifyBiomarkerValue, formatSourceLabRange } from '../lib/biomarkerInterpretation';

interface Props {
  sourceLabRange?: SourceLabRange;
  value?: number;
  valueUnit?: string;
}

export default function RangeBar({ sourceLabRange, value, valueUnit }: Props) {
  const [barWidth, setBarWidth] = useState(0);
  const hasValue = value !== undefined && Number.isFinite(value);
  const status = hasValue ? classifyBiomarkerValue(value, valueUnit, sourceLabRange) : null;
  const lower = sourceLabRange?.lowerBound;
  const upper = sourceLabRange?.upperBound;
  const hasTwoSidedRange = lower !== undefined && upper !== undefined && upper > lower;

  const spread = hasTwoSidedRange ? (upper - lower) * 0.75 : 1;
  const displayMin = hasTwoSidedRange ? Math.max(0, lower - spread) : 0;
  const displayMax = hasTwoSidedRange ? upper + spread : 1;
  const pct = hasTwoSidedRange && hasValue
    ? Math.max(0, Math.min(100, ((value - displayMin) / (displayMax - displayMin)) * 100))
    : -1;
  const markerLeft = pct >= 0 && barWidth > 0 ? (barWidth * pct) / 100 - 1.5 : -10;

  return (
    <View
      style={s.wrapper}
      accessible
      accessibilityLabel={`Source laboratory interval ${formatSourceLabRange(sourceLabRange)}. ${status === null ? 'Enter a biomarker value to see your interpretation.' : status === 'within_reported_range' ? 'Within laboratory range.' : status === 'outside_reported_range' ? 'Outside laboratory range.' : 'Source-laboratory classification unavailable.'}`}
    >
      <Text style={s.label}>SOURCE LABORATORY INTERVAL</Text>
      <Text style={s.rangeValue}>{formatSourceLabRange(sourceLabRange)}</Text>
      <View style={s.barOuter} onLayout={event => setBarWidth(event.nativeEvent.layout.width)} accessible={false}>
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
      {hasTwoSidedRange && (
        <View style={s.boundRow}>
          <Text style={s.boundText}>LOW {lower}</Text>
          <Text style={s.boundText}>HIGH {upper}</Text>
        </View>
      )}
      <View style={s.scaleRow}>
        <Text style={s.scaleTxt}>
          {status === null
            ? 'Enter a biomarker value to see your interpretation'
            : status === 'within_reported_range'
            ? 'Within reported range'
            : status === 'outside_reported_range'
              ? 'Outside reported range'
              : status === 'unable_to_classify'
                ? 'Source-laboratory classification unavailable'
                : 'Source-laboratory classification unavailable'}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { marginTop: Spacing.md },
  label: {
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    color: Colors.health.inkTertiary,
    fontWeight: Typography.weights.label,
    letterSpacing: Typography.letterSpacing.wider,
  },
  rangeValue: { color: Colors.health.ink, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs, marginBottom: Spacing.sm },
  barOuter: { height: 32 },
  barInner: {
    flexDirection: 'row',
    height: 32,
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.health.ruleStrong,
  },
  zoneOutside: { flex: 25, backgroundColor: Colors.health.neutralSoft },
  zoneReported: { flex: 50, backgroundColor: Colors.health.accentSoft },
  zoneUnknown: { flex: 1, backgroundColor: Colors.health.neutralSoft },
  marker: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 4,
    backgroundColor: Colors.health.ink,
    borderWidth: 1,
    borderColor: Colors.health.surfaceStrong,
    borderRadius: 2,
  },
  boundRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs, paddingHorizontal: '25%' },
  boundText: { fontSize: Typography.sizes.captionSmall, color: Colors.health.inkTertiary, fontWeight: Typography.weights.label },
  scaleRow: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: Spacing.sm },
  scaleTxt: { fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, color: Colors.health.inkSecondary },
});
