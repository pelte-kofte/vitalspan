import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { BIOMARKERS } from '../data/biomarkers';
import {
  BIOMARKER_CLASSIFICATION_REGISTRY,
  BIOMARKER_CLASSIFICATION_REGISTRY_VERSION,
  biomarkerClassificationStrategyFor,
  classificationBandsForChart,
  resolveBiomarkerClassification,
  type BiomarkerClassificationBand,
  type BiomarkerClassificationConditions,
  type BiomarkerClassificationContext,
} from '../domain/biomarkers/biomarkerClassificationRegistry';
import { compatibleChartClassificationBands } from '../lib/biomarkerChartPresentation';

const ROOT = process.cwd();

function contextFor(
  conditions?: BiomarkerClassificationConditions,
): BiomarkerClassificationContext {
  return {
    ageYears: conditions?.minimumAge ?? 40,
    sex: conditions?.sex ?? 'male',
    fasting: conditions?.fasting ?? true,
    pregnancy: conditions?.pregnancy ?? 'not_pregnant',
    specimen: conditions?.specimen,
    assay: conditions?.assay,
  };
}

function valueInside(band: BiomarkerClassificationBand): number {
  if (band.lowerBound !== undefined && band.upperBound !== undefined) {
    return (band.lowerBound + band.upperBound) / 2;
  }
  if (band.lowerBound !== undefined) return band.lowerBound + 1;
  if (band.upperBound !== undefined) return band.upperBound - 1;
  throw new Error(`Band ${band.id} has no boundary`);
}

