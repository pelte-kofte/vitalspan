import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { Article } from '../lib/articleService';
import { Issue } from '../lib/issueService';
import {
  articleCategory,
  articleDeck,
  formatIssueDate,
  formatStudyType,
  readingTime,
} from '../lib/articleUtils';
import { Spacing, Typography } from '../theme';
import { EditorialColors, EditorialLayout } from '../theme/editorial';

const COVER_ART = require('../../assets/brief-cover-editorial.jpg');
export const PAST_ISSUE_WIDTH = 174;
export const PAST_ISSUE_GAP = 14;

export function MagazineMasthead({
  issueNumber,
  publishDate,
  isArchive = false,
}: {
  issueNumber: number;
  publishDate: string;
  isArchive?: boolean;
}) {
  return (
    <View style={s.mastheadWrap} accessibilityRole="header">
      <View style={s.mastheadRule} />
      <Text style={s.mastheadKicker}>SCIENCE FOR A LONGER LIFE</Text>
      <Text style={s.mastheadName}>THE VITALSPAN BRIEF</Text>
      <View style={s.mastheadMetaRow}>
        <Text style={s.mastheadMeta}>{isArchive ? 'THE ARCHIVE' : `ISSUE NO. ${issueNumber}`}</Text>
        <View style={s.mastheadDot} />
        <Text style={s.mastheadMeta}>{isArchive ? 'THE COMPLETE INDEX' : formatIssueDate(publishDate).toUpperCase()}</Text>
      </View>
      <View style={s.mastheadRule} />
    </View>
  );
}

