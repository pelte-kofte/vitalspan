// Pharmacist-curated medication database
// 200 most common medications with generic/brand names and drug class
// Includes TR/US/UK brand names for international users

export interface MedicationEntry {
  genericName: string;
  brandNames: string[];   // US, UK, TR brand names
  drugClass: string;
  category: MedCategory;
}

export type MedCategory =
  | 'cardiovascular'
  | 'diabetes'
  | 'thyroid'
  | 'psychiatric'
  | 'anticoagulant'
  | 'antibiotic'
  | 'nsaid'
  | 'ppi'
  | 'statin'
  | 'respiratory'
  | 'hormonal'
  | 'neurological'
  | 'osteoporosis'
  | 'immunosuppressant'
  | 'analgesic'
  | 'other';

export const MEDICATION_DATABASE: MedicationEntry[] = [
  // ── Statins ───────────────────────────────────────────────────────────────
  { genericName: 'atorvastatin',    brandNames: ['Lipitor', 'Torvast'],                      drugClass: 'Statin',              category: 'statin' },
  { genericName: 'rosuvastatin',    brandNames: ['Crestor', 'Ezallor'],                       drugClass: 'Statin',              category: 'statin' },
  { genericName: 'simvastatin',     brandNames: ['Zocor', 'Simvacor'],                        drugClass: 'Statin',              category: 'statin' },
  { genericName: 'pravastatin',     brandNames: ['Pravachol'],                                drugClass: 'Statin',              category: 'statin' },
  { genericName: 'fluvastatin',     brandNames: ['Lescol'],                                   drugClass: 'Statin',              category: 'statin' },
  { genericName: 'lovastatin',      brandNames: ['Mevacor', 'Altoprev'],                      drugClass: 'Statin',              category: 'statin' },
  { genericName: 'pitavastatin',    brandNames: ['Livalo', 'Zypitamag'],                      drugClass: 'Statin',              category: 'statin' },
  { genericName: 'ezetimibe',       brandNames: ['Zetia', 'Ezetrol'],                         drugClass: 'Cholesterol absorption inhibitor', category: 'cardiovascular' },

  // ── Cardiovascular ────────────────────────────────────────────────────────
  { genericName: 'lisinopril',      brandNames: ['Zestril', 'Prinivil'],                      drugClass: 'ACE inhibitor',       category: 'cardiovascular' },
  { genericName: 'ramipril',        brandNames: ['Altace', 'Tritace'],                        drugClass: 'ACE inhibitor',       category: 'cardiovascular' },
  { genericName: 'enalapril',       brandNames: ['Vasotec', 'Renitec'],                       drugClass: 'ACE inhibitor',       category: 'cardiovascular' },
  { genericName: 'perindopril',     brandNames: ['Coversyl', 'Acertil'],                      drugClass: 'ACE inhibitor',       category: 'cardiovascular' },
  { genericName: 'amlodipine',      brandNames: ['Norvasc', 'Istin'],                         drugClass: 'Calcium channel blocker', category: 'cardiovascular' },
  { genericName: 'nifedipine',      brandNames: ['Adalat', 'Procardia'],                      drugClass: 'Calcium channel blocker', category: 'cardiovascular' },
  { genericName: 'diltiazem',       brandNames: ['Cardizem', 'Tiazac', 'Dilzem'],             drugClass: 'Calcium channel blocker', category: 'cardiovascular' },
  { genericName: 'verapamil',       brandNames: ['Calan', 'Isoptin', 'Verapress'],            drugClass: 'Calcium channel blocker', category: 'cardiovascular' },
  { genericName: 'losartan',        brandNames: ['Cozaar', 'Hyzaar'],                         drugClass: 'ARB',                 category: 'cardiovascular' },
  { genericName: 'valsartan',       brandNames: ['Diovan'],                                   drugClass: 'ARB',                 category: 'cardiovascular' },
  { genericName: 'candesartan',     brandNames: ['Atacand'],                                  drugClass: 'ARB',                 category: 'cardiovascular' },
  { genericName: 'irbesartan',      brandNames: ['Avapro', 'Aprovel'],                        drugClass: 'ARB',                 category: 'cardiovascular' },
  { genericName: 'telmisartan',     brandNames: ['Micardis'],                                 drugClass: 'ARB',                 category: 'cardiovascular' },
  { genericName: 'olmesartan',      brandNames: ['Benicar', 'Olmetec'],                       drugClass: 'ARB',                 category: 'cardiovascular' },
  { genericName: 'metoprolol',      brandNames: ['Lopressor', 'Toprol-XL', 'Beloc'],          drugClass: 'Beta blocker',        category: 'cardiovascular' },
  { genericName: 'bisoprolol',      brandNames: ['Zebeta', 'Concor'],                         drugClass: 'Beta blocker',        category: 'cardiovascular' },
  { genericName: 'carvedilol',      brandNames: ['Coreg', 'Dilatrend'],                       drugClass: 'Beta blocker',        category: 'cardiovascular' },
  { genericName: 'atenolol',        brandNames: ['Tenormin'],                                 drugClass: 'Beta blocker',        category: 'cardiovascular' },
  { genericName: 'nebivolol',       brandNames: ['Bystolic', 'Lobivon'],                      drugClass: 'Beta blocker',        category: 'cardiovascular' },
  { genericName: 'propranolol',     brandNames: ['Inderal', 'Innopran'],                      drugClass: 'Beta blocker',        category: 'cardiovascular' },
  { genericName: 'hydrochlorothiazide', brandNames: ['Microzide', 'HydroDIURIL'],            drugClass: 'Thiazide diuretic',   category: 'cardiovascular' },
  { genericName: 'furosemide',      brandNames: ['Lasix', 'Frusemide'],                       drugClass: 'Loop diuretic',       category: 'cardiovascular' },
  { genericName: 'spironolactone',  brandNames: ['Aldactone', 'Spirolon'],                    drugClass: 'Potassium-sparing diuretic', category: 'cardiovascular' },
  { genericName: 'digoxin',         brandNames: ['Lanoxin', 'Digitek'],                       drugClass: 'Cardiac glycoside',   category: 'cardiovascular' },
  { genericName: 'amiodarone',      brandNames: ['Cordarone', 'Pacerone'],                    drugClass: 'Antiarrhythmic',      category: 'cardiovascular' },
  { genericName: 'aspirin',         brandNames: ['Bayer Aspirin', 'Aspegic', 'Ascard'],       drugClass: 'Antiplatelet / NSAID', category: 'cardiovascular' },
  { genericName: 'clopidogrel',     brandNames: ['Plavix', 'Iscover'],                        drugClass: 'Antiplatelet',        category: 'cardiovascular' },
  { genericName: 'ticagrelor',      brandNames: ['Brilinta', 'Brilique'],                     drugClass: 'Antiplatelet',        category: 'cardiovascular' },
  { genericName: 'sacubitril/valsartan', brandNames: ['Entresto'],                            drugClass: 'ARNi',                category: 'cardiovascular' },
  { genericName: 'isosorbide mononitrate', brandNames: ['Imdur', 'Monoket'],                 drugClass: 'Nitrate',             category: 'cardiovascular' },
  { genericName: 'nitroglycerin',   brandNames: ['Nitrostat', 'Nitro-Dur', 'Nitromak'],       drugClass: 'Nitrate',             category: 'cardiovascular' },
  { genericName: 'ivabradine',      brandNames: ['Coralan', 'Procoralan'],                    drugClass: 'If channel blocker',  category: 'cardiovascular' },

  // ── Anticoagulants ────────────────────────────────────────────────────────
  { genericName: 'warfarin',        brandNames: ['Coumadin', 'Jantoven', 'Warfarin Orion'],   drugClass: 'Vitamin K antagonist', category: 'anticoagulant' },
  { genericName: 'apixaban',        brandNames: ['Eliquis'],                                  drugClass: 'Direct Xa inhibitor', category: 'anticoagulant' },
  { genericName: 'rivaroxaban',     brandNames: ['Xarelto'],                                  drugClass: 'Direct Xa inhibitor', category: 'anticoagulant' },
  { genericName: 'dabigatran',      brandNames: ['Pradaxa'],                                  drugClass: 'Direct thrombin inhibitor', category: 'anticoagulant' },
  { genericName: 'edoxaban',        brandNames: ['Savaysa', 'Lixiana'],                       drugClass: 'Direct Xa inhibitor', category: 'anticoagulant' },
  { genericName: 'enoxaparin',      brandNames: ['Lovenox', 'Clexane'],                       drugClass: 'LMWH',                category: 'anticoagulant' },

  // ── Diabetes ──────────────────────────────────────────────────────────────
  { genericName: 'metformin',       brandNames: ['Glucophage', 'Glifor', 'Fortamet'],         drugClass: 'Biguanide',           category: 'diabetes' },
  { genericName: 'empagliflozin',   brandNames: ['Jardiance', 'Jardins'],                     drugClass: 'SGLT2 inhibitor',     category: 'diabetes' },
  { genericName: 'dapagliflozin',   brandNames: ['Farxiga', 'Forxiga'],                       drugClass: 'SGLT2 inhibitor',     category: 'diabetes' },
  { genericName: 'canagliflozin',   brandNames: ['Invokana'],                                 drugClass: 'SGLT2 inhibitor',     category: 'diabetes' },
  { genericName: 'semaglutide',     brandNames: ['Ozempic', 'Wegovy', 'Rybelsus'],            drugClass: 'GLP-1 agonist',       category: 'diabetes' },
  { genericName: 'liraglutide',     brandNames: ['Victoza', 'Saxenda'],                       drugClass: 'GLP-1 agonist',       category: 'diabetes' },
  { genericName: 'dulaglutide',     brandNames: ['Trulicity'],                                drugClass: 'GLP-1 agonist',       category: 'diabetes' },
  { genericName: 'sitagliptin',     brandNames: ['Januvia'],                                  drugClass: 'DPP-4 inhibitor',     category: 'diabetes' },
  { genericName: 'saxagliptin',     brandNames: ['Onglyza'],                                  drugClass: 'DPP-4 inhibitor',     category: 'diabetes' },
  { genericName: 'linagliptin',     brandNames: ['Tradjenta'],                                drugClass: 'DPP-4 inhibitor',     category: 'diabetes' },
  { genericName: 'glipizide',       brandNames: ['Glucotrol'],                                drugClass: 'Sulfonylurea',        category: 'diabetes' },
  { genericName: 'glimepiride',     brandNames: ['Amaryl'],                                   drugClass: 'Sulfonylurea',        category: 'diabetes' },
  { genericName: 'glyburide',       brandNames: ['DiaBeta', 'Micronase'],                     drugClass: 'Sulfonylurea',        category: 'diabetes' },
  { genericName: 'pioglitazone',    brandNames: ['Actos'],                                    drugClass: 'Thiazolidinedione',   category: 'diabetes' },
  { genericName: 'insulin glargine', brandNames: ['Lantus', 'Toujeo', 'Basaglar'],            drugClass: 'Long-acting insulin', category: 'diabetes' },
  { genericName: 'insulin aspart',  brandNames: ['NovoLog', 'NovoRapid'],                     drugClass: 'Rapid-acting insulin', category: 'diabetes' },
  { genericName: 'insulin lispro',  brandNames: ['Humalog', 'Admelog'],                       drugClass: 'Rapid-acting insulin', category: 'diabetes' },
  { genericName: 'insulin detemir', brandNames: ['Levemir'],                                  drugClass: 'Long-acting insulin', category: 'diabetes' },

  // ── Thyroid ───────────────────────────────────────────────────────────────
  { genericName: 'levothyroxine',   brandNames: ['Synthroid', 'Levoxyl', 'Euthyrox'],         drugClass: 'Thyroid hormone',     category: 'thyroid' },
  { genericName: 'liothyronine',    brandNames: ['Cytomel', 'Triostat'],                      drugClass: 'T3 thyroid hormone',  category: 'thyroid' },
  { genericName: 'methimazole',     brandNames: ['Tapazole', 'Strumazol'],                    drugClass: 'Antithyroid',         category: 'thyroid' },
  { genericName: 'propylthiouracil', brandNames: ['PTU'],                                     drugClass: 'Antithyroid',         category: 'thyroid' },

  // ── PPIs & GI ─────────────────────────────────────────────────────────────
  { genericName: 'omeprazole',      brandNames: ['Prilosec', 'Losec', 'Omnik'],               drugClass: 'Proton pump inhibitor', category: 'ppi' },
  { genericName: 'pantoprazole',    brandNames: ['Protonix', 'Pantoloc', 'Pantozol'],         drugClass: 'Proton pump inhibitor', category: 'ppi' },
  { genericName: 'esomeprazole',    brandNames: ['Nexium'],                                   drugClass: 'Proton pump inhibitor', category: 'ppi' },
  { genericName: 'lansoprazole',    brandNames: ['Prevacid', 'Zoton'],                        drugClass: 'Proton pump inhibitor', category: 'ppi' },
  { genericName: 'rabeprazole',     brandNames: ['Aciphex', 'Pariet'],                        drugClass: 'Proton pump inhibitor', category: 'ppi' },
  { genericName: 'ranitidine',      brandNames: ['Zantac'],                                   drugClass: 'H2 blocker',          category: 'ppi' },
  { genericName: 'famotidine',      brandNames: ['Pepcid'],                                   drugClass: 'H2 blocker',          category: 'ppi' },
  { genericName: 'ondansetron',     brandNames: ['Zofran', 'Zofran ODT'],                     drugClass: 'Antiemetic',          category: 'other' },
  { genericName: 'metoclopramide',  brandNames: ['Reglan', 'Primperan'],                      drugClass: 'Prokinetic',          category: 'other' },

  // ── NSAIDs & Analgesics ───────────────────────────────────────────────────
  { genericName: 'ibuprofen',       brandNames: ['Advil', 'Motrin', 'Nurofen', 'Brufen'],     drugClass: 'NSAID',               category: 'nsaid' },
  { genericName: 'naproxen',        brandNames: ['Aleve', 'Naprosyn', 'Synflex'],             drugClass: 'NSAID',               category: 'nsaid' },
  { genericName: 'diclofenac',      brandNames: ['Voltaren', 'Cataflam', 'Voltarol'],         drugClass: 'NSAID',               category: 'nsaid' },
  { genericName: 'celecoxib',       brandNames: ['Celebrex'],                                 drugClass: 'COX-2 inhibitor',     category: 'nsaid' },
  { genericName: 'meloxicam',       brandNames: ['Mobic', 'Movalis'],                         drugClass: 'COX-2 preferential NSAID', category: 'nsaid' },
  { genericName: 'indomethacin',    brandNames: ['Indocin', 'Indometacin'],                   drugClass: 'NSAID',               category: 'nsaid' },
  { genericName: 'paracetamol',     brandNames: ['Tylenol', 'Panadol', 'Efferalgan'],         drugClass: 'Analgesic/antipyretic', category: 'analgesic' },
  { genericName: 'tramadol',        brandNames: ['Ultram', 'Tramal'],                         drugClass: 'Opioid analgesic',    category: 'analgesic' },
  { genericName: 'codeine',         brandNames: ['Tylenol with Codeine', 'Codipront'],        drugClass: 'Opioid analgesic',    category: 'analgesic' },
  { genericName: 'pregabalin',      brandNames: ['Lyrica'],                                   drugClass: 'Anticonvulsant/neuropathic pain', category: 'neurological' },
  { genericName: 'gabapentin',      brandNames: ['Neurontin', 'Gralise'],                     drugClass: 'Anticonvulsant/neuropathic pain', category: 'neurological' },

  // ── Psychiatric / CNS ─────────────────────────────────────────────────────
  { genericName: 'sertraline',      brandNames: ['Zoloft', 'Lustral'],                        drugClass: 'SSRI antidepressant', category: 'psychiatric' },
  { genericName: 'fluoxetine',      brandNames: ['Prozac', 'Sarafem', 'Fluctin'],             drugClass: 'SSRI antidepressant', category: 'psychiatric' },
  { genericName: 'escitalopram',    brandNames: ['Lexapro', 'Cipralex'],                      drugClass: 'SSRI antidepressant', category: 'psychiatric' },
  { genericName: 'citalopram',      brandNames: ['Celexa', 'Cipramil'],                       drugClass: 'SSRI antidepressant', category: 'psychiatric' },
  { genericName: 'paroxetine',      brandNames: ['Paxil', 'Seroxat'],                         drugClass: 'SSRI antidepressant', category: 'psychiatric' },
  { genericName: 'venlafaxine',     brandNames: ['Effexor', 'Effexor XR', 'Efexor'],          drugClass: 'SNRI antidepressant', category: 'psychiatric' },
  { genericName: 'duloxetine',      brandNames: ['Cymbalta', 'Yentreve'],                     drugClass: 'SNRI antidepressant', category: 'psychiatric' },
  { genericName: 'bupropion',       brandNames: ['Wellbutrin', 'Zyban'],                      drugClass: 'NDRI antidepressant', category: 'psychiatric' },
  { genericName: 'mirtazapine',     brandNames: ['Remeron', 'Zispin'],                        drugClass: 'NaSSA antidepressant', category: 'psychiatric' },
  { genericName: 'amitriptyline',   brandNames: ['Elavil', 'Endep', 'Sarotex'],               drugClass: 'TCA antidepressant',  category: 'psychiatric' },
  { genericName: 'trazodone',       brandNames: ['Desyrel', 'Oleptro'],                       drugClass: 'Antidepressant/sedative', category: 'psychiatric' },
  { genericName: 'quetiapine',      brandNames: ['Seroquel'],                                 drugClass: 'Atypical antipsychotic', category: 'psychiatric' },
  { genericName: 'risperidone',     brandNames: ['Risperdal', 'Rispen'],                      drugClass: 'Atypical antipsychotic', category: 'psychiatric' },
  { genericName: 'olanzapine',      brandNames: ['Zyprexa'],                                  drugClass: 'Atypical antipsychotic', category: 'psychiatric' },
  { genericName: 'aripiprazole',    brandNames: ['Abilify'],                                  drugClass: 'Atypical antipsychotic', category: 'psychiatric' },
  { genericName: 'lithium',         brandNames: ['Lithobid', 'Eskalith', 'Priadel'],          drugClass: 'Mood stabilizer',     category: 'psychiatric' },
  { genericName: 'valproate',       brandNames: ['Depakote', 'Depakene', 'Epilim'],           drugClass: 'Mood stabilizer/anticonvulsant', category: 'psychiatric' },
  { genericName: 'alprazolam',      brandNames: ['Xanax'],                                    drugClass: 'Benzodiazepine',      category: 'psychiatric' },
  { genericName: 'lorazepam',       brandNames: ['Ativan'],                                   drugClass: 'Benzodiazepine',      category: 'psychiatric' },
  { genericName: 'diazepam',        brandNames: ['Valium'],                                   drugClass: 'Benzodiazepine',      category: 'psychiatric' },
  { genericName: 'clonazepam',      brandNames: ['Klonopin', 'Rivotril'],                     drugClass: 'Benzodiazepine',      category: 'psychiatric' },
  { genericName: 'zolpidem',        brandNames: ['Ambien', 'Stilnox'],                        drugClass: 'Sedative (Z-drug)',   category: 'psychiatric' },
  { genericName: 'zopiclone',       brandNames: ['Imovane', 'Zimovane'],                      drugClass: 'Sedative (Z-drug)',   category: 'psychiatric' },
  { genericName: 'melatonin',       brandNames: ['Circadin', 'Slenyto'],                      drugClass: 'Sleep hormone',       category: 'psychiatric' },
  { genericName: 'methylphenidate', brandNames: ['Ritalin', 'Concerta', 'Medikinet'],         drugClass: 'CNS stimulant',       category: 'psychiatric' },
  { genericName: 'lisdexamfetamine', brandNames: ['Vyvanse', 'Elvanse'],                      drugClass: 'CNS stimulant',       category: 'psychiatric' },
  { genericName: 'modafinil',       brandNames: ['Provigil', 'Modavigil'],                    drugClass: 'Wakefulness agent',   category: 'psychiatric' },
  { genericName: 'levodopa/carbidopa', brandNames: ['Sinemet', 'Stalevo'],                    drugClass: 'Dopamine precursor',  category: 'neurological' },
  { genericName: 'donepezil',       brandNames: ['Aricept'],                                  drugClass: 'Cholinesterase inhibitor', category: 'neurological' },
  { genericName: 'memantine',       brandNames: ['Namenda', 'Ebixa'],                         drugClass: 'NMDA antagonist',     category: 'neurological' },

  // ── Antibiotics ───────────────────────────────────────────────────────────
  { genericName: 'amoxicillin',     brandNames: ['Amoxil', 'Trimox'],                         drugClass: 'Penicillin antibiotic', category: 'antibiotic' },
  { genericName: 'amoxicillin/clavulanate', brandNames: ['Augmentin', 'Clavulin'],            drugClass: 'Beta-lactam/inhibitor', category: 'antibiotic' },
  { genericName: 'azithromycin',    brandNames: ['Zithromax', 'Z-Pak', 'Zitromax'],           drugClass: 'Macrolide antibiotic', category: 'antibiotic' },
  { genericName: 'clarithromycin',  brandNames: ['Biaxin', 'Klacid'],                         drugClass: 'Macrolide antibiotic', category: 'antibiotic' },
  { genericName: 'ciprofloxacin',   brandNames: ['Cipro', 'Ciproxin'],                        drugClass: 'Fluoroquinolone',      category: 'antibiotic' },
  { genericName: 'levofloxacin',    brandNames: ['Levaquin', 'Tavanic'],                      drugClass: 'Fluoroquinolone',      category: 'antibiotic' },
  { genericName: 'doxycycline',     brandNames: ['Vibramycin', 'Doryx'],                      drugClass: 'Tetracycline antibiotic', category: 'antibiotic' },
  { genericName: 'trimethoprim/sulfamethoxazole', brandNames: ['Bactrim', 'Septra'],          drugClass: 'Sulfonamide antibiotic', category: 'antibiotic' },
  { genericName: 'metronidazole',   brandNames: ['Flagyl'],                                   drugClass: 'Nitroimidazole antibiotic', category: 'antibiotic' },
  { genericName: 'nitrofurantoin',  brandNames: ['Macrobid', 'Macrodantin'],                  drugClass: 'Urinary antibiotic',  category: 'antibiotic' },
  { genericName: 'cephalexin',      brandNames: ['Keflex'],                                   drugClass: 'Cephalosporin antibiotic', category: 'antibiotic' },
  { genericName: 'clindamycin',     brandNames: ['Cleocin', 'Dalacin'],                       drugClass: 'Lincosamide antibiotic', category: 'antibiotic' },
  { genericName: 'vancomycin',      brandNames: ['Vancocin'],                                 drugClass: 'Glycopeptide antibiotic', category: 'antibiotic' },
  { genericName: 'rifampicin',      brandNames: ['Rifadin', 'Rimactane'],                     drugClass: 'Rifamycin antibiotic', category: 'antibiotic' },
  { genericName: 'isoniazid',       brandNames: ['Isoniazid'],                                drugClass: 'Antitubercular',       category: 'antibiotic' },

  // ── Respiratory ───────────────────────────────────────────────────────────
  { genericName: 'salbutamol',      brandNames: ['Ventolin', 'ProAir', 'Sultanol'],           drugClass: 'SABA bronchodilator', category: 'respiratory' },
  { genericName: 'salmeterol',      brandNames: ['Serevent'],                                 drugClass: 'LABA bronchodilator', category: 'respiratory' },
  { genericName: 'formoterol',      brandNames: ['Foradil', 'Oxis'],                          drugClass: 'LABA bronchodilator', category: 'respiratory' },
  { genericName: 'tiotropium',      brandNames: ['Spiriva'],                                  drugClass: 'LAMA bronchodilator', category: 'respiratory' },
  { genericName: 'fluticasone',     brandNames: ['Flovent', 'Flixotide'],                     drugClass: 'Inhaled corticosteroid', category: 'respiratory' },
  { genericName: 'budesonide',      brandNames: ['Pulmicort', 'Symbicort'],                   drugClass: 'Inhaled corticosteroid', category: 'respiratory' },
  { genericName: 'beclomethasone',  brandNames: ['Qvar', 'Becotide'],                         drugClass: 'Inhaled corticosteroid', category: 'respiratory' },
  { genericName: 'montelukast',     brandNames: ['Singulair'],                                drugClass: 'Leukotriene antagonist', category: 'respiratory' },
  { genericName: 'cetirizine',      brandNames: ['Zyrtec', 'Reactine'],                       drugClass: 'Antihistamine',       category: 'respiratory' },
  { genericName: 'loratadine',      brandNames: ['Claritin', 'Clarityn'],                     drugClass: 'Antihistamine',       category: 'respiratory' },
  { genericName: 'fexofenadine',    brandNames: ['Allegra', 'Telfast'],                       drugClass: 'Antihistamine',       category: 'respiratory' },
  { genericName: 'prednisolone',    brandNames: ['Deltacortril', 'Prelone'],                  drugClass: 'Corticosteroid',      category: 'respiratory' },
  { genericName: 'prednisone',      brandNames: ['Rayos', 'Prednisone'],                      drugClass: 'Corticosteroid',      category: 'respiratory' },

  // ── Hormonal ──────────────────────────────────────────────────────────────
  { genericName: 'estradiol',       brandNames: ['Estrace', 'Climara', 'Divigel'],            drugClass: 'Estrogen HRT',        category: 'hormonal' },
  { genericName: 'progesterone',    brandNames: ['Prometrium', 'Utrogestan'],                 drugClass: 'Progesterone HRT',    category: 'hormonal' },
  { genericName: 'norethisterone',  brandNames: ['Primolut', 'Aygestin'],                     drugClass: 'Progestogen',         category: 'hormonal' },
  { genericName: 'testosterone',    brandNames: ['AndroGel', 'Testogel', 'Nebido'],           drugClass: 'Testosterone HRT',    category: 'hormonal' },
  { genericName: 'ethinylestradiol', brandNames: ['Various OCP combinations'],                drugClass: 'Oral contraceptive',  category: 'hormonal' },
  { genericName: 'desogestrel',     brandNames: ['Cerazette', 'Desogestrel'],                 drugClass: 'Progestin-only pill', category: 'hormonal' },

  // ── Osteoporosis ──────────────────────────────────────────────────────────
  { genericName: 'alendronate',     brandNames: ['Fosamax', 'Fosavance'],                     drugClass: 'Bisphosphonate',      category: 'osteoporosis' },
  { genericName: 'risedronate',     brandNames: ['Actonel', 'Atelvia'],                       drugClass: 'Bisphosphonate',      category: 'osteoporosis' },
  { genericName: 'ibandronate',     brandNames: ['Boniva', 'Bondronat'],                      drugClass: 'Bisphosphonate',      category: 'osteoporosis' },
  { genericName: 'zoledronic acid', brandNames: ['Reclast', 'Zometa'],                        drugClass: 'IV Bisphosphonate',   category: 'osteoporosis' },
  { genericName: 'denosumab',       brandNames: ['Prolia', 'Xgeva'],                          drugClass: 'RANK-L inhibitor',    category: 'osteoporosis' },
  { genericName: 'teriparatide',    brandNames: ['Forteo', 'Forsteo'],                        drugClass: 'PTH analogue',        category: 'osteoporosis' },

  // ── Immunosuppressants ────────────────────────────────────────────────────
  { genericName: 'methotrexate',    brandNames: ['Rheumatrex', 'Trexall', 'Metoject'],        drugClass: 'DMARD',               category: 'immunosuppressant' },
  { genericName: 'hydroxychloroquine', brandNames: ['Plaquenil'],                             drugClass: 'Antimalarial/DMARD',  category: 'immunosuppressant' },
  { genericName: 'azathioprine',    brandNames: ['Imuran', 'Azasan'],                         drugClass: 'Immunosuppressant',   category: 'immunosuppressant' },
  { genericName: 'cyclosporine',    brandNames: ['Neoral', 'Sandimmune'],                     drugClass: 'Calcineurin inhibitor', category: 'immunosuppressant' },
  { genericName: 'tacrolimus',      brandNames: ['Prograf', 'Advagraf'],                      drugClass: 'Calcineurin inhibitor', category: 'immunosuppressant' },
  { genericName: 'mycophenolate',   brandNames: ['CellCept', 'Myfortic'],                     drugClass: 'Immunosuppressant',   category: 'immunosuppressant' },
  { genericName: 'leflunomide',     brandNames: ['Arava'],                                    drugClass: 'DMARD',               category: 'immunosuppressant' },

  // ── Neurological / Epilepsy ───────────────────────────────────────────────
  { genericName: 'lamotrigine',     brandNames: ['Lamictal'],                                 drugClass: 'Anticonvulsant',      category: 'neurological' },
  { genericName: 'carbamazepine',   brandNames: ['Tegretol'],                                 drugClass: 'Anticonvulsant',      category: 'neurological' },
  { genericName: 'phenytoin',       brandNames: ['Dilantin', 'Epanutin'],                     drugClass: 'Anticonvulsant',      category: 'neurological' },
  { genericName: 'levetiracetam',   brandNames: ['Keppra'],                                   drugClass: 'Anticonvulsant',      category: 'neurological' },
  { genericName: 'topiramate',      brandNames: ['Topamax'],                                  drugClass: 'Anticonvulsant',      category: 'neurological' },
  { genericName: 'sumatriptan',     brandNames: ['Imitrex', 'Imigran'],                       drugClass: 'Triptan (migraine)',  category: 'neurological' },
  { genericName: 'zolmitriptan',    brandNames: ['Zomig'],                                    drugClass: 'Triptan (migraine)',  category: 'neurological' },

  // ── Gout & Uric acid ──────────────────────────────────────────────────────
  { genericName: 'allopurinol',     brandNames: ['Zyloprim', 'Lopurin'],                      drugClass: 'Xanthine oxidase inhibitor', category: 'other' },
  { genericName: 'febuxostat',      brandNames: ['Uloric', 'Adenuric'],                       drugClass: 'Xanthine oxidase inhibitor', category: 'other' },
  { genericName: 'colchicine',      brandNames: ['Colcrys', 'Mitigare'],                      drugClass: 'Antigout',            category: 'other' },

  // ── Miscellaneous ─────────────────────────────────────────────────────────
  { genericName: 'finasteride',     brandNames: ['Propecia', 'Proscar'],                      drugClass: '5-alpha reductase inhibitor', category: 'other' },
  { genericName: 'tamsulosin',      brandNames: ['Flomax', 'Flomaxtra'],                      drugClass: 'Alpha-1 blocker',     category: 'other' },
  { genericName: 'sildenafil',      brandNames: ['Viagra', 'Revatio'],                        drugClass: 'PDE5 inhibitor',      category: 'other' },
  { genericName: 'tadalafil',       brandNames: ['Cialis', 'Adcirca'],                        drugClass: 'PDE5 inhibitor',      category: 'other' },
  { genericName: 'naltrexone',      brandNames: ['Vivitrol', 'ReVia'],                        drugClass: 'Opioid antagonist',   category: 'other' },
  { genericName: 'acyclovir',       brandNames: ['Zovirax'],                                  drugClass: 'Antiviral',           category: 'antibiotic' },
  { genericName: 'valacyclovir',    brandNames: ['Valtrex'],                                  drugClass: 'Antiviral',           category: 'antibiotic' },
  { genericName: 'oseltamivir',     brandNames: ['Tamiflu'],                                  drugClass: 'Antiviral',           category: 'antibiotic' },
  { genericName: 'fluconazole',     brandNames: ['Diflucan'],                                 drugClass: 'Antifungal',          category: 'antibiotic' },
  { genericName: 'iron sulfate',    brandNames: ['Feosol', 'Slow Fe'],                        drugClass: 'Iron supplement',     category: 'other' },
  { genericName: 'folic acid',      brandNames: ['Folate'],                                   drugClass: 'Vitamin B9 supplement', category: 'other' },
  { genericName: 'vitamin B12',     brandNames: ['Cyanocobalamin', 'Methylcobalamin'],         drugClass: 'Vitamin B12 supplement', category: 'other' },
  { genericName: 'calcium carbonate', brandNames: ['Tums', 'Caltrate', 'Calcichew'],          drugClass: 'Calcium supplement',  category: 'osteoporosis' },
  { genericName: 'vitamin D3',      brandNames: ['Cholecalciferol', 'D-Pearls'],              drugClass: 'Vitamin D supplement', category: 'other' },
  { genericName: 'dexamethasone',   brandNames: ['Decadron', 'Dexasone'],                     drugClass: 'Corticosteroid',      category: 'other' },
  { genericName: 'hydrocortisone',  brandNames: ['Cortef', 'Solu-Cortef'],                    drugClass: 'Corticosteroid',      category: 'other' },
  { genericName: 'methylprednisolone', brandNames: ['Medrol', 'Solu-Medrol'],                 drugClass: 'Corticosteroid',      category: 'other' },
  { genericName: 'vardenafil',      brandNames: ['Levitra', 'Staxyn'],                        drugClass: 'PDE5 inhibitor',      category: 'other' },
  { genericName: 'drospirenone',    brandNames: ['Yasmin', 'Yaz'],                            drugClass: 'Oral contraceptive',  category: 'hormonal' },
  { genericName: 'tirzepatide',     brandNames: ['Mounjaro', 'Zepbound'],                     drugClass: 'GIP/GLP-1 agonist',  category: 'diabetes' },
  { genericName: 'empagliflozin/metformin', brandNames: ['Synjardy', 'Jardiance Combo'],      drugClass: 'SGLT2+Biguanide',    category: 'diabetes' },
  { genericName: 'acarbose',        brandNames: ['Precose', 'Glucobay'],                      drugClass: 'Alpha-glucosidase inhibitor', category: 'diabetes' },
  { genericName: 'repaglinide',     brandNames: ['Prandin', 'NovoNorm'],                      drugClass: 'Meglitinide',         category: 'diabetes' },
  { genericName: 'dapagliflozin/metformin', brandNames: ['Xigduo'],                          drugClass: 'SGLT2+Biguanide',    category: 'diabetes' },
];

