import {
  OPENAI_COVER_CONFIG,
  buildOpenAIProductionRequest,
} from "./briefCover.ts";

export type CoverProviderErrorCode =
  | "provider_http_error"
  | "provider_invalid_response"
  | "provider_missing_image"
  | "invalid_mime"
  | "invalid_dimensions"
  | "invalid_byte_size";

export class CoverProviderError extends Error {
  constructor(public readonly code: CoverProviderErrorCode, message: string) {
    super(message);
    this.name = "CoverProviderError";
  }
}

export interface GeneratedCoverAsset {
  bytes: Uint8Array;
  mimeType: "image/png";
  width: number;
  height: number;
  byteSize: number;
  providerRequestId: string | null;
  durationMs: number;
  estimatedCostUsd: number;
}

interface OpenAIImageEnvelope {
  data?: Array<{ b64_json?: string }>;
  error?: unknown;
}

function decodeBase64(value: string): Uint8Array {
  try {
    const binary = atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    throw new CoverProviderError("provider_invalid_response", "OpenAI returned invalid base64 image data");
  }
}

function uint32be(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] * 0x1000000)
    + (bytes[offset + 1] << 16)
    + (bytes[offset + 2] << 8)
    + bytes[offset + 3]) >>> 0;
}

export function inspectPng(bytes: Uint8Array): { mimeType: "image/png"; width: number; height: number } {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 24 || signature.some((value, index) => bytes[index] !== value)) {
    throw new CoverProviderError("invalid_mime", "Generated asset is not a PNG");
  }
  const chunkType = String.fromCharCode(...bytes.slice(12, 16));
  if (chunkType !== "IHDR") {
    throw new CoverProviderError("invalid_mime", "Generated PNG has no leading IHDR chunk");
  }
  return { mimeType: "image/png", width: uint32be(bytes, 16), height: uint32be(bytes, 20) };
}

export function validateOpenAICoverBytes(bytes: Uint8Array): Omit<GeneratedCoverAsset, "providerRequestId" | "durationMs" | "estimatedCostUsd"> {
  if (bytes.byteLength === 0 || bytes.byteLength > OPENAI_COVER_CONFIG.maxOutputBytes) {
    throw new CoverProviderError("invalid_byte_size", "Generated PNG byte size is outside the allowed range");
  }
  const image = inspectPng(bytes);
  if (image.width !== OPENAI_COVER_CONFIG.width || image.height !== OPENAI_COVER_CONFIG.height) {
    throw new CoverProviderError(
      "invalid_dimensions",
      `Generated PNG must be ${OPENAI_COVER_CONFIG.width}x${OPENAI_COVER_CONFIG.height}`,
    );
  }
  return { bytes, ...image, byteSize: bytes.byteLength };
}

function safeRequestId(response: Response): string | null {
  const value = response.headers.get("x-request-id");
  return value && /^[A-Za-z0-9._:-]{1,200}$/.test(value) ? value : null;
}

export async function generateOpenAICover(
  prompt: string,
  apiKey: string,
  fetcher: typeof fetch = fetch,
): Promise<GeneratedCoverAsset> {
  if (!apiKey) throw new Error("OPENAI_API_KEY is required");
  const startedAt = Date.now();
  const response = await fetcher(OPENAI_COVER_CONFIG.endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(buildOpenAIProductionRequest(prompt)),
    signal: AbortSignal.timeout(OPENAI_COVER_CONFIG.requestTimeoutMs),
  });
  const requestId = safeRequestId(response);
  if (!response.ok) {
    throw new CoverProviderError("provider_http_error", `OpenAI image request failed with HTTP ${response.status}`);
  }

  let payload: OpenAIImageEnvelope;
  try {
    payload = await response.json() as OpenAIImageEnvelope;
  } catch {
    throw new CoverProviderError("provider_invalid_response", "OpenAI returned invalid JSON");
  }
  if (payload.error) throw new CoverProviderError("provider_invalid_response", "OpenAI returned a provider error envelope");
  if (!Array.isArray(payload.data) || payload.data.length !== 1 || typeof payload.data[0]?.b64_json !== "string") {
    throw new CoverProviderError("provider_missing_image", "OpenAI must return exactly one base64 image");
  }

  const validated = validateOpenAICoverBytes(decodeBase64(payload.data[0].b64_json));
  return {
    ...validated,
    providerRequestId: requestId,
    durationMs: Date.now() - startedAt,
    estimatedCostUsd: OPENAI_COVER_CONFIG.estimatedCostUsd,
  };
}

export async function sha256Hex(bytes: Uint8Array | string): Promise<string> {
  const source = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  const buffer = new ArrayBuffer(source.byteLength);
  new Uint8Array(buffer).set(source);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}
