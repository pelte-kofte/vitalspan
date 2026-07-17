import {
  DOMAIN_CONFIDENCE_LEVELS,
  DOMAIN_STATES,
  INTERPRETATION_BASES,
  PROVENANCE_SOURCES,
  SOURCE_RELIABILITY_LEVELS,
  TREND_DIRECTIONS,
  TREND_PATTERNS,
} from '../health';
import { DOMAIN_LAYER_MAP } from './defaults';
import { LIVING_SPHERE_DOMAIN_IDS, LIVING_SPHERE_LAYER_IDS } from './models';
import type {
  LivingSphereDomainInput,
  LivingSphereInput,
  LivingSphereLayerId,
  DomainMappedLayerId,
  LivingSphereRendererContract,
  LivingSphereVisualState,
} from './models';

const DOMAIN_INPUT_KEYS = [
  'id', 'title', 'currentState', 'confidence', 'dataCompleteness', 'freshness',
  'historicalDepth', 'consistency', 'observedSignals', 'knownGaps', 'limitations',
  'evidenceSummary', 'trend', 'lastUpdated',
] as const;
const INPUT_KEYS = ['asOf', 'domains', 'reduceMotion'] as const;
const SIGNAL_KEYS = ['capability', 'state', 'text', 'basis', 'basisDescription', 'supportingMetricIds'] as const;
const COMPLETENESS_KEYS = ['state', 'availableCapabilities', 'totalCapabilities', 'missingCapabilities'] as const;
const FACTOR_KEYS = ['id', 'level', 'explanation'] as const;
const EVIDENCE_ITEM_KEYS = ['id', 'text', 'supportingMetricIds'] as const;
const LIMITATION_KEYS = ['code', 'message', 'affectedCapabilities'] as const;
const SUMMARY_KEYS = [
  'text', 'metricCount', 'collectionCount', 'providers', 'observedFrom', 'observedTo', 'supportingMetricIds',
] as const;
const TREND_KEYS = [
  'direction', 'confidence', 'pattern', 'persistence', 'velocity', 'historicalCoverage',
  'explanation', 'provenance', 'limitations',
] as const;
const TREND_COVERAGE_KEYS = [
  'observationCount', 'durationDays', 'supportedIntervals', 'missingPeriodCount',
] as const;
const TREND_PROVENANCE_KEYS = ['source', 'provider', 'reliability'] as const;
const TREND_LIMITATION_KEYS = ['code', 'message'] as const;
const VISUAL_STATE_KEYS = [
  'schemaVersion', 'layers', 'overallCoherence', 'overallEvidenceClarity', 'temporalStability',
  'dominantInfluence', 'availableDomainCount', 'missingDomainCount', 'evidenceMode', 'fallback',
  'uncertainty', 'motion', 'palette', 'explanation', 'accessibility',
] as const;
const LAYER_KEYS = ['id', 'represented', 'sourceDomain', 'sourceState', 'visibility', 'properties'] as const;
const PROPERTY_KEYS: Readonly<Record<LivingSphereLayerId, readonly string[]>> = {
  core_vitality: ['luminosity', 'density', 'continuity'],
  atmospheric_rhythm: ['breathCadence', 'haloSoftness', 'expansionRegularity'],
  internal_flow: ['flowContinuity', 'pulseStability', 'movementCoherence'],
  kinetic_presence: ['rotationalEnergy', 'structuralResponsiveness', 'movementRange'],
  surface_richness: ['textureRichness', 'surfaceContinuity', 'organicDetail'],
  environmental_stability: ['spatialSteadiness', 'ambientNoise', 'drift', 'environmentalCalm'],
  evidence_clarity: ['sharpness', 'opacity', 'detailVisibility', 'ambiguity'],
};
const MAGNITUDES = ['dormant', 'restrained', 'balanced', 'expressive', 'pronounced'] as const;
const CONTINUITIES = ['indeterminate', 'open', 'continuous', 'coherent', 'variable'] as const;
const REGULARITIES = ['indeterminate', 'subdued', 'steady', 'regular', 'variable'] as const;
const SOFTNESSES = ['muted', 'soft', 'balanced', 'defined'] as const;
const NOISES = ['quiet', 'muted', 'textured', 'active'] as const;
const DRIFTS = ['none', 'subtle', 'steady', 'variable'] as const;
const CLARITIES = ['obscured', 'muted', 'partial', 'clear', 'crystalline'] as const;
const VISIBILITIES = ['hidden', 'hinted', 'partial', 'clear'] as const;
const AMBIGUITIES = ['high', 'moderate', 'low', 'none'] as const;
const COHERENCES = ['dormant', 'layered', 'coherent', 'variable'] as const;
const TEMPORAL_STATES = [
  'snapshot', 'emerging_trend', 'stable_pattern', 'volatile_pattern', 'seasonal_pattern',
  'interrupted_pattern', 'insufficient_history',
] as const;
const EVIDENCE_MODES = ['no_evidence', 'limited_evidence', 'stale_evidence', 'conflicting_evidence', 'sufficient_evidence'] as const;
const UNCERTAINTY_MODES = ['none', 'missing_data', 'low_confidence', 'stale_data', 'conflicting_states', 'compound'] as const;
const MOTION_MODES = ['dormant', 'static', 'subdued', 'gentle', 'coherent', 'variable'] as const;
const PERSISTENCE_VALUES = ['recent', 'established', 'long_term', 'unknown'] as const;
const VELOCITY_VALUES = ['slow', 'moderate', 'rapid', 'unknown'] as const;
const MOTION_KEYS = [
  'mode', 'reduceMotionApplied', 'animationRequiredForMeaning', 'staticContinuity',
  'staticClarity', 'layerProfiles',
] as const;
const MOTION_PROFILE_KEYS = [
  'sourceDomain', 'direction', 'confidence', 'pattern', 'persistence', 'velocity',
] as const;
const MOTION_LAYER_IDS: readonly DomainMappedLayerId[] = [
  'core_vitality', 'atmospheric_rhythm', 'internal_flow', 'kinetic_presence',
  'surface_richness', 'environmental_stability',
];
const PALETTE_ROLES = [
  'neutral_base', 'warm_vitality', 'cool_depth', 'muted_uncertainty', 'soft_attention', 'atmospheric_highlight',
] as const;
const RENDERER_CONTRACT_KEYS = ['contractVersion', 'state', 'reduceMotion', 'accessibility'] as const;
const ACCESSIBILITY_KEYS = [
  'livingState', 'evidenceClarity', 'representedDomains', 'limitedBy', 'motion', 'text',
] as const;

