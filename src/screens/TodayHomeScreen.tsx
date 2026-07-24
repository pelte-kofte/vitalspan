import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { useAuthSession } from '../context/AuthSessionContext';
import { usePremiumContext } from '../context/PremiumContext';
import { assembleAdvisorContext } from '../lib/advisorContext';
import { getAIAdvisorAccessState } from '../lib/premiumAccess';
import {
  captureAuthRequestScope,
  isAuthRequestScopeCurrent,
  resendVerificationEmail,
} from '../lib/supabase';
import {
  createTodayMutationExecutor,
  setTodayPlanItemCompletion,
  type TodayMutationExecutor,
} from '../lib/todayHomeActivation';
import { resolveTodayEmailVerificationReminder } from '../lib/todayEmailVerification';
import {
  buildSafetyAlert,
  type TodaySafetyAlert,
} from '../lib/todayExperience';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../navigation/AppNavigator';
import TodayScreen, {
  type TodayActionOutcome,
} from './TodayScreen';
import { Colors, Radius, Spacing, Typography } from '../theme';
import type { TodayAction, TodayPriority } from '../types/today';

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

function priorityExplanation(priority: TodayPriority): string {
  const { explanation } = priority;
  const sections = [
    `Observed\n${explanation.observedFact}`,
    `Interpretation\n${explanation.interpretation}`,
    `Suggested action\n${explanation.suggestedAction}`,
  ];
  if (explanation.limitations.length > 0) {
    sections.push(`Limits\n${explanation.limitations.join('\n')}`);
  }
  return sections.join('\n\n');
}

type VerificationDeliveryState = 'idle' | 'sending' | 'sent' | 'failed';

interface EmailVerificationReminderProps {
  readonly deliveryState: VerificationDeliveryState;
  readonly onDismiss: () => void;
  readonly onResend: () => void;
}

