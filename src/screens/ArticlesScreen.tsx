import React, { useMemo, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  StatusBar, TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';

import { Article } from '../lib/articleService';
import { BIOMARKER_TAG_META } from '../lib/articleUtils';
import { HeroArticleCard, StandardArticleCard } from '../components/ArticleCard';
import { SkeletonLoader } from '../components/ArticleSkeletonLoader';
import { useArticles } from '../hooks/useArticles';
import { BIOMARKERS } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing, Radius, Typography } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// --- FilterPills ---

function FilterPills({ tags, active, onSelect }: {
  tags: string[];
  active: string;
  onSelect: (tag: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
      {(['all', ...tags] as string[]).map((tag) => {
        const isSelected = active === tag;
        const meta = BIOMARKER_TAG_META[tag];
        const activeColor = meta?.color ?? Colors.dark.ctaPrimary;
        return (
          <TouchableOpacity
            key={tag}
            style={[s.filterPill, isSelected && { backgroundColor: activeColor, borderColor: activeColor }]}
            onPress={() => onSelect(tag)}
          >
            <Text style={[s.filterPillText, isSelected && { color: Colors.dark.text }]}>
              {tag === 'all' ? 'All' : (meta?.label ?? tag)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// --- ArticlesScreen ---

export default function ArticlesScreen() {
  const nav = useNavigation<Nav>();
  const { articles, loading, refreshing, entries, onRefresh } = useArticles();
  const [activeFilter, setActiveFilter] = useState('all');

  const outOfRangeSet = useMemo<Set<string>>(() => {
    const latest = new Map<string, { value: number; date: string; unit: string }>();
    for (const e of entries) {
      const prev = latest.get(e.biomarkerId);
      if (!prev || e.date > prev.date) latest.set(e.biomarkerId, e);
    }
    const set = new Set<string>();
    for (const bm of BIOMARKERS) {
      const entry = latest.get(bm.id);
      if (entry && (entry.value < bm.optMin || entry.value > bm.optMax)) set.add(bm.id);
    }
    return set;
  }, [entries]);

  const availableTags = useMemo(() => {
    const seen = new Set<string>();
    for (const a of articles) for (const t of a.biomarker_tags) seen.add(t);
    return [...seen].filter((t) => t in BIOMARKER_TAG_META);
  }, [articles]);

  const filteredArticles = useMemo(
    () => activeFilter === 'all' ? articles : articles.filter((a) => a.biomarker_tags.includes(activeFilter)),
    [articles, activeFilter],
  );

  const handlePress = (article: Article) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    WebBrowser.openBrowserAsync(`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`).catch(() => null);
  };

  const renderItem = ({ item, index }: { item: Article; index: number }) => {
    const isPersonalized = item.biomarker_tags.some((t) => outOfRangeSet.has(t));
    if (index === 0) {
      return <HeroArticleCard article={item} isPersonalized={isPersonalized} onPress={() => handlePress(item)} />;
    }
    return <StandardArticleCard article={item} isPersonalized={isPersonalized} onPress={() => handlePress(item)} />;
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={s.backChevron}>←</Text>
        </TouchableOpacity>
        <View style={s.titleBlock}>
          <Text style={s.screenTitle}>RESEARCH</Text>
          <Text style={s.screenSubtitle}>Personalised for your biomarker profile</Text>
        </View>
        <View style={s.backBtn} />
      </View>

      {/* Filter pills — shown only once articles are loaded */}
      {articles.length > 0 && (
        <FilterPills tags={availableTags} active={activeFilter} onSelect={setActiveFilter} />
      )}

      {/* Content states */}
      {loading && articles.length === 0 ? (
        <SkeletonLoader />
      ) : articles.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyTitle}>No articles available.</Text>
          <Text style={s.emptySub}>Check your connection and pull to refresh.</Text>
        </View>
      ) : filteredArticles.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyTitle}>
            No articles for {BIOMARKER_TAG_META[activeFilter]?.label ?? activeFilter} yet
          </Text>
          <Text style={s.emptySub}>Pull to refresh for the latest research</Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.pmid}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          removeClippedSubviews
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.dark.ctaPrimary}
            />
          }
        />
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
  titleBlock: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    letterSpacing: Typography.letterSpacing.widest,
  },
  screenSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  pillRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  filterPillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  listContent: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: 10,
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
