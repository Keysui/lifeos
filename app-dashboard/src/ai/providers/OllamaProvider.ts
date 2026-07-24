import { BaseAIProvider, AIProviderError } from "./AIProvider";
import type { AIRequestOptions, ChatCompletionResult, ChatMessage, ProviderCapabilities, StreamChunk } from "@/types/ai";

/**
 * Placeholder for local/private inference via Ollama (http://localhost:11434). Unlike the other
 * providers this one is never "Bring Your Own Key" -- it's Bring Your Own Machine. See
 * ClaudeProvider.ts for the pattern to follow when implementing this for real.
 */
export class OllamaProvider extends BaseAIProvider {
  readonly id = "ollama" as const;
  readonly name = "Ollama (Local)";
  readonly implemented = false;
  readonly capabilities: ProviderCapabilities = { streaming: true, longContext: false, contextWindow: 32_000 };

  isConfigured(): boolean {
    return Boolean(process.env.OLLAMA_HOST);
  }

  async chat(_messages: ChatMessage[], _options?: AIRequestOptions): Promise<ChatCompletionResult> {
    throw new AIProviderError("Ollama provider is not implemented yet.", this.id, "not_implemented");
  }

  async *stream(_messages: ChatMessage[], _options?: AIRequestOptions): AsyncGenerator<StreamChunk> {
    throw new AIProviderError("Ollama provider is not implemented yet.", this.id, "not_implemented");
  }
}
