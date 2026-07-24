import { BaseAIProvider, AIProviderError } from "./AIProvider";
import type { AIRequestOptions, ChatCompletionResult, ChatMessage, ProviderCapabilities, StreamChunk } from "@/types/ai";

/** Placeholder -- see ClaudeProvider.ts for the pattern to follow when implementing this for real. */
export class GeminiProvider extends BaseAIProvider {
  readonly id = "gemini" as const;
  readonly name = "Gemini";
  readonly implemented = false;
  readonly capabilities: ProviderCapabilities = { streaming: true, longContext: true, contextWindow: 1_000_000 };

  isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async chat(_messages: ChatMessage[], _options?: AIRequestOptions): Promise<ChatCompletionResult> {
    throw new AIProviderError("Gemini provider is not implemented yet.", this.id, "not_implemented");
  }

  async *stream(_messages: ChatMessage[], _options?: AIRequestOptions): AsyncGenerator<StreamChunk> {
    throw new AIProviderError("Gemini provider is not implemented yet.", this.id, "not_implemented");
  }
}
