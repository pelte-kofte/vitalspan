import { BIOMARKERS, type Biomarker } from '../data/biomarkers';

/**
 * Returns the bundled biomarker knowledge catalogue.
 *
 * `src/db/seed_biomarker_definitions.sql` was an optional manual bootstrap and
 * was never part of the governed migration chain. Depending on that table made
 * development and production differ and caused a failed Supabase request on
 * every screen load in production. The complete client contract (including
 * About and How to improve copy) already lives in BIOMARKERS, so it is the
 * single deterministic source for this legacy, explicitly unreviewed content.
 */
export async function getBiomarkers(): Promise<Biomarker[]> {
  return BIOMARKERS;
}
