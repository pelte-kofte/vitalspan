import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { authSessionCoordinator, isAuthRequestScopeCurrent } from '../lib/supabase';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'SignUpConfirmation'>;

export default function SignUpConfirmationScreen() {
  const nav = useNavigation<Nav>();
  const { email } = useRoute<Route>().params;

  async function handleContinue() {
    const scope = authSessionCoordinator.captureRequestScope();
    if (!scope) {
      nav.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      return;
    }
    const raw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
    if (!isAuthRequestScopeCurrent(scope)) return;
    const profile = raw ? JSON.parse(raw) : null;
    if (profile?.onboardingComplete) {
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    } else {
      nav.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    }
  }

  function handleOpenMail() {
    Linking.openURL('message://').catch(() =>
      Linking.openURL('mailto:').catch(() => null),
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.iconArea}>
          <View style={s.iconCircle}>
            <Text style={s.iconGlyph}>@</Text>
          </View>
        </View>

        <Text style={s.headline}>Verify your email</Text>
        <Text style={s.body}>
          {`We sent a verification email to ${email}. Check your inbox, then come back to Vitalspan.`}
        </Text>

        <TouchableOpacity style={s.primaryButton} onPress={handleOpenMail}>
          <Text style={s.primaryButtonText}>Open Mail App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.ghostLink} onPress={handleContinue}>
          <Text style={s.ghostLinkText}>Continue to app</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  iconArea: {
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: Typography.sizes.h2,
    fontWeight: '700',
    color: Colors.brand,
  },
  headline: {
    fontSize: Typography.sizes.h1,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  body: {
    fontSize: Typography.sizes.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  primaryButton: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    width: '100%',
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.body,
    fontWeight: '600',
    color: Colors.surface,
  },
  ghostLink: {
    paddingVertical: Spacing.sm,
  },
  ghostLinkText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.brand,
    textAlign: 'center',
  },
});
