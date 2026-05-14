import { Colors } from '../theme';

export type SupplementTiming = 'fasted' | 'with_meal' | 'with_fat' | 'flexible' | 'bedtime';
export type BestTime = 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'anytime';
export type EvidenceGrade = 'A' | 'B' | 'C';

export interface SupplementInfo {
  id: string;
  name: string;
  category: 'nad' | 'mitochondrial' | 'cardiovascular' | 'metabolic' | 'sleep' | 'antioxidant' | 'mineral' | 'vitamin' | 'adaptogen';
  defaultDose: string;
  timing: SupplementTiming;
  bestTime: BestTime;
  avoidWith: string[];
  separateFromMeds: { drug: string; hours: number; reason: string }[];
  reason: string;
  evidenceGrade: EvidenceGrade;
  shortDescription: string;
  contraindications?: string[];
}

export const SUPPLEMENT_DATABASE: SupplementInfo[] = [
  // === NAD+ PATHWAY ===
  {
    id: 'nmn',
    name: 'NMN (Nicotinamide Mononucleotide)',
    category: 'nad',
    defaultDose: '500mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'metformin', hours: 0, reason: 'Metformin may blunt NAD+ benefits via Complex I inhibition' }
    ],
    reason: 'NAD+ follows circadian rhythm — peak synthesis in early morning. Fasted state preserves bioavailability.',
    evidenceGrade: 'B',
    shortDescription: 'Boosts NAD+ levels, supports mitochondrial function and DNA repair.',
  },
  {
    id: 'nr',
    name: 'NR (Nicotinamide Riboside)',
    category: 'nad',
    defaultDose: '300mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Similar to NMN — NAD+ precursor, best in morning fasted state.',
    evidenceGrade: 'B',
    shortDescription: 'Alternative NAD+ precursor, well-studied with TRU-NIAGEN form.',
  },

  // === MITOCHONDRIAL ===
  {
    id: 'coq10',
    name: 'CoQ10 (Ubiquinol)',
    category: 'mitochondrial',
    defaultDose: '100-200mg',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'May reduce warfarin effectiveness — monitor INR' }
    ],
    reason: 'Fat-soluble — bioavailability increases 3x with dietary fat. Ubiquinol form preferred over 40.',
    evidenceGrade: 'A',
    shortDescription: 'Essential for cellular energy production. Depleted by statins.',
  },
  {
    id: 'pqq',
    name: 'PQQ (Pyrroloquinoline Quinone)',
    category: 'mitochondrial',
    defaultDose: '10-20mg',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Synergistic with CoQ10 — promotes mitochondrial biogenesis.',
    evidenceGrade: 'C',
    shortDescription: 'Stimulates new mitochondria formation.',
  },
  {
    id: 'alpha_lipoic',
    name: 'Alpha Lipoic Acid (ALA)',
    category: 'mitochondrial',
    defaultDose: '300-600mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: ['biotin'],
    separateFromMeds: [
      { drug: 'levothyroxine', hours: 4, reason: 'May reduce thyroid hormone absorption' },
      { drug: 'insulin', hours: 0, reason: 'Enhances insulin sensitivity — monitor glucose' }
    ],
    reason: 'Empty stomach for max absorption. Competes with biotin for cellular uptake.',
    evidenceGrade: 'B',
    shortDescription: 'Universal antioxidant, supports glucose metabolism.',
  },

  // === CARDIOVASCULAR ===
  {
    id: 'omega3',
    name: 'Omega-3 (EPA + DHA)',
    category: 'cardiovascular',
    defaultDose: '2g EPA+DHA',
    timing: 'with_meal',
    bestTime: 'evening',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'Increases bleeding risk — needs INR monitoring' },
      { drug: 'aspirin', hours: 4, reason: 'Additive antiplatelet effect' }
    ],
    reason: 'Fat-soluble — taken with largest meal for absorption. Evening timing reduces fishy reflux.',
    evidenceGrade: 'A',
    shortDescription: 'Reduces inflammation, supports cardiovascular and brain health.',
  },
  {
    id: 'berberine',
    name: 'Berberine',
    category: 'metabolic',
    defaultDose: '500mg (3x daily)',
    timing: 'with_meal',
    bestTime: 'anytime',
    avoidWith: ['cyclosporine'],
    separateFromMeds: [
      { drug: 'metformin', hours: 0, reason: 'Additive glucose-lowering — monitor blood sugar' },
      { drug: 'statin', hours: 4, reason: 'Berberine inhibits CYP3A4, may increase statin levels' }
    ],
    reason: 'Take with meals to blunt postprandial glucose spike. 3x daily for AMPK activation.',
    evidenceGrade: 'A',
    shortDescription: '"Natures metformin" — activates AMPK, supports glucose metabolism.',
  },

  // === VITAMINS ===
  {
    id: 'vitamin_d3',
    name: 'Vitamin D3',
    category: 'vitamin',
    defaultDose: '2000-5000 IU',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'thiazide_diuretics', hours: 0, reason: 'May increase calcium levels' }
    ],
    reason: 'Fat-soluble — needs dietary fat for absorption. Morning timing aligns with sun exposure rhythm.',
    evidenceGrade: 'A',
    shortDescription: 'Regulates 1000+ genes. Pair with K2 and magnesium for synergy.',
  },
  {
    id: 'vitamin_k2',
    name: 'Vitamin K2 (MK-7)',
    category: 'vitamin',
    defaultDose: '100-200mcg',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'Directly antagonizes warfarin — AVOID combination' }
    ],
    reason: 'Take with D3 for synergy — K2 directs calcium to bones, not arteries.',
    evidenceGrade: 'B',
    shortDescription: 'Activates osteocalcin and matrix Gla protein — bone and arterial health.',
    contraindications: ['warfarin'],
  },
  {
    id: 'methylated_b',
    name: 'Methylated B-Complex (B12 + Folate + B6)',
    category: 'vitamin',
    defaultDose: 'Methyl B12 1000mcg + Methylfolate 400mcg + P5P 25mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'levodopa', hours: 0, reason: 'B6 may reduce levodopa effectiveness' }
    ],
    reason: 'Best on empty stomach. Methylated forms bypass MTHFR variants.',
    evidenceGrade: 'A',
    shortDescription: 'Lowers homocysteine, supports methylation cycle.',
  },

  // === MINERALS ===
  {
    id: 'magnesium_glycinate',
    name: 'Magnesium Glycinate',
    category: 'mineral',
    defaultDose: '300-400mg',
    timing: 'flexible',
    bestTime: 'bedtime',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'levothyroxine', hours: 4, reason: 'Reduces thyroid hormone absorption' },
      { drug: 'tetracyclines', hours: 2, reason: 'Chelates antibiotic, reduces absorption' },
      { drug: 'bisphosphonates', hours: 4, reason: 'Reduces bisphosphonate absorption' }
    ],
    reason: 'Glycinate form gentlest on GI. Evening dose supports sleep and muscle relaxation.',
    evidenceGrade: 'A',
    shortDescription: 'Most bioavailable magnesium form. Activates vitamin D, supports sleep.',
  },
  {
    id: 'zinc',
    name: 'Zinc (Picolinate or Bisglycinate)',
    category: 'mineral',
    defaultDose: '15-25mg',
    timing: 'fasted',
    bestTime: 'evening',
    avoidWith: ['copper', 'calcium', 'iron'],
    separateFromMeds: [
      { drug: 'quinolone_antibiotics', hours: 2, reason: 'Chelates antibiotic' },
      { drug: 'tetracyclines', hours: 2, reason: 'Chelates antibiotic' }
    ],
    reason: 'Fasted absorption better. Long-term use needs copper (15:1 zinc:copper ratio).',
    evidenceGrade: 'A',
    shortDescription: 'Immune support, testosterone synthesis, DNA repair.',
  },
  {
    id: 'selenium',
    name: 'Selenium (Selenomethionine)',
    category: 'mineral',
    defaultDose: '100-200mcg',
    timing: 'flexible',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Narrow therapeutic window — do not exceed 400mcg/day. 2 Brazil nuts = ~100mcg.',
    evidenceGrade: 'B',
    shortDescription: 'Thyroid function, glutathione peroxidase cofactor.',
  },

  // === ANTIOXIDANTS / POLYPHENOLS ===
  {
    id: 'resveratrol',
    name: 'Trans-Resveratrol',
    category: 'antioxidant',
    defaultDose: '500mg-1g',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'Inhibits CYP2C9 — increases bleeding risk' },
      { drug: 'cyp3a4_substrates', hours: 0, reason: 'May alter drug metabolism' }
    ],
    reason: 'Fat-soluble. Synergistic with NMN for sirtuin activation. Trans- form is bioactive.',
    evidenceGrade: 'B',
    shortDescription: 'Sirtuin activator, polyphenol antioxidant. David Sinclair stack.',
  },
  {
    id: 'curcumin',
    name: 'Curcumin (with Piperine or Liposomal)',
    category: 'antioxidant',
    defaultDose: '500-1000mg',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'Mild antiplatelet effect' },
      { drug: 'aspirin', hours: 0, reason: 'Additive antiplatelet' }
    ],
    reason: 'Poor bioavailability — needs piperine (2000% boost) or liposomal/Meriva form.',
    evidenceGrade: 'A',
    shortDescription: 'Powerful anti-inflammatory, NF-kB inhibitor.',
  },
  {
    id: 'quercetin',
    name: 'Quercetin',
    category: 'antioxidant',
    defaultDose: '500mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'cyclosporine', hours: 0, reason: 'May increase cyclosporine levels' },
      { drug: 'quinolones', hours: 2, reason: 'May reduce antibiotic absorption' }
    ],
    reason: 'Senolytic when combined with fisetin. Take with bromelain for absorption.',
    evidenceGrade: 'B',
    shortDescription: 'Senolytic, mast cell stabilizer, anti-inflammatory.',
  },
  {
    id: 'apigenin',
    name: 'Apigenin',
    category: 'antioxidant',
    defaultDose: '50mg',
    timing: 'flexible',
    bestTime: 'evening',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'cyp3a4_substrates', hours: 0, reason: 'May alter drug metabolism' }
    ],
    reason: 'CD38 inhibitor — preserves NAD+. Evening dosing supports sleep.',
    evidenceGrade: 'C',
    shortDescription: 'CD38 inhibitor, preserves NAD+ levels, mild calming effect.',
  },

  // === SLEEP / ADAPTOGENS ===
  {
    id: 'glycine',
    name: 'Glycine',
    category: 'sleep',
    defaultDose: '3g',
    timing: 'bedtime',
    bestTime: 'bedtime',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'clozapine', hours: 0, reason: 'May reduce clozapine effectiveness' }
    ],
    reason: 'Lowers core body temperature — promotes deep sleep onset.',
    evidenceGrade: 'B',
    shortDescription: 'Improves sleep quality, deep sleep duration.',
  },
  {
    id: 'ashwagandha',
    name: 'Ashwagandha (KSM-66)',
    category: 'adaptogen',
    defaultDose: '600mg',
    timing: 'with_meal',
    bestTime: 'evening',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'thyroid_medications', hours: 0, reason: 'May increase thyroid hormones' },
      { drug: 'immunosuppressants', hours: 0, reason: 'May reduce immunosuppressant effect' },
      { drug: 'sedatives', hours: 0, reason: 'Additive sedation' }
    ],
    reason: 'Reduces cortisol — evening timing aligns with natural cortisol decline.',
    evidenceGrade: 'A',
    shortDescription: 'Adaptogen, lowers cortisol, supports stress resilience.',
    contraindications: ['hyperthyroidism', 'autoimmune_active'],
  },
];

// Helper to get supplement by id
export function getSupplementInfo(id: string): SupplementInfo | undefined {
  return SUPPLEMENT_DATABASE.find(s => s.id === id);
}

// Get all interactions for a given drug
export function getSupplementsToAvoidWithDrug(drugName: string): SupplementInfo[] {
  const lowerDrug = drugName.toLowerCase();
  return SUPPLEMENT_DATABASE.filter(s =>
    s.separateFromMeds.some(m => lowerDrug.includes(m.drug.toLowerCase())) ||
    s.contraindications?.some(c => lowerDrug.includes(c.toLowerCase()))
  );
}
