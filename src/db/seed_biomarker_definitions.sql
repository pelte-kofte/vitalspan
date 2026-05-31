-- Vitalspan Biomarker Definitions Seed
-- Source: src/data/biomarkers.ts BIOMARKERS array (51 entries)
-- Longevity-optimized ranges — NOT standard lab normals.
-- Run once via Supabase SQL editor to populate the biomarker_definitions reference table.
-- All INSERT statements use ON CONFLICT (id) DO NOTHING for idempotency.
--
-- Fields NOT seeded (static/UI-only): color, howToImprove, defaultVal, prevVal, insight, history, categoryLabel

CREATE TABLE IF NOT EXISTS biomarker_definitions (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  unit        text,
  opt_min     numeric,
  opt_max     numeric,
  category    text,
  target      text,
  description text
);

ALTER TABLE biomarker_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON biomarker_definitions
  FOR SELECT TO anon USING (true);

-- ── Cardiovascular ────────────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('apob', 'ApoB', 'mg/dL', 40, 70, 'cardio', '<70 mg/dL', 'ApoB directly measures the number of atherogenic particles — each one can lodge in arterial walls. More predictive of cardiovascular events than standard LDL-C.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('homocysteine', 'Homocysteine', 'μmol/L', 4, 8, 'cardio', '<8 μmol/L', 'Elevated homocysteine damages blood vessel walls and is a strong independent risk factor for cardiovascular disease and cognitive decline.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('ferritin', 'Ferritin', 'ng/mL', 30, 100, 'cardio', '30-100 ng/mL', 'Ferritin is the primary iron storage protein. Chronically elevated ferritin promotes oxidative stress and inflammation — a key driver of accelerated aging.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('omega3index', 'Omega-3 Index', '%', 8, 12, 'cardio', '>8%', 'The omega-3 index measures EPA+DHA in red blood cell membranes. Below 4% is high risk; above 8% is cardioprotective and associated with longer telomeres.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('lpa', 'Lp(a)', 'nmol/L', 0, 75, 'cardio', '<75 nmol/L', 'Lipoprotein(a) is an independent, genetically determined cardiovascular risk factor. Even in the presence of optimal LDL-C and ApoB, elevated Lp(a) significantly increases risk of heart attack and stroke.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('hdl', 'HDL Cholesterol', 'mg/dL', 60, 100, 'cardio', '>60 mg/dL', 'HDL (high-density lipoprotein) facilitates reverse cholesterol transport — removing cholesterol from arterial walls. Levels below 40 (men) or 50 (women) are an independent cardiovascular risk factor. Longevity target >60 mg/dL.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('ldl', 'LDL Cholesterol', 'mg/dL', 0, 70, 'cardio', '<70 mg/dL', 'LDL cholesterol is a widely used cardiovascular risk marker. In longevity medicine, the target is <70 mg/dL, well below the standard "normal" range. ApoB is preferred as it directly counts atherogenic particles.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('totalcholesterol', 'Total Cholesterol', 'mg/dL', 150, 200, 'cardio', '150–200 mg/dL', 'Total cholesterol measures the combined level of all cholesterol types in your blood, providing context for cardiovascular risk assessment alongside HDL, LDL, and particle quality.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('triglycerides', 'Triglycerides', 'mg/dL', 0, 100, 'cardio', '<100 mg/dL', 'Elevated triglycerides are an independent cardiovascular risk factor, especially when combined with low HDL (metabolic syndrome pattern). Very high levels (>500) risk pancreatitis. Longevity target <100 mg/dL.')
ON CONFLICT (id) DO NOTHING;

-- ── Metabolic ─────────────────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('hba1c', 'HbA1c', '%', 4.5, 5.3, 'metabolic', '<5.3%', 'HbA1c reflects average blood glucose over ~3 months. Each 0.1% increase above 5.0% correlates with accelerated glycation, a key aging mechanism.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('fastingglucose', 'Fasting Glucose', 'mg/dL', 70, 90, 'metabolic', '<90 mg/dL', 'Fasting glucose reflects baseline insulin sensitivity. Longevity target is <90 mg/dL — well below the diabetic threshold of 126.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('uricacid', 'Uric Acid', 'mg/dL', 2, 5.5, 'metabolic', '<5.5 mg/dL', 'Uric acid is a byproduct of purine metabolism. Chronically elevated levels cause gout, but also correlate with hypertension, insulin resistance, and kidney disease.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('fastinginsulin', 'Fasting Insulin', 'μIU/mL', 2, 6, 'metabolic', '<6 μIU/mL', 'Fasting insulin reveals insulin resistance long before fasting glucose or HbA1c become elevated. Chronically elevated insulin (hyperinsulinemia) is linked to accelerated aging, cancer risk, and metabolic disease. Standard "normal" ranges (<25) are far too permissive for longevity.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('homaIr', 'HOMA-IR', 'index', 0, 1.5, 'metabolic', '<1.5', 'HOMA-IR (Homeostatic Model Assessment of Insulin Resistance) combines fasting insulin and glucose to assess insulin sensitivity. Formula: (insulin × glucose) / 405. Values >1.5 indicate early insulin resistance; >2.5 is clinical insulin resistance.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('adiponectin', 'Adiponectin', 'μg/mL', 10, 30, 'metabolic', '>10 μg/mL', 'Adiponectin is a hormone secreted by fat cells with anti-inflammatory and insulin-sensitizing properties. Unlike most adipokines, adiponectin decreases as fat mass increases. Low levels predict insulin resistance, cardiovascular disease, and shortened lifespan.')
ON CONFLICT (id) DO NOTHING;

-- ── Inflammation ──────────────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('hscrp', 'hsCRP', 'mg/L', 0, 1.0, 'inflammation', '<1.0 mg/L', 'High-sensitivity CRP measures low-grade systemic inflammation. Chronic inflammation accelerates biological aging, atherosclerosis, and neurodegeneration.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('il6', 'IL-6', 'pg/mL', 0, 3.0, 'inflammation', '<3.0 pg/mL', 'Interleukin-6 is a pro-inflammatory cytokine central to the "inflammaging" process — chronic, low-grade inflammation that accelerates biological aging. Elevated IL-6 predicts cardiovascular disease, cognitive decline, and all-cause mortality.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('fibrinogen', 'Fibrinogen', 'mg/dL', 150, 300, 'inflammation', '<300 mg/dL', 'Fibrinogen is an acute-phase inflammatory protein and clotting factor. Chronic elevation indicates systemic inflammation and increases cardiovascular and stroke risk through increased blood viscosity and thrombogenesis.')
ON CONFLICT (id) DO NOTHING;

-- ── Hormones ──────────────────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('igf1', 'IGF-1', 'ng/mL', 100, 180, 'hormones', '100-180 ng/mL', 'IGF-1 mediates growth hormone effects. The relationship with longevity is U-shaped — both very low and very high are associated with worse outcomes.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('testosterone', 'Testosterone', 'ng/dL', 500, 900, 'hormones', '500-900 ng/dL', 'Total testosterone. In longevity medicine, maintaining levels in the upper-normal range correlates with better muscle mass, cognition, and metabolic health.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('dheas', 'DHEA-S', 'μg/dL', 150, 350, 'hormones', '150-350 μg/dL', 'DHEA-S is an adrenal hormone that declines steadily with age. Low levels correlate with increased cardiovascular risk, immune dysfunction, and accelerated aging.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('estradiol', 'Estradiol (E2)', 'pg/mL', 20, 40, 'hormones', '20-40 pg/mL (men)', 'Estradiol (E2) is the primary estrogen in both sexes. In men, it is converted from testosterone via aromatase. Optimal range in men is 20-40 pg/mL — too low impairs bone density, libido, and cardiovascular health; too high causes gynecomastia and water retention.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('cortisol', 'Cortisol (AM)', 'μg/dL', 10, 20, 'hormones', '10-20 μg/dL (8AM)', 'Cortisol follows a diurnal rhythm — peaks in the morning to promote wakefulness, then drops throughout the day. Chronically elevated cortisol (from chronic stress, sleep deprivation, or high-intensity exercise without recovery) accelerates aging, suppresses immunity, and impairs testosterone synthesis.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('shbg', 'SHBG', 'nmol/L', 20, 50, 'hormones', '20-50 nmol/L', 'Sex hormone binding globulin (SHBG) binds testosterone and estrogen, rendering them inactive. Very high SHBG (common with aging and liver disease) reduces free testosterone availability despite "normal" total testosterone. SHBG level is critical for interpreting testosterone results.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('freetestosterone', 'Free Testosterone', 'pg/mL', 100, 250, 'hormones', '>100 pg/mL', 'Free testosterone represents the ~2% of total testosterone not bound to proteins. This is the bioactive fraction that enters cells and exerts effects on muscle, brain, and metabolism. Free testosterone declines ~1-2% per year after age 30.')
ON CONFLICT (id) DO NOTHING;

-- ── Vitamins & Minerals ───────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('vitd', 'Vitamin D', 'ng/mL', 50, 80, 'vitamins', '50-80 ng/mL', 'Vitamin D3 functions as a hormone, regulating over 1,000 genes. Deficiency is associated with accelerated biological aging and immune dysfunction.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('b12', 'Vitamin B12', 'pg/mL', 500, 1000, 'vitamins', '500-1000 pg/mL', 'Vitamin B12 (cobalamin) is essential for nerve function, DNA synthesis, and methylation. B12 deficiency is common in vegans, those over 50 (reduced stomach acid), and metformin users. Low B12 elevates homocysteine, causing vascular and neurological damage.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('folate', 'Folate (RBC)', 'ng/mL', 10, 20, 'vitamins', '>10 ng/mL', 'Folate is critical for DNA methylation, repair, and synthesis. Deficiency impairs red blood cell production (macrocytic anemia), elevates homocysteine, and increases neural tube defect risk. RBC folate reflects 3-month average levels, making it more reliable than serum folate.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('magnesium', 'Magnesium (RBC)', 'mg/dL', 5.2, 6.5, 'vitamins', '5.2-6.5 mg/dL', 'Magnesium is a cofactor in over 300 enzymatic reactions. RBC magnesium better reflects true body stores than serum magnesium. Deficiency is widespread due to soil depletion. Low magnesium is associated with insulin resistance, hypertension, cardiovascular disease, and poor sleep.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('zinc', 'Zinc (plasma)', 'μg/dL', 90, 130, 'vitamins', '90-130 μg/dL', 'Zinc is an essential trace mineral involved in immune function, testosterone synthesis, and over 300 enzyme functions. Zinc deficiency causes impaired immunity, low testosterone, poor wound healing, and loss of taste/smell. Athletes and those on plant-based diets are most at risk.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('vitk2', 'Vitamin K2 (MK-7)', 'ng/mL', 0.5, 3.0, 'vitamins', '>0.5 ng/mL', 'Vitamin K2 (menaquinone-7, MK-7) activates matrix Gla protein (MGP), which prevents arterial calcification, and osteocalcin, which directs calcium into bones. It is found primarily in fermented foods (natto) and is often deficient in Western diets. Critical companion to vitamin D3.')
ON CONFLICT (id) DO NOTHING;

-- ── Complete Blood Count ───────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('lymphocytepct', 'Lymphocyte %', '%', 20, 40, 'cbc', '20-40%', 'Lymphocytes are white blood cells that coordinate adaptive immunity. Chronically low lymphocyte % is associated with immunosenescence and accelerated aging.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('mcv', 'MCV', 'fL', 80, 96, 'cbc', '80-96 fL', 'MCV measures the average size of red blood cells. High MCV (macrocytosis) often indicates B12 or folate deficiency. A key input in the PhenoAge biological aging formula.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('rdw', 'RDW', '%', 11.5, 14.0, 'cbc', '11.5-14.0%', 'RDW measures variation in red blood cell size. Elevated RDW is one of the most powerful mortality predictors in the PhenoAge formula — associated with inflammation, nutritional deficiency, and aging.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('wbc', 'WBC', '10³/μL', 4.0, 8.0, 'cbc', '4.0-8.0 ×10³/μL', 'WBC count reflects immune system activity. Chronically elevated WBC (>8,000) even within normal range is associated with inflammation, cardiovascular disease, and accelerated aging.')
ON CONFLICT (id) DO NOTHING;

-- ── Metabolic Panel ───────────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('albumin', 'Albumin', 'g/dL', 4.0, 5.0, 'metabolicPanel', '4.0-5.0 g/dL', 'Serum albumin is a major protein produced by the liver. Low levels indicate malnutrition, chronic inflammation, or liver/kidney disease. A key longevity marker.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('creatinine', 'Creatinine', 'mg/dL', 0.6, 1.1, 'metabolicPanel', '0.6-1.1 mg/dL', 'Creatinine is a waste product filtered by kidneys. Elevated levels indicate reduced kidney function (GFR). Longevity medicine targets eGFR >90 mL/min/1.73m².')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('alp', 'Alkaline Phosphatase', 'U/L', 30, 90, 'metabolicPanel', '30-90 U/L', 'ALP is an enzyme found in liver, bone, and kidneys. Elevated levels suggest liver disease, bile duct obstruction, or accelerated bone turnover. A key input in the PhenoAge biological age calculation.')
ON CONFLICT (id) DO NOTHING;

-- ── Thyroid ───────────────────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('tsh', 'TSH', 'mIU/L', 0.5, 2.5, 'thyroid', '0.5-2.5 mIU/L', 'Thyroid-stimulating hormone (TSH) is the primary screening test for thyroid function. Standard "normal" ranges (0.5-4.5) are too broad — longevity medicine targets 0.5-2.5 mIU/L. Elevated TSH indicates thyroid is under-functioning, leading to fatigue, weight gain, and impaired cognitive performance.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('freeT3', 'Free T3', 'pg/mL', 3.0, 4.5, 'thyroid', '3.0-4.5 pg/mL', 'Free T3 (triiodothyronine) is the metabolically active thyroid hormone. The body converts T4 to T3, mainly in the liver and gut. Low T3 can occur even with normal TSH if conversion is impaired (selenium deficiency, liver disease, high stress, inflammation).')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('freeT4', 'Free T4', 'ng/dL', 1.0, 1.7, 'thyroid', '1.0-1.7 ng/dL', 'Free T4 (thyroxine) is the inactive storage form of thyroid hormone produced by the thyroid gland. It is converted to active T3 peripherally. Normal free T4 with low T3 suggests conversion dysfunction. Low free T4 with high TSH confirms primary hypothyroidism.')
ON CONFLICT (id) DO NOTHING;

-- ── Liver Function ────────────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('alt', 'ALT', 'U/L', 0, 30, 'liver', '<30 U/L', 'Alanine aminotransferase (ALT) is the most liver-specific marker. Any persistent elevation above 30 U/L signals hepatocellular damage or metabolic dysfunction (NAFLD). Longevity target is <30, more conservative than the "normal" range of <55 typically used.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('ast', 'AST', 'U/L', 0, 35, 'liver', '<35 U/L', 'Aspartate aminotransferase (AST) is found in liver, heart, and muscle tissue. It is less specific than ALT but together they provide important information about liver health. A high AST/ALT ratio (>2:1) points to alcoholic hepatitis; below 1:1 suggests NAFLD.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('ggt', 'GGT', 'U/L', 0, 25, 'liver', '<25 U/L', 'Gamma-glutamyl transferase (GGT) is a sensitive marker of liver stress, alcohol intake, and oxidative stress. It is elevated even by moderate alcohol consumption. Chronically elevated GGT predicts cardiovascular mortality, diabetes, and all-cause mortality independent of ALT/AST.')
ON CONFLICT (id) DO NOTHING;

-- ── Kidney Function ───────────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('egfr', 'eGFR', 'mL/min/1.73m²', 90, 150, 'kidney', '>90 mL/min/1.73m²', 'Estimated glomerular filtration rate (eGFR) measures how efficiently the kidneys filter waste. Values below 90 indicate mildly reduced kidney function; below 60 is chronic kidney disease stage 3. eGFR declines naturally with age (~1/year) but can be accelerated by hypertension, NSAIDs, diabetes, and contrast agents.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('cystatinC', 'Cystatin C', 'mg/L', 0.5, 0.9, 'kidney', '<0.9 mg/L', 'Cystatin C is an alternative marker of kidney filtration that is superior to creatinine because it is not influenced by muscle mass, age, or sex. It detects early kidney function decline before creatinine rises. Elevated cystatin C is also an independent predictor of cardiovascular events.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('bun', 'BUN', 'mg/dL', 7, 18, 'kidney', '7-18 mg/dL', 'Blood urea nitrogen (BUN) reflects the balance between protein metabolism and kidney clearance. Elevated BUN with elevated creatinine indicates kidney impairment. Elevated BUN with normal creatinine suggests high protein intake, dehydration, or GI bleeding. BUN/creatinine ratio >20:1 suggests pre-renal causes.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('uacr', 'UACR', 'mg/g', 0, 10, 'kidney', '<10 mg/g', 'UACR measures protein leakage into urine — a sign of glomerular damage. Normal is <10 mg/g; microalbuminuria is 30-300; macroalbuminuria is >300. Even values in the 10-30 range carry elevated cardiovascular risk. It is one of the earliest markers of diabetic and hypertensive kidney disease.')
ON CONFLICT (id) DO NOTHING;

-- ── Longevity Clocks ──────────────────────────────────────────────────────────

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('vo2max', 'VO2 Max', 'mL/kg/min', 45, 70, 'longevity', '>45 mL/kg/min', 'VO2max measures the maximum rate of oxygen consumption during intense exercise. It is the strongest predictor of longevity — each 1 MET increase reduces all-cause mortality by ~13%. Zone 2 training and HIIT both improve VO2max. Declining VO2max with age is not inevitable.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('gripStrength', 'Grip Strength', 'kg', 35, 60, 'longevity', '>35 kg (men) >21 kg (women)', 'Grip strength is a powerful predictor of all-cause mortality, cardiovascular events, and functional decline. It reflects overall musculoskeletal health and is used in longevity medicine as an objective measure of aging. Sarcopenia (muscle loss) begins in the 30s and accelerates after 60 without intervention.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO biomarker_definitions (id, name, unit, opt_min, opt_max, category, target, description) VALUES
('nad', 'NAD+', 'μM (WBC)', 30, 80, 'longevity', '>30 μM', 'NAD+ (nicotinamide adenine dinucleotide) is a coenzyme critical for cellular energy production, sirtuin activation (longevity enzymes), and DNA repair. NAD+ levels decline dramatically with aging, driving metabolic dysfunction. NMN and NR supplementation raise NAD+ levels, with ongoing research into longevity benefits.')
ON CONFLICT (id) DO NOTHING;
