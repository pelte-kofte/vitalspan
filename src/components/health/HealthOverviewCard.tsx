import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { LivingSphereRenderer } from '../livingSphere';
import { DOMAIN_TITLES } from '../../domain/livingSphere';
import type { HealthLivingSphereModel } from '../../lib/healthLivingSphere';
import { formatHealthDate } from '../../lib/healthExperience';
import type { ClinicalPhenoAgePresentation } from '../../lib/clinicalPhenoAgePresentation';
import { Colors, Radius, Spacing, Typography } from '../../theme';
import { livingSphereHeroSize } from './healthOverviewLayout';
import Text from './HealthText';

interface Props {
  result: ClinicalPhenoAgePresentation;
  lastLabDate: string | null;
  sphere: HealthLivingSphereModel;
  actionLabel: string;
  onAction: () => void;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <Svg width={Spacing.base} height={Spacing.base} viewBox="0 0 16 16" accessible={false}>
      <Path d={open ? 'M3 6 L8 11 L13 6' : 'M6 3 L11 8 L6 13'} fill="none"
        stroke={Colors.health.inkSecondary} strokeWidth={1.5} strokeLinecap="round"
        strokeLinejoin="round" />
    </Svg>
  );
}

function HealthOverviewCard({
  result,
  lastLabDate,
  sphere,
  actionLabel,
  onAction,
}: Props) {
  const { width, height, fontScale } = useWindowDimensions();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sphereExplanationOpen, setSphereExplanationOpen] = useState(false);
  const sphereSize = livingSphereHeroSize(width, height, fontScale);
  const toggleSphereExplanation = useCallback(
    () => setSphereExplanationOpen(open => !open),
    [],
  );
  const revealSphereExplanation = useCallback(() => setSphereExplanationOpen(true), []);
  const missing = sphere.contract.state.explanation.missingDomains
    .map(id => DOMAIN_TITLES[id]).join(', ');
  const represented = sphere.contract.state.explanation.representedDomains
    .map(id => DOMAIN_TITLES[id]).join(' • ');
  const calculated = result.status === 'available';

  return (
    <View style={s.hero} accessibilityLabel="Health overview">
      <Text accessibilityRole="header" style={s.eyebrow}>HEALTH OVERVIEW</Text>

      <View style={s.sphereStage}>
        <LivingSphereRenderer
          contract={sphere.contract}
          size={sphereSize}
          onPress={toggleSphereExplanation}
          onLongPress={revealSphereExplanation}
          testID="health-living-sphere"
        />
        {represented.length > 0 && (
          <View style={s.represented} accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            <Text style={s.representedLabel}>REPRESENTING</Text>
            <Text style={s.representedDomains}>{represented}</Text>
          </View>
        )}
      </View>

      {sphereExplanationOpen && (
        <View style={s.sphereExplanation} accessibilityLiveRegion="polite">
          <Text style={s.explanationTitle}>WHAT THE SPHERE REPRESENTS</Text>
          <Text style={s.explanationText}>Current state: {sphere.currentState}</Text>
          <Text style={s.explanationText}>Evidence clarity: {sphere.evidenceClarity}</Text>
          <Text style={s.explanationText}>{sphere.contract.accessibility.representedDomains}</Text>
          <Text style={s.explanationText}>Missing domains: {missing || 'none'}</Text>
          <Text style={s.explanationText}>{sphere.contract.accessibility.motion}</Text>
        </View>
      )}

      <View style={s.stateBlock}>
        <Text style={s.fieldLabel}>CURRENT STATE</Text>
        <Text maxFontSizeMultiplier={1.25} style={s.currentState}>{sphere.currentState}</Text>
      </View>

      <View style={s.clarityRow}>
        <Text style={s.fieldLabel}>EVIDENCE CLARITY</Text>
        <Text style={s.clarityValue}>{sphere.evidenceClarity}</Text>
      </View>

      <View style={s.insightBlock}>
        <Text style={s.fieldLabel}>PRIMARY INSIGHT</Text>
        <Text style={s.insight}>{sphere.primaryInsight}</Text>
      </View>

      <Pressable onPress={onAction} style={s.action} accessibilityRole="button"
        accessibilityLabel={actionLabel}>
        <Text style={s.actionText}>{actionLabel}</Text>
        <Text style={s.actionArrow} accessible={false}>›</Text>
      </Pressable>

      <Pressable onPress={() => setDetailsOpen(open => !open)} style={s.detailsButton}
        accessibilityRole="button" accessibilityState={{ expanded: detailsOpen }}
        accessibilityLabel={`${detailsOpen ? 'Hide' : 'Show'} blood model details`}>
        <Text style={s.detailsLabel}>{detailsOpen ? 'Hide details' : 'Blood model details'}</Text>
        <Chevron open={detailsOpen} />
      </Pressable>

      {detailsOpen && (
        <View style={s.details}>
          <View style={s.metaGrid}>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>LAST LABORATORY</Text>
              <Text style={s.metaValue}>{formatHealthDate(lastLabDate)}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>DATA COMPLETENESS</Text>
              <Text style={s.metaValue}>{result.presentCount} / {result.totalRequired}</Text>
            </View>
            {calculated && (
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>BLOOD PHENOTYPIC AGE</Text>
                <Text style={s.metaValue}>{result.formattedValue} years</Text>
              </View>
            )}
          </View>
          {result.unavailableMeasurements.length > 0 && (
            <Text style={s.limitText}>Unavailable: {result.unavailableMeasurements.join(', ')}</Text>
          )}
          {result.failure && <Text style={s.limitText}>{result.failure.detail}</Text>}
          <Text style={s.metaLabel}>MODEL LIMITATIONS</Text>
          {result.limitations.map(item => <Text key={item} style={s.limitText}>{item}</Text>)}
          <Text style={s.provenance}>Source: Clinical PhenoAge {result.modelVersion}, authorized by the Scientific Eligibility Engine. This blood model is separate from the Living Sphere and does not represent every dimension of health.</Text>
        </View>
      )}
    </View>
  );
}

