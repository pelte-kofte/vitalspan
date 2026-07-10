import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Article } from '../lib/articleService';
import { Issue } from '../lib/issueService';
import { formatIssueDate } from '../lib/articleUtils';
import { Colors, Spacing, Radius, Typography } from '../theme';

// --- IssueHeroCard — the cover story. The one serif headline in the app. ---

export function IssueHeroCard({
  issueNumber, publishDate, article, onPress,
}: { issueNumber: number; publishDate: string; article: Article; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={s.heroCard}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Issue ${issueNumber} cover story: ${article.title}`}
    >
      <Text style={s.masthead}>ISSUE {issueNumber} · {formatIssueDate(publishDate)}</Text>
      <Text style={s.headline} numberOfLines={4}>{article.title}</Text>
      <Text style={s.heroMeta} numberOfLines={1}>{article.journal} · {article.pub_date}</Text>
      {article.abstract != null && (
        <Text style={s.heroAbstract} numberOfLines={4}>{article.abstract}</Text>
      )}
      <Text style={s.readLink}>Read →</Text>
    </TouchableOpacity>
  );
}

// --- BriefArticleCard — "This week in the literature" / archive rows. ---

export function BriefArticleCard({ article, onPress }: { article: Article; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={s.briefCard}
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}, ${article.journal}`}
    >
      <View style={s.eyebrowRow}>
        <Text style={s.journal} numberOfLines={1}>{article.journal}</Text>
        <Text style={s.date}>{article.pub_date}</Text>
      </View>
      <Text style={s.briefTitle} numberOfLines={2}>{article.title}</Text>
      {article.abstract != null && (
        <Text style={s.briefAbstract} numberOfLines={2}>{article.abstract}</Text>
      )}
      <Text style={s.pmidFooter}>PMID {article.pmid}</Text>
    </TouchableOpacity>
  );
}

// --- PharmacistNoteCard — distinct via accent bar, not fill (De-Slop rule 2). ---

export function PharmacistNoteCard({ note }: { note: string }) {
  return (
    <View style={s.noteCard}>
      <View style={s.noteAccentBar} />
      <View style={s.noteContent}>
        <Text style={s.noteBody}>{note}</Text>
        <Text style={s.noteByline}>Bekir Cem Kusdemir, PharmD</Text>
      </View>
    </View>
  );
}

// --- PastIssueRow — archive list item. ---

export function PastIssueRow({ issue, onPress }: { issue: Issue; onPress: () => void }) {
  const isArchive = issue.issueNumber === 0;
  return (
    <TouchableOpacity
      style={s.pastRow}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isArchive ? 'Archive' : `Issue ${issue.issueNumber}`}
    >
      <View>
        <Text style={s.pastRowTitle}>{isArchive ? 'Archive' : `Issue ${issue.issueNumber}`}</Text>
        <Text style={s.pastRowDate}>{isArchive ? 'Before The Brief' : formatIssueDate(issue.publishDate)}</Text>
      </View>
      <Text style={s.pastRowChevron}>→</Text>
    </TouchableOpacity>
  );
}

// --- Styles ---

const s = StyleSheet.create({
  heroCard: {
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    marginHorizontal: Spacing.base,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  masthead: {
    fontSize: Typography.sizes.captionSmall,
    fontWeight: '600',
    letterSpacing: Typography.letterSpacing.widest,
    textTransform: 'uppercase',
    color: Colors.dark.textMuted,
  },
  headline: {
    fontFamily: Typography.displaySerif,
    fontSize: Typography.sizes.h1,
    lineHeight: Typography.lineHeights.h1 + 6,
    fontWeight: Typography.weights.title,
    color: Colors.dark.text,
  },
  heroMeta: {
    fontSize: Typography.sizes.caption,
    color: Colors.dark.textMuted,
  },
  heroAbstract: {
    fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall,
    color: Colors.dark.textMuted,
  },
  readLink: {
    fontSize: Typography.sizes.caption,
    fontWeight: '600',
    color: Colors.dark.ctaPrimary,
  },
  briefCard: {
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    marginHorizontal: Spacing.base,
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  eyebrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journal: {
    fontSize: Typography.sizes.captionSmall,
    color: Colors.dark.textMuted,
    flex: 1,
    marginRight: Spacing.sm,
  },
  date: {
    fontSize: Typography.sizes.captionSmall,
    color: Colors.dark.textMuted,
  },
  briefTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: '600',
    lineHeight: Typography.lineHeights.body,
    color: Colors.dark.text,
  },
  briefAbstract: {
    fontSize: Typography.sizes.caption,
    lineHeight: Typography.lineHeights.caption,
    color: Colors.dark.textMuted,
  },
  pmidFooter: {
    fontSize: Typography.sizes.captionSmall,
    color: Colors.dark.textMuted,
    marginTop: Spacing.xs,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    marginHorizontal: Spacing.base,
    overflow: 'hidden',
  },
  noteAccentBar: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: Colors.dark.ctaPrimary,
  },
  noteContent: {
    flex: 1,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  noteBody: {
    fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body + 4,
    color: Colors.dark.text,
  },
  noteByline: {
    fontSize: Typography.sizes.caption,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.cardBg,
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    marginHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  pastRowTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  pastRowDate: {
    fontSize: Typography.sizes.caption,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  pastRowChevron: {
    fontSize: Typography.sizes.md,
    color: Colors.dark.textMuted,
  },
});
