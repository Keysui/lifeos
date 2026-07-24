import { BaseAIProvider, AIProviderError } from "./AIProvider";
import type { AIRequestOptions, ChatCompletionResult, ChatMessage, ProviderCapabilities, StreamChunk } from "@/types/ai";

/**
 * Placeholder. Registering a real provider is a two-step process (see AIRouter):
 *   1. Implement chat() + stream() here using the Claude API (client.messages.create / .stream).
 *   2. Router registration already exists below -- no other application code needs to change.
 */
export class ClaudeProvider extends BaseAIProvider {
  readonly id = "claude" as const;
  readonly name = "Claude";
  readonly implemented = false;
  readonly capabilities: ProviderCapabilities = { streaming: true, longContext: true, contextWindow: 200_000 };

  isConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  async chat(_messages: ChatMessage[], _options?: AIRequestOptions): Promise<ChatCompletionResult> {
    throw new AIProviderError("Claude provider is not implemented yet.", this.id, "not_implemented");
  }

  async *stream(_messages: ChatMessage[], _options?: AIRequestOptions): AsyncGenerator<StreamChunk> {
    throw new AIProviderError("Claude provider is not implemented yet.", this.id, "not_implemented");
  }
}
