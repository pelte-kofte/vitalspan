import type {
  ConfidenceFactor,
  DataCompleteness,
  DomainConfidence,
  DomainEvidenceItem,
  DomainState,
  EvidenceSummary,
  HealthDomainState,
  InterpretationBasis,
  ProvenanceSource,
  SourceReliability,
  TrendDirection,
  TrendLimitation,
  TrendPattern,
  TrendPersistence,
  TrendVelocity,
} from '../health';

export const LIVING_SPHERE_DOMAIN_IDS = [
  'blood',
  'sleep',
  'recovery',
  'fitness',
  'nutrition',
  'lifestyle',
] as const;

export type LivingSphereDomainId = (typeof LIVING_SPHERE_DOMAIN_IDS)[number];

export const LIVING_SPHERE_EXCLUDED_DOMAIN_IDS = [
  'medication',
  'supplement',
  'peptide',
  'therapy',
  'genetics',
] as const;

export type LivingSphereExcludedDomainId = (typeof LIVING_SPHERE_EXCLUDED_DOMAIN_IDS)[number];

export type SphereDomainState<D extends LivingSphereDomainId> = HealthDomainState<D>;

export interface LivingSphereSignal {
  capability: string;
  state: DomainState;
  text: string;
  basis: InterpretationBasis | 'evidence_unavailable';
  basisDescription: string;
  supportingMetricIds: readonly string[];
}

/** A projection of domain intelligence. Raw metric values are deliberately absent. */
export interface LivingSphereDomainInput<D extends LivingSphereDomainId = LivingSphereDomainId> {
  id: D;
  title: string;
  currentState: DomainState;
  confidence: DomainConfidence;
  dataCompleteness: DataCompleteness;
  freshness: ConfidenceFactor;
  historicalDepth: ConfidenceFactor;
  consistency: ConfidenceFactor;
  observedSignals: readonly LivingSphereSignal[];
  knownGaps: readonly DomainEvidenceItem[];
  limitations: readonly { code: string; message: string; affectedCapabilities: readonly string[] }[];
  evidenceSummary: EvidenceSummary;
  /** Deterministic domain-level trend semantics. Historical raw values are absent. */
  trend: LivingSphereTrendInput;
  lastUpdated: string | null;
}

export interface LivingSphereTrendInput {
  direction: TrendDirection;
  confidence: DomainConfidence;
  pattern: TrendPattern;
  persistence: TrendPersistence;
  velocity: TrendVelocity;
  historicalCoverage: {
    observationCount: number;
    durationDays: number;
    supportedIntervals: number;
    missingPeriodCount: number;
  };
  explanation: string;
  provenance: readonly {
    source: ProvenanceSource;
    provider: string;
    reliability: SourceReliability;
  }[];
  limitations: readonly TrendLimitation[];
}

export interface LivingSphereInput {
  /** Required to keep validation and aggregation deterministic. ISO 8601. */
  asOf: string;
  domains: readonly LivingSphereDomainInput[];
  reduceMotion: boolean;
}

export const LIVING_SPHERE_LAYER_IDS = [
  'core_vitality',
  'atmospheric_rhythm',
  'internal_flow',
  'kinetic_presence',
  'surface_richness',
  'environmental_stability',
  'evidence_clarity',
] as const;

export type LivingSphereLayerId = (typeof LIVING_SPHERE_LAYER_IDS)[number];

export type DomainMappedLayerId = Exclude<LivingSphereLayerId, 'evidence_clarity'>;

export type VisualMagnitude = 'dormant' | 'restrained' | 'balanced' | 'expressive' | 'pronounced';
export type VisualContinuity = 'indeterminate' | 'open' | 'continuous' | 'coherent' | 'variable';
export type VisualRegularity = 'indeterminate' | 'subdued' | 'steady' | 'regular' | 'variable';
export type VisualSoftness = 'muted' | 'soft' | 'balanced' | 'defined';
export type VisualNoise = 'quiet' | 'muted' | 'textured' | 'active';
export type VisualDrift = 'none' | 'subtle' | 'steady' | 'variable';
export type VisualClarity = 'obscured' | 'muted' | 'partial' | 'clear' | 'crystalline';
export type LayerVisibility = 'hidden' | 'hinted' | 'partial' | 'clear';

export interface LivingSphereLayerPropertyMap {
  core_vitality: {
    luminosity: VisualMagnitude;
    density: VisualMagnitude;
    continuity: VisualContinuity;
  };
  atmospheric_rhythm: {
    breathCadence: VisualRegularity;
    haloSoftness: VisualSoftness;
    expansionRegularity: VisualRegularity;
  };
  internal_flow: {
    flowContinuity: VisualContinuity;
    pulseStability: VisualRegularity;
    movementCoherence: VisualContinuity;
  };
  kinetic_presence: {
    rotationalEnergy: VisualMagnitude;
    structuralResponsiveness: VisualRegularity;
    movementRange: VisualMagnitude;
  };
  surface_richness: {
    textureRichness: VisualMagnitude;
    surfaceContinuity: VisualContinuity;
    organicDetail: VisualMagnitude;
  };
  environmental_stability: {
    spatialSteadiness: VisualRegularity;
    ambientNoise: VisualNoise;
    drift: VisualDrift;
    environmentalCalm: VisualSoftness;
  };
  evidence_clarity: {
    sharpness: VisualClarity;
    opacity: VisualClarity;
    detailVisibility: LayerVisibility;
    ambiguity: 'high' | 'moderate' | 'low' | 'none';
  };
}

