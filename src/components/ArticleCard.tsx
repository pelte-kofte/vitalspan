import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Article } from '../lib/articleService';
import { BIOMARKER_TAG_META, withAlpha, primaryTagMeta } from '../lib/articleUtils';
import { Colors, Spacing, Radius, Typography } from '../theme';

// --- TagPill ---

function TagPill({ tagKey, colored }: { tagKey: string; colored: boolean }) {
  const meta = BIOMARKER_TAG_META[tagKey] ?? BIOMARKER_TAG_META.general;
  if (colored) {
    return (
      <View style={[s.pill, { backgroundColor: withAlpha(meta.color, 0.10) }]}>
        <Text style={[s.pillText, { color: meta.color }]}>{meta.label}</Text>
      </View>
    );
  }
  return (
    <View style={s.pillMuted}>
      <Text style={s.pillTextMuted}>{meta.label}</Text>
    </View>
  );
}

// --- HeroArticleCard ---

export function HeroArticleCard({
  article, isPersonalized, onPress,
}: { article: Article; isPersonalized: boolean; onPress: () => void }) {
  const { color } = primaryTagMeta(article.biomarker_tags);
  return (
    <TouchableOpacity
      style={s.heroCard}
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}, ${article.journal}`}
    >
      <View style={[s.accentBar, { backgroundColor: color }]} />
      <View style={s.heroContent}>
        <View style={[s.badge, { backgroundColor: withAlpha(color, 0.12) }]}>
          <Text style={[s.badgeText, { color }]}>{isPersonalized ? 'FOR YOU' : 'FEATURED'}</Text>
        </View>
        <Text style={s.heroTitle} numberOfLines={3}>{article.title}</Text>
        <Text style={s.heroMeta} numberOfLines={1}>{article.journal} · {article.pub_date}</Text>
        {article.abstract != null && (
          <Text style={s.heroAbstract} numberOfLines={4}>{article.abstract}</Text>
        )}
        <View style={s.bottomRow}>
          <View style={s.tagRow}>
            {article.biomarker_tags.slice(0, 2).map((t) => <TagPill key={t} tagKey={t} colored />)}
          </View>
          <Text style={s.readLink}>Read →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// --- StandardArticleCard ---

export function StandardArticleCard({
  article, isPersonalized, onPress,
}: { article: Article; isPersonalized: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={s.stdCard}
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}, ${article.journal}`}
    >
      <View style={s.eyebrow}>
        <Text style={s.journal} numberOfLines={1}>{article.journal}</Text>
        <Text style={s.date}>{article.pub_date}</Text>
      </View>
      <Text style={s.stdTitle} numberOfLines={2}>{article.title}</Text>
      {article.abstract != null && (
        <Text style={s.stdAbstract} numberOfLines={2}>{article.abstract}</Text>
      )}
      <View style={s.bottomRow}>
        <View style={s.tagRow}>
          {article.biomarker_tags.slice(0, 2).map((t) => (
            <TagPill key={t} tagKey={t} colored={isPersonalized} />
          ))}
        </View>
        <Text style={s.readLink}>Read →</Text>
      </View>
    </TouchableOpacity>
  );
}

// --- Styles ---

const s = StyleSheet.create({
  heroCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    marginHorizontal: Spacing.base,
    overflow: 'hidden',
    minHeight: 180,
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
  },
  heroContent: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: Colors.dark.text,
    lineHeight: 22,
  },
  heroMeta: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
  },
  heroAbstract: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    lineHeight: 16,
  },
  stdCard: {
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    marginHorizontal: Spacing.base,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  eyebrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journal: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    flex: 1,
    marginRight: Spacing.sm,
  },
  date: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
  },
  stdTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.dark.text,
    lineHeight: 18,
  },
  stdAbstract: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
  },
  readLink: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.dark.ctaPrimary,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  pillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  pillMuted: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.inputBg,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
  },
  pillTextMuted: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
});