function EmailVerificationReminder({
  deliveryState,
  onDismiss,
  onResend,
}: EmailVerificationReminderProps): React.JSX.Element {
  const sending = deliveryState === 'sending';
  const feedback = deliveryState === 'sent'
    ? 'Verification email sent.'
    : deliveryState === 'failed'
      ? 'The email could not be resent. Try again when ready.'
      : null;

  return (
    <View
      style={styles.verificationReminder}
    >
      <Text accessibilityRole="header" style={styles.verificationTitle}>
        Protect your account
      </Text>
      <Text style={styles.verificationBody}>
        Verify your email to keep account recovery available.
      </Text>
      {feedback ? (
        <Text
          style={styles.verificationFeedback}
          accessibilityLiveRegion="polite"
        >
          {feedback}
        </Text>
      ) : null}
      <View style={styles.verificationActions}>
        <Pressable
          onPress={onResend}
          disabled={sending}
          style={({ pressed }) => [
            styles.verificationAction,
            pressed ? styles.pressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            sending ? 'Sending verification email' : 'Resend verification email'
          }
          accessibilityState={{ disabled: sending }}
        >
          <Text style={styles.verificationActionText}>
            {sending ? 'Sending…' : 'Resend email'}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.verificationAction,
            pressed ? styles.pressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Dismiss verification reminder"
        >
          <Text style={styles.verificationDismissText}>Not now</Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Production route adapter for Today. TodayScreen remains responsible only
 * for orchestration and presentation; this adapter owns navigation and the
 * existing application services required by resolved actions.
 */
export default function TodayHomeScreen(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();
  const auth = useAuthSession();
  const { isPremium, isPremiumLoading } = usePremiumContext();
  const mountedRef = useRef(true);
  const safetyRequestSequence = useRef(0);
  const mutationExecutorRef = useRef<TodayMutationExecutor | null>(null);
  const verificationRequestRef = useRef<{ readonly scopeKey: string } | null>(
    null,
  );
  const [safetyAlert, setSafetyAlert] = useState<TodaySafetyAlert | null>(null);
  const [dismissedVerificationScope, setDismissedVerificationScope] = useState<
    string | null
  >(null);
  const [verificationDeliveryState, setVerificationDeliveryState] =
    useState<VerificationDeliveryState>('idle');

  if (!mutationExecutorRef.current) {
    mutationExecutorRef.current = createTodayMutationExecutor();
  }

  const verificationReminder = useMemo(() => {
    const user = auth.session?.user ?? null;
    const provider = user?.app_metadata?.provider;
    return resolveTodayEmailVerificationReminder({
      status: auth.status,
      userId: auth.userId,
      generation: auth.generation,
      user: user
        ? {
            isAnonymous: user.is_anonymous === true,
            email: user.email ?? null,
            emailConfirmedAt: user.email_confirmed_at ?? null,
            provider: typeof provider === 'string' ? provider : null,
          }
        : null,
    });
  }, [
    auth.generation,
    auth.session?.user,
    auth.status,
    auth.userId,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      safetyRequestSequence.current += 1;
    };
  }, []);

  useEffect(() => {
    setVerificationDeliveryState('idle');
  }, [verificationReminder?.scopeKey]);

  const refreshSafety = useCallback(async (): Promise<void> => {
    const requestId = ++safetyRequestSequence.current;
    const scope = captureAuthRequestScope();
    if (!scope) {
      setSafetyAlert(null);
      return;
    }

    try {
      const context = await assembleAdvisorContext();
      if (
        safetyRequestSequence.current !== requestId
        || !isAuthRequestScopeCurrent(scope)
      ) {
        return;
      }
      setSafetyAlert(buildSafetyAlert(context));
    } catch {
      // Preserve an already resolved alert during a transient refresh failure.
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void refreshSafety();
    return () => {
      safetyRequestSequence.current += 1;
    };
  }, [refreshSafety]));

  const resendVerification = useCallback(async (): Promise<void> => {
    if (!verificationReminder || !mountedRef.current) return;
    if (
      verificationRequestRef.current?.scopeKey
      === verificationReminder.scopeKey
    ) {
      return;
    }

    const scope = captureAuthRequestScope();
    if (
      !scope
      || `${scope.generation}:${scope.userId}`
        !== verificationReminder.scopeKey
    ) {
      return;
    }

    const request = { scopeKey: verificationReminder.scopeKey };
    verificationRequestRef.current = request;
    setVerificationDeliveryState('sending');
    try {
      const result = await resendVerificationEmail(
        verificationReminder.email,
      );
      if (
        !mountedRef.current
        || verificationRequestRef.current !== request
        || !isAuthRequestScopeCurrent(scope)
      ) {
        return;
      }
      setVerificationDeliveryState(result.error ? 'failed' : 'sent');
      if (!result.error) {
        Haptics.selectionAsync().catch(() => null);
      }
    } catch {
      if (
        mountedRef.current
        && verificationRequestRef.current === request
        && isAuthRequestScopeCurrent(scope)
      ) {
        setVerificationDeliveryState('failed');
      }
    } finally {
      if (verificationRequestRef.current === request) {
        verificationRequestRef.current = null;
      }
    }
  }, [verificationReminder]);

  const handleAction = useCallback(async (
    action: TodayAction,
  ): Promise<TodayActionOutcome> => {
    if (!mountedRef.current) return 'handled';
    if (action.kind !== 'set_plan_item_completion') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    }

    switch (action.kind) {
      case 'open_biomarker':
        navigation.navigate('BiomarkerDetail', {
          biomarkerId: action.biomarkerId,
        });
        return 'handled';
      case 'enter_biomarker':
        navigation.navigate('BiomarkerEntry', {
          biomarkerId: action.biomarkerId,
        });
        return 'handled';
      case 'add_result':
        navigation.navigate('AddResult');
        return 'handled';
      case 'import_laboratory_pdf':
        navigation.navigate('LabUpload');
        return 'handled';
      case 'open_health':
        navigation.navigate('Biomarkers');
        return 'handled';
      case 'open_plan':
        navigation.navigate('Protocol');
        return 'handled';
      case 'set_plan_item_completion': {
        const actionScope = captureAuthRequestScope();
        if (!actionScope) return 'handled';
        try {
          const execution = await mutationExecutorRef.current!.run(
            `${action.kind}:${action.itemId}:${String(action.completed)}`,
            () => setTodayPlanItemCompletion(
              action.itemId,
              action.completed,
            ),
          );
          if (
            execution.status === 'completed'
            && execution.value === 'changed'
            && mountedRef.current
            && isAuthRequestScopeCurrent(actionScope)
          ) {
            Haptics.selectionAsync().catch(() => null);
            return 'refresh';
          }
        } catch {
          if (
            mountedRef.current
            && isAuthRequestScopeCurrent(actionScope)
          ) {
            Alert.alert(
              'Could not update your plan',
              'Your existing plan has not been replaced. Try again or open Protocol.',
            );
          }
        }
        return 'handled';
      }
      case 'log_movement':
        navigation.navigate('Exercise');
        return 'handled';
      case 'connect_health_data':
        navigation.navigate('LongevityScore');
        return 'handled';
      case 'complete_profile':
        navigation.navigate('Profile');
        return 'handled';
      case 'review_interactions':
        navigation.navigate('InteractionChecker');
        return 'handled';
      case 'open_learning':
        if (isPremiumLoading) return 'handled';
        if (!isPremium) {
          navigation.navigate('Paywall');
          return 'handled';
        }
        if (action.contentId) {
          navigation.navigate('ArticleDetail', { pmid: action.contentId });
        } else {
          navigation.navigate('Articles');
        }
        return 'handled';
      case 'explain_brief': {
        const access = getAIAdvisorAccessState(
          isPremium,
          isPremiumLoading,
        );
        if (access === 'allowed') navigation.navigate('AIAdvisor');
        if (access === 'paywall') navigation.navigate('Paywall');
        return 'handled';
      }
    }
  }, [isPremium, isPremiumLoading, navigation]);

  const handleExplainPriority = useCallback((priority: TodayPriority) => {
    if (!mountedRef.current) return;
    Alert.alert('Why this?', priorityExplanation(priority), [
      { text: 'Done' },
    ]);
  }, []);

  const accountNotice = verificationReminder
    && dismissedVerificationScope !== verificationReminder.scopeKey
    ? (
        <EmailVerificationReminder
          deliveryState={verificationDeliveryState}
          onDismiss={() => {
            setDismissedVerificationScope(verificationReminder.scopeKey);
          }}
          onResend={() => {
            void resendVerification();
          }}
        />
      )
    : null;

  return (
    <TodayScreen
      safetyAlert={safetyAlert}
      onAction={handleAction}
      onExplainPriority={handleExplainPriority}
      onRefresh={refreshSafety}
      accountNotice={accountNotice}
    />
  );
}

const styles = StyleSheet.create({
  verificationReminder: {
    borderTopColor: Colors.health.rule,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  verificationTitle: {
    color: Colors.health.ink,
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body,
    fontWeight: Typography.weights.subheadline,
  },
  verificationBody: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
  },
  verificationFeedback: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.caption,
    lineHeight: Typography.lineHeights.caption,
  },
  verificationActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  verificationAction: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  verificationActionText: {
    color: Colors.health.accent,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  verificationDismissText: {
    color: Colors.health.inkSecondary,
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    fontWeight: Typography.weights.label,
  },
  pressed: {
    opacity: 0.62,
  },
});
