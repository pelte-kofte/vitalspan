import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme';

export default function ProfileHydrationErrorScreen({
  onRetry,
}: {
  onRetry: () => void;
}): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>We couldn&apos;t load your profile</Text>
        <Text style={styles.body}>
          Your saved account data has not been changed. Check your connection and try again.
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Retry loading profile"
          style={styles.button}
          onPress={onRetry}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    color: Colors.dark.text,
    fontSize: Typography.sizes.xl,
    fontWeight: '600',
  },
  body: { color: Colors.dark.textMuted, fontSize: Typography.sizes.base, lineHeight: 22 },
  button: {
    marginTop: Spacing.md,
    backgroundColor: Colors.dark.ctaPrimary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonText: { color: Colors.dark.bg, fontSize: Typography.sizes.md, fontWeight: '600' },
});