export default React.memo(HealthOverviewCard);

const s = StyleSheet.create({
  hero: { paddingHorizontal: Spacing.xs, paddingTop: Spacing.lg },
  eyebrow: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall,
    fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.widest },
  sphereStage: { alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg,
    marginBottom: Spacing.base },
  represented: { alignItems: 'center', marginTop: Spacing.md, gap: Spacing.xs },
  representedLabel: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall,
    fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.wider },
  representedDomains: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.caption,
    lineHeight: Typography.lineHeights.caption, textAlign: 'center' },
  sphereExplanation: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.health.rule,
    paddingVertical: Spacing.md, gap: Spacing.xs, marginBottom: Spacing.xl },
  explanationTitle: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall,
    fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.wider },
  explanationText: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.caption,
    lineHeight: Typography.lineHeights.caption },
  stateBlock: { maxWidth: 520 },
  fieldLabel: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall,
    fontWeight: Typography.weights.label, letterSpacing: Typography.letterSpacing.wider },
  currentState: { color: Colors.health.ink, fontSize: Typography.sizes.h1,
    lineHeight: Typography.lineHeights.h1, fontWeight: Typography.weights.title, marginTop: Spacing.xs },
  clarityRow: { marginTop: Spacing.lg },
  clarityValue: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.body, marginTop: Spacing.xs },
  insightBlock: { marginTop: Spacing.lg, maxWidth: 560 },
  insight: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.body,
    lineHeight: Typography.lineHeights.body, marginTop: Spacing.sm },
  action: { minHeight: Spacing.xxl + Spacing.base, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderRadius: Radius.card, backgroundColor: Colors.health.ink,
    paddingHorizontal: Spacing.base, marginTop: Spacing.xl },
  actionText: { color: Colors.health.surfaceStrong, fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.label },
  actionArrow: { color: Colors.health.surfaceStrong, fontSize: Typography.sizes.xxl,
    lineHeight: Typography.sizes.xxl, fontWeight: Typography.weights.title },
  detailsButton: { minHeight: Spacing.xxl + Spacing.base, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.health.rule,
    marginTop: Spacing.lg },
  detailsLabel: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.label },
  details: { gap: Spacing.md, paddingTop: Spacing.md },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  metaItem: { flexGrow: 1, flexBasis: 130 },
  metaLabel: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall,
    letterSpacing: Typography.letterSpacing.wider, fontWeight: Typography.weights.label },
  metaValue: { color: Colors.health.ink, fontSize: Typography.sizes.bodySmall,
    lineHeight: Typography.lineHeights.bodySmall, marginTop: Spacing.xs },
  limitText: { color: Colors.health.inkSecondary, fontSize: Typography.sizes.caption,
    lineHeight: Typography.lineHeights.caption },
  provenance: { color: Colors.health.inkTertiary, fontSize: Typography.sizes.captionSmall,
    lineHeight: Typography.lineHeights.captionSmall },
});
