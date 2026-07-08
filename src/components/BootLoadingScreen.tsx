import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme';
import BioAgeSpherePreview from './BioAgeSpherePreview';

/**
 * Branded replacement for a bare ActivityIndicator on the cold-boot screen —
 * the one moment every user sees before anything else. Dark background per
 * DESIGN_SYSTEM.md, small pulsing sphere motif instead of a generic spinner.
 */
export default function BootLoadingScreen() {
  return (
    <View style={s.loading}>
      <StatusBar style="light" />
      <BioAgeSpherePreview size={48} dimmed={false} />
    </View>
  );
}

const s = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.bg,
  },
});
