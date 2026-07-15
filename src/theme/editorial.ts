/**
 * A quiet, ink-and-paper palette scoped to The Vitalspan Brief.
 * Keeping it separate prevents the magazine treatment from changing the
 * clinical product surfaces elsewhere in the app.
 */
export const EditorialColors = {
  ink: '#090A09',
  surface: '#101210',
  paper: '#F1EDE3',
  text: '#F1EDE3',
  textSecondary: '#C0B9AA',
  textMuted: '#918B80',
  rule: 'rgba(241,237,227,0.16)',
  ruleStrong: 'rgba(241,237,227,0.28)',
  copper: '#B97A52',
  copperMuted: '#8B6046',
  burgundy: '#6D3439',
  imageScrim: 'rgba(5,6,5,0.72)',
} as const;

export const EditorialLayout = {
  pageInset: 20,
  readingMeasure: 640,
  wideMeasure: 760,
  heroRadius: 20,
} as const;
