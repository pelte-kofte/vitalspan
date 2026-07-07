import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { AdvisorContext } from './advisorContext';

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
    status: 'Optimal' | 'Suboptimal' | 'Critical';
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

export async function generateReport(context: AdvisorContext): Promise<ReportResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-advisor', {
      body: { action: 'report', context },
    });
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
): Promise<ChatResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-advisor', {
      body: { action: 'chat', messages, reportSummary, context },
    });
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
