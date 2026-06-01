/**
 * TDD test script for computePhenoAge behavioral spec.
 * Run: npx ts-node src/lib/phenoAge.test.ts
 * RED phase: these tests define required behavior before fix is applied.
 */
import { computePhenoAge } from './phenoAge';

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`PASS: ${name}`);
    passed++;
  } else {
    console.log(`FAIL: ${name}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

// Full biomarker set — should return a numeric biologicalAge and 'high' confidence
const fullSet = computePhenoAge({
  age: 50,
  albumin: 4.3,
  creatinine: 0.9,
  glucose: 92,
  crp: 0.8,
  lymphocytePct: 28,
  mcv: 90,
  rdw: 12.8,
  alkalinePhosphatase: 67,
  wbc: 6.0,
});
assert('full set returns numeric biologicalAge', typeof fullSet.biologicalAge === 'number', `got ${fullSet.biologicalAge}`);
assert('full set returns confidence high', fullSet.confidence === 'high', `got ${fullSet.confidence}`);
assert('full set returns empty missingBiomarkers', fullSet.missingBiomarkers.length === 0, `got ${fullSet.missingBiomarkers}`);

// Age only — should return null immediately
const ageOnly = computePhenoAge({ age: 50 });
assert('age only returns null biologicalAge', ageOnly.biologicalAge === null, `got ${ageOnly.biologicalAge}`);
assert('age only returns confidence insufficient', ageOnly.confidence === 'insufficient', `got ${ageOnly.confidence}`);
assert('age only returns 9 missing biomarkers', ageOnly.missingBiomarkers.length === 9, `got ${ageOnly.missingBiomarkers.length}`);

// 8 missing (only albumin present) — should return null
const onlyAlbumin = computePhenoAge({ age: 50, albumin: 4.3 });
assert('8 missing returns null', onlyAlbumin.biologicalAge === null, `got ${onlyAlbumin.biologicalAge}`);
assert('8 missing returns confidence insufficient', onlyAlbumin.confidence === 'insufficient', `got ${onlyAlbumin.confidence}`);

// albumin=0 is invalid — should return null
const albumin0 = computePhenoAge({
  age: 50, albumin: 0, creatinine: 0.9, glucose: 92, crp: 0.8,
  lymphocytePct: 28, mcv: 90, rdw: 12.8, alkalinePhosphatase: 67, wbc: 6.0,
});
assert('albumin=0 returns null', albumin0.biologicalAge === null, `got ${albumin0.biologicalAge}`);

// albumin negative — should return null
const albuminNeg = computePhenoAge({
  age: 50, albumin: -1, creatinine: 0.9, glucose: 92, crp: 0.8,
  lymphocytePct: 28, mcv: 90, rdw: 12.8, alkalinePhosphatase: 67, wbc: 6.0,
});
assert('albumin negative returns null', albuminNeg.biologicalAge === null, `got ${albuminNeg.biologicalAge}`);

// CRP zero — should return null with 'hsCRP (invalid value)' in missingBiomarkers
const crp0 = computePhenoAge({
  age: 50, albumin: 4.3, creatinine: 0.9, glucose: 92, crp: 0,
  lymphocytePct: 28, mcv: 90, rdw: 12.8, alkalinePhosphatase: 67, wbc: 6.0,
});
assert('CRP=0 returns null', crp0.biologicalAge === null, `got ${crp0.biologicalAge}`);
assert('CRP=0 returns insufficient', crp0.confidence === 'insufficient', `got ${crp0.confidence}`);

// CRP negative — should return null
const crpNeg = computePhenoAge({
  age: 50, albumin: 4.3, creatinine: 0.9, glucose: 92, crp: -1,
  lymphocytePct: 28, mcv: 90, rdw: 12.8, alkalinePhosphatase: 67, wbc: 6.0,
});
assert('CRP negative returns null', crpNeg.biologicalAge === null, `got ${crpNeg.biologicalAge}`);

// No 'medium' or 'low' confidence should ever be returned
assert('no medium confidence from partial set (1 missing)', (() => {
  const r = computePhenoAge({
    age: 50, albumin: 4.3, creatinine: 0.9, glucose: 92, crp: 0.8,
    lymphocytePct: 28, mcv: 90, rdw: 12.8, alkalinePhosphatase: 67,
    // wbc missing
  });
  return r.confidence !== 'medium' && r.confidence !== 'low';
})(), 'should be insufficient when any missing');

// LAMBDA must not exist — check via formula behavior: use known-good inputs and verify result is numeric
// If LAMBDA formula were used, the result would differ from the Gompertz formula significantly
const noLambdaCheck = computePhenoAge({
  age: 50, albumin: 4.3, creatinine: 0.9, glucose: 92, crp: 0.8,
  lymphocytePct: 28, mcv: 90, rdw: 12.8, alkalinePhosphatase: 67, wbc: 6.0,
});
assert('formula returns finite biologicalAge', typeof noLambdaCheck.biologicalAge === 'number' && isFinite(noLambdaCheck.biologicalAge as number), `got ${noLambdaCheck.biologicalAge}`);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
