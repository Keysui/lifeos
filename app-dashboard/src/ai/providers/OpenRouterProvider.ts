import { BaseAIProvider, AIProviderError } from "./AIProvider";
import type { AIRequestOptions, ChatCompletionResult, ChatMessage, ProviderCapabilities, StreamChunk } from "@/types/ai";

/**
 * Placeholder for OpenRouter (a multi-model gateway, not a single model vendor). See
 * ClaudeProvider.ts for the pattern to follow when implementing this for real.
 */
export class OpenRouterProvider extends BaseAIProvider {
  readonly id = "openrouter" as const;
  readonly name = "OpenRouter";
  readonly implemented = false;
  readonly capabilities: ProviderCapabilities = { streaming: true, longContext: true, contextWindow: 128_000 };

  isConfigured(): boolean {
    return Boolean(process.env.OPENROUTER_API_KEY);
  }

  async chat(_messages: ChatMessage[], _options?: AIRequestOptions): Promise<ChatCompletionResult> {
    throw new AIProviderError("OpenRouter provider is not implemented yet.", this.id, "not_implemented");
  }

  async *stream(_messages: ChatMessage[], _options?: AIRequestOptions): AsyncGenerator<StreamChunk> {
    throw new AIProviderError("OpenRouter provider is not implemented yet.", this.id, "not_implemented");
  }
}
