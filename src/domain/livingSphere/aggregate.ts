import type { DomainConfidence, DomainState } from '../health';
import {
  DEFAULT_PALETTE_STATE,
  DOMAIN_LAYER_MAP,
  DOMAIN_TITLES,
  LAYER_TITLES,
  createDefaultLayerStates,
} from './defaults';
import { mapDomainToLayer } from './mapping';
import { LIVING_SPHERE_DOMAIN_IDS } from './models';
import type {
  AnyLivingSphereLayerState,
  LivingSphereAccessibilitySummary,
  LivingSphereDomainId,
  LivingSphereDomainInput,
  LivingSphereEvidenceMode,
  LivingSphereExplanation,
  LivingSphereFallbackReason,
  LivingSphereInput,
  LivingSphereLayerStateMap,
  LivingSphereLayerMotionMap,
  LivingSphereMotionState,
  LivingSpherePaletteState,
  LivingSphereRendererContract,
  LivingSphereTemporalStability,
  LivingSphereUncertaintyReason,
  LivingSphereUncertaintyState,
  LivingSphereVisualState,
  VisualClarity,
  VisualContinuity,
} from './models';
import { validateLivingSphereInput, validateLivingSphereVisualState } from './validation';

const CONFIDENCE_ORDER: readonly DomainConfidence[] = [
  'insufficient', 'limited', 'moderate', 'high', 'very_high',
];
const CLARITY_ORDER: readonly VisualClarity[] = [
  'obscured', 'muted', 'partial', 'clear', 'crystalline',
];
const STATE_PROMINENCE: readonly DomainState[] = [
  'attention_needed', 'needs_review', 'excellent', 'good', 'stable', 'unknown',
];

function availableDomains(input: LivingSphereInput): LivingSphereDomainInput[] {
  return input.domains.filter(domain => domain.dataCompleteness.state !== 'none');
}

function missingDomains(available: readonly LivingSphereDomainInput[]): LivingSphereDomainId[] {
  const represented = new Set(available.map(domain => domain.id));
  return LIVING_SPHERE_DOMAIN_IDS.filter(id => !represented.has(id));
}

function applyMappedLayer(layers: LivingSphereLayerStateMap, mapped: AnyLivingSphereLayerState): void {
  switch (mapped.id) {
    case 'core_vitality': layers.core_vitality = mapped; break;
    case 'atmospheric_rhythm': layers.atmospheric_rhythm = mapped; break;
    case 'internal_flow': layers.internal_flow = mapped; break;
    case 'kinetic_presence': layers.kinetic_presence = mapped; break;
    case 'surface_richness': layers.surface_richness = mapped; break;
    case 'environmental_stability': layers.environmental_stability = mapped; break;
    case 'evidence_clarity': layers.evidence_clarity = mapped; break;
  }
}

function confidenceAtLeast(value: DomainConfidence, minimum: DomainConfidence): boolean {
  return CONFIDENCE_ORDER.indexOf(value) >= CONFIDENCE_ORDER.indexOf(minimum);
}

function domainTemporalState(domain: LivingSphereDomainInput): LivingSphereTemporalStability {
  if (domain.trend.pattern === 'interrupted_pattern') return 'interrupted_pattern';
  if (domain.trend.pattern === 'volatile_pattern') return 'volatile_pattern';
  if (domain.trend.pattern === 'seasonal_pattern') return 'seasonal_pattern';
  if (domain.trend.pattern === 'emerging_pattern') return 'emerging_trend';
  if (domain.trend.pattern === 'stable_pattern') return 'stable_pattern';
  if (domain.trend.historicalCoverage.observationCount <= 1
    || domain.trend.confidence === 'insufficient') return 'insufficient_history';
  return 'snapshot';
}

function aggregateTemporalState(domains: readonly LivingSphereDomainInput[]): LivingSphereTemporalStability {
  if (domains.length === 0) return 'insufficient_history';
  const states = domains.map(domainTemporalState);
  if (states.includes('interrupted_pattern')) return 'interrupted_pattern';
  if (states.includes('volatile_pattern')) return 'volatile_pattern';
  if (states.includes('emerging_trend')) return 'emerging_trend';
  if (states.includes('seasonal_pattern')) return 'seasonal_pattern';
  if (states.every(state => state === 'stable_pattern')) return 'stable_pattern';
  if (states.every(state => state === 'insufficient_history')) return 'insufficient_history';
  return 'snapshot';
}

