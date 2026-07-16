import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { Colors, Spacing, Typography } from '../../theme';
import type { StoredEntry } from '../../types/biomarkerEntry';
import Text from './HealthText';

interface Props {
  history: readonly StoredEntry[];
  unit: string;
}

const WIDTH = 320;
const HEIGHT = 132;
const INSET = 16;

export default function BiomarkerTrendPlot({ history, unit }: Props) {
  const points = [...history].sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < 2) return <Text style={s.empty}>At least two collections are required for a detailed chart.</Text>;
  const values = points.map(entry => entry.reportedValue ?? entry.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coordinates = values.map((value, index) => ({
    x: INSET + index * ((WIDTH - INSET * 2) / Math.max(1, values.length - 1)),
    y: INSET + (1 - (value - min) / range) * (HEIGHT - INSET * 2),
  }));
  const pointString = coordinates.map(point => `${point.x},${point.y}`).join(' ');
  const accessibility = `Trend from ${values[0]} to ${values[values.length - 1]} ${unit} across ${values.length} collections`;
  return (
    <View accessible accessibilityLabel={accessibility}>
      <Svg style={s.chart} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Line x1={INSET} y1={HEIGHT - INSET} x2={WIDTH - INSET} y2={HEIGHT - INSET} stroke={Colors.health.rule} strokeWidth={1} />
        <Polyline points={pointString} fill="none" stroke={Colors.health.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {coordinates.map((point, index) => <Circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r={3} fill={Colors.health.surfaceStrong} stroke={Colors.health.accent} strokeWidth={1.5} />)}
      </Svg>
      <View style={s.labels}>
        <Text style={s.label}>{new Date(points[0].date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}</Text>
        <Text style={s.label}>{new Date(points[points.length - 1].date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  chart: { width: '100%', height: HEIGHT },
  labels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.base },
  label: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall },
  empty: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall },
});
