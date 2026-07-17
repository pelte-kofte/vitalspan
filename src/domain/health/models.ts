/**
 * Shared contracts for deterministic, domain-scoped health interpretation.
 * No contract permits diagnosis, treatment advice, biological-age calculation,
 * lifespan estimation, or cross-domain evidence.
 */

export const HEALTH_DOMAIN_IDS = [
  'blood',
  'sleep',
  'recovery',
  'fitness',
  'nutrition',
  'lifestyle',
  'medication',
  'supplement',
  'peptide',
  'therapy',
] as const;

export type HealthDomainId = (typeof HEALTH_DOMAIN_IDS)[number];

export const DOMAIN_STATES = [
  'excellent',
  'good',
  'stable',
  'needs_review',
  'attention_needed',
  'unknown',
] as const;

export type DomainState = (typeof DOMAIN_STATES)[number];

export const DOMAIN_STATE_LABELS: Readonly<Record<DomainState, string>> = {
  excellent: 'Excellent',
  good: 'Good',
  stable: 'Stable',
  needs_review: 'Needs Review',
  attention_needed: 'Attention Needed',
  unknown: 'Unknown',
};

/** @deprecated Use DomainState. Retained as a source-compatible type alias. */
export type DomainStatus = DomainState;
/** @deprecated Use DOMAIN_STATE_LABELS. */
export const DOMAIN_STATUS_LABELS = DOMAIN_STATE_LABELS;

/** Evidence quality, never health quality. */
export const DOMAIN_CONFIDENCE_LEVELS = [
  'insufficient',
  'limited',
  'moderate',
  'high',
  'very_high',
] as const;

export type DomainConfidence = (typeof DOMAIN_CONFIDENCE_LEVELS)[number];

export const DOMAIN_CONFIDENCE_LABELS: Readonly<Record<DomainConfidence, string>> = {
  insufficient: 'Insufficient',
  limited: 'Limited',
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
};

export const PROVENANCE_SOURCES = [
  'apple_health',
  'manual_entry',
  'calculated',
  'wearable',
  'laboratory',
  'future_integration',
] as const;

export type ProvenanceSource = (typeof PROVENANCE_SOURCES)[number];

export const SOURCE_RELIABILITY_LEVELS = [
  'unverified',
  'self_reported',
  'device_recorded',
  'clinically_verified',
  'deterministically_derived',
] as const;

export type SourceReliability = (typeof SOURCE_RELIABILITY_LEVELS)[number];

export interface MetricProvenance {
  source: ProvenanceSource;
  provider: string;
  /** Evidence-quality metadata supplied by the source adapter. */
  reliability: SourceReliability;
  /** When Vitalspan received this evidence. ISO 8601. */
  recordedAt: string;
  sourceRecordId?: string;
  integrationId?: string;
}

export type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };
export type DomainMetricValue = Exclude<JsonValue, null>;

export interface DomainCapabilityIdMap {
  blood: 'biomarkers' | 'inflammation' | 'cardiometabolic';
  sleep: 'duration' | 'consistency' | 'efficiency' | 'timing';
  recovery: 'hrv' | 'resting_heart_rate' | 'recovery_score' | 'body_temperature';
  fitness: 'vo2max' | 'activity' | 'strength' | 'mobility';
  nutrition: 'protein' | 'fiber' | 'hydration' | 'energy_balance';
  lifestyle: 'smoking' | 'alcohol' | 'stress' | 'sunlight';
  medication: 'current_medications' | 'history' | 'monitoring';
  supplement: 'active_supplements' | 'adherence' | 'scheduling';
  peptide: 'cycles' | 'dose' | 'storage' | 'injection_schedule' | 'monitoring';
  therapy: 'protocols' | 'recovery_therapies';
}

export type DomainCapabilityId<D extends HealthDomainId> = DomainCapabilityIdMap[D];

export const INTERPRETATION_BASES = [
  'source_reference',
  'validated_threshold',
  'longitudinal_pattern',
  'direct_observation',
  'record_completeness',
] as const;

export type InterpretationBasis = (typeof INTERPRETATION_BASES)[number];
export type EvidenceConsistency = 'consistent' | 'mixed' | 'unknown';

/**
 * A deterministic interpretation produced by a validated, domain-local adapter.
 * The shared engine reduces this evidence but never invents an interpretation
 * from an arbitrary raw value.
 */
export interface MetricInterpretation {
  state: DomainState;
  observation: string;
  basis: InterpretationBasis;
  /** Human-readable explanation of the declared interpretation basis. */
  basisDescription: string;
  consistency: EvidenceConsistency;
  strength?: string;
  gap?: string;
  monitoringPriority?: string;
}

