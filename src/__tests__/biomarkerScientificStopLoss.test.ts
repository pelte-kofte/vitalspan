import {
  BIOMARKER_STATUS_LABELS,
  classifyBiomarkerValue,
  classifyStoredEntry,
} from '../lib/biomarkerInterpretation';
import { createStoredBiomarkerEntry } from '../types/biomarkerEntry';
import { createLegacyKnowledgeCompatibility } from '../types/biomarkerKnowledge';

describe('neutral biomarker interpretation', () => {
  test('classifies only against a preserved reported laboratory range', () => {
    const sourceLabRange = { lowerBound: 40, upperBound: 70, unit: 'mg/dL', reportedText: '40–70' };
    expect(classifyBiomarkerValue(55, 'mg/dL', sourceLabRange)).toBe('within_reported_range');
    expect(classifyBiomarkerValue(90, 'mg/dL', sourceLabRange)).toBe('outside_reported_range');
  });

  test('mathematical distance never creates a critical classification', () => {
    const status = classifyBiomarkerValue(10000, 'mg/dL', {
      lowerBound: 40,
      upperBound: 70,
      unit: 'mg/dL',
    });
    expect(status).toBe('outside_reported_range');
    expect(BIOMARKER_STATUS_LABELS[status]).toBe('Outside reported laboratory range');
    expect(JSON.stringify({ status })).not.toMatch(/critical/i);
  });

  test('uses neutral states when context or compatible units are unavailable', () => {
    expect(classifyBiomarkerValue(55, 'mg/dL', undefined)).toBe('needs_context');
    expect(classifyBiomarkerValue(55, 'mmol/L', {
      lowerBound: 40,
      upperBound: 70,
      unit: 'mg/dL',
    })).toBe('unable_to_classify');
  });

  test('preserves the original reported value, unit, and laboratory interval', () => {
    const entry = createStoredBiomarkerEntry({
      id: 'entry-1',
      biomarkerId: 'fastingglucose',
      value: 90.09,
      unit: 'mg/dL',
      reportedValue: 5,
      reportedUnit: 'mmol/L',
      date: '2026-01-01T00:00:00.000Z',
      source: 'Hospital',
      notes: '',
      sourceLabRange: { lowerBound: 3.9, upperBound: 5.5, unit: 'mmol/L', reportedText: '3.9–5.5' },
    });
    expect(entry.reportedValue).toBe(5);
    expect(entry.reportedUnit).toBe('mmol/L');
    expect(entry.sourceLabRange).toEqual({
      lowerBound: 3.9,
      upperBound: 5.5,
      unit: 'mmol/L',
      reportedText: '3.9–5.5',
    });
    expect(classifyStoredEntry(entry)).toBe('within_reported_range');
  });

  test('legacy knowledge fallback is explicitly unreviewed and has no targets or rules', () => {
    const legacy = createLegacyKnowledgeCompatibility();
    expect(legacy.reviewStatus).toBe('legacy_unreviewed');
    expect(legacy.evidenceGrade).toBe('not_reviewed');
    expect(legacy.clinicalDecisionRules).toEqual([]);
    expect(legacy.riskAssociationBands).toEqual([]);
    expect(legacy.treatmentTargets).toEqual([]);
    expect(JSON.stringify(legacy)).not.toMatch(/optimal/i);
  });
});
