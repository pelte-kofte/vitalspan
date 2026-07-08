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

  // Color is functional (severity), never decorative — carried by the icon only.
  // The card itself is always a flat surface with a hairline border.
  const accentColor = isCritical
    ? Colors.viz.coral
    : isWarning
    ? Colors.viz.amber
    : Colors.viz.teal;

  const IconComponent = isCritical ? WarningIcon : isWarning ? GoalChartIcon : InfoIcon;

  return (
    <Animated.View
      style={[
        s.card,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Tappable content area — triggers navigation action */}
      <TouchableOpacity
        style={s.contentArea}
        onPress={handleNavigate}
        activeOpacity={insight.action.type === 'navigate' ? 0.7 : 1}
      >
        <IconComponent color={accentColor} size={16} />
        <Text style={s.bodyTxt} numberOfLines={2}>{insight.body}</Text>
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
    borderRadius: Radius.card,
    backgroundColor: Colors.dark.cardBg,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
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
  bodyTxt: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontWeight: '400',
    color: Colors.dark.text,
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
