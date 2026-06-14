import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../../lib/advisorService';
import { Colors, Spacing, Typography, Radius } from '../../theme';

export interface ChatThreadProps {
  messages: ChatMessage[];
  isThinking: boolean;
}

export default function ChatThread({ messages, isThinking }: ChatThreadProps) {
  if (messages.length === 0 && !isThinking) {
    return (
      <Text style={s.emptyPrompt}>
        Ask a follow-up question about your report…
      </Text>
    );
  }

  return (
    <View>
      {messages.map((msg, i) => (
        <View
          key={i}
          style={[
            s.bubble,
            msg.role === 'user' ? s.userBubble : s.assistantBubble,
          ]}
        >
          <Text style={msg.role === 'user' ? s.userText : s.assistantText}>
            {msg.content}
          </Text>
        </View>
      ))}
      {isThinking && (
        <View style={[s.bubble, s.assistantBubble]}>
          <Text style={[s.assistantText, s.thinkingDots]}>{'• • •'}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  emptyPrompt: {
    color: Colors.dark.textMuted,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    padding: Spacing.lg,
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
    color: '#E8F5EE',
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
});
