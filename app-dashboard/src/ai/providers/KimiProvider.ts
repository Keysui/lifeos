import { BaseAIProvider, AIProviderError } from "./AIProvider";
import type {
  AIRequestOptions,
  ChatCompletionResult,
  ChatMessage,
  ProviderCapabilities,
  StreamChunk,
  TokenUsage,
} from "@/types/ai";

interface KimiProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

// Moonshot AI's international platform. If your account is on the China platform instead,
// set KIMI_BASE_URL=https://api.moonshot.cn/v1 -- the API surface is otherwise identical.
const DEFAULT_BASE_URL = "https://api.moonshot.ai/v1";
// Verified against a real account's GET /v1/models on 2026-07-23 -- there is no "kimi-latest"
// alias on the official API (unlike some other vendors), so this pins to a real, current model.
// Other available models on the same account: kimi-k3 (newer, 1M context, reasoning), and the
// coding-tuned kimi-k2.7-code / kimi-k2.7-code-highspeed. Override with KIMI_MODEL_ID.
const DEFAULT_MODEL = "kimi-k2.6";
// kimi-k2.6 routinely takes 40-55s+ on non-trivial prompts (it's a reasoning model -- see the
// max_tokens comment above). 60s was cutting that too close and produced spurious timeouts.
const DEFAULT_TIMEOUT_MS = 120_000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([408, 409, 429, 500, 502, 503, 504]);

interface KimiChatResponse {
  choices: { message: { content: string }; finish_reason?: string }[];
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

function toUsage(usage?: KimiChatResponse["usage"]): TokenUsage | undefined {
  if (!usage) return undefined;
  return {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Official Kimi (Moonshot AI) API -- https://platform.moonshot.ai. Moonshot's chat completions
 * endpoint is OpenAI-compatible, so this client is a plain HTTPS fetch client, same shape as any
 * other OpenAI-style provider: no vendor SDK, no local weights, no GPU requirement.
 * Server-only: never import this file from a Client Component.
 */
export class KimiProvider extends BaseAIProvider {
  readonly id = "kimi" as const;
  readonly name = "Kimi";
  readonly implemented = true;
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    longContext: true,
    contextWindow: 262_144, // verified via GET /v1/models for kimi-k2.6
  };

  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: KimiProviderConfig = {}) {
    super();
    this.apiKey = config.apiKey ?? process.env.KIMI_API_KEY ?? "";
    this.baseUrl = config.baseUrl ?? process.env.KIMI_BASE_URL ?? DEFAULT_BASE_URL;
    this.model = config.model ?? process.env.KIMI_MODEL_ID ?? DEFAULT_MODEL;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  getConfiguredModel(): string | null {
    return this.model;
  }

  private effectiveKey(options?: AIRequestOptions): string {
    return options?.apiKeyOverride || this.apiKey;
  }

  private effectiveModel(options?: AIRequestOptions): string {
    return options?.modelOverride || this.model;
  }

  private async requestWithRetry(body: Record<string, unknown>, options?: AIRequestOptions): Promise<Response> {
    const apiKey = this.effectiveKey(options);
    if (!apiKey) {
      throw new AIProviderError("KIMI_API_KEY is not configured.", this.id, "unconfigured");
    }

    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const externalSignal = options?.signal;
      const onExternalAbort = () => controller.abort();
      externalSignal?.addEventListener("abort", onExternalAbort);
      const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? DEFAULT_TIMEOUT_MS);

      try {
        const started = Date.now();
        const res = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: body.stream ? "text/event-stream" : "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        console.log(
          `[ai/kimi] ${body.stream ? "stream" : "chat"} model=${body.model} attempt=${attempt} status=${res.status} durationMs=${Date.now() - started}`
        );

        if (res.ok) return res;

        if (RETRYABLE_STATUS.has(res.status) && attempt < MAX_RETRIES) {
          const backoffMs = 500 * 2 ** attempt;
          await sleep(backoffMs);
          continue;
        }

        const errText = await res.text().catch(() => "");
        throw new AIProviderError(
          `Kimi API request failed (${res.status}): ${errText.slice(0, 300)}`,
          this.id,
          res.status === 429 ? "rate_limited" : "upstream_error",
          res.status
        );
      } catch (err) {
        lastError = err;
        if (err instanceof AIProviderError) throw err;
        if (err instanceof Error && err.name === "AbortError") {
          throw new AIProviderError("Kimi API request timed out.", this.id, "timeout");
        }
        if (attempt < MAX_RETRIES) {
          await sleep(500 * 2 ** attempt);
          continue;
        }
        throw new AIProviderError(
          err instanceof Error ? err.message : "Unknown network error contacting the Kimi API.",
          this.id,
          "upstream_error"
        );
      } finally {
        clearTimeout(timeout);
        externalSignal?.removeEventListener("abort", onExternalAbort);
      }
    }