export interface DomainMetric<D extends HealthDomainId> {
  id: string;
  capability: DomainCapabilityId<D>;
  label: string;
  value: DomainMetricValue;
  unit?: string;
  /** Groups observations from the same visit, night, session, or record set. */
  collectionId?: string;
  /** When the source observed the value. ISO 8601. */
  observedAt: string;
  provenance: NonEmptyReadonlyArray<MetricProvenance>;
  interpretation?: MetricInterpretation;
}

export interface DomainCapability<C extends string = string> {
  id: C;
  title: string;
  description: string;
  /** Factual copy used only when no evidence exists for this capability. */
  missingEvidence: string;
  /** A data-collection need, not treatment or health advice. */
  monitoringPriority: string;
}

export interface FutureDomainCapability {
  id: string;
  title: string;
  description: string;
  availability: 'future';
}

export interface DomainLimitation<C extends string = string> {
  code: string;
  message: string;
  affectedCapabilities: readonly C[];
}

export interface DomainEvidenceItem {
  id: string;
  text: string;
  supportingMetricIds: readonly string[];
}

export interface ObservedSignal<C extends string = string> extends DomainEvidenceItem {
  capability: C;
  state: DomainState;
  basis: InterpretationBasis | 'evidence_unavailable';
  basisDescription: string;
}

export interface DomainCurrentState extends DomainEvidenceItem {
  state: DomainState;
  label: string;
}

export interface DataCompleteness {
  state: 'none' | 'partial' | 'complete';
  availableCapabilities: number;
  totalCapabilities: number;
  missingCapabilities: readonly string[];
}

export type ConfidenceFactorId =
  | 'completeness'
  | 'consistency'
  | 'freshness'
  | 'source_reliability'
  | 'historical_depth';

export interface ConfidenceFactor {
  id: ConfidenceFactorId;
  level: DomainConfidence;
  explanation: string;
}

export interface DomainConfidenceAssessment {
  level: DomainConfidence;
  factors: readonly ConfidenceFactor[];
}

export interface EvidenceSummary {
  text: string;
  metricCount: number;
  collectionCount: number;
  providers: readonly string[];
  observedFrom: string | null;
  observedTo: string | null;
  supportingMetricIds: readonly string[];
}

export const TREND_DIRECTIONS = [
  'unknown',
  'improving',
  'stable',
  'declining',
  'emerging',
  'mixed',
] as const;

export type TrendDirection = (typeof TREND_DIRECTIONS)[number];

export const TREND_DIRECTION_LABELS: Readonly<Record<TrendDirection, string>> = {
  unknown: 'Unknown',
  improving: 'Improving',
  stable: 'Stable',
  declining: 'Declining',
  emerging: 'Emerging',
  mixed: 'Mixed',
};

export const TREND_PATTERNS = [
  'unknown',
  'stable_pattern',
  'emerging_pattern',
  'volatile_pattern',
  'seasonal_pattern',
  'interrupted_pattern',
] as const;

export type TrendPattern = (typeof TREND_PATTERNS)[number];

export const TREND_PATTERN_LABELS: Readonly<Record<TrendPattern, string>> = {
  unknown: 'Unknown',
  stable_pattern: 'Stable Pattern',
  emerging_pattern: 'Emerging Pattern',
  volatile_pattern: 'Volatile Pattern',
  seasonal_pattern: 'Seasonal Pattern',
  interrupted_pattern: 'Interrupted Pattern',
};

export type TrendPersistence = 'recent' | 'established' | 'long_term' | 'unknown';
export type TrendVelocity = 'slow' | 'moderate' | 'rapid' | 'unknown';
export type TrendInterval = 'daily' | 'weekly' | 'monthly' | 'visit_based' | 'irregular';

export const TREND_PERSISTENCE_LABELS: Readonly<Record<TrendPersistence, string>> = {
  recent: 'Recent', established: 'Established', long_term: 'Long-term', unknown: 'Unknown',
};

export const TREND_VELOCITY_LABELS: Readonly<Record<TrendVelocity, string>> = {
  slow: 'Slow', moderate: 'Moderate', rapid: 'Rapid', unknown: 'Unknown',
};

/** A prior domain-level interpretation; raw metric values are intentionally absent. */
export interface DomainHistorySnapshot<D extends HealthDomainId> {
  id: string;
  domainId: D;
  state: DomainState;
  observedAt: string;
  provenance: NonEmptyReadonlyArray<MetricProvenance>;
  supportingMetricIds: readonly string[];
}

export interface TrendMissingPeriod {
  from: string;
  to: string;
  reason: string;
}

export interface StructuredPatternEvidence {
  pattern: 'seasonal_pattern';
  explanation: string;
  supportingSnapshotIds: NonEmptyReadonlyArray<string>;
}

