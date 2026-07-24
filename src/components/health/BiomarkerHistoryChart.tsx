import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated as NativeAnimated,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';
import Reanimated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {
  compatibleChartClassificationBands,
  compatibleChartReferenceBand,
  type ChartClassificationBand,
  type ChartReferenceInterval,
} from '../../lib/biomarkerChartPresentation';
import { Colors, Motion, Radius, Spacing, Typography } from '../../theme';
import type { StoredEntry } from '../../types/biomarkerEntry';
import Text from './HealthText';

interface Props {
  history: readonly StoredEntry[];
  canonicalUnit: string;
  referenceInterval?: ChartReferenceInterval;
  classificationBands?: readonly ChartClassificationBand[];
  selectedBandId?: string;
}

interface Coordinate {
  readonly x: number;
  readonly y: number;
}

interface AnimatedChartPointProps {
  coordinate: Coordinate;
  selected: boolean;
  reduceMotion: boolean;
}

const WIDTH = 320;
const HEIGHT = 176;
const HORIZONTAL_INSET = 20;
const VERTICAL_INSET = 22;
const TARGET_SIZE = 44;
const TOOLTIP_WIDTH = 124;
const AnimatedCircle = Reanimated.createAnimatedComponent(Circle);
const AnimatedPolyline = Reanimated.createAnimatedComponent(Polyline);
const AnimatedRect = Reanimated.createAnimatedComponent(Rect);

function entryDisplayValue(entry: StoredEntry): number {
  return entry.reportedValue ?? entry.value;
}

function entryDisplayUnit(entry: StoredEntry, canonicalUnit: string): string {
  return entry.reportedUnit ?? entry.unit ?? canonicalUnit;
}

function formatChartDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function lineLength(coordinates: readonly Coordinate[]): number {
  return coordinates.slice(1).reduce((total, coordinate, index) => {
    const previous = coordinates[index];
    return total + Math.hypot(
      coordinate.x - previous.x,
      coordinate.y - previous.y,
    );
  }, 0);
}

function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

function AnimatedChartPoint({
  coordinate,
  selected,
  reduceMotion,
}: AnimatedChartPointProps) {
  const selection = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selection.value = reduceMotion
      ? (selected ? 1 : 0)
      : withTiming(selected ? 1 : 0, { duration: Motion.fast });
  }, [reduceMotion, selected, selection]);

  const animatedProps = useAnimatedProps(() => ({
    r: 4 + selection.value * 2,
    strokeWidth: 2 + selection.value,
  }));

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      cx={coordinate.x}
      cy={coordinate.y}
      fill={Colors.health.surfaceStrong}
      stroke={Colors.health.accent}
    />
  );
}

