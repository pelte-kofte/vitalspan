'use strict';

/*
 * Independent JavaScript runtime probe for Clinical PhenoAge v1.0.0.
 * It is not imported by the application or by the calculation engine.
 * Run unchanged with Node and Hermes; numeric fields must match the documented
 * cross-runtime tolerance. Same-runtime repetitions must match byte-for-byte.
 */

function evaluate(input) {
  var naturalLogCrp = Math.log(input.crp);
  var linearPredictor = -19.9067
    - 0.0336 * input.albumin
    + 0.0095 * input.creatinine
    + 0.1953 * input.glucose
    + 0.0954 * naturalLogCrp
    - 0.0120 * input.lymphocyte_percent
    + 0.0268 * input.mean_cell_volume
    + 0.3306 * input.red_cell_distribution_width
    + 0.00188 * input.alkaline_phosphatase
    + 0.0554 * input.white_blood_cell_count
    + 0.0804 * input.chronological_age;
  var mortalityTransformation = 1 - Math.exp(
    -Math.exp(linearPredictor)
    * (Math.exp(120 * 0.0076927) - 1)
    / 0.0076927,
  );
  var transformedMortality = -0.00553 * Math.log(1 - mortalityTransformation);
  var phenotypicAgeYears = 141.50225 + Math.log(transformedMortality) / 0.090165;
  return {
    id: input.id,
    naturalLogCrp: naturalLogCrp,
    linearPredictor: linearPredictor,
    mortalityTransformation: mortalityTransformation,
    transformedMortality: transformedMortality,
    phenotypicAgeYears: phenotypicAgeYears,
  };
}

var cases = [
  {
    id: 'complete-adult-reference',
    chronological_age: 40,
    albumin: 44,
    creatinine: 80,
    glucose: 5,
    crp: 0.1,
    lymphocyte_percent: 30,
    mean_cell_volume: 90,
    red_cell_distribution_width: 12.5,
    alkaline_phosphatase: 70,
    white_blood_cell_count: 6,
  },
  {
    id: 'decimal-heavy-reference',
    chronological_age: 67.25,
    albumin: 38.75,
    creatinine: 104.2,
    glucose: 6.35,
    crp: 0.42,
    lymphocyte_percent: 24.8,
    mean_cell_volume: 93.6,
    red_cell_distribution_width: 14.35,
    alkaline_phosphatase: 88.4,
    white_blood_cell_count: 7.25,
  },
];

var serialized = JSON.stringify(cases.map(evaluate));
if (typeof print === 'function') print(serialized);
else globalThis.console.log(serialized);
