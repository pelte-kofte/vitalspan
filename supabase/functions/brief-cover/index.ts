import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.106.2";
import {
  COVER_GENERATION_PROVIDER,
  executeCoverGeneration,
  type ClaimedCoverGeneration,
  type ClaimedCoverSource,
  type CoverCompletionMetadata,
  type CoverGenerationRepository,
} from "../_shared/briefCoverGeneration.ts";
import { authorizePipelineRequest, jsonResponse } from "../_shared/briefRuntime.ts";

function row<T>(value: T | T[] | null): T {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (!normalized) throw new Error("Cover workflow RPC returned no row");
  return normalized;
}

class SupabaseCoverRepository implements CoverGenerationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async claim(draftId: string): Promise<{ generation: ClaimedCoverGeneration; sources: ClaimedCoverSource[] }> {
    const { data, error } = await this.supabase.rpc("begin_cover_generation", {
      p_draft_id: draftId,
      p_provider_id: COVER_GENERATION_PROVIDER.provider,
      p_provider_model: COVER_GENERATION_PROVIDER.model,
      p_estimated_cost_usd: COVER_GENERATION_PROVIDER.estimatedCostUsd,
    });
    if (error) throw new Error(`Could not claim cover generation: ${error.message}`);
    const generation = row(data) as ClaimedCoverGeneration;
    const { data: sources, error: sourceError } = await this.supabase
      .from("editorial_cover_generation_sources")
      .select("candidate_id,pmid,source_phrase,ordinal")
      .eq("generation_id", generation.id)
      .order("ordinal", { ascending: true });
    if (sourceError) throw new Error(`Could not load cover source evidence: ${sourceError.message}`);
    return { generation, sources: (sources ?? []) as ClaimedCoverSource[] };
  }

  async upload(bucket: string, path: string, bytes: Uint8Array, mimeType: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).upload(path, bytes, {
      contentType: mimeType,
      upsert: false,
      cacheControl: "0",
    });
    if (error) throw new Error(`Private cover upload failed: ${error.message}`);
  }

  async complete(generationId: string, metadata: CoverCompletionMetadata): Promise<void> {
    const { error } = await this.supabase.rpc("complete_cover_generation", {
      p_generation_id: generationId,
      p_final_prompt: metadata.finalPrompt,
      p_prompt_sha256: metadata.promptSha256,
      p_storage_bucket: metadata.storageBucket,
      p_storage_path: metadata.storagePath,
      p_output_mime_type: metadata.mimeType,
      p_output_width: metadata.width,
      p_output_height: metadata.height,
      p_output_bytes: metadata.byteSize,
      p_asset_sha256: metadata.assetSha256,
      p_generation_duration_ms: metadata.durationMs,
      p_provider_request_id: metadata.providerRequestId,
      p_estimated_cost_usd: metadata.estimatedCostUsd,
    });
    if (error) throw new Error(`Could not complete cover generation: ${error.message}`);
  }

  async fail(generationId: string, code: string, safeMessage: string): Promise<void> {
    const { error } = await this.supabase.rpc("fail_cover_generation", {
      p_generation_id: generationId,
      p_failure_code: code,
      p_failure_message: safeMessage,
    });
    if (error) throw new Error(`Could not persist cover failure: ${error.message}`);
  }

  async remove(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) throw new Error(`Could not clean up private cover asset: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  const runtime = authorizePipelineRequest(req);
  if (!runtime) return jsonResponse({ error: "Unauthorized or pipeline secrets are not configured" }, 401);
  const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAIApiKey) return jsonResponse({ error: "Cover provider is not configured" }, 503);

  let body: { draftId?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  if (typeof body.draftId !== "string") return jsonResponse({ error: "draftId is required" }, 400);

  try {
    const result = await executeCoverGeneration(body.draftId, {
      repository: new SupabaseCoverRepository(runtime.supabase),
      openAIApiKey,
    });
    console.info("brief-cover generation ready for review", JSON.stringify({
      generationId: result.generationId,
      status: result.status,
    }));
    return jsonResponse(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("brief-cover failed", message.slice(0, 500));
    return jsonResponse({ error: "Cover generation failed" }, 500);
  }
});