export interface LivingSphereLayerState<L extends LivingSphereLayerId = LivingSphereLayerId> {
  id: L;
  represented: boolean;
  sourceDomain: LivingSphereDomainId | 'aggregate' | null;
  sourceState: DomainState | null;
  visibility: LayerVisibility;
  properties: LivingSphereLayerPropertyMap[L];
}

export type AnyLivingSphereLayerState = {
  [L in LivingSphereLayerId]: LivingSphereLayerState<L>;
}[LivingSphereLayerId];

export type LivingSphereLayerStateMap = {
  [L in LivingSphereLayerId]: LivingSphereLayerState<L>;
};

export type LivingSphereTemporalStability =
  | 'snapshot'
  | 'emerging_trend'
  | 'stable_pattern'
  | 'volatile_pattern'
  | 'seasonal_pattern'
  | 'interrupted_pattern'
  | 'insufficient_history';

export type LivingSphereCoherence = 'dormant' | 'layered' | 'coherent' | 'variable';

export type LivingSphereEvidenceMode =
  | 'no_evidence'
  | 'limited_evidence'
  | 'stale_evidence'
  | 'conflicting_evidence'
  | 'sufficient_evidence';

export type LivingSphereFallbackReason = {
  code: LivingSphereEvidenceMode;
  isFallback: boolean;
  message: string;
  affectedDomains: readonly LivingSphereDomainId[];
};

export interface LivingSphereUncertaintyReason {
  code: 'missing_domain' | 'low_confidence' | 'stale_evidence' | 'conflicting_state';
  message: string;
  affectedDomains: readonly LivingSphereDomainId[];
}

export interface LivingSphereUncertaintyState {
  mode: 'none' | 'missing_data' | 'low_confidence' | 'stale_data' | 'conflicting_states' | 'compound';
  ambiguity: 'high' | 'moderate' | 'low' | 'none';
  reasons: readonly LivingSphereUncertaintyReason[];
}

export type LivingSphereMotionMode = 'dormant' | 'static' | 'subdued' | 'gentle' | 'coherent' | 'variable';

export interface LivingSphereLayerMotionProfile {
  sourceDomain: LivingSphereDomainId;
  direction: TrendDirection;
  confidence: DomainConfidence;
  pattern: TrendPattern;
  persistence: TrendPersistence;
  velocity: TrendVelocity;
}

export type LivingSphereLayerMotionMap = {
  [L in DomainMappedLayerId]: LivingSphereLayerMotionProfile | null;
};

export interface LivingSphereMotionState {
  mode: LivingSphereMotionMode;
  reduceMotionApplied: boolean;
  animationRequiredForMeaning: false;
  staticContinuity: VisualContinuity;
  staticClarity: VisualClarity;
  layerProfiles: LivingSphereLayerMotionMap;
}

export type LivingSpherePaletteRole =
  | 'neutral_base'
  | 'warm_vitality'
  | 'cool_depth'
  | 'muted_uncertainty'
  | 'soft_attention'
  | 'atmospheric_highlight';

export interface LivingSpherePaletteState {
  base: 'neutral_base';
  primaryAccent: LivingSpherePaletteRole;
  secondaryAccent: LivingSpherePaletteRole;
  uncertaintyAccent: 'muted_uncertainty';
  colorIsSoleStateCarrier: false;
}

export interface LivingSphereLayerExplanation {
  layer: LivingSphereLayerId;
  sourceDomain: LivingSphereDomainId | 'aggregate' | null;
  represented: boolean;
  reason: string;
  evidenceSummary: string | null;
  updatedAt: string | null;
}

export interface LivingSphereExplanation {
  representedDomains: readonly LivingSphereDomainId[];
  missingDomains: readonly LivingSphereDomainId[];
  layerInfluences: readonly LivingSphereLayerExplanation[];
  clarityLimitations: readonly string[];
  lastUpdated: string | null;
  fallback: LivingSphereFallbackReason;
  displayStrings: readonly string[];
}

export interface LivingSphereAccessibilitySummary {
  livingState: string;
  evidenceClarity: string;
  representedDomains: string;
  limitedBy: string;
  motion: string;
  text: string;
}

export interface LivingSphereVisualState {
  schemaVersion: '1.0';
  layers: LivingSphereLayerStateMap;
  overallCoherence: LivingSphereCoherence;
  overallEvidenceClarity: VisualClarity;
  temporalStability: LivingSphereTemporalStability;
  dominantInfluence: LivingSphereDomainId | null;
  availableDomainCount: number;
  missingDomainCount: number;
  evidenceMode: LivingSphereEvidenceMode;
  fallback: LivingSphereFallbackReason;
  uncertainty: LivingSphereUncertaintyState;
  motion: LivingSphereMotionState;
  palette: LivingSpherePaletteState;
  explanation: LivingSphereExplanation;
  accessibility: LivingSphereAccessibilitySummary;
}

/** Stable, renderer-library-independent data contract. */
export interface LivingSphereRendererContract {
  contractVersion: '1.0';
  state: LivingSphereVisualState;
  reduceMotion: boolean;
  accessibility: LivingSphereAccessibilitySummary;
}
