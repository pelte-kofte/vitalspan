import type { LivingSpherePaletteRole, LivingSpherePaletteState } from '../../domain/livingSphere';
import { Colors } from '../../theme';
import type { LivingSphereAppearance } from './renderPlan';

export interface LivingSphereResolvedPalette {
  base: string;
  depth: string;
  primary: string;
  secondary: string;
  surface: string;
  highlight: string;
  atmosphere: string;
  contour: string;
  boundary: string;
}

export function resolveLivingSpherePalette(
  appearance: LivingSphereAppearance,
  semantic: LivingSpherePaletteState,
): LivingSphereResolvedPalette {
  const tokens = Colors.livingSphere[appearance];
  const roleColor: Readonly<Record<LivingSpherePaletteRole, string>> = {
    neutral_base: tokens.base,
    warm_vitality: tokens.warmth,
    cool_depth: tokens.depth,
    muted_uncertainty: tokens.surface,
    soft_attention: tokens.warmth,
    atmospheric_highlight: tokens.highlight,
  };
  return {
    base: tokens.base,
    depth: tokens.depth,
    primary: roleColor[semantic.primaryAccent],
    secondary: roleColor[semantic.secondaryAccent],
    surface: tokens.surface,
    highlight: tokens.highlight,
    atmosphere: tokens.atmosphere,
    contour: tokens.contour,
    boundary: tokens.boundary,
  };
}
