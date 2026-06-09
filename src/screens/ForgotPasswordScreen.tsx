import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { sendPasswordResetEmail } from '../lib/supabase';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSend() {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: resetError } = await sendPasswordResetEmail(email.trim());
    if (resetError) {
      setError(resetError);
      setLoading(false);
      return;
    }
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.successArea}>
          <View style={s.successIcon}>
            <Text style={s.successIconText}>OK</Text>
          </View>
          <Text style={s.title}>Check your inbox</Text>
          <Text style={s.successBody}>
            {`We sent a reset link to ${email}. Tap the link in the email to set a new password.`}
          </Text>
          <TouchableOpacity style={s.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={s.primaryButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.title}>Reset Password</Text>
        <Text style={s.subtitle}>
          Enter your email and we'll send a reset link
        </Text>

        <TextInput
          style={s.input}
          placeholder="Email address"
          placeholderTextColor={Colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />

        {error !== null && (
          <Text style={s.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[s.primaryButton, loading && s.primaryButtonDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={s.primaryButtonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.ghostLink} onPress={() => navigation.goBack()}>
          <Text style={s.ghostLinkText}>Back to Login</Text>
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
  },
  title: {
    fontSize: Typography.sizes.h1,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.sizes.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.semantic.danger,
    marginBottom: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: Spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.body,
    fontWeight: '600',
    color: Colors.surface,
  },
  ghostLink: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  ghostLinkText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.brand,
  },
  // Success state
  successArea: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  successIconText: {
    fontSize: Typography.sizes.h2,
    fontWeight: '700',
    color: Colors.semantic.success,
  },
  successBody: {
    fontSize: Typography.sizes.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
});