export function IssueHeroCard({
  issueNumber,
  article,
  onPress,
}: {
  issueNumber: number;
  publishDate: string;
  article: Article;
  onPress: () => void;
}) {
  const copyLength = [article.abstract, article.limitations].filter(Boolean).join(' ');
  const category = articleCategory(article.topics, article.study_type);
  const evidence = article.evidence_label?.trim() || 'Evidence review';

  return (
    <Pressable
      style={({ pressed }) => [s.heroPressable, pressed && s.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Issue ${issueNumber} cover story. ${article.title}. ${category}. ${evidence}.`}
      accessibilityHint="Opens the cover story"
      accessibilityShowsLargeContentViewer
      accessibilityLargeContentTitle={article.title}
    >
      <ImageBackground source={COVER_ART} style={s.heroImage} imageStyle={s.heroImageCorners} resizeMode="cover">
        <LinearGradient
          colors={['rgba(5,6,5,0.03)', 'rgba(5,6,5,0.3)', EditorialColors.imageScrim, '#080908']}
          locations={[0, 0.42, 0.73, 1]}
          style={s.heroGradient}
        >
          <View style={s.heroTopline}>
            <Text style={s.heroCategory}>{category.toUpperCase()}</Text>
            <Text style={s.heroIssue}>COVER STORY</Text>
          </View>
          <View style={s.heroCopy}>
            <Text style={s.heroTitle}>{article.title}</Text>
            <View style={s.heroMetaRow}>
              <Text style={s.heroMeta}>{readingTime(copyLength)}</Text>
              <View style={s.metaDot} />
              <Text style={s.heroMeta}>{evidence}</Text>
            </View>
            <View style={s.heroCta}>
              <Text style={s.heroCtaText}>Read Cover Story</Text>
              <Text style={s.heroCtaArrow}>→</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <View style={s.sectionHeading}>
      <Text style={s.sectionEyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={s.sectionTitle} accessibilityRole="header">{title}</Text>
      {description ? <Text style={s.sectionDescription}>{description}</Text> : null}
    </View>
  );
}

export function BriefArticleCard({
  article,
  onPress,
  index,
}: {
  article: Article;
  onPress: () => void;
  index?: number;
}) {
  const deck = articleDeck(article.abstract);
  const evidence = article.evidence_label?.trim() || 'Evidence review';
  const duration = readingTime([article.abstract, article.limitations].filter(Boolean).join(' '));
  const label = [
    article.title,
    deck,
    article.journal,
    formatStudyType(article.study_type),
    evidence,
    article.pub_date,
    duration,
  ].filter(Boolean).join('. ');

  return (
    <Pressable
      style={({ pressed }) => [s.articleRow, pressed && s.rowPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens the article"
      accessibilityShowsLargeContentViewer
      accessibilityLargeContentTitle={article.title}
    >
      <Text style={s.articleNumber} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {index != null ? String(index + 1).padStart(2, '0') : '•'}
      </Text>
      <View style={s.articleCopy}>
        <Text style={s.articleTitle}>{article.title}</Text>
        {deck ? <Text style={s.articleDeck}>{deck}</Text> : null}
        <Text style={s.articleJournal}>{article.journal}</Text>
        <View style={s.articleMetaWrap}>
          <Text style={s.articleMeta}>{formatStudyType(article.study_type)}</Text>
          <Text style={s.articleMetaSeparator}>/</Text>
          <Text style={s.articleMeta}>{evidence}</Text>
          <Text style={s.articleMetaSeparator}>/</Text>
          <Text style={s.articleMeta}>{article.pub_date}</Text>
          <Text style={s.articleMetaSeparator}>/</Text>
          <Text style={s.articleMeta}>{duration}</Text>
        </View>
      </View>
      <Text style={s.articleChevron} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">›</Text>
    </Pressable>
  );
}

export function PharmacistNoteCard({ note }: { note: string }) {
  const paragraphs = note.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return (
    <View style={s.letter}>
      <View style={s.letterHeader}>
        <View style={s.avatar} accessibilityLabel="Editor portrait placeholder">
          <Text style={s.avatarInitials}>BK</Text>
        </View>
        <View style={s.letterBylineWrap}>
          <Text style={s.letterLabel}>EDITOR'S PERSPECTIVE</Text>
          <Text style={s.letterByline}>Bekir Cem Kusdemir, PharmD</Text>
        </View>
      </View>
      <View style={s.letterRule} />
      <View style={s.letterMeasure}>
        {paragraphs.map((paragraph, index) => (
          <Text key={`${paragraph.slice(0, 16)}-${index}`} style={[s.letterBody, index === 0 && s.dropCapSpace]}>
            {paragraph}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function ArchiveIntroduction() {
  return (
    <View style={s.archiveIntro}>
      <Text style={s.archiveOverline}>THE COMPLETE INDEX</Text>
      <Text style={s.archiveTitle} accessibilityRole="header">Every study, in context.</Text>
      <Text style={s.archiveDeck}>
        Earlier research selected by Vitalspan, presented as an enduring reference rather than an endless feed.
      </Text>
    </View>
  );
}

export function PastIssueRow({
  issue,
  onPress,
  index = 0,
  scrollX,
  reduceMotion = false,
}: {
  issue: Issue;
  onPress: () => void;
  index?: number;
  scrollX?: SharedValue<number>;
  reduceMotion?: boolean;
}) {
  const isArchive = issue.issueNumber === 0;
  const parallaxStyle = useAnimatedStyle(() => {
    if (reduceMotion || !scrollX) return { transform: [{ translateY: 0 }, { scale: 1 }] };
    const position = index * (PAST_ISSUE_WIDTH + PAST_ISSUE_GAP);
    return {
      transform: [
        {
          translateY: interpolate(
            scrollX.value,
            [position - PAST_ISSUE_WIDTH, position, position + PAST_ISSUE_WIDTH],
            [8, 0, 8],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            scrollX.value,
            [position - PAST_ISSUE_WIDTH, position, position + PAST_ISSUE_WIDTH],
            [0.97, 1, 0.97],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  }, [index, reduceMotion]);

  const title = isArchive ? 'The Archive' : `Issue ${issue.issueNumber}`;
  const date = isArchive ? 'Before The Brief' : formatIssueDate(issue.publishDate);

  return (
    <Animated.View style={[s.pastIssueWrap, parallaxStyle]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [s.pastIssuePressable, pressed && s.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${date}`}
        accessibilityHint="Opens this issue"
        accessibilityShowsLargeContentViewer
        accessibilityLargeContentTitle={`${title} — ${date}`}
      >
        <ImageBackground source={COVER_ART} style={s.pastIssueImage} imageStyle={s.pastIssueCorners} resizeMode="cover">
          <View style={s.pastIssueScrim}>
            <Text style={s.pastIssueBrand}>VITALSPAN</Text>
            <View>
              <Text style={s.pastIssueTitle}>{title}</Text>
              <Text style={s.pastIssueDate}>{date}</Text>
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  mastheadWrap: {
    marginHorizontal: EditorialLayout.pageInset,
    alignItems: 'center',
    gap: 7,
  },
  mastheadRule: { width: '100%', height: StyleSheet.hairlineWidth, backgroundColor: EditorialColors.ruleStrong },
  mastheadKicker: { color: EditorialColors.copper, fontSize: 9, fontWeight: '700', letterSpacing: 2.2 },
  mastheadName: {
    color: EditorialColors.paper,
    fontFamily: Typography.displaySerif,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 1.1,
    textAlign: 'center',
  },
  mastheadMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  mastheadMeta: { color: EditorialColors.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 1.35 },
  mastheadDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: EditorialColors.copperMuted },
  heroPressable: { marginHorizontal: 12, borderRadius: EditorialLayout.heroRadius, overflow: 'hidden' },
  pressed: { opacity: 0.9 },
  heroImage: { minHeight: 548, justifyContent: 'flex-end' },
  heroImageCorners: { borderRadius: EditorialLayout.heroRadius },
  heroGradient: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 22, paddingBottom: 24 },
  heroTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  heroCategory: { flex: 1, color: EditorialColors.paper, fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  heroIssue: { color: EditorialColors.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  heroCopy: { gap: 15 },
  heroTitle: {
    color: EditorialColors.paper,
    fontFamily: Typography.displaySerif,
    fontSize: 38,
    lineHeight: 43,
    letterSpacing: -0.6,
  },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 9 },
  heroMeta: { color: EditorialColors.textSecondary, fontSize: 11, lineHeight: 16, letterSpacing: 0.3 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: EditorialColors.copper },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: EditorialColors.paper,
    paddingVertical: 11,
  },
  heroCtaText: { color: EditorialColors.paper, fontSize: 12, fontWeight: '700', letterSpacing: 0.45 },
  heroCtaArrow: { color: EditorialColors.paper, fontSize: 18, lineHeight: 20 },
  sectionHeading: { marginHorizontal: EditorialLayout.pageInset, gap: 6 },
  sectionEyebrow: { color: EditorialColors.copper, fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  sectionTitle: { color: EditorialColors.text, fontFamily: Typography.displaySerif, fontSize: 31, lineHeight: 38 },
  sectionDescription: { color: EditorialColors.textMuted, fontSize: 13, lineHeight: 19, maxWidth: 500 },
  articleRow: {
    marginHorizontal: EditorialLayout.pageInset,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: EditorialColors.rule,
  },
  rowPressed: { backgroundColor: 'rgba(241,237,227,0.035)' },
  articleNumber: { width: 30, paddingTop: 3, color: EditorialColors.copper, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  articleCopy: { flex: 1, gap: 8 },
  articleTitle: { color: EditorialColors.text, fontFamily: Typography.displaySerif, fontSize: 23, lineHeight: 29, letterSpacing: -0.25 },
  articleDeck: { color: EditorialColors.textSecondary, fontSize: 14, lineHeight: 21 },
  articleJournal: { color: EditorialColors.text, fontSize: 11, lineHeight: 16, fontWeight: '600' },
  articleMetaWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 7, rowGap: 4 },
  articleMeta: { color: EditorialColors.textMuted, fontSize: 10, lineHeight: 15, letterSpacing: 0.15 },
  articleMetaSeparator: { color: EditorialColors.copperMuted, fontSize: 10 },
  articleChevron: { color: EditorialColors.textMuted, fontSize: 29, lineHeight: 32, paddingLeft: 12, paddingTop: 28 },
  letter: {
    marginHorizontal: EditorialLayout.pageInset,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: EditorialColors.ruleStrong,
    paddingVertical: 24,
    gap: 22,
  },
  letterHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: EditorialColors.burgundy },
  avatarInitials: { color: EditorialColors.paper, fontFamily: Typography.displaySerif, fontSize: 16, letterSpacing: 0.6 },
  letterBylineWrap: { flex: 1, gap: 3 },
  letterLabel: { color: EditorialColors.copper, fontSize: 9, fontWeight: '700', letterSpacing: 1.7 },
  letterByline: { color: EditorialColors.textSecondary, fontSize: 12, lineHeight: 17 },
  letterRule: { width: 42, height: 2, backgroundColor: EditorialColors.copper },
  letterMeasure: { maxWidth: 620, gap: 17 },
  letterBody: { color: EditorialColors.text, fontFamily: Typography.displaySerif, fontSize: 18, lineHeight: 29 },
  dropCapSpace: { marginTop: -2 },
  archiveIntro: { marginHorizontal: EditorialLayout.pageInset, maxWidth: EditorialLayout.readingMeasure, paddingVertical: 34, gap: 10 },
  archiveOverline: { color: EditorialColors.copper, fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  archiveTitle: { color: EditorialColors.text, fontFamily: Typography.displaySerif, fontSize: 39, lineHeight: 45, letterSpacing: -0.5 },
  archiveDeck: { color: EditorialColors.textSecondary, fontSize: 15, lineHeight: 23, maxWidth: 500 },
  pastIssueWrap: { width: PAST_ISSUE_WIDTH },
  pastIssuePressable: { width: PAST_ISSUE_WIDTH, borderRadius: 15, overflow: 'hidden' },
  pastIssueImage: { width: PAST_ISSUE_WIDTH, height: 238 },
  pastIssueCorners: { borderRadius: 15 },
  pastIssueScrim: { flex: 1, justifyContent: 'space-between', padding: 14, backgroundColor: 'rgba(7,8,7,0.38)' },
  pastIssueBrand: { color: EditorialColors.paper, fontSize: 8, fontWeight: '700', letterSpacing: 1.8 },
  pastIssueTitle: { color: EditorialColors.paper, fontFamily: Typography.displaySerif, fontSize: 22, lineHeight: 27 },
  pastIssueDate: { color: EditorialColors.textSecondary, fontSize: 10, lineHeight: 15, marginTop: Spacing.xs },
});
