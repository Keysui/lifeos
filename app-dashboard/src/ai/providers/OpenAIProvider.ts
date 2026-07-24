import { BaseAIProvider, AIProviderError } from "./AIProvider";
import type { AIRequestOptions, ChatCompletionResult, ChatMessage, ProviderCapabilities, StreamChunk } from "@/types/ai";

/** Placeholder -- see ClaudeProvider.ts for the pattern to follow when implementing this for real. */
export class OpenAIProvider extends BaseAIProvider {
  readonly id = "openai" as const;
  readonly name = "OpenAI";
  readonly implemented = false;
  readonly capabilities: ProviderCapabilities = { streaming: true, longContext: true, contextWindow: 128_000 };

  isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async chat(_messages: ChatMessage[], _options?: AIRequestOptions): Promise<ChatCompletionResult> {
    throw new AIProviderError("OpenAI provider is not implemented yet.", this.id, "not_implemented");
  }

  async *stream(_messages: ChatMessage[], _options?: AIRequestOptions): AsyncGenerator<StreamChunk> {
    throw new AIProviderError("OpenAI provider is not implemented yet.", this.id, "not_implemented");
  }
}
