import type {
  DomainMappedLayerId,
  LivingSphereLayerMotionProfile,
  LivingSphereRendererContract,
  VisualClarity,
  LayerVisibility,
} from '../../domain/livingSphere';
import { validateLivingSphereRendererContract } from '../../domain/livingSphere';

type TrendDirection = LivingSphereLayerMotionProfile['direction'];

export type LivingSphereAppearance = 'light' | 'dark';

export interface LivingSphereRenderPlan {
  appearance: LivingSphereAppearance;
  evidenceOpacity: number;
  layerOpacity: Readonly<Record<DomainMappedLayerId, number>>;
  coreDepth: number;
  surfaceDetail: 'quiet' | 'soft' | 'defined';
  motion: {
    reduced: boolean;
    breathEnabled: boolean;
    breathCycleMs: number;
    breathScale: number;
    rhythmVariance: number;
    flowEnabled: boolean;
    flowDirection: -1 | 1;
    flowCycleMs: number;
    rotationEnabled: boolean;
    rotationDirection: -1 | 1;
    rotationCycleMs: number;
    driftEnabled: boolean;
    driftDirection: -1 | 1;
    driftCycleMs: number;
    driftDistance: number;
  };
  performance: LivingSpherePerformanceEstimate;
}

export interface LivingSpherePerformanceEstimate {
  svgElementCount: number;
  animatedValueCount: number;
  activeAnimationCount: number;
  shortestAnimationMs: number | null;
}

export const LIVING_SPHERE_PERFORMANCE_BOUNDS = {
  maxSvgElementCount: 40,
  maxAnimatedValueCount: 5,
  minAnimationDurationMs: 6_000,
} as const;

const CLARITY_OPACITY: Readonly<Record<VisualClarity, number>> = {
  obscured: 0.34,
  muted: 0.48,
  partial: 0.66,
  clear: 0.84,
  crystalline: 1,
};

const VISIBILITY_OPACITY: Readonly<Record<LayerVisibility, number>> = {
  hidden: 0,
  hinted: 0.32,
  partial: 0.64,
  clear: 1,
};

function certainty(profile: LivingSphereLayerMotionProfile | null): number {
  if (!profile) return 0;
  return { insufficient: 0, limited: 0.35, moderate: 0.58, high: 0.8, very_high: 1 }[
    profile.confidence
  ];
}

function speed(profile: LivingSphereLayerMotionProfile | null): number {
  if (!profile) return 0.5;
  return { unknown: 0.5, slow: 0.62, moderate: 0.8, rapid: 1 }[profile.velocity];
}

function stabilityVariance(profile: LivingSphereLayerMotionProfile | null): number {
  if (!profile) return 0.08;
  return { unknown: 0.08, recent: 0.055, established: 0.025, long_term: 0 }[
    profile.persistence
  ];
}

function patternVariance(profile: LivingSphereLayerMotionProfile | null): number {
  if (!profile) return 0.02;
  return { unknown: 0.02, stable_pattern: 0, emerging_pattern: 0.035,
    volatile_pattern: 0.075, seasonal_pattern: 0.015, interrupted_pattern: 0.1 }[
    profile.pattern
  ];
}

function persistenceExpression(profile: LivingSphereLayerMotionProfile | null): number {
  if (!profile) return 0.72;
  return { unknown: 0.72, recent: 0.82, established: 0.92, long_term: 1 }[
    profile.persistence
  ];
}

function directionalSign(direction: TrendDirection): -1 | 0 | 1 {
  if (direction === 'improving' || direction === 'emerging') return 1;
  if (direction === 'declining' || direction === 'mixed') return -1;
  return 0;
}

function isInterrupted(profile: LivingSphereLayerMotionProfile | null): boolean {
  return profile?.pattern === 'interrupted_pattern';
}

function hasEstablishedObservation(profile: LivingSphereLayerMotionProfile | null): boolean {
  return Boolean(profile && profile.pattern !== 'unknown' && profile.direction !== 'unknown');
}

function layerOpacity(
  contract: LivingSphereRendererContract,
  clarityOpacity: number,
): Readonly<Record<DomainMappedLayerId, number>> {
  const layers = contract.state.layers;
  return {
    core_vitality: VISIBILITY_OPACITY[layers.core_vitality.visibility] * clarityOpacity,
    atmospheric_rhythm: VISIBILITY_OPACITY[layers.atmospheric_rhythm.visibility] * clarityOpacity,
    internal_flow: VISIBILITY_OPACITY[layers.internal_flow.visibility] * clarityOpacity,
    kinetic_presence: VISIBILITY_OPACITY[layers.kinetic_presence.visibility] * clarityOpacity,
    surface_richness: VISIBILITY_OPACITY[layers.surface_richness.visibility] * clarityOpacity,
    environmental_stability: VISIBILITY_OPACITY[layers.environmental_stability.visibility] * clarityOpacity,
  };
}

