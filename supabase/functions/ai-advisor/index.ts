import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const REPORT_LIMIT = 5;
const CHAT_LIMIT = 20;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function corsResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: CORS });
  }

  try {
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // JWT verification
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user }, error: authError } = await serviceClient.auth.getUser(token);
    if (authError || !user) {
      return corsResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const { action, context, messages, reportSummary } = body as {
      action: "report" | "chat";
      context?: Record<string, unknown>;
      messages?: { role: "user" | "assistant"; content: string }[];
      reportSummary?: string;
    };

    if (action !== "report" && action !== "chat") {
      return corsResponse({ error: "Invalid action" }, 400);
    }

    const userId = user.id;
    const todayUTC = new Date().toISOString().slice(0, 10);
    const counterField = action === "report" ? "report_count" : "chat_count";
    const limit = action === "report" ? REPORT_LIMIT : CHAT_LIMIT;

    // Step 1: Read current usage count
    const { data: usageRow } = await serviceClient
      .from("ai_usage")
      .select("report_count, chat_count")
      .eq("user_id", userId)
      .eq("date", todayUTC)
      .maybeSingle();

    const currentCount: number = usageRow?.[counterField] ?? 0;
    if (currentCount >= limit) {
      return corsResponse({ error: "You've reached your daily limit. Try again tomorrow." }, 429);
    }

    // Step 2: Increment counter BEFORE calling Anthropic (D-13).
    // Rate limit increment: counter upserted BEFORE Anthropic call per D-13.
    // Failed Anthropic calls consume quota by design — prevents retry abuse.
    // Race window is acceptable at 5/20 per-day limits where simultaneous
    // calls from the same user are extremely unlikely.
    const newReportCount =
      action === "report"
        ? (usageRow?.report_count ?? 0) + 1
        : (usageRow?.report_count ?? 0);
    const newChatCount =
      action === "chat"
        ? (usageRow?.chat_count ?? 0) + 1
        : (usageRow?.chat_count ?? 0);

    const { error: upsertError } = await serviceClient
      .from("ai_usage")
      .upsert(
        { user_id: userId, date: todayUTC, report_count: newReportCount, chat_count: newChatCount },
        { onConflict: "user_id,date" }
      );
    if (upsertError) {
      console.error("Rate limit upsert failed:", upsertError.message);
      return corsResponse({ error: "Service temporarily unavailable" }, 503);
    }

    // Step 3: Guard API key
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return corsResponse({ error: "Service misconfigured" }, 500);
    }

    // Step 4: Call Anthropic
    let model: string;
    let systemPrompt: string;
    let requestMessages: { role: "user" | "assistant"; content: string }[];
    let maxTokens: number;

    if (action === "report") {
      model = "claude-sonnet-4-6";
      maxTokens = 4096;
      systemPrompt =
        "You are a pharmacist-trained longevity advisor reviewing an anonymized patient health snapshot. " +
        "Return ONLY valid JSON — no markdown fences, no prose, no explanations outside the JSON structure. " +
        "Evidence grades (A/B/C) are NOT your responsibility — do not include them. The app adds them app-side. " +
        "Be concise: limit each array to 3-5 items maximum. Keep insight/assessment/finding strings under 120 characters. " +
        "The JSON must match this exact schema: " +
        '{ "scoreSummary": { "biologicalAge": "number|null", "ageBand": "string", "headline": "string", "trend": "string" }, ' +
        '"priorityFindings": [{ "finding": "string", "priority": "high|medium|low" }], ' +
        '"biomarkerAnalysis": [{ "name": "string", "status": "Optimal|Suboptimal|Critical", "insight": "string" }], ' +
        '"supplementMedicationReview": [{ "name": "string", "type": "supplement|medication", "assessment": "string" }], ' +
        '"recommendations": [{ "action": "string", "category": "string", "timeframe": "string" }] }';
      requestMessages = [{ role: "user", content: JSON.stringify(context, null, 2) }];
    } else {
      // D-07: claude-haiku-4-5-20251001 is the versioned form of the "claude-haiku-4-5" rolling alias — intentional for production stability.
      model = "claude-haiku-4-5-20251001";
      maxTokens = 500;
      systemPrompt =
        "You are a pharmacist-trained longevity advisor. The following report was generated for this user:\n\n" +
        (reportSummary ?? "") +
        "\n\nAnswer follow-up questions referencing this report.";
      // Pass full conversation history unchanged per D-06 — stateless server, app sends complete history each turn.
      requestMessages = messages ?? [];
    }

    // 35s timeout — returns a proper corsResponse before Supabase's ~40s gateway timeout
    // kills the function and produces a generic 502 EDGE_FUNCTION_ERROR.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35_000);

    let anthropicRes: Response;
    try {
      anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({ model, max_tokens: maxTokens, system: systemPrompt, messages: requestMessages }),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      const isTimeout = fetchErr instanceof Error && fetchErr.name === "AbortError";
      console.error("Anthropic fetch error:", isTimeout ? "timeout" : String(fetchErr));
      return corsResponse({ error: isTimeout ? "AI service timed out — please try again" : "AI service unavailable" }, 502);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text().catch(() => "");
      console.error(`Anthropic error ${anthropicRes.status}: ${errText}`);
      return corsResponse({ error: "AI service error" }, 502);
    }

    const claudeResponse = await anthropicRes.json();
    const rawText: string = claudeResponse?.content?.[0]?.text ?? "";
    const stopReason: string = claudeResponse?.stop_reason ?? "";

    if (action === "report") {
      // stop_reason "max_tokens" means Claude ran out of token budget mid-response.
      // The JSON will be truncated and unparseable — surface a clear error instead of
      // a generic parse failure so the client can show a meaningful message.
      if (stopReason === "max_tokens") {
        console.error("Report truncated: stop_reason=max_tokens, rawText length:", rawText.length);
        return corsResponse({ error: "Report generation was cut short — please try again" }, 502);
      }
      try {
        const report = JSON.parse(rawText);
        return corsResponse(report, 200);
      } catch {
        console.error("JSON parse failed, rawText snippet:", rawText.slice(0, 200));
        return corsResponse({ error: "Invalid report structure from AI" }, 502);
      }
    } else {
      return corsResponse({ message: rawText }, 200);
    }
  } catch (err) {
    console.error("Unhandled error:", err instanceof Error ? err.message : String(err));
    return corsResponse({ error: "Internal server error" }, 500);
  }
});
