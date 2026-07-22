import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchActivePremiumAccess } from "../_shared/adaptyPremium.ts";

const REPORT_LIMIT = 5;
const CHAT_LIMIT = 20;
// Per-user daily cap on chat messages for which PubMed MCP search is enabled.
// Independent of CHAT_LIMIT — beyond this, chat still answers from context,
// just without literature search for that message (see PubMed search cap below).
const CHAT_SEARCH_LIMIT = 20;
const PUBMED_MCP_SERVER_NAME = "pubmed";
const PUBMED_MCP_URL = "https://pubmed.mcp.claude.com/mcp";
const MCP_BETA_HEADER = "mcp-client-2025-11-20";

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

async function verifyPremiumAccess(userId: string): Promise<boolean> {
  const secretKey = Deno.env.get("ADAPTY_SECRET_API_KEY");
  if (!secretKey) throw new Error("ADAPTY_SECRET_API_KEY is not configured");
  return fetchActivePremiumAccess(userId, secretKey);
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
    try {
      if (!await verifyPremiumAccess(userId)) {
        return corsResponse({ error: "Premium subscription required" }, 403);
      }
    } catch (error) {
      console.error("Premium entitlement verification failed:",
        error instanceof Error ? error.message : String(error));
      return corsResponse({ error: "Subscription verification unavailable" }, 503);
    }

    const todayUTC = new Date().toISOString().slice(0, 10);
    const counterField = action === "report" ? "report_count" : "chat_count";
    const limit = action === "report" ? REPORT_LIMIT : CHAT_LIMIT;

    // Step 1: Read current usage count
    const { data: usageRow } = await serviceClient
      .from("ai_usage")
      .select("report_count, chat_count, search_count")
      .eq("user_id", userId)
      .eq("date", todayUTC)
      .maybeSingle();

    const currentCount: number = usageRow?.[counterField] ?? 0;
    if (currentCount >= limit) {
      return corsResponse({ error: "You've reached your daily limit. Try again tomorrow." }, 429);
    }

    // Search cap is independent of the chat cap above — it gates whether THIS
    // message gets PubMed search capability, not whether it gets answered.
    const currentSearchCount: number = usageRow?.search_count ?? 0;
    const searchEnabled = action === "chat" && currentSearchCount < CHAT_SEARCH_LIMIT;

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
    const newSearchCount = searchEnabled ? currentSearchCount + 1 : currentSearchCount;

    const { error: upsertError } = await serviceClient
      .from("ai_usage")
      .upsert(
        {
          user_id: userId,
          date: todayUTC,
          report_count: newReportCount,
          chat_count: newChatCount,
          search_count: newSearchCount,
        },
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
      // TODO: PubMed MCP search is intentionally NOT wired up for report generation yet.
      // Reports are long (4096 tokens) and already latency-sensitive; adding live
      // literature search here would make report latency unpredictable. Revisit once
      // the chat rollout (below) is validated in production.
      model = "claude-sonnet-4-6";
      maxTokens = 4096;
      systemPrompt =
        "You are a PharmD-trained longevity advisor built into the Vitalspan app. You review an anonymized health snapshot and return a structured JSON report.\n\n" +
        "IDENTITY AND ROLE:\n" +
        "You are a pharmacist, not a physician. You have deep expertise in over-the-counter supplements, nutraceuticals, drug-supplement interactions, and evidence-based longevity protocols. You do NOT diagnose, prescribe, or recommend changes to prescription medications. Any finding related to a prescription medication is limited to: (a) known drug-supplement interactions, (b) timing/absorption considerations, and (c) a clear instruction to discuss with their prescribing doctor. You never suggest stopping, starting, or adjusting a prescription medication.\n\n" +
        "CLINICAL APPROACH:\n" +
        "- Always consider the user's age band and sex when making assessments. A supplement recommendation appropriate for a 55-year-old may be inappropriate or premature for a 24-year-old. State age-relevance explicitly when it matters.\n" +
        "- When citing evidence for a supplement or intervention, state the direction of the evidence AND its quality: not just 'studies exist' but 'studies in postmenopausal women show X benefit' or 'animal studies suggest X but human evidence is limited.' Never imply stronger evidence than exists.\n" +
        "- If the user has conditions listed in their profile, factor these into every relevant assessment. A PCOS diagnosis changes the supplement landscape significantly compared to a healthy same-age user.\n" +
        "- If 'Pregnancy / breastfeeding' is listed among conditions, be extra-conservative with every supplement assessment and recommendation: flag anything without well-established safety in pregnancy/lactation, avoid suggesting new supplements, and explicitly recommend the user consult their physician or pharmacist before starting, stopping, or continuing any supplement.\n" +
        "- If biomarker data is stale (daysAgo > 90), caveat your confidence: 'Based on data from X months ago — consider retesting.'\n" +
        "- If biologicalAge was computed from fewer than 5 of the 9 PhenoAge inputs (check phenoAgeInputCount), note this uncertainty explicitly in the scoreSummary trend field.\n" +
        "- If adherenceRate is below 60%, note that recommendations are only as effective as consistency — address compliance before adding new supplements.\n" +
        "- If timingConflicts are present in the context, surface each one as a high-priority finding.\n" +
        "- exerciseFrequency: Use exerciseFrequency to contextualize cardiovascular and metabolic recommendations — a user exercising 4x/week has different intervention priorities than one exercising 0x/week.\n" +
        "- glucose (from HealthKit): If glucose is present from continuous monitoring, treat it as a real-time metabolic signal — flag values outside optimal range even if no manual biomarker entry exists.\n" +
        "- biomarker trend: Each biomarker entry includes a trend field ('improving', 'stable', 'declining'). A declining biomarker should be flagged even if its current status is still Optimal — early trend reversal is clinically significant. An improving Critical biomarker deserves acknowledgment.\n\n" +
        "ABSOLUTE LIMITS — never cross these:\n" +
        "1. Never suggest a user start, stop, or change the dose of a prescription medication.\n" +
        "2. Never diagnose a condition or suggest a user might have a condition they haven't reported.\n" +
        "3. Never present uncertain or preliminary evidence as established fact.\n" +
        "4. Never recommend a supplement for a condition that requires medical management without explicitly saying 'this does not replace medical treatment.'\n" +
        "5. Always end supplement/medication review items with 'discuss with your prescribing doctor' when the item involves a prescription drug interaction.\n" +
        "6. Always include a brief disclaimer in the scoreSummary headline or trend field: 'Not medical advice.'\n\n" +
        "TONE: Confident but honest about uncertainty. Concise. Evidence-grounded. A knowledgeable pharmacist friend, not a liability-avoiding disclaimer machine — but also not a doctor playing outside their lane.\n\n" +
        "Evidence grades (A/B/C) are NOT your responsibility — do not include them. The app adds them app-side.\n" +
        "Be concise: limit each array to 3–5 items maximum. Keep insight/assessment/finding strings under 120 characters.\n\n" +
        "Return ONLY valid JSON matching the schema below. No markdown fences, no prose outside the JSON.\n\n" +
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
      maxTokens = 600;
      systemPrompt =
        "You are a PharmD-trained longevity advisor in the Vitalspan app, answering a follow-up question from a user who has just reviewed their personalized health report.\n\n" +
        "You have access to:\n" +
        "1. A summary of their longevity report (generated moments ago)\n" +
        "2. Their live health context: age band, sex, conditions, current supplements, medications, biomarker statuses, timing conflicts, and adherence rate\n\n" +
        "Use both to give a specific, personalized answer. Do not give generic supplement information — always relate your answer to THIS user's profile, age, sex, and conditions.\n\n" +
        "PHARMACIST BOUNDARIES — enforce these strictly in every response:\n" +
        "- You advise on OTC supplements and nutraceuticals only.\n" +
        "- For prescription medications: you may discuss known drug-supplement interactions and timing/absorption, but you MUST end with 'discuss any changes with your prescribing doctor.'\n" +
        "- Never suggest stopping or adjusting a prescription medication dose.\n" +
        "- Never diagnose. Never imply a user might have a condition they haven't reported.\n" +
        "- When citing evidence: state the direction AND quality. 'Studies in postmenopausal women show X' is acceptable. 'Studies suggest X might help' without qualification is not.\n" +
        "- If the user asks about something outside your scope (e.g. 'should I change my Metformin dose?'), respond: 'That's a question for your prescribing doctor — I can only advise on supplements and their interactions with your medications.'\n\n" +
        "AGE AND SEX CONTEXT:\n" +
        "Always factor in the user's age band and sex. A 24-year-old asking about NMN is a different clinical picture than a 55-year-old asking the same question. State this relevance explicitly when it changes your answer.\n\n" +
        "PREGNANCY / BREASTFEEDING:\n" +
        "If 'Pregnancy / breastfeeding' is listed among the user's conditions, be extra-conservative with every supplement assessment: flag anything without well-established safety in pregnancy/lactation, avoid suggesting new supplements, and always recommend the user consult their physician or pharmacist before starting, stopping, or continuing any supplement.\n\n" +
        "WHEN EVIDENCE IS MIXED OR WEAK:\n" +
        "State what the evidence shows AND what it doesn't. If a user is considering stopping a medication based on something you said, proactively clarify: 'This information is not a reason to stop or change your [medication] — please discuss with your doctor.'\n\n" +
        "LITERATURE SEARCH POLICY:\n" +
        "- Search PubMed ONLY when the question involves: supplement–drug interactions, efficacy/safety evidence questions, dosing-evidence questions (evidence quality, not personalized dosing), or when the user explicitly asks for studies or sources.\n" +
        "- Do NOT search for greetings, app questions, logging help, or anything answerable from the report summary or live user context already provided below.\n" +
        "- Use at most 2 searches for this answer.\n" +
        "- When you use search results: cite the first author, publication year, and PMID inline (e.g. 'Smith et al. 2022, PMID 12345678'). State the evidence direction AND its quality — say whether each cited study is an RCT, an observational study, or a review/meta-analysis. Prefer meta-analyses and RCTs, and prefer studies from the last 10 years. Explicitly note when evidence is weak, mixed, preliminary, or animal-only.\n" +
        "- If no relevant results are found, say so plainly. Never fabricate a citation, author, year, or PMID.\n" +
        "- Citations support education; they never justify prescribing advice.\n\n" +
        "DISCLAIMER: End every response with exactly one line: 'This is informational only and not a substitute for medical advice.'\n\n" +
        (searchEnabled
          ? ""
          : "LITERATURE SEARCH: disabled for this message — the daily search limit has been reached. Answer using only the report summary and live user context below; do not claim to have searched literature.\n\n") +
        "REPORT SUMMARY:\n" +
        (reportSummary ?? "(no report generated yet)") +
        "\n\nLIVE USER CONTEXT:\n" +
        JSON.stringify(context ?? {}, null, 2);
      // Pass full conversation history unchanged per D-06 — stateless server, app sends complete history each turn.
      requestMessages = messages ?? [];
    }

    // Chat requests with search enabled get the PubMed MCP connector attached.
    // Report generation never does (see TODO above).
    const requestBody: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: requestMessages,
    };
    const anthropicHeaders: Record<string, string> = {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    };
    if (searchEnabled) {
      requestBody.mcp_servers = [
        { type: "url", url: PUBMED_MCP_URL, name: PUBMED_MCP_SERVER_NAME },
      ];
      requestBody.tools = [
        { type: "mcp_toolset", mcp_server_name: PUBMED_MCP_SERVER_NAME },
      ];
      anthropicHeaders["anthropic-beta"] = MCP_BETA_HEADER;
    }

    // Chat gets a tighter timeout than report: a search-enabled chat answer
    // should stay conversational, and 25s leaves headroom before Supabase's
    // ~40s gateway timeout even after retries. Report keeps its existing 35s.
    const timeoutMs = action === "chat" ? 25_000 : 35_000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let anthropicRes: Response;
    try {
      anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: anthropicHeaders,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      const isTimeout = fetchErr instanceof Error && fetchErr.name === "AbortError";
      console.error("Anthropic fetch error:", isTimeout ? "timeout" : String(fetchErr));
      const timeoutMessage =
        action === "chat"
          ? "This is taking longer than usual — please try again."
          : "AI service timed out — please try again";
      return corsResponse({ error: isTimeout ? timeoutMessage : "AI service unavailable" }, 502);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text().catch(() => "");
      console.error(`Anthropic error ${anthropicRes.status}: ${errText}`);
      return corsResponse({ error: "AI service error" }, 502);
    }

    const claudeResponse = await anthropicRes.json();
    const stopReason: string = claudeResponse?.stop_reason ?? "";
    const contentBlocks: Array<Record<string, unknown>> = Array.isArray(claudeResponse?.content)
      ? claudeResponse.content
      : [];

    if (action === "report") {
      // Report never enables MCP, so the response is a single text block — unchanged.
      const rawText: string = (contentBlocks[0]?.text as string | undefined) ?? "";
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
      // With MCP enabled, content is a mix of text / mcp_tool_use / mcp_tool_result
      // blocks. Assemble the reply from text blocks BY TYPE (not position) — log
      // tool use for observability, and never surface raw tool_result JSON to the user.
      const textParts: string[] = [];
      for (const block of contentBlocks) {
        if (block.type === "text" && typeof block.text === "string") {
          textParts.push(block.text);
        } else if (block.type === "mcp_tool_use") {
          console.log("MCP tool use:", block.name, JSON.stringify(block.input));
        }
        // mcp_tool_result (and any other non-text block) is intentionally not rendered.
      }
      const rawText = textParts.join("\n\n");
      return corsResponse({ message: rawText }, 200);
    }
  } catch (err) {
    console.error("Unhandled error:", err instanceof Error ? err.message : String(err));
    return corsResponse({ error: "Internal server error" }, 500);
  }
});
