import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';

import { Article } from '../lib/articleService';
import { loadArticleByPmid } from '../lib/issueService';
import { readingTime } from '../lib/articleUtils';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing, Radius, Typography } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ArticleDetail'>;

export default function ArticleDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { pmid } = route.params;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadArticleByPmid(pmid)
      .then((a) => { if (!cancelled) setArticle(a); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pmid]);

  const openSource = () => {
    WebBrowser.openBrowserAsync(`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`).catch(() => null);
  };

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
        <View style={s.backBtn} />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={Colors.dark.textMuted} />
        </View>
      ) : !article ? (
        <View style={s.center}>
          <Text style={s.emptyTitle}>This article isn't available anymore.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={s.measure}>
            <Text style={s.eyebrow}>{article.journal} · {article.pub_date}</Text>
            <Text style={s.title}>{article.title}</Text>
            {article.abstract != null && (
              <Text style={s.readingTime}>{readingTime(article.abstract)}</Text>
            )}
            {article.abstract != null && (
              <Text style={s.abstract}>{article.abstract}</Text>
            )}

            <View style={s.citationFooter}>
              <Text style={s.citationLabel}>SOURCE</Text>
              <TouchableOpacity onPress={openSource} accessibilityRole="button" accessibilityLabel={`Open PMID ${pmid} on PubMed`}>
                <Text style={s.citationPmid}>PMID {pmid} →</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  // ~70ch measure at body font size — capped container width, centered.
  measure: {
    width: '100%',
    maxWidth: 560,
  },
  eyebrow: {
    fontSize: Typography.sizes.caption,
    color: Colors.dark.textMuted,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.h1,
    lineHeight: Typography.lineHeights.h1 + 4,
    fontWeight: Typography.weights.title,
    color: Colors.dark.text,
  },
  readingTime: {
    fontSize: Typography.sizes.caption,
    color: Colors.dark.textMuted,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  abstract: {
    fontSize: Typography.sizes.md,
    lineHeight: 30,
    color: Colors.dark.text,
  },
  citationFooter: {
    marginTop: Spacing.xxl,
    paddingTop: Spacing.base,
    borderTopWidth: 0.5,
    borderTopColor: Colors.dark.cardBorder,
    gap: Spacing.xs,
  },
  citationLabel: {
    fontSize: Typography.sizes.captionSmall,
    fontWeight: '600',
    letterSpacing: Typography.letterSpacing.wide,
    color: Colors.dark.textMuted,
  },
  citationPmid: {
    fontSize: Typography.sizes.caption,
    fontWeight: '600',
    color: Colors.dark.ctaPrimary,
    backgroundColor: Colors.dark.cardBg,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  emptyTitle: {
    fontSize: Typography.sizes.body,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
