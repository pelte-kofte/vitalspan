import React, { useState } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text as NativeText,
  type TextProps,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import type { Article } from '../../lib/articleService';
import { articleDeck, readingTime } from '../../lib/articleUtils';
import type {
  ChangedSignal,
  DailyHealthBrief,
  TodayHealthState,
  TodayLayout,
  TodayPriorityCandidate,
  TodayProtocolItem,
  TodaySafetyAlert,
} from '../../lib/todayExperience';
import { Colors, Radius, Spacing, Typography } from '../../theme';
import AnimatedPressable from '../AnimatedPressable';
import { CheckmarkIcon, ChevronRightIcon } from '../DesignSystemIcons';
import { SkeletonBlock, SkeletonPulse } from '../Skeleton';

const COVER_ART = require('../../../assets/brief-cover-editorial.jpg');
const TODAY_TEXT_SECONDARY = 'rgba(232,245,238,0.66)';
const TODAY_TEXT_TERTIARY = 'rgba(232,245,238,0.46)';
const TODAY_SURFACE = '#151A16';

function Text({ maxFontSizeMultiplier = 1.4, ...props }: TextProps) {
  return <NativeText maxFontSizeMultiplier={maxFontSizeMultiplier} {...props} />;
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  detail?: string;
}

export function TodaySectionHeading({ eyebrow, title, detail }: SectionHeadingProps) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={styles.sectionTitle} accessibilityRole="header">{title}</Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

