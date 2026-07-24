// Shared types for the AI provider/router/service layer. Server-only in spirit --
// nothing here should ever carry a raw API key to the client.

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** What kind of work a request represents. The AI Router uses this to pick a provider. */
export type AITaskType =
  | "chat"
  | "summarize"
  | "analyze"
  | "reason"
  | "generateTasks"
  | "plan"
  | "extractInformation"
  | "code"
  | "write";

export type ProviderId =
  | "kimi"
  | "claude"
  | "openai"
  | "gemini"
  | "deepseek"
  | "grok"
  | "openrouter"
  | "ollama";

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  /** Overrides the provider's configured API key for this call only (BYOK). */
  apiKeyOverride?: string;
  /** Overrides the provider's configured model id for this call only. */
  modelOverride?: string;
  signal?: AbortSignal;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  provider: ProviderId;
  usage?: TokenUsage;
  finishReason?: string;
  latencyMs: number;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
  usage?: TokenUsage;
}

export interface ProviderCapabilities {
  streaming: boolean;
  longContext: boolean;
  /** Approximate max context window in tokens, for display purposes only. */
  contextWindow: number;
}

export type ProviderConnectionState = "connected" | "error" | "unconfigured" | "unknown";

export interface ProviderStatus {
  id: ProviderId;
  name: string;
  configured: boolean;
  state: ProviderConnectionState;
  latencyMs?: number;
  lastCheckedAt?: string;
  lastError?: string;
}

export interface ProviderUsageStats {
  requests: number;
  errors: number;
  totalTokens: number;
  lastRequestAt?: string;
}

/** Payload assembled by LifeOSContext and sent alongside a chat request so the model
 *  has grounded, current information instead of hallucinating the user's life. */
export interface LifeOSContextPayload {
  generatedAt: string;
  today: string; // ISO date
  upcomingEvents: {
    title: string;
    start: string;
    end: string;
    category: string;
    priority: string;
  }[];
  openTasks: {
    title: string;
    priority: string;
    status: string;
    deadline?: string;
    estimateMinutes: number;
  }[];
  activeProjects: {
    name: string;
    status: string;
    progress: number;
    nextAction?: string;
    blockers?: string[];
  }[];
  goals: {
    title: string;
    horizon: string;
    progress: number;
  }[];
  habits: {
    name: string;
    streak: number;
    targetPerWeek: number;
  }[];
  recentActivity: string[];
  recentJournal: {
    date: string;
    title: string;
    mood: number;
  }[];
}

export interface AIChatRequest {
  messages: ChatMessage[];
  context?: LifeOSContextPayload;
  taskType?: AITaskType;
  providerId?: ProviderId;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}
