import { supabase } from './supabase';
import { BIOMARKERS, type Biomarker } from '../data/biomarkers';

interface BiomarkerDefinitionRow {
  id: string;
  name: string;
  unit: string | null;
  opt_min: number | null;
  opt_max: number | null;
  category: string | null;
  target: string | null;
  description: string | null;
}

/**
 * Fetches biomarker definitions from Supabase and merges them into the static
 * BIOMARKERS array.
 *
 * Merge strategy: for each static Biomarker, if a matching row exists in the
 * Supabase result (matched by id), override the server-side fields:
 *   name, unit, optMin (from opt_min), optMax (from opt_max), category,
 *   target, description.
 *
 * UI-only fields (color, howToImprove, defaultVal, prevVal, insight, history,
 * categoryLabel) are always taken from the static array — they are not stored
 * in Supabase.
 *
 * Falls back to BIOMARKERS unchanged if Supabase is unreachable, returns no
 * rows, or throws.
 */
export async function getBiomarkers(): Promise<Biomarker[]> {
  try {
    const { data, error } = await supabase
      .from('biomarker_definitions')
      .select('id, name, unit, opt_min, opt_max, category, target, description');

    if (error) {
      console.warn('[biomarkerService] Supabase fetch failed, using static fallback:', error.message);
      return BIOMARKERS;
    }

    if (!data || data.length === 0) {
      console.warn('[biomarkerService] Supabase returned empty data, using static fallback');
      return BIOMARKERS;
    }

    const rowMap = new Map<string, BiomarkerDefinitionRow>(
      (data as BiomarkerDefinitionRow[]).map((row) => [row.id, row])
    );

    return BIOMARKERS.map((staticBiomarker): Biomarker => {
      const row = rowMap.get(staticBiomarker.id);
      if (!row) {
        return staticBiomarker;
      }

      return {
        // Preserve typed knowledge-system fields and all UI-only legacy fields.
        ...staticBiomarker,
        // Server-side fields — override from Supabase row
        id: staticBiomarker.id,
        name: row.name,
        unit: row.unit ?? staticBiomarker.unit,
        optMin: row.opt_min ?? staticBiomarker.optMin,
        optMax: row.opt_max ?? staticBiomarker.optMax,
        category: (row.category ?? staticBiomarker.category) as Biomarker['category'],
        target: row.target ?? staticBiomarker.target,
        description: row.description ?? staticBiomarker.description,
      };
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[biomarkerService] Unexpected error, using static fallback:', message);
    return BIOMARKERS;
  }
}
