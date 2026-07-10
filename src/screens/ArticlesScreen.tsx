import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { IssueHeroCard, BriefArticleCard, PharmacistNoteCard, PastIssueRow } from '../components/IssueCard';
import { SkeletonLoader } from '../components/ArticleSkeletonLoader';
import { useIssue } from '../hooks/useIssue';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing, Typography } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'Articles'>;

export default function ArticlesScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const issueNumber = route.params?.issueNumber;
  const isArchiveView = issueNumber === 0;
  const { issue, pastIssues, loading, refreshing, onRefresh } = useIssue(issueNumber);

  const openArticle = (pmid: string) => nav.navigate('ArticleDetail', { pmid });
  const openIssue = (n: number) => nav.push('Articles', { issueNumber: n });

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" />

      <View style={s.topBar}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={s.backChevron}>←</Text>
        </TouchableOpacity>
        <Text style={s.screenTitle}>THE VITALSPAN BRIEF</Text>
        <View style={s.backBtn} />
      </View>

      {loading && !issue ? (
        <SkeletonLoader />
      ) : !issue ? (
        <View style={s.center}>
          <Text style={s.emptyTitle}>No issue published yet.</Text>
          <Text style={s.emptySub}>Check back soon for the first Brief.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.ctaPrimary} />
          }
        >
          {issue.coverArticle && (
            <IssueHeroCard
              issueNumber={issue.issueNumber}
              publishDate={issue.publishDate}
              article={issue.coverArticle}
              onPress={() => openArticle(issue.coverArticle!.pmid)}
            />
          )}

          {issue.briefArticles.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>
                {isArchiveView ? 'ARCHIVE' : 'THIS WEEK IN THE LITERATURE'}
              </Text>
              <View style={s.briefList}>
                {issue.briefArticles.map((a) => (
                  <BriefArticleCard key={a.pmid} article={a} onPress={() => openArticle(a.pmid)} />
                ))}
              </View>
            </View>
          )}

          {issue.pharmacistNote != null && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>PHARMACIST'S NOTE</Text>
              <PharmacistNoteCard note={issue.pharmacistNote} />
            </View>
          )}

          {pastIssues.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>PAST ISSUES</Text>
              <View style={s.briefList}>
                {pastIssues.map((p) => (
                  <PastIssueRow key={p.issueNumber} issue={p} onPress={() => openIssue(p.issueNumber)} />
                ))}
              </View>
            </View>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: Typography.sizes.lg,
    color: Colors.dark.textMuted,
  },
  screenTitle: {
    fontSize: Typography.sizes.captionSmall,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    letterSpacing: Typography.letterSpacing.widest,
  },
  scrollContent: {
    paddingTop: Spacing.base,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.sizes.captionSmall,
    fontWeight: '600',
    letterSpacing: Typography.letterSpacing.widest,
    textTransform: 'uppercase',
    color: Colors.dark.textMuted,
    marginHorizontal: Spacing.base,
  },
  briefList: {
    gap: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.body,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptySub: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
