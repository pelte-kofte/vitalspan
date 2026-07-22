import type { Exercise, ExerciseLogEntry } from '../data/exercises';

export const ZONE_2_EXERCISE_ID = 'vitalspan-zone-2-cardio';
export const VO2_INTERVAL_EXERCISE_ID = 'vitalspan-vo2-intervals';

export const ZONE_2_EXERCISE: Exercise = {
  id: ZONE_2_EXERCISE_ID,
  name: 'Zone 2 cardio',
  category: 'Cardio',
  bodyPart: 'cardiovascular',
  equipment: 'your preferred modality',
  muscleGroup: 'cardiovascular system',
  secondaryMuscles: [],
  target: 'steady aerobic work',
  instructions: 'Choose a sustainable steady pace. Use perceived effort unless you have an individually tested intensity range.',
  longevityNote: 'Steady aerobic work supports aerobic capacity and metabolic health over time.',
};

export interface EstimatedZone2Range {
  lowBpm: number;
  highBpm: number;
}

/**
 * Broad UI estimate only: 60–70% of an age-estimated maximum heart rate.
 * It is deliberately kept outside scientific-domain output and always shown
 * with qualification that laboratory testing can establish a different range.
 */
export function estimateZone2HeartRate(age: number | null | undefined): EstimatedZone2Range | null {
  if (!Number.isFinite(age) || age === undefined || age === null || age < 18 || age > 100) return null;
  const estimatedMaximum = 208 - 0.7 * age;
  return {
    lowBpm: Math.round(estimatedMaximum * 0.6),
    highBpm: Math.round(estimatedMaximum * 0.7),
  };
}

function isZone2(log: ExerciseLogEntry): boolean {
  return log.exerciseId === ZONE_2_EXERCISE_ID || /\bzone\s*2\b/i.test(log.exerciseName);
}

function isVo2Work(log: ExerciseLogEntry): boolean {
  return log.exerciseId === VO2_INTERVAL_EXERCISE_ID || /\b(vo2|max intervals?|hiit)\b/i.test(log.exerciseName);
}

export interface LongevityWeekSummary {
  zone2Minutes: number;
  strengthSessions: number;
  vo2Sessions: number;
}

export function summarizeLongevityWeek(
  logs: ExerciseLogEntry[],
  weekStart: string,
  weekEndExclusive: string,
): LongevityWeekSummary {
  const weekly = logs.filter(log => log.date >= weekStart && log.date < weekEndExclusive);
  const strengthDates = new Set(
    weekly.filter(log => log.category !== 'Cardio').map(log => log.date),
  );
  const vo2Dates = new Set(weekly.filter(isVo2Work).map(log => log.date));
  return {
    zone2Minutes: weekly
      .filter(isZone2)
      .reduce((sum, log) => sum + (log.durationMin ?? 0), 0),
    strengthSessions: strengthDates.size,
    vo2Sessions: vo2Dates.size,
  };
}
