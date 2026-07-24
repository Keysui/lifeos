import type { AIProvider } from "@/ai/providers/AIProvider";
import { KimiProvider } from "@/ai/providers/KimiProvider";
import { ClaudeProvider } from "@/ai/providers/ClaudeProvider";
import { OpenAIProvider } from "@/ai/providers/OpenAIProvider";
import { GeminiProvider } from "@/ai/providers/GeminiProvider";
import { DeepSeekProvider } from "@/ai/providers/DeepSeekProvider";
import { GrokProvider } from "@/ai/providers/GrokProvider";
import { OpenRouterProvider } from "@/ai/providers/OpenRouterProvider";
import { OllamaProvider } from "@/ai/providers/OllamaProvider";
import type { AITaskType, ProviderId } from "@/types/ai";

type ProviderFactory = (apiKeyOverride?: string) => AIProvider;

const DEFAULT_PROVIDER: ProviderId = "kimi";

/**
 * Task-type -> provider routing table. Everything strategic runs on Kimi today because it's the
 * only fully implemented provider. Coding/writing already point at Claude so that the moment
 * ClaudeProvider is implemented, those task types start routing there with zero call-site changes.
 */
const TASK_ROUTING: Partial<Record<AITaskType, ProviderId>> = {
  chat: "kimi",
  summarize: "kimi",
  analyze: "kimi",
  reason: "kimi",
  generateTasks: "kimi",
  plan: "kimi",
  extractInformation: "kimi",
  code: "claude",
  write: "claude",
};

/**
 * The single point of contact between the application and every AI provider. Nothing outside
 * this file (and the provider classes themselves) should ever import a provider directly.
 *
 * Adding a new provider is exactly two steps:
 *   1. Implement the provider class under src/ai/providers/.
 *   2. Call AIRouter.register(id, factory) -- see the constructor below.
 * No other application code needs to change.
 */
class AIRouterImpl {
  private factories = new Map<ProviderId, ProviderFactory>();

  constructor() {
    this.register("kimi", (apiKeyOverride) => new KimiProvider({ apiKey: apiKeyOverride }));
    this.register("claude", () => new ClaudeProvider());
    this.register("openai", () => new OpenAIProvider());
    this.register("gemini", () => new GeminiProvider());
    this.register("deepseek", () => new DeepSeekProvider());
    this.register("grok", () => new GrokProvider());
    this.register("openrouter", () => new OpenRouterProvider());
    this.register("ollama", () => new OllamaProvider());
  }

  register(id: ProviderId, factory: ProviderFactory) {
    this.factories.set(id, factory);
  }

  isRegistered(id: ProviderId): boolean {
    return this.factories.has(id);
  }

  listRegisteredIds(): ProviderId[] {
    return Array.from(this.factories.keys());
  }

  private create(id: ProviderId, apiKeyOverride?: string): AIProvider | undefined {
    return this.factories.get(id)?.(apiKeyOverride);
  }

  /** Returns the exact provider requested, with no fallback. Used by connection testing and
   *  the settings status list, where silently substituting a different provider would be wrong. */
  getProvider(id: ProviderId, apiKeyOverride?: string): AIProvider | undefined {
    return this.create(id, apiKeyOverride);
  }

  /** Picks a provider id for a task type, falling back to the default provider when unmapped. */
  routeTaskType(taskType?: AITaskType): ProviderId {
    if (!taskType) return DEFAULT_PROVIDER;
    return TASK_ROUTING[taskType] ?? DEFAULT_PROVIDER;
  }

  /**
   * Resolves an actual provider instance for a request: an explicit providerId wins, otherwise
   * task-type routing decides. If the resolved provider isn't configured (e.g. "code" routes to
   * the still-unimplemented Claude placeholder), silently falls back to the default provider so
   * the app keeps working end-to-end -- AIService is responsible for telling the caller which
   * provider it actually got.
   */
  resolve(options: { providerId?: ProviderId; taskType?: AITaskType; apiKeyOverride?: string }): AIProvider {
    const requestedId = options.providerId ?? this.routeTaskType(options.taskType);
    const requested = this.create(requestedId, options.apiKeyOverride);

    if (requested?.isConfigured()) return requested;
    if (requestedId !== DEFAULT_PROVIDER) {
      const fallback = this.create(DEFAULT_PROVIDER, options.apiKeyOverride);
      if (fallback) return fallback;
    }
    if (!requested) throw new Error(`No provider registered for "${requestedId}".`);
    return requested; // Still unconfigured -- caller surfaces a clear error.
  }

  listProviders(apiKeyOverrides: Partial<Record<ProviderId, string>> = {}): AIProvider[] {
    return Array.from(this.factories.keys()).map((id) => this.create(id, apiKeyOverrides[id])!);
  }
}

export const AIRouter = new AIRouterImpl();
