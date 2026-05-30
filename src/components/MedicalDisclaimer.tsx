import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography } from '../theme';

const DISCLAIMER_KEY = '@vitalspan_disclaimer_accepted';

const DISCLAIMER_VERSION = '1.0';

const DISCLAIMER_TEXT = `Vitalspan is an educational wellness tracking application. It is NOT a medical device and does NOT provide medical advice, diagnosis, or treatment.

The biomarker ranges, supplement recommendations, and protocol suggestions in this application are based on longevity medicine research and are intended for educational and informational purposes only.

IMPORTANT LIMITATIONS

• This app does not replace the advice of a licensed physician, pharmacist, or other qualified healthcare provider.

• Laboratory reference ranges in this app reflect longevity-optimized targets from research literature. These differ from standard clinical reference ranges and should be discussed with your healthcare provider.

• Drug and supplement interactions displayed are informational only. Always consult your pharmacist or physician before starting, stopping, or changing any medication or supplement.

• If you have a medical condition, are pregnant, breastfeeding, or taking prescription medications, consult your healthcare provider before using any information from this application.

EMERGENCY SITUATIONS

This application is NOT for emergency use. If you are experiencing a medical emergency, call 911 (or your local emergency number) immediately.

PHARMACIST REVIEW

Content in this application has been reviewed by licensed pharmacists for educational accuracy. This review does not constitute a professional pharmacist-patient relationship.

By continuing, you acknowledge that you have read and understood this disclaimer, and agree that Vitalspan is a wellness education tool, not a substitute for professional medical care.`;

interface MedicalDisclaimerProps {
  onAccepted?: () => void;
}

export default function MedicalDisclaimer({ onAccepted }: MedicalDisclaimerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY)
      .then(raw => {
        if (!raw) { setVisible(true); return; }
        const stored = JSON.parse(raw) as { version: string; acceptedAt: string };
        if (stored.version !== DISCLAIMER_VERSION) setVisible(true);
      })
      .catch(() => setVisible(true));
  }, []);

  async function handleAccept() {
    await AsyncStorage.setItem(
      DISCLAIMER_KEY,
      JSON.stringify({ version: DISCLAIMER_VERSION, acceptedAt: new Date().toISOString() }),
    );
    setVisible(false);
    onAccepted?.();
  }

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.iconBadge}>
              <Text style={s.iconTxt}>⚕</Text>
            </View>
            <Text style={s.title}>Medical Disclaimer</Text>
            <Text style={s.subtitle}>Please read before continuing</Text>
          </View>

          <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
            {DISCLAIMER_TEXT.split('\n\n').map((para, i) => (
              <Text
                key={i}
                style={para === para.toUpperCase() && para.length < 40 ? s.heading : s.paragraph}
              >
                {para}
              </Text>
            ))}
          </ScrollView>

          <View style={s.footer}>
            <View style={s.pharmacistBadge}>
              <Text style={s.pharmacistTxt}>⚕ Content reviewed by licensed pharmacists</Text>
            </View>
            <TouchableOpacity style={s.acceptBtn} onPress={handleAccept}>
              <Text style={s.acceptBtnTxt}>I Understand — Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Slim persistent banner for screens that deal with medical information.
 * Non-blocking — always visible but doesn't prevent interaction.
 */
export function MedicalBanner() {
  return (
    <View style={s.banner}>
      <Text style={s.bannerTxt}>
        ⚕ Educational only — not medical advice. Consult your physician.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    width: '100%',
    maxHeight: '88%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingBottom: Spacing.base,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconTxt: { fontSize: 24 },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: { fontSize: Typography.sizes.sm, color: Colors.textMuted },

  body: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base, maxHeight: 320 },
  heading: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    marginTop: Spacing.base,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },

  footer: {
    padding: Spacing.base,
    gap: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  pharmacistBadge: {
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.full,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.primaryBorder,
  },
  pharmacistTxt: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '500',
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: 15,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptBtnTxt: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.primaryBg,
  },

  banner: {
    backgroundColor: Colors.warningBg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.warningBorder,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  bannerTxt: {
    fontSize: Typography.sizes.xs,
    color: Colors.warningText,
    textAlign: 'center',
  },
});