function assertTimestamp(value: string, field: string): void {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${field} must be a valid date`);
}

function assertExactKeys(value: object, allowed: readonly string[], field: string): void {
  const unexpected = Object.keys(value).filter(key => !allowed.includes(key));
  if (unexpected.length > 0) throw new Error(`${field} contains unsupported fields: ${unexpected.join(', ')}`);
}

function assertInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${field} must be a non-negative integer`);
}

function assertFactor(
  factor: LivingSphereDomainInput['freshness'],
  expectedId: 'freshness' | 'historical_depth' | 'consistency',
  field: string,
): void {
  assertExactKeys(factor, FACTOR_KEYS, field);
  if (factor.id !== expectedId) throw new Error(`${field} must use the ${expectedId} confidence factor`);
  if (!DOMAIN_CONFIDENCE_LEVELS.includes(factor.level)) throw new Error(`${field} has unsupported confidence`);
  if (!factor.explanation.trim()) throw new Error(`${field} requires an explanation`);
}

function validateDomain(domain: LivingSphereDomainInput, asOf: string): void {
  assertExactKeys(domain, DOMAIN_INPUT_KEYS, `Living Sphere ${domain.id}`);
  if (!LIVING_SPHERE_DOMAIN_IDS.includes(domain.id)) throw new Error(`Unsupported Living Sphere domain: ${domain.id}`);
  if (!DOMAIN_STATES.includes(domain.currentState)) throw new Error(`${domain.id} has unsupported state`);
  if (!DOMAIN_CONFIDENCE_LEVELS.includes(domain.confidence)) throw new Error(`${domain.id} has unsupported confidence`);
  const completeness = domain.dataCompleteness;
  assertExactKeys(completeness, COMPLETENESS_KEYS, `${domain.id} completeness`);
  assertInteger(completeness.availableCapabilities, `${domain.id} available capabilities`);
  assertInteger(completeness.totalCapabilities, `${domain.id} total capabilities`);
  if (completeness.availableCapabilities > completeness.totalCapabilities) {
    throw new Error(`${domain.id} available capabilities exceed total capabilities`);
  }
  if (completeness.state === 'none' && completeness.availableCapabilities !== 0) {
    throw new Error(`${domain.id} none completeness must have zero available capabilities`);
  }
  if (completeness.state === 'complete'
    && completeness.availableCapabilities !== completeness.totalCapabilities) {
    throw new Error(`${domain.id} complete evidence must include every capability`);
  }
  assertFactor(domain.freshness, 'freshness', `${domain.id} freshness`);
  assertFactor(domain.historicalDepth, 'historical_depth', `${domain.id} historical depth`);
  assertFactor(domain.consistency, 'consistency', `${domain.id} consistency`);
  for (const signal of domain.observedSignals) {
    assertExactKeys(signal, SIGNAL_KEYS, `${domain.id} signal`);
    if (!DOMAIN_STATES.includes(signal.state)) throw new Error(`${domain.id} signal has unsupported state`);
    if (![...INTERPRETATION_BASES, 'evidence_unavailable'].includes(signal.basis)) {
      throw new Error(`${domain.id} signal has unsupported interpretation basis`);
    }
    if (!signal.basisDescription.trim()) throw new Error(`${domain.id} signal requires a basis description`);
  }
  for (const gap of domain.knownGaps) assertExactKeys(gap, EVIDENCE_ITEM_KEYS, `${domain.id} gap`);
  for (const limitation of domain.limitations) {
    assertExactKeys(limitation, LIMITATION_KEYS, `${domain.id} limitation`);
  }
  if (domain.lastUpdated) {
    assertTimestamp(domain.lastUpdated, `${domain.id} lastUpdated`);
    if (Date.parse(domain.lastUpdated) > Date.parse(asOf)) throw new Error(`${domain.id} lastUpdated cannot be after asOf`);
  }
  assertExactKeys(domain.evidenceSummary, SUMMARY_KEYS, `${domain.id} evidence summary`);
  assertInteger(domain.evidenceSummary.metricCount, `${domain.id} metric count`);
  assertInteger(domain.evidenceSummary.collectionCount, `${domain.id} collection count`);
  for (const date of [domain.evidenceSummary.observedFrom, domain.evidenceSummary.observedTo]) {
    if (date) assertTimestamp(date, `${domain.id} evidence summary date`);
  }
  const trend = domain.trend;
  assertExactKeys(trend, TREND_KEYS, `${domain.id} trend`);
  assertOneOf(trend.direction, TREND_DIRECTIONS, `${domain.id} trend direction`);
  assertOneOf(trend.confidence, DOMAIN_CONFIDENCE_LEVELS, `${domain.id} trend confidence`);
  assertOneOf(trend.pattern, TREND_PATTERNS, `${domain.id} trend pattern`);
  assertOneOf(trend.persistence, PERSISTENCE_VALUES, `${domain.id} trend persistence`);
  assertOneOf(trend.velocity, VELOCITY_VALUES, `${domain.id} trend velocity`);
  assertExactKeys(trend.historicalCoverage, TREND_COVERAGE_KEYS, `${domain.id} trend coverage`);
  assertInteger(trend.historicalCoverage.observationCount, `${domain.id} trend observation count`);
  assertInteger(trend.historicalCoverage.durationDays, `${domain.id} trend duration`);
  assertInteger(trend.historicalCoverage.supportedIntervals, `${domain.id} trend supported intervals`);
  assertInteger(trend.historicalCoverage.missingPeriodCount, `${domain.id} trend missing periods`);
  if (!trend.explanation.trim()) throw new Error(`${domain.id} trend requires an explanation`);
  for (const provenance of trend.provenance) {
    assertExactKeys(provenance, TREND_PROVENANCE_KEYS, `${domain.id} trend provenance`);
    assertOneOf(provenance.source, PROVENANCE_SOURCES, `${domain.id} trend provenance source`);
    assertOneOf(provenance.reliability, SOURCE_RELIABILITY_LEVELS, `${domain.id} trend reliability`);
    if (!provenance.provider.trim()) throw new Error(`${domain.id} trend provenance requires a provider`);
  }
  for (const limitation of trend.limitations) {
    assertExactKeys(limitation, TREND_LIMITATION_KEYS, `${domain.id} trend limitation`);
    if (!limitation.code.trim() || !limitation.message.trim()) {
      throw new Error(`${domain.id} trend limitations require a code and message`);
    }
  }
}

