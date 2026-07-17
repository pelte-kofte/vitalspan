import { Spacing } from '../../theme';

/** Keeps the sphere near one quarter of the hero height while preserving text space. */
export function livingSphereHeroSize(width: number, height: number, fontScale: number): number {
  const availableWidth = Math.min(width, 720) - Spacing.xxl;
  const compactHeight = height < 500 ? 0.2 : 0.25;
  const base = Math.min(availableWidth * 0.46, height * compactHeight, 184);
  const typeReduction = fontScale <= 1.2 ? 1 : Math.max(0.82, 1 - (fontScale - 1.2) * 0.2);
  return Math.round(Math.max(112, base * typeReduction));
}
