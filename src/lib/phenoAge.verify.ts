/** Dev-only verification script. Not imported by app code. Run: npx ts-node src/lib/phenoAge.verify.ts */
import { computePhenoAge } from './phenoAge';

// ---------------------------------------------------------------------------
// Reference test cases sourced from Levine 2018 / NHANES population data.
// All biomarker values are in US lab units (consistent with model calibration).
// ---------------------------------------------------------------------------

interface TestCase {
  name: string;
  inputs: Parameters<typeof computePhenoAge>[0];
  assertion: (biologicalAge: number) => boolean;
  expected: string;
  rationale: string;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'CASE 1 — NHANES population median, age 50',
    inputs: {
      age: 50,
      albumin: 4.3,             // g/dL — NHANES median
      creatinine: 0.9,          // mg/dL
      glucose: 92.0,            // mg/dL fasting
      crp: 0.8,                 // mg/L hsCRP
      lymphocytePct: 28.0,      // %
      mcv: 90.0,                // fL
      rdw: 12.8,                // %
      alkalinePhosphatase: 67.0, // U/L
      wbc: 6.0,                 // 10^3/μL
    },
    assertion: (ba) => ba >= 47 && ba <= 57,
    expected: 'biologicalAge in [47, 57]',
    rationale: 'Population median inputs should map to approximately chronological age (±7 years)',
  },
  {
    name: 'CASE 2 — Optimal "healthy 50-year-old" profile',
    inputs: {
      age: 50,
      albumin: 4.7,             // g/dL — high-normal (longevity-optimal)
      creatinine: 0.8,          // mg/dL — low-normal
      glucose: 83.0,            // mg/dL — optimal fasting
      crp: 0.3,                 // mg/L — low inflammation
      lymphocytePct: 35.0,      // % — healthy immune profile
      mcv: 88.0,                // fL — normal
      rdw: 12.0,                // % — low (good)
      alkalinePhosphatase: 50.0, // U/L — low-normal
      wbc: 5.0,                 // 10^3/μL — optimal
    },
    assertion: (ba) => ba < 50,
    expected: 'biologicalAge < 50',
    rationale: 'All values pushed toward longevity-optimal side of normal range → younger bio age',
  },
  {
    name: 'CASE 3 — Suboptimal "adverse 50-year-old" profile',
    inputs: {
      age: 50,
      albumin: 3.8,              // g/dL — low-normal (adverse)
      creatinine: 1.3,           // mg/dL — high-normal (adverse)
      glucose: 115.0,            // mg/dL — pre-diabetic
      crp: 3.5,                  // mg/L — elevated inflammation
      lymphocytePct: 20.0,       // % — low (adverse immune)
      mcv: 95.0,                 // fL — high-normal
      rdw: 14.5,                 // % — elevated (adverse)
      alkalinePhosphatase: 95.0, // U/L — high-normal
      wbc: 8.5,                  // 10^3/μL — high-normal
    },
    assertion: (ba) => ba > 50,
    expected: 'biologicalAge > 50',
    rationale: 'All values pushed toward adverse side of normal range → older bio age',
  },
];

// ---------------------------------------------------------------------------
// Run tests
// ---------------------------------------------------------------------------

let allPassed = true;

for (const tc of TEST_CASES) {
  const result = computePhenoAge(tc.inputs);

  if (result.biologicalAge === null) {
    console.log(`FAIL: ${tc.name}`);
    console.log(`  Expected: ${tc.expected}`);
    console.log(`  Got: biologicalAge = null (confidence: ${result.confidence}, missing: ${result.missingBiomarkers.join(', ') || 'none'})`);
    allPassed = false;
    continue;
  }

  const passed = tc.assertion(result.biologicalAge);
  if (passed) {
    console.log(`PASS: ${tc.name}`);
    console.log(`  biologicalAge = ${result.biologicalAge} — ${tc.expected}`);
  } else {
    console.log(`FAIL: ${tc.name}`);
    console.log(`  Expected: ${tc.expected}`);
    console.log(`  Got: biologicalAge = ${result.biologicalAge}`);
    console.log(`  Rationale: ${tc.rationale}`);
    allPassed = false;
  }
}

console.log('');
console.log(allPassed ? 'All 3 reference cases PASSED' : 'FAILED — one or more reference cases did not pass');

process.exit(allPassed ? 0 : 1);
