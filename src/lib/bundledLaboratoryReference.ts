import type { Biomarker } from '../data/biomarkers';
import {
  generalReferenceRangeFor,
  type GeneralReferenceRangeContext,
} from '../domain/biomarkers/generalReferenceRanges';
import type { SourceLabRange } from '../types/biomarkerKnowledge';
import { formatSourceLabRange } from './biomarkerInterpretation';

export interface LaboratoryReferencePresentation {
  label: 'LABORATORY REFERENCE' | 'Source laboratory reference';
  value: string;
  range?: SourceLabRange;
  kind: 'bundled' | 'source_laboratory' | 'unavailable';
}

/**
 * Display-only common intervals released by the governed registry.
 *
 * These values are never persisted as source-laboratory provenance and never
 * enter Scientific Platform calculations. Every source condition must match,
 * and a result imported from a report always takes precedence.
 */
export function bundledLaboratoryReference(
  biomarker: Pick<Biomarker, 'id'>,
  context?: GeneralReferenceRangeContext,
): SourceLabRange | undefined {
  const range = generalReferenceRangeFor(biomarker.id, context);
  if (!range) return undefined;
  return {
    ...(range.lowerBound === undefined ? {} : { lowerBound: range.lowerBound }),
    ...(range.upperBound === undefined ? {} : { upperBound: range.upperBound }),
    unit: range.unit,
    ...(range.reportedText ? { reportedText: range.reportedText } : {}),
  };
}

export function laboratoryReferencePresentation(
  biomarker: Pick<Biomarker, 'id'>,
  sourceLabRange?: SourceLabRange,
  context?: GeneralReferenceRangeContext,
): LaboratoryReferencePresentation {
  if (sourceLabRange) {
    return {
      label: 'Source laboratory reference',
      value: formatSourceLabRange(sourceLabRange),
      range: sourceLabRange,
      kind: 'source_laboratory',
    };
  }

  const bundled = bundledLaboratoryReference(biomarker, context);
  if (bundled) {
    return {
      label: 'LABORATORY REFERENCE',
      value: formatSourceLabRange(bundled),
      range: bundled,
      kind: 'bundled',
    };
  }

  return {
    label: 'LABORATORY REFERENCE',
    value: 'Laboratory-specific interval',
    kind: 'unavailable',
  };
}
