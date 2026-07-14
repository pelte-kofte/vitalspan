export interface BriefTopicConfig {
  id: string;
  label: string;
  query: string;
  keywords: string[];
  biomarkerTags: string[];
}

/**
 * Single source of truth for weekly PubMed discovery.
 * Queries intentionally favor human clinical evidence and exclude publication
 * types that cannot support a premium evidence brief.
 */
export const BRIEF_TOPICS: BriefTopicConfig[] = [
  {
    id: "cardiometabolic-health",
    label: "Cardiometabolic health",
    query: '(cardiometabolic OR "metabolic syndrome" OR cardiovascular) AND (healthspan OR aging OR prevention) NOT (editorial[pt] OR comment[pt])',
    keywords: ["cardiometabolic", "cardiovascular", "metabolic syndrome", "blood pressure"],
    biomarkerTags: ["hscrp", "fastingglucose", "hba1c"],
  },
  {
    id: "lipids-apob",
    label: "Lipids and ApoB",
    query: '(apolipoprotein B OR ApoB OR LDL cholesterol OR dyslipidemia) AND (risk OR prevention OR aging) NOT (editorial[pt] OR comment[pt])',
    keywords: ["apob", "apolipoprotein b", "ldl", "lipid", "dyslipidemia"],
    biomarkerTags: ["apob"],
  },
  {
    id: "glucose-insulin",
    label: "Glucose and insulin resistance",
    query: '(insulin resistance OR glycemic control OR HbA1c OR continuous glucose) AND (prevention OR aging OR healthspan) NOT (editorial[pt] OR comment[pt])',
    keywords: ["insulin resistance", "glucose", "glycemic", "hba1c", "continuous glucose"],
    biomarkerTags: ["fastingglucose", "hba1c"],
  },
  {
    id: "sleep-circadian",
    label: "Sleep and circadian health",
    query: '(sleep duration OR sleep quality OR circadian rhythm) AND (aging OR metabolic OR cardiovascular OR cognition) NOT (editorial[pt] OR comment[pt])',
    keywords: ["sleep", "circadian", "chronotype", "insomnia"],
    biomarkerTags: [],
  },
  {
    id: "exercise-vo2max",
    label: "Exercise and VO2 max",
    query: '(exercise training OR cardiorespiratory fitness OR VO2max OR strength training) AND (aging OR longevity OR healthspan) NOT (editorial[pt] OR comment[pt])',
    keywords: ["exercise", "vo2max", "vo2 max", "cardiorespiratory", "strength training"],
    biomarkerTags: [],
  },
  {
    id: "nutrition",
    label: "Nutrition",
    query: '(dietary pattern OR nutrition OR protein intake OR Mediterranean diet) AND (healthy aging OR longevity OR cardiometabolic) NOT (editorial[pt] OR comment[pt])',
    keywords: ["nutrition", "diet", "protein", "mediterranean"],
    biomarkerTags: ["fastingglucose", "hba1c", "apob"],
  },
  {
    id: "supplements",
    label: "Supplements",
    query: '(dietary supplements OR nutraceutical OR vitamin OR omega-3) AND (randomized OR systematic review OR meta-analysis OR safety) NOT (editorial[pt] OR comment[pt])',
    keywords: ["supplement", "nutraceutical", "vitamin", "omega-3", "omega 3"],
    biomarkerTags: ["vitd", "omega3index"],
  },
  {
    id: "cognitive-aging",
    label: "Cognitive aging",
    query: '(cognitive aging OR cognitive decline OR dementia prevention) AND (cohort OR randomized OR systematic review OR meta-analysis) NOT (editorial[pt] OR comment[pt])',
    keywords: ["cognitive", "cognition", "dementia", "brain aging"],
    biomarkerTags: ["homocysteine"],
  },
  {
    id: "microbiome",
    label: "Microbiome",
    query: '(gut microbiome OR gut microbiota) AND (healthy aging OR metabolic health OR inflammation) NOT (editorial[pt] OR comment[pt])',
    keywords: ["microbiome", "microbiota", "gut bacteria"],
    biomarkerTags: ["hscrp"],
  },
  {
    id: "medication-safety",
    label: "Medication safety",
    query: '(polypharmacy OR adverse drug event OR drug interaction OR deprescribing) AND (older adults OR aging OR patient safety) NOT (editorial[pt] OR comment[pt])',
    keywords: ["medication", "polypharmacy", "drug interaction", "adverse drug", "deprescribing"],
    biomarkerTags: [],
  },
  {
    id: "healthy-aging-biology",
    label: "Healthy aging biology",
    query: '(biological aging OR cellular senescence OR epigenetic clock OR geroscience) AND (human OR clinical) NOT (editorial[pt] OR comment[pt])',
    keywords: ["biological aging", "senescence", "epigenetic", "geroscience", "aging clock"],
    biomarkerTags: ["hscrp", "igf1"],
  },
  {
    id: "peptides-safety",
    label: "Peptides and peptide safety",
    query: '(peptide therapy OR peptide drug OR GLP-1 receptor agonist) AND (safety OR adverse effects OR clinical trial OR systematic review) NOT (editorial[pt] OR comment[pt])',
    keywords: ["peptide", "glp-1", "glp1", "peptide drug"],
    biomarkerTags: ["fastingglucose", "hba1c"],
  },
];

export const MAX_RESULTS_PER_TOPIC = 12;
export const INGESTION_LOOKBACK_DAYS = 10;
export const MAX_EDITORIAL_POOL = 24;
export const DRAFT_ARTICLE_COUNT = 5;
