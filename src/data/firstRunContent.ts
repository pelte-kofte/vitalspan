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
    body: 'Fasting glucose is one of the earliest signals of metabolic dysfunction — years before a diabetes diagnosis appears. Longevity medicine targets below 90 mg/dL, tighter than the standard 100 mg/dL cutoff, to reduce your risk of cardiovascular disease and accelerated biological aging.',
  },
  {
    biomarkerId: 'hba1c',
    icon: '🩸',
    headline: 'Why HbA1c Matters',
    body: 'HbA1c reflects your average blood sugar over the past 3 months — a sustained picture that fasting glucose alone cannot give you. Keeping it below 5.4% is associated with lower all-cause mortality and slower cellular aging in longevity medicine studies.',
  },
  {
    biomarkerId: 'totalcholesterol',
    icon: '💙',
    headline: 'Why Total Cholesterol Matters',
    body: 'Total cholesterol sets the context for your cardiovascular risk. Longevity medicine focuses on the ratio and particle quality — not the number alone — but an optimal range of 150–200 mg/dL is associated with reduced atherosclerosis progression and longer healthspan.',
  },
];

// O(1) lookup map for screens that need to gate on biomarker content presence
export const FIRST_RUN_CONTENT_MAP: Record<string, FirstRunContent> =
  Object.fromEntries(FIRST_RUN_CONTENT.map(c => [c.biomarkerId, c]));