    throw lastError instanceof Error ? lastError : new AIProviderError("Unknown error", this.id, "upstream_error");
  }

  async chat(messages: ChatMessage[], options?: AIRequestOptions): Promise<ChatCompletionResult> {
    const started = Date.now();
    const res = await this.requestWithRetry(
      {
        model: this.effectiveModel(options),
        messages,
        // Deliberately no default here: some models (e.g. kimi-k2.6, a reasoning-tuned model)
        // reject any temperature other than their fixed value. Omitting the field when the
        // caller hasn't set one lets each model apply its own default/constraint instead of us
        // guessing one that might not be valid. JSON.stringify drops keys whose value is undefined.
        temperature: options?.temperature,
        // kimi-k2.6 is a reasoning model: its internal "thinking" tokens are billed against the
        // same max_tokens budget as the visible answer (see reasoning_content in the raw API
        // response). A low ceiling can get fully consumed by reasoning before any content is
        // emitted at all (finish_reason: "length", content: ""). 4096 leaves real headroom.
        max_tokens: options?.maxTokens ?? 4096,
        stream: false,
      },
      options
    );

    let data: KimiChatResponse;
    try {
      data = await res.json();
    } catch {
      throw new AIProviderError("Kimi API returned a non-JSON response.", this.id, "invalid_response");
    }

    const content = data.choices?.[0]?.message?.content ?? "";
    const usage = toUsage(data.usage);
    console.log(`[ai/kimi] chat complete tokens=${usage?.totalTokens ?? "?"} latencyMs=${Date.now() - started}`);

    return {
      content,
      model: data.model ?? this.effectiveModel(options),
      provider: this.id,
      usage,
      finishReason: data.choices?.[0]?.finish_reason,
      latencyMs: Date.now() - started,
    };
  }

  async *stream(messages: ChatMessage[], options?: AIRequestOptions): AsyncGenerator<StreamChunk> {
    const res = await this.requestWithRetry(
      {
        model: this.effectiveModel(options),
        messages,
        temperature: options?.temperature, // see chat() -- no default, some models reject one
        // kimi-k2.6 is a reasoning model: its internal "thinking" tokens are billed against the
        // same max_tokens budget as the visible answer (see reasoning_content in the raw API
        // response). A low ceiling can get fully consumed by reasoning before any content is
        // emitted at all (finish_reason: "length", content: ""). 4096 leaves real headroom.
        max_tokens: options?.maxTokens ?? 4096,
        stream: true,
        stream_options: { include_usage: true },
      },
      options
    );

    if (!res.body) {
      throw new AIProviderError("Kimi API streaming response had no body.", this.id, "invalid_response");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") {
            yield { delta: "", done: true };
            return;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta: string = parsed.choices?.[0]?.delta?.content ?? "";
            const usage = toUsage(parsed.usage);
            if (delta || usage) {
              yield { delta, done: false, usage };
            }
          } catch {
            // Ignore malformed SSE fragments (can happen mid-chunk); the buffer carries partial lines forward.
          }
        }
      }
      yield { delta: "", done: true };
    } finally {
      reader.releaseLock();
    }
  }
}