function layerMotionProfiles(domains: readonly LivingSphereDomainInput[]): LivingSphereLayerMotionMap {
  const profiles: LivingSphereLayerMotionMap = {
    core_vitality: null,
    atmospheric_rhythm: null,
    internal_flow: null,
    kinetic_presence: null,
    surface_richness: null,
    environmental_stability: null,
  };
  for (const domain of domains) {
    profiles[DOMAIN_LAYER_MAP[domain.id]] = {
      sourceDomain: domain.id,
      direction: domain.trend.direction,
      confidence: domain.trend.confidence,
      pattern: domain.trend.pattern,
      persistence: domain.trend.persistence,
      velocity: domain.trend.velocity,
    };
  }
  return profiles;
}

function conflictDomains(domains: readonly LivingSphereDomainInput[]): LivingSphereDomainId[] {
  const reliable = domains.filter(domain => confidenceAtLeast(domain.confidence, 'moderate'));
  const positive = reliable.filter(domain => domain.currentState === 'excellent' || domain.currentState === 'good');
  const review = reliable.filter(domain => domain.currentState === 'needs_review' || domain.currentState === 'attention_needed');
  return positive.length > 0 && review.length > 0
    ? [...positive, ...review].map(domain => domain.id)
    : [];
}

function domainClarity(domain: LivingSphereDomainInput): VisualClarity {
  const confidenceClarity: Readonly<Record<DomainConfidence, VisualClarity>> = {
    insufficient: 'obscured', limited: 'muted', moderate: 'partial', high: 'clear', very_high: 'crystalline',
  };
  const value = confidenceClarity[domain.confidence];
  if (domain.dataCompleteness.state === 'partial'
    && CLARITY_ORDER.indexOf(value) > CLARITY_ORDER.indexOf('partial')) return 'partial';
  return value;
}

function minimumClarity(values: readonly VisualClarity[]): VisualClarity {
  return values.reduce<VisualClarity>((lowest, value) => (
    CLARITY_ORDER.indexOf(value) < CLARITY_ORDER.indexOf(lowest) ? value : lowest
  ), 'crystalline');
}

function aggregateClarity(domains: readonly LivingSphereDomainInput[]): VisualClarity {
  if (domains.length === 0) return 'obscured';
  const evidenceClarity = minimumClarity(domains.map(domainClarity));
  const coverageLimit: VisualClarity = domains.length <= 2
    ? 'muted'
    : domains.length < LIVING_SPHERE_DOMAIN_IDS.length
      ? 'partial'
      : 'crystalline';
  return minimumClarity([evidenceClarity, coverageLimit]);
}

function staleDomains(domains: readonly LivingSphereDomainInput[]): LivingSphereDomainId[] {
  return domains.filter(domain => domain.freshness.level === 'limited'
    || domain.freshness.level === 'insufficient').map(domain => domain.id);
}

function evidenceMode(
  domains: readonly LivingSphereDomainInput[],
  conflicts: readonly LivingSphereDomainId[],
  stale: readonly LivingSphereDomainId[],
): LivingSphereEvidenceMode {
  if (domains.length === 0) return 'no_evidence';
  if (conflicts.length > 0) return 'conflicting_evidence';
  if (stale.length > 0) return 'stale_evidence';
  if (domains.length <= 2 || domains.every(domain => !confidenceAtLeast(domain.confidence, 'moderate'))) {
    return 'limited_evidence';
  }
  return 'sufficient_evidence';
}

