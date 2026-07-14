import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.106.2";

export interface RuntimeContext {
  supabase: SupabaseClient;
  serviceRoleKey: string;
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

/** Only Vault/cron or another trusted server may invoke pipeline functions. */
export function authorizePipelineRequest(req: Request): RuntimeContext | null {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const pipelineSecret = Deno.env.get("BRIEF_PIPELINE_SECRET");
  const suppliedKey = req.headers.get("apikey") ?? "";
  const suppliedSecret = req.headers.get("x-brief-pipeline-secret") ?? "";
  if (!url || !serviceRoleKey || !pipelineSecret) return null;
  if (!timingSafeEqual(suppliedKey, serviceRoleKey) || !timingSafeEqual(suppliedSecret, pipelineSecret)) {
    return null;
  }
  return { supabase: createClient(url, serviceRoleKey), serviceRoleKey };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  options: { attempts?: number; timeoutMs?: number; baseDelayMs?: number } = {},
): Promise<Response> {
  const attempts = options.attempts ?? 3;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const baseDelayMs = options.baseDelayMs ?? 500;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.ok || (response.status < 500 && response.status !== 429)) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timer);
    }
    if (attempt + 1 < attempts) {
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Request failed after retries");
}

export async function startPublicationJob(
  supabase: SupabaseClient,
  jobType: "ingestion" | "editorial_generation",
): Promise<string> {
  const { data, error } = await supabase
    .from("publication_jobs")
    .insert({ job_type: jobType, status: "running" })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Could not start ${jobType} job: ${error?.message ?? "unknown error"}`);
  return data.id as string;
}

export async function finishPublicationJob(
  supabase: SupabaseClient,
  jobId: string,
  status: "completed" | "failed",
  stats: Record<string, unknown>,
  errorMessage?: string,
): Promise<void> {
  const { error } = await supabase
    .from("publication_jobs")
    .update({
      status,
      completed_at: new Date().toISOString(),
      stats,
      error_message: errorMessage?.slice(0, 2_000) ?? null,
    })
    .eq("id", jobId);
  if (error) console.error("Could not finish publication job", jobId, error.message);
}
