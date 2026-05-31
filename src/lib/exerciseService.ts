import { supabase } from './supabase';
import { EXERCISES, type Exercise } from '../data/exercises';

interface ExerciseRow {
  id: string;
  name: string;
  category: string;
  body_part: string | null;
  equipment: string | null;
  muscle_group: string | null;
  secondary_muscles: string[] | null;
  target: string | null;
  instructions: string | null;
}

function mapRowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Exercise['category'],
    bodyPart: row.body_part ?? '',
    equipment: row.equipment ?? '',
    muscleGroup: row.muscle_group ?? '',
    secondaryMuscles: row.secondary_muscles ?? [],
    target: row.target ?? '',
    instructions: row.instructions ?? '',
  };
}

/**
 * Fetches the exercise library from Supabase with a static fallback.
 *
 * Returns the full exercises table from Supabase, mapping snake_case columns
 * to camelCase Exercise fields. Falls back to the static EXERCISES array if
 * Supabase is unreachable, returns no rows, or throws.
 */
export async function getExercises(): Promise<Exercise[]> {
  try {
    const { data, error } = await supabase.from('exercises').select('*');

    if (error) {
      console.warn('[exerciseService] Supabase fetch failed, using static fallback:', error.message);
      return EXERCISES;
    }

    if (!data || data.length === 0) {
      console.warn('[exerciseService] Supabase returned empty data, using static fallback');
      return EXERCISES;
    }

    return (data as ExerciseRow[]).map(mapRowToExercise);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[exerciseService] Unexpected error, using static fallback:', message);
    return EXERCISES;
  }
}
