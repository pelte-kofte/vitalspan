import type {
  DomainMappedLayerId,
  LivingSphereDomainId,
  LivingSphereLayerId,
  LivingSphereLayerStateMap,
  LivingSpherePaletteState,
} from './models';

export const DOMAIN_LAYER_MAP: Readonly<Record<LivingSphereDomainId, DomainMappedLayerId>> = {
  blood: 'core_vitality',
  sleep: 'atmospheric_rhythm',
  recovery: 'internal_flow',
  fitness: 'kinetic_presence',
  nutrition: 'surface_richness',
  lifestyle: 'environmental_stability',
};

export const LAYER_TITLES: Readonly<Record<LivingSphereLayerId, string>> = {
  core_vitality: 'Core vitality',
  atmospheric_rhythm: 'Atmospheric rhythm',
  internal_flow: 'Internal flow',
  kinetic_presence: 'Kinetic presence',
  surface_richness: 'Surface richness',
  environmental_stability: 'Environmental stability',
  evidence_clarity: 'Evidence clarity',
};

export const DOMAIN_TITLES: Readonly<Record<LivingSphereDomainId, string>> = {
  blood: 'Blood',
  sleep: 'Sleep',
  recovery: 'Recovery',
  fitness: 'Fitness',
  nutrition: 'Nutrition',
  lifestyle: 'Lifestyle',
};

export function createDefaultLayerStates(): LivingSphereLayerStateMap {
  return {
    core_vitality: {
      id: 'core_vitality', represented: false, sourceDomain: null, sourceState: null,
      visibility: 'hidden',
      properties: { luminosity: 'dormant', density: 'dormant', continuity: 'indeterminate' },
    },
    atmospheric_rhythm: {
      id: 'atmospheric_rhythm', represented: false, sourceDomain: null, sourceState: null,
      visibility: 'hidden',
      properties: { breathCadence: 'indeterminate', haloSoftness: 'muted', expansionRegularity: 'indeterminate' },
    },
    internal_flow: {
      id: 'internal_flow', represented: false, sourceDomain: null, sourceState: null,
      visibility: 'hidden',
      properties: { flowContinuity: 'indeterminate', pulseStability: 'indeterminate', movementCoherence: 'indeterminate' },
    },
    kinetic_presence: {
      id: 'kinetic_presence', represented: false, sourceDomain: null, sourceState: null,
      visibility: 'hidden',
      properties: { rotationalEnergy: 'dormant', structuralResponsiveness: 'indeterminate', movementRange: 'dormant' },
    },
    surface_richness: {
      id: 'surface_richness', represented: false, sourceDomain: null, sourceState: null,
      visibility: 'hidden',
      properties: { textureRichness: 'dormant', surfaceContinuity: 'indeterminate', organicDetail: 'dormant' },
    },
    environmental_stability: {
      id: 'environmental_stability', represented: false, sourceDomain: null, sourceState: null,
      visibility: 'hidden',
      properties: { spatialSteadiness: 'indeterminate', ambientNoise: 'muted', drift: 'none', environmentalCalm: 'muted' },
    },
    evidence_clarity: {
      id: 'evidence_clarity', represented: true, sourceDomain: 'aggregate', sourceState: null,
      visibility: 'hinted',
      properties: { sharpness: 'obscured', opacity: 'obscured', detailVisibility: 'hinted', ambiguity: 'high' },
    },
  };
}

export const DEFAULT_PALETTE_STATE: LivingSpherePaletteState = {
  base: 'neutral_base',
  primaryAccent: 'muted_uncertainty',
  secondaryAccent: 'cool_depth',
  uncertaintyAccent: 'muted_uncertainty',
  colorIsSoleStateCarrier: false,
};
