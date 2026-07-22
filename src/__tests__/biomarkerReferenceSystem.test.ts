import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BIOMARKERS } from '../data/biomarkers';
import {
  biomarkerInterpretationMessage,
  classifyBiomarkerValue,
} from '../lib/biomarkerInterpretation';
import { canonicalBiomarkerId, createStoredBiomarkerEntry } from '../types/biomarkerEntry';

const ROOT = process.cwd();
const source = (path: string): string => readFileSync(join(ROOT, path), 'utf8');

describe('biomarker reference information', () => {
  test('ships one complete deterministic knowledge record for every biomarker', () => {
    expect(BIOMARKERS.length).toBeGreaterThan(0);
    expect(new Set(BIOMARKERS.map(marker => marker.id)).size).toBe(BIOMARKERS.length);
    for (const marker of BIOMARKERS) {
      expect(marker.unit.trim()).not.toBe('');
      expect(marker.target.trim()).not.toBe('');
      expect(marker.description.trim()).not.toBe('');
      expect(marker.howToImprove.trim()).not.toBe('');
      expect(Number.isFinite(marker.optMin)).toBe(true);
      expect(Number.isFinite(marker.optMax)).toBe(true);
      expect(marker.optMin).toBeLessThanOrEqual(marker.optMax);
    }
  });

  test('uses the bundled catalogue without a failed production lookup', () => {
    const service = source('src/lib/biomarkerService.ts');
    expect(service).toContain('return BIOMARKERS');
    expect(service).not.toContain("from('biomarker_definitions')");
    expect(service).not.toContain("from './supabase'");
  });

  test('no-value state is neutral and valid values classify immediately', () => {
    expect(biomarkerInterpretationMessage(undefined)).toBe(
      'Enter a biomarker value to see your interpretation.',
    );
    expect(classifyBiomarkerValue(55, 'mg/dL', {
      lowerBound: 40,
      upperBound: 70,
      unit: 'mg/dL',
    })).toBe('within_reported_range');
    expect(classifyBiomarkerValue(55, 'mg/dL', undefined)).toBe('needs_context');
  });

  test('detail presentation exposes existing content without using legacy targets for classification', () => {
    const detail = source('src/screens/BiomarkerDetailScreen.tsx');
    expect(detail).toContain('title="About"');
    expect(detail).toContain('{biomarker.description}');
    expect(detail).toContain('title="How to improve"');
    expect(detail).toContain('{biomarker.howToImprove}');
    expect(detail).toContain('LABORATORY REFERENCE');
    expect(detail).toContain('RESEARCH TARGET');
    expect(detail).toContain('not used as the laboratory interval or for classification');
  });

  test('normalizes legacy PDF lookup keys to the exact bundled IDs', () => {
    const parser = source('src/lib/labParser.ts');
    expect(parser).toContain("id: 'triglycerides'");
    expect(parser).toContain("id: 'freeT4'");
    expect(canonicalBiomarkerId('trig')).toBe('triglycerides');
    expect(canonicalBiomarkerId('freet4')).toBe('freeT4');
    expect(createStoredBiomarkerEntry({
      id: 'legacy', biomarkerId: 'trig', value: 100, date: '2026-07-22', source: 'PDF', notes: '',
    }).biomarkerId).toBe('triglycerides');
  });
});
