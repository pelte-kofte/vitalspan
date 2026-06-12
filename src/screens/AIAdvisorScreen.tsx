import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * AIAdvisorScreen — stub fullScreenModal shell.
 *
 * Content and functionality will be added in Phase 18.
 * This file exists solely to satisfy the AppNavigator route declaration
 * added in 16-02 and to provide the back-button navigation frame.
 */
export default function AIAdvisorScreen(): React.JSX.Element {
  const nav = useNavigation<Nav>();

  return (
    <LinearGradient
      colors={['#080D09', '#0C1410', '#0F1C14']}
      style={s.gradient}
    >
      <SafeAreaView style={s.safe}>
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.screenTitle}>AI ADVISOR</Text>
          {/* Spacer keeps title centred — matches LongevityScoreScreen topBar pattern */}
          <View style={s.spacer} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    padding: Spacing.sm,
  },
  backArrow: {
    color: Colors.dark.text,
    fontSize: 22,
  },
  screenTitle: {
    color: Colors.dark.text,
    fontWeight: '600',
    letterSpacing: Typography.letterSpacing.widest,
    fontSize: Typography.sizes.base,
  },
  /** Width matches the back button hit area so the title stays visually centred */
  spacer: {
    width: 38,
  },
});
