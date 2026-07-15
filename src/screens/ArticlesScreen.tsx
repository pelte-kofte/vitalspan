import React from 'react';
import {
  RefreshControl,
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
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import {
  ArchiveIntroduction,
  BriefArticleCard,
  IssueHeroCard,
  MagazineMasthead,
  PAST_ISSUE_GAP,
  PAST_ISSUE_WIDTH,
  PastIssueRow,
  PharmacistNoteCard,
  SectionHeading,
} from '../components/IssueCard';
import { SkeletonLoader } from '../components/ArticleSkeletonLoader';
import { useIssue } from '../hooks/useIssue';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Spacing, Typography } from '../theme';
import { EditorialColors, EditorialLayout } from '../theme/editorial';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'Articles'>;

export default function ArticlesScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const issueNumber = route.params?.issueNumber;
  const isArchiveView = issueNumber === 0;
  const { issue, pastIssues, loading, refreshing, onRefresh } = useIssue(issueNumber);
  const reduceMotion = useReducedMotion();
  const archiveScrollX = useSharedValue(0);

  const archiveScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      archiveScrollX.value = event.contentOffset.x;
    },
  });

  const openArticle = (pmid: string) => nav.navigate('ArticleDetail', { pmid });
  const openIssue = (n: number) => nav.push('Articles', { issueNumber: n });

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={EditorialColors.ink} />

      <View style={s.topBar}>
        <TouchableOpacity
          style={s.navButton}
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
          accessibilityShowsLargeContentViewer
          accessibilityLargeContentTitle="Back"
        >
          <Text style={s.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={s.topBarLabel}>WEEKLY EDITION</Text>
        <View style={s.navButton} accessibilityElementsHidden />
      </View>

      {loading && !issue ? (
        <SkeletonLoader />
      ) : !issue ? (
        <View style={s.center}>
          <Text style={s.emptyEyebrow}>THE VITALSPAN BRIEF</Text>
          <Text style={s.emptyTitle} accessibilityRole="header">The next issue is being edited.</Text>
          <Text style={s.emptySub}>Evidence-led longevity reporting returns here each week.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={EditorialColors.copper} />
          }
        >
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(420)}>
            <MagazineMasthead
              issueNumber={issue.issueNumber}
              publishDate={issue.publishDate}
              isArchive={isArchiveView}
            />
          </Animated.View>

          {isArchiveView ? (
            <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(520).delay(80)}>
              <ArchiveIntroduction />
            </Animated.View>
          ) : issue.coverArticle ? (
            <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(720).delay(100)}>
              <IssueHeroCard
                issueNumber={issue.issueNumber}
                publishDate={issue.publishDate}
                article={issue.coverArticle}
                onPress={() => openArticle(issue.coverArticle!.pmid)}
              />
            </Animated.View>
          ) : null}

          {issue.briefArticles.length > 0 ? (
            <Animated.View
              style={s.section}
              entering={reduceMotion ? undefined : FadeInUp.duration(480).delay(isArchiveView ? 100 : 220)}
            >
              <SectionHeading
                eyebrow={isArchiveView ? 'Index' : 'Inside this issue'}
                title={isArchiveView ? 'From the archive' : 'This Week'}
                description={isArchiveView ? 'A chronological reading room of previously published research.' : 'Four studies selected for relevance, evidence, and what they add to the conversation.'}
              />
              <View style={s.articleList}>
                {issue.briefArticles.map((article, index) => (
                  <Animated.View
                    key={article.pmid}
                    entering={reduceMotion ? undefined : FadeInUp.duration(360).delay(260 + index * 55)}
                  >
                    <BriefArticleCard article={article} index={index} onPress={() => openArticle(article.pmid)} />
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          ) : null}

          {issue.pharmacistNote ? (
            <Animated.View
              style={s.section}
              entering={reduceMotion ? undefined : FadeInUp.duration(500).delay(320)}
            >
              <SectionHeading eyebrow="From the editor" title="Editor's Perspective" />
              <PharmacistNoteCard note={issue.pharmacistNote} />
            </Animated.View>
          ) : null}

          {pastIssues.length > 0 ? (
            <Animated.View
              style={s.section}
              entering={reduceMotion ? undefined : FadeInUp.duration(500).delay(380)}
            >
              <SectionHeading
                eyebrow="The collection"
                title="Past Issues"
                description="Return to earlier editions of The Vitalspan Brief."
              />
              <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.pastIssuesContent}
                onScroll={archiveScrollHandler}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={PAST_ISSUE_WIDTH + PAST_ISSUE_GAP}
                snapToAlignment="start"
                disableIntervalMomentum
                accessibilityRole="list"
              >
                {pastIssues.map((pastIssue, index) => (
                  <PastIssueRow
                    key={pastIssue.issueNumber}
                    issue={pastIssue}
                    index={index}
                    scrollX={archiveScrollX}
                    reduceMotion={reduceMotion}
                    onPress={() => openIssue(pastIssue.issueNumber)}
                  />
                ))}
              </Animated.ScrollView>
            </Animated.View>
          ) : null}

          <View style={s.colophon}>
            <View style={s.colophonRule} />
            <Text style={s.colophonMark}>V</Text>
            <Text style={s.colophonText}>CURATED SCIENCE · HUMAN EDITED</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
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
  },
  navButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  backChevron: { color: EditorialColors.textSecondary, fontSize: 37, fontWeight: '200', lineHeight: 40 },
  topBarLabel: { color: EditorialColors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1.8 },
  scrollContent: { paddingTop: 6, paddingBottom: 48, gap: 36 },
  section: { gap: 18 },
  articleList: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: EditorialColors.rule },
  pastIssuesContent: { paddingHorizontal: EditorialLayout.pageInset, paddingBottom: 12, gap: PAST_ISSUE_GAP },
  colophon: { alignItems: 'center', marginHorizontal: EditorialLayout.pageInset, gap: Spacing.sm, paddingTop: 8 },
  colophonRule: { width: '100%', height: StyleSheet.hairlineWidth, backgroundColor: EditorialColors.rule },
  colophonMark: { color: EditorialColors.copper, fontFamily: Typography.displaySerif, fontSize: 22, marginTop: 10 },
  colophonText: { color: EditorialColors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1.7 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36, gap: 10 },
  emptyEyebrow: { color: EditorialColors.copper, fontSize: 9, fontWeight: '700', letterSpacing: 1.8 },
  emptyTitle: { color: EditorialColors.text, fontFamily: Typography.displaySerif, fontSize: 31, lineHeight: 38, textAlign: 'center' },
  emptySub: { color: EditorialColors.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 320 },
});
