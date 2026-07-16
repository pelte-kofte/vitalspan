export interface FirstRunContent {
  biomarkerId: string;
  icon: string;
  headline: string;
  body: string;
}

export const FIRST_RUN_CONTENT: FirstRunContent[] = [
  {
    biomarkerId: 'fastingglucose',
    icon: '🍬',
    headline: 'Why Fasting Glucose Matters',
    body: 'Fasting glucose is interpreted using the source laboratory range, collection conditions, and clinical context. It is also one of the nine inputs used by the blood phenotypic age calculation after explicit unit normalization.',
  },
  {
    biomarkerId: 'hba1c',
    icon: '🩸',
    headline: 'Why HbA1c Matters',
    body: 'HbA1c reflects average blood glucose over recent months. Interpretation depends on clinical context and factors that affect red blood cells; Vitalspan does not apply an unreviewed universal longevity target.',
  },
  {
    biomarkerId: 'totalcholesterol',
    icon: '💙',
    headline: 'Why Total Cholesterol Matters',
    body: 'Total cholesterol should not be interpreted as a standalone longevity target. Vitalspan preserves the reported value and laboratory range while its marker-specific clinical interpretation is reviewed.',
  },
];

// O(1) lookup map for screens that need to gate on biomarker content presence
export const FIRST_RUN_CONTENT_MAP: Record<string, FirstRunContent> =
  Object.fromEntries(FIRST_RUN_CONTENT.map(c => [c.biomarkerId, c]));
