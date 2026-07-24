import type {
  TodayAction,
  TodayDailyHealthBrief,
  TodayPresentation,
  TodayPriority,
  TodayPriorityExplanation,
  TodayProgress,
  TodayQuickAction,
  TodayQuickActions,
} from '../types/today';
import type { TodayDataSnapshot } from '../types/todayData';

interface SavedPlanItem {
  readonly id: string;
  readonly title: string;
  readonly completionIds: readonly string[];
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function planDoseCount(dose: string): number {
  const match = dose.match(/(\d+)x\s*daily/i);
  return match
    ? Math.min(Math.max(Number.parseInt(match[1], 10), 1), 6)
    : 1;
}

function planDoseId(name: string, index: number): string {
  return `${name}_dose_${index}`;
}

function formatLocalDay(localDay: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDay);
  if (!match) return localDay;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return localDay;
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${WEEKDAY_NAMES[weekday]}, ${MONTH_NAMES[month - 1]} ${day}`;
}

function savedPlanItems(snapshot: TodayDataSnapshot): readonly SavedPlanItem[] {
  const hiddenMedications = new Set(snapshot.protocol.hiddenMeds);
  const medications = (snapshot.profile?.medications ?? [])
    .filter(name => !hiddenMedications.has(name))
    .map(name => ({ id: name, title: name, completionIds: [name] }));
  const supplements = snapshot.protocol.supplements.flatMap(item => {
    const doseCount = planDoseCount(item.personalDose ?? item.dose);
    if (doseCount === 1) {
      return [{
        id: item.id,
        title: item.name,
        completionIds: [item.id, planDoseId(item.name, 0)],
      }];
    }
    return Array.from({ length: doseCount }, (_, index) => {
      const id = planDoseId(item.name, index);
      return {
        id,
        title: `${item.name} · dose ${index + 1}`,
        completionIds: [id],
      };
    });
  });
  return [...medications, ...supplements];
}

function completedPlanIds(snapshot: TodayDataSnapshot): ReadonlySet<string> {
  return snapshot.protocol.takenDate === snapshot.localDay
    ? new Set(snapshot.protocol.taken)
    : new Set();
}

function priorityExplanation(
  observedFact: string,
  interpretation: string,
  suggestedAction: string,
  limitations: readonly string[],
): TodayPriorityExplanation {
  return {
    observedFact,
    interpretation,
    suggestedAction,
    limitations,
  };
}

function buildProgress(snapshot: TodayDataSnapshot): TodayProgress {
  const items = savedPlanItems(snapshot);
  const completedIds = completedPlanIds(snapshot);
  const isCompleted = (item: SavedPlanItem): boolean =>
    item.completionIds.some(id => completedIds.has(id));
  const completedCount = items.filter(isCompleted).length;
  const nextItem = items.find(item => !isCompleted(item)) ?? null;

  if (items.length === 0) {
    return {
      summary: 'No daily plan is configured.',
      completedCount: 0,
      totalCount: 0,
      nextItem: null,
      openPlanAction: { kind: 'open_plan' },
    };
  }

  const summary = completedCount === items.length
    ? 'All saved plan items are marked complete today.'
    : `${completedCount} of ${items.length} saved plan items are marked complete today.`;
  return {
    summary,
    completedCount,
    totalCount: items.length,
    nextItem: nextItem
      ? {
          id: nextItem.id,
          title: nextItem.title,
          completed: false,
          completionAction: {
            kind: 'set_plan_item_completion',
            itemId: nextItem.id,
            completed: true,
          },
        }
      : null,
    openPlanAction: { kind: 'open_plan' },
  };
}

function buildPrimaryFocus(
  snapshot: TodayDataSnapshot,
  progress: TodayProgress,
): TodayPriority {
  if (!snapshot.profile) {
    return {
      id: 'profile-context-missing',
      kind: 'profile_setup',
      title: 'Complete your health profile',
      reason: 'Profile context is unavailable in Vitalspan.',
      actionLabel: 'Complete profile',
      action: { kind: 'complete_profile' },
      explanation: priorityExplanation(
        'A complete profile is not available.',
        'Vitalspan has less context for organizing the information shown today.',
        'Complete the profile when ready.',
        ['Missing profile information is not interpreted as a health problem.'],
      ),
      canDefer: true,
    };
  }

  if (snapshot.biomarkerEntries.length === 0) {
    return {
      id: 'laboratory-history-empty',
      kind: 'data_completion',
      title: 'Add your laboratory results',
      reason: 'No laboratory results are available in Vitalspan.',
      actionLabel: 'Add result',
      action: { kind: 'add_result' },
      explanation: priorityExplanation(
        'Laboratory history is empty.',
        'Blood-based interpretation is unavailable without laboratory information.',
        'Add a result when it is available.',
        ['No value or health status is inferred from missing laboratory data.'],
      ),
      canDefer: true,
    };
  }

  if (progress.nextItem) {
    return {
      id: `saved-plan-item:${progress.nextItem.id}`,
      kind: 'plan_action',
      title: 'Review today’s saved plan',
      reason: 'A saved plan item is not marked complete today.',
      actionLabel: 'Open plan',
      action: { kind: 'open_plan', itemId: progress.nextItem.id },
      explanation: priorityExplanation(
        'At least one saved plan item is not marked complete today.',
        'This is a completion state for the existing plan, not a health outcome.',
        'Open the plan to review the saved item.',
        ['Vitalspan does not reassess treatment appropriateness in Today.'],
      ),
      canDefer: true,
    };
  }

  return {
    id: 'no-supported-focus',
    kind: 'no_action',
    title: 'No action identified from current app data',
    reason: 'No incomplete setup or saved plan item is identified in the available snapshot.',
    actionLabel: 'Review health data',
    action: { kind: 'open_health' },
    explanation: priorityExplanation(
      'The available snapshot contains no incomplete setup or saved plan item.',
      'This is limited to information currently available in Vitalspan.',
      'Review Health for source data and limitations if useful.',
      ['This does not mean that no health action is needed outside Vitalspan.'],
    ),
    canDefer: false,
  };
}

function buildBrief(snapshot: TodayDataSnapshot): TodayDailyHealthBrief {
  const currentPicture = !snapshot.profile
    ? 'Profile context is unavailable, so today’s health picture is limited.'
    : snapshot.biomarkerEntries.length === 0
      ? 'Laboratory information is unavailable, so blood-based interpretation is unavailable.'
      : 'Laboratory information is available without a new health conclusion being generated here.';
  const direction = snapshot.healthData
    ? 'Connected-health information is available, but the snapshot contains no authorized trend conclusion.'
    : 'Connected-health information is unavailable, and no sleep, recovery, activity, or direction conclusion is inferred.';
  return {
    sentences: [currentPicture, direction],
    explanationAction: { kind: 'explain_brief' },
  };
}

function actionKey(action: TodayAction): string {
  switch (action.kind) {
    case 'open_biomarker':
    case 'enter_biomarker':
      return `${action.kind}:${action.biomarkerId ?? ''}`;
    case 'open_plan':
      return `${action.kind}:${action.itemId ?? ''}`;
    case 'set_plan_item_completion':
      return `${action.kind}:${action.itemId}:${String(action.completed)}`;
    case 'open_learning':
      return `${action.kind}:${action.contentId ?? ''}`;
    default:
      return action.kind;
  }
}

function buildQuickActions(
  snapshot: TodayDataSnapshot,
  primary: TodayPriority,
): TodayQuickActions {
  if (primary.kind === 'profile_setup' || primary.kind === 'data_completion') {
    return [];
  }

  const candidates: TodayQuickAction[] = [];
  if (!snapshot.healthData) {
    candidates.push({
      id: 'connect-health-data',
      label: 'Connect health data',
      action: { kind: 'connect_health_data' },
    });
  }
  if (!snapshot.exerciseLogs.some(log => log.date === snapshot.localDay)) {
    candidates.push({
      id: 'log-movement',
      label: 'Log movement',
      action: { kind: 'log_movement' },
    });
  }

  const primaryActionKey = primary.action ? actionKey(primary.action) : null;
  const actions = candidates.filter(
    candidate => actionKey(candidate.action) !== primaryActionKey,
  );
  if (actions.length === 2) return [actions[0], actions[1]];
  if (actions.length === 1) return [actions[0]];
  return [];
}

export function presentTodayHeader(
  snapshot: TodayDataSnapshot,
): TodayPresentation['header'] {
  return {
    greeting: snapshot.profile?.name.trim()
      ? `Hello, ${snapshot.profile.name.trim()}`
      : 'Hello',
    dateLabel: formatLocalDay(snapshot.localDay),
  };
}

export function presentTodayBrief(
  snapshot: TodayDataSnapshot,
): TodayPresentation['brief'] {
  return buildBrief(snapshot);
}

export function presentTodayProgress(
  snapshot: TodayDataSnapshot,
): TodayPresentation['progress'] {
  return buildProgress(snapshot);
}

export function presentTodayPriorities(
  snapshot: TodayDataSnapshot,
  progress: TodayProgress,
): TodayPresentation['priorities'] {
  return {
    primary: buildPrimaryFocus(snapshot, progress),
    secondary: [],
  };
}

export function presentTodayQuickActions(
  snapshot: TodayDataSnapshot,
  primary: TodayPriority,
): TodayPresentation['quickActions'] {
  return buildQuickActions(snapshot, primary);
}

export function presentToday(snapshot: TodayDataSnapshot): TodayPresentation {
  const progress = presentTodayProgress(snapshot);
  const priorities = presentTodayPriorities(snapshot, progress);
  return {
    header: presentTodayHeader(snapshot),
    safetyNotice: null,
    brief: presentTodayBrief(snapshot),
    priorities,
    keyInsight: null,
    progress,
    quickActions: presentTodayQuickActions(snapshot, priorities.primary),
  };
}
