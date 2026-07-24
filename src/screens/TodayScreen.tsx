import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import {
  DailyHealthBrief,
  KeyInsight,
  SafetyNotice,
  TodayHeader,
  TodayLoadingState,
  TodayProgress,
  TodayQuickActions,
  TopPriorities,
} from '../components/todayV2';
import { useTodaySnapshot } from '../hooks/useTodaySnapshot';
import { presentToday } from '../lib/todayPresenter';
import {
  refreshTodayPresentation,
  type TodayPresentationFrame,
} from '../lib/todayRefresh';
import { adaptTodaySafety } from '../lib/todaySafetyAdapter';
import { Colors, ProductLayout, Radius, Spacing, Typography } from '../theme';
import type { TodayAction, TodayPriority } from '../types/today';

export interface TodayScreenProps {
  readonly safetyAlert?: Parameters<typeof adaptTodaySafety>[0];
  readonly onAction: (
    action: TodayAction,
  ) => TodayActionOutcome | Promise<TodayActionOutcome>;
  readonly onExplainPriority: (priority: TodayPriority) => void;
  readonly onRefresh?: () => Promise<void>;
  readonly accountNotice?: React.ReactNode;
}

export type TodayActionOutcome = 'handled' | 'refresh';

function TodayUnavailableState({
  onRetry,
}: {
  readonly onRetry: () => void;
}) {
  return (
    <View
      style={styles.unavailable}
      accessibilityLabel="Today's briefing is temporarily unavailable"
    >
      <Text accessibilityRole="header" style={styles.unavailableTitle}>
        Today is temporarily unavailable
      </Text>
      <Text style={styles.unavailableBody}>
        Your health information has not been replaced or estimated.
      </Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retryAction,
          pressed ? styles.pressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Try loading Today again"
      >
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

export function TodayScreen({
  safetyAlert = null,
  onAction,
  onExplainPriority,
  onRefresh,
  accountNotice = null,
}: TodayScreenProps) {
  const {
    snapshot,
    loading,
    refreshing,
    error,
    refresh,
  } = useTodaySnapshot();
  const mountedRef = useRef(true);
  const presentationFrameRef = useRef<TodayPresentationFrame | null>(null);
  const presentationFrame = useMemo(() => {
    if (!snapshot) {
      presentationFrameRef.current = null;
      return null;
    }
    const previous = presentationFrameRef.current;
    const next = previous
      ? refreshTodayPresentation(previous, snapshot)
      : { snapshot, presentation: presentToday(snapshot) };
    presentationFrameRef.current = next;
    return next;
  }, [snapshot]);
  const safetyNotice = useMemo(
    () => adaptTodaySafety(safetyAlert),
    [safetyAlert],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshAll = useCallback(async (): Promise<void> => {
    await Promise.all([
      refresh(),
      onRefresh ? onRefresh() : Promise.resolve(),
    ]);
  }, [onRefresh, refresh]);

  const retry = useCallback(() => {
    void refreshAll().catch(() => undefined);
  }, [refreshAll]);

  const handleAction = useCallback((action: TodayAction) => {
    void Promise.resolve()
      .then(() => onAction(action))
      .then(outcome => {
        if (mountedRef.current && outcome === 'refresh') return refreshAll();
        return undefined;
      })
      .catch(() => undefined);
  }, [onAction, refreshAll]);

  if (!snapshot) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <View style={styles.stateContent}>
          {loading ? (
            <TodayLoadingState />
          ) : (
            <TodayUnavailableState onRetry={retry} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const presentation = presentationFrame!.presentation;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        accessibilityState={{ busy: refreshing }}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={retry}
            tintColor={Colors.health.accent}
            colors={[Colors.health.accent]}
          />
        )}
      >
        <TodayHeader header={presentation.header} />
        <SafetyNotice notice={safetyNotice} onAction={handleAction} />
        <DailyHealthBrief
          brief={presentation.brief}
          onAction={handleAction}
        />
        <TopPriorities
          priorities={presentation.priorities}
          onAction={handleAction}
          onExplain={onExplainPriority}
        />
        <KeyInsight
          insight={presentation.keyInsight}
          onAction={handleAction}
        />
        <TodayProgress
          progress={presentation.progress}
          onAction={handleAction}
        />
        <TodayQuickActions
          actions={presentation.quickActions}
          onAction={handleAction}
        />
        {accountNotice}
        {error ? (
          <View
            style={styles.refreshError}
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.refreshErrorText}>
              The latest update is unavailable. Showing your most recent information.
            </Text>
            <Pressable
              onPress={retry}
              style={({ pressed }) => [
                styles.refreshRetry,
                pressed ? styles.pressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Retry updating Today"
            >
              <Text style={styles.refreshRetryText}>Retry update</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default TodayScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.health.background,
  },
  content: {
    width: '100%',
    maxWidth: ProductLayout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: ProductLayout.pageInset,
    paddingTop: Spacing.md,
    paddingBottom: ProductLayout.bottomClearance + Spacing.xxl,
    gap: ProductLayout.sectionGap,
  },
  stateContent: {
    width: '100%',
    maxWidth: ProductLayout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: ProductLayout.pageInset,
    paddingTop: Spacing.xl,
  },
  unavailable: {
    backgroundColor: Colors.health.surfaceStrong,
    borderColor: Colors.health.rule,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  unavailableTitle: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.h2,
    lineHeight: Typography.lineHeights.h2,
    fontWeight: Typography.weights.headline,
  },
  unavailableBody: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
  },
  retryAction: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderRadius: Radius.card,
    backgroundColor: Colors.health.ink,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  retryText: {
    color: Colors.health.surfaceStrong,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  refreshError: {
    borderTopColor: Colors.health.rule,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  refreshErrorText: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
  },
  refreshRetry: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  refreshRetryText: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  pressed: {
    opacity: 0.65,
  },
});