describe('versioned biomarker classification registry', () => {
  test('assigns exactly one strategy to every active biomarker', () => {
    const activeIds = BIOMARKERS.map(marker => marker.id).sort();
    const registryIds = BIOMARKER_CLASSIFICATION_REGISTRY.entries
      .map(entry => entry.biomarkerId)
      .sort();

    expect(new Set(activeIds).size).toBe(activeIds.length);
    expect(new Set(registryIds).size).toBe(registryIds.length);
    expect(registryIds).toEqual(activeIds);

    for (const marker of BIOMARKERS) {
      const strategy = biomarkerClassificationStrategyFor(marker.id);
      expect(strategy).toBeDefined();
      expect(strategy).toMatchObject({
        biomarkerId: marker.id,
        registryVersion: BIOMARKER_CLASSIFICATION_REGISTRY_VERSION,
      });
      expect(strategy?.supportedUnits).toContain(marker.unit);
      expect(strategy?.authority.organization.trim()).not.toBe('');
      expect(strategy?.authority.citation.trim()).not.toBe('');
      expect(strategy?.authority.url).toMatch(/^https:\/\//);
      expect(strategy?.populationContext.trim()).not.toBe('');
      expect(strategy?.limitations.length).toBeGreaterThan(0);
    }
  });

  test('classifies every released reference interval below, within, and above its exact boundaries', () => {
    const intervalStrategies = BIOMARKER_CLASSIFICATION_REGISTRY.entries
      .filter(entry => entry.modelType === 'reference_interval');
    expect(intervalStrategies.length).toBeGreaterThan(0);

    for (const strategy of intervalStrategies) {
      for (const interval of strategy.intervals) {
        const context = contextFor(interval.conditions);
        const epsilon = Math.max(
          0.01,
          Math.abs(interval.upperBound - interval.lowerBound) / 100,
        );
        const below = resolveBiomarkerClassification({
          biomarkerId: strategy.biomarkerId,
          value: interval.lowerBound - epsilon,
          unit: interval.unit,
          context,
        });
        const withinAtLower = resolveBiomarkerClassification({
          biomarkerId: strategy.biomarkerId,
          value: interval.lowerBound,
          unit: interval.unit,
          context,
        });
        const withinAtUpper = resolveBiomarkerClassification({
          biomarkerId: strategy.biomarkerId,
          value: interval.upperBound,
          unit: interval.unit,
          context,
        });
        const above = resolveBiomarkerClassification({
          biomarkerId: strategy.biomarkerId,
          value: interval.upperBound + epsilon,
          unit: interval.unit,
          context,
        });

        expect(below?.label).toBe('Below reference interval');
        expect(withinAtLower?.label).toBe('Within reference interval');
        expect(withinAtUpper?.label).toBe('Within reference interval');
        expect(above?.label).toBe('Above reference interval');
      }
    }
  });

  test('resolves every authority-defined decision category at an interior value', () => {
    const decisionStrategies = BIOMARKER_CLASSIFICATION_REGISTRY.entries
      .filter(entry => entry.modelType === 'clinical_decision_categories');
    expect(decisionStrategies.length).toBeGreaterThan(0);

    for (const strategy of decisionStrategies) {
      for (const category of strategy.categories) {
        const result = resolveBiomarkerClassification({
          biomarkerId: strategy.biomarkerId,
          value: valueInside(category),
          unit: category.unit,
          context: contextFor(category.conditions),
        });
        expect(result).toMatchObject({
          modelType: 'clinical_decision_categories',
          selectedBandId: category.id,
          label: category.label,
          optimal: category.optimal,
        });
      }
    }
  });

  test('applies sex conditions and fails closed without required conditional context', () => {
    expect(resolveBiomarkerClassification({
      biomarkerId: 'hdl',
      value: 45,
      unit: 'mg/dL',
      context: { ageYears: 40, sex: 'female' },
    })?.selectedBandId).toBe('hdl-low-female');
    expect(resolveBiomarkerClassification({
      biomarkerId: 'hdl',
      value: 45,
      unit: 'mg/dL',
      context: { ageYears: 40, sex: 'male' },
    })?.selectedBandId).toBe('hdl-middle-male');
    expect(resolveBiomarkerClassification({
      biomarkerId: 'hdl',
      value: 45,
      unit: 'mg/dL',
      context: { ageYears: 40 },
    })).toBeNull();
    expect(resolveBiomarkerClassification({
      biomarkerId: 'ferritin',
      value: 20,
      unit: 'ng/mL',
      context: { ageYears: 40 },
    })).toBeNull();
    expect(resolveBiomarkerClassification({
      biomarkerId: 'ldl',
      value: 90,
      unit: 'mg/dL',
      context: { ageYears: 17 },
    })).toBeNull();
    expect(resolveBiomarkerClassification({
      biomarkerId: 'fastingglucose',
      value: 90,
      unit: 'mg/dL',
      context: { ageYears: 40 },
    })).toBeNull();
  });

  test('supports only the exact standard conversions accepted by manual entry', () => {
    expect(resolveBiomarkerClassification({
      biomarkerId: 'fastingglucose',
      value: 5.5,
      unit: 'mmol/L',
      context: { ageYears: 40, fasting: true },
    })).toMatchObject({
      unit: 'mg/dL',
      selectedBandId: 'glucose-below-prediabetes',
    });
    expect(resolveBiomarkerClassification({
      biomarkerId: 'hba1c',
      value: 42,
      unit: 'mmol/mol',
      context: { ageYears: 40 },
    })).toMatchObject({
      unit: '%',
      selectedBandId: 'hba1c-prediabetes',
    });
    expect(resolveBiomarkerClassification({
      biomarkerId: 'ldl',
      value: 2.4,
      unit: 'mmol/L',
    })).toBeNull();
  });

  test('authorizes optimal only for an explicit authority category', () => {
    const optimalBands = BIOMARKER_CLASSIFICATION_REGISTRY.entries.flatMap(entry =>
      entry.modelType === 'clinical_decision_categories'
        ? entry.categories.filter(category => category.optimal === true)
        : []);
    expect(optimalBands.map(band => band.id)).toEqual(['ldl-optimal']);

    expect(resolveBiomarkerClassification({
      biomarkerId: 'ldl',
      value: 90,
      unit: 'mg/dL',
      context: { ageYears: 40 },
    })?.optimal).toBe(true);
    expect(resolveBiomarkerClassification({
      biomarkerId: 'vitd',
      value: 30,
      unit: 'ng/mL',
      context: { ageYears: 40 },
    })?.optimal).toBeNull();
  });

  test('lets an exact source laboratory interval override the app strategy', () => {
    expect(resolveBiomarkerClassification({
      biomarkerId: 'ldl',
      value: 110,
      unit: 'mg/dL',
      sourceLabRange: {
        lowerBound: 50,
        upperBound: 120,
        unit: 'mg/dL',
        laboratoryName: 'Example Laboratory',
      },
    })).toMatchObject({
      source: 'source_laboratory',
      modelType: 'reference_interval',
      label: 'Within reference interval',
    });
  });

  test('keeps governed, unavailable, unknown, and unsupported-unit inputs fail closed', () => {
    for (const biomarkerId of ['vo2max', 'gripStrength']) {
      expect(biomarkerClassificationStrategyFor(biomarkerId)?.modelType)
        .toBe('governed_domain');
      expect(resolveBiomarkerClassification({
        biomarkerId,
        value: 50,
        unit: biomarkerId === 'vo2max' ? 'mL/kg/min' : 'kg',
        context: { ageYears: 40, sex: 'male' },
      })).toBeNull();
    }
    expect(biomarkerClassificationStrategyFor('nad')?.modelType)
      .toBe('unavailable');
    expect(resolveBiomarkerClassification({
      biomarkerId: 'nad',
      value: 20,
      unit: 'μM (WBC)',
    })).toBeNull();
    expect(resolveBiomarkerClassification({
      biomarkerId: 'not-in-catalog',
      value: 20,
      unit: 'mg/dL',
    })).toBeNull();
    expect(resolveBiomarkerClassification({
      biomarkerId: 'albumin',
      value: 4,
      unit: 'mmol/L',
      context: { ageYears: 40 },
    })).toBeNull();
  });

  test('creates compatible chart bands without converting unsupported units', () => {
    const bands = classificationBandsForChart({
      biomarkerId: 'triglycerides',
      unit: 'mg/dL',
      context: { ageYears: 40 },
    });
    expect(bands.map(band => band.id)).toEqual([
      'triglycerides-normal',
      'triglycerides-borderline',
      'triglycerides-high',
      'triglycerides-very-high',
    ]);
    expect(compatibleChartClassificationBands(bands, 'mg/dL'))
      .toHaveLength(4);
    expect(compatibleChartClassificationBands(bands, 'mmol/L'))
      .toEqual([]);
  });

  test('does not use legacy catalog targets or optMin/optMax', () => {
    const source = readFileSync(
      join(ROOT, 'src/domain/biomarkers/biomarkerClassificationRegistry.ts'),
      'utf8',
    );
    expect(source).not.toMatch(/\.optMin|\.optMax|\.target/);
    expect(source).not.toContain("from '../../data/biomarkers'");
  });

  test('wires the selected strategy into detail and all labeled bands into the chart', () => {
    const detail = readFileSync(
      join(ROOT, 'src/screens/BiomarkerDetailScreen.tsx'),
      'utf8',
    );
    const chart = readFileSync(
      join(ROOT, 'src/components/health/BiomarkerHistoryChart.tsx'),
      'utf8',
    );
    expect(detail).toContain('resolveBiomarkerClassification({');
    expect(detail).toContain('classificationBandsForChart({');
    expect(detail).toContain('CLINICAL DECISION CATEGORY');
    expect(detail).toContain('REFERENCE COMPARISON');
    expect(detail).toContain('classificationBands={chartBands}');
    expect(chart).toContain('compatibleChartClassificationBands(');
    expect(chart).toContain('Current result');
    expect(chart).toContain('accessibilityLabel={`Chart classifications:');
  });
});
