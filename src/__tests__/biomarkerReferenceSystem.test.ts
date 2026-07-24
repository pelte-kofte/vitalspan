import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BIOMARKERS } from '../data/biomarkers';
import {
  biomarkerInterpretationMessage,
  classifyBiomarkerValue,
} from '../lib/biomarkerInterpretation';
import {
  bundledLaboratoryReference,
  laboratoryReferencePresentation,
} from '../lib/bundledLaboratoryReference';
import {
  generalReferenceRangeFor,
  generalReferenceReviewFor,
  type GeneralReferenceRangeContext,
} from '../domain/biomarkers/generalReferenceRanges';
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

  test('active entry and detail surfaces exclude legacy biomarker knowledge', () => {
    const detail = source('src/screens/BiomarkerDetailScreen.tsx');
    const entry = source('src/screens/BiomarkerEntryScreen.tsx');
    const activeExperience = `${detail}\n${entry}`;
    expect(detail).toContain('Reference interval from this laboratory report');
    expect(detail).toContain('CLINICAL DECISION CATEGORY');
    expect(detail).toContain('REFERENCE COMPARISON');
    expect(detail).toContain('Historical chart');
    expect(detail).toContain('Measurement history');
    expect(entry).toContain('Measurement date');
    expect(entry).toContain('Result value');
    expect(activeExperience).not.toMatch(
      /\.optMin|\.optMax|\.target|\.howToImprove|\.insight/,
    );
    expect(activeExperience).not.toMatch(
      /longevity research target|how to improve|supplement|dosage/i,
    );
  });

  test('uses a fully matched governed general interval and lets source reports override it', () => {
    const alt = BIOMARKERS.find(marker => marker.id === 'alt')!;
    const context: GeneralReferenceRangeContext = {
      unit: 'U/L',
      ageYears: 40,
      sex: 'male',
      pregnancyContext: 'not_applicable',
      specimen: 'serum',
      assayTraceability: 'ifcc_reference_measurement_procedure_at_37_c',
      fastingHours: 10.5,
      populationGroup: 'international_multicenter_adults',
    };
    expect(bundledLaboratoryReference(alt, context)).toEqual({
      lowerBound: 9,
      upperBound: 59,
      unit: 'U/L',
      reportedText: '9–59',
    });
    expect(
      laboratoryReferencePresentation(alt, undefined, context).value,
    ).toBe('9–59 U/L');
    expect(generalReferenceRangeFor(alt.id, context)).toMatchObject({
      reviewStatus: 'reviewed',
      approvedUse: 'general_reference_display',
      lowerBound: 9,
      upperBound: 59,
      unit: 'U/L',
    });

    const sourceRange = {
      lowerBound: 5,
      upperBound: 40,
      unit: 'U/L',
      laboratoryName: 'Example Lab',
    };
    expect(
      laboratoryReferencePresentation(alt, sourceRange, context),
    ).toMatchObject({
      label: 'Source laboratory reference',
      value: '5–40 U/L',
      kind: 'source_laboratory',
    });
  });

  test('fails closed for decision thresholds and the unproven legacy TSH range', () => {
    const apoB = BIOMARKERS.find(marker => marker.id === 'apob')!;
    const presentation = laboratoryReferencePresentation(apoB);
    expect(presentation).toEqual({
      label: 'LABORATORY REFERENCE',
      value: 'Laboratory-specific interval',
      kind: 'unavailable',
    });
    expect(presentation.value).not.toBe(apoB.target);

    const tsh = BIOMARKERS.find(marker => marker.id === 'tsh')!;
    expect(bundledLaboratoryReference(tsh)).toBeUndefined();
    expect(generalReferenceReviewFor(tsh.id)).toMatchObject({
      status: 'unavailable',
      reason: 'no_single_defensible_general_interval',
    });
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
