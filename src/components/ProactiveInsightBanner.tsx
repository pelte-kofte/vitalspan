import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { ProactiveInsight, InsightAction } from '../lib/insightEngine';
import { WarningIcon, GoalChartIcon, InfoIcon } from './DesignSystemIcons';

interface ProactiveInsightBannerProps {
  insight: ProactiveInsight;
  onDismiss: (insightId: string) => void;
  onNavigate: (action: InsightAction) => void;
}

export default function ProactiveInsightBanner({
  insight,
  onDismiss,
  onNavigate,
}: ProactiveInsightBannerProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  function handleDismiss() {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -8, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss(insight.id));
  }

  function handleNavigate() {
    if (insight.action.type === 'navigate') {
      onNavigate(insight.action);
    }
  }

  const isCritical = insight.priority === 'critical';
  const isWarning = insight.priority === 'warning';

  const accentColor = isCritical
    ? Colors.viz.coral
    : isWarning
    ? Colors.viz.amber
    : Colors.viz.teal;

  const IconComponent = isCritical ? WarningIcon : isWarning ? GoalChartIcon : InfoIcon;

  const cardBackground = isCritical
    ? Colors.dark.statusCritBg
    : Colors.dark.cardBg;

  const cardBorderWidth = isCritical ? 0 : 0.5;

  return (
    <Animated.View
      style={[
        s.card,
        {
          backgroundColor: cardBackground,
          borderWidth: cardBorderWidth,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Left accent bar — color communicates severity */}
      <View style={[s.accentBar, { backgroundColor: accentColor }]} />

      {/* Tappable content area — triggers navigation action */}
      <TouchableOpacity
        style={s.contentArea}
        onPress={handleNavigate}
        activeOpacity={insight.action.type === 'navigate' ? 0.7 : 1}
      >
        <IconComponent color={accentColor} size={20} />
        <View style={s.textBlock}>
          <Text style={s.titleTxt} numberOfLines={1}>{insight.title}</Text>
          <Text style={s.bodyTxt} numberOfLines={2}>{insight.body}</Text>
        </View>
      </TouchableOpacity>

      {/* Dismiss button — 44×44 tap target per iOS HIG */}
      <TouchableOpacity
        style={s.dismissBtn}
        onPress={handleDismiss}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        accessibilityLabel="Dismiss insight"
        accessibilityRole="button"
      >
        <Text style={s.dismissX}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: Radius.lg,
    borderColor: Colors.dark.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.md,
    paddingRight: 48,
  },
  textBlock: {
    flex: 1,
  },
  titleTxt: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  bodyTxt: {
    fontSize: Typography.sizes.xs,
    fontWeight: '400',
    color: Colors.dark.textMuted,
    lineHeight: 15,
  },
  dismissBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissX: {
    fontSize: 20,
    fontWeight: '300',
    color: Colors.dark.textMuted,
    lineHeight: 24,
  },
});
