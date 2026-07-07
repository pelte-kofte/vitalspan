import { Colors } from '../theme';

export interface TagMeta { label: string; color: string }

export const BIOMARKER_TAG_META: Record<string, TagMeta> = {
  apob:           { label: 'ApoB',           color: Colors.viz.coral },
  hscrp:          { label: 'hsCRP',          color: Colors.viz.amber },
  hba1c:          { label: 'HbA1c',          color: Colors.viz.amber },
  igf1:           { label: 'IGF-1',          color: Colors.viz.bioGreen },
  vitd:           { label: 'Vitamin D',      color: Colors.viz.bioGreen },
  testosterone:   { label: 'Testosterone',   color: Colors.viz.teal },
  homocysteine:   { label: 'Homocysteine',   color: Colors.viz.coral },
  fastingglucose: { label: 'Glucose',        color: Colors.viz.amber },
  ferritin:       { label: 'Ferritin',       color: Colors.viz.teal },
  dheas:          { label: 'DHEA-S',         color: Colors.viz.teal },
  omega3index:    { label: 'Omega-3',        color: Colors.viz.bioGreen },
  uricacid:       { label: 'Uric Acid',      color: Colors.viz.coral },
  general:        { label: 'Longevity',      color: Colors.viz.teal },
  phenoage:       { label: 'Biological Age', color: Colors.dark.ctaPrimary },
};

/** Convert a hex color to an rgba string. Passes existing rgba strings through with updated alpha. */
export function withAlpha(hex: string, alpha: number): string {
  if (hex.startsWith('rgba(')) {
    return hex.replace(/,\s*[\d.]+\)$/, `, ${alpha})`);
  }
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Returns the TagMeta for the first recognized tag in the array, falling back to 'general'. */
export function primaryTagMeta(tags: string[]): TagMeta {
  for (const t of tags) if (BIOMARKER_TAG_META[t]) return BIOMARKER_TAG_META[t];
  return BIOMARKER_TAG_META.general;
}
