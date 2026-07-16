/** Run directly to print the canonical Phase 0 PhenoAge fixture result. */
import { computePhenoAge, type PhenoAgeMeasurement } from './phenoAge';

const collectedAt = '2026-01-01T00:00:00.000Z';
const measurement = (value: number, unit: string): PhenoAgeMeasurement => ({
  value,
  unit,
  collectedAt,
  unitSource: 'reported',
});

const result = computePhenoAge({
  age: 40,
  asOf: '2026-01-02T00:00:00.000Z',
  albumin: measurement(4.4, 'g/dL'),
  creatinine: measurement(0.9, 'mg/dL'),
  glucose: measurement(90, 'mg/dL'),
  crp: measurement(1, 'mg/L'),
  lymphocytePct: measurement(30, '%'),
  mcv: measurement(90, 'fL'),
  rdw: measurement(13, '%'),
  alkalinePhosphatase: measurement(65, 'U/L'),
  wbc: measurement(6, '×10³/μL'),
});

console.log(JSON.stringify(result, null, 2));
