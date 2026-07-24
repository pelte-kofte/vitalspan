import {
  presentTodayBrief,
  presentTodayHeader,
  presentTodayPriorities,
  presentTodayProgress,
  presentTodayQuickActions,
} from './todayPresenter';
import type { TodayPresentation } from '../types/today';
import type { TodayDataSnapshot } from '../types/todayData';

export interface TodaySnapshotDiff {
  readonly profile: boolean;
  readonly biomarkers: boolean;
  readonly protocol: boolean;
  readonly healthConnection: boolean;
  readonly exercise: boolean;
  readonly localDay: boolean;
  readonly changed: boolean;
}

export interface TodayPresentationFrame {
  readonly snapshot: TodayDataSnapshot;
  readonly presentation: TodayPresentation;
}

function governedValueEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;
    return left.every((value, index) =>
      governedValueEqual(value, right[index]));
  }
  if (
    left === null
    || right === null
    || typeof left !== 'object'
    || typeof right !== 'object'
  ) {
    return false;
  }

  const leftRecord = left as Readonly<Record<string, unknown>>;
  const rightRecord = right as Readonly<Record<string, unknown>>;
  const leftKeys = Object.keys(leftRecord).sort();
  const rightKeys = Object.keys(rightRecord).sort();
  if (!governedValueEqual(leftKeys, rightKeys)) return false;
  return leftKeys.every(key =>
    governedValueEqual(leftRecord[key], rightRecord[key]));
}

export function diffTodaySnapshots(
  previous: TodayDataSnapshot,
  next: TodayDataSnapshot,
): TodaySnapshotDiff {
  const profile = !governedValueEqual(previous.profile, next.profile);
  const biomarkers = !governedValueEqual(
    previous.biomarkerEntries,
    next.biomarkerEntries,
  );
  const protocol = !governedValueEqual(previous.protocol, next.protocol);
  const healthConnection = (previous.healthData === null)
    !== (next.healthData === null);
  const exercise = !governedValueEqual(
    previous.exerciseLogs,
    next.exerciseLogs,
  );
  const localDay = previous.localDay !== next.localDay;

  return {
    profile,
    biomarkers,
    protocol,
    healthConnection,
    exercise,
    localDay,
    changed:
      profile
      || biomarkers
      || protocol
      || healthConnection
      || exercise
      || localDay,
  };
}

export function refreshTodayPresentation(
  previous: TodayPresentationFrame,
  nextSnapshot: TodayDataSnapshot,
): TodayPresentationFrame {
  const diff = diffTodaySnapshots(previous.snapshot, nextSnapshot);
  if (!diff.changed) {
    return {
      snapshot: nextSnapshot,
      presentation: previous.presentation,
    };
  }

  const refreshHeader = diff.profile || diff.localDay;
  const refreshBrief =
    diff.profile || diff.biomarkers || diff.healthConnection;
  const refreshProgress = diff.profile || diff.protocol || diff.localDay;
  const refreshPriorities =
    diff.profile || diff.biomarkers || diff.protocol || diff.localDay;
  const refreshQuickActions =
    diff.profile
    || diff.biomarkers
    || diff.protocol
    || diff.healthConnection
    || diff.exercise
    || diff.localDay;

  const progress = refreshProgress
    ? presentTodayProgress(nextSnapshot)
    : previous.presentation.progress;
  const priorities = refreshPriorities
    ? presentTodayPriorities(nextSnapshot, progress)
    : previous.presentation.priorities;

  const presentation: TodayPresentation = {
    header: refreshHeader
      ? presentTodayHeader(nextSnapshot)
      : previous.presentation.header,
    safetyNotice: previous.presentation.safetyNotice,
    brief: refreshBrief
      ? presentTodayBrief(nextSnapshot)
      : previous.presentation.brief,
    priorities,
    keyInsight: previous.presentation.keyInsight,
    progress,
    quickActions: refreshQuickActions
      ? presentTodayQuickActions(nextSnapshot, priorities.primary)
      : previous.presentation.quickActions,
  };

  return { snapshot: nextSnapshot, presentation };
}
