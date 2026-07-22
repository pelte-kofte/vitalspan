import { FunctionsHttpError } from '@supabase/supabase-js';
import {
  captureAuthRequestScope,
  isAuthRequestScopeCurrent,
  supabase,
} from './supabase';
import type { AuthRequestScope } from './authSessionCoordinator';
import type { AdvisorContext } from './advisorContext';
import type { BiomarkerStatus } from './advisorContext';

export interface LongevityReport {
  scoreSummary: {
    biologicalAge: number | null;
    ageBand: string;
    headline: string;
    trend: string;
  };
  priorityFindings: Array<{
    finding: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  biomarkerAnalysis: Array<{
    name: string;
    status: BiomarkerStatus;
    insight: string;
  }>;
  supplementMedicationReview: Array<{
    name: string;
    type: 'supplement' | 'medication';
    assessment: string;
  }>;
  recommendations: Array<{
    action: string;
    category: string;
    timeframe: string;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AdvisorErrorCode =
  | 'RATE_LIMITED'
  | 'PREMIUM_REQUIRED'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR'
  | 'AI_ERROR'
  | 'UNKNOWN';

export interface ReportResult {
  data: LongevityReport | null;
  error: { code: AdvisorErrorCode; message: string } | null;
}

export interface ChatResult {
  data: string | null;
  error: { code: AdvisorErrorCode; message: string } | null;
}

function mapInvokeError(err: unknown): { code: AdvisorErrorCode; message: string } {
  if (err instanceof FunctionsHttpError) {
    const status = err.context?.status ?? 0;
    if (status === 429) {
      return { code: 'RATE_LIMITED', message: "You've reached your daily limit. Try again tomorrow." };
    }
    if (status === 401) {
      return { code: 'UNAUTHORIZED', message: 'Authentication required' };
    }
    if (status === 403) {
      return { code: 'PREMIUM_REQUIRED', message: 'Premium subscription required' };
    }
    if (status === 500 || status === 502) {
      return { code: 'AI_ERROR', message: 'AI service error — please try again' };
    }
    return { code: 'UNKNOWN', message: 'Something went wrong' };
  }
  const message = err instanceof Error ? err.message : String(err);
  if (/network|fetch|networkerror/i.test(message)) {
    return { code: 'NETWORK_ERROR', message: 'No internet connection' };
  }
  return { code: 'UNKNOWN', message: 'Something went wrong' };
}

const STALE_AUTH_ERROR = { code: 'UNAUTHORIZED' as const, message: 'Session changed — please try again' };

export async function generateReport(
  context: AdvisorContext,
  expectedScope: AuthRequestScope | null = captureAuthRequestScope(),
): Promise<ReportResult> {
  try {
    if (!expectedScope || !isAuthRequestScopeCurrent(expectedScope)) {
      return { data: null, error: STALE_AUTH_ERROR };
    }
    const { data, error } = await supabase.functions.invoke('ai-advisor', {
      body: { action: 'report', context },
    });
    if (!isAuthRequestScopeCurrent(expectedScope)) {
      return { data: null, error: STALE_AUTH_ERROR };
    }
    if (error) {
      return { data: null, error: mapInvokeError(error) };
    }
    if (!data || typeof data !== 'object' || !('scoreSummary' in data)) {
      return { data: null, error: { code: 'AI_ERROR', message: 'Invalid report shape received from edge function' } };
    }
    return { data: data as LongevityReport, error: null };
  } catch (e: unknown) {
    console.warn('[advisorService] generateReport error:', e instanceof Error ? e.message : String(e));
    return { data: null, error: mapInvokeError(e) };
  }
}

export async function sendChatMessage(
  messages: ChatMessage[],
  reportSummary: string,
  context?: AdvisorContext,
  expectedScope: AuthRequestScope | null = captureAuthRequestScope(),
): Promise<ChatResult> {
  try {
    if (!expectedScope || !isAuthRequestScopeCurrent(expectedScope)) {
      return { data: null, error: STALE_AUTH_ERROR };
    }
    const { data, error } = await supabase.functions.invoke('ai-advisor', {
      body: { action: 'chat', messages, reportSummary, context },
    });
    if (!isAuthRequestScopeCurrent(expectedScope)) {
      return { data: null, error: STALE_AUTH_ERROR };
    }
    if (error) {
      return { data: null, error: mapInvokeError(error) };
    }
    if (typeof (data as { message?: unknown })?.message !== 'string') {
      return { data: null, error: { code: 'AI_ERROR', message: 'Invalid chat response' } };
    }
    return { data: (data as { message: string }).message, error: null };
  } catch (e: unknown) {
    console.warn('[advisorService] sendChatMessage error:', e instanceof Error ? e.message : String(e));
    return { data: null, error: mapInvokeError(e) };
  }
}
