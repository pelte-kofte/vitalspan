import fs from 'node:fs';
import path from 'node:path';

import type {
  TodayPresentation,
  TodayPresentationState,
  TodayPriority,
  TodayQuickActions,
  TodaySecondaryPriorities,
} from '../types/today';

const primaryFocus = {
  id: 'complete-labs',
  kind: 'data_completion',
  title: 'Add your remaining laboratory results',
  reason: 'More information is needed before Blood phenotypic age is available.',
  actionLabel: 'Add result',
  action: { kind: 'add_result' },
  explanation: {
    observedFact: 'Some required laboratory measurements are unavailable.',
    interpretation: 'Blood phenotypic age cannot be calculated from a partial input set.',
    suggestedAction: 'Add a result when it is available.',
    limitations: ['Missing information is not interpreted as a health problem.'],
  },
  canDefer: true,
} as const satisfies TodayPriority;

const secondaryFocus = {
  id: 'open-plan',
  kind: 'plan_action',
  title: 'Review today’s plan',
  reason: 'One saved plan item remains incomplete.',
  timingOrEffort: 'About 1 minute',
  actionLabel: 'Open plan',
  action: { kind: 'open_plan', itemId: 'plan-item-1' },
  explanation: {
    observedFact: 'One item in the saved plan is incomplete.',
    interpretation: 'This reflects plan completion, not a health outcome.',
    suggestedAction: 'Open the plan when ready.',
    limitations: [],
  },
  canDefer: true,
} as const satisfies TodayPriority;

const readyPresentation = {
  header: {
    greeting: 'Good morning, Alex',
    dateLabel: 'Friday, July 24',
  },
  safetyNotice: null,
  brief: {
    sentences: [
      'Your current information supports a limited health picture.',
      'More history is needed before direction can be described.',
    ],
    explanationAction: { kind: 'explain_brief' },
  },
  priorities: {
    primary: primaryFocus,
    secondary: [secondaryFocus],
  },
  keyInsight: null,
  progress: {
    summary: 'One of two plan items is complete.',
    completedCount: 1,
    totalCount: 2,
    nextItem: {
      id: 'plan-item-1',
      title: 'Saved plan item',
      completed: false,
      completionAction: {
        kind: 'set_plan_item_completion',
        itemId: 'plan-item-1',
        completed: true,
      },
    },
    openPlanAction: { kind: 'open_plan' },
  },
  quickActions: [
    { id: 'import-pdf', label: 'Import laboratory PDF', action: { kind: 'import_laboratory_pdf' } },
    { id: 'log-movement', label: 'Log movement', action: { kind: 'log_movement' } },
  ],
} as const satisfies TodayPresentation;

describe('Today presentation contract', () => {
  test('requires exactly one primary focus and permits no more than two secondary priorities', () => {
    expect(readyPresentation.priorities.primary).toBe(primaryFocus);
    expect(readyPresentation.priorities.secondary).toEqual([secondaryFocus]);

    const noSecondary = [] as const satisfies TodaySecondaryPriorities;
    const twoSecondary = [primaryFocus, secondaryFocus] as const satisfies TodaySecondaryPriorities;

    expect(noSecondary).toHaveLength(0);
    expect(twoSecondary).toHaveLength(2);
  });

  test('represents Key Insight and Quick Actions as optional content rather than filler', () => {
    expect(readyPresentation.keyInsight).toBeNull();
    expect(readyPresentation.quickActions).toHaveLength(2);

    const noQuickActions = [] as const satisfies TodayQuickActions;
    expect(noQuickActions).toEqual([]);
  });

  test('keeps useful content visible while a refresh is in progress', () => {
    const states = [
      { status: 'loading' },
      { status: 'ready', content: readyPresentation },
      { status: 'refreshing', content: readyPresentation },
    ] as const satisfies readonly TodayPresentationState[];

    expect(states[0]).toEqual({ status: 'loading' });
    expect(states[1].content).toBe(readyPresentation);
    expect(states[2].content).toBe(readyPresentation);
  });

  test('is an erased-at-runtime presentation boundary with no implementation dependencies', () => {
    const contractPath = path.join(process.cwd(), 'src/types/today.ts');
    const source = fs.readFileSync(contractPath, 'utf8');

    expect(source).not.toMatch(/^import /m);
    expect(source).not.toMatch(/\bAsyncStorage\b|\bSupabase\b|\bAIAdvisor\b|\bAnthropic\b/);
    expect(source).not.toMatch(/^export (?:async )?(?:const|function|class) /m);
  });
});
