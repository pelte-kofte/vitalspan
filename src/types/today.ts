/**
 * Presentation-only contract for the Vitalspan Today experience.
 *
 * This module describes resolved product content. It has no authority to
 * calculate, classify, rank, persist, navigate, or generate health information.
 */

export type TodayAction =
  | { readonly kind: 'open_biomarker'; readonly biomarkerId: string }
  | { readonly kind: 'enter_biomarker'; readonly biomarkerId?: string }
  | { readonly kind: 'add_result' }
  | { readonly kind: 'import_laboratory_pdf' }
  | { readonly kind: 'open_health' }
  | { readonly kind: 'open_plan'; readonly itemId?: string }
  | {
      readonly kind: 'set_plan_item_completion';
      readonly itemId: string;
      readonly completed: boolean;
    }
  | { readonly kind: 'log_movement' }
  | { readonly kind: 'connect_health_data' }
  | { readonly kind: 'complete_profile' }
  | { readonly kind: 'review_interactions' }
  | { readonly kind: 'open_learning'; readonly contentId?: string }
  | { readonly kind: 'explain_brief' };

export interface TodayHeader {
  readonly greeting: string;
  readonly dateLabel: string;
}

export interface TodaySafetyNotice {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly uncertainty?: string;
  readonly professionalCareGuidance?: string;
  readonly actionLabel: string;
  readonly action: TodayAction;
}

export type TodayBriefSentences =
  | readonly [string, string]
  | readonly [string, string, string]
  | readonly [string, string, string, string];

export interface TodayDailyHealthBrief {
  readonly sentences: TodayBriefSentences;
  readonly lastUpdatedLabel?: string;
  readonly explanationAction?: Extract<TodayAction, { readonly kind: 'explain_brief' }>;
}

export interface TodayPriorityExplanation {
  readonly observedFact: string;
  readonly interpretation: string;
  readonly suggestedAction: string;
  readonly sourceLabel?: string;
  readonly freshnessLabel?: string;
  readonly limitations: readonly string[];
}

export type TodayActionablePriorityKind =
  | 'health_review'
  | 'data_completion'
  | 'plan_action'
  | 'profile_setup'
  | 'connected_health'
  | 'movement'
  | 'learning';

export interface TodayActionablePriority {
  readonly id: string;
  readonly kind: TodayActionablePriorityKind;
  readonly title: string;
  readonly reason: string;
  readonly timingOrEffort?: string;
  readonly actionLabel: string;
  readonly action: TodayAction;
  readonly explanation: TodayPriorityExplanation;
  readonly canDefer: boolean;
}

export interface TodayNoActionPriority {
  readonly id: string;
  readonly kind: 'no_action';
  readonly title: string;
  readonly reason: string;
  readonly actionLabel?: string;
  readonly action?: TodayAction;
  readonly explanation: TodayPriorityExplanation;
  readonly canDefer: false;
}

export type TodayPriority = TodayActionablePriority | TodayNoActionPriority;

export type TodaySecondaryPriorities =
  | readonly []
  | readonly [TodayPriority]
  | readonly [TodayPriority, TodayPriority];

export interface TodayTopPriorities {
  readonly primary: TodayPriority;
  readonly secondary: TodaySecondaryPriorities;
}

export type TodayInsightAction = Extract<
  TodayAction,
  | { readonly kind: 'open_biomarker' }
  | { readonly kind: 'open_health' }
  | { readonly kind: 'open_learning' }
>;

export interface TodayKeyInsight {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly whyItMatters: string;
  readonly actionLabel?: string;
  readonly action?: TodayInsightAction;
}

export interface TodayProgressItem {
  readonly id: string;
  readonly title: string;
  readonly timingLabel?: string;
  readonly completed: boolean;
  readonly completionAction?: Extract<
    TodayAction,
    { readonly kind: 'set_plan_item_completion' }
  >;
}

export interface TodayProgress {
  readonly summary: string;
  readonly completedCount: number;
  readonly totalCount: number;
  readonly nextItem: TodayProgressItem | null;
  readonly openPlanAction?: Extract<TodayAction, { readonly kind: 'open_plan' }>;
}

export interface TodayQuickAction {
  readonly id: string;
  readonly label: string;
  readonly action: TodayAction;
}

export type TodayQuickActions =
  | readonly []
  | readonly [TodayQuickAction]
  | readonly [TodayQuickAction, TodayQuickAction]
  | readonly [TodayQuickAction, TodayQuickAction, TodayQuickAction]
  | readonly [TodayQuickAction, TodayQuickAction, TodayQuickAction, TodayQuickAction];

export interface TodayPresentation {
  readonly header: TodayHeader;
  readonly safetyNotice: TodaySafetyNotice | null;
  readonly brief: TodayDailyHealthBrief;
  readonly priorities: TodayTopPriorities;
  readonly keyInsight: TodayKeyInsight | null;
  readonly progress: TodayProgress;
  readonly quickActions: TodayQuickActions;
}

export type TodayPresentationState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly content: TodayPresentation }
  | { readonly status: 'refreshing'; readonly content: TodayPresentation };
