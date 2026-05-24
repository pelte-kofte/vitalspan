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
    contraindications: ['active_infection', 'pregnancy'],
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
