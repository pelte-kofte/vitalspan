/**
 * Lightweight local verification script retained for developers who run this
 * file directly. The authoritative automated coverage lives in
 * src/__tests__/phenoAgeScientificStopLoss.test.ts.
 */
import { computePhenoAge, type PhenoAgeMeasurement } from './phenoAge';

const collectedAt = '2026-01-01T00:00:00.000Z';
const measure = (value: number, unit: string): PhenoAgeMeasurement => ({
  value,
  unit,
  collectedAt,
  unitSource: 'reported',
});

const result = computePhenoAge({
  age: 40,
  asOf: '2026-01-02T00:00:00.000Z',
  albumin: measure(44, 'g/L'),
  creatinine: measure(79.56, 'μmol/L'),
  glucose: measure(4.99495, 'mmol/L'),
  crp: measure(0.1, 'mg/dL'),
  lymphocytePct: measure(30, '%'),
  mcv: measure(90, 'fL'),
  rdw: measure(13, '%'),
  alkalinePhosphatase: measure(65, 'U/L'),
  wbc: measure(6, '10^3/μL'),
});

if (result.status !== 'calculated' || result.bloodPhenotypicAge !== 33.2) {
  throw new Error(`Published fixture failed: ${JSON.stringify(result)}`);
}
