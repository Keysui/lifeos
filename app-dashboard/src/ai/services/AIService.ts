import { AIRouter } from "@/ai/router/AIRouter";
import { AIProviderError } from "@/ai/providers/AIProvider";
import { recordRequest, recordError } from "./UsageTracker";
import type {
  AIChatRequest,
  ChatCompletionResult,
  ChatMessage,
  LifeOSContextPayload,
  ProviderId,
  StreamChunk,
} from "@/types/ai";

const SYSTEM_PERSONA = `You are Kimi, the Strategic Intelligence Engine of Life OS -- a personal operating system for planning, execution, and accountability.

Your roles: Executive Assistant, Strategic Planner, Calendar Optimizer, Project Manager, Goal Analyst, Productivity Analyst, Decision Support System, and Research Assistant.

Operating principles:
- Be concise and analytical. Challenge poor decisions respectfully and offer alternatives.
- Prefer consistency over intensity in every recommendation.
- Every task should trace up to a goal; flag orphan tasks that have no clear parent goal.
- When asked to plan, surface conflicts, risks, and realistic time constraints instead of just listing ideas.
- Ground every answer in the Life OS context provided below. If the context doesn't contain what's needed to answer precisely, say so rather than guessing.`;

function serializeContext(context?: LifeOSContextPayload): string {
  if (!context) return "No Life OS context was provided for this request.";
  return `Life OS context (generated ${context.generatedAt}, today is ${context.today}):\n${JSON.stringify(context, null, 2)}`;
}

function buildMessages(request: AIChatRequest): ChatMessage[] {
  return [
    { role: "system", content: SYSTEM_PERSONA },
    { role: "system", content: serializeContext(request.context) },
    ...request.messages,
  ];
}

function requireConfigured(provider: ReturnType<typeof AIRouter.resolve>) {
  if (!provider.isConfigured()) {
    throw new AIProviderError(
      `${provider.name} is not configured. Add an API key in AI Settings or set the managed environment variable.`,
      provider.id,
      "unconfigured"
    );
  }
}

export interface AIServiceResult extends ChatCompletionResult {
  requestedProvider?: ProviderId;
}

class AIServiceImpl {
  async chat(request: AIChatRequest, apiKeyOverride?: string): Promise<AIServiceResult> {
    const provider = AIRouter.resolve({
      providerId: request.providerId,
      taskType: request.taskType,
      apiKeyOverride,
    });
    requireConfigured(provider);

    try {
      const result = await provider.chat(buildMessages(request), {
        temperature: request.temperature,
        maxTokens: request.maxTokens,
      });
      recordRequest(provider.id, result.usage?.totalTokens ?? 0);
      return { ...result, requestedProvider: request.providerId };
    } catch (err) {
      recordError(provider.id);
      throw err;
    }
  }

  async *stream(
    request: AIChatRequest,
    apiKeyOverride?: string
  ): AsyncGenerator<StreamChunk & { provider: ProviderId }> {
    const provider = AIRouter.resolve({
      providerId: request.providerId,
      taskType: request.taskType,
      apiKeyOverride,
    });
    requireConfigured(provider);

    let totalTokens = 0;
    try {
      for await (const chunk of provider.stream(buildMessages(request), {
        temperature: request.temperature,
        maxTokens: request.maxTokens,
      })) {
        if (chunk.usage) totalTokens = chunk.usage.totalTokens;
        yield { ...chunk, provider: provider.id };
      }
      recordRequest(provider.id, totalTokens);
    } catch (err) {
      recordError(provider.id);
      throw err;
    }
  }

  async testConnection(providerId: ProviderId, apiKeyOverride?: string) {
    const provider = AIRouter.getProvider(providerId, apiKeyOverride);
    if (!provider) {
      return { providerId, ok: false, latencyMs: 0, error: `Unknown provider "${providerId}".` };
    }
    const result = await provider.testConnection();
    return { providerId: provider.id, ...result };
  }
}

export const AIService = new AIServiceImpl();