/** Validates the raw-data exclusion boundary and all deterministic inputs. */
export function validateLivingSphereInput(input: LivingSphereInput): void {
  assertExactKeys(input, INPUT_KEYS, 'Living Sphere input');
  assertTimestamp(input.asOf, 'Living Sphere asOf');
  const ids = new Set<string>();
  for (const domain of input.domains) {
    if (ids.has(domain.id)) throw new Error(`Duplicate Living Sphere domain: ${domain.id}`);
    ids.add(domain.id);
    validateDomain(domain, input.asOf);
  }
}

function assertOneOf(value: string, allowed: readonly string[], field: string): void {
  if (!allowed.includes(value)) throw new Error(`${field} has out-of-contract value: ${value}`);
}

function validateLayer(state: LivingSphereVisualState, id: LivingSphereLayerId): void {
  const layer = state.layers[id];
  assertExactKeys(layer, LAYER_KEYS, `${id} layer`);
  assertExactKeys(layer.properties, PROPERTY_KEYS[id], `${id} properties`);
  if (layer.id !== id) throw new Error(`${id} layer id mismatch`);
  assertOneOf(layer.visibility, VISIBILITIES, `${id} visibility`);
  if (id !== 'evidence_clarity' && layer.sourceDomain && layer.sourceDomain !== 'aggregate') {
    if (DOMAIN_LAYER_MAP[layer.sourceDomain] !== id) throw new Error(`${layer.sourceDomain} cannot control ${id}`);
  }
  switch (id) {
    case 'core_vitality':
      assertOneOf(state.layers[id].properties.luminosity, MAGNITUDES, `${id}.luminosity`);
      assertOneOf(state.layers[id].properties.density, MAGNITUDES, `${id}.density`);
      assertOneOf(state.layers[id].properties.continuity, CONTINUITIES, `${id}.continuity`);
      break;
    case 'atmospheric_rhythm':
      assertOneOf(state.layers[id].properties.breathCadence, REGULARITIES, `${id}.breathCadence`);
      assertOneOf(state.layers[id].properties.haloSoftness, SOFTNESSES, `${id}.haloSoftness`);
      assertOneOf(state.layers[id].properties.expansionRegularity, REGULARITIES, `${id}.expansionRegularity`);
      break;
    case 'internal_flow':
      assertOneOf(state.layers[id].properties.flowContinuity, CONTINUITIES, `${id}.flowContinuity`);
      assertOneOf(state.layers[id].properties.pulseStability, REGULARITIES, `${id}.pulseStability`);
      assertOneOf(state.layers[id].properties.movementCoherence, CONTINUITIES, `${id}.movementCoherence`);
      break;
    case 'kinetic_presence':
      assertOneOf(state.layers[id].properties.rotationalEnergy, MAGNITUDES, `${id}.rotationalEnergy`);
      assertOneOf(state.layers[id].properties.structuralResponsiveness, REGULARITIES, `${id}.structuralResponsiveness`);
      assertOneOf(state.layers[id].properties.movementRange, MAGNITUDES, `${id}.movementRange`);
      break;
    case 'surface_richness':
      assertOneOf(state.layers[id].properties.textureRichness, MAGNITUDES, `${id}.textureRichness`);
      assertOneOf(state.layers[id].properties.surfaceContinuity, CONTINUITIES, `${id}.surfaceContinuity`);
      assertOneOf(state.layers[id].properties.organicDetail, MAGNITUDES, `${id}.organicDetail`);
      break;
    case 'environmental_stability':
      assertOneOf(state.layers[id].properties.spatialSteadiness, REGULARITIES, `${id}.spatialSteadiness`);
      assertOneOf(state.layers[id].properties.ambientNoise, NOISES, `${id}.ambientNoise`);
      assertOneOf(state.layers[id].properties.drift, DRIFTS, `${id}.drift`);
      assertOneOf(state.layers[id].properties.environmentalCalm, SOFTNESSES, `${id}.environmentalCalm`);
      break;
    case 'evidence_clarity':
      assertOneOf(state.layers[id].properties.sharpness, CLARITIES, `${id}.sharpness`);
      assertOneOf(state.layers[id].properties.opacity, CLARITIES, `${id}.opacity`);
      assertOneOf(state.layers[id].properties.detailVisibility, VISIBILITIES, `${id}.detailVisibility`);
      assertOneOf(state.layers[id].properties.ambiguity, AMBIGUITIES, `${id}.ambiguity`);
      break;
  }
}