function fallbackReason(
  mode: LivingSphereEvidenceMode,
  missing: readonly LivingSphereDomainId[],
  conflicts: readonly LivingSphereDomainId[],
  stale: readonly LivingSphereDomainId[],
): LivingSphereFallbackReason {
  const definitions: Readonly<Record<LivingSphereEvidenceMode, Omit<LivingSphereFallbackReason, 'code'>>> = {
    no_evidence: { isFallback: true, message: 'No supported domain evidence is available; using the calm neutral dormant state.', affectedDomains: missing },
    limited_evidence: { isFallback: true, message: 'Only limited domain evidence is represented; visual detail remains restrained.', affectedDomains: missing },
    stale_evidence: { isFallback: true, message: 'Some represented evidence is stale; temporal presence and clarity are reduced.', affectedDomains: stale },
    conflicting_evidence: { isFallback: true, message: 'Supported domains have differing states; independent layers remain visible.', affectedDomains: conflicts },
    sufficient_evidence: { isFallback: false, message: 'Sufficient supported evidence is available for the semantic sphere state.', affectedDomains: [] },
  };
  return { code: mode, ...definitions[mode] };
}

function uncertaintyState(
  domains: readonly LivingSphereDomainInput[],
  missing: readonly LivingSphereDomainId[],
  conflicts: readonly LivingSphereDomainId[],
  stale: readonly LivingSphereDomainId[],
): LivingSphereUncertaintyState {
  const reasons: LivingSphereUncertaintyReason[] = [];
  if (missing.length > 0) reasons.push({ code: 'missing_domain',
    message: `Missing supported domains: ${missing.map(id => DOMAIN_TITLES[id]).join(', ')}.`, affectedDomains: missing });
  const lowConfidence = domains.filter(domain => !confidenceAtLeast(domain.confidence, 'moderate')).map(domain => domain.id);
  if (lowConfidence.length > 0) reasons.push({ code: 'low_confidence',
    message: `Evidence confidence is limited for: ${lowConfidence.map(id => DOMAIN_TITLES[id]).join(', ')}.`, affectedDomains: lowConfidence });
  if (stale.length > 0) reasons.push({ code: 'stale_evidence',
    message: `Evidence freshness is limited for: ${stale.map(id => DOMAIN_TITLES[id]).join(', ')}.`, affectedDomains: stale });
  if (conflicts.length > 0) reasons.push({ code: 'conflicting_state',
    message: `Independent domain states differ across: ${conflicts.map(id => DOMAIN_TITLES[id]).join(', ')}.`, affectedDomains: conflicts });
  const modes: Readonly<Record<LivingSphereUncertaintyReason['code'], LivingSphereUncertaintyState['mode']>> = {
    missing_domain: 'missing_data', low_confidence: 'low_confidence',
    stale_evidence: 'stale_data', conflicting_state: 'conflicting_states',
  };
  const mode = reasons.length === 0 ? 'none' : reasons.length > 1 ? 'compound' : modes[reasons[0].code];
  const ambiguity = domains.length === 0
    ? 'high'
    : reasons.length === 0
      ? 'none'
      : reasons.length === 1
        ? 'low'
        : reasons.length === 2
          ? 'moderate'
          : 'high';
  return { mode, ambiguity, reasons };
}

function overallCoherence(
  domains: readonly LivingSphereDomainInput[],
  temporal: LivingSphereTemporalStability,
  conflicts: readonly LivingSphereDomainId[],
): LivingSphereVisualState['overallCoherence'] {
  if (domains.length === 0) return 'dormant';
  if (conflicts.length > 0 || temporal === 'volatile_pattern') return 'variable';
  if (temporal === 'stable_pattern') return 'coherent';
  return 'layered';
}

function dominantInfluence(domains: readonly LivingSphereDomainInput[]): LivingSphereDomainId | null {
  const candidates = domains.filter(domain => domain.currentState !== 'unknown'
    && confidenceAtLeast(domain.confidence, 'moderate'));
  if (candidates.length === 0) return null;
  const stateRank = Math.min(...candidates.map(domain => STATE_PROMINENCE.indexOf(domain.currentState)));
  const byState = candidates.filter(domain => STATE_PROMINENCE.indexOf(domain.currentState) === stateRank);
  const confidenceRank = Math.max(...byState.map(domain => CONFIDENCE_ORDER.indexOf(domain.confidence)));
  const finalists = byState.filter(domain => CONFIDENCE_ORDER.indexOf(domain.confidence) === confidenceRank);
  return finalists.length === 1 ? finalists[0].id : null;
}

