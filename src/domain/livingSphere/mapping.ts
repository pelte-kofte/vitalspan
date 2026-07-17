import type { ConfidenceFactor, DomainConfidence, DomainState } from '../health';
import { DOMAIN_LAYER_MAP } from './defaults';
import type {
  AnyLivingSphereLayerState,
  LayerVisibility,
  LivingSphereDomainId,
  LivingSphereDomainInput,
  LivingSphereInput,
  SphereDomainState,
  VisualContinuity,
  VisualDrift,
  VisualMagnitude,
  VisualNoise,
  VisualRegularity,
  VisualSoftness,
} from './models';

interface DomainExpression {
  magnitude: VisualMagnitude;
  continuity: VisualContinuity;
  regularity: VisualRegularity;
  softness: VisualSoftness;
  noise: VisualNoise;
  drift: VisualDrift;
}

const STATE_EXPRESSIONS: Readonly<Record<DomainState, DomainExpression>> = {
  unknown: {
    magnitude: 'restrained', continuity: 'indeterminate', regularity: 'indeterminate',
    softness: 'muted', noise: 'muted', drift: 'none',
  },
  excellent: {
    magnitude: 'expressive', continuity: 'coherent', regularity: 'regular',
    softness: 'defined', noise: 'quiet', drift: 'subtle',
  },
  good: {
    magnitude: 'balanced', continuity: 'continuous', regularity: 'regular',
    softness: 'balanced', noise: 'quiet', drift: 'subtle',
  },
  stable: {
    magnitude: 'balanced', continuity: 'continuous', regularity: 'steady',
    softness: 'soft', noise: 'muted', drift: 'steady',
  },
  needs_review: {
    magnitude: 'balanced', continuity: 'variable', regularity: 'variable',
    softness: 'soft', noise: 'textured', drift: 'variable',
  },
  attention_needed: {
    magnitude: 'pronounced', continuity: 'variable', regularity: 'variable',
    softness: 'defined', noise: 'active', drift: 'variable',
  },
};

function factor(state: SphereDomainState<LivingSphereDomainId>, id: ConfidenceFactor['id']): ConfidenceFactor {
  const value = state.confidence.factors.find(item => item.id === id);
  if (!value) throw new Error(`${state.id} confidence is missing ${id}`);
  return { ...value };
}

/** Removes raw metrics and all protocol/recommendation concepts at the boundary. */
export function toLivingSphereDomainInput<D extends LivingSphereDomainId>(
  state: SphereDomainState<D>,
): LivingSphereDomainInput<D> {
  return {
    id: state.id,
    title: state.title,
    currentState: state.currentState.state,
    confidence: state.confidence.level,
    dataCompleteness: {
      ...state.dataCompleteness,
      missingCapabilities: [...state.dataCompleteness.missingCapabilities],
    },
    freshness: factor(state, 'freshness'),
    historicalDepth: factor(state, 'historical_depth'),
    consistency: factor(state, 'consistency'),
    observedSignals: state.observedSignals.map(signal => ({
      capability: signal.capability,
      state: signal.state,
      text: signal.text,
      basis: signal.basis,
      basisDescription: signal.basisDescription,
      supportingMetricIds: [...signal.supportingMetricIds],
    })),
    knownGaps: state.knownGaps.map(gap => ({ ...gap, supportingMetricIds: [...gap.supportingMetricIds] })),
    limitations: state.limitations.map(limitation => ({
      code: limitation.code,
      message: limitation.message,
      affectedCapabilities: [...limitation.affectedCapabilities],
    })),
    evidenceSummary: {
      ...state.evidenceSummary,
      providers: [...state.evidenceSummary.providers],
      supportingMetricIds: [...state.evidenceSummary.supportingMetricIds],
    },
    trend: {
      direction: state.trend.direction,
      confidence: state.trend.confidence.level,
      pattern: state.trend.pattern,
      persistence: state.trend.persistence,
      velocity: state.trend.velocity,
      historicalCoverage: {
        observationCount: state.trend.historicalCoverage.observationCount,
        durationDays: state.trend.historicalCoverage.timeSpan.durationDays,
        supportedIntervals: state.trend.historicalCoverage.supportedIntervals,
        missingPeriodCount: state.trend.historicalCoverage.missingPeriods.length,
      },
      explanation: state.trend.explanation.text,
      provenance: state.trend.provenance.map(item => ({
        source: item.source,
        provider: item.provider,
        reliability: item.reliability,
      })),
      limitations: state.trend.limitations.map(item => ({ ...item })),
    },
    lastUpdated: state.lastUpdated,
  };
}

export function createLivingSphereInput(input: {
  asOf: string;
  domains: readonly SphereDomainState<LivingSphereDomainId>[];
  reduceMotion: boolean;
}): LivingSphereInput {
  return {
    asOf: input.asOf,
    domains: input.domains.map(domain => toLivingSphereDomainInput(domain)),
    reduceMotion: input.reduceMotion,
  };
}

function visibility(confidence: DomainConfidence, completeness: LivingSphereDomainInput['dataCompleteness']): LayerVisibility {
  if (completeness.state === 'none') return 'hidden';
  if (confidence === 'insufficient') return 'hinted';
  if (confidence === 'limited' || confidence === 'moderate' || completeness.state === 'partial') return 'partial';
  return 'clear';
}

/** Maps one domain to exactly one documented visual layer. */
export function mapDomainToLayer(domain: LivingSphereDomainInput): AnyLivingSphereLayerState {
  const expression = STATE_EXPRESSIONS[domain.currentState];
  const shared = {
    represented: domain.dataCompleteness.state !== 'none',
    sourceDomain: domain.id,
    sourceState: domain.currentState,
    visibility: visibility(domain.confidence, domain.dataCompleteness),
  } as const;

  switch (DOMAIN_LAYER_MAP[domain.id]) {
    case 'core_vitality':
      return { id: 'core_vitality', ...shared, properties: {
        luminosity: expression.magnitude,
        density: domain.currentState === 'unknown' ? 'restrained' : expression.magnitude,
        continuity: expression.continuity,
      } };
    case 'atmospheric_rhythm':
      return { id: 'atmospheric_rhythm', ...shared, properties: {
        breathCadence: expression.regularity,
        haloSoftness: expression.softness,
        expansionRegularity: expression.regularity,
      } };
    case 'internal_flow':
      return { id: 'internal_flow', ...shared, properties: {
        flowContinuity: expression.continuity,
        pulseStability: expression.regularity,
        movementCoherence: expression.continuity,
      } };
    case 'kinetic_presence':
      return { id: 'kinetic_presence', ...shared, properties: {
        rotationalEnergy: expression.magnitude,
        structuralResponsiveness: expression.regularity,
        movementRange: expression.magnitude,
      } };
    case 'surface_richness':
      return { id: 'surface_richness', ...shared, properties: {
        textureRichness: expression.magnitude,
        surfaceContinuity: expression.continuity,
        organicDetail: expression.magnitude,
      } };
    case 'environmental_stability':
      return { id: 'environmental_stability', ...shared, properties: {
        spatialSteadiness: expression.regularity,
        ambientNoise: expression.noise,
        drift: expression.drift,
        environmentalCalm: expression.softness,
      } };
  }
}