function PopulatedHistoryChart({
  points,
  canonicalUnit,
  referenceInterval,
  classificationBands,
  selectedBandId,
}: {
  points: readonly StoredEntry[];
  canonicalUnit: string;
  referenceInterval?: ChartReferenceInterval;
  classificationBands?: readonly ChartClassificationBand[];
  selectedBandId?: string;
}) {
  const [selectedId, setSelectedId] = useState(
    points[points.length - 1].id,
  );
  const [chartWidth, setChartWidth] = useState(0);
  const reduceMotion = useReduceMotion();
  const reveal = useRef(new NativeAnimated.Value(0)).current;
  const tooltipX = useRef(new NativeAnimated.Value(0)).current;
  const tooltipY = useRef(new NativeAnimated.Value(0)).current;
  const tooltipOpacity = useRef(new NativeAnimated.Value(0)).current;
  const drawProgress = useSharedValue(0);
  const bandProgress = useSharedValue(0);
  const hasRevealed = useRef(false);
  const hasDrawnLine = useRef(false);

  const values = points.map(entry => entry.value);
  const referenceBand = compatibleChartReferenceBand(
    referenceInterval,
    canonicalUnit,
  );
  const categoryBands = compatibleChartClassificationBands(
    classificationBands,
    canonicalUnit,
  );
  const displayedBands: readonly ChartClassificationBand[] =
    categoryBands.length > 0
      ? categoryBands
      : referenceBand
        ? [{
            id: 'reference-interval',
            label: 'Reference interval',
            unit: canonicalUnit,
            ...referenceBand,
          }]
        : [];
  const domainValues = [
    ...values,
    ...displayedBands.flatMap(band => [
      ...(band.lowerBound === undefined ? [] : [band.lowerBound]),
      ...(band.upperBound === undefined ? [] : [band.upperBound]),
    ]),
  ];
  const min = Math.min(...domainValues);
  const max = Math.max(...domainValues);
  const range = max - min || 1;
  const yForValue = (value: number): number =>
    VERTICAL_INSET
    + (1 - (value - min) / range) * (HEIGHT - VERTICAL_INSET * 2);
  const coordinates = values.map((value, index) => ({
    x: HORIZONTAL_INSET
      + index * ((WIDTH - HORIZONTAL_INSET * 2) / Math.max(1, values.length - 1)),
    y: yForValue(value),
  }));
  const pointString = coordinates.map(point => `${point.x},${point.y}`).join(' ');
  const pathLength = Math.max(1, lineLength(coordinates));
  const selectedIndex = Math.max(
    0,
    points.findIndex(point => point.id === selectedId),
  );
  const selected = points[selectedIndex] ?? points[points.length - 1];
  const selectedCoordinate = coordinates[selectedIndex] ?? coordinates[coordinates.length - 1];
  const renderedBands = displayedBands.map(band => {
    const upper = band.upperBound ?? max;
    const lower = band.lowerBound ?? min;
    return {
      ...band,
      top: yForValue(upper),
      bottom: yForValue(lower),
    };
  });
  const showBands = renderedBands.length > 0;
  const accessibility = `${values.length} historical ${values.length === 1 ? 'measurement' : 'measurements'} in ${canonicalUnit}.${showBands ? ` ${renderedBands.length} labeled classification ${renderedBands.length === 1 ? 'band is' : 'bands are'} shown in the chart and listed below.` : ''} Select a point for its recorded value and date.`;

  useEffect(() => {
    if (hasRevealed.current) return;
    hasRevealed.current = true;
    NativeAnimated.timing(reveal, {
      toValue: 1,
      duration: reduceMotion ? 140 : Motion.medium,
      useNativeDriver: true,
    }).start();
  }, [reduceMotion, reveal]);

  useEffect(() => {
    if (hasDrawnLine.current) return;
    hasDrawnLine.current = true;
    if (reduceMotion || points.length < 2) {
      drawProgress.value = 1;
      bandProgress.value = showBands
        ? withTiming(1, { duration: 140 })
        : 0;
      return;
    }
    drawProgress.value = 0;
    bandProgress.value = 0;
    drawProgress.value = withTiming(1, { duration: 260 });
    if (showBands) {
      bandProgress.value = withDelay(220, withTiming(1, { duration: 140 }));
    }
  }, [
    bandProgress,
    drawProgress,
    points.length,
    reduceMotion,
    showBands,
  ]);

  const lineAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - drawProgress.value),
  }));
  const bandAnimatedProps = useAnimatedProps(() => ({
    opacity: bandProgress.value * 0.7,
  }));

  useEffect(() => {
    if (chartWidth <= 0 || !selectedCoordinate) return;
    const rawX = (selectedCoordinate.x / WIDTH) * chartWidth - TOOLTIP_WIDTH / 2;
    const nextX = Math.max(4, Math.min(
      chartWidth - TOOLTIP_WIDTH - 4,
      rawX,
    ));
    const nextY = selectedCoordinate.y < 68
      ? selectedCoordinate.y + 14
      : selectedCoordinate.y - 54;
    if (reduceMotion) {
      NativeAnimated.timing(tooltipOpacity, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }).start(() => {
        tooltipX.setValue(nextX);
        tooltipY.setValue(nextY);
        NativeAnimated.timing(tooltipOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start();
      });
      return;
    }
    NativeAnimated.timing(tooltipOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
    NativeAnimated.parallel([
      NativeAnimated.spring(tooltipX, {
        toValue: nextX,
        damping: 20,
        stiffness: 240,
        mass: 0.7,
        useNativeDriver: true,
      }),
      NativeAnimated.spring(tooltipY, {
        toValue: nextY,
        damping: 20,
        stiffness: 240,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    chartWidth,
    reduceMotion,
    selectedCoordinate,
    tooltipOpacity,
    tooltipX,
    tooltipY,
  ]);

  function selectPoint(entry: StoredEntry): void {
    if (entry.id === selectedId) return;
    if (!reduceMotion) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setSelectedId(entry.id);
    void Haptics.selectionAsync().catch(() => undefined);
  }

  return (
    <View>
      <NativeAnimated.View
        style={[
          s.chartFrame,
          {
            opacity: reveal,
            transform: [{
              translateY: reveal.interpolate({
                inputRange: [0, 1],
                outputRange: [reduceMotion ? 0 : Spacing.sm, 0],
              }),
            }],
          },
        ]}
        onLayout={event => setChartWidth(event.nativeEvent.layout.width)}
        accessible
        accessibilityLabel={accessibility}
      >
        <Svg style={s.chart} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} accessible={false}>
          {renderedBands.map((band, index) => (
            <AnimatedRect
              key={band.id}
              animatedProps={bandAnimatedProps}
              x={HORIZONTAL_INSET}
              y={band.top}
              width={WIDTH - HORIZONTAL_INSET * 2}
              height={Math.max(1, band.bottom - band.top)}
              fill={index % 2 === 0
                ? Colors.health.neutralSoft
                : Colors.health.accentSoft}
            />
          ))}
          <Line
            x1={HORIZONTAL_INSET}
            y1={HEIGHT - VERTICAL_INSET}
            x2={WIDTH - HORIZONTAL_INSET}
            y2={HEIGHT - VERTICAL_INSET}
            stroke={Colors.health.rule}
            strokeWidth={1}
          />
          {points.length > 1 ? (
            <AnimatedPolyline
              animatedProps={lineAnimatedProps}
              points={pointString}
              fill="none"
              stroke={Colors.health.accent}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${pathLength} ${pathLength}`}
            />
          ) : null}
          {coordinates.map((coordinate, index) => (
            <AnimatedChartPoint
              key={points[index].id}
              coordinate={coordinate}
              selected={points[index].id === selected.id}
              reduceMotion={reduceMotion}
            />
          ))}
        </Svg>
        {coordinates.map((coordinate, index) => {
          const entry = points[index];
          const pointValue = entryDisplayValue(entry);
          const pointUnit = entryDisplayUnit(entry, canonicalUnit);
          return (
            <Pressable
              key={entry.id}
              onPress={() => selectPoint(entry)}
              accessibilityRole="button"
              accessibilityState={{ selected: entry.id === selected.id }}
              accessibilityLabel={`${pointValue} ${pointUnit}, measured ${formatChartDate(entry.date)}`}
              hitSlop={4}
              style={[
                s.pointTarget,
                {
                  left: `${(coordinate.x / WIDTH) * 100}%`,
                  top: coordinate.y - TARGET_SIZE / 2,
                },
              ]}
            />
          );
        })}
        <NativeAnimated.View
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={[
            s.tooltip,
            {
              opacity: tooltipOpacity,
              transform: [
                { translateX: tooltipX },
                { translateY: tooltipY },
              ],
            },
          ]}
        >
          <Text style={s.tooltipValue}>
            {entryDisplayValue(selected)} {entryDisplayUnit(selected, canonicalUnit)}
          </Text>
          <Text style={s.tooltipDate}>{formatChartDate(selected.date)}</Text>
        </NativeAnimated.View>
      </NativeAnimated.View>
      <View style={s.labels}>
        <Text style={s.label}>{formatChartDate(points[0].date)}</Text>
        {points.length > 1 ? (
          <Text style={[s.label, s.lastLabel]}>
            {formatChartDate(points[points.length - 1].date)}
          </Text>
        ) : null}
      </View>
      <View
        style={s.selection}
        accessible
        accessibilityLabel={`Selected measurement ${entryDisplayValue(selected)} ${entryDisplayUnit(selected, canonicalUnit)}, ${formatChartDate(selected.date)}`}
      >
        <Text style={s.selectionValue}>
          {entryDisplayValue(selected)} {entryDisplayUnit(selected, canonicalUnit)}
        </Text>
        <Text style={s.selectionDate}>{formatChartDate(selected.date)}</Text>
      </View>
      {renderedBands.length > 0 ? (
        <View
          style={s.bandLegend}
          accessibilityRole="summary"
          accessibilityLabel={`Chart classifications: ${renderedBands
            .map(band => `${band.label}${band.id === selectedBandId ? ', current result' : ''}`)
            .join('; ')}`}
        >
          {renderedBands.map(band => (
            <View key={band.id} style={s.bandLegendRow}>
              <View
                style={[
                  s.bandLegendSwatch,
                  band.id === selectedBandId && s.bandLegendSwatchSelected,
                ]}
                accessible={false}
              />
              <Text
                style={[
                  s.bandLegendLabel,
                  band.id === selectedBandId && s.bandLegendLabelSelected,
                ]}
              >
                {band.label}
                {band.id === selectedBandId ? ' · Current result' : ''}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {points.length === 1 ? (
        <Text style={s.singlePoint}>
          Add another result to build your measurement history.
        </Text>
      ) : null}
    </View>
  );
}

export default function BiomarkerHistoryChart({
  history,
  canonicalUnit,
  referenceInterval,
  classificationBands,
  selectedBandId,
}: Props) {
  const points = useMemo(
    () => [...history].sort((a, b) => a.date.localeCompare(b.date)),
    [history],
  );

  if (points.length === 0) {
    return <Text style={s.empty}>Your measurement history will appear here.</Text>;
  }

  return (
    <PopulatedHistoryChart
      points={points}
      canonicalUnit={canonicalUnit}
      referenceInterval={referenceInterval}
      classificationBands={classificationBands}
      selectedBandId={selectedBandId}
    />
  );
}

const s = StyleSheet.create({
  chartFrame: {
    height: HEIGHT,
    overflow: 'hidden',
    borderRadius: Radius.card,
    backgroundColor: Colors.health.surface,
  },
  chart: { width: '100%', height: HEIGHT },
  pointTarget: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    marginLeft: -TARGET_SIZE / 2,
    borderRadius: Radius.full,
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: TOOLTIP_WIDTH,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.health.rule,
    backgroundColor: Colors.health.surfaceStrong,
  },
  tooltipValue: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  tooltipDate: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  label: {
    flexShrink: 1,
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall,
    marginTop: Spacing.sm,
  },
  lastLabel: { textAlign: 'right' },
  selection: {
    marginTop: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.health.accentSoft,
    borderRadius: Radius.card,
  },
  selectionValue: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.h3,
    lineHeight: Typography.lineHeights.h3,
    fontWeight: Typography.weights.label,
  },
  selectionDate: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.xs,
  },
  bandLegend: {
    marginTop: Spacing.base,
    gap: Spacing.sm,
  },
  bandLegendRow: {
    minHeight: TARGET_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bandLegendSwatch: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.health.ruleStrong,
  },
  bandLegendSwatchSelected: {
    backgroundColor: Colors.health.accent,
  },
  bandLegendLabel: {
    flex: 1,
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
  },
  bandLegendLabelSelected: {
    color: Colors.health.ink,
    fontWeight: Typography.weights.label,
  },
  singlePoint: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    marginTop: Spacing.md,
  },
  empty: {
    color: Colors.health.inkTertiary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
  },
});