function evidenceLayer(clarity: VisualClarity, uncertainty: LivingSphereUncertaintyState): LivingSphereLayerStateMap['evidence_clarity'] {
  const visibility = clarity === 'obscured' ? 'hinted' : clarity === 'muted' || clarity === 'partial' ? 'partial' : 'clear';
  return { id: 'evidence_clarity', represented: true, sourceDomain: 'aggregate', sourceState: null,
    visibility, properties: { sharpness: clarity, opacity: clarity, detailVisibility: visibility,
      ambiguity: uncertainty.ambiguity } };
}

function motionState(
  coherence: LivingSphereVisualState['overallCoherence'],
  temporal: LivingSphereTemporalStability,
  clarity: VisualClarity,
  reduceMotion: boolean,
  domains: readonly LivingSphereDomainInput[],
): LivingSphereMotionState {
  const staticContinuity: VisualContinuity = coherence === 'coherent'
    ? 'coherent' : coherence === 'variable' ? 'variable' : coherence === 'layered' ? 'continuous' : 'indeterminate';
  let mode: LivingSphereMotionState['mode'];
  if (coherence === 'dormant') mode = 'dormant';
  else if (reduceMotion) mode = 'static';
  else if (temporal === 'volatile_pattern') mode = 'variable';
  else if (temporal === 'stable_pattern' || temporal === 'seasonal_pattern') mode = 'coherent';
  else if (temporal === 'emerging_trend') mode = 'gentle';
  else mode = 'subdued';
  return { mode, reduceMotionApplied: reduceMotion, animationRequiredForMeaning: false,
    staticContinuity, staticClarity: clarity, layerProfiles: layerMotionProfiles(domains) };
}

function paletteState(clarity: VisualClarity): LivingSpherePaletteState {
  if (clarity === 'obscured' || clarity === 'muted') return { ...DEFAULT_PALETTE_STATE };
  return { ...DEFAULT_PALETTE_STATE,
    primaryAccent: 'warm_vitality', secondaryAccent: 'cool_depth' };
}

function latestUpdate(domains: readonly LivingSphereDomainInput[]): string | null {
  const dates = domains.map(domain => domain.lastUpdated).filter((date): date is string => Boolean(date));
  return dates.length === 0 ? null : dates.reduce((latest, date) => Date.parse(date) > Date.parse(latest) ? date : latest);
}

function explanation(
  layers: LivingSphereLayerStateMap,
  domains: readonly LivingSphereDomainInput[],
  allInputs: readonly LivingSphereDomainInput[],
  missing: readonly LivingSphereDomainId[],
  uncertainty: LivingSphereUncertaintyState,
  fallback: LivingSphereFallbackReason,
): LivingSphereExplanation {
  const byId = new Map(domains.map(domain => [domain.id, domain]));
  const allById = new Map(allInputs.map(domain => [domain.id, domain]));
  const layerInfluences = Object.values(layers).map(layer => {
    const domain = layer.sourceDomain && layer.sourceDomain !== 'aggregate' ? byId.get(layer.sourceDomain) : undefined;
    const assignedDomain = layer.id === 'evidence_clarity'
      ? undefined
      : (Object.entries(DOMAIN_LAYER_MAP) as [LivingSphereDomainId, string][])
        .find(([, assignedLayer]) => assignedLayer === layer.id)?.[0];
    const unavailableDomain = assignedDomain ? allById.get(assignedDomain) : undefined;
    const unavailableReason = unavailableDomain?.knownGaps[0]?.text;
    const reason = layer.id === 'evidence_clarity'
      ? 'Evidence clarity reflects confidence, completeness, freshness, history, and supported-domain coverage.'
      : domain
        ? `${LAYER_TITLES[layer.id]} is informed only by ${domain.title} domain intelligence.`
        : `${LAYER_TITLES[layer.id]} is not represented because ${unavailableReason
          ?? 'its assigned domain evidence is unavailable.'}`;
    return { layer: layer.id, sourceDomain: layer.sourceDomain ?? assignedDomain ?? null, represented: layer.represented,
      reason, evidenceSummary: domain?.evidenceSummary.text ?? null, updatedAt: domain?.lastUpdated ?? null };
  });
  const displayStrings = layerInfluences.map(item => item.evidenceSummary
    ? `${LAYER_TITLES[item.layer]}: ${item.evidenceSummary}`
    : item.reason);
  return { representedDomains: domains.map(domain => domain.id), missingDomains: missing,
    layerInfluences, clarityLimitations: uncertainty.reasons.map(reason => reason.message),
    lastUpdated: latestUpdate(domains), fallback, displayStrings };
}

