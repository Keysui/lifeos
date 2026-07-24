import { BaseAIProvider, AIProviderError } from "./AIProvider";
import type { AIRequestOptions, ChatCompletionResult, ChatMessage, ProviderCapabilities, StreamChunk } from "@/types/ai";

/** Placeholder -- see ClaudeProvider.ts for the pattern to follow when implementing this for real. */
export class DeepSeekProvider extends BaseAIProvider {
  readonly id = "deepseek" as const;
  readonly name = "DeepSeek";
  readonly implemented = false;
  readonly capabilities: ProviderCapabilities = { streaming: true, longContext: true, contextWindow: 128_000 };

  isConfigured(): boolean {
    return Boolean(process.env.DEEPSEEK_API_KEY);
  }

  async chat(_messages: ChatMessage[], _options?: AIRequestOptions): Promise<ChatCompletionResult> {
    throw new AIProviderError("DeepSeek provider is not implemented yet.", this.id, "not_implemented");
  }

  async *stream(_messages: ChatMessage[], _options?: AIRequestOptions): AsyncGenerator<StreamChunk> {
    throw new AIProviderError("DeepSeek provider is not implemented yet.", this.id, "not_implemented");
  }
}
