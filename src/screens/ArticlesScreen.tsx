import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  StatusBar, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Article, loadCachedArticles, refreshArticlesIfStale, forceRefreshArticles } from '../lib/articleService';
import ArticleCard from '../components/ArticleCard';
import { BIOMARKERS } from '../data/biomarkers';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing, Typography } from '../theme';

interface StoredEntry { biomarkerId: string; value: number; date: string; unit: string }

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ArticlesScreen() {
  const nav = useNavigation<Nav>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [entries, setEntries] = useState<StoredEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);

      // Read biomarker entries for out-of-range ranking
      let parsed: StoredEntry[] = [];
      try {
        const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
        if (raw) parsed = JSON.parse(raw) as StoredEntry[];
      } catch (e) {
        console.error('[ArticlesScreen] AsyncStorage read error', e);
      }
      if (!cancelled) setEntries(parsed);

      // Load cached articles immediately
      const cached = await loadCachedArticles(parsed);
      if (!cancelled) {
        if (cached.length > 0) {
          setArticles(cached);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

      // Background refresh
      const fresh = await refreshArticlesIfStale(parsed);
      if (!cancelled) {
        if (fresh !== null) setArticles(fresh);
        setLoading(false);
      }
    }

    init().catch((e) => {
      console.error('[ArticlesScreen] init error', e);
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const outOfRangeSet = useMemo<Set<string>>(() => {
    const latestByBiomarker = new Map<string, StoredEntry>();
    for (const e of entries) {
      const prev = latestByBiomarker.get(e.biomarkerId);
      if (!prev || e.date > prev.date) latestByBiomarker.set(e.biomarkerId, e);
    }
    const set = new Set<string>();
    for (const bm of BIOMARKERS) {
      const entry = latestByBiomarker.get(bm.id);
      if (entry && (entry.value < bm.optMin || entry.value > bm.optMax)) set.add(bm.id);
    }
    return set;
  }, [entries]);

  const onRefresh = async () => {
    setRefreshing(true);
    let parsed: StoredEntry[] = entries;
    try {
      const raw = await AsyncStorage.getItem('@vitalspan_biomarkers');
      if (raw) parsed = JSON.parse(raw) as StoredEntry[];
    } catch (e) {
      console.error('[ArticlesScreen] AsyncStorage read error', e);
    }
    const result = await forceRefreshArticles(parsed);
    if (result !== null) setArticles(result);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Article }) => {
    const isRelevant = item.biomarker_tags.some((t) => outOfRangeSet.has(t));
    const relevantBiomarkerName = BIOMARKERS.find(
      (b) => item.biomarker_tags.includes(b.id) && outOfRangeSet.has(b.id),
    )?.name;
    return (
      <ArticleCard
        article={item}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
          WebBrowser.openBrowserAsync(`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`).catch(() => null);
        }}
        isRelevant={isRelevant}
        relevantBiomarkerName={relevantBiomarkerName}
      />
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={s.backChevron}>←</Text>
        </TouchableOpacity>
        <Text style={s.screenTitle}>RESEARCH</Text>
        <View style={s.backBtn} />
      </View>

      {/* Loading state */}
      {loading && articles.length === 0 ? (
        <View style={s.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : articles.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyText}>
            No articles available. Check your connection and pull to refresh.
          </Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.pmid}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          ItemSeparatorComponent={null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
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
    backgroundColor: Colors.bg,
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
    color: Colors.textMuted,
  },
  screenTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: Typography.letterSpacing.widest,
  },
  listContent: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyText: {
    fontSize: Typography.sizes.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