export interface DomainTrendHistory<D extends HealthDomainId> {
  snapshots: readonly DomainHistorySnapshot<D>[];
  interval: TrendInterval;
  supportedIntervals: number;
  missingPeriods?: readonly TrendMissingPeriod[];
  patternEvidence?: StructuredPatternEvidence;
}

export interface TrendTimeSpan {
  startedAt: string | null;
  endedAt: string | null;
  durationDays: number;
}

export interface TrendHistoricalCoverage {
  historyLength: { value: number; unit: 'days' };
  observationCount: number;
  timeSpan: TrendTimeSpan;
  interval: TrendInterval | 'unavailable';
  supportedIntervals: number;
  missingPeriods: readonly TrendMissingPeriod[];
}

export type TrendConfidenceFactorId =
  | 'historical_depth'
  | 'continuity'
  | 'freshness'
  | 'source_reliability'
  | 'directional_consistency';

export interface TrendConfidenceFactor {
  id: TrendConfidenceFactorId;
  level: DomainConfidence;
  explanation: string;
}

export interface TrendConfidenceAssessment {
  level: DomainConfidence;
  factors: readonly TrendConfidenceFactor[];
}

export interface TrendExplanation {
  text: string;
  supportingSnapshotIds: readonly string[];
}

export interface TrendProvenanceRecord extends MetricProvenance {
  supportingSnapshotIds: readonly string[];
}

export interface TrendLimitation {
  code:
    | 'insufficient_historical_depth'
    | 'limited_history'
    | 'missing_observation_window'
    | 'unknown_historical_state'
    | 'irregular_observation_intervals'
    | 'irregular_manual_logging'
    | 'sparse_laboratory_history'
    | 'source_reliability_limited';
  message: string;
}

export interface DomainTrendState<D extends HealthDomainId = HealthDomainId> {
  domainId: D;
  direction: TrendDirection;
  confidence: TrendConfidenceAssessment;
  pattern: TrendPattern;
  persistence: TrendPersistence;
  velocity: TrendVelocity;
  historicalCoverage: TrendHistoricalCoverage;
  explanation: TrendExplanation;
  provenance: readonly TrendProvenanceRecord[];
  limitations: readonly TrendLimitation[];
}

export interface DomainEngineInput<D extends HealthDomainId> {
  /** Required for deterministic freshness evaluation. ISO 8601. */
  asOf: string;
  metrics?: readonly DomainMetric<D>[];
  limitations?: readonly DomainLimitation<DomainCapabilityId<D>>[];
  /** Structured domain-state history only. Raw historical metric values are prohibited. */
  trendHistory?: DomainTrendHistory<D>;
}

export interface HealthDomainState<D extends HealthDomainId = HealthDomainId> {
  id: D;
  title: string;
  currentState: DomainCurrentState;
  primaryDriver: DomainEvidenceItem;
  observedSignals: readonly ObservedSignal<DomainCapabilityId<D>>[];
  knownStrengths: readonly DomainEvidenceItem[];
  knownGaps: readonly DomainEvidenceItem[];
  monitoringPriorities: readonly DomainEvidenceItem[];
  futureOpportunities: readonly FutureDomainCapability[];
  limitations: readonly DomainLimitation<DomainCapabilityId<D>>[];
  evidenceSummary: EvidenceSummary;
  confidence: DomainConfidenceAssessment;
  provenance: readonly MetricProvenance[];
  availableMetrics: readonly DomainMetric<D>[];
  lastUpdated: string | null;
  dataCompleteness: DataCompleteness;
  trend: DomainTrendState<D>;
}

export interface DomainEvidencePolicy {
  freshnessWindowDays: number;
  moderateHistoryCollections: number;
  strongHistoryCollections: number;
  metricLabel: { singular: string; plural: string };
  collectionLabel: { singular: string; plural: string };
}

export interface HealthDomainDefinition<D extends HealthDomainId> {
  id: D;
  title: string;
  capabilities: readonly DomainCapability<DomainCapabilityId<D>>[];
  futureCapabilities: readonly FutureDomainCapability[];
  noDataLimitation: string;
  evidencePolicy: DomainEvidencePolicy;
}

export interface HealthDomainEngine<D extends HealthDomainId> {
  readonly id: D;
  readonly definition: HealthDomainDefinition<D>;
  build(input?: DomainEngineInput<D>): HealthDomainState<D>;
}

export type AnyHealthDomainState = {
  [D in HealthDomainId]: HealthDomainState<D>;
}[HealthDomainId];

export type HealthDomainInputMap = {
  [D in HealthDomainId]: DomainEngineInput<D>;
};

/** Genetics remains a non-executable placeholder. */
export interface GeneticsDomainPlaceholder {
  readonly id: 'genetics';
  readonly title: 'Genetics';
  readonly implementationStatus: 'placeholder';
  readonly futureCapabilities: readonly FutureDomainCapability[];
}
