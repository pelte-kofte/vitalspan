import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { useReducedMotion } from '../hooks/useReducedMotion';
import { Article } from '../lib/articleService';
import {
  articleCategory,
  formatStudyType,
  readingTime,
  splitEditorialArticle,
} from '../lib/articleUtils';
import { loadArticleByPmid } from '../lib/issueService';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Typography } from '../theme';
import { EditorialColors, EditorialLayout } from '../theme/editorial';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ArticleDetail'>;

function Prose({ children }: { children: string }) {
  const paragraphs = children.split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean);
  return (
    <View style={s.proseGroup}>
      {paragraphs.map((paragraph, index) => (
        <Text key={`${paragraph.slice(0, 18)}-${index}`} style={s.prose}>{paragraph}</Text>
      ))}
    </View>
  );
}

function ArticleSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.articleSection}>
      <View style={s.sectionLabelRow}>
        <Text style={s.sectionNumber}>{number}</Text>
        <Text style={s.sectionTitle} accessibilityRole="header">{title}</Text>
      </View>
      <View style={s.sectionBody}>{children}</View>
    </View>
  );
}

export default function ArticleDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { pmid } = route.params;
  const reduceMotion = useReducedMotion();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadArticleByPmid(pmid)
      .then((value) => { if (!cancelled) setArticle(value); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pmid]);

  const openSource = () => {
    const source = article?.source_url?.trim() || `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
    WebBrowser.openBrowserAsync(source).catch(() => null);
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={EditorialColors.ink} />
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.navButton}
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the issue"
          accessibilityShowsLargeContentViewer
          accessibilityLargeContentTitle="Back to issue"
        >
          <Text style={s.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={s.topBarTitle}>THE VITALSPAN BRIEF</Text>
        <View style={s.navButton} accessibilityElementsHidden />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={EditorialColors.copper} />
        </View>
      ) : !article ? (
        <View style={s.center}>
          <Text style={s.missingEyebrow}>THE ARCHIVE</Text>
          <Text style={s.emptyTitle} accessibilityRole="header">This article is no longer available.</Text>
        </View>
      ) : (
        <EditorialArticle article={article} reduceMotion={reduceMotion} onOpenSource={openSource} />
      )}
    </SafeAreaView>
  );
}

function EditorialArticle({
  article,
  reduceMotion,
  onOpenSource,
}: {
  article: Article;
  reduceMotion: boolean;
  onOpenSource: () => void;
}) {
  const copy = splitEditorialArticle(article.abstract);
  const evidence = article.evidence_label?.trim() || 'Evidence review';
  const category = articleCategory(article.topics, article.study_type);
  const fullCopy = [copy.summary, copy.whyItMatters, article.limitations].filter(Boolean).join(' ');
  const whyItMatters = copy.whyItMatters || copy.summary;

  return (
    <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View style={s.measure} entering={reduceMotion ? undefined : FadeIn.duration(650)}>
        <View style={s.storyHeader}>
          <Text style={s.eyebrow}>{category.toUpperCase()}</Text>
          <Text style={s.title} accessibilityRole="header">{article.title}</Text>
          <Text style={s.standfirst}>
            {article.journal} · {article.pub_date}
          </Text>
          <View style={s.storyMeta}>
            {article.issue_number != null ? <Text style={s.storyMetaText}>Issue {article.issue_number}</Text> : null}
            <Text style={s.storyMetaText}>{readingTime(fullCopy)}</Text>
            <Text style={s.storyMetaText}>{evidence}</Text>
          </View>
        </View>

        <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(480).delay(120)}>
          <ArticleSection number="01" title="Why it matters">
            {whyItMatters ? <Text style={s.lead}>{whyItMatters}</Text> : <Text style={s.unavailable}>Editorial context is not available for this archive entry.</Text>}
          </ArticleSection>
        </Animated.View>

        <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(480).delay(180)}>
          <ArticleSection number="02" title="Key findings">
            {copy.summary ? <Prose>{copy.summary}</Prose> : <Text style={s.unavailable}>No edited summary is available.</Text>}
          </ArticleSection>
        </Animated.View>

        <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(480).delay(240)}>
          <ArticleSection number="03" title="Limitations">
            {article.limitations?.trim() ? <Prose>{article.limitations}</Prose> : <Text style={s.unavailable}>No limitations note was included with this archive entry.</Text>}
          </ArticleSection>
        </Animated.View>

        <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(480).delay(300)}>
          <ArticleSection number="04" title="Evidence">
            <View style={s.evidenceRows}>
              <View style={s.evidenceRow}>
                <Text style={s.evidenceKey}>Evidence level</Text>
                <Text style={s.evidenceValue}>{evidence}</Text>
              </View>
              <View style={s.evidenceRow}>
                <Text style={s.evidenceKey}>Study design</Text>
                <Text style={s.evidenceValue}>{formatStudyType(article.study_type)}</Text>
              </View>
              {article.topics?.length ? (
                <View style={s.evidenceRow}>
                  <Text style={s.evidenceKey}>Topics</Text>
                  <Text style={s.evidenceValue}>{article.topics.join(' · ')}</Text>
                </View>
              ) : null}
            </View>
          </ArticleSection>
        </Animated.View>

        <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(480).delay(360)}>
          <ArticleSection number="05" title="Source">
            <View style={s.sourceCitation}>
              <Text style={s.sourceJournal}>{article.journal}</Text>
              <Text style={s.sourceMeta}>Published {article.pub_date}</Text>
              <Text style={s.sourceMeta}>PMID {article.pmid}{article.doi ? ` · DOI ${article.doi}` : ''}</Text>
            </View>
            <TouchableOpacity
              style={s.sourceLink}
              onPress={onOpenSource}
              accessibilityRole="link"
              accessibilityLabel={`Open source article for PMID ${article.pmid}`}
              accessibilityHint="Opens the source in a browser"
              accessibilityShowsLargeContentViewer
              accessibilityLargeContentTitle="Open source article"
            >
              <Text style={s.sourceLinkText}>Read the source</Text>
              <Text style={s.sourceLinkArrow}>↗</Text>
            </TouchableOpacity>
          </ArticleSection>
        </Animated.View>

        <View style={s.endMark} accessibilityLabel="End of article">
          <View style={s.endRule} />
          <Text style={s.endLetter}>V</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: EditorialColors.ink },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: EditorialColors.rule,
  },
  navButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  backChevron: { color: EditorialColors.textSecondary, fontSize: 37, fontWeight: '200', lineHeight: 40 },
  topBarTitle: { color: EditorialColors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1.65 },
  scrollContent: { paddingHorizontal: EditorialLayout.pageInset, paddingTop: 32, paddingBottom: 64, alignItems: 'center' },
  measure: { width: '100%', maxWidth: EditorialLayout.readingMeasure },
  storyHeader: { paddingBottom: 34, gap: 14 },
  eyebrow: { color: EditorialColors.copper, fontSize: 10, fontWeight: '700', letterSpacing: 1.9 },
  title: {
    color: EditorialColors.text,
    fontFamily: Typography.displaySerif,
    fontSize: 42,
    lineHeight: 49,
    letterSpacing: -0.7,
  },
  standfirst: { color: EditorialColors.textSecondary, fontFamily: Typography.displaySerif, fontSize: 17, lineHeight: 25 },
  storyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  storyMetaText: {
    color: EditorialColors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.35,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: EditorialColors.ruleStrong,
    paddingRight: 8,
  },
  articleSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: EditorialColors.ruleStrong,
    paddingTop: 25,
    paddingBottom: 38,
  },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 20 },
  sectionNumber: { color: EditorialColors.copper, fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  sectionTitle: { color: EditorialColors.text, fontFamily: Typography.displaySerif, fontSize: 28, lineHeight: 34 },
  sectionBody: { paddingLeft: 27 },
  proseGroup: { gap: 18 },
  prose: { color: EditorialColors.textSecondary, fontSize: 17, lineHeight: 29 },
  lead: { color: EditorialColors.text, fontFamily: Typography.displaySerif, fontSize: 21, lineHeight: 32 },
  unavailable: { color: EditorialColors.textMuted, fontSize: 15, lineHeight: 24, fontStyle: 'italic' },
  evidenceRows: { gap: 0 },
  evidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: EditorialColors.rule,
  },
  evidenceKey: { color: EditorialColors.textMuted, fontSize: 12, lineHeight: 18, flex: 0.42 },
  evidenceValue: { color: EditorialColors.text, fontSize: 13, lineHeight: 20, textAlign: 'right', flex: 0.58 },
  sourceCitation: { gap: 5, marginBottom: 22 },
  sourceJournal: { color: EditorialColors.text, fontFamily: Typography.displaySerif, fontSize: 19, lineHeight: 26 },
  sourceMeta: { color: EditorialColors.textMuted, fontSize: 11, lineHeight: 17 },
  sourceLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: EditorialColors.copper,
  },
  sourceLinkText: { color: EditorialColors.paper, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  sourceLinkArrow: { color: EditorialColors.copper, fontSize: 17 },
  endMark: { alignItems: 'center', gap: 14, marginTop: 6 },
  endRule: { width: 36, height: 2, backgroundColor: EditorialColors.copper },
  endLetter: { color: EditorialColors.textMuted, fontFamily: Typography.displaySerif, fontSize: 22 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34, gap: 10 },
  missingEyebrow: { color: EditorialColors.copper, fontSize: 9, fontWeight: '700', letterSpacing: 1.7 },
  emptyTitle: { color: EditorialColors.text, fontFamily: Typography.displaySerif, fontSize: 29, lineHeight: 36, textAlign: 'center' },
});