// Levenshtein distance for typo tolerance
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export interface MedicationResult {
  genericName: string;
  brandName: string;
  drugClass: string;
  category: MedCategory;
}

export function searchMedications(query: string, limit = 8): MedicationResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const scored: { entry: MedicationEntry; score: number; brand: string }[] = [];

  for (const entry of MEDICATION_DATABASE) {
    const generic = entry.genericName.toLowerCase();
    const brands = entry.brandNames.map(b => b.toLowerCase());
    const allNames = [generic, ...brands];

    let bestScore = Infinity;
    let bestBrand = '';

    for (const name of allNames) {
      // Exact prefix match (highest priority)
      if (name.startsWith(q)) {
        bestScore = -1;
        bestBrand = name !== generic ? entry.brandNames[entry.brandNames.map(b => b.toLowerCase()).indexOf(name)] : '';
        break;
      }
      // Contains match
      if (name.includes(q)) {
        const score = name.indexOf(q);
        if (score < bestScore) {
          bestScore = score;
          bestBrand = name !== generic ? entry.brandNames[entry.brandNames.map(b => b.toLowerCase()).indexOf(name)] ?? '' : '';
        }
        continue;
      }
      // Levenshtein (only for longer queries to avoid false positives)
      if (q.length >= 4) {
        const dist = levenshtein(q, name.slice(0, q.length + 2));
        const threshold = q.length <= 5 ? 1 : 2;
        if (dist <= threshold && dist + 50 < bestScore) {
          bestScore = dist + 50;
          bestBrand = name !== generic ? entry.brandNames[entry.brandNames.map(b => b.toLowerCase()).indexOf(name)] ?? '' : '';
        }
      }
    }

    if (bestScore < Infinity) {
      scored.push({ entry, score: bestScore, brand: bestBrand });
    }
  }

  scored.sort((a, b) => a.score - b.score);

  return scored.slice(0, limit).map(({ entry, brand }) => ({
    genericName: entry.genericName,
    brandName: brand,
    drugClass: entry.drugClass,
    category: entry.category,
  }));
}
