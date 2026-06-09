import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Article } from '../lib/articleService';
import { Colors, Spacing, Radius, Typography, Elevation } from '../theme';

interface Props {
  article: Article;
  onPress: () => void;
  isRelevant?: boolean;
  relevantBiomarkerName?: string;
}

export default function ArticleCard({ article, onPress, isRelevant, relevantBiomarkerName }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    onPress();
  };

  return (
    <TouchableOpacity
      style={s.container}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}, ${article.journal}, published ${article.pub_date}`}
      onPress={handlePress}
    >
      {/* Eyebrow row */}
      <View style={s.eyebrow}>
        <Text style={s.journal} numberOfLines={1}>{article.journal}</Text>
        <Text style={s.date}>{article.pub_date}</Text>
      </View>

      {/* Title */}
      <Text style={s.title} numberOfLines={2} ellipsizeMode="tail">
        {article.title}
      </Text>

      {/* Abstract snippet */}
      {article.abstract !== null && (
        <Text style={s.abstract} numberOfLines={3} ellipsizeMode="tail">
          {article.abstract}
        </Text>
      )}

      {/* Meta row */}
      <View style={s.meta}>
        <View style={s.metaLeft}>
          {isRelevant === true && relevantBiomarkerName ? (
            <View style={s.tag}>
              <Text style={s.tagText}>{relevantBiomarkerName}</Text>
            </View>
          ) : null}
        </View>
        <Text style={s.readLink}>Read article →</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    padding: Spacing.base,
    ...Elevation.sm,
  },
  eyebrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  journal: {
    fontSize: Typography.sizes.xs,
    fontWeight: '400',
    color: Colors.onSurfaceMuted,
    flex: 1,
    marginRight: Spacing.sm,
  },
  date: {
    fontSize: Typography.sizes.xs,
    fontWeight: '400',
    color: Colors.onSurfaceMuted,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  abstract: {
    fontSize: Typography.sizes.body,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  meta: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLeft: {
    flex: 1,
  },
  readLink: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  tag: {
    backgroundColor: Colors.status.reviewBg,
    borderColor: Colors.status.reviewBorder,
    borderWidth: 0.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.status.reviewText,
  },
});
