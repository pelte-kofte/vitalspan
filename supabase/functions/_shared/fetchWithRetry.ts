export type FetchErrorCategory = "timeout" | "rate_limit" | "server_error" | "network_error" | "permanent_4xx";

export interface FetchAttemptMetadata {
  attempt: number;
  elapsedMs: number;
  status?: number;
  errorCategory: FetchErrorCategory | null;
}

export interface FetchRetryOptions {
  attempts?: number;
  timeoutMs?: number;
  totalTimeoutMs?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onAttempt?: (metadata: FetchAttemptMetadata) => void;
}

export class FetchRequestError extends Error {
  constructor(message: string, readonly category: FetchErrorCategory) {
    super(message);
    this.name = "FetchRequestError";
  }
}

function categoryForStatus(status: number): FetchErrorCategory | null {
  if (status === 429) return "rate_limit";
  if (status >= 500) return "server_error";
  if (status >= 400) return "permanent_4xx";
  return null;
}

function retryable(category: FetchErrorCategory): boolean {
  return category === "timeout"
    || category === "rate_limit"
    || category === "server_error"
    || category === "network_error";
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  options: FetchRetryOptions = {},
): Promise<Response> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const timeoutMs = options.timeoutMs ?? 15_000;
  const totalTimeoutMs = options.totalTimeoutMs ?? Number.POSITIVE_INFINITY;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 2_000;
  const requestStartedAt = Date.now();
  let lastError: FetchRequestError | null = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const totalElapsed = Date.now() - requestStartedAt;
    const remainingMs = totalTimeoutMs - totalElapsed;
    if (remainingMs <= 0) {
      throw new FetchRequestError(`Request exceeded ${totalTimeoutMs}ms total timeout`, "timeout");
    }

    const controller = new AbortController();
    const attemptTimeoutMs = Math.max(1, Math.min(timeoutMs, remainingMs));
    let timedOut = false;
    const attemptStartedAt = Date.now();
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, attemptTimeoutMs);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      const category = categoryForStatus(response.status);
      options.onAttempt?.({
        attempt,
        elapsedMs: Date.now() - attemptStartedAt,
        status: response.status,
        errorCategory: category,
      });
      if (!category || !retryable(category)) return response;
      lastError = new FetchRequestError(`Request failed with HTTP ${response.status}`, category);
    } catch (error) {
      const category: FetchErrorCategory = timedOut ? "timeout" : "network_error";
      options.onAttempt?.({
        attempt,
        elapsedMs: Date.now() - attemptStartedAt,
        errorCategory: category,
      });
      const detail = error instanceof Error && error.message ? `: ${error.message}` : "";
      lastError = new FetchRequestError(
        category === "timeout" ? `Request timed out after ${attemptTimeoutMs}ms` : `Network request failed${detail}`,
        category,
      );
    } finally {
      clearTimeout(timer);
    }

    if (attempt < attempts && lastError && retryable(lastError.category)) {
      const delayMs = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const remainingBeforeDelay = totalTimeoutMs - (Date.now() - requestStartedAt);
      if (remainingBeforeDelay <= delayMs) break;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError ?? new FetchRequestError("Request failed after retries", "network_error");
}