function accessibilitySummary(
  domains: readonly LivingSphereDomainInput[],
  missing: readonly LivingSphereDomainId[],
  coherence: LivingSphereVisualState['overallCoherence'],
  temporal: LivingSphereTemporalStability,
  clarity: VisualClarity,
  reduceMotion: boolean,
  uncertainty: LivingSphereUncertaintyState,
): LivingSphereAccessibilitySummary {
  const states = new Set(domains.map(domain => domain.currentState));
  const livingState = domains.length === 0
    ? 'Living state: calm neutral dormant'
    : states.size > 1 && temporal === 'stable_pattern'
      ? 'Living state: mixed but stable'
      : `Living state: ${coherence}`;
  const evidenceClarity = `Evidence clarity: ${clarity}`;
  const representedDomains = `Represented domains: ${domains.length > 0
    ? domains.map(domain => domain.title).join(', ') : 'none'}`;
  const limitedBy = `Limited by: ${missing.length > 0
    ? `missing ${missing.map(id => DOMAIN_TITLES[id]).join(', ')} evidence`
    : uncertainty.reasons.length > 0
      ? uncertainty.reasons.map(reason => reason.message).join(' ')
      : 'no identified evidence gaps'}`;
  const motion = reduceMotion
    ? 'Motion: reduced-motion static representation'
    : 'Motion: semantic state is also available without animation';
  return { livingState, evidenceClarity, representedDomains, limitedBy, motion,
    text: [livingState, evidenceClarity, representedDomains, limitedBy, motion].join('. ') };
}

export function buildLivingSphereVisualState(input: LivingSphereInput): LivingSphereVisualState {
  validateLivingSphereInput(input);
  const domains = availableDomains(input);
  const missing = missingDomains(domains);
  const conflicts = conflictDomains(domains);
  const stale = staleDomains(domains);
  const mode = evidenceMode(domains, conflicts, stale);
  const fallback = fallbackReason(mode, missing, conflicts, stale);
  const uncertainty = uncertaintyState(domains, missing, conflicts, stale);
  const temporal = aggregateTemporalState(domains);
  const clarity = aggregateClarity(domains);
  const coherence = overallCoherence(domains, temporal, conflicts);
  const dominant = dominantInfluence(domains);
  const layers = createDefaultLayerStates();
  for (const domain of domains) applyMappedLayer(layers, mapDomainToLayer(domain));
  layers.evidence_clarity = evidenceLayer(clarity, uncertainty);
  const state: LivingSphereVisualState = {
    schemaVersion: '1.0', layers, overallCoherence: coherence, overallEvidenceClarity: clarity,
    temporalStability: temporal, dominantInfluence: dominant,
    availableDomainCount: domains.length, missingDomainCount: missing.length,
    evidenceMode: mode, fallback, uncertainty,
    motion: motionState(coherence, temporal, clarity, input.reduceMotion, domains),
    palette: paletteState(clarity),
    explanation: explanation(layers, domains, input.domains, missing, uncertainty, fallback),
    accessibility: accessibilitySummary(domains, missing, coherence, temporal, clarity, input.reduceMotion, uncertainty),
  };
  validateLivingSphereVisualState(state);
  return state;
}

export function buildLivingSphereRendererContract(input: LivingSphereInput): LivingSphereRendererContract {
  const state = buildLivingSphereVisualState(input);
  return { contractVersion: '1.0', state, reduceMotion: input.reduceMotion, accessibility: state.accessibility };
}
