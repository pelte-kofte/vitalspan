import React, { useState } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { SkeletonBlock, SkeletonPulse } from '../Skeleton';

const COVER_ART = require('../../../assets/brief-cover-editorial.jpg');

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
        <Pressable
          onPress={onReview}
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Review possible protocol interaction"
        >
          <Text style={styles.outlineButtonText}>Review now</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function TodayPriorityHero({
  priority,
  layout,
  onPrimaryAction,
  onDecline,
}: {
  priority: TodayPriorityCandidate;
  layout: TodayLayout;
  onPrimaryAction: () => void;
  onDecline: () => void;
}) {
  const [disclosure, setDisclosure] = useState<'why' | 'evidence' | null>(null);
  return (
    <View style={[styles.priorityHero, layout === 'compact' && styles.priorityHeroCompact]} testID="today-priority">
      <Text style={styles.priorityEyebrow}>TODAY’S PRIORITY</Text>
      <Text style={[styles.priorityTitle, layout === 'compact' && styles.priorityTitleCompact]} accessibilityRole="header">
        {priority.title}
      </Text>
      <Text style={styles.priorityReason}>{priority.reason}</Text>

      <View style={styles.provenancePanel}>
        <View style={styles.provenanceRow}>
          <Text style={styles.provenanceLabel}>SOURCE</Text>
          <Text style={styles.provenanceValue}>{priority.sourceLabel}</Text>
        </View>
        <View style={styles.provenanceRow}>
          <Text style={styles.provenanceLabel}>FRESHNESS</Text>
          <Text style={styles.provenanceValue}>{priority.freshnessLabel}</Text>
        </View>
        <View style={styles.provenanceRow}>
          <Text style={styles.provenanceLabel}>CONFIDENCE</Text>
          <Text style={styles.provenanceValue}>{priority.confidenceLanguage}</Text>
        </View>
      </View>

      <Pressable
        onPress={onPrimaryAction}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${priority.ctaLabel}. Today’s priority: ${priority.title}`}
      >
        <Text style={styles.primaryButtonText}>{priority.ctaLabel}</Text>
        <Text style={styles.primaryButtonArrow} accessibilityElementsHidden>→</Text>
      </Pressable>

      <View style={styles.heroLinks}>
        <Pressable
          onPress={() => setDisclosure(disclosure === 'why' ? null : 'why')}
          accessibilityRole="button"
          accessibilityLabel="Why this priority"
          accessibilityState={{ expanded: disclosure === 'why' }}
        >
          <Text style={styles.heroLink}>Why this?</Text>
        </Pressable>
        <Pressable
          onPress={() => setDisclosure(disclosure === 'evidence' ? null : 'evidence')}
          accessibilityRole="button"
          accessibilityLabel="Evidence for this priority"
          accessibilityState={{ expanded: disclosure === 'evidence' }}
        >
          <Text style={styles.heroLink}>Evidence</Text>
        </Pressable>
        {priority.canDecline ? (
          <Pressable
            onPress={onDecline}
            accessibilityRole="button"
            accessibilityLabel="This priority is not for me or I cannot do this"
          >
            <Text style={styles.heroLinkMuted}>Not for me / I can’t do this</Text>
          </Pressable>
        ) : null}
      </View>

      {disclosure ? (
        <View style={styles.disclosure} accessibilityLiveRegion="polite">
          <Text style={styles.disclosureLabel}>{disclosure === 'why' ? 'WHY THIS' : 'EVIDENCE'}</Text>
          <Text style={styles.disclosureText}>{disclosure === 'why' ? priority.whyThis : priority.evidence}</Text>
        </View>
      ) : null}
    </View>
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
        <Pressable
          onPress={onAsk}
          accessibilityRole="button"
          accessibilityLabel={`Ask AI Advisor about this health brief. ${brief.askContext}`}
          style={({ pressed }) => [styles.textRoute, pressed && styles.pressed]}
        >
          <Text style={styles.textRouteLabel}>Ask about this</Text>
          <Text style={styles.textRouteArrow}>→</Text>
        </Pressable>
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
}: {
  items: TodayProtocolItem[];
  onToggle: (item: TodayProtocolItem) => void;
  onOpenPlan: () => void;
}) {
  return (
    <View style={styles.sectionBlock} testID="today-protocol">
      <TodaySectionHeading eyebrow="Act" title="Today’s Protocol" detail="Your saved plan, ordered by time" />
      <View style={styles.listSurface}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No protocol is scheduled</Text>
            <Text style={styles.emptyBody}>Vitalspan has no medication, supplement, exercise, or habit action to show today.</Text>
            <Pressable onPress={onOpenPlan} accessibilityRole="button" accessibilityLabel="Open Plan to review protocol">
              <Text style={styles.emptyAction}>Review Plan →</Text>
            </Pressable>
          </View>
        ) : items.map((item, index) => (
          <View key={item.id} style={[styles.protocolRow, index > 0 && styles.dividedRow]}>
            <Pressable
              onPress={() => item.canToggle && onToggle(item)}
              disabled={!item.canToggle}
              style={[styles.completionControl, item.state === 'done' && styles.completionDone]}
              accessibilityRole={item.canToggle ? 'checkbox' : undefined}
              accessibilityState={item.canToggle ? { checked: item.state === 'done', disabled: false } : undefined}
              accessibilityLabel={`${item.title}, ${item.state === 'done' ? 'completed' : 'due'}`}
            >
              <Text style={styles.checkmark}>{item.state === 'done' ? '✓' : ''}</Text>
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
          <Pressable onPress={onOpenPlan} style={styles.textRoute} accessibilityRole="button" accessibilityLabel="Open full Plan">
            <Text style={styles.textRouteLabel}>Open full plan</Text>
            <Text style={styles.textRouteArrow}>→</Text>
          </Pressable>
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
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [styles.healthSurface, pressed && styles.pressed]}
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
          <Text style={styles.healthFooterLink}>Limitations →</Text>
        </View>
        <View style={styles.wearableNote}>
          <Text style={styles.wearableLabel}>{state.wearableStatus === 'connected' ? 'WEARABLE CONNECTED' : 'WEARABLE NOT CONNECTED'}</Text>
          <Text style={styles.wearableText}>{state.wearableSummary}</Text>
        </View>
      </Pressable>
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
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [styles.researchCard, pressed && styles.pressed]}
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
            <Text style={styles.researchCta}>Open issue →</Text>
          </View>
        </View>
      </Pressable>
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
  pressed: { opacity: 0.72 },
  sectionBlock: { marginTop: 42 },
  researchBlock: { marginTop: 48, marginBottom: 48 },
  sectionHeading: { marginBottom: Spacing.md },
  eyebrow: { color: Colors.dark.textMuted, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 1.8 },
  sectionTitle: { color: Colors.dark.text, fontSize: Typography.sizes.h2, lineHeight: Typography.lineHeights.h2, fontWeight: '500', marginTop: 5 },
  sectionDetail: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: 5 },
  safetyCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: Colors.dark.statusWarnBorder, borderRadius: Radius.card, padding: Spacing.base, marginBottom: Spacing.xl },
  safetyMarker: { width: 3, borderRadius: 2, backgroundColor: Colors.viz.amber },
  safetyEyebrow: { color: Colors.viz.amber, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 1.5 },
  safetyTitle: { color: Colors.dark.text, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: '600', marginTop: 5 },
  safetyBody: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: 6 },
  sourceText: { color: Colors.dark.textMuted, fontSize: Typography.sizes.captionSmall, marginTop: Spacing.sm },
  outlineButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.dark.statusWarnBorder, borderRadius: Radius.card, paddingHorizontal: Spacing.md, paddingVertical: 9, marginTop: Spacing.md },
  outlineButtonText: { color: Colors.viz.amber, fontWeight: '600', fontSize: Typography.sizes.bodySmall },
  priorityHero: { backgroundColor: Colors.dark.bgElevated, borderRadius: Radius.card, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.borderStrong, padding: Spacing.xl },
  priorityHeroCompact: { padding: Spacing.base },
  priorityEyebrow: { color: Colors.viz.bioGreen, fontSize: Typography.sizes.captionSmall, fontWeight: '700', letterSpacing: 2 },
  priorityTitle: { color: Colors.dark.text, fontSize: Typography.sizes.display3, lineHeight: Typography.lineHeights.display3, letterSpacing: -0.7, fontWeight: '400', marginTop: Spacing.md },
  priorityTitleCompact: { fontSize: Typography.sizes.h1, lineHeight: Typography.lineHeights.h1 },
  priorityReason: { color: Colors.dark.textMuted, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body, marginTop: Spacing.md },
  provenancePanel: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.border, paddingVertical: Spacing.sm, marginTop: Spacing.lg },
  provenanceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, paddingVertical: 6 },
  provenanceLabel: { width: 76, color: Colors.dark.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, paddingTop: 2 },
  provenanceValue: { flex: 1, color: Colors.dark.text, fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption },
  primaryButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.dark.ctaPrimary, borderRadius: Radius.card, paddingHorizontal: Spacing.base, paddingVertical: 15, marginTop: Spacing.lg, minHeight: 52 },
  primaryButtonPressed: { backgroundColor: '#3FC26F' },
  primaryButtonText: { color: '#07120B', fontSize: Typography.sizes.body, fontWeight: '700' },
  primaryButtonArrow: { color: '#07120B', fontSize: 18 },
  heroLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.base, marginTop: Spacing.base },
  heroLink: { color: Colors.dark.text, fontSize: Typography.sizes.bodySmall, textDecorationLine: 'underline' },
  heroLinkMuted: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall },
  disclosure: { backgroundColor: Colors.dark.cardBg, borderRadius: Radius.card, padding: Spacing.md, marginTop: Spacing.md },
  disclosureLabel: { color: Colors.viz.bioGreen, fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  disclosureText: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: 5 },
  briefSurface: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.border },
  briefRow: { paddingVertical: Spacing.base },
  dividedRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.dark.border },
  briefLabel: { color: Colors.dark.textMuted, fontSize: Typography.sizes.caption, fontWeight: '600', marginBottom: 5 },
  briefLabelEmphasis: { color: Colors.viz.bioGreen },
  briefValue: { color: Colors.dark.text, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body },
  briefValueEmphasis: { fontSize: Typography.sizes.lg, lineHeight: 24, fontWeight: '500' },
  textRoute: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md },
  textRouteLabel: { color: Colors.dark.text, fontSize: Typography.sizes.bodySmall, fontWeight: '600' },
  textRouteArrow: { color: Colors.dark.textMuted, fontSize: 17 },
  listSurface: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.border },
  emptyState: { paddingVertical: Spacing.xl },
  emptyTitle: { color: Colors.dark.text, fontSize: Typography.sizes.lg, fontWeight: '500' },
  emptyBody: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: 6, maxWidth: 500 },
  emptyAction: { color: Colors.viz.bioGreen, fontSize: Typography.sizes.bodySmall, fontWeight: '600', marginTop: Spacing.md },
  protocolRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', minHeight: 86, paddingVertical: Spacing.md, gap: Spacing.md },
  completionControl: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: Colors.dark.borderStrong, alignItems: 'center', justifyContent: 'center' },
  completionDone: { borderColor: Colors.viz.bioGreen, backgroundColor: Colors.dark.accentBg },
  checkmark: { color: Colors.viz.bioGreen, fontWeight: '700' },
  protocolCopy: { flex: 1 },
  protocolTopline: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  kindBadge: { color: Colors.dark.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  protocolTime: { color: Colors.dark.textMuted, fontSize: Typography.sizes.captionSmall },
  protocolTitle: { color: Colors.dark.text, fontSize: Typography.sizes.body, fontWeight: '500' },
  protocolDetail: { color: Colors.dark.textMuted, fontSize: Typography.sizes.caption, marginTop: 3 },
  protocolWarning: { color: Colors.viz.amber, fontSize: Typography.sizes.captionSmall, marginTop: 5 },
  completedText: { color: Colors.dark.textMuted, textDecorationLine: 'line-through' },
  protocolState: { color: Colors.dark.textMuted, fontSize: Typography.sizes.captionSmall, maxWidth: 56, textAlign: 'right' },
  healthSurface: { backgroundColor: Colors.dark.cardBg, borderRadius: Radius.card, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.border, padding: Spacing.base },
  healthAgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.base },
  healthLabel: { color: Colors.dark.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1.25 },
  healthAge: { color: Colors.dark.text, fontSize: Typography.sizes.display2, lineHeight: Typography.lineHeights.display2, fontWeight: '300', marginTop: 4 },
  healthMetaColumn: { alignItems: 'flex-end' },
  healthMetaLabel: { color: Colors.dark.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1, marginTop: 3 },
  healthMetaValue: { color: Colors.dark.text, fontSize: Typography.sizes.bodySmall, marginTop: 2, marginBottom: 5 },
  healthUnavailable: { color: Colors.dark.text, fontSize: Typography.sizes.h3, lineHeight: Typography.lineHeights.h3, fontWeight: '500', marginTop: Spacing.sm },
  healthSummary: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.sm },
  completenessTrack: { height: 3, backgroundColor: Colors.dark.border, marginTop: Spacing.lg, overflow: 'hidden' },
  completenessFill: { height: 3, backgroundColor: Colors.viz.bioGreen },
  healthFooter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.sm, marginTop: Spacing.md },
  healthFooterText: { color: Colors.dark.textMuted, fontSize: Typography.sizes.captionSmall },
  healthFooterLink: { color: Colors.dark.text, fontSize: Typography.sizes.captionSmall, fontWeight: '600' },
  wearableNote: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.dark.border, marginTop: Spacing.md, paddingTop: Spacing.md },
  wearableLabel: { color: Colors.dark.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  wearableText: { color: Colors.dark.textMuted, fontSize: Typography.sizes.caption, lineHeight: Typography.lineHeights.caption, marginTop: 4 },
  signalRow: { paddingVertical: Spacing.base },
  signalKind: { color: Colors.dark.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1.15 },
  signalTitle: { color: Colors.dark.text, fontSize: Typography.sizes.body, lineHeight: Typography.lineHeights.body, fontWeight: '500', marginTop: 5 },
  signalDetail: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall, marginTop: 4 },
  signalMeta: { color: Colors.dark.textMuted, fontSize: Typography.sizes.captionSmall, marginTop: Spacing.sm },
  researchCard: { borderRadius: Radius.card, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.dark.border, backgroundColor: Colors.dark.cardBg },
  researchImage: { minHeight: 180 },
  researchImageCorners: { borderTopLeftRadius: Radius.card, borderTopRightRadius: Radius.card },
  researchScrim: { flex: 1, justifyContent: 'space-between', padding: Spacing.base },
  researchIssue: { color: 'rgba(255,255,255,0.72)', fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  researchTitle: { color: '#FFFFFF', fontFamily: Typography.displaySerif, fontSize: Typography.sizes.xl, lineHeight: 27 },
  researchCopy: { padding: Spacing.base },
  researchRelevance: { color: Colors.dark.textMuted, fontSize: Typography.sizes.bodySmall, lineHeight: Typography.lineHeights.bodySmall },
  researchMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  researchMeta: { color: Colors.dark.textMuted, fontSize: Typography.sizes.captionSmall },
  researchCta: { color: Colors.dark.text, fontSize: Typography.sizes.captionSmall, fontWeight: '600' },
  skeleton: { padding: Spacing.lg, gap: Spacing.xl },
  skeletonHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  skeletonGap: { gap: Spacing.sm },
});