function performanceEstimate(plan: Omit<LivingSphereRenderPlan, 'performance'>): LivingSpherePerformanceEstimate {
  const animations = [plan.motion.breathEnabled, plan.motion.flowEnabled,
    plan.motion.rotationEnabled, plan.motion.driftEnabled]
    .filter(Boolean).length;
  const durations = [
    plan.motion.breathEnabled ? plan.motion.breathCycleMs : null,
    plan.motion.flowEnabled ? plan.motion.flowCycleMs : null,
    plan.motion.rotationEnabled ? plan.motion.rotationCycleMs : null,
    plan.motion.driftEnabled ? plan.motion.driftCycleMs : null,
  ].filter((value): value is number => value !== null);
  return {
    svgElementCount: 36,
    animatedValueCount: 5,
    activeAnimationCount: animations,
    shortestAnimationMs: durations.length > 0 ? Math.min(...durations) : null,
  };
}

/** Converts bounded semantic contracts into deterministic renderer parameters. */
export function buildLivingSphereRenderPlan(
  contract: LivingSphereRendererContract,
  appearance: LivingSphereAppearance,
  systemReduceMotion = false,
): LivingSphereRenderPlan {
  validateLivingSphereRendererContract(contract);
  const reduced = contract.reduceMotion || contract.state.motion.reduceMotionApplied || systemReduceMotion;
  const profiles = contract.state.motion.layerProfiles;
  const sleep = profiles.atmospheric_rhythm;
  const recovery = profiles.internal_flow;
  const fitness = profiles.kinetic_presence;
  const lifestyle = profiles.environmental_stability;
  const dormant = contract.state.evidenceMode === 'no_evidence';
  const fitnessDirection = directionalSign(fitness?.direction ?? 'unknown');
  const clarityOpacity = CLARITY_OPACITY[contract.state.overallEvidenceClarity];
  const sleepCertainty = certainty(sleep);
  const recoveryCertainty = certainty(recovery);
  const fitnessCertainty = certainty(fitness);
  const lifestyleCertainty = certainty(lifestyle);
  const sleepStability = persistenceExpression(sleep);
  const recoveryStability = persistenceExpression(recovery);
  const fitnessStability = persistenceExpression(fitness);
  const lifestyleStability = persistenceExpression(lifestyle);
  const basePlan: Omit<LivingSphereRenderPlan, 'performance'> = {
    appearance,
    evidenceOpacity: clarityOpacity,
    layerOpacity: layerOpacity(contract, clarityOpacity),
    coreDepth: { obscured: 0.18, muted: 0.28, partial: 0.42, clear: 0.56, crystalline: 0.68 }[
      contract.state.overallEvidenceClarity
    ],
    surfaceDetail: contract.state.layers.surface_richness.visibility === 'clear'
      ? 'defined'
      : contract.state.layers.surface_richness.visibility === 'partial'
        ? 'soft'
        : 'quiet',
    motion: {
      reduced,
      breathEnabled: !reduced && !dormant,
      breathCycleMs: Math.round(10_000 - 2_400 * speed(sleep) * Math.max(0.4, sleepCertainty)),
      breathScale: 0.004 + 0.008 * sleepCertainty * sleepStability,
      rhythmVariance: Math.min(0.1, patternVariance(sleep) + stabilityVariance(sleep) / 2),
      flowEnabled: !reduced && !dormant && !isInterrupted(recovery)
        && recoveryCertainty > 0 && hasEstablishedObservation(recovery),
      flowDirection: directionalSign(recovery?.direction ?? 'unknown') === -1 ? -1 : 1,
      flowCycleMs: Math.round(20_000
        - 6_000 * speed(recovery) * recoveryCertainty * recoveryStability),
      rotationEnabled: !reduced && !dormant && !isInterrupted(fitness)
        && fitnessDirection !== 0 && fitnessCertainty > 0,
      rotationDirection: fitnessDirection === -1 ? -1 : 1,
      rotationCycleMs: Math.round(30_000
        - 10_000 * speed(fitness) * fitnessCertainty * fitnessStability),
      driftEnabled: !reduced && !dormant && !isInterrupted(lifestyle)
        && lifestyleCertainty > 0 && hasEstablishedObservation(lifestyle),
      driftDirection: directionalSign(lifestyle?.direction ?? 'unknown') === -1 ? -1 : 1,
      driftCycleMs: Math.round(18_000
        - 4_000 * speed(lifestyle) * lifestyleCertainty * lifestyleStability),
      driftDistance: 0.6 + 1.8 * lifestyleCertainty * lifestyleStability,
    },
  };
  return { ...basePlan, performance: performanceEstimate(basePlan) };
}

export function assertLivingSpherePerformanceBounds(plan: LivingSphereRenderPlan): void {
  const bounds = LIVING_SPHERE_PERFORMANCE_BOUNDS;
  if (plan.performance.svgElementCount > bounds.maxSvgElementCount) {
    throw new Error('Living Sphere exceeds the SVG element budget');
  }
  if (plan.performance.animatedValueCount > bounds.maxAnimatedValueCount) {
    throw new Error('Living Sphere exceeds the animated value budget');
  }
  if (plan.performance.activeAnimationCount > plan.performance.animatedValueCount) {
    throw new Error('Living Sphere has more active animations than animated values');
  }
  const shortest = plan.performance.shortestAnimationMs;
  if (shortest !== null && shortest < bounds.minAnimationDurationMs) {
    throw new Error('Living Sphere animation is faster than the calm-motion bound');
  }
}
