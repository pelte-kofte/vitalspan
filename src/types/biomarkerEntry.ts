import type { SourceLabRange } from './biomarkerKnowledge';

export interface StoredEntry {
  id: string;
  biomarkerId: string;
  /** Value normalized to the legacy marker definition unit for existing UI. */
  value: number;
  /** Unit associated with value. Optional only for entries created before Phase 0. */
  unit?: string;
  /** Exact value entered or imported before normalization. */
  reportedValue?: number;
  /** Exact unit entered or imported before normalization. */
  reportedUnit?: string;
  date: string;
  source: string;
  notes: string;
  sourceLabRange?: SourceLabRange;
}

export interface NewStoredEntry extends Omit<StoredEntry, 'id'> {
  id?: string;
}

const LEGACY_BIOMARKER_ID_ALIASES: Readonly<Record<string, string>> = {
  trig: 'triglycerides',
  freet4: 'freeT4',
};

export function canonicalBiomarkerId(id: string): string {
  return LEGACY_BIOMARKER_ID_ALIASES[id] ?? id;
}

export function createStoredBiomarkerEntry(input: NewStoredEntry): StoredEntry {
  return {
    ...input,
    biomarkerId: canonicalBiomarkerId(input.biomarkerId),
    id: input.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...(input.sourceLabRange
      ? { sourceLabRange: { ...input.sourceLabRange } }
      : {}),
  };
}