export function SafetyAlertCard({
  alert,
  onReview,
}: {
  alert: TodaySafetyAlert;
  onReview: () => void;
}) {
  return (
    <View
      style={styles.safetyCard}
      accessibilityRole="alert"
      accessibilityLabel={`${alert.title}. ${alert.body}. Source: ${alert.sourceLabel}`}
    >
      <View style={styles.safetyMarker} />
      <View style={styles.flex}>
        <Text style={styles.safetyEyebrow}>SAFETY REVIEW</Text>
        <Text style={styles.safetyTitle} accessibilityRole="header">{alert.title}</Text>
        <Text style={styles.safetyBody}>{alert.body}</Text>
        <Text style={styles.sourceText}>Source · {alert.sourceLabel}</Text>
        <AnimatedPressable
          onPress={onReview}
          style={styles.outlineButton}
          accessibilityRole="button"
          accessibilityLabel="Review possible protocol interaction"
        >
          <Text style={styles.outlineButtonText}>Review now</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

export function TodayPriorityHero({
  priority,
  layout,
  onPrimaryAction,
  onRequirementPress,
  onDecline,
  reduceMotion,
}: {
  priority: TodayPriorityCandidate;
  layout: TodayLayout;
  onPrimaryAction: () => void;
  onRequirementPress: (biomarkerId: string) => void;
  onDecline: () => void;
  reduceMotion: boolean;
}) {
  const [disclosure, setDisclosure] = useState<'why' | 'evidence' | null>(null);
  return (
    <LinearGradient
      colors={['#182019', '#121713']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.priorityHero, layout === 'compact' && styles.priorityHeroCompact]}
      testID="today-priority"
    >
      <Text style={styles.priorityEyebrow}>TODAY’S PRIORITY</Text>
      <Text style={[styles.priorityTitle, layout === 'compact' && styles.priorityTitleCompact]} accessibilityRole="header">
        {priority.title}
      </Text>
      <Text style={styles.priorityReason}>{priority.reason}</Text>

      {priority.requirements ? (
        <View style={styles.requirementList} accessibilityLabel="Required blood input checklist">
          {priority.requirements.map((requirement, index) => {
            const complete = requirement.status === 'present';
            return (
              <Pressable
                key={requirement.biomarkerId}
                onPress={() => onRequirementPress(requirement.biomarkerId)}
                style={({ pressed }) => [
                  styles.requirementRow,
                  index > 0 && styles.requirementRule,
                  pressed && styles.controlPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${requirement.label}. ${complete ? 'Completed' : requirement.status.replace(/_/g, ' ')}. Enter this biomarker.`}
              >
                <View style={[styles.requirementMark, complete && styles.requirementMarkComplete]}>
                  <Text style={[styles.requirementSymbol, complete && styles.requirementSymbolComplete]}>
                    {complete ? '✓' : '○'}
                  </Text>
                </View>
                <Text style={[styles.requirementLabel, complete && styles.requirementLabelComplete]}>{requirement.label}</Text>
                <ChevronRightIcon color={complete ? Colors.viz.bioGreen : TODAY_TEXT_TERTIARY} size={15} />
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <AnimatedPressable
        onPress={onPrimaryAction}
        style={styles.primaryButton}
        haptic="none"
        accessibilityRole="button"
        accessibilityLabel={`${priority.ctaLabel}. Today’s priority: ${priority.title}`}
      >
        <Text maxFontSizeMultiplier={1.3} style={styles.primaryButtonText}>{priority.ctaLabel}</Text>
        <View style={styles.primaryButtonIcon} accessibilityElementsHidden>
          <ChevronRightIcon color="#07120B" size={19} />
        </View>
      </AnimatedPressable>

      <View style={styles.heroLinks}>
        <Pressable
          onPress={() => setDisclosure(disclosure === 'why' ? null : 'why')}
          style={({ pressed }) => [styles.heroLinkButton, pressed && styles.controlPressed]}
          accessibilityRole="button"
          accessibilityLabel="Why this priority"
          accessibilityState={{ expanded: disclosure === 'why' }}
        >
          <Text maxFontSizeMultiplier={1.15} style={[styles.heroLink, disclosure === 'why' && styles.heroLinkActive]}>Why this?</Text>
        </Pressable>
        <Pressable
          onPress={() => setDisclosure(disclosure === 'evidence' ? null : 'evidence')}
          style={({ pressed }) => [styles.heroLinkButton, pressed && styles.controlPressed]}
          accessibilityRole="button"
          accessibilityLabel="Evidence for this priority"
          accessibilityState={{ expanded: disclosure === 'evidence' }}
        >
          <Text maxFontSizeMultiplier={1.15} style={[styles.heroLink, disclosure === 'evidence' && styles.heroLinkActive]}>Evidence</Text>
        </Pressable>
        {priority.canDecline ? (
          <Pressable
            onPress={onDecline}
            style={({ pressed }) => [styles.heroLinkButton, styles.heroLinkButtonFlexible, pressed && styles.controlPressed]}
            accessibilityRole="button"
            accessibilityLabel="This priority is not for me or I cannot do this"
          >
            <Text maxFontSizeMultiplier={1.15} style={styles.heroLinkMuted}>Not for me / I can’t do this</Text>
          </Pressable>
        ) : null}
      </View>

      {disclosure ? (
        reduceMotion ? (
          <View style={styles.disclosure} accessibilityLiveRegion="polite">
            <Text style={styles.disclosureLabel}>{disclosure === 'why' ? 'WHY THIS' : 'EVIDENCE'}</Text>
            <Text style={styles.disclosureText}>{disclosure === 'why' ? priority.whyThis : priority.evidence}</Text>
            {disclosure === 'evidence' && (
              <Text style={styles.disclosureMeta}>Source: {priority.sourceLabel}{'\n'}Data status: {priority.freshnessLabel}{'\n'}Confidence: {priority.confidenceLanguage}</Text>
            )}
          </View>
        ) : (
          <Animated.View
            entering={FadeInDown.duration(180)}
            style={styles.disclosure}
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.disclosureLabel}>{disclosure === 'why' ? 'WHY THIS' : 'EVIDENCE'}</Text>
            <Text style={styles.disclosureText}>{disclosure === 'why' ? priority.whyThis : priority.evidence}</Text>
            {disclosure === 'evidence' && (
              <Text style={styles.disclosureMeta}>Source: {priority.sourceLabel}{'\n'}Data status: {priority.freshnessLabel}{'\n'}Confidence: {priority.confidenceLanguage}</Text>
            )}
          </Animated.View>
        )
      ) : null}
    </LinearGradient>
  );
}

export function DailyBriefCard({ brief, onAsk }: { brief: DailyHealthBrief; onAsk: () => void }) {
  const rows = [
    { label: 'Do one thing', value: brief.doOneThing, emphasis: true },
    { label: 'Watch', value: brief.watch, emphasis: false },
    { label: 'Opportunity', value: brief.opportunity, emphasis: false },
  ];
  return (
    <View style={styles.sectionBlock} testID="daily-health-brief">
      <TodaySectionHeading eyebrow="Interpret" title="Daily Health Brief" />
      <View style={styles.briefSurface}>
        {rows.map((row, index) => (
          <View key={row.label} style={[styles.briefRow, index > 0 && styles.dividedRow]}>
            <Text style={[styles.briefLabel, row.emphasis && styles.briefLabelEmphasis]}>{row.label}</Text>
            <Text style={[styles.briefValue, row.emphasis && styles.briefValueEmphasis]}>{row.value}</Text>
          </View>
        ))}
        <AnimatedPressable
          onPress={onAsk}
          accessibilityRole="button"
          accessibilityLabel={`Ask AI Advisor about this health brief. ${brief.askContext}`}
          style={styles.textRoute}
        >
          <Text style={styles.textRouteLabel}>Ask about this</Text>
          <ChevronRightIcon color={Colors.dark.textMuted} size={17} />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const KIND_LABEL: Record<TodayProtocolItem['kind'], string> = {
  medication: 'MED',
  supplement: 'SUPP',
  exercise: 'MOVE',
  habit: 'HABIT',
};

export function TodayProtocolSection({
  items,
  onToggle,
  onOpenPlan,
  reduceMotion,
}: {
  items: TodayProtocolItem[];
  onToggle: (item: TodayProtocolItem) => void;
  onOpenPlan: () => void;
  reduceMotion: boolean;
}) {
  return (
    <View style={styles.sectionBlock} testID="today-protocol">
      <TodaySectionHeading eyebrow="Act" title="Today’s Protocol" detail="Your saved plan, ordered by time" />
      <View style={styles.listSurface}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No protocol is scheduled</Text>
            <Text style={styles.emptyBody}>Vitalspan has no medication, supplement, exercise, or habit action to show today.</Text>
            <AnimatedPressable
              onPress={onOpenPlan}
              style={styles.emptyActionButton}
              accessibilityRole="button"
              accessibilityLabel="Open Plan to review protocol"
            >
              <Text style={styles.emptyAction}>Review plan</Text>
              <ChevronRightIcon color={Colors.viz.bioGreen} size={16} />
            </AnimatedPressable>
          </View>
        ) : items.map((item, index) => (
          <View key={item.id} style={[styles.protocolRow, index > 0 && styles.dividedRow]}>
            <Pressable
              onPress={() => item.canToggle && onToggle(item)}
              disabled={!item.canToggle}
              style={({ pressed }) => [styles.completionHitbox, pressed && styles.controlPressed]}
              accessibilityRole={item.canToggle ? 'checkbox' : undefined}
              accessibilityState={item.canToggle ? { checked: item.state === 'done', disabled: false } : undefined}
              accessibilityLabel={`${item.title}, ${item.state === 'done' ? 'completed' : 'due'}`}
            >
              <View style={[styles.completionControl, item.state === 'done' && styles.completionDone]}>
                {item.state === 'done' ? (
                  reduceMotion ? (
                    <CheckmarkIcon color={Colors.viz.bioGreen} size={15} />
                  ) : (
                    <Animated.View entering={ZoomIn.duration(180)}>
                      <CheckmarkIcon color={Colors.viz.bioGreen} size={15} />
                    </Animated.View>
                  )
                ) : null}
              </View>
            </Pressable>
            <View style={styles.protocolCopy}>
              <View style={styles.protocolTopline}>
                <Text style={styles.kindBadge}>{KIND_LABEL[item.kind]}</Text>
                <Text style={styles.protocolTime}>{item.timeLabel}</Text>
              </View>
              <Text style={[styles.protocolTitle, item.state === 'done' && styles.completedText]}>{item.title}</Text>
              {item.detail ? <Text style={styles.protocolDetail}>{item.detail}</Text> : null}
              {item.safetyWarning ? <Text style={styles.protocolWarning}>{item.safetyWarning}</Text> : null}
            </View>
            {item.canToggle ? (
              <Text style={styles.protocolState}>{item.state === 'done' ? 'Done' : 'Mark done'}</Text>
            ) : null}
          </View>
        ))}
        {items.length > 0 ? (
          <AnimatedPressable onPress={onOpenPlan} style={styles.textRoute} accessibilityRole="button" accessibilityLabel="Open full Plan">
            <Text style={styles.textRouteLabel}>Open full plan</Text>
            <ChevronRightIcon color={Colors.dark.textMuted} size={17} />
          </AnimatedPressable>
        ) : null}
      </View>
    </View>
  );
}

function formatDate(value: string | null): string {
  if (!value) return 'Not calculated';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not calculated';
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function HealthStateSection({ state, onOpen }: { state: TodayHealthState; onOpen: () => void }) {
  return (
    <View style={styles.sectionBlock} testID="health-state">
      <TodaySectionHeading eyebrow="Measure response" title="Health State" />
      <AnimatedPressable
        onPress={onOpen}
        style={styles.healthSurface}
        accessibilityRole="button"
        accessibilityLabel={state.status === 'valid'
          ? `Blood phenotypic age ${state.bloodPhenotypicAge}. Chronological age ${state.chronologicalAge}. ${state.historyLabel}. Opens limitations and details.`
          : `${state.summary} ${state.presentCount} of ${state.totalRequired} inputs ready. Opens limitations and details.`}
      >
        {state.status === 'valid' ? (
          <View style={styles.healthAgeRow}>
            <View>
              <Text style={styles.healthLabel}>BLOOD PHENOTYPIC AGE</Text>
              <Text style={styles.healthAge}>{state.bloodPhenotypicAge}</Text>
            </View>
            <View style={styles.healthMetaColumn}>
              <Text style={styles.healthMetaLabel}>CHRONOLOGICAL AGE</Text>
              <Text style={styles.healthMetaValue}>{state.chronologicalAge}</Text>
              <Text style={styles.healthMetaLabel}>LAST CALCULATED</Text>
              <Text style={styles.healthMetaValue}>{formatDate(state.lastCalculated)}</Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.healthLabel}>BLOOD PHENOTYPIC AGE</Text>
            <Text style={styles.healthUnavailable}>Not enough compatible data</Text>
            <Text style={styles.healthSummary}>{state.summary}</Text>
          </View>
        )}
        <View style={styles.completenessTrack}>
          <View
            style={[styles.completenessFill, { width: `${Math.min(100, (state.presentCount / state.totalRequired) * 100)}%` }]}
          />
        </View>
        <View style={styles.healthFooter}>
          <Text style={styles.healthFooterText}>{state.presentCount}/{state.totalRequired} inputs · {state.historyLabel}</Text>
          <View style={styles.healthFooterRoute}>
            <Text style={styles.healthFooterLink}>Limitations</Text>
            <ChevronRightIcon color={Colors.dark.text} size={14} />
          </View>
        </View>
        <View style={styles.wearableNote}>
          <Text style={styles.wearableLabel}>{state.wearableStatus === 'connected' ? 'WEARABLE CONNECTED' : 'WEARABLE NOT CONNECTED'}</Text>
          <Text style={styles.wearableText}>{state.wearableSummary}</Text>
        </View>
      </AnimatedPressable>
    </View>
  );
}

const SIGNAL_LABEL: Record<ChangedSignal['kind'], string> = {
  laboratory_range: 'LABORATORY RANGE',
  contextual_change: 'CONTEXTUAL SIGNAL',
  stale_data: 'DATA FRESHNESS',
  resolved_range_issue: 'RANGE UPDATE',
};

export function ChangedSignalsSection({
  signals,
  emptyMessage,
  onOpen,
}: {
  signals: ChangedSignal[];
  emptyMessage: string | null;
  onOpen: (biomarkerId: string) => void;
}) {
  return (
    <View style={styles.sectionBlock} testID="changed-signals">
      <TodaySectionHeading eyebrow="Observe" title="Changed Signals" detail="Up to three meaningful, comparable updates" />
      <View style={styles.listSurface}>
        {signals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No meaningful change</Text>
            <Text style={styles.emptyBody}>{emptyMessage}</Text>
          </View>
        ) : signals.map((signal, index) => (
          <Pressable
            key={signal.id}
            onPress={() => onOpen(signal.biomarkerId)}
            style={({ pressed }) => [styles.signalRow, index > 0 && styles.dividedRow, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`${signal.title}. ${signal.valueAndUnit}. ${signal.detail}. Source ${signal.source}.`}
          >
            <Text style={styles.signalKind}>{SIGNAL_LABEL[signal.kind]}</Text>
            <Text style={styles.signalTitle}>{signal.title}</Text>
            <Text style={styles.signalDetail}>{signal.detail}</Text>
            <Text style={styles.signalMeta}>{signal.valueAndUnit} · {formatDate(signal.occurredAt)} · {signal.source}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function WeeklyResearchCard({
  issueNumber,
  article,
  onOpen,
}: {
  issueNumber: number;
  article: Article;
  onOpen: () => void;
}) {
  const relevance = articleDeck(article.abstract) ?? 'A selected study placed in context by the Vitalspan editorial review.';
  const duration = readingTime([article.abstract, article.limitations].filter(Boolean).join(' '));
  return (
    <View style={styles.researchBlock} testID="weekly-research">
      <TodaySectionHeading eyebrow="Weekly research" title="One study worth your time" />
      <AnimatedPressable
        onPress={onOpen}
        style={styles.researchCard}
        accessibilityRole="button"
        accessibilityLabel={`Weekly Research, Issue ${issueNumber}. ${article.title}. ${relevance}. ${duration}. Open issue.`}
      >
        <ImageBackground source={COVER_ART} style={styles.researchImage} imageStyle={styles.researchImageCorners}>
          <LinearGradient colors={['rgba(8,10,8,0.08)', 'rgba(8,10,8,0.88)']} style={styles.researchScrim}>
            <Text style={styles.researchIssue}>THE VITALSPAN BRIEF · ISSUE {issueNumber}</Text>
            <Text style={styles.researchTitle}>{article.title}</Text>
          </LinearGradient>
        </ImageBackground>
        <View style={styles.researchCopy}>
          <Text style={styles.researchRelevance} numberOfLines={3}>{relevance}</Text>
          <View style={styles.researchMetaRow}>
            <Text style={styles.researchMeta}>{duration}</Text>
            <View style={styles.researchRoute}>
              <Text style={styles.researchCta}>Open issue</Text>
              <ChevronRightIcon color={Colors.dark.text} size={14} />
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </View>
  );
}

export function TodaySkeleton({ reduceMotion }: { reduceMotion: boolean }) {
  const content = (
    <View style={styles.skeleton} accessibilityLabel="Loading today’s health briefing">
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonGap}>
          <SkeletonBlock w={72} h={12} />
          <SkeletonBlock w={180} h={28} />
        </View>
        <SkeletonBlock w={40} h={40} radius={20} />
      </View>
      <SkeletonBlock w="100%" h={310} radius={Radius.card} />
      <SkeletonBlock w="100%" h={210} radius={Radius.card} />
      <SkeletonBlock w="100%" h={245} radius={Radius.card} />
      <SkeletonBlock w="100%" h={190} radius={Radius.card} />
      <SkeletonBlock w="100%" h={180} radius={Radius.card} />
      <SkeletonBlock w="100%" h={240} radius={Radius.card} />
    </View>
  );
  return reduceMotion ? content : <SkeletonPulse>{content}</SkeletonPulse>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.78 },
  controlPressed: { opacity: 0.64 },
  sectionBlock: { marginTop: 52 },
  researchBlock: { marginTop: 56, marginBottom: 56 },
  sectionHeading: { marginBottom: 18 },
  eyebrow: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 1.7 },
  sectionTitle: { color: Colors.dark.text, fontSize: Typography.sizes.h2, lineHeight: Typography.lineHeights.h2, fontWeight: '400', letterSpacing: -0.25, marginTop: 6 },
  sectionDetail: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.base, lineHeight: Typography.lineHeights.body, marginTop: 6 },
  safetyCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: 'rgba(245,158,11,0.07)', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.statusWarnBorder, borderRadius: Radius.card, padding: Spacing.lg, marginBottom: Spacing.xl },
  safetyMarker: { width: 3, borderRadius: 2, backgroundColor: Colors.viz.amber },
  safetyEyebrow: { color: Colors.viz.amber, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 1.5 },
  safetyTitle: { color: Colors.dark.text, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: '600', marginTop: 5 },
  safetyBody: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.base, lineHeight: Typography.lineHeights.body, marginTop: 7 },
  sourceText: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall, marginTop: Spacing.sm },
  outlineButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', borderWidth: 1, borderColor: Colors.dark.statusWarnBorder, borderRadius: Radius.card, paddingHorizontal: Spacing.base, paddingVertical: 10, marginTop: Spacing.base },
  outlineButtonText: { color: Colors.viz.amber, fontWeight: '600', fontSize: Typography.sizes.bodySmall },
  priorityHero: { borderRadius: Radius.card, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(132,189,154,0.18)', padding: 28, shadowColor: '#000000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.26, shadowRadius: 28, elevation: 5 },
  priorityHeroCompact: { padding: Spacing.lg },
  priorityEyebrow: { color: Colors.viz.bioGreen, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 2 },
  priorityTitle: { color: Colors.dark.text, fontSize: Typography.sizes.display3, lineHeight: Typography.lineHeights.display3, letterSpacing: -0.8, fontWeight: '400', marginTop: Spacing.lg },
  priorityTitleCompact: { fontSize: Typography.sizes.h1, lineHeight: Typography.lineHeights.h1 },
  priorityReason: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.body, lineHeight: 22, marginTop: Spacing.base },
  requirementList: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.border, marginTop: Spacing.lg },
  requirementRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  requirementRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.dark.border },
  requirementMark: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  requirementMarkComplete: { borderRadius: Radius.full, backgroundColor: Colors.dark.accentBg },
  requirementSymbol: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.lg, lineHeight: Typography.sizes.lg },
  requirementSymbolComplete: { color: Colors.viz.bioGreen, fontSize: Typography.sizes.bodySmall, fontWeight: '700' },
  requirementLabel: { flex: 1, color: Colors.dark.text, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall },
  requirementLabelComplete: { color: Colors.viz.bioGreen },
  provenancePanel: { backgroundColor: 'rgba(255,255,255,0.035)', borderRadius: Radius.card, paddingHorizontal: Spacing.md, paddingVertical: 10, marginTop: 22 },
  provenancePanelCompact: { paddingHorizontal: 10, paddingVertical: 7, marginTop: Spacing.base },
  provenanceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, paddingVertical: 7 },
  provenanceRowCompact: { gap: Spacing.sm, paddingVertical: 4 },
  provenanceLabel: { width: 96, color: TODAY_TEXT_TERTIARY, fontSize: 10, fontWeight: '700', letterSpacing: 1, paddingTop: 1 },
  provenanceLabelCompact: { width: 88, fontSize: 10, letterSpacing: 0.8 },
  provenanceValue: { flex: 1, color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall },
  provenanceValueCompact: { fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption },
  primaryButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#59BE89', borderRadius: Radius.card, paddingLeft: Spacing.lg, paddingRight: Spacing.md, paddingVertical: 14, marginTop: Spacing.lg, minHeight: 56, shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.16, shadowRadius: 12, elevation: 3 },
  primaryButtonText: { color: '#07120B', fontSize: Typography.sizes.body, fontWeight: '700' },
  primaryButtonIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(7,18,11,0.08)', alignItems: 'center', justifyContent: 'center' },
  heroLinks: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 0, marginTop: 8 },
  heroLinkButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 7 },
  heroLinkButtonFlexible: { flexShrink: 1 },
  heroLink: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.bodySmall, fontWeight: '500' },
  heroLinkActive: { color: Colors.viz.bioGreen },
  heroLinkMuted: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.bodySmall },
  disclosure: { backgroundColor: 'rgba(255,255,255,0.035)', borderRadius: Radius.card, padding: Spacing.base, marginTop: Spacing.xs },
  disclosureLabel: { color: Colors.viz.bioGreen, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 1.2 },
  disclosureText: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.base, lineHeight: Typography.lineHeights.body, marginTop: 7 },
  disclosureMeta: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.caption, marginTop: Spacing.md },
  briefSurface: { backgroundColor: TODAY_SURFACE, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.border, borderRadius: Radius.card, paddingHorizontal: Spacing.lg, overflow: 'hidden' },
  briefRow: { paddingVertical: 18 },
  dividedRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.dark.border },
  briefLabel: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.caption, fontWeight: '600', marginBottom: 6 },
  briefLabelEmphasis: { color: Colors.viz.bioGreen },
  briefValue: { color: Colors.dark.text, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body },
  briefValueEmphasis: { fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: '500' },
  textRoute: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.dark.border, paddingVertical: Spacing.md },
  textRouteLabel: { color: Colors.dark.text, fontSize: Typography.sizes.bodySmall, fontWeight: '600' },
  listSurface: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.border },
  emptyState: { paddingVertical: 28 },
  emptyTitle: { color: Colors.dark.text, fontSize: Typography.sizes.lg, fontWeight: '500' },
  emptyBody: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.base, lineHeight: Typography.lineHeights.body, marginTop: 7, maxWidth: 500 },
  emptyActionButton: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: Spacing.sm },
  emptyAction: { color: Colors.viz.bioGreen, fontSize: Typography.sizes.bodySmall, fontWeight: '600' },
  protocolRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', minHeight: 92, paddingVertical: Spacing.md, gap: Spacing.sm },
  completionHitbox: { width: 40, height: 44, marginLeft: -6, alignItems: 'center', justifyContent: 'center' },
  completionControl: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: Colors.dark.borderStrong, alignItems: 'center', justifyContent: 'center' },
  completionDone: { borderColor: Colors.viz.bioGreen, backgroundColor: Colors.dark.accentBg },
  protocolCopy: { flex: 1 },
  protocolTopline: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  kindBadge: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 1.05 },
  protocolTime: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall },
  protocolTitle: { color: Colors.dark.text, fontSize: Typography.sizes.body, fontWeight: '500' },
  protocolDetail: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.caption, marginTop: 3 },
  protocolWarning: { color: Colors.viz.amber, fontSize: Typography.sizes.captionSmall, marginTop: 5 },
  completedText: { color: TODAY_TEXT_TERTIARY, textDecorationLine: 'line-through' },
  protocolState: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall, maxWidth: 58, textAlign: 'right' },
  healthSurface: { backgroundColor: TODAY_SURFACE, borderRadius: Radius.card, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.border, padding: Spacing.lg, shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 3 },
  healthAgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.base },
  healthLabel: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 1.2 },
  healthAge: { color: Colors.dark.text, fontSize: Typography.sizes.display2, lineHeight: Typography.lineHeights.display2, fontWeight: '400', letterSpacing: -0.8, marginTop: 5 },
  healthMetaColumn: { alignItems: 'flex-end' },
  healthMetaLabel: { color: TODAY_TEXT_TERTIARY, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 3 },
  healthMetaValue: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.bodySmall, marginTop: 3, marginBottom: 6 },
  healthUnavailable: { color: Colors.dark.text, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: '500', marginTop: Spacing.sm },
  healthSummary: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.base, lineHeight: Typography.lineHeights.body, marginTop: Spacing.sm },
  completenessTrack: { height: 4, backgroundColor: Colors.dark.border, borderRadius: 2, marginTop: Spacing.lg, overflow: 'hidden' },
  completenessFill: { height: 4, borderRadius: 2, backgroundColor: Colors.viz.bioGreen },
  healthFooter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.sm, marginTop: Spacing.md },
  healthFooterText: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall },
  healthFooterRoute: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  healthFooterLink: { color: Colors.dark.text, fontSize: Typography.sizes.captionSmall, fontWeight: '600' },
  wearableNote: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.dark.border, marginTop: Spacing.md, paddingTop: Spacing.md },
  wearableLabel: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 1.05 },
  wearableText: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption, marginTop: 5 },
  signalRow: { minHeight: 72, paddingVertical: 18 },
  signalKind: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 1.1 },
  signalTitle: { color: Colors.dark.text, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body, fontWeight: '500', marginTop: 5 },
  signalDetail: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: 5 },
  signalMeta: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall, lineHeight: Typography.lineHeights.captionSmall, marginTop: Spacing.sm },
  researchCard: { borderRadius: Radius.card, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.borderStrong, backgroundColor: TODAY_SURFACE, shadowColor: '#000000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 4 },
  researchImage: { minHeight: 192 },
  researchImageCorners: { borderTopLeftRadius: Radius.card, borderTopRightRadius: Radius.card },
  researchScrim: { flex: 1, justifyContent: 'space-between', padding: Spacing.lg },
  researchIssue: { color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  researchTitle: { color: '#FFFFFF', fontFamily: Typography.displaySerif, fontSize: Typography.sizes.h2, lineHeight: 29 },
  researchCopy: { padding: Spacing.lg },
  researchRelevance: { color: TODAY_TEXT_SECONDARY, fontSize: Typography.sizes.base, lineHeight: Typography.lineHeights.body },
  researchMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.base },
  researchMeta: { color: TODAY_TEXT_TERTIARY, fontSize: Typography.sizes.captionSmall },
  researchRoute: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  researchCta: { color: Colors.dark.text, fontSize: Typography.sizes.captionSmall, fontWeight: '600' },
  skeleton: { padding: Spacing.lg, gap: 28 },
  skeletonHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  skeletonGap: { gap: Spacing.sm },
});
