import type { StoredEntry } from '../types/biomarkerEntry';
import type { SourceLabRange } from '../types/biomarkerKnowledge';

export type NeutralBiomarkerStatus =
  | 'within_reported_range'
  | 'outside_reported_range'
  | 'needs_context'
  | 'unable_to_classify';

export const BIOMARKER_STATUS_LABELS: Record<NeutralBiomarkerStatus, string> = {
  within_reported_range: 'Within reported laboratory range',
  outside_reported_range: 'Outside reported laboratory range',
  needs_context: 'Needs context',
  unable_to_classify: 'Unable to classify',
};

function canonicalizeUnit(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .replace(/μ/g, 'u')
    .replace(/µ/g, 'u')
    .replace(/³/g, '^3')
    .replace(/\s+/g, '');
}

export function classifyBiomarkerValue(
  value: number,
  valueUnit: string | undefined,
  sourceLabRange: SourceLabRange | undefined,
): NeutralBiomarkerStatus {
  if (!Number.isFinite(value)) return 'unable_to_classify';
  if (!sourceLabRange) return 'needs_context';
  if (!valueUnit || canonicalizeUnit(valueUnit) !== canonicalizeUnit(sourceLabRange.unit)) {
    return 'unable_to_classify';
  }

  const { lowerBound, upperBound } = sourceLabRange;
  if (
    (lowerBound !== undefined && !Number.isFinite(lowerBound)) ||
    (upperBound !== undefined && !Number.isFinite(upperBound)) ||
    (lowerBound === undefined && upperBound === undefined) ||
    (lowerBound !== undefined && upperBound !== undefined && lowerBound > upperBound)
  ) {
    return 'unable_to_classify';
  }

  if (lowerBound !== undefined && value < lowerBound) return 'outside_reported_range';
  if (upperBound !== undefined && value > upperBound) return 'outside_reported_range';
  return 'within_reported_range';
}

export function classifyStoredEntry(entry: StoredEntry): NeutralBiomarkerStatus {
  const value = entry.reportedValue ?? entry.value;
  const unit = entry.reportedUnit ?? entry.unit;
  return classifyBiomarkerValue(value, unit, entry.sourceLabRange);
}

export function biomarkerInterpretationMessage(entry: StoredEntry | undefined): string {
  if (!entry) return 'Enter a biomarker value to see your interpretation.';

  const status = classifyStoredEntry(entry);
  if (status === 'needs_context') {
    return 'Add the reference interval from your laboratory report to compare this value.';
  }
  if (status === 'unable_to_classify') {
    return 'The reported value and laboratory interval need compatible units before comparison.';
  }
  return BIOMARKER_STATUS_LABELS[status];
}

export function formatSourceLabRange(range: SourceLabRange | undefined): string {
  if (!range) return 'Not provided';
  if (range.reportedText) return `${range.reportedText} ${range.unit}`.trim();
  if (range.lowerBound !== undefined && range.upperBound !== undefined) {
    return `${range.lowerBound}–${range.upperBound} ${range.unit}`;
  }
  if (range.lowerBound !== undefined) return `≥${range.lowerBound} ${range.unit}`;
  if (range.upperBound !== undefined) return `≤${range.upperBound} ${range.unit}`;
  return 'Not provided';
}
