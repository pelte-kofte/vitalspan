import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '../theme';

export interface OrbitalInfoModalProps {
  visible: boolean;
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
  onDismiss: () => void;
}

export function OrbitalInfoModal({
  visible,
  title,
  body,
  ctaLabel,
  onCta,
  onDismiss,
}: OrbitalInfoModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={s.backdrop}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <View style={[s.sheet, { paddingBottom: Spacing.xxl + insets.bottom }]}>
          <View onStartShouldSetResponder={() => true}>
            <View style={s.handle} />
            <Text style={s.title}>{title}</Text>
            <Text style={s.body}>{body}</Text>
            <TouchableOpacity
              style={s.ctaButton}
              onPress={onCta ?? onDismiss}
              activeOpacity={0.85}
            >
              <Text style={s.ctaText}>{ctaLabel ?? 'Got it'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.dark.bgCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.base,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.border,
    alignSelf: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: Typography.sizes.h3,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: Typography.sizes.base,
    color: Colors.dark.textMuted,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    backgroundColor: Colors.viz.bioGreen,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  ctaText: {
    color: Colors.dark.bg,
    fontWeight: '700',
    fontSize: Typography.sizes.base,
  },
});
