import { Colors } from '../theme';

export type SupplementTiming = 'fasted' | 'with_meal' | 'with_fat' | 'flexible' | 'bedtime';
export type BestTime = 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'anytime';
export type EvidenceGrade = 'A' | 'B' | 'C';

export interface SupplementInfo {
  id: string;
  name: string;
  category: 'nad' | 'mitochondrial' | 'cardiovascular' | 'metabolic' | 'sleep' | 'antioxidant' | 'mineral' | 'vitamin' | 'adaptogen' | 'amino_acid' | 'nootropic' | 'senolytic' | 'prescription_only';
  defaultDose: string;
  timing: SupplementTiming;
  bestTime: BestTime;
  avoidWith: string[];
  separateFromMeds: { drug: string; hours: number; reason: string }[];
  reason: string;
  evidenceGrade: EvidenceGrade;
  shortDescription: string;
  contraindications?: string[];
  prescriptionOnly?: boolean;
  rxNote?: string;
  mechanismOfAction?: string;
  longevityRelevance?: string;
  rxLabel?: string;
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
    category: 'amino_acid',
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

  // === AMINO ACIDS ===
  {
    id: 'creatine',
    name: 'Creatine Monohydrate',
    category: 'amino_acid',
    defaultDose: '3-5g',
    timing: 'flexible',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Timing is flexible — consistency matters more than timing for creatine.',
    evidenceGrade: 'A',
    shortDescription: 'Boosts strength, muscle mass, and cognitive function. Most evidence-backed supplement.',
  },
  {
    id: 'taurine',
    name: 'Taurine',
    category: 'amino_acid',
    defaultDose: '1-3g',
    timing: 'flexible',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Calming amino acid — morning or pre-workout. 2023 Nature study links taurine deficiency to aging.',
    evidenceGrade: 'B',
    shortDescription: 'Supports heart, brain, and mitochondrial health. Declines with age.',
  },
  {
    id: 'nac',
    name: 'NAC (N-Acetyl Cysteine)',
    category: 'antioxidant',
    defaultDose: '600-1200mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'nitroglycerin', hours: 0, reason: 'May potentiate hypotension' },
      { drug: 'activated_charcoal', hours: 2, reason: 'Reduces NAC absorption' }
    ],
    reason: 'Precursor to glutathione — empty stomach improves absorption.',
    evidenceGrade: 'B',
    shortDescription: 'Glutathione precursor, antioxidant, liver protection.',
  },
  {
    id: 'glutathione',
    name: 'Glutathione (Liposomal)',
    category: 'antioxidant',
    defaultDose: '250-500mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Master antioxidant. Liposomal form has superior bioavailability. Fasted state optimal.',
    evidenceGrade: 'B',
    shortDescription: 'Master antioxidant — protects cells from oxidative stress.',
  },
  {
    id: 'acetyl_l_carnitine',
    name: 'Acetyl-L-Carnitine (ALCAR)',
    category: 'nootropic',
    defaultDose: '500-1000mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'May potentiate anticoagulant effect' }
    ],
    reason: 'Crosses blood-brain barrier unlike plain L-carnitine. Take before noon to avoid sleep disruption.',
    evidenceGrade: 'B',
    shortDescription: 'Mitochondrial function, memory, and neuroprotection.',
  },
  {
    id: 'l_theanine',
    name: 'L-Theanine',
    category: 'nootropic',
    defaultDose: '100-200mg',
    timing: 'flexible',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'sedatives', hours: 0, reason: 'Additive calming effect' }
    ],
    reason: 'Pairs well with caffeine (2:1 ratio) for calm focus. Can also be taken before bed.',
    evidenceGrade: 'B',
    shortDescription: 'Promotes calm alertness. Synergistic with caffeine.',
  },
  {
    id: 'tmg',
    name: 'TMG (Trimethylglycine / Betaine)',
    category: 'amino_acid',
    defaultDose: '500-1000mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Methyl donor — supports methylation cycle and homocysteine reduction.',
    evidenceGrade: 'B',
    shortDescription: 'Methyl donor, lowers homocysteine, supports NAD+ recycling.',
  },
  {
    id: 'choline',
    name: 'Choline (Alpha-GPC)',
    category: 'nootropic',
    defaultDose: '300-600mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Alpha-GPC has superior bioavailability. Morning timing supports cognitive performance.',
    evidenceGrade: 'B',
    shortDescription: 'Acetylcholine precursor — supports memory, focus, and liver health.',
  },
  {
    id: 'inositol',
    name: 'Myo-Inositol',
    category: 'metabolic',
    defaultDose: '2-4g',
    timing: 'flexible',
    bestTime: 'bedtime',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'lithium', hours: 0, reason: 'May alter lithium metabolism' }
    ],
    reason: 'High doses (4g) support sleep and insulin signaling. Can be split morning + bedtime.',
    evidenceGrade: 'B',
    shortDescription: 'Insulin sensitizer, PCOS support, sleep quality.',
  },

  // === SENOLYTICS ===
  {
    id: 'fisetin',
    name: 'Fisetin',
    category: 'senolytic',
    defaultDose: '500mg-1g (cyclically)',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'May alter anticoagulant levels' }
    ],
    reason: 'Senolytic — typically taken in 2-day cycles monthly, not daily. Fat increases absorption.',
    evidenceGrade: 'B',
    shortDescription: 'Clears senescent "zombie" cells. Strongest plant-derived senolytic.',
  },
  {
    id: 'spermidine',
    name: 'Spermidine',
    category: 'senolytic',
    defaultDose: '1-5mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Induces autophagy — cellular cleanup. Higher doses require enteric coating.',
    evidenceGrade: 'B',
    shortDescription: 'Triggers autophagy, extends lifespan in animal models.',
  },

  // === POLYPHENOLS / ANTIOXIDANTS ===
  {
    id: 'pterostilbene',
    name: 'Pterostilbene',
    category: 'antioxidant',
    defaultDose: '50-150mg',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'May alter metabolism via CYP2C9' }
    ],
    reason: 'More bioavailable than resveratrol (80% vs 20%). Fat-soluble.',
    evidenceGrade: 'B',
    shortDescription: 'More bioavailable resveratrol analogue. SIRT1 activator.',
  },
  {
    id: 'egcg',
    name: 'EGCG (Green Tea Extract)',
    category: 'antioxidant',
    defaultDose: '400-800mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: ['iron'],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'Mild anticoagulant effect' },
      { drug: 'statins', hours: 2, reason: 'May inhibit statin metabolism at high doses' }
    ],
    reason: 'Fasted state maximizes absorption. Avoid with iron supplements (chelation).',
    evidenceGrade: 'B',
    shortDescription: 'Anti-cancer, anti-inflammatory, boosts metabolism.',
  },
  {
    id: 'sulforaphane',
    name: 'Sulforaphane (Broccoli Sprout Extract)',
    category: 'antioxidant',
    defaultDose: '10-50mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'NRF2 activator — most potent food-derived anti-inflammatory compound.',
    evidenceGrade: 'B',
    shortDescription: 'NRF2 pathway activator — powerful detox and anti-inflammatory.',
  },
  {
    id: 'r_lipoic_acid',
    name: 'R-Lipoic Acid',
    category: 'antioxidant',
    defaultDose: '100-300mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: ['biotin'],
    separateFromMeds: [
      { drug: 'insulin', hours: 0, reason: 'Enhances insulin sensitivity — monitor glucose' },
      { drug: 'levothyroxine', hours: 4, reason: 'May reduce thyroid hormone absorption' }
    ],
    reason: 'R-form is 2x more bioavailable than racemic ALA. Empty stomach required.',
    evidenceGrade: 'B',
    shortDescription: 'Superior form of alpha lipoic acid. Universal antioxidant, glucose metabolism.',
  },

  // === MUSHROOMS ===
  {
    id: 'lions_mane',
    name: "Lion's Mane Mushroom",
    category: 'nootropic',
    defaultDose: '500-1000mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'anticoagulants', hours: 0, reason: 'May slow blood clotting' }
    ],
    reason: 'NGF and BDNF stimulation — morning dose for cognitive benefit throughout the day.',
    evidenceGrade: 'B',
    shortDescription: 'Stimulates nerve growth factor (NGF) — supports brain and nerve regeneration.',
  },
  {
    id: 'reishi',
    name: 'Reishi Mushroom',
    category: 'adaptogen',
    defaultDose: '1-2g (extract)',
    timing: 'with_meal',
    bestTime: 'evening',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'anticoagulants', hours: 0, reason: 'May potentiate antiplatelet effects' },
      { drug: 'immunosuppressants', hours: 0, reason: 'Immune modulation may conflict' }
    ],
    reason: 'Calming adaptogen — evening dose supports sleep and immune modulation.',
    evidenceGrade: 'B',
    shortDescription: 'Immune modulator, calming adaptogen, liver support.',
    contraindications: ['organ_transplant'],
  },
  {
    id: 'cordyceps',
    name: 'Cordyceps Militaris',
    category: 'adaptogen',
    defaultDose: '500-1000mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'immunosuppressants', hours: 0, reason: 'Immune-stimulating properties may interfere' }
    ],
    reason: 'Increases ATP production and VO₂ max — ideal pre-workout or morning.',
    evidenceGrade: 'B',
    shortDescription: 'Boosts VO₂ max, endurance, and ATP production.',
  },

  // === VITAMINS & MINERALS (ADDITIONAL) ===
  {
    id: 'vitamin_c',
    name: 'Vitamin C (Ascorbic Acid)',
    category: 'vitamin',
    defaultDose: '500-1000mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'High doses may affect INR' },
      { drug: 'statins', hours: 2, reason: 'May alter statin absorption at high doses' }
    ],
    reason: 'Water-soluble — split doses (morning + evening) better than one large dose.',
    evidenceGrade: 'A',
    shortDescription: 'Antioxidant, collagen synthesis, immune support.',
  },
  {
    id: 'vitamin_e',
    name: 'Vitamin E (Mixed Tocopherols)',
    category: 'vitamin',
    defaultDose: '200-400 IU',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'Antiplatelet effect — increases bleeding risk' },
      { drug: 'statins', hours: 4, reason: 'May reduce statin benefit at very high doses' }
    ],
    reason: 'Fat-soluble. Mixed tocopherols (not just alpha) provide fuller antioxidant coverage.',
    evidenceGrade: 'B',
    shortDescription: 'Fat-soluble antioxidant. Mixed tocopherols preferred over alpha-only.',
    contraindications: ['vitamin_k_deficiency'],
  },
  {
    id: 'iodine',
    name: 'Iodine (as Potassium Iodide)',
    category: 'mineral',
    defaultDose: '150-300mcg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'levothyroxine', hours: 4, reason: 'Excess iodine may alter thyroid hormone levels' },
      { drug: 'antithyroid_drugs', hours: 0, reason: 'Iodine may antagonize antithyroid effect' }
    ],
    reason: 'Essential for thyroid function. Do not exceed 1100mcg/day. Test before supplementing.',
    evidenceGrade: 'B',
    shortDescription: 'Thyroid hormone synthesis. Many people are deficient.',
    contraindications: ['hyperthyroidism', 'hashimotos'],
  },
  {
    id: 'boron',
    name: 'Boron',
    category: 'mineral',
    defaultDose: '3-6mg',
    timing: 'flexible',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Trace mineral supporting testosterone, bone density, and cognitive function.',
    evidenceGrade: 'C',
    shortDescription: 'Boosts free testosterone, improves bone density and cognition.',
  },
  {
    id: 'rhodiola',
    name: 'Rhodiola Rosea',
    category: 'adaptogen',
    defaultDose: '200-400mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'ssri', hours: 0, reason: 'May have additive serotonergic effects' },
      { drug: 'maoi', hours: 0, reason: 'Potential serotonin syndrome risk' }
    ],
    reason: 'Stimulating adaptogen — avoid afternoon/evening to prevent insomnia.',
    evidenceGrade: 'B',
    shortDescription: 'Reduces fatigue and stress. Cognitive and physical performance.',
    contraindications: ['bipolar_disorder'],
  },
  {
    id: 'bacopa',
    name: 'Bacopa Monnieri',
    category: 'nootropic',
    defaultDose: '300-450mg',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'anticholinergics', hours: 0, reason: 'Bacopa increases ACh — may conflict' },
      { drug: 'thyroid_medications', hours: 4, reason: 'May interact with thyroid hormone levels' }
    ],
    reason: 'Fat-soluble saponins. Effects on memory accumulate over 8-12 weeks.',
    evidenceGrade: 'B',
    shortDescription: 'Enhances memory formation and recall. Requires 8+ weeks.',
  },
  {
    id: 'phosphatidylserine',
    name: 'Phosphatidylserine',
    category: 'nootropic',
    defaultDose: '100-300mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'May affect platelet function' },
      { drug: 'cholinesterase_inhibitors', hours: 0, reason: 'Additive ACh effects' }
    ],
    reason: 'Key phospholipid for brain cell membranes. With food for absorption.',
    evidenceGrade: 'B',
    shortDescription: 'Supports brain cell membranes, memory, and cortisol reduction.',
  },
  {
    id: 'd_ribose',
    name: 'D-Ribose',
    category: 'mitochondrial',
    defaultDose: '5g',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'ATP precursor — supports cellular energy recovery, especially after exercise.',
    evidenceGrade: 'C',
    shortDescription: 'ATP precursor — speeds energy recovery in heart and muscles.',
  },

  // === PRESCRIPTION-ONLY (clearly labeled) ===
  {
    id: 'metformin_rx',
    name: 'Metformin (Rx)',
    category: 'prescription_only',
    defaultDose: '500-1000mg (2x daily)',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'AMPK activator with longevity evidence (TAME trial). Requires prescription.',
    evidenceGrade: 'B',
    shortDescription: 'Longevity candidate drug — AMPK activation, anti-aging in trials.',
    prescriptionOnly: true,
    rxNote: 'Prescription required. Discuss with your physician.',
    rxLabel: 'Off-label (longevity)',
  },
  {
    id: 'rapamycin_rx',
    name: 'Rapamycin / Sirolimus (Rx)',
    category: 'prescription_only',
    defaultDose: '1-6mg (weekly pulsed)',
    timing: 'flexible',
    bestTime: 'anytime',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'cyp3a4_inhibitors', hours: 0, reason: 'Dramatically increases rapamycin levels' },
      { drug: 'immunosuppressants', hours: 0, reason: 'Additive immunosuppression' }
    ],
    reason: 'mTOR inhibitor with strongest lifespan extension evidence in mammals. Requires physician monitoring.',
    evidenceGrade: 'B',
    shortDescription: 'mTOR inhibitor — most compelling longevity drug. Strict medical supervision required.',
    prescriptionOnly: true,
    rxNote: 'Prescription required. Only under physician supervision with regular labs.',
    rxLabel: 'Off-label (longevity)',
    contraindications: ['active_infection', 'pregnancy'],
  },

  // === NEW ENTRIES (Phase 11) ===

  // --- Mitochondrial (new) ---
  {
    id: 'urolithin_a',
    name: 'Urolithin A',
    category: 'mitochondrial',
    defaultDose: '500mg–1g daily',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Take with meal for absorption. Gut microbiome metabolite of ellagic acid (pomegranate).',
    evidenceGrade: 'B',
    shortDescription: 'Mitophagy activator — clears dysfunctional mitochondria. Mitopure (Timeline) form.',
    mechanismOfAction: 'Activates mitophagy by clearing dysfunctional mitochondria via PINK1/Parkin pathway.',
    longevityRelevance: 'Mitochondrial quality control declines with age; urolithin A restores mitophagic flux and muscle endurance.',
  },

  // --- Antioxidant (new) ---
  {
    id: 'luteolin',
    name: 'Luteolin',
    category: 'antioxidant',
    defaultDose: '100–300mg',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'cyp3a4_substrates', hours: 0, reason: 'May modulate CYP3A4 enzyme activity' }
    ],
    reason: 'Fat-soluble — take with dietary fat for best absorption.',
    evidenceGrade: 'C',
    shortDescription: 'Anti-neuroinflammatory flavonoid. Crosses blood-brain barrier.',
    mechanismOfAction: 'Inhibits NF-kB signaling and mast cell activation; crosses blood-brain barrier.',
    longevityRelevance: 'Anti-neuroinflammatory flavonoid with emerging evidence for cognitive protection in aging.',
  },
  {
    id: 'astaxanthin',
    name: 'Astaxanthin',
    category: 'antioxidant',
    defaultDose: '4–12mg',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Fat-soluble — take with a meal containing fat.',
    evidenceGrade: 'B',
    shortDescription: 'Carotenoid antioxidant — 6000x stronger than vitamin C in singlet oxygen quenching.',
    mechanismOfAction: 'Uniquely spans cell membranes as a lipid-soluble antioxidant; superior singlet oxygen quenching vs other carotenoids.',
    longevityRelevance: 'Reduces oxidative DNA damage and skin photoaging; cardiovascular and exercise recovery benefits in RCTs.',
  },

  // --- Nootropic (new) ---
  {
    id: 'lithium_orotate',
    name: 'Lithium Orotate (microdose)',
    category: 'nootropic',
    defaultDose: '5–10mg elemental lithium',
    timing: 'with_meal',
    bestTime: 'anytime',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'nsaids', hours: 0, reason: 'NSAIDs reduce renal lithium clearance — toxicity risk' },
      { drug: 'ssri', hours: 0, reason: 'Additive serotonergic effects possible' }
    ],
    reason: 'Microdose (5–10mg elemental lithium) — far below pharmaceutical lithium carbonate doses.',
    evidenceGrade: 'C',
    shortDescription: 'Microdose neurosteroid — GSK-3β inhibition for neuroprotection.',
    mechanismOfAction: 'GSK-3β inhibition promotes neuroplasticity and autophagy at microdoses below pharmaceutical range.',
    longevityRelevance: 'Epidemiological data links lithium in drinking water to lower dementia rates and all-cause mortality.',
    contraindications: ['renal_impairment', 'cardiac_disease'],
  },

  // --- Sleep (new) ---
  {
    id: 'melatonin',
    name: 'Melatonin',
    category: 'sleep',
    defaultDose: '0.3–1mg (low-dose preferred)',
    timing: 'bedtime',
    bestTime: 'bedtime',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'Possible additive anticoagulant effect — monitor INR' },
      { drug: 'ssri', hours: 0, reason: 'CYP1A2 inhibition may raise melatonin levels' },
      { drug: 'sedatives', hours: 0, reason: 'Additive sedation' }
    ],
    reason: 'Take 30–60 min before target sleep time. Start with 0.3mg — lower is often more effective.',
    evidenceGrade: 'A',
    shortDescription: 'Circadian rhythm entrainment. Physiologic 0.3–1mg; 5–10mg products are supraphysiologic.',
    mechanismOfAction: 'Binds MT1/MT2 receptors in suprachiasmatic nucleus to entrain circadian rhythm and initiate sleep onset.',
    longevityRelevance: 'Melatonin production declines with age from ~25 onwards; restoring physiologic levels supports circadian health and mitochondrial antioxidant defense.',
  },

  // --- Adaptogen (new) ---
  {
    id: 'cbd',
    name: 'CBD (Cannabidiol)',
    category: 'adaptogen',
    defaultDose: '20–50mg',
    timing: 'with_fat',
    bestTime: 'evening',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'CYP2C9 inhibition raises warfarin levels — monitor INR' },
      { drug: 'cyp3a4_substrates', hours: 0, reason: 'Inhibits CYP3A4 — may raise many drug levels' },
      { drug: 'sedatives', hours: 0, reason: 'Additive sedation' }
    ],
    reason: 'Fat-soluble — bioavailability increases with fatty meal. Start low and titrate.',
    evidenceGrade: 'C',
    shortDescription: 'Non-psychoactive cannabinoid. Anti-inflammatory and anxiolytic.',
    mechanismOfAction: 'Allosteric modulator of CB1/CB2 receptors; inhibits FAAH enzyme elevating endocannabinoids.',
    longevityRelevance: 'Anti-inflammatory and anxiolytic properties without psychoactivity; emerging evidence for neuroprotection.',
    contraindications: ['liver_disease'],
  },

  // --- Metabolic (new) ---
  {
    id: 'artichoke_extract',
    name: 'Artichoke Extract',
    category: 'metabolic',
    defaultDose: '600–1800mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'statin', hours: 4, reason: 'Additive cholesterol-lowering; monitor for myopathy if combined' }
    ],
    reason: 'Take with meals. Standardized to cynarin content.',
    evidenceGrade: 'B',
    shortDescription: 'Natural statin-like effect (cynarin). Hepatoprotective via NRF2.',
    mechanismOfAction: 'Cynarin and luteolin inhibit HMG-CoA reductase (natural statin-like effect) and stimulate bile flow.',
    longevityRelevance: 'Reduces LDL-C by 5–15% in trials; hepatoprotective via NRF2 activation.',
  },
  {
    id: 'milk_thistle',
    name: 'Milk Thistle (Silymarin)',
    category: 'metabolic',
    defaultDose: '140–420mg silymarin',
    timing: 'with_meal',
    bestTime: 'anytime',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'cyp3a4_substrates', hours: 0, reason: 'Mild CYP3A4 inhibition may alter drug levels' }
    ],
    reason: 'Take with meals. Standardized to 70–80% silymarin content.',
    evidenceGrade: 'B',
    shortDescription: 'Liver protectant. Silybin complex inhibits hepatotoxin uptake.',
    mechanismOfAction: 'Silybin inhibits hepatocyte membrane permeability to toxins and upregulates glutathione synthesis.',
    longevityRelevance: 'Liver health is central to metabolic longevity; silymarin protects against fatty liver disease and NASH.',
  },

  // --- Mineral (new) ---
  {
    id: 'chromium',
    name: 'Chromium (Picolinate / GTF)',
    category: 'mineral',
    defaultDose: '200–400mcg',
    timing: 'with_meal',
    bestTime: 'anytime',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'insulin', hours: 0, reason: 'Additive glucose-lowering — monitor blood sugar' },
      { drug: 'levothyroxine', hours: 4, reason: 'May reduce thyroid hormone absorption' }
    ],
    reason: 'Take with meals. Picolinate and GTF (glucose tolerance factor) forms are best absorbed.',
    evidenceGrade: 'B',
    shortDescription: 'Insulin sensitizer. Potentiates insulin-stimulated glucose uptake.',
    mechanismOfAction: 'Enhances insulin receptor sensitivity via chromodulin; potentiates insulin-stimulated glucose uptake.',
    longevityRelevance: 'Glucose dysregulation is a primary aging driver; chromium supports insulin sensitivity in metabolic syndrome.',
  },
  {
    id: 'iron_bisglycinate',
    name: 'Iron Bisglycinate',
    category: 'mineral',
    defaultDose: '18–36mg elemental iron',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: ['calcium', 'zinc', 'egcg'],
    separateFromMeds: [
      { drug: 'levothyroxine', hours: 4, reason: 'Chelates thyroid hormone — reduces absorption by up to 50%' },
      { drug: 'quinolone_antibiotics', hours: 2, reason: 'Chelates antibiotic — reduces antibiotic absorption' },
      { drug: 'tetracyclines', hours: 2, reason: 'Chelates antibiotic — reduces antibiotic absorption' }
    ],
    reason: 'Take on empty stomach for best absorption. Separate from calcium, zinc, tea.',
    evidenceGrade: 'A',
    shortDescription: 'Chelated iron — superior GI tolerance vs ferrous sulfate.',
    mechanismOfAction: 'Chelated form with superior GI tolerance; provides iron for hemoglobin synthesis and mitochondrial Complex IV.',
    longevityRelevance: 'Iron deficiency causes fatigue, cognitive impairment, and impaired mitochondrial function; bisglycinate minimizes GI side effects.',
    contraindications: ['hemochromatosis', 'iron_overload'],
  },

  // --- Amino Acid (new) ---
  {
    id: 'collagen_peptides',
    name: 'Collagen Peptides',
    category: 'amino_acid',
    defaultDose: '10–15g',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Dissolve in liquid. Can be taken anytime; fasted timing may improve collagen synthesis.',
    evidenceGrade: 'B',
    shortDescription: 'Stimulates fibroblast collagen synthesis. Joint, skin, bone, and vascular support.',
    mechanismOfAction: 'Provides hydroxyproline and glycine; stimulates fibroblast collagen synthesis via feedback signaling.',
    longevityRelevance: 'Extracellular matrix integrity declines with age; collagen peptides support joint, skin, bone, and vascular health.',
  },
  {
    id: 'hyaluronic_acid',
    name: 'Hyaluronic Acid (Oral)',
    category: 'amino_acid',
    defaultDose: '120–240mg',
    timing: 'with_meal',
    bestTime: 'anytime',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Take with meals. Low-molecular-weight forms (50–300 kDa) show best oral bioavailability.',
    evidenceGrade: 'B',
    shortDescription: 'Joint and skin hydration support. Oral HA absorbed and stimulates endogenous HA production.',
    mechanismOfAction: 'Oral HA fragments are absorbed and stimulate fibroblast HA synthesis via CD44 receptor signaling.',
    longevityRelevance: 'HA in synovial fluid, skin, and vasculature declines with age; oral supplementation improves joint comfort and skin hydration in RCTs.',
  },

  // --- Prescription-only (drug classes) ---
  {
    id: 'nsaids_class',
    name: 'NSAIDs (Ibuprofen / Naproxen)',
    category: 'prescription_only',
    defaultDose: 'Ibuprofen 200–400mg as needed',
    timing: 'with_meal',
    bestTime: 'anytime',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 2, reason: 'Additive GI bleed risk; displaces warfarin from protein binding — monitor INR' },
      { drug: 'lithium', hours: 0, reason: 'NSAIDs reduce renal lithium clearance — toxicity risk' },
      { drug: 'methotrexate', hours: 0, reason: 'NSAIDs reduce methotrexate elimination — toxicity risk' }
    ],
    reason: 'Take with food to reduce GI irritation. Avoid in renal impairment.',
    evidenceGrade: 'A',
    shortDescription: 'Anti-inflammatory analgesics. COX-1/COX-2 inhibitors. GI irritation — always take with food.',
    mechanismOfAction: 'Reversible inhibition of COX-1 and COX-2 enzymes, reducing prostaglandin synthesis and inflammation.',
    longevityRelevance: 'Chronic inflammation (inflammaging) accelerates biological aging; judicious NSAID use may have anti-senescent properties, but chronic use damages GI mucosa and kidneys.',
    prescriptionOnly: false,
    rxNote: 'OTC available. Take with food. Avoid chronic daily use.',
    rxLabel: 'NSAID Class',
  },
  {
    id: 'aspirin_class',
    name: 'Aspirin (Low-dose / Standard)',
    category: 'prescription_only',
    defaultDose: '81mg daily (low-dose) / 325mg (standard)',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'Additive anticoagulation — significant bleeding risk; avoid combination without physician supervision' },
      { drug: 'ibuprofen', hours: 2, reason: 'Ibuprofen blocks aspirin antiplatelet effect — take aspirin first, wait 30 min' }
    ],
    reason: 'Take with food. Low-dose 81mg antiplatelet use is distinct from analgesic/anti-inflammatory dosing.',
    evidenceGrade: 'A',
    shortDescription: 'Antiplatelet (81mg). COX-1 inhibitor with irreversible platelet effect lasting 7–10 days.',
    mechanismOfAction: 'Irreversible acetylation of COX-1 in platelets (antiplatelet) and COX-2 (anti-inflammatory) at higher doses.',
    longevityRelevance: 'Low-dose aspirin (81mg) reduces cardiovascular events and has evidence for colorectal cancer prevention; antiplatelet effect lasts platelet lifetime (7–10 days).',
    prescriptionOnly: false,
    rxNote: 'OTC available. Low-dose aspirin use should be discussed with physician for cardiovascular risk assessment.',
    rxLabel: 'OTC / Supervised',
  },
  {
    id: 'statins_class',
    name: 'Statins (Atorvastatin / Rosuvastatin / Simvastatin)',
    category: 'prescription_only',
    defaultDose: 'Dose per prescription',
    timing: 'with_meal',
    bestTime: 'evening',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'coq10', hours: 0, reason: 'Statins deplete CoQ10 — supplementation recommended to reduce myopathy risk' },
      { drug: 'berberine', hours: 4, reason: 'Berberine inhibits OATP1B1 transporter — may raise statin plasma levels' },
      { drug: 'grapefruit', hours: 0, reason: 'CYP3A4 inhibition raises simvastatin/atorvastatin levels — avoid grapefruit' }
    ],
    reason: 'Most statins taken in evening (liver cholesterol synthesis peaks at night). Supplement CoQ10.',
    evidenceGrade: 'A',
    shortDescription: 'HMG-CoA reductase inhibitors. Reduce LDL-C. Deplete CoQ10 — supplement recommended.',
    mechanismOfAction: 'Competitive inhibition of HMG-CoA reductase, the rate-limiting enzyme in cholesterol biosynthesis; also depletes CoQ10.',
    longevityRelevance: 'Reduces cardiovascular mortality; growing evidence for pleiotropic anti-inflammatory effects beyond cholesterol lowering.',
    prescriptionOnly: true,
    rxNote: 'Prescription required. Supplement CoQ10 100–200mg daily when on statins.',
    rxLabel: 'Rx Only',
  },
  {
    id: 'levothyroxine_class',
    name: 'Levothyroxine (T4)',
    category: 'prescription_only',
    defaultDose: 'Dose per prescription (typically 25–200mcg daily)',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: ['calcium', 'iron'],
    separateFromMeds: [
      { drug: 'calcium', hours: 4, reason: 'Calcium chelates levothyroxine — reduces absorption by up to 20–40%' },
      { drug: 'iron', hours: 4, reason: 'Iron chelates levothyroxine — reduces absorption significantly' },
      { drug: 'chromium', hours: 4, reason: 'Chromium may reduce thyroid hormone absorption' }
    ],
    reason: 'Strict fasted administration 30–60 min before breakfast. Separate from calcium, iron, and many supplements by 4 hours.',
    evidenceGrade: 'A',
    shortDescription: 'Synthetic thyroid hormone T4. Central to metabolic rate, cardiovascular, and cognitive function.',
    mechanismOfAction: 'Synthetic T4 (thyroxine); converted to active T3 in peripheral tissues; binds thyroid hormone receptors to regulate metabolism.',
    longevityRelevance: 'Thyroid function is central to metabolic rate, cardiovascular health, and cognitive function; optimal TSH (0.4–2.5 mIU/L) is associated with longevity.',
    prescriptionOnly: true,
    rxNote: 'Prescription required. Take on empty stomach 30–60 min before breakfast.',
    rxLabel: 'Rx Only',
  },

  // --- Prescription-only (new OTC prohormones) ---
  {
    id: 'dhea',
    name: 'DHEA (Dehydroepiandrosterone)',
    category: 'prescription_only',
    defaultDose: '25–50mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'insulin', hours: 0, reason: 'DHEA may reduce insulin sensitivity' },
      { drug: 'anticoagulants', hours: 0, reason: 'May affect clotting factors' }
    ],
    reason: 'Take with morning meal. Test DHEA-S levels before and after supplementation.',
    evidenceGrade: 'B',
    shortDescription: 'Prohormone precursor to testosterone and estrogen. Declines ~80% from age 20–80.',
    mechanismOfAction: 'Precursor to testosterone and estrogen; activates DHEA receptors with neurosteroid and immune-modulatory effects.',
    longevityRelevance: 'DHEA declines ~80% from age 20–80; restoring levels associated with improved body composition, bone density, and immune function.',
    prescriptionOnly: true,
    rxNote: 'OTC in USA; prescription required in many countries. Supervised use strongly recommended.',
    rxLabel: 'Supervised use',
    contraindications: ['hormone_sensitive_cancer', 'prostate_cancer', 'pregnancy'],
  },
  {
    id: 'pregnenolone',
    name: 'Pregnenolone',
    category: 'prescription_only',
    defaultDose: '10–30mg',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Take with fat-containing meal. Monitor hormone levels with physician.',
    evidenceGrade: 'C',
    shortDescription: 'Master neurosteroid and prohormone precursor to all steroid hormones.',
    mechanismOfAction: 'Neurosteroid and precursor to all steroid hormones; modulates GABA and NMDA receptors in brain.',
    longevityRelevance: 'Declining neurosteroid levels contribute to cognitive aging; pregnenolone memory enhancement suggested in rodent and pilot human studies.',
    prescriptionOnly: true,
    rxNote: 'OTC in USA; supervised use recommended. Converts to DHEA, progesterone, estrogen, and testosterone.',
    rxLabel: 'Supervised use',
    contraindications: ['hormone_sensitive_cancer', 'pregnancy', 'seizure_disorder'],
  },

  // --- Vitamin (new) ---
  {
    id: 'vitamin_e_tocotrienol',
    name: 'Vitamin E Tocotrienol Complex',
    category: 'vitamin',
    defaultDose: '100–200mg tocotrienols',
    timing: 'with_fat',
    bestTime: 'evening',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'Antiplatelet effect — monitor INR if on warfarin' }
    ],
    reason: 'Fat-soluble — take with evening meal. Note: distinct from standard vitamin E (tocopherols) — do not substitute.',
    evidenceGrade: 'B',
    shortDescription: 'Delta/gamma-tocotrienol form — distinct from tocopherol. Superior neuroprotection and cardioprotection.',
    mechanismOfAction: 'Tocotrienols (delta/gamma) penetrate brain lipid bilayers more efficiently than tocopherols and inhibit HMG-CoA reductase independently of mevalonate pathway.',
    longevityRelevance: 'Superior neuroprotective and cardioprotective effects vs alpha-tocopherol alone; distinct mechanism from standard vitamin E.',
  },
  {
    id: 'methylcobalamin_b12',
    name: 'Methylcobalamin (B12)',
    category: 'vitamin',
    defaultDose: '500–1000mcg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'metformin', hours: 0, reason: 'Metformin reduces B12 absorption via Ca2+-dependent mechanism — monitor B12 levels annually' }
    ],
    reason: 'Sublingual or fasted oral. Active methylcobalamin form bypasses gastric intrinsic factor pathway.',
    evidenceGrade: 'A',
    shortDescription: 'Active coenzyme B12. Critical for myelin synthesis and homocysteine metabolism.',
    mechanismOfAction: 'Active coenzyme form of B12; directly participates in methionine synthase reaction and myelin synthesis.',
    longevityRelevance: 'B12 deficiency (common in aging and metformin users) causes hyperhomocysteinemia, cognitive decline, and neuropathy.',
  },
  {
    id: 'methylfolate',
    name: 'Methylfolate (5-MTHF, B9)',
    category: 'vitamin',
    defaultDose: '400–1000mcg 5-MTHF',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'methotrexate', hours: 0, reason: 'Folate antagonizes methotrexate mechanism — consult oncologist before combining' }
    ],
    reason: 'Take fasted in morning. Avoid folic acid (synthetic) if MTHFR variant is suspected.',
    evidenceGrade: 'A',
    shortDescription: 'Active folate form — bypasses MTHFR enzyme. Preferred for MTHFR variant carriers.',
    mechanismOfAction: 'Active 5-MTHF form bypasses MTHFR enzyme; donates methyl group directly in homocysteine remethylation.',
    longevityRelevance: 'Up to 40% of population has reduced-function MTHFR variants; methylfolate ensures effective methylation cycle regardless of genotype.',
  },
  {
    id: 'p5p_b6',
    name: 'P5P (Pyridoxal-5-Phosphate, B6)',
    category: 'vitamin',
    defaultDose: '25–50mg P5P',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'levodopa', hours: 0, reason: 'B6 accelerates peripheral levodopa conversion — reduces CNS efficacy; consult neurologist' }
    ],
    reason: 'Take with meal. P5P form is directly active — superior to pyridoxine for users with impaired kinase function.',
    evidenceGrade: 'A',
    shortDescription: 'Active coenzyme B6. Avoids peripheral neuropathy risk of high-dose pyridoxine.',
    mechanismOfAction: 'Active coenzyme form of B6 (bypasses pyridoxine kinase); cofactor in 100+ enzymatic reactions including aminotransferases and decarboxylases.',
    longevityRelevance: 'P5P deficiency contributes to elevated homocysteine and systemic inflammation; P5P form avoids peripheral neuropathy risk seen with high-dose pyridoxine.',
  },

  // === AMINO ACIDS (ADDITIONAL) ===
  {
    id: 'l_tyrosine',
    name: 'L-Tyrosine',
    category: 'amino_acid',
    defaultDose: '500-2000mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'levothyroxine', hours: 2, reason: 'Tyrosine is a thyroid hormone precursor — may alter T3/T4 balance; separate by 2 hours' },
      { drug: 'maoi', hours: 0, reason: 'MAO inhibitors + tyrosine can cause hypertensive crisis — contraindicated' },
      { drug: 'levodopa', hours: 2, reason: 'Compete for the same amino acid transporter — may reduce levodopa absorption' },
    ],
    reason: 'Fasted state maximises absorption. Precursor to dopamine, norepinephrine, and thyroid hormones.',
    evidenceGrade: 'B',
    shortDescription: 'Dopamine and norepinephrine precursor. Supports focus, mood, and thyroid function.',
    contraindications: ['maoi_use', 'hyperthyroidism', 'phenylketonuria'],
    mechanismOfAction: 'Dietary precursor to catecholamines (dopamine → norepinephrine → epinephrine) and thyroid hormones (T3/T4) via tyrosine hydroxylase pathway.',
    longevityRelevance: 'Catecholamine support declines with age; tyrosine supplementation may attenuate stress-related cognitive decline under acute stress conditions.',
  },
  {
    id: 'l_lysine',
    name: 'L-Lysine',
    category: 'amino_acid',
    defaultDose: '500-1000mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Essential amino acid — best absorbed on empty stomach. Supports collagen, calcium absorption, and immune function.',
    evidenceGrade: 'B',
    shortDescription: 'Essential amino acid for collagen synthesis, calcium absorption, and antiviral defence.',
  },
  {
    id: 'l_glutamine',
    name: 'L-Glutamine',
    category: 'amino_acid',
    defaultDose: '5-10g',
    timing: 'flexible',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'lactulose', hours: 2, reason: 'May interfere with ammonia-lowering effect' },
    ],
    reason: 'Most abundant amino acid in the body. Post-workout or before bed for gut repair and muscle recovery.',
    evidenceGrade: 'B',
    shortDescription: 'Gut lining repair, immune support, and post-exercise muscle recovery.',
  },
  {
    id: 'beta_alanine',
    name: 'Beta-Alanine',
    category: 'amino_acid',
    defaultDose: '2-5g',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Builds muscle carnosine — acts as pH buffer during high-intensity exercise. Tingling (paresthesia) is normal and harmless.',
    evidenceGrade: 'A',
    shortDescription: 'Increases muscle carnosine, delays fatigue during high-intensity exercise.',
  },
  {
    id: 'citrulline',
    name: 'L-Citrulline (or Citrulline Malate)',
    category: 'amino_acid',
    defaultDose: '3-6g L-Citrulline or 6-8g Citrulline Malate',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'sildenafil', hours: 0, reason: 'Additive vasodilation — may cause hypotension' },
      { drug: 'nitrates', hours: 0, reason: 'Additive nitric oxide effect — dangerous hypotension risk' },
    ],
    reason: 'Pre-workout on empty stomach for maximal NO boost. More effective than arginine at raising plasma arginine.',
    evidenceGrade: 'A',
    shortDescription: 'Nitric oxide precursor — improves blood flow, endurance, and reduces muscle soreness.',
    contraindications: ['nitrate_medications'],
  },

  // === METABOLIC / LONGEVITY ===
  {
    id: 'butyrate',
    name: 'Sodium Butyrate (Tributyrin)',
    category: 'metabolic',
    defaultDose: '300-600mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Short-chain fatty acid — gut barrier support and HDAC inhibitor. Enteric-coated form recommended for colonocyte delivery.',
    evidenceGrade: 'B',
    shortDescription: 'Gut barrier support, HDAC inhibitor, anti-inflammatory. Feeds colonocytes.',
  },
  {
    id: 'berberine_hcl',
    name: 'Dihydroberberine (DHB)',
    category: 'metabolic',
    defaultDose: '100-200mg',
    timing: 'with_meal',
    bestTime: 'anytime',
    avoidWith: ['cyclosporine'],
    separateFromMeds: [
      { drug: 'metformin', hours: 0, reason: 'Additive glucose-lowering effect — monitor blood sugar' },
      { drug: 'statin', hours: 4, reason: 'Inhibits CYP3A4 — may increase statin exposure' },
    ],
    reason: 'More bioavailable form of berberine (requires 5× lower dose). Take with food to blunt glucose spikes.',
    evidenceGrade: 'B',
    shortDescription: 'More bioavailable berberine analogue. AMPK activator, glucose and lipid metabolism.',
  },
  {
    id: 'urolithin_a',
    name: 'Urolithin A',
    category: 'senolytic',
    defaultDose: '500-1000mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Mitophagy activator — produced by gut bacteria from ellagic acid. Supplement bypasses variable gut microbiome conversion.',
    evidenceGrade: 'B',
    shortDescription: 'Induces mitophagy, improves mitochondrial health and muscle function.',
  },
  {
    id: 'ca_akg',
    name: 'Ca-AKG (Calcium Alpha-Ketoglutarate)',
    category: 'metabolic',
    defaultDose: '500-1000mg',
    timing: 'fasted',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'TCA cycle intermediate — take fasted for maximum absorption. Emerging longevity molecule.',
    evidenceGrade: 'B',
    shortDescription: 'TCA cycle metabolite. May slow epigenetic aging and support muscle and connective tissue.',
  },
  {
    id: 'astaxanthin',
    name: 'Astaxanthin',
    category: 'antioxidant',
    defaultDose: '4-12mg',
    timing: 'with_fat',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'May potentiate anticoagulant effect' },
    ],
    reason: 'Carotenoid — fat-soluble, requires dietary fat for absorption. 6000× stronger antioxidant than vitamin C.',
    evidenceGrade: 'B',
    shortDescription: 'Powerful carotenoid antioxidant. Skin, eye, and mitochondrial health.',
  },
  {
    id: 'collagen_peptides',
    name: 'Collagen Peptides (Type I/III)',
    category: 'amino_acid',
    defaultDose: '10-20g',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [],
    reason: 'Pair with vitamin C (increases collagen synthesis). Post-workout for connective tissue repair.',
    evidenceGrade: 'B',
    shortDescription: 'Supports skin elasticity, joint health, and connective tissue repair.',
  },
  {
    id: 'probiotics',
    name: 'Probiotics (Multi-strain)',
    category: 'metabolic',
    defaultDose: '10-50 billion CFU',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'antibiotics', hours: 2, reason: 'Antibiotics kill probiotic strains — take 2 hours apart during antibiotic course' },
    ],
    reason: 'Take with a small meal — food buffer increases survival through stomach acid.',
    evidenceGrade: 'A',
    shortDescription: 'Gut microbiome diversity, immune modulation, and GI health.',
  },
  {
    id: 'melatonin',
    name: 'Melatonin',
    category: 'sleep',
    defaultDose: '0.5-3mg',
    timing: 'bedtime',
    bestTime: 'bedtime',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'warfarin', hours: 0, reason: 'May potentiate anticoagulant effect at high doses' },
      { drug: 'sedatives', hours: 0, reason: 'Additive CNS depression' },
      { drug: 'immunosuppressants', hours: 0, reason: 'May modulate immune response' },
    ],
    reason: 'Start with 0.5mg — more is not better (0.5mg = same sleep benefit as 5mg with fewer side effects). Take 30-60 min before bed.',
    evidenceGrade: 'A',
    shortDescription: 'Sleep onset support. Lower doses (0.5-1mg) are as effective as higher doses.',
    contraindications: ['autoimmune_active'],
  },
  {
    id: 'dhea',
    name: 'DHEA',
    category: 'vitamin',
    defaultDose: '10-25mg',
    timing: 'with_meal',
    bestTime: 'morning',
    avoidWith: [],
    separateFromMeds: [
      { drug: 'insulin', hours: 0, reason: 'DHEA may alter insulin sensitivity — monitor glucose' },
      { drug: 'anticoagulants', hours: 0, reason: 'May alter coagulation factors' },
    ],
    reason: 'DHEA declines sharply after age 30. Morning dosing mirrors natural cortisol-DHEA rhythm. Start low.',
    evidenceGrade: 'B',
    shortDescription: 'Adrenal hormone precursor. Declines with age — supports energy, mood, and sex hormones.',
    contraindications: ['hormone_sensitive_cancers', 'polycystic_ovary_syndrome'],
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
