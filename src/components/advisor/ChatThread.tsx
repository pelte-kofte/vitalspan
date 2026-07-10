import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ChatMessage } from '../../lib/advisorService';
import { parseCitations } from '../../lib/citations';
import { Colors, Spacing, Typography, Radius } from '../../theme';

export interface ChatThreadProps {
  messages: ChatMessage[];
  isThinking: boolean;
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

export default function ChatThread({ messages, isThinking }: ChatThreadProps) {
  if (messages.length === 0 && !isThinking) {
    return (
      <View style={s.emptyCard}>
        <Text style={s.emptyPrompt}>
          Ask a follow-up question about your report…
        </Text>
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
    padding: Spacing.lg,
  },
  emptyPrompt: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
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
