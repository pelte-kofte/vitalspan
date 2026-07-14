import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ChatMessage } from '../../lib/advisorService';
import { parseCitations } from '../../lib/citations';
import { Colors, Spacing, Typography, Radius } from '../../theme';
import { MicroscopeIcon } from '../DesignSystemIcons';

const SUGGESTED_PROMPTS = [
  'What should I focus on first?',
  'Explain my biggest biomarker risk',
  'Review my current supplements',
  'How can I improve my biological age?',
] as const;

export interface ChatThreadProps {
  messages: ChatMessage[];
  isThinking: boolean;
  hasReport?: boolean;
  onSuggestedPrompt?: (prompt: string) => void;
  onGenerateReport?: () => void;
  isReportLoading?: boolean;
}

function SourcesFooter({ content }: { content: string }) {
  const citations = parseCitations(content);
  if (citations.length === 0) return null;

  return (
    <View style={s.sourcesFooter}>
      <Text style={s.sourcesLabel}>SOURCES</Text>
      <View style={s.sourcesRow}>
        {citations.map(c => (
          <TouchableOpacity
            key={c.pmid}
            style={s.sourceChip}
            onPress={() => {
              WebBrowser.openBrowserAsync(`https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/`).catch(() => null);
            }}
          >
            <Text style={s.sourceChipText}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ChatThread({
  messages,
  isThinking,
  hasReport = false,
  onSuggestedPrompt,
  onGenerateReport,
  isReportLoading = false,
}: ChatThreadProps) {
  if (messages.length === 0 && !isThinking) {
    return (
      <View style={s.emptyCard}>
        <View style={s.emptyIcon}>
          <MicroscopeIcon color={Colors.dark.textMuted} size={24} />
        </View>
        <Text style={s.emptyTitle}>
          {hasReport ? 'Your report is ready' : 'Ask about your health'}
        </Text>
        <Text style={s.emptyPrompt}>
          {hasReport
            ? 'Ask a follow-up question using your report and latest health context.'
            : 'I’ll use your latest biomarkers, protocol, and health context to answer.'}
        </Text>

        <View style={s.promptGrid}>
          {SUGGESTED_PROMPTS.map(prompt => (
            <TouchableOpacity
              key={prompt}
              style={s.promptChip}
              onPress={() => onSuggestedPrompt?.(prompt)}
              disabled={!onSuggestedPrompt}
              accessibilityRole="button"
              accessibilityLabel={prompt}
            >
              <Text style={s.promptChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {onGenerateReport && (
          <TouchableOpacity
            style={[s.reportAction, isReportLoading && s.reportActionDisabled]}
            onPress={onGenerateReport}
            disabled={isReportLoading}
            accessibilityRole="button"
            accessibilityLabel="Generate my health report"
          >
            <Text style={s.reportActionText}>
              {isReportLoading ? 'Generating health report…' : 'Generate my health report'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View>
      {messages.map((msg, i) => (
        <View key={i}>
          <View
            style={[
              s.bubble,
              msg.role === 'user' ? s.userBubble : s.assistantBubble,
            ]}
          >
            <Text style={msg.role === 'user' ? s.userText : s.assistantText}>
              {msg.content}
            </Text>
          </View>
          {msg.role === 'assistant' && <SourcesFooter content={msg.content} />}
        </View>
      ))}
      {isThinking && (
        <View style={[s.bubble, s.assistantBubble]}>
          <Text style={[s.assistantText, s.thinkingDots]}>{'• • •'}</Text>
          {/* TODO(pubmed-mcp): show a "Searching PubMed…" secondary line here once
              sendChatMessage streams — today advisorService.sendChatMessage is a single
              non-streaming supabase.functions.invoke() call, so there's no tool_use event
              to key off of client-side while waiting. */}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  emptyCard: {
    backgroundColor: Colors.dark.cardBg,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    borderRadius: Radius.lg,
    padding: Spacing.base,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.h3,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptyPrompt: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.sm,
    lineHeight: 19,
    marginBottom: Spacing.base,
  },
  promptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  promptChip: {
    width: '48%',
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: Colors.dark.bgElevated,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  promptChipText: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.xs,
    lineHeight: 16,
  },
  reportAction: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.dark.accentBorder,
    borderRadius: Radius.full,
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  reportActionDisabled: {
    opacity: 0.6,
  },
  reportActionText: {
    color: Colors.dark.ctaPrimary,
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  bubble: {
    maxWidth: '80%',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.dark.cardBg,
    borderColor: Colors.dark.cardBorder,
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  userText: {
    fontSize: Typography.sizes.base,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  assistantText: {
    fontSize: Typography.sizes.base,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  thinkingDots: {
    color: Colors.dark.textMuted,
    letterSpacing: 4,
  },
  sourcesFooter: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sourcesLabel: {
    fontSize: Typography.sizes.captionSmall,
    fontWeight: '600',
    letterSpacing: Typography.letterSpacing.wide,
    color: Colors.dark.textMuted,
    marginBottom: Spacing.xs,
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  sourceChip: {
    backgroundColor: Colors.dark.cardBg,
    borderWidth: 0.5,
    borderColor: Colors.dark.cardBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  sourceChipText: {
    fontSize: Typography.sizes.caption,
    color: Colors.dark.textMuted,
  },
});
