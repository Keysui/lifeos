import type {
  AIRequestOptions,
  ChatCompletionResult,
  ChatMessage,
  ProviderCapabilities,
  ProviderId,
  StreamChunk,
} from "@/types/ai";

export type AIProviderErrorCode =
  | "unconfigured"
  | "timeout"
  | "rate_limited"
  | "upstream_error"
  | "not_implemented"
  | "invalid_response";

export class AIProviderError extends Error {
  code: AIProviderErrorCode;
  provider: ProviderId;
  status?: number;

  constructor(message: string, provider: ProviderId, code: AIProviderErrorCode, status?: number) {
    super(message);
    this.name = "AIProviderError";
    this.provider = provider;
    this.code = code;
    this.status = status;
  }
}

/**
 * Universal interface every AI provider implements. The AI Router only ever talks to this --
 * it never knows whether it's holding a KimiProvider or a future ClaudeProvider.
 */
export interface AIProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  /** False for placeholder providers (chat()/stream() throw not_implemented). Lets the Settings
   *  UI show "Coming Soon" without having to make a network call to find out. */
  readonly implemented: boolean;

  /** True if this provider has the credentials it needs to make a real request. */
  isConfigured(): boolean;

  /** The model id this provider would actually call right now, if known (e.g. from env config). */
  getConfiguredModel(): string | null;

  /** Sends a small request and reports whether the provider is actually reachable. */
  testConnection(options?: AIRequestOptions): Promise<{ ok: boolean; latencyMs: number; error?: string }>;

  chat(messages: ChatMessage[], options?: AIRequestOptions): Promise<ChatCompletionResult>;
  stream(messages: ChatMessage[], options?: AIRequestOptions): AsyncGenerator<StreamChunk>;

  summarize(text: string, options?: AIRequestOptions): Promise<ChatCompletionResult>;
  analyze(data: string, question: string, options?: AIRequestOptions): Promise<ChatCompletionResult>;
  reason(prompt: string, options?: AIRequestOptions): Promise<ChatCompletionResult>;
  generateTasks(goalOrProject: string, options?: AIRequestOptions): Promise<ChatCompletionResult>;
  plan(objective: string, context: string, options?: AIRequestOptions): Promise<ChatCompletionResult>;
  extractInformation(text: string, schemaDescription: string, options?: AIRequestOptions): Promise<ChatCompletionResult>;
}

/**
 * Implements the six higher-level methods generically on top of chat(), so a new provider
 * only has to implement chat() + stream() to be fully functional. Providers can still override
 * any of these if a vendor has a better-suited endpoint (e.g. a dedicated summarization API).
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract readonly id: ProviderId;
  abstract readonly name: string;
  abstract readonly capabilities: ProviderCapabilities;
  abstract readonly implemented: boolean;

  abstract isConfigured(): boolean;

  /** Placeholder providers have no model to report. Real providers override this. */
  getConfiguredModel(): string | null {
    return null;
  }

  abstract chat(messages: ChatMessage[], options?: AIRequestOptions): Promise<ChatCompletionResult>;
  abstract stream(messages: ChatMessage[], options?: AIRequestOptions): AsyncGenerator<StreamChunk>;

  async testConnection(options?: AIRequestOptions): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    if (!this.isConfigured()) {
      return { ok: false, latencyMs: 0, error: "Provider is not configured (missing API key)." };
    }
    const started = Date.now();
    try {
      await this.chat([{ role: "user", content: "Reply with the single word: ok" }], {
        ...options,
        maxTokens: 8,
        timeoutMs: options?.timeoutMs ?? 15_000,
      });
      return { ok: true, latencyMs: Date.now() - started };
    } catch (err) {
      return {
        ok: false,
        latencyMs: Date.now() - started,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  summarize(text: string, options?: AIRequestOptions): Promise<ChatCompletionResult> {
    return this.chat(
      [
        { role: "system", content: "Summarize the following content concisely, preserving key facts and action items." },
        { role: "user", content: text },
      ],
      options
    );
  }

  analyze(data: string, question: string, options?: AIRequestOptions): Promise<ChatCompletionResult> {
    return this.chat(
      [
        { role: "system", content: "You are a precise analyst. Base every claim strictly on the provided data." },
        { role: "user", content: `Data:\n${data}\n\nQuestion: ${question}` },
      ],
      options
    );
  }

  reason(prompt: string, options?: AIRequestOptions): Promise<ChatCompletionResult> {
    return this.chat(
      [
        {
          role: "system",
          content: "Think step by step before answering. Show the key reasoning steps briefly, then give a clear conclusion.",
        },
        { role: "user", content: prompt },
      ],
      options
    );
  }

  generateTasks(goalOrProject: string, options?: AIRequestOptions): Promise<ChatCompletionResult> {
    return this.chat(
      [
        {
          role: "system",
          content:
            "Break the input down into a concrete, ordered task list. Each task should be a single actionable line. " +
            "Prefer 5-10 tasks. Do not add commentary before or after the list.",
        },
        { role: "user", content: goalOrProject },
      ],
      options
    );
  }

  plan(objective: string, context: string, options?: AIRequestOptions): Promise<ChatCompletionResult> {
    return this.chat(
      [
        {
          role: "system",
          content:
            "You are a planning engine. Produce a realistic, time-aware plan for the objective given the context. " +
            "Call out risks and conflicts explicitly.",
        },
        { role: "user", content: `Context:\n${context}\n\nObjective: ${objective}` },
      ],
      options
    );
  }

  extractInformation(text: string, schemaDescription: string, options?: AIRequestOptions): Promise<ChatCompletionResult> {
    return this.chat(
      [
        {
          role: "system",
          content: `Extract structured information from the text as JSON matching this shape: ${schemaDescription}. Return only valid JSON, no prose.`,
        },
        { role: "user", content: text },
      ],
      options
    );
  }
}
