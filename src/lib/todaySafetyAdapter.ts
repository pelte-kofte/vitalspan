import type { TodaySafetyNotice } from '../types/today';
import type { TodaySafetyAlert } from './todayExperience';

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Maps an existing resolved Today safety alert into the new presentation
 * contract. Safety selection, medical meaning, and ordering remain upstream.
 */
export function adaptTodaySafety(
  alert: TodaySafetyAlert | null,
): TodaySafetyNotice | null {
  if (
    !alert
    || !hasText(alert.id)
    || !hasText(alert.title)
    || !hasText(alert.body)
    || !hasText(alert.sourceLabel)
    || alert.action?.destination !== 'InteractionChecker'
  ) {
    return null;
  }

  return {
    id: alert.id,
    title: alert.title,
    summary: alert.body,
    actionLabel: 'Review interaction',
    action: { kind: 'review_interactions' },
  };
}