function assertRendererSafe(value: unknown, path: string): void {
  if (value === undefined) throw new Error(`${path} cannot be undefined`);
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error(`${path} must be finite`);
  if (Array.isArray(value)) value.forEach((item, index) => assertRendererSafe(item, `${path}[${index}]`));
  else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => assertRendererSafe(item, `${path}.${key}`));
  }
}

/** Ensures future renderers receive bounded enums and defined behavior only. */
export function validateLivingSphereVisualState(state: LivingSphereVisualState): void {
  assertExactKeys(state, VISUAL_STATE_KEYS, 'Living Sphere visual state');
  if (state.schemaVersion !== '1.0') throw new Error('Unsupported Living Sphere schema version');
  assertInteger(state.availableDomainCount, 'availableDomainCount');
  assertInteger(state.missingDomainCount, 'missingDomainCount');
  if (state.availableDomainCount + state.missingDomainCount !== LIVING_SPHERE_DOMAIN_IDS.length) {
    throw new Error('Living Sphere domain counts must cover all supported domains');
  }
  const layerIds = Object.keys(state.layers);
  if (layerIds.length !== LIVING_SPHERE_LAYER_IDS.length
    || layerIds.some(id => !LIVING_SPHERE_LAYER_IDS.includes(id as LivingSphereLayerId))) {
    throw new Error('Living Sphere must expose exactly the seven supported layers');
  }
  for (const id of LIVING_SPHERE_LAYER_IDS) validateLayer(state, id);
  assertOneOf(state.overallCoherence, COHERENCES, 'overallCoherence');
  assertOneOf(state.overallEvidenceClarity, CLARITIES, 'overallEvidenceClarity');
  assertOneOf(state.temporalStability, TEMPORAL_STATES, 'temporalStability');
  assertOneOf(state.evidenceMode, EVIDENCE_MODES, 'evidenceMode');
  if (state.dominantInfluence && !LIVING_SPHERE_DOMAIN_IDS.includes(state.dominantInfluence)) {
    throw new Error('dominantInfluence must be a supported domain');
  }
  if (state.fallback.code !== state.evidenceMode) throw new Error('Fallback must match evidenceMode');
  assertOneOf(state.uncertainty.mode, UNCERTAINTY_MODES, 'uncertainty.mode');
  assertOneOf(state.uncertainty.ambiguity, AMBIGUITIES, 'uncertainty.ambiguity');
  assertExactKeys(state.motion, MOTION_KEYS, 'motion');
  assertOneOf(state.motion.mode, MOTION_MODES, 'motion.mode');
  assertOneOf(state.motion.staticContinuity, CONTINUITIES, 'motion.staticContinuity');
  assertOneOf(state.motion.staticClarity, CLARITIES, 'motion.staticClarity');
  if (state.motion.animationRequiredForMeaning !== false) {
    throw new Error('Animation cannot be required for Living Sphere meaning');
  }
  assertExactKeys(state.motion.layerProfiles, MOTION_LAYER_IDS, 'motion.layerProfiles');
  for (const id of MOTION_LAYER_IDS) {
    const profile = state.motion.layerProfiles[id];
    if (!profile) continue;
    assertExactKeys(profile, MOTION_PROFILE_KEYS, `motion.${id}`);
    if (DOMAIN_LAYER_MAP[profile.sourceDomain] !== id) {
      throw new Error(`${profile.sourceDomain} trend cannot control ${id} motion`);
    }
    assertOneOf(profile.direction, TREND_DIRECTIONS, `motion.${id}.direction`);
    assertOneOf(profile.confidence, DOMAIN_CONFIDENCE_LEVELS, `motion.${id}.confidence`);
    assertOneOf(profile.pattern, TREND_PATTERNS, `motion.${id}.pattern`);
    assertOneOf(profile.persistence, PERSISTENCE_VALUES, `motion.${id}.persistence`);
    assertOneOf(profile.velocity, VELOCITY_VALUES, `motion.${id}.velocity`);
  }
  assertOneOf(state.palette.base, PALETTE_ROLES, 'palette.base');
  assertOneOf(state.palette.primaryAccent, PALETTE_ROLES, 'palette.primaryAccent');
  assertOneOf(state.palette.secondaryAccent, PALETTE_ROLES, 'palette.secondaryAccent');
  assertOneOf(state.palette.uncertaintyAccent, PALETTE_ROLES, 'palette.uncertaintyAccent');
  if (state.palette.colorIsSoleStateCarrier !== false) {
    throw new Error('Color cannot be the sole Living Sphere state carrier');
  }
  assertRendererSafe(state, 'LivingSphereVisualState');
}

/** Validates the complete UI boundary, including its non-visual equivalent. */
export function validateLivingSphereRendererContract(contract: LivingSphereRendererContract): void {
  assertExactKeys(contract, RENDERER_CONTRACT_KEYS, 'Living Sphere renderer contract');
  if (contract.contractVersion !== '1.0') throw new Error('Unsupported Living Sphere renderer contract');
  if (typeof contract.reduceMotion !== 'boolean') throw new Error('Renderer reduceMotion must be boolean');
  validateLivingSphereVisualState(contract.state);
  assertExactKeys(contract.accessibility, ACCESSIBILITY_KEYS, 'Renderer accessibility');
  assertExactKeys(contract.state.accessibility, ACCESSIBILITY_KEYS, 'State accessibility');
  for (const key of ACCESSIBILITY_KEYS) {
    if (!contract.accessibility[key].trim()) throw new Error(`Renderer accessibility ${key} cannot be empty`);
    if (contract.accessibility[key] !== contract.state.accessibility[key]) {
      throw new Error('Renderer accessibility must match the validated visual state');
    }
  }
  if (contract.reduceMotion !== contract.state.motion.reduceMotionApplied) {
    throw new Error('Renderer reduceMotion must match the validated visual state');
  }
}
